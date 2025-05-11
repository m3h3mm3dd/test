/* File: src/api/project.ts */

import axios from '@/lib/axios'

export async function getProjects() {
  const res = await axios.get('/projects')
  return res.data
}

export async function getProjectById(projectId: string) {
  const res = await axios.get(`/projects/${projectId}`)
  return res.data
}

export async function createProject(data: {
  Name: string
  Description?: string
  Deadline?: string
  TotalBudget?: number
}) {
  const res = await axios.post('/projects/create', data)
  return res.data
}

export async function updateProject(projectId: string, data: {
  Name: string
  Description?: string
  Deadline?: string
  TotalBudget?: number
}) {
  const res = await axios.put(`/projects/${projectId}/update`, data)
  return res.data
}

export async function deleteProject(projectId: string) {
  const res = await axios.delete(`/projects/${projectId}/delete`)
  return res.data
}
