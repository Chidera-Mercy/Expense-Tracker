import { createContext, useContext, useEffect, useState } from "react";
import supabase from "./db/supabase";

const AuthContext = createContext();

// Local storage key for profile data
const PROFILE_STORAGE_KEY = "user_profile";

export const AuthContextProvider = ({children}) => {
  const [session, setSession] = useState(undefined);
  const [user, setUser] = useState(null);
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);

  // Load profile from localStorage on initial render
  useEffect(() => {
    const storedProfile = localStorage.getItem(PROFILE_STORAGE_KEY);
    if (storedProfile) {
      try {
        setProfile(JSON.parse(storedProfile));
      } catch (error) {
        console.error("Error parsing stored profile:", error);
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
    }
  }, []);

  // Update localStorage whenever profile changes
  useEffect(() => {
    if (profile) {
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profile));
    }
  }, [profile]);

  // Fetch user profile helper function
  const fetchUserProfile = async (userId) => {
    try {
      setLoading(true);
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      // Save profile to state and localStorage
      setProfile(data);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(data));
      
      return data;
    } catch (error) {
      console.error("Error fetching user profile:", error);
      return null;
    } finally {
      setLoading(false);
    }
  };

  // Update only the local profile state
  const updateLocalProfile = (profileData) => {
    if (!profile) return;
    
    // Merge the existing profile with the new data
    const updatedProfile = {
      ...profile,
      ...profileData
    };
    
    // Update state and localStorage
    setProfile(updatedProfile);
    localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(updatedProfile));
  };

  // Sign up
  const signUpNewUser = async (firstname, lastname, email, password, avatarFile) => {
    try {
      // 1. insert to auth users table
      const { data: userData, error: userError } = await supabase.auth.signUp({
        email: email.toLowerCase(),
        password: password,
        options: {
          data: {
            display_name: `${firstname} ${lastname}$`
          }
        }
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
      if (avatarFile) {
        try{
          const fileName = `avatar-${userId}`;

          // Upload the file
          const { error: uploadError } = await supabase.storage
            .from("avatars")
            .upload(fileName, avatarFile, {upsert: true});

          if (uploadError) {
            console.error("Error uploading avatar: ", uploadError);
          } else {
            // Get the public URL
            const { data: { publicUrl }, error: urlError } = supabase.storage
              .from("avatars")
              .getPublicUrl(fileName);
            
            avatarUrl = publicUrl
          }
        } catch (err) {
          console.error("Avatar upload error:", err);
        }
      }

      // 4. insert user to profiles table
      const profileData = {
        id: userId,
        email: email,
        first_name: firstname,
        last_name: lastname,
        avatar_url: avatarUrl
      };
      const { error: profileError } = await supabase
        .from('profiles')
        .upsert(profileData);

      if (profileError) {
        console.error("Error creating profile: ", profileError);
        return { success: false, error: profileError.message || "Failed to create user profile" };
      }

      // Save profile to state and localStorage
      setProfile(profileData);
      localStorage.setItem(PROFILE_STORAGE_KEY, JSON.stringify(profileData));

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

      // Get user profile after successful login
      if (data.user) {
        await fetchUserProfile(data.user.id);
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
      
      // If we have a user but no profile, try to fetch it
      if (session?.user && !profile) {
        fetchUserProfile(session.user.id);
      }
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user || null);
      
      // If user logged out, clear profile
      if (!session) {
        setProfile(null);
        localStorage.removeItem(PROFILE_STORAGE_KEY);
      }
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
    
    // Clear profile from state and localStorage
    setProfile(null);
    localStorage.removeItem(PROFILE_STORAGE_KEY);
  }

  return (
    <AuthContext.Provider
      value={{signUpNewUser, signInUser, session, user, signOut, profile, updateLocalProfile}}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const UserAuth = () => {
  return useContext(AuthContext);
};