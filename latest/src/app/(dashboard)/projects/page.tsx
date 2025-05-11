'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { getProjects } from '@/api/project'
import { ProjectCard } from '@/components/project/ProjectCard'
import { EmptyState } from '@/components/ui/EmptyState'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { motion } from 'framer-motion'
import { useUser } from '@/hooks/useUser'

export default function ProjectIndexPage() {
  const [projects, setProjects] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const router = useRouter()
  const { user } = useUser()

  useEffect(() => {
    async function load() {
      try {
        const data = await getProjects()
        setProjects(data)
      } finally {
        setLoading(false)
      }
    }
    load()
  }, [])

  return (
    <motion.div
      initial={{ opacity: 0, y: 12 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 space-y-8"
    >
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-semibold tracking-tight">All Projects</h1>
        {user?.Role === 'Project Owner' && (
          <Button onClick={() => router.push('/dashboard/projects/create')}>
            Create Project
          </Button>
        )}
      </div>

      {loading ? (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-48 w-full rounded-xl" />
          ))}
        </div>
      ) : projects.length === 0 ? (
        <EmptyState title="No projects yet" subtitle="Start by creating your first project." />
      ) : (
        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-3">
          {projects.map((project) => (
            <ProjectCard
              key={project.Id}
              project={project}
              onClick={() => router.push(`/dashboard/projects/${project.Id}`)}
            />
          ))}
        </div>
      )}
    </motion.div>
  )
}
