'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence, LayoutGroup } from 'framer-motion';

// UI components
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/dialog';
import { SearchInput } from '@/components/ui/SearchInput';
import { Spinner } from '@/components/ui/spinner';

// Icons
import { 
  AlertCircle, 
  ChevronDown, 
  Filter, 
  Loader2, 
  Plus, 
  Search, 
  SlidersHorizontal, 
  Sparkles, 
  X, 
  CheckCircle2,
  Calendar,
  Clock 
} from 'lucide-react';

// Components
import { TaskCard } from './TaskCard';

// API
import { deleteTask, markTaskComplete, updateTask } from '@/api/TaskAPI';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

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

interface TaskListProps {
  tasks: any[];
  userRole: string;
  currentUserId: string;
  projectId?: string;
  loading?: boolean;
  error?: string | null;
  showProjectInfo?: boolean;
  enableFiltering?: boolean;
  onTasksChange?: () => void;
}

export function TaskList({
  tasks,
  userRole,
  currentUserId,
  projectId,
  loading = false,
  error = null,
  showProjectInfo = false,
  enableFiltering = true,
  onTasksChange,
}: TaskListProps) {
  const router = useRouter();
  const [processingTasks, setProcessingTasks] = useState<Record<string, string>>({});
  const [confirmDelete, setConfirmDelete] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<'deadline' | 'priority' | 'title'>('deadline');
  const [showFilters, setShowFilters] = useState(false);
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);

  // Check if user has permission to perform certain actions
  const isProjectOwner = userRole === 'project_owner' || userRole === 'Project Owner';
  const isTeamLeader = userRole === 'team_leader' || userRole === 'Team Leader';
  
  // Filter the tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.Title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Status filter
    if (statusFilter !== 'all') {
      if (statusFilter === 'Completed' && !task.Completed) return false;
      if (statusFilter === 'In Progress' && task.Status !== 'In Progress') return false;
      if (statusFilter === 'Not Started' && task.Status !== 'Not Started') return false;
    }
    
    // Priority filter
    if (priorityFilter !== 'all' && task.Priority !== priorityFilter) {
      return false;
    }
    
    // Completed filter
    if (!showCompleted && task.Completed) {
      return false;
    }
    
    return true;
  }).sort((a, b) => {
    if (sortBy === 'deadline') {
      if (!a.Deadline) return 1;
      if (!b.Deadline) return -1;
      return new Date(a.Deadline).getTime() - new Date(b.Deadline).getTime();
    }
    
    if (sortBy === 'priority') {
      const priorityOrder = { 'HIGH': 0, 'MEDIUM': 1, 'LOW': 2 };
      return priorityOrder[a.Priority] - priorityOrder[b.Priority];
    }
    
    if (sortBy === 'title') {
      return a.Title.localeCompare(b.Title);
    }
    
    return 0;
  });

  // Handle mark task as complete
  const handleCompleteTask = async (taskId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    if (processingTasks[taskId]) return;
    
    setProcessingTasks(prev => ({ ...prev, [taskId]: 'completing' }));
    
    try {
      await markTaskComplete(taskId);
      
      toast.success('Task marked as complete');
      
      // Refresh the task list if callback is provided
      if (onTasksChange) {
        onTasksChange();
      } else {
        // Update local state
        const updatedTasks = tasks.map(task => 
          task.Id === taskId ? { ...task, Status: 'Completed', Completed: true } : task
        );
        // We can't directly update tasks since it's a prop, but we can show the updated state
        // through the processingTasks state until the parent component refreshes
      }
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
    } finally {
      setProcessingTasks(prev => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
    }
  };

  // Handle delete task
  const handleDeleteTask = async (taskId: string) => {
    if (processingTasks[taskId]) return;
    
    setProcessingTasks(prev => ({ ...prev, [taskId]: 'deleting' }));
    
    try {
      await deleteTask(taskId);
      
      toast.success('Task deleted successfully');
      
      // Refresh the task list if callback is provided
      if (onTasksChange) {
        onTasksChange();
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Could not delete task');
    } finally {
      setProcessingTasks(prev => {
        const updated = { ...prev };
        delete updated[taskId];
        return updated;
      });
      
      setConfirmDelete(null);
    }
  };

  // Reset all filters
  const resetFilters = () => {
    setSearchQuery('');
    setStatusFilter('all');
    setPriorityFilter('all');
    setShowCompleted(true);
    setSortBy('deadline');
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-16">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading Tasks</h3>
          <p className="text-muted-foreground">
            Please wait while we gather your tasks...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-8 w-8" />}
        title="Error Loading Tasks"
        description={error}
        action={
          <Button 
            onClick={() => window.location.reload()}
          >
            Try Again
          </Button>
        }
      />
    );
  }

  // Empty state
  if (tasks.length === 0) {
    return (
      <EmptyState
        icon={<Sparkles className="h-8 w-8" />}
        title="No Tasks Found"
        description={showProjectInfo
          ? "You don't have any tasks assigned to you yet."
          : "This project doesn't have any tasks yet."}
        action={(isProjectOwner || isTeamLeader) && projectId && (
          <Button
            onClick={() => router.push(`/projects/${projectId}/tasks/create`)}
          >
            <Plus className="h-4 w-4 mr-2" />
            Create Task
          </Button>
        )}
      />
    );
  }

  return (
    <div className="space-y-5">
      {/* Filters UI */}
      {enableFiltering && (
        <motion.div 
          variants={fadeIn}
          initial="hidden"
          animate="visible"
          className="mb-6 space-y-4"
        >
          <div className="flex flex-col md:flex-row gap-3">
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
                <Filter className="h-4 w-4" />
                <span className="hidden sm:inline">Filters</span>
              </Button>
              
              <div className="relative">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value as any)}
                  className="h-10 appearance-none rounded-md border border-input bg-background px-3 pr-10 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                >
                  <option value="deadline">Sort by Deadline</option>
                  <option value="priority">Sort by Priority</option>
                  <option value="title">Sort by Name</option>
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
                        <label className="block text-sm font-medium mb-2">Completed</label>
                        <div className="flex items-center mt-3">
                          <label className="relative inline-flex items-center cursor-pointer">
                            <input 
                              type="checkbox" 
                              className="sr-only peer" 
                              checked={showCompleted}
                              onChange={(e) => setShowCompleted(e.target.checked)}
                            />
                            <div className="w-11 h-6 bg-muted peer-focus:outline-none peer-focus:ring-2 peer-focus:ring-primary/30 dark:peer-focus:ring-primary/30 rounded-full peer dark:bg-muted peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-gray-600 peer-checked:bg-primary"></div>
                            <span className="ms-3 text-sm font-medium">
                              {showCompleted ? 'Show completed tasks' : 'Hide completed tasks'}
                            </span>
                          </label>
                        </div>
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
            {(statusFilter !== 'all' || priorityFilter !== 'all' || searchQuery || !showCompleted) && (
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
                
                {!showCompleted && (
                  <Badge variant="default" className="flex gap-1 items-center">
                    <span>Hiding Completed</span>
                    <Button
                      onClick={() => setShowCompleted(true)}
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
      )}
      
      {/* No matches */}
      {tasks.length > 0 && filteredTasks.length === 0 && (
        <EmptyState
          icon={<Filter className="h-8 w-8" />}
          title="No Matching Tasks"
          description="No tasks match your current filters."
          action={
            <Button onClick={resetFilters}>
              Reset All Filters
            </Button>
          }
        />
      )}
      
      {/* Task list */}
      {filteredTasks.length > 0 && (
        <LayoutGroup>
          <motion.div 
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-4"
          >
            <AnimatePresence mode="popLayout">
              {filteredTasks.map((task) => (
                <motion.div
                  key={task.Id}
                  layout
                  variants={slideUp}
                  initial="hidden"
                  animate="visible"
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.2 }}
                >
                  <TaskCard
                    task={task}
                    onClick={() => router.push(`/tasks/${task.Id}`)}
                    onComplete={
                      // Only show if not being processed and user has permission
                      !processingTasks[task.Id] &&
                      (isProjectOwner || isTeamLeader || currentUserId === task.UserId || currentUserId === task.CreatedBy) &&
                      !task.Completed
                        ? (e) => handleCompleteTask(task.Id, e)
                        : undefined
                    }
                    currentUserId={currentUserId}
                    userRole={isProjectOwner ? 'project_owner' : isTeamLeader ? 'team_leader' : undefined}
                    project={task.project} // Pass project if available
                    showProjectInfo={showProjectInfo}
                    className={processingTasks[task.Id] ? 'opacity-70 pointer-events-none' : ''}
                  />
                </motion.div>
              ))}
            </AnimatePresence>
          </motion.div>
        </LayoutGroup>
      )}

      {/* Delete Confirmation Dialog */}
      <Dialog
        open={!!confirmDelete}
        onOpenChange={(open) => !open && setConfirmDelete(null)}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
      >
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setConfirmDelete(null)}
            disabled={confirmDelete ? processingTasks[confirmDelete] === 'deleting' : false}
          >
            Cancel
          </Button>
          
          <Button
            variant="destructive"
            onClick={() => confirmDelete && handleDeleteTask(confirmDelete)}
            disabled={confirmDelete ? processingTasks[confirmDelete] === 'deleting' : false}
            isLoading={confirmDelete ? processingTasks[confirmDelete] === 'deleting' : false}
          >
            Delete
          </Button>
        </div>
      </Dialog>
    </div>
  );
}