'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface StakeholderCardProps {
  stakeholder: {
    Id: string
    User: {
      FirstName: string
      LastName: string
      Email: string
      ProfileUrl?: string
    }
    Percentage: number
  }
  userRole: string
}

export function StakeholderCard({ stakeholder, userRole }: StakeholderCardProps) {
  const canManage = userRole === 'Project Owner'
  const fullName = `${stakeholder.User.FirstName} ${stakeholder.User.LastName}`

  return (
    <Card
      className={cn(
        'p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm backdrop-blur-md transition-all hover:scale-[1.01]',
        'dark:bg-white/10 dark:border-white/20'
      )}
    >
      <div className="flex items-center justify-between mb-2">
        <h3 className="text-base font-semibold">{fullName}</h3>
        <Badge className="text-xs">{stakeholder.Percentage}%</Badge>
      </div>

      <p className="text-sm text-muted-foreground">{stakeholder.User.Email}</p>

      {canManage && (
        <div className="pt-2 flex justify-end">
          <Button variant="ghost" size="sm" className="text-xs">Remove</Button>
        </div>
      )}
    </Card>
  )
}
