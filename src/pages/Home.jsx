import React, { useState, useEffect } from 'react';
import { 
  Home, CreditCard, PieChart, Calendar, Target, 
  Settings, LifeBuoy, Banknote, Wallet, ChevronLeft, ChevronRight, User
} from 'lucide-react';

import supabase from '../db/supabase';
import { UserAuth } from '../AuthContext';

// Import components
import Dashboard from './Dashboard';
import Expenses from './Expenses';
import Income from './Income';
import Budgets from './Budgets';
import Reports from './Reports';
import CalendarPage from './Calendar';
import FinancialGoals from './FinancialGoals';
import SettingsPage from './Settings';
import HelpAndSupport from './HelpAndSupport';

const HomePage = () => {
  const [activeSection, setActiveSection] = useState('Dashboard');
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userInitial, setUserInitial] = useState('');
  const [userName, setUserName] = useState('');
  
  // Get auth context
  const { session } = UserAuth();
  
  useEffect(() => {
    const fetchUserProfile = async () => {
      if (session?.user?.id) {
        // Assuming supabase is accessible here, if not, you may need to import it
        const { data, error } = await supabase
          .from('profiles')
          .select('first_name, last_name, avatar_url')
          .eq('id', session.user.id)
          .single();
          
        if (data && !error) {
          const fullName = `${data.first_name} ${data.last_name}`;
          setUserName(fullName);
          setUserInitial(data.first_name.charAt(0));
        } else {
          // Fallback to email if profile not found
          setUserName(session.user.email || 'User');
          setUserInitial((session.user.email || 'U').charAt(0));
        }
      }
    };
    
    fetchUserProfile();
  }, [session]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const sections = [
    { name: 'Dashboard', Component: Dashboard, icon: <Home size={20} /> },
    { name: 'Expenses', Component: Expenses, icon: <CreditCard size={20} /> },
    { name: 'Income', Component: Income, icon: <Banknote size={20} /> },
    { name: 'Budgets', Component: Budgets, icon: <Wallet size={20} /> },
    { name: 'Reports', Component: Reports, icon: <PieChart size={20} /> },
    { name: 'Calendar', Component: CalendarPage, icon: <Calendar size={20} /> },
    { name: 'Financial Goals', Component: FinancialGoals, icon: <Target size={20} /> },
    { name: 'Settings', Component: SettingsPage, icon: <Settings size={20} /> },
    { name: 'Help & Support', Component: HelpAndSupport, icon: <LifeBuoy size={20} /> }
  ];

  const renderActiveSection = () => {
    const currentSection = sections.find(section => section.name === activeSection);
    return currentSection && currentSection.Component 
      ? <currentSection.Component /> 
      : <Dashboard />;
  };

  // Navigation item component
  const NavItem = ({ icon, label, active }) => {
    return (
      <div 
        className={`flex items-center p-3 rounded-md mb-1 cursor-pointer transition-all duration-200 
                   ${active ? 'bg-emerald-700' : 'hover:bg-emerald-700/70'}`} 
        onClick={() => setActiveSection(label)}
      >
        <div className="text-emerald-200">{icon}</div>
        {!isSidebarCollapsed && (
          <span className="text-sm ml-3 whitespace-nowrap">{label}</span>
        )}
      </div>
    );
  };

  return (
    <div className="flex h-screen bg-gray-100">
      
      {/* Sidebar with toggle button */}
      <div 
        className={`bg-emerald-800 text-white transition-all duration-300 
                   ${isSidebarCollapsed ? 'w-16' : 'w-64'} relative`}
      >
        {/* Toggle button */}
        <button 
          onClick={toggleSidebar}
          className="absolute -right-3 top-16 bg-emerald-600 rounded-full p-1 shadow-md hover:bg-emerald-700 transition-colors"
        >
          {isSidebarCollapsed ? 
            <ChevronRight size={16} className="text-white" /> : 
            <ChevronLeft size={16} className="text-white" />
          }
        </button>
        
        {/* Profile section */}
        <div className={`flex items-center p-4 border-b border-emerald-700 ${isSidebarCollapsed ? 'justify-center' : ''}`}>
          <div className="bg-emerald-600 h-12 w-12 rounded-full flex items-center justify-center flex-shrink-0">
            <span className="text-xl font-bold">{userInitial}</span>
          </div>
          
          {!isSidebarCollapsed && (
            <div className="ml-3 overflow-hidden">
              <p className="font-medium truncate">{userName}</p>
              {session?.user?.email && (
                <p className="text-xs text-emerald-200 truncate">{session.user.email}</p>
              )}
            </div>
          )}
        </div>

        {/* Navigation */}
        <nav className="p-2">
          {sections.map((section) => (
            <NavItem 
              key={section.name}
              icon={section.icon} 
              label={section.name} 
              active={activeSection === section.name}
            />
          ))}
        </nav>
      </div>

      {/* Main content */}
      <div className="flex-1 overflow-auto">
        {renderActiveSection()}
      </div>
      
    </div>
  );
};

export default HomePage;