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
  TrendingUp
} from 'lucide-react';
import { 
  fetchGoals, 
  createGoal, 
  updateGoal, 
  updateGoalProgress,
  deleteGoal,
  getGoalStats
} from '../db/goals.js';

const FinancialGoals = () => {
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
      const { data: goalsData, error: goalsError } = await fetchGoals();
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
      if (isEditing && selectedGoal) {
        // Update existing goal
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
        
        const { error } = await updateGoal(selectedGoal.id, goalData);
        if (error) throw error;
        
        toast.success("Goal updated successfully!");
        setIsEditing(false);
      } else {
        // Add new goal
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
        
        const { error } = await createGoal(goalData);
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

  // Select a goal to view details
  const viewGoalDetails = (goal) => {
    setSelectedGoal(goal);
  };

  // Close goal details modal
  const closeGoalDetails = () => {
    setSelectedGoal(null);
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
          
          return (
            <div 
              key={goal.id}
              className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300 cursor-pointer overflow-hidden"
              onClick={() => viewGoalDetails(goal)}
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
                
                <div className="mb-4">
                  <div className="flex justify-between text-sm mb-1">
                    <span className="font-medium">${parseFloat(goal.current_amount).toLocaleString()} of ${parseFloat(goal.target_amount).toLocaleString()}</span>
                    <span className="font-medium">{progress}%</span>
                  </div>
                  <div className="w-full bg-gray-100 rounded-full h-2.5">
                    <div 
                      className="h-2.5 rounded-full transition-all duration-500 ease-in-out" 
                      style={{ width: `${progress}%`, backgroundColor: goal.color }}
                    ></div>
                  </div>
                </div>
                
                <div className="flex justify-between items-center text-sm text-gray-500">
                  <div className="flex items-center">
                    <Clock size={16} className="mr-1" />
                    {calculateTimeRemaining(goal.deadline)}
                  </div>
                  <span>
                    ${(goal.target_amount - goal.current_amount).toLocaleString()} left
                  </span>
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
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold">{isEditing ? 'Edit Goal' : 'Create New Goal'}</h3>
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={() => setShowAddGoalForm(false)}
            >
              <XCircle size={22} />
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                >
                  <option value="High">High</option>
                  <option value="Medium">Medium</option>
                  <option value="Low">Low</option>
                </select>
              </div>
            </div>
            
            <div className="grid grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Target Amount ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <DollarSign size={16} />
                  </span>
                  <input 
                    type="number" 
                    name="target_amount" 
                    value={newGoal.target_amount} 
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    min="0"
                    step="0.01"
                    required
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount ($)</label>
                <div className="relative">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <DollarSign size={16} />
                  </span>
                  <input 
                    type="number" 
                    name="current_amount" 
                    value={newGoal.current_amount} 
                    onChange={handleInputChange}
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                  className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                rows="3"
              ></textarea>
            </div>
            
            <div className="flex justify-end space-x-3">
              <button
                type="button"
                onClick={() => setShowAddGoalForm(false)}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
              >
                {isEditing ? 'Update Goal' : 'Create Goal'}
              </button>
            </div>
          </form>
        </div>
      </div>
    );
  };

  const renderGoalDetails = () => {
    if (!selectedGoal) return null;
    
    const progress = Math.min(Math.round((selectedGoal.current_amount / selectedGoal.target_amount) * 100), 100);
    const monthlyContribution = calculateMonthlyContribution(selectedGoal);
    
    return (
      <div className="fixed inset-0 bg-black bg-opacity-30 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-white rounded-lg shadow-xl max-w-lg w-full p-6 max-h-screen overflow-y-auto">
          <div className="flex justify-between items-center mb-5">
            <h3 className="text-lg font-semibold">Goal Details</h3>
            <button 
              className="text-gray-400 hover:text-gray-600 transition-colors"
              onClick={closeGoalDetails}
            >
              <XCircle size={22} />
            </button>
          </div>
          
          <div className="mb-6">
            <div className="flex justify-between items-center mb-3">
              <h2 className="text-xl font-bold">{selectedGoal.name}</h2>
              <span className={`text-sm px-2 py-1 rounded-full ${
                  selectedGoal.priority === 'High' ? 'bg-red-100 text-red-800' :
                  selectedGoal.priority === 'Medium' ? 'bg-yellow-100 text-yellow-800' :
                  'bg-green-100 text-green-800'
                }`}>
                  {selectedGoal.priority}
                </span>
            </div>
            
            <div className="h-2 w-full mb-6" style={{ backgroundColor: selectedGoal.color }}></div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <DollarSign size={18} className="text-gray-500 mr-2" />
                  <h4 className="font-medium">Target Amount</h4>
                </div>
                <p className="text-2xl font-bold">${parseFloat(selectedGoal.target_amount).toLocaleString()}</p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Wallet size={18} className="text-gray-500 mr-2" />
                  <h4 className="font-medium">Current Savings</h4>
                </div>
                <p className="text-2xl font-bold">${parseFloat(selectedGoal.current_amount).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="bg-gray-50 rounded-lg p-4 mb-6">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center">
                  <Target size={18} className="text-gray-500 mr-2" />
                  <h4 className="font-medium">Progress</h4>
                </div>
                <span className="font-medium">{progress}%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-3 mb-2">
                <div 
                  className="h-3 rounded-full transition-all duration-500 ease-in-out" 
                  style={{ width: `${progress}%`, backgroundColor: selectedGoal.color }}
                ></div>
              </div>
              <p className="text-sm text-gray-500 text-right">
                ${(selectedGoal.target_amount - selectedGoal.current_amount).toLocaleString()} remaining
              </p>
            </div>
            
            <div className="grid grid-cols-2 gap-6 mb-6">
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <Calendar size={18} className="text-gray-500 mr-2" />
                  <h4 className="font-medium">Target Date</h4>
                </div>
                <p className="font-medium">
                  {new Date(selectedGoal.deadline).toLocaleDateString('en-US', {
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric'
                  })}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  {calculateTimeRemaining(selectedGoal.deadline)}
                </p>
              </div>
              
              <div className="bg-gray-50 rounded-lg p-4">
                <div className="flex items-center mb-2">
                  <TrendingUp size={18} className="text-gray-500 mr-2" />
                  <h4 className="font-medium">Monthly Target</h4>
                </div>
                <p className="font-medium">${monthlyContribution}</p>
                <p className="text-sm text-gray-500 mt-1">
                  Recommended monthly savings
                </p>
              </div>
            </div>
            
            {selectedGoal.notes && (
              <div className="mb-6">
                <h4 className="font-medium mb-2">Notes</h4>
                <p className="text-gray-700 bg-gray-50 p-4 rounded-lg">{selectedGoal.notes}</p>
              </div>
            )}
            
            <div className="mb-6">
              <h4 className="font-medium mb-3">Update Progress</h4>
              <div className="flex items-center">
                <div className="relative flex-grow mr-3">
                  <span className="absolute inset-y-0 left-0 flex items-center pl-3 text-gray-500">
                    <DollarSign size={16} />
                  </span>
                  <input 
                    type="number" 
                    className="w-full pl-9 pr-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-transparent transition-all"
                    placeholder="Enter new amount"
                    defaultValue={selectedGoal.current_amount}
                    id="update-progress-input"
                    min="0"
                    step="0.01"
                  />
                </div>
                <button
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2"
                  onClick={() => {
                    const newAmount = document.getElementById('update-progress-input').value;
                    handleUpdateGoalProgress(selectedGoal.id, newAmount);
                  }}
                >
                  <Save size={16} className="inline mr-1" />
                  Update
                </button>
              </div>
            </div>
            
            <div className="flex justify-between">
              <button
                className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-md hover:bg-gray-200 transition-colors focus:outline-none focus:ring-2 focus:ring-gray-300"
                onClick={() => {
                  closeGoalDetails();
                  editGoal(selectedGoal);
                }}
              >
                <Edit size={16} className="mr-1" />
                Edit Goal
              </button>
              <button
                className="flex items-center px-4 py-2 text-sm font-medium text-white bg-red-600 rounded-md hover:bg-red-700 transition-colors focus:outline-none focus:ring-2 focus:ring-red-500 focus:ring-offset-2"
                onClick={() => {
                  handleDeleteGoal(selectedGoal.id);
                  closeGoalDetails();
                }}
              >
                <Trash2 size={16} className="mr-1" />
                Delete Goal
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
              <DollarSign className="w-5 h-5 text-green-600" />
            </div>
            <div>
              <p className="text-sm text-gray-500">Total Target</p>
              <h3 className="text-xl font-bold">${parseFloat(stats.totalTargetAmount).toLocaleString()}</h3>
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
              <h3 className="text-xl font-bold">${parseFloat(stats.totalSavedAmount).toLocaleString()}</h3>
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
    <div className="container mx-auto px-4 py-8 max-w-7xl">
      <h1 className="text-2xl font-bold mb-6">Financial Goals</h1>
      
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
      {renderGoalDetails()}
    </div>
  );
};

export default FinancialGoals;