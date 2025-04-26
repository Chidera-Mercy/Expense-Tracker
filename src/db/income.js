import supabase from "./supabase";

// Function to fetch income entries with pagination and filters
export const fetchIncome = async (filters = {}) => {
  try {
    const {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      category,
      search,
      minAmount,
      maxAmount,
      recurring
    } = filters;

    let query = supabase
      .from('income')
      .select('*', { count: 'exact' });

    // Apply filters
    if (startDate && endDate) {
      query = query.gte('date', startDate).lte('date', endDate);
    }

    if (category && category !== 'All Categories') {
      query = query.eq('category', category);
    }

    if (search) {
      query = query.or(`source.ilike.%${search}%,description.ilike.%${search}%`);
    }

    if (minAmount) {
      query = query.gte('amount', minAmount);
    }

    if (maxAmount) {
      query = query.lte('amount', maxAmount);
    }

    if (recurring !== undefined) {
      query = query.eq('recurring', recurring);
    }

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

// Function to add new income entry
export const addIncome = async (income) => {
  try {
    const { data, error } = await supabase
      .from('income')
      .insert([income]);

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

// Function to get income summary
export const getIncomeSummary = async (period = 'month') => {
  try {
    const now = new Date();
    let startDate, endDate;
    
    // Calculate date range based on period
    if (period === 'month') {
      // Current month
      startDate = new Date(now.getFullYear(), now.getMonth(), 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    } else if (period === 'last_month') {
      // Last month
      startDate = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth(), 0).toISOString().split('T')[0];
    } else if (period === '6months') {
      // Last 6 months
      startDate = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split('T')[0];
      endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0).toISOString().split('T')[0];
    }

    // Get total income for current period
    const { data: currentData, error: currentError } = await supabase
      .from('income')
      .select('amount, recurring')
      .gte('date', startDate)
      .lte('date', endDate);

    if (currentError) throw currentError;

    // Calculate total and recurring income
    const totalIncome = currentData.reduce((sum, item) => sum + item.amount, 0);
    const recurringIncome = currentData
      .filter(item => item.recurring)
      .reduce((sum, item) => sum + item.amount, 0);

    // Get average monthly income (last 6 months)
    let averageMonthlyIncome = 0;
    
    if (period === '6months') {
      // If we already have 6 months data, calculate average
      averageMonthlyIncome = totalIncome / 6;
    } else {
      // Otherwise fetch 6 months data for average
      const sixMonthsAgo = new Date(now.getFullYear(), now.getMonth() - 6, 1).toISOString().split('T')[0];
      
      const { data: sixMonthData, error: sixMonthError } = await supabase
        .from('income')
        .select('amount, date')
        .gte('date', sixMonthsAgo)
        .lte('date', endDate);
      
      if (sixMonthError) throw sixMonthError;
      
      // Group by month and calculate average
      const monthlyTotals = {};
      
      sixMonthData.forEach(item => {
        const month = item.date.substring(0, 7); // YYYY-MM format
        monthlyTotals[month] = (monthlyTotals[month] || 0) + item.amount;
      });
      
      const months = Object.keys(monthlyTotals);
      const totalMonthlyIncome = Object.values(monthlyTotals).reduce((sum, amount) => sum + amount, 0);
      averageMonthlyIncome = totalMonthlyIncome / (months.length || 1);
    }

    // Calculate growth percentage compared to previous period
    let growthPercentage = 0;
    
    if (period === 'month' || period === 'last_month') {
      const previousPeriodStart = new Date(now.getFullYear(), now.getMonth() - (period === 'month' ? 1 : 2), 1)
        .toISOString().split('T')[0];
      const previousPeriodEnd = new Date(now.getFullYear(), now.getMonth() - (period === 'month' ? 0 : 1), 0)
        .toISOString().split('T')[0];
      
      const { data: previousData, error: previousError } = await supabase
        .from('income')
        .select('amount')
        .gte('date', previousPeriodStart)
        .lte('date', previousPeriodEnd);
      
      if (previousError) throw previousError;
      
      const previousTotal = previousData.reduce((sum, item) => sum + item.amount, 0);
      
      if (previousTotal > 0) {
        growthPercentage = ((totalIncome - previousTotal) / previousTotal) * 100;
      }
    }

    return {
      totalIncome,
      recurringIncome,
      recurringPercentage: totalIncome > 0 ? (recurringIncome / totalIncome) * 100 : 0,
      averageMonthlyIncome,
      growthPercentage
    };
  } catch (error) {
    console.error('Error fetching income summary:', error);
    throw error;
  }
};

// Function to export income data to CSV
export const exportIncomeToCSV = async (filters = {}) => {
  try {
    // Fetch all data without pagination
    const { data, error } = await supabase
      .from('income')
      .select('*')
      .order('date', { ascending: false });

    if (error) throw error;

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
  } catch (error) {
    console.error('Error exporting income data:', error);
    throw error;
  }
};