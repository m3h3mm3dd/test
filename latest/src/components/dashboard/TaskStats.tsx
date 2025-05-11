"use client"

import { FC } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface TaskStatsProps {
  total: number
  completed: number
  urgent: number
}

export const TaskStats: FC<TaskStatsProps> = ({ total, completed, urgent }) => {
  return (
    <div className="grid md:grid-cols-3 gap-4">
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Total Tasks</h3>
        <p className="text-2xl font-bold text-primary">{total}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Completed</h3>
        <p className="text-2xl font-bold text-green-600">{completed}</p>
      </Card>
      <Card className="p-4">
        <h3 className="text-lg font-semibold">Urgent</h3>
        <p className={cn('text-2xl font-bold', urgent > 0 ? 'text-red-500' : 'text-muted-foreground')}>{urgent}</p>
      </Card>
    </div>
  )
}
