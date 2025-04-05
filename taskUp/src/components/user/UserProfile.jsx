import React, { useState, useEffect } from 'react';
import { User, Mail, Key, LogOut, Camera, Bell, Lock, List, Calendar, Clock } from 'lucide-react';

const ProfileSection = ({ children }) => (
  <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 p-6 mb-6">
    {children}
  </div>
);

const SectionHeader = ({ title, description }) => (
  <div className="mb-6">
    <h2 className="text-xl font-semibold">{title}</h2>
    {description && <p className="text-gray-500 dark:text-gray-400 mt-1">{description}</p>}
  </div>
);

const UserProfile = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const [isLoading, setIsLoading] = useState(true);
  const [user, setUser] = useState(null);
  
  useEffect(() => {
    // Mock fetching user data
    setTimeout(() => {
      setUser({
        id: '1',
        firstName: 'John',
        lastName: 'Doe',
        email: 'john.doe@example.com',
        imageUrl: null,
        lastLogin: '2025-04-02T14:30:00Z',
        createdAt: '2024-12-15T09:00:00Z',
        role: 'Project Manager',
        projects: [
          { id: '1', name: 'Website Redesign', role: 'Owner' },
          { id: '2', name: 'Mobile App Development', role: 'Member' }
        ],
        teams: [
          { id: '1', name: 'Design Team', role: 'Lead' },
          { id: '2', name: 'Marketing Team', role: 'Member' }
        ],
        activities: [
          { id: '1', type: 'task_completed', content: 'Completed "Design homepage mockup"', time: '1 day ago' },
          { id: '2', type: 'comment_added', content: 'Added a comment on "Mobile App Development"', time: '2 days ago' },
          { id: '3', type: 'project_created', content: 'Created project "Website Redesign"', time: '1 week ago' }
        ]
      });
      setIsLoading(false);
    }, 1000);
  }, []);
  
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', { month: 'long', day: 'numeric', year: 'numeric' });
  };
  
  const formatTime = (dateString) => {
    const date = new Date(dateString);
    return date.toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' });
  };
  
  const getActivityIcon = (type) => {
    switch (type) {
      case 'task_completed':
        return <div className="p-2 bg-green-100 dark:bg-green-900/20 text-green-600 dark:text-green-400 rounded-full"><CheckSquare size={16} /></div>;
      case 'comment_added':
        return <div className="p-2 bg-blue-100 dark:bg-blue-900/20 text-blue-600 dark:text-blue-400 rounded-full"><MessageSquare size={16} /></div>;
      case 'project_created':
        return <div className="p-2 bg-purple-100 dark:bg-purple-900/20 text-purple-600 dark:text-purple-400 rounded-full"><Briefcase size={16} /></div>;
      default:
        return <div className="p-2 bg-gray-100 dark:bg-gray-700 text-gray-600 dark:text-gray-400 rounded-full"><Activity size={16} /></div>;
    }
  };
  
  if (isLoading) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="animate-pulse">
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="flex items-center">
              <div className="w-24 h-24 bg-gray-200 dark:bg-gray-700 rounded-full mr-6"></div>
              <div className="flex-1">
                <div className="h-8 bg-gray-200 dark:bg-gray-700 rounded w-1/3 mb-2"></div>
                <div className="h-4 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-4"></div>
                <div className="h-10 bg-gray-200 dark:bg-gray-700 rounded w-1/2"></div>
              </div>
            </div>
          </div>
          
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm p-6 mb-6">
            <div className="h-6 bg-gray-200 dark:bg-gray-700 rounded w-1/4 mb-6"></div>
            <div className="space-y-4">
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
              <div className="h-12 bg-gray-200 dark:bg-gray-700 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="p-6 max-w-4xl mx-auto">
        <div className="text-center py-12 bg-white dark:bg-gray-800 rounded-xl shadow-sm">
          <User size={64} className="mx-auto mb-4 text-gray-400" />
          <h3 className="text-xl font-medium">User not found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-2">
            The requested user profile could not be loaded
          </p>
        </div>
      </div>
    );
  }
  
  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* Profile Header */}
      <ProfileSection>
        <div className="flex flex-col md:flex-row items-center md:items-start">
          <div className="relative mb-4 md:mb-0 md:mr-6">
            <div className="w-24 h-24 rounded-full bg-blue-100 dark:bg-blue-900 text-blue-600 dark:text-blue-300 flex items-center justify-center text-3xl font-bold">
              {user.firstName[0]}{user.lastName[0]}
            </div>
            <button className="absolute bottom-0 right-0 bg-blue-500 text-white p-2 rounded-full hover:bg-blue-600 transition-colors">
              <Camera size={14} />
            </button>
          </div>
          
          <div className="flex-1 text-center md:text-left">
            <h1 className="text-2xl font-bold">{user.firstName} {user.lastName}</h1>
            <p className="text-gray-600 dark:text-gray-400">{user.role}</p>
            
            <div className="mt-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
                Edit Profile
              </button>
            </div>
          </div>
          
          <div className="hidden md:block text-right space-y-1 text-sm">
            <div className="flex items-center justify-end text-gray-500 dark:text-gray-400">
              <Clock size={14} className="mr-1" />
              <span>Last login: {formatDate(user.lastLogin)} at {formatTime(user.lastLogin)}</span>
            </div>
            <div className="flex items-center justify-end text-gray-500 dark:text-gray-400">
              <Calendar size={14} className="mr-1" />
              <span>Member since: {formatDate(user.createdAt)}</span>
            </div>
          </div>
        </div>
      </ProfileSection>
      
      {/* Profile Tabs */}
      <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm border border-gray-200 dark:border-gray-700 mb-6">
        <div className="flex overflow-x-auto">
          {[
            { id: 'profile', label: 'Profile', icon: User },
            { id: 'security', label: 'Security', icon: Lock },
            { id: 'notifications', label: 'Notifications', icon: Bell },
            { id: 'activity', label: 'Activity', icon: List }
          ].map(tab => (
            <button
              key={tab.id}
              className={`flex items-center px-6 py-4 font-medium whitespace-nowrap border-b-2 transition-colors ${
                activeTab === tab.id
                  ? 'border-blue-500 text-blue-600 dark:text-blue-400'
                  : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
              }`}
              onClick={() => setActiveTab(tab.id)}
            >
              <tab.icon size={18} className="mr-2" />
              {tab.label}
            </button>
          ))}
        </div>
      </div>
      
      {/* Profile Tab Content */}
      {activeTab === 'profile' && (
        <>
          <ProfileSection>
            <SectionHeader title="Personal Information" description="Manage your personal information" />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <label className="block text-sm font-medium">First Name</label>
                <input 
                  type="text" 
                  value={user.firstName}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Last Name</label>
                <input 
                  type="text" 
                  value={user.lastName}
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Email Address</label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                    <Mail size={16} className="text-gray-400" />
                  </div>
                  <input 
                    type="email" 
                    value={user.email}
                    className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <label className="block text-sm font-medium">Role</label>
                <input 
                  type="text" 
                  value={user.role}
                  disabled
                  className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg bg-gray-50 dark:bg-gray-600 cursor-not-allowed"
                />
              </div>
            </div>
            
            <div className="mt-6 pt-4 border-t border-gray-200 dark:border-gray-700">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
                Save Changes
              </button>
            </div>
          </ProfileSection>
          
          <ProfileSection>
            <SectionHeader title="Projects" description="Projects you are involved in" />
            
            {user.projects.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {user.projects.map(project => (
                  <div key={project.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{project.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Role: {project.role}</div>
                    </div>
                    <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                      View Project
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <Briefcase size={48} className="mx-auto mb-3 opacity-50" />
                <p>You are not part of any projects yet</p>
              </div>
            )}
          </ProfileSection>
          
          <ProfileSection>
            <SectionHeader title="Teams" description="Teams you are a member of" />
            
            {user.teams.length > 0 ? (
              <div className="divide-y divide-gray-200 dark:divide-gray-700">
                {user.teams.map(team => (
                  <div key={team.id} className="py-4 flex items-center justify-between">
                    <div>
                      <div className="font-medium">{team.name}</div>
                      <div className="text-sm text-gray-500 dark:text-gray-400">Role: {team.role}</div>
                    </div>
                    <button className="text-blue-500 hover:text-blue-600 text-sm font-medium">
                      View Team
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 dark:text-gray-400">
                <User size={48} className="mx-auto mb-3 opacity-50" />
                <p>You are not part of any teams yet</p>
              </div>
            )}
          </ProfileSection>
        </>
      )}
      
      {/* Security Tab Content */}
      {activeTab === 'security' && (
        <ProfileSection>
          <SectionHeader title="Security Settings" description="Manage your password and security preferences" />
          
          <div className="space-y-6">
            <div className="space-y-2">
              <label className="block text-sm font-medium">Current Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  placeholder="Enter your current password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  placeholder="Enter new password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
              <p className="text-xs text-gray-500 mt-1">Password must be at least 8 characters long with 1 uppercase, 1 lowercase, and 1 number</p>
            </div>
            
            <div className="space-y-2">
              <label className="block text-sm font-medium">Confirm New Password</label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key size={16} className="text-gray-400" />
                </div>
                <input 
                  type="password" 
                  placeholder="Confirm new password"
                  className="w-full pl-10 pr-3 py-2 border border-gray-300 dark:border-gray-600 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700"
                />
              </div>
            </div>
            
            <div className="pt-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
                Update Password
              </button>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4">Two-Factor Authentication</h3>
              <div className="flex items-start">
                <div className="flex items-center h-5">
                  <input
                    id="2fa"
                    type="checkbox"
                    className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                  />
                </div>
                <div className="ml-3 text-sm">
                  <label htmlFor="2fa" className="font-medium">Enable Two-Factor Authentication</label>
                  <p className="text-gray-500 dark:text-gray-400">Add an extra layer of security to your account</p>
                </div>
              </div>
              <button className="mt-4 px-4 py-2 border border-gray-300 dark:border-gray-600 rounded-lg text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700">
                Configure 2FA
              </button>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6 mt-6">
              <h3 className="text-lg font-medium mb-4 text-red-600 dark:text-red-500">Danger Zone</h3>
              <p className="text-gray-500 dark:text-gray-400 mb-4">Once you delete your account, there is no going back. Please be certain.</p>
              <button className="px-4 py-2 border border-red-300 dark:border-red-800 text-red-600 dark:text-red-500 rounded-lg hover:bg-red-50 dark:hover:bg-red-900/20">
                Delete Account
              </button>
            </div>
          </div>
        </ProfileSection>
      )}
      
      {/* Notifications Tab Content */}
      {activeTab === 'notifications' && (
        <ProfileSection>
          <SectionHeader title="Notification Preferences" description="Configure how and when you receive notifications" />
          
          <div className="space-y-6">
            <div>
              <h3 className="font-medium mb-4">Email Notifications</h3>
              <div className="space-y-3">
                {[
                  { id: 'email_task', label: 'Task assignments and updates' },
                  { id: 'email_comments', label: 'Comments on your tasks' },
                  { id: 'email_project', label: 'Project updates' },
                  { id: 'email_team', label: 'Team changes' },
                  { id: 'email_digest', label: 'Weekly digest summary' }
                ].map(option => (
                  <div key={option.id} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={option.id}
                        type="checkbox"
                        defaultChecked={['email_task', 'email_comments', 'email_project'].includes(option.id)}
                        className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={option.id} className="font-medium">{option.label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="border-t border-gray-200 dark:border-gray-700 pt-6">
              <h3 className="font-medium mb-4">In-App Notifications</h3>
              <div className="space-y-3">
                {[
                  { id: 'inapp_task', label: 'Task assignments and updates' },
                  { id: 'inapp_comments', label: 'Comments on your tasks' },
                  { id: 'inapp_mentions', label: 'When someone mentions you' },
                  { id: 'inapp_deadline', label: 'Task deadline reminders' }
                ].map(option => (
                  <div key={option.id} className="flex items-start">
                    <div className="flex items-center h-5">
                      <input
                        id={option.id}
                        type="checkbox"
                        defaultChecked
                        className="w-4 h-4 border border-gray-300 dark:border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                    <div className="ml-3 text-sm">
                      <label htmlFor={option.id} className="font-medium">{option.label}</label>
                    </div>
                  </div>
                ))}
              </div>
            </div>
            
            <div className="pt-4">
              <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg shadow-sm transition-colors">
                Save Preferences
              </button>
            </div>
          </div>
        </ProfileSection>
      )}
      
      {/* Activity Tab Content */}
      {activeTab === 'activity' && (
        <ProfileSection>
          <SectionHeader title="Recent Activity" description="Your recent actions and updates" />
          
          {user.activities.length > 0 ? (
            <div className="space-y-6">
              {user.activities.map(activity => (
                <div key={activity.id} className="flex">
                  <div className="mr-4 flex-shrink-0">
                    {getActivityIcon(activity.type)}
                  </div>
                  <div>
                    <p className="text-gray-800 dark:text-gray-200">{activity.content}</p>
                    <p className="text-sm text-gray-500 dark:text-gray-400 mt-1">{activity.time}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8 text-gray-500 dark:text-gray-400">
              <List size={48} className="mx-auto mb-3 opacity-50" />
              <p>No recent activity to show</p>
            </div>
          )}
          
          <div className="mt-6 text-center">
            <button className="text-blue-500 hover:text-blue-600 font-medium">
              View All Activity
            </button>
          </div>
        </ProfileSection>
      )}
    </div>
  );
};

// Missing imports for activity icons
const CheckSquare = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="9 11 12 14 22 4"></polyline>
    <path d="M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11"></path>
  </svg>
);

const MessageSquare = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"></path>
  </svg>
);

const Briefcase = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <rect x="2" y="7" width="20" height="14" rx="2" ry="2"></rect>
    <path d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16"></path>
  </svg>
);

const Activity = ({ size, className }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}>
    <polyline points="22 12 18 12 15 21 9 3 6 12 2 12"></polyline>
  </svg>
);

export default UserProfile;