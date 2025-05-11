import axios from '@/lib/axios'

export async function getProjectActivityLog(projectId: string) {
  const res = await axios.get(`/projects/${projectId}/activity`)
  return res.data
}
