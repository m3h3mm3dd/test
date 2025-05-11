'use client'

import { Card } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { cn } from '@/lib/utils'

interface TeamCardProps {
  team: {
    Id: string
    Name: string
    Description?: string
    ColorIndex?: number
    CreatedBy: string
  }
  userRole?: string  
}

export function TeamCard({ team, userRole = 'member' }: TeamCardProps) {
  const canEdit = userRole === 'owner' || userRole === 'leader'

  return (
    <Card
      className={cn(
        'p-4 bg-white/5 rounded-xl border border-white/10 shadow-sm space-y-2 backdrop-blur-md hover:scale-[1.01] transition-transform',
        'dark:bg-white/10 dark:border-white/20'
      )}
    >
      <div className="flex justify-between items-center">
        <h3 className="text-base font-semibold">{team.Name}</h3>
        <Badge className="text-xs capitalize">{userRole}</Badge>
      </div>

      <p className="text-sm text-muted-foreground line-clamp-3">
        {team.Description || 'No description provided.'}
      </p>

      {canEdit && (
        <div className="flex justify-end pt-2">
          <Button size="sm" variant="ghost" className="text-xs">
            Manage
          </Button>
        </div>
      )}
    </Card>
  )
}