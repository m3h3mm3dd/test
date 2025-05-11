"use client"

import { useEffect, useState } from "react"

export type UserRole = "owner" | "leader" | "member" | "stakeholder"

export interface User {
  id: string
  name: string
  email: string
  role: UserRole
  avatarUrl?: string
}

export function useUser() {
  const [user, setUser] = useState<User | null>(null)

  useEffect(() => {
    try {
      const stored = localStorage.getItem("taskup_user")
      if (stored) {
        setUser(JSON.parse(stored))
      }
    } catch (err) {
      console.error("Failed to load user", err)
    }
  }, [])

  const role = user?.role ?? null

  return {
    user,
    role,
    isOwner: role === "owner",
    isLeader: role === "leader",
    isMember: role === "member",
    isStakeholder: role === "stakeholder",
    isAuthenticated: !!user,
  }
}
