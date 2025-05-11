'use client'

import { useEffect, useState } from 'react'
import { getProjects } from '@/api/project'
import { getProjectTasks, deleteTask, markTaskComplete } from '@/api/task'
import { getProjectTeams } from '@/api/team'
import { getCurrentUser } from '@/api/user'
import { TaskOverviewFilter } from '@/components/task/TaskOverviewFilter'
import { GlobalTaskCard } from '@/components/task/GlobalTaskCard'
import { CreateTaskDialog } from '@/components/task/CreateTaskDialog'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Dialog } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Button } from '@/components/ui/button'
import { TaskAttachments } from '@/components/task/TaskAttachments'
import { motion } from 'framer-motion'

export default function TaskOverviewPage() {
  const [tasks, setTasks] = useState<any[]>([])
  const [projects, setProjects] = useState<any[]>([])
  const [teams, setTeams] = useState<any[]>([])
  const [user, setUser] = useState<any>(null)
  const [selectedTask, setSelectedTask] = useState<any | null>(null)
  const [filters, setFilters] = useState({
    time: 'all',
    priority: 'all',
    projectId: 'all',
    search: ''
  })

  useEffect(() => {
    async function load() {
      const currentUser = await getCurrentUser()
      const allProjects = await getProjects()
      const allTasks = await Promise.all(
        allProjects.map((p: any) =>
          getProjectTasks(p.Id).then(tasks => ({ project: p, tasks }))
        )
      )
      const teamResponses = await Promise.all(
        allProjects.map(p => getProjectTeams(p.Id))
      )
      const allTeams = teamResponses.flat()
      const flat = allTasks.flatMap(({ project, tasks }) =>
        tasks.map(task => ({ ...task, __project: project }))
      )
      setUser(currentUser)
      setProjects(allProjects)
      setTeams(allTeams)
      setTasks(flat)
    }
    load()
  }, [])

  const filteredTasks = tasks.filter(task => {
    if (filters.priority !== 'all' && task.Priority !== filters.priority) return false
    if (filters.projectId !== 'all' && task.ProjectId !== filters.projectId) return false
    if (filters.search && !task.Title.toLowerCase().includes(filters.search.toLowerCase())) return false
    if (filters.time === 'day') {
      const today = new Date()
      const due = new Date(task.DueDate)
      return due.toDateString() === today.toDateString()
    }
    if (filters.time === 'week') {
      const today = new Date()
      const due = new Date(task.DueDate)
      const diff = (due.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
      return diff <= 7 && diff >= 0
    }
    if (filters.time === 'month') {
      const due = new Date(task.DueDate)
      const now = new Date()
      return due.getMonth() === now.getMonth() && due.getFullYear() === now.getFullYear()
    }
    return true
  })

  const handleSave = async () => {
    // PATCH logic can be added here
    setSelectedTask(null)
  }

  const handleDelete = async () => {
    await deleteTask(selectedTask.Id)
    setTasks(prev => prev.filter(t => t.Id !== selectedTask.Id))
    setSelectedTask(null)
  }

  const handleMarkDone = async () => {
    await markTaskComplete(selectedTask.Id)
    setTasks(prev => prev.map(t => t.Id === selectedTask.Id ? { ...t, Status: 'DONE' } : t))
    setSelectedTask(null)
  }

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
          <CreateTaskDialog users={[user]} teams={teams} projects={projects} />
        </div>
        <TaskOverviewFilter
          filters={filters}
          onChange={u => setFilters({ ...filters, ...u })}
          projects={projects}
        />
      </GlassPanel>

      <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
        {filteredTasks.map(task => (
          <div key={task.Id} onClick={() => setSelectedTask(task)}>
            <GlobalTaskCard task={task} project={task.__project} />
          </div>
        ))}
      </div>

      {selectedTask && (
        <Dialog
          open={!!selectedTask}
          onOpenChange={() => setSelectedTask(null)}
          title={selectedTask.Title}
          description={`In project: ${selectedTask.__project.Title}`}
        >
          <div className="space-y-4">
            <Input
              value={selectedTask.Title}
              onChange={e => setSelectedTask({ ...selectedTask, Title: e.target.value })}
            />
            <Textarea
              value={selectedTask.Description}
              onChange={e => setSelectedTask({ ...selectedTask, Description: e.target.value })}
            />
            <Select
              value={selectedTask.Priority}
              onValueChange={v => setSelectedTask({ ...selectedTask, Priority: v })}
            >
              <option value="LOW">Low</option>
              <option value="MEDIUM">Medium</option>
              <option value="HIGH">High</option>
              <option value="URGENT">Urgent</option>
            </Select>

            <TaskAttachments taskId={selectedTask.Id} />

            <p className="text-xs text-muted-foreground">Status: {selectedTask.Status}</p>
            <div className="flex justify-between items-center pt-2">
              <Button variant="destructive" onClick={handleDelete}>Delete</Button>
              <div className="flex gap-2">
                {selectedTask.Status !== 'DONE' && (
                  <Button onClick={handleMarkDone}>Mark Done</Button>
                )}
                <Button onClick={handleSave}>Save</Button>
              </div>
            </div>
          </div>
        </Dialog>
      )}
    </motion.div>
  )
}
