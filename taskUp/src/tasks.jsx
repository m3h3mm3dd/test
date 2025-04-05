import React, { useState } from 'react';
import { Plus, Search, CheckCircle, Circle, Filter, Calendar, Clock, ChevronDown } from 'lucide-react';

const TaskItem = ({ task, toggleTask }) => {
  const { id, title, project, deadline, completed, priority, status } = task;
  
  const getPriorityColor = (priority) => {
    switch(priority) {
      case 'High': return 'bg-red-500';
      case 'Medium': return 'bg-yellow-500';
      case 'Low': return 'bg-green-500';
      default: return 'bg-gray-400';
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
  
  const formattedDate = new Date(deadline).toLocaleDateString('en-US', { 
    month: 'short', 
    day: 'numeric',
    year: 'numeric'
  });
  
  return (
    <div className={`bg-white dark:bg-gray-800 rounded-lg border border-gray-200 dark:border-gray-700 p-4 mb-3 ${completed ? 'opacity-70' : ''} hover:shadow-sm transition-shadow`}>
      <div className="flex items-center">
        <button 
          onClick={() => toggleTask(id)} 
          className="flex-shrink-0 mr-3 text-gray-400 hover:text-blue-500 transition-colors"
        >
          {completed ? 
            <CheckCircle className="w-6 h-6 text-blue-500" /> : 
            <Circle className="w-6 h-6" />
          }
        </button>
        
        <div className="flex-1 min-w-0">
          <div className="flex items-start">
            <div>
              <h3 className={`font-medium ${completed ? 'line-through text-gray-500 dark:text-gray-400' : ''}`}>
                {title}
              </h3>
              <div className="flex items-center mt-1">
                <div className={`w-2 h-2 rounded-full ${getPriorityColor(priority)} mr-2`}></div>
                <span className="text-sm text-gray-500 dark:text-gray-400 truncate">{project}</span>
              </div>
            </div>
          </div>
        </div>
        
        <div className="flex items-center ml-4 space-x-3">
          <span className={`px-2 py-1 text-xs font-medium rounded-full ${getStatusColor(status)}`}>
            {status}
          </span>
          <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 whitespace-nowrap">
            <Calendar className="w-4 h-4 mr-1" />
            <span>{formattedDate}</span>
          </div>
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

const TaskGroup = ({ date, tasks, toggleTask }) => {
  const [collapsed, setCollapsed] = useState(false);
  
  return (
    <div className="mb-6 animate-fade-in">
      <div className="flex items-center mb-3 cursor-pointer" onClick={() => setCollapsed(!collapsed)}>
        <div className="flex items-center">
          <ChevronDown className={`w-5 h-5 text-gray-500 mr-2 transition-transform ${collapsed ? '-rotate-90' : ''}`} />
          <Clock className="w-4 h-4 text-gray-400 mr-2" />
          <h2 className="text-sm font-semibold text-gray-700 dark:text-gray-300">{date}</h2>
        </div>
        <div className="flex-1 h-px bg-gray-200 dark:bg-gray-700 ml-2"></div>
        <div className="ml-2 text-xs text-gray-500 dark:text-gray-400 bg-gray-100 dark:bg-gray-700 rounded-full px-2 py-0.5">
          {tasks.length} tasks
        </div>
      </div>
      
      {!collapsed && (
        <div className="space-y-3">
          {tasks.map(task => (
            <TaskItem 
              key={task.id} 
              task={task} 
              toggleTask={toggleTask} 
            />
          ))}
        </div>
      )}
    </div>
  );
};

const Tasks = () => {
  const [tasks, setTasks] = useState([
    { id: '1', title: 'Design homepage mockup', project: 'Website Redesign', deadline: '2025-04-10', completed: false, status: 'In Progress', priority: 'High' },
    { id: '2', title: 'Implement authentication', project: 'Mobile App Development', deadline: '2025-04-12', completed: false, status: 'Not Started', priority: 'Medium' },
    { id: '3', title: 'Create content for social media', project: 'Marketing Campaign', deadline: '2025-04-08', completed: true, status: 'Completed', priority: 'High' },
    { id: '4', title: 'Optimize database queries', project: 'Mobile App Development', deadline: '2025-04-15', completed: false, status: 'In Progress', priority: 'Low' },
    { id: '5', title: 'Fix navigation menu', project: 'Website Redesign', deadline: '2025-04-11', completed: false, status: 'Not Started', priority: 'Medium' },
    { id: '6', title: 'Design email templates', project: 'Marketing Campaign', deadline: '2025-04-09', completed: false, status: 'In Progress', priority: 'Medium' },
    { id: '7', title: 'Update privacy policy', project: 'Website Redesign', deadline: '2025-04-20', completed: false, status: 'Not Started', priority: 'Low' },
    { id: '8', title: 'Prepare Q2 marketing report', project: 'Marketing Campaign', deadline: '2025-04-30', completed: false, status: 'Not Started', priority: 'High' }
  ]);

  const [filter, setFilter] = useState('all'); // all, today, upcoming, completed
  const [selectedProject, setSelectedProject] = useState('all');
  const [selectedPriority, setSelectedPriority] = useState('all');
  
  const toggleTask = (id) => {
    setTasks(tasks.map(task => 
      task.id === id ? { ...task, completed: !task.completed, status: !task.completed ? 'Completed' : 'In Progress' } : task
    ));
  };
  
  const getTodayDate = () => {
    const today = new Date();
    return new Date(today.getFullYear(), today.getMonth(), today.getDate()).toISOString().split('T')[0];
  };
  
  const getUpcomingDates = () => {
    const today = new Date();
    const nextWeek = new Date();
    nextWeek.setDate(today.getDate() + 7);
    
    return {
      start: today.toISOString().split('T')[0],
      end: nextWeek.toISOString().split('T')[0]
    };
  };
  
  const filteredTasks = tasks.filter(task => {
    // Filter by status first
    if (filter === 'all') {}
    else if (filter === 'today' && task.deadline !== getTodayDate()) return false;
    else if (filter === 'upcoming') {
      const { start, end } = getUpcomingDates();
      if (!(task.deadline >= start && task.deadline <= end)) return false;
    }
    else if (filter === 'completed' && !task.completed) return false;
    
    // Then filter by project if needed
    if (selectedProject !== 'all' && task.project !== selectedProject) return false;
    
    // Finally filter by priority
    if (selectedPriority !== 'all' && task.priority !== selectedPriority) return false;
    
    return true;
  });
  
  // Get unique projects for filter
  const projects = ['all', ...new Set(tasks.map(task => task.project))];
  
  // Group tasks by date
  const groupTasksByDate = () => {
    const grouped = {};
    
    filteredTasks.forEach(task => {
      const date = new Date(task.deadline);
      const formattedDate = date.toLocaleDateString('en-US', { 
        weekday: 'long', 
        month: 'long', 
        day: 'numeric' 
      });
      
      if (!grouped[formattedDate]) {
        grouped[formattedDate] = [];
      }
      
      grouped[formattedDate].push(task);
    });
    
    // Sort the dates
    return Object.entries(grouped)
      .sort(([dateA], [dateB]) => new Date(dateA) - new Date(dateB))
      .map(([date, dateTasks]) => ({ date, tasks: dateTasks }));
  };
  
  const groupedTasks = groupTasksByDate();
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Tasks</h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors">
            <Plus size={18} className="mr-2" />
            <span>Add Task</span>
          </button>
        </div>
        
        {/* Filters and Search */}
        <div className="mt-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4 items-start">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search tasks..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
          
          <div className="flex space-x-4 w-full md:w-auto">
            <select 
              value={selectedProject}
              onChange={(e) => setSelectedProject(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            >
              <option value="all">All Projects</option>
              {projects.filter(p => p !== 'all').map(project => (
                <option key={project} value={project}>{project}</option>
              ))}
            </select>
            
            <select 
              value={selectedPriority}
              onChange={(e) => setSelectedPriority(e.target.value)}
              className="rounded-lg border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            >
              <option value="all">All Priorities</option>
              <option value="High">High</option>
              <option value="Medium">Medium</option>
              <option value="Low">Low</option>
            </select>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8">
            {[
              { id: 'all', label: 'All Tasks' },
              { id: 'today', label: 'Today' },
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'completed', label: 'Completed' }
            ].map(tab => (
              <button
                key={tab.id}
                className={`py-4 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  filter === tab.id
                    ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
                onClick={() => setFilter(tab.id)}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Task List */}
      <div className="bg-gray-50 dark:bg-gray-900 rounded-xl p-6">
        {groupedTasks.length > 0 ? (
          groupedTasks.map((group, index) => (
            <TaskGroup 
              key={group.date} 
              date={group.date} 
              tasks={group.tasks} 
              toggleTask={toggleTask} 
            />
          ))
        ) : (
          <div className="flex flex-col items-center justify-center py-12 text-center animate-fade-in">
            <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="text-gray-400" size={32} />
            </div>
            <h3 className="text-lg font-medium">No tasks found</h3>
            <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md">
              {filter === 'all' 
                ? "You don't have any tasks matching the selected filters." 
                : filter === 'today'
                  ? "You don't have any tasks for today."
                  : filter === 'upcoming'
                    ? "You don't have any upcoming tasks."
                    : "You don't have any completed tasks."}
            </p>
            <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
              Add a task
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Tasks;