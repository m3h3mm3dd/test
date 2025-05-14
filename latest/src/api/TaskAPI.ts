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
  ProjectId: string;   
  CreatedBy: string; 
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

// Added interface for Attachment
export interface Attachment {
  Id: string;
  FileName: string;
  FileType: string;
  FileSize: number;
  FilePath: string;
  EntityType?: string;
  EntityId?: string;
  OwnerId?: string;
  UploadedAt?: string;
  Url?: string;
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
  try {
    const response = await api.get('/users/tasks/assigned');
    return response.data;
  } catch (error) {
    console.error('Error fetching assigned tasks:', error);
    // Return empty array to prevent application crashes
    return [];
  }
}

/**
 * Get tasks assigned to the current user (alias for getCurrentUserTasks)
 */
export async function getCurrentUserAssignedTasks(): Promise<Task[]> {
  return getCurrentUserTasks();
}

/**
 * Get tasks created by the current user
 */
export async function getTasksCreatedByCurrentUser(): Promise<Task[]> {
  const response = await api.get('/users/tasks/created');
  return response.data;
}

/**
 * Mark a task as complete
 * New function to update task completion status
 */
export async function markTaskComplete(taskId: string): Promise<Task> {
  const response = await api.put(`/tasks/${taskId}/complete`, {});
  return response.data;
}

/**
 * Get all tasks for a project
 * New function to get tasks for a specific project
 */
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
}

/**
 * Get attachments for a task
 */
export async function getTaskAttachments(taskId: string): Promise<Attachment[]> {
  const response = await api.get(`/tasks/${taskId}/attachments`)
  return response.data
}

/**
 * Upload an attachment to a task
 */
export async function uploadTaskAttachment(taskId: string, file: File): Promise<Attachment> {
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
/**
 * Get all teams for a project
 */
export async function getProjectTeams(projectId: string): Promise<any[]> {
  try {
    const response = await api.get(`/projects/${projectId}/teams`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project teams:', error);
    // Return empty array to prevent application crashes
    return [];
  }
}

/**
 * Get all members for a project
 */
export async function getProjectMembers(projectId: string): Promise<any[]> {
  try {
    const response = await api.get(`/projects/${projectId}/members`);
    return response.data;
  } catch (error) {
    console.error('Error fetching project members:', error);
    // Return empty array to prevent application crashes
    return [];
  }
}