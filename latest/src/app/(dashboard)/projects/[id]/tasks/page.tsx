'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { format, isPast, isToday, parseISO } from 'date-fns';
import { 
  motion, 
  AnimatePresence, 
  LayoutGroup
} from 'framer-motion';

// UI components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { EmptyState } from '@/components/ui/EmptyState';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/spinner';
import { GlassPanel } from '@/components/ui/GlassPanel';

// Icons
import {
  Search,
  Plus,
  Calendar,
  X,
  Filter,
  ChevronDown,
  ChevronUp,
  ArrowLeft,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Loader2,
  LayoutGrid,
  List,
  SlidersHorizontal,
  ListFilter
} from 'lucide-react';

// API and utils
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectTasks, markTaskComplete } from '@/api/TaskAPI';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// Import TaskCard component
import { TaskCard } from '@/components/task/TaskCard';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.3 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.05
    }
  }
};

export default function ProjectTasksPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // State
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  
  // UI States
  const [viewMode, setViewMode] = useState<'kanban' | 'list'>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('deadline');
  const [sortDirection, setSortDirection] = useState<'asc' | 'desc'>('asc');
  const [showFilters, setShowFilters] = useState(false);
  
  // Get user ID from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUserId(decoded.sub || decoded.id || decoded.userId);
      }
    } catch (error) {
      console.error('Error decoding token:', error);
    }
  }, []);

  // Fetch project and tasks
  useEffect(() => {
    const fetchData = async () => {
      if (!id) return;
      
      setLoading(true);
      try {
        const [projectData, tasksData] = await Promise.all([
          getProjectById(id as string),
          getProjectTasks(id as string)
        ]);
        
        setProject(projectData);
        setTasks(tasksData || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching project data:', err);
        setError(err?.message || 'Failed to load project tasks');
        toast.error('Could not load tasks for this project');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id]);

  // Check if user is project owner
  const isProjectOwner = useMemo(() => {
    if (!project || !userId) return false;
    return project.OwnerId === userId;
  }, [project, userId]);

  // Filter and sort tasks
  const filteredTasks = useMemo(() => {
    if (!tasks.length) return [];
    
    return tasks
      .filter(task => {
        // Search filter
        if (searchQuery && !task.Title.toLowerCase().includes(searchQuery.toLowerCase())) {
          return false;
        }
        
        // Priority filter
        if (priorityFilter !== 'all' && task.Priority !== priorityFilter) {
          return false;
        }
        
        // Status filter
        if (statusFilter !== 'all') {
          if (statusFilter === 'Completed' && !task.Completed) return false;
          if (statusFilter === 'In Progress' && task.Status !== 'In Progress') return false;
          if (statusFilter === 'Not Started' && task.Status !== 'Not Started') return false;
        }
        
        return true;
      })
      .sort((a, b) => {
        const multiplier = sortDirection === 'asc' ? 1 : -1;
        
        if (sortBy === 'deadline') {
          if (!a.Deadline) return 1 * multiplier;
          if (!b.Deadline) return -1 * multiplier;
          return (new Date(a.Deadline).getTime() - new Date(b.Deadline).getTime()) * multiplier;
        }
        
        if (sortBy === 'priority') {
          const priorityOrder = { HIGH: 2, MEDIUM: 1, LOW: 0 };
          return (priorityOrder[a.Priority] - priorityOrder[b.Priority]) * multiplier;
        }
        
        if (sortBy === 'title') {
          return a.Title.localeCompare(b.Title) * multiplier;
        }
        
        if (sortBy === 'status') {
          const statusOrder = { 'Not Started': 0, 'In Progress': 1, 'Completed': 2 };
          const aStatus = a.Status || (a.Completed ? 'Completed' : 'Not Started');
          const bStatus = b.Status || (b.Completed ? 'Completed' : 'Not Started');
          return (statusOrder[aStatus] - statusOrder[bStatus]) * multiplier;
        }
        
        return 0;
      });
  }, [tasks, searchQuery, priorityFilter, statusFilter, sortBy, sortDirection]);

  // Group tasks by status for Kanban view
  const groupedTasks = useMemo(() => {
    return {
      'Not Started': filteredTasks.filter(task => !task.Completed && (task.Status === 'Not Started' || !task.Status)),
      'In Progress': filteredTasks.filter(task => !task.Completed && task.Status === 'In Progress'),
      'Completed': filteredTasks.filter(task => task.Completed || task.Status === 'Completed'),
    };
  }, [filteredTasks]);

  // Handle task completion
  const handleCompleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    
    try {
      await markTaskComplete(taskId);
      
      // Update local state
      setTasks(prevTasks => prevTasks.map(task => 
        task.Id === taskId ? { ...task, Status: 'Completed', Completed: true } : task
      ));
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setPriorityFilter('all');
    setStatusFilter('all');
    setSortBy('deadline');
    setSortDirection('asc');
    setShowFilters(false);
  };

  // Determine if user can complete a task
  const canCompleteTask = (task: any) => {
    if (task.Completed) return false;
    return isProjectOwner || userId === task.UserId || userId === task.CreatedBy;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh] p-6">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading Tasks</h3>
          <p className="text-muted-foreground">
            Preparing your project tasks...
          </p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={<AlertTriangle className="h-8 w-8" />}
        title="Error Loading Tasks"
        description={error}
        action={
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => router.push(`/projects/${id}`)}
            >
              Back to Project
            </Button>
            <Button 
              onClick={() => window.location.reload()}
            >
              Try Again
            </Button>
          </div>
        }
        className="max-w-md mx-auto my-12"
      />
    );
  }

  return (
    <div className="p-4 md:p-6 max-w-7xl mx-auto">
      {/* Header with back button, title and create button */}
      <motion.div 
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        className="flex flex-col sm:flex-row justify-between items-start gap-4 mb-8"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/projects/${id}`)}
            className="h-10 w-10 rounded-full"
            aria-label="Back to project"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div>
            <motion.h1 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1 }}
              className="text-2xl font-bold"
            >
              {project?.Name || 'Project'} Tasks
            </motion.h1>
            <motion.p 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="text-muted-foreground mt-1"
            >
              {filteredTasks.length} {filteredTasks.length === 1 ? 'task' : 'tasks'}
              {filteredTasks.length !== tasks.length && ` (filtered from ${tasks.length})`}
            </motion.p>
          </div>
        </div>
        
        <div className="flex items-center gap-3 w-full sm:w-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.1 }}
            className="flex p-1 bg-muted rounded-lg"
          >
            <Button
              onClick={() => setViewMode('kanban')}
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'kanban' && "bg-background text-primary shadow-sm"
              )}
            >
              <LayoutGrid className="h-5 w-5" />
            </Button>
            <Button
              onClick={() => setViewMode('list')}
              variant="ghost"
              size="sm"
              className={cn(
                "p-2 rounded-lg transition-all",
                viewMode === 'list' && "bg-background text-primary shadow-sm"
              )}
            >
              <List className="h-5 w-5" />
            </Button>
          </motion.div>
          
          {isProjectOwner && (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.2 }}
            >
              <Link href={`/projects/${id}/tasks/create`}>
                <Button>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Task
                </Button>
              </Link>
            </motion.div>
          )}
        </div>
      </motion.div>
      
      {/* Search and filters */}
      <motion.div 
        variants={fadeIn}
        initial="hidden"
        animate="visible"
        className="mb-6 space-y-4"
      >
        <div className="flex flex-col md:flex-row gap-4">
          <div className="relative flex-1">
            <SearchInput
              value={searchQuery}
              onChange={setSearchQuery}
              placeholder="Search tasks..."
              className="w-full"
            />
          </div>
          
          <div className="flex gap-2">
            <Button
              onClick={() => setShowFilters(!showFilters)}
              variant={showFilters ? "default" : "outline"}
              size="sm"
              className="gap-2"
            >
              <ListFilter className="h-4 w-4" />
              <span className="hidden sm:inline">Filters</span>
            </Button>
            
            <Button
              onClick={() => setSortDirection(sortDirection === 'asc' ? 'desc' : 'asc')}
              variant="outline"
              size="icon"
              className="h-10 w-10"
            >
              {sortDirection === 'asc' ? (
                <ChevronUp className="h-4 w-4" />
              ) : (
                <ChevronDown className="h-4 w-4" />
              )}
            </Button>
            
            <div className="relative">
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-10 appearance-none rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="deadline">Deadline</option>
                <option value="priority">Priority</option>
                <option value="title">Title</option>
                <option value="status">Status</option>
              </select>
              <div className="absolute inset-y-0 right-0 flex items-center pr-2 pointer-events-none">
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              </div>
            </div>
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
              className="overflow-hidden"
            >
              <Card>
                <CardContent className="p-5 space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                    <div>
                      <label className="block text-sm font-medium mb-2">Priority</label>
                      <select
                        value={priorityFilter}
                        onChange={(e) => setPriorityFilter(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="all">All Priorities</option>
                        <option value="LOW">Low</option>
                        <option value="MEDIUM">Medium</option>
                        <option value="HIGH">High</option>
                      </select>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium mb-2">Status</label>
                      <select
                        value={statusFilter}
                        onChange={(e) => setStatusFilter(e.target.value)}
                        className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                      >
                        <option value="all">All Statuses</option>
                        <option value="Not Started">Not Started</option>
                        <option value="In Progress">In Progress</option>
                        <option value="Completed">Completed</option>
                      </select>
                    </div>
                  </div>
                  
                  <div className="flex justify-end border-t border-border pt-4">
                    <Button
                      onClick={resetFilters}
                      variant="ghost"
                      size="sm"
                      className="text-primary hover:text-primary/80"
                    >
                      Reset All Filters
                    </Button>
                  </div>
                </CardContent>
              </Card>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* Active filters */}
        <AnimatePresence>
          {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery) && (
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="flex flex-wrap gap-2"
            >
              {statusFilter !== 'all' && (
                <Badge variant="default" className="flex gap-1 items-center">
                  <span>Status: {statusFilter}</span>
                  <Button
                    onClick={() => setStatusFilter('all')}
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {priorityFilter !== 'all' && (
                <Badge 
                  variant={priorityFilter === 'HIGH' ? 'danger' : priorityFilter === 'MEDIUM' ? 'warning' : 'info'} 
                  className="flex gap-1 items-center"
                >
                  <span>Priority: {priorityFilter}</span>
                  <Button
                    onClick={() => setPriorityFilter('all')}
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
              
              {searchQuery && (
                <Badge variant="default" className="flex gap-1 items-center">
                  <span>Search: {searchQuery}</span>
                  <Button
                    onClick={() => setSearchQuery('')}
                    variant="ghost"
                    size="icon"
                    className="h-4 w-4 p-0 ml-1"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </Badge>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
      
      {/* Main content - Task grid */}
      {tasks.length === 0 ? (
        <EmptyState
          icon={<Clock className="h-8 w-8" />}
          title="No Tasks Yet"
          description={isProjectOwner
            ? "Get started by creating tasks and assigning them to team members."
            : "The project owner hasn't created any tasks for this project yet."}
          action={isProjectOwner && (
            <Link href={`/projects/${id}/tasks/create`}>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Create First Task
              </Button>
            </Link>
          )}
        />
      ) : filteredTasks.length === 0 ? (
        <EmptyState
          icon={<Filter className="h-8 w-8" />}
          title="No Matching Tasks"
          description="No tasks match your current filters or search criteria."
          action={
            <Button onClick={resetFilters}>
              Reset All Filters
            </Button>
          }
        />
      ) : viewMode === 'kanban' ? (
        // Kanban View
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="grid grid-cols-1 md:grid-cols-3 gap-6"
        >
          {/* Not Started Column */}
          <motion.div 
            variants={slideUp}
            className="space-y-4"
          >
            <Card>
              <CardHeader className="bg-muted/40 py-3 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium">Not Started</CardTitle>
                  <Badge variant="default" className="bg-background">
                    {groupedTasks['Not Started'].length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                {groupedTasks['Not Started'].length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                    No tasks in this category
                  </div>
                ) : (
                  <LayoutGroup>
                    <motion.div 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {groupedTasks['Not Started'].map((task) => (
                        <motion.div 
                          key={task.Id}
                          layout
                          variants={slideUp}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <TaskCard
                            task={task}
                            canComplete={canCompleteTask(task)}
                            onComplete={(e) => handleCompleteTask(task.Id, e)}
                            onClick={() => router.push(`/tasks/${task.Id}`)}
                            currentUserId={userId || undefined}
                            userRole={isProjectOwner ? 'project_owner' : undefined}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </LayoutGroup>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* In Progress Column */}
          <motion.div 
            variants={slideUp}
            transition={{ delay: 0.1 }}
            className="space-y-4"
          >
            <Card className="border-primary/20">
              <CardHeader className="bg-primary/10 py-3 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium text-primary dark:text-primary">In Progress</CardTitle>
                  <Badge variant="default" className="bg-background">
                    {groupedTasks['In Progress'].length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                {groupedTasks['In Progress'].length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                    No tasks in this category
                  </div>
                ) : (
                  <LayoutGroup>
                    <motion.div 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {groupedTasks['In Progress'].map((task) => (
                        <motion.div 
                          key={task.Id}
                          layout
                          variants={slideUp}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <TaskCard
                            task={task}
                            canComplete={canCompleteTask(task)}
                            onComplete={(e) => handleCompleteTask(task.Id, e)}
                            onClick={() => router.push(`/tasks/${task.Id}`)}
                            currentUserId={userId || undefined}
                            userRole={isProjectOwner ? 'project_owner' : undefined}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </LayoutGroup>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Completed Column */}
          <motion.div 
            variants={slideUp}
            transition={{ delay: 0.2 }}
            className="space-y-4"
          >
            <Card className="border-success/20">
              <CardHeader className="bg-success/10 py-3 px-4">
                <div className="flex justify-between items-center">
                  <CardTitle className="text-base font-medium text-success dark:text-success">Completed</CardTitle>
                  <Badge variant="default" className="bg-background">
                    {groupedTasks['Completed'].length}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="p-4 space-y-3">
                {groupedTasks['Completed'].length === 0 ? (
                  <div className="text-center py-8 text-muted-foreground text-sm border border-dashed rounded-lg">
                    No tasks completed
                  </div>
                ) : (
                  <LayoutGroup>
                    <motion.div 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="space-y-4"
                    >
                      {groupedTasks['Completed'].map((task) => (
                        <motion.div 
                          key={task.Id}
                          layout
                          variants={slideUp}
                          initial="hidden"
                          animate="visible"
                          exit={{ opacity: 0, scale: 0.9 }}
                        >
                          <TaskCard
                            task={task}
                            canComplete={false}
                            onClick={() => router.push(`/tasks/${task.Id}`)}
                            currentUserId={userId || undefined}
                            userRole={isProjectOwner ? 'project_owner' : undefined}
                          />
                        </motion.div>
                      ))}
                    </motion.div>
                  </LayoutGroup>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </motion.div>
      ) : (
        // List View
        <motion.div 
          variants={staggerContainer}
          initial="hidden"
          animate="visible"
        >
          <Card>
            <CardHeader className="py-3 px-4 border-b">
              <div className="grid grid-cols-10 gap-4 text-sm font-medium text-muted-foreground">
                <div className="col-span-5">Task</div>
                <div className="col-span-2">Status</div>
                <div className="col-span-2">Priority</div>
                <div className="col-span-1">Actions</div>
              </div>
            </CardHeader>
            
            <CardContent className="p-0 divide-y">
              <AnimatePresence>
   {filteredTasks.map((task) => (
                  <motion.div 
                    key={task.Id}
                    variants={slideUp}
                    layout
                    initial="hidden"
                    animate="visible"
                    exit={{ opacity: 0, height: 0 }}
                    className="grid grid-cols-10 gap-4 p-4 items-center hover:bg-muted/40 cursor-pointer transition-colors"
                    onClick={() => router.push(`/tasks/${task.Id}`)}
                  >
                    <div className="col-span-5 flex items-center gap-3">
                      <div className={cn(
                        "w-1 h-12 rounded-full",
                        task.Priority === 'HIGH' && "bg-destructive",
                        task.Priority === 'MEDIUM' && "bg-warning",
                        task.Priority === 'LOW' && "bg-primary",
                      )} />
                      <div>
                        <h3 className={cn(
                          "font-medium",
                          task.Completed && "line-through opacity-70"
                        )}>
                          {task.Title}
                        </h3>
                        {task.Deadline && (
                          <div className={cn(
                            "text-xs flex items-center gap-1 mt-1 text-muted-foreground",
                            isPast(new Date(task.Deadline)) && !isToday(new Date(task.Deadline)) && !task.Completed && "text-destructive",
                            isToday(new Date(task.Deadline)) && !task.Completed && "text-warning"
                          )}>
                            <Calendar className="h-3 w-3" />
                            <span>
                              {isPast(new Date(task.Deadline)) && !isToday(new Date(task.Deadline)) && !task.Completed
                                ? 'Overdue'
                                : isToday(new Date(task.Deadline)) && !task.Completed
                                  ? 'Due today'
                                  : format(new Date(task.Deadline), 'MMM d, yyyy')}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                    
                    <div className="col-span-2">
                      <Badge variant={
                        task.Completed 
                          ? 'success' 
                          : task.Status === 'In Progress' 
                            ? 'info' 
                            : 'secondary'
                      }>
                        {task.Completed 
                          ? 'Completed' 
                          : task.Status || 'Not Started'}
                      </Badge>
                    </div>
                    
                    <div className="col-span-2">
                      <Badge variant={
                        task.Priority === 'HIGH' 
                          ? 'danger' 
                          : task.Priority === 'MEDIUM' 
                            ? 'warning' 
                            : 'info'
                      }>
                        {task.Priority || 'Low'}
                      </Badge>
                    </div>
                    
                    <div className="col-span-1 text-right">
                      {canCompleteTask(task) && (
                        <Button
                          variant="ghost"
                          size="icon"
                          className="h-8 w-8 rounded-full hover:bg-success/10 hover:text-success"
                          onClick={(e) => handleCompleteTask(task.Id, e)}
                        >
                          <CheckCircle2 className="h-4 w-4" />
                        </Button>
                      )}
                    </div>
                  </motion.div>
                ))}
            </AnimatePresence>
            
            {filteredTasks.length === 0 && (
              <div className="py-12 text-center">
                <div className="mx-auto w-12 h-12 rounded-full bg-muted flex items-center justify-center mb-3">
                  <Filter className="h-6 w-6 text-muted-foreground" />
                </div>
                <h3 className="text-lg font-medium mb-1">No tasks found</h3>
                <p className="text-muted-foreground mb-4">
                  Try adjusting your filters or search criteria
                </p>
                <Button 
                  variant="outline" 
                  onClick={resetFilters}
                  className="mx-auto"
                >
                  Reset Filters
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </motion.div>
    )}
    
    {/* Add task quick access button */}
    {isProjectOwner && (
      <motion.div
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        className="fixed bottom-6 right-6"
      >
        <Link href={`/projects/${id}/tasks/create`}>
          <Button 
            size="lg"
            className="rounded-full h-14 w-14 shadow-lg"
          >
            <Plus className="h-6 w-6" />
          </Button>
        </Link>
      </motion.div>
    )}
  </div>
);
}