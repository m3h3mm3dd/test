'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';

// UI components
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { EmptyState } from '@/components/ui/EmptyState';
import { DatePicker } from '@/components/ui/DatePicker';
import { FormInput } from '@/components/ui/FormInput';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Spinner } from '@/components/ui/spinner';
import { Badge } from '@/components/ui/badge'; // Added missing import for Badge component

// Icons
import { 
  ArrowLeft, 
  Calendar, 
  Users, 
  User, 
  Clock, 
  Flag, 
  Plus, 
  CheckCircle2, 
  Loader2, 
  AlertCircle,
  InfoIcon,
  X,
  HelpCircle
} from 'lucide-react';

// API
import { getProjectById, getProjectTeams, getProjectMembers } from '@/api/ProjectAPI';
import { createTask } from '@/api/TaskAPI';
import { toast } from '@/lib/toast';
import { cn } from '@/lib/utils';

// Animation variants
const fadeIn = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const slideUp = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
};

const formVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: { 
    opacity: 1, 
    y: 0,
    transition: { 
      duration: 0.5,
      type: "spring",
      stiffness: 300,
      damping: 25
    }
  }
};

const staggerFormItems = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.07
    }
  }
};

export default function CreateTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  
  // States
  const [project, setProject] = useState<any>(null);
  const [teams, setTeams] = useState<any[]>([]);
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<string | null>(null);
  const [isProjectOwner, setIsProjectOwner] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Priority: 'MEDIUM',
    Status: 'Not Started',
    Deadline: '',
    AssignmentType: 'none', // 'none', 'user', 'team'
    UserId: '',
    TeamId: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [showHelp, setShowHelp] = useState(false);
  
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

  // Fetch project data
  useEffect(() => {
    const fetchData = async () => {
      if (!id || !userId) return;
      
      setLoading(true);
      try {
        // Get project and check ownership
        const projectData = await getProjectById(id as string);
        setProject(projectData);
        
        // Check if user is project owner
        const userIsOwner = projectData.OwnerId === userId;
        setIsProjectOwner(userIsOwner);
        
        if (!userIsOwner) {
          toast.error('Only project owners can create tasks');
          router.push(`/projects/${id}/tasks`);
          return;
        }
        
        // Get teams and members
        const [teamsData, membersData] = await Promise.all([
          getProjectTeams(id as string),
          getProjectMembers(id as string)
        ]);
        
        setTeams(teamsData || []);
        setMembers(membersData || []);
        setError(null);
      } catch (err: any) {
        console.error('Error fetching project data:', err);
        setError(err?.message || 'Failed to load project data');
        toast.error('Could not load project data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchData();
  }, [id, userId, router]);

  // Handle input change
  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    
    // Handle assignment type changes
    if (name === 'AssignmentType') {
      if (value === 'none') {
        setForm(prev => ({ ...prev, [name]: value, UserId: '', TeamId: '' }));
      } else if (value === 'user') {
        setForm(prev => ({ ...prev, [name]: value, TeamId: '' }));
      } else if (value === 'team') {
        setForm(prev => ({ ...prev, [name]: value, UserId: '' }));
      }
    } else {
      setForm(prev => ({ ...prev, [name]: value }));
    }
    
    // Clear validation error when field is changed
    if (errors[name]) {
      setErrors(prev => {
        const newErrors = { ...prev };
        delete newErrors[name];
        return newErrors;
      });
    }
  };

  // Validate form
  const validateForm = () => {
    const newErrors: Record<string, string> = {};
    
    if (!form.Title.trim()) {
      newErrors.Title = 'Title is required';
    }
    
    if (form.AssignmentType === 'user' && !form.UserId) {
      newErrors.UserId = 'Please select a team member';
    }
    
    if (form.AssignmentType === 'team' && !form.TeamId) {
      newErrors.TeamId = 'Please select a team';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare task data
      const taskData: any = {
        Title: form.Title,
        Description: form.Description,
        Status: form.Status,
        Priority: form.Priority,
        ProjectId: id,
      };
      
      // Add deadline if provided
      if (form.Deadline) {
        taskData.Deadline = new Date(form.Deadline).toISOString();
      }
      
      // Add assignment based on type
      if (form.AssignmentType === 'user') {
        taskData.UserId = form.UserId;
      } else if (form.AssignmentType === 'team') {
        taskData.TeamId = form.TeamId;
      }
      
      // Create task
      await createTask(taskData);
      
      toast.success('Task created successfully');
      router.push(`/projects/${id}/tasks`);
    } catch (err: any) {
      console.error('Error creating task:', err);
      toast.error(err?.message || 'Could not create task');
    } finally {
      setSubmitting(false);
    }
  };

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[60vh] p-6">
        <div className="text-center">
          <Spinner size="xl" className="mx-auto mb-4" />
          <h3 className="text-xl font-medium mb-2">Loading Project</h3>
          <p className="text-muted-foreground">
            Getting ready to create a new task...
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
        title="Error Loading Project"
        description={error}
        action={
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <Button 
              variant="outline"
              onClick={() => router.push(`/projects/${id}/tasks`)}
            >
              Back to Tasks
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

  if (!isProjectOwner) {
    return null; // This shouldn't be visible since we redirect
  }

  return (
    <motion.div 
      initial="hidden"
      animate="visible"
      variants={fadeIn}
      className="p-4 md:p-6 max-w-3xl mx-auto"
    >
      {/* Header */}
      <motion.div
        variants={slideUp}
        className="mb-8"
      >
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="icon"
            onClick={() => router.push(`/projects/${id}/tasks`)}
            className="h-10 w-10 rounded-full"
            aria-label="Back to tasks"
          >
            <ArrowLeft className="h-5 w-5" />
          </Button>
          
          <div>
            <motion.h1 
              variants={slideUp}
              className="text-2xl font-bold"
            >
              Create New Task
            </motion.h1>
            <motion.p 
              variants={slideUp}
              transition={{ delay: 0.1 }}
              className="text-muted-foreground mt-1"
            >
              Add a new task to {project?.Name || 'this project'}
            </motion.p>
          </div>
        </div>
      </motion.div>
      
      {/* Help button */}
      <motion.button
        initial={{ opacity: 0, scale: 0.8 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.5 }}
        onClick={() => setShowHelp(!showHelp)}
        className="fixed bottom-6 right-6 h-12 w-12 rounded-full bg-primary text-primary-foreground shadow-lg flex items-center justify-center z-10"
      >
        <HelpCircle className="h-6 w-6" />
      </motion.button>
      
      {/* Help panel */}
      <AnimatePresence>
        {showHelp && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 50, scale: 0.9 }}
            transition={{ type: "spring", damping: 25 }}
            className="fixed right-6 bottom-20 z-10"
          >
            <GlassPanel className="w-80 p-5">
              <div className="flex justify-between items-center mb-3">
                <h3 className="font-bold">Task Creation Tips</h3>
                <Button
                  onClick={() => setShowHelp(false)}
                  variant="ghost"
                  size="icon"
                  className="h-8 w-8 rounded-full"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-3 text-sm">
                <p><span className="font-semibold text-primary">Priority</span>: Choose based on urgency and importance</p>
                <p><span className="font-semibold text-primary">Status</span>: Most new tasks start as "Not Started"</p>
                <p><span className="font-semibold text-primary">Assignment</span>: You can assign to a team member or an entire team</p>
                <p><span className="font-semibold text-primary">Deadlines</span>: Add clear deadlines to help with tracking</p>
              </div>
            </GlassPanel>
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Form */}
      <motion.div
        variants={formVariants}
      >
        <Card>
          <CardHeader>
            <CardTitle>Create Task</CardTitle>
            <CardDescription>
              Fill in the details below to create a new task
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            <motion.form 
              onSubmit={handleSubmit} 
              variants={staggerFormItems}
              className="space-y-6"
            >
              {/* Title */}
              <motion.div variants={slideUp}>
                <FormInput
                  label="Task Title"
                  id="Title"
                  inputProps={{
                    name: "Title",
                    value: form.Title,
                    onChange: handleInputChange,
                    placeholder: "Enter task title",
                    required: true
                  }}
                  error={errors.Title}
                />
              </motion.div>
              
              {/* Description */}
              <motion.div variants={slideUp}>
                <label className="block text-sm font-medium mb-2">
                  Description
                </label>
                <Textarea
                  name="Description"
                  value={form.Description}
                  onChange={handleInputChange}
                  placeholder="Describe the task details, requirements, or any additional information"
                  rows={4}
                />
              </motion.div>
              
              {/* Two columns for Status and Priority */}
              <motion.div variants={slideUp} className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label htmlFor="Status" className="block text-sm font-medium mb-2">
                    Status
                  </label>
                  <select
                    id="Status"
                    name="Status"
                    value={form.Status}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="Not Started">Not Started</option>
                    <option value="In Progress">In Progress</option>
                    <option value="Completed">Completed</option>
                  </select>
                </div>
                
                <div>
                  <label htmlFor="Priority" className="block text-sm font-medium mb-2">
                    Priority
                  </label>
                  <select
                    id="Priority"
                    name="Priority"
                    value={form.Priority}
                    onChange={handleInputChange}
                    className="w-full h-10 rounded-md border border-input bg-background px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                  >
                    <option value="LOW">Low</option>
                    <option value="MEDIUM">Medium</option>
                    <option value="HIGH">High</option>
                  </select>
                </div>
              </motion.div>
              
              {/* Deadline */}
              <motion.div variants={slideUp}>
                <label htmlFor="Deadline" className="block text-sm font-medium mb-2">
                  Deadline
                </label>
                <FormInput
                  icon={<Calendar className="h-4 w-4" />}
                  inputProps={{
                    type: "date",
                    name: "Deadline",
                    id: "Deadline",
                    value: form.Deadline,
                    onChange: handleInputChange
                  }}
                />
              </motion.div>
              
              {/* Assignment */}
              <motion.div variants={slideUp}>
                <Card>
                  <CardHeader className="pb-3">
                    <div className="flex justify-between items-center">
                      <CardTitle className="text-base">Assignment</CardTitle>
                      <Badge variant="outline">Optional</Badge>
                    </div>
                  </CardHeader>
                  
                  <CardContent className="space-y-4">
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="assignNone"
                          name="AssignmentType"
                          value="none"
                          checked={form.AssignmentType === 'none'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="assignNone" className="text-sm font-medium">
                          No Assignment
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="assignUser"
                          name="AssignmentType"
                          value="user"
                          checked={form.AssignmentType === 'user'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="assignUser" className="text-sm font-medium">
                          Assign to Team Member
                        </label>
                      </div>
                      
                      <div className="flex items-center space-x-2">
                        <input
                          type="radio"
                          id="assignTeam"
                          name="AssignmentType"
                          value="team"
                          checked={form.AssignmentType === 'team'}
                          onChange={handleInputChange}
                          className="h-4 w-4 text-primary focus:ring-primary"
                        />
                        <label htmlFor="assignTeam" className="text-sm font-medium">
                          Assign to Team
                        </label>
                      </div>
                    </div>
                    
                    <AnimatePresence>
                      {/* User selection */}
                      {form.AssignmentType === 'user' && (
                        <motion.div 
                          key="user-select"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 border-l-2 border-primary/20 pl-4 py-2">
                            <label htmlFor="UserId" className="block text-sm font-medium mb-2">
                              Select Team Member <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                              <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4" />
                              <select
                                id="UserId"
                                name="UserId"
                                value={form.UserId}
                                onChange={handleInputChange}
                                className={cn(
                                  "w-full h-10 rounded-md border pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                                  errors.UserId ? 'border-destructive focus:ring-destructive' : 'border-input'
                                )}
                              >
                                <option value="">Select a team member...</option>
                                {members.length === 0 ? (
                                  <option value="" disabled>No members available</option>
                                ) : (
                                  members.map(member => (
                                    <option key={member.UserId} value={member.UserId}>
                                      {member.User?.FirstName 
                                        ? `${member.User.FirstName} ${member.User.LastName || ''}` 
                                        : `User ${member.UserId.substring(0, 8)}`}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            {errors.UserId && (
                              <p className="text-xs text-destructive mt-1">{errors.UserId}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                      
                      {/* Team selection */}
                      {form.AssignmentType === 'team' && (
                        <motion.div 
                          key="team-select"
                          initial={{ opacity: 0, height: 0 }}
                          animate={{ opacity: 1, height: 'auto' }}
                          exit={{ opacity: 0, height: 0 }}
                          transition={{ duration: 0.3 }}
                          className="overflow-hidden"
                        >
                          <div className="mt-3 border-l-2 border-primary/20 pl-4 py-2">
                            <label htmlFor="TeamId" className="block text-sm font-medium mb-2">
                              Select Team <span className="text-destructive">*</span>
                            </label>
                            <div className="relative">
                              <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground pointer-events-none h-4 w-4" />
                              <select
                                id="TeamId"
                                name="TeamId"
                                value={form.TeamId}
                                onChange={handleInputChange}
                                className={cn(
                                  "w-full h-10 rounded-md border pl-10 pr-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-ring",
                                  errors.TeamId ? 'border-destructive focus:ring-destructive' : 'border-input'
                                )}
                              >
                                <option value="">Select a team...</option>
                                {teams.length === 0 ? (
                                  <option value="" disabled>No teams available</option>
                                ) : (
                                  teams.map(team => (
                                    <option key={team.Id} value={team.Id}>
                                      {team.Name}
                                    </option>
                                  ))
                                )}
                              </select>
                            </div>
                            {errors.TeamId && (
                              <p className="text-xs text-destructive mt-1">{errors.TeamId}</p>
                            )}
                          </div>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </CardContent>
                </Card>
              </motion.div>
              
              {/* Form actions */}
              <motion.div variants={slideUp} className="flex justify-end gap-3 pt-4 border-t">
                <Button
                  type="button"
                  onClick={() => router.push(`/projects/${id}/tasks`)}
                  disabled={submitting}
                  variant="outline"
                >
                  Cancel
                </Button>
                
                <Button
                  type="submit"
                  disabled={submitting}
                  isLoading={submitting}
                >
                  <Plus className="h-4 w-4 mr-2" />
                  Create Task
                </Button>
              </motion.div>
            </motion.form>
          </CardContent>
        </Card>
      </motion.div>
    </motion.div>
  );
}