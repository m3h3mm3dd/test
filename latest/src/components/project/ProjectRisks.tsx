'use client'

import { useEffect, useState } from 'react'
import {
  getProjectRisks,
  createRisk,
  deleteRisk,
  updateRisk,
} from '@/api/RiskAPI'
import { useSession } from 'next-auth/react'
import { useUserProjectRole } from '@/hooks/useUserProjectRole'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Trash2 } from 'lucide-react'

export interface Risk {
  Id: string
  ProjectId: string
  Title: string
  Description: string
  Level: 'Low' | 'Medium' | 'High'
  Mitigation: string
}

export function ProjectRisks({ projectId }: { projectId: string }) {
  const { data: session } = useSession()
  const [risks, setRisks] = useState<Risk[]>([])
  const [loading, setLoading] = useState(true)
  const [project, setProject] = useState<any>(null)
  const role = useUserProjectRole(project, session?.user?.id)
  const [newRisk, setNewRisk] = useState<Omit<Risk, 'Id' | 'ProjectId'>>({
    Title: '',
    Description: '',
    Level: 'Medium',
    Mitigation: '',
  })

  const editable = role.isOwner || role.isTeamLeader

  useEffect(() => {
    const fetchRisks = async () => {
      const data = await getProjectRisks(projectId)
      setRisks(data)
      setLoading(false)
    }
    fetchRisks()
  }, [projectId])

  const handleAdd = async () => {
    if (!newRisk.Title || !newRisk.Level) return
    const risk = await createRisk({ ...newRisk, ProjectId: projectId })
    setRisks(prev => [...prev, risk])
    setNewRisk({ Title: '', Description: '', Level: 'Medium', Mitigation: '' })
  }

  const handleDelete = async (id: string) => {
    await deleteRisk(id)
    setRisks(prev => prev.filter(r => r.Id !== id))
  }

  const levelColors = {
    Low: 'text-green-600',
    Medium: 'text-yellow-600',
    High: 'text-red-600',
  }

  if (loading) return <div className="text-muted-foreground text-sm">Loading risks...</div>

  return (
    <div className="space-y-6 mt-4">
      {risks.map((risk) => (
        <div
          key={risk.Id}
          className="border p-4 rounded-md space-y-1 relative"
        >
          <div className="flex justify-between items-start">
            <div>
              <h4 className="font-semibold text-base">{risk.Title}</h4>
              <p className="text-sm text-muted-foreground">{risk.Description}</p>
              <p className={`text-sm font-medium ${levelColors[risk.Level]}`}>Level: {risk.Level}</p>
              <p className="text-sm text-muted-foreground">Mitigation: {risk.Mitigation}</p>
            </div>

            {editable && (
              <Button
                size="icon"
                variant="ghost"
                className="text-destructive hover:bg-destructive/10"
                onClick={() => handleDelete(risk.Id)}
              >
                <Trash2 size={16} />
              </Button>
            )}
          </div>
        </div>
      ))}

      {editable && (
        <div className="border p-4 rounded-md space-y-3">
          <h4 className="font-medium text-base">Add New Risk</h4>
          <Input
            placeholder="Title"
            value={newRisk.Title}
            onChange={(e) => setNewRisk({ ...newRisk, Title: e.target.value })}
          />
          <Textarea
            placeholder="Description"
            value={newRisk.Description}
            onChange={(e) => setNewRisk({ ...newRisk, Description: e.target.value })}
          />
          <select
            className="text-sm border p-1 rounded-md"
            value={newRisk.Level}
            onChange={(e) => setNewRisk({ ...newRisk, Level: e.target.value as any })}
          >
            <option value="Low">Low</option>
            <option value="Medium">Medium</option>
            <option value="High">High</option>
          </select>
          <Textarea
            placeholder="Mitigation strategy"
            value={newRisk.Mitigation}
            onChange={(e) => setNewRisk({ ...newRisk, Mitigation: e.target.value })}
          />
          <Button onClick={handleAdd} disabled={!newRisk.Title}>
            Add Risk
          </Button>
        </div>
      )}
    </div>
  )
}
