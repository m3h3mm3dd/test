import React, { useState, useEffect } from 'react';
import { Plus, Search, User, Users, UserPlus, MoreHorizontal, X, ChevronRight } from 'lucide-react';

const TeamMemberItem = ({ member }) => {
  return (
    <div className="flex items-center p-3 hover:bg-gray-50 dark:hover:bg-gray-750 rounded-lg">
      <div className="w-10 h-10 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center font-semibold">
        {member.avatar || member.name.charAt(0)}
      </div>
      <div className="ml-3 flex-1">
        <div className="text-sm font-medium">{member.name}</div>
        <div className="text-xs text-gray-500 dark:text-gray-400">{member.role}</div>
      </div>
      <div className="text-xs px-2 py-1 bg-gray-100 dark:bg-gray-700 rounded-full text-gray-600 dark:text-gray-300">
        {member.joinedDate}
      </div>
      <button className="ml-2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200">
        <MoreHorizontal size={16} />
      </button>
    </div>
  );
};

const TeamCard = ({ team, onSelect }) => {
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 hover:shadow-md transition-shadow duration-200 animate-fade-in">
      <div className="flex items-start justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
            {team.name.charAt(0)}
          </div>
          <div className="ml-3">
            <h3 className="text-lg font-semibold">{team.name}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">{team.projectName}</div>
          </div>
        </div>
        <button 
          onClick={() => onSelect(team)}
          className="text-blue-500 hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
        >
          <ChevronRight size={20} />
        </button>
      </div>
      
      <p className="mt-4 text-sm text-gray-600 dark:text-gray-300 line-clamp-2">
        {team.description}
      </p>
      
      <div className="mt-5 flex items-center justify-between">
        <div className="flex -space-x-2">
          {team.members.slice(0, 3).map((member, index) => (
            <div 
              key={index} 
              className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium overflow-hidden"
            >
              {member.avatar ? (
                <img src={member.avatar} alt={member.name} className="w-full h-full object-cover" />
              ) : (
                member.name.charAt(0)
              )}
            </div>
          ))}
          {team.members.length > 3 && (
            <div className="w-8 h-8 rounded-full bg-gray-100 dark:bg-gray-700 border-2 border-white dark:border-gray-800 flex items-center justify-center text-xs font-medium">
              +{team.members.length - 3}
            </div>
          )}
        </div>
        <div className="text-sm text-gray-500 dark:text-gray-400">
          Created {team.createdDate}
        </div>
      </div>
    </div>
  );
};

const TeamDetail = ({ team, onClose }) => {
  const [activeTab, setActiveTab] = useState('members');
  
  return (
    <div className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl animate-fade-in overflow-hidden">
      {/* Header */}
      <div className="p-5 border-b border-gray-200 dark:border-gray-700 flex items-center justify-between">
        <div className="flex items-center">
          <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-500 to-purple-600 text-white flex items-center justify-center font-bold text-xl">
            {team.name.charAt(0)}
          </div>
          <div className="ml-3">
            <h3 className="text-xl font-semibold">{team.name}</h3>
            <div className="text-sm text-gray-500 dark:text-gray-400">{team.projectName}</div>
          </div>
        </div>
        <button 
          onClick={onClose}
          className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 rounded-full p-1 hover:bg-gray-100 dark:hover:bg-gray-700"
        >
          <X size={20} />
        </button>
      </div>
      
      {/* Tabs */}
      <div className="border-b border-gray-200 dark:border-gray-700">
        <div className="flex px-5">
          {[
            { id: 'members', label: 'Members' },
            { id: 'tasks', label: 'Tasks' },
            { id: 'settings', label: 'Settings' }
          ].map(tab => (
            <button
              key={tab.id}
              className={`py-4 px-4 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Content */}
      <div className="p-5">
        {activeTab === 'members' && (
          <div className="space-y-1">
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium">Team Members ({team.members.length})</h4>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center text-sm shadow-sm transition-colors">
                <UserPlus size={16} className="mr-1.5" />
                <span>Add Member</span>
              </button>
            </div>
            {team.members.map(member => (
              <TeamMemberItem key={member.id} member={member} />
            ))}
          </div>
        )}
        
        {activeTab === 'tasks' && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h4 className="text-lg font-medium">Team Tasks ({team.tasks?.length || 0})</h4>
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1.5 rounded-lg flex items-center text-sm shadow-sm transition-colors">
                <Plus size={16} className="mr-1.5" />
                <span>Add Task</span>
              </button>
            </div>
            {team.tasks && team.tasks.length > 0 ? (
              <div className="space-y-2">
                {team.tasks.map(task => (
                  <div key={task.id} className="border border-gray-200 dark:border-gray-700 rounded-lg p-3 hover:bg-gray-50 dark:hover:bg-gray-750">
                    <div className="font-medium">{task.title}</div>
                    <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">{task.status}</div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Users size={48} className="mx-auto mb-3 opacity-50" />
                <p>No tasks assigned to this team yet</p>
                <button className="mt-3 text-blue-500 font-medium">Assign a task</button>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'settings' && (
          <div>
            <h4 className="text-lg font-medium mb-4">Team Settings</h4>
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="block text-sm font-medium">Team Name</label>
                <input 
                  type="text" 
                  value={team.name} 
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
              <div className="space-y-2">
                <label className="block text-sm font-medium">Description</label>
                <textarea 
                  value={team.description} 
                  rows={3}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                ></textarea>
              </div>
              <div className="pt-4 flex space-x-3">
                <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg font-medium shadow-sm transition-colors">
                  Save Changes
                </button>
                <button className="text-red-500 hover:text-red-600 px-4 py-2 rounded-lg font-medium transition-colors">
                  Delete Team
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

const CreateTeamModal = ({ isOpen, onClose }) => {
  const [teamName, setTeamName] = useState('');
  const [description, setDescription] = useState('');
  const [selectedProject, setSelectedProject] = useState('');
  
  // Mock projects data
  const projects = [
    { id: '1', name: 'Website Redesign' },
    { id: '2', name: 'Mobile App Development' },
    { id: '3', name: 'Marketing Campaign' },
  ];
  
  if (!isOpen) return null;
  
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg p-6 w-full max-w-md">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-semibold">Create New Team</h3>
          <button 
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X size={20} />
          </button>
        </div>
        
        <div className="space-y-4">
          <div className="space-y-2">
            <label className="block text-sm font-medium">Team Name</label>
            <input 
              type="text" 
              value={teamName} 
              onChange={(e) => setTeamName(e.target.value)}
              placeholder="Enter team name"
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
            />
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Project</label>
            <select 
              value={selectedProject} 
              onChange={(e) => setSelectedProject(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
            >
              <option value="">Select a project</option>
              {projects.map(project => (
                <option key={project.id} value={project.id}>{project.name}</option>
              ))}
            </select>
          </div>
          
          <div className="space-y-2">
            <label className="block text-sm font-medium">Description</label>
            <textarea 
              value={description} 
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describe the team's purpose and goals"
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
            ></textarea>
          </div>
        </div>
        
        <div className="mt-6 flex space-x-3 justify-end">
          <button 
            onClick={onClose}
            className="px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700"
          >
            Cancel
          </button>
          <button 
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={!teamName || !selectedProject}
          >
            Create Team
          </button>
        </div>
      </div>
    </div>
  );
};

const Teams = () => {
  const [teams, setTeams] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  
  // Mock data loading
  useEffect(() => {
    setTimeout(() => {
      setTeams([
        {
          id: '1',
          name: 'Design Team',
          projectName: 'Website Redesign',
          description: 'Responsible for UI/UX design, visual elements, and overall user experience of the website.',
          createdDate: 'Apr 2, 2025',
          members: [
            { id: '1', name: 'John Doe', role: 'Team Lead', joinedDate: 'Apr 2, 2025' },
            { id: '2', name: 'Sarah Miller', role: 'UI Designer', joinedDate: 'Apr 3, 2025' },
            { id: '3', name: 'Michael Chen', role: 'UX Researcher', joinedDate: 'Apr 5, 2025' },
            { id: '4', name: 'Emily Wong', role: 'Graphic Designer', joinedDate: 'Apr 7, 2025' }
          ],
          tasks: [
            { id: '1', title: 'Design homepage mockup', status: 'In Progress' },
            { id: '2', title: 'Create design system', status: 'Not Started' }
          ]
        },
        {
          id: '2',
          name: 'Development Team',
          projectName: 'Mobile App Development',
          description: 'Frontend and backend developers working on the mobile application architecture, features, and performance.',
          createdDate: 'Apr 3, 2025',
          members: [
            { id: '5', name: 'Alex Johnson', role: 'Tech Lead', joinedDate: 'Apr 3, 2025' },
            { id: '6', name: 'Lisa Park', role: 'Frontend Developer', joinedDate: 'Apr 4, 2025' },
            { id: '7', name: 'David Garcia', role: 'Backend Developer', joinedDate: 'Apr 4, 2025' },
            { id: '8', name: 'Olivia Kim', role: 'Mobile Developer', joinedDate: 'Apr 5, 2025' },
            { id: '9', name: 'Ryan Martinez', role: 'QA Engineer', joinedDate: 'Apr 6, 2025' }
          ],
          tasks: [
            { id: '3', title: 'Implement authentication', status: 'In Progress' },
            { id: '4', title: 'Optimize database queries', status: 'In Progress' }
          ]
        },
        {
          id: '3',
          name: 'Marketing Team',
          projectName: 'Marketing Campaign',
          description: 'Responsible for planning and executing marketing strategies, content creation, and campaign analytics.',
          createdDate: 'Apr 5, 2025',
          members: [
            { id: '10', name: 'Jessica Lee', role: 'Marketing Manager', joinedDate: 'Apr 5, 2025' },
            { id: '11', name: 'Brian Wilson', role: 'Content Creator', joinedDate: 'Apr 6, 2025' },
            { id: '12', name: 'Amanda Taylor', role: 'Social Media Specialist', joinedDate: 'Apr 7, 2025' }
          ],
          tasks: [
            { id: '5', title: 'Create content for social media', status: 'Completed' }
          ]
        }
      ]);
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const filteredTeams = teams.filter(team => 
    team.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
    team.projectName.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  const handleSelectTeam = (team) => {
    setSelectedTeam(team);
  };
  
  const handleCloseTeamDetail = () => {
    setSelectedTeam(null);
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Teams</h1>
          <button 
            onClick={() => setShowCreateModal(true)}
            className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors"
          >
            <Plus size={18} className="mr-2" />
            <span>New Team</span>
          </button>
        </div>
        
        {/* Search */}
        <div className="mt-6 relative">
          <input
            type="text"
            placeholder="Search teams by name or project..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
          />
          <div className="absolute left-3 top-2.5 text-gray-400">
            <Search size={18} />
          </div>
        </div>
      </div>
      
      {/* Team List and Detail View */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Team List */}
        <div className={`${selectedTeam ? 'hidden lg:block' : ''} lg:col-span-${selectedTeam ? '1' : '3'}`}>
          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(3)].map((_, index) => (
                <div key={index} className="bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-xl p-5 animate-pulse">
                  <div className="flex items-center">
                    <div className="w-12 h-12 rounded-xl bg-gray-200 dark:bg-gray-700"></div>
                    <div className="ml-3 flex-1">
                      <div className="h-5 bg-gray-200 dark:bg-gray-700 rounded w-3/4"></div>
                      <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/2 mt-2"></div>
                    </div>
                  </div>
                  <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded mt-4"></div>
                  <div className="mt-5 flex items-center justify-between">
                    <div className="flex space-x-1">
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                      <div className="w-8 h-8 rounded-full bg-gray-200 dark:bg-gray-700"></div>
                    </div>
                    <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4"></div>
                  </div>
                </div>
              ))}
            </div>
          ) : filteredTeams.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTeams.map(team => (
                <TeamCard key={team.id} team={team} onSelect={handleSelectTeam} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-white dark:bg-gray-800 rounded-xl border border-gray-200 dark:border-gray-700">
              <Users size={64} className="mx-auto mb-4 text-gray-400" />
              <h3 className="text-xl font-medium">No teams found</h3>
              <p className="text-gray-500 dark:text-gray-400 mt-2">
                {searchQuery ? 'Try a different search term' : 'Create your first team to get started'}
              </p>
              <button 
                onClick={() => setShowCreateModal(true)}
                className="mt-4 bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg inline-flex items-center shadow-sm transition-colors"
              >
                <Plus size={18} className="mr-2" />
                <span>New Team</span>
              </button>
            </div>
          )}
        </div>
        
        {/* Team Detail */}
        {selectedTeam && (
          <div className="lg:col-span-2">
            <TeamDetail team={selectedTeam} onClose={handleCloseTeamDetail} />
          </div>
        )}
      </div>
      
      {/* Create Team Modal */}
      <CreateTeamModal isOpen={showCreateModal} onClose={() => setShowCreateModal(false)} />
    </div>
  );
};

export default Teams;