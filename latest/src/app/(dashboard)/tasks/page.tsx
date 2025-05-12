'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { 
  getProjectTasks, 
  deleteTask, 
  markTaskComplete,
  updateTask
} from '@/api/TaskAPI'
import { getProjects } from '@/api/ProjectAPI'
import { getProjectTeams } from '@/api/TeamAPI'
import { getCurrentUser } from '@/api/UserAPI'
import { TaskCard } from '@/components/task/TaskCard'
import { TaskDialog } from '@/components/task/TaskDialog'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Skeleton } from '@/components/ui/skeleton'
import { PlusCircle, Filter, SortAsc, SortDesc } from 'lucide-react'
import { Dropdown } from '@/components/ui/Dropdown'
import { toast } from '@/lib/toast'
import { SearchInput } from '@/components/ui/SearchInput'
import { EmptyState } from '@/components/ui/EmptyState'

type TaskSort = 'deadline' | 'priority' | 'status' | 'created';
type SortDirection = 'asc' | 'desc';

export default function TaskOverviewPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [createDialogOpen, setCreateDialogOpen] = useState(false)
  const [loading, setLoading] = useState(true)
  const [filters, setFilters] = useState({
    time: 'all',
    priority: 'all',
    projectId: 'all',
    search: ''
  })
  const [sortField, setSortField] = useState<TaskSort>('created')
  const [sortDirection, setSortDirection] = useState<SortDirection>('desc')
  const [filteredTasks, setFilteredTasks] = useState<any[]>([])
  const router = useRouter()

  // Determine user role for permissions
  const userRole = user?.Role || null
  const canCreateTask = userRole === 'project_owner' || userRole === 'team_leader'

  useEffect(() => {
    async function load() {
      setLoading(true)
      try {
        const currentUser = await getCurrentUser()
        const allProjects = await getProjects()
        
        // Fetch tasks for each project and attach project info to tasks
        const allTasks = await Promise.all(
          allProjects.map(async (p: any) => {
            const tasks = await getProjectTasks(p.Id)
            return tasks.map(task => ({ ...task, __project: p }))
          })
        )
        
        // Flatten the tasks array
        const flattenedTasks = allTasks.flat()
        
        // Get teams for all projects
        const teamResponses = await Promise.all(
          allProjects.map(p => getProjectTeams(p.Id))
        )
        const allTeams = teamResponses.flat()
        
        setUser(currentUser)
        setProjects(allProjects)
        setTeams(allTeams)
        setTasks(flattenedTasks)
      } catch (error) {
        console.error('Failed to load task data:', error)
        toast.error('Failed to load tasks')
      } finally {
        setLoading(false)
      }
    }
    
    load()
  }, [])

  // Apply filters and sorting whenever tasks or filter/sort settings change
  useEffect(() => {
    applyFiltersAndSort()
  }, [tasks, filters, sortField, sortDirection])

  const applyFiltersAndSort = () => {
    let result = [...tasks]

    // Apply search
    if (filters.search) {
      const query = filters.search.toLowerCase()
      result = result.filter(task => 
        task.Title.toLowerCase().includes(query) || 
        (task.Description && task.Description.toLowerCase().includes(query))
      )
    }

    // Apply status filter
    if (filters.priority !== 'all') {
      result = result.filter(task => task.Priority === filters.priority)
    }

    // Apply project filter
    if (filters.projectId !== 'all') {
      result = result.filter(task => task.ProjectId === filters.projectId)
    }

    // Apply time filter
    if (filters.time === 'day') {
      const today = new Date()
      const todayStr = today.toDateString()
      result = result.filter(task => {
        if (!task.Deadline) return false
        return new Date(task.Deadline).toDateString() === todayStr
      })
    } else if (filters.time === 'week') {
      const today = new Date()
      const oneWeekLater = new Date()
      oneWeekLater.setDate(today.getDate() + 7)
      
      result = result.filter(task => {
        if (!task.Deadline) return false
        const taskDate = new Date(task.Deadline)
        return taskDate >= today && taskDate <= oneWeekLater
      })
    } else if (filters.time === 'month') {
      const today = new Date()
      const currentMonth = today.getMonth()
      const currentYear = today.getFullYear()
      
      result = result.filter(task => {
        if (!task.Deadline) return false
        const taskDate = new Date(task.Deadline)
        return taskDate.getMonth() === currentMonth && taskDate.getFullYear() === currentYear
      })
    }

    // Apply sorting
    result.sort((a, b) => {
      let comparison = 0
      
      switch (sortField) {
        case 'deadline':
          if (!a.Deadline) return 1
          if (!b.Deadline) return -1
          comparison = new Date(a.Deadline).getTime() - new Date(b.Deadline).getTime()
          break
        case 'priority': {
          const priorityOrder = { HIGH: 3, MEDIUM: 2, LOW: 1 }
          comparison = (priorityOrder[b.Priority] || 0) - (priorityOrder[a.Priority] || 0)
          break
        }
        case 'status': {
          const statusOrder = { 'Not Started': 1, 'In Progress': 2, 'Completed': 3 }
          comparison = (statusOrder[a.Status] || 0) - (statusOrder[b.Status] || 0)
          break
        }
        case 'created':
          comparison = new Date(b.CreatedAt).getTime() - new Date(a.CreatedAt).getTime()
          break
      }
      
      return sortDirection === 'asc' ? comparison : -comparison
    })

    setFilteredTasks(result)
  }

  const handleTaskCreate = async (taskData: any) => {
    try {
      const newTask = await createTask({
        ...taskData,
        ProjectId: taskData.ProjectId
      })
      
      // Find the project for this task to attach to task object
      const project = projects.find(p => p.Id === taskData.ProjectId)
      const taskWithProject = { ...newTask, __project: project }
      
      setTasks(prev => [...prev, taskWithProject])
      toast.success('Task created successfully')
      setCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create task:', error)
      toast.error('Failed to create task')
    }
  }

  const handleTaskUpdate = async (taskId: string, taskData: any) => {
    try {
      const updatedTask = await updateTask(taskId, taskData)
      
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? { ...updatedTask, __project: task.__project } : task
      ))
      
      toast.success('Task updated successfully')
      setSelectedTask(null)
    } catch (error) {
      console.error('Failed to update task:', error)
      toast.error('Failed to update task')
    }
  }

  const handleTaskDelete = async (taskId: string) => {
    if (!confirm('Are you sure you want to delete this task?')) return
    
    try {
      await deleteTask(taskId)
      
      setTasks(prev => prev.filter(task => task.Id !== taskId))
      toast.success('Task deleted successfully')
      setSelectedTask(null)
    } catch (error) {
      console.error('Failed to delete task:', error)
      toast.error('Failed to delete task')
    }
  }

  const handleTaskComplete = async (taskId: string) => {
    try {
      await markTaskComplete(taskId)
      
      setTasks(prev => prev.map(task => 
        task.Id === taskId ? { ...task, Completed: true, Status: 'Completed' } : task
      ))
      
      toast.success('Task marked as complete')
    } catch (error) {
      console.error('Failed to complete task:', error)
      toast.error('Failed to complete task')
    }
  }

  if (loading) {
    return (
      <div className="p-6 space-y-6">
        <Skeleton className="h-20 w-full rounded-xl" />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="h-32 rounded-xl" />
          ))}
        </div>
      </div>
    )
  }

  const statusOptions = [
    { label: 'All Statuses', value: 'all' },
    { label: 'Not Started', value: 'Not Started' },
    { label: 'In Progress', value: 'In Progress' },
    { label: 'Completed', value: 'Completed' }
  ]

  const priorityOptions = [
    { label: 'All Priorities', value: 'all' },
    { label: 'Low', value: 'LOW' },
    { label: 'Medium', value: 'MEDIUM' },
    { label: 'High', value: 'HIGH' }
  ]

  const sortOptions = [
    { label: 'Created Date', value: 'created' },
    { label: 'Deadline', value: 'deadline' },
    { label: 'Priority', value: 'priority' },
    { label: 'Status', value: 'status' }
  ]

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6 space-y-6"
    >
      <GlassPanel className="p-6 space-y-4">
        <div className="flex justify-between items-center">
          <h1 className="text-xl font-semibold">Task Overview</h1>
          {canCreateTask && (
            <Button onClick={() => setCreateDialogOpen(true)}>
              <PlusCircle className="h-4 w-4 mr-1" /> New Task
            </Button>
          )}
        </div>
        
        {/* Filters section */}
        <div className="flex flex-wrap gap-2 justify-between items-center">
          <div className="flex gap-2 flex-wrap">
            <SearchInput 
              value={filters.search}
              onChange={(value) => setFilters(prev => ({ ...prev, search: value }))}
              placeholder="Search tasks..."
              className="w-44 md:w-60"
            />
            
            <Dropdown
              trigger={<Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" /> Status</Button>}
              items={statusOptions}
              value={filters.status}
              onChange={(value) => setFilters(prev => ({ ...prev, status: value }))}
            />
            
            <Dropdown
              trigger={<Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" /> Priority</Button>}
              items={priorityOptions}
              value={filters.priority}
              onChange={(value) => setFilters(prev => ({ ...prev, priority: value }))}
            />
            
            <Dropdown
              trigger={
                <Button variant="outline" size="sm">
                  {sortDirection === 'asc' ? <SortAsc className="h-4 w-4 mr-1" /> : <SortDesc className="h-4 w-4 mr-1" />}
                  Sort by
                </Button>
              }
              items={sortOptions}
              value={sortField}
              onChange={(value) => {
                if (value === sortField) {
                  setSortDirection(prev => prev === 'asc' ? 'desc' : 'asc')
                } else {
                  setSortField(value as TaskSort)
                }
              }}
            />
            
            {projects.length > 0 && (
              <Dropdown
                trigger={<Button variant="outline" size="sm"><Filter className="h-4 w-4 mr-1" /> Project</Button>}
                items={[
                  { label: 'All Projects', value: 'all' },
                  ...projects.map(p => ({ label: p.Name || p.Title, value: p.Id }))
                ]}
                value={filters.projectId}
                onChange={(value) => setFilters(prev => ({ ...prev, projectId: value }))}
              />
            )}
          </div>
        </div>
      </GlassPanel>

      {/* Task grid */}
      {filteredTasks.length === 0 ? (
        <EmptyState 
          title="No Tasks Found" 
          description={tasks.length === 0 ? "You don't have any tasks yet." : "No tasks match your filters."} 
          action={
            canCreateTask ? 
              <Button onClick={() => setCreateDialogOpen(true)}>Create Task</Button> : 
              undefined
          }
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filteredTasks.map((task) => (
            <TaskCard 
              key={task.Id} 
              task={task}
              project={task.__project}
              showProjectInfo={true}
              onClick={() => setSelectedTask(task)}
              onComplete={() => handleTaskComplete(task.Id)}
              userRole={userRole}
              currentUserId={user?.Id}
            />
          ))}
        </div>
      )}

      {/* Create Task Dialog */}
      <TaskDialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        onSubmit={handleTaskCreate}
        projectId={filters.projectId !== 'all' ? filters.projectId : (projects[0]?.Id || '')}
      />

      {/* Edit Task Dialog */}
      {selectedTask && (
        <TaskDialog
          open={!!selectedTask}
          onOpenChange={() => setSelectedTask(null)}
          onSubmit={(data) => handleTaskUpdate(selectedTask.Id, data)}
          onDelete={() => handleTaskDelete(selectedTask.Id)}
          projectId={selectedTask.ProjectId}
          task={selectedTask}
        />
      )}
    </motion.div>
  )
}