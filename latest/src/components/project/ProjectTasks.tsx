'use client'

import { useEffect, useState } from 'react'
import { getProjectTasks } from '@/api/task'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TaskCard } from './TaskCard'
import { MarkTaskComplete } from './MarkTaskComplete'
import { useUser } from '@/hooks/useUser'
import { Button } from '@/components/ui/button'

interface Props {
  projectId: string
  userRole: string
}

export function ProjectTasks({ projectId, userRole }: Props) {
  const [tasks, setTasks] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)
  const { user } = useUser()

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getProjectTasks(projectId)
        setTasks(res)
      } catch {
        setTasks([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [projectId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 6 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!tasks || tasks.length === 0) {
    return <EmptyState title="No Tasks" description="This project has no tasks yet." />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {tasks.map((task) => {
        const isAssigned = task.assignedTo === user?.id
        const canComplete = userRole === 'owner' || isAssigned
        return (
          <div key={task.Id} className="space-y-2">
            <TaskCard task={task} userRole={userRole} />
            {canComplete && !task.completed && (
              <MarkTaskComplete taskId={task.Id}>
                <Button size="sm" className="w-full">Mark as Done</Button>
              </MarkTaskComplete>
            )}
          </div>
        )
      })}
    </div>
  )
}
