'use client'

import { useEffect, useState } from 'react'
import { getCurrentUser, updateUserSettings } from '@/api/user'
import { Skeleton } from '@/components/ui/skeleton'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { toast } from '@/lib/toast'

export function UserSettings() {
  const [user, setUser] = useState<any>(null)
  const [form, setForm] = useState({ JobTitle: '' })
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    async function fetch() {
      try {
        const res = await getCurrentUser()
        setUser(res)
        setForm({ JobTitle: res.JobTitle || '' })
      } catch {
        toast.error('Failed to load settings.')
      } finally {
        setLoading(false)
      }
    }
    fetch()
  }, [])

  const handleSubmit = async () => {
    setSaving(true)
    try {
      await updateUserSettings(form)
      toast.success('Settings saved.')
    } catch {
      toast.error('Failed to save settings.')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <Skeleton className="h-32 w-full rounded-xl" />

  return (
    <div className="space-y-4">
      <div>
        <label className="text-sm font-medium">Job Title</label>
        <Input
          placeholder="Your role or position"
          value={form.JobTitle}
          onChange={(e) => setForm({ ...form, JobTitle: e.target.value })}
        />
      </div>
      <Button onClick={handleSubmit} isLoading={saving}>
        Save Settings
      </Button>
    </div>
  )
}
