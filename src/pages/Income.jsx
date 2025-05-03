import React, { useState, useEffect } from 'react';
import { 
  Search,
  Plus, 
  Download, 
  Edit, 
  Trash2, 
  ArrowUpDown, 
  ChevronDown, 
  X, 
  Check, 
  DollarSign, 
  Repeat,
  FileText, 
  Receipt
} from 'lucide-react';
import { 
  fetchIncome, 
  addIncome, 
  updateIncome, 
  deleteIncome, 
  getIncomeSummary,
  getPeriodOptions, 
  getCurrentPeriod,
  getNextPeriod,
  getPreviousPeriod,
  exportIncomeToCSV 
} from '../db/income.js';
import { useCurrency } from '../CurrencyContext.jsx';


const Income = () => {
  // State variables
  const {symbol, formatAmount} = useCurrency();
  const [incomeEntries, setIncomeEntries] = useState([]);
  const [showAddIncome, setShowAddIncome] = useState(false);
  const [showEditIncome, setShowEditIncome] = useState(false);
  const [currentStep, setCurrentStep] = useState(1);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalCount, setTotalCount] = useState(0);
  const [periodType, setPeriodType] = useState('monthly');
  const [currentPeriod, setCurrentPeriod] = useState(getCurrentPeriod('monthly'));
  const [periodOptions, setPeriodOptions] = useState({});;
  const [searchTimeout, setSearchTimeout] = useState(null);
  const [summary, setSummary] = useState({
    totalIncome: 0,
    recurringIncome: 0,
    recurringPercentage: 0,
    averageMonthlyIncome: 0,
    growthPercentage: 0
  });
  // Form data
  const [incomeData, setIncomeData] = useState({
    date: new Date().toISOString().split('T')[0],
    source: '',
    category: '',
    amount: '',
    description: '',
    recurring: false,
    frequency: ''
  });
  // Filter options
  const [filterOptions, setFilterOptions] = useState({
    search: ''
  });
  // Applied filters
  const [appliedFilters, setAppliedFilters] = useState({
    ...filterOptions,
    page: 1,
    limit: 10
  });
  // Income categories
  const incomeCategories = [
    'Employment', 'Side Hustle', 'Investment', 'Real Estate', 
    'Business', 'Gifts', 'Tax Refund', 'Other'
  ];
  // Frequency options for recurring income
  const frequencyOptions = [
    'Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Quarterly', 'Annually'
  ];
  // Step configuration for add/edit income modal
  const steps = [
    {
      number: 1,
      title: 'Basic Info',
      icon: DollarSign,
      component: () => (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Amount <span className="text-red-500">*</span></label>
            <div className="relative rounded-md shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-gray-400 text-sm">
                {symbol}
              </span>
              </div>
              <input
                type="number"
                name="amount"
                value={incomeData.amount}
                onChange={handleInputChange}
                placeholder="0.00"
                step="0.01"
                required
                className="pl-8 block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2"
              />
            </div>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Date <span className="text-red-500">*</span></label>
            <input
              type="date"
              name="date"
              value={incomeData.date}
              onChange={handleInputChange}
              required
              className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Source <span className="text-red-500">*</span></label>
            <input
              type="text"
              name="source"
              value={incomeData.source}
              onChange={handleInputChange}
              placeholder="Where did this income come from?"
              required
              className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
            />
          </div>
        </div>
      )
    },
    {
      number: 2,
      title: 'Details',
      icon: FileText,
      component: () => (
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Category <span className="text-red-500">*</span></label>
            <select 
              name="category"
              value={incomeData.category}
              onChange={handleInputChange}
              required
              className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
            >
              <option value="">Select a category</option>
              {incomeCategories.map((category) => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Description (Optional)</label>
            <textarea
              name="description"
              value={incomeData.description}
              onChange={handleInputChange}
              rows="3"
              placeholder="Add notes about this income"
              className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
            ></textarea>
          </div>
        </div>
      )
    },
    {
      number: 3,
      title: 'Review',
      icon: Receipt,
      component: () => (
        <div className="space-y-4">
          <div>
            <div className="flex items-center mb-4">
              <input
                id="recurring"
                name="recurring"
                type="checkbox"
                checked={incomeData.recurring}
                onChange={handleCheckboxChange}
                className="h-4 w-4 text-emerald-600 focus:ring-emerald-500 border-gray-300 rounded"
              />
              <label htmlFor="recurring" className="ml-2 block text-sm text-gray-700">
                This is recurring income
              </label>
            </div>
            
            {incomeData.recurring && (
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <select
                  name="frequency"
                  value={incomeData.frequency}
                  onChange={handleInputChange}
                  className="block w-full border border-gray-300 rounded-md focus:ring-emerald-500 focus:border-emerald-500 py-2 px-3"
                >
                  <option value="">Select frequency</option>
                  {frequencyOptions.map((option) => (
                    <option key={option} value={option}>{option}</option>
                  ))}
                </select>
              </div>
            )}
          </div>
          
          <div className="mt-6 p-4 bg-gray-50 rounded-md">
            <h4 className="text-sm font-medium text-gray-700 mb-3">Income Summary</h4>
            <div className="space-y-2 text-sm">
              <div className="flex justify-between">
                <span className="text-gray-500">Amount:</span>
                <span className="font-medium">{formatAmount(parseFloat(incomeData.amount || 0).toFixed(2))}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Date:</span>
                <span className="font-medium">{incomeData.date}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Source:</span>
                <span className="font-medium">{incomeData.source}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-500">Category:</span>
                <span className="font-medium">{incomeData.category}</span>
              </div>
              {incomeData.recurring && (
                <div className="flex justify-between">
                  <span className="text-gray-500">Recurring:</span>
                  <span className="font-medium">{incomeData.frequency}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      )
    }
  ];
  const [isloading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  // Fetch income data and summary on component mount and when filters change
  useEffect(() => {
    fetchIncomeData();
    loadPeriodOptions();
  }, [currentPeriod, periodType]);
  useEffect(() => {
    fetchIncomeData();
  }, [appliedFilters]);

  // Fetch income data
  const fetchIncomeData = async () => {
    setIsLoading(true);
    try {      
      const { data, count, page } = await fetchIncome(currentPeriod, appliedFilters);
      setIncomeEntries(data || []);
      setTotalCount(count || 0);
      setCurrentPage(page);
      
      // load income summary
      const summary = await getIncomeSummary(currentPeriod);
      setSummary(summary)

    } catch (error) {
      console.error('Error fetching income data:', error);
      setError("Failed to load budget data. Please try again.");
    } finally {
      setIsLoading(false);
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

  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setIncomeData(prevData => ({
      ...prevData,
      [name]: name === 'amount' ? parseFloat(value) || '' : value
    }));
  };

  // Handle checkbox change
  const handleCheckboxChange = (e) => {
    const { name, checked } = e.target;
    setIncomeData(prevData => ({
      ...prevData,
      [name]: checked,
      // Clear frequency if recurring is unchecked
      frequency: checked ? prevData.frequency : ''
    }));
  };

  // Handle search
  const handleSearch = (e) => {
    const searchText = e.target.value;
    setFilterOptions(prevOptions => ({ ...prevOptions, search: searchText }));
    
    // Clear the previous timeout
    if (searchTimeout) clearTimeout(searchTimeout);
    
    // Set new timeout
    const timeoutId = setTimeout(() => {
      setAppliedFilters(prevFilters => ({
        ...prevFilters,
        search: searchText,
        page: 1 // Reset to first page when searching
      }));
    }, 500);
    
    setSearchTimeout(timeoutId);
  };

  // Open add income modal
  const openAddIncomeModal = () => {
    setIncomeData({
      date: new Date().toISOString().split('T')[0],
      source: '',
      category: '',
      amount: '',
      description: '',
      recurring: false,
      frequency: ''
    });
    setCurrentStep(1);
    setShowAddIncome(true);
  };

  // Open edit income modal
  const openEditIncomeModal = (income) => {
    setIncomeData({
      id: income.id,
      date: income.date,
      source: income.source,
      category: income.category,
      amount: income.amount,
      description: income.description || '',
      recurring: income.recurring || false,
      frequency: income.frequency || ''
    });
    setCurrentStep(1);
    setShowEditIncome(true);
  };

  // Close modal
  const closeModal = () => {
    setShowAddIncome(false);
    setShowEditIncome(false);
  };

  // Handle next step
  const handleNextStep = () => {
    setCurrentStep(prevStep => prevStep + 1);
  };

  // Handle previous step
  const handlePrevStep = () => {
    setCurrentStep(prevStep => prevStep - 1);
  };

  // Handle form submit
  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    
    try {
      setIsLoading(true);
      
      // Validate form data
      if (!incomeData.amount || !incomeData.date || !incomeData.source || !incomeData.category) {
        alert('Please fill all required fields');
        return;
      }
      
      // If recurring is true but no frequency is selected
      if (incomeData.recurring && !incomeData.frequency) {
        alert('Please select a frequency for recurring income');
        return;
      }
      
      if (showAddIncome) {
        // Add new income
        await addIncome(incomeData);
      } else if (showEditIncome) {
        // Update existing income
        await updateIncome(incomeData.id, incomeData);
      }
      
      // Refresh data
      fetchIncomeData();
      
      // Close modal
      closeModal();
      
    } catch (error) {
      console.error('Error saving income:', error);
      alert('Error saving income. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  // Handle delete
  const handleDelete = async (id) => {
    // Confirm delete
    if (window.confirm('Are you sure you want to delete this income entry?')) {
      try {
        setIsLoading(true);
        await deleteIncome(id);
        
        // Refresh data
        fetchIncomeData();
        
      } catch (error) {
        console.error('Error deleting income:', error);
        alert('Error deleting income. Please try again.');
      } finally {
        setIsLoading(false);
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

  // Handle export to CSV
  const handleExport = async () => {
    try {
      setIsLoading(true);
      const csvContent = await exportIncomeToCSV(currentPeriod);
      
      // Create blob and download link
      const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.setAttribute('download', `income_export_${new Date().toISOString().split('T')[0]}.csv`);
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
    } catch (error) {
      console.error('Error exporting income data:', error);
      alert('Error exporting data. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };


  // Get income category color
  const getIncomeCategoryColor = (category) => {
    const colorMap = {
      'Employment': 'bg-blue-500',
      'Side Hustle': 'bg-purple-500',
      'Investment': 'bg-yellow-500',
      'Real Estate': 'bg-red-500',
      'Business': 'bg-indigo-500',
      'Gifts': 'bg-pink-500',
      'Tax Refund': 'bg-orange-500',
      'Other': 'bg-gray-500'
    };
    
    return colorMap[category] || 'bg-gray-500';
  };

return (
  <div className="flex-1 overflow-auto bg-gray-50 flex flex-col h-full">
    {/* Header */}
    <header className="bg-white p-6 border-b border-gray-200 shadow-sm">
      <div className="flex justify-between items-center">
      <h1 className="text-2xl font-bold text-emerald-800">
        Income
        <span className="ml-2 text-sm font-normal text-gray-500">Manage your earnings</span>
      </h1>
        <button 
          onClick={openAddIncomeModal}
          className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-md flex items-center shadow-sm transition-colors duration-200"
        >
          <Plus size={18} className="mr-1" />
          <span>Add Income</span>
        </button>
      </div>
    </header>

    {/* Main content */}
    <div className="p-6 flex-1 overflow-auto bg-gray-50 flex flex-col">

      {/* Income summary */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 mb-1">Total Income ({currentPeriod})</div>
          <div className="text-2xl font-semibold">{formatAmount(summary.totalIncome.toFixed(2))}</div>
          <div className="flex items-center text-sm mt-1">
            <span className={summary.growthPercentage >= 0 ? "text-green-600" : "text-red-600"}>
              {summary.growthPercentage >= 0 ? "↑" : "↓"} {Math.abs(summary.growthPercentage).toFixed(1)}% from last month
            </span>
          </div>
        </div>
        
        <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 mb-1">Recurring Income</div>
          <div className="text-2xl font-semibold">{formatAmount(summary.recurringIncome.toFixed(2))}</div>
          <div className="flex items-center text-sm mt-1 text-gray-500">
            <span>{summary.recurringPercentage.toFixed(1)}% of total income</span>
          </div>
        </div>
        
        {periodType != "monthly" && <div className="bg-gradient-to-br from-white to-emerald-50 rounded-lg shadow-md border border-gray-100 p-4 hover:shadow-lg transition-shadow">
          <div className="text-sm text-gray-500 mb-1">Average Monthly Income</div>
          <div className="text-2xl font-semibold">{formatAmount(summary.averageMonthlyIncome.toFixed(2))}</div>
          <div className="flex items-center text-sm mt-1 text-gray-500">
            <span>Based on this period</span>
          </div>
        </div>}
      </div>

      {/* Filters and search */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100 p-4 mb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div className="relative flex-grow max-w-md">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <Search size={18} className="text-gray-400" />
            </div>
            <input
              type="text"
              placeholder="Search income entries..."
              value={filterOptions.search}
              onChange={handleSearch}
              className="pl-10 pr-4 py-2 w-full border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
            />
          </div>
          
          {/* Download button*/}
          <button
            onClick={handleExport}
            className="flex items-center bg-white border border-gray-300 rounded-md px-4 py-2 focus:outline-none hover:bg-gray-50"
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

      
      {/* Income table */}
      <div className="bg-white rounded-lg shadow-md border border-gray-100">
        <div className="overflow-auto" style={{ minHeight: "400px", maxHeight: "600px" }}>
          {isloading ? (
            <div className="flex justify-center items-center h-32">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-500"></div>
            </div>
          ) : incomeEntries.length === 0 ? (
            <div className="bg-white rounded-lg shadow-sm p-12 text-center border border-dashed border-gray-300">
              <div className="bg-gray-50 rounded-full w-16 h-16 flex items-center justify-center mx-auto mb-4">
                <DollarSign size={30} className="text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">No income entries found</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Start tracking your income by adding your first entry.
              </p>
              <button
                onClick={openAddIncomeModal}
                className="mt-6 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-emerald-600 hover:bg-emerald-700 shadow-sm transition-all duration-200"
              >
                <Plus size={16} className="mr-1" />
                Add your first income
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
                      <div className="flex items-center cursor-pointer"
                          onClick={() => {
                            const newFilters = { ...appliedFilters, sortBy: 'source', sortDir: appliedFilters.sortDir === 'asc' ? 'desc' : 'asc' };
                            setAppliedFilters(newFilters);
                          }}>
                        Source
                        <ArrowUpDown size={14} className="ml-1 text-gray-400" />
                      </div>
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[150px]">
                      <div className="flex items-center cursor-pointer"
                          onClick={() => {
                            const newFilters = { ...appliedFilters, sortBy: 'category', sortDir: appliedFilters.sortDir === 'asc' ? 'desc' : 'asc' };
                            setAppliedFilters(newFilters);
                          }}>
                        Category
                        <ArrowUpDown size={14} className="ml-1 text-gray-400" />
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
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky top-0 bg-gray-50 z-10 min-w-[100px]">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {incomeEntries.map((income) => (
                    <tr key={income.id} className="hover:bg-emerald-50 transition-colors duration-150">
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(income.date).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' })}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {income.source}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        <span className="inline-flex items-center">
                          <span className={`w-2 h-2 rounded-full mr-2 ${getIncomeCategoryColor(income.category)}`}></span>
                          {income.category}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-emerald-600">
                        {formatAmount(parseFloat(income.amount).toFixed(2))}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {income.recurring ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                            <Repeat size={12} className="mr-1" />
                            {income.frequency || 'Monthly'}
                          </span>
                        ) : (
                          <span className="text-gray-400">-</span>
                        )}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <div className="flex items-center justify-end space-x-2">
                          <button 
                            onClick={() => openEditIncomeModal(income)}
                            className="text-gray-500 hover:text-gray-700"
                            title="Edit"
                          >
                            <Edit size={18} />
                          </button>
                          <button 
                            onClick={() => handleDelete(income.id)}
                            className="text-gray-500 hover:text-red-600"
                            title="Delete"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
        
        {/* Pagination */}
        {incomeEntries.length > 0 && (
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

    {/* Add Income Modal */}
    {showAddIncome && (
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
                      Add New Income
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
                    isloading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={isloading}
                >
                  {isloading ? 'Saving...' : 'Save Income'}
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

    {/* Edit Income Modal - Same structure as Add Income Modal */}
    {showEditIncome && (
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
                      Edit Income
                    </h3>
                    <button
                      type="button"
                      onClick={closeModal}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={20} />
                    </button>
                  </div>

                  {/* Progress steps - Same as add modal */}
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

                  {/* Form - Same as add modal */}
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
                    isloading ? 'opacity-75 cursor-not-allowed' : ''
                  }`}
                  disabled={isloading}
                >
                  {isloading ? 'Updating...' : 'Update Income'}
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

export default Income;