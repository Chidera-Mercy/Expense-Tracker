import React, { useState, useEffect } from 'react';
import { 
  Plus, 
  Edit, 
  Trash2, 
  ChevronDown, 
  X, 
  Check, 
  RefreshCw,
  PieChart,
  AlertTriangle,
  Notebook
} from 'lucide-react';
import { 
  fetchBudgets,
  filterBudgetsByMonth, 
  filterBudgetsByQuarter,
  filterBudgetsByYear,
  calculateBudgetSummary,
  getPeriodOptions,
  getCurrentPeriod,
  createBudget, 
  updateBudget, 
  deleteBudget
} from '../db/budgets.js';
import { saveCategory, deleteCategory } from '../db/category.js';
import supabase from '../db/supabase.js';
import { useCurrency } from '../CurrencyContext.jsx';
import CategoryModal from '../components/CategoryModal.jsx';

const Budgets = () => {
  // State management
  const { formatAmount, symbol } = useCurrency();

  const [showAddBudget, setShowAddBudget] = useState(false);
  const [showEditBudget, setShowEditBudget] = useState(false);
  const [showCategoryModal, setShowCategoryModal] = useState(false);

  const [allBudgets, setAllBudgets] = useState([]); // All budgets fetched from database
  const [filteredBudgets, setFilteredBudgets] = useState([]); // Filtered budgets based on period
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
    amount: '',
    month: new Date().getMonth().toString(), // Set default to current month
    year: new Date().getFullYear().toString(), // Set default to current year
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
  }, []);

  // Filter budgets when period or periodType changes
  useEffect(() => {
    if (allBudgets.length > 0) {
      filterBudgetsByPeriod();
    }
  }, [allBudgets, currentPeriod, periodType]);

  // Load budget data
  const loadBudgets = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await fetchBudgets();
      if (error) throw error;
      
      setAllBudgets(data || []);
      
    } catch (err) {
      console.error("Error loading budgets:", err);
      setError("Failed to load budget data. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  // Filter budgets based on selected period and calculate summary
  const filterBudgetsByPeriod = () => {
    let filtered = [];
    
    if (periodType === 'monthly') {
      filtered = filterBudgetsByMonth(allBudgets, currentPeriod);
    } else if (periodType === 'quarterly') {
      filtered = filterBudgetsByQuarter(allBudgets, currentPeriod);
    } else if (periodType === 'yearly') {
      filtered = filterBudgetsByYear(allBudgets, currentPeriod);
    }
    
    setFilteredBudgets(filtered);
    
    // Calculate budget summary for the filtered budgets
    const summary = calculateBudgetSummary(filtered);
    setBudgetSummary(summary);
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
    const options = periodOptions[periodType] || [];
    const currentIndex = options.indexOf(currentPeriod);
    if (currentIndex > 0) {
      setCurrentPeriod(options[currentIndex - 1]);
    }
  };

  // Navigate to next period
  const goToNextPeriod = () => {
    const options = periodOptions[periodType] || [];
    const currentIndex = options.indexOf(currentPeriod);
    if (currentIndex < options.length - 1) {
      setCurrentPeriod(options[currentIndex + 1]);
    }
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
      // Calculate period start and end dates directly from month and year in newBudget
      const { periodStart, periodEnd } = getPeriodDates(newBudget.month, newBudget.year);
      
      // Check if a budget already exists for this category and period
      const existingBudget = allBudgets.find(budget => 
        budget.category_id === newBudget.category_id && 
        new Date(budget.period_start).getTime() === new Date(periodStart).getTime()
      );
      
      if (existingBudget) {
        // Alert user and stop the function execution
        window.alert("A budget for this category and period already exists.");
        return;
      }
      
      const budgetData = {
        category_id: newBudget.category_id,
        amount: parseFloat(newBudget.amount),
        period_start: periodStart,
        period_end: periodEnd,
        rollover: newBudget.rollover,
        enable_alerts: newBudget.enable_alerts,
        notes: newBudget.notes
      };
      
      const { data, error } = await createBudget(budgetData);
      if (error) throw error;
      
      // Reset form and refresh budgets
      setNewBudget({
        category_id: '',
        amount: '',
        month: new Date().getMonth().toString(), // Set default to current month
        year: new Date().getFullYear().toString(), // Set default to current year
        rollover: false,
        enable_alerts: true,
        notes: ''
      });
  
      await loadBudgets();
      filterBudgetsByPeriod();
      setShowAddBudget(false);
      
    } catch (err) {
      console.error("Error creating budget:", err);
      setError("Failed to create budget. Please try again.");
    }
  };
  

  // Open edit budget modal
  const handleEditBudgetClick = (budget) => {
    // Extract month and year from period_start
    const startDate = new Date(budget.period_start);
    const month = startDate.getMonth();
    const year = startDate.getFullYear();

    // Add month and year into the budget object before setting it
    const budgetWithPeriod = {
      ...budget,
      month,
      year,
    };
    setEditingBudget(budgetWithPeriod);
    setShowEditBudget(true);
  };

  // Submit budget update
  const handleUpdateBudget = async (e) => {
    e.preventDefault();    
    try {
      const { periodStart, periodEnd } = getPeriodDates(editingBudget.month, editingBudget.year);
      
      const budgetData = {
        category_id: editingBudget.category_id,
        amount: parseFloat(editingBudget.amount),
        period_start: periodStart,
        period_end: periodEnd,
        rollover: editingBudget.rollover,
        enable_alerts: editingBudget.enable_alerts,
        notes: editingBudget.notes
      };
      
      const { data, error } = await updateBudget(editingBudget.id, budgetData);
      if (error) throw error;
      
      await loadBudgets();
      filterBudgetsByPeriod();
      setShowEditBudget(false);
      setEditingBudget(null);
      
    } catch (err) {
      console.error("Error updating budget:", err);
      setError("Failed to update budget. Please try again.");
    }
  };

  const handleDeleteClick = (id) => {
    if (window.confirm("Are you sure you want to delete this budget? This action cannot be undone.")) {
      handleConfirmDelete(id);
    }
  };

  // Confirm budget deletion
  const handleConfirmDelete = async (id = deleteTargetId) => {
    try {
      const { error } = await deleteBudget(id);
      if (error) throw error;
      await loadBudgets();
      filterBudgetsByPeriod();
    } catch (err) {
      console.error("Error deleting budget:", err);
      setError("Failed to delete budget. Please try again.");
    }
  };

  const handleSaveCategory = async (categoryData) => {
    try {
      const savedCategory = await saveCategory(categoryData, 'categories');
      
      // Update local state based on whether it's an edit or create
      if (categoryData.id) {
        // Update existing category
        setCategories(prevCategories =>
          prevCategories.map(cat => 
            cat.id === savedCategory.id ? savedCategory : cat
          )
        );
      } else {
        // Add new category
        setCategories(prevCategories => [...prevCategories, savedCategory]);
      }
      
      return savedCategory;
    } catch (err) {
      console.error('Error saving expense category:', err);
      throw err;
    }
  };

  const handleDeleteCategory = async (categoryId) => {
    try {
      await deleteCategory(categoryId, 'categories');
      
      // Remove the deleted category from state
      setCategories(prevCategories => 
        prevCategories.filter(cat => cat.id !== categoryId)
      );
      // Remove the budgets with deleted category from state
      setAllBudgets(prevBudgets => 
        prevBudgets.filter(budget => budget.category_id !== categoryId)
      );
    } catch (err) {
      console.error('Error deleting expense category:', err);
      throw err;
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
    <div className="flex-1 overflow-auto bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <header className="bg-white p-6 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Budget Management
          <span className="ml-2 text-sm font-normal text-gray-500">Plan your budgets</span>
          </h1>

          <div className='flex gap-4'>
            <button 
              onClick={() => setShowAddBudget(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors duration-200"
            >
              <span>Create Budget</span>
            </button>

            <button 
              onClick={() => setShowCategoryModal(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors duration-200"
            >
              <span>Manage Categories</span>
            </button>
            </div>

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
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 mb-1">Total Budget ({currentPeriod})</div>
            <div className="text-2xl font-semibold">{formatAmount(budgetSummary.totalAllocated.toFixed(2))}</div>
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
          
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
            <div className="text-sm text-gray-500 mb-1">Total Spent</div>
            <div className="text-2xl font-semibold">{formatAmount(budgetSummary.totalSpent.toFixed(2))}</div>
            <div className="flex items-center text-sm mt-1 text-gray-500">
              <span>{formatAmount(budgetSummary.totalRemaining.toFixed(2))} remaining</span>
            </div>
          </div>
          
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
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
        {!isLoading && filteredBudgets.length === 0 && (
          <div className="text-center p-12 bg-white rounded-lg shadow-md border border-gray-100">
            <div className="flex flex-col items-center justify-center">
              <div className="bg-emerald-50 p-4 rounded-full mb-4">
                <PieChart className="h-12 w-12 text-emerald-500" />
              </div>
              <h3 className="text-xl font-semibold text-gray-800 mb-2">No budgets found for this period</h3>
              <p className="text-gray-500 max-w-md mx-auto mb-6">
                Create your first budget to start tracking your spending and achieving your financial goals.
              </p>
              <button
                onClick={() => setShowAddBudget(true)}
                className="bg-emerald-600 hover:bg-emerald-700 text-white px-5 py-2 rounded-md flex items-center mx-auto shadow-sm transition-colors duration-200"
              >
                <Plus size={18} className="mr-2" />
                <span>Create Your First Budget</span>
              </button>
            </div>
          </div>
        )}

        {/* Budget cards */}
        {!isLoading && filteredBudgets.length > 0 && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredBudgets.map((budget) => (
              <div key={budget.id} className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-all border-l-4" style={{ borderLeftColor: getCategoryColor(budget.category_id).replace('bg-', '') }}>
              <div className="p-5">
                <div className="flex justify-between items-center mb-4">
                  <div className="flex items-center">
                      <span className={`w-2 h-12 rounded-full mr-3 ${getCategoryColor(budget.category_id)}`}></span>
                      <div className="flex flex-col">
                        <h3 className="font-semibold text-lg">{getCategoryName(budget.category_id)}</h3>
                        <div className="flex items-center gap-2">
                          <span className="text-sm text-gray-500">
                            {new Date(budget.period_start).toLocaleString('default', { month: 'long' })} {new Date(budget.period_start).getFullYear()}
                          </span>
                        </div>
                      </div>
                    </div>
                  <div className="flex space-x-2">
                    <button 
                      onClick={() => handleEditBudgetClick(budget)}
                      className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Edit size={16} />
                    </button>
                    <button 
                      onClick={() => handleDeleteClick(budget.id)}
                      className="p-2 text-gray-400 hover:text-red-600 hover:bg-gray-100 rounded-full transition-colors"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
                
                <div className="mb-4">
                  <div className="flex justify-between mb-1">
                    <span className="text-2xl font-bold">{formatAmount(parseFloat(budget.amount).toFixed(2))}</span>
                    <span className={`text-sm py-1 px-2 rounded-full ${
                      budget.spent/budget.amount > 1 ? 'bg-red-100 text-red-700' : 
                      budget.spent/budget.amount > 0.9 ? 'bg-yellow-100 text-yellow-700' : 
                      'bg-emerald-100 text-emerald-700'
                    }`}>
                      {Math.round((budget.spent / parseFloat(budget.amount)) * 100)}%
                    </span>
                  </div>
                  
                  <div className="w-full bg-gray-100 rounded-full h-3 mb-3">
                    <div 
                      className={`h-3 rounded-full ${getBudgetProgressColor(budget.spent / budget.amount)}`} 
                      style={{ width: `${Math.min(100, (budget.spent / budget.amount) * 100)}%` }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <div className="flex items-center">
                    <span className="text-gray-600">{formatAmount(budget.spent.toFixed(2))} spent</span>
                  </div>
                  
                  <div>
                    {budget.remaining >= 0 ? (
                      <span className="text-emerald-600 font-medium">{formatAmount(budget.remaining.toFixed(2))} remaining</span>
                    ) : (
                      <span className="text-red-600 font-medium">{formatAmount(Math.abs(budget.remaining).toFixed(2))} over budget</span>
                    )}
                  </div>
                </div>

                {/* Additional budget details */}
                <div className="mt-3 pt-3 border-t border-gray-100">
                  {budget.notes && (
                      <div className="mb-2 text-sm text-gray-500 flex items-start">
                        <Notebook size={16} className="mr-1 mt-[2px]" />
                        <span>
                          {budget.notes.length > 50
                            ? budget.notes.substring(0, 50) + '...'
                            : budget.notes}
                        </span>
                      </div>
                    )}
                    
                  <div className="flex flex-wrap gap-2">
                    {budget.rollover && (
                      <span className="px-2 py-1 bg-blue-50 text-blue-700 text-xs rounded-md flex items-center">
                        <RefreshCw size={12} className="mr-1" /> Rollover
                      </span>
                    )}
                    {budget.enable_alerts && (
                      <span className="px-2 py-1 bg-amber-50 text-amber-700 text-xs rounded-md flex items-center">
                        <AlertTriangle size={12} className="mr-1" /> Alerts Enabled
                      </span>
                    )}
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
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowAddBudget(false)}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Create New Budget
                      </h3>
                      <button
                        type="button"
                        onClick={() => setShowAddBudget(false)}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X size={20} />
                      </button>
                    </div>
            
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-sm">
                            {symbol}
                          </span>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Period</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <select
                              name="month"
                              value={newBudget.month || new Date().getMonth()}
                              onChange={handleBudgetInputChange}
                              className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                              required
                            >
                              <option value="0">January</option>
                              <option value="1">February</option>
                              <option value="2">March</option>
                              <option value="3">April</option>
                              <option value="4">May</option>
                              <option value="5">June</option>
                              <option value="6">July</option>
                              <option value="7">August</option>
                              <option value="8">September</option>
                              <option value="9">October</option>
                              <option value="10">November</option>
                              <option value="11">December</option>
                            </select>
                          </div>
                          <div>
                            <select
                              name="year"
                              value={newBudget.year || new Date().getFullYear()}
                              onChange={handleBudgetInputChange}
                              className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                              required
                            >
                              {/* Generate 3 years in the past and 3 years in the future */}
                              {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Select the month and year for this budget.
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
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleCreateBudget}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Check size={16} className="mr-1" />
                  Create Budget
                </button>
                
                <button
                  type="button"
                  onClick={() => setShowAddBudget(false)}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Budget Modal */}
      {showEditBudget && editingBudget && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => {
                setShowEditBudget(false);
                setEditingBudget(null);
              }}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Edit Budget
                      </h3>
                      <button
                        type="button"
                        onClick={() => {
                          setShowEditBudget(false);
                          setEditingBudget(null);
                        }}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X size={20} />
                      </button>
                    </div>
            
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Amount</label>
                        <div className="relative rounded-md shadow-sm">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                          <span className="text-gray-400 text-sm">
                            {symbol}
                          </span>
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
                        <label className="block text-sm font-medium text-gray-700 mb-1">Budget Period</label>
                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <select
                              name="month"
                              value={editingBudget.month || new Date().getMonth()}
                              onChange={handleBudgetInputChange}
                              className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                              required
                            >
                              <option value="0">January</option>
                              <option value="1">February</option>
                              <option value="2">March</option>
                              <option value="3">April</option>
                              <option value="4">May</option>
                              <option value="5">June</option>
                              <option value="6">July</option>
                              <option value="7">August</option>
                              <option value="8">September</option>
                              <option value="9">October</option>
                              <option value="10">November</option>
                              <option value="11">December</option>
                            </select>
                          </div>
                          <div>
                            <select
                              name="year"
                              value={editingBudget.year || new Date().getFullYear()}
                              onChange={handleBudgetInputChange}
                              className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                              required
                            >
                              {/* Generate 3 years in the past and 3 years in the future */}
                              {Array.from({ length: 7 }, (_, i) => new Date().getFullYear() - 3 + i).map(year => (
                                <option key={year} value={year}>{year}</option>
                              ))}
                            </select>
                          </div>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Select the month and year for this budget.
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
                    </form>
                  </div>
                </div>
              </div>
              
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                <button
                  type="button"
                  onClick={handleUpdateBudget}
                  className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  <Check size={16} className="mr-1" />
                  Update Budget
                </button>
                
                <button
                  type="button"
                  onClick={() => {
                    setShowEditBudget(false);
                    setEditingBudget(null);
                  }}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Categories Modal */}
      <CategoryModal
        showModal={showCategoryModal}
        closeModal={() => setShowCategoryModal(false)}
        categories={categories}
        onSaveCategory={handleSaveCategory}
        onDeleteCategory={handleDeleteCategory}
        type="expense" // Using shared expense categories for income too
      />
    </div>
  );
};

// Helper function to get budget progress color
const getBudgetProgressColor = (ratio) => {
  if (ratio > 1) return 'bg-red-500';
  if (ratio > 0.9) return 'bg-yellow-500';
  return 'bg-emerald-500';
};

// Helper function to calculate period start and end dates
const getPeriodDates = (monthIndex, year) => {
  // Convert to numbers
  const month = parseInt(monthIndex);
  const yearNum = parseInt(year);
  
  // Start date is first day of month
  const periodStart = new Date(yearNum, month, 1);
  
  // End date is last day of month
  const periodEnd = new Date(yearNum, month + 1, 0);
  
  return {
    periodStart: periodStart.toISOString().split('T')[0], // Format: YYYY-MM-DD
    periodEnd: periodEnd.toISOString().split('T')[0] // Format: YYYY-MM-DD
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