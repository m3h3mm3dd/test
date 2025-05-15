'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { format } from 'date-fns';
import { motion } from 'framer-motion';

// UI components
import { Card, CardHeader, CardTitle, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Dialog } from '@/components/ui/dialog';
import { Spinner } from '@/components/ui/spinner';

// Icons
import {
  ArrowLeft,
  Calendar,
  Clock,
  Edit,
  Trash2,
  CheckCircle2,
  AlertCircle,
  FileText
} from 'lucide-react';

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

export default function SubtaskDetailPage() {
  const { taskId, subtaskId } = useParams();
  const router = useRouter();
  const taskStorage = useTaskStorage();
  
  // States
  const [subtask, setSubtask] = useState<any>(null);
  const [parentTask, setParentTask] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isEditing, setIsEditing] = useState(false);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);
  
  // Edit form state
  const [editForm, setEditForm] = useState({
    title: '',
    description: '',
    status: 'Not Started',
    dueDate: ''
  });
  
  // Load subtask data from localStorage
  useEffect(() => {
    if (!taskId || !subtaskId) {
      setError('Invalid task or subtask ID');
      setLoading(false);
      return;
    }
    
    try {
      // Get parent task data
      const taskData = taskStorage.getTaskData(taskId as string) || {};
      setParentTask(taskData);
      
      // Get subtasks
      const subtasks = taskStorage.getSubtasks(taskId as string) || [];
      const currentSubtask = subtasks.find((s: any) => s.id === subtaskId);
      
      if (!currentSubtask) {
        setError('Subtask not found');
        setLoading(false);
        return;
      }
      
      setSubtask(currentSubtask);
      setEditForm({
        title: currentSubtask.title || '',
        description: currentSubtask.description || '',
        status: currentSubtask.status || 'Not Started',
        dueDate: currentSubtask.dueDate ? currentSubtask.dueDate.split('T')[0] : ''
      });
      
      setLoading(false);
    } catch (err) {
      console.error('Error loading subtask data:', err);
      setError('Failed to load subtask details');
      setLoading(false);
    }
  }, [taskId, subtaskId, taskStorage]);
  
  // Handle edit save
  const handleSaveEdit = () => {
    if (!taskId || !subtaskId) return;
    
    try {
      // Validate
      if (!editForm.title.trim()) {
        toast.error('Title is required');
        return;
      }
      
      // Get current subtasks
      const subtasks = taskStorage.getSubtasks(taskId as string) || [];
      
      // Update the specific subtask
      const updatedSubtasks = subtasks.map((s: any) => {
        if (s.id === subtaskId) {
          return {
            ...s,
            title: editForm.title,
            description: editForm.description,
            status: editForm.status,
            dueDate: editForm.dueDate ? new Date(editForm.dueDate).toISOString() : undefined,
            updatedAt: new Date().toISOString()
          };
        }
        return s;
      });
      
      // Save to localStorage
      taskStorage.saveSubtasks(taskId as string, updatedSubtasks);
      
      // Update state
      const updatedSubtask = updatedSubtasks.find((s: any) => s.id === subtaskId);
      setSubtask(updatedSubtask);
      setIsEditing(false);
      
      toast.success('Subtask updated successfully');
    } catch (err) {
      console.error('Error updating subtask:', err);
      toast.error('Failed to update subtask');
    }
  };
  
  // Handle complete
  const handleCompleteSubtask = () => {
    if (!taskId || !subtaskId) return;
    
    try {
      // Get current subtasks
      const subtasks = taskStorage.getSubtasks(taskId as string) || [];
      
      // Update the specific subtask
      const updatedSubtasks = subtasks.map((s: any) => {
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
      taskStorage.saveSubtasks(taskId as string, updatedSubtasks);
      
      // Update state
      const updatedSubtask = updatedSubtasks.find((s: any) => s.id === subtaskId);
      setSubtask(updatedSubtask);
      
      toast.success('Subtask marked as complete');
    } catch (err) {
      console.error('Error completing subtask:', err);
      toast.error('Failed to complete subtask');
    }
  };
  
  // Handle delete
  const handleDeleteSubtask = () => {
    if (!taskId || !subtaskId) return;
    
    try {
      // Get current subtasks
      const subtasks = taskStorage.getSubtasks(taskId as string) || [];
      
      // Filter out the current subtask
      const updatedSubtasks = subtasks.filter((s: any) => s.id !== subtaskId);
      
      // Save to localStorage
      taskStorage.saveSubtasks(taskId as string, updatedSubtasks);
      
      // Navigate back to parent task
      toast.success('Subtask deleted successfully');
      router.push(`/tasks/${taskId}`);
    } catch (err) {
      console.error('Error deleting subtask:', err);
      toast.error('Failed to delete subtask');
      setDeleteConfirmOpen(false);
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading Subtask</h3>
          <p className="text-muted-foreground">
            Preparing subtask details...
          </p>
        </div>
      </div>
    );
  }
  
  // Error state
  if (error || !subtask) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center p-4">
        <Card className="max-w-md w-full text-center p-6">
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center">
              <AlertCircle className="h-6 w-6 text-destructive" />
            </div>
          </div>
          <CardTitle className="mb-2">Error Loading Subtask</CardTitle>
          <p className="text-muted-foreground mb-4">{error || 'Subtask not found'}</p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button variant="outline" onClick={() => router.push(`/tasks/${taskId}`)}>
              Back to Task
            </Button>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </div>
        </Card>
      </div>
    );
  }
  
  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-4 md:p-6 max-w-4xl mx-auto"
    >
      {/* Header */}
      <motion.div 
        variants={slideUp}
        className="mb-6 flex flex-col sm:flex-row sm:items-center justify-between gap-4"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/tasks/${taskId}`)}
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
              Subtask Details
            </motion.h1>
            <motion.p 
              variants={slideUp}
              className="text-muted-foreground mt-1"
            >
              {parentTask?.Title && `Parent Task: ${parentTask.Title}`}
            </motion.p>
          </div>
        </div>
        
        <motion.div 
          variants={slideUp}
          className="flex flex-wrap items-center gap-3"
        >
          {!subtask.completed && (
            <Button
              onClick={handleCompleteSubtask}
              variant="default"
              className="bg-success text-success-foreground hover:bg-success/90"
            >
              <CheckCircle2 className="h-4 w-4 mr-2" />
              Complete
            </Button>
          )}
          
          {!isEditing && (
            <Button
              onClick={() => setIsEditing(true)}
              variant="outline"
            >
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          )}
          
          <Button
            onClick={() => setDeleteConfirmOpen(true)}
            variant="outline"
            className="text-destructive hover:bg-destructive/10"
          >
            <Trash2 className="h-4 w-4 mr-2" />
            Delete
          </Button>
        </motion.div>
      </motion.div>
      
      {/* Subtask Content */}
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
                <CardTitle>Edit Subtask</CardTitle>
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
                    value={editForm.title}
                    onChange={(e) => setEditForm({ ...editForm, title: e.target.value })}
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
                    value={editForm.description || ''}
                    onChange={(e) => setEditForm({ ...editForm, description: e.target.value })}
                    rows={4}
                  />
                </div>
                
                {/* Status and Due Date */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                  <div className="space-y-2">
                    <label htmlFor="edit-status" className="block text-sm font-medium">
                      Status
                    </label>
                    <select
                      id="edit-status"
                      value={editForm.status}
                      onChange={(e) => setEditForm({ ...editForm, status: e.target.value })}
                      className="w-full h-10 px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    >
                      <option value="Not Started">Not Started</option>
                      <option value="In Progress">In Progress</option>
                      <option value="Completed">Completed</option>
                    </select>
                  </div>
                  
                  <div className="space-y-2">
                    <label htmlFor="edit-duedate" className="block text-sm font-medium">
                      Due Date
                    </label>
                    <Input
                      id="edit-duedate"
                      type="date"
                      value={editForm.dueDate || ''}
                      onChange={(e) => setEditForm({ ...editForm, dueDate: e.target.value })}
                    />
                  </div>
                </div>
              </CardContent>
              
              <CardFooter className="border-t flex justify-end gap-3 pt-5">
                <Button
                  variant="outline"
                  onClick={() => setIsEditing(false)}
                >
                  Cancel
                </Button>
                
                <Button
                  onClick={handleSaveEdit}
                  disabled={!editForm.title.trim()}
                >
                  Save Changes
                </Button>
              </CardFooter>
            </motion.div>
          ) : (
            /* Subtask Details View */
            <motion.div 
              key="view-details"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <CardHeader className={cn(
                "border-t-4",
                subtask.status === 'Completed' ? "border-success" : 
                subtask.status === 'In Progress' ? "border-primary" : "border-muted"
              )}>
                <div className="flex flex-wrap items-start justify-between gap-4">
                  <CardTitle className={cn(
                    "text-xl",
                    subtask.completed && "line-through opacity-70"
                  )}>
                    {subtask.title}
                  </CardTitle>
                  
                  <Badge variant={subtask.completed ? 'success' : subtask.status === 'In Progress' ? 'info' : 'default'}>
                    {subtask.status}
                  </Badge>
                </div>
              </CardHeader>
              
              <CardContent className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-sm font-medium text-muted-foreground">Description</h3>
                  {subtask.description ? (
                    <p className="whitespace-pre-wrap">{subtask.description}</p>
                  ) : (
                    <p className="text-muted-foreground italic">No description provided</p>
                  )}
                </div>
                
                <div className="border-t pt-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {/* Due Date */}
                    {subtask.dueDate && (
                      <div className="space-y-2">
                        <h3 className="text-sm font-medium text-muted-foreground">Due Date</h3>
                        <div className="flex items-center gap-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <p className="font-medium">
                            {format(new Date(subtask.dueDate), 'MMMM d, yyyy')}
                          </p>
                        </div>
                      </div>
                    )}
                    
                    {/* Created At */}
                    <div className="space-y-2">
                      <h3 className="text-sm font-medium text-muted-foreground">Created</h3>
                      <div className="flex items-center gap-2">
                        <Clock className="h-4 w-4 text-muted-foreground" />
                        <p className="font-medium">
                          {format(new Date(subtask.createdAt), 'MMMM d, yyyy')}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Completed info if applicable */}
                {subtask.completed && subtask.completedAt && (
                  <div className="bg-success/10 p-4 rounded-md">
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="h-5 w-5 text-success" />
                      <span className="font-medium">Completed on {format(new Date(subtask.completedAt), 'MMMM d, yyyy')}</span>
                    </div>
                  </div>
                )}
              </CardContent>
            </motion.div>
          )}
        </Card>
      </motion.div>
      
      {/* Delete Confirmation Dialog */}
      <Dialog
        open={deleteConfirmOpen}
        onOpenChange={setDeleteConfirmOpen}
        title="Delete Subtask"
        description="Are you sure you want to delete this subtask? This action cannot be undone."
        size="sm"
      >
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={() => setDeleteConfirmOpen(false)}
          >
            Cancel
          </Button>
          
          <Button
            variant="destructive"
            onClick={handleDeleteSubtask}
          >
            Delete Subtask
          </Button>
        </div>
      </Dialog>
    </motion.div>
  );
}