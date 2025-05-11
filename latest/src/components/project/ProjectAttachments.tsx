
'use client'

import { useEffect, useState } from 'react'
import {
  getAttachmentsForProject,
  uploadAttachment,
  deleteAttachment
} from '@/api/attachment'
import { Skeleton } from '@/components/ui/skeleton'
import { Button } from '@/components/ui/button'
import { useUser } from '@/hooks/useUser'
import { canEditProject } from '@/lib/roles'
import { toast } from '@/lib/toast'
import { cn } from '@/lib/utils'

interface Props {
  projectId: string
}

export function ProjectAttachments({ projectId }: Props) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [uploading, setUploading] = useState(false)
  const { user } = useUser()

  useEffect(() => {
    fetchFiles()
  }, [projectId])

  const fetchFiles = async () => {
    try {
      const res = await getAttachmentsForProject(projectId)
      setFiles(res)
    } catch {
      toast.error('Failed to load attachments.')
    } finally {
      setLoading(false)
    }
  }

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    setUploading(true)
    try {
      await uploadAttachment(projectId, file)
      toast.success('File uploaded.')
      fetchFiles()
    } catch {
      toast.error('Upload failed.')
    } finally {
      setUploading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Are you sure you want to delete this file?')) return
    try {
      await deleteAttachment(id)
      toast.success('File deleted.')
      fetchFiles()
    } catch {
      toast.error('Failed to delete.')
    }
  }

  const canUpload = canEditProject(user, { OwnerId: projectId })

  return (
    <div className="space-y-4">
      {canUpload && (
        <label className="block w-full">
          <input
            type="file"
            onChange={handleFileUpload}
            disabled={uploading}
            className={cn(
              'file:mr-4 file:rounded-full file:border-0 file:px-4 file:py-2 file:bg-muted file:text-sm file:font-semibold hover:file:bg-muted/80',
              uploading && 'opacity-50'
            )}
          />
        </label>
      )}

      {loading ? (
        <Skeleton className="h-24 w-full rounded-xl" />
      ) : files.length === 0 ? (
        <p className="text-sm text-muted-foreground">No files uploaded yet.</p>
      ) : (
        <ul className="space-y-2">
          {files.map((file) => (
            <li
              key={file.Id}
              className="flex justify-between items-center bg-white/5 px-4 py-2 rounded-md"
            >
              <span className="text-sm truncate max-w-[75%]" title={file.FileName}>
                {file.FileName} ({Math.round(file.FileSize / 1024)} KB)
              </span>
              {canUpload && (
                <Button
                  size="sm"
                  variant="ghost"
                  onClick={() => handleDelete(file.Id)}
                >
                  Delete
                </Button>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}