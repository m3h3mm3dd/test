// src/app/(dashboard)/projects/[id]/page.tsx
'use client'

import { useParams } from 'next/navigation'
import { useEffect, useState } from 'react'
import { useSession } from 'next-auth/react'
import { getProjectById } from '@/api/ProjectAPI'
import { useUserProjectRole } from '@/hooks/useUserProjectRole'
import { Tabs } from '@/components/ui/tabs' 

import { ProjectTasks } from '@/components/project/ProjectTasks'
import { ProjectTeam } from '@/components/project/ProjectTeam'
import { ProjectScope } from '@/components/project/ProjectScope'
import { ProjectRisks } from '@/components/project/ProjectRisks'
import { ProjectAttachments } from '@/components/project/ProjectAttachments'
import { ProjectActivityLog } from '@/components/project/ProjectActivityLog'
import { ResourceTable } from '@/components/project/ResourceTable' 
export default function ProjectOverviewPage() {
  const { id } = useParams() as { id: string }
  const { data: session } = useSession()
  const [project, setProject] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getProjectById(id)
        setProject(data)
      } catch {
        setProject(null)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  const role = useUserProjectRole(project, session?.user?.id)

  if (loading) return <div className="p-6 text-muted-foreground">Loading project...</div>
  if (!project) return <div className="p-6 text-destructive font-medium">Project not found or access denied.</div>

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Tasks', value: 'tasks' },
    ...(role.isOwner || role.isTeamLeader ? [{ label: 'Team', value: 'team' }] : []),
    { label: 'Scope', value: 'scope' },
    { label: 'Risk', value: 'risk' },
    { label: 'Resources', value: 'resources' },
    { label: 'Attachments', value: 'attachments' },
    { label: 'Activity', value: 'activity' },
  ]

  return (
    <div className="px-4 py-6 md:px-8 max-w-screen-xl mx-auto">
      <h1 className="text-2xl font-semibold mb-6">{project.title}</h1>

      <Tabs tabs={tabs} value={tab} onChange={setTab} className="mb-4" />

      {tab === 'overview' && (
        <div className="grid gap-2 text-sm text-muted-foreground mt-4">
          <p><span className="font-medium text-foreground">Owner:</span> {project.owner?.name}</p>
          <p><span className="font-medium text-foreground">Created:</span> {new Date(project.created_at).toLocaleString()}</p>
          <p><span className="font-medium text-foreground">Description:</span> {project.description || 'No description'}</p>
        </div>
      )}

      {tab === 'tasks' && <ProjectTasks projectId={id} />}
      {tab === 'team' && (role.isOwner || role.isTeamLeader) && <ProjectTeam projectId={id} />}
      {tab === 'scope' && <ProjectScope projectId={id} />}
      {tab === 'risk' && <ProjectRisks projectId={id} />}
      {tab === 'resources' && <ResourceTable projectId={id} />}
      {tab === 'attachments' && <ProjectAttachments projectId={id} />}
      {tab === 'activity' && <ProjectActivityLog projectId={id} />}
    </div>
  )
}
