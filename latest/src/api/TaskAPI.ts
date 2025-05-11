import { api } from '@/lib/axios';

export interface Task {
  Id: string;
  ProjectId: string;
  TeamId?: string;
  UserId?: string;
  CreatedBy: string;
  Title: string;
  Description?: string;
  Cost?: number;
  Status: string;
  StatusColorHex?: string;
  Priority: string;
  PriorityColorHex?: string;
  ParentTaskId?: string;
  Deadline?: string;
  CreatedAt: string;
  UpdatedAt?: string;
  IsDeleted: boolean;
  Completed: boolean;
}

export interface TaskCreateData {
  Title: string;
  Description?: string;
  ProjectId: string;
  TeamId?: string;
  UserId?: string;
  Priority: string;
  Status?: string;
  Deadline?: string;
}

export interface TaskUpdateData {
  Title?: string;
  Description?: string;
  TeamId?: string;
  UserId?: string;
  Priority?: string;
  Status?: string;
  Deadline?: string;
  Completed?: boolean;
}

export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
}

export async function getUserTasks(userId: string): Promise<Task[]> {
  const response = await api.get(`/users/${userId}/tasks/assigned`);
  return response.data;
}

export async function getTaskById(taskId: string): Promise<Task> {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
}

export async function createTask(data: TaskCreateData): Promise<Task> {
  const response = await api.post('/tasks', data);
  return response.data;
}

export async function updateTask(taskId: string, data: TaskUpdateData): Promise<Task> {
  const response = await api.put(`/tasks/${taskId}`, data);
  return response.data;
}

export async function markTaskComplete(taskId: string): Promise<Task> {
  const response = await api.put(`/tasks/${taskId}/complete`, {
    Completed: true,
    Status: 'Completed'
  });
  return response.data;
}

export async function deleteTask(taskId: string): Promise<void> {
  await api.delete(`/tasks/${taskId}`);
}

export async function getTaskAttachments(taskId: string): Promise<any[]> {
  const response = await api.get(`/tasks/${taskId}/attachments`);
  return response.data;
}

export async function uploadTaskAttachment(taskId: string, file: File): Promise<any> {
  const formData = new FormData();
  formData.append('file', file);
  
  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return response.data;
}

export async function getTaskComments(taskId: string): Promise<any[]> {
  const response = await api.get(`/tasks/${taskId}/comments`);
  return response.data;
}

export async function addTaskComment(taskId: string, content: string): Promise<any> {
  const response = await api.post(`/tasks/${taskId}/comments`, { content });
  return response.data;
}