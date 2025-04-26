import supabase from "./supabase";

// Fetch expense data grouped by category within a date range
export async function fetchExpensesByCategory(startDate, endDate) {
  const { data, error } = await supabase
    .from('expenses')
    .select(`
      amount,
      date,
      categories:category_id (id, name, color)
    `)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: false });

  if (error) {
    console.error('Error fetching expenses by category:', error);
    return [];
  }

  // Group expenses by category
  const groupedExpenses = data.reduce((acc, expense) => {
    if (!expense.categories) return acc;
    
    const categoryName = expense.categories.name;
    const categoryColor = expense.categories.color || '#6B7280'; // Default color if none is set
    
    if (!acc[categoryName]) {
      acc[categoryName] = {
        name: categoryName,
        value: 0,
        color: categoryColor
      };
    }
    
    acc[categoryName].value += parseFloat(expense.amount);
    return acc;
  }, {});

  return Object.values(groupedExpenses);
}

// Fetch monthly expense and income data
export async function fetchMonthlyFinancials(year) {
  // Get monthly expenses
  const { data: expenseData, error: expenseError } = await supabase
    .rpc('get_monthly_expenses', { year_param: year });

  // Get monthly income
  const { data: incomeData, error: incomeError } = await supabase
    .rpc('get_monthly_income', { year_param: year });

  if (expenseError || incomeError) {
    console.error('Error fetching monthly financials:', expenseError || incomeError);
    return [];
  }

  // Create month mapping
  const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
  
  // Initialize result array with all months
  const result = months.map((month, index) => ({
    month,
    expense: 0,
    income: 0,
    monthNumber: index + 1
  }));

  // Fill in expense data
  if (expenseData) {
    expenseData.forEach(item => {
      const monthIndex = parseInt(item.month) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        result[monthIndex].expense = parseFloat(item.total_amount) || 0;
      }
    });
  }

  // Fill in income data
  if (incomeData) {
    incomeData.forEach(item => {
      const monthIndex = parseInt(item.month) - 1;
      if (monthIndex >= 0 && monthIndex < 12) {
        result[monthIndex].income = parseFloat(item.total_amount) || 0;
      }
    });
  }

  return result;
}

// Fetch budget performance data
export async function fetchBudgetPerformance(startDate, endDate) {
  // Get active budgets
  const { data: budgets, error: budgetError } = await supabase
    .from('budgets')
    .select(`
      id,
      amount,
      name,
      categories:category_id (id, name, color)
    `)
    .lte('period_start', endDate)
    .gte('period_end', startDate);

  if (budgetError) {
    console.error('Error fetching budgets:', budgetError);
    return [];
  }

  // For each budget, get the total spent amount
  const budgetPerformance = [];
  
  for (const budget of budgets) {
    const categoryId = budget.categories?.id;
    if (!categoryId) continue;
    
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('category_id', categoryId)
      .gte('date', startDate)
      .lte('date', endDate);
      
    if (expenseError) {
      console.error('Error fetching expenses for budget:', expenseError);
      continue;
    }
    
    const spent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    budgetPerformance.push({
      category: budget.categories.name || budget.name,
      budget: parseFloat(budget.amount),
      spent: spent,
      color: budget.categories.color || '#6B7280'
    });
  }

  return budgetPerformance;
}

// Fetch spending trends (daily expenses for a given period)
export async function fetchSpendingTrends(startDate, endDate) {
  const { data, error } = await supabase
    .from('expenses')
    .select('date, amount')
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching spending trends:', error);
    return [];
  }

  // Group expenses by date
  const groupedByDate = data.reduce((acc, expense) => {
    const date = expense.date;
    if (!acc[date]) {
      acc[date] = {
        date,
        expense: 0
      };
    }
    acc[date].expense += parseFloat(expense.amount);
    return acc;
  }, {});

  return Object.values(groupedByDate);
}

// Fetch financial goals data
export async function fetchFinancialGoals() {
  const { data, error } = await supabase
    .from('financial_goals')
    .select('*')
    .order('deadline', { ascending: true });

  if (error) {
    console.error('Error fetching financial goals:', error);
    return [];
  }

  return data.map(goal => ({
    ...goal,
    target_amount: parseFloat(goal.target_amount),
    current_amount: parseFloat(goal.current_amount),
    progress: (parseFloat(goal.current_amount) / parseFloat(goal.target_amount)) * 100
  }));
}

// Fetch top spending merchants
export async function fetchTopMerchants(startDate, endDate, limit = 5) {
  const { data, error } = await supabase
    .from('expenses')
    .select('merchant, amount')
    .gte('date', startDate)
    .lte('date', endDate);

  if (error) {
    console.error('Error fetching top merchants:', error);
    return [];
  }

  // Group by merchant and sum amounts
  const merchantTotals = data.reduce((acc, expense) => {
    const merchant = expense.merchant;
    if (!acc[merchant]) {
      acc[merchant] = {
        merchant,
        total: 0
      };
    }
    acc[merchant].total += parseFloat(expense.amount);
    return acc;
  }, {});

  // Convert to array, sort by total descending, and take top N
  return Object.values(merchantTotals)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit);
}

// Helper functions for date ranges
export function getDateRanges() {
  const today = new Date();
  const year = today.getFullYear();
  const month = today.getMonth();
  
  // This month
  const firstDayOfMonth = new Date(year, month, 1);
  const lastDayOfMonth = new Date(year, month + 1, 0);
  
  // Last quarter (3 months)
  const firstDayOfQuarter = new Date();
  firstDayOfQuarter.setMonth(firstDayOfQuarter.getMonth() - 3);
  
  // Year to date
  const firstDayOfYear = new Date(year, 0, 1);
  
  return {
    month: {
      start: formatDate(firstDayOfMonth),
      end: formatDate(lastDayOfMonth),
      label: 'This Month'
    },
    quarter: {
      start: formatDate(firstDayOfQuarter),
      end: formatDate(today),
      label: 'Last Quarter'
    },
    year: {
      start: formatDate(firstDayOfYear),
      end: formatDate(today),
      label: 'Year to Date'
    }
  };
}

// Format date to YYYY-MM-DD string
export function formatDate(date) {
  return date.toISOString().split('T')[0];
}