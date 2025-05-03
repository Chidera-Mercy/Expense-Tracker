import supabase from "./supabase";

// Fetch recent expenses
export const fetchRecentExpenses = async (userId, limit = 5) => {
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select(`
        id,
        amount,
        date,
        merchant,
        description,
        categories (name, color, icon)
      `)
      .eq('user_id', userId)
      .order('date', { ascending: false })
      .limit(limit);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching recent expenses:", error);
    return [];
  }
};

// Fetch current month's spending
export const fetchMonthlySpending = async (userId) => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', firstDay)
      .lte('date', lastDay);
    
    if (error) throw error;
    
    const total = data.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    return total;
  } catch (error) {
    console.error("Error fetching monthly spending:", error);
    return 0;
  }
};

// Fetch current month's income
export const fetchMonthlyIncome = async (userId) => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  try {
    const { data, error } = await supabase
      .from('income')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', firstDay)
      .lte('date', lastDay);
    
    if (error) throw error;
    
    const total = data.reduce((sum, income) => sum + parseFloat(income.amount), 0);
    return total;
  } catch (error) {
    console.error("Error fetching monthly income:", error);
    return 0;
  }
};

// Fetch budget overview for current month
export const fetchBudgetStatus = async (userId) => {
  const today = new Date();
  const currentMonth = today.getMonth() + 1;
  const currentYear = today.getFullYear();
  
  try {
    // Get all active budgets for this month
    const { data: budgets, error: budgetError } = await supabase
      .from('budgets')
      .select('*')
      .eq('user_id', userId)
      .lte('period_start', today.toISOString().split('T')[0])
      .gte('period_end', today.toISOString().split('T')[0]);
    
    if (budgetError) throw budgetError;
    
    // Calculate total budget amount
    const totalBudget = budgets.reduce((sum, budget) => sum + parseFloat(budget.amount), 0);
    
    // Calculate current spending against budget
    const { data: expenses, error: expenseError } = await supabase
      .from('expenses')
      .select('amount, category_id')
      .eq('user_id', userId)
      .gte('date', new Date(currentYear, currentMonth - 1, 1).toISOString().split('T')[0])
      .lte('date', new Date(currentYear, currentMonth, 0).toISOString().split('T')[0]);
    
    if (expenseError) throw expenseError;
    
    const totalSpent = expenses.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    return {
      totalBudget,
      totalSpent,
      percentageUsed: totalBudget > 0 ? (totalSpent / totalBudget) * 100 : 0
    };
  } catch (error) {
    console.error("Error fetching budget status:", error);
    return { totalBudget: 0, totalSpent: 0, percentageUsed: 0 };
  }
};

// Fetch top spending categories this month
export const fetchTopCategories = async (userId) => {
  const today = new Date();
  const firstDay = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  const lastDay = new Date(today.getFullYear(), today.getMonth() + 1, 0).toISOString().split('T')[0];
  
  try {
    const { data: expenses, error: expensesError } = await supabase
      .from('expenses')
      .select(`
        amount,
        categories (id, name, color, icon)
      `)
      .eq('user_id', userId)
      .gte('date', firstDay)
      .lte('date', lastDay);
    
    if (expensesError) throw expensesError;
    
    // Group by category and sum amounts
    const categoryTotals = expenses.reduce((acc, expense) => {
      const categoryId = expense.categories?.id;
      const categoryName = expense.categories?.name || 'Uncategorized';
      const categoryColor = expense.categories?.color || '#888888';
      const categoryIcon = expense.categories?.icon || 'tag';
      
      if (!categoryId) return acc;
      
      if (!acc[categoryId]) {
        acc[categoryId] = {
          id: categoryId,
          name: categoryName,
          color: categoryColor,
          icon: categoryIcon,
          total: 0
        };
      }
      
      acc[categoryId].total += parseFloat(expense.amount);
      return acc;
    }, {});
    
    // Convert to array and sort by total amount
    const sortedCategories = Object.values(categoryTotals)
      .sort((a, b) => b.total - a.total)
      .slice(0, 5);
    
    return sortedCategories;
  } catch (error) {
    console.error("Error fetching top categories:", error);
    return [];
  }
};

// Fetch upcoming financial goals
export const fetchFinancialGoals = async (userId) => {
  try {
    const { data, error } = await supabase
      .from('financial_goals')
      .select('*')
      .eq('user_id', userId)
      .order('deadline', { ascending: true })
      .limit(3);
    
    if (error) throw error;
    return data;
  } catch (error) {
    console.error("Error fetching financial goals:", error);
    return [];
  }
};

// Fetch financial insights based on expense patterns
export const fetchFinancialInsights = async (userId) => {
  // This would be more complex in a real implementation
  // For now, return some placeholder insights
  const today = new Date();
  const firstDayLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1).toISOString().split('T')[0];
  const lastDayLastMonth = new Date(today.getFullYear(), today.getMonth(), 0).toISOString().split('T')[0];
  const firstDayThisMonth = new Date(today.getFullYear(), today.getMonth(), 1).toISOString().split('T')[0];
  
  try {
    // Get last month's total spending
    const { data: lastMonthData, error: lastMonthError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', firstDayLastMonth)
      .lte('date', lastDayLastMonth);
    
    if (lastMonthError) throw lastMonthError;
    
    const lastMonthTotal = lastMonthData.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Get this month's spending so far
    const { data: thisMonthData, error: thisMonthError } = await supabase
      .from('expenses')
      .select('amount')
      .eq('user_id', userId)
      .gte('date', firstDayThisMonth)
      .lte('date', today.toISOString().split('T')[0]);
    
    if (thisMonthError) throw thisMonthError;
    
    const thisMonthTotal = thisMonthData.reduce((sum, expense) => sum + parseFloat(expense.amount), 0);
    
    // Get day of month
    const dayOfMonth = today.getDate();
    const daysInMonth = new Date(today.getFullYear(), today.getMonth() + 1, 0).getDate();
    
    // Project this month's total based on current rate
    const projectedMonthTotal = (thisMonthTotal / dayOfMonth) * daysInMonth;
    
    const insights = [];
    
    // Compare with last month
    if (projectedMonthTotal > lastMonthTotal * 1.2) {
      insights.push({
        type: 'warning',
        message: 'Your spending is trending 20% higher than last month. Consider reviewing your budget.'
      });
    } else if (projectedMonthTotal < lastMonthTotal * 0.8) {
      insights.push({
        type: 'positive',
        message: "You're on track to spend 20% less than last month. Great job!"
      });
    }
    
    // Add more insights as needed
    
    return insights;
  } catch (error) {
    console.error("Error generating insights:", error);
    return [];
  }
};

// Financial quotes
export const getRandomFinancialQuote = () => {
  const quotes = [
    {
      text: "The art is not in making money, but in keeping it.",
      author: "Proverb"
    },
    {
      text: "A budget is telling your money where to go instead of wondering where it went.",
      author: "Dave Ramsey"
    },
    {
      text: "Do not save what is left after spending, but spend what is left after saving.",
      author: "Warren Buffett"
    },
    {
      text: "Money is only a tool. It will take you wherever you wish, but it will not replace you as the driver.",
      author: "Ayn Rand"
    },
    {
      text: "It's not how much money you make, but how much money you keep.",
      author: "Robert Kiyosaki"
    },
    {
      text: "The price of anything is the amount of life you exchange for it.",
      author: "Henry David Thoreau"
    },
    {
      text: "Financial peace isn't the acquisition of stuff. It's learning to live on less than you make.",
      author: "Dave Ramsey"
    },
    {
      text: "The habit of saving is itself an education; it fosters every virtue, teaches self-denial, cultivates the sense of order.",
      author: "T.T. Munger"
    },
    {
      text: "Don't tell me what you value, show me your budget, and I'll tell you what you value.",
      author: "Joe Biden"
    },
    {
      text: "Too many people spend money they earned to buy things they don't want to impress people they don't like.",
      author: "Will Rogers"
    }
  ];
  
  return quotes[Math.floor(Math.random() * quotes.length)];
};