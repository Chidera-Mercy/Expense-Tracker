import supabase from "./supabase";

// Fetch all budgets for the current user
export const fetchBudgets = async () => {
  try {
    const { data, error } = await supabase
      .from('budgets')
      .select(`
        *,
        categories:category_id (id, name, color)
      `)
      .order('created_at', { ascending: false });
    
    if (error) throw error;
    
    // Calculate spending against each budget
    const budgetsWithSpending = await addSpendingToBudgets(data);
    
    return { data: budgetsWithSpending, error: null };
  } catch (error) {
    console.error('Error fetching budgets:', error);
    return { data: null, error };
  }
};

// Helper to add spending data to budgets
const addSpendingToBudgets = async (budgets) => {
  try {
    if (!budgets.length) return [];
    
    // Get the unique date range for all budgets
    const minDate = budgets.reduce((min, budget) => 
      budget.period_start < min ? budget.period_start : min, 
      budgets[0]?.period_start
    );
    
    const maxDate = budgets.reduce((max, budget) => 
      budget.period_end > max ? budget.period_end : max, 
      budgets[0]?.period_end
    );
    
    // Fetch all expenses in the date range
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select('amount, date, category_id')
      .gte('date', minDate)
      .lte('date', maxDate);
    
    if (error) throw error;
    
    // Calculate spending for each budget
    return budgets.map(budget => {
      // Match expenses to this budget's category and time period
      const relevantExpenses = expenses.filter(expense => 
        expense.category_id === budget.category_id &&
        new Date(expense.date) >= new Date(budget.period_start) &&
        new Date(expense.date) <= new Date(budget.period_end)
      );
      
      // Sum up the amounts
      const spent = relevantExpenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
      const remaining = parseFloat(budget.amount) - spent;
      
      return {
        ...budget,
        spent,
        remaining,
        percentage: budget.amount > 0 ? (spent / budget.amount) * 100 : 0
      };
    });
  } catch (error) {
    console.error('Error calculating budget spending:', error);
    // Return budgets with zero spending if there's an error
    return budgets.map(budget => ({
      ...budget,
      spent: 0,
      remaining: parseFloat(budget.amount),
      percentage: 0
    }));
  }
};

// Create a new budget
export const createBudget = async (budgetData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('budgets')
      .insert([{
        ...budgetData,
        user_id: user.id,
        updated_at: new Date().toISOString()
      }])
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error creating budget:', error);
    return { data: null, error };
  }
};

// Update an existing budget
export const updateBudget = async (id, budgetData) => {
  try {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) throw new Error('Not authenticated');

    const { data, error } = await supabase
      .from('budgets')
      .update({
        ...budgetData,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select();
    
    if (error) throw error;
    return { data, error: null };
  } catch (error) {
    console.error('Error updating budget:', error);
    return { data: null, error };
  }
};

// Delete a budget
export const deleteBudget = async (id) => {
  try {
    const { error } = await supabase
      .from('budgets')
      .delete()
      .eq('id', id);
    
    if (error) throw error;
    return { error: null };
  } catch (error) {
    console.error('Error deleting budget:', error);
    return { error };
  }
};

// Client-side filtering functions

// Filter budgets for a specific month (format: "April 2025")
export const filterBudgetsByMonth = (budgets, monthYear) => {
  const [month, year] = monthYear.split(' ');
  const monthIndex = getMonthIndex(month);
  const startDate = new Date(parseInt(year), monthIndex, 1);
  const endDate = new Date(parseInt(year), monthIndex + 1, 0);
  
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  return budgets.filter(budget => 
    budget.period_start <= end && budget.period_end >= start
  );
};

// Filter budgets for a specific quarter (format: "Q2 2025")
export const filterBudgetsByQuarter = (budgets, quarterYear) => {
  const [quarter, year] = quarterYear.replace('Q', '').split(' ');
  const quarterStartMonth = (parseInt(quarter) - 1) * 3;
  
  const startDate = new Date(parseInt(year), quarterStartMonth, 1);
  const endDate = new Date(parseInt(year), quarterStartMonth + 3, 0);
  
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  return budgets.filter(budget => 
    budget.period_start <= end && budget.period_end >= start
  );
};

// Filter budgets for a specific year (format: "2025")
export const filterBudgetsByYear = (budgets, year) => {
  const startDate = new Date(parseInt(year), 0, 1);
  const endDate = new Date(parseInt(year), 11, 31);
  
  const start = startDate.toISOString().split('T')[0];
  const end = endDate.toISOString().split('T')[0];
  
  return budgets.filter(budget => 
    budget.period_start <= end && budget.period_end >= start
  );
};

// Calculate budget summary for filtered budgets
export const calculateBudgetSummary = (budgets) => {
  const totalAllocated = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
  const totalSpent = budgets.reduce((sum, budget) => sum + budget.spent, 0);
  const totalRemaining = totalAllocated - totalSpent;
  const spendingPercentage = totalAllocated > 0 ? (totalSpent / totalAllocated) * 100 : 0;
  
  return {
    totalAllocated,
    totalSpent,
    totalRemaining,
    spendingPercentage,
    budgetStatus: getBudgetStatus(spendingPercentage)
  };
};

// Helper function to determine budget status
const getBudgetStatus = (percentage) => {
  if (percentage > 100) return 'Over Budget';
  if (percentage > 90) return 'At Risk';
  if (percentage > 75) return 'On Track';
  return 'Under Budget';
};

// Helper functions for date formatting

// Get month index from name
const getMonthIndex = (monthName) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.findIndex(m => m.toLowerCase().startsWith(monthName.toLowerCase()));
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
