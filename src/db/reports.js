import supabase from "./supabase";


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

// Fetch expenses by category, with optional month filter
export const fetchExpensesByCategory = async (startDate, endDate, selectedMonth = null) => {
  try {
    
    // Base query
    let query = supabase
      .from('expenses')
      .select(`
        amount,
        date,
        categories:category_id (id, name, color)
      `)
      .gte('date', startDate)
      .lte('date', endDate);
    
    // Add month filter if selected
    if (selectedMonth) {
      // Convert month name to month number (1-12)
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const monthNumber = monthNames.indexOf(selectedMonth) + 1;
      
      if (monthNumber > 0) {
        // Extract month from date (Postgres specific syntax)
        query = query.filter('EXTRACT(MONTH FROM date)', 'eq', monthNumber);
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group expenses by category
    const categoryMap = {};
    
    data.forEach(expense => {
      const category = expense.categories ? expense.categories.name : 'Uncategorized';
      const color = expense.categories ? expense.categories.color : '#6B7280';
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          value: 0,
          color: color
        };
      }
      
      categoryMap[category].value += parseFloat(expense.amount);
    });
    
    // Convert to array and sort by value
    return Object.values(categoryMap).sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Error fetching expenses by category:', error);
    return [];
  }
};

// Fetch income by category, with optional month filter
export const fetchIncomeByCategory = async (startDate, endDate, selectedMonth = null) => {
  try {
    
    
    // Base query
    let query = supabase
      .from('income')
      .select(`
        amount,
        date,
        income_categories:category_id (id, name, color)
      `)
      .gte('date', startDate)
      .lte('date', endDate);
    
    // Add month filter if selected
    if (selectedMonth) {
      // Convert month name to month number (1-12)
      const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 
                          'July', 'August', 'September', 'October', 'November', 'December'];
      const monthNumber = monthNames.indexOf(selectedMonth) + 1;
      
      if (monthNumber > 0) {
        // Extract month from date (Postgres specific syntax)
        query = query.filter('EXTRACT(MONTH FROM date)', 'eq', monthNumber);
      }
    }
    
    const { data, error } = await query;
    
    if (error) throw error;
    
    // Group income by category
    const categoryMap = {};
    
    data.forEach(income => {
      const category = income.income_categories ? income.income_categories.name : 'Uncategorized';
      const color = income.income_categories ? income.income_categories.color : '#10B981';
      
      if (!categoryMap[category]) {
        categoryMap[category] = {
          name: category,
          value: 0,
          color: color
        };
      }
      
      categoryMap[category].value += parseFloat(income.amount);
    });
    
    // Convert to array and sort by value
    return Object.values(categoryMap).sort((a, b) => b.value - a.value);
  } catch (error) {
    console.error('Error fetching income by category:', error);
    return [];
  }
};

// Fetch monthly financials for a given year
export const fetchMonthlyFinancials = async (year) => {
  try {
    
    
    // Get all expenses for the year
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select('amount, date')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);
    
    if (expensesError) throw expensesError;
    
    // Get all income for the year
    const { data: incomes, error: incomesError } = await supabase
      .from('income')
      .select('amount, date')
      .gte('date', `${year}-01-01`)
      .lte('date', `${year}-12-31`);
    
    if (incomesError) throw incomesError;
    
    // Create monthly summary
    const months = [
      'January', 'February', 'March', 'April', 'May', 'June',
      'July', 'August', 'September', 'October', 'November', 'December'
    ];
    
    const monthlyData = months.map((month, index) => {
      const monthNumber = index + 1;
      
      // Filter expenses for this month
      const monthExpenses = expenses.filter(expense => {
        const expenseDate = new Date(expense.date);
        return expenseDate.getMonth() === index;
      });
      
      // Filter income for this month
      const monthIncome = incomes.filter(income => {
        const incomeDate = new Date(income.date);
        return incomeDate.getMonth() === index;
      });
      
      // Calculate totals
      const totalExpense = monthExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0);
      
      const totalIncome = monthIncome.reduce((sum, income) => 
        sum + parseFloat(income.amount), 0);
      
      return {
        month,
        expense: parseFloat(totalExpense.toFixed(2)),
        income: parseFloat(totalIncome.toFixed(2)),
        savings: parseFloat((totalIncome - totalExpense).toFixed(2))
      };
    });
    
    return monthlyData;
  } catch (error) {
    console.error('Error fetching monthly financials:', error);
    return [];
  }
};

// Fetch budget performance data
export const fetchBudgetPerformance = async (startDate, endDate) => {
  try {
    
    
    // Fetch all active budgets for the period
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select(`
        id,
        amount,
        categories:category_id (id, name, color)
      `)
      .lte('period_start', endDate)
      .gte('period_end', startDate);
    
    if (budgetError) throw budgetError;
    
    // Fetch expenses for each budget's category
    const budgetPerformance = await Promise.all(budgets.map(async (budget) => {
      if (!budget.categories) {
        return {
          category: 'Uncategorized',
          budgeted: parseFloat(budget.amount),
          spent: 0,
          remaining: parseFloat(budget.amount),
          percentage: 0,
          color: '#6B7280'
        };
      }
      
      // Get expenses for this category
      const { data: categoryExpenses, error: expenseError } = await supabase
        .from('expenses')
        .select('amount')
        .eq('category_id', budget.categories.id)
        .gte('date', startDate)
        .lte('date', endDate);
      
      if (expenseError) throw expenseError;
      
      // Calculate total spent
      const spent = categoryExpenses.reduce((sum, expense) => 
        sum + parseFloat(expense.amount), 0);
      
      // Calculate remaining and percentage
      const budgeted = parseFloat(budget.amount);
      const remaining = budgeted - spent;
      const percentage = (spent / budgeted) * 100;
      
      return {
        category: budget.categories.name,
        budgeted,
        spent,
        remaining,
        percentage: parseFloat(percentage.toFixed(1)),
        color: budget.categories.color
      };
    }));
    
    return budgetPerformance.sort((a, b) => b.percentage - a.percentage);
  } catch (error) {
    console.error('Error fetching budget performance:', error);
    return [];
  }
};

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


// Fetch top income sources
export const fetchTopIncomeSources = async (startDate, endDate) => {
  try {
    
    
    const { data, error } = await supabase
      .from('income')
      .select(`
        amount,
        source,
        date,
        income_categories:category_id (id, name, color)
      `)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    // Group income by source
    const sourceMap = {};
    
    data.forEach(income => {
      const source = income.source;
      const category = income.income_categories ? income.income_categories.name : 'Uncategorized';
      const color = income.income_categories ? income.income_categories.color : '#10B981';
      
      if (!sourceMap[source]) {
        sourceMap[source] = {
          source,
          total: 0,
          category,
          color
        };
      }
      
      sourceMap[source].total += parseFloat(income.amount);
    });
    
    // Convert to array and sort by total
    return Object.values(sourceMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Get top 10 sources
  } catch (error) {
    console.error('Error fetching top income sources:', error);
    return [];
  }
};

// Fetch top merchants
export const fetchTopMerchants = async (startDate, endDate) => {
  try {
    
    
    const { data: expenses, error } = await supabase
      .from('expenses')
      .select(`
        amount,
        merchant,
        date,
        categories:category_id (id, name, color)
      `)
      .gte('date', startDate)
      .lte('date', endDate);
    
    if (error) throw error;
    
    // Group expenses by merchant
    const merchantMap = {};
    
    expenses.forEach(expense => {
      const merchant = expense.merchant;
      const category = expense.categories ? expense.categories.name : 'Uncategorized';
      const color = expense.categories ? expense.categories.color : '#6B7280';
      
      if (!merchantMap[merchant]) {
        merchantMap[merchant] = {
          merchant,
          total: 0,
          transactions: 0,
          categories: {},
          primaryCategory: '',
          primaryCategoryColor: ''
        };
      }
      
      // Increment total and transaction count
      merchantMap[merchant].total += parseFloat(expense.amount);
      merchantMap[merchant].transactions += 1;
      
      // Track category usage
      if (!merchantMap[merchant].categories[category]) {
        merchantMap[merchant].categories[category] = {
          name: category,
          count: 0,
          color
        };
      }
      
      merchantMap[merchant].categories[category].count += 1;
    });
    
    // Determine primary category for each merchant
    Object.values(merchantMap).forEach(merchant => {
      let maxCount = 0;
      let primaryCategory = '';
      let primaryColor = '';
      
      Object.values(merchant.categories).forEach(category => {
        if (category.count > maxCount) {
          maxCount = category.count;
          primaryCategory = category.name;
          primaryColor = category.color;
        }
      });
      
      merchant.primaryCategory = primaryCategory;
      merchant.primaryCategoryColor = primaryColor;
      
      // Convert categories object to array
      merchant.categories = Object.values(merchant.categories);
    });
    
    // Convert to array and sort by total spent
    return Object.values(merchantMap)
      .sort((a, b) => b.total - a.total)
      .slice(0, 10); // Get top 10 merchants
  } catch (error) {
    console.error('Error fetching top merchants:', error);
    return [];
  }
};

// Fetch financial goals
export const fetchFinancialGoals = async () => {
  try {
    
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .order('deadline', { ascending: true });
    
    if (error) throw error;
    
    // Calculate percentage progress for each goal
    return data.map(goal => {
      const progress = (goal.current_amount / goal.target_amount) * 100;
      const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
      
      return {
        ...goal,
        progress: parseFloat(progress.toFixed(1)),
        daysLeft: daysLeft > 0 ? daysLeft : 0
      };
    });
  } catch (error) {
    console.error('Error fetching financial goals:', error);
    return [];
  }
};

