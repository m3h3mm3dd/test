'use client'

import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { useRouter } from 'next/navigation'
import { cn } from '@/lib/utils'

interface GlobalTaskCardProps {
  task: any
  project: any
}

export const GlobalTaskCard: FC<GlobalTaskCardProps> = ({ task, project }) => {
  const router = useRouter()
  const isDone = task.Status === 'DONE'

  return (
    <Card
      onClick={() => router.push(`/dashboard/projects/${project.Id}`)}
      className={cn(
        'p-4 hover:shadow-md transition cursor-pointer space-y-1',
        isDone && 'opacity-70 line-through'
      )}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-semibold truncate">{task.Title}</h3>
        <Badge variant="outline">{task.Priority}</Badge>
      </div>
      <p className="text-muted-foreground text-sm truncate">{task.Description}</p>
      <p className="text-xs text-muted-foreground">Project: {project.Title}</p>
      {task.DueDate && (
        <p className="text-xs">
          Due: {new Date(task.DueDate).toLocaleDateString()}
        </p>
      )}
    </Card>
  )
}
