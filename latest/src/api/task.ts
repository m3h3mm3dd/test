import axios from '@/lib/axios'

export async function createTask(data: {
  Title: string
  Description?: string
  Priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'
  ProjectId: string
  TeamId?: string
  UserId?: string
  DueDate?: string
}) {
  const res = await axios.post('/tasks/create', data)
  return res.data
}

export async function markTaskComplete(taskId: string) {
  const res = await axios.put(`/tasks/${taskId}/complete`)
  return res.data
}

export async function getProjectTasks(projectId: string) {
  const res = await axios.get(`/projects/${projectId}/tasks`)
  return res.data
}

export async function deleteTask(taskId: string) {
  const res = await axios.delete(`/tasks/${taskId}`)
  return res.data
}

export async function getTaskAttachments(taskId: string) {
  const res = await axios.get(`/tasks/${taskId}/attachments`)
  return res.data
}

export async function uploadTaskAttachment(taskId: string, file: File) {
  const form = new FormData()
  form.append('file', file)
  const res = await axios.post(`/tasks/${taskId}/attachments`, form)
  return res.data
}

export async function deleteAttachment(attachmentId: string) {
  const res = await axios.delete(`/attachments/${attachmentId}`)
  return res.data
}
