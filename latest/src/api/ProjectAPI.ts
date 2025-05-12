import { api } from '@/lib/axios';

export interface Project {
  Id: string;
  Name: string;
  Description: string;
  Deadline: string;
  TotalBudget: number;
  CreatedAt: string;
  IsDeleted: boolean;
  OwnerId: string;
}

export interface ProjectCreateData {
  Name: string;
  Description?: string;
  Deadline?: string;
  Budget?: number;
  StatusId?: string;
  IsDeleted?: boolean;
}

export interface ProjectUpdateData {
  Name?: string;
  Description?: string;
  Deadline?: string;
  Budget?: number;
  StatusId?: string;
  IsDeleted?: boolean;
}

/**
 * Get all projects for the current user
 */
export async function getProjects(): Promise<Project[]> {
  const response = await api.get('/users/projects');
  return response.data;
}

/**
 * Get a project by ID
 */
export async function getProjectById(projectId: string): Promise<Project> {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
}

/**
 * Create a new project
 */
export async function createProject(data: ProjectCreateData): Promise<Project> {
  const response = await api.post('/projects/create', data);
  return response.data;
}

/**
 * Delete a project
 */
export async function deleteProject(projectId: string): Promise<string> {
  const response = await api.delete(`/projects/${projectId}/delete`);
  return response.data;
}

/**
 * Get all members of a project
 */
export async function getProjectMembers(projectId: string): Promise<any[]> {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data;
}

/**
 * Add a member to a project
 */
export async function addProjectMember(projectId: string, memberId: string): Promise<any> {
  const response = await api.post(`/projects/${project_id}/add-member?projectId=${projectId}&memberId=${memberId}`);
  return response.data;
}

/**
 * Remove a member from a project
 */
export async function removeProjectMember(projectId: string, memberId: string): Promise<any> {
  const response = await api.delete(`/projects/${projectId}/remove-member/${memberId}`);
  return response.data;
}

/**
 * Get all teams of a project
 */
export async function getProjectTeams(projectId: string): Promise<any[]> {
  const response = await api.get(`/projects/${projectId}/teams`);
  return response.data;
}

/**
 * Get all tasks of a project
 */
export async function getProjectTasks(projectId: string): Promise<any[]> {
  const response = await api.get(`/projects/${projectId}/tasks`);
  return response.data;
}