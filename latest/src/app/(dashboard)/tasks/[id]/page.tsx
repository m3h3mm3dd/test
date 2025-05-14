'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, 
  CheckCircle, 
  Clock, 
  Calendar,
  Flag,
  Tag,
  User,
  PenSquare,
  X,
  Paperclip,
  Plus,
  AlertCircle,
  CheckCircle2,
  Trash2,
  MoreHorizontal,
  Users,
  MessageCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { format, isPast, isToday, differenceInDays } from 'date-fns';
import { useUser } from '@/hooks/useUser';

// API imports
import { 
  getTaskById, 
  updateTask, 
  markTaskComplete,
  getTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment
} from '@/api/TaskAPI';
import { getProjectById } from '@/api/ProjectAPI';

interface Task {
  Id: string;
  Title: string;
  Description: string;
  Status: string;
  StatusColorHex?: string;
  Priority: string;
  PriorityColorHex?: string;
  Deadline?: string;
  ProjectId: string;
  TeamId?: string;
  UserId?: string;
  CreatedBy: string;
  Completed: boolean;
  CreatedAt: string;
  UpdatedAt: string;
  Cost?: number;
}

interface Project {
  Id: string;
  Name: string;
  OwnerId: string;
}

interface Attachment {
  Id: string;
  FileName: string;
  FileType: string;
  FileSize: number;
  FilePath: string;
  Url?: string;
}

export default function TaskDetailPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useUser();
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Main states
  const [task, setTask] = useState<Task | null>(null);
  const [project, setProject] = useState<Project | null>(null);
  const [attachments, setAttachments] = useState<Attachment[]>([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  
  // Edit states
  const [isEditing, setIsEditing] = useState(false);
  const [editedTask, setEditedTask] = useState<Partial<Task>>({});
  const [saving, setSaving] = useState(false);
  
  // Permissions
  const [canEdit, setCanEdit] = useState(false);
  const [canComplete, setCanComplete] = useState(false);
  
  // Action menu state
  const [menuOpen, setMenuOpen] = useState(false);

  // Load task data
  useEffect(() => {
    const loadTaskData = async () => {
      try {
        setLoading(true);
        
        // Load task
        const taskData = await getTaskById(id as string);
        setTask(taskData);
        setEditedTask({
          Title: taskData.Title,
          Description: taskData.Description,
          Priority: taskData.Priority,
          Deadline: taskData.Deadline
        });
        
        // Load associated project
        if (taskData.ProjectId) {
          const projectData = await getProjectById(taskData.ProjectId);
          setProject(projectData);
        }
        
        // Load attachments
        const attachmentsData = await getTaskAttachments(id as string);
        setAttachments(attachmentsData);
        
        // Set permissions
        if (user) {
          // Only task creator can edit
          setCanEdit(user.Id === taskData.CreatedBy);
          
          // Task creator and assigned user can complete
          setCanComplete(
            (user.Id === taskData.CreatedBy || user.Id === taskData.UserId) && 
            !taskData.Completed
          );
        }
      } catch (error) {
        console.error('Failed to load task:', error);
        toast.error('Could not load task details');
      } finally {
        setLoading(false);
      }
    };
    
    if (id) {
      loadTaskData();
    }
  }, [id, user]);

  // Handle task completion
  const handleTaskComplete = async () => {
    if (!task || !canComplete) return;
    
    try {
      await markTaskComplete(task.Id);
      
      // Update local state
      setTask(prev => prev ? {
        ...prev,
        Status: 'Completed',
        Completed: true
      } : null);
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not mark task as complete');
    }
  };
  
  // Handle edit submit
  const handleEditSubmit = async () => {
    if (!task || !canEdit) return;
    
    setSaving(true);
    try {
      // Prepare update data
      const updateData = {
        Title: editedTask.Title,
        Description: editedTask.Description,
        Priority: editedTask.Priority,
        Deadline: editedTask.Deadline
      };
      
      // Update task
      const updatedTask = await updateTask(task.Id, updateData);
      
      // Update local state
      setTask({
        ...task,
        ...updatedTask
      });
      
      setIsEditing(false);
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Could not update task');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle attachment upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task) return;
    
    setUploading(true);
    try {
      const attachment = await uploadTaskAttachment(task.Id, file);
      setAttachments(prev => [...prev, attachment]);
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Could not upload file');
    } finally {
      setUploading(false);
      
      // Reset file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle attachment deletion
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task) return;
    
    try {
      await deleteTaskAttachment(task.Id, attachmentId);
      setAttachments(prev => prev.filter(a => a.Id !== attachmentId));
      toast.success('File deleted successfully');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Could not delete file');
    }
  };
  
  // Format date
  const formatDate = (dateString?: string) => {
    if (!dateString) return 'No deadline set';
    return format(new Date(dateString), 'MMM d, yyyy');
  };
  
  // Get priority badge classes
  const getPriorityClasses = (priority: string) => {
    switch (priority) {
      case 'HIGH':
        return 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300';
      case 'MEDIUM':
        return 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-300';
      case 'LOW':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Get status badge classes
  const getStatusClasses = (status: string) => {
    switch (status) {
      case 'Completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300';
      case 'In Progress':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300';
      case 'Not Started':
      default:
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-300';
    }
  };
  
  // Deadline status
  const getDeadlineStatus = () => {
    if (!task?.Deadline) return null;
    
    const deadline = new Date(task.Deadline);
    
    if (task.Completed) {
      return {
        label: 'Completed',
        classes: 'text-green-600 dark:text-green-400'
      };
    }
    
    if (isPast(deadline)) {
      return {
        label: 'Overdue',
        classes: 'text-red-600 dark:text-red-400'
      };
    }
    
    if (isToday(deadline)) {
      return {
        label: 'Due today',
        classes: 'text-amber-600 dark:text-amber-400'
      };
    }
    
    const daysLeft = differenceInDays(deadline, new Date());
    if (daysLeft <= 7) {
      return {
        label: `Due in ${daysLeft} ${daysLeft === 1 ? 'day' : 'days'}`,
        classes: 'text-amber-600 dark:text-amber-400'
      };
    }
    
    return {
      label: 'Upcoming',
      classes: 'text-blue-600 dark:text-blue-400'
    };
  };
  
  // Handle cancel edit
  const handleCancelEdit = () => {
    // Reset form
    if (task) {
      setEditedTask({
        Title: task.Title,
        Description: task.Description,
        Priority: task.Priority,
        Deadline: task.Deadline
      });
    }
    setIsEditing(false);
  };
  
  if (loading) {
    return <LoadingState />;
  }
  
  if (!task) {
    return <ErrorState onBack={() => router.push('/tasks')} />;
  }
  
  // Deadline info
  const deadlineStatus = getDeadlineStatus();
  
  return (
    <motion.div 
      className="min-h-screen bg-gray-50 dark:bg-gray-900"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.5 }}
    >
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700 sticky top-0 z-10">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/tasks')}
                className="mr-3 p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
              >
                <ArrowLeft className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
              
              <div>
                <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Task Details
                </h1>
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  View and manage task information
                </p>
              </div>
            </div>
            
            <div className="flex items-center gap-2">
              {canComplete && !task.Completed && (
                <button
                  onClick={handleTaskComplete}
                  className="px-3 py-1.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-sm font-medium flex items-center"
                >
                  <CheckCircle2 className="h-4 w-4 mr-1" />
                  Complete
                </button>
              )}
              
              {canEdit && !isEditing && (
                <button
                  onClick={() => setIsEditing(true)}
                  className="px-3 py-1.5 rounded-lg bg-primary hover:bg-primary/90 text-white text-sm font-medium flex items-center"
                >
                  <PenSquare className="h-4 w-4 mr-1" />
                  Edit
                </button>
              )}
              
              <div className="relative">
                <button
                  onClick={() => setMenuOpen(!menuOpen)}
                  className="p-1.5 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
                >
                  <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
                </button>
                
                {menuOpen && (
                  <div className="absolute right-0 mt-2 w-48 rounded-md shadow-lg bg-white dark:bg-gray-800 ring-1 ring-black ring-opacity-5 py-1">
                    <button
                      onClick={() => {
                        setMenuOpen(false);
                        router.push(`/projects/${task.ProjectId}`);
                      }}
                      className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                    >
                      View Project
                    </button>
                    
                    {task.TeamId && (
                      <button
                        onClick={() => {
                          setMenuOpen(false);
                          router.push(`/teams/${task.TeamId}`);
                        }}
                        className="block px-4 py-2 text-sm text-gray-700 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700 w-full text-left"
                      >
                        View Team
                      </button>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="bg-white dark:bg-gray-800 rounded-lg shadow border border-gray-200 dark:border-gray-700 overflow-hidden">
          {/* Task Header */}
          <div className="p-6 border-b border-gray-200 dark:border-gray-700">
            {isEditing ? (
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Title
                  </label>
                  <input
                    type="text"
                    value={editedTask.Title || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, Title: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    placeholder="Task title"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                    Description
                  </label>
                  <textarea
                    value={editedTask.Description || ''}
                    onChange={(e) => setEditedTask({ ...editedTask, Description: e.target.value })}
                    rows={4}
                    className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    placeholder="Task description"
                  />
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Priority
                    </label>
                    <select
                      value={editedTask.Priority || 'MEDIUM'}
                      onChange={(e) => setEditedTask({ ...editedTask, Priority: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    >
                      <option value="LOW">Low</option>
                      <option value="MEDIUM">Medium</option>
                      <option value="HIGH">High</option>
                    </select>
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1">
                      Deadline
                    </label>
                    <input
                      type="date"
                      value={editedTask.Deadline ? editedTask.Deadline.split('T')[0] : ''}
                      onChange={(e) => setEditedTask({ ...editedTask, Deadline: e.target.value ? new Date(e.target.value).toISOString() : undefined })}
                      className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:outline-none focus:ring-primary focus:border-primary dark:bg-gray-700 dark:text-white"
                    />
                  </div>
                </div>
                
                <div className="flex justify-end space-x-3 pt-4">
                  <button
                    onClick={handleCancelEdit}
                    className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm font-medium text-gray-700 dark:text-gray-200 bg-white dark:bg-gray-700 hover:bg-gray-50 dark:hover:bg-gray-600"
                    disabled={saving}
                  >
                    Cancel
                  </button>
                  
                  <button
                    onClick={handleEditSubmit}
                    className="px-4 py-2 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    disabled={saving}
                  >
                    {saving ? 'Saving...' : 'Save Changes'}
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between">
                  <h1 className="text-2xl font-semibold text-gray-900 dark:text-white">
                    {task.Title}
                  </h1>
                  
                  <div className="flex items-center space-x-2">
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityClasses(task.Priority)}`}>
                      {task.Priority} Priority
                    </span>
                    
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getStatusClasses(task.Status)}`}>
                      {task.Status}
                    </span>
                  </div>
                </div>
                
                {task.Description && (
                  <div className="mt-4 text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
                    {task.Description}
                  </div>
                )}
              </>
            )}
          </div>
          
          {/* Task Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 p-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Project Info */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                  <Tag className="h-4 w-4 mr-1" />
                  Project
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  <p className="text-gray-900 dark:text-white font-medium">
                    {project?.Name || 'Unknown Project'}
                  </p>
                  <button
                    onClick={() => router.push(`/projects/${task.ProjectId}`)}
                    className="text-sm text-primary dark:text-primary-dark hover:underline mt-1"
                  >
                    View Project
                  </button>
                </div>
              </div>
              
              {/* Deadline */}
              {task.Deadline && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-900 dark:text-white font-medium">
                      {formatDate(task.Deadline)}
                    </p>
                    {deadlineStatus && (
                      <p className={`text-sm mt-1 ${deadlineStatus.classes}`}>
                        {deadlineStatus.label}
                      </p>
                    )}
                  </div>
                </div>
              )}
              
              {/* Assigned To */}
              <div>
                <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                  <User className="h-4 w-4 mr-1" />
                  Assigned To
                </h3>
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                  {task.UserId ? (
                    <p className="text-gray-900 dark:text-white">
                      {task.UserId === user?.Id ? 'You' : 'Another User'}
                    </p>
                  ) : task.TeamId ? (
                    <div className="flex items-center text-gray-900 dark:text-white">
                      <Users className="h-4 w-4 mr-1" />
                      <span>Team Assignment</span>
                    </div>
                  ) : (
                    <p className="text-gray-500 dark:text-gray-400">
                      Not assigned to a specific user
                    </p>
                  )}
                </div>
              </div>
              
              {/* Cost (if exists) */}
              {task.Cost !== undefined && task.Cost > 0 && (
                <div>
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2 flex items-center">
                    <Flag className="h-4 w-4 mr-1" />
                    Budget
                  </h3>
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3">
                    <p className="text-gray-900 dark:text-white font-medium">
                      ${task.Cost.toFixed(2)}
                    </p>
                  </div>
                </div>
              )}
            </div>
            
            {/* Right Column */}
            <div className="space-y-6">
              {/* Attachments */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 flex items-center">
                    <Paperclip className="h-4 w-4 mr-1" />
                    Attachments
                  </h3>
                  
                  {canEdit && (
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-xs text-primary hover:text-primary/80 flex items-center disabled:opacity-50"
                      disabled={uploading}
                    >
                      <Plus className="h-3 w-3 mr-1" />
                      {uploading ? 'Uploading...' : 'Add File'}
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={handleFileUpload}
                        disabled={uploading}
                      />
                    </button>
                  )}
                </div>
                
                <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-3 min-h-[100px]">
                  {attachments.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-sm">
                      No attachments yet
                    </p>
                  ) : (
                    <ul className="space-y-2">
                      {attachments.map(attachment => (
                        <li 
                          key={attachment.Id}
                          className="flex items-center justify-between bg-white dark:bg-gray-800 p-2 rounded border border-gray-200 dark:border-gray-600"
                        >
                          <div className="flex items-center overflow-hidden">
                            <Paperclip className="h-4 w-4 text-gray-400 dark:text-gray-500 mr-2 flex-shrink-0" />
                            <span className="text-sm text-gray-900 dark:text-white truncate">
                              {attachment.FileName}
                            </span>
                          </div>
                          
                          <div className="flex items-center">
                            <a 
                              href={attachment.Url || `${process.env.NEXT_PUBLIC_API_URL}/tasks/${task.Id}/attachments/${attachment.Id}`}
                              download
                              className="text-primary hover:text-primary/80 p-1"
                              target="_blank"
                              rel="noopener noreferrer"
                            >
                              <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                              </svg>