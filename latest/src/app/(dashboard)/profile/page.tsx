'use client'

import { useUser } from '@/hooks/useUser'
import { Avatar } from '@/components/ui/avatar'
import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'

export default function ProfilePage() {
  const { user } = useUser()

  if (!user) return null

  return (
    <main className="p-6 flex justify-center">
      <Card className="max-w-md w-full p-6 space-y-6 bg-white/5 border border-white/10 shadow-md backdrop-blur-md">
        <div className="flex flex-col items-center text-center space-y-2">
          <Avatar
            src={user.avatarUrl}
            name={user.name}
            size="lg"
            shape="circle"
          />
          <div>
            <h2 className="text-xl font-semibold">{user.name}</h2>
            <p className="text-sm text-muted-foreground">{user.email}</p>
            <p className="text-xs text-zinc-400 mt-1 capitalize">
              Role: {user.role}
            </p>
          </div>
        </div>

        <div className="flex justify-center gap-2 pt-2">
          <Button variant="secondary" size="sm">
            Edit Profile
          </Button>
          <Button variant="ghost" size="sm">
            Log Out
          </Button>
        </div>
      </Card>
    </main>
  )
}
