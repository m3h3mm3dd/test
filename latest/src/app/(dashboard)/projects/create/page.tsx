'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { createProject } from '@/api/ProjectAPI';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { DatePicker } from '@/components/ui/DatePicker';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { motion } from 'framer-motion';
import { toast } from '@/lib/toast';
import { ArrowLeft } from 'lucide-react';

export default function CreateProjectPage() {
  const router = useRouter();
  const [form, setForm] = useState({
    Name: '',
    Description: '',
    TotalBudget: '',
    Deadline: null as Date | null,
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (field: string, value: any) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async () => {
    if (!form.Name.trim()) {
      toast.error('Project name is required');
      return;
    }

    setLoading(true);
    try {
      const project = await createProject({
        Name: form.Name,
        Description: form.Description || '',
        Budget: parseFloat(form.TotalBudget) || 0,
        Deadline: form.Deadline?.toISOString() || new Date().toISOString(),
        StatusId: 'active', // ✅ Use a valid default or enum from backend
        IsDeleted: false,
      });

      toast.success('Project created successfully!');
      router.push(`/projects/${project.Id}`);
    } catch (error) {
      console.error('Failed to create project:', error);
      toast.error('Failed to create project. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35 }}
      className="p-6"
    >
      <Button
        variant="ghost"
        size="sm"
        className="mb-4"
        onClick={() => router.push('/projects')}
      >
        <ArrowLeft className="h-4 w-4 mr-2" /> Back to Projects
      </Button>

      <GlassPanel className="p-6 max-w-2xl mx-auto space-y-6">
        <h1 className="text-2xl font-semibold">Create New Project</h1>

        <div className="space-y-4">
          <div>
            <Label htmlFor="project-name">Project Name *</Label>
            <Input
              id="project-name"
              value={form.Name}
              onChange={e => handleChange('Name', e.target.value)}
              placeholder="e.g. Website Redesign"
              disabled={loading}
            />
          </div>

          <div>
            <Label htmlFor="project-description">Description</Label>
            <Textarea
              id="project-description"
              value={form.Description}
              onChange={e => handleChange('Description', e.target.value)}
              placeholder="What is this project about?"
              disabled={loading}
              className="min-h-[120px]"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="project-budget">Total Budget ($)</Label>
              <Input
                id="project-budget"
                type="number"
                value={form.TotalBudget}
                onChange={e => handleChange('TotalBudget', e.target.value)}
                placeholder="e.g. 10000"
                disabled={loading}
              />
            </div>
            <div>
              <Label>Deadline</Label>
              <DatePicker
                date={form.Deadline}
                onDateChange={(date) => handleChange('Deadline', date)}
                placeholder="Select a deadline (optional)"
              />
            </div>
          </div>

          <div className="pt-4 flex justify-end">
            <Button
              disabled={loading}
              onClick={handleSubmit}
              className="min-w-[120px]"
            >
              {loading ? 'Creating...' : 'Create Project'}
            </Button>
          </div>
        </div>
      </GlassPanel>
    </motion.div>
  );
}
