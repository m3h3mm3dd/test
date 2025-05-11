import axios from '@/lib/axios'

export async function getCurrentUser() {
  const res = await axios.get('/auth/me')
  return res.data
}

export async function updateUserSettings(data: {
  FirstName: string
  LastName: string
  Email: string
  JobTitle?: string
}) {
  const res = await axios.put('/auth/update-profile', data)
  return res.data
}

export async function updatePassword(data: {
  Password: string
}) {
  const res = await axios.put('/auth/update-password', data)
  return res.data
}

export async function deleteAccount() {
  const res = await axios.delete('/auth/delete-account')
  return res.data
}
