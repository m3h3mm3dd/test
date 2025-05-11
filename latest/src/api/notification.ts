import axios from '@/lib/axios'

export async function getNotificationsForProject(projectId: string) {
  const res = await axios.get(`/projects/${projectId}/notifications`)
  return res.data
}
