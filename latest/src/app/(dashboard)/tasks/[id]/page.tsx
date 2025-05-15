'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format, parseISO, isPast, isToday } from 'date-fns';
import { motion, AnimatePresence } from 'framer-motion';
import { v4 as uuidv4 } from 'uuid';

// UI components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { Dialog } from '@/components/ui/dialog';
import { DatePicker } from '@/components/ui/DatePicker';
import { CardSection } from '@/components/ui/CardSection';
import { Spinner } from '@/components/ui/spinner';
import { SubtaskCard } from '../SubtaskCard';

// Icons
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  User,
  Users,
  FileText,
  Paperclip,
  Upload,
  X,
  Loader2,
  MoreHorizontal,
  Download,
  ExternalLink,
  ListTodo,
  Plus
} from 'lucide-react';

// API and utilities
import { 
  getTaskById, 
  updateTask, 
  deleteTask, 
  markTaskComplete,
  getTaskAttachments,
  uploadTaskAttachment,
  deleteTaskAttachment 
} from '@/api/TaskAPI';
import { getProjectById } from '@/api/ProjectAPI';
import { cn } from '@/lib/utils';
import { toast } from '@/lib/toast';
import { useTaskStorage } from '../useLocalStorage';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1
    }
  }
};

const modalVariants = {
  hidden: { opacity: 0, scale: 0.9 },
  visible: { 
    opacity: 1, 
    scale: 1,
    transition: { 
      type: "spring",
      stiffness: 500, 
      damping: 30 
    } 
  },
  exit: { 
    opacity: 0, 
    scale: 0.9,
    transition: { duration: 0.2 } 
  }
};

// Helper function to create simulated file object
const createFileObject = (file) => {
  const fileExtension = file.name.split('.').pop().toLowerCase();
  const fileType = getFileType(fileExtension);
  
  return {
    Id: uuidv4(),
    FileName: file.name,
    FileSize: file.size,
    FileType: fileType,
    Url: URL.createObjectURL(file),
    UploadedAt: new Date().toISOString()
  };
};

// Helper to get file type
const getFileType = (extension) => {
  const imageTypes = ['jpg', 'jpeg', 'png', 'gif', 'svg'];
  const documentTypes = ['pdf', 'doc', 'docx', 'txt', 'xls', 'xlsx', 'ppt', 'pptx'];
  
  if (imageTypes.includes(extension)) return 'image';
  if (documentTypes.includes(extension)) return 'document';
  return 'other';
};

export default function TaskDetailPage() {
  const { id } = useParams();
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const taskStorage = useTaskStorage();
  
  // States
  const [task, setTask] = useState<any>(null);
  const [project, setProject] = useState<any>(null);
  const [attachments, setAttachments] = useState<any[]>([]);
  const [localAttachments, setLocalAttachments] = useState<any[]>([]);
  const [subtasks, setSubtasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [uploading, setUploading] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [completing, setCompleting] = useState(false);
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false);
  const [editForm, setEditForm] = useState<any>({
    Title: '',
    Description: '',
    Priority: '',
    Status: '',
    Deadline: '',
    UserId: '',
    TeamId: '',
    Cost: 0
  });
  const [saving, setSaving] = useState(false);
  
  // Subtask states
  const [createSubtaskOpen, setCreateSubtaskOpen] = useState(false);
  const [newSubtaskForm, setNewSubtaskForm] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    dueDate: ''
  });
  
  // Permissions
  const [permissions, setPermissions] = useState({
    isProjectOwner: false,
    isTeamLeader: false,
    isAssignedUser: false,
    canEdit: false,
    canDelete: false,
    canComplete: false,
    canUpload: false
  });

  // Get user ID from JWT token
  useEffect(() => {
    try {
      const token = localStorage.getItem('authToken');
      if (token) {
        const payload = token.split('.')[1];
        const decoded = JSON.parse(atob(payload));
        setUserId(decoded.sub || decoded.id || decoded.userId);
      } else {
        // No token, redirect to login
        toast.error('Authentication required');
        router.push('/login');
      }
    } catch (error) {
      console.error('Error decoding token:', error);
      toast.error('Authentication error');
      router.push('/login');
    }
  }, [router]);
  
  // Fetch task data
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userId) return;
      
      setLoading(true);
      try {
        // Fetch task details
        const taskData = await getTaskById(id as string);
        setTask(taskData);
        
        // Save task to localStorage
        taskStorage.saveTaskData(id as string, taskData);
        
        // Initialize edit form
        setEditForm({
          Title: taskData.Title || '',
          Description: taskData.Description || '',
          Priority: taskData.Priority || 'MEDIUM',
          Status: taskData.Status || 'Not Started',
          Deadline: taskData.Deadline ? taskData.Deadline.split('T')[0] : '',
          UserId: taskData.UserId || '',
          TeamId: taskData.TeamId || '',
          Cost: taskData.Cost || 0
        });
        
        // Fetch associated project
        if (taskData.ProjectId) {
          const projectData = await getProjectById(taskData.ProjectId);
          setProject(projectData);
          
          // Determine user permissions
          const isOwner = projectData.OwnerId === userId;
          
          // Check if user is team leader
          let isLeader = false;
          if (taskData.TeamId && projectData.teams) {
            const team = projectData.teams.find((t: any) => t.Id === taskData.TeamId);
            isLeader = team?.LeaderId === userId;
          }
          
          // Check if user is assigned to this task
          const isAssigned = taskData.UserId === userId;
          
          // Set permissions
          setPermissions({
            isProjectOwner: isOwner,
            isTeamLeader: isLeader,
            isAssignedUser: isAssigned,
            canEdit: isOwner || isLeader,
            canDelete: isOwner || isLeader,
            canComplete: isOwner || isLeader || isAssigned,
            canUpload: isOwner || isLeader || isAssigned
          });
          
          // Fetch attachments
          try {
            const attachmentsData = await getTaskAttachments(id as string, taskData.ProjectId);
            setAttachments(attachmentsData || []);
          } catch (attachmentError) {
            console.error('Error fetching attachments:', attachmentError);
            // Don't fail the whole page load if attachments fail
          }
        }
        
        // Load local attachments and subtasks from localStorage
        const storedAttachments = taskStorage.getAttachments(id as string) || [];
        setLocalAttachments(storedAttachments);
        
        const storedSubtasks = taskStorage.getSubtasks(id as string) || [];
        setSubtasks(storedSubtasks);
        
        setError(null);
      } catch (err: any) {
        console.error('Error fetching task data:', err);
        setError(err?.message || 'Failed to load task details');
        toast.error('Could not load task details');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, userId, router, taskStorage]);
  
  // Handle attachment upload
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !task?.Id) {
      toast.error('Missing task information for file upload');
      return;
    }
    
    setUploading(true);
    try {
      // Create a file object with properties similar to what the API would return
      const newAttachment = createFileObject(file);
      
      // Update localStorage
      const updatedAttachments = [...localAttachments, newAttachment];
      taskStorage.saveAttachments(task.Id, updatedAttachments);
      
      // Update state
      setLocalAttachments(updatedAttachments);
      
      toast.success('File uploaded successfully');
    } catch (error) {
      console.error('Failed to upload file:', error);
      toast.error('Could not upload file');
    } finally {
      setUploading(false);
      
      // Clear the file input
      if (fileInputRef.current) {
        fileInputRef.current.value = '';
      }
    }
  };
  
  // Handle attachment deletion
  const handleDeleteAttachment = async (attachmentId: string) => {
    if (!task?.Id) return;
    
    try {
      // Check if it's a local attachment
      const isLocalAttachment = localAttachments.some(att => att.Id === attachmentId);
      
      if (isLocalAttachment) {
        // Update local attachments
        const updatedAttachments = localAttachments.filter(att => att.Id !== attachmentId);
        taskStorage.saveAttachments(task.Id, updatedAttachments);
        setLocalAttachments(updatedAttachments);
      } else {
        // Call API for server attachments
        await deleteTaskAttachment(task.Id, attachmentId);
        setAttachments(prev => prev.filter(att => att.Id !== attachmentId));
      }
      
      toast.success('File deleted');
    } catch (error) {
      console.error('Failed to delete file:', error);
      toast.error('Could not delete file');
    }
  };
  
  // Handle edit form submission
  const handleSaveEdit = async () => {
    if (!task?.Id) return;
    
    setSaving(true);
    try {
      // Prepare update data
      const updateData: any = { ...editForm };
      
      // Convert deadline to ISO format if present
      if (updateData.Deadline) {
        updateData.Deadline = new Date(updateData.Deadline).toISOString();
      }
      
      // Remove empty values to avoid overwriting with nulls
      Object.keys(updateData).forEach(key => {
        if (updateData[key] === '') {
          delete updateData[key];
        }
      });
      
      // Update task
      // In a real app, we'd call the API, but for now we'll just update localStorage
      // const updatedTask = await updateTask(task.Id, updateData);
      
      const updatedTask = {
        ...task,
        ...updateData,
        LastUpdated: new Date().toISOString()
      };
      
      // Save to localStorage
      taskStorage.saveTaskData(task.Id, updatedTask);
      
      // Update local state
      setTask(updatedTask);
      setIsEditing(false);
      
      toast.success('Task updated successfully');
    } catch (error) {
      console.error('Failed to update task:', error);
      toast.error('Could not update task');
    } finally {
      setSaving(false);
    }
  };
  
  // Handle mark task as complete
  const handleCompleteTask = async () => {
    if (!task?.Id) return;
    
    setCompleting(true);
    try {
      // In a real app, we'd call the API
      // await markTaskComplete(task.Id);
      
      const updatedTask = {
        ...task,
        Status: 'Completed',
        Completed: true,
        CompletedAt: new Date().toISOString()
      };
      
      // Save to localStorage
      taskStorage.saveTaskData(task.Id, updatedTask);
      
      // Update local state
      setTask(updatedTask);
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not complete task');
    } finally {
      setCompleting(false);
    }
  };
  
  // Handle delete task
  const handleDeleteTask = async () => {
    if (!task?.Id) return;
    
    setDeleting(true);
    try {
      // In a real app, we'd call the API
      // await deleteTask(task.Id);
      
      // Clear task from localStorage
      localStorage.removeItem(`task_${task.Id}`);
      localStorage.removeItem(`attachments_${task.Id}`);
      localStorage.removeItem(`subtasks_${task.Id}`);
      
      toast.success('Task deleted successfully');
      
      // Redirect back to project tasks page
      if (task.ProjectId) {
        router.push(`/projects/${task.ProjectId}/tasks`);
      } else {
        router.push('/tasks');
      }
    } catch (error) {
      console.error('Failed to delete task:', error);
      toast.error('Could not delete task');
      setDeleting(false);
      setDeleteConfirmOpen(false);
    }
  };
  
  // Handle create subtask
  const handleCreateSubtask = () => {
    if (!task?.Id || !newSubtaskForm.title.trim()) {
      toast.error('Subtask title is required');
      return;
    }
    
    try {
      // Create new subtask
      const newSubtask = {
        id: uuidv4(),
        title: newSubtaskForm.title,
        description: newSubtaskForm.description,
        status: newSubtaskForm.status,
        dueDate: newSubtaskForm.dueDate ? new Date(newSubtaskForm.dueDate).toISOString() : undefined,
        completed: false,
        createdAt: new Date().toISOString(),
        parentTaskId: task.Id
      };
      
      // Update subtasks in localStorage
      const updatedSubtasks = [...subtasks, newSubtask];
      taskStorage.saveSubtasks(task.Id, updatedSubtasks);
      
      // Update state
      setSubtasks(updatedSubtasks);
      
      // Reset form and close dialog
      setNewSubtaskForm({
        title: '',
        description: '',
        status: 'Not Started',
        dueDate: ''
      });
      setCreateSubtaskOpen(false);
      
      toast.success('Subtask created successfully');
    } catch (error) {
      console.error('Failed to create subtask:', error);
      toast.error('Could not create subtask');
    }
  };
  
  // Handle complete subtask
  const handleCompleteSubtask = (subtaskId: string) => {
    if (!task?.Id) return;
    
    try {
      // Update subtasks
      const updatedSubtasks = subtasks.map(s => {
        if (s.id === subtaskId) {
          return {
            ...s,
            status: 'Completed',
            completed: true,
            completedAt: new Date().toISOString()
          };
        }
        return s;
      });
      
      // Save to localStorage
      taskStorage.saveSubtasks(task.Id, updatedSubtasks);
      
      // Update state
      setSubtasks(updatedSubtasks);
      
      toast.success('Subtask completed');
    } catch (error) {
      console.error('Failed to complete subtask:', error);
      toast.error('Could not complete subtask');
    }
  };

  // Helper for deadline status
  const getDeadlineStatus = () => {
    if (!task?.Deadline) return null;
    
    try {
      const deadline = parseISO(task.Deadline);
      
      if (task.Completed) {
        return { label: 'Completed on time', variant: 'success' };
      }
      
      if (isPast(deadline) && !isToday(deadline)) {
        return { label: 'Overdue', variant: 'danger' };
      }
      
      if (isToday(deadline)) {
        return { label: 'Due today', variant: 'warning' };
      }
      
      return null;
    } catch (e) {
      console.error('Invalid date format:', e);
      return null;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading Task</h3>
          <p className="text-muted-foreground">
            Preparing task details...
          </p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !task) {
    return (
      <EmptyState
        icon={<AlertCircle className="h-8 w-8" />}
        title="Error Loading Task"
        description={error || 'Task not found'}
        action={
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => router.back()}>
              Go Back
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        }
        className="max-w-md mx-auto my-12"
      />
    );
  }
  
  // Deadline status
  const deadlineStatus = getDeadlineStatus();
  
  // Combine API attachments and local attachments
  const allAttachments = [...attachments, ...localAttachments];

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-4 md:p-6 max-w-7xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        variants={slideUp}
        className="mb-8 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.back()}
            className="h-10 w-10 rounded-full"
            aria-label="Back"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div>
            <motion.h1 
              variants={slideUp}
              className="text-2xl font-bold"
            >
              Task Details
            </motion.h1>
            <motion.p 
              variants={slideUp}
              className="text-muted-foreground mt-1"
            >
              {project?.Name && `Project: ${project.Name}`}
            </motion.p>
          </div>
        </div>
        
        <motion.div 
          variants={slideUp}
          className="flex flex-wrap items-center gap-3"
        >
          {!task.Completed && permissions.canComplete && (
            <Button
              onClick={handleCompleteTask}
              disabled={completing}
              variant="default"
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              {completing ? (
                <Loader2 className="h-4 w-4 animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="h-4 w-4 mr-2" />
              )}
              Complete Task
            </Button>
          )}
          
          <Button 
            onClick={() => setCreateSubtaskOpen(true)}
            variant="outline"
          >
            <ListTodo className="h-4 w-4 mr-2" />
            Add Subtask
          </Button>
          
          {permissions.canEdit && !isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          {permissions.canDelete && (
            <Button
              onClick={() => setDeleteConfirmOpen(true)}
              variant="outline"
              className="text-destructive hover:bg-destructive/10"
            >
              <Trash2 className="h-4 w-4 mr-2" />
              Delete
            </Button>
          )}
        </motion.div>
      </motion.div>
      
      {/* Task Content */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content (2/3 width on desktop) */}
        <div className="md:col-span-2 space-y-6">
          {/* Task Details Card */}
          <motion.div
            variants={slideUp}
          >
            <Card>
              {isEditing ? (
                /* Edit Form */
                <motion.div 
                  key="edit-form"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CardHeader>
                    <CardTitle>Edit Task</CardTitle>
                  </CardHeader>
                  
                  <CardContent className="space-y-5">
                    {/* Title */}
                    <div className="space-y-2">
                      <label htmlFor="edit-title" className="block text-sm font-medium">
                        Title <span className="text-destructive">*</span>
                      </label>
                      <Input 
                        id="edit-title"
                        type="text"
                        value={editForm.Title}
                        onChange={(e) => setEditForm({ ...editForm, Title: e.target.value })}
                        required
                      />
                    </div>
                    
                    {/* Description */}
                    <div className="space-y-2">
                      <label htmlFor="edit-description" className="block text-sm font-medium">
                        Description
                      </label>
                      <Textarea 
                        id="edit-description"
                        value={editForm.Description || ''}
                        onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })}
                        rows={4}
                      />
                    </div>
                    
                    {/* Priority and Status */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="edit-priority" className="block text-sm font-medium">
                          Priority
                        </label>
                        <select
                          id="edit-priority"
                          value={editForm.Priority}
                          onChange={(e) => setEditForm({ ...editForm, Priority: e.target.value })}
                          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="LOW">Low</option>
                          <option value="MEDIUM">Medium</option>
                          <option value="HIGH">High</option>
                        </select>
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="edit-status" className="block text-sm font-medium">
                          Status
                        </label>
                        <select
                          id="edit-status"
                          value={editForm.Status}
                          onChange={(e) => setEditForm({ ...editForm, Status: e.target.value })}
                          className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                        >
                          <option value="Not Started">Not Started</option>
                          <option value="In Progress">In Progress</option>
                          <option value="Completed">Completed</option>
                        </select>
                      </div>
                    </div>
                    
                    {/* Deadline and Cost */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                      <div className="space-y-2">
                        <label htmlFor="edit-deadline" className="block text-sm font-medium">
                          Deadline
                        </label>
                        <Input
                          id="edit-deadline"
                          type="date"
                          value={editForm.Deadline || ''}
                          onChange={(e) => setEditForm({ ...editForm, Deadline: e.target.value })}
                        />
                      </div>
                      
                      <div className="space-y-2">
                        <label htmlFor="edit-cost" className="block text-sm font-medium">
                          Cost
                        </label>
                        <Input
                          id="edit-cost"
                          type="number"
                          value={editForm.Cost || 0}
                          onChange={(e) => setEditForm({ ...editForm, Cost: parseFloat(e.target.value) })}
                        />
                      </div>
                    </div>
                    
                    {/* Assignment options */}
                    <div className="space-y-4">
                      <h3 className="text-sm font-medium">Assignment</h3>
                      
                      <div className="space-y-3">
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="assign-none"
                            name="assignment"
                            className="h-4 w-4 mr-2"
                            checked={!editForm.UserId && !editForm.TeamId}
                            onChange={() => setEditForm({ ...editForm, UserId: '', TeamId: '' })}
                          />
                          <label htmlFor="assign-none">Not Assigned</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="assign-user"
                            name="assignment"
                            className="h-4 w-4 mr-2"
                            checked={!!editForm.UserId}
                            onChange={() => setEditForm({ ...editForm, UserId: userId, TeamId: '' })}
                          />
                          <label htmlFor="assign-user">Assign to Me</label>
                        </div>
                        
                        <div className="flex items-center">
                          <input
                            type="radio"
                            id="assign-team"
                            name="assignment"
                            className="h-4 w-4 mr-2"
                            checked={!!editForm.TeamId}
                            onChange={() => setEditForm({ ...editForm, TeamId: 'team-123', UserId: '' })}
                          />
                          <label htmlFor="assign-team">Assign to Team</label>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                  
                  <CardFooter className="border-t flex justify-end gap-3 pt-5">
                    <Button
                      variant="outline"
                      onClick={() => setIsEditing(false)}
                      disabled={saving}
                    >
                      Cancel
                    </Button>
                    
                    <Button
                      onClick={handleSaveEdit}
                      disabled={saving || !editForm.Title}
                      isLoading={saving}
                    >
                      Save Changes
                    </Button>
                  </CardFooter>
                </motion.div>
              ) : (
                /* Task Details View */
                <motion.div 
                  key="view-details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  <CardHeader className={cn(
                    "border-t-4",
                    task.Priority === 'HIGH' && "border-destructive",
                    task.Priority === 'MEDIUM' && "border-warning",
                    task.Priority === 'LOW' && "border-primary"
                  )}>
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <CardTitle className={cn(
                        "text-xl",
                        task.Completed && "line-through opacity-70"
                      )}>
                        {task.Title}
                      </CardTitle>
                      
                      <div className="flex flex-wrap gap-2">
                        <Badge variant={task.Priority === 'HIGH' ? 'danger' : task.Priority === 'MEDIUM' ? 'warning' : 'info'}>
                          {task.Priority} Priority
                        </Badge>
                        
                        <Badge variant={task.Completed ? 'success' : task.Status === 'In Progress' ? 'info' : 'default'}>
                          {task.Status || (task.Completed ? 'Completed' : 'Not Started')}
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-6">
                    <CardSection title="Description">
                      {task.Description ? (
                        <p className="whitespace-pre-wrap">{task.Description}</p>
                      ) : (
                        <p className="text-muted-foreground italic">No description provided</p>
                      )}
                    </CardSection>
                    
                    <div className="border-t pt-4">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        {/* Deadline */}
                        {task.Deadline && (
                          <CardSection title="Deadline" tight>
                            <div className="flex items-center gap-2">
                              <Calendar className="h-4 w-4 text-muted-foreground" />
                              <p className="font-medium">
                                {format(parseISO(task.Deadline), 'MMMM d, yyyy')}
                              </p>
                            </div>
                            {deadlineStatus && (
                              <Badge variant={deadlineStatus.variant as any}>
                                {deadlineStatus.label}
                              </Badge>
                            )}
                          </CardSection>
                        )}
                        
                        {/* Assignment */}
                        <CardSection title="Assigned To" tight>
                          <div className="flex items-center gap-2">
                            {task.TeamId ? (
                              <Users className="h-4 w-4 text-muted-foreground" />
                            ) : (
                              <User className="h-4 w-4 text-muted-foreground" />
                            )}
                            <p className="font-medium">
                              {task.TeamId 
                                ? 'Team'
                                : task.UserId
                                ? (task.UserId === userId ? 'You' : 'User')
                                : 'Not assigned'}
                            </p>
                          </div>
                        </CardSection>
                        
                        {/* Creation Info */}
                        <CardSection title="Created" tight>
                          <div className="flex items-center gap-2">
                            <Clock className="h-4 w-4 text-muted-foreground" />
                            <p className="font-medium">
                              {format(parseISO(task.CreatedAt), 'MMMM d, yyyy')}
                            </p>
                          </div>
                          <p className="text-sm text-muted-foreground">
                            By {task.CreatedBy === userId ? 'you' : 'another user'}
                          </p>
                        </CardSection>
                        
                        {/* Cost if available */}
                        {task.Cost > 0 && (
                          <CardSection title="Cost" tight>
                            <p className="font-medium">${task.Cost.toFixed(2)}</p>
                          </CardSection>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </motion.div>
              )}
            </Card>
          </motion.div>
          
          {/* Subtasks Section */}
          <motion.div
            variants={slideUp}
            transition={{ delay: 0.1 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center">
                  <ListTodo className="h-5 w-5 mr-2 text-muted-foreground" />
                  Subtasks
                </CardTitle>
                
                <Button
                  onClick={() => setCreateSubtaskOpen(true)}
                  size="sm"
                  className="flex items-center gap-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add Subtask</span>
                </Button>
              </CardHeader>
              
              <CardContent>
                {subtasks.length === 0 ? (
                  <div className="text-center py-12 text-muted-foreground">
                    <ListTodo className="h-16 w-16 mx-auto mb-3 opacity-20" />
                    <p>No subtasks yet</p>
                    <Button
                      onClick={() => setCreateSubtaskOpen(true)}
                      variant="ghost"
                      className="mt-4"
                      size="sm"
                    >
                      <Plus className="h-3.5 w-3.5 mr-2" />
                      <span>Create your first subtask</span>
                    </Button>
                  </div>
                ) : (
                  <motion.div 
                    variants={staggerContainer}
                    initial="hidden"
                    animate="visible"
                    className="space-y-4"
                  >
                    {subtasks.map((subtask) => (
                      <motion.div
                        key={subtask.id}
                        variants={slideUp}
                      >
                        <SubtaskCard
                          subtask={subtask}
                          onComplete={() => handleCompleteSubtask(subtask.id)}
                          onClick={() => router.push(`/tasks/${task.Id}/subtasks/${subtask.id}`)}
                          parentTaskId={task.Id}
                        />
                      </motion.div>
                    ))}
                  </motion.div>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Attachments Card */}
          <motion.div
            variants={slideUp}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-xl flex items-center">
                  <Paperclip className="h-5 w-5 mr-2 text-muted-foreground" />
                  Attachments
                </CardTitle>
                
                <Button
                  onClick={() => fileInputRef.current?.click()}
                  disabled={uploading}
                  className="flex items-center gap-2"
                  size="sm"
                  isLoading={uploading}
                >
                  <Upload className="h-4 w-4" />
                  <span>{uploading ? 'Uploading...' : 'Upload'}</span>
                </Button>
                
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  className="hidden"
                  disabled={uploading}
                />
              </CardHeader>
              
              <CardContent>
                <AnimatePresence>
                  {allAttachments.length === 0 ? (
                    <motion.div
                      key="no-attachments"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-center py-12 text-muted-foreground"
                    >
                      <FileText className="h-16 w-16 mx-auto mb-3 opacity-20" />
                      <p>No attachments yet</p>
                      <Button
                        onClick={() => fileInputRef.current?.click()}
                        variant="ghost"
                        className="mt-4"
                        size="sm"
                      >
                        <Upload className="h-3.5 w-3.5 mr-2" />
                        <span>Add a file</span>
                      </Button>
                    </motion.div>
                  ) : (
                    <motion.ul 
                      variants={staggerContainer}
                      initial="hidden"
                      animate="visible"
                      className="divide-y"
                    >
                      {allAttachments.map((attachment) => (
                        <motion.li 
                          key={attachment.Id} 
                          variants={slideUp}
                          className="py-4 first:pt-0 last:pb-0"
                        >
                          <motion.div 
                            whileHover={{ scale: 1.01 }}
                            className="flex items-center justify-between group"
                          >
                            <div className="flex items-center space-x-3">
                              <div className="p-2 bg-muted rounded-lg">
                                <FileText className="h-6 w-6 text-muted-foreground" />
                              </div>
                              <div>
                                <p className="font-medium">{attachment.FileName}</p>
                                {attachment.FileSize && (
                                  <p className="text-xs text-muted-foreground">
                                    {(attachment.FileSize / 1024).toFixed(2)} KB
                                  </p>
                                )}
                              </div>
                            </div>
                            
                            <div className="flex items-center space-x-2">
                              <Button
                                onClick={() => window.open(attachment.Url, '_blank')}
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <Download className="h-4 w-4" />
                              </Button>
                              
                              <Button
                                onClick={() => handleDeleteAttachment(attachment.Id)}
                                variant="ghost"
                                size="sm"
                                className="opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive hover:bg-destructive/10"
                              >
                                <Trash2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </motion.div>
                        </motion.li>
                      ))}
                    </motion.ul>
                  )}
                </AnimatePresence>
              </CardContent>
            </Card>
          </motion.div>
        </div>
        
        {/* Sidebar (1/3 width on desktop) */}
        <div className="space-y-6">
          {/* Project Info Card */}
          <motion.div
            variants={slideUp}
            transition={{ delay: 0.2 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Project Info</CardTitle>
              </CardHeader>
              
              <CardContent>
                {project ? (
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-sm font-medium text-muted-foreground mb-1">Project</h3>
                      <p className="font-medium">{project.Name}</p>
                    </div>
                    
                    <Button
                      onClick={() => router.push(`/projects/${project.Id}`)}
                      variant="outline"
                      className="flex items-center gap-2 w-full justify-center"
                    >
                      <ExternalLink className="h-4 w-4" />
                      <span>View Project</span>
                    </Button>
                  </div>
                ) : (
                  <p className="text-muted-foreground">Project information not available</p>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Task Status Card */}
          <motion.div
            variants={slideUp}
            transition={{ delay: 0.3 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Task Status</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Current Status</h3>
                  <Badge
                    variant={task.Completed ? 'success' : task.Status === 'In Progress' ? 'info' : 'default'}
                    className="px-4 py-2 text-sm"
                  >
                    {task.Status || (task.Completed ? 'Completed' : 'Not Started')}
                  </Badge>
                </div>
                
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground mb-2">Priority</h3>
                  <Badge
                    variant={task.Priority === 'HIGH' ? 'danger' : task.Priority === 'MEDIUM' ? 'warning' : 'info'}
                    className="px-4 py-2 text-sm"
                  >
                    {task.Priority} Priority
                  </Badge>
                </div>
                
                {!task.Completed && (
                  <Button
                    onClick={handleCompleteTask}
                    disabled={completing}
                    className="w-full bg-success text-success-foreground hover:bg-success/90 mt-4"
                    isLoading={completing}
                  >
                    Mark Complete
                  </Button>
                )}
              </CardContent>
            </Card>
          </motion.div>
          
          {/* Subtask Progress */}
          <motion.div
            variants={slideUp}
            transition={{ delay: 0.4 }}
          >
            <Card>
              <CardHeader>
                <CardTitle>Subtask Progress</CardTitle>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {subtasks.length === 0 ? (
                  <p className="text-muted-foreground">No subtasks created yet</p>
                ) : (
                  <>
                    <div className="flex justify-between mb-2 text-sm">
                      <span>Completed:</span>
                      <span className="font-medium">
                        {subtasks.filter(s => s.completed).length} / {subtasks.length}
                      </span>
                    </div>
                    
                    <div className="h-2 bg-muted rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-success"
                        style={{ 
                          width: `${(subtasks.filter(s => s.completed).length / subtasks.length) * 100}%` 
                        }}
                      ></div>
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4 mt-4">
                      <div className="bg-background border rounded-md p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">Not Started</p>
                        <p className="font-medium">
                          {subtasks.filter(s => s.status === 'Not Started').length}
                        </p>
                      </div>
                      <div className="bg-background border rounded-md p-3 text-center">
                        <p className="text-xs text-muted-foreground mb-1">In Progress</p>
                        <p className="font-medium">
                          {subtasks.filter(s => s.status === 'In Progress').length}
                        </p>
                      </div>
                    </div>
                  </>
                )}
              </CardContent>
            </Card>
          </motion.div>
        </div>
      </div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Task"
        description="Are you sure you want to delete this task? This action cannot be undone."
        size="sm"
      >
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmOpen(false)}
            disabled={deleting}
          >
            Cancel
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDeleteTask}
            disabled={deleting}
            isLoading={deleting}
          >
            Delete Task
          </Button>
        </div>
      </Dialog>
      
      {/* Create Subtask Dialog */}
      <Dialog
        open={createSubtaskOpen}
        onOpenChange={setCreateSubtaskOpen}
        title="Create Subtask"
        description="Add a new subtask to track smaller units of work"
        size="md"
      >
        <div className="space-y-4 py-2">
          <div className="space-y-2">
            <label htmlFor="subtask-title" className="block text-sm font-medium">
              Title <span className="text-destructive">*</span>
            </label>
            <Input 
              id="subtask-title"
              type="text"
              value={newSubtaskForm.title}
              onChange={(e) => setNewSubtaskForm({ ...newSubtaskForm, title: e.target.value })}
              placeholder="Enter subtask title"
              required
            />
          </div>
          
          <div className="space-y-2">
            <label htmlFor="subtask-description" className="block text-sm font-medium">
              Description
            </label>
            <Textarea 
              id="subtask-description"
              value={newSubtaskForm.description}
              onChange={(e) => setNewSubtaskForm({ ...newSubtaskForm, description: e.target.value })}
              placeholder="Describe the subtask"
              rows={3}
            />
          </div>
          
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <label htmlFor="subtask-status" className="block text-sm font-medium">
                Status
              </label>
              <select
                id="subtask-status"
                value={newSubtaskForm.status}
                onChange={(e) => setNewSubtaskForm({ ...newSubtaskForm, status: e.target.value })}
                className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
              </select>
            </div>
            
            <div className="space-y-2">
              <label htmlFor="subtask-due-date" className="block text-sm font-medium">
                Due Date
              </label>
              <Input
                id="subtask-due-date"
                type="date"
                value={newSubtaskForm.dueDate}
                onChange={(e) => setNewSubtaskForm({ ...newSubtaskForm, dueDate: e.target.value })}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
          <Button
            variant="outline"
            onClick={() => setCreateSubtaskOpen(false)}
          >
            Cancel
          </Button>
          
          <Button
            onClick={handleCreateSubtask}
            disabled={!newSubtaskForm.title.trim()}
          >
            Create Subtask
          </Button>
        </div>
      </Dialog>
    </motion.div>
  );
}