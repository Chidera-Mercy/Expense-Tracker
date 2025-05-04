import supabase from "./supabase";

/**
 * Save a category (create or update)
 * @param {Object} categoryData - The category data to save
 * @param {string} [table='categories'] - The table name ('categories' for expenses/budget, 'income_categories' for income)
 * @returns {Promise<Object>} The saved category
 */
export const saveCategory = async (categoryData, table = 'categories') => {
    const { data: { user } } = await supabase.auth.getUser();
  
    if (!user) {
      throw new Error('User not authenticated');
    }
  
    try {
      // Handle either create or update
      if (categoryData.id) {
        // Update existing category
        const { data, error } = await supabase
          .from(table)
          .update({
            name: categoryData.name,
            color: categoryData.color,
            icon: categoryData.icon,
            is_default: categoryData.is_default,
            updated_at: new Date().toISOString()
          })
          .eq('id', categoryData.id)
          .select()
          .single();
        
        if (error) throw error;
        
        // If setting as default, unset others
        if (categoryData.is_default) {
          await supabase
            .from(table)
            .update({ is_default: false })
            .neq('id', categoryData.id)
            .eq('user_id', user.id);
        }
        
        return data;
      } else {
        // Create new category
        const { data, error } = await supabase
          .from(table)
          .insert({
            name: categoryData.name,
            color: categoryData.color,
            icon: categoryData.icon,
            is_default: categoryData.is_default,
            user_id: user.id
          })
          .select()
          .single();
        
        if (error) throw error;
        
        // If setting as default, unset others
        if (categoryData.is_default) {
          await supabase
            .from(table)
            .update({ is_default: false })
            .neq('id', data.id)
            .eq('user_id', user.id);
        }
        
        return data;
      }
    } catch (error) {
      console.error(`Error saving category to ${table}:`, error);
      throw error;
    }
  };
  
  /**
   * Delete a category
   * @param {string} categoryId - The ID of the category to delete
   * @param {string} [table='categories'] - The table name ('categories' for expenses/budget, 'income_categories' for income)
   * @returns {Promise<void>}
   */
  export const deleteCategory = async (categoryId, table = 'categories') => {
    try {
      // Check if the category is default before deleting
      const { data: category, error: fetchError } = await supabase
        .from(table)
        .select('is_default')
        .eq('id', categoryId)
        .single();
      
      if (fetchError) throw fetchError;
      
      if (category?.is_default) {
        throw new Error('Cannot delete default category. Please set another category as default first.');
      }
      
      const { error } = await supabase
        .from(table)
        .delete()
        .eq('id', categoryId);
      
      if (error) throw error;
      
    } catch (error) {
      console.error(`Error deleting category from ${table}:`, error);
      throw error;
    }
  };