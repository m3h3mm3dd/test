import { ApiService } from './ApiService';
import { addOfflineOperation } from '../Hooks/UseOfflineSync';
import { ApiConfig } from '../Config/ApiConfig';

export class ProjectService {
  static async getProjects() {
    try {
      if (ApiConfig.USE_MOCK) {
        return [
          {
            id: '1',
            name: 'Mobile App Redesign',
            description: 'Redesign the mobile app for better UX',
            progress: 75,
            status: 'In Progress',
            deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            taskCount: 12,
            teamCount: 4,
          },
          {
            id: '2',
            name: 'Website Development',
            description: 'Develop a new company website',
            progress: 30,
            status: 'In Progress',
            deadline: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
            taskCount: 20,
            teamCount: 5,
          },
          {
            id: '3',
            name: 'Marketing Campaign',
            description: 'Create a new marketing campaign for Q3',
            progress: 10,
            status: 'Not Started',
            deadline: new Date(new Date().setDate(new Date().getDate() + 30)).toISOString(),
            taskCount: 8,
            teamCount: 3,
          },
        ];
      }

      const response = await ApiService.get('/projects');
      return response;
    } catch (error) {
      console.error('Failed to get projects', error);
      throw error;
    }
  }

  static async getActiveProjects() {
    try {
      if (ApiConfig.USE_MOCK) {
        return [
          {
            id: '1',
            name: 'Mobile App Redesign',
            description: 'Redesign the mobile app for better UX',
            progress: 75,
            status: 'In Progress',
            deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            taskCount: 12,
            teamCount: 4,
          },
          {
            id: '2',
            name: 'Website Development',
            description: 'Develop a new company website',
            progress: 30,
            status: 'In Progress',
            deadline: new Date(new Date().setDate(new Date().getDate() + 15)).toISOString(),
            taskCount: 20,
            teamCount: 5,
          },
        ];
      }

      const response = await ApiService.get('/projects/active');
      return response;
    } catch (error) {
      console.error('Failed to get active projects', error);
      throw error;
    }
  }

  static async getDashboardStats() {
    try {
      if (ApiConfig.USE_MOCK) {
        return {
          projectCount: 5,
          completionRate: 68,
          upcomingDeadlines: 3,
          overdueCount: 1,
        };
      }

      const response = await ApiService.get('/dashboard/stats');
      return response;
    } catch (error) {
      console.error('Failed to get dashboard stats', error);
      throw error;
    }
  }

  static async createProject(projectData: any) {
    try {
      if (ApiConfig.USE_MOCK) {
        return {
          id: Date.now().toString(),
          ...projectData,
        };
      }

      const response = await ApiService.post('/projects', projectData);
      return response;
    } catch (error) {
      console.error('Failed to create project', error);
      
      // Store operation for offline sync
      await addOfflineOperation('/projects', 'post', projectData);
      throw error;
    }
  }

  static async createTeam(teamData: any) {
    try {
      if (ApiConfig.USE_MOCK) {
        return {
          id: Date.now().toString(),
          ...teamData,
        };
      }

      const response = await ApiService.post('/teams', teamData);
      return response;
    } catch (error) {
      console.error('Failed to create team', error);
      
      // Store operation for offline sync
      await addOfflineOperation('/teams', 'post', teamData);
      throw error;
    }
  }
}