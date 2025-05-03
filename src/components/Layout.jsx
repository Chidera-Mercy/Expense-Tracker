import React, { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation } from 'react-router-dom';
import { 
  Home, CreditCard, PieChart, Calendar, Target, 
  Settings, LifeBuoy, Banknote, Wallet, ChevronLeft, ChevronRight
} from 'lucide-react';
import { UserAuth } from '../AuthContext';

const Layout = () => {
  const [isSidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [userInitial, setUserInitial] = useState('U');
  const [userName, setUserName] = useState('User');
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Get auth context
  const { session, profile } = UserAuth();
  
  // Use useEffect to update user information when profile changes
  useEffect(() => {
    if (profile) {
      const fullName = `${profile.first_name || ''} ${profile.last_name || ''}`.trim();
      setUserName(fullName || profile.email || 'User');
      setUserInitial((profile.first_name || '').charAt(0) || (profile.email || 'U').charAt(0));
    }
  }, [profile]);

  const toggleSidebar = () => {
    setSidebarCollapsed(!isSidebarCollapsed);
  };

  const navigationLinks = [
    { name: 'Dashboard', path: '/dashboard', icon: <Home size={20} /> },
    { name: 'Expenses', path: '/expenses', icon: <CreditCard size={20} /> },
    { name: 'Income', path: '/income', icon: <Banknote size={20} /> },
    { name: 'Budgets', path: '/budgets', icon: <Wallet size={20} /> },
    { name: 'Calendar', path: '/calendar', icon: <Calendar size={20} /> },
    { name: 'Financial Goals', path: '/goals', icon: <Target size={20} /> },
    { name: 'Reports', path: '/reports', icon: <PieChart size={20} /> },
    { name: 'Settings', path: '/settings', icon: <Settings size={20} /> },
    { name: 'Help & Support', path: '/help', icon: <LifeBuoy size={20} /> }
  ];

  // Navigation item component
  const NavItem = ({ icon, label, path }) => {
    const isActive = location.pathname === path;
    
    return (
      <div 
        className={`flex items-center p-3 rounded-md mb-1 cursor-pointer transition-all duration-200 
                   ${isActive ? 'bg-emerald-700' : 'hover:bg-emerald-700/70'}`} 
        onClick={() => navigate(path)}
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
            {profile?.avatar_url ? (
              <img 
                src={profile.avatar_url} 
                alt={`${userName} avatar`}
                className="h-12 w-12 rounded-full object-cover"
              />
            ) : (
              <span className="text-xl font-bold">{userInitial}</span>
            )}
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
          {navigationLinks.map((link) => (
            <NavItem 
              key={link.name}
              icon={link.icon} 
              label={link.name} 
              path={link.path}
            />
          ))}
        </nav>
      </div>

      {/* Main content - using Outlet from React Router */}
      <div className="flex-1 overflow-auto">
        <Outlet />
      </div>
      
    </div>
  );
};

export default Layout;