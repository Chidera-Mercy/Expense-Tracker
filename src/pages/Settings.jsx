import React, { useState } from 'react';
import { Save, Globe, Calendar, Bell, Moon, Sun, DollarSign, Languages, Shield, User } from 'lucide-react';

const SettingsPage = () => {
  const [currentTab, setCurrentTab] = useState('general');
  const [currency, setCurrency] = useState('USD');
  const [language, setLanguage] = useState('English');
  const [dateFormat, setDateFormat] = useState('MM/DD/YYYY');
  const [theme, setTheme] = useState('light');
  const [budgetAlerts, setBudgetAlerts] = useState(true);
  const [billReminders, setBillReminders] = useState(true);
  const [goalAlerts, setGoalAlerts] = useState(true);
  
  const handleSaveSettings = () => {
    // Logic to save settings to database would go here
    alert('Settings saved successfully!');
  };

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <h1 className="text-2xl font-bold mb-6 text-gray-800">Settings</h1>
      
      <div className="flex flex-col md:flex-row gap-6">
        {/* Settings Navigation */}
        <div className="w-full md:w-64 bg-white rounded-lg shadow p-4">
          <ul>
            <li 
              className={`mb-2 p-2 rounded cursor-pointer flex items-center ${currentTab === 'general' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentTab('general')}
            >
              <User className="mr-2 h-5 w-5" />
              <span>General</span>
            </li>
            <li 
              className={`mb-2 p-2 rounded cursor-pointer flex items-center ${currentTab === 'preferences' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentTab('preferences')}
            >
              <Globe className="mr-2 h-5 w-5" />
              <span>Regional Preferences</span>
            </li>
            <li 
              className={`mb-2 p-2 rounded cursor-pointer flex items-center ${currentTab === 'notifications' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentTab('notifications')}
            >
              <Bell className="mr-2 h-5 w-5" />
              <span>Notifications</span>
            </li>
            <li 
              className={`mb-2 p-2 rounded cursor-pointer flex items-center ${currentTab === 'appearance' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentTab('appearance')}
            >
              <Sun className="mr-2 h-5 w-5" />
              <span>Appearance</span>
            </li>
            <li 
              className={`mb-2 p-2 rounded cursor-pointer flex items-center ${currentTab === 'security' ? 'bg-green-100 text-green-800' : 'hover:bg-gray-100'}`}
              onClick={() => setCurrentTab('security')}
            >
              <Shield className="mr-2 h-5 w-5" />
              <span>Security & Privacy</span>
            </li>
          </ul>
        </div>
        
        {/* Settings Content */}
        <div className="flex-1 bg-white rounded-lg shadow p-6">
          {currentTab === 'general' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Profile Settings</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="name">Full Name</label>
                <input
                  type="text"
                  id="name"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue="Alex"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="email">Email Address</label>
                <input
                  type="email"
                  id="email"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue="alex@example.com"
                />
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="password">Password</label>
                <input
                  type="password"
                  id="password"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  defaultValue="********"
                />
                <button className="text-green-600 text-sm mt-1 hover:underline">Change Password</button>
              </div>
            </div>
          )}
          
          {currentTab === 'preferences' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Regional Preferences</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="currency">Currency</label>
                <select
                  id="currency"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                >
                  <option value="USD">USD ($)</option>
                  <option value="EUR">EUR (€)</option>
                  <option value="GBP">GBP (£)</option>
                  <option value="JPY">JPY (¥)</option>
                  <option value="CAD">CAD ($)</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="language">Language</label>
                <select
                  id="language"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  <option value="English">English</option>
                  <option value="Spanish">Spanish</option>
                  <option value="French">French</option>
                  <option value="German">German</option>
                  <option value="Chinese">Chinese</option>
                </select>
              </div>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="dateFormat">Date Format</label>
                <select
                  id="dateFormat"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                  value={dateFormat}
                  onChange={(e) => setDateFormat(e.target.value)}
                >
                  <option value="MM/DD/YYYY">MM/DD/YYYY</option>
                  <option value="DD/MM/YYYY">DD/MM/YYYY</option>
                  <option value="YYYY-MM-DD">YYYY-MM-DD</option>
                </select>
              </div>
            </div>
          )}
          
          {currentTab === 'notifications' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Notification Settings</h2>
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="budgetAlerts"
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500"
                    checked={budgetAlerts}
                    onChange={() => setBudgetAlerts(!budgetAlerts)}
                  />
                  <label htmlFor="budgetAlerts" className="text-gray-700">Budget Alerts</label>
                </div>
                <p className="text-gray-500 text-sm ml-6">Receive notifications when approaching or exceeding budget limits</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="billReminders"
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500"
                    checked={billReminders}
                    onChange={() => setBillReminders(!billReminders)}
                  />
                  <label htmlFor="billReminders" className="text-gray-700">Bill Reminders</label>
                </div>
                <p className="text-gray-500 text-sm ml-6">Get notified about upcoming recurring expenses</p>
              </div>
              
              <div className="mb-4">
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="goalAlerts"
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500"
                    checked={goalAlerts}
                    onChange={() => setGoalAlerts(!goalAlerts)}
                  />
                  <label htmlFor="goalAlerts" className="text-gray-700">Goal Milestone Alerts</label>
                </div>
                <p className="text-gray-500 text-sm ml-6">Receive alerts when reaching financial goal milestones</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2" htmlFor="notificationMethod">Notification Method</label>
                <select
                  id="notificationMethod"
                  className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                >
                  <option value="email">Email</option>
                  <option value="app">In-App Only</option>
                  <option value="both">Both Email and In-App</option>
                </select>
              </div>
            </div>
          )}
          
          {currentTab === 'appearance' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Appearance Settings</h2>
              <div className="mb-6">
                <label className="block text-gray-700 mb-3">Theme</label>
                <div className="flex gap-4">
                  <div 
                    className={`flex flex-col items-center cursor-pointer p-4 rounded border ${theme === 'light' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                    onClick={() => setTheme('light')}
                  >
                    <Sun className="h-8 w-8 text-yellow-500 mb-2" />
                    <span>Light</span>
                  </div>
                  <div 
                    className={`flex flex-col items-center cursor-pointer p-4 rounded border ${theme === 'dark' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                    onClick={() => setTheme('dark')}
                  >
                    <Moon className="h-8 w-8 text-blue-800 mb-2" />
                    <span>Dark</span>
                  </div>
                  <div 
                    className={`flex flex-col items-center cursor-pointer p-4 rounded border ${theme === 'system' ? 'border-green-500 bg-green-50' : 'border-gray-200'}`}
                    onClick={() => setTheme('system')}
                  >
                    <div className="h-8 w-8 flex items-center justify-center mb-2">
                      <div className="h-8 w-4 bg-yellow-500 rounded-l"></div>
                      <div className="h-8 w-4 bg-blue-800 rounded-r"></div>
                    </div>
                    <span>System</span>
                  </div>
                </div>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Dashboard Layout</label>
                <select className="w-full p-2 border rounded focus:outline-none focus:ring-2 focus:ring-green-500">
                  <option value="default">Default</option>
                  <option value="compact">Compact</option>
                  <option value="detailed">Detailed</option>
                </select>
              </div>
            </div>
          )}
          
          {currentTab === 'security' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">Security & Privacy</h2>
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Two-Factor Authentication</label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="twoFactor"
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500"
                  />
                  <label htmlFor="twoFactor" className="text-gray-700">Enable Two-Factor Authentication</label>
                </div>
                <p className="text-gray-500 text-sm">Strengthen your account security by requiring a second verification step when logging in</p>
              </div>
              
              <div className="mb-4">
                <label className="block text-gray-700 mb-2">Data Privacy</label>
                <div className="flex items-center mb-2">
                  <input
                    type="checkbox"
                    id="dataAnonymization"
                    className="mr-2 h-4 w-4 text-green-600 focus:ring-green-500"
                    defaultChecked
                  />
                  <label htmlFor="dataAnonymization" className="text-gray-700">Anonymize data for analytics</label>
                </div>
                <p className="text-gray-500 text-sm">Help improve PennyPath with anonymized usage data</p>
              </div>
              
              <div className="mt-6">
                <button className="text-red-600 hover:text-red-800 font-medium">Delete Account</button>
                <p className="text-gray-500 text-sm mt-1">This action cannot be undone. All your data will be permanently deleted.</p>
              </div>
            </div>
          )}
          
          <div className="mt-6 flex justify-end">
            <button 
              className="bg-green-600 text-white px-4 py-2 rounded flex items-center hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500"
              onClick={handleSaveSettings}
            >
              <Save className="mr-2 h-4 w-4" />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SettingsPage;