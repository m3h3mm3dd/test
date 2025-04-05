import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  Home, Briefcase, CheckSquare, Users, 
  BarChart2, MessageSquare, Settings, ChevronLeft, ChevronRight 
} from 'lucide-react';

const Sidebar = ({ collapsed, toggleSidebar }) => {
  const location = useLocation();
  
  const navItems = [
    { name: 'Dashboard', path: '/app/dashboard', icon: Home },
    { name: 'Projects', path: '/app/projects', icon: Briefcase },
    { name: 'Tasks', path: '/app/tasks', icon: CheckSquare },
    { name: 'Teams', path: '/app/teams', icon: Users },
    { name: 'Analytics', path: '/app/analytics', icon: BarChart2 },
    { name: 'Chat', path: '/app/chat/general', icon: MessageSquare },
    { name: 'Settings', path: '/app/settings', icon: Settings }
  ];

  const projects = [
    { id: '1', name: 'Website Redesign', color: 'blue' },
    { id: '2', name: 'Mobile App Development', color: 'purple' },
    { id: '3', name: 'Marketing Campaign', color: 'green' }
  ];

  const getColorClass = (color) => {
    const colors = {
      blue: 'bg-blue-500',
      purple: 'bg-purple-500',
      green: 'bg-green-500',
      red: 'bg-red-500',
      yellow: 'bg-yellow-500',
      indigo: 'bg-indigo-500'
    };
    return colors[color] || 'bg-gray-500';
  };

  return (
    <div className={`${collapsed ? 'w-20' : 'w-64'} transition-all duration-300 ease-in-out bg-white dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700 flex flex-col h-screen`}>
      
      {/* Logo */}
      <div className="h-16 flex items-center px-4 border-b border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mr-3 flex-shrink-0" />
          {!collapsed && <span className="text-xl font-semibold" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>TaskUp</span>}
        </div>
        <button 
          onClick={toggleSidebar}
          className="absolute z-10 text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 rounded-full h-6 w-6 flex items-center justify-center shadow-sm"
          style={{ left: collapsed ? '3.5rem' : '13.5rem', marginLeft: collapsed ? '-14px' : undefined, top: '2rem' }}
        >
          {collapsed ? <ChevronRight className="w-4 h-4" /> : <ChevronLeft className="w-4 h-4" />}
        </button>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.name}>
              <Link 
                to={item.path}
                className={`flex items-center p-2 rounded-xl transition-colors duration-200 ${
                  location.pathname.includes(item.path.split('/').pop()) 
                    ? 'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' 
                    : 'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </Link>
            </li>
          ))}
        </ul>

        {!collapsed && (
          <div className="mt-8 pt-6 border-t border-gray-200 dark:border-gray-700">
            <h3 className="px-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">Your Projects</h3>
            <ul className="mt-3 space-y-2">
              {projects.map(project => (
                <li key={project.id}>
                  <Link 
                    to={`/app/projects/${project.id}`}
                    className="flex items-center p-2 text-gray-600 dark:text-gray-300 rounded-xl hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors duration-200"
                  >
                    <div className={`w-2 h-2 rounded-full ${getColorClass(project.color)} mr-3`} />
                    <span className="truncate">{project.name}</span>
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        )}
      </nav>

      {/* User */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <Link to="/app/profile" className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg">J</div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
            </div>
          )}
        </Link>
      </div>
    </div>
  );
};

export default Sidebar;
