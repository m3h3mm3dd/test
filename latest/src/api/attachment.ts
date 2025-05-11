import axios from '@/lib/axios'

export async function getAttachmentsForProject(projectId: string) {
  const res = await axios.get(`/projects/${projectId}/attachments`)
  return res.data
}

export async function getAttachmentsForTask(taskId: string) {
  const res = await axios.get(`/tasks/${taskId}/attachments`)
  return res.data
}

export async function uploadAttachment(projectId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post(`/projects/${projectId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function uploadAttachmentToTask(taskId: string, file: File) {
  const formData = new FormData()
  formData.append('file', file)
  const res = await axios.post(`/tasks/${taskId}/attachments`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  })
  return res.data
}

export async function deleteAttachment(id: string) {
  const res = await axios.delete(`/attachments/${id}`)
  return res.data
}
