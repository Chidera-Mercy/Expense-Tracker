import { useState, useEffect, useContext } from 'react';
import { UserAuth } from '../AuthContext';
import { 
  ChevronLeft, 
  ChevronRight, 
  Calendar as CalendarIcon, 
  X, 
  ArrowDown, 
  ArrowUp,
  Loader
} from 'lucide-react';
import { 
  fetchTransactionsForDateRange, 
  getMonthDateRange,
  getWeekDateRange
} from '../db/calendar.js';

const CalendarPage = () => {
  const { user } = UserAuth();
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedDateDetails, setSelectedDateDetails] = useState(false);
  const [viewMode, setViewMode] = useState('month'); // 'month', 'week', or 'day'
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [dateRange, setDateRange] = useState({ startDate: null, endDate: null });

  // Fetch transactions when month/week/day changes
  useEffect(() => {
    const fetchData = async () => {
      if (!user?.id) return;
      
      setLoading(true);
      let start, end;
      
      if (viewMode === 'month') {
        const range = getMonthDateRange(currentMonth.getFullYear(), currentMonth.getMonth());
        start = range.startDate;
        end = range.endDate;
      } else if (viewMode === 'week') {
        const range = getWeekDateRange(currentMonth);
        start = range.startDate;
        end = range.endDate;
      } else { // day view
        start = currentMonth.toISOString().split('T')[0];
        end = start;
      }
      
      setDateRange({ startDate: start, endDate: end });
      
      try {
        const data = await fetchTransactionsForDateRange(user.id, start, end);
        setTransactions(data);
      } catch (error) {
        console.error('Error fetching calendar data:', error);
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [currentMonth, viewMode, user]);

  // Function to get days in month
  const getDaysInMonth = (year, month) => {
    return new Date(year, month + 1, 0).getDate();
  };

  // Function to get first day of month (0 = Sunday, 1 = Monday, etc.)
  const getFirstDayOfMonth = (year, month) => {
    return new Date(year, month, 1).getDay();
  };

  // Navigation functions
  const prevPeriod = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentMonth);
      newDate.setDate(currentMonth.getDate() - 7);
      setCurrentMonth(newDate);
    } else { // day
      const newDate = new Date(currentMonth);
      newDate.setDate(currentMonth.getDate() - 1);
      setCurrentMonth(newDate);
    }
    setSelectedDate(null);
    setSelectedDateDetails(false);
  };

  const nextPeriod = () => {
    if (viewMode === 'month') {
      setCurrentMonth(new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1));
    } else if (viewMode === 'week') {
      const newDate = new Date(currentMonth);
      newDate.setDate(currentMonth.getDate() + 7);
      setCurrentMonth(newDate);
    } else { // day
      const newDate = new Date(currentMonth);
      newDate.setDate(currentMonth.getDate() + 1);
      setCurrentMonth(newDate);
    }
    setSelectedDate(null);
    setSelectedDateDetails(false);
  };

  const goToToday = () => {
    const today = new Date();
    setCurrentMonth(today);
    setSelectedDate(today.toISOString().split('T')[0]);
    
    if (viewMode === 'day') {
      setSelectedDateDetails(true);
    } else {
      setSelectedDateDetails(false);
    }
  };

  // Function to set view mode
  const changeViewMode = (mode) => {
    setViewMode(mode);
    setSelectedDate(null);
    setSelectedDateDetails(false);
    
    // If changing to day view, set the selected date to current day
    if (mode === 'day') {
      const dayDate = currentMonth.toISOString().split('T')[0];
      setSelectedDate(dayDate);
      setSelectedDateDetails(true);
    }
  };

  // Render header with month/week/day navigation
  const renderCalendarHeader = () => {
    const monthNames = ["January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];
    
    let headerText = '';
    
    if (viewMode === 'month') {
      headerText = `${monthNames[currentMonth.getMonth()]} ${currentMonth.getFullYear()}`;
    } else if (viewMode === 'week') {
      const weekStart = new Date(dateRange.startDate);
      const weekEnd = new Date(dateRange.endDate);
      
      if (weekStart.getMonth() === weekEnd.getMonth()) {
        headerText = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      } else {
        headerText = `${monthNames[weekStart.getMonth()]} ${weekStart.getDate()} - ${monthNames[weekEnd.getMonth()]} ${weekEnd.getDate()}, ${weekStart.getFullYear()}`;
      }
    } else { // day view
      headerText = currentMonth.toLocaleDateString('en-US', { 
        weekday: 'long', 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      });
    }
    
    return (
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-semibold">
          {headerText}
        </h2>
        <div className="flex items-center space-x-2">
          <button 
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={prevPeriod}
          >
            <ChevronLeft className="w-5 h-5" />
          </button>
          <button 
            className="px-3 py-1 bg-green-600 text-white rounded-md hover:bg-green-700"
            onClick={goToToday}
          >
            Today
          </button>
          <button 
            className="p-2 rounded-md hover:bg-gray-100"
            onClick={nextPeriod}
          >
            <ChevronRight className="w-5 h-5" />
          </button>
        </div>
      </div>
    );
  };

  const renderCalendarDays = () => {
    if (viewMode === 'day') return null;
    
    const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
    
    return (
      <div className="grid grid-cols-7 gap-1 mb-1">
        {days.map((day, index) => (
          <div 
            key={index} 
            className="py-2 text-center text-sm font-medium text-gray-600"
          >
            {day}
          </div>
        ))}
      </div>
    );
  };

  const renderMonthView = () => {
    if (viewMode !== 'month') return null;
    
    const year = currentMonth.getFullYear();
    const month = currentMonth.getMonth();
    const daysInMonth = getDaysInMonth(year, month);
    const firstDayOfMonth = getFirstDayOfMonth(year, month);
    
    const today = new Date().toISOString().split('T')[0];
    
    // Generate date strings for the current month
    const currentMonthDates = [];
    for (let i = 1; i <= daysInMonth; i++) {
      const date = new Date(year, month, i);
      currentMonthDates.push(date.toISOString().split('T')[0]);
    }
    
    // Group transactions by date
    const transactionsByDate = {};
    transactions.forEach(transaction => {
      if (!transactionsByDate[transaction.date]) {
        transactionsByDate[transaction.date] = [];
      }
      transactionsByDate[transaction.date].push(transaction);
    });
    
    // Create calendar grid
    const calendarDays = [];
    
    // Add empty cells for days before the first day of month
    for (let i = 0; i < firstDayOfMonth; i++) {
      calendarDays.push(<div key={`empty-${i}`} className="bg-gray-50 rounded-md p-2 min-h-24"></div>);
    }
    
    // Add cells for days in month
    for (let day = 1; day <= daysInMonth; day++) {
      const date = new Date(year, month, day).toISOString().split('T')[0];
      const isToday = date === today;
      const isSelected = date === selectedDate;
      const dayTransactions = transactionsByDate[date] || [];
      
      // Calculate daily totals
      let dailyExpense = 0;
      let dailyIncome = 0;
      
      dayTransactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          dailyExpense += transaction.amount;
        } else {
          dailyIncome += transaction.amount;
        }
      });
      
      calendarDays.push(
        <div 
          key={day}
          className={`bg-white rounded-md p-2 min-h-24 border ${
            isSelected ? 'border-green-500 shadow-md' : 'border-gray-200'
          } ${isToday ? 'bg-green-50' : ''} cursor-pointer hover:border-green-300 transition-all duration-200`}
          onClick={() => {
            setSelectedDate(date);
            setSelectedDateDetails(!selectedDateDetails || selectedDate !== date);
          }}
        >
          <div className="flex justify-between items-center mb-1">
            <span className={`rounded-full w-6 h-6 flex items-center justify-center text-sm ${
              isToday ? 'bg-green-500 text-white' : ''
            }`}>
              {day}
            </span>
            {dayTransactions.length > 0 && (
              <span className="text-xs bg-gray-200 rounded-full px-2">
                {dayTransactions.length}
              </span>
            )}
          </div>
          
          {dailyIncome > 0 && (
            <div className="text-xs text-green-600 font-medium">
              +${dailyIncome.toLocaleString()}
            </div>
          )}
          
          {dailyExpense > 0 && (
            <div className="text-xs text-red-600 font-medium">
              -${dailyExpense.toLocaleString()}
            </div>
          )}
          
          <div className="mt-1 overflow-hidden">
            {dayTransactions.slice(0, 2).map((transaction, index) => (
              <div 
                key={transaction.id}
                className={`text-xs rounded py-0.5 px-1 mb-0.5 truncate ${
                  transaction.type === 'expense' ? 'bg-red-100 text-red-800' : 'bg-green-100 text-green-800'
                }`}
                style={{
                  backgroundColor: transaction.type === 'expense' ? 
                    `${transaction.categoryColor}20` : // 20 is hex for 12% opacity
                    'rgba(74, 222, 128, 0.2)',
                  color: transaction.type === 'expense' ? 
                    transaction.categoryColor : 
                    '#22c55e'
                }}
              >
                {transaction.category}: ${transaction.amount.toLocaleString()}
              </div>
            ))}
            {dayTransactions.length > 2 && (
              <div className="text-xs text-gray-500">
                +{dayTransactions.length - 2} more
              </div>
            )}
          </div>
        </div>
      );
    }
    
    // Add empty cells for days after the end of month to complete the grid
    const totalCells = calendarDays.length;
    const rowsNeeded = Math.ceil(totalCells / 7);
    const totalCellsNeeded = rowsNeeded * 7;
    
    for (let i = totalCells; i < totalCellsNeeded; i++) {
      calendarDays.push(<div key={`end-empty-${i}`} className="bg-gray-50 rounded-md p-2 min-h-24"></div>);
    }
    
    return (
      <div className="grid grid-cols-7 gap-1">
        {calendarDays}
      </div>
    );
  };

  const renderWeekView = () => {
    if (viewMode !== 'week') return null;
    
    // Get week start and end dates
    const weekStart = new Date(dateRange.startDate);
    const weekEnd = new Date(dateRange.endDate);
    const today = new Date().toISOString().split('T')[0];
    
    // Group transactions by date
    const transactionsByDate = {};
    transactions.forEach(transaction => {
      if (!transactionsByDate[transaction.date]) {
        transactionsByDate[transaction.date] = [];
      }
      transactionsByDate[transaction.date].push(transaction);
    });
    
    // Create week days
    const weekDays = [];
    for (let i = 0; i < 7; i++) {
      const currentDate = new Date(weekStart);
      currentDate.setDate(weekStart.getDate() + i);
      const dateStr = currentDate.toISOString().split('T')[0];
      const isToday = dateStr === today;
      const isSelected = dateStr === selectedDate;
      
      const dayTransactions = transactionsByDate[dateStr] || [];
      
      // Calculate daily totals
      let dailyExpense = 0;
      let dailyIncome = 0;
      
      dayTransactions.forEach(transaction => {
        if (transaction.type === 'expense') {
          dailyExpense += transaction.amount;
        } else {
          dailyIncome += transaction.amount;
        }
      });
      
      const dayName = currentDate.toLocaleDateString('en-US', { weekday: 'short' });
      const dayNumber = currentDate.getDate();
      const monthShort = currentDate.toLocaleDateString('en-US', { month: 'short' });
      
      weekDays.push(
        <div 
          key={i}
          className={`bg-white rounded-md border ${
            isSelected ? 'border-green-500 shadow-md' : 'border-gray-200'
          } ${isToday ? 'bg-green-50' : ''} cursor-pointer hover:border-green-300 transition-all duration-200`}
          onClick={() => {
            setSelectedDate(dateStr);
            setSelectedDateDetails(!selectedDateDetails || selectedDate !== dateStr);
          }}
        >
          <div className="p-3 border-b border-gray-100">
            <div className="flex justify-between items-center">
              <div>
                <div className="font-medium">{dayName}</div>
                <div className="text-sm text-gray-500">{monthShort} {dayNumber}</div>
              </div>
              {dayTransactions.length > 0 && (
                <span className="text-xs bg-gray-200 rounded-full px-2 py-1">
                  {dayTransactions.length}
                </span>
              )}
            </div>
          </div>
          
          <div className="p-3">
            {dailyIncome > 0 && (
              <div className="text-sm text-green-600 font-medium mb-1">
                +${dailyIncome.toLocaleString()}
              </div>
            )}
            
            {dailyExpense > 0 && (
              <div className="text-sm text-red-600 font-medium mb-1">
                -${dailyExpense.toLocaleString()}
              </div>
            )}
            
            <div className="space-y-2 mt-2">
              {dayTransactions.slice(0, 3).map((transaction) => (
                <div 
                  key={transaction.id}
                  className="text-xs p-2 rounded-md"
                  style={{
                    backgroundColor: transaction.type === 'expense' ? 
                      `${transaction.categoryColor}20` : // 20 is hex for 12% opacity
                      'rgba(74, 222, 128, 0.2)',
                    color: transaction.type === 'expense' ? 
                      transaction.categoryColor : 
                      '#22c55e'
                  }}
                >
                  <div className="font-medium">{transaction.category}</div>
                  <div className="flex justify-between items-center">
                    <div className="truncate">{transaction.description}</div>
                    <div>${transaction.amount.toLocaleString()}</div>
                  </div>
                </div>
              ))}
              
              {dayTransactions.length > 3 && (
                <div className="text-xs text-gray-500 text-center mt-2">
                  +{dayTransactions.length - 3} more
                </div>
              )}
            </div>
          </div>
        </div>
      );
    }
    
    return (
      <div className="grid grid-cols-1 md:grid-cols-7 gap-3">
        {weekDays}
      </div>
    );
  };

  const renderDayView = () => {
    if (viewMode !== 'day') return null;
    
    const dateStr = currentMonth.toISOString().split('T')[0];
    const dayTransactions = transactions.filter(t => t.date === dateStr);
    
    if (dayTransactions.length === 0) {
      return (
        <div className="bg-white p-6 rounded-md shadow-sm border border-gray-200 text-center">
          <CalendarIcon className="w-12 h-12 mx-auto text-gray-400 mb-3" />
          <h3 className="text-lg font-medium text-gray-700">No transactions</h3>
          <p className="text-gray-500 mt-1">No financial activity recorded for this day.</p>
        </div>
      );
    }
    
    // Group transactions by category
    const groupedTransactions = {};
    dayTransactions.forEach(transaction => {
      if (!groupedTransactions[transaction.category]) {
        groupedTransactions[transaction.category] = {
          category: transaction.category,
          color: transaction.categoryColor,
          icon: transaction.categoryIcon,
          transactions: [],
          total: 0
        };
      }
      
      groupedTransactions[transaction.category].transactions.push(transaction);
      
      if (transaction.type === 'expense') {
        groupedTransactions[transaction.category].total -= transaction.amount;
      } else {
        groupedTransactions[transaction.category].total += transaction.amount;
      }
    });
    
    return (
      <div className="space-y-4">
        {Object.values(groupedTransactions).map((group, index) => (
          <div key={index} className="bg-white rounded-md border border-gray-200 overflow-hidden">
            <div 
              className="p-3 border-b border-gray-100 flex justify-between items-center"
              style={{ backgroundColor: `${group.color}10` }}
            >
              <div className="font-medium" style={{ color: group.color }}>
                {group.category}
              </div>
              <div className={group.total >= 0 ? 'text-green-600' : 'text-red-600'}>
                {group.total >= 0 ? '+' : ''}{group.total.toLocaleString('en-US', {
                  style: 'currency',
                  currency: 'USD'
                })}
              </div>
            </div>
            
            <div className="divide-y divide-gray-100">
              {group.transactions.map(transaction => (
                <div key={transaction.id} className="p-3 hover:bg-gray-50">
                  <div className="flex justify-between items-center">
                    <div>
                      <div className="font-medium">{transaction.description}</div>
                      <div className="text-xs text-gray-500">
                        {new Date(transaction.date).toLocaleDateString()}
                        {transaction.isRecurring && ' · Recurring'}
                      </div>
                    </div>
                    <div className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                      {transaction.type === 'expense' ? '-' : '+'}{transaction.amount.toLocaleString('en-US', {
                        style: 'currency',
                        currency: 'USD'
                      })}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
    );
  };

  const renderTransactionDetails = () => {
    if (!selectedDate || !selectedDateDetails) return null;
    
    const dayTransactions = transactions.filter(transaction => transaction.date === selectedDate);
    
    if (dayTransactions.length === 0) {
      return (
        <div className="bg-white rounded-lg shadow p-6 mt-6 relative">
          <button 
            className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
            onClick={() => setSelectedDateDetails(false)}
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
          
          <h3 className="text-lg font-semibold mb-2">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
          <p className="text-gray-500">No transactions for this date.</p>
        </div>
      );
    }
    
    // Calculate totals
    let totalExpense = 0;
    let totalIncome = 0;
    
    dayTransactions.forEach(transaction => {
      if (transaction.type === 'expense') {
        totalExpense += transaction.amount;
      } else {
        totalIncome += transaction.amount;
      }
    });
    
    return (
      <div className="bg-white rounded-lg shadow p-6 mt-6 relative">
        <button 
          className="absolute top-4 right-4 p-1 rounded-full hover:bg-gray-100"
          onClick={() => setSelectedDateDetails(false)}
        >
          <X className="w-5 h-5 text-gray-500" />
        </button>
        
        <div className="mb-4">
          <h3 className="text-lg font-semibold">
            {new Date(selectedDate).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Income</p>
            <p className="text-lg font-semibold text-green-600">+${totalIncome.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Expenses</p>
            <p className="text-lg font-semibold text-red-600">-${totalExpense.toLocaleString()}</p>
          </div>
          <div className="bg-gray-50 p-3 rounded-md">
            <p className="text-sm text-gray-500">Net</p>
            <p className={`text-lg font-semibold ${totalIncome - totalExpense >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              ${(totalIncome - totalExpense).toLocaleString()}
            </p>
          </div>
        </div>
        
        <h4 className="font-medium mb-2">Transactions</h4>
        <div className="divide-y divide-gray-200">
          {dayTransactions.map(transaction => (
            <div key={transaction.id} className="py-3 flex items-center justify-between">
              <div className="flex items-center">
                <div 
                  className="w-10 h-10 rounded-full flex items-center justify-center"
                  style={{ 
                    backgroundColor: transaction.type === 'expense' ? 
                      `${transaction.categoryColor}20` : 
                      'rgba(74, 222, 128, 0.2)',
                    color: transaction.type === 'expense' ? 
                      transaction.categoryColor : 
                      '#22c55e'
                  }}
                >
                  {transaction.type === 'expense' ? (
                    <ArrowDown className="w-5 h-5" />
                  ) : (
                    <ArrowUp className="w-5 h-5" />
                  )}
                </div>
                <div className="ml-4">
                  <p className="font-medium">{transaction.category}</p>
                  <p className="text-sm text-gray-500">{transaction.description}</p>
                </div>
              </div>
              <div className={transaction.type === 'expense' ? 'text-red-600' : 'text-green-600'}>
                {transaction.type === 'expense' ? '-' : '+'}${transaction.amount.toLocaleString()}
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="p-6">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold text-gray-800">Financial Calendar</h1>
        <div className="flex space-x-2">
          <button 
            className={`px-3 py-1.5 rounded-md ${viewMode === 'month' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} transition-colors duration-200`}
            onClick={() => changeViewMode('month')}
          >
            Month
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md ${viewMode === 'week' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} transition-colors duration-200`}
            onClick={() => changeViewMode('week')}
          >
            Week
          </button>
          <button 
            className={`px-3 py-1.5 rounded-md ${viewMode === 'day' ? 'bg-green-600 text-white' : 'bg-gray-200 text-gray-700'} transition-colors duration-200`}
            onClick={() => changeViewMode('day')}
          >
            Day
          </button>
        </div>
      </div>
      
      <div className="bg-white rounded-lg shadow p-6">
        {renderCalendarHeader()}
        {renderCalendarDays()}
        
        {loading ? (
          <div className="flex justify-center items-center py-12">
            <Loader className="w-8 h-8 text-green-600 animate-spin" />
          </div>
        ) : (
          <>
            {renderMonthView()}
            {renderWeekView()}
            {renderDayView()}
          </>
        )}
      </div>
      
      {selectedDateDetails && renderTransactionDetails()}
    </div>
  );
};

export default CalendarPage;