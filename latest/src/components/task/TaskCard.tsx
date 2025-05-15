'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
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

  // Get the appropriate badge variant based on priority
  const getPriorityBadgeVariant = () => {
    switch (task.Priority) {
      case 'HIGH':
        return 'danger';
      case 'MEDIUM':
        return 'warning';
      case 'LOW':
        return 'info';
      default:
        return 'default';
    }
  };

  // Get the appropriate badge variant based on status
  const getStatusBadgeVariant = () => {
    if (task.Completed) return 'success';
    
    switch (task.Status) {
      case 'In Progress':
        return 'info';
      case 'Not Started':
        return 'default';
      default:
        return 'default';
    }
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -10 }}
      className={cn("relative", className)}
    >
      <Card
        onClick={onClick}
        className={cn(
          "relative overflow-hidden border backdrop-blur-sm transition-all duration-200",
          "hover:shadow-md dark:hover:shadow-primary/5",
          task.Completed && "opacity-80",
          isOverdue() && !task.Completed && "ring-1 ring-destructive"
        )}
      >
        {/* Priority indicator with theme-compatible colors */}
        <div
          className={cn(
            "absolute h-full w-1.5 left-0 top-0",
            task.Priority === 'HIGH' && "bg-destructive",
            task.Priority === 'MEDIUM' && "bg-warning",
            task.Priority === 'LOW' && "bg-primary"
          )}
        />

        {/* Glass effect on hover */}
        <div className="absolute inset-0 bg-primary/5 dark:bg-primary/10 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Glowing highlight animation on hover */}
        <div className="absolute inset-0 opacity-0 group-hover:opacity-100 overflow-hidden pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-primary/10 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-1500" />
        </div>

        {/* Content with left padding for indicator */}
        <div className="p-5 pl-4">
          <div className="flex justify-between">
            <div className="space-y-2 pl-3">
              <h3 
                className={cn(
                  "line-clamp-2 text-lg font-medium text-foreground",
                  task.Completed && "line-through opacity-60"
                )}
              >
                {task.Title}
              </h3>
              
              {task.Description && (
                <p className={cn(
                  "line-clamp-2 text-sm text-muted-foreground",
                  task.Completed && "opacity-60"
                )}>
                  {task.Description}
                </p>
              )}
            </div>
            
            <Badge
              variant={getStatusBadgeVariant()}
              className="ml-3 shrink-0"
            >
              {task.Completed ? 'Completed' : task.Status}
            </Badge>
          </div>

          <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pl-3">
            <div className="flex flex-wrap items-center gap-3 text-xs">
              {task.Deadline && (
                <div 
                  className={cn(
                    "flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-muted text-muted-foreground",
                    isOverdue() && !task.Completed && "text-destructive bg-destructive/10",
                    isDueToday() && !task.Completed && "text-warning bg-warning/10"
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
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-muted text-muted-foreground">
                  <Users className="h-3.5 w-3.5" />
                  <span>Team</span>
                </div>
              ) : task.UserId ? (
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-muted text-muted-foreground">
                  <User className="h-3.5 w-3.5" />
                  <span>{isAssigned ? 'You' : 'Assigned'}</span>
                </div>
              ) : null}
              
              {showProjectInfo && project && (
                <div className="flex items-center gap-1.5 rounded-full px-2.5 py-1 bg-muted text-muted-foreground">
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
                    "bg-success text-success-foreground",
                    "shadow-sm transition-all z-10"
                  )}
                >
                  <CheckCircle className="h-4 w-4" />
                </motion.button>
              )}
              
              {/* Quick action button */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.95 }}
                className="h-8 w-8 rounded-full flex items-center justify-center bg-muted text-muted-foreground hover:text-foreground transition-colors z-10"
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
      </Card>
    </motion.div>
  );
}