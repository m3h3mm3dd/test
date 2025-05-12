import { api } from '@/lib/axios';
import { useUserStore } from '@/stores/userStore';

export interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  Role: string;
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
 * Register a new user
 */
export async function registerUser(data: UserRegisterData): Promise<any> {
  const res = await api.post('/auth/register', data);
  return res.data;
}

/**
 * Login a user and store token (no user expected)
 */
export async function loginUser(data: UserLoginData): Promise<{ token: string }> {
  console.log('[loginUser] sending:', data);

  const res = await api.post('/auth/login', data);
  const { access_token } = res.data;

  console.log('[loginUser] access_token:', access_token);

  if (!access_token) {
    throw new Error('Login failed: missing token');
  }

  localStorage.setItem('authToken', access_token);
  return { token: access_token };
}

/**
 * Delete current user's account
 */
export async function deleteAccount(): Promise<void> {
  const res = await api.delete('/auth/account');
  useUserStore.getState().logout();
  return res.data;
}

/**
 * Send verification code to email
 */
export async function sendVerificationCode(
  recipientEmail: string
): Promise<{ Success: boolean; Message: string }> {
  const res = await api.post('/email/send-verification-code', null, {
    params: { recipientEmail },
  });
  return res.data;
}

/**
 * Check verification code
 */
export async function checkVerificationCode(
  data: EmailVerificationData
): Promise<{ Success: boolean; Message: string }> {
  const res = await api.post('/email/check-verification-code', data);
  return res.data;
}

/**
 * Get all projects for a user
 */
export async function getUserProjects(userId: string): Promise<any[]> {
  const res = await api.get(`/users/${userId}/projects`);
  return res.data;
}

/**
 * Get all teams for a user
 */
export async function getUserTeams(userId: string): Promise<any[]> {
  const res = await api.get(`/users/${userId}/teams`);
  return res.data;
}

/**
 * Get all projects for the current user
 */
export async function getCurrentUserProjects(): Promise<any[]> {
  const res = await api.get('/users/projects');
  return res.data;
}

/**
 * Get all teams for the current user
 */
export async function getCurrentUserTeams(): Promise<any[]> {
  const res = await api.get('/users/teams');
  return res.data;
}

/**
 * Get tasks assigned to a user
 */
export async function getUserAssignedTasks(userId: string): Promise<any[]> {
  const res = await api.get(`/users/${userId}/tasks/assigned`);
  return res.data;
}

/**
 * Get tasks created by a user
 */
export async function getUserCreatedTasks(userId: string): Promise<any[]> {
  const res = await api.get(`/users/${userId}/tasks/created`);
  return res.data;
}

/**
 * Get tasks assigned to current user
 */
export async function getCurrentUserAssignedTasks(): Promise<any[]> {
  const res = await api.get('/users/tasks/assigned');
  return res.data;
}

/**
 * Get tasks created by current user
 */
export async function getCurrentUserCreatedTasks(): Promise<any[]> {
  const res = await api.get('/users/tasks/created');
  return res.data;
}
