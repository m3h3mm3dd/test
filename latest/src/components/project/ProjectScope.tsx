'use client'

import { useEffect, useState } from 'react'
import { getProjectScope } from '@/api/scope'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/ui/EmptyState'
import { Button } from '@/components/ui/button'

interface Props {
  projectId: string
  userRole: string
}

export function ProjectScope({ projectId, userRole }: Props) {
  const [scope, setScope] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getProjectScope(projectId)
        setScope(res)
      } catch {
        setScope(null)
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [projectId])

  const editable = userRole === 'Project Owner'

  if (loading) return <Skeleton className="h-24 w-full rounded-xl" />

  if (!scope) {
    return <EmptyState title="No Scope" description="No scope documents have been assigned to this project." />
  }

  return (
    <div className="space-y-4">
      <ScopeSection title="Scope Management Plan" content={scope.ScopeManagementPlan?.Content} editable={editable} />
      <ScopeSection title="Requirement Document" content={scope.RequirementDocument?.Content} editable={editable} />
      <ScopeSection title="Scope Statement" content={scope.ScopeStatement?.Content} editable={editable} />
      <ScopeSection title="Work Breakdown Structure" content={scope.WBS?.Content} editable={editable} />
    </div>
  )
}

function ScopeSection({ title, content, editable }: { title: string; content?: string; editable: boolean }) {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 dark:bg-white/10 dark:border-white/20">
      <div className="flex justify-between items-center mb-1">
        <h3 className="font-semibold text-base">{title}</h3>
        {editable && <Button size="sm" variant="ghost" className="text-xs">Edit</Button>}
      </div>
      <p className="text-sm text-muted-foreground whitespace-pre-wrap">
        {content || '— No content —'}
      </p>
    </div>
  )
}
