'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Users } from 'lucide-react';
import { toast } from '@/lib/toast';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { createTeam } from '@/api/TeamAPI';
import { useUser } from '@/hooks/useUser';

// CSS for the page
import './createTeam.css';

// Team colors for selection
const TEAM_COLORS = [
  { index: 0, bg: 'var(--team-color-1)', text: 'var(--team-color-1-text)' },
  { index: 1, bg: 'var(--team-color-2)', text: 'var(--team-color-2-text)' },
  { index: 2, bg: 'var(--team-color-3)', text: 'var(--team-color-3-text)' },
  { index: 3, bg: 'var(--team-color-4)', text: 'var(--team-color-4-text)' },
  { index: 4, bg: 'var(--team-color-5)', text: 'var(--team-color-5-text)' },
  { index: 5, bg: 'var(--team-color-6)', text: 'var(--team-color-6-text)' },
];

export default function CreateTeamPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  // States
  const [project, setProject] = useState(null);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [isOwner, setIsOwner] = useState(false);
  
  // Form state
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    ColorIndex: 0,
    ProjectId: id
  });
  
  // Validation state
  const [errors, setErrors] = useState({});
  
  // Get team initials from name
  const getTeamInitials = (name) => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  
  // Fetch project data and check permissions
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
          toast.error('Only project owners can create teams');
          router.push(`/projects/${id}/team`);
          return;
        }
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
  };
  
  // Handle color selection
  const handleColorSelect = (colorIndex) => {
    setForm(prev => ({ ...prev, ColorIndex: colorIndex }));
  };
  
  // Validate form
  const validateForm = () => {
    const newErrors = {};
    
    if (!form.Name.trim()) {
      newErrors.Name = 'Team name is required';
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
      // Create team
      const team = await createTeam(form);
      
      toast.success('Team created successfully');
      router.push(`/projects/${id}/team/${team.Id}`);
    } catch (error) {
      console.error('Failed to create team:', error);
      toast.error('Could not create team');
    } finally {
      setSubmitting(false);
    }
  };
  
  // If not the project owner (after check), return null
  if (!loading && !isOwner) {
    return null;
  }
  
  return (
    <div className="create-team-container">
      {/* Header */}
      <div className="create-team-header">
        <div className="create-team-title">
          <button 
            className="back-button" 
            onClick={() => router.push(`/projects/${id}/team`)}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Create New Team</h1>
            <p className="subtitle">
              {project?.Name ? `Add a team to ${project.Name}` : 'Add a team to this project'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Form */}
      {loading ? (
        <div className="form-skeleton">
          <div className="input-skeleton"></div>
          <div className="textarea-skeleton"></div>
          <div className="colors-skeleton"></div>
        </div>
      ) : (
        <form className="create-team-form" onSubmit={handleSubmit}>
          {/* Preview */}
          <div className="team-preview-section">
            <h2>Team Preview</h2>
            <div className="team-preview-card">
              <div 
                className="team-preview-avatar"
                style={{ 
                  backgroundColor: TEAM_COLORS[form.ColorIndex].bg, 
                  color: TEAM_COLORS[form.ColorIndex].text 
                }}
              >
                {getTeamInitials(form.Name) || <Users size={36} />}
              </div>
              
              <div className="team-preview-content">
                <h3 className="team-preview-name">
                  {form.Name || 'Team Name'}
                </h3>
                <p className="team-preview-description">
                  {form.Description || 'Team description will appear here'}
                </p>
              </div>
            </div>
          </div>
          
          {/* Team details */}
          <div className="team-details-section">
            <h2>Team Details</h2>
            
            {/* Name */}
            <div className="form-group">
              <label htmlFor="Name">Team Name <span className="required">*</span></label>
              <input
                type="text"
                id="Name"
                name="Name"
                value={form.Name}
                onChange={handleInputChange}
                placeholder="Enter team name"
                className={errors.Name ? 'error' : ''}
              />
              {errors.Name && <div className="error-message">{errors.Name}</div>}
            </div>
            
            {/* Description */}
            <div className="form-group">
              <label htmlFor="Description">Description</label>
              <textarea
                id="Description"
                name="Description"
                value={form.Description}
                onChange={handleInputChange}
                placeholder="Enter team description"
                rows={4}
              ></textarea>
            </div>
            
            {/* Color selection */}
            <div className="form-group">
              <label>Team Color</label>
              <div className="color-options">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color.index}
                    type="button"
                    className={`color-option ${form.ColorIndex === color.index ? 'selected' : ''}`}
                    style={{ backgroundColor: color.bg }}
                    onClick={() => handleColorSelect(color.index)}
                  ></button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Form actions */}
          <div className="form-actions">
            <button
              type="button"
              className="cancel-button"
              onClick={() => router.push(`/projects/${id}/team`)}
              disabled={submitting}
            >
              Cancel
            </button>
            
            <button
              type="submit"
              className="submit-button"
              disabled={submitting}
            >
              {submitting ? 'Creating...' : 'Create Team'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
}