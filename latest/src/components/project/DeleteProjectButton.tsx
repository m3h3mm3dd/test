'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { deleteProject } from '@/api/project'
import { Button } from '@/components/ui/button'
import { Dialog } from '@/components/ui/dialog'

interface DeleteProjectButtonProps {
  projectId: string
  disabled?: boolean
}

export function DeleteProjectButton({ projectId, disabled }: DeleteProjectButtonProps) {
  const [open, setOpen] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const router = useRouter()

  const confirmDelete = async () => {
    setDeleting(true)
    try {
      await deleteProject(projectId)
      setOpen(false)
      router.push('/dashboard/projects')
    } finally {
      setDeleting(false)
    }
  }

  return (
    <div>
      <Button variant="destructive" onClick={() => setOpen(true)} disabled={disabled}>
        Delete Project
      </Button>

      <Dialog
        open={open}
        onOpenChange={setOpen}
        title="Delete this project?"
        description="This will permanently remove all related data. You can’t undo this."
        size="sm"
      >
        <div className="flex justify-end gap-2 pt-4">
          <Button variant="ghost" onClick={() => setOpen(false)} disabled={deleting}>
            Cancel
          </Button>
          <Button variant="destructive" onClick={confirmDelete} disabled={deleting}>
            {deleting ? 'Deleting...' : 'Confirm Delete'}
          </Button>
        </div>
      </Dialog>
    </div>
  )
}
