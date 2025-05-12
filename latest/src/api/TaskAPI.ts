import { api } from '@/lib/axios';

export interface Task {
  Id: string;
  Title: string;
  Description: string;
  Cost: number;
  Status: string;
  StatusColorHex: string;
  Priority: string;
  PriorityColorHex: string;
  Deadline: string;
  TeamId: string;
  UserId: string;
  ParentTaskId: string;
  CreatedAt: string;
  UpdatedAt: string;
  Completed: boolean;
  IsDeleted: boolean;
}

export interface TaskCreateData {
  Title: string;
  Description?: string;
  Cost?: number;
  Status?: string;
  StatusColorHex?: string;
  Priority?: string;
  PriorityColorHex?: string;
  Deadline?: string;
  TeamId?: string;
  UserId?: string;
  ParentTaskId?: string;
  ProjectId: string;
}

export interface TaskUpdateData {
  Title?: string;
  Description?: string;
  Cost?: number;
  Status?: string;
  StatusColorHex?: string;
  Priority?: string;
  PriorityColorHex?: string;
  Deadline?: string;
  TeamId?: string;
  UserId?: string;
  ParentTaskId?: string;
}

/**
 * Get all tasks
 */
export async function getAllTasks(): Promise<Task[]> {
  const response = await api.get('/tasks/');
  return response.data;
}

/**
 * Create a new task
 */
export async function createTask(data: TaskCreateData): Promise<Task> {
  const response = await api.post('/tasks/', data);
  return response.data;
}

/**
 * Get a task by ID
 */
export async function getTaskById(taskId: string): Promise<Task> {
  const response = await api.get(`/tasks/${taskId}`);
  return response.data;
}

/**
 * Update a task
 */
export async function updateTask(taskId: string, data: TaskUpdateData): Promise<Task> {
  const response = await api.put(`/tasks/${taskId}`, data);
  return response.data;
}

/**
 * Delete a task
 */
export async function deleteTask(taskId: string): Promise<any> {
  const response = await api.delete(`/tasks/${taskId}`);
  return response.data;
}

/**
 * Get all tasks for a specific user
 */
export async function getUserTasks(userId: string): Promise<Task[]> {
  const response = await api.get(`/users/${userId}/tasks/assigned`);
  return response.data;
}

/**
 * Get tasks created by a specific user
 */
export async function getTasksCreatedByUser(userId: string): Promise<Task[]> {
  const response = await api.get(`/users/${userId}/tasks/created`);
  return response.data;
}

/**
 * Get tasks assigned to the current user
 */
export async function getCurrentUserTasks(): Promise<Task[]> {
  const response = await api.get('/users/tasks/assigned');
  return response.data;
}

/**
 * Get tasks created by the current user
 */
export async function getTasksCreatedByCurrentUser(): Promise<Task[]> {
  const response = await api.get('/users/tasks/created');
  return response.data;
}/**
 * Get attachments for a task
 */
export async function getTaskAttachments(taskId: string): Promise<any[]> {
  const response = await api.get(`/tasks/${taskId}/attachments`)
  return response.data
}

/**
 * Upload an attachment to a task
 */
export async function uploadTaskAttachment(taskId: string, file: File): Promise<any> {
  const formData = new FormData()
  formData.append('file', file)

  const response = await api.post(`/tasks/${taskId}/attachments`, formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  })

  return response.data
}
/**
 * Delete an attachment from a task
 */
export async function deleteTaskAttachment(taskId: string, attachmentId: string): Promise<any> {
  const response = await api.delete(`/tasks/${taskId}/attachments/${attachmentId}`)
  return response.data
}
