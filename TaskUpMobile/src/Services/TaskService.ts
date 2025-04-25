import { ApiService } from './ApiService';
import { addOfflineOperation } from '../Hooks/UseOfflineSync';
import { ApiConfig } from '../Config/ApiConfig';

export class TaskService {
  static async getTasks() {
    try {
      if (ApiConfig.USE_MOCK) {
        return [
          {
            id: '1',
            title: 'Design home screen',
            description: 'Create a new home screen design with improved UX',
            status: 'In Progress',
            priority: 'High',
            deadline: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
            projectId: '1',
            projectName: 'Mobile App Redesign',
            assignee: {
              id: '1',
              name: 'John Doe',
            },
            hasAttachments: true,
            commentCount: 5,
            subtaskCount: 3,
            completedSubtasks: 1,
          },
          {
            id: '2',
            title: 'Implement authentication',
            description: 'Add login and signup functionality with OAuth',
            status: 'Not Started',
            priority: 'Medium',
            deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            projectId: '1',
            projectName: 'Mobile App Redesign',
            assignee: {
              id: '2',
              name: 'Jane Smith',
            },
            hasAttachments: false,
            commentCount: 2,
            subtaskCount: 4,
            completedSubtasks: 0,
          },
          {
            id: '3',
            title: 'Create style guide',
            description: 'Develop a comprehensive style guide for the project',
            status: 'Completed',
            priority: 'Low',
            deadline: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
            projectId: '2',
            projectName: 'Website Development',
            assignee: {
              id: '3',
              name: 'Alex Johnson',
            },
            hasAttachments: true,
            commentCount: 3,
            subtaskCount: 2,
            completedSubtasks: 2,
          },
        ];
      }

      const response = await ApiService.get('/tasks');
      return response;
    } catch (error) {
      console.error('Failed to get tasks', error);
      throw error;
    }
  }

  static async getRecentTasks() {
    try {
      if (ApiConfig.USE_MOCK) {
        return [
          {
            id: '1',
            title: 'Design home screen',
            description: 'Create a new home screen design with improved UX',
            status: 'In Progress',
            priority: 'High',
            deadline: new Date(new Date().setDate(new Date().getDate() + 2)).toISOString(),
            projectId: '1',
            projectName: 'Mobile App Redesign',
            assignee: {
              id: '1',
              name: 'John Doe',
            },
          },
          {
            id: '2',
            title: 'Implement authentication',
            description: 'Add login and signup functionality with OAuth',
            status: 'Not Started',
            priority: 'Medium',
            deadline: new Date(new Date().setDate(new Date().getDate() + 5)).toISOString(),
            projectId: '1',
            projectName: 'Mobile App Redesign',
            assignee: {
              id: '2',
              name: 'Jane Smith',
            },
          },
          {
            id: '3',
            title: 'Create style guide',
            description: 'Develop a comprehensive style guide for the project',
            status: 'Completed',
            priority: 'Low',
            deadline: new Date(new Date().setDate(new Date().getDate() - 1)).toISOString(),
            projectId: '2',
            projectName: 'Website Development',
            assignee: {
              id: '3',
              name: 'Alex Johnson',
            },
          },
        ];
      }

      const response = await ApiService.get('/tasks/recent');
      return response;
    } catch (error) {
      console.error('Failed to get recent tasks', error);
      throw error;
    }
  }

  static async createTask(taskData: any) {
    try {
      if (ApiConfig.USE_MOCK) {
        return {
          id: Date.now().toString(),
          ...taskData,
        };
      }

      const response = await ApiService.post('/tasks', taskData);
      return response;
    } catch (error) {
      console.error('Failed to create task', error);
      
      // Store operation for offline sync
      await addOfflineOperation('/tasks', 'post', taskData);
      throw error;
    }
  }

  static async updateTaskStatus(taskId: string, status: string) {
    try {
      if (ApiConfig.USE_MOCK) {
        return { success: true };
      }

      const response = await ApiService.put(`/tasks/${taskId}/status`, { status });
      return response;
    } catch (error) {
      console.error('Failed to update task status', error);
      
      // Store operation for offline sync
      await addOfflineOperation(`/tasks/${taskId}/status`, 'put', { status });
      throw error;
    }
  }
}