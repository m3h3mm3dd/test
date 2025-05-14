import { api } from '@/lib/axios';

export interface Team {
  Id: string;
  Name: string;
  Description: string;
  ColorIndex: number;
  ProjectId: string;
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

export interface TeamMemberRemoveData {
  TeamId: string;
  UserIdToBeRemoved: string;
}

/**
 * Get all teams
 */
export async function getAllTeams(): Promise<Team[]> {
  try {
    const response = await api.get('/teams/');
    return response.data;
  } catch (error) {
    console.error('Error fetching teams:', error);
    return [];
  }
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
  const response = await api.get(`/teams/${teamId}`, {
    params: { teamId }
  });
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
  await api.delete(`/teams/${teamId}`, {
    params: { teamId }
  });
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
export async function removeTeamMember(data: TeamMemberRemoveData): Promise<string> {
  const response = await api.delete(`/teams/${data.TeamId}/members/${data.UserIdToBeRemoved}`, {
    data
  });
  return response.data;
}

/**
 * Get all tasks for a team
 */
export async function getTeamTasks(teamId: string): Promise<any[]> {
  try {
    const response = await api.get(`/teams/${teamId}/tasks`, {
      params: { teamId }
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching team tasks:', error);
    return [];
  }
}

/**
 * Get all teams for a project
 */
export async function getProjectTeams(projectId: string): Promise<Team[]> {
  try {
    // Filter teams by project ID from getAllTeams since specific endpoint might not be available
    const allTeams = await getAllTeams();
    return allTeams.filter(team => team.ProjectId === projectId);
  } catch (error) {
    console.error('Error fetching project teams:', error);
    return [];
  }
}