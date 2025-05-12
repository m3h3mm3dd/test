'use client'

import { useEffect, useState, useRef } from 'react'
import { useRouter } from 'next/navigation'
import { motion } from 'framer-motion'
import { 
  Calendar as CalendarIcon, 
  PieChart, 
  CheckCircle, 
  Clock, 
  AlertTriangle,
  Plus
} from 'lucide-react'
import { format } from 'date-fns'
import { getCurrentUser } from '@/api/user'
import { getProjects } from '@/api/project'
import { getProjectTasks } from '@/api/TaskAPI'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Skeleton } from '@/components/ui/skeleton'
import { SimpleCalendar } from '@/components/calendar/SimpleCalendar'
import { DashboardAnalytics } from '@/components/analytics/DashboardAnalytics'
import { ProjectSummaryGrid } from '@/components/dashboard/ProjectSummaryGrid'
import { RecentActivity } from '@/components/dashboard/RecentActivity'
import { EmptyState } from '@/components/ui/EmptyState'
import { TaskDialog } from '@/components/task/TaskDialog'
import { useUser } from '@/hooks/useUser'
import { toast } from '@/lib/toast'

// Animation variants
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.1
    }
  }
}

const item = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { duration: 0.4, ease: [0.4, 0.0, 0.2, 1] } }
}

export default function DashboardPage() {
  const router = useRouter()
  const { user, role, isAuthenticated } = useUser()
  const [projects, setProjects] = useState<any[]>([])
  const [tasks, setTasks] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [createTaskDialogOpen, setCreateTaskDialogOpen] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    completed: 0,
    urgent: 0,
    dueToday: 0
  })

  const canCreateTask = role === 'owner' || role === 'leader'

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/login')
      return
    }
    
    async function fetchData() {
      setLoading(true)
      try {
        // Get projects
        const projectsData = await getProjects()
        setProjects(projectsData)
        
        // Get tasks for all projects
        const taskPromises = projectsData.map((p: any) => getProjectTasks(p.Id))
        const taskResults = await Promise.all(taskPromises)
        const allTasks = taskResults.flat()
        
        // Filter user tasks
        const userTasks = allTasks.filter((t: any) => 
          t.UserId === user?.id
        )
        
        setTasks(userTasks)
        
        // Calculate stats
        const completed = userTasks.filter((t: any) => t.Status === 'Completed').length
        const urgent = userTasks.filter((t: any) => t.Priority === 'HIGH' || t.Priority === 'URGENT').length
        const today = new Date().toDateString()
        const dueToday = userTasks.filter((t: any) => {
          return t.Deadline && new Date(t.Deadline).toDateString() === today
        }).length
        
        setStats({
          total: userTasks.length,
          completed,
          urgent,
          dueToday
        })
      } catch (error) {
        console.error('Failed to load dashboard data:', error)
        toast.error('Failed to load dashboard data')
      } finally {
        setLoading(false)
      }
    }
    
    fetchData()
  }, [isAuthenticated, user])

  const handleTaskCreate = async (taskData: any) => {
    try {
      // Create task logic here
      await createTask({
        ...taskData,
        UserId: user?.id
      })
      
      toast.success('Task created successfully')
      // Refresh data
      router.refresh()
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-24 w-full rounded-xl" />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(4)].map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
        <Skeleton className="h-64 w-full rounded-xl" />
      </div>
    )
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="space-y-6"
    >
      {/* Quick Action Button (FAB) */}
      {canCreateTask && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8, y: 20 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          transition={{ delay: 0.5, type: 'spring', stiffness: 300, damping: 20 }}
          className="fixed right-6 bottom-6 z-50"
        >
          <Button
            size="lg"
            className="rounded-full shadow-lg flex items-center gap-2 px-6"
            onClick={() => setCreateTaskDialogOpen(true)}
          >
            <Plus className="h-5 w-5" />
            <span>New Task</span>
          </Button>
        </motion.div>
      )}

      {/* Stats Cards */}
      <motion.div variants={item} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <GlassPanel className="p-4 hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center drop-shadow-lg">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Total Tasks</p>
              <motion.h3
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
                className="text-2xl font-bold"
              >
                {stats.total}
              </motion.h3>
            </div>
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-4 hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-green-500/10 flex items-center justify-center drop-shadow-lg">
              <CheckCircle className="h-6 w-6 text-green-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Completed</p>
              <motion.h3
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4, duration: 0.5 }}
                className="text-2xl font-bold"
              >
                {stats.completed}
              </motion.h3>
            </div>
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-4 hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-amber-500/10 flex items-center justify-center drop-shadow-lg">
              <Clock className="h-6 w-6 text-amber-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Due Today</p>
              <motion.h3
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5, duration: 0.5 }}
                className="text-2xl font-bold"
              >
                {stats.dueToday}
              </motion.h3>
            </div>
          </div>
        </GlassPanel>
        
        <GlassPanel className="p-4 hover:shadow-xl transition-all duration-500">
          <div className="flex items-center gap-4">
            <div className="h-12 w-12 rounded-full bg-red-500/10 flex items-center justify-center drop-shadow-lg">
              <AlertTriangle className="h-6 w-6 text-red-500" />
            </div>
            <div>
              <p className="text-sm font-medium text-muted-foreground">Urgent</p>
              <motion.h3
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.6, duration: 0.5 }}
                className="text-2xl font-bold"
              >
                {stats.urgent}
              </motion.h3>
            </div>
          </div>
        </GlassPanel>
      </motion.div>
      
      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Projects & Tasks (2/3 width) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Projects Section */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Projects</h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => router.push('/projects')}
                className="group"
              >
                <span>View All</span>
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Button>
            </div>
            
            {projects.length > 0 ? (
              <ProjectSummaryGrid projects={projects.slice(0, 3)} />
            ) : (
              <EmptyState 
                title="No projects yet" 
                description="Create your first project to get started"
                action={<Button onClick={() => router.push('/projects/create')}>Create Project</Button>}
              />
            )}
          </motion.section>
          
          {/* Tasks Section */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Your Tasks</h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => router.push('/tasks')}
                className="group"
              >
                <span>View All</span>
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Button>
            </div>
            
            <GlassPanel className="p-0 overflow-hidden">
              {tasks.length > 0 ? (
                <div className="divide-y divide-white/10">
                  {tasks.slice(0, 5).map((task, index) => (
                    <motion.div
                      key={task.Id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.4, delay: index * 0.1 }}
                      onClick={() => router.push(`/tasks/${task.Id}`)}
                      className="p-4 hover:bg-white/5 transition-colors cursor-pointer"
                    >
                      <div className="flex justify-between items-start">
                        <div>
                          <h3 className="font-medium">{task.Title}</h3>
                          <p className="text-sm text-muted-foreground line-clamp-1 mt-1">
                            {task.Description || 'No description'}
                          </p>
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <Badge variant={task.Priority === 'HIGH' || task.Priority === 'URGENT' ? 'destructive' : 'outline'}>
                            {task.Priority}
                          </Badge>
                          {task.Deadline && (
                            <p className="text-xs text-muted-foreground">
                              {format(new Date(task.Deadline), 'MMM d, yyyy')}
                            </p>
                          )}
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              ) : (
                <div className="p-6 text-center">
                  <p className="text-muted-foreground">No tasks assigned to you</p>
                  {canCreateTask && (
                    <Button className="mt-2" size="sm" onClick={() => setCreateTaskDialogOpen(true)}>
                      Create Task
                    </Button>
                  )}
                </div>
              )}
            </GlassPanel>
          </motion.section>
          
          {/* Analytics Preview */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Analytics</h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => router.push('/analytics')}
                className="group"
              >
                <span>View Detailed</span>
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Button>
            </div>
            
            <GlassPanel className="p-4">
              <DashboardAnalytics userId={user?.id} />
            </GlassPanel>
          </motion.section>
        </div>
        
        {/* Right Column - Calendar & Activity (1/3 width) */}
        <div className="space-y-6">
          {/* Calendar Widget */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Calendar</h2>
              <Button 
                size="sm" 
                variant="outline" 
                onClick={() => router.push('/calendar')}
                className="group"
              >
                <span>Open</span>
                <span className="ml-1 inline-block transition-transform group-hover:translate-x-1">→</span>
              </Button>
            </div>
            
            <GlassPanel className="p-4">
              <SimpleCalendar 
                tasks={tasks}
                onDateClick={(date) => router.push(`/calendar?date=${format(date, 'yyyy-MM-dd')}`)}
              />
            </GlassPanel>
          </motion.section>
          
          {/* Recent Activity */}
          <motion.section variants={item}>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold">Recent Activity</h2>
            </div>
            
            {projects.length > 0 ? (
              <RecentActivity projectId={projects[0]?.Id} limit={5} />
            ) : (
              <GlassPanel className="p-4">
                <p className="text-center text-muted-foreground">No recent activity</p>
              </GlassPanel>
            )}
          </motion.section>
        </div>
      </div>
      
      {/* Task Creation Dialog */}
      <TaskDialog
        open={createTaskDialogOpen}
        onOpenChange={setCreateTaskDialogOpen}
        onSubmit={handleTaskCreate}
        projectId={projects[0]?.Id}
      />
    </motion.div>
  )
}