"use client"

import { FC } from 'react'
import { ProjectCard } from '@/components/project/ProjectCard'
import { Card } from '@/components/ui/card'
import { useRouter } from 'next/navigation'

interface ProjectSummaryGridProps {
  projects: any[]
}

export const ProjectSummaryGrid: FC<ProjectSummaryGridProps> = ({ projects }) => {
  const router = useRouter()
  return (
    <div className="grid md:grid-cols-2 xl:grid-cols-3 gap-4">
      {projects.map(project => (
        <Card
          key={project.Id}
          className="p-4 hover:shadow-md transition cursor-pointer"
          onClick={() => router.push(`/dashboard/projects/${project.Id}`)}
        >
          <h3 className="text-lg font-semibold mb-1">{project.Title}</h3>
          <p className="text-sm text-muted-foreground mb-2">{project.Description}</p>
          {project.CompletionPercent != null && (
            <div className="mt-2">
              <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-primary rounded-full transition-all duration-500"
                  style={{ width: `${project.CompletionPercent}%` }}
                />
              </div>
              <p className="text-sm mt-1 text-right">{project.CompletionPercent}% done</p>
            </div>
          )}
        </Card>
      ))}
    </div>
  )
}
