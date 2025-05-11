'use client';

import { useEffect, useState } from 'react';
import { 
  getProjectRisks, 
  createRisk, 
  updateRisk, 
  deleteRisk,
  getRiskAnalyses,
  createRiskAnalysis,
  getRiskResponsePlans,
  createRiskResponsePlan 
} from '@/api/RiskAPI';
import { Skeleton } from '@/components/ui/skeleton';
import { EmptyState } from '@/components/ui/EmptyState';
import { Button } from '@/components/ui/button';
import { Dialog } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { useAuthContext } from '@/contexts/AuthContext';
import { RiskMatrix } from '@/components/risk/RiskMatrix';
import { RiskTable } from '@/components/risk/RiskTable';
import { RiskDetailsDialog } from '@/components/risk/RiskDetailsDialog';
import { Dropdown } from '@/components/ui/Dropdown';
import { PlusCircle, AlertTriangle, BarChart2 } from 'lucide-react';
import { toast } from '@/lib/toast';
import { Tabs } from '@/components/ui/tabs';

interface Props {
  projectId: string;
  userRole: string | null;
}

export function ProjectRisks({ projectId, userRole }: Props) {
  const { user } = useAuthContext();
  const [risks, setRisks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState<'matrix' | 'table'>('matrix');
  const [createDialogOpen, setCreateDialogOpen] = useState(false);
  const [selectedRisk, setSelectedRisk] = useState<any | null>(null);
  const [risksWithAnalyses, setRisksWithAnalyses] = useState<any[]>([]);
  
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    Category: 'Technical',
    Probability: 0.5,
    Impact: 5,
    Severity: 2.5,
    Status: 'Open'
  });

  const canManageRisks = userRole === 'project_owner' || userRole === 'team_leader';

  useEffect(() => {
    fetchRisks();
  }, [projectId]);

  const fetchRisks = async () => {
    setLoading(true);
    try {
      const data = await getProjectRisks(projectId);
      setRisks(data);
      
      // Load risk analyses for each risk
      const risksWithAnalysesData = await Promise.all(
        data.map(async (risk) => {
          const analyses = await getRiskAnalyses(risk.Id);
          const responsePlans = await getRiskResponsePlans(risk.Id);
          return {
            ...risk,
            analyses,
            responsePlans
          };
        })
      );
      
      setRisksWithAnalyses(risksWithAnalysesData);
    } catch (error) {
      console.error('Failed to load risks:', error);
      toast.error('Failed to load risks');
    } finally {
      setLoading(false);
    }
  };

  const handleRiskCreate = async () => {
    if (!form.Name) {
      toast.error('Risk name is required');
      return;
    }
    
    try {
      const newRisk = await createRisk({
        ...form,
        ProjectId: projectId
      });
      
      await createRiskAnalysis({
        RiskId: newRisk.Id,
        AnalysisType: 'Initial',
        MatrixScore: `P${Math.round(form.Probability * 10)}-I${form.Impact}`,
        ExpectedValue: form.Probability * form.Impact
      });
      
      setCreateDialogOpen(false);
      toast.success('Risk created successfully');
      fetchRisks();
    } catch (error) {
      console.error('Failed to create risk:', error);
      toast.error('Failed to create risk');
    }
  };

  const handleProbabilityChange = (value: number) => {
    setForm({
      ...form,
      Probability: value,
      Severity: value * form.Impact
    });
  };

  const handleImpactChange = (value: number) => {
    setForm({
      ...form,
      Impact: value,
      Severity: form.Probability * value
    });
  };

  if (loading) {
    return <Skeleton className="h-96 w-full rounded-xl" />;
  }

  const categoryOptions = [
    { label: 'Technical', value: 'Technical' },
    { label: 'Schedule', value: 'Schedule' },
    { label: 'Cost', value: 'Cost' },
    { label: 'Resource', value: 'Resource' },
    { label: 'Stakeholder', value: 'Stakeholder' },
    { label: 'Quality', value: 'Quality' },
    { label: 'Communication', value: 'Communication' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap justify-between items-center">
        <div className="flex gap-2">
          <Button
            variant={viewMode === 'matrix' ? 'default' : 'outline'}
            onClick={() => setViewMode('matrix')}
          >
            <BarChart2 className="h-4 w-4 mr-1" /> Risk Matrix
          </Button>
          <Button
            variant={viewMode === 'table' ? 'default' : 'outline'}
            onClick={() => setViewMode('table')}
          >
            Table View
          </Button>
        </div>
        
        {canManageRisks && (
          <Button onClick={() => setCreateDialogOpen(true)}>
            <PlusCircle className="h-4 w-4 mr-1" /> Add Risk
          </Button>
        )}
      </div>

      {risks.length === 0 ? (
        <EmptyState
          title="No Risks Identified"
          description="This project has no risks identified yet."
          icon={<AlertTriangle className="h-12 w-12" />}
        />
      ) : viewMode === 'matrix' ? (
        <RiskMatrix risks={risks} onRiskClick={(risk) => setSelectedRisk(risk)} />
      ) : (
        <RiskTable 
          risks={risks} 
          onRiskClick={(risk) => setSelectedRisk(risk)}
          userRole={userRole}
        />
      )}

      {/* Create Risk Dialog */}
      <Dialog
        open={createDialogOpen}
        onOpenChange={setCreateDialogOpen}
        title="Add Risk"
        description="Identify a new risk for this project"
      >
        <div className="space-y-4">
          <Input
            placeholder="Risk name"
            value={form.Name}
            onChange={e => setForm({...form, Name: e.target.value})}
          />
          
          <Textarea
            placeholder="Description"
            value={form.Description}
            onChange={e => setForm({...form, Description: e.target.value})}
            rows={3}
          />
          
          <div>
            <label className="block text-sm mb-1">Category</label>
            <Dropdown
              value={form.Category}
              onChange={value => setForm({...form, Category: value})}
              items={categoryOptions}
              trigger={
                <Button variant="outline" className="w-full justify-between">
                  {form.Category}
                  <span className="opacity-50">▼</span>
                </Button>
              }
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">
              Probability: {Math.round(form.Probability * 100)}%
            </label>
            <input
              type="range"
              min="0.1"
              max="1"
              step="0.1"
              value={form.Probability}
              onChange={e => handleProbabilityChange(parseFloat(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">
              Impact: {form.Impact}/10
            </label>
            <input
              type="range"
              min="1"
              max="10"
              step="1"
              value={form.Impact}
              onChange={e => handleImpactChange(parseInt(e.target.value))}
              className="w-full"
            />
          </div>
          
          <div>
            <label className="block text-sm mb-1">
              Severity Score: {form.Severity.toFixed(1)}/10
            </label>
            <div className="w-full h-2 rounded-full bg-muted overflow-hidden">
              <div 
                className={`h-full ${getSeverityColorClass(form.Severity)}`}
                style={{ width: `${(form.Severity / 10) * 100}%` }}
              />
            </div>
          </div>
        </div>
        
        <div className="flex justify-end gap-2 mt-6">
          <Button variant="outline" onClick={() => setCreateDialogOpen(false)}>
            Cancel
          </Button>
          <Button onClick={handleRiskCreate}>
            Create Risk
          </Button>
        </div>
      </Dialog>

      {/* Risk Details Dialog */}
      {selectedRisk && (
        <RiskDetailsDialog
          risk={risksWithAnalyses.find(r => r.Id === selectedRisk.Id) || selectedRisk}
          open={!!selectedRisk}
          onOpenChange={() => setSelectedRisk(null)}
          onUpdate={fetchRisks}
          userRole={userRole}
          projectId={projectId}
        />
      )}
    </div>
  );
}

function getSeverityColorClass(severity: number): string {
  if (severity >= 7) return "bg-red-500";
  if (severity >= 4) return "bg-yellow-500";
  return "bg-green-500";
}