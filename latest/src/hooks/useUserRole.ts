'use client'

import { useEffect, useState } from 'react'
import axios from '@/lib/axios'

export function useUserRole(projectId?: string, ownerId?: string) {
  const [role, setRole] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchRole = async () => {
      if (!projectId || !ownerId) {
        setRole('member') 
        setLoading(false)
        return
      }

      try {
        const currentUserId = localStorage.getItem('userId')

        if (!currentUserId) {
          setRole('member')
          setLoading(false)
          return
        }

        if (currentUserId === ownerId) {
          setRole('Project Owner')
          setLoading(false)
          return
        }

        const res = await axios.get(`/projects/${projectId}/members`)
        
        const member = res.data.find((m: any) => m.UserId === currentUserId)
        if (member) {
          setRole(member.Role || 'Member')
          setLoading(false)
          return
        }

        const stakeholderRes = await axios.get(`/stakeholders/project/${projectId}`)
        const stakeholder = stakeholderRes.data.find((s: any) => s.UserId === currentUserId)
        if (stakeholder) {
          setRole('Stakeholder')
          setLoading(false)
          return
        }

        setRole('member') 
      } catch (err) {
        console.error(err)
        setRole('member') 
            } finally {
        setLoading(false)
      }
    }

    fetchRole()
  }, [projectId, ownerId])

  return { role, loading }
}