import axios from '@/lib/axios'

export async function getProjectScope(projectId: string) {
  const res = await axios.get(`/projects/${projectId}/scope`)
  return res.data
}
