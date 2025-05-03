import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';
import { 
  Calendar, 
  Wallet, 
  Target, 
  Bookmark, 
  Clock, 
  PlusCircle, 
  Filter, 
  SortDesc,
  XCircle,
  Edit,
  Trash2,
  Save,
  ArrowUp,
  ArrowDown,
  PieChart,
  DollarSign,
  TrendingUp, 
  X
} from 'lucide-react';
import { 
  fetchGoals, 
  createGoal, 
  updateGoal, 
  updateGoalProgress,
  deleteGoal,
  getGoalStats
} from '../db/goals.js';
import { UserAuth } from '../AuthContext.jsx';
import { useCurrency } from '../CurrencyContext.jsx';

const FinancialGoals = () => {
  const { user } = UserAuth();
  const {symbol, formatAmount} = useCurrency();
  const [goals, setGoals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [stats, setStats] = useState({
    totalGoals: 0,
    totalTargetAmount: 0,
    totalSavedAmount: 0,
    totalRemainingAmount: 0,
    categories: {}
  });

  const [filter, setFilter] = useState('all');
  const [sortBy, setSortBy] = useState('progress');
  const [showAddGoalForm, setShowAddGoalForm] = useState(false);
  const [selectedGoal, setSelectedGoal] = useState(null);
  const [isEditing, setIsEditing] = useState(false);
  
  // Form state for new goal
  const [newGoal, setNewGoal] = useState({
    name: '',
    category: 'Travel',
    target_amount: '',
    current_amount: '',
    deadline: '',
    priority: 'Medium',
    color: '#10B981',
    notes: ''
  });

  // Categories for goals
  const categories = [
    'Travel', 'Savings', 'Education', 'Housing', 'Electronics', 
    'Vehicle', 'Health', 'Debt Repayment', 'Retirement', 'Other'
  ];

  // Colors for goal customization
  const colors = [
    '#10B981', '#3B82F6', '#F59E0B', '#8B5CF6', 
    '#EF4444', '#EC4899', '#14B8A6', '#6366F1'
  ];

  // Load goals from Supabase on component mount
  useEffect(() => {
    loadGoals();
  }, []);

  const loadGoals = async () => {
    setLoading(true);
    
    try {
      // Fetch goals
      const { data: goalsData, error: goalsError } = await fetchGoals(user.id);
      if (goalsError) throw goalsError;
      
      // Fetch statistics
      const { data: statsData, error: statsError } = await getGoalStats();
      if (statsError) throw statsError;
      
      setGoals(goalsData || []);
      setStats(statsData || {
        totalGoals: 0,
        totalTargetAmount: 0,
        totalSavedAmount: 0,
        totalRemainingAmount: 0,
        categories: {}
      });
    } catch (error) {
      console.error("Error loading goals:", error);
      toast.error("Failed to load goals");
    } finally {
      setLoading(false);
    }
  };

  // Sort and filter goals
  const filteredGoals = goals.filter(goal => {
    if (filter === 'all') return true;
    return goal.category === filter;
  });

  const sortedGoals = [...filteredGoals].sort((a, b) => {
    switch (sortBy) {
      case 'progress':
        return (b.current_amount / b.target_amount) - (a.current_amount / a.target_amount);
      case 'amount':
        return b.target_amount - a.target_amount;
      case 'deadline':
        return new Date(a.deadline) - new Date(b.deadline);
      default:
        return 0;
    }
  });

  // Handle form input changes
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewGoal({
      ...newGoal,
      [name]: value
    });
  };

  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      const goalData = {
        name: newGoal.name,
        category: newGoal.category,
        target_amount: parseFloat(newGoal.target_amount) || 0,
        current_amount: parseFloat(newGoal.current_amount) || 0,
        deadline: newGoal.deadline,
        priority: newGoal.priority,
        color: newGoal.color,
        notes: newGoal.notes
      };
      
      if (isEditing && selectedGoal) {
        // Update existing goal
        const { error } = await updateGoal(selectedGoal.id, goalData);
        if (error) throw error;
        
        toast.success("Goal updated successfully!");
        setIsEditing(false);
      } else {
        // Add new goal
        const { error } = await createGoal(goalData, user.id);
        if (error) throw error;
        
        toast.success("New goal created!");
      }
      
      // Reset form state
      setNewGoal({
        name: '',
        category: 'Travel',
        target_amount: '',
        current_amount: '',
        deadline: '',
        priority: 'Medium',
        color: '#10B981',
        notes: ''
      });
      
      setShowAddGoalForm(false);
      setSelectedGoal(null);
      
      // Reload goals
      await loadGoals();
    } catch (error) {
      console.error("Error saving goal:", error);
      toast.error("Failed to save goal");
    }
  };

  // Function to start editing a goal
  const editGoal = (goal) => {
    setNewGoal({
      name: goal.name,
      category: goal.category,
      target_amount: goal.target_amount,
      current_amount: goal.current_amount,
      deadline: goal.deadline,
      priority: goal.priority,
      color: goal.color,
      notes: goal.notes
    });
    setSelectedGoal(goal);
    setIsEditing(true);
    setShowAddGoalForm(true);
  };

  // Function to delete a goal
  const handleDeleteGoal = async (goalId) => {
    try {
      const { error } = await deleteGoal(goalId);
      if (error) throw error;
      
      toast.success("Goal deleted successfully");
      
      if (selectedGoal && selectedGoal.id === goalId) {
        setSelectedGoal(null);
      }
      
      // Reload goals
      await loadGoals();
    } catch (error) {
      console.error("Error deleting goal:", error);
      toast.error("Failed to delete goal");
    }
  };

  // Function to update goal progress
  const handleUpdateGoalProgress = async (goalId, newAmount) => {
    try {
      const { error } = await updateGoalProgress(goalId, parseFloat(newAmount) || 0);
      if (error) throw error;
      
      toast.success("Goal progress updated");
      
      // Update local state
      setGoals(goals.map(goal => {
        if (goal.id === goalId) {
          return {
            ...goal,
            current_amount: parseFloat(newAmount) || 0
          };
        }
        return goal;
      }));
      
      // Update selected goal if it's the one being modified
      if (selectedGoal && selectedGoal.id === goalId) {
        setSelectedGoal({
          ...selectedGoal,
          current_amount: parseFloat(newAmount) || 0
        });
      }
      
      // Reload goals to update stats
      await loadGoals();
    } catch (error) {
      console.error("Error updating goal progress:", error);
      toast.error("Failed to update goal progress");
    }
  };


  // Calculate time remaining until deadline
  const calculateTimeRemaining = (deadline) => {
    const today = new Date();
    const targetDate = new Date(deadline);
    const timeDiff = targetDate - today;
    const daysDiff = Math.ceil(timeDiff / (1000 * 60 * 60 * 24));
    
    if (daysDiff < 0) return 'Overdue';
    if (daysDiff === 0) return 'Due today';
    if (daysDiff === 1) return '1 day remaining';
    if (daysDiff <= 30) return `${daysDiff} days remaining`;
    
    const monthsDiff = Math.ceil(daysDiff / 30);
    if (monthsDiff === 1) return '1 month remaining';
    if (monthsDiff < 12) return `${monthsDiff} months remaining`;
    
    const yearsDiff = Math.floor(monthsDiff / 12);
    const remainingMonths = monthsDiff % 12;
    
    if (remainingMonths === 0) {
      return yearsDiff === 1 ? '1 year remaining' : `${yearsDiff} years remaining`;
    }
    
    return yearsDiff === 1 
      ? `1 year, ${remainingMonths} months remaining` 
      : `${yearsDiff} years, ${remainingMonths} months remaining`;
  };

  // Calculate monthly contribution needed to reach goal
  const calculateMonthlyContribution = (goal) => {
    const today = new Date();
    const deadline = new Date(goal.deadline);
    const remainingAmount = goal.target_amount - goal.current_amount;
    
    if (remainingAmount <= 0) return 0;
    if (deadline <= today) return remainingAmount;
    
    const monthsDiff = (deadline.getFullYear() - today.getFullYear()) * 12 + 
                        (deadline.getMonth() - today.getMonth());
    
    return monthsDiff <= 0 ? remainingAmount : (remainingAmount / monthsDiff).toFixed(2);
  };

  const renderGoalCards = () => {
    if (loading) {
      return (
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-green-500"></div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {sortedGoals.map(goal => {
          const progress = Math.min(Math.round((goal.current_amount / goal.target_amount) * 100), 100);
          const monthlyContribution = calculateMonthlyContribution(goal);
          
          return (
            <div 
              key={goal.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow overflow-hidden relative"
            >
              <div className="h-2" style={{ backgroundColor: goal.color }}></div>
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-semibold line-clamp-1">{goal.name}</h3>
                  <span className={`text-xs px-2 py-1 rounded-full ${
                    goal.priority === 'High' ? 'bg-red-100 text-red-800' :
                    goal.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                    'bg-green-100 text-green-800'
                  }`}>
                    {goal.priority}
                  </span>
                </div>
                
                <div className="flex items-center mb-4">
                  <Bookmark size={16} className="text-gray-500 mr-1" />
                  <p className="text-sm text-gray-500">{goal.category}</p>
                </div>
                
                {/* Progress bar */}
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">{symbol}{parseFloat(goal.current_amount).toLocaleString()} of {symbol}{parseFloat(goal.target_amount).toLocaleString()}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    ></div>
                  </div>
                </div>
                
                {/* Expanded details section */}
                <div className="grid grid-cols-2 gap-3 mb-4">
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <Calendar size={12} className="mr-1" />
                      Target Date
                    </div>
                    <p className="text-sm font-medium">
                      {new Date(goal.deadline).toLocaleDateString('en-US', {
                        year: 'numeric',
                        month: 'short',
                        day: 'numeric'
                      })}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <Clock size={12} className="mr-1" />
                      Time Left
                    </div>
                    <p className="text-sm font-medium">
                      {calculateTimeRemaining(goal.deadline)}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <span className="text-sm">
                        {symbol}
                      </span>
                      Amount Left
                    </div>
                    <p className="text-sm font-medium">
                      {symbol}{(goal.target_amount - goal.current_amount).toLocaleString()}
                    </p>
                  </div>
                  
                  <div className="bg-gray-50 rounded p-2">
                    <div className="flex items-center text-xs text-gray-500 mb-1">
                      <TrendingUp size={12} className="mr-1" />
                      Monthly Target
                    </div>
                    <p className="text-sm font-medium">
                      {symbol}{monthlyContribution}
                    </p>
                  </div>
                </div>
                
                {/* Notes section if available */}
                {goal.notes && (
                  <div className="mb-4">
                    <div className="text-xs text-gray-500 mb-1">Notes</div>
                    <p className="text-sm bg-gray-50 p-2 rounded max-h-20 overflow-y-auto">{goal.notes}</p>
                  </div>
                )}
                
                {/* Update progress input */}
                <div className="mb-4">
                  <div className="text-xs text-gray-500 mb-1">Update Progress</div>
                  <div className="flex">
                    <div className="relative flex-grow mr-2">
                      <span className="absolute inset-y-0 left-0 flex items-center pl-2 text-gray-500">
                        {symbol}
                      </span>
                      <input 
                        type="number" 
                        className="w-full pl-7 pr-2 py-1 text-sm border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent"
                        placeholder="New amount"
                        defaultValue={goal.current_amount}
                        id={`update-progress-input-${goal.id}`}
                        min="0"
                        step="0.01"
                      />
                    </div>
                    <button
                      className="px-3 py-1 text-xs font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors"
                      onClick={() => {
                        const newAmount = document.getElementById(`update-progress-input-${goal.id}`).value;
                        handleUpdateGoalProgress(goal.id, newAmount);
                      }}
                    >
                      <Save size={12} className="inline mr-1" />
                      Save
                    </button>
                  </div>
                </div>
                
                {/* Action buttons */}
                <div className="flex justify-end space-x-2">
                  <button 
                    className="p-2 bg-gray-100 rounded hover:bg-gray-200 transition-colors flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      editGoal(goal);
                    }}
                    title="Edit goal"
                  >
                    <Edit size={14} className="mr-1 text-gray-600" />
                    <span className="text-xs">Edit</span>
                  </button>
                  <button 
                    className="p-2 bg-gray-100 rounded hover:bg-red-100 transition-colors flex items-center"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteGoal(goal.id);
                    }}
                    title="Delete goal"
                  >
                    <Trash2 size={14} className="mr-1 text-gray-600 hover:text-red-600" />
                    <span className="text-xs">Delete</span>
                  </button>
                </div>
              </div>
            </div>
          );
        })}
        
        {/* Add New Goal Card */}
        <div 
          className="bg-white rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center cursor-pointer hover:bg-gray-50 transition-colors duration-300 shadow-sm hover:shadow-md"
          onClick={() => {
            setIsEditing(false);
            setNewGoal({
              name: '',
              category: 'Travel',
              target_amount: '',
              current_amount: '',
              deadline: '',
              priority: 'Medium',
              color: '#10B981',
              notes: ''
            });
            setShowAddGoalForm(true);
          }}
        >
          <div className="text-center p-6">
            <div className="w-12 h-12 rounded-full bg-green-100 flex items-center justify-center mx-auto mb-3">
              <PlusCircle className="w-6 h-6 text-green-600" />
            </div>
            <p className="font-medium text-green-600">Add New Goal</p>
          </div>
        </div>
      </div>
    );
  };

  const renderAddGoalForm = () => {
    if (!showAddGoalForm) return null;
    
    return (
      <div className="fixed inset-0 overflow-y-auto z-50">
        <div className="flex items-center justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
          <div className="fixed inset-0 transition-opacity" aria-hidden="true">
            <div className="absolute inset-0 bg-gray-500 opacity-75" onClick={() => setShowAddGoalForm(false)}></div>
          </div>
  
          <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
            <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
              <div className="sm:flex sm:items-start">
                <div className="mt-3 text-center sm:mt-0 sm:text-left w-full">
                  <div className="flex justify-between items-center mb-5">
                    <h3 className="text-lg leading-6 font-medium text-gray-900">
                      {isEditing ? 'Edit Goal' : 'Create New Goal'}
                    </h3>
                    <button
                      type="button"
                      onClick={() => setShowAddGoalForm(false)}
                      className="text-gray-400 hover:text-gray-500"
                    >
                      <X size={20} />
                    </button>
                  </div>
  
                  <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Goal Name</label>
                      <input 
                        type="text" 
                        name="name" 
                        value={newGoal.name} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                        <select 
                          name="category" 
                          value={newGoal.category} 
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        >
                          {categories.map(category => (
                            <option key={category} value={category}>{category}</option>
                          ))}
                        </select>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Priority</label>
                        <select 
                          name="priority" 
                          value={newGoal.priority} 
                          onChange={handleInputChange}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        >
                          <option value="High">High</option>
                          <option value="Medium">Medium</option>
                          <option value="Low">Low</option>
                        </select>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ({symbol})</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            {symbol}
                          </span>
                          <input 
                            type="number" 
                            name="target_amount" 
                            value={newGoal.target_amount} 
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount ({symbol})</label>
                        <div className="relative">
                          <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                            {symbol}
                          </span>
                          <input 
                            type="number" 
                            name="current_amount" 
                            value={newGoal.current_amount} 
                            onChange={handleInputChange}
                            className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                            min="0"
                            step="0.01"
                            required
                          />
                        </div>
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Target Date</label>
                      <div className="relative">
                        <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                          <Calendar size={16} />
                        </span>
                        <input 
                          type="date" 
                          name="deadline" 
                          value={newGoal.deadline} 
                          onChange={handleInputChange}
                          className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                          required
                        />
                      </div>
                    </div>
                    
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Color</label>
                      <div className="flex space-x-3">
                        {colors.map(color => (
                          <div 
                            key={color}
                            className={`w-8 h-8 rounded-full cursor-pointer transition-all duration-200 ${newGoal.color === color ? 'ring-2 ring-offset-2 ring-gray-400 transform scale-110' : 'hover:scale-105'}`}
                            style={{ backgroundColor: color }}
                            onClick={() => setNewGoal({...newGoal, color})}
                          ></div>
                        ))}
                      </div>
                    </div>
                    
                    <div className="mb-5">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                      <textarea 
                        name="notes" 
                        value={newGoal.notes} 
                        onChange={handleInputChange}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all"
                        rows="3"
                      ></textarea>
                    </div>
                  </form>
                </div>
              </div>
            </div>
  
            <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
              <button
                type="button"
                onClick={handleSubmit}
                className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-emerald-600 text-base font-medium text-white hover:bg-emerald-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:ml-3 sm:w-auto sm:text-sm"
              >
                {isEditing ? 'Update Goal' : 'Create Goal'}
              </button>
              <button
                type="button"
                onClick={() => setShowAddGoalForm(false)}
                className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-emerald-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
              >
                Cancel
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  };

  
  const renderStats = () => {
    if (loading) return null;
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center mr-3">
              <Target className="w-5 h-5 text-blue-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Goals</p>
              <h3 className="text-xl font-bold">{stats.totalGoals}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-green-100 flex items-center justify-center mr-3">
              <span className="text-sm text-green-600">
                {symbol}
              </span>
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Target</p>
              <h3 className="text-xl font-bold">{symbol}{parseFloat(stats.totalTargetAmount).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-purple-100 flex items-center justify-center mr-3">
              <Wallet className="w-5 h-5 text-purple-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Saved</p>
              <h3 className="text-xl font-bold">{symbol}{parseFloat(stats.totalSavedAmount).toLocaleString()}</h3>
            </div>
          </div>
        </div>
        
        <div className="bg-white rounded-lg shadow p-4">
          <div className="flex items-center mb-2">
            <div className="w-10 h-10 rounded-full bg-amber-100 flex items-center justify-center mr-3">
              <PieChart className="w-5 h-5 text-amber-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Overall Progress</p>
              <h3 className="text-xl font-bold">
                {stats.totalTargetAmount ? 
                  Math.round((stats.totalSavedAmount / stats.totalTargetAmount) * 100) : 0}%
              </h3>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="flex-1 overflow-auto bg-gray-50 flex flex-col h-full">
      {/* Header */}
      <header className="bg-white p-6 border-b border-gray-200 shadow-sm">
        <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-emerald-800">
          Financial Goals
          <span className="ml-2 text-sm font-normal text-gray-500">Track your goals</span>
        </h1>
        </div>
      </header>

      {/* Main content */}
      <div className="p-6 flex-1 overflow-auto bg-gray-50 flex flex-col">
      
      {renderStats()}
      
      <div className="flex flex-wrap justify-between items-center mb-6">
        <div className="flex space-x-2 mb-3 sm:mb-0">
          <button
            className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors ${
              filter === 'all' ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
            }`}
            onClick={() => setFilter('all')}
          >
            All Goals
          </button>
          {categories.map(category => (
            <button
              key={category}
              className={`px-3 py-1.5 text-sm font-medium rounded-md transition-colors hidden md:block ${
                filter === category ? 'bg-green-600 text-white' : 'bg-white text-gray-700 hover:bg-gray-100'
              }`}
              onClick={() => setFilter(category)}
            >
              {category}
            </button>
          ))}
          <div className="relative md:hidden">
            <button
              className="px-3 py-1.5 text-sm font-medium rounded-md bg-white text-gray-700 hover:bg-gray-100 flex items-center"
            >
              <Filter size={14} className="mr-1" />
              Categories
            </button>
          </div>
        </div>
        
        <div className="flex space-x-2">
          <select
            className="px-3 py-1.5 text-sm font-medium rounded-md bg-white text-gray-700 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value)}
          >
            <option value="progress">Sort by Progress</option>
            <option value="amount">Sort by Amount</option>
            <option value="deadline">Sort by Deadline</option>
          </select>
        </div>
      </div>
      
      {renderGoalCards()}
      {renderAddGoalForm()}
      </div>
    </div>
  );
};

export default FinancialGoals;