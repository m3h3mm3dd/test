import { api } from '@/lib/axios';

export interface Team {
  Name: string;
  Description: string;
  ColorIndex: number;
  ProjectId: string;
  Id: string;
  CreatedAt: string;
  UpdatedAt: string;
  IsDeleted: boolean;
}

export interface TeamCreateData {
  Name: string;
  Description?: string;
  ColorIndex?: number;
  ProjectId: string;
}

export interface TeamUpdateData {
  Name?: string;
  Description?: string;
  ColorIndex?: number;
}

export interface TeamMemberData {
  TeamId: string;
  UserIdToBeAdded: string;
  Role?: string;
  IsLeader?: boolean;
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<Team[]> {
  const response = await api.get('/teams/');
  return response.data;
}

/**
 * Create a new team
 */
export async function createTeam(data: TeamCreateData): Promise<Team> {
  const response = await api.post('/teams/', data);
  return response.data;
}

/**
 * Get a specific team by ID
 */
export async function getTeamById(teamId: string): Promise<Team> {
  const response = await api.get(`/teams/${team_id}?teamId=${teamId}`);
  return response.data;
}

/**
 * Update a team
 */
export async function updateTeam(teamId: string, data: TeamUpdateData): Promise<Team> {
  const response = await api.put(`/teams/${teamId}`, data);
  return response.data;
}

/**
 * Delete a team
 */
export async function deleteTeam(teamId: string): Promise<void> {
  await api.delete(`/teams/${team_id}?teamId=${teamId}`);
}

/**
 * Add a member to a team
 */
export async function addTeamMember(data: TeamMemberData): Promise<string> {
  const response = await api.post('/teams/members', data);
  return response.data;
}

/**
 * Remove a member from a team
 */
export async function removeTeamMember(data: { TeamId: string, UserIdToBeRemoved: string }): Promise<string> {
  const response = await api.delete(`/teams/${data.TeamId}/members/${data.UserIdToBeRemoved}`, { data });
  return response.data;
}

/**
 * Get all tasks for a team
 */
export async function getTeamTasks(teamId: string): Promise<any[]> {
  const response = await api.get(`/teams/${team_id}/tasks?teamId=${teamId}`);
  return response.data;
}