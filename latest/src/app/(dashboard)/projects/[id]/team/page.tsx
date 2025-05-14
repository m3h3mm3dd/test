'use client';

import { useState, useEffect, useMemo } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { 
  ArrowLeft, 
  Plus, 
  Search, 
  Users, 
  X, 
  User, 
  Settings, 
  MoreHorizontal,
  Trash2,
  Edit,
  AlertTriangle
} from 'lucide-react';
import { toast } from '@/lib/toast';

// API imports
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectTeams, deleteTeam } from '@/api/TeamAPI';
import { useUser } from '@/hooks/useUser';

// CSS for the page
import './teams.css';

// Team colors based on ColorIndex
const TEAM_COLORS = [
  { bg: 'var(--team-color-1)', text: 'var(--team-color-1-text)' },
  { bg: 'var(--team-color-2)', text: 'var(--team-color-2-text)' },
  { bg: 'var(--team-color-3)', text: 'var(--team-color-3-text)' },
  { bg: 'var(--team-color-4)', text: 'var(--team-color-4-text)' },
  { bg: 'var(--team-color-5)', text: 'var(--team-color-5-text)' },
  { bg: 'var(--team-color-6)', text: 'var(--team-color-6-text)' },
];

export default function ProjectTeamsPage() {
  const { id } = useParams();
  const router = useRouter();
  const { user } = useUser();
  
  // States
  const [project, setProject] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [isOwner, setIsOwner] = useState(false);
  const [menuOpen, setMenuOpen] = useState(null); // Track which team menu is open
  
  // Fetch project and teams data
  useEffect(() => {
    const loadData = async () => {
      try {
        setLoading(true);
        
        // Fetch project and teams in parallel
        const [projectData, teamsData] = await Promise.all([
          getProjectById(id),
          getProjectTeams(id)
        ]);
        
        setProject(projectData);
        setTeams(teamsData);
        
        // Check if current user is project owner
        setIsOwner(user?.Id === projectData.OwnerId);
      } catch (error) {
        console.error('Failed to load project teams:', error);
        toast.error('Could not load teams for this project');
      } finally {
        setLoading(false);
      }
    };
    
    if (id && user) {
      loadData();
    }
  }, [id, user]);
  
  // Filter teams based on search query
  const filteredTeams = useMemo(() => {
    if (!searchQuery.trim()) return teams;
    
    return teams.filter(team => 
      team.Name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (team.Description && team.Description.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [teams, searchQuery]);
  
  // Delete team handler
  const handleDeleteTeam = async (teamId) => {
    if (!confirm('Are you sure you want to delete this team?')) return;
    
    try {
      await deleteTeam(teamId);
      
      // Update local state
      setTeams(prevTeams => prevTeams.filter(team => team.Id !== teamId));
      
      toast.success('Team deleted successfully');
    } catch (error) {
      console.error('Failed to delete team:', error);
      toast.error('Could not delete team');
    }
  };
  
  // Get team color based on ColorIndex
  const getTeamColor = (colorIndex) => {
    const index = colorIndex % TEAM_COLORS.length;
    return TEAM_COLORS[index] || TEAM_COLORS[0];
  };
  
  // Get initials from team name
  const getTeamInitials = (name) => {
    if (!name) return '?';
    
    const words = name.split(' ');
    if (words.length === 1) {
      return name.substring(0, 2).toUpperCase();
    }
    
    return (words[0][0] + words[1][0]).toUpperCase();
  };
  
  return (
    <div className="project-teams-container">
      {/* Header */}
      <div className="project-teams-header">
        <div className="project-teams-title">
          <button 
            className="back-button" 
            onClick={() => router.push(`/projects/${id}`)}
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1>{project?.Name || 'Project'} Teams</h1>
            <p className="subtitle">
              Manage teams for this project
            </p>
          </div>
        </div>
        
        {isOwner && (
          <button 
            className="create-team-button"
            onClick={() => router.push(`/projects/${id}/team/create`)}
          >
            <Plus size={18} />
            <span>Create Team</span>
          </button>
        )}
      </div>
      
      {/* Search bar */}
      <div className="search-container">
        <div className="search-bar">
          <Search className="search-icon" />
          <input
            type="text"
            placeholder="Search teams..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
          />
          {searchQuery && (
            <button 
              className="clear-search" 
              onClick={() => setSearchQuery('')}
            >
              <X size={16} />
            </button>
          )}
        </div>
      </div>
      
      {/* Teams grid */}
      {loading ? (
        <div className="teams-grid">
          {Array.from({ length: 4 }).map((_, index) => (
            <div key={index} className="team-card-skeleton">
              <div className="team-avatar-skeleton"></div>
              <div className="team-content-skeleton">
                <div className="team-title-skeleton"></div>
                <div className="team-desc-skeleton"></div>
              </div>
            </div>
          ))}
        </div>
      ) : teams.length === 0 ? (
        <div className="modern-empty-state">
          <div className="empty-illustration">
            <div className="empty-icons">
              <div className="empty-icon icon-1">
                <Users size={28} />
              </div>
              <div className="empty-icon icon-2">
                <User size={24} />
              </div>
              <div className="empty-icon icon-3">
                <Settings size={20} />
              </div>
              <div className="empty-icon icon-4">
                <User size={22} />
              </div>
            </div>
            <div className="empty-circle"></div>
            <div className="empty-shadow"></div>
          </div>
          
          <div className="empty-content">
            <h2>Build Your Team</h2>
            <p>Teams help organize members and assign tasks efficiently.
            {isOwner 
              ? ' Create your first team to get started.' 
              : ' The project owner needs to create teams for this project.'}
            </p>
            
            {isOwner && (
              <button 
                className="empty-primary-button"
                onClick={() => router.push(`/projects/${id}/team/create`)}
              >
                <Plus size={16} />
                <span>Create First Team</span>
              </button>
            )}
          </div>
        </div>
      ) : filteredTeams.length === 0 ? (
        <div className="modern-empty-state">
          <div className="empty-illustration search-results">
            <div className="search-icon">
              <Search size={40} />
            </div>
            <div className="empty-circle"></div>
            <div className="empty-shadow"></div>
          </div>
          
          <div className="empty-content">
            <h2>No Matching Teams</h2>
            <p>No teams match your search criteria.</p>
            <button 
              className="empty-secondary-button"
              onClick={() => setSearchQuery('')}
            >
              Clear Search
            </button>
          </div>
        </div>
      ) : (
        <div className="teams-grid">
          {filteredTeams.map(team => {
            const teamColor = getTeamColor(team.ColorIndex);
            
            return (
              <div key={team.Id} className="team-card">
                <div 
                  className="team-avatar"
                  style={{ backgroundColor: teamColor.bg, color: teamColor.text }}
                  onClick={() => router.push(`/projects/${id}/team/${team.Id}`)}
                >
                  {getTeamInitials(team.Name)}
                </div>
                
                <div className="team-content" onClick={() => router.push(`/projects/${id}/team/${team.Id}`)}>
                  <h3 className="team-name">{team.Name}</h3>
                  {team.Description && (
                    <p className="team-description">{team.Description}</p>
                  )}
                </div>
                
                {isOwner && (
                  <div className="team-menu-container">
                    <button 
                      className="team-menu-button"
                      onClick={(e) => {
                        e.stopPropagation();
                        setMenuOpen(menuOpen === team.Id ? null : team.Id);
                      }}
                    >
                      <MoreHorizontal size={18} />
                    </button>
                    
                    {menuOpen === team.Id && (
                      <div className="team-menu">
                        <button 
                          className="team-menu-item"
                          onClick={(e) => {
                            e.stopPropagation();
                            router.push(`/projects/${id}/team/${team.Id}/edit`);
                          }}
                        >
                          <Edit size={14} />
                          <span>Edit Team</span>
                        </button>
                        
                        <button 
                          className="team-menu-item delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteTeam(team.Id);
                          }}
                        >
                          <Trash2 size={14} />
                          <span>Delete Team</span>
                        </button>
                      </div>
                    )}
                  </div>
                )}
                
                <div 
                  className="team-members-indicator"
                  onClick={() => router.push(`/projects/${id}/team/${team.Id}`)}
                >
                  <User size={14} />
                  <span>View Team</span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}