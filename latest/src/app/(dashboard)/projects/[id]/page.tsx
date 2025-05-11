'use client';

import { useEffect, useState, useRef } from 'react';
import { useParams } from 'next/navigation';
import { getProjectById } from '@/api/ProjectAPI';
import { getProjectTasks } from '@/api/TaskAPI';
import { Tabs } from '@/components/ui/tabs';
import { ProjectScope } from '@/components/project/ProjectScope';
import { ProjectTeam } from '@/components/project/ProjectTeam';
import { ProjectStakeholders } from '@/components/project/ProjectStakeholders';
import { ProjectActivityLog } from '@/components/project/ProjectActivityLog';
import { ProjectAttachments } from '@/components/project/ProjectAttachments';
import { ProjectTasks } from '@/components/project/ProjectTasks';
import { ProjectRisks } from '@/components/project/ProjectRisks';
import { ProjectBudget } from '@/components/project/ProjectBudget';
import { ProjectChat } from '@/components/chat/ProjectChat';
import { GlassPanel } from '@/components/ui/GlassPanel';
import { Skeleton } from '@/components/ui/skeleton';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthContext } from '@/contexts/AuthContext';
import { ProjectHeaderActions } from '@/components/project/ProjectHeaderActions';
import { RouteGuard } from '@/components/RouteGuard';
import { toast } from '@/lib/toast';

export default function ProjectDetailPage() {
  const { id } = useParams();
  const { user } = useAuthContext();
  const [project, setProject] = useState<any>(null);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [tab, setTab] = useState('overview');
  const contentRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function load() {
      try {
        const [projectData, taskData] = await Promise.all([
          getProjectById(id as string),
          getProjectTasks(id as string)
        ]);
        setProject(projectData);
        setTasks(taskData);
      } catch (error) {
        console.error('Failed to load project:', error);
        toast.error('Failed to load project data');
      } finally {
        setLoading(false);
      }
    }
    
    load();
  }, [id]);

  useEffect(() => {
    contentRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
  }, [tab]);

  // Get user's role for this project
  const getUserProjectRole = () => {
    if (!user || !project) return null;
    
    if (project.OwnerId === user.Id) return 'project_owner';
    
    // Check if user is a team leader in one of the project's teams
    // This would require additional logic to check team membership
    
    return 'member'; // Default role
  };

  if (loading) {
    return (
      <div className="p-6 space-y-4">
        <Skeleton className="h-10 w-1/3" />
        <Skeleton className="h-6 w-1/2" />
        <Skeleton className="h-96 w-full" />
      </div>
    );
  }

  if (!project) return <div className="p-6">Project not found.</div>;

  const userRole = getUserProjectRole();

  const tabs = [
    { label: 'Overview', value: 'overview' },
    { label: 'Tasks', value: 'tasks' },
    { label: 'Team', value: 'team' },
    { label: 'Stakeholders', value: 'stakeholders' },
    { label: 'Scope', value: 'scope' },
    { label: 'Risks', value: 'risks' },
    { label: 'Budget', value: 'budget' },
    { label: 'Activity', value: 'activity' },
    { label: 'Files', value: 'attachments' },
    { label: 'Chat', value: 'chat' },
  ];

  return (
    <RouteGuard>
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.35 }}
        className="p-6 space-y-6"
      >
        <GlassPanel className="p-6">
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-semibold">{project.Name}</h1>
              <p className="text-muted-foreground mt-2 max-w-3xl">{project.Description}</p>
            </div>
            {user && (
              <ProjectHeaderActions
                userId={user.Id}
                ownerId={project.OwnerId}
                projectId={project.Id}
              />
            )}
          </div>
        </GlassPanel>

        <Tabs tabs={tabs} value={tab} onChange={setTab} fullWidth className="mt-4" />

        <div ref={contentRef} className="relative min-h-[360px]">
          <AnimatePresence mode="wait">
            {tab === 'overview' && (
              <motion.div
                key="overview"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -6 }}
                transition={{ duration: 0.25 }}
                className="mt-4"
              >
                <GlassPanel className="p-4 text-muted-foreground">
                  <div className="space-y-2">
                    <div>
                      <strong>Progress:</strong> {project.Progress || 0}%
                      <div className="w-full h-3 bg-muted rounded-full overflow-hidden mt-1">
                        <div
                          className="h-full bg-primary transition-all duration-300"
                          style={{ width: `${project.Progress || 0}%` }}
                        />
                      </div>
                    </div>
                    <p><strong>Deadline:</strong> {project.Deadline ? new Date(project.Deadline).toLocaleDateString() : '—'}</p>
                    <p><strong>Budget:</strong> ${project.TotalBudget?.toLocaleString()}</p>
                    <p><strong>Owner:</strong> {project.Owner?.FirstName} {project.Owner?.LastName}</p>
                    <p><strong>Created:</strong> {new Date(project.CreatedAt).toLocaleDateString()}</p>
                  </div>
                </GlassPanel>
              </motion.div>
            )}

            {tab === 'tasks' && (
              <motion.div key="tasks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectTasks projectId={project.Id} userRole={userRole} />
              </motion.div>
            )}

            {tab === 'team' && (
              <motion.div key="team" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectTeam projectId={project.Id} userRole={userRole} />
              </motion.div>
            )}

            {tab === 'stakeholders' && (
              <motion.div key="stakeholders" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectStakeholders projectId={project.Id} userRole={userRole} />
              </motion.div>
            )}

            {tab === 'scope' && (
              <motion.div key="scope" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectScope projectId={project.Id} userRole={userRole} />
              </motion.div>
            )}

            {tab === 'risks' && (
              <motion.div key="risks" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectRisks projectId={project.Id} userRole={userRole} />
              </motion.div>
            )}

            {tab === 'budget' && (
              <motion.div key="budget" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectBudget 
                  projectId={project.Id} 
                  userRole={userRole} 
                  budget={project.TotalBudget || 0} 
                />
              </motion.div>
            )}

            {tab === 'activity' && (
              <motion.div key="activity" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectActivityLog projectId={project.Id} />
              </motion.div>
            )}

            {tab === 'attachments' && (
              <motion.div key="attachments" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectAttachments projectId={project.Id} userRole={userRole} />
              </motion.div>
            )}

            {tab === 'chat' && (
              <motion.div key="chat" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}>
                <ProjectChat projectId={project.Id} userId={user?.Id} />
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>
    </RouteGuard>
  );
}