import React, { useState, useEffect } from 'react';
import { 
  Search,
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  Receipt, 
  ArrowUpDown, 
  ChevronDown,
  X, 
  Check, 
  DollarSign, 
  Image, 
  AlertCircle, 
  FileText
} from 'lucide-react';

import { 
  fetchExpenses, 
  calculateExpenseSummary,
  fetchCategories, 
  getPeriodOptions,
  getCurrentPeriod,
  getPeriodDates,
  getPreviousPeriod,
  addExpense, 
  updateExpense, 
  deleteExpense,
  uploadReceipt,
  exportExpensesToCSV 
} from '../db/expenses';

import { saveCategory, deleteCategory } from '../db/category';
import { useCurrency } from '../CurrencyContext';
import { UserAuth } from '../AuthContext';
import ReceiptModal from '../components/ReceiptModal';
import CategoryModal from '../components/CategoryModal';


const Expenses = () => {
  // State management
  const {formatAmount, symbol} = useCurrency();
  const {user} = UserAuth();
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [allExpenses, setAllExpenses] = useState([]);
  const [filteredExpenses, setFilteredExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [periodType, setPeriodType] = useState('monthly');
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod('monthly'));
  const [periodOptions, setPeriodOptions] = useState({});
  const [summary, setSummary] = useState({
    totalExpenses: 0,
    recurringExpenses: 0,
    recurringPercentage: 0,
    averageMonthlyExpenses: 0,
    growthPercentage: 0
  });
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    category_id: '',
    description: '',
    is_recurring: false,
    receipt: null
  });
  // Applied filters
  const [searchTerm, setSearchTerm] = useState('');
  const [appliedFilters, setAppliedFilters] = useState({
    page: 1,
    limit: 10
  });
  const [loading, setLoading] = useState(true);
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [showReceiptModal, setShowReceiptModal] = useState(false);
  const [selectedReceiptUrl, setSelectedReceiptUrl] = useState('');



  const openReceiptModal = (receiptUrl) => {
    setSelectedReceiptUrl(receiptUrl);
    setShowReceiptModal(true);
  };
  const closeReceiptModal = () => {
    setShowReceiptModal(false);
  };
  
  // Fetch expenses data and summary on component mount and when period changes
  useEffect(() => {
    loadExpenses();
    loadCategories();
    loadPeriodOptions();
  }, []);

  // Filter expenses when period or periodType changes
  useEffect(() => {
    if (allExpenses.length > 0) {
      filterExpensesByPeriod();
    }
  }, [allExpenses, currentPeriod, periodType]);

  // Functions expenses data
  const loadExpenses = async () => {
    setLoading(true);
    try {

      const { data, count, page } = await fetchExpenses(appliedFilters);
      setAllExpenses(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    setLoading(true);
    try {
      const data = await fetchCategories(user.id);
      setCategories(data);

    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };

  // Filter expenses based on selected period and calculate summary
  const filterExpensesByPeriod = () => {
    let currentData = [];
    let previousData = [];
    
    // Get period dates for current period
    const { periodStart, periodEnd } = getPeriodDates(currentPeriod);
    
    // Get previous period
    const previousPeriod = getPreviousPeriod(currentPeriod, periodType);
    const { periodStart: prevStart, periodEnd: prevEnd } = getPeriodDates(previousPeriod);
    
    // Filter expenses for current period
    currentData = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(periodStart) && expenseDate <= new Date(periodEnd);
    });
    
    // Filter expenses for previous period
    previousData = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(prevStart) && expenseDate <= new Date(prevEnd);
    });
    
    // Set filtered expenses for display (current period)
    setFilteredExpenses(currentData);
    
    // Calculate expense summary using both current and previous data
    const summary = calculateExpenseSummary(currentData, previousData, currentPeriod, periodType);
    console.log(summary)
    setSummary(summary);
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

  // Handlers for the expense form
  const handleFormChange = (e) => {
    const { name, value, type, checked, files } = e.target;
    
    if (type === 'checkbox') {
      setFormData({
        ...formData,
        [name]: checked
      });
    } else if (type === 'file' && files.length > 0) {
      setFormData({
        ...formData,
        receipt: files[0]
      });
    } else {
      setFormData({
        ...formData,
        [name]: value
      });
    }
  };
  
  // Handle edit expense
  const handleEditExpense = (expense) => {
    setEditingExpenseId(expense.id);
    setFormData({
      amount: expense.amount.toString(),
      date: expense.date,
      merchant: expense.merchant,
      category_id: expense.category_id || '',
      description: expense.description || '',
      is_recurring: expense.status === 'recurring',
      receipt: null
    });
    setCurrentStep(1);
    setShowEditExpense(true);
  };
  
  const handleNextStep = () => {
    setCurrentStep(currentStep + 1);
  };
  
  const handlePrevStep = () => {
    setCurrentStep(currentStep - 1);
  };
  
  const resetForm = () => {
    setFormData({
      amount: '',
      date: new Date().toISOString().split('T')[0],
      merchant: '',
      category_id: '',
      description: '',
      is_recurring: false,
      receipt: null
    });
    setCurrentStep(1);
    setEditingExpenseId(null);
  };
  
  const closeModal = () => {
    setShowAddExpense(false);
    setShowEditExpense(false);
    resetForm();
  };

  // Handle search input changes
  const handleSearch = (e) => {
    const term = e.target.value.toLowerCase();
    setSearchTerm(term);
    
    // If search term is empty, show all filtered expenses for the current period
    if (!term.trim()) {
      // Re-run the period filter to reset to the current period view
      filterExpensesByPeriod();
      return;
    }
    
    // Get current period data first (maintain period filtering)
    const { periodStart, periodEnd } = getPeriodDates(currentPeriod);
    const periodFiltered = allExpenses.filter(expense => {
      const expenseDate = new Date(expense.date);
      return expenseDate >= new Date(periodStart) && expenseDate <= new Date(periodEnd);
    });
    
    // Then apply search filtering on top of period filtering
    const searchFiltered = periodFiltered.filter(expense => {
      // Check if the term matches any of the three fields
      // Handle potential undefined values safely
      const categoryMatch = expense.categories?.name?.toLowerCase().includes(term) || false;
      const merchantMatch = expense.merchant?.toLowerCase().includes(term) || false;
      const descriptionMatch = expense.description?.toLowerCase().includes(term) || false;
      
      return categoryMatch || merchantMatch || descriptionMatch;
    });
    
    // Update the filtered expenses with search results
    setFilteredExpenses(searchFiltered);
  };
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);

      // Validate form data
    if (!formData.amount || !formData.date || !formData.merchant) {
      alert('Please fill all required fields');
      return;
    }
      
      // Create expense object
      const expenseData = {
        amount: parseFloat(formData.amount),
        date: formData.date,
        merchant: formData.merchant,
        category_id: formData.category_id || null,
        description: formData.description,
        is_recurring: formData.is_recurring,
        status: formData.is_recurring ? 'recurring' : 'completed'
      };
      
      // Handle receipt upload if present
      if (formData.receipt) {
        const receiptUrl = await uploadReceipt(formData.receipt);
        expenseData.receipt_url = receiptUrl;
      }
      
      if (showEditExpense && editingExpenseId) {
        // Update existing expense
        await updateExpense(editingExpenseId, expenseData);
      } else {
        // Add new expense
        await addExpense(expenseData);
      }

      // Refresh data
      await loadExpenses();
      filterExpensesByPeriod();
      // Close modal and reset form
      closeModal();
      
    } catch (error) {
      console.error('Error submitting expense:', error);
      alert('Error saving expense. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Handle delete
  const handleDeleteExpense = async (expenseId) => {
    // Confirm delete
    if (window.confirm('Are you sure you want to delete this expense?')) {
      try {
        setLoading(true);
        await deleteExpense(expenseId);
        
        // Refresh data
        await loadExpenses();
        filterExpensesByPeriod();
      
      } catch (error) {
        console.error('Error deleting expense:', error);
        alert('Error deleting expense. Please try again.');
      } finally {
        setLoading(false);
      }
    }
  };

  // Handle pagination
  const handlePageChange = (newPage) => {
    setAppliedFilters(prevFilters => ({
      ...prevFilters,
      page: newPage
    }));
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
      // Remove the expenses with deleted category from state
      setAllExpenses(prevExpenses => 
        prevExpenses.filter(expense => expense.category_id !== categoryId)
      );
    } catch (err) {
      console.error('Error deleting expense category:', err);
      throw err;
    }
  };
  
  // Extract form steps into separate components for readability
  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
          <span className="text-gray-400 text-sm">
            {symbol}
          </span>
          </div>
          <input
            type="number"
            name="amount"
            value={formData.amount}
            onChange={handleFormChange}
            placeholder="0.00"
            step="0.01"
            required
            className="pl-8 block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2"
          />
        </div>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Date *</label>
        <input
          type="date"
          name="date"
          value={formData.date}
          onChange={handleFormChange}
          required
          className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
        />
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Merchant *</label>
        <input
          type="text"
          name="merchant"
          value={formData.merchant}
          onChange={handleFormChange}
          placeholder="Where did you spend?"
          required
          className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
        />
      </div>
      
      <div className="pt-4">
        <p className="text-xs text-gray-500">* Required fields</p>
      </div>
    </div>
  );
  
  const renderStep2 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
        <select
          name="category_id"
          value={formData.category_id}
          onChange={handleFormChange}
          className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
        >
          <option value="">Select a category</option>
          {categories.map((category) => (
            <option key={category.id} value={category.id}>{category.name}</option>
          ))}
        </select>
      </div>
      
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
        <textarea
          name="description"
          value={formData.description}
          onChange={handleFormChange}
          rows="3"
          placeholder="Add notes about this expense"
          className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
        ></textarea>
      </div>
      
      <div>
        <div className="flex items-center">
          <input
            id="recurring"
            name="is_recurring"
            type="checkbox"
            checked={formData.is_recurring}
            onChange={handleFormChange}
            className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
          />
          <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
            This is a recurring expense
          </label>
        </div>
      </div>
    </div>
  );
  
  const renderStep3 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Upload Receipt (Optional)</label>
        <div 
          className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-md ${
            formData.receipt ? 'border-emerald-300 bg-emerald-50' : 'border-gray-300'
          }`}
        >
          <div className="space-y-2 text-center">
            {formData.receipt ? (
              <div className="flex flex-col items-center">
                <Image size={24} className="mx-auto text-emerald-500" />
                <p className="text-sm text-emerald-600 font-medium">
                  {formData.receipt.name}
                </p>
                <p className="text-xs text-gray-500">
                  {(formData.receipt.size / 1024).toFixed(2)} KB
                </p>
                <button
                  type="button"
                  onClick={() => setFormData({ ...formData, receipt: null })}
                  className="mt-2 text-xs text-red-600 hover:text-red-800"
                >
                  Remove
                </button>
              </div>
            ) : (
              <>
                <Receipt size={24} className="mx-auto text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-upload"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-emerald-600 hover:text-emerald-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-emerald-500"
                  >
                    <span>Upload a file</span>
                    <input 
                      id="file-upload" 
                      name="receipt" 
                      type="file" 
                      onChange={handleFormChange}
                      accept="image/png,image/jpeg,application/pdf" 
                      className="sr-only" 
                    />
                  </label>
                  <p className="pl-1">or drag and drop</p>
                </div>
                <p className="text-xs text-gray-500">PNG, JPG, PDF up to 10MB</p>
              </>
            )}
          </div>
        </div>
      </div>
      
      <div className="mt-6">
        <h4 className="text-sm font-medium text-gray-700 mb-2">Expense Summary</h4>
        <div className="bg-gray-50 p-4 rounded-md space-y-2">
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Amount:</span>
            <span className="text-sm font-medium">{formatAmount(parseFloat(formData.amount || 0).toFixed(2))}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Date:</span>
            <span className="text-sm">{formData.date ? formatDate(formData.date) : 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Merchant:</span>
            <span className="text-sm">{formData.merchant || 'Not specified'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Category:</span>
            <span className="text-sm">
              {formData.category_id 
                ? categories.find(c => c.id === formData.category_id)?.name || 'Unknown'
                : 'Not specified'}
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-sm text-gray-500">Recurring:</span>
            <span className="text-sm">{formData.is_recurring ? 'Yes' : 'No'}</span>
          </div>
        </div>
      </div>
    </div>
  );
  
  // Define the modal steps
  const steps = [
    { 
      number: 1, 
      title: 'Basic Information', 
      component: renderStep1,
      icon: DollarSign
    },
    { 
      number: 2, 
      title: 'Additional Details', 
      component: renderStep2,
      icon: FileText
    },
    { 
      number: 3, 
      title: 'Receipt & Review', 
      component: renderStep3,
      icon: Receipt
    }
  ];

  // Handle export to CSV
  const handleExport = () => {
    
    const csvContent = exportExpensesToCSV(filteredExpenses);
      
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `expense_export_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
      
  };
  
  return (
    <div className="flex-1 overflow-auto bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <header className="bg-white p-6 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">
            Expenses
            <span className="ml-2 text-sm font-normal text-gray-500">Manage your spending</span>
          </h1>
          <div className='flex gap-4'>
            <button 
              onClick={() => setShowAddExpense(true)}
              className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors duration-200"
            >
              <Plus size={18} className="mr-1" />
              <span>Add Expense</span>
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
      <div className="p-6 flex-1 overflow-auto bg-gray-50 flex flex-col">

        {/* Income summary */}
        {loading ? (
          <div className="text-center py-6">Loading expense data...</div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-500 mb-1">Total Expenses ({currentPeriod})</div>
              <div className="text-2xl font-semibold">{formatAmount(summary.totalExpenses.toFixed(2))}</div>
              <div className="flex items-center text-sm mt-1">
                <span className={summary.growthPercentage >= 0 ? "text-green-600" : "text-red-600"}>
                  {summary.growthPercentage >= 0 ? "↑" : "↓"} {Math.abs(summary.growthPercentage).toFixed(1)}% from last {" "}
                  {
                    periodType === "monthly"
                      ? "month"
                      : periodType === "quaterly"
                      ? "quarter"
                      : "year"
                  }
                </span>
              </div>
            </div>
            
            <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-500 mb-1">Recurring Expenses</div>
              <div className="text-2xl font-semibold">{formatAmount(summary.recurringExpenses.toFixed(2))}</div>
              <div className="flex items-center text-sm mt-1 text-gray-500">
                <span>{summary.recurringPercentage.toFixed(1)}% of total expenses</span>
              </div>
            </div>
            
            {periodType != "monthly" && <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
              <div className="text-sm text-gray-500 mb-1">Average Monthly Expenses</div>
              <div className="text-2xl font-semibold">{formatAmount(summary.averageMonthlyExpenses.toFixed(2))}</div>
              <div className="flex items-center text-sm mt-1 text-gray-500">
                <span>Based on this {" "}
                  {
                    periodType === "quarterly"
                      ? "quarter"
                      : "year"
                  }
                </span>
              </div>
            </div>}
          </div>
        )}

        {/* Periods and search */}
        <div className="bg-white rounded-lg shadow-sm p-5 mb-6 border border-gray-100">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={handleSearch}
                placeholder="Search expenses..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            {/* Download button*/}
            <button 
              className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none hover:bg-gray-50"
              onClick={handleExport}
            >
              <Download size={18} className="text-gray-500" />
            </button>
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


        {/* Expenses table */}
        <div className="bg-white rounded-lg shadow-md border border-gray-100">
          <div className="overflow-auto" style={{ minHeight: "400px", maxHeight: "600px" }}>
            {loading ? (
              <div className="flex justify-center items-center h-32">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
              </div>
            ) : filteredExpenses.length === 0 ? (
              <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-dashed border-gray-300">
                <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                  <AlertCircle size={30} className="text-gray-400" />
                </div>
                <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
                <p className="text-gray-500 max-w-sm mx-auto">
                  Start tracking your expenses by adding your first entry.
                </p>
                <button
                  onClick={() => setShowAddExpense(true)}
                  className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all duration-200"
                >
                  <Plus size={16} className="mr-1" />
                  Add your first expense
                </button>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="min-w-full divide-y divide-gray-200 table-fixed">
                  <thead>
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[150px]">
                        <div className="flex items-center cursor-pointer" 
                            onClick={() => {
                              const newFilters = { ...appliedFilters, sortBy: 'date', sortDir: appliedFilters.sortDir === 'asc' ? 'desc' : 'asc' };
                              setAppliedFilters(newFilters);
                            }}>
                          Date
                          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[150px]">
                        <div className="flex items-center">
                          Merchant
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[150px]">
                        <div className="flex items-center">
                          Category
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[120px]">
                        <div className="flex items-center cursor-pointer"
                            onClick={() => {
                              const newFilters = { ...appliedFilters, sortBy: 'amount', sortDir: appliedFilters.sortDir === 'asc' ? 'desc' : 'asc' };
                              setAppliedFilters(newFilters);
                            }}>
                          Amount
                          <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[120px]">
                        <div className="flex items-center">
                          Recurring
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[120px]">
                        <div className="flex items-center">
                          Receipt
                        </div>
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[100px]">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {filteredExpenses.map((expense) => (
                      <tr key={expense.id} className="hover:bg-emerald-50 transition-colors duration-150">
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {formatDate(expense.date)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.merchant}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <span className="inline-flex items-center">
                            <span className={`w-2 h-2 rounded-full mr-2 ${expense.categories?.color ? 'bg-'+expense.categories.color+'-500' : 'bg-gray-500'}`}></span>
                            {expense.categories?.name || 'Uncategorized'}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                          {formatAmount(parseFloat(expense.amount).toFixed(2))}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.status === 'recurring' ? (
                            <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                              <Repeat size={12} className="mr-1" />
                              {expense.frequency || 'Monthly'}
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          {expense.receipt_url ? (
                            <span 
                              className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-amber-100 text-amber-800 cursor-pointer"
                              onClick={() => openReceiptModal(expense.receipt_url)}>
                              <Receipt size={12} className="mr-1" />
                              View
                            </span>
                          ) : (
                            <span className="text-gray-400">-</span>
                          )}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                          <div className="flex items-center justify-end space-x-2">
                            <button 
                              className="text-gray-500 hover:text-gray-700"
                              title="Edit Expense"
                              onClick={() => handleEditExpense(expense)}
                            >
                              <Edit size={18} />
                            </button>
                            <button 
                              className="text-gray-500 hover:text-red-600"
                              title="Delete Expense"
                              onClick={() => {
                                if (window.confirm('Are you sure you want to delete this expense?')) {
                                  handleDeleteExpense(expense.id);
                                }
                              }}
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                {/* Receipt Modal */}
                <ReceiptModal 
                  isOpen={showReceiptModal}
                  onClose={closeReceiptModal}
                  receiptUrl={selectedReceiptUrl}
                />
              </div>
            )}
          </div>
          
          {/* Pagination */}
          {filteredExpenses.length > 0 && (
            <div className="px-4 py-3 bg-white border-t border-gray-200 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="text-sm text-gray-700">
                  Showing <span className="font-medium">{(currentPage - 1) * appliedFilters.limit + 1}</span> to{' '}
                  <span className="font-medium">
                    {Math.min(currentPage * appliedFilters.limit, totalCount)}
                  </span>{' '} 
                  of <span className="font-medium">{totalCount}</span> results
                </div>
                <div className="flex-1 flex justify-end">
                  <button
                    onClick={() => handlePageChange(currentPage - 1)}
                    disabled={currentPage === 1}
                    className={`relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                      currentPage === 1 ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Previous
                  </button>
                  <button
                    onClick={() => handlePageChange(currentPage + 1)}
                    disabled={currentPage * appliedFilters.limit >= totalCount}
                    className={`ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 ${
                      currentPage * appliedFilters.limit >= totalCount ? 'opacity-50 cursor-not-allowed' : ''
                    }`}
                  >
                    Next
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Add Expense Modal */}
      {showAddExpense && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Add New Expense
                      </h3>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Progress steps */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between">
                        {steps.map((step) => (
                          <div key={step.number} className="flex flex-col items-center">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentStep === step.number 
                                  ? 'bg-emerald-600 text-white' 
                                  : currentStep > step.number 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              {currentStep > step.number ? (
                                <Check size={16} />
                              ) : (
                                <step.icon size={16} />
                              )}
                            </div>
                            <span className={`mt-1 text-xs ${
                              currentStep >= step.number ? 'text-emerald-600 font-medium' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="relative mt-2">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div 
                            className="bg-emerald-500 rounded" 
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                      {/* Render the current step */}
                      {steps.find(step => step.number === currentStep)?.component()}
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Saving...' : 'Save Expense'}
                  </button>
                )}
                
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Back
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={closeModal}
                  className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Edit Expense Modal */}
      {showEditExpense && (
        <div className="fixed inset-0 overflow-y-auto z-50">
          <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={closeModal}></div>
            </div>

            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                <div className="sm:flex sm:items-start">
                  <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                    <div className="flex justify-between items-center mb-5">
                      <h3 className="text-lg leading-6 font-medium text-gray-900">
                        Edit Expense
                      </h3>
                      <button
                        type="button"
                        onClick={closeModal}
                        className="text-gray-400 hover:text-gray-500"
                      >
                        <X size={20} />
                      </button>
                    </div>

                    {/* Progress steps */}
                    <div className="mb-8">
                      <div className="flex items-center justify-between">
                        {steps.map((step) => (
                          <div key={step.number} className="flex flex-col items-center">
                            <div 
                              className={`w-8 h-8 rounded-full flex items-center justify-center ${
                                currentStep === step.number 
                                  ? 'bg-emerald-600 text-white' 
                                  : currentStep > step.number 
                                    ? 'bg-emerald-100 text-emerald-600' 
                                    : 'bg-gray-200 text-gray-400'
                              }`}
                            >
                              {currentStep > step.number ? (
                                <Check size={16} />
                              ) : (
                                <step.icon size={16} />
                              )}
                            </div>
                            <span className={`mt-1 text-xs ${
                              currentStep >= step.number ? 'text-emerald-600 font-medium' : 'text-gray-500'
                            }`}>
                              {step.title}
                            </span>
                          </div>
                        ))}
                      </div>
                      <div className="relative mt-2">
                        <div className="overflow-hidden h-2 text-xs flex rounded bg-gray-200">
                          <div 
                            className="bg-emerald-500 rounded" 
                            style={{ width: `${((currentStep - 1) / (steps.length - 1)) * 100}%` }}
                          ></div>
                        </div>
                      </div>
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit}>
                      {/* Render the current step */}
                      {steps.find(step => step.number === currentStep)?.component()}
                    </form>
                  </div>
                </div>
              </div>
              <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                {currentStep < steps.length ? (
                  <button
                    type="button"
                    onClick={handleNextStep}
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Continue
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSubmit}
                    className={`w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm ${
                      loading ? 'opacity-75 cursor-not-allowed' : ''
                    }`}
                    disabled={loading}
                  >
                    {loading ? 'Updating...' : 'Update Expense'}
                  </button>
                )}
                
                {currentStep > 1 && (
                  <button
                    type="button"
                    onClick={handlePrevStep}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Back
                  </button>
                )}
                
                <button
                  type="button"
                  onClick={closeModal}
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
        type="expense" // Using shared expense categories for budget too
      />
    </div>
  );
};



// Helper functions for date formatting
const formatDate = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric'
  });
};


export default Expenses;