import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Calendar, Download, 
  Edit, Trash2, ArrowUpDown, ChevronDown, 
  MoreHorizontal, X, Check, DollarSign, 
  BarChart2, RefreshCw, Repeat, PieChart as PieChartIcon,
  TrendingUp, Layers, Award, Zap, FileText
} from 'lucide-react';
import {
    PieChart, Pie, Cell, 
    BarChart, Bar, 
    LineChart, Line,
    AreaChart, Area,
    XAxis, YAxis, 
    CartesianGrid, 
    Tooltip, Legend,
    ResponsiveContainer
  } from 'recharts';

import * as reportsService from '../db/reports.js';

const Reports = () => {
    const [activeReport, setActiveReport] = useState('expense-breakdown');
    const [dateRange, setDateRange] = useState('month');
    const [customStartDate, setCustomStartDate] = useState('');
    const [customEndDate, setCustomEndDate] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [startDate, setStartDate] = useState('');
    const [endDate, setEndDate] = useState('');
    
    // Data states
    const [categoryData, setCategoryData] = useState([]);
    const [monthlyData, setMonthlyData] = useState([]);
    const [budgetData, setBudgetData] = useState([]);
    const [spendingTrends, setSpendingTrends] = useState([]);
    const [financialGoals, setFinancialGoals] = useState([]);
    const [topMerchants, setTopMerchants] = useState([]);
   
    const reportsList = [
      { id: 'expense-breakdown', name: 'Expense Breakdown', icon: <PieChartIcon size={18} /> },
      { id: 'income-expense', name: 'Income vs Expenses', icon: <BarChart2 size={18} /> },
      { id: 'budget-performance', name: 'Budget Performance', icon: <Layers size={18} /> },
      { id: 'spending-trends', name: 'Spending Trends', icon: <TrendingUp size={18} /> },
      { id: 'savings-analysis', name: 'Savings Analysis', icon: <DollarSign size={18} /> },
      { id: 'goals-progress', name: 'Financial Goals', icon: <Award size={18} /> },
      { id: 'merchant-analysis', name: 'Top Merchants', icon: <Zap size={18} /> }
    ];

    // Initialize dates on component mount
    useEffect(() => {
      const dateRanges = reportsService.getDateRanges();
      const currentRange = dateRanges[dateRange];
      setStartDate(currentRange.start);
      setEndDate(currentRange.end);
      
      // Set custom date inputs to the current range for better UX
      setCustomStartDate(currentRange.start);
      setCustomEndDate(currentRange.end);
    }, []);

    // Fetch data whenever date range changes
    useEffect(() => {
      if (startDate && endDate) {
        fetchReportData();
      }
    }, [startDate, endDate, activeReport]);

    // Handle date range changes
    const handleDateRangeChange = (range) => {
      setDateRange(range);
      
      if (range !== 'custom') {
        const dateRanges = reportsService.getDateRanges();
        const newRange = dateRanges[range];
        setStartDate(newRange.start);
        setEndDate(newRange.end);
        
        // Update custom date inputs
        setCustomStartDate(newRange.start);
        setCustomEndDate(newRange.end);
      }
    };

    // Apply custom date range
    const applyCustomDateRange = () => {
      if (customStartDate && customEndDate) {
        setStartDate(customStartDate);
        setEndDate(customEndDate);
      }
    };

    // Fetch data for the active report
    const fetchReportData = async () => {
      setIsLoading(true);
      
      try {
        // Always fetch category data (used in multiple reports)
        const expenses = await reportsService.fetchExpensesByCategory(startDate, endDate);
        setCategoryData(expenses);
        
        // Get monthly data for income/expense comparison and savings analysis
        if (['income-expense', 'savings-analysis'].includes(activeReport)) {
          const year = new Date().getFullYear();
          const monthlyFinancials = await reportsService.fetchMonthlyFinancials(year);
          setMonthlyData(monthlyFinancials);
        }
        
        // Get budget performance data
        if (activeReport === 'budget-performance') {
          const budgets = await reportsService.fetchBudgetPerformance(startDate, endDate);
          setBudgetData(budgets);
        }
        
        // Get spending trends data
        if (activeReport === 'spending-trends') {
          const trends = await reportsService.fetchSpendingTrends(startDate, endDate);
          setSpendingTrends(trends);
        }
        
        // Get financial goals data
        if (activeReport === 'goals-progress') {
          const goals = await reportsService.fetchFinancialGoals();
          setFinancialGoals(goals);
        }
        
        // Get top merchants data
        if (activeReport === 'merchant-analysis') {
          const merchants = await reportsService.fetchTopMerchants(startDate, endDate);
          setTopMerchants(merchants);
        }
        
      } catch (error) {
        console.error('Error fetching report data:', error);
      } finally {
        setIsLoading(false);
      }
    };

    const handleReportChange = (reportId) => {
      setActiveReport(reportId);
    };
    
    const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', '#EF4444', '#6B7280', '#EC4899', '#14B8A6'];

    const renderReportContent = () => {
      if (isLoading) {
        return (
          <div className="bg-white p-6 rounded-lg shadow flex items-center justify-center h-64">
            <RefreshCw className="animate-spin h-8 w-8 text-green-500 mr-2" />
            <p className="text-lg">Loading report data...</p>
          </div>
        );
      }
      
      switch (activeReport) {
        case 'expense-breakdown':
          return (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Expense Breakdown by Category</h3>
              
              {categoryData.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <p>No expense data available for the selected period.</p>
                </div>
              ) : (
                <div className="flex flex-col md:flex-row">
                  <div className="w-full md:w-1/2 h-64">
                    <ResponsiveContainer width="100%" height={250}>
                      <PieChart>
                        <Pie
                          data={categoryData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          fill="#8884d8"
                          paddingAngle={2}
                          dataKey="value"
                          // Remove the label property
                        >
                          {categoryData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color || COLORS[index % COLORS.length]} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value) => `$${value.toFixed(2)}`} />
                        <Legend layout="vertical" align="right" verticalAlign="middle" />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="w-full md:w-1/2 mt-4 md:mt-0">
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Percentage</th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {categoryData.map((category, index) => {
                            const totalValue = categoryData.reduce((sum, item) => sum + item.value, 0);
                            const percentage = ((category.value / totalValue) * 100).toFixed(1);
                            
                            return (
                              <tr key={index} className="hover:bg-gray-50">
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: category.color || COLORS[index % COLORS.length] }}></div>
                                    <div className="text-sm font-medium text-gray-900">{category.name}</div>
                                  </div>
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">${category.value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</td>
                                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{percentage}%</td>
                              </tr>
                            );
                          })}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>
              )}
            </div>
          );
        
        case 'income-expense':
          return (
            <div className="bg-white p-6 rounded-lg shadow">
              <h3 className="text-lg font-semibold mb-4">Income vs Expenses</h3>
              
              {monthlyData.length === 0 ? (
                <div className="text-center p-8 text-gray-500">
                  <p>No income and expense data available.</p>
                </div>
              ) : (
                <>
                  <div className="h-64 mb-6">
                    <ResponsiveContainer width="100%" height={250}>
                      <BarChart data={monthlyData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis dataKey="month" />
                        <YAxis tickFormatter={(value) => `$${value}`} />
                        <Tooltip 
                          formatter={(value) => [`$${value.toFixed(2)}`, value === 'income' ? 'Income' : 'Expenses']}
                          contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                        />
                        <Legend />
                        <Bar dataKey="income" name="Income" fill="#10B981" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="expense" name="Expenses" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                  <div className="mt-6">
                    <h4 className="text-md font-medium mb-3">Summary</h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-green-50 p-4 rounded-lg border border-green-100">
                        <div className="flex items-center mb-2">
                          <DollarSign className="text-green-600 mr-2" size={18} />
                          <p className="text-sm text-gray-700 font-medium">Total Income</p>
                        </div>
                        <p className="text-xl font-bold text-green-600">
                          ${monthlyData.reduce((sum, item) => sum + item.income, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-red-50 p-4 rounded-lg border border-red-100">
                        <div className="flex items-center mb-2">
                          <ArrowUpDown className="text-red-600 mr-2" size={18} />
                          <p className="text-sm text-gray-700 font-medium">Total Expenses</p>
                        </div>
                        <p className="text-xl font-bold text-red-600">
                          ${monthlyData.reduce((sum, item) => sum + item.expense, 0).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                      <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
                        <div className="flex items-center mb-2">
                          <Layers className="text-blue-600 mr-2" size={18} />
                          <p className="text-sm text-gray-700 font-medium">Net Savings</p>
                        </div>
                        <p className="text-xl font-bold text-blue-600">
                          ${(monthlyData.reduce((sum, item) => sum + item.income, 0) - 
                            monthlyData.reduce((sum, item) => sum + item.expense, 0)).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </p>
                      </div>
                    </div>
                  </div>
                </>
              )}
            </div>
          );
          
        // Continuing from the budget-performance case
case 'budget-performance':
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Budget Performance</h3>
      
      {budgetData.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No budget data available for the selected period.</p>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Budget</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Spent</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Remaining</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Progress</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {budgetData.map((item, index) => {
                const percentage = (item.spent / item.budget) * 100;
                let progressColor = 'bg-green-500';
                if (percentage > 90) progressColor = 'bg-red-500';
                else if (percentage > 75) progressColor = 'bg-yellow-500';
                
                return (
                  <tr key={index} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        <div className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: item.color || COLORS[index % COLORS.length] }}></div>
                        <div className="text-sm font-medium text-gray-900">{item.category}</div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.budget.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${item.spent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      ${(item.budget - item.spent).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div className={`h-2.5 rounded-full ${progressColor}`} style={{ width: `${Math.min(percentage, 100)}%` }}></div>
                      </div>
                      <span className="text-xs text-gray-500 mt-1">{percentage.toFixed(0)}%</span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
      
      {budgetData.length > 0 && (
        <div className="mt-6">
          <h4 className="text-md font-medium mb-3">Budget Overview</h4>
          <div className="h-64">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={budgetData}
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
                barGap={0}
                barCategoryGap={10}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis dataKey="category" />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Bar dataKey="budget" name="Budget" fill="#3B82F6" radius={[4, 4, 0, 0]} />
                <Bar dataKey="spent" name="Spent" fill="#10B981" radius={[4, 4, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>
      )}
    </div>
  );

case 'spending-trends':
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Spending Trends</h3>
      
      {spendingTrends.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No spending trends data available for the selected period.</p>
        </div>
      ) : (
        <>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height={250}>
              <LineChart data={spendingTrends} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => {
                    const d = new Date(date);
                    return `${d.getMonth()+1}/${d.getDate()}`;
                  }}
                />
                <YAxis tickFormatter={(value) => `$${value}`} />
                <Tooltip 
                  formatter={(value) => [`$${value.toFixed(2)}`, 'Expenses']}
                  labelFormatter={(date) => new Date(date).toLocaleDateString()}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                />
                <Legend />
                <Line 
                  type="monotone" 
                  dataKey="expense" 
                  name="Daily Expenses" 
                  stroke="#EF4444" 
                  strokeWidth={2}
                  dot={{ r: 3 }}
                  activeDot={{ r: 6 }} 
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Analysis</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="flex items-center mb-3">
                <TrendingUp className="text-blue-600 mr-2" size={18} />
                <p className="text-sm font-medium text-gray-700">Spending Insights</p>
              </div>
              
              {spendingTrends.length > 0 && (
                <div className="space-y-2">
                  <p className="text-sm text-gray-700">
                    <strong>Total Spent:</strong> $
                    {spendingTrends.reduce((sum, day) => sum + day.expense, 0)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Daily Average:</strong> $
                    {(spendingTrends.reduce((sum, day) => sum + day.expense, 0) / spendingTrends.length)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                  <p className="text-sm text-gray-700">
                    <strong>Highest Spending Day:</strong> $
                    {Math.max(...spendingTrends.map(day => day.expense))
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    {' '} on {
                      new Date(spendingTrends.sort((a, b) => b.expense - a.expense)[0].date).toLocaleDateString()
                    }
                  </p>
                </div>
              )}
              
              <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700">
                  <strong>Recommendation:</strong> Consider setting daily spending limits to maintain more consistent spending habits.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

case 'savings-analysis':
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Savings Analysis</h3>
      
      {monthlyData.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No savings data available.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <h4 className="text-md font-medium mb-3 flex items-center">
                <DollarSign className="text-blue-600 mr-2" size={18} />
                Monthly Savings
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height={180}>
                  <AreaChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSavings" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                        <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `$${value}`} />
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const savings = props.payload.income - props.payload.expense;
                        return [`$${savings.toFixed(2)}`, 'Savings'];
                      }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                    />
                    <Area 
                      type="monotone" 
                      dataKey={(data) => data.income - data.expense} 
                      stroke="#10B981" 
                      fillOpacity={1} 
                      fill="url(#colorSavings)" 
                      name="Savings"
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>
            </div>
            
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <h4 className="text-md font-medium mb-3 flex items-center">
                <Layers className="text-purple-600 mr-2" size={18} />
                Savings Rate
              </h4>
              <div className="h-48">
                <ResponsiveContainer width="100%" height={180}>
                  <BarChart data={monthlyData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#eef0f2" />
                    <XAxis dataKey="month" />
                    <YAxis tickFormatter={(value) => `${value}%`} domain={[0, 100]} />
                    <Tooltip 
                      formatter={(value, name, props) => {
                        const savingsRate = ((props.payload.income - props.payload.expense) / props.payload.income * 100).toFixed(1);
                        return [`${savingsRate}%`, 'Savings Rate'];
                      }}
                      contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                    />
                    <Bar 
                      dataKey={(data) => ((data.income - data.expense) / data.income * 100)} 
                      fill="#8B5CF6" 
                      name="Savings Rate"
                      radius={[4, 4, 0, 0]}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Yearly Projection</h4>
            <div className="bg-gray-50 p-4 rounded-lg border border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                  <p className="text-sm text-gray-700 mb-1">Annual Savings</p>
                  <p className="text-lg font-bold text-green-600">
                    ${(monthlyData.reduce((sum, item) => sum + (item.income - item.expense), 0))
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                  <p className="text-sm text-gray-700 mb-1">Avg. Monthly Savings</p>
                  <p className="text-lg font-bold text-blue-600">
                    ${(monthlyData.reduce((sum, item) => sum + (item.income - item.expense), 0) / monthlyData.length)
                      .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                  <p className="text-sm text-gray-700 mb-1">Avg. Savings Rate</p>
                  <p className="text-lg font-bold text-purple-600">
                    {(monthlyData.reduce((sum, item) => {
                      const savingsRate = item.income > 0 ? ((item.income - item.expense) / item.income * 100) : 0;
                      return sum + savingsRate;
                    }, 0) / monthlyData.length).toFixed(1)}%
                  </p>
                </div>
              </div>
              
              <div className="mt-4 p-3 bg-yellow-50 rounded-lg border border-yellow-100">
                <p className="text-sm text-gray-700">
                  <strong>Financial Opportunity:</strong> Based on your current savings rate, you could potentially save
                  ${(monthlyData.reduce((sum, item) => sum + (item.income - item.expense), 0) * 1.2)
                    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} 
                  next year with a 20% increase in your savings rate.
                </p>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );

case 'goals-progress':
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Financial Goals Progress</h3>
      
      {financialGoals.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No financial goals found. Create a goal to track your progress.</p>
          <button className="mt-4 flex items-center mx-auto bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700">
            <Plus size={16} className="mr-1" /> Create a Goal
          </button>
        </div>
      ) : (
        <div className="space-y-6">
          {financialGoals.map((goal, index) => {
            const daysLeft = Math.ceil((new Date(goal.deadline) - new Date()) / (1000 * 60 * 60 * 24));
            const progressPercentage = Math.min((goal.current_amount / goal.target_amount) * 100, 100);
            
            let progressColor = 'bg-blue-500';
            if (progressPercentage >= 100) progressColor = 'bg-green-500';
            else if (daysLeft < 30 && progressPercentage < 75) progressColor = 'bg-red-500';
            else if (daysLeft < 60 && progressPercentage < 50) progressColor = 'bg-yellow-500';
            
            return (
              <div key={index} className="bg-gray-50 p-4 rounded-lg border border-gray-200">
                <div className="flex flex-col md:flex-row md:items-center mb-3">
                  <div className="flex-grow">
                    <h4 className="text-md font-medium flex items-center">
                      <span className="h-3 w-3 rounded-full mr-2" style={{ backgroundColor: goal.color }}></span>
                      {goal.name}
                    </h4>
                    <p className="text-sm text-gray-600 mt-1">Category: {goal.category}</p>
                  </div>
                  <div className="mt-2 md:mt-0">
                    <span className={`text-xs font-medium px-2 py-1 rounded-full ${
                      daysLeft <= 0 ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'
                    }`}>
                      {daysLeft <= 0 ? 'Overdue' : `${daysLeft} days left`}
                    </span>
                  </div>
                </div>
                
                <div className="mb-3">
                  <div className="flex justify-between text-xs text-gray-500 mb-1">
                    <span>${goal.current_amount.toLocaleString()}</span>
                    <span>${goal.target_amount.toLocaleString()}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2.5">
                    <div 
                      className={`h-2.5 rounded-full ${progressColor}`} 
                      style={{ width: `${progressPercentage}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between mt-1">
                    <span className="text-xs text-gray-500">{progressPercentage.toFixed(1)}% complete</span>
                    <span className="text-xs text-gray-500">
                      ${(goal.target_amount - goal.current_amount).toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })} to go
                    </span>
                  </div>
                </div>
                
                {goal.notes && (
                  <p className="text-xs text-gray-600 mt-2 italic">"{goal.notes}"</p>
                )}
              </div>
            );
          })}
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Goals Summary</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              <div className="p-3 bg-green-50 rounded-lg border border-green-100">
                <p className="text-sm text-gray-700 mb-1">Total Goal Amount</p>
                <p className="text-lg font-bold text-green-600">
                  ${financialGoals.reduce((sum, goal) => sum + goal.target_amount, 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-sm text-gray-700 mb-1">Current Progress</p>
                <p className="text-lg font-bold text-blue-600">
                  ${financialGoals.reduce((sum, goal) => sum + goal.current_amount, 0)
                    .toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </p>
              </div>
              <div className="p-3 bg-purple-50 rounded-lg border border-purple-100">
                <p className="text-sm text-gray-700 mb-1">Overall Completion</p>
                <p className="text-lg font-bold text-purple-600">
                  {(financialGoals.reduce((sum, goal) => sum + goal.current_amount, 0) / 
                    financialGoals.reduce((sum, goal) => sum + goal.target_amount, 0) * 100).toFixed(1)}%
                </p>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );

case 'merchant-analysis':
  return (
    <div className="bg-white p-6 rounded-lg shadow">
      <h3 className="text-lg font-semibold mb-4">Top Merchants</h3>
      
      {topMerchants.length === 0 ? (
        <div className="text-center p-8 text-gray-500">
          <p>No merchant data available for the selected period.</p>
        </div>
      ) : (
        <>
          <div className="h-64 mb-6">
            <ResponsiveContainer width="100%" height={250}>
              <BarChart 
                data={topMerchants} 
                layout="vertical" 
                margin={{ top: 5, right: 30, left: 20, bottom: 5 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" horizontal={false} />
                <XAxis type="number" tickFormatter={(value) => `$${value}`} />
                <YAxis type="category" dataKey="merchant" width={150} />
                <Tooltip 
                  formatter={(value) => `$${value.toFixed(2)}`}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '8px', boxShadow: '0 2px 5px rgba(0,0,0,0.1)' }}
                />
                <Bar 
                  dataKey="total" 
                  name="Total Spent" 
                  fill="#3B82F6" 
                  radius={[0, 4, 4, 0]} 
                />
              </BarChart>
            </ResponsiveContainer>
          </div>
          
          <div className="mt-6">
            <h4 className="text-md font-medium mb-3">Merchant Breakdown</h4>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Rank</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Merchant</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Total Spent</th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">% of Spending</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {topMerchants.map((merchant, index) => {
                    const totalSpent = topMerchants.reduce((sum, m) => sum + m.total, 0);
                    const percentage = (merchant.total / totalSpent * 100).toFixed(1);
                    
                    return (
                      <tr key={index} className="hover:bg-gray-50">
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          #{index + 1}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {merchant.merchant}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          ${merchant.total.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                          {percentage}%
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
            
            {topMerchants.length > 0 && (
              <div className="mt-6 p-4 bg-yellow-50 rounded-lg border border-yellow-100">
                <div className="flex items-center mb-2">
                  <Zap className="text-yellow-600 mr-2" size={18} />
                  <p className="text-sm font-medium text-gray-700">Spending Insight</p>
                </div>
                <p className="text-sm text-gray-700">
                  Your top merchant ({topMerchants[0].merchant}) represents {
                    (topMerchants[0].total / topMerchants.reduce((sum, m) => sum + m.total, 0) * 100).toFixed(1)
                  }% of your total spending in this period. {
                    (topMerchants[0].total / topMerchants.reduce((sum, m) => sum + m.total, 0)) > 0.25 ?
                    "Consider reviewing this spending category for potential savings opportunities." :
                    "Your spending appears to be well distributed across different merchants."
                  }
                </p>
              </div>
            )}
          </div>
        </>
      )}
    </div>
  );

        default:
          return (
            <div className="bg-white p-6 rounded-lg shadow">
              <p>Select a report from the sidebar to view analytics.</p>
            </div>
          );
      }
    };
    
    return (
      <div className="bg-gray-50 min-h-screen">
        <div className="container mx-auto px-4 py-6">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-bold text-gray-800">Financial Reports</h2>
            <div className="flex space-x-3">
              <div className="relative">
                <button className="flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500">
                  <Download size={16} className="mr-1" /> Export
                </button>
              </div>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-4">
            {/* Reports Sidebar */}
            <div className="w-full md:w-64 bg-white rounded-lg shadow p-4">
              <div className="mb-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Available Reports</h3>
                <ul className="space-y-1">
                  {reportsList.map((report) => (
                    <li key={report.id}>
                      <button
                        onClick={() => handleReportChange(report.id)}
                        className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                          activeReport === report.id
                            ? 'bg-green-50 text-green-700 font-medium'
                            : 'text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span className="mr-2">{report.icon}</span>
                        {report.name}
                      </button>
                    </li>
                  ))}
                </ul>
              </div>
              
              <div className="border-t border-gray-200 pt-4">
                <h3 className="text-sm font-medium text-gray-700 mb-2">Date Range</h3>
                <div className="space-y-1">
                  <button
                    onClick={() => handleDateRangeChange('month')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      dateRange === 'month'
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    This Month
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('quarter')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      dateRange === 'quarter'
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Last Quarter
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('ytd')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      dateRange === 'ytd'
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Year to Date
                  </button>
                  <button
                    onClick={() => handleDateRangeChange('custom')}
                    className={`w-full flex items-center px-3 py-2 text-sm rounded-md ${
                      dateRange === 'custom'
                        ? 'bg-green-50 text-green-700 font-medium'
                        : 'text-gray-700 hover:bg-gray-100'
                    }`}
                  >
                    Custom Range
                  </button>
                </div>
                
                {/* Custom date range inputs */}
                {dateRange === 'custom' && (
                  <div className="mt-3 space-y-2">
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">Start Date</label>
                      <input
                        type="date"
                        value={customStartDate}
                        onChange={(e) => setCustomStartDate(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-gray-500 mb-1">End Date</label>
                      <input
                        type="date"
                        value={customEndDate}
                        onChange={(e) => setCustomEndDate(e.target.value)}
                        className="w-full rounded-md border-gray-300 shadow-sm focus:border-green-500 focus:ring-green-500 text-sm"
                      />
                    </div>
                    <button
                      onClick={applyCustomDateRange}
                      className="w-full bg-green-600 text-white py-2 px-3 rounded-md text-sm hover:bg-green-700 transition-colors flex items-center justify-center mt-2"
                    >
                      <Check size={14} className="mr-1" /> Apply Range
                    </button>
                  </div>
                )}
              </div>
              
              <div className="border-t border-gray-200 pt-4 mt-4">
                <div className="bg-blue-50 p-3 rounded-md border border-blue-100">
                  <p className="text-xs text-blue-700">
                    Reports are generated based on your financial data from {startDate} to {endDate}.
                  </p>
                </div>
              </div>
            </div>
            
            {/* Main Content */}
            <div className="flex-1">
              {/* Current Report */}
              <div className="mb-4">
                {renderReportContent()}
              </div>
              
              {/* Additional Insights */}
              <div className="bg-white p-6 rounded-lg shadow">
                <h3 className="text-lg font-semibold mb-4">Additional Insights</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <TrendingUp className="text-purple-600 mr-2" size={18} />
                      Spending Pattern
                    </h4>
                    <p className="text-sm text-gray-700">
                      Your highest spending days are typically on weekends, with an average of $142.50 more spent compared to weekdays.
                    </p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg border border-yellow-100">
                    <h4 className="text-md font-medium mb-2 flex items-center">
                      <Zap className="text-yellow-600 mr-2" size={18} />
                      Recommendation
                    </h4>
                    <p className="text-sm text-gray-700">
                      Consider setting aside 15% more for your "Emergency Fund" to reach your target goal by the end of the year.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
};

export default Reports;