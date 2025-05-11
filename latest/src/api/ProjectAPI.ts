import { api } from '@/lib/axios';

export interface Project {
  Id: string;
  Name: string;
  Description: string;
  Deadline: string;
  TotalBudget: number;
  Progress: number;
  OwnerId: string;
  CreatedAt: string;
  UpdatedAt: string;
  IsDeleted: boolean;
}

export interface ProjectCreateData {
  Name: string;
  Description?: string;
  Deadline?: string;
  Budget?: number;
}

export interface ProjectUpdateData {
  Name?: string;
  Description?: string;
  Deadline?: string;
  Budget?: number;
  Progress?: number;
}

export async function getProjects(): Promise<Project[]> {
  const response = await api.get('/projects');
  return response.data;
}

export async function getProjectById(projectId: string): Promise<Project> {
  const response = await api.get(`/projects/${projectId}`);
  return response.data;
}

export async function createProject(data: ProjectCreateData): Promise<Project> {
  const response = await api.post('/projects/create', data);
  return response.data;
}

export async function updateProject(projectId: string, data: ProjectUpdateData): Promise<Project> {
  const response = await api.put(`/projects/${projectId}`, data);
  return response.data;
}

export async function deleteProject(projectId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/delete`);
}

export async function getProjectMembers(projectId: string): Promise<any[]> {
  const response = await api.get(`/projects/${projectId}/members`);
  return response.data;
}

export async function addProjectMember(projectId: string, userId: string): Promise<any> {
  const response = await api.post(`/projects/${projectId}/add-member`, { memberId: userId });
  return response.data;
}

export async function removeProjectMember(projectId: string, userId: string): Promise<void> {
  await api.delete(`/projects/${projectId}/remove-member/${userId}`);
}

export async function getProjectTeams(projectId: string): Promise<any[]> {
  const response = await api.get(`/projects/${projectId}/teams`);
  return response.data;
}