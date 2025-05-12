'use client';

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Calendar, 
  CheckCircle2, 
  Clock, 
  Filter, 
  PlusCircle, 
  Search, 
  Tag, 
  Trash2, 
  X,
  AlertCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';

// API imports
import { 
  getProjectTasks, 
  createTask, 
  updateTask, 
  markTaskComplete, 
  deleteTask 
} from '@/api/TaskAPI';
import { getProjects } from '@/api/ProjectAPI';
import { getProjectTeams } from '@/api/TeamAPI';

const TaskPage = () => {
  // Main states
  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  
  // Modal states
  const [createModalOpen, setCreateModalOpen] = useState(false);
  const [selectedTask, setSelectedTask] = useState(null);

  // Filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [projectFilter, setProjectFilter] = useState('all');
  
  // New task form state
  const [taskForm, setTaskForm] = useState({
    Title: '',
    Description: '',
    Cost: 0,
    Status: 'Not Started',
    StatusColorHex: '#3B82F6',
    Priority: 'MEDIUM',
    PriorityColorHex: '#F59E0B',
    Deadline: '',
    TeamId: '',
    UserId: '',
    ParentTaskId: '',
    ProjectId: ''
  });
  
  // Operation state
  const [saving, setSaving] = useState(false);

  // Fetch data on component mount
  useEffect(() => {
    const loadData = async () => {
      try {
        const projectsData = await getProjects();
        setProjects(projectsData);
        
        // Default project selection if available
        if (projectsData.length > 0) {
          setTaskForm(prev => ({
            ...prev,
            ProjectId: projectsData[0].Id
          }));

          // Fetch teams for this project
          const teamsData = await getProjectTeams(projectsData[0].Id);
          setTeams(teamsData);
          
          // Fetch tasks from all projects
          const allTasksPromises = projectsData.map(project => 
            getProjectTasks(project.Id).then(tasks => 
              tasks.map(task => ({
                ...task,
                projectName: project.Name
              }))
            )
          );
          
          const allTasks = (await Promise.all(allTasksPromises)).flat();
          setTasks(allTasks);
        }
      } catch (error) {
        console.error("Failed to load initial data:", error);
        toast.error("Failed to load tasks");
      } finally {
        setLoading(false);
      }
    };
    
    loadData();
  }, []);
  
  // Update teams when project changes
  useEffect(() => {
    const updateTeams = async () => {
      if (taskForm.ProjectId) {
        try {
          const teamsData = await getProjectTeams(taskForm.ProjectId);
          setTeams(teamsData);
          
          // Reset team selection if the current team doesn't belong to the project
          if (!teamsData.some(team => team.Id === taskForm.TeamId)) {
            setTaskForm(prev => ({
              ...prev,
              TeamId: teamsData.length > 0 ? teamsData[0].Id : ''
            }));
          }
        } catch (error) {
          console.error("Failed to load teams:", error);
        }
      }
    };
    
    updateTeams();
  }, [taskForm.ProjectId]);
  
  // Handle task creation
  const handleCreateTask = async () => {
    if (!taskForm.Title) {
      toast.error("Task title is required");
      return;
    }
    
    if (!taskForm.ProjectId) {
      toast.error("Please select a project");
      return;
    }
    
    setSaving(true);
    
    try {
      const newTask = await createTask({
        Title: taskForm.Title,
        Description: taskForm.Description,
        Cost: Number(taskForm.Cost) || 0,
        Status: taskForm.Status,
        StatusColorHex: taskForm.StatusColorHex,
        Priority: taskForm.Priority,
        PriorityColorHex: taskForm.PriorityColorHex,
        Deadline: taskForm.Deadline ? new Date(taskForm.Deadline).toISOString() : null,
        TeamId: taskForm.TeamId || null,
        UserId: taskForm.UserId || null,
        ParentTaskId: taskForm.ParentTaskId || null,
        ProjectId: taskForm.ProjectId
      });
      
      // Find the project name
      const projectName = projects.find(p => p.Id === taskForm.ProjectId)?.Name || '';
      
      // Add task to state with project name
      setTasks(prevTasks => [
        { ...newTask, projectName },
        ...prevTasks
      ]);
      
      // Reset form
      setTaskForm({
        Title: '',
        Description: '',
        Cost: 0,
        Status: 'Not Started',
        StatusColorHex: '#3B82F6',
        Priority: 'MEDIUM',
        PriorityColorHex: '#F59E0B',
        Deadline: '',
        TeamId: '',
        UserId: '',
        ParentTaskId: '',
        ProjectId: taskForm.ProjectId // Keep the same project selected
      });
      
      setCreateModalOpen(false);
      toast.success("Task created successfully");
    } catch (error) {
      console.error("Failed to create task:", error);
      toast.error("Failed to create task");
    } finally {
      setSaving(false);
    }
  };
  
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
      
      toast.success("Task marked as complete");
    } catch (error) {
      console.error("Failed to complete task:", error);
      toast.error("Failed to mark task as complete");
    }
  };
  
  // Handle task deletion
  const handleDeleteTask = async (taskId) => {
    if (!confirm("Are you sure you want to delete this task?")) return;
    
    try {
      await deleteTask(taskId);
      
      // Update local state
      setTasks(prevTasks => prevTasks.filter(task => task.Id !== taskId));
      
      toast.success("Task deleted successfully");
    } catch (error) {
      console.error("Failed to delete task:", error);
      toast.error("Failed to delete task");
    }
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    if (!dateString) return '';
    
    const date = new Date(dateString);
    return `${date.getMonth() + 1}/${date.getDate()}/${date.getFullYear()}`;
  };
  
  // Is date in the past?
  const isDatePast = (dateString) => {
    if (!dateString) return false;
    
    const date = new Date(dateString);
    return date < new Date();
  };
  
  // Filter tasks
  const filteredTasks = tasks.filter(task => {
    // Search filter
    if (searchQuery && !task.Title.toLowerCase().includes(searchQuery.toLowerCase())) {
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
    
    return true;
  });
  
  // Get status color based on status
  const getStatusColor = (status) => {
    switch (status) {
      case 'Completed': return 'bg-green-500';
      case 'In Progress': return 'bg-blue-500';
      case 'Not Started': return 'bg-gray-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Get priority color based on priority
  const getPriorityColor = (priority) => {
    switch (priority) {
      case 'HIGH': return 'bg-red-500';
      case 'MEDIUM': return 'bg-amber-500';
      case 'LOW': return 'bg-blue-500';
      default: return 'bg-gray-500';
    }
  };
  
  // Status options for filtering
  const statusOptions = [
    { value: 'all', label: 'All Statuses' },
    { value: 'Not Started', label: 'Not Started' },
    { value: 'In Progress', label: 'In Progress' },
    { value: 'Completed', label: 'Completed' }
  ];
  
  // Priority options for filtering
  const priorityOptions = [
    { value: 'all', label: 'All Priorities' },
    { value: 'LOW', label: 'Low' },
    { value: 'MEDIUM', label: 'Medium' },
    { value: 'HIGH', label: 'High' }
  ];

  // Render empty state
  if (!loading && tasks.length === 0) {
    return (
      <div className="flex flex-col h-full">
        <div className="flex items-center justify-between p-4 border-b">
          <h1 className="text-xl font-semibold">Tasks</h1>
          <button 
            className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg"
            onClick={() => setCreateModalOpen(true)}
          >
            <PlusCircle size={20} />
          </button>
        </div>

        <div className="flex-1 flex flex-col items-center justify-center p-4">
          <div className="text-center">
            <div className="w-16 h-16 mx-auto mb-4 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center">
              <Calendar size={24} />
            </div>
            <h3 className="text-lg font-medium mb-2">No tasks yet</h3>
            <p className="text-sm text-gray-500 mb-6">Create your first task to get started</p>
            <button 
              className="px-4 py-2 bg-blue-600 text-white rounded-lg"
              onClick={() => setCreateModalOpen(true)}
            >
              Create Task
            </button>
          </div>
        </div>

        {/* Task Creation Modal */}
        {createModalOpen && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
            <CreateTaskModal 
              taskForm={taskForm}
              setTaskForm={setTaskForm}
              onClose={() => setCreateModalOpen(false)}
              onSubmit={handleCreateTask}
              projects={projects}
              teams={teams}
              saving={saving}
            />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b">
        <h1 className="text-xl font-semibold">Tasks</h1>
        <button 
          className="flex items-center justify-center w-9 h-9 bg-blue-600 text-white rounded-lg"
          onClick={() => setCreateModalOpen(true)}
        >
          <PlusCircle size={20} />
        </button>
      </div>

      {/* Search and Filters */}
      <div className="border-b p-4 space-y-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text"
            placeholder="Search tasks..."
            className="w-full pl-10 pr-4 py-2 border rounded-lg"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>

        {/* Filter buttons */}
        <div className="flex flex-wrap gap-2">
          {/* Status filter */}
          <div className="relative group">
            <button className="px-3 py-1.5 border rounded-lg flex items-center gap-1.5 text-sm">
              <Filter size={14} />
              <span>Status</span>
            </button>
            <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-1 hidden group-hover:block z-10 min-w-[160px]">
              {statusOptions.map(option => (
                <button
                  key={option.value}
                  className={cn(
                    "w-full px-3 py-1.5 text-left text-sm rounded-md",
                    statusFilter === option.value ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                  )}
                  onClick={() => setStatusFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Priority filter */}
          <div className="relative group">
            <button className="px-3 py-1.5 border rounded-lg flex items-center gap-1.5 text-sm">
              <Filter size={14} />
              <span>Priority</span>
            </button>
            <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-1 hidden group-hover:block z-10 min-w-[160px]">
              {priorityOptions.map(option => (
                <button
                  key={option.value}
                  className={cn(
                    "w-full px-3 py-1.5 text-left text-sm rounded-md",
                    priorityFilter === option.value ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                  )}
                  onClick={() => setPriorityFilter(option.value)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          {/* Project filter */}
          {projects.length > 0 && (
            <div className="relative group">
              <button className="px-3 py-1.5 border rounded-lg flex items-center gap-1.5 text-sm">
                <Filter size={14} />
                <span>Project</span>
              </button>
              <div className="absolute left-0 top-full mt-1 bg-white border rounded-lg shadow-lg p-1 hidden group-hover:block z-10 min-w-[180px]">
                <button
                  className={cn(
                    "w-full px-3 py-1.5 text-left text-sm rounded-md",
                    projectFilter === 'all' ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                  )}
                  onClick={() => setProjectFilter('all')}
                >
                  All Projects
                </button>
                {projects.map(project => (
                  <button
                    key={project.Id}
                    className={cn(
                      "w-full px-3 py-1.5 text-left text-sm rounded-md truncate",
                      projectFilter === project.Id ? "bg-blue-50 text-blue-600" : "hover:bg-gray-50"
                    )}
                    onClick={() => setProjectFilter(project.Id)}
                  >
                    {project.Name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Reset filters */}
          {(searchQuery || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all') && (
            <button 
              className="px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setProjectFilter('all');
              }}
            >
              Clear filters
            </button>
          )}
        </div>
      </div>

      {/* Task list */}
      {loading ? (
        <div className="flex-1 flex items-center justify-center">
          <div className="animate-spin w-8 h-8 border-2 border-blue-600 border-t-transparent rounded-full"></div>
        </div>
      ) : filteredTasks.length === 0 ? (
        <div className="flex-1 flex items-center justify-center p-4">
          <div className="text-center">
            <p className="text-gray-500">No tasks match your filter criteria</p>
            <button 
              className="mt-2 px-3 py-1.5 text-sm text-blue-600 hover:bg-blue-50 rounded-lg"
              onClick={() => {
                setSearchQuery('');
                setStatusFilter('all');
                setPriorityFilter('all');
                setProjectFilter('all');
              }}
            >
              Clear filters
            </button>
          </div>
        </div>
      ) : (
        <div className="flex-1 overflow-auto p-4">
          <div className="space-y-3">
            {filteredTasks.map(task => (
              <div 
                key={task.Id} 
                className={cn(
                  "border rounded-lg p-3 bg-white",
                  task.Completed ? "bg-gray-50" : ""
                )}
              >
                <div className="flex items-start gap-3">
                  <button 
                    className={cn(
                      "flex-shrink-0 mt-0.5 w-5 h-5 rounded-full border-2",
                      task.Completed 
                        ? "bg-green-500 border-green-500" 
                        : "border-gray-300"
                    )}
                    onClick={() => !task.Completed && handleCompleteTask(task.Id)}
                  >
                    {task.Completed && (
                      <CheckCircle2 size={14} className="text-white" />
                    )}
                  </button>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <h3 className={cn(
                        "font-medium",
                        task.Completed ? "line-through text-gray-500" : ""
                      )}>
                        {task.Title}
                      </h3>
                      
                      <div className="flex items-center gap-2">
                        <span className={cn(
                          "inline-block px-2 py-0.5 text-xs rounded-full",
                          getPriorityColor(task.Priority),
                          "text-white"
                        )}>
                          {task.Priority}
                        </span>
                        
                        {!task.Completed && (
                          <button
                            className="text-gray-400 hover:text-red-500"
                            onClick={() => handleDeleteTask(task.Id)}
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </div>
                    
                    {task.Description && (
                      <p className={cn(
                        "text-sm text-gray-600 mt-1",
                        task.Completed ? "text-gray-400" : ""
                      )}>
                        {task.Description}
                      </p>
                    )}
                    
                    <div className="flex items-center gap-3 mt-2 text-xs text-gray-500">
                      {task.projectName && (
                        <span className="flex items-center gap-1">
                          <Tag size={12} />
                          {task.projectName}
                        </span>
                      )}
                      
                      {task.Deadline && (
                        <span className={cn(
                          "flex items-center gap-1",
                          isDatePast(task.Deadline) && !task.Completed 
                            ? "text-red-500" 
                            : ""
                        )}>
                          <Clock size={12} />
                          {formatDate(task.Deadline)}
                        </span>
                      )}
                      
                      <span className={cn(
                        "inline-flex items-center px-2 rounded-full",
                        getStatusColor(task.Status),
                        "text-white"
                      )}>
                        {task.Status}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Task Creation Modal */}
      {createModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <CreateTaskModal 
            taskForm={taskForm}
            setTaskForm={setTaskForm}
            onClose={() => setCreateModalOpen(false)}
            onSubmit={handleCreateTask}
            projects={projects}
            teams={teams}
            saving={saving}
          />
        </div>
      )}
    </div>
  );
};

// Create Task Modal Component
const CreateTaskModal = ({ taskForm, setTaskForm, onClose, onSubmit, projects, teams, saving }) => {
  return (
    <div className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden">
      <div className="p-4 border-b bg-blue-600 text-white">
        <h2 className="text-lg font-semibold">New Task</h2>
      </div>
      
      <div className="p-5 max-h-[calc(100vh-200px)] overflow-y-auto">
        <div className="space-y-4">
          {/* Title */}
          <div>
            <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">
              Task title <span className="text-red-500">*</span>
            </label>
            <input
              id="title"
              type="text"
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Task title"
              value={taskForm.Title}
              onChange={(e) => setTaskForm({ ...taskForm, Title: e.target.value })}
            />
          </div>
          
          {/* Description */}
          <div>
            <label htmlFor="description" className="block text-sm font-medium text-gray-700 mb-1">
              Description (optional)
            </label>
            <textarea
              id="description"
              className="w-full px-3 py-2 border rounded-lg min-h-[80px]"
              placeholder="Description (optional)"
              value={taskForm.Description}
              onChange={(e) => setTaskForm({ ...taskForm, Description: e.target.value })}
            ></textarea>
          </div>
          
          {/* Project */}
          <div>
            <label htmlFor="project" className="block text-sm font-medium text-gray-700 mb-1">
              Project <span className="text-red-500">*</span>
            </label>
            <select
              id="project"
              className="w-full px-3 py-2 border rounded-lg"
              value={taskForm.ProjectId}
              onChange={(e) => setTaskForm({ ...taskForm, ProjectId: e.target.value })}
            >
              <option value="">Select project</option>
              {projects.map(project => (
                <option key={project.Id} value={project.Id}>
                  {project.Name}
                </option>
              ))}
            </select>
          </div>
          
          {/* Status & Priority */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="status" className="block text-sm font-medium text-gray-700 mb-1">
                Status
              </label>
              <select
                id="status"
                className="w-full px-3 py-2 border rounded-lg"
                value={taskForm.Status}
                onChange={(e) => setTaskForm({ ...taskForm, Status: e.target.value })}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700 mb-1">
                Priority
              </label>
              <select
                id="priority"
                className="w-full px-3 py-2 border rounded-lg"
                value={taskForm.Priority}
                onChange={(e) => setTaskForm({ ...taskForm, Priority: e.target.value })}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          
          {/* Team & Cost */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label htmlFor="team" className="block text-sm font-medium text-gray-700 mb-1">
                Team (optional)
              </label>
              <select
                id="team"
                className="w-full px-3 py-2 border rounded-lg"
                value={taskForm.TeamId}
                onChange={(e) => setTaskForm({ ...taskForm, TeamId: e.target.value })}
                disabled={!taskForm.ProjectId || teams.length === 0}
              >
                <option value="">No team</option>
                {teams.map(team => (
                  <option key={team.Id} value={team.Id}>
                    {team.Name}
                  </option>
                ))}
              </select>
            </div>
            
            <div>
              <label htmlFor="cost" className="block text-sm font-medium text-gray-700 mb-1">
                Cost
              </label>
              <input
                id="cost"
                type="number"
                className="w-full px-3 py-2 border rounded-lg"
                placeholder="0"
                value={taskForm.Cost}
                onChange={(e) => setTaskForm({ ...taskForm, Cost: e.target.value })}
              />
            </div>
          </div>
          
          {/* Deadline */}
          <div>
            <label htmlFor="deadline" className="block text-sm font-medium text-gray-700 mb-1">
              Deadline
            </label>
            <input
              id="deadline"
              type="date"
              className="w-full px-3 py-2 border rounded-lg"
              value={taskForm.Deadline || ''}
              onChange={(e) => setTaskForm({ ...taskForm, Deadline: e.target.value })}
            />
          </div>
        </div>
      </div>
      
      <div className="p-4 border-t bg-gray-50 flex justify-end gap-3">
        <button
          className="px-4 py-2 text-gray-700 border rounded-lg"
          onClick={onClose}
          disabled={saving}
        >
          Cancel
        </button>
        <button
          className={cn(
            "px-4 py-2 bg-blue-600 text-white rounded-lg",
            (!taskForm.Title || !taskForm.ProjectId || saving) ? "opacity-50 cursor-not-allowed" : ""
          )}
          onClick={onSubmit}
          disabled={!taskForm.Title || !taskForm.ProjectId || saving}
        >
          {saving ? "Creating..." : "Create Task"}
        </button>
      </div>
    </div>
  );
};

export default TaskPage;