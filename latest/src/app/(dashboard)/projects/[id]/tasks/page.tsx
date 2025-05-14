'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import {
  CheckCircle2,
  Clock,
  Plus,
  Search,
  Tag,
  User,
  Users,
  Filter,
  ArrowLeft,
  X,
  AlertTriangle,
  Calendar,
  // ListTodo likely doesn't exist in the package, replacing with CheckSquare
  CheckSquare as ListTodo
} from 'lucide-react';
import { format, isPast, isToday } from 'date-fns';

// API imports
import { getProjectById, getProjectTasks } from '@/api/ProjectAPI';
import { markTaskComplete } from '@/api/TaskAPI';
import { useUser } from '@/hooks/useUser';
import { toast } from '@/lib/toast';

// CSS for the page
import './projectTasks.css';

export default function ProjectTasksPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  // States
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [showCompleted, setShowCompleted] = useState(true);
  const [animateIn, setAnimateIn] = useState(true); // Start with true to show content immediately

  // Fetch project and tasks data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch project and tasks in parallel
        const [projectData, tasksData] = await Promise.all([
          getProjectById(id),
          getProjectTasks(id)
        ]);
        
        setProject(projectData);
        setTasks(tasksData);
        
        // Check if current user is project owner
        setIsOwner(user?.Id === projectData.OwnerId);
      } catch (error) {
        console.error('Failed to load project tasks:', error);
        toast.error('Could not load tasks for this project');
      } finally {
        setLoading(false);
      }
    };
    
    if (id && user) {
      loadData();
    }
  }, [id, user]);

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
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not mark task as complete');
    }
  };

  // Filter tasks based on search and filter
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.Title.toLowerCase().includes(searchQuery.toLowerCase())) {
      return false;
    }
    
    // Priority filter
    if (priorityFilter !== 'all' && task.Priority !== priorityFilter) {
      return false;
    }
    
    // Hide completed if needed
    if (!showCompleted && task.Completed) {
      return false;
    }
    
    return true;
  });

  // Group tasks by status for Kanban-like view
  const groupedTasks = {
    'Not Started': filteredTasks.filter(task => task.Status === 'Not Started'),
    'In Progress': filteredTasks.filter(task => task.Status === 'In Progress'),
    'Completed': filteredTasks.filter(task => task.Status === 'Completed')
  };

  // Get the person a task is assigned to (user or team)
  const getAssignee = (task) => {
    if (task.UserId) {
      return task.UserId === user?.Id ? 'You' : 'Another user';
    } else if (task.TeamId) {
      return 'Team';
    } else {
      return 'Unassigned';
    }
  };

  // Check if the current user can complete a task
  const canCompleteTask = (task) => {
    return !task.Completed && (isOwner || user?.Id === task.UserId || user?.Id === task.CreatedBy);
  };

  // Priority color mapping
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'var(--task-high-priority)';
      case 'MEDIUM': return 'var(--task-medium-priority)';
      case 'LOW': return 'var(--task-low-priority)';
      default: return 'var(--task-low-priority)';
    }
  };

  // Priority label mapping
  const getPriorityLabel = (priority) => {
    switch (priority) {
      case 'HIGH': return 'High';
      case 'MEDIUM': return 'Medium';
      case 'LOW': return 'Low';
      default: return priority;
    }
  };

  return (
    <div className="project-tasks-container">
      {/* Header */}
      <div className="project-tasks-header">
        <div className="project-tasks-title">
          <button 
            className="back-button" 
            onClick={() => router.push(`/projects/${id}`)}
            aria-label="Back to project details"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="title-animation">{project?.Name || 'Project'} Tasks</h1>
            <p className="subtitle">
              Manage and track tasks for this project
            </p>
          </div>
        </div>
        
        {isOwner && (
          <button 
            className="create-task-button"
            onClick={() => router.push(`/projects/${id}/tasks/create`)}
            aria-label="Create new task"
          >
            <Plus size={18} />
            <span>Create Task</span>
          </button>
        )}
      </div>
      
      {/* Filters */}
      <div className="project-tasks-filters">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            aria-label="Search tasks"
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
              aria-label="Clear search"
            >
              <X size={16} />
            </button>
          )}
        </div>
        
        <div className="filter-controls">
          <div className="filter-group">
            <label htmlFor="priority-filter">Priority</label>
            <select 
              id="priority-filter"
              value={priorityFilter}
              onChange={(e) => setPriorityFilter(e.target.value)}
              aria-label="Filter by priority"
            >
              <option value="all">All Priorities</option>
              <option value="HIGH">High Priority</option>
              <option value="MEDIUM">Medium Priority</option>
              <option value="LOW">Low Priority</option>
            </select>
          </div>
          
          <button 
            className={`toggle-button ${showCompleted ? '' : 'active'}`}
            onClick={() => setShowCompleted(!showCompleted)}
            aria-label={showCompleted ? "Hide completed tasks" : "Show completed tasks"}
          >
            {showCompleted ? 'Hide Completed' : 'Show Completed'}
          </button>
        </div>
      </div>
      
      {/* Task board */}
      {loading ? (
        <div className="loading-skeleton">
          {Array.from({ length: 3 }).map((_, i) => (
            <div key={i} className="column-skeleton">
              <div className="column-header-skeleton"></div>
              {Array.from({ length: 2 }).map((_, j) => (
                <div key={j} className="task-skeleton">
                  <div className="task-skeleton-title"></div>
                  <div className="task-skeleton-desc"></div>
                </div>
              ))}
            </div>
          ))}
        </div>
      ) : tasks.length === 0 ? (
        <div className="modern-empty-state">
          <div className="empty-state-illustration">
            <div className="illustration-icon">
              <ListTodo size={32} />
            </div>
          </div>
          
          <div className="empty-content">
            <h2>No Tasks Yet</h2>
            <p>
              {isOwner 
                ? "Get started by creating tasks and assigning them to team members." 
                : "The project owner hasn't created any tasks for this project yet."}
            </p>
            
            {isOwner && (
              <button 
                className="empty-primary-button"
                onClick={() => router.push(`/projects/${id}/tasks/create`)}
              >
                <Plus size={16} />
                <span>Create First Task</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="no-results">
          <Filter size={32} />
          <h2>No Matching Tasks</h2>
          <p>No tasks match your current search or filters.</p>
          <button 
            className="reset-button"
            onClick={() => {
              setSearchQuery('');
              setPriorityFilter('all');
              setShowCompleted(true);
            }}
          >
            Reset Filters
          </button>
        </div>
      ) : (
        <div className="task-board">
          {Object.entries(groupedTasks).map(([status, statusTasks]) => (
            <div key={status} className="task-column">
              <div className={`column-header ${status.toLowerCase().replace(' ', '-')}`}>
                <h3>{status}</h3>
                <span className="task-count">{statusTasks.length}</span>
              </div>
              
              <div className="column-tasks">
                {statusTasks.length === 0 ? (
                  <div className="empty-column">
                    <p>No tasks</p>
                  </div>
                ) : (
                  statusTasks.map((task, index) => (
                    <div 
                      key={task.Id} 
                      className={`task-card ${task.Completed ? 'completed' : ''}`}
                      onClick={() => router.push(`/tasks/${task.Id}`)}
                    >
                      <div 
                        className="task-priority"
                        style={{ backgroundColor: getPriorityColor(task.Priority) }}
                      ></div>
                      <div className="task-content">
                        <div className="task-header">
                          <div className="task-title-container">
                            <h4 className="task-title">{task.Title}</h4>
                            <div className="priority-tag" style={{ backgroundColor: `${getPriorityColor(task.Priority)}20`, color: getPriorityColor(task.Priority) }}>
                              {getPriorityLabel(task.Priority)}
                            </div>
                          </div>
                        </div>
                        
                        {task.Description && (
                          <p className="task-description">{task.Description}</p>
                        )}
                        
                        <div className="task-progress">
                          <div className="progress-bar">
                            <div 
                              className="progress-fill"
                              style={{
                                width: task.Completed ? '100%' : task.Status === 'In Progress' ? '50%' : '0%',
                                backgroundColor: task.Completed 
                                  ? 'var(--success)' 
                                  : task.Status === 'In Progress'
                                  ? 'var(--primary)'
                                  : 'var(--muted-foreground)'
                              }}
                            ></div>
                          </div>
                        </div>
                        
                        <div className="task-footer">
                          <div className="task-meta">
                            {task.Deadline && (
                              <div className={`task-deadline ${
                                isPast(new Date(task.Deadline)) && !task.Completed ? 'overdue' :
                                isToday(new Date(task.Deadline)) ? 'today' : ''
                              }`}>
                                <Calendar size={14} />
                                <span>
                                  {format(new Date(task.Deadline), 'MMM d, yyyy')}
                                </span>
                              </div>
                            )}
                            
                            <div className="task-assignee">
                              {task.TeamId ? (
                                <Users size={14} />
                              ) : (
                                <User size={14} />
                              )}
                              <span>{getAssignee(task)}</span>
                            </div>
                          </div>
                          
                          {canCompleteTask(task) && (
                            <button
                              className="complete-button"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleCompleteTask(task.Id);
                              }}
                              aria-label="Mark task as complete"
                            >
                              <CheckCircle2 size={16} />
                              <span className="complete-tooltip">Complete</span>
                            </button>
                          )}
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          ))}
        </div>
      )}
      
      {/* Floating Create Task Button - Only visible to project owner */}
      {isOwner && (
        <button 
          className="floating-create-button"
          onClick={() => router.push(`/projects/${id}/tasks/create`)}
          aria-label="Create new task"
        >
          <Plus size={24} />
        </button>
      )}
    </div>
  );
}