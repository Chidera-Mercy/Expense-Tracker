import React, { useState, useEffect, useRef  } from 'react';
import { UserAuth } from '../AuthContext.jsx';
import { 
  ArrowUpRight, ArrowDownRight, Wallet, Target, 
  DollarSign, AlertCircle, CheckCircle,
  ChevronRight, BadgePercent, PiggyBank, Clock
} from 'lucide-react';
import {
  fetchRecentExpenses,
  fetchMonthlySpending, 
  fetchMonthlyIncome,
  fetchBudgetStatus,
  fetchTopCategories,
  fetchFinancialGoals,
  fetchFinancialInsights,
  getRandomFinancialQuote
} from '../db/dashboard.js';
import { useCurrency } from '../CurrencyContext.jsx';

const Dashboard = () => {
  const { user, profile } = UserAuth();
  const initialLoadComplete = useRef(false);
  const { formatAmount } = useCurrency();
  const [loading, setLoading] = useState(true);
  const [monthlySpending, setMonthlySpending] = useState(0);
  const [monthlyIncome, setMonthlyIncome] = useState(0);
  const [budgetStatus, setBudgetStatus] = useState({ totalBudget: 0, totalSpent: 0, percentageUsed: 0 });
  const [topCategories, setTopCategories] = useState([]);
  const [recentExpenses, setRecentExpenses] = useState([]);
  const [financialGoals, setFinancialGoals] = useState([]);
  const [insights, setInsights] = useState([]);
  const [quote, setQuote] = useState(getRandomFinancialQuote());


  useEffect(() => {
    if (!user) return;
    
    // Skip loading if we've already done the initial load
    if (initialLoadComplete.current) return;
    
    const loadDashboardData = async () => {
      setLoading(true);
      try {
        // Load all required data in parallel
        const [
          spending,
          income,
          budget,
          categories,
          expenses,
          goals,
          insightData
        ] = await Promise.all([
          fetchMonthlySpending(user.id),
          fetchMonthlyIncome(user.id),
          fetchBudgetStatus(user.id),
          fetchTopCategories(user.id),
          fetchRecentExpenses(user.id),
          fetchFinancialGoals(user.id),
          fetchFinancialInsights(user.id)
        ]);
        setMonthlySpending(spending);
        setMonthlyIncome(income);
        setBudgetStatus(budget);
        setTopCategories(categories);
        setRecentExpenses(expenses);
        setFinancialGoals(goals);
        setInsights(insightData);
        
        // Mark that we've completed the initial load
        initialLoadComplete.current = true;
      } catch (error) {
        console.error("Error loading dashboard data:", error);
      } finally {
        setLoading(false);
      }
    };

    loadDashboardData();
  }, [user]);

  // Format date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric'
    }).format(date);
  };

  // Get greeting based on time of day
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return "Good morning";
    if (hour < 18) return "Good afternoon";
    return "Good evening";
  };

  if (loading) {
    return (
      <div className="flex-1 flex items-center justify-center bg-gray-50">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading your financial overview...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Main content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header with greeting */}
        <div className="mb-8">
          <div className="bg-gradient-to-r from-emerald-600 to-teal-500 rounded-2xl shadow-lg p-6 text-white">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">{getGreeting()}, {profile?.first_name || 'there'}!</h1>
                <p className="mt-1 text-emerald-100">Here's your financial snapshot for today</p>
              </div>
              {profile?.avatar_url && (
                <div className="h-14 w-14 rounded-full bg-white p-1">
                  <img 
                    src={profile.avatar_url} 
                    alt="Profile" 
                    className="h-full w-full object-cover rounded-full"
                  />
                </div>
              )}
            </div>
            
            {/* Summary numbers */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center">
                  <div className="bg-white/30 rounded-lg p-2">
                    <Wallet size={20} className="text-white" />
                  </div>
                  <p className="ml-2 text-sm font-medium text-white">Monthly Balance</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-white">
                  {formatAmount(monthlyIncome - monthlySpending)}
                </p>
                <div className="mt-1 flex items-center text-xs">
                  <span className={`${monthlyIncome > monthlySpending ? 'text-green-200' : 'text-red-200'}`}>
                    {monthlyIncome > monthlySpending ? 'Positive' : 'Negative'} balance
                  </span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center">
                  <div className="bg-white/30 rounded-lg p-2">
                    <ArrowDownRight size={20} className="text-white" />
                  </div>
                  <p className="ml-2 text-sm font-medium text-white">Monthly Spending</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{formatAmount(monthlySpending)}</p>
                <div className="mt-1 flex items-center text-xs text-emerald-100">
                  <span>{budgetStatus.percentageUsed.toFixed(0)}% of budget used</span>
                </div>
              </div>
              
              <div className="bg-white/20 backdrop-blur-sm rounded-xl p-4">
                <div className="flex items-center">
                  <div className="bg-white/30 rounded-lg p-2">
                    <ArrowUpRight size={20} className="text-white" />
                  </div>
                  <p className="ml-2 text-sm font-medium text-white">Monthly Income</p>
                </div>
                <p className="mt-2 text-2xl font-bold text-white">{formatAmount(monthlyIncome)}</p>
                <div className="mt-1 flex items-center text-xs text-emerald-100">
                  <span>This month's earnings</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Main dashboard grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left column - 2/3 width on large screens */}
          <div className="lg:col-span-2 space-y-6">
            {/* Insights */}
            {insights.length > 0 && (
              <div className="bg-white rounded-xl shadow-sm p-6">
                <div className="flex items-center justify-between mb-4">
                  <h2 className="text-lg font-semibold text-gray-800">Financial Insights</h2>
                </div>
                <div className="space-y-3">
                  {insights.map((insight, index) => (
                    <div 
                      key={index} 
                      className={`flex p-3 rounded-lg ${
                        insight.type === 'warning' 
                          ? 'bg-amber-50 text-amber-800' 
                          : insight.type === 'positive'
                            ? 'bg-emerald-50 text-emerald-800'
                            : 'bg-blue-50 text-blue-800'
                      }`}
                    >
                      <div className="flex-shrink-0">
                        {insight.type === 'warning' ? (
                          <AlertCircle size={20} className="text-amber-500" />
                        ) : (
                          <CheckCircle size={20} className="text-emerald-500" />
                        )}
                      </div>
                      <p className="ml-3 text-sm">{insight.message}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Top spending categories */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Top Spending Categories</h2>
                <a href="/reports" className="text-emerald-600 text-sm font-medium flex items-center hover:text-emerald-800">
                  See all <ChevronRight size={16} />
                </a>
              </div>
              {topCategories.length > 0 ? (
                <div className="space-y-4">
                  {topCategories.map((category) => (
                    <div key={category.id} className="flex items-center">
                      <div 
                        className="w-10 h-10 rounded-lg flex items-center justify-center" 
                        style={{ backgroundColor: category.color || '#e5e7eb' }}
                      >
                        {/* You could have a component that renders different icons based on the icon name */}
                        <DollarSign size={18} className="text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <p className="text-sm font-medium text-gray-900">{category.name}</p>
                          <p className="text-sm font-semibold text-gray-900">{formatAmount(category.total)}</p>
                        </div>
                        <div className="mt-1 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ 
                              width: `${(category.total / topCategories[0].total) * 100}%`,
                              backgroundColor: category.color || '#10b981'
                            }}
                          ></div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No spending data available for this month.</p>
              )}
            </div>

            {/* Financial Quote */}
            <div className="bg-gradient-to-br from-sky-100 to-indigo-100 rounded-xl shadow-sm p-6">
              <div className="flex items-start">
                <span className="text-4xl text-indigo-400">"</span>
                <div className="ml-2">
                  <p className="text-gray-800 text-lg italic">{quote.text}</p>
                  <p className="mt-2 text-gray-600 text-sm">— {quote.author}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right column - 1/3 width on large screens */}
          <div className="space-y-6">
            {/* Budget Status */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-semibold text-gray-800">Budget Status</h2>
                <a href="/budgets" className="text-emerald-600 text-sm font-medium flex items-center hover:text-emerald-800">
                  Details <ChevronRight size={16} />
                </a>
              </div>
              <div className="flex items-center justify-center my-4">
                <div className="relative">
                  <svg className="w-32 h-32">
                    <circle
                      className="text-gray-200"
                      strokeWidth="10"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                    />
                    <circle
                      className={`${
                        budgetStatus.percentageUsed > 90 
                          ? 'text-red-500' 
                          : budgetStatus.percentageUsed > 75 
                            ? 'text-amber-500' 
                            : 'text-emerald-500'
                      }`}
                      strokeWidth="10"
                      strokeDasharray={`${Math.min(budgetStatus.percentageUsed, 100) * 3.51} 351`}
                      strokeLinecap="round"
                      stroke="currentColor"
                      fill="transparent"
                      r="56"
                      cx="64"
                      cy="64"
                      transform="rotate(-90 64 64)"
                    />
                  </svg>
                  <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 text-center">
                    <p className="text-3xl font-bold text-gray-800">{budgetStatus.percentageUsed.toFixed(0)}%</p>
                    <p className="text-xs text-gray-500">of budget</p>
                  </div>
                </div>
              </div>
              <div className="flex justify-between text-sm mt-2 px-2">
                <div>
                  <p className="text-gray-500">Spent</p>
                  <p className="font-medium text-gray-800">{formatAmount(budgetStatus.totalSpent)}</p>
                </div>
                <div className="text-right">
                  <p className="text-gray-500">Budget</p>
                  <p className="font-medium text-gray-800">{formatAmount(budgetStatus.totalBudget)}</p>
                </div>
              </div>
            </div>

            {/* Upcoming Goals */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Financial Goals</h2>
                <a href="/goals" className="text-emerald-600 text-sm font-medium flex items-center hover:text-emerald-800">
                  All goals <ChevronRight size={16} />
                </a>
              </div>
              {financialGoals.length > 0 ? (
                <div className="space-y-4">
                  {financialGoals.map((goal) => {
                    const progress = (goal.current_amount / goal.target_amount) * 100;
                    const deadline = new Date(goal.deadline);
                    const daysLeft = Math.ceil((deadline - new Date()) / (1000 * 60 * 60 * 24));
                    
                    return (
                      <div key={goal.id} className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-start justify-between">
                          <div className="flex items-center">
                            <div
                              className="w-10 h-10 rounded-lg flex items-center justify-center"
                              style={{ backgroundColor: goal.color || '#e5e7eb' }}
                            >
                              <Target size={18} className="text-white" />
                            </div>
                            <div className="ml-3">
                              <p className="text-sm font-medium text-gray-900">{goal.name}</p>
                              <p className="text-xs text-gray-500">
                                {daysLeft > 0 ? `${daysLeft} days left` : 'Deadline passed'}
                              </p>
                            </div>
                          </div>
                          <p className="text-xs font-medium text-gray-700">{progress.toFixed(0)}%</p>
                        </div>
                        <div className="mt-3 w-full bg-gray-200 rounded-full h-1.5">
                          <div
                            className="h-1.5 rounded-full"
                            style={{ 
                              width: `${progress}%`,
                              backgroundColor: goal.color || '#10b981'
                            }}
                          ></div>
                        </div>
                        <div className="mt-2 flex justify-between text-xs">
                          <p className="text-gray-500">{formatAmount(goal.current_amount)}</p>
                          <p className="text-gray-500">{formatAmount(goal.target_amount)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <div className="text-center py-6">
                  <PiggyBank size={32} className="mx-auto text-gray-400" />
                  <p className="mt-2 text-gray-600">No financial goals yet</p>
                  <a
                    href="/goals"
                    className="mt-3 inline-flex items-center px-3 py-2 text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
                  >
                    Create a goal
                  </a>
                </div>
              )}
            </div>

            {/* Recent transactions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-lg font-semibold text-gray-800">Recent Transactions</h2>
                <a href="/expenses" className="text-emerald-600 text-sm font-medium flex items-center hover:text-emerald-800">
                  View all <ChevronRight size={16} />
                </a>
              </div>
              {recentExpenses.length > 0 ? (
                <div className="space-y-3">
                  {recentExpenses.map((expense) => (
                    <div key={expense.id} className="flex items-center p-2 hover:bg-gray-50 rounded-lg">
                      <div
                        className="w-10 h-10 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: expense.categories?.color || '#e5e7eb' }}
                      >
                        <DollarSign size={18} className="text-white" />
                      </div>
                      <div className="ml-3 flex-1">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm font-medium text-gray-900">{expense.merchant}</p>
                            <p className="text-xs text-gray-500">{formatDate(expense.date)} · {expense.categories?.name || 'Uncategorized'}</p>
                          </div>
                          <p className="text-sm font-semibold text-gray-900">-{formatAmount(expense.amount)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-gray-500 text-sm">No recent transactions.</p>
              )}
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl shadow-sm p-6">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Quick Actions</h2>
              <div className="grid grid-cols-2 gap-3">
                <a 
                  href="/expenses" 
                  className="flex flex-col items-center justify-center bg-emerald-50 hover:bg-emerald-100 text-emerald-700 p-4 rounded-lg transition-colors"
                >
                  <ArrowDownRight size={24} />
                  <span className="mt-2 text-sm font-medium">Add Expense</span>
                </a>
                <a 
                  href="/income" 
                  className="flex flex-col items-center justify-center bg-blue-50 hover:bg-blue-100 text-blue-700 p-4 rounded-lg transition-colors"
                >
                  <ArrowUpRight size={24} />
                  <span className="mt-2 text-sm font-medium">Add Income</span>
                </a>
                <a 
                  href="/budgets" 
                  className="flex flex-col items-center justify-center bg-purple-50 hover:bg-purple-100 text-purple-700 p-4 rounded-lg transition-colors"
                >
                  <BadgePercent size={24} />
                  <span className="mt-2 text-sm font-medium">New Budget</span>
                </a>
                <a 
                  href="/goals" 
                  className="flex flex-col items-center justify-center bg-amber-50 hover:bg-amber-100 text-amber-700 p-4 rounded-lg transition-colors"
                >
                  <Target size={24} />
                  <span className="mt-2 text-sm font-medium">Set Goal</span>
                </a>
              </div>
            </div>
          </div>
        </div>

        {/* Refresh data link */}
        <div className="mt-6 text-center">
          <button 
            onClick={() => window.location.reload()} 
            className="inline-flex items-center text-sm text-gray-500 hover:text-emerald-600"
          >
            <Clock size={16} className="mr-1" />
            Refresh financial data
          </button>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;