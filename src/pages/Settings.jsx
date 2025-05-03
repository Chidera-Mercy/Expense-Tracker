import React, { useState, useEffect } from 'react';
import { Save, User, LogOut, AlertTriangle } from 'lucide-react';
import { UserAuth } from '../AuthContext';
import { useCurrency, CURRENCY_SYMBOLS } from '../CurrencyContext';
import { fetchUserProfile, updateUserProfile, deleteUserAccount } from '../db/settings.js';

const SettingsPage = () => {
  const { user, signOut } = UserAuth();
  const { currency, updateCurrency } = useCurrency();
  const [currentTab, setCurrentTab] = useState('profile');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState(currency);
  const [loading, setLoading] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  
  // Fetch user profile on component mount
  useEffect(() => {
    const loadUserProfile = async () => {
      if (user) {
        setLoading(true);
        try {
          const profile = await fetchUserProfile(user.id);
          if (profile) {
            setFirstName(profile.first_name || '');
            setLastName(profile.last_name || '');
            setEmail(profile.email || user.email || '');
            setSelectedCurrency(profile.currency || currency);
          }
        } catch (err) {
          setError('Failed to load profile');
          console.error('Error loading profile:', err);
        } finally {
          setLoading(false);
        }
      }
    };

    loadUserProfile();
  }, [user, currency]);

  const handleSaveSettings = async () => {
    setLoading(true);
    setSaveSuccess(false);
    setError(null);
    
    try {
      // Update profile data
      await updateUserProfile(user.id, {
        first_name: firstName,
        last_name: lastName
      });
      
      // Update currency preference using the context
      if (selectedCurrency !== currency) {
        await updateCurrency(selectedCurrency);
      }
      
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000); // Clear success message after 3 seconds
    } catch (err) {
      setError('Failed to save settings');
      console.error('Error saving settings:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    try {
      await signOut();
      // Redirect will be handled by auth state change in your authentication context
    } catch (err) {
      setError('Failed to log out');
      console.error('Error logging out:', err);
    }
  };

  const handleDeleteAccount = async () => {
    setLoading(true);
    try {
      await deleteUserAccount(user.id);
      await signOut();
      // Redirect will be handled by auth state change in your authentication context
    } catch (err) {
      setError('Failed to delete account');
      console.error('Error deleting account:', err);
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-3xl font-bold mb-8 text-gray-800">Account Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow-md p-4">
          <ul>
            <li 
              className={`mb-3 p-3 rounded-lg cursor-pointer flex items-center transition-all ${currentTab === 'profile' ? 'bg-green-100 text-green-800 shadow-sm' : 'hover:bg-gray-50'}`}
              onClick={() => setCurrentTab('profile')}
            >
              <User className="mr-3 h-5 w-5" />
              <span className="font-medium">Profile</span>
            </li>
            <li 
              className={`mb-3 p-3 rounded-lg cursor-pointer flex items-center text-red-500 hover:bg-red-50 transition-all mt-auto`}
              onClick={handleLogout}
            >
              <LogOut className="mr-3 h-5 w-5" />
              <span className="font-medium">Log Out</span>
            </li>
          </ul>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-lg shadow-md p-6">
          {loading && (
            <div className="absolute inset-0 bg-white bg-opacity-75 flex items-center justify-center rounded-lg">
              <div className="loader w-8 h-8 border-4 border-green-500 border-t-transparent rounded-full animate-spin"></div>
            </div>
          )}
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-700 rounded-lg flex items-center">
              <AlertTriangle className="h-5 w-5 mr-2" />
              {error}
            </div>
          )}
          
          {saveSuccess && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 rounded-lg">
              Settings saved successfully!
            </div>
          )}
          
          <div>
            <h2 className="text-xl font-semibold mb-6">Profile Settings</h2>
            
            <div className="space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="firstName">First Name</label>
                  <input
                    type="text"
                    id="firstName"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                  />
                </div>
                
                <div>
                  <label className="block text-gray-700 font-medium mb-2" htmlFor="lastName">Last Name</label>
                  <input
                    type="text"
                    id="lastName"
                    className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                  />
                </div>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500 bg-gray-50"
                  value={email}
                  disabled
                />
                <p className="text-sm text-gray-500 mt-1">Email cannot be changed</p>
              </div>
              
              <div>
                <label className="block text-gray-700 font-medium mb-2" htmlFor="currency">
                  Currency ({CURRENCY_SYMBOLS[selectedCurrency]})
                </label>
                <select
                  id="currency"
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={selectedCurrency}
                  onChange={(e) => setSelectedCurrency(e.target.value)}
                >
                  {Object.entries(CURRENCY_SYMBOLS).map(([code, symbol]) => (
                    <option key={code} value={code}>
                      {code} ({symbol})
                    </option>
                  ))}
                </select>
                <p className="text-sm text-gray-500 mt-1">This currency will be used throughout the app</p>
              </div>
              
              <div className="flex justify-between items-center pt-6 border-t">
                <button 
                  className="text-red-600 hover:text-red-800 font-medium transition-colors"
                  onClick={() => setDeleteModalOpen(true)}
                >
                  Delete Account
                </button>
                
                <button 
                  className="bg-green-600 text-white px-6 py-3 rounded-lg flex items-center hover:bg-green-700 transition-colors focus:outline-none focus:ring-2 focus:ring-green-500 disabled:opacity-50"
                  onClick={handleSaveSettings}
                  disabled={loading}
                >
                  <Save className="mr-2 h-5 w-5" />
                  Save Changes
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Delete Account Modal */}
      {deleteModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-lg p-6 max-w-md w-full">
            <h3 className="text-xl font-bold mb-4 text-gray-800">Delete Account</h3>
            <p className="mb-6 text-gray-600">
              Are you sure you want to delete your account? This action cannot be undone and all your data will be permanently removed.
            </p>
            <div className="flex justify-end space-x-3">
              <button 
                className="px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
                onClick={() => setDeleteModalOpen(false)}
              >
                Cancel
              </button>
              <button 
                className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                onClick={handleDeleteAccount}
                disabled={loading}
              >
                Delete Account
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SettingsPage;