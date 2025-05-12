import { api } from '@/lib/axios';

export interface Message {
  Id: string;
  ProjectId: string;
  UserId: string;
  Text: string;
  Timestamp: string;
  IsDeleted: boolean;
}

export interface MessageSendData {
  projectId: string;
  text: string;
}

/**
 * Get all messages for a project
 */
export async function getMessagesForProject(projectId: string): Promise<Message[]> {
  const response = await api.get(`/projects/${projectId}/messages`);
  return response.data;
}

/**
 * Send a message to a project
 */
export async function sendMessageToProject(data: MessageSendData): Promise<Message> {
  const response = await api.post(`/projects/${data.projectId}/messages`, {
    Text: data.text
  });
  return response.data;
}