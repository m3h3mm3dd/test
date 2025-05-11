'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createProject } from '@/api/project'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { motion } from 'framer-motion'
import { toast } from '@/components/ui/toaster'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { Calendar } from '@/components/ui/calendar'

export default function CreateProjectPage() {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [budget, setBudget] = useState('')
  const [deadline, setDeadline] = useState<Date | undefined>()
  const [loading, setLoading] = useState(false)
  const router = useRouter()

  const handleCreate = async () => {
    if (!name) {
      toast({ title: 'Project name is required' })
      return
    }

    setLoading(true)
    try {
      const project = await createProject({
        Name: name,
        Description: description,
        Deadline: deadline?.toISOString(),
        TotalBudget: parseFloat(budget || '0'),
      })
      toast({ title: 'Project created!' })
      router.push(`/dashboard/projects/${project.Id}`)
    } catch (err) {
      toast({ title: 'Failed to create project', variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6"
    >
      <GlassPanel className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Create New Project</h1>

        <div className="space-y-4">
          <div>
            <Label>Project Name</Label>
            <Input
              value={name}
              onChange={e => setName(e.target.value)}
              placeholder="e.g. Apollo Redesign"
              disabled={loading}
            />
          </div>

          <div>
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={e => setDescription(e.target.value)}
              placeholder="What is this project about?"
              disabled={loading}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label>Total Budget</Label>
              <Input
                type="number"
                value={budget}
                onChange={e => setBudget(e.target.value)}
                placeholder="10000"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Deadline</Label>
              <Calendar
                mode="single"
                selected={deadline}
                onSelect={setDeadline}
                disabled={loading}
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button disabled={loading} onClick={handleCreate}>
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  )
}
