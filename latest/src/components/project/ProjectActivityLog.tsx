'use client'

import { useEffect, useState } from 'react'
import { getProjectActivityLog } from '@/api/ActivityAPI'
import { Skeleton } from '@/components/ui/skeleton'
import { toast } from '@/lib/toast'

interface Props {
  projectId: string
}

export function ProjectActivityLog({ projectId }: Props) {
  const [activity, setActivity] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getProjectActivityLog(projectId)
        setActivity(res)
      } catch {
        toast.error('Failed to load activity log.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [projectId])

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-16 w-full rounded-xl" />
        ))}
      </div>
    )
  }

  if (!activity.length) {
    return <p className="text-sm text-muted-foreground">No activity recorded yet.</p>
  }

  return (
    <ul className="space-y-2">
      {activity.map((entry) => (
        <li
          key={entry.Id}
          className="p-4 rounded-lg bg-white/5 border border-white/10 backdrop-blur-md"
        >
          <p className="text-sm">{entry.Action}</p>
          <p className="text-xs text-muted-foreground mt-1">
            {new Date(entry.CreatedAt).toLocaleString()} — by {entry.User?.FirstName} {entry.User?.LastName}
          </p>
        </li>
      ))}
    </ul>
  )
}
