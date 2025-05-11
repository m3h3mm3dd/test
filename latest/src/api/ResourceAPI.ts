import { api } from '@/lib/axios';

export interface Resource {
  Id: string;
  ProjectId: string;
  Name: string;
  Type: string;
  Description?: string;
  Unit: string;
  Total: number;
  Available: number;
  CreatedAt: string;
}

export interface ResourcePlan {
  Id: string;
  ProjectId: string;
  Notes?: string;
  OwnerId: string;
  CreatedAt: string;
}

export interface ResourceCreateData {
  ProjectId: string;
  Name: string;
  Type: string;
  Description?: string;
  Unit: string;
  Total?: number;
  Available?: number;
}

export interface ResourcePlanCreateData {
  ProjectId: string;
  Notes?: string;
}

export async function getProjectResources(projectId: string): Promise<Resource[]> {
  const response = await api.get(`/resources/project/${projectId}`);
  return response.data;
}

export async function getResourceById(resourceId: string): Promise<Resource> {
  const response = await api.get(`/resources/${resourceId}`);
  return response.data;
}

export async function createResource(data: ResourceCreateData): Promise<Resource> {
  const response = await api.post('/resources/create', data);
  return response.data;
}

export async function updateResource(resourceId: string, data: Partial<ResourceCreateData>): Promise<Resource> {
  const response = await api.put(`/resources/${resourceId}/update`, data);
  return response.data;
}

export async function deleteResource(resourceId: string): Promise<void> {
  await api.delete(`/resources/${resourceId}/delete`);
}

export async function getProjectResourcePlans(projectId: string): Promise<ResourcePlan[]> {
  const response = await api.get(`/resources/project/${projectId}/plans`);
  return response.data;
}

export async function createResourcePlan(data: ResourcePlanCreateData): Promise<ResourcePlan> {
  const response = await api.post('/resources/plan/create', data);
  return response.data;
}

export async function updateResourcePlan(planId: string, data: { Notes?: string }): Promise<ResourcePlan> {
  const response = await api.put(`/resources/plan/${planId}/update`, data);
  return response.data;
}

export async function deleteResourcePlan(planId: string): Promise<void> {
  await api.delete(`/resources/plan/${planId}/delete`);
}