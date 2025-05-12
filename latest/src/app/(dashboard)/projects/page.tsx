// src/app/(dashboard)/projects/page.tsx
'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProjects } from '@/api/ProjectAPI'
import { ProjectCard } from '@/components/project/ProjectCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useAuth } from '@/contexts/AuthContext'
import { Plus, FolderKanban } from 'lucide-react'
import { GlassPanel } from '@/components/ui/GlassPanel'
import { toast } from '@/lib/toast'

export default function ProjectsPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useAuth()

  useEffect(() => {
    async function loadProjects() {
      setLoading(true)
      try {
        const data = await getProjects()
        setProjects(data)
      } catch (error) {
        console.error('Failed to load projects:', error)
        toast.error('Failed to load projects')
      } finally {
        setLoading(false)
      }
    }
    
    loadProjects()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      <GlassPanel className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-semibold tracking-tight">Projects</h1>
            <p className="text-muted-foreground mt-1">
              Manage and organize all your ongoing projects
            </p>
          </div>
          
          <Button onClick={() => router.push('/projects/create')}>
            <Plus className="h-4 w-4 mr-2" /> New Project
          </Button>
        </div>
      </GlassPanel>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState 
          title="No projects yet" 
          description="Start by creating your first project." 
          icon={<FolderKanban className="h-12 w-12" />}
          action={
            <Button onClick={() => router.push('/projects/create')}>
              Create Project
            </Button>
          }
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.Id}
              project={project}
              onClick={() => router.push(`/projects/${project.Id}`)}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}