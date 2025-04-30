
import { generateId } from './helpers';

// Mock user data
export const mockUsers = [
  {
    id: 'user-1',
    email: 'john.doe@example.com',
    name: 'John Doe',
    avatar: 'https://randomuser.me/api/portraits/men/1.jpg',
    role: 'Project Manager',
    createdAt: '2023-01-15T08:30:00Z',
  },
  {
    id: 'user-2',
    email: 'emma.wilson@example.com',
    name: 'Emma Wilson',
    avatar: 'https://randomuser.me/api/portraits/women/2.jpg',
    role: 'Developer',
    createdAt: '2023-02-10T14:20:00Z',
  },
  {
    id: 'user-3',
    email: 'michael.brown@example.com',
    name: 'Michael Brown',
    avatar: 'https://randomuser.me/api/portraits/men/3.jpg',
    role: 'Designer',
    createdAt: '2023-01-20T11:45:00Z',
  },
  {
    id: 'user-4',
    email: 'sophia.martinez@example.com',
    name: 'Sophia Martinez',
    avatar: 'https://randomuser.me/api/portraits/women/4.jpg',
    role: 'Product Owner',
    createdAt: '2023-03-05T09:15:00Z',
  },
  {
    id: 'user-5',
    email: 'david.johnson@example.com',
    name: 'David Johnson',
    avatar: 'https://randomuser.me/api/portraits/men/5.jpg',
    role: 'QA Engineer',
    createdAt: '2023-02-25T16:30:00Z',
  },
];

// Mock project data
export const mockProjects = [
  {
    id: 'project-1',
    title: 'Mobile App Redesign',
    description: 'Redesign the mobile app interface for better user experience and modern design.',
    status: 'in-progress',
    progress: 65,
    startDate: '2023-01-20T00:00:00Z',
    endDate: '2023-05-15T00:00:00Z',
    owner: 'user-1',
    members: ['user-1', 'user-2', 'user-3'],
    tasks: ['task-1', 'task-2', 'task-5'],
    color: '#3D5AFE',
  },
  {
    id: 'project-2',
    title: 'Backend API Development',
    description: 'Develop RESTful API endpoints for the new product features.',
    status: 'in-progress',
    progress: 40,
    startDate: '2023-02-01T00:00:00Z',
    endDate: '2023-04-30T00:00:00Z',
    owner: 'user-4',
    members: ['user-2', 'user-4', 'user-5'],
    tasks: ['task-3', 'task-4'],
    color: '#00C853',
  },
  {
    id: 'project-3',
    title: 'Marketing Website Refresh',
    description: 'Update the marketing website with new content and design elements.',
    status: 'not-started',
    progress: 0,
    startDate: '2023-04-10T00:00:00Z',
    endDate: '2023-05-25T00:00:00Z',
    owner: 'user-1',
    members: ['user-1', 'user-3'],
    tasks: [],
    color: '#FFD600',
  },
  {
    id: 'project-4',
    title: 'User Analytics Dashboard',
    description: 'Create a dashboard to track and visualize user behavior analytics.',
    status: 'completed',
    progress: 100,
    startDate: '2023-01-05T00:00:00Z',
    endDate: '2023-03-15T00:00:00Z',
    owner: 'user-2',
    members: ['user-2', 'user-5'],
    tasks: ['task-6', 'task-7'],
    color: '#6200EA',
  },
  {
    id: 'project-5',
    title: 'Performance Optimization',
    description: 'Optimize application performance and reduce loading times.',
    status: 'in-progress',
    progress: 80,
    startDate: '2023-03-01T00:00:00Z',
    endDate: '2023-04-15T00:00:00Z',
    owner: 'user-5',
    members: ['user-2', 'user-5'],
    tasks: ['task-8'],
    color: '#FF1744',
  },
];

// Mock task data
export const mockTasks = [
  {
    id: 'task-1',
    title: 'Design new user interface',
    description: 'Create wireframes and mockups for the new mobile app interface.',
    status: 'completed',
    priority: 'high',
    assignee: 'user-3',
    reporter: 'user-1',
    projectId: 'project-1',
    dueDate: '2023-02-15T00:00:00Z',
    createdAt: '2023-01-21T09:00:00Z',
    completedAt: '2023-02-14T16:30:00Z',
    subtasks: [
      { id: 'subtask-1-1', title: 'Research UI trends', completed: true },
      { id: 'subtask-1-2', title: 'Create wireframes', completed: true },
      { id: 'subtask-1-3', title: 'Design mockups', completed: true },
    ],
  },
  {
    id: 'task-2',
    title: 'Implement new UI components',
    description: 'Develop and implement the new UI components based on the approved designs.',
    status: 'in-progress',
    priority: 'medium',
    assignee: 'user-2',
    reporter: 'user-1',
    projectId: 'project-1',
    dueDate: '2023-03-10T00:00:00Z',
    createdAt: '2023-02-16T10:30:00Z',
    completedAt: null,
    subtasks: [
      { id: 'subtask-2-1', title: 'Set up component library', completed: true },
      { id: 'subtask-2-2', title: 'Implement navigation', completed: true },
      { id: 'subtask-2-3', title: 'Create dashboard components', completed: false },
      { id: 'subtask-2-4', title: 'Style task list components', completed: false },
    ],
  },
  {
    id: 'task-3',
    title: 'Design database schema',
    description: 'Design the database schema for the new API endpoints.',
    status: 'completed',
    priority: 'high',
    assignee: 'user-2',
    reporter: 'user-4',
    projectId: 'project-2',
    dueDate: '2023-02-20T00:00:00Z',
    createdAt: '2023-02-03T11:15:00Z',
    completedAt: '2023-02-18T09:45:00Z',
    subtasks: [
      { id: 'subtask-3-1', title: 'Define data models', completed: true },
      { id: 'subtask-3-2', title: 'Create relationship diagrams', completed: true },
    ],
  },
  {
    id: 'task-4',
    title: 'Implement user authentication',
    description: 'Create authentication endpoints and middleware for secure API access.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'user-5',
    reporter: 'user-4',
    projectId: 'project-2',
    dueDate: '2023-03-15T00:00:00Z',
    createdAt: '2023-02-21T13:00:00Z',
    completedAt: null,
    subtasks: [
      { id: 'subtask-4-1', title: 'Implement JWT authentication', completed: true },
      { id: 'subtask-4-2', title: 'Create login endpoint', completed: true },
      { id: 'subtask-4-3', title: 'Implement password reset', completed: false },
      { id: 'subtask-4-4', title: 'Add social authentication', completed: false },
    ],
  },
  {
    id: 'task-5',
    title: 'User testing of new UI',
    description: 'Conduct user testing sessions to gather feedback on the new UI.',
    status: 'not-started',
    priority: 'medium',
    assignee: 'user-1',
    reporter: 'user-1',
    projectId: 'project-1',
    dueDate: '2023-04-05T00:00:00Z',
    createdAt: '2023-03-01T15:30:00Z',
    completedAt: null,
    subtasks: [
      { id: 'subtask-5-1', title: 'Prepare testing script', completed: false },
      { id: 'subtask-5-2', title: 'Recruit test participants', completed: false },
      { id: 'subtask-5-3', title: 'Conduct testing sessions', completed: false },
      { id: 'subtask-5-4', title: 'Analyze feedback', completed: false },
    ],
  },
  {
    id: 'task-6',
    title: 'Design analytics dashboard',
    description: 'Create wireframes and mockups for the user analytics dashboard.',
    status: 'completed',
    priority: 'medium',
    assignee: 'user-3',
    reporter: 'user-2',
    projectId: 'project-4',
    dueDate: '2023-01-25T00:00:00Z',
    createdAt: '2023-01-10T14:00:00Z',
    completedAt: '2023-01-24T11:30:00Z',
    subtasks: [
      { id: 'subtask-6-1', title: 'Research analytics KPIs', completed: true },
      { id: 'subtask-6-2', title: 'Create dashboard wireframes', completed: true },
    ],
  },
  {
    id: 'task-7',
    title: 'Implement analytics dashboard',
    description: 'Develop the analytics dashboard based on the approved designs.',
    status: 'completed',
    priority: 'high',
    assignee: 'user-5',
    reporter: 'user-2',
    projectId: 'project-4',
    dueDate: '2023-03-10T00:00:00Z',
    createdAt: '2023-01-25T09:30:00Z',
    completedAt: '2023-03-05T16:15:00Z',
    subtasks: [
      { id: 'subtask-7-1', title: 'Set up data visualization library', completed: true },
      { id: 'subtask-7-2', title: 'Implement user metrics charts', completed: true },
      { id: 'subtask-7-3', title: 'Add data filtering', completed: true },
      { id: 'subtask-7-4', title: 'Create export functionality', completed: true },
    ],
  },
  {
    id: 'task-8',
    title: 'Optimize API response times',
    description: 'Identify and fix bottlenecks in API responses to improve performance.',
    status: 'in-progress',
    priority: 'high',
    assignee: 'user-2',
    reporter: 'user-5',
    projectId: 'project-5',
    dueDate: '2023-04-10T00:00:00Z',
    createdAt: '2023-03-05T10:00:00Z',
    completedAt: null,
    subtasks: [
      { id: 'subtask-8-1', title: 'Benchmark current performance', completed: true },
      { id: 'subtask-8-2', title: 'Optimize database queries', completed: true },
      { id: 'subtask-8-3', title: 'Implement caching', completed: false },
      { id: 'subtask-8-4', title: 'Add response compression', completed: false },
    ],
  },
];

// Task status types
export const taskStatuses = [
  { id: 'not-started', label: 'Not Started', color: '#9E9E9E' },
  { id: 'in-progress', label: 'In Progress', color: '#3D5AFE' },
  { id: 'review', label: 'In Review', color: '#FFD600' },
  { id: 'completed', label: 'Completed', color: '#00C853' },
  { id: 'blocked', label: 'Blocked', color: '#FF1744' },
];

// Task priority types
export const taskPriorities = [
  { id: 'low', label: 'Low', color: '#9E9E9E', icon: 'arrow-down' },
  { id: 'medium', label: 'Medium', color: '#FFD600', icon: 'minus' },
  { id: 'high', label: 'High', color: '#FF9100', icon: 'arrow-up' },
  { id: 'critical', label: 'Critical', color: '#FF1744', icon: 'alert-circle' },
];

// Generate mock dashboard data
export const generateMockDashboardData = (userId = 'user-1') => {
  // Get projects for user
  const userProjects = mockProjects.filter(project => 
    project.owner === userId || project.members.includes(userId)
  );
  
  // Get tasks for user
  const userTasks = mockTasks.filter(task => 
    task.assignee === userId || task.reporter === userId
  );
  
  // Calculate task metrics
  const tasksByStatus = {
    total: userTasks.length,
    completed: userTasks.filter(task => task.status === 'completed').length,
    inProgress: userTasks.filter(task => task.status === 'in-progress').length,
    notStarted: userTasks.filter(task => task.status === 'not-started').length,
    blocked: userTasks.filter(task => task.status === 'blocked').length,
    review: userTasks.filter(task => task.status === 'review').length,
  };
  
  // Calculate due soon tasks (due in next 7 days)
  const now = new Date();
  const nextWeek = new Date();
  nextWeek.setDate(now.getDate() + 7);
  
  const dueSoonTasks = userTasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    return dueDate >= now && dueDate <= nextWeek;
  });
  
  // Calculate overdue tasks
  const overdueTasks = userTasks.filter(task => {
    if (task.status === 'completed') return false;
    const dueDate = new Date(task.dueDate);
    return dueDate < now;
  });
  
  // Calculate project progress
  const projectProgress = userProjects.map(project => ({
    id: project.id,
    title: project.title,
    progress: project.progress,
    color: project.color,
  }));
  
  // Recent activities (combine recent tasks and updates)
  const recentTasks = [...userTasks]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 5)
    .map(task => ({
      id: generateId(),
      type: 'task_created',
      task: {
        id: task.id,
        title: task.title,
      },
      project: {
        id: task.projectId,
        title: mockProjects.find(p => p.id === task.projectId)?.title || '',
      },
      user: {
        id: task.reporter,
        name: mockUsers.find(u => u.id === task.reporter)?.name || '',
      },
      date: task.createdAt,
    }));
  
  const recentCompletions = userTasks
    .filter(task => task.completedAt)
    .sort((a, b) => new Date(b.completedAt || '').getTime() - new Date(a.completedAt || '').getTime())
    .slice(0, 5)
    .map(task => ({
      id: generateId(),
      type: 'task_completed',
      task: {
        id: task.id,
        title: task.title,
      },
      project: {
        id: task.projectId,
        title: mockProjects.find(p => p.id === task.projectId)?.title || '',
      },
      user: {
        id: task.assignee,
        name: mockUsers.find(u => u.id === task.assignee)?.name || '',
      },
      date: task.completedAt || '',
    }));
  
  const recentActivities = [...recentTasks, ...recentCompletions]
    .sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())
    .slice(0, 10);
  
  return {
    projects: {
      total: userProjects.length,
      inProgress: userProjects.filter(p => p.status === 'in-progress').length,
      completed: userProjects.filter(p => p.status === 'completed').length,
      notStarted: userProjects.filter(p => p.status === 'not-started').length,
    },
    tasks: tasksByStatus,
    dueSoonTasks,
    overdueTasks,
    projectProgress,
    recentActivities,
  };
};

// Export all mock data
export default {
  users: mockUsers,
  projects: mockProjects,
  tasks: mockTasks,
  taskStatuses,
  taskPriorities,
  generateDashboardData: generateMockDashboardData,
};