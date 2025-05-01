// Navigation Types
export type RootStackParamList = {
    Auth: undefined;
    Main: undefined;
  };
  
  export type AuthStackParamList = {
    Onboarding: undefined;
    Login: undefined;
    SignUpPhone: undefined;
    SignUpPhoneEx: undefined;
    SignUpPhoneCode: { phoneNumber?: string };
    ForgotPassword: undefined;
  };
  
  export type DashboardStackParamList = {
    Dashboard: undefined;
    ProjectTiles: { projectId?: string };
    ProjectVersions: { projectId: string };
  };
  
  export type TasksStackParamList = {
    TaskList: undefined;
    TaskDetails: { taskId: string };
  };
  
  export type TeamsStackParamList = {
    TeamList: undefined;
    TeamDetails: { teamId: string };
    Chat: { teamId: string };
  };
  
  export type TabParamList = {
    DashboardTab: undefined;
    TasksTab: undefined;
    TeamsTab: undefined;
    NotificationsTab: undefined;
    SettingsTab: undefined;
  };
  
  // Task Types
  export interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'todo' | 'in_progress' | 'in_review' | 'done';
    priority: 'low' | 'medium' | 'high';
    dueDate?: string;
    assigneeId?: string;
    projectId?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // User Types
  export interface User {
    id: string;
    name: string;
    email: string;
    phone?: string;
    avatar?: string;
    role: 'admin' | 'member' | 'guest';
  }
  
  // Team Types
  export interface Team {
    id: string;
    name: string;
    description?: string;
    memberIds: string[];
    createdAt: string;
    updatedAt: string;
  }
  
  // Project Types
  export interface Project {
    id: string;
    name: string;
    description?: string;
    teamId: string;
    status: 'active' | 'archived' | 'completed';
    startDate?: string;
    endDate?: string;
    createdAt: string;
    updatedAt: string;
  }
  
  // Message Types
  export interface Message {
    id: string;
    content: string;
    senderId: string;
    teamId: string;
    createdAt: string;
    attachments?: string[];
  }
  
  // Notification Types
  export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'task' | 'team' | 'project' | 'system';
    relatedId?: string;
    isRead: boolean;
    createdAt: string;
  }