'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Calendar,
  User, 
  Users, 
  AlertTriangle
} from 'lucide-react';
import { format } from 'date-fns';

// API imports
import { getProjectById, getProjectTeams, getProjectMembers } from '@/api/ProjectAPI';
import { createTask } from '@/api/TaskAPI';
import { useUser } from '@/hooks/useUser';
import { toast } from '@/lib/toast';

// CSS for the page
import './createTask.css';

export default function CreateTaskPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  // States
  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Status: 'Not Started',
    Priority: 'MEDIUM',
    Deadline: '',
    AssignTo: 'none', // 'none', 'user', 'team'
    UserId: '',
    TeamId: ''
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Fetch project data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch project data
        const projectData = await getProjectById(id);
        setProject(projectData);
        
        // Check if current user is project owner
        const userIsOwner = user?.Id === projectData.OwnerId;
        setIsOwner(userIsOwner);
        
        if (!userIsOwner) {
          // Redirect if not the owner
          toast.error('Only project owners can create tasks');
          router.push(`/projects/${id}/tasks`);
          return;
        }
        
        // Fetch teams and members in parallel
        const [teamsData, membersData] = await Promise.all([
          getProjectTeams(id),
          getProjectMembers(id)
        ]);
        
        setTeams(teamsData);
        setMembers(membersData);
      } catch (error) {
        console.error('Failed to load project data:', error);
        toast.error('Could not load project data');
      } finally {
        setLoading(false);
      }
    };
    
    if (id && user) {
      loadData();
    }
  }, [id, user, router]);
  
  // Handle input change
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
    
    // Reset related field errors
    if (errors[name]) {
      setErrors(prev => ({ ...prev, [name]: null }));
    }
    
    // Handle assignment type changes
    if (name === 'AssignTo') {
      if (value === 'none') {
        setForm(prev => ({ ...prev, UserId: '', TeamId: '' }));
      } else if (value === 'user') {
        setForm(prev => ({ ...prev, TeamId: '' }));
      } else if (value === 'team') {
        setForm(prev => ({ ...prev, UserId: '' }));
      }
    }
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.Title.trim()) {
      newErrors.Title = 'Title is required';
    }
    
    if (form.AssignTo === 'user' && !form.UserId) {
      newErrors.UserId = 'Please select a team member';
    }
    
    if (form.AssignTo === 'team' && !form.TeamId) {
      newErrors.TeamId = 'Please select a team';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  
  // Handle form submission
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setSubmitting(true);
    
    try {
      // Prepare task data
      const taskData = {
        Title: form.Title,
        Description: form.Description,
        Status: form.Status,
        Priority: form.Priority,
        ProjectId: id,
        UserId: form.AssignTo === 'user' ? form.UserId : undefined,
        TeamId: form.AssignTo === 'team' ? form.TeamId : undefined
      };
      
      // Add deadline if provided
      if (form.Deadline) {
        taskData.Deadline = new Date(form.Deadline).toISOString();
      }
      
      // Create task
      await createTask(taskData);
      
      toast.success('Task created successfully');
      router.push(`/projects/${id}/tasks`);
    } catch (error) {
      console.error('Failed to create task:', error);
      toast.error('Could not create task');
    } finally {
      setSubmitting(false);
    }
  };
  
  // If not the project owner (after check), return null
  if (!loading && !isOwner) {
    return null;
  }
  
  return (
    <div className="create-task-container">
      {/* Header */}
      <div className="create-task-header">
        <div className="create-task-title">
          <button 
            className="back-button" 
            onClick={() => router.push(`/projects/${id}/tasks`)}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Create New Task</h1>
            <p className="subtitle">
              {project?.Name ? `Add a task to ${project.Name}` : 'Add a task to this project'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Form */}
      {loading ? (
        <div className="form-skeleton">
          <div className="input-skeleton"></div>
          <div className="textarea-skeleton"></div>
          <div className="input-row-skeleton">
            <div className="input-skeleton"></div>
            <div className="input-skeleton"></div>
          </div>
          <div className="input-row-skeleton">
            <div className="input-skeleton"></div>
            <div className="input-skeleton"></div>
          </div>
        </div>
      ) : (
        <form className="create-task-form" onSubmit={handleSubmit}>
          {/* Title */}
          <div className="form-group">
            <label htmlFor="Title">Task Title <span className="required">*</span></label>
            <input
              type="text"
              id="Title"
              name="Title"
              value={form.Title}
              onChange={handleInputChange}
              placeholder="Enter task title"
              className={errors.Title ? 'error' : ''}
            />
            {errors.Title && <div className="error-message">{errors.Title}</div>}
          </div>
          
          {/* Description */}
          <div className="form-group">
            <label htmlFor="Description">Description</label>
            <textarea
              id="Description"
              name="Description"
              value={form.Description}
              onChange={handleInputChange}
              placeholder="Enter task description"
              rows={4}
            ></textarea>
          </div>
          
          {/* Status and Priority */}
          <div className="form-row">
            <div className="form-group">
              <label htmlFor="Status">Status</label>
              <select
                id="Status"
                name="Status"
                value={form.Status}
                onChange={handleInputChange}
              >
                <option value="Not Started">Not Started</option>
                <option value="In Progress">In Progress</option>
                <option value="Completed">Completed</option>
              </select>
            </div>
            
            <div className="form-group">
              <label htmlFor="Priority">Priority</label>
              <select
                id="Priority"
                name="Priority"
                value={form.Priority}
                onChange={handleInputChange}
              >
                <option value="LOW">Low</option>
                <option value="MEDIUM">Medium</option>
                <option value="HIGH">High</option>
              </select>
            </div>
          </div>
          
          {/* Deadline */}
          <div className="form-group">
            <label htmlFor="Deadline">Deadline</label>
            <div className="date-input-container">
              <Calendar className="date-icon" size={16} />
              <input
                type="date"
                id="Deadline"
                name="Deadline"
                value={form.Deadline}
                onChange={handleInputChange}
                min={format(new Date(), 'yyyy-MM-dd')}
              />
            </div>
          </div>
          
          {/* Assignment */}
          <div className="form-group">
            <label>Assign To</label>
            <div className="assign-options">
              <label className="radio-label">
                <input
                  type="radio"
                  name="AssignTo"
                  value="none"
                  checked={form.AssignTo === 'none'}
                  onChange={handleInputChange}
                />
                <span>No Assignment</span>
              </label>
              
              <label className="radio-label">
                <input
                  type="radio"
                  name="AssignTo"
                  value="user"
                  checked={form.AssignTo === 'user'}
                  onChange={handleInputChange}
                />
                <span>Team Member</span>
              </label>
              
              <label className="radio-label">
                <input
                  type="radio"
                  name="AssignTo"
                  value="team"
                  checked={form.AssignTo === 'team'}
                  onChange={handleInputChange}
                />
                <span>Team</span>
              </label>
            </div>
          </div>
          
          {/* User selection */}
          {form.AssignTo === 'user' && (
            <div className="form-group">
              <label htmlFor="UserId">
                Select Team Member <span className="required">*</span>
              </label>
              <div className="select-container">
                <User className="select-icon" size={16} />
                <select
                  id="UserId"
                  name="UserId"
                  value={form.UserId}
                  onChange={handleInputChange}
                  className={errors.UserId ? 'error' : ''}
                >
                  <option value="">Select a member...</option>
                  {members.map(member => (
                    <option key={member.UserId} value={member.UserId}>
                      {/* Display user name if available, otherwise use ID */}
                      {member.User?.FirstName 
                        ? `${member.User.FirstName} ${member.User.LastName || ''}` 
                        : `User ${member.UserId.substring(0, 8)}`}
                    </option>
                  ))}
                </select>
              </div>
              {errors.UserId && <div className="error-message">{errors.UserId}</div>}
            </div>
          )}
          
          {/* Team selection */}
          {form.AssignTo === 'team' && (
            <div className="form-group">
              <label htmlFor="TeamId">
                Select Team <span className="required">*</span>
              </label>
              <div className="select-container">
                <Users className="select-icon" size={16} />
                <select
                  id="TeamId"
                  name="TeamId"
                  value={form.TeamId}
                  onChange={handleInputChange}
                  className={errors.TeamId ? 'error' : ''}
                >
                  <option value="">Select a team...</option>
                  {teams.map(team => (
                    <option key={team.Id} value={team.Id}>
                      {team.Name}
                    </option>
                  ))}
                </select>
              </div>
              {errors.TeamId && <div className="error-message">{errors.TeamId}</div>}
            </div>
          )}
          
          {/* Form actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => router.push(`/projects/${id}/tasks`)}
              disabled={submitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Task'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}