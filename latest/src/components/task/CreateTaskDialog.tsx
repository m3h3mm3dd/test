'use client'

import { useState } from 'react'
import { Dialog } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { createTask } from '@/api/task'

export function CreateTaskDialog({
  projects,
  users,
  teams
}: {
  projects: any[]
  users: any[]
  teams: any[]
}) {
  const [open, setOpen] = useState(false)
  const [form, setForm] = useState({
    Title: '',
    Description: '',
    Priority: 'MEDIUM',
    ProjectId: '',
    AssignedUserId: '',
    AssignedTeamId: '',
    DueDate: ''
  })

  const handleCreate = async () => {
    await createTask({
      Title: form.Title,
      Description: form.Description,
      Priority: form.Priority,
      ProjectId: form.ProjectId,
      UserId: form.AssignedUserId || undefined,
      TeamId: form.AssignedTeamId || undefined,
      DueDate: form.DueDate || undefined
    })
    setOpen(false)
  }

  return (
    <div>
      <Button onClick={() => setOpen(true)}>Create Task</Button>
      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="New Task"
        description="Fill in the task details below"
      >
        <div className="space-y-4">
          <Input
            placeholder="Title"
            value={form.Title}
            onChange={e => setForm({ ...form, Title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={form.Description}
            onChange={e => setForm({ ...form, Description: e.target.value })}
          />
          <Select
            value={form.Priority}
            onValueChange={v => setForm({ ...form, Priority: v })}
          >
            <option value="LOW">Low</option>
            <option value="MEDIUM">Medium</option>
            <option value="HIGH">High</option>
            <option value="URGENT">Urgent</option>
          </Select>
          <Select
            value={form.ProjectId}
            onValueChange={v => setForm({ ...form, ProjectId: v })}
          >
            <option value="">Select Project</option>
            {projects.map(p => (
              <option key={p.Id} value={p.Id}>{p.Title}</option>
            ))}
          </Select>
          <Select
            value={form.AssignedUserId}
            onValueChange={v => setForm({ ...form, AssignedUserId: v, AssignedTeamId: '' })}
          >
            <option value="">Assign to User (optional)</option>
            {users.map(u => (
              <option key={u.Id} value={u.Id}>{u.FirstName} {u.LastName}</option>
            ))}
          </Select>
          <Select
            value={form.AssignedTeamId}
            onValueChange={v => setForm({ ...form, AssignedTeamId: v, AssignedUserId: '' })}
          >
            <option value="">Assign to Team (optional)</option>
            {teams.map(t => (
              <option key={t.Id} value={t.Id}>{t.Name}</option>
            ))}
          </Select>
          <Input
            type="date"
            value={form.DueDate}
            onChange={e => setForm({ ...form, DueDate: e.target.value })}
          />
          <div className="flex justify-end">
            <Button onClick={handleCreate}>Save Task</Button>
          </div>
        </div>
      </Dialog>
    </div>
  )
}
