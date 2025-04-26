import React, { useState, useEffect } from 'react';
import { 
  Search, Filter, Plus, Calendar, Download, 
  Edit, Trash2, ArrowUpDown, ChevronDown, 
  MoreHorizontal, X, Check, DollarSign, 
  BarChart2, RefreshCw, Repeat, PieChart,
  AlertTriangle
} from 'lucide-react';
import { 
  fetchBudgets, 
  createBudget, 
  updateBudget, 
  deleteBudget, 
  getBudgetSummary,
  getPeriodOptions, 
  getCurrentPeriod,
  getNextPeriod,
  getPreviousPeriod
} from '../db/budgets.js';
import supabase from '../db/supabase.js';

const Budgets = () => {
  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [showDeleteConfirmation, setShowDeleteConfirmation] = useState(false);
  const [budgets, setBudgets] = useState([]);
  const [categories, setCategories] = useState([]);
  const [periodType, setPeriodType] = useState('monthly');
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod('monthly'));
  const [periodOptions, setPeriodOptions] = useState({});
  const [budgetSummary, setBudgetSummary] = useState({
    totalAllocated: 0,
    totalSpent: 0,
    totalRemaining: 0,
    spendingPercentage: 0,
    budgetStatus: 'Loading'
  });
  const [editingBudget, setEditingBudget] = useState(null);
  const [deleteTargetId, setDeleteTargetId] = useState(null);
  const [newBudget, setNewBudget] = useState({
    category_id: '',
    name: '',
    amount: '',
    period_type: 'monthly',
    rollover: false,
    enable_alerts: true,
    notes: ''
  });
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load budgets and categories on component mount and when period changes
  useEffect(() => {
    loadBudgets();
    loadCategories();
    loadPeriodOptions();
  }, [currentPeriod, periodType]);

  // Load budget data
  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchBudgets(currentPeriod);
      if (error) throw error;
      
      setBudgets(data || []);
      
      // Load budget summary
      const summary = await getBudgetSummary(currentPeriod);
      if (summary.error) throw summary.error;
      
      setBudgetSummary(summary);
    } catch (err) {
      console.error("Error loading budgets:", err);
      setError("Failed to load budget data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Load user categories
  const loadCategories = async () => {
    try {
      const { data, error } = await supabase
        .from('categories')
        .select('*')
        .order('name');
      
      if (error) throw error;
      setCategories(data || []);
    } catch (err) {
      console.error("Error loading categories:", err);
    }
  };

  // Load period options
  const loadPeriodOptions = () => {
    const options = getPeriodOptions();
    setPeriodOptions(options);
  };

  // Handle period type change
  const handlePeriodTypeChange = (type) => {
    setPeriodType(type);
    setCurrentPeriod(getCurrentPeriod(type));
  };

  // Navigate to previous period
  const goToPreviousPeriod = () => {
    const previousPeriod = getPreviousPeriod(currentPeriod, periodType);
    setCurrentPeriod(previousPeriod);
  };

  // Navigate to next period
  const goToNextPeriod = () => {
    const nextPeriod = getNextPeriod(currentPeriod, periodType);
    setCurrentPeriod(nextPeriod);
  };

  // Handle budget form input change
  const handleBudgetInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const val = type === 'checkbox' ? checked : value;

    if (showEditBudget) {
      setEditingBudget({
        ...editingBudget,
        [name]: val
      });
    } else {
      setNewBudget({
        ...newBudget,
        [name]: val
      });
    }
  };

  // Submit new budget
  const handleCreateBudget = async (e) => {
    e.preventDefault();
    
    try {
      // Calculate period start and end dates based on currentPeriod
      const { periodStart, periodEnd } = getPeriodDates(currentPeriod);
      
      const budgetData = {
        ...newBudget,
        amount: parseFloat(newBudget.amount),
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd
      };
      
      const { data, error } = await createBudget(budgetData);
      if (error) throw error;
      
      // Reset form and refresh budgets
      setNewBudget({
        category_id: '',
        name: '',
        amount: '',
        period_type: 'monthly',
        rollover: false,
        enable_alerts: true,
        notes: ''
      });
      setShowAddBudget(false);
      await loadBudgets();
    } catch (err) {
      console.error("Error creating budget:", err);
      setError("Failed to create budget. Please try again.");
    }
  };

  // Open edit budget modal
  const handleEditBudgetClick = (budget) => {
    setEditingBudget(budget);
    setShowEditBudget(true);
  };

  // Submit budget update
  const handleUpdateBudget = async (e) => {
    e.preventDefault();
    
    try {
      const { periodStart, periodEnd } = getPeriodDates(currentPeriod);
      
      const budgetData = {
        ...editingBudget,
        amount: parseFloat(editingBudget.amount),
        period_type: periodType,
        period_start: periodStart,
        period_end: periodEnd
      };
      
      const { data, error } = await updateBudget(editingBudget.id, budgetData);
      if (error) throw error;
      
      setShowEditBudget(false);
      setEditingBudget(null);
      await loadBudgets();
    } catch (err) {
      console.error("Error updating budget:", err);
      setError("Failed to update budget. Please try again.");
    }
  };

  // Open delete confirmation
  const handleDeleteClick = (id) => {
    setDeleteTargetId(id);
    setShowDeleteConfirmation(true);
  };

  // Confirm budget deletion
  const handleConfirmDelete = async () => {
    try {
      const { error } = await deleteBudget(deleteTargetId);
      if (error) throw error;
      
      setShowDeleteConfirmation(false);
      setDeleteTargetId(null);
      await loadBudgets();
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError("Failed to delete budget. Please try again.");
    }
  };

  // Get color for budget progress bar
  const getBudgetProgressColor = (ratio) => {
    if (ratio > 1) return 'bg-red-500';
    if (ratio > 0.9) return 'bg-yellow-500';
    return 'bg-emerald-500';
  };

  // Get color for category
  const getCategoryColor = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.color || 'bg-gray-500';
  };

  // Get category name
  const getCategoryName = (categoryId) => {
    const category = categories.find(cat => cat.id === categoryId);
    return category?.name || 'Uncategorized';
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 border-b shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Budget Management</h1>
          <button 
            onClick={() => setShowAddBudget(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-1" />
            <span>Create Budget</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="p-6">
        {/* Error message */}
        {error && (
          <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded flex items-center">
            <AlertTriangle size={20} className="mr-2" />
            <span>{error}</span>
            <button className="ml-auto" onClick={() => setError(null)}>
              <X size={16} />
            </button>
          </div>
        )}

        {/* Budget summary */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 mb-1">Total Budget ({currentPeriod})</div>
            <div className="text-2xl font-semibold">${budgetSummary.totalAllocated.toFixed(2)}</div>
            <div className="flex items-center text-sm mt-2">
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div 
                  className={`${getBudgetProgressColor(budgetSummary.spendingPercentage / 100)} h-2 rounded-full`} 
                  style={{ width: `${Math.min(100, budgetSummary.spendingPercentage)}%` }}
                ></div>
              </div>
              <span className="ml-2 text-gray-600">{Math.round(budgetSummary.spendingPercentage)}%</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 mb-1">Total Spent</div>
            <div className="text-2xl font-semibold">${budgetSummary.totalSpent.toFixed(2)}</div>
            <div className="flex items-center text-sm mt-1 text-gray-500">
              <span>${budgetSummary.totalRemaining.toFixed(2)} remaining</span>
            </div>
          </div>
          
          <div className="bg-white rounded-lg shadow-sm p-4">
            <div className="text-sm text-gray-500 mb-1">Budget Status</div>
            <div className={`text-2xl font-semibold ${
              budgetSummary.budgetStatus === 'Over Budget' ? 'text-red-600' :
              budgetSummary.budgetStatus === 'At Risk' ? 'text-yellow-600' :
              'text-emerald-600'
            }`}>
              {budgetSummary.budgetStatus}
            </div>
            <div className="flex items-center text-sm mt-1 text-gray-500">
              <span>
                {budgetSummary.spendingPercentage > 100
                  ? `${(budgetSummary.spendingPercentage - 100).toFixed(0)}% over projected spending`
                  : `${(100 - budgetSummary.spendingPercentage).toFixed(0)}% below projected spending`
                }
              </span>
            </div>
          </div>
        </div>

        {/* Period selector */}
        <div className="flex justify-between items-center mb-6">
          <div className="flex items-center space-x-2">
            <button 
              onClick={goToPreviousPeriod}
              className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              <ChevronDown className="h-5 w-5 rotate-90" />
            </button>
            <h2 className="text-lg font-medium">{currentPeriod}</h2>
            <button 
              onClick={goToNextPeriod}
              className="p-1 rounded bg-gray-200 text-gray-600 hover:bg-gray-300"
            >
              <ChevronDown className="h-5 w-5 -rotate-90" />
            </button>
          </div>
          
          <div className="flex space-x-3">
            <button 
              onClick={() => handlePeriodTypeChange('monthly')}
              className={`text-sm font-medium ${periodType === 'monthly' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Monthly
            </button>
            <button 
              onClick={() => handlePeriodTypeChange('quarterly')}
              className={`text-sm font-medium ${periodType === 'quarterly' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Quarterly
            </button>
            <button 
              onClick={() => handlePeriodTypeChange('yearly')}
              className={`text-sm font-medium ${periodType === 'yearly' ? 'text-emerald-600' : 'text-gray-500 hover:text-gray-700'}`}
            >
              Yearly
            </button>
          </div>
        </div>

        {/* Loading indicator */}
        {isLoading && (
          <div className="flex justify-center items-center p-12">
            <RefreshCw size={24} className="animate-spin text-emerald-600" />
            <span className="ml-2 text-emerald-600">Loading budgets...</span>
          </div>
        )}

        {/* No budgets message */}
        {!isLoading && budgets.length === 0 && (
          <div className="text-center p-12 bg-white rounded-lg shadow-sm">
            <div className="text-lg font-medium text-gray-700 mb-2">No budgets found for this period</div>
            <p className="text-gray-500">
              Create a budget to start tracking your spending against your financial goals.
            </p>
            <button
              onClick={() => setShowAddBudget(true)}
              className="mt-4 bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center mx-auto"
            >
              <Plus size={18} className="mr-1" />
              <span>Create Your First Budget</span>
            </button>
          </div>
        )}

        {/* Budget cards */}
        {!isLoading && budgets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {budgets.map((budget) => (
              <div key={budget.id} className="bg-white rounded-lg shadow-sm overflow-hidden">
                <div className="p-4">
                  <div className="flex justify-between items-center mb-3">
                    <div className="flex items-center">
                      <span className={`w-3 h-3 rounded-full mr-2 ${getCategoryColor(budget.category_id)}`}></span>
                      <h3 className="font-medium text-gray-900">{budget.name || getCategoryName(budget.category_id)}</h3>
                    </div>
                    <div className="flex space-x-2">
                      <button 
                        onClick={() => handleEditBudgetClick(budget)}
                        className="text-gray-400 hover:text-gray-600"
                      >
                        <Edit size={16} />
                      </button>
                      <button 
                        onClick={() => handleDeleteClick(budget.id)}
                        className="text-gray-400 hover:text-red-600"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  
                  <div className="flex justify-between text-sm text-gray-500 mb-1">
                    <span>${budget.spent.toFixed(2)} spent</span>
                    <span>${parseFloat(budget.amount).toFixed(2)} allocated</span>
                  </div>
                  
                  <div className="w-full bg-gray-200 rounded-full h-2 mb-2">
                    <div 
                      className={`h-2 rounded-full ${getBudgetProgressColor(budget.spent / budget.amount)}`} 
                      style={{ width: `${Math.min(100, (budget.spent / budget.amount) * 100)}%` }}
                    ></div>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div className="text-sm">
                      {budget.remaining >= 0 ? (
                        <span className="text-emerald-600">${budget.remaining.toFixed(2)} remaining</span>
                      ) : (
                        <span className="text-red-600">${Math.abs(budget.remaining).toFixed(2)} over budget</span>
                      )}
                    </div>
                    <div className="text-sm text-gray-500">
                    {Math.round((budget.spent / parseFloat(budget.amount)) * 100)}% of budget
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Add Budget Modal */}
      {showAddBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Create New Budget</h3>
              <button onClick={() => setShowAddBudget(false)} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleCreateBudget}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    name="category_id"
                    value={newBudget.category_id}
                    onChange={handleBudgetInputChange}
                    className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name (Optional)</label>
                  <input
                    type="text"
                    name="name"
                    value={newBudget.name}
                    onChange={handleBudgetInputChange}
                    placeholder="e.g., Monthly Groceries"
                    className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={newBudget.amount}
                      onChange={handleBudgetInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="pl-8 block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <div className="text-gray-700 py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                    {currentPeriod} ({periodType})
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Budget period is based on your current period selection.
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={newBudget.notes}
                    onChange={handleBudgetInputChange}
                    rows="2"
                    placeholder="Add notes about this budget"
                    className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="rollover"
                      name="rollover"
                      type="checkbox"
                      checked={newBudget.rollover}
                      onChange={handleBudgetInputChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="rollover" className="ml-2 block text-sm text-gray-700">
                      Roll over unspent budget to next period
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="enable_alerts"
                      name="enable_alerts"
                      type="checkbox"
                      checked={newBudget.enable_alerts}
                      onChange={handleBudgetInputChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="enable_alerts" className="ml-2 block text-sm text-gray-700">
                      Enable alerts when approaching budget limit
                    </label>
                  </div>
                </div>
                
                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => setShowAddBudget(false)}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <Check size={16} className="mr-1" />
                    Create Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditBudget && editingBudget && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
            <div className="flex justify-between items-center p-4 border-b">
              <h3 className="text-lg font-medium">Edit Budget</h3>
              <button onClick={() => {
                setShowEditBudget(false);
                setEditingBudget(null);
              }} className="text-gray-400 hover:text-gray-500">
                <X size={20} />
              </button>
            </div>
            
            <div className="p-6">
              <form onSubmit={handleUpdateBudget}>
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                  <select 
                    name="category_id"
                    value={editingBudget.category_id}
                    onChange={handleBudgetInputChange}
                    className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                    required
                  >
                    <option value="">Select a category</option>
                    {categories.map(category => (
                      <option key={category.id} value={category.id}>{category.name}</option>
                    ))}
                  </select>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Name (Optional)</label>
                  <input
                    type="text"
                    name="name"
                    value={editingBudget.name || ''}
                    onChange={handleBudgetInputChange}
                    placeholder="e.g., Monthly Groceries"
                    className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                  />
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                  <div className="relative rounded-md shadow-sm">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                      <DollarSign size={16} className="text-gray-400" />
                    </div>
                    <input
                      type="number"
                      name="amount"
                      value={editingBudget.amount}
                      onChange={handleBudgetInputChange}
                      placeholder="0.00"
                      step="0.01"
                      min="0"
                      className="pl-8 block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2"
                      required
                    />
                  </div>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Period</label>
                  <div className="text-gray-700 py-2 px-3 border border-gray-300 rounded-md bg-gray-50">
                    {currentPeriod} ({periodType})
                  </div>
                  <p className="text-xs text-gray-500 mt-1">
                    Budget period is based on your current period selection.
                  </p>
                </div>
                
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Notes (Optional)</label>
                  <textarea
                    name="notes"
                    value={editingBudget.notes || ''}
                    onChange={handleBudgetInputChange}
                    rows="2"
                    placeholder="Add notes about this budget"
                    className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                  ></textarea>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="edit-rollover"
                      name="rollover"
                      type="checkbox"
                      checked={editingBudget.rollover || false}
                      onChange={handleBudgetInputChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-rollover" className="ml-2 block text-sm text-gray-700">
                      Roll over unspent budget to next period
                    </label>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex items-center">
                    <input
                      id="edit-enable_alerts"
                      name="enable_alerts"
                      type="checkbox"
                      checked={editingBudget.enable_alerts || false}
                      onChange={handleBudgetInputChange}
                      className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                    />
                    <label htmlFor="edit-enable_alerts" className="ml-2 block text-sm text-gray-700">
                      Enable alerts when approaching budget limit
                    </label>
                  </div>
                </div>
                
                <div className="pt-3 border-t flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      setShowEditBudget(false);
                      setEditingBudget(null);
                    }}
                    className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 mr-2"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
                  >
                    <Check size={16} className="mr-1" />
                    Update Budget
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteConfirmation && (
        <div className="fixed inset-0 bg-black bg-opacity-30 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg shadow-xl w-full max-w-md p-6">
            <div className="flex items-center mb-4">
              <AlertTriangle size={24} className="text-red-500 mr-3" />
              <h3 className="text-lg font-medium text-gray-900">Delete Budget</h3>
            </div>
            
            <p className="text-gray-700 mb-6">
              Are you sure you want to delete this budget? This action cannot be undone.
            </p>
            
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeleteConfirmation(false)}
                className="bg-white py-2 px-4 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500"
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmDelete}
                className="inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

// Helper function to get budget progress color
const getBudgetProgressColor = (ratio) => {
  if (ratio > 1) return 'bg-red-500';
  if (ratio > 0.9) return 'bg-yellow-500';
  return 'bg-emerald-500';
};

// Helper function to get period dates
const getPeriodDates = (period) => {
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

// Get month index from name
const getMonthIndex = (monthName) => {
  const months = [
    'January', 'February', 'March', 'April', 'May', 'June', 
    'July', 'August', 'September', 'October', 'November', 'December'
  ];
  return months.findIndex(m => m.startsWith(monthName));
};

export default Budgets;