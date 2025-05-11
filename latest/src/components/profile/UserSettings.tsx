'use client'

import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'
import { ThemeToggle } from '@/components/ui/ThemeToggle'
import { Card } from '@/components/ui/card'

export function UserSettings() {
  const { user } = useUser()

  if (!user) return null

  return (
    <Card className="max-w-md w-full mx-auto p-6 space-y-4 bg-white/5 border border-white/10 shadow-md backdrop-blur-md">
      <div className="space-y-1">
        <h2 className="text-xl font-semibold">Your Settings</h2>
        <p className="text-sm text-muted-foreground">Manage your account and preferences</p>
      </div>

      <div className="text-sm space-y-1">
        <p><strong>Name:</strong> {user.name}</p>
        <p><strong>Email:</strong> {user.email}</p>
        <p><strong>Role:</strong> {user.role}</p>
      </div>

      <div>
        <ThemeToggle />
      </div>

      <div className="pt-4 space-x-2">
        <Button variant="destructive">Delete Account</Button>
        <Button variant="ghost">Log Out</Button>
      </div>
    </Card>
  )
}
