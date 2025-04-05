import React, { useState, useEffect } from 'react';
import { Home, Briefcase, CheckSquare, Users, Calendar, Settings, Menu, Bell, Sun, Moon } from 'lucide-react';

// Screen components
const Dashboard = () => (
  <div className="animate-fade-in">
    <DashboardContent />
  </div>
);

const Projects = () => <div className="animate-fade-in">Projects Content</div>;
const Tasks = () => <div className="animate-fade-in">Tasks Content</div>;
const Teams = () => <div className="animate-fade-in">Teams Content</div>;
const Calendar = () => <div className="animate-fade-in">Calendar Content</div>;

// Dashboard components
const DashboardContent = () => {
  // Mock data for dashboard
  const projects = [
    { id: '1', name: 'Website Redesign', progress: 65, deadline: '2025-05-15', status: 'In Progress', teams: 2, tasks: 12 },
    { id: '2', name: 'Mobile App Development', progress: 30, deadline: '2025-06-30', status: 'In Progress', teams: 3, tasks: 24 },
    { id: '3', name: 'Marketing Campaign', progress: 85, deadline: '2025-04-20', status: 'In Progress', teams: 1, tasks: 8 }
  ];
  
  const tasks = [
    { id: '1', title: 'Design homepage mockup', project: 'Website Redesign', deadline: '2025-04-10', status: 'In Progress', priority: 'High' },
    { id: '2', title: 'Implement authentication', project: 'Mobile App Development', deadline: '2025-04-12', status: 'Not Started', priority: 'Medium' },
    { id: '3', title: 'Create content for social media', project: 'Marketing Campaign', deadline: '2025-04-08', status: 'Completed', priority: 'High' },
    { id: '4', title: 'Optimize database queries', project: 'Mobile App Development', deadline: '2025-04-15', status: 'In Progress', priority: 'Low' }
  ];
  
  const notifications = [
    { id: '1', message: 'John Doe assigned you a new task', time: '5 mins ago', read: false },
    { id: '2', message: 'New comment on "Design homepage mockup"', time: '1 hour ago', read: false },
    { id: '3', message: 'Your task "Setup developer environment" was approved', time: '3 hours ago', read: true }
  ];
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-500';
    }
  };
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Not Started': return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  
  return (
    <div className="p-6 space-y-8">
      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { title: 'Total Projects', value: projects.length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01', color: 'bg-blue-100 text-blue-600 dark:bg-blue-900 dark:text-blue-300' },
          { title: 'Open Tasks', value: tasks.filter(t => t.status !== 'Completed').length, icon: 'M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2', color: 'bg-green-100 text-green-600 dark:bg-green-900 dark:text-green-300' },
          { title: 'Upcoming Deadlines', value: tasks.filter(t => new Date(t.deadline) < new Date(new Date().setDate(new Date().getDate() + 7))).length, icon: 'M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z', color: 'bg-purple-100 text-purple-600 dark:bg-purple-900 dark:text-purple-300' }
        ].map((card, index) => (
          <div key={index} className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in" style={{ animationDelay: `${index * 100}ms` }}>
            <div className="flex items-center">
              <div className={`w-12 h-12 rounded-full ${card.color} flex items-center justify-center`}>
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d={card.icon} />
                </svg>
              </div>
              <div className="ml-4">
                <h3 className="text-2xl font-semibold">{card.value}</h3>
                <p className="text-sm text-gray-500 dark:text-gray-400">{card.title}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
      
      {/* Active Projects */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in" style={{ animationDelay: '300ms' }}>
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-semibold">Active Projects</h2>
          <a href="/projects" className="text-blue-600 dark:text-blue-400 text-sm font-medium">View all</a>
        </div>
        
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                <th className="pb-3 pl-3">Project</th>
                <th className="pb-3">Progress</th>
                <th className="pb-3">Deadline</th>
                <th className="pb-3">Status</th>
                <th className="pb-3">Teams</th>
                <th className="pb-3">Tasks</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
              {projects.map((project, index) => (
                <tr key={project.id} className="hover:bg-gray-50 dark:hover:bg-gray-750 animate-fade-in" style={{ animationDelay: `${400 + index * 100}ms` }}>
                  <td className="py-4 pl-3">
                    <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                  </td>
                  <td className="py-4">
                    <div className="flex items-center">
                      <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2.5 mr-2">
                        <div className="bg-blue-600 h-2.5 rounded-full animate-grow-width" style={{ width: `${project.progress}%`, animationDelay: `${500 + index * 100}ms` }}></div>
                      </div>
                      <span className="text-sm text-gray-500 dark:text-gray-400">{project.progress}%</span>
                    </div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{formatDate(project.deadline)}</div>
                  </td>
                  <td className="py-4">
                    <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200">
                      {project.status}
                    </span>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{project.teams}</div>
                  </td>
                  <td className="py-4">
                    <div className="text-sm text-gray-500 dark:text-gray-400">{project.tasks}</div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      
      {/* Tasks and Notifications */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Recent Tasks */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in" style={{ animationDelay: '600ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Recent Tasks</h2>
            <a href="/tasks" className="text-blue-600 dark:text-blue-400 text-sm font-medium">View all</a>
          </div>
          
          <div className="space-y-4">
            {tasks.map((task, index) => (
              <div key={task.id} className="flex items-start p-3 rounded-lg border border-gray-200 dark:border-gray-700 hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 animate-fade-in" style={{ animationDelay: `${700 + index * 100}ms` }}>
                <div className={`w-3 h-3 mt-1.5 rounded-full ${getPriorityColor(task.priority)} mr-3 flex-shrink-0`}></div>
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white truncate">{task.title}</div>
                  <div className="text-sm text-gray-500 dark:text-gray-400">{task.project}</div>
                  <div className="mt-1 flex items-center text-xs text-gray-500 dark:text-gray-400">
                    <span>Due {formatDate(task.deadline)}</span>
                    <span className="mx-2">•</span>
                    <span className={`px-2 py-0.5 rounded-full text-xs ${getStatusColor(task.status)}`}>
                      {task.status}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
        
        {/* Recent Notifications */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 animate-fade-in" style={{ animationDelay: '800ms' }}>
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-semibold">Notifications</h2>
            <button className="text-blue-600 dark:text-blue-400 text-sm font-medium">Mark all as read</button>
          </div>
          
          <div className="space-y-4">
            {notifications.map((notification, index) => (
              <div 
                key={notification.id} 
                className={`flex items-start p-3 rounded-lg ${notification.read ? 'opacity-75' : 'border-l-4 border-blue-500'} hover:bg-gray-50 dark:hover:bg-gray-750 transition-colors duration-150 animate-fade-in`}
                style={{ animationDelay: `${900 + index * 100}ms` }}
              >
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-gray-900 dark:text-white">{notification.message}</div>
                  <div className="mt-1 text-xs text-gray-500 dark:text-gray-400">{notification.time}</div>
                </div>
                {!notification.read && (
                  <div className="ml-3 flex-shrink-0">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Sidebar navigation
const Sidebar = ({ collapsed, toggleSidebar }) => {
  const navItems = [
    { name: 'Dashboard', icon: Home, active: true },
    { name: 'Projects', icon: Briefcase },
    { name: 'Tasks', icon: CheckSquare },
    { name: 'Teams', icon: Users },
    { name: 'Calendar', icon: Calendar },
    { name: 'Settings', icon: Settings }
  ];

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
          className="ml-auto text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            {collapsed ? (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
            ) : (
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
            )}
          </svg>
        </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4">
        <ul className="space-y-2">
          {navItems.map(item => (
            <li key={item.name}>
              <a 
                href={`/${item.name.toLowerCase()}`} 
                className={`flex items-center p-2 rounded-xl transition-colors duration-200 ${
                  item.active ? 
                  'bg-blue-50 text-blue-600 dark:bg-blue-900/30 dark:text-blue-400' : 
                  'text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700'
                }`}
              >
                <item.icon className="w-6 h-6" />
                {!collapsed && <span className="ml-3">{item.name}</span>}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      
      {/* User Profile */}
      <div className="p-4 border-t border-gray-200 dark:border-gray-700">
        <div className="flex items-center">
          <div className="w-10 h-10 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold text-lg">
            J
          </div>
          {!collapsed && (
            <div className="ml-3">
              <p className="text-sm font-medium">John Doe</p>
              <p className="text-xs text-gray-500 dark:text-gray-400">john@example.com</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Main app component
const App = () => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [darkMode, setDarkMode] = useState(false);
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(2);
  
  useEffect(() => {
    // Check system preference for dark mode
    if (window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches) {
      setDarkMode(true);
    }
  }, []);
  
  const toggleDarkMode = () => {
    setDarkMode(!darkMode);
  };
  
  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };
  
  // Render appropriate screen based on active tab
  const renderScreen = () => {
    switch (activeTab) {
      case 'dashboard': return <Dashboard />;
      case 'projects': return <Projects />;
      case 'tasks': return <Tasks />;
      case 'teams': return <Teams />;
      case 'calendar': return <Calendar />;
      default: return <Dashboard />;
    }
  };
  
  return (
    <div className={`${darkMode ? 'dark' : ''} h-screen`}>
      <div className="flex h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white">
        {/* Sidebar */}
        <Sidebar collapsed={sidebarCollapsed} toggleSidebar={toggleSidebar} />
        
        {/* Main Content */}
        <div className="flex-1 flex flex-col overflow-hidden">
          {/* Top Header */}
          <header className="h-16 bg-white dark:bg-gray-800 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between px-6">
            <div className="flex items-center">
              <h1 className="text-2xl font-semibold" style={{ fontFamily: 'SF Pro Display, -apple-system, BlinkMacSystemFont, sans-serif' }}>Dashboard</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              <button onClick={toggleDarkMode} className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300">
                {darkMode ? (
                  <Sun className="w-6 h-6" />
                ) : (
                  <Moon className="w-6 h-6" />
                )}
              </button>
              
              <div className="relative">
                <button className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300 relative">
                  <Bell className="w-6 h-6" />
                  {unreadNotifications > 0 && (
                    <span className="absolute top-0 right-0 transform translate-x-1/2 -translate-y-1/2 bg-red-500 text-white text-xs font-bold rounded-full h-5 w-5 flex items-center justify-center">
                      {unreadNotifications}
                    </span>
                  )}
                </button>
              </div>
              
              <div className="h-8 w-px bg-gray-200 dark:bg-gray-700"></div>
              
              <div className="flex items-center">
                <div className="w-8 h-8 rounded-full bg-blue-500 text-white flex items-center justify-center font-semibold">
                  J
                </div>
                <span className="ml-2 font-medium">John Doe</span>
              </div>
            </div>
          </header>
          
          {/* Main Content Area */}
          <main className="flex-1 overflow-y-auto bg-gray-50 dark:bg-gray-900">
            {renderScreen()}
          </main>
        </div>
      </div>
    </div>
  );
};

export default App;