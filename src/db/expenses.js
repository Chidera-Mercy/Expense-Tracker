import supabase from "./supabase";

// Function to fetch expenses with pagination and search
export const fetchExpenses = async (filters = null) => {
  try {
    const {
      page = 1,
      limit = 10
    } = filters;

    let query = supabase
      .from('expenses')
      .select(`
        *,
        categories:category_id (id, name, color)
      `, { count: 'exact' });

    // Calculate pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;

    // Add sorting and pagination
    query = query.order('date', { ascending: false }).range(from, to);

    const { data, error, count } = await query;

    if (error) {
      throw error;
    }

    return { data, count, page, limit };
  } catch (error) {
    console.error('Error fetching expenses:', error);
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

// Function to get expense summary for a specific period
export const calculateExpenseSummary = (currentData, previousData, period, periodType) => {
  // Calculate total and recurring expenses for current period
  const totalExpenses = currentData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const recurringExpenses = currentData
    .filter(item => item.is_recurring)
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);
  
  // Calculate total expenses for previous period
  const previousTotal = previousData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  
  // Calculate growth percentage
  let growthPercentage = 0;
  if (previousTotal > 0) {
    growthPercentage = ((totalExpenses - previousTotal) / previousTotal) * 100;
  }

  // Calculate average monthly expenses based on period type
  let averageMonthlyExpenses = totalExpenses;
  if (periodType === 'quarterly') {
    // Divide by roughly 3 months for quarterly view
    averageMonthlyExpenses = totalExpenses / 3;
  } else if (periodType === 'yearly') {
    // Divide by 12 months for yearly view
    averageMonthlyExpenses = totalExpenses / 12;
  }

  return {
    totalExpenses,
    recurringExpenses,
    recurringPercentage: totalExpenses > 0 ? (recurringExpenses / totalExpenses) * 100 : 0,
    averageMonthlyExpenses,
    growthPercentage,
    period,
    periodType
  };
};

// Function to export expenses data to CSV
export const exportExpensesToCSV = (data) => {
  // Convert data to CSV format
  const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Status', 'Description'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.date,
      `"${row.merchant}"`,
      `"${row.categories ? row.categories.name : ''}"`,
      row.amount,
      row.status || '',
      `"${row.description || ''}"`
    ].join(','))
  ].join('\n');

  return csvContent;
  
};

/**
 * Fetch all categories (default and user-created)
 * @param {string} userId - The ID of the current user
 * @returns {Promise} - Promise with categories data
 */
export const fetchCategories = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .or(`is_default.eq.true,user_id.eq.${userId}`)
      .order('name');

    if (error) throw error;
    return data;
  } catch (error) {
    console.error('Error fetching categories:', error);
    throw error;
  }
};


// Helper functions for date formatting

// Get formatted period options for UI
export const getPeriodOptions = () => {
  const now = new Date();
  const currentYear = now.getFullYear();
  const currentMonth = now.getMonth();
  
  // Generate monthly options (12 months)
  const monthOptions = [];
  for (let i = -6; i <= 6; i++) {
    const monthDate = new Date(currentYear, currentMonth + i, 1);
    const monthName = monthDate.toLocaleString('default', { month: 'long' });
    const year = monthDate.getFullYear();
    monthOptions.push(`${monthName} ${year}`);
  }
  
  // Generate quarterly options
  const quarterOptions = [];
  for (let year = currentYear - 1; year <= currentYear + 1; year++) {
    for (let quarter = 1; quarter <= 4; quarter++) {
      quarterOptions.push(`Q${quarter} ${year}`);
    }
  }
  
  // Generate yearly options
  const yearOptions = [];
  for (let year = currentYear - 2; year <= currentYear + 2; year++) {
    yearOptions.push(`${year}`);
  }
  
  return {
    monthly: monthOptions,
    quarterly: quarterOptions,
    yearly: yearOptions
  };
};

// Get current period
export const getCurrentPeriod = (periodType = 'monthly') => {
  const now = new Date();
  if (periodType === 'monthly') {
    return `${now.toLocaleString('default', { month: 'long' })} ${now.getFullYear()}`;
  } else if (periodType === 'quarterly') {
    const quarter = Math.floor(now.getMonth() / 3) + 1;
    return `Q${quarter} ${now.getFullYear()}`;
  } else if (periodType === 'yearly') {
    return `${now.getFullYear()}`;
  }
  return '';
};

// Helper function to get date range for a period
export const getPeriodDates = (period) => {
  const now = new Date();
  let periodStart, periodEnd;
  
  // Parse period string: "April 2025", "Q2 2025", "2025"
  if (period.includes('Q')) {
    // Quarterly
    const [quarter, year] = period.replace('Q', '').split(' ');
    const quarterStartMonth = (parseInt(quarter) - 1) * 3;
    periodStart = new Date(parseInt(year), quarterStartMonth, 1);
    periodEnd = new Date(parseInt(year), quarterStartMonth + 3, 0);
  } else if (period.match(/^\d{4}$/)) {
    // Yearly
    const year = parseInt(period);
    periodStart = new Date(year, 0, 1);
    periodEnd = new Date(year, 11, 31);
  } else {
    // Monthly
    const [month, year] = period.split(' ');
    const monthIndex = getMonthIndex(month);
    periodStart = new Date(parseInt(year), monthIndex, 1);
    periodEnd = new Date(parseInt(year), monthIndex + 1, 0);
  }
  
  return {
    periodStart: periodStart.toISOString().split('T')[0],
    periodEnd: periodEnd.toISOString().split('T')[0]
  };
};
export const getPreviousPeriod = (currentPeriod, periodType = 'monthly') => {
  if (periodType === 'monthly') {
    const [month, year] = currentPeriod.split(' ');
    const monthIndex = getMonthIndex(month);
    const date = new Date(parseInt(year), monthIndex - 1, 1);
    return `${date.toLocaleString('default', { month: 'long' })} ${date.getFullYear()}`;
  } else if (periodType === 'quarterly') {
    const [quarter, year] = currentPeriod.replace('Q', '').split(' ');
    const quarterNum = parseInt(quarter);
    if (quarterNum === 1) {
      return `Q4 ${parseInt(year) - 1}`;
    } else {
      return `Q${quarterNum - 1} ${year}`;
    }
  } else if (periodType === 'yearly') {
    return `${parseInt(currentPeriod) - 1}`;
  }
  return currentPeriod;
};

// Get month index from name
const getMonthIndex = (monthName) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.findIndex(m => m.startsWith(monthName));
};