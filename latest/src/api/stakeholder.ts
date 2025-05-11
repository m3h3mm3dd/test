import axios from '@/lib/axios'

export async function getProjectStakeholders(projectId: string) {
  const res = await axios.get(`/projects/${projectId}/stakeholders`)
  return res.data
}
