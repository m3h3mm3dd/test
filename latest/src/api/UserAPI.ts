import { api } from '@/lib/axios';

export interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
}

export interface UserRegisterData {
  FirstName: string;
  LastName: string;
  Email: string;
  Password: string;
}

export interface UserLoginData {
  Email: string;
  Password: string;
}

export interface EmailVerificationData {
  Email: string;
  VerificationCode: string;
}

/**
 * Get the currently logged-in user's profile
 */
export async function getCurrentUser(): Promise<User> {
  const response = await api.get('/auth/me')
  return response.data
}

/**
 * Register a new user
 */
export async function registerUser(data: UserRegisterData): Promise<string> {
  const response = await api.post('/auth/register', data);
  return response.data;
}

/**
 * Login a user
 */
export async function loginUser(data: UserLoginData): Promise<any> {
  const response = await api.post('/auth/login', data);
  return response.data;
}

/**
 * Delete current user's account
 */
export async function deleteAccount(): Promise<void> {
  const response = await api.delete('/auth/account');
  return response.data;
}

/**
 * Send verification code to email
 */
export async function sendVerificationCode(recipientEmail: string): Promise<{ Success: boolean; Message: string }> {
  const response = await api.post('/email/send-verification-code', null, {
    params: { recipientEmail }
  });
  return response.data;
}

/**
 * Check verification code
 */
export async function checkVerificationCode(data: EmailVerificationData): Promise<{ Success: boolean; Message: string }> {
  const response = await api.post('/email/check-verification-code', data);
  return response.data;
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string): Promise<any[]> {
  const response = await api.get(`/users/${userId}/projects`);
  return response.data;
}

/**
 * Get all teams for a user
 */
export async function getUserTeams(userId: string): Promise<any[]> {
  const response = await api.get(`/users/${userId}/teams`);
  return response.data;
}

/**
 * Get all projects for the current user
 */
export async function getCurrentUserProjects(): Promise<any[]> {
  const response = await api.get('/users/projects');
  return response.data;
}

/**
 * Get all teams for the current user
 */
export async function getCurrentUserTeams(): Promise<any[]> {
  const response = await api.get('/users/teams');
  return response.data;
}

/**
 * Get tasks assigned to a user
 */
export async function getUserAssignedTasks(userId: string): Promise<any[]> {
  const response = await api.get(`/users/${userId}/tasks/assigned`);
  return response.data;
}

/**
 * Get tasks created by a user
 */
export async function getUserCreatedTasks(userId: string): Promise<any[]> {
  const response = await api.get(`/users/${userId}/tasks/created`);
  return response.data;
}

/**
 * Get tasks assigned to current user
 */
export async function getCurrentUserAssignedTasks(): Promise<any[]> {
  const response = await api.get('/users/tasks/assigned');
  return response.data;
}

/**
 * Get tasks created by current user
 */
export async function getCurrentUserCreatedTasks(): Promise<any[]> {
  const response = await api.get('/users/tasks/created');
  return response.data;
}