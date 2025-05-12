'use client'

import { useEffect, useState } from 'react'
import {
  ProjectScope,
  editProjectScope,
  addProjectScope,
} from '@/api/ScopeAPI'
import { useSession } from 'next-auth/react'
import { useUserProjectRole } from '@/hooks/useUserProjectRole'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Textarea } from '@/components/ui/textarea'

export function ProjectScope({ projectId }: { projectId: string }) {
  const { data: session } = useSession()
  const [scope, setScope] = useState<ProjectScope | null>(null)
  const [editing, setEditing] = useState(false)
  const [loading, setLoading] = useState(true)

  const role = useUserProjectRole({ owner: { id: '' } }, session?.user?.id)
  const isOwner = role.isOwner

  // 🚧 Simulate fetch
  useEffect(() => {
    // Replace this with actual GET if available later
    setScope({
      scopeManagementPlan: {
        ScopeDefinitionMethod: '',
        WBSDevelopmentMethod: '',
        ScopeBaselineApproval: '',
        DeliverablesImpactHandling: '',
      },
      requirementManagementPlan: {
        ReqPlanningApproach: '',
        ReqChangeControl: '',
        ReqPrioritization: '',
        ReqMetrics: '',
      },
      requirementDocumentation: {
        StakeholderNeeds: [''],
        QuantifiedExpectations: [''],
        Traceability: '',
      },
      projectScopeStatement: {
        EndProductScope: '',
        Deliverables: [''],
        AcceptanceCriteria: '',
        Exclusions: '',
        OptionalSOW: '',
      },
      workBreakdownStructure: {
        WorkPackages: [],
        ScopeBaselineReference: '',
      },
    })
    setLoading(false)
  }, [projectId])

  const handleChange = (section: string, field: string, value: any) => {
    setScope(prev =>
      prev
        ? {
            ...prev,
            [section]: {
              ...prev[section],
              [field]: value,
            },
          }
        : prev,
    )
  }

  const handleListChange = (section: string, field: string, index: number, value: string) => {
    const list = [...(scope?.[section][field] || [])]
    list[index] = value
    handleChange(section, field, list)
  }

  const handleAddListItem = (section: string, field: string) => {
    const list = [...(scope?.[section][field] || [])]
    list.push('')
    handleChange(section, field, list)
  }

  const handleRemoveListItem = (section: string, field: string, index: number) => {
    const list = [...(scope?.[section][field] || [])]
    list.splice(index, 1)
    handleChange(section, field, list)
  }

  const handleSubmit = async () => {
    if (!scope) return
    try {
      await editProjectScope(projectId, scope)
      setEditing(false)
    } catch (e) {
      console.error('Failed to save scope:', e)
    }
  }

  if (loading || !scope) return <div className="text-sm text-muted-foreground">Loading scope...</div>

  return (
    <div className="space-y-8 text-sm mt-4">
      <header className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Scope Overview</h2>
        {isOwner && (
          <Button onClick={() => (editing ? handleSubmit() : setEditing(true))}>
            {editing ? 'Save Scope' : 'Edit Scope'}
          </Button>
        )}
      </header>

      {/* 🔹 Scope Management Plan */}
      <Section title="Scope Management Plan">
        <Field label="Scope Definition Method" value={scope.scopeManagementPlan.ScopeDefinitionMethod} editable={editing} onChange={(v) => handleChange('scopeManagementPlan', 'ScopeDefinitionMethod', v)} />
        <Field label="WBS Development Method" value={scope.scopeManagementPlan.WBSDevelopmentMethod} editable={editing} onChange={(v) => handleChange('scopeManagementPlan', 'WBSDevelopmentMethod', v)} />
        <Field label="Scope Baseline Approval" value={scope.scopeManagementPlan.ScopeBaselineApproval} editable={editing} onChange={(v) => handleChange('scopeManagementPlan', 'ScopeBaselineApproval', v)} />
        <Field label="Deliverables Impact Handling" value={scope.scopeManagementPlan.DeliverablesImpactHandling} editable={editing} onChange={(v) => handleChange('scopeManagementPlan', 'DeliverablesImpactHandling', v)} />
      </Section>

      {/* 🔹 Requirement Management Plan */}
      <Section title="Requirement Management Plan">
        <Field label="Planning Approach" value={scope.requirementManagementPlan.ReqPlanningApproach} editable={editing} onChange={(v) => handleChange('requirementManagementPlan', 'ReqPlanningApproach', v)} />
        <Field label="Change Control" value={scope.requirementManagementPlan.ReqChangeControl} editable={editing} onChange={(v) => handleChange('requirementManagementPlan', 'ReqChangeControl', v)} />
        <Field label="Prioritization" value={scope.requirementManagementPlan.ReqPrioritization} editable={editing} onChange={(v) => handleChange('requirementManagementPlan', 'ReqPrioritization', v)} />
        <Field label="Metrics" value={scope.requirementManagementPlan.ReqMetrics} editable={editing} onChange={(v) => handleChange('requirementManagementPlan', 'ReqMetrics', v)} />
      </Section>

      {/* 🔹 Requirement Documentation */}
      <Section title="Requirement Documentation">
        <ListField label="Stakeholder Needs" items={scope.requirementDocumentation.StakeholderNeeds} editable={editing} onChange={(i, v) => handleListChange('requirementDocumentation', 'StakeholderNeeds', i, v)} onAdd={() => handleAddListItem('requirementDocumentation', 'StakeholderNeeds')} onRemove={(i) => handleRemoveListItem('requirementDocumentation', 'StakeholderNeeds', i)} />
        <ListField label="Quantified Expectations" items={scope.requirementDocumentation.QuantifiedExpectations} editable={editing} onChange={(i, v) => handleListChange('requirementDocumentation', 'QuantifiedExpectations', i, v)} onAdd={() => handleAddListItem('requirementDocumentation', 'QuantifiedExpectations')} onRemove={(i) => handleRemoveListItem('requirementDocumentation', 'QuantifiedExpectations', i)} />
        <Field label="Traceability" value={scope.requirementDocumentation.Traceability} editable={editing} onChange={(v) => handleChange('requirementDocumentation', 'Traceability', v)} />
      </Section>

      {/* 🔹 Scope Statement */}
      <Section title="Scope Statement">
        <Field label="End Product Scope" value={scope.projectScopeStatement.EndProductScope} editable={editing} onChange={(v) => handleChange('projectScopeStatement', 'EndProductScope', v)} />
        <ListField label="Deliverables" items={scope.projectScopeStatement.Deliverables} editable={editing} onChange={(i, v) => handleListChange('projectScopeStatement', 'Deliverables', i, v)} onAdd={() => handleAddListItem('projectScopeStatement', 'Deliverables')} onRemove={(i) => handleRemoveListItem('projectScopeStatement', 'Deliverables', i)} />
        <Field label="Acceptance Criteria" value={scope.projectScopeStatement.AcceptanceCriteria} editable={editing} onChange={(v) => handleChange('projectScopeStatement', 'AcceptanceCriteria', v)} />
        <Field label="Exclusions" value={scope.projectScopeStatement.Exclusions} editable={editing} onChange={(v) => handleChange('projectScopeStatement', 'Exclusions', v)} />
        <Field label="Optional SOW" value={scope.projectScopeStatement.OptionalSOW} editable={editing} onChange={(v) => handleChange('projectScopeStatement', 'OptionalSOW', v)} />
      </Section>

      {/* 🔹 Work Breakdown Structure */}
      <Section title="Work Breakdown Structure">
        <Field label="Scope Baseline Reference" value={scope.workBreakdownStructure.ScopeBaselineReference} editable={editing} onChange={(v) => handleChange('workBreakdownStructure', 'ScopeBaselineReference', v)} />
        <div className="mt-2 space-y-2">
          {scope.workBreakdownStructure.WorkPackages.map((pkg, i) => (
            <div key={i} className="border p-2 rounded-md space-y-1">
              <Field label="Name" value={pkg.Name} editable={editing} onChange={(v) => {
                const updated = [...scope.workBreakdownStructure.WorkPackages]
                updated[i].Name = v
                setScope({ ...scope, workBreakdownStructure: { ...scope.workBreakdownStructure, WorkPackages: updated } })
              }} />
              <Field label="Description" value={pkg.Description} editable={editing} onChange={(v) => {
                const updated = [...scope.workBreakdownStructure.WorkPackages]
                updated[i].Description = v
                setScope({ ...scope, workBreakdownStructure: { ...scope.workBreakdownStructure, WorkPackages: updated } })
              }} />
              <Field label="Duration" value={pkg.EstimatedDuration.toString()} editable={editing} onChange={(v) => {
                const updated = [...scope.workBreakdownStructure.WorkPackages]
                updated[i].EstimatedDuration = Number(v)
                setScope({ ...scope, workBreakdownStructure: { ...scope.workBreakdownStructure, WorkPackages: updated } })
              }} />
              <Field label="Cost" value={pkg.EstimatedCost.toString()} editable={editing} onChange={(v) => {
                const updated = [...scope.workBreakdownStructure.WorkPackages]
                updated[i].EstimatedCost = Number(v)
                setScope({ ...scope, workBreakdownStructure: { ...scope.workBreakdownStructure, WorkPackages: updated } })
              }} />
            </div>
          ))}

          {editing && (
            <Button variant="outline" size="sm" onClick={() =>
              setScope(prev => prev
                ? {
                    ...prev,
                    workBreakdownStructure: {
                      ...prev.workBreakdownStructure,
                      WorkPackages: [...prev.workBreakdownStructure.WorkPackages, {
                        Name: '',
                        Description: '',
                        EstimatedDuration: 0,
                        EstimatedCost: 0,
                      }],
                    },
                  }
                : prev
            )}>
              + Add Work Package
            </Button>
          )}
        </div>
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="space-y-2">
      <h3 className="text-lg font-semibold">{title}</h3>
      <div className="space-y-2">{children}</div>
    </section>
  )
}

function Field({ label, value, onChange, editable }: { label: string; value: string; onChange: (v: string) => void; editable: boolean }) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      {editable
        ? <Input value={value} onChange={(e) => onChange(e.target.value)} />
        : <p className="text-sm">{value}</p>}
    </div>
  )
}

function ListField({ label, items, onChange, onAdd, onRemove, editable }: {
  label: string
  items: string[]
  onChange: (index: number, value: string) => void
  onAdd: () => void
  onRemove: (index: number) => void
  editable: boolean
}) {
  return (
    <div>
      <label className="text-xs font-medium text-muted-foreground">{label}</label>
      <div className="space-y-1 mt-1">
        {items.map((item, i) => (
          <div key={i} className="flex items-center gap-2">
            {editable
              ? <Input value={item} onChange={(e) => onChange(i, e.target.value)} />
              : <p className="text-sm">{item}</p>}
            {editable && <Button variant="ghost" size="sm" onClick={() => onRemove(i)}>Remove</Button>}
          </div>
        ))}
        {editable && <Button variant="outline" size="sm" onClick={onAdd}>+ Add</Button>}
      </div>
    </div>
  )
}
