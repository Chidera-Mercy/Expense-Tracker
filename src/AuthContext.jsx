import { createContext, useContext, useEffect, useState } from "react";
import supabase from "./db/supabase";

const AuthContext = createContext();

export const AuthContextProvider = ({children}) => {
  const [session, setSession] = useState(undefined);
  const [user, setUser] = useState(null);

  // Sign up
  const signUpNewUser = async (firstname, lastname, email, password, avatarFile) => {
    try {
      // 1. insert to auth users table
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
      });
      
      if (userError) {
        console.error("Error signing up: ", userError);
        return { success: false, error: userError.message || "Failed to create user account" };
      }
      
      if (!userData || !userData.user) {
        console.error("No user data returned");
        return { success: false, error: "Failed to create user account" };
      }
      
      const userId = userData.user.id;

      // 2. Get session for authenticated requests
      const { data: sessionData } = await supabase.auth.getSession();

      // 3. upload profile picture
      let avatarUrl = null;
      if (avatarFile && sessionData?.session) {
        try{
          const fileName = `avatar-${userId}`;

          // Upload the file
          const { error: storageError } = await supabase.storage
            .from("avatars")
            .upload(fileName, avatarFile, {upsert: true});

          if (storageError) {
            console.error("Error uploading avatar: ", storageError);
          } else {
            // Get the public URL
            const { data } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);
            
            avatarUrl = data.publicUrl;
          }
        } catch (err) {
          console.error("Avatar upload error:", err);
          // Continue with signup even if avatar upload fails
        }
      }

      // 4. insert user to profiles table
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert({
          id: userId,
          email: email,
          first_name: firstname,
          last_name: lastname,
          avatar_url: avatarUrl
        });

      if (profileError) {
        console.error("Error creating profile: ", profileError);
        return { success: false, error: profileError.message || "Failed to create user profile" };
      }

      return { success: true, data: userData };
    } catch (err) {
      console.error("Unexpected error during signup:", err);
      return { success: false, error: err.message || "An unexpected error occurred" };
    }
  };
  // Sign in
  const signInUser = async (email, password) => {
    try {
      const {data, error} = await supabase.auth.signInWithPassword({
        email: email.toLowerCase(),
        password: password,
      });

      if (error) {
        console.error("Sign-in error: ", error.message);
        return {success: false, error: error.message};
      }

      console.log("Sign in success");
      return {success: true, data};
    } catch (error) {
      console.error("Unexpected error during sign-in:", error.message);
      return {
        success: false,
        error: "An unexpected error occurred. Please try again.",
      };
    }
  };

  useEffect(() => {
    supabase.auth.getSession().then(({data: {session}}) => {
      setSession(session);
      setUser(session?.user || null);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
    });

    return () => {
      subscription?.unsubscribe();
    };
  }, []);

  // Sign out
  async function signOut() {
    const {error} = await supabase.auth.signOut();
    if (error) {
      console.error("Error signing out:", error);
    }
  }

  return (
    <AuthContext.Provider
      value={{signUpNewUser, signInUser, session, user, signOut}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};