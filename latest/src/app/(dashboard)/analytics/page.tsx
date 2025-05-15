'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { 
  AreaChart, Area, BarChart, Bar, PieChart, Pie, Cell, 
  XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { motion } from 'framer-motion';
import { 
  ArrowUpRight, 
  ArrowDownRight, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Target, 
  Users, 
  Calendar, 
  Activity,
  Filter,
  RefreshCw,
  Download,
  HelpCircle
} from 'lucide-react';

// CSS for animations and styling
import './analytics.css';

export default function AnalyticsPage() {
  const router = useRouter();
  const [timeFilter, setTimeFilter] = useState('month');
  const [projectFilter, setProjectFilter] = useState('all');
  const [isLoading, setIsLoading] = useState(true);
  
  // Simulate loading
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 1000);
    
    return () => clearTimeout(timer);
  }, []);

  // Hardcoded data for charts
  const completionTrendData = [
    { name: 'Week 1', completed: 12, overdue: 3, inProgress: 8 },
    { name: 'Week 2', completed: 18, overdue: 2, inProgress: 10 },
    { name: 'Week 3', completed: 15, overdue: 5, inProgress: 12 },
    { name: 'Week 4', completed: 25, overdue: 1, inProgress: 9 },
  ];

  const projectStatusData = [
    { name: 'Website Redesign', completed: 75, remaining: 25 },
    { name: 'Mobile App Dev', completed: 45, remaining: 55 },
    { name: 'Marketing Campaign', completed: 90, remaining: 10 },
    { name: 'Annual Report', completed: 60, remaining: 40 },
    { name: 'Product Launch', completed: 30, remaining: 70 },
  ];

  const taskPriorityData = [
    { name: 'High', value: 25, color: '#f43f5e' },
    { name: 'Medium', value: 45, color: '#fb923c' },
    { name: 'Low', value: 30, color: '#3b82f6' },
  ];

  const teamPerformanceData = [
    { name: 'Design', tasksCompleted: 42, onTime: 38 },
    { name: 'Development', tasksCompleted: 54, onTime: 48 },
    { name: 'Marketing', tasksCompleted: 36, onTime: 31 },
    { name: 'Content', tasksCompleted: 28, onTime: 25 },
  ];

  const upcomingDeadlines = [
    { id: 1, title: 'Finalize homepage design', project: 'Website Redesign', due: 'Today', overdue: false, priority: 'HIGH' },
    { id: 2, title: 'API integration with payment gateway', project: 'Mobile App Dev', due: 'Tomorrow', overdue: false, priority: 'HIGH' },
    { id: 3, title: 'Complete user feedback survey', project: 'Product Launch', due: '2 days', overdue: false, priority: 'MEDIUM' },
    { id: 4, title: 'Prepare Q3 revenue projections', project: 'Annual Report', due: '3 days', overdue: false, priority: 'MEDIUM' },
    { id: 5, title: 'Create social media content calendar', project: 'Marketing Campaign', due: '5 days', overdue: false, priority: 'LOW' },
  ];

  const recentActivity = [
    { id: 1, action: 'completed task', user: 'Alex Morgan', item: 'Create wireframes for mobile app', time: '2 hours ago' },
    { id: 2, action: 'created task', user: 'Taylor Reid', item: 'Set up analytics tracking', time: '4 hours ago' },
    { id: 3, action: 'updated project', user: 'Jamie Chen', item: 'Website Redesign', time: 'Yesterday' },
    { id: 4, action: 'commented on', user: 'Casey Smith', item: 'API documentation task', time: 'Yesterday' },
    { id: 5, action: 'assigned task to', user: 'Robin Patel', item: 'Design team', time: '2 days ago' },
  ];

  // Simple statistics
  const stats = [
    { 
      title: 'Tasks Completed', 
      value: 68, 
      change: '+12%', 
      increasing: true,
      icon: <CheckCircle2 className="h-5 w-5" />,
      color: 'bg-green-50 text-green-700 dark:bg-green-900/20 dark:text-green-400'
    },
    { 
      title: 'Overdue Tasks', 
      value: 7, 
      change: '-3%', 
      increasing: false,
      icon: <AlertTriangle className="h-5 w-5" />,
      color: 'bg-red-50 text-red-700 dark:bg-red-900/20 dark:text-red-400'
    },
    { 
      title: 'On-Time Completion', 
      value: '84%', 
      change: '+5%', 
      increasing: true,
      icon: <Clock className="h-5 w-5" />,
      color: 'bg-blue-50 text-blue-700 dark:bg-blue-900/20 dark:text-blue-400'
    },
    { 
      title: 'Active Projects', 
      value: 12, 
      change: '+2', 
      increasing: true,
      icon: <Target className="h-5 w-5" />,
      color: 'bg-purple-50 text-purple-700 dark:bg-purple-900/20 dark:text-purple-400'
    },
  ];

  // Helper function for priority color
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'text-red-600 dark:text-red-400 bg-red-100 dark:bg-red-900/20';
      case 'MEDIUM': return 'text-amber-600 dark:text-amber-400 bg-amber-100 dark:bg-amber-900/20';
      case 'LOW': return 'text-blue-600 dark:text-blue-400 bg-blue-100 dark:bg-blue-900/20';
      default: return 'text-gray-600 dark:text-gray-400 bg-gray-100 dark:bg-gray-900/20';
    }
  };

  // Loading skeletons
  if (isLoading) {
    return (
      <div className="analytics-container">
        <div className="flex justify-between items-center mb-8">
          <div className="analytics-title-skeleton"></div>
          <div className="analytics-filter-skeleton"></div>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {[1, 2, 3, 4].map(i => (
            <div key={i} className="analytics-card-skeleton"></div>
          ))}
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <div className="analytics-chart-skeleton"></div>
          <div className="analytics-chart-skeleton"></div>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="analytics-chart-skeleton"></div>
          <div className="lg:col-span-2 analytics-table-skeleton"></div>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics-container">
      {/* Header with filters */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground mt-1">Track your team performance and project progress</p>
        </div>
        
        <div className="flex flex-wrap gap-3">
          <div className="analytics-filter">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            <select 
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:outline-none"
            >
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
          
          <div className="analytics-filter">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <select 
              value={projectFilter}
              onChange={(e) => setProjectFilter(e.target.value)}
              className="bg-transparent border-none text-sm font-medium focus:outline-none"
            >
              <option value="all">All Projects</option>
              <option value="website">Website Redesign</option>
              <option value="app">Mobile App Dev</option>
              <option value="marketing">Marketing Campaign</option>
            </select>
          </div>
          
          <button className="analytics-action-button">
            <RefreshCw className="h-4 w-4" />
            <span>Refresh</span>
          </button>
          
          <button className="analytics-action-button">
            <Download className="h-4 w-4" />
            <span>Export</span>
          </button>
        </div>
      </div>
      
      {/* Key Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat, i) => (
          <motion.div
            key={i}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: i * 0.1 }}
            className="analytics-stat-card"
          >
            <div className="flex justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                <h3 className="text-2xl font-bold mt-1">{stat.value}</h3>
              </div>
              <div className={`rounded-full p-2 ${stat.color}`}>
                {stat.icon}
              </div>
            </div>
            <div className="mt-2 flex items-center">
              {stat.increasing ? (
                <ArrowUpRight className="h-4 w-4 text-green-600 dark:text-green-400 mr-1" />
              ) : (
                <ArrowDownRight className="h-4 w-4 text-red-600 dark:text-red-400 mr-1" />
              )}
              <span className={`text-sm font-medium ${stat.increasing ? 'text-green-600 dark:text-green-400' : 'text-red-600 dark:text-red-400'}`}>
                {stat.change} from last {timeFilter}
              </span>
            </div>
          </motion.div>
        ))}
      </div>
      
      {/* Charts - First Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Task Completion Trend */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.4 }}
          className="analytics-card"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Task Completion Trend</h3>
            <button className="analytics-help">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart
                data={completionTrendData}
                margin={{ top: 10, right: 10, left: 0, bottom: 10 }}
              >
                <defs>
                  <linearGradient id="colorCompleted" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorOverdue" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#ef4444" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#ef4444" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorInProgress" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    borderColor: 'var(--chart-tooltip-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Area 
                  type="monotone" 
                  dataKey="completed" 
                  stroke="#10b981" 
                  fillOpacity={1} 
                  fill="url(#colorCompleted)"
                  name="Completed"
                />
                <Area 
                  type="monotone" 
                  dataKey="overdue" 
                  stroke="#ef4444" 
                  fillOpacity={1} 
                  fill="url(#colorOverdue)"
                  name="Overdue"
                />
                <Area 
                  type="monotone" 
                  dataKey="inProgress" 
                  stroke="#3b82f6" 
                  fillOpacity={1} 
                  fill="url(#colorInProgress)"
                  name="In Progress"
                />
                <Legend />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
        
        {/* Project Completion Status */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.5 }}
          className="analytics-card"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Project Completion Status</h3>
            <button className="analytics-help">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={projectStatusData}
                margin={{ top: 10, right: 30, left: 0, bottom: 10 }}
                layout="vertical"
              >
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" horizontal={false} />
                <XAxis type="number" fontSize={12} />
                <YAxis type="category" dataKey="name" fontSize={12} width={120} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    borderColor: 'var(--chart-tooltip-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                  formatter={(value) => [`${value}%`, '']}
                />
                <Bar dataKey="completed" stackId="a" fill="#10b981" name="Completed" radius={[0, 4, 4, 0]} />
                <Bar dataKey="remaining" stackId="a" fill="#e5e7eb" name="Remaining" radius={[0, 4, 4, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      
      {/* Charts - Second Row */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        {/* Task Distribution by Priority */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.6 }}
          className="analytics-card"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Tasks by Priority</h3>
            <button className="analytics-help">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={taskPriorityData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={80}
                  paddingAngle={5}
                  dataKey="value"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  labelLine={false}
                >
                  {taskPriorityData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    borderColor: 'var(--chart-tooltip-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                  formatter={(value) => [`${value} tasks`, 'Count']}
                />
              </PieChart>
            </ResponsiveContainer>
          </div>
          
          <div className="flex justify-center gap-4 mt-2">
            {taskPriorityData.map((item, i) => (
              <div key={i} className="flex items-center gap-2">
                <div className="h-3 w-3 rounded-full" style={{ backgroundColor: item.color }}></div>
                <span className="text-sm">{item.name}</span>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Team Performance */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.7 }}
          className="analytics-card lg:col-span-2"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Team Performance</h3>
            <button className="analytics-help">
              <HelpCircle className="h-4 w-4" />
            </button>
          </div>
          
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart
                data={teamPerformanceData}
                margin={{ top: 10, right: 30, left: 20, bottom: 10 }}
              >
                <CartesianGrid strokeDasharray="3 3" className="chart-grid" />
                <XAxis dataKey="name" fontSize={12} />
                <YAxis fontSize={12} />
                <Tooltip
                  contentStyle={{ 
                    backgroundColor: 'var(--chart-tooltip-bg)',
                    borderColor: 'var(--chart-tooltip-border)',
                    borderRadius: '8px',
                    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)'
                  }}
                />
                <Bar dataKey="tasksCompleted" fill="#3b82f6" name="Tasks Completed" radius={[4, 4, 0, 0]} />
                <Bar dataKey="onTime" fill="#10b981" name="Completed On Time" radius={[4, 4, 0, 0]} />
                <Legend />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>
      
      {/* Lists - Bottom Row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Upcoming Deadlines */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.8 }}
          className="analytics-card"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Upcoming Deadlines</h3>
            <button className="text-primary text-sm hover:underline">View All</button>
          </div>
          
          <div className="space-y-3">
            {upcomingDeadlines.map((task) => (
              <div key={task.id} className="analytics-list-item">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{task.title}</h4>
                  <p className="text-xs text-muted-foreground">{task.project}</p>
                </div>
                
                <div className="flex items-center gap-2">
                  <span className={`text-xs px-2 py-1 rounded-full ${getPriorityColor(task.priority)}`}>
                    {task.priority === 'HIGH' ? 'High' : task.priority === 'MEDIUM' ? 'Medium' : 'Low'}
                  </span>
                  
                  <span className={`text-xs ${task.overdue ? 'text-red-600 dark:text-red-400' : task.due === 'Today' ? 'text-amber-600 dark:text-amber-400' : 'text-muted-foreground'}`}>
                    {task.due}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
        
        {/* Recent Activity */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, delay: 0.9 }}
          className="analytics-card"
        >
          <div className="flex justify-between items-center mb-4">
            <h3 className="font-medium">Recent Activity</h3>
            <button className="text-primary text-sm hover:underline">View All</button>
          </div>
          
          <div className="space-y-4">
            {recentActivity.map((activity) => (
              <div key={activity.id} className="flex gap-3">
                <div className="relative mt-1">
                  <div className="h-8 w-8 rounded-full bg-muted flex items-center justify-center">
                    <Activity className="h-4 w-4 text-foreground" />
                  </div>
                  {activity.id !== recentActivity.length && (
                    <div className="absolute top-8 bottom-[-18px] left-1/2 w-0.5 -ml-px bg-muted"></div>
                  )}
                </div>
                
                <div className="flex-1 min-w-0">
                  <p className="text-sm">
                    <span className="font-medium">{activity.user}</span>
                    <span className="text-muted-foreground"> {activity.action} </span>
                    <span className="font-medium truncate">{activity.item}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-1">{activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}