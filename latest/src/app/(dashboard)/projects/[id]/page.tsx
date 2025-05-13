'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { getProjectById } from '@/api/ProjectAPI';
import { AnimatePresence, motion } from 'framer-motion';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/lib/toast';
import { launchConfetti } from '@/lib/confetti';
import { format, isPast } from 'date-fns';
import { cn } from '@/lib/utils';
import Link from 'next/link';

// Icons
import {
  BarChart3,
  CalendarClock,
  ChevronRight,
  Clock,
  DollarSign,
  FileText,
  Flag,
  MoreHorizontal,
  PanelTop,
  PenSquare,
  Shapes,
  Target,
  Users,
  Users2,
} from 'lucide-react';

// Types
interface ProjectData {
  Id: string;
  Name: string;
  Description: string;
  Deadline?: string;
  Progress: number;
  TotalBudget: number;
  CreatedAt: string;
  OwnerId: string;
}

export default function ProjectPage() {
  const { id } = useParams<{ id: string }>();
  const router = useRouter();
  const { user } = useAuth();
  const [project, setProject] = useState<ProjectData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    async function loadProject() {
      try {
        setLoading(true);
        const data = await getProjectById(id as string);
        setProject(data);
        setError(null);
      } catch (err: any) {
        console.error('Failed to load project:', err);
        setError(err.message || 'Failed to load project details');
        toast.error('Could not load project details');
      } finally {
        setLoading(false);
      }
    }

    if (id) {
      loadProject();
    }
  }, [id]);

  const isOwner = user?.Id === project?.OwnerId;
  const isOverdue = project?.Deadline ? isPast(new Date(project.Deadline)) : false;

  if (loading) {
    return <LoadingState />;
  }

  if (error || !project) {
    return <ErrorState error={error} onRetry={() => router.refresh()} />;
  }

  return (
    <div className="flex flex-col min-h-screen bg-white dark:bg-black">
      {/* Glass Header */}
      <motion.div
        initial={{ opacity: 0, y: -10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="sticky top-0 z-10 backdrop-blur-xl bg-white/70 dark:bg-black/70 border-b border-gray-100 dark:border-gray-800"
      >
        <div className="container max-w-7xl mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <button
                onClick={() => router.push('/projects')}
                className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-5 w-5 text-gray-500 dark:text-gray-400"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M15 19l-7-7 7-7"
                  />
                </svg>
              </button>

              <div>
                <h1 className="text-xl font-medium text-gray-900 dark:text-white truncate max-w-md">
                  {project.Name}
                </h1>
                <div className="flex items-center mt-0.5">
                  <div
                    className={cn(
                      'w-2 h-2 rounded-full mr-2',
                      isOverdue && project.Progress < 100
                        ? 'bg-red-500'
                        : project.Progress >= 100
                        ? 'bg-green-500'
                        : 'bg-blue-500'
                    )}
                  />
                  <span className="text-sm text-gray-500 dark:text-gray-400">
                    {isOverdue && project.Progress < 100
                      ? 'Overdue'
                      : project.Progress >= 100
                      ? 'Completed'
                      : 'In Progress'}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center space-x-2">
              {isOwner && (
                <button
                  onClick={() => router.push(`/projects/${project.Id}/edit`)}
                  className="px-3 py-1.5 rounded-full text-sm font-medium bg-blue-50 text-blue-600 hover:bg-blue-100 dark:bg-blue-900/30 dark:text-blue-400 dark:hover:bg-blue-900/50 transition-colors"
                >
                  <PenSquare className="h-4 w-4 inline-block mr-1 -mt-0.5" />
                  Edit
                </button>
              )}

              <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors">
                <MoreHorizontal className="h-5 w-5 text-gray-500 dark:text-gray-400" />
              </button>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Main Content */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.5, delay: 0.1 }}
        className="flex-grow container max-w-7xl mx-auto px-4 py-6"
      >
        {/* Project Description */}
        {project.Description && (
          <div className="mb-8 bg-gray-50 dark:bg-gray-900 rounded-xl p-5 border border-gray-100 dark:border-gray-800">
            <h2 className="text-sm font-medium text-gray-500 dark:text-gray-400 mb-2">
              Description
            </h2>
            <p className="text-gray-700 dark:text-gray-300 whitespace-pre-wrap">
              {project.Description}
            </p>
          </div>
        )}

        {/* Key Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
          <ProjectMetricCard
            icon={<BarChart3 className="h-5 w-5 text-blue-500" />}
            title="Progress"
            value={`${project.Progress}%`}
            detail={
              <div className="w-full h-2 bg-gray-200 dark:bg-gray-700 rounded-full mt-2">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${project.Progress}%` }}
                  transition={{ duration: 1, delay: 0.2 }}
                  className={cn(
                    'h-full rounded-full',
                    project.Progress >= 100
                      ? 'bg-green-500'
                      : isOverdue
                      ? 'bg-red-500'
                      : 'bg-blue-500'
                  )}
                />
              </div>
            }
          />

          <ProjectMetricCard
            icon={<CalendarClock className="h-5 w-5 text-purple-500" />}
            title="Deadline"
            value={
              project.Deadline
                ? format(new Date(project.Deadline), 'MMM d, yyyy')
                : 'Not set'
            }
            detail={
              project.Deadline ? (
                <span
                  className={cn(
                    'text-xs',
                    isOverdue ? 'text-red-500' : 'text-gray-500 dark:text-gray-400'
                  )}
                >
                  {isOverdue ? 'Overdue' : 'On track'}
                </span>
              ) : null
            }
            alert={isOverdue}
          />

          <ProjectMetricCard
            icon={<DollarSign className="h-5 w-5 text-green-500" />}
            title="Budget"
            value={`$${project.TotalBudget.toLocaleString()}`}
            detail={
              <span className="text-xs text-gray-500 dark:text-gray-400">
                Total budget
              </span>
            }
          />
        </div>

        {/* Navigation Sections */}
        <div className="space-y-4">
          <h2 className="text-xl font-medium text-gray-900 dark:text-white mb-4">
            Project Areas
          </h2>

          <NavigationCard
            icon={<Target className="h-5 w-5 text-blue-500" />}
            title="Tasks"
            description="Manage project tasks and assignments"
            path={`/projects/${project.Id}/tasks`}
          />

          <NavigationCard
            icon={<Users className="h-5 w-5 text-purple-500" />}
            title="Team"
            description="View and manage project team members"
            path={`/projects/${project.Id}/team`}
          />

          <NavigationCard
            icon={<Users2 className="h-5 w-5 text-pink-500" />}
            title="Stakeholders"
            description="Manage project stakeholders and their interests"
            path={`/projects/${project.Id}/stakeholders`}
          />

          <NavigationCard
            icon={<Shapes className="h-5 w-5 text-indigo-500" />}
            title="Scope"
            description="Define and manage project scope"
            path={`/projects/${project.Id}/scope`}
          />

          <NavigationCard
            icon={<Flag className="h-5 w-5 text-red-500" />}
            title="Risks"
            description="Identify and manage project risks"
            path={`/projects/${project.Id}/risks`}
          />

          <NavigationCard
            icon={<FileText className="h-5 w-5 text-amber-500" />}
            title="Attachments"
            description="Access project files and documents"
            path={`/projects/${project.Id}/attachments`}
          />

          <NavigationCard
            icon={<Clock className="h-5 w-5 text-green-500" />}
            title="Activity"
            description="View project timeline and activity history"
            path={`/projects/${project.Id}/activity`}
          />
        </div>

        {/* Project Info Footer */}
        <div className="mt-12 pt-4 border-t border-gray-100 dark:border-gray-800 text-sm text-gray-500 dark:text-gray-400 flex flex-wrap gap-x-8 gap-y-2">
          <div>
            <span className="font-medium">Created:</span>{' '}
            {format(new Date(project.CreatedAt), 'MMM d, yyyy')}
          </div>
          <div>
            <span className="font-medium">Owner:</span> {isOwner ? 'You' : 'Someone else'}
          </div>
          <div>
            <span className="font-medium">Your Role:</span>{' '}
            {isOwner ? 'Project Owner' : 'Viewer'}
          </div>
        </div>
      </motion.div>
    </div>
  );
}

// Component for each metric card
function ProjectMetricCard({
  icon,
  title,
  value,
  detail,
  alert = false,
}: {
  icon: React.ReactNode;
  title: string;
  value: string;
  detail: React.ReactNode;
  alert?: boolean;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.2 }}
      className={cn(
        'bg-white dark:bg-gray-900 rounded-xl shadow-sm border p-5',
        alert
          ? 'border-red-100 dark:border-red-900/50'
          : 'border-gray-100 dark:border-gray-800'
      )}
    >
      <div className="flex items-center mb-2">
        {icon}
        <h3 className="text-sm font-medium text-gray-500 dark:text-gray-400 ml-2">
          {title}
        </h3>
      </div>
      <div className="flex items-center justify-between">
        <span
          className={cn(
            'text-2xl font-bold',
            alert ? 'text-red-600 dark:text-red-500' : 'text-gray-900 dark:text-white'
          )}
        >
          {value}
        </span>
      </div>
      <div className="mt-1">{detail}</div>
    </motion.div>
  );
}

// Component for each navigation card
function NavigationCard({
  icon,
  title,
  description,
  path,
}: {
  icon: React.ReactNode;
  title: string;
  description: string;
  path: string;
}) {
  const router = useRouter();

  return (
    <motion.div
      whileHover={{ y: -2, boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.05)' }}
      whileTap={{ y: 0 }}
      onClick={() => router.push(path)}
      className="bg-white dark:bg-gray-900 rounded-xl border border-gray-100 dark:border-gray-800 p-4 flex items-center justify-between cursor-pointer transition-all"
    >
      <div className="flex items-center">
        <div className="bg-gray-50 dark:bg-gray-800 p-3 rounded-lg mr-4">{icon}</div>
        <div>
          <h3 className="text-base font-semibold text-gray-900 dark:text-white">
            {title}
          </h3>
          <p className="text-sm text-gray-500 dark:text-gray-400">{description}</p>
        </div>
      </div>
      <ChevronRight className="h-5 w-5 text-gray-400 dark:text-gray-600" />
    </motion.div>
  );
}

// Loading State
function LoadingState() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black">
      <div className="w-16 h-16 border-4 border-gray-200 dark:border-gray-800 border-t-blue-500 rounded-full animate-spin"></div>
      <p className="mt-4 text-gray-500 dark:text-gray-400">Loading project details...</p>
    </div>
  );
}

// Error State
function ErrorState({ error, onRetry }: { error: string | null; onRetry: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-white dark:bg-black px-4 text-center">
      <div className="bg-red-50 dark:bg-red-900/20 p-4 rounded-full mb-4">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 text-red-500"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"
          />
        </svg>
      </div>
      <h1 className="text-xl font-medium text-gray-900 dark:text-white mb-2">
        Failed to load project
      </h1>
      <p className="text-gray-500 dark:text-gray-400 mb-6 max-w-md">
        {error || "We couldn't load the project details. Please try again."}
      </p>
      <button
        onClick={onRetry}
        className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-colors"
      >
        Try again
      </button>
      <button
        onClick={() => history.back()}
        className="mt-2 px-4 py-2 text-blue-500 hover:text-blue-600 transition-colors"
      >
        Go back
      </button>
    </div>
  );
}