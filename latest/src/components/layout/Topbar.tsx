'use client'

import { ThemeToggle } from "@/components/ui/ThemeToggle"
import { UserProfile } from "@/components/profile/UserProfile"
import { useUser } from "@/hooks/useUser"
import { useEffect, useState } from "react"

export function Topbar() {
  const { user } = useUser()
  const [role, setRole] = useState<string>("")

  useEffect(() => {
    if (user?.role) setRole(user.role)
  }, [user])

  return (
    <div className="h-16 px-6 border-b border-muted bg-background flex items-center justify-between">
      <div className="flex items-center gap-4">
        <h1 className="text-lg font-semibold tracking-tight">TaskUp</h1>
        {role && <span className="text-sm text-muted-foreground">({role})</span>}
      </div>
      <div className="flex items-center gap-3">
        <ThemeToggle />
        <UserProfile user={user} />
      </div>
    </div>
  )
}
