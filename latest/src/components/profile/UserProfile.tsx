'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser } from '@/api/user'
import { Skeleton } from '@/components/ui/skeleton'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'

export function UserProfile() {
  const [user, setUser] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getCurrentUser()
        setUser(res)
      } catch {
        setUser(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  if (loading) return <Skeleton className="h-24 w-full rounded-xl" />

  if (!user) return null

  return (
    <Card className="p-6 space-y-3 bg-white/5 backdrop-blur-md border border-white/10">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold">{user.FirstName} {user.LastName}</h2>
        <Badge>{user.Role || 'User'}</Badge>
      </div>
      <p className="text-sm text-muted-foreground">{user.Email}</p>
      {user.JobTitle && <p className="text-sm">{user.JobTitle}</p>}
    </Card>
  )
}
