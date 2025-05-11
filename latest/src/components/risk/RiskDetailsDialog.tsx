'use client';

import { useState } from 'react';
import { Dialog } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Tabs } from '@/components/ui/tabs';
import { updateRisk, deleteRisk, createRiskResponsePlan } from '@/api/RiskAPI';
import { AlertTriangle, Shield, CheckCircle, Trash2 } from 'lucide-react';
import { format } from 'date-fns';
import { toast } from '@/lib/toast';

interface RiskDetailsDialogProps {
  risk: any;
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onUpdate: () => void;
  userRole: string | null;
  projectId: string;
}

export function RiskDetailsDialog({
  risk,
  open,
  onOpenChange,
  onUpdate,
  userRole,
  projectId
}: RiskDetailsDialogProps) {
  const [activeTab, setActiveTab] = useState('details');
  const [loading, setLoading] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [editing, setEditing] = useState(false);
  const [editForm, setEditForm] = useState({
    Name: risk.Name,
    Description: risk.Description || '',
    Category: risk.Category,
    Probability: risk.Probability,
    Impact: risk.Impact,
    Severity: risk.Severity,
    Status: risk.Status
  });
  
  const [responseForm, setResponseForm] = useState({
    Strategy: 'Mitigate',
    Description: '',
    PlannedActions: '',
    Status: 'Planned'
  });

  const canManageRisk = userRole === 'project_owner' || userRole === 'team_leader';
  
  const handleUpdate = async () => {
    if (!editForm.Name) {
      toast.error('Risk name is required');
      return;
    }
    
    setLoading(true);
    try {
      await updateRisk(risk.Id, editForm);
      setEditing(false);
      toast.success('Risk updated successfully');
      onUpdate();
    } catch (error) {
      console.error('Failed to update risk:', error);
      toast.error('Failed to update risk');
    } finally {
      setLoading(false);
    }
  };
  
  const handleDelete = async () => {
    if (!confirm('Are you sure you want to delete this risk?')) return;
    
    setDeleting(true);
    try {
      await deleteRisk(risk.Id, projectId);
      onOpenChange(false);
      toast.success('Risk deleted successfully');
      onUpdate();
    } catch (error) {
      console.error('Failed to delete risk:', error);
      toast.error('Failed to delete risk');
    } finally {
      setDeleting(false);
    }
  };
  
  const handleCreateResponse = async () => {
    if (!responseForm.PlannedActions) {
      toast.error('Planned actions are required');
      return;
    }
    
    setLoading(true);
    try {
      await createRiskResponsePlan({
        RiskId: risk.Id,
        ...responseForm
      });
      
      toast.success('Response plan created successfully');
      onUpdate();
      setResponseForm({
        Strategy: 'Mitigate',
        Description: '',
        PlannedActions: '',
        Status: 'Planned'
      });
    } catch (error) {
      console.error('Failed to create response plan:', error);
      toast.error('Failed to create response plan');
    } finally {
      setLoading(false);
    }
  };

  const getSeverityLabel = (severity: number) => {
    if (severity >= 7) return "Critical";
    if (severity >= 5) return "High";
    if (severity >= 3) return "Medium";
    return "Low";
  };
  
  const getSeverityColor = (severity: number) => {
    if (severity >= 7) return "text-red-500";
    if (severity >= 5) return "text-orange-500";
    if (severity >= 3) return "text-yellow-500";
    return "text-green-500";
  };
  
  const tabs = [
    { label: 'Details', value: 'details' },
    { label: 'Response Plan', value: 'response' },
    { label: 'Analysis', value: 'analysis' },
  ];

  return (
    <Dialog
      open={open}
      onOpenChange={onOpenChange}
      title={editing ? 'Edit Risk' : risk.Name}
      description={editing ? 'Update risk details' : `${risk.Category} risk - ${getSeverityLabel(risk.Severity)} severity`}
      size="lg"
    >
      <Tabs
        tabs={tabs}
        value={activeTab}
        onChange={setActiveTab}
        className="mb-4"
      />
      
      {activeTab === 'details' && (
        <>
          {editing ? (
            <div className="space-y-4">
              <Input
                value={editForm.Name}
                onChange={e => setEditForm({ ...editForm, Name: e.target.value })}
                placeholder="Risk name"
              />
              
              <Textarea
                value={editForm.Description}
                onChange={e => setEditForm({ ...editForm, Description: e.target.value })}
                placeholder="Description"
                rows={3}
              />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm mb-1">Category</label>
                  <select
                    value={editForm.Category}
                    onChange={e => setEditForm({ ...editForm, Category: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Technical">Technical</option>
                    <option value="Schedule">Schedule</option>
                    <option value="Cost">Cost</option>
                    <option value="Resource">Resource</option>
                    <option value="Stakeholder">Stakeholder</option>
                    <option value="Quality">Quality</option>
                    <option value="Communication">Communication</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Status</label>
                  <select
                    value={editForm.Status}
                    onChange={e => setEditForm({ ...editForm, Status: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Open">Open</option>
                    <option value="Mitigating">Mitigating</option>
                    <option value="Closed">Closed</option>
                    <option value="Accepted">Accepted</option>
                    <option value="Transferred">Transferred</option>
                  </select>
                </div>
              </div>
              
              <div>
                <label className="block text-sm mb-1">
                  Probability: {Math.round(editForm.Probability * 100)}%
                </label>
                <input
                  type="range"
                  min="0.1"
                  max="1"
                  step="0.1"
                  value={editForm.Probability}
                  onChange={e => {
                    const probability = parseFloat(e.target.value);
                    setEditForm({
                      ...editForm,
                      Probability: probability,
                      Severity: probability * editForm.Impact
                    });
                  }}
                  className="w-full"
                />
              </div>
              
              <div>
                <label className="block text-sm mb-1">
                  Impact: {editForm.Impact}/10
                </label>
                <input
                  type="range"
                  min="1"
                  max="10"
                  step="1"
                  value={editForm.Impact}
                  onChange={e => {
                    const impact = parseInt(e.target.value);
                    setEditForm({
                      ...editForm,
                      Impact: impact,
                      Severity: editForm.Probability * impact
                    });
                  }}
                  className="w-full"
                />
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <p className="text-sm">{risk.Description || 'No description provided.'}</p>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="bg-white/5 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Probability</div>
                  <div className="text-lg font-medium">{Math.round(risk.Probability * 100)}%</div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Impact</div>
                  <div className="text-lg font-medium">{risk.Impact}/10</div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Severity</div>
                  <div className={`text-lg font-medium ${getSeverityColor(risk.Severity)}`}>
                    {risk.Severity.toFixed(1)} - {getSeverityLabel(risk.Severity)}
                  </div>
                </div>
                
                <div className="bg-white/5 p-3 rounded-md">
                  <div className="text-sm text-muted-foreground">Status</div>
                  <div className="text-lg font-medium">{risk.Status}</div>
                </div>
              </div>
              
              <div className="text-sm text-muted-foreground mt-4">
                <p>Identified on {format(new Date(risk.IdentifiedDate), 'PP')}</p>
              </div>
            </div>
          )}
        </>
      )}
      
      {activeTab === 'response' && (
        <div className="space-y-6">
          {risk.responsePlans && risk.responsePlans.length > 0 ? (
            <div className="space-y-4">
              {risk.responsePlans.map((plan: any) => (
                <div key={plan.Id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">Strategy: {plan.Strategy}</h3>
                    <span className="text-sm px-2 py-1 bg-white/10 rounded">
                      {plan.Status}
                    </span>
                  </div>
                  {plan.Description && (
                    <p className="text-sm mb-2">{plan.Description}</p>
                  )}
                  <h4 className="text-sm font-medium mt-3 mb-1">Planned Actions:</h4>
                  <p className="text-sm">{plan.PlannedActions}</p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created on {format(new Date(plan.CreatedAt), 'PP')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <Shield className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Response Plan Yet</h3>
              <p className="text-sm text-muted-foreground">
                Create a plan to address this risk.
              </p>
            </div>
          )}
          
          {canManageRisk && (
            <div className="border-t pt-4">
              <h3 className="font-medium mb-3">Add Response Plan</h3>
              <div className="space-y-3">
                <div>
                  <label className="block text-sm mb-1">Strategy</label>
                  <select
                    value={responseForm.Strategy}
                    onChange={e => setResponseForm({ ...responseForm, Strategy: e.target.value })}
                    className="w-full p-2 border rounded"
                  >
                    <option value="Mitigate">Mitigate</option>
                    <option value="Avoid">Avoid</option>
                    <option value="Transfer">Transfer</option>
                    <option value="Accept">Accept</option>
                  </select>
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Description (Optional)</label>
                  <Textarea
                    value={responseForm.Description}
                    onChange={e => setResponseForm({ ...responseForm, Description: e.target.value })}
                    rows={2}
                  />
                </div>
                
                <div>
                  <label className="block text-sm mb-1">Planned Actions</label>
                  <Textarea
                    value={responseForm.PlannedActions}
                    onChange={e => setResponseForm({ ...responseForm, PlannedActions: e.target.value })}
                    rows={3}
                    placeholder="Describe the actions to address this risk"
                  />
                </div>
                
                <Button onClick={handleCreateResponse} disabled={loading}>
                  Add Response Plan
                </Button>
              </div>
            </div>
          )}
        </div>
      )}
      
      {activeTab === 'analysis' && (
        <div className="space-y-4">
          {risk.analyses && risk.analyses.length > 0 ? (
            <div className="space-y-4">
              {risk.analyses.map((analysis: any) => (
                <div key={analysis.Id} className="border rounded-md p-4">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="font-medium">{analysis.AnalysisType} Analysis</h3>
                    <span className="text-sm px-2 py-1 bg-white/10 rounded">
                      Matrix: {analysis.MatrixScore}
                    </span>
                  </div>
                  <p className="text-sm">
                    Expected Value: <span className="font-medium">{analysis.ExpectedValue.toFixed(1)}</span>
                  </p>
                  <p className="text-xs text-muted-foreground mt-2">
                    Created on {format(new Date(analysis.AnalysisDate), 'PP')}
                  </p>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-6">
              <AlertTriangle className="h-12 w-12 mx-auto text-muted-foreground mb-2" />
              <h3 className="text-lg font-medium">No Analysis Data</h3>
              <p className="text-sm text-muted-foreground">
                No risk analysis has been performed yet.
              </p>
            </div>
          )}
        </div>
      )}
      
      <div className="flex justify-between mt-6 pt-4 border-t">
        {canManageRisk && (
          <div>
            {editing ? (
              <>
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setEditing(false)}
                  disabled={loading}
                >
                  Cancel
                </Button>
                <Button 
                  onClick={handleUpdate}
                  disabled={loading}
                >
                  Save Changes
                </Button>
              </>
            ) : (
              <>
                <Button 
                  variant="outline" 
                  className="mr-2"
                  onClick={() => setEditing(true)}
                  disabled={deleting}
                >
                  Edit
                </Button>
                <Button 
                  variant="destructive"
                  onClick={handleDelete}
                  disabled={deleting}
                >
                  <Trash2 className="h-4 w-4 mr-1" /> Delete
                </Button>
              </>
            )}
          </div>
        )}
        
        <Button variant="outline" onClick={() => onOpenChange(false)}>
          Close
        </Button>
      </div>
    </Dialog>
  );
}