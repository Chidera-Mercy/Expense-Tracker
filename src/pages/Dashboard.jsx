import React, { useState } from 'react';
import { Home, CreditCard, PieChart, Calendar, Target, User, Settings, LifeBuoy, DollarSign, Wallet, Banknote, Bookmark } from 'lucide-react';

const Dashboard = () => {
  const [userName, setUserName] = useState('Alex');

  return (
    <div className="flex-1 overflow-auto bg-gray-50">

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <header className="bg-white p-4 border-b shadow-sm">
          <h1 className="text-2xl font-bold text-emerald-800">Dashboard</h1>
        </header>

        {/* Welcome message */}
        <div className="p-6">
          <div className="bg-white rounded-lg shadow-md p-6 mb-6">
            <div className="flex items-start">
              <div className="bg-emerald-100 p-3 rounded-full">
                <User size={24} className="text-emerald-600" />
              </div>
              <div className="ml-4">
                <h2 className="text-xl font-semibold">Welcome to PennyPath, {userName}!</h2>
                <p className="text-gray-600 mt-1">What would you like to do today?</p>
              </div>
            </div>
          </div>

          {/* Quick action tiles */}
          <h3 className="text-lg font-medium text-gray-700 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
            <ActionCard
              icon={<CreditCard size={24} className="text-emerald-600" />}
              title="Add Expense"
              description="Record your latest purchase"
            />
            <ActionCard
              icon={<Banknote size={24} className="text-emerald-600" />}
              title="Record Income"
              description="Log your incoming money"
            />
            <ActionCard
              icon={<Wallet size={24} className="text-emerald-600" />}
              title="Set Budget"
              description="Create spending limits"
            />
            <ActionCard
              icon={<PieChart size={24} className="text-emerald-600" />}
              title="View Reports"
              description="Analyze your spending patterns"
            />
            <ActionCard
              icon={<Target size={24} className="text-emerald-600" />}
              title="Financial Goals"
              description="Track your savings progress"
            />
            <ActionCard
              icon={<DollarSign size={24} className="text-emerald-600" />}
              title="Create Categories"
              description="Organize your expenses"
            />
          </div>

          {/* Summary widgets */}
          <h3 className="text-lg font-medium text-gray-700 mb-4">Financial Summary</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            <SummaryWidget 
              title="Monthly Spending" 
              amount="$1,245.32" 
              change="-12%" 
              trend="down"
            />
            <SummaryWidget 
              title="Monthly Income" 
              amount="$3,850.00" 
              change="+5%" 
              trend="up"
            />
            <SummaryWidget 
              title="Budget Status" 
              amount="62%" 
              description="of monthly budget used" 
            />
          </div>
        </div>
      </div>
    </div>
  );
};

// Action card component
const ActionCard = ({ icon, title, description }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm hover:shadow border border-gray-100 cursor-pointer transition duration-150 ease-in-out">
      <div className="bg-emerald-50 w-12 h-12 rounded-full flex items-center justify-center mb-3">
        {icon}
      </div>
      <h4 className="font-medium text-gray-800">{title}</h4>
      <p className="text-sm text-gray-500 mt-1">{description}</p>
    </div>
  );
};

// Summary widget component
const SummaryWidget = ({ title, amount, change, trend, description }) => {
  return (
    <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-100">
      <h4 className="text-sm font-medium text-gray-500">{title}</h4>
      <div className="flex items-end mt-2">
        <div className="text-2xl font-bold text-gray-800">{amount}</div>
        {change && (
          <div className={`ml-2 text-sm ${trend === 'up' ? 'text-green-500' : 'text-red-500'}`}>
            {change}
          </div>
        )}
      </div>
      {description && <p className="text-xs text-gray-500 mt-1">{description}</p>}
    </div>
  );
};

export default Dashboard;