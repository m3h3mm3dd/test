'use client'

import { useEffect, useState, useRef } from 'react'
import { useParams } from 'next/navigation'
import { getProjectById } from '@/api/project'
import { getProjectTasks } from '@/api/task'
import { Tabs } from '@/components/ui/tabs'
import { ProjectScope } from '@/components/project/ProjectScope'
import { ProjectTeam } from '@/components/project/ProjectTeam'
import { ProjectStakeholders } from '@/components/project/ProjectStakeholders'
import { ProjectActivityLog } from '@/components/project/ProjectActivityLog'
import { ProjectAttachments } from '@/components/project/ProjectAttachments'
import { ProjectTasks } from '@/components/project/ProjectTasks'
import { ProjectChat } from '@/components/chat/ProjectChat'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { getCurrentUser } from '@/api/user'
import { ProjectHeaderActions } from '@/components/project/ProjectHeaderActions'

export default function ProjectDetailPage() {
  const { id } = useParams()
  const [user, setUser] = useState<any>(null)
  const [project, setProject] = useState<any>(null)
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function load() {
      try {
        const userData = await getCurrentUser()
        const projectData = await getProjectById(id as string)
        const taskData = await getProjectTasks(projectData.Id)
        setUser(userData)
        setProject(projectData)
        setTasks(taskData)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [id])

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tab])

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    )
  }

  if (!project) return <div className="p-6">Project not found.</div>

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Tasks', value: 'tasks' },
    { label: 'Team', value: 'team' },
    { label: 'Stakeholders', value: 'stakeholders' },
    { label: 'Scope', value: 'scope' },
    { label: 'Activity', value: 'activity' },
    { label: 'Files', value: 'attachments' },
    { label: 'Chat', value: 'chat' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 space-y-6"
    >
      <GlassPanel className="p-6">
        <h1 className="text-2xl font-semibold">{project.Name}</h1>
        <p className="text-muted-foreground mt-2 max-w-3xl">{project.Description}</p>
        {user && (
          <ProjectHeaderActions
            userId={user.Id}
            ownerId={project.OwnerId}
            projectId={project.Id}
          />
        )}
      </GlassPanel>

      <Tabs tabs={tabs} value={tab} onChange={setTab} fullWidth className="mt-4" />

      <div ref={contentRef} className="relative min-h-[360px]">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
              className="mt-4"
            >
              <GlassPanel className="p-4 text-muted-foreground">
                <p><strong>Progress:</strong> {project.Progress || 0}%</p>
                <p><strong>Deadline:</strong> {project.Deadline ? new Date(project.Deadline).toLocaleDateString() : '—'}</p>
                <p><strong>Budget:</strong> ${project.TotalBudget?.toLocaleString()}</p>
              </GlassPanel>
            </motion.div>
          )}

          {tab === 'tasks' && (
            <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectTasks tasks={tasks} projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'team' && (
            <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectTeam projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'stakeholders' && (
            <motion.div key="stakeholders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectStakeholders projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'scope' && (
            <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectScope projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'activity' && (
            <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectActivityLog projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'attachments' && (
            <motion.div key="attachments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectAttachments projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'chat' && (
            <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
              <ProjectChat projectId={project.Id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}
