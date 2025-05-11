'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProjects } from '@/api/project'
import { getProjectTasks } from '@/api/task'
import { getProjectTeams } from '@/api/team'
import { getCurrentUser } from '@/api/user'
import { TaskCard } from '@/components/project/TaskCard'
import { TeamCard } from '@/components/project/TeamCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { RoleWelcome } from '@/components/dashboard/RoleWelcome'
import { ProjectSummaryGrid } from '@/components/dashboard/ProjectSummaryGrid'
import { TaskStats } from '@/components/dashboard/TaskStats'

export default function DashboardPage() {
  const [user, setUser] = useState<any>(null)
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  const router = useRouter()

  useEffect(() => {
    async function fetchData() {
      try {
        const userData = await getCurrentUser()
        const [projectData, taskData, teamData] = await Promise.all([
          getProjects(),
          getProjectTasks('all'),
          getProjectTeams('all')
        ])
        setUser(userData)
        setProjects(projectData)
        setTasks(taskData.filter((t: any) => t.UserId === userData.Id))
        setTeams(teamData.filter((t: any) => t.LeaderId === userData.Id))
      } catch (err) {
        console.error('Failed to load dashboard:', err)
      } finally {
        setLoading(false)
      }
    }
    fetchData()
  }, [])

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-8 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-48 w-full" />
      </div>
    )
  }

  const completed = tasks.filter(t => t.Status === 'DONE').length
  const urgent = tasks.filter(t => t.Priority === 'HIGH' || t.Priority === 'URGENT').length

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
      className="p-6 space-y-8"
    >
      <RoleWelcome name={user?.FirstName} role={user?.Role} />

      <TaskStats total={tasks.length} completed={completed} urgent={urgent} />

      {projects.length > 0 && (
        <section className="space-y-2">
          <h2 className="text-xl font-semibold">Your Projects</h2>
          <ProjectSummaryGrid projects={projects} />
        </section>
      )}

      {tasks.length > 0 ? (
        <section>
          <h2 className="text-xl font-semibold mb-2">Your Tasks</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {tasks.map(task => (
              <TaskCard
                key={task.Id}
                task={task}
                onClick={() => router.push(`/dashboard/projects/${task.ProjectId}`)}
              />
            ))}
          </div>
        </section>
      ) : (
        <EmptyState title="No tasks assigned" subtitle="You're all caught up." />
      )}

      {teams.length > 0 && (
        <section>
          <h2 className="text-xl font-semibold mb-2">Teams You Lead</h2>
          <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
            {teams.map(team => (
              <TeamCard key={team.Id} team={team} />
            ))}
          </div>
        </section>
      )}

      <div className="flex justify-end">
        <Button onClick={() => router.push('/dashboard/projects')}>View All Projects</Button>
      </div>
    </motion.div>
  )
}
