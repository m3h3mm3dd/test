import { API_URL, API_TIMEOUT } from '../constants';
import { 
  MOCK_USERS, 
  MOCK_TEAMS, 
  MOCK_PROJECTS, 
  MOCK_TASKS, 
  MOCK_MESSAGES, 
  MOCK_NOTIFICATIONS 
} from '../utils/MockData';
import { 
  User, 
  Team, 
  Project, 
  Task, 
  Message, 
  Notification 
} from '../types';

// Simulate API delay
const simulateDelay = (ms: number = 300) => new Promise(resolve => setTimeout(resolve, ms));

class ApiService {
  // Auth
  async login(email: string, password: string): Promise<{ token: string; user: User }> {
    await simulateDelay();
    
    const user = MOCK_USERS.find(u => u.email === email);
    
    if (!user || password !== 'password') {
      throw new Error('Invalid credentials');
    }
    
    return {
      token: 'fake-jwt-token',
      user
    };
  }
  
  async register(name: string, email: string, phone: string, password: string): Promise<{ token: string; user: User }> {
    await simulateDelay();
    
    if (MOCK_USERS.some(u => u.email === email)) {
      throw new Error('User already exists');
    }
    
    const newUser: User = {
      id: `user${MOCK_USERS.length + 1}`,
      name,
      email,
      phone,
      role: 'member',
    };
    
    MOCK_USERS.push(newUser);
    
    return {
      token: 'fake-jwt-token',
      user: newUser
    };
  }
  
  // Users
  async getUserProfile(userId: string): Promise<User> {
    await simulateDelay();
    
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      throw new Error('User not found');
    }
    
    return user;
  }
  
  // Tasks
  async getTasks(filters?: { projectId?: string; assigneeId?: string; status?: string }): Promise<Task[]> {
    await simulateDelay();
    
    let filteredTasks = [...MOCK_TASKS];
    
    if (filters) {
      if (filters.projectId) {
        filteredTasks = filteredTasks.filter(task => task.projectId === filters.projectId);
      }
      
      if (filters.assigneeId) {
        filteredTasks = filteredTasks.filter(task => task.assigneeId === filters.assigneeId);
      }
      
      if (filters.status) {
        filteredTasks = filteredTasks.filter(task => task.status === filters.status);
      }
    }
    
    return filteredTasks;
  }
  
  async getTaskById(taskId: string): Promise<Task> {
    await simulateDelay();
    
    const task = MOCK_TASKS.find(t => t.id === taskId);
    
    if (!task) {
      throw new Error('Task not found');
    }
    
    return task;
  }
  
  async createTask(task: Omit<Task, 'id' | 'createdAt' | 'updatedAt'>): Promise<Task> {
    await simulateDelay();
    
    const newTask: Task = {
      id: `task${MOCK_TASKS.length + 1}`,
      ...task,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };
    
    MOCK_TASKS.push(newTask);
    
    return newTask;
  }
  
  async updateTask(taskId: string, updates: Partial<Omit<Task, 'id' | 'createdAt' | 'updatedAt'>>): Promise<Task> {
    await simulateDelay();
    
    const taskIndex = MOCK_TASKS.findIndex(t => t.id === taskId);
    
    if (taskIndex === -1) {
      throw new Error('Task not found');
    }
    
    const updatedTask: Task = {
      ...MOCK_TASKS[taskIndex],
      ...updates,
      updatedAt: new Date().toISOString()
    };
    
    MOCK_TASKS[taskIndex] = updatedTask;
    
    return updatedTask;
  }
  
  // Teams
  async getTeams(): Promise<Team[]> {
    await simulateDelay();
    return MOCK_TEAMS;
  }
  
  async getTeamById(teamId: string): Promise<Team & { members: User[] }> {
    await simulateDelay();
    
    const team = MOCK_TEAMS.find(t => t.id === teamId);
    
    if (!team) {
      throw new Error('Team not found');
    }
    
    const members = MOCK_USERS.filter(user => team.memberIds.includes(user.id));
    
    return {
      ...team,
      members
    };
  }
  
  // Projects
  async getProjects(teamId?: string): Promise<Project[]> {
    await simulateDelay();
    
    if (teamId) {
      return MOCK_PROJECTS.filter(p => p.teamId === teamId);
    }
    
    return MOCK_PROJECTS;
  }
  
  async getProjectById(projectId: string): Promise<Project> {
    await simulateDelay();
    
    const project = MOCK_PROJECTS.find(p => p.id === projectId);
    
    if (!project) {
      throw new Error('Project not found');
    }
    
    return project;
  }
  
  // Messages
  async getTeamMessages(teamId: string): Promise<Message[]> {
    await simulateDelay();
    
    return MOCK_MESSAGES.filter(m => m.teamId === teamId);
  }
  
  async sendMessage(content: string, teamId: string, senderId: string): Promise<Message> {
    await simulateDelay();
    
    const newMessage: Message = {
      id: `message${MOCK_MESSAGES.length + 1}`,
      content,
      teamId,
      senderId,
      createdAt: new Date().toISOString()
    };
    
    MOCK_MESSAGES.push(newMessage);
    
    return newMessage;
  }
  
  // Notifications
  async getNotifications(): Promise<Notification[]> {
    await simulateDelay();
    
    return MOCK_NOTIFICATIONS.sort((a, b) => 
      new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }
  
  async markNotificationAsRead(notificationId: string): Promise<Notification> {
    await simulateDelay();
    
    const notificationIndex = MOCK_NOTIFICATIONS.findIndex(n => n.id === notificationId);
    
    if (notificationIndex === -1) {
      throw new Error('Notification not found');
    }
    
    MOCK_NOTIFICATIONS[notificationIndex] = {
      ...MOCK_NOTIFICATIONS[notificationIndex],
      isRead: true
    };
    
    return MOCK_NOTIFICATIONS[notificationIndex];
  }
}

export default new ApiService();