'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import {
  FolderKanban,
  CheckSquare,
  Clock,
  BarChart2,
  ArrowRight,
  CheckCheck,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { getProjects } from '@/api/ProjectAPI';
import { getCurrentUserTasks } from '@/api/TaskAPI';
import { cn } from '@/lib/utils';

// Animations
const container = {
  hidden: { opacity: 0 },
  show: {
    opacity: 1,
    transition: { staggerChildren: 0.1 },
  },
};

const item = {
  hidden: { opacity: 0, y: 20 },
  show: {
    opacity: 1,
    y: 0,
    transition: { type: 'spring', stiffness: 260, damping: 20 },
  },
};

interface StatCardProps {
  title: string;
  icon: React.ReactNode;
  stats: {
    label: string;
    value: number;
    icon?: React.ReactNode;
    color?: string;
  }[];
  link: string;
  bgGradient?: string;
}

function StatCard({ title, icon, stats, link, bgGradient }: StatCardProps) {
  const router = useRouter();

  return (
    <motion.div
      variants={item}
      className={cn(
        'relative overflow-hidden rounded-xl border border-white/10 backdrop-blur-md shadow-sm hover:shadow-md transition-all duration-300 p-5',
        'hover:scale-[1.02] cursor-pointer',
        bgGradient || 'bg-gradient-to-br from-white/5 to-white/[0.02]'
      )}
      onClick={() => router.push(link)}
    >
      <div className="flex justify-between items-start mb-4">
        <div className="flex items-center gap-2">
          <div className="bg-primary/10 rounded-full p-2 text-primary">{icon}</div>
          <h3 className="font-semibold">{title}</h3>
        </div>
        <div className="text-primary/80 hover:text-primary transition-colors">
          <ArrowRight className="h-5 w-5" />
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        {stats.map((stat, index) => (
          <div key={index} className="flex flex-col">
            <div className="flex items-center gap-1.5">
              <div className={cn('h-4 w-4', stat.color || 'text-primary/80')}>
                {stat.icon}
              </div>
              <span className="text-sm text-muted-foreground">{stat.label}</span>
            </div>
            <p className="text-2xl font-bold mt-1">{stat.value}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}

export function StatCards() {
  const [projects, setProjects] = useState<any[]>([]);
  const [tasks, setTasks] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadData() {
      try {
        const [projectsData, tasksData] = await Promise.all([
          getProjects(),
          getCurrentUserTasks(),
        ]);

        setProjects(projectsData);
        setTasks(tasksData);
      } catch (error) {
        console.error('Failed to load stats:', error);
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, []);

  const today = new Date();
  const nextWeek = new Date(today);
  nextWeek.setDate(today.getDate() + 7);

  const projectStats = {
    total: projects.length,
    inProgress: projects.filter((p) => p.Progress > 0 && p.Progress < 100).length,
    completed: projects.filter((p) => p.Progress === 100).length,
  };

  const taskStats = {
    total: tasks.length,
    assigned: tasks.length, // since tasks are from current user
    overdue: tasks.filter((t) => t.Deadline && new Date(t.Deadline) < today && !t.Completed).length,
    completed: tasks.filter((t) => t.Completed).length,
  };

  const deadlineStats = {
    thisWeek: tasks.filter((t) => {
      if (!t.Deadline) return false;
      const d = new Date(t.Deadline);
      return d >= today && d <= nextWeek && !t.Completed;
    }).length,
    nextMilestone: 1, // Placeholder
    tightestTimeline: tasks.filter((t) => t.Priority === 'HIGH' || t.Priority === 'URGENT').length,
  };

  const analyticsStats = {
    taskProgress: Math.round((taskStats.completed / (taskStats.total || 1)) * 100),
    weeklyCompletion: tasks.filter((t) => {
      if (!t.UpdatedAt) return false;
      const d = new Date(t.UpdatedAt);
      const weekAgo = new Date(today);
      weekAgo.setDate(today.getDate() - 7);
      return t.Completed && d >= weekAgo;
    }).length,
  };

  if (loading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="h-36 animate-pulse bg-white/5 rounded-xl" />
        ))}
      </div>
    );
  }

  return (
    <motion.div
      variants={container}
      initial="hidden"
      animate="show"
      className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4"
    >
      <StatCard
        title="Projects"
        icon={<FolderKanban className="h-5 w-5" />}
        stats={[
          { label: 'Total', value: projectStats.total },
          { label: 'In Progress', value: projectStats.inProgress, icon: <Clock className="h-4 w-4" />, color: 'text-amber-500' },
          { label: 'Completed', value: projectStats.completed, icon: <CheckCheck className="h-4 w-4" />, color: 'text-green-500' },
        ]}
        link="/projects"
        bgGradient="bg-gradient-to-br from-blue-500/5 to-indigo-500/5"
      />

      <StatCard
        title="Tasks"
        icon={<CheckSquare className="h-5 w-5" />}
        stats={[
          { label: 'Total', value: taskStats.total },
          { label: 'Assigned', value: taskStats.assigned, icon: <CheckSquare className="h-4 w-4" />, color: 'text-blue-500' },
          { label: 'Overdue', value: taskStats.overdue, icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500' },
          { label: 'Completed', value: taskStats.completed, icon: <CheckCheck className="h-4 w-4" />, color: 'text-green-500' },
        ]}
        link="/tasks"
        bgGradient="bg-gradient-to-br from-green-500/5 to-emerald-500/5"
      />

      <StatCard
        title="Deadlines"
        icon={<Clock className="h-5 w-5" />}
        stats={[
          { label: 'This Week', value: deadlineStats.thisWeek, icon: <Calendar className="h-4 w-4" />, color: 'text-indigo-500' },
          { label: 'Next Milestone', value: deadlineStats.nextMilestone, icon: <Clock className="h-4 w-4" />, color: 'text-amber-500' },
          { label: 'High Priority', value: deadlineStats.tightestTimeline, icon: <AlertCircle className="h-4 w-4" />, color: 'text-red-500' },
        ]}
        link="/calendar"
        bgGradient="bg-gradient-to-br from-amber-500/5 to-orange-500/5"
      />

      <StatCard
        title="Analytics"
        icon={<BarChart2 className="h-5 w-5" />}
        stats={[
          { label: 'Task Progress', value: analyticsStats.taskProgress, icon: <CheckSquare className="h-4 w-4" />, color: 'text-blue-500' },
          { label: 'Weekly Completed', value: analyticsStats.weeklyCompletion, icon: <CheckCheck className="h-4 w-4" />, color: 'text-green-500' },
        ]}
        link="/analytics"
        bgGradient="bg-gradient-to-br from-purple-500/5 to-fuchsia-500/5"
      />
    </motion.div>
  );
}
