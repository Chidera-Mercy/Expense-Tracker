import supabase from "./supabase";
import { UserAuth } from "../AuthContext";


// Function to fetch income entries with pagination and search
export const fetchIncome = async (filters = null) => {
  try {
    const {
      page = 1,
      limit = 10,
    } = filters;

    let query = supabase
      .from('income')
      .select(`
        *,
        income_categories:category_id (id, name, color)
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
    console.error('Error fetching income:', error);
    throw error;
  }
};

export const fetchCategories = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('income_categories')
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

// Function to add new income entry
export const addIncome = async (income) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('User not authenticated');

    const incomeWithUserId = {
      ...income,
      user_id: user.id
    };
    const { data, error } = await supabase
      .from('income')
      .insert([incomeWithUserId]);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error adding income:', error);
    throw error;
  }
};

// Function to update income entry
export const updateIncome = async (id, income) => {
  try {
    const { data, error } = await supabase
      .from('income')
      .update(income)
      .eq('id', id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error updating income:', error);
    throw error;
  }
};

// Function to delete income entry
export const deleteIncome = async (id) => {
  try {
    const { data, error } = await supabase
      .from('income')
      .delete()
      .eq('id', id);

    if (error) {
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error deleting income:', error);
    throw error;
  }
};

// Function to get income summary for a specific period
export const calculateIncomeSummary = (currentData, previousData, period, periodType) => {
  // Calculate total and recurring income for current period
  const totalIncome = currentData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  const recurringIncome = currentData
    .filter(item => item.recurring)
    .reduce((sum, item) => sum + parseFloat(item.amount), 0);
  
  // Calculate total income for previous period
  const previousTotal = previousData.reduce((sum, item) => sum + parseFloat(item.amount), 0);
  
  // Calculate growth percentage
  let growthPercentage = 0;
  if (previousTotal > 0) {
    growthPercentage = ((totalIncome - previousTotal) / previousTotal) * 100;
  }

  // Calculate average monthly income based on period type
  let averageMonthlyIncome = totalIncome;
  if (periodType === 'quarterly') {
    // Divide by roughly 3 months for quarterly view
    averageMonthlyIncome = totalIncome / 3;
  } else if (periodType === 'yearly') {
    // Divide by 12 months for yearly view
    averageMonthlyIncome = totalIncome / 12;
  }

  return {
    totalIncome,
    recurringIncome,
    recurringPercentage: totalIncome > 0 ? (recurringIncome / totalIncome) * 100 : 0,
    averageMonthlyIncome,
    growthPercentage,
    period,
    periodType
  };
};

// Function to export income data to CSV
export const exportIncomeToCSV = (data) => {
  
  // Convert data to CSV format
  const headers = ['Date', 'Source', 'Category', 'Amount', 'Recurring', 'Frequency', 'Description'];
  const csvContent = [
    headers.join(','),
    ...data.map(row => [
      row.date,
      `"${row.source}"`,
      `"${row.category}"`,
      row.amount,
      row.recurring ? 'Yes' : 'No',
      row.frequency || '',
      `"${row.description || ''}"`
    ].join(','))
  ].join('\n');

  return csvContent;
};

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
