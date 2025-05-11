
import axios from '@/lib/axios'

export async function getMessagesForProject(projectId: string) {
  const res = await axios.get(`/projects/${projectId}/messages`)
  return res.data
}

export async function sendMessageToProject(data: {
  text: string
  projectId: string
}) {
  const res = await axios.post(`/projects/${data.projectId}/messages`, {
    Text: data.text,
  })
  return res.data
}
