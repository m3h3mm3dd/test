'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import {
  Calendar,
  Clock,
  User,
  Users,
  AlertTriangle,
  CheckCircle,
  ArrowRight,
  MoreHorizontal
} from 'lucide-react';

interface TaskCardProps {
  task: {
    Id: string;
    Title: string;
    Description?: string;
    UserId?: string;
    TeamId?: string;
    Status: string;
    Priority: string;
    CreatedBy: string;
    Deadline?: string;
    Completed: boolean;
    ProjectId?: string;
  };
  onClick: () => void;
  onComplete?: (e: React.MouseEvent) => void;
  userRole?: string | null;
  currentUserId?: string;
  project?: any;
  showProjectInfo?: boolean;
  className?: string;
}

export function TaskCard({
  task,
  onClick,
  onComplete,
  userRole,
  currentUserId,
  project,
  showProjectInfo = false,
  className,
}: TaskCardProps) {
  const isTeamTask = !!task.TeamId;
  const isAssigned = task.UserId === currentUserId;
  const isCreator = task.CreatedBy === currentUserId;
  const canComplete = isAssigned || isCreator || userRole === 'project_owner';

  // Check deadline status
  const isOverdue = () => {
    if (!task.Deadline || task.Completed) return false;
    return isPast(new Date(task.Deadline)) && !isToday(new Date(task.Deadline));
  };

  const isDueToday = () => {
    if (!task.Deadline || task.Completed) return false;
    return isToday(new Date(task.Deadline));
  };

  // Priority colors
  const getPriorityColors = () => {
    switch (task.Priority) {
      case 'HIGH':
        return 'from-red-500 to-pink-500 shadow-red-200 dark:shadow-red-900/20';
      case 'MEDIUM':
        return 'from-amber-500 to-orange-500 shadow-amber-200 dark:shadow-amber-900/20';
      case 'LOW':
        return 'from-blue-500 to-indigo-500 shadow-blue-200 dark:shadow-blue-900/20';
      default:
        return 'from-gray-400 to-gray-500 shadow-gray-200 dark:shadow-gray-900/20';
    }
  };

  // Status colors
  const getStatusColors = () => {
    if (task.Completed) {
      return 'bg-green-50 text-green-700 border-green-200 dark:bg-green-900/20 dark:text-green-400 dark:border-green-900/30';
    }

    switch (task.Status) {
      case 'In Progress':
        return 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-900/20 dark:text-blue-400 dark:border-blue-900/30';
      case 'Not Started':
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-800';
      default:
        return 'bg-gray-50 text-gray-700 border-gray-200 dark:bg-gray-800/30 dark:text-gray-400 dark:border-gray-800';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4, boxShadow: '0 12px 20px -8px rgba(0, 0, 0, 0.15)' }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      transition={{ duration: 0.2 }}
      onClick={onClick}
      className={cn(
        'group relative rounded-2xl bg-white dark:bg-gray-900 border border-gray-100 dark:border-gray-800',
        'overflow-hidden backdrop-blur-sm shadow-lg hover:shadow-xl',
        task.Completed && 'opacity-80',
        isOverdue() && !task.Completed && 'ring-1 ring-red-400 dark:ring-red-700',
        className
      )}
    >
      {/* Priority indicator with gradient */}
      <div
        className={cn(
          'absolute h-full w-1.5 left-0 top-0 bg-gradient-to-b',
          getPriorityColors()
        )}
      />

      {/* Glass effect on hover */}
      <div className="absolute inset-0 bg-white/10 dark:bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

      {/* Glowing highlight animation on hover */}
      <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden pointer-events-none">
        <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
      </div>

      {/* Content with left padding for indicator */}
      <div className="p-5 pl-4">
        <div className="flex justify-between">
          <div className="space-y-2 pl-3">
            <h3 
              className={cn(
                "line-clamp-2 text-lg font-medium text-gray-900 dark:text-gray-100",
                task.Completed && "line-through opacity-60"
              )}
            >
              {task.Title}
            </h3>
            
            {task.Description && (
              <p className={cn(
                "line-clamp-2 text-sm text-gray-500 dark:text-gray-400",
                task.Completed && "opacity-60"
              )}>
                {task.Description}
              </p>
            )}
          </div>
          
          <div className={cn(
            'ml-3 shrink-0 px-3 py-1 text-xs font-medium rounded-full border',
            getStatusColors()
          )}>
            {task.Completed ? 'Completed' : task.Status}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pl-3">
          <div className="flex flex-wrap items-center gap-3 text-xs">
            {task.Deadline && (
              <div 
                className={cn(
                  "flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-gray-50 dark:bg-gray-800/50",
                  isOverdue() && !task.Completed && "text-red-600 dark:text-red-400 bg-red-50 dark:bg-red-900/20",
                  isDueToday() && !task.Completed && "text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-900/20"
                )}
              >
                <Calendar className="h-3.5 w-3.5" />
                <span>
                  {isOverdue() && !task.Completed 
                    ? 'Overdue' 
                    : isDueToday() && !task.Completed 
                      ? 'Due today' 
                      : format(new Date(task.Deadline), 'MMM d')}
                </span>
                {isOverdue() && !task.Completed && <AlertTriangle className="h-3.5 w-3.5" />}
              </div>
            )}
            
            {isTeamTask ? (
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                <Users className="h-3.5 w-3.5" />
                <span>Team</span>
              </div>
            ) : task.UserId ? (
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                <User className="h-3.5 w-3.5" />
                <span>{isAssigned ? 'You' : 'Assigned'}</span>
              </div>
            ) : null}
            
            {showProjectInfo && project && (
              <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-gray-50 dark:bg-gray-800/50 text-gray-600 dark:text-gray-400">
                <Clock className="h-3.5 w-3.5" />
                <span className="truncate max-w-[100px]">{project.Name || project.Title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Complete button */}
            {!task.Completed && canComplete && onComplete && (
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(e);
                }}
                className={cn(
                  "h-8 w-8 rounded-full flex items-center justify-center",
                  "bg-gradient-to-br from-green-500 to-emerald-600 text-white",
                  "shadow-lg shadow-green-200 dark:shadow-green-900/30",
                  "transform transition-all z-10"
                )}
              >
                <CheckCircle className="h-4 w-4" />
              </motion.button>
            )}
            
            {/* Quick action button */}
            <motion.button
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              className="h-8 w-8 rounded-full flex items-center justify-center bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-200 dark:hover:bg-gray-700 transition-colors z-10"
              onClick={(e) => {
                e.stopPropagation();
                // You can add more options here
              }}
            >
              <MoreHorizontal className="h-4 w-4" />
            </motion.button>
          </div>
        </div>
      </div>
    </motion.div>
  );
}