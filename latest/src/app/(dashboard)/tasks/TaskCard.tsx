'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { format, isPast, isToday } from 'date-fns';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  Calendar,
  CheckCircle2,
  User,
  Users,
  AlertTriangle,
  ArrowRight,
  Clock
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
    CreatedBy?: string;
    Deadline?: string;
    Completed: boolean;
    ProjectId?: string;
    project?: any;
  };
  onClick: () => void;
  onComplete?: (e: React.MouseEvent) => void;
  currentUserId?: string;
  userRole?: string;
  showProjectInfo?: boolean;
  className?: string;
}

export function TaskCard({
  task,
  onClick,
  onComplete,
  currentUserId,
  userRole,
  showProjectInfo = false,
  className,
}: TaskCardProps) {
  const isTeamTask = !!task.TeamId;
  const isAssigned = task.UserId === currentUserId;
  const isCreator = task.CreatedBy === currentUserId;
  
  // Helper functions for date and status
  const isOverdue = () => {
    if (!task.Deadline || task.Completed) return false;
    return isPast(new Date(task.Deadline)) && !isToday(new Date(task.Deadline));
  };

  const isDueToday = () => {
    if (!task.Deadline || task.Completed) return false;
    return isToday(new Date(task.Deadline));
  };

  // Get appropriate badge variant based on priority
  const getPriorityVariant = () => {
    switch (task.Priority) {
      case 'HIGH': return 'danger';
      case 'MEDIUM': return 'warning';
      case 'LOW': return 'info';
      default: return 'default';
    }
  };

  // Get appropriate badge variant based on status
  const getStatusVariant = () => {
    if (task.Completed || task.Status === 'Completed') return 'success';
    if (task.Status === 'In Progress') return 'info';
    return 'default';
  };

  return (
    <motion.div
      whileHover={{ y: -4 }}
      whileTap={{ scale: 0.98 }}
      transition={{ duration: 0.2 }}
      className={cn(
        'group relative flex flex-col overflow-hidden rounded-xl border bg-card shadow-sm transition-all duration-200',
        task.Completed && 'opacity-80',
        isOverdue() && !task.Completed && 'border-destructive',
        className
      )}
    >
      {/* Priority indicator strip */}
      <div 
        className={cn(
          'absolute left-0 top-0 h-full w-1.5',
          task.Priority === 'HIGH' && 'priority-indicator-high',
          task.Priority === 'MEDIUM' && 'priority-indicator-medium',
          task.Priority === 'LOW' && 'priority-indicator-low'
        )} 
      />

      {/* Card content */}
      <div className="flex-1 p-5 pl-4" onClick={onClick}>
        <div className="flex justify-between">
          <div className="space-y-2 pl-2">
            <h3 
              className={cn(
                "line-clamp-2 font-medium tracking-tight", 
                task.Completed && "line-through opacity-70"
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
            variant={getStatusVariant() as any}
            className="ml-auto shrink-0"
          >
            {task.Completed ? 'Completed' : task.Status}
          </Badge>
        </div>

        <div className="mt-4 flex flex-wrap items-center justify-between gap-2 pl-2">
          <div className="flex flex-wrap items-center gap-3 text-xs text-muted-foreground">
            {task.Deadline && (
              <div 
                className={cn(
                  "flex items-center gap-1",
                  isOverdue() && !task.Completed && "date-overdue",
                  isDueToday() && !task.Completed && "date-today"
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
                {isOverdue() && !task.Completed && <AlertTriangle className="h-3.5 w-3.5 ml-0.5" />}
              </div>
            )}
            
            {isTeamTask ? (
              <div className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                <span>Team</span>
              </div>
            ) : task.UserId ? (
              <div className="flex items-center gap-1">
                <User className="h-3.5 w-3.5" />
                <span>{isAssigned ? 'Assigned to you' : 'Assigned'}</span>
              </div>
            ) : null}
            
            {showProjectInfo && task.project && (
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span className="truncate max-w-[120px]">{task.project.Name || task.project.Title}</span>
              </div>
            )}
          </div>

          <div className="flex items-center gap-2">
            {/* Details button */}
            <Button 
              size="sm" 
              variant="ghost" 
              className="h-8 gap-1 px-2 text-xs opacity-0 group-hover:opacity-100 transition-opacity"
              onClick={(e) => {
                e.stopPropagation();
                onClick();
              }}
            >
              Details
              <ArrowRight className="h-3.5 w-3.5" />
            </Button>
            
            {/* Complete button */}
            {!task.Completed && onComplete && (
              <Button 
                size="icon" 
                variant="outline" 
                className={cn(
                  "h-8 w-8 rounded-full border-success/20 bg-success/10 text-success hover:bg-success/20 hover:text-success transition-all"
                )}
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete(e);
                }}
              >
                <CheckCircle2 className="h-4 w-4" />
              </Button>
            )}
          </div>
        </div>
      </div>
      
      {/* Shine effect on hover */}
      <div className="absolute inset-0 pointer-events-none opacity-0 group-hover:opacity-100">
        <div className="absolute inset-0 z-10 bg-gradient-to-r from-transparent via-primary/5 to-transparent -translate-x-full group-hover:animate-shine" />
      </div>
    </motion.div>
  );
}