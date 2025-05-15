'use client';

import { useEffect, useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  CheckCircle2, 
  Clock, 
  Filter, 
  Search, 
  Tag, 
  X,
  ArrowDown,
  Sliders,
  Calendar,
  AlertTriangle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { format, isPast, isToday, addDays } from 'date-fns';

// API imports
import { getCurrentUserTasks, markTaskComplete } from '@/api/TaskAPI';
import { getProjects } from '@/api/ProjectAPI';
import { useUser } from '@/hooks/useUser';

// Import TaskCard component
import { TaskCard } from '../tasks/TaskCard';

// Import animations
import './taskAnimations.css';

// Animation variants
const fadeInUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const stagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

const TasksPage = () => {
  const router = useRouter();
  const { user } = useUser();
  
  // States
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  
  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  const [timeFilter, setTimeFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [sortBy, setSortBy] = useState('deadline');
  
  // Fetch data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        // Fetch tasks and projects in parallel
        const [tasksData, projectsData] = await Promise.all([
          getCurrentUserTasks(),
          getProjects()
        ]);
        
        // Map project names to tasks
        const enhancedTasks = tasksData.map(task => {
          const project = projectsData.find(p => p.Id === task.ProjectId);
          return {
            ...task,
            project,
            projectName: project?.Name || 'Unknown Project'
          };
        });
        
        setTasks(enhancedTasks);
        setProjects(projectsData);
      } catch (error) {
        console.error('Failed to load tasks:', error);
        setError('There was a problem loading your tasks. Please try again.');
        toast.error('Failed to load tasks');
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);

  // Handle task completion
  const handleCompleteTask = async (taskId) => {
    try {
      await markTaskComplete(taskId);
      
      // Update local state
      setTasks(prevTasks => 
        prevTasks.map(task => 
          task.Id === taskId 
            ? { ...task, Status: 'Completed', Completed: true } 
            : task
        )
      );
      
      toast.success('Task completed!');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
    }
  };
  
  // Filter tasks
  const filteredTasks = useMemo(() => {
    return tasks.filter(task => {
      // Skip completed tasks if not showing
      if (!showCompleted && task.Completed) return false;
      
      // Search filter
      if (searchQuery && 
          !task.Title.toLowerCase().includes(searchQuery.toLowerCase())) {
        return false;
      }
      
      // Status filter
      if (statusFilter !== 'all' && task.Status !== statusFilter) {
        return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && task.Priority !== priorityFilter) {
        return false;
      }
      
      // Project filter
      if (projectFilter !== 'all' && task.ProjectId !== projectFilter) {
        return false;
      }
      
      // Time filter
      if (timeFilter !== 'all' && task.Deadline) {
        const deadline = new Date(task.Deadline);
        const today = new Date();
        const nextWeek = addDays(today, 7);
        
        if (timeFilter === 'today' && !isToday(deadline)) {
          return false;
        }
        
        if (timeFilter === 'week' && (deadline < today || deadline > nextWeek)) {
          return false;
        }
        
        if (timeFilter === 'overdue' && (!isPast(deadline) || task.Completed)) {
          return false;
        }
      } else if (timeFilter !== 'all' && !task.Deadline) {
        // Filter out tasks with no deadline if time filter is active
        return false;
      }
      
      return true;
    });
  }, [tasks, searchQuery, statusFilter, priorityFilter, projectFilter, timeFilter, showCompleted]);
  
  // Sort filtered tasks
  const sortedTasks = useMemo(() => {
    return [...filteredTasks].sort((a, b) => {
      if (sortBy === 'deadline') {
        if (!a.Deadline) return 1;
        if (!b.Deadline) return -1;
        return new Date(a.Deadline) - new Date(b.Deadline);
      }
      
      if (sortBy === 'priority') {
        const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
        return priorityOrder[a.Priority] - priorityOrder[b.Priority];
      }
      
      if (sortBy === 'created') {
        return new Date(b.CreatedAt) - new Date(a.CreatedAt);
      }
      
      return 0;
    });
  }, [filteredTasks, sortBy]);

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setProjectFilter('all');
    setTimeFilter('all');
    setShowCompleted(true);
    setSortBy('deadline');
    setShowFilters(false);
  };

  // Task count message
  const getTaskCountMessage = () => {
    if (loading) return 'Loading tasks...';
    if (tasks.length === 0) return 'No tasks assigned to you';
    
    const filteredCount = sortedTasks.length;
    const totalCount = tasks.length;
    
    if (filteredCount === totalCount) {
      return `${totalCount} ${totalCount === 1 ? 'task' : 'tasks'}`;
    }
    
    return `${filteredCount} of ${totalCount} ${totalCount === 1 ? 'task' : 'tasks'}`;
  };

  return (
    <div className="max-w-7xl mx-auto p-4 md:p-6">
      <motion.div 
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6"
      >
        <div>
          <h1 className="text-2xl font-bold">My Tasks</h1>
          <p className="text-muted-foreground mt-1">Manage and track your assigned tasks</p>
        </div>
        <div className="bg-muted rounded-full px-4 py-1.5 text-sm font-medium">
          {getTaskCountMessage()}
        </div>
      </motion.div>
      
      <motion.div
        initial="hidden"
        animate="visible"
        variants={fadeInUp}
        className="mb-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Search tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 h-10 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
            />
            {searchQuery && (
              <button 
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                onClick={() => setSearchQuery('')}
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>
          
          <div className="flex gap-2 flex-wrap">
            <button 
              className={cn(
                "inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium transition-colors",
                showFilters 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background border-border hover:bg-muted"
              )}
              onClick={() => setShowFilters(!showFilters)}
            >
              <Filter className="h-4 w-4 mr-2" />
              <span>Filters</span>
            </button>
            
            <button 
              className="inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium bg-background border-border hover:bg-muted transition-colors"
              onClick={() => setSortBy(sortBy === 'deadline' ? 'priority' : sortBy === 'priority' ? 'created' : 'deadline')}
            >
              <ArrowDown className="h-4 w-4 mr-2" />
              <span>Sort: {sortBy === 'deadline' ? 'Deadline' : sortBy === 'priority' ? 'Priority' : 'Recent'}</span>
            </button>
            
            <button 
              className={cn(
                "inline-flex items-center px-3 py-2 rounded-md border text-sm font-medium transition-colors",
                !showCompleted 
                  ? "bg-primary text-primary-foreground border-primary" 
                  : "bg-background border-border hover:bg-muted"
              )}
              onClick={() => setShowCompleted(!showCompleted)}
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              <span>{showCompleted ? 'Hide Completed' : 'Show Completed'}</span>
            </button>
          </div>
        </div>
        
        {/* Filter panel */}
        <AnimatePresence>
          {showFilters && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.3 }}
              className="overflow-hidden bg-card border rounded-lg shadow-sm"
            >
              <div className="p-4">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-4">
                  <div>
                    <label className="block text-sm font-medium mb-1">Status</label>
                    <select 
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">All Statuses</option>
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Priority</label>
                    <select 
                      value={priorityFilter}
                      onChange={(e) => setPriorityFilter(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">All Priorities</option>
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium mb-1">Timeframe</label>
                    <select 
                      value={timeFilter}
                      onChange={(e) => setTimeFilter(e.target.value)}
                      className="w-full h-10 px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                    >
                      <option value="all">Any Time</option>
                      <option value="today">Due Today</option>
                      <option value="week">Due This Week</option>
                      <option value="overdue">Overdue</option>
                    </select>
                  </div>
                  
                  {projects.length > 0 && (
                    <div>
                      <label className="block text-sm font-medium mb-1">Project</label>
                      <select 
                        value={projectFilter}
                        onChange={(e) => setProjectFilter(e.target.value)}
                        className="w-full h-10 px-3 py-2 bg-background border rounded-md focus:ring-2 focus:ring-primary/30 focus:border-primary focus:outline-none transition-all"
                      >
                        <option value="all">All Projects</option>
                        {projects.map(project => (
                          <option key={project.Id} value={project.Id}>
                            {project.Name}
                          </option>
                        ))}
                      </select>
                    </div>
                  )}
                </div>
                
                <div className="flex justify-end pt-2 border-t">
                  <button 
                    className="text-primary hover:text-primary/80 hover:underline text-sm font-medium"
                    onClick={resetFilters}
                  >
                    Reset All Filters
                  </button>
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active filters */}
        <AnimatePresence>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all' || timeFilter !== 'all' || !showCompleted) && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-2"
            >
              {statusFilter !== 'all' && (
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                  <span>Status: {statusFilter}</span>
                  <button 
                    className="ml-2 h-4 w-4 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 flex items-center justify-center"
                    onClick={() => setStatusFilter('all')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {priorityFilter !== 'all' && (
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                  <span>Priority: {priorityFilter}</span>
                  <button 
                    className="ml-2 h-4 w-4 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 flex items-center justify-center"
                    onClick={() => setPriorityFilter('all')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {projectFilter !== 'all' && (
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                  <span>Project: {projects.find(p => p.Id === projectFilter)?.Name}</span>
                  <button 
                    className="ml-2 h-4 w-4 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 flex items-center justify-center"
                    onClick={() => setProjectFilter('all')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {timeFilter !== 'all' && (
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                  <span>
                    {timeFilter === 'today' 
                      ? 'Due Today' 
                      : timeFilter === 'week' 
                        ? 'Due This Week' 
                        : 'Overdue'}
                  </span>
                  <button 
                    className="ml-2 h-4 w-4 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 flex items-center justify-center"
                    onClick={() => setTimeFilter('all')}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
              
              {!showCompleted && (
                <div className="inline-flex items-center rounded-full bg-muted px-3 py-1 text-sm">
                  <span>Hiding Completed</span>
                  <button 
                    className="ml-2 h-4 w-4 rounded-full bg-muted-foreground/30 hover:bg-muted-foreground/50 flex items-center justify-center"
                    onClick={() => setShowCompleted(true)}
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Task list */}
      <div>
        {loading ? (
          // Loading skeletons
          <div className="space-y-4">
            {Array.from({ length: 3 }).map((_, i) => (
              <div key={i} className="animate-pulse rounded-xl border p-4 bg-card">
                <div className="flex gap-3">
                  <div className="h-5 w-5 rounded-full bg-muted"></div>
                  <div className="flex-1 space-y-4">
                    <div className="h-5 w-2/3 rounded bg-muted"></div>
                    <div className="h-4 w-4/5 rounded bg-muted"></div>
                    <div className="flex gap-2">
                      <div className="h-4 w-16 rounded bg-muted"></div>
                      <div className="h-4 w-16 rounded bg-muted"></div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        ) : error ? (
          // Error state
          <div className="rounded-xl border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-destructive/10">
              <AlertTriangle className="h-6 w-6 text-destructive" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">Could Not Load Tasks</h3>
            <p className="mb-6 text-muted-foreground">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Try Again
            </button>
          </div>
        ) : tasks.length === 0 ? (
          // Empty state
          <div className="rounded-xl border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <CheckCircle2 className="h-6 w-6 text-primary" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Tasks Assigned</h3>
            <p className="mb-6 mx-auto max-w-md text-muted-foreground">
              You don't have any assigned tasks yet. Tasks will appear here
              once they're assigned to you.
            </p>
            <button 
              onClick={() => router.push('/projects')}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Browse Projects
            </button>
          </div>
        ) : sortedTasks.length === 0 ? (
          // No tasks matching filters
          <div className="rounded-xl border bg-card p-8 text-center">
            <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-muted">
              <Filter className="h-6 w-6 text-muted-foreground" />
            </div>
            <h3 className="mb-2 text-lg font-semibold">No Matching Tasks</h3>
            <p className="mb-6 text-muted-foreground">No tasks match your current filters.</p>
            <button 
              onClick={resetFilters}
              className="inline-flex items-center rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground hover:bg-primary/90"
            >
              Reset All Filters
            </button>
          </div>
        ) : (
          // Task list with animation
          <motion.div
            variants={stagger}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence>
              {sortedTasks.map((task) => (
                <motion.div
                  key={task.Id}
                  layout
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskCard
                    task={task}
                    onClick={() => router.push(`/tasks/${task.Id}`)}
                    onComplete={
                      !task.Completed && (task.UserId === user?.Id || task.CreatedBy === user?.Id)
                        ? (e) => handleCompleteTask(task.Id, e)
                        : undefined
                    }
                    currentUserId={user?.Id}
                    showProjectInfo={true}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        )}
      </div>
    </div>
  );
};

export default TasksPage;