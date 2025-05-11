
import axios from '@/lib/axios';

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
  Priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
  ProjectId: string;
  TeamId?: string;
  UserId?: string;
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

// Get tasks for a project
export async function getProjectTasks(projectId: string): Promise<Task[]> {
  const res = await axios.get(`/projects/${projectId}/tasks`);
  return res.data;
}

// Get tasks assigned to a user
export async function getUserTasks(userId: string): Promise<Task[]> {
  const res = await axios.get(`/users/${userId}/tasks/assigned`);
  return res.data;
}

// Get a specific task by ID
export async function getTaskById(taskId: string): Promise<Task> {
  const res = await axios.get(`/tasks/${taskId}`);
  return res.data;
}

// Create a new task
export async function createTask(data: TaskCreateData): Promise<Task> {
  const res = await axios.post('/tasks', data);
  return res.data;
}

// Update an existing task
export async function updateTask(taskId: string, data: TaskUpdateData): Promise<Task> {
  const res = await axios.put(`/tasks/${taskId}`, data);
  return res.data;
}

// Mark a task as complete
export async function markTaskComplete(taskId: string): Promise<Task> {
  const res = await axios.put(`/tasks/${taskId}/complete`, {
    Completed: true,
    Status: 'Completed'
  });
  return res.data;
}

// Delete a task
export async function deleteTask(taskId: string): Promise<void> {
  await axios.delete(`/tasks/${taskId}`);
}

// Get attachments for a task
export async function getTaskAttachments(taskId: string): Promise<any[]> {
  const res = await axios.get(`/tasks/${taskId}/attachments`);
  return res.data;
}

// Upload an attachment to a task
export async function uploadTaskAttachment(taskId: string, file: File): Promise<any> {
  const form = new FormData();
  form.append('file', file);
  
  const res = await axios.post(`/tasks/${taskId}/attachments`, form, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  });
  return res.data;
}

// Get comments for a task
export async function getTaskComments(taskId: string): Promise<any[]> {
  const res = await axios.get(`/tasks/${taskId}/comments`);
  return res.data;
}

// Add a comment to a task
export async function addTaskComment(taskId: string, content: string): Promise<any> {
  const res = await axios.post(`/tasks/${taskId}/comments`, { content });
  return res.data;
}