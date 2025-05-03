import supabase from "./supabase";
/**
 * Fetch user profile from the database
 * @param {string} userId - The user's ID
 * @returns {Promise<Object|null>} - The user profile data or null if not found
 */
export const fetchUserProfile = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (error) {
      console.error('Error fetching profile:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error fetching profile:', err);
    throw err;
  }
};

/**
 * Update user profile in the database
 * @param {string} userId - The user's ID
 * @param {Object} profileData - The profile data to update
 * @returns {Promise<Object>} - The updated profile data
 */
export const updateUserProfile = async (userId, profileData) => {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update(profileData)
      .eq('id', userId)
      .select();
    
    if (error) {
      console.error('Error updating profile:', error);
      throw new Error(error.message);
    }
    
    return data;
  } catch (err) {
    console.error('Unexpected error updating profile:', err);
    throw err;
  }
};

/**
 * Delete user account and all associated data
 * @param {string} userId - The user's ID
 * @returns {Promise<void>}
 */
export const deleteUserAccount = async (userId) => {
  try {
    // First, delete the user's profile
    const { error: profileError } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);
    
    if (profileError) {
      console.error('Error deleting profile:', profileError);
      throw new Error(profileError.message);
    }

    // Note: Deleting from auth.users will be handled by Supabase when using supabase.auth.admin.deleteUser()
    // For client-side deletion, we rely on the Auth API from Supabase to delete the user authentication
    // After profile deletion, the user should sign out and then delete their account through auth
    
    // You may need to delete data from other tables related to this user
    // For example, if you have transactions, budgets, etc.
    
    return true;
  } catch (err) {
    console.error('Unexpected error deleting account:', err);
    throw err;
  }
};