import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContextProvider } from './AuthContext';
import ProtectedRoute from './ProtectedRoute';
import { CurrencyProvider } from './CurrencyContext';

// Import pages
import LandingPage from './pages/LandingPage';
import Signup from './pages/Signup';
import Login from './pages/Login';
import Layout from './components/Layout';

// Import all the section pages
import Dashboard from './pages/Dashboard';
import Expenses from './pages/Expenses';
import Income from './pages/Income';
import Budgets from './pages/Budgets';
import Reports from './pages/Reports';
import CalendarPage from './pages/Calendar';
import FinancialGoals from './pages/FinancialGoals';
import SettingsPage from './pages/Settings';
import HelpAndSupport from './pages/HelpAndSupport';

function App() {
  return (
    <AuthContextProvider>
      <CurrencyProvider >
        <Router>
          <Routes>
            {/* Public routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/login" element={<Login />} />
            <Route path="/signup" element={<Signup />} />
            
            {/* Protected routes - require authentication */}
            <Route path="/" element={
              <ProtectedRoute>
                <Layout />
              </ProtectedRoute>
            }>
              {/* Nested routes that will appear within the Layout */}
              <Route path="dashboard" element={<Dashboard />} />
              <Route path="expenses" element={<Expenses />} />
              <Route path="income" element={<Income />} />
              <Route path="budgets" element={<Budgets />} />
              <Route path="reports" element={<Reports />} />
              <Route path="calendar" element={<CalendarPage />} />
              <Route path="goals" element={<FinancialGoals />} />
              <Route path="settings" element={<SettingsPage />} />
              <Route path="help" element={<HelpAndSupport />} />
              
              {/* Redirect /home to /dashboard */}
              <Route path="home" element={<Navigate to="/dashboard" replace />} />
            </Route>
            
            {/* Catch all - 404 page */}
            <Route path="*" element={<div>404 - Page Not Found</div>} />
          </Routes>
        </Router>
      </CurrencyProvider>
    </AuthContextProvider>
  );
}

export default App;