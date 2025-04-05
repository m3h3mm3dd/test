import React, { useState } from 'react'; 
import { useNavigate } from 'react-router-dom'; 
import { useAuth } from '../../context/AuthContext'; 
import { useTheme } from '../../context/ThemeContext'; 

const Settings = () => { 
  const { user, logout } = useAuth(); 
  const { darkMode, toggleDarkMode } = useTheme(); 
  const navigate = useNavigate(); 
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false); 
  const [accountEmail, setAccountEmail] = useState(user?.email || ''); 
  const [notificationSettings, setNotificationSettings] = useState({ 
    email: true, 
    browser: true, 
    taskAssigned: true, 
    taskCompleted: true, 
    comments: true, 
    projectUpdates: true 
  }); 

  const handleLogout = () => { 
    logout(); 
    navigate('/login'); 
  }; 

  const handleDeleteAccount = () => { 
    // In a real app, this would call an API to delete the account 
    logout(); 
    navigate('/login'); 
  }; 

  const updateNotificationSetting = (key) => { 
    setNotificationSettings(prev => ({ 
      ...prev, 
      [key]: !prev[key] 
    })); 
  }; 

  return ( 
    <div className="p-6"> 
      <div className="max-w-4xl mx-auto"> 
        <h1 className="text-2xl font-bold mb-6">Settings</h1> 

        {/* Settings Sections */} 
        <div className="space-y-8"> 
          {/* Account Settings */} 
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> 
            <h2 className="text-xl font-semibold mb-4">Account Settings</h2> 
            <div className="space-y-4"> 
              <div> 
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Email</label> 
                <input 
                  type="email" 
                  value={accountEmail} 
                  onChange={(e) => setAccountEmail(e.target.value)} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700" 
                /> 
              </div> 
              <div> 
                <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">Password</label> 
                <button className="text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300 font-medium"> 
                  Change Password 
                </button> 
              </div> 
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"> 
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"> 
                  Save Changes 
                </button> 
              </div> 
            </div> 
          </div> 

          {/* Appearance Settings */} 
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> 
            <h2 className="text-xl font-semibold mb-4">Appearance</h2> 
            <div className="space-y-4"> 
              <div className="flex items-center justify-between"> 
                <div> 
                  <p className="font-medium">Dark Mode</p> 
                  <p className="text-sm text-gray-500 dark:text-gray-400">Toggle between light and dark themes</p> 
                </div> 
                <label className="relative inline-flex items-center cursor-pointer"> 
                  <input 
                    type="checkbox" 
                    checked={darkMode} 
                    onChange={toggleDarkMode} 
                    className="sr-only peer" 
                  /> 
                  <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-300 dark:peer-focus:ring-blue-800 rounded-full peer dark:bg-gray-700 peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-blue-600"></div> 
                </label> 
              </div> 
            </div> 
          </div> 

          {/* Notification Settings */} 
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> 
            <h2 className="text-xl font-semibold mb-4">Notifications</h2> 
            <div className="space-y-4"> 
              <div className="space-y-2"> 
                <h3 className="font-medium">Notification Channels</h3> 
                <div className="flex items-center"> 
                  <input 
                    id="email-notifications" 
                    type="checkbox" 
                    checked={notificationSettings.email} 
                    onChange={() => updateNotificationSetting('email')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="email-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Email notifications 
                  </label> 
                </div> 
                <div className="flex items-center"> 
                  <input 
                    id="browser-notifications" 
                    type="checkbox" 
                    checked={notificationSettings.browser} 
                    onChange={() => updateNotificationSetting('browser')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="browser-notifications" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Browser notifications 
                  </label> 
                </div> 
              </div> 

              <div className="space-y-2 pt-4 border-t border-gray-200 dark:border-gray-700"> 
                <h3 className="font-medium">Notification Types</h3> 
                <div className="flex items-center"> 
                  <input 
                    id="task-assigned" 
                    type="checkbox" 
                    checked={notificationSettings.taskAssigned} 
                    onChange={() => updateNotificationSetting('taskAssigned')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="task-assigned" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Task assignments 
                  </label> 
                </div> 
                <div className="flex items-center"> 
                  <input 
                    id="task-completed" 
                    type="checkbox" 
                    checked={notificationSettings.taskCompleted} 
                    onChange={() => updateNotificationSetting('taskCompleted')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="task-completed" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Task completions 
                  </label> 
                </div> 
                <div className="flex items-center"> 
                  <input 
                    id="comments" 
                    type="checkbox" 
                    checked={notificationSettings.comments} 
                    onChange={() => updateNotificationSetting('comments')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="comments" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Comments 
                  </label> 
                </div> 
                <div className="flex items-center"> 
                  <input 
                    id="project-updates" 
                    type="checkbox" 
                    checked={notificationSettings.projectUpdates} 
                    onChange={() => updateNotificationSetting('projectUpdates')} 
                    className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-300 rounded" 
                  /> 
                  <label htmlFor="project-updates" className="ml-2 block text-sm text-gray-700 dark:text-gray-300"> 
                    Project updates 
                  </label> 
                </div> 
              </div> 
              <div className="pt-4 border-t border-gray-200 dark:border-gray-700 flex justify-end"> 
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors"> 
                  Save Preferences 
                </button> 
              </div> 
            </div> 
          </div> 

          {/* Account Actions */} 
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6"> 
            <h2 className="text-xl font-semibold mb-4 text-red-600 dark:text-red-500">Danger Zone</h2> 
            <div className="space-y-4"> 
              <div> 
                <button 
                  onClick={handleLogout} 
                  className="w-full px-4 py-2 bg-gray-100 dark:bg-gray-700 hover:bg-gray-200 dark:hover:bg-gray-600 rounded-lg text-left font-medium flex justify-between items-center" 
                > 
                  <span>Log out</span> 
                  <svg className="w-5 h-5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"> 
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3  ... " /> 
                  </svg> 
                </button> 
              </div> 
              {/* Delete account button can go here with confirmation modal */} 
            </div> 
          </div> 
        </div> 
      </div> 
    </div> 
  ); 
}; 

export default Settings;
