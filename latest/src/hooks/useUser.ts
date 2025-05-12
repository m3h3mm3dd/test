'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { api } from '@/lib/axios'
import { toast } from '@/lib/toast'

export type UserRole = 'project_owner' | 'team_leader' | 'member' | 'stakeholder'

export interface AuthUser {
  Id: string
  FirstName: string
  LastName: string
  Email: string
  Role: UserRole
  JobTitle?: string
  ProfileUrl?: string
  LastLogin?: string
}

export function useUser(requiredRole?: UserRole | UserRole[]) {
  const router = useRouter()
  const [user, setUser] = useState<AuthUser | null>(null)
  const [loading, setLoading] = useState(true)
  const [initialized, setInitialized] = useState(false)

  useEffect(() => {
    const verify = async () => {
      try {
        const token = typeof window !== 'undefined' ? localStorage.getItem('taskup_token') : null

        if (!token) {
          setLoading(false)
          router.push('/auth/login')
          return
        }

        const { data } = await api.get<AuthUser>('/auth/me')
        setUser(data)

        if (requiredRole) {
          const allowed = Array.isArray(requiredRole)
            ? requiredRole.includes(data.Role)
            : data.Role === requiredRole

          if (!allowed) {
            toast.error('You do not have permission to access this page')
            router.push('/dashboard')
            return
          }
        }

        setInitialized(true)
      } catch (error: any) {
        const status = error?.response?.status
        if (status === 401 || status === 403) {
          localStorage.removeItem('taskup_token')
          router.push('/auth/login')
        } else {
          console.warn('Auth check error:', error)
        }
      } finally {
        setLoading(false)
      }
    }

    verify()
  }, [requiredRole, router])

  const login = async (email: string, password: string) => {
    try {
      const { data } = await api.post('/auth/login', { Email: email, Password: password })
      localStorage.setItem('taskup_token', data.access_token)

      const { data: userData } = await api.get<AuthUser>('/auth/me')
      setUser(userData)

      return true
    } catch (error: any) {
      const message =
        error.response?.data?.detail || error.response?.data?.message || 'Login failed'
      throw new Error(message)
    }
  }

  const logout = () => {
    localStorage.removeItem('taskup_token')
    setUser(null)
    router.push('/auth/login')
  }

  const hasRole = (role: UserRole | UserRole[]) => {
    if (!user) return false
    return Array.isArray(role) ? role.includes(user.Role) : user.Role === role
  }

  return {
    user,
    loading,
    initialized,
    login,
    logout,
    hasRole,
    role: user?.Role || null,
    isAuthenticated: !!user,
    isProjectOwner: user?.Role === 'project_owner',
    isTeamLeader: user?.Role === 'team_leader',
    isMember: user?.Role === 'member',
    isStakeholder: user?.Role === 'stakeholder',
    userName: user ? `${user.FirstName} ${user.LastName}` : '',
  }
}
