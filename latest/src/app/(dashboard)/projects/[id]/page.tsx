'use client'

import { useParams, useRouter } from 'next/navigation'
import { useEffect, useState, useRef } from 'react'
import { getProjectById } from '@/api/ProjectAPI'
import { Tabs } from '@/components/ui/tabs'
import { ProjectTasks } from '@/components/project/ProjectTasks'
import { ProjectTeam } from '@/components/project/ProjectTeam'
import { ProjectStakeholders } from '@/components/project/ProjectStakeholders'
import { ProjectScope } from '@/components/project/ProjectScope'
import { ProjectRisks } from '@/components/project/ProjectRisks'
import { ProjectAttachments } from '@/components/project/ProjectAttachments'
import { ProjectActivityLog } from '@/components/project/ProjectActivityLog'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { motion, AnimatePresence } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Edit, Calendar, BarChart2, DollarSign, Users } from 'lucide-react'
import { cn } from '@/lib/utils'
import { format, isPast } from 'date-fns'
import { DeleteProjectButton } from '@/components/project/DeleteProjectButton'
import { toast } from '@/lib/toast'

export default function ProjectDetailPage() {
  const { id } = useParams() as { id: string }
  const router = useRouter()
  const { user } = useAuth()
  const [project, setProject] = useState<any | null>(null)
  const [loading, setLoading] = useState(true)
  const [tab, setTab] = useState('overview')
  const contentRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    async function loadProject() {
      setLoading(true)
      try {
        const data = await getProjectById(id)
        setProject(data)
      } catch (error) {
        console.error('Failed to load project:', error)
        toast.error('Failed to load project details')
        router.push('/projects')
      } finally {
        setLoading(false)
      }
    }
    
    loadProject()
  }, [id, router])

  useEffect(() => {
    // Scroll to top when changing tabs
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' })
  }, [tab])

  // Determine user role
  const isOwner = user?.Id === project?.OwnerId
  
  // Calculate user role in project
  const getUserRole = () => {
    if (isOwner) return 'Project Owner'
    
    // Check if user is a team leader in any project team
    const isTeamLeader = project?.teams?.some(team => 
      team.LeaderId === user?.Id
    )
    if (isTeamLeader) return 'Team Leader'
    
    // Check if user is a stakeholder
    const isStakeholder = project?.stakeholders?.some(stake =>
      stake.UserId === user?.Id
    )
    if (isStakeholder) return 'Stakeholder'
    
    // Check if user is a member
    const isMember = project?.members?.some(member =>
      member.UserId === user?.Id
    )
    if (isMember) return 'Member'
    
    return 'Viewer'
  }
  
  const userRole = getUserRole()

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-20 w-full rounded-xl" />
        <Skeleton className="h-12 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  if (!project) {
    return (
      <div className="p-6 flex items-center justify-center h-[60vh]">
        <div className="text-center space-y-4">
          <h2 className="text-xl font-medium">Project not found</h2>
          <p className="text-muted-foreground">This project may have been deleted or you don't have access.</p>
          <Button onClick={() => router.push('/projects')}>
            Return to Projects
          </Button>
        </div>
      </div>
    )
  }

  const deadline = project.Deadline ? new Date(project.Deadline) : null
  const isOverdue = deadline ? isPast(deadline) : false

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Tasks', value: 'tasks' },
    { label: 'Team', value: 'team' },
    { label: 'Stakeholders', value: 'stakeholders' },
    { label: 'Scope', value: 'scope' },
    { label: 'Risks', value: 'risks' },
    { label: 'Attachments', value: 'attachments' },
    { label: 'Activity', value: 'activity' },
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 space-y-6"
    >
      <GlassPanel className="p-6">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div>
            <h1 className="text-2xl font-semibold">{project.Name}</h1>
            <p className="text-muted-foreground mt-2 max-w-3xl">{project.Description || 'No description provided'}</p>
          </div>
          
          {isOwner && (
            <div className="flex gap-2 whitespace-nowrap">
              <Button 
                size="sm" 
                onClick={() => router.push(`/projects/${project.Id}/edit`)}
              >
                <Edit className="h-4 w-4 mr-1.5" /> Edit
              </Button>
              <DeleteProjectButton projectId={project.Id} />
            </div>
          )}
        </div>
      </GlassPanel>

      <Tabs tabs={tabs} value={tab} onChange={setTab} fullWidth />

      <div ref={contentRef} className="relative min-h-[360px]">
        <AnimatePresence mode="wait">
          {tab === 'overview' && (
            <motion.div
              key="overview"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <GlassPanel className="p-6 space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {/* Progress Card */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <BarChart2 className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-base font-medium">Progress</h3>
                    </div>
                    <div className="space-y-2">
                      <div className="text-2xl font-bold">{project.Progress || 0}%</div>
                      <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${project.Progress || 0}%` }}
                        />
                      </div>
                    </div>
                  </div>
                  
                  {/* Deadline Card */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <Calendar className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-base font-medium">Deadline</h3>
                    </div>
                    {deadline ? (
                      <div className="space-y-1">
                        <div className={cn(
                          "text-2xl font-bold",
                          isOverdue && "text-red-500"
                        )}>
                          {format(deadline, 'MMM d, yyyy')}
                        </div>
                        <div className={cn(
                          "text-sm text-muted-foreground",
                          isOverdue && "text-red-400"
                        )}>
                          {isOverdue ? 'Overdue' : 'On track'}
                        </div>
                      </div>
                    ) : (
                      <div className="text-muted-foreground">No deadline set</div>
                    )}
                  </div>
                  
                  {/* Budget Card */}
                  <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                    <div className="flex items-center space-x-2 mb-2">
                      <DollarSign className="h-5 w-5 text-muted-foreground" />
                      <h3 className="text-base font-medium">Budget</h3>
                    </div>
                    <div className="space-y-1">
                      <div className="text-2xl font-bold">
                        ${(project.TotalBudget || 0).toLocaleString()}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        Total budget
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Team Overview */}
                <div className="bg-white/5 backdrop-blur-md border border-white/10 rounded-xl p-4">
                  <div className="flex items-center space-x-2 mb-4">
                    <Users className="h-5 w-5 text-muted-foreground" />
                    <h3 className="text-base font-medium">Team Overview</h3>
                  </div>
                  
                  <div className="flex flex-wrap gap-4">
                    <div className="bg-white/5 rounded-lg p-3 min-w-[140px]">
                      <div className="text-xs text-muted-foreground">Teams</div>
                      <div className="text-2xl font-bold mt-1">
                        {project.teams?.length || 0}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3 min-w-[140px]">
                      <div className="text-xs text-muted-foreground">Members</div>
                      <div className="text-2xl font-bold mt-1">
                        {project.members?.length || 0}
                      </div>
                    </div>
                    
                    <div className="bg-white/5 rounded-lg p-3 min-w-[140px]">
                      <div className="text-xs text-muted-foreground">Stakeholders</div>
                      <div className="text-2xl font-bold mt-1">
                        {project.stakeholders?.length || 0}
                      </div>
                    </div>
                  </div>
                </div>
                
                {/* Additional Info */}
                <div className="space-y-2 pt-2">
                  <div className="flex flex-wrap gap-x-8 gap-y-2 text-sm">
                    <div>
                      <span className="text-muted-foreground">Created: </span>
                      <span>{format(new Date(project.CreatedAt), 'MMM d, yyyy')}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Owner: </span>
                      <span>{project.OwnerName || 'You'}</span>
                    </div>
                    <div>
                      <span className="text-muted-foreground">Your Role: </span>
                      <span>{userRole}</span>
                    </div>
                  </div>
                </div>
              </GlassPanel>
            </motion.div>
          )}

          {tab === 'tasks' && (
            <motion.div 
              key="tasks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectTasks projectId={project.Id} userRole={userRole} />
            </motion.div>
          )}

          {tab === 'team' && (
            <motion.div 
              key="team"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectTeam projectId={project.Id} userRole={userRole} />
            </motion.div>
          )}

          {tab === 'stakeholders' && (
            <motion.div 
              key="stakeholders"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectStakeholders projectId={project.Id} userRole={userRole} />
            </motion.div>
          )}

          {tab === 'scope' && (
            <motion.div 
              key="scope"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectScope projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'risks' && (
            <motion.div 
              key="risks"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectRisks projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'attachments' && (
            <motion.div 
              key="attachments"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectAttachments projectId={project.Id} />
            </motion.div>
          )}

          {tab === 'activity' && (
            <motion.div 
              key="activity"
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.25 }}
            >
              <ProjectActivityLog projectId={project.Id} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.div>
  )
}