import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Sun, Moon, Bell, Search, Settings } from 'lucide-react';
import { useTheme } from '../../context/ThemeContext';
import { useAuth } from '../../context/AuthContext';

const Header = ({ pageTitle }) => {
  const { darkMode, toggleDarkMode } = useTheme();
  const { logout } = useAuth();

  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);

  const handleSearch = (e) => {
    e.preventDefault();
    console.log('Searching for:', searchQuery);
  };

  const markAllAsRead = () => {
    setUnreadNotifications(0);
  };

  const notifications = [
    { id: '1', message: 'John Doe assigned you a new task', time: '5 mins ago', read: false },
    { id: '2', message: 'New comment on "Design homepage mockup"', time: '1 hour ago', read: false },
    { id: '3', message: 'Your task "Setup developer environment" was approved', time: '3 hours ago', read: true }
  ];

  const handleNotificationClick = (id) => {
    console.log('Notification clicked:', id);
  };

  return (
    <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
      <div className="flex items-center">
        <h1 className="text-2xl font-semibold font-sans">{pageTitle}</h1>

        {/* Search bar */}
        <div className={`ml-6 relative ${searchOpen ? 'block' : 'hidden md:block'}`}>
          <form onSubmit={handleSearch}>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search..."
              className="pl-9 pr-4 py-2 w-full md:w-64 lg:w-80 bg-gray-100 dark:bg-gray-700 border border-transparent focus:bg-white dark:focus:bg-gray-600 focus:border-gray-300 dark:focus:border-gray-600 rounded-lg"
            />
            <button type="submit" className="absolute left-3 top-2.5">
              <Search className="h-4 w-4 text-gray-500 dark:text-gray-400" />
            </button>
          </form>
        </div>
      </div>

      <div className="flex items-center space-x-4">
        {/* Mobile Search Toggle */}
        <button
          onClick={() => setSearchOpen(!searchOpen)}
          className="md:hidden text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <Search className="h-5 w-5" />
        </button>

        {/* Theme Toggle */}
        <button
          onClick={toggleDarkMode}
          className="h-10 w-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          {darkMode ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </button>

        {/* Notification Bell */}
        <div className="relative h-10">
          <button
            onClick={() => setShowNotifications(!showNotifications)}
            className="h-10 w-10 flex items-center justify-center rounded-full text-gray-500 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 relative"
          >
            <Bell className="h-5 w-5" />
            {unreadNotifications > 0 && (
              <span className="absolute top-2 right-2 bg-red-500 text-white text-xs font-bold rounded-full h-4 w-4 flex items-center justify-center">
                {unreadNotifications}
              </span>
            )}
          </button>

          {showNotifications && (
            <div className="absolute right-0 mt-2 w-80 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
              <div className="p-3 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
                <h3 className="font-medium">Notifications</h3>
                <button
                  onClick={markAllAsRead}
                  className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300"
                >
                  Mark all as read
                </button>
              </div>

              <div className="max-h-96 overflow-y-auto">
                {notifications.map(notification => (
                  <div
                    key={notification.id}
                    className={`p-3 hover:bg-gray-50 dark:hover:bg-gray-750 ${notification.read ? 'opacity-70' : ''} cursor-pointer`}
                    onClick={() => handleNotificationClick(notification.id)}
                  >
                    <div className="flex items-start">
                      <div className={`w-2 h-2 rounded-full ${notification.read ? 'bg-gray-300 dark:bg-gray-600' : 'bg-blue-500'} mt-2 mr-3 flex-shrink-0`} />
                      <div>
                        <p className="text-sm">{notification.message}</p>
                        <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">{notification.time}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-3 border-t border-gray-200 dark:border-gray-700 text-center">
                <button className="text-sm text-blue-600 dark:text-blue-400 hover:text-blue-800 dark:hover:text-blue-300">
                  View all notifications
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>

        {/* User Info + Dropdown */}
        <div className="relative group">
          <Link to="/app/profile" className="flex items-center hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">J</div>
            <span className="ml-2 font-medium">John Doe</span>
          </Link>

          <div className="hidden group-hover:block absolute right-0 mt-2 w-48 bg-white dark:bg-gray-800 rounded-lg shadow-lg border border-gray-200 dark:border-gray-700 z-50">
            <Link to="/app/profile" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Profile
            </Link>
            <Link to="/app/settings" className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700">
              Settings
            </Link>
            <div className="border-t border-gray-200 dark:border-gray-700"></div>
            <button
              onClick={logout}
              className="block w-full text-left px-4 py-2 text-sm text-red-600 dark:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700"
            >
              Log out
            </button>
          </div>
        </div>
      </div>
    </header>
  );
};

export default Header;
