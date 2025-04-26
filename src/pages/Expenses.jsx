import React, { useState, useEffect } from 'react';
import { 
  Search,
  Filter, 
  Plus, 
  Calendar, 
  Download, 
  Edit, 
  Trash2, 
  Receipt, 
  ArrowUpDown, 
  ChevronDown,
  X, 
  Check, 
  DollarSign, 
  ChevronLeft, 
  ChevronRight,
  Image, 
  AlertCircle, 
  FileText
} from 'lucide-react';

import { 
  fetchExpenses, 
  fetchCategories, 
  addExpense, 
  updateExpense, 
  deleteExpense,
  uploadReceipt,
  getExpenseStats 
} from '../db/expenses';


const Expenses = () => {
  // State management
  const [expenses, setExpenses] = useState([]);
  const [categories, setCategories] = useState([]);
  const [activeTab, setActiveTab] = useState('all');
  const [showAddExpense, setShowAddExpense] = useState(false);
  const [showEditExpense, setShowEditExpense] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [dateRange, setDateRange] = useState({
    start: new Date(new Date().setDate(1)).toISOString().split('T')[0], // First day of current month
    end: new Date().toISOString().split('T')[0] // Today
  });
  const [showCalendarPopup, setShowCalendarPopup] = useState(false);
  const [showFilterPopup, setShowFilterPopup] = useState(false);
  const [filterOptions, setFilterOptions] = useState({
    category: '',
    minAmount: '',
    maxAmount: '',
    recurring: false
  });
  const [editingExpenseId, setEditingExpenseId] = useState(null);
  
  // Form state
  const [formData, setFormData] = useState({
    amount: '',
    date: new Date().toISOString().split('T')[0],
    merchant: '',
    category_id: '',
    description: '',
    is_recurring: false,
    receipt: null
  });
  
  // Effects for data fetching
  useEffect(() => {
    loadInitialData();
  }, []);
  
  useEffect(() => {
    loadExpenses();
  }, [activeTab, searchTerm, dateRange, filterOptions]);
  
  // Functions for data fetching
  const loadInitialData = async () => {
    try {
      setLoading(true);
      const categoriesData = await fetchCategories();
      setCategories(categoriesData);
      await loadExpenses();
    } catch (error) {
      console.error('Error loading initial data:', error);
    } finally {
      setLoading(false);
    }
  };
  
  const loadExpenses = async () => {
    try {
      setLoading(true);
      
      // Prepare filters based on active tab and search term
      const filters = {
        startDate: dateRange.start,
        endDate: dateRange.end,
        search: searchTerm || undefined
      };
      
      if (activeTab === 'recurring') {
        filters.status = 'recurring';
      } else if (activeTab === 'receipts') {
        filters.hasReceipt = true;
      }
      
      // Add filter options
      if (filterOptions.category) {
        filters.category = filterOptions.category;
      }
      
      if (filterOptions.minAmount) {
        filters.minAmount = parseFloat(filterOptions.minAmount);
      }
      
      if (filterOptions.maxAmount) {
        filters.maxAmount = parseFloat(filterOptions.maxAmount);
      }
      
      if (filterOptions.recurring) {
        filters.status = 'recurring';
      }
      
      const data = await fetchExpenses(filters);
      setExpenses(data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (expenseId) => {
    try {
      setLoading(true);
      await deleteExpense(expenseId);
      setExpenses(expenses.filter(expense => expense.id !== expenseId));
      // Success notification could be added here
    } catch (error) {
      console.error('Error deleting expense:', error);
      // Error notification could be added here
    } finally {
      setLoading(false);
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
  
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      setLoading(true);
      
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
      
      let updatedExpense;
      
      if (showEditExpense && editingExpenseId) {
        // Update existing expense
        updatedExpense = await updateExpense(editingExpenseId, expenseData);

        // Ensure category information is attached
        if (updatedExpense.category_id) {
          const categoryInfo = categories.find(c => c.id === updatedExpense.category_id);
          updatedExpense.categories = categoryInfo;
        }
        
        // Update local state
        setExpenses(expenses.map(expense => 
          expense.id === editingExpenseId ? updatedExpense : expense
        ));
      } else {
        // Add new expense
        updatedExpense = await addExpense(expenseData);

        // Ensure category information is attached
        if (updatedExpense.category_id) {
          const categoryInfo = categories.find(c => c.id === updatedExpense.category_id);
          updatedExpense.categories = categoryInfo;
        }
        
        // Update local state
        setExpenses([updatedExpense, ...expenses]);
      }
      
      // Close modal and reset form
      closeModal();
      
      // Success message or notification could be added here
    } catch (error) {
      console.error('Error submitting expense:', error);
      // Error notification could be added here
    } finally {
      setLoading(false);
    }
  };
  
  // Calendar popup handlers
  const handleCalendarToggle = () => {
    setShowCalendarPopup(!showCalendarPopup);
    setShowFilterPopup(false); // Close filter popup if open
  };
  
  const handleDateRangeChange = (e) => {
    const { name, value } = e.target;
    setDateRange({
      ...dateRange,
      [name]: value
    });
  };
  
  const applyDateRange = () => {
    // Date range is already applied through state
    setShowCalendarPopup(false);
  };
  
  // Filter popup handlers
  const handleFilterToggle = () => {
    setShowFilterPopup(!showFilterPopup);
    setShowCalendarPopup(false); // Close calendar popup if open
  };
  
  const handleFilterChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFilterOptions({
      ...filterOptions,
      [name]: type === 'checkbox' ? checked : value
    });
  };
  
  const applyFilters = () => {
    // Filters are already applied through state
    setShowFilterPopup(false);
  };
  
  const resetFilters = () => {
    setFilterOptions({
      category: '',
      minAmount: '',
      maxAmount: '',
      recurring: false
    });
    setShowFilterPopup(false);
  };
  
  // Download expenses as CSV
  const downloadExpensesCSV = () => {
    // Create CSV headers
    const headers = ['Date', 'Merchant', 'Category', 'Amount', 'Description', 'Recurring'];
    
    // Map expenses to CSV rows
    const rows = expenses.map(expense => [
      expense.date,
      expense.merchant,
      expense.categories?.name || 'Uncategorized',
      expense.amount.toFixed(2),
      expense.description || '',
      expense.status === 'recurring' ? 'Yes' : 'No'
    ]);
    
    // Combine headers and rows
    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.join(','))
    ].join('\n');
    
    // Create and download the file
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement('a');
    const url = URL.createObjectURL(blob);
    
    link.setAttribute('href', url);
    link.setAttribute('download', `expenses_${formatDate(dateRange.start)}_to_${formatDate(dateRange.end)}.csv`);
    link.style.visibility = 'hidden';
    
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  // Extract form steps into separate components for readability
  const renderStep1 = () => (
    <div className="space-y-4">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">Amount *</label>
        <div className="relative rounded-md shadow-sm">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <DollarSign size={16} className="text-gray-400" />
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
            <span className="text-sm font-medium">${parseFloat(formData.amount || 0).toFixed(2)}</span>
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
  
  return (
    <div className="flex-1 overflow-auto bg-gray-50">
      {/* Header */}
      <header className="bg-white p-4 border-b shadow-sm">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold text-emerald-800">Expenses</h1>
          <button 
            onClick={() => setShowAddExpense(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center"
          >
            <Plus size={18} className="mr-1" />
            <span>Add Expense</span>
          </button>
        </div>
      </header>

      {/* Main content */}
      <div className="p-6">
        {/* Filters and search */}
        <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="relative flex-grow max-w-md">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                <Search size={18} className="text-gray-400" />
              </div>
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search expenses..."
                className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            
            <div className="flex gap-2">
              <div className="relative">
                <button 
                  className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none hover:bg-gray-50"
                  onClick={handleCalendarToggle}
                >
                  <Calendar size={18} className="mr-2 text-gray-500" />
                  <span className="text-sm">
                    {formatDateShort(dateRange.start)} - {formatDateShort(dateRange.end)}
                  </span>
                  <ChevronDown size={16} className="ml-2 text-gray-500" />
                </button>
                
                {/* Calendar Popup */}
                {showCalendarPopup && (
                  <div className="absolute right-0 mt-2 w-72 bg-white rounded-md shadow-lg z-50 p-4">
                    <div className="space-y-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Start Date</label>
                        <input
                          type="date"
                          name="start"
                          value={dateRange.start}
                          onChange={handleDateRangeChange}
                          className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">End Date</label>
                        <input
                          type="date"
                          name="end"
                          value={dateRange.end}
                          onChange={handleDateRangeChange}
                          className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                        />
                      </div>
                      
                      {/* Quick date presets */}
                      <div className="grid grid-cols-2 gap-2">
                        <button
                          onClick={() => {
                            const today = new Date();
                            const lastWeek = new Date();
                            lastWeek.setDate(today.getDate() - 7);
                            
                            setDateRange({
                              start: lastWeek.toISOString().split('T')[0],
                              end: today.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Last 7 days
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const lastMonth = new Date();
                            lastMonth.setMonth(today.getMonth() - 1);
                            
                            setDateRange({
                              start: lastMonth.toISOString().split('T')[0],
                              end: today.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Last 30 days
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const firstDayOfMonth = new Date(today.getFullYear(), today.getMonth(), 1);
                            
                            setDateRange({
                              start: firstDayOfMonth.toISOString().split('T')[0],
                              end: today.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          This month
                        </button>
                        <button
                          onClick={() => {
                            const today = new Date();
                            const firstDayOfLastMonth = new Date(today.getFullYear(), today.getMonth() - 1, 1);
                            const lastDayOfLastMonth = new Date(today.getFullYear(), today.getMonth(), 0);
                            
                            setDateRange({
                              start: firstDayOfLastMonth.toISOString().split('T')[0],
                              end: lastDayOfLastMonth.toISOString().split('T')[0]
                            });
                          }}
                          className="text-xs px-2 py-1 bg-gray-100 rounded-md hover:bg-gray-200"
                        >
                          Last month
                        </button>
                      </div>
                      
                      <div className="flex justify-end space-x-2">
                        <button
                          onClick={() => setShowCalendarPopup(false)}
                          className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applyDateRange}
                          className="px-3 py-1 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
              
              <button 
                className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none hover:bg-gray-50"
                onClick={handleFilterToggle}
              >
                <Filter size={18} className="mr-2 text-gray-500" />
                <span className="text-sm">Filter</span>
              </button>
              
              {/* Filter Popup */}
              {showFilterPopup && (
                <div className="absolute right-0 mt-12 w-72 bg-white rounded-md shadow-lg z-50 p-4">
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                      <select
                        name="category"
                        value={filterOptions.category}
                        onChange={handleFilterChange}
                        className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                      >
                        <option value="">All Categories</option>
                        {categories.map((category) => (
                          <option key={category.id} value={category.id}>{category.name}</option>
                        ))}
                      </select>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Min Amount</label>
                        <input
                          type="number"
                          name="minAmount"
                          value={filterOptions.minAmount}
                          onChange={handleFilterChange}
                          placeholder="0.00"
                          step="0.01"
                          className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                        />
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Max Amount</label>
                        <input
                          type="number"
                          name="maxAmount"
                          value={filterOptions.maxAmount}
                          onChange={handleFilterChange}
                          placeholder="0.00"
                          step="0.01"
                          className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                        />
                      </div>
                    </div>
                    
                    <div>
                      <div className="flex items-center">
                        <input
                          id="filter-recurring"
                          name="recurring"
                          type="checkbox"
                          checked={filterOptions.recurring}
                          onChange={handleFilterChange}
                          className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
                        />
                        <label htmlFor="filter-recurring" className="ml-2 block text-sm text-gray-700">
                          Recurring expenses only
                        </label>
                      </div>
                    </div>
                    
                    <div className="flex justify-between space-x-2">
                      <button
                        onClick={resetFilters}
                        className="px-3 py-1 text-sm rounded-md text-gray-600 hover:text-gray-800"
                      >
                        Reset
                      </button>
                      <div className="flex space-x-2">
                        <button
                          onClick={() => setShowFilterPopup(false)}
                          className="px-3 py-1 text-sm rounded-md border border-gray-300 hover:bg-gray-50"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={applyFilters}
                          className="px-3 py-1 text-sm rounded-md bg-emerald-600 text-white hover:bg-emerald-700"
                        >
                          Apply
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}
              
              <div className="relative">
                <button 
                  className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none hover:bg-gray-50"
                  onClick={downloadExpensesCSV}
                >
                  <Download size={18} className="text-gray-500" />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Tab navigation */}
        {/* Tab navigation */}
        <div className="mb-4 border-b border-gray-200">
          <nav className="flex space-x-6">
            <TabButton 
              label="All Expenses" 
              active={activeTab === 'all'} 
              onClick={() => setActiveTab('all')} 
            />
            <TabButton 
              label="Recurring" 
              active={activeTab === 'recurring'} 
              onClick={() => setActiveTab('recurring')} 
            />
            <TabButton 
              label="With Receipts" 
              active={activeTab === 'receipts'} 
              onClick={() => setActiveTab('receipts')} 
            />
          </nav>
        </div>

        {/* Expenses table */}
        {loading ? (
          <div className="bg-white rounded-lg shadow-sm p-8 flex justify-center">
            <div className="text-gray-500">Loading expenses...</div>
          </div>
        ) : expenses.length === 0 ? (
          <div className="bg-white rounded-lg shadow-sm p-8 text-center">
            <AlertCircle size={36} className="mx-auto text-gray-400 mb-2" />
            <h3 className="text-lg font-medium text-gray-900 mb-1">No expenses found</h3>
            <p className="text-gray-500">
              {activeTab === 'all' 
                ? "You haven't added any expenses yet." 
                : activeTab === 'recurring'
                  ? "You don't have any recurring expenses."
                  : "You don't have any expenses with receipts."}
            </p>
            <button
              onClick={() => setShowAddExpense(true)}
              className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700"
            >
              <Plus size={16} className="mr-1" />
              Add your first expense
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-lg shadow-sm overflow-hidden">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Date
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Merchant
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Category
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    <div className="flex items-center">
                      Amount
                      <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                    </div>
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {expenses.map((expense) => (
                  <tr key={expense.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatDate(expense.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {expense.merchant}
                      {expense.status === 'recurring' && (
                        <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                          Recurring
                        </span>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      <span className="inline-flex items-center">
                        <span className={`w-2 h-2 rounded-full mr-2 ${expense.categories?.color ? 'bg-'+expense.categories.color+'-500' : 'bg-gray-500'}`}></span>
                        {expense.categories?.name || 'Uncategorized'}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                      ${parseFloat(expense.amount).toFixed(2)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex items-center justify-end space-x-2">
                        {expense.receipt_url && (
                          <button 
                            className="text-gray-500 hover:text-gray-700"
                            title="View Receipt"
                            onClick={() => window.open(expense.receipt_url, '_blank')}
                          >
                            <Receipt size={18} />
                          </button>
                        )}
                        <button 
                          className="text-gray-500 hover:text-gray-700"
                          title="Edit Expense"
                          onClick={() => handleEditExpense(expense)}
                        >
                          <Edit size={18} />
                        </button>
                        <button 
                          className="text-gray-500 hover:text-gray-700"
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
          
            {/* Pagination */}
            <div className="bg-white px-4 py-3 flex items-center justify-between border-t border-gray-200 sm:px-6">
              <div className="flex-1 flex justify-between sm:hidden">
                <button className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Previous
                </button>
                <button className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50">
                  Next
                </button>
              </div>
              <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm text-gray-700">
                    Showing <span className="font-medium">1</span> to <span className="font-medium">{expenses.length}</span> of{' '}
                    <span className="font-medium">{expenses.length}</span> results
                  </p>
                </div>
                <div>
                  <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px" aria-label="Pagination">
                    <button className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <ChevronLeft size={18} className="h-5 w-5" aria-hidden="true" />
                    </button>
                    <button className="bg-emerald-50 border-emerald-500 text-emerald-600 relative inline-flex items-center px-4 py-2 border text-sm font-medium">
                      1
                    </button>
                    <button className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50">
                      <ChevronRight size={18} className="h-5 w-5" aria-hidden="true" />
                    </button>
                  </nav>
                </div>
              </div>
            </div>
          </div>
        )}
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
    </div>
  );
};

// Helper component for tabs
const TabButton = ({ label, active, onClick }) => {
  return (
    <button
      onClick={onClick}
      className={`pb-4 px-1 border-b-2 font-medium text-sm ${
        active
          ? 'border-emerald-500 text-emerald-600'
          : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
      }`}
    >
      {label}
    </button>
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

const formatDateShort = (dateString) => {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric'
  });
};

export default Expenses;