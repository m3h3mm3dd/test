'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'

export function useUserRole(projectId: string, ownerId: string) {
  const [role, setRole] = useState<string | null>(null)

  useEffect(() => {
    const fetchRole = async () => {
      try {
        const res = await axios.get(`/projects/${projectId}/members`)
        const currentUserId = localStorage.getItem('userId')

        if (!currentUserId) throw new Error('Not logged in')

        if (currentUserId === ownerId) {
          setRole('Project Owner')
          return
        }

        const member = res.data.find((m: any) => m.UserId === currentUserId)
        if (member) {
          setRole(member.Role || 'Member')
          return
        }

        const stakeholderRes = await axios.get(`/stakeholders/project/${projectId}`)
        const stakeholder = stakeholderRes.data.find((s: any) => s.UserId === currentUserId)
        if (stakeholder) {
          setRole('Stakeholder')
          return
        }

        throw new Error('User not part of project')
      } catch (err) {
        console.error(err)
        setRole('Forbidden')
      }
    }

    fetchRole()
  }, [projectId, ownerId])

  return role
}
