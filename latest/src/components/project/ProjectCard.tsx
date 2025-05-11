'use client'

import Link from 'next/link'
import { useUserRole } from '@/hooks/useUserRole'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface ProjectCardProps {
  project: {
    Id: string
    Name: string
    Description?: string
    Progress: number
    OwnerId: string
  }
}

export const ProjectCard = ({ project }: ProjectCardProps) => {
  const role = useUserRole(project.Id, project.OwnerId)

  return (
    <div
      className={cn(
        'rounded-xl p-5 bg-white/5 border border-white/10 shadow-md backdrop-blur-lg transition-transform hover:scale-[1.015] flex flex-col justify-between gap-4',
        'dark:bg-white/10 dark:border-white/20'
      )}
    >
      <div>
        <div className="flex items-center justify-between mb-1">
          <h2 className="text-xl font-semibold tracking-tight text-white">
            {project.Name}
          </h2>
          <Badge className="bg-gradient-to-r from-blue-500 to-indigo-500 text-white shadow-sm">
            {role}
          </Badge>
        </div>
        <p className="text-sm text-zinc-300 line-clamp-3">
          {project.Description || 'No description provided.'}
        </p>
      </div>

      <div className="flex items-center justify-between pt-2">
        <Link href={`/projects/${project.Id}`}>
          <Button variant="secondary" size="sm" className="rounded-full">
            Open
          </Button>
        </Link>
        {role === 'Project Owner' && (
          <Link href={`/projects/${project.Id}/edit`}>
            <Button variant="ghost" size="sm" className="text-sm">
              Edit
            </Button>
          </Link>
        )}
      </div>
    </div>
  )
}
