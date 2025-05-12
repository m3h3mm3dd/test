'use client'

import { useEffect, useRef, useState } from 'react'
import {
  getAttachmentsByEntityType,
  uploadAttachment,
  deleteAttachment,
} from '@/api/AttachmentAPI'
import { useSession } from 'next-auth/react'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

interface Attachment {
  Id: string
  FileName: string
  FileType: string
  FileSize: number
  FilePath: string
  UploadedAt: string
  OwnerId: string
}

export function ProjectAttachments({ projectId }: { projectId: string }) {
  const { data: session } = useSession()
  const userId = session?.user?.id
  const [attachments, setAttachments] = useState<Attachment[]>([])
  const [loading, setLoading] = useState(true)
  const inputRef = useRef<HTMLInputElement>(null)

  const entityType = 'Scope' // you can change this to match the intended default category

  useEffect(() => {
    const fetchData = async () => {
      const res = await getAttachmentsByEntityType(projectId, entityType)
      setAttachments(res)
      setLoading(false)
    }
    fetchData()
  }, [projectId])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    const uploaded = await uploadAttachment(file, entityType, projectId, projectId)
    setAttachments(prev => [...prev, uploaded])
  }

  const handleDelete = async (id: string) => {
    await deleteAttachment(id)
    setAttachments(prev => prev.filter(att => att.Id !== id))
  }

  return (
    <div className="mt-4 space-y-4">
      {loading ? (
        <p className="text-sm text-muted-foreground">Loading attachments...</p>
      ) : (
        <>
          <div className="space-y-2">
            {attachments.map(att => (
              <div key={att.Id} className="flex justify-between items-center border p-2 rounded-md">
                <div>
                  <a
                    href={att.FilePath}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 underline"
                  >
                    {att.FileName}
                  </a>
                  <p className="text-xs text-muted-foreground">
                    {Math.round(att.FileSize / 1024)} KB • Uploaded on{' '}
                    {new Date(att.UploadedAt).toLocaleString()}
                  </p>
                </div>
                {userId === att.OwnerId && (
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive hover:bg-destructive/10"
                    onClick={() => handleDelete(att.Id)}
                  >
                    <Trash2 size={16} />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="pt-2">
            <input
              ref={inputRef}
              type="file"
              className="hidden"
              onChange={handleUpload}
            />
            <Button variant="outline" onClick={() => inputRef.current?.click()}>
              Upload File
            </Button>
          </div>
        </>
      )}
    </div>
  )
}
