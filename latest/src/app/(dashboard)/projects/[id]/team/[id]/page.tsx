'use client';

import { useState, useEffect, useRef } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Users, 
  Plus, 
  Edit, 
  User,
  Settings, 
  Trash2, 
  MoreHorizontal,
  CheckCircle2,
  Paperclip,
  X,
  AlertTriangle,
  UserPlus,
  Calendar,
  Clock
} from 'lucide-react';
import { toast } from '@/lib/toast';
import { format, isPast, isToday } from 'date-fns';

// API imports
import { getProjectById, getProjectMembers } from '@/api/ProjectAPI';
import { getTeamById, deleteTeam, updateTeam, addTeamMember, removeTeamMember, getTeamTasks } from '@/api/TeamAPI';
import { getTaskAttachments, uploadTaskAttachment, markTaskComplete } from '@/api/TaskAPI';
import { useUser } from '@/hooks/useUser';

// CSS for the page
import './teamDetail.css';

// Team colors
const TEAM_COLORS = [
  { index: 0, bg: 'var(--team-color-1)', text: 'var(--team-color-1-text)' },
  { index: 1, bg: 'var(--team-color-2)', text: 'var(--team-color-2-text)' },
  { index: 2, bg: 'var(--team-color-3)', text: 'var(--team-color-3-text)' },
  { index: 3, bg: 'var(--team-color-4)', text: 'var(--team-color-4-text)' },
  { index: 4, bg: 'var(--team-color-5)', text: 'var(--team-color-5-text)' },
  { index: 5, bg: 'var(--team-color-6)', text: 'var(--team-color-6-text)' },
];

export default function TeamDetailPage() {
  const params = useParams();
  const projectId = params.id;
  const teamId = params['id2']; // The second id in the URL
  const router = useRouter();
  const { user } = useUser();
  const fileInputRef = useRef(null);
  
  // States
  const [project, setProject] = useState(null);
  const [team, setTeam] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [members, setMembers] = useState([]);
  const [projectMembers, setProjectMembers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isOwner, setIsOwner] = useState(false);
  const [addingMember, setAddingMember] = useState(false);
  const [newMember, setNewMember] = useState('');
  const [newMemberRole, setNewMemberRole] = useState('Member');
  const [newMemberIsLeader, setNewMemberIsLeader] = useState(false);
  const [activeTab, setActiveTab] = useState('tasks'); // 'tasks', 'members', 'settings'
  const [editMode, setEditMode] = useState(false);
  const [editForm, setEditForm] = useState({ Name: '', Description: '', ColorIndex: 0 });
  const [selectedTask, setSelectedTask] = useState(null);
  const [attachments, setAttachments] = useState([]);
  const [loadingAttachments, setLoadingAttachments] = useState(false);
  const [uploading, setUploading] = useState(false);
  
  // Fetch team data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch team, project, tasks, and members in parallel
        const [teamData, projectData, tasksData, projectMembersData] = await Promise.all([
          getTeamById(teamId),
          getProjectById(projectId),
          getTeamTasks(teamId),
          getProjectMembers(projectId)
        ]);
        
        setTeam(teamData);
        setProject(projectData);
        setTasks(tasksData);
        setProjectMembers(projectMembersData);
        
        // Extract team members from project members
        // In a real application, this would come from a proper endpoint
        // This is a simplified approach for the demo
        const teamMembersData = projectMembersData.filter(member => 
          member.TeamId === teamId
        );
        
        setMembers(teamMembersData);
        
        // Check if current user is project owner
        setIsOwner(user?.Id === projectData.OwnerId);
        
        // Set edit form initial values
        setEditForm({
          Name: teamData.Name,
          Description: teamData.Description || '',
          ColorIndex: teamData.ColorIndex || 0
        });
      } catch (error) {
        console.error('Failed to load team data:', error);
        toast.error('Could not load team data');
      } finally {
        setLoading(false);
      }
    };
    
    if (projectId && teamId && user) {
      loadData();
    }
  }, [projectId, teamId, user]);
  
  // Load attachments when a task is selected
  useEffect(() => {
    if (selectedTask) {
      const loadAttachments = async () => {
        try {
          setLoadingAttachments(true);
          const data = await getTaskAttachments(selectedTask.Id);
          setAttachments(data);
        } catch (error) {
          console.error('Failed to load attachments:', error);
        } finally {
          setLoadingAttachments(false);
        }
      };
      
      loadAttachments();
    } else {
      setAttachments([]);
    }
  }, [selectedTask]);
  
  // Handle team editing
  const handleEditSubmit = async () => {
    try {
      await updateTeam(teamId, {
        Name: editForm.Name,
        Description: editForm.Description,
        ColorIndex: editForm.ColorIndex
      });
      
      // Update local state
      setTeam(prev => ({
        ...prev,
        Name: editForm.Name,
        Description: editForm.Description,
        ColorIndex: editForm.ColorIndex
      }));
      
      setEditMode(false);
      toast.success('Team updated successfully');
    } catch (error) {
      console.error('Failed to update team:', error);
      toast.error('Could not update team');
    }
  };
  
  // Handle team deletion
  const handleDeleteTeam = async () => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await deleteTeam(teamId);
      
      toast.success('Team deleted successfully');
      router.push(`/projects/${projectId}/team`);
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Could not delete team');
    }
  };
  
  // Handle member addition
  const handleAddMember = async () => {
    if (!newMember) {
      toast.error('Please select a member');
      return;
    }
    
    try {
      await addTeamMember({
        TeamId: teamId,
        UserIdToBeAdded: newMember,
        Role: newMemberRole,
        IsLeader: newMemberIsLeader
      });
      
      // Update local state (simulating response from backend)
      const addedMember = projectMembers.find(m => m.UserId === newMember);
      if (addedMember) {
        setMembers(prev => [...prev, {
          ...addedMember,
          TeamId: teamId,
          Role: newMemberRole,
          IsLeader: newMemberIsLeader
        }]);
      }
      
      // Reset form
      setAddingMember(false);
      setNewMember('');
      setNewMemberRole('Member');
      setNewMemberIsLeader(false);
      
      toast.success('Member added to team');
    } catch (error) {
      console.error('Failed to add member:', error);
      toast.error('Could not add member to team');
    }
  };
  
  // Handle member removal
  const handleRemoveMember = async (userId) => {
    if (!confirm('Are you sure you want to remove this member from the team?')) return;
    
    try {
      await removeTeamMember({
        TeamId: teamId,
        UserIdToBeRemoved: userId
      });
      
      // Update local state
      setMembers(prev => prev.filter(member => member.UserId !== userId));
      
      toast.success('Member removed from team');
    } catch (error) {
      console.error('Failed to remove member:', error);
      toast.error('Could not remove member from team');
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
      
      toast.success('Task marked as complete');
    } catch (error) {
      console.error('Failed to complete task:', error);
      toast.error('Could not mark task as complete');
    }
  };
  
  // Handle file upload for task
  const handleFileUpload = async (event) => {
    if (!selectedTask) return;
    
    const file = event.target.files?.[0];
    if (!file) return;
    
    setUploading(true);
    
    try {
      const newAttachment = await uploadTaskAttachment(selectedTask.Id, file);
      
      // Update local state
      setAttachments(prev => [...prev, newAttachment]);
      
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
  
  // Get team color
  const getTeamColor = (colorIndex) => {
    const index = colorIndex % TEAM_COLORS.length;
    return TEAM_COLORS[index] || TEAM_COLORS[0];
  };
  
  // Get team initials
  const getTeamInitials = (name) => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  
  // Get available project members (not already in this team)
  const getAvailableMembers = () => {
    if (!projectMembers || !members) return [];
    
    const memberIds = members.map(m => m.UserId);
    return projectMembers.filter(m => !memberIds.includes(m.UserId));
  };
  
  // Format file size
  const formatFileSize = (bytes) => {
    if (bytes < 1024) return bytes + ' bytes';
    if (bytes < 1048576) return (bytes / 1024).toFixed(1) + ' KB';
    return (bytes / 1048576).toFixed(1) + ' MB';
  };
  
  // Get user name by ID
  const getUserName = (userId) => {
    if (!projectMembers) return 'Unknown User';
    
    const member = projectMembers.find(m => m.UserId === userId);
    if (member?.User) {
      return `${member.User.FirstName || ''} ${member.User.LastName || ''}`.trim();
    }
    
    return `User ${userId.substring(0, 8)}...`;
  };
  
  // Check if current user can complete task
  const canCompleteTask = (task) => {
    if (!task || !user) return false;
    
    return (
      task.UserId === user.Id || 
      task.CreatedBy === user.Id || 
      isOwner
    );
  };
  
  // Check if a user is team leader
  const isTeamLeader = (userId) => {
    if (!members) return false;
    
    const member = members.find(m => m.UserId === userId);
    return member?.IsLeader;
  };
  
  if (loading) {
    return (
      <div className="team-loading">
        <div className="team-loading-spinner"></div>
        <p>Loading team details...</p>
      </div>
    );
  }
  
  // Get team color
  const teamColor = team ? getTeamColor(team.ColorIndex) : TEAM_COLORS[0];
  
  return (
    <div className="team-detail-container">
      {/* Header */}
      <div className="team-detail-header">
        <div className="team-detail-title">
          <button 
            className="back-button" 
            onClick={() => router.push(`/projects/${projectId}/team`)}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>Team Details</h1>
            <p className="subtitle">
              {project?.Name ? `View and manage team for ${project.Name}` : 'View and manage team'}
            </p>
          </div>
        </div>
      </div>
      
      {/* Team info card */}
      <div className="team-info-card">
        <div 
          className="team-info-avatar"
          style={{ backgroundColor: teamColor.bg, color: teamColor.text }}
        >
          {getTeamInitials(team.Name)}
        </div>
        
        <div className="team-info-content">
          <h2>{team.Name}</h2>
          <p>{team.Description || 'No description provided'}</p>
          
          <div className="team-info-meta">
            <div className="team-info-stats">
              <div className="team-stat">
                <Users size={16} />
                <span>{members.length} Members</span>
              </div>
              
              <div className="team-stat">
                <CheckCircle2 size={16} />
                <span>{tasks.length} Tasks</span>
              </div>
            </div>
            
            {isOwner && (
              <div className="team-actions">
                <button 
                  className="team-edit-button"
                  onClick={() => setEditMode(!editMode)}
                >
                  <Edit size={16} />
                  <span>Edit Team</span>
                </button>
                
                <button 
                  className="team-delete-button"
                  onClick={handleDeleteTeam}
                >
                  <Trash2 size={16} />
                  <span>Delete</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>
      
      {/* Edit team form */}
      {editMode && (
        <div className="team-edit-form">
          <h3>Edit Team</h3>
          
          <div className="team-edit-grid">
            <div className="form-group">
              <label htmlFor="Name">Team Name</label>
              <input
                type="text"
                id="Name"
                value={editForm.Name}
                onChange={(e) => setEditForm({ ...editForm, Name: e.target.value })}
              />
            </div>
            
            <div className="form-group">
              <label htmlFor="Description">Description</label>
              <textarea
                id="Description"
                value={editForm.Description}
                onChange={(e) => setEditForm({ ...editForm, Description: e.target.value })}
                rows={3}
              ></textarea>
            </div>
            
            <div className="form-group">
              <label>Team Color</label>
              <div className="color-options">
                {TEAM_COLORS.map((color) => (
                  <button
                    key={color.index}
                    type="button"
                    className={`color-option ${editForm.ColorIndex === color.index ? 'selected' : ''}`}
                    style={{ backgroundColor: color.bg }}
                    onClick={() => setEditForm({ ...editForm, ColorIndex: color.index })}
                  ></button>
                ))}
              </div>
            </div>
          </div>
          
          <div className="team-edit-actions">
            <button 
              className="cancel-button"
              onClick={() => setEditMode(false)}
            >
              Cancel
            </button>
            
            <button 
              className="save-button"
              onClick={handleEditSubmit}
            >
              Save Changes
            </button>
          </div>
        </div>
      )}
      
      {/* Tabs */}
      <div className="team-tabs">
        <button 
          className={`team-tab ${activeTab === 'tasks' ? 'active' : ''}`}
          onClick={() => setActiveTab('tasks')}
        >
          <CheckCircle2 size={16} />
          <span>Tasks</span>
        </button>
        
        <button 
          className={`team-tab ${activeTab === 'members' ? 'active' : ''}`}
          onClick={() => setActiveTab('members')}
        >
          <Users size={16} />
          <span>Members</span>
        </button>
      </div>
      
      {/* Tasks Tab */}
      {activeTab === 'tasks' && (
        <div className="team-tasks">
          <div className="team-section-header">
            <h3>Team Tasks</h3>
            
            {selectedTask ? (
              <button 
                className="close-detail-button"
                onClick={() => setSelectedTask(null)}
              >
                <X size={16} />
                <span>Close Details</span>
              </button>
            ) : tasks.length === 0 ? (
              <div></div>
            ) : (
              <div className="task-count">
                {tasks.filter(t => t.Completed).length} / {tasks.length} completed
              </div>
            )}
          </div>
          
          {tasks.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <CheckCircle2 size={40} />
              </div>
              <h2>No Tasks Assigned</h2>
              <p>This team doesn't have any tasks assigned yet.</p>
            </div>
          ) : selectedTask ? (
            <div className="task-detail">
              <div className="task-detail-header">
                <h3 className="task-detail-title">{selectedTask.Title}</h3>
                
                {canCompleteTask(selectedTask) && !selectedTask.Completed && (
                  <button 
                    className="complete-task-button"
                    onClick={() => handleCompleteTask(selectedTask.Id)}
                  >
                    <CheckCircle2 size={16} />
                    <span>Mark Complete</span>
                  </button>
                )}
              </div>
              
              {selectedTask.Description && (
                <div className="task-detail-description">
                  <p>{selectedTask.Description}</p>
                </div>
              )}
              
              <div className="task-detail-meta">
                <div className="task-meta-item">
                  <span className="meta-label">Status:</span>
                  <span className={`task-status ${selectedTask.Status.toLowerCase().replace(' ', '-')}`}>
                    {selectedTask.Status}
                  </span>
                </div>
                
                <div className="task-meta-item">
                  <span className="meta-label">Priority:</span>
                  <span className={`task-priority ${selectedTask.Priority.toLowerCase()}`}>
                    {selectedTask.Priority}
                  </span>
                </div>
                
                {selectedTask.Deadline && (
                  <div className="task-meta-item">
                    <span className="meta-label">Deadline:</span>
                    <div className={`task-deadline ${isPast(new Date(selectedTask.Deadline)) && !selectedTask.Completed ? 'overdue' : ''}`}>
                      <Calendar size={14} />
                      <span>{format(new Date(selectedTask.Deadline), 'MMM d, yyyy')}</span>
                    </div>
                  </div>
                )}
                
                {selectedTask.UserId && (
                  <div className="task-meta-item">
                    <span className="meta-label">Assigned To:</span>
                    <div className="task-assignee">
                      <User size={14} />
                      <span>{getUserName(selectedTask.UserId)}</span>
                    </div>
                  </div>
                )}
              </div>
              
              <div className="task-attachments">
                <div className="attachment-header">
                  <h4>
                    <Paperclip size={16} />
                    <span>Attachments</span>
                  </h4>
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    style={{ display: 'none' }}
                    onChange={handleFileUpload}
                  />
                  
                  <button 
                    className="upload-button"
                    onClick={() => fileInputRef.current.click()}
                    disabled={uploading}
                  >
                    <Plus size={14} />
                    <span>{uploading ? 'Uploading...' : 'Add File'}</span>
                  </button>
                </div>
                
                {loadingAttachments ? (
                  <div className="attachment-loading">Loading attachments...</div>
                ) : attachments.length === 0 ? (
                  <div className="no-attachments">No attachments yet</div>
                ) : (
                  <ul className="attachment-list">
                    {attachments.map((file) => (
                      <li key={file.Id} className="attachment-item">
                        <div className="attachment-icon">
                          <Paperclip size={14} />
                        </div>
                        
                        <div className="attachment-info">
                          <span className="attachment-name">{file.FileName}</span>
                          <span className="attachment-size">{formatFileSize(file.FileSize || 0)}</span>
                        </div>
                        
                        <a 
                          href={file.Url || `${process.env.NEXT_PUBLIC_API_URL}/tasks/${selectedTask.Id}/attachments/${file.Id}`}
                          download
                          className="attachment-download"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          Download
                        </a>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          ) : (
            <div className="task-list">
              {tasks.map((task) => (
                <div 
                  key={task.Id} 
                  className={`task-card ${task.Completed ? 'completed' : ''}`}
                  onClick={() => setSelectedTask(task)}
                >
                  <div className="task-status-indicator">
                    <div className={`task-priority-dot priority-${task.Priority.toLowerCase()}`}></div>
                    <div className={`task-status-dot status-${task.Status.toLowerCase().replace(' ', '-')}`}></div>
                  </div>
                  
                  <div className="task-content">
                    <h4 className="task-title">{task.Title}</h4>
                    
                    {task.Description && (
                      <p className="task-description">{task.Description}</p>
                    )}
                    
                    <div className="task-card-meta">
                      {task.Deadline && (
                        <div className={`task-deadline ${isPast(new Date(task.Deadline)) && !task.Completed ? 'overdue' : ''}`}>
                          <Clock size={14} />
                          <span>
                            {isToday(new Date(task.Deadline)) ? 'Due today' : 
                             format(new Date(task.Deadline), 'MMM d, yyyy')}
                          </span>
                        </div>
                      )}
                      
                      {task.UserId && (
                        <div className="task-assignee">
                          <User size={14} />
                          <span>{getUserName(task.UserId)}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {canCompleteTask(task) && !task.Completed && (
                    <button
                      className="task-complete-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleCompleteTask(task.Id);
                      }}
                    >
                      <CheckCircle2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
      
      {/* Members Tab */}
      {activeTab === 'members' && (
        <div className="team-members">
          <div className="team-section-header">
            <h3>Team Members</h3>
            
            {isOwner && (
              <button 
                className="add-member-button"
                onClick={() => setAddingMember(!addingMember)}
              >
                <UserPlus size={16} />
                <span>{addingMember ? 'Cancel' : 'Add Member'}</span>
              </button>
            )}
          </div>
          
          {/* Add member form */}
          {addingMember && (
            <div className="add-member-form">
              <div className="form-group">
                <label htmlFor="member">Select Member</label>
                <select
                  id="member"
                  value={newMember}
                  onChange={(e) => setNewMember(e.target.value)}
                >
                  <option value="">Select a member...</option>
                  {getAvailableMembers().map((member) => (
                    <option key={member.UserId} value={member.UserId}>
                      {member.User?.FirstName 
                        ? `${member.User.FirstName} ${member.User.LastName || ''}` 
                        : `User ${member.UserId.substring(0, 8)}...`}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <input
                  type="text"
                  id="role"
                  value={newMemberRole}
                  onChange={(e) => setNewMemberRole(e.target.value)}
                  placeholder="e.g. Developer, Designer"
                />
              </div>
              
              <div className="form-checkbox">
                <input
                  type="checkbox"
                  id="isLeader"
                  checked={newMemberIsLeader}
                  onChange={(e) => setNewMemberIsLeader(e.target.checked)}
                />
                <label htmlFor="isLeader">Team Leader</label>
              </div>
              
              <button 
                className="add-button"
                onClick={handleAddMember}
                disabled={!newMember}
              >
                Add to Team
              </button>
            </div>
          )}
          
          {members.length === 0 ? (
            <div className="empty-state">
              <div className="empty-icon">
                <Users size={40} />
              </div>
              <h2>No Team Members</h2>
              <p>This team doesn't have any members yet.</p>
              {isOwner && (
                <button 
                  className="add-first-button"
                  onClick={() => setAddingMember(true)}
                >
                  <UserPlus size={16} />
                  <span>Add First Member</span>
                </button>
              )}
            </div>
          ) : (
            <div className="member-list">
              {members.map((member) => (
                <div key={member.UserId} className="member-card">
                  <div className="member-avatar">
                    <User size={20} />
                  </div>
                  
                  <div className="member-content">
                    <div className="member-header">
                      <h4 className="member-name">{getUserName(member.UserId)}</h4>
                      
                      {isTeamLeader(member.UserId) && (
                        <div className="member-badge leader">Team Leader</div>
                      )}
                    </div>
                    
                    {member.Role && (
                      <p className="member-role">{member.Role}</p>
                    )}
                  </div>
                  
                  {isOwner && (
                    <button 
                      className="remove-member-button"
                      onClick={() => handleRemoveMember(member.UserId)}
                    >
                      <Trash2 size={16} />
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}