'use client'

import { useEffect, useState } from 'react'
import { getProjectStakeholders } from '@/api/stakeholder'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { StakeholderCard } from './StakeholderCard'

interface Props {
  projectId: string
  userRole: string
}

export function ProjectStakeholders({ projectId, userRole }: Props) {
  const [stakeholders, setStakeholders] = useState<any[] | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getProjectStakeholders(projectId)
        setStakeholders(res)
      } catch {
        setStakeholders([])
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [projectId])

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {Array.from({ length: 3 }).map((_, i) => (
          <Skeleton key={i} className="h-20 rounded-xl" />
        ))}
      </div>
    )
  }

  if (!stakeholders || stakeholders.length === 0) {
    return <EmptyState title="No Stakeholders" description="No stakeholders added to this project." />
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {stakeholders.map((s) => (
        <StakeholderCard key={s.Id} stakeholder={s} userRole={userRole} />
      ))}
    </div>
  )
}
