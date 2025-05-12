'use client'

import { useEffect, useState } from 'react'
import { getProjectTeams } from '@/api/TeamAPI'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { TeamCard } from './TeamCard'

interface Props {
  projectId: string
  userRole: string
}

export function ProjectTeam({ projectId, userRole }: Props) {
  const [teams, setTeams] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getProjectTeams(projectId)
        setTeams(res)
      } catch {
        setTeams([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [projectId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-28 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!teams || teams.length === 0) {
    return <EmptyState title="No Teams" description="This project has no teams yet." />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
      {teams.map((team) => (
        <TeamCard key={team.Id} team={team} userRole={userRole} />
      ))}
    </div>
  )
}
