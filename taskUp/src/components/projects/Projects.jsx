import React, { useState } from 'react';
import { Plus, Search, Filter, MoreHorizontal, Briefcase } from 'lucide-react';

const ProjectCard = ({ project, index }) => {
  const { name, progress, deadline, status, description, teams } = project;
  
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Completed': 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'On Hold': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Not Started': 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  return (
    <div 
      className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden border border-gray-100 dark:border-gray-700 hover:shadow-md transition-shadow duration-200 animate-fade-in"
      style={{ animationDelay: `${index * 50}ms` }}
    >
      <div className="p-5">
        <div className="flex justify-between items-start">
          <h3 className="font-semibold text-lg">{name}</h3>
          <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(status)}`}>
            {status}
          </span>
        </div>
        
        <p className="text-gray-500 dark:text-gray-400 text-sm mt-2 h-10 overflow-hidden">
          {description}
        </p>
        
        <div className="flex items-center justify-between mt-4">
          <div className="text-xs text-gray-500 dark:text-gray-400">
            Due {new Date(deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
          </div>
          <div className="text-xs font-medium">
            {progress}% Complete
          </div>
        </div>
        
        <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mt-2">
          <div 
            className="bg-blue-500 h-1.5 rounded-full animate-grow-width" 
            style={{ width: `${progress}%`, animationDelay: `${(index * 100) + 300}ms` }}
          ></div>
        </div>
        
        <div className="flex items-center justify-between mt-4">
          <div className="flex items-center space-x-4">
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">{teams} teams</span>
            </div>
            <div className="flex items-center">
              <svg className="w-4 h-4 text-gray-500 dark:text-gray-400 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" />
              </svg>
              <span className="text-xs text-gray-500 dark:text-gray-400">{project.tasks || 0} tasks</span>
            </div>
          </div>
          
          <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300 transition-colors">
            <MoreHorizontal size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

const Projects = () => {
  const [selectedTab, setSelectedTab] = useState('all');
  const [viewType, setViewType] = useState('grid'); // 'grid' or 'list'
  
  const projects = [
    {
      id: '1',
      name: 'Website Redesign',
      description: 'Completely revamp the company website with modern design principles and improved UX.',
      progress: 65,
      deadline: '2025-05-15',
      status: 'In Progress',
      teams: 2,
      tasks: 12
    },
    {
      id: '2',
      name: 'Mobile App Development',
      description: 'Create native iOS and Android applications with core functionality from our web platform.',
      progress: 30,
      deadline: '2025-06-30',
      status: 'In Progress',
      teams: 3,
      tasks: 24
    },
    {
      id: '3',
      name: 'Marketing Campaign',
      description: 'Launch Q2 marketing campaign across digital and traditional channels to increase brand awareness.',
      progress: 85,
      deadline: '2025-04-20',
      status: 'In Progress',
      teams: 1,
      tasks: 8
    },
    {
      id: '4',
      name: 'Product Launch',
      description: 'Coordinate the launch of our new flagship product including PR, marketing, and sales training.',
      progress: 40,
      deadline: '2025-07-10',
      status: 'Not Started',
      teams: 4,
      tasks: 16
    },
    {
      id: '5',
      name: 'Office Relocation',
      description: 'Plan and execute the move to our new headquarters with minimal disruption to operations.',
      progress: 100,
      deadline: '2025-03-01',
      status: 'Completed',
      teams: 2,
      tasks: 20
    },
    {
      id: '6',
      name: 'Sales Training Program',
      description: 'Develop and implement a comprehensive training program for the sales team on new products.',
      progress: 55,
      deadline: '2025-05-20',
      status: 'In Progress',
      teams: 2,
      tasks: 15
    }
  ];
  
  const tabs = [
    { id: 'all', label: 'All Projects' },
    { id: 'ongoing', label: 'In Progress' },
    { id: 'completed', label: 'Completed' },
    { id: 'draft', label: 'Not Started' }
  ];
  
  const filteredProjects = projects.filter(project => {
    if (selectedTab === 'all') return true;
    if (selectedTab === 'ongoing') return project.status === 'In Progress';
    if (selectedTab === 'completed') return project.status === 'Completed';
    if (selectedTab === 'draft') return project.status === 'Not Started';
    return true;
  });
  
  // Define getStatusColor function for the list view
  const getStatusColor = (status) => {
    switch(status) {
      case 'In Progress': 
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200';
      case 'Completed': 
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200';
      case 'On Hold': 
        return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200';
      case 'Not Started': 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
      default: 
        return 'bg-gray-100 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
    }
  };
  
  return (
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <h1 className="text-2xl font-bold">Projects</h1>
          <button className="bg-blue-500 hover:bg-blue-600 text-white px-4 py-2 rounded-lg flex items-center shadow-sm transition-colors">
            <Plus size={18} className="mr-2" />
            <span>New Project</span>
          </button>
        </div>
        
        {/* Search and Filters */}
        <div className="mt-6 flex flex-col md:flex-row space-y-4 md:space-y-0 md:space-x-4">
          <div className="relative flex-grow">
            <input
              type="text"
              placeholder="Search projects..."
              className="w-full pl-10 pr-4 py-2 rounded-lg bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 text-gray-900 dark:text-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 focus:outline-none transition-all"
            />
            <div className="absolute left-3 top-2.5 text-gray-400">
              <Search size={18} />
            </div>
          </div>
          <div className="flex space-x-4">
            <button className="px-4 py-2 bg-white dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg flex items-center text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-750">
              <Filter size={18} className="mr-2" />
              <span>Filter</span>
            </button>
            <div className="flex rounded-lg overflow-hidden border border-gray-200 dark:border-gray-700">
              <button 
                onClick={() => setViewType('grid')} 
                className={`px-3 py-2 ${viewType === 'grid' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
                </svg>
              </button>
              <button 
                onClick={() => setViewType('list')} 
                className={`px-3 py-2 ${viewType === 'list' ? 'bg-blue-500 text-white' : 'bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300'}`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
              </button>
            </div>
          </div>
        </div>
        
        {/* Tabs */}
        <div className="mt-6 border-b border-gray-200 dark:border-gray-700">
          <div className="flex space-x-8">
            {tabs.map(tab => (
              <button
                key={tab.id}
                onClick={() => setSelectedTab(tab.id)}
                className={`py-4 px-2 font-medium text-sm whitespace-nowrap border-b-2 transition-colors ${
                  selectedTab === tab.id
                    ? 'border-blue-500 text-blue-500 dark:text-blue-400'
                    : 'border-transparent text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>
      
      {/* Project List */}
      {filteredProjects.length > 0 ? (
        viewType === 'grid' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredProjects.map((project, index) => (
              <ProjectCard key={project.id} project={project} index={index} />
            ))}
          </div>
        ) : (
          <div className="bg-white dark:bg-gray-800 rounded-xl shadow-sm overflow-hidden">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-750 text-left text-xs font-semibold text-gray-500 dark:text-gray-400 uppercase tracking-wider">
                  <th className="px-6 py-3">Project</th>
                  <th className="px-6 py-3">Status</th>
                  <th className="px-6 py-3">Progress</th>
                  <th className="px-6 py-3">Deadline</th>
                  <th className="px-6 py-3">Teams</th>
                  <th className="px-6 py-3">Tasks</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {filteredProjects.map((project, index) => (
                  <tr 
                    key={project.id} 
                    className="hover:bg-gray-50 dark:hover:bg-gray-750 animate-fade-in"
                    style={{ animationDelay: `${index * 50}ms` }}
                  >
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="flex-shrink-0 h-10 w-10 rounded-lg bg-blue-100 dark:bg-blue-900 flex items-center justify-center text-blue-600 dark:text-blue-400">
                          <Briefcase size={20} />
                        </div>
                        <div className="ml-4">
                          <div className="font-medium text-gray-900 dark:text-white">{project.name}</div>
                          <div className="text-sm text-gray-500 dark:text-gray-400 truncate max-w-xs">{project.description}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(project.status)}`}>
                        {project.status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center">
                        <div className="w-24 bg-gray-200 dark:bg-gray-700 rounded-full h-1.5 mr-2">
                          <div className="bg-blue-500 h-1.5 rounded-full" style={{ width: `${project.progress}%` }}></div>
                        </div>
                        <span className="text-xs text-gray-500 dark:text-gray-400">{project.progress}%</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {new Date(project.deadline).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {project.teams}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 dark:text-gray-400">
                      {project.tasks}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button className="text-gray-400 hover:text-gray-600 dark:hover:text-gray-300">
                        <MoreHorizontal size={18} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )
      ) : (
        <div className="flex flex-col items-center justify-center py-12 text-center bg-white dark:bg-gray-800 rounded-xl shadow-sm animate-fade-in">
          <div className="w-16 h-16 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-4">
            <Briefcase className="text-gray-400" size={32} />
          </div>
          <h3 className="text-lg font-medium">No projects found</h3>
          <p className="text-gray-500 dark:text-gray-400 mt-1 max-w-md">
            {selectedTab === 'all' 
              ? "You don't have any projects yet." 
              : `You don't have any ${selectedTab === 'ongoing' ? 'in progress' : selectedTab} projects.`}
          </p>
          <button className="mt-4 px-4 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium hover:bg-blue-600 transition-colors">
            Create a project
          </button>
        </div>
      )}
    </div>
  );
};

export default Projects;