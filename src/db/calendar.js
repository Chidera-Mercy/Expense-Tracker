import supabase from "./supabase";
/**
 * Fetch all expenses for a user within date range
 */
export async function fetchExpenses(userId, startDate, endDate) {
  const { data: expenses, error } = await supabase
    .from('expenses')
    .select('id, amount, date, merchant, description, category_id, is_recurring, status')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching expenses:', error);
    return [];
  }

  return expenses || [];
}

/**
 * Fetch all income entries for a user within date range
 */
export async function fetchIncome(userId, startDate, endDate) {
  const { data: income, error } = await supabase
    .from('income')
    .select('id, amount, date, source, category, description, recurring')
    .eq('user_id', userId)
    .gte('date', startDate)
    .lte('date', endDate)
    .order('date', { ascending: true });

  if (error) {
    console.error('Error fetching income:', error);
    return [];
  }

  return income || [];
}

/**
 * Fetch all categories for a user
 */
export async function fetchCategories(userId) {
  const { data: categories, error } = await supabase
    .from('categories')
    .select('id, name, color, icon')

  if (error) {
    console.error('Error fetching categories:', error);
    return [];
  }

  return categories || [];
}

/**
 * Get date range for a specific month
 */
export function getMonthDateRange(year, month) {
  const startDate = new Date(year, month, 1);
  const endDate = new Date(year, month + 1, 0);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Get date range for a specific week
 */
export function getWeekDateRange(date) {
  const currentDate = new Date(date);
  const day = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
  
  const startDate = new Date(currentDate);
  startDate.setDate(currentDate.getDate() - day);
  
  const endDate = new Date(startDate);
  endDate.setDate(startDate.getDate() + 6);
  
  return {
    startDate: startDate.toISOString().split('T')[0],
    endDate: endDate.toISOString().split('T')[0]
  };
}

/**
 * Get transactions (expenses and income) for a date range
 */
export async function fetchTransactionsForDateRange(userId, startDate, endDate) {
  const expenses = await fetchExpenses(userId, startDate, endDate);
  const income = await fetchIncome(userId, startDate, endDate);
  const categories = await fetchCategories(userId);
  
  // Format expenses to match transaction structure
  const formattedExpenses = expenses.map(expense => {
    const category = categories.find(cat => cat.id === expense.category_id);
    return {
      id: expense.id,
      date: expense.date,
      type: 'expense',
      amount: parseFloat(expense.amount),
      category: category?.name || 'Uncategorized',
      description: expense.merchant + (expense.description ? ` - ${expense.description}` : ''),
      categoryColor: category?.color || '#ff6b6b',
      categoryIcon: category?.icon || 'receipt',
      isRecurring: expense.is_recurring
    };
  });
  
  // Format income to match transaction structure
  const formattedIncome = income.map(inc => {
    return {
      id: inc.id,
      date: inc.date,
      type: 'income',
      amount: parseFloat(inc.amount),
      category: inc.category,
      description: inc.source + (inc.description ? ` - ${inc.description}` : ''),
      categoryColor: '#4ade80', // Default green for income
      categoryIcon: 'trending-up',
      isRecurring: inc.recurring
    };
  });
  
  // Combine and sort by date
  return [...formattedExpenses, ...formattedIncome].sort((a, b) => 
    new Date(a.date) - new Date(b.date)
  );
}