import supabase from "./supabase";

/**
 * Fetch all expenses for the current user
 * @param {Object} filters - Optional filters like date range, category, etc.
 * @returns {Promise} - Promise with expenses data
 */
export const fetchExpenses = async (filters = {}) => {
  try {
    let query = supabase
      .from('expenses')
      .select(`
        *,
        categories:category_id (id, name, color)
      `)
      .order('date', { ascending: false });
    
    // Apply filters if provided
    if (filters.startDate && filters.endDate) {
      query = query.gte('date', filters.startDate).lte('date', filters.endDate);
    }
    
    if (filters.category) {
      query = query.eq('category_id', filters.category);
    }
    
    if (filters.status) {
      query = query.eq('status', filters.status);
    }
    
    if (filters.hasReceipt === true) {
      query = query.not('receipt_url', 'is', null);
    }
    
    if (filters.search) {
      query = query.ilike('merchant', `%${filters.search}%`);
    }
    
    const { data, error } = await query;

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching expenses:', error);
    throw error;
  }
};

/**
 * Fetch all categories (both default and user-created)
 * @returns {Promise} - Promise with categories data
 */
export const fetchCategories = async () => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .order('name');
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};

/**
 * Add a new expense
 * @param {Object} expenseData - The expense data to add
 * @returns {Promise} - Promise with the newly created expense
 */
export const addExpense = async (expenseData) => {
    try {
      // Get the current user
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) throw new Error('User not authenticated');
      
      // Add the user_id to the expense data
      const expenseWithUserId = {
        ...expenseData,
        user_id: user.id
      };
      
      const { data, error } = await supabase
        .from('expenses')
        .insert([expenseWithUserId])
        .select();
      
      if (error) throw error;
      return data[0];
    } catch (error) {
      console.error('Error adding expense:', error);
      throw error;
    }
};

/**
 * Update an existing expense
 * @param {string} id - The ID of the expense to update
 * @param {Object} expenseData - The updated expense data
 * @returns {Promise} - Promise with the updated expense
 */
export const updateExpense = async (id, expenseData) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .update(expenseData)
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return data[0];
  } catch (error) {
    console.error('Error updating expense:', error);
    throw error;
  }
};

/**
 * Delete an expense
 * @param {string} id - The ID of the expense to delete
 * @returns {Promise} - Promise with the result
 */
export const deleteExpense = async (id) => {
  try {
    const { error } = await supabase
      .from('expenses')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return true;
  } catch (error) {
    console.error('Error deleting expense:', error);
    throw error;
  }
};

/**
 * Upload a receipt and get its URL
 * @param {File} file - The receipt file to upload
 * @returns {Promise} - Promise with the public URL of the uploaded file
 */
export const uploadReceipt = async (file) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error('User not authenticated');
      
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}.${fileExt}`;
      const filePath = `${user.id}/${fileName}`;
      
      const { error: uploadError } = await supabase.storage
        .from('receipts')
        .upload(filePath, file);
        
      if (uploadError) throw uploadError;
      
      const { data: { publicUrl }, error: urlError } = supabase.storage
        .from('receipts')
        .getPublicUrl(filePath);
        
      if (urlError) throw urlError;
      
      return publicUrl;
    } catch (error) {
      console.error('Error uploading receipt:', error);
      throw error;
    }
};

/**
 * Get expense statistics
 * @param {string} period - 'week', 'month', or 'year'
 * @returns {Promise} - Promise with the statistics data
 */
export const getExpenseStats = async (period = 'month') => {
  try {
    // Calculate date range based on period
    const now = new Date();
    let startDate;
    
    switch (period) {
      case 'week':
        startDate = new Date(now);
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
        break;
      case 'year':
        startDate = new Date(now);
        startDate.setFullYear(now.getFullYear() - 1);
        break;
      default:
        startDate = new Date(now);
        startDate.setMonth(now.getMonth() - 1);
    }
    
    const formattedStartDate = startDate.toISOString().split('T')[0];
    const formattedEndDate = now.toISOString().split('T')[0];
    
    // Get total amount spent in period
    const { data: totalData, error: totalError } = await supabase
      .from('expenses')
      .select('amount')
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate);
    
    if (totalError) throw totalError;
    
    // Get expenses by category
    const { data: categoryData, error: categoryError } = await supabase
      .from('expenses')
      .select(`
        amount,
        categories:category_id (name)
      `)
      .gte('date', formattedStartDate)
      .lte('date', formattedEndDate);
    
    if (categoryError) throw categoryError;
    
    // Calculate total
    const total = totalData.reduce((sum, expense) => sum + expense.amount, 0);
    
    // Calculate category totals
    const byCategory = {};
    categoryData.forEach(expense => {
      const categoryName = expense.categories ? expense.categories.name : 'Uncategorized';
      if (!byCategory[categoryName]) {
        byCategory[categoryName] = 0;
      }
      byCategory[categoryName] += expense.amount;
    });
    
    return {
      total,
      byCategory,
      period,
      startDate: formattedStartDate,
      endDate: formattedEndDate
    };
  } catch (error) {
    console.error('Error getting expense statistics:', error);
    throw error;
  }
};