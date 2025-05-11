import axios from '@/lib/axios'

export async function getProjectTeams(projectId: string) {
  const res = await axios.get(`/projects/${projectId}/teams`)
  return res.data
}
export async function createTeam(data: {
  Name: string
  Description?: string
  ColorIndex?: number
  ProjectId: string
}) {
  const res = await axios.post('/teams/create', data)
  return res.data
}