// src/components/task/TaskCard.tsx
'use client';

import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { Calendar, Clock, User, Users, AlertTriangle } from 'lucide-react';

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
  };
  onClick: () => void;
  onComplete?: () => void;
  userRole: string | null;
  currentUserId?: string;
  project?: any; // Optional project info for global view
  showProjectInfo?: boolean; // Whether to show project context (for global view)
}

export function TaskCard({ 
  task, 
  onClick, 
  onComplete, 
  userRole, 
  currentUserId,
  project,
  showProjectInfo = false
}: TaskCardProps) {
  const isTeamTask = !!task.TeamId;
  const isAssigned = task.UserId === currentUserId;
  const isCreator = task.CreatedBy === currentUserId;
  const canComplete = isAssigned || isCreator || userRole === 'project_owner';
  
  // Get status class
  const getStatusClass = () => {
    switch (task.Status) {
      case 'Completed': return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
      case 'In Progress': return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-100';
      default: return 'bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-100';
    }
  };
  
  // Get priority class
  const getPriorityClass = () => {
    switch (task.Priority) {
      case 'HIGH': return 'bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-100';
      case 'MEDIUM': return 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-100';
      default: return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-100';
    }
  };
  
  // Check if task is overdue
  const isOverdue = () => {
    if (!task.Deadline || task.Completed) return false;
    return new Date(task.Deadline) < new Date();
  };

  return (
    <Card
      className={cn(
        'p-4 rounded-xl bg-white/5 backdrop-blur-sm border border-white/10 shadow-sm space-y-2 transition-all hover:scale-[1.01]',
        'dark:bg-white/10 dark:border-white/20',
        task.Completed && 'opacity-70'
      )}
    >
      <div className="flex items-start justify-between">
        <h3 className={cn(
          "text-base font-medium pr-2",
          task.Completed && "line-through opacity-70"
        )}>
          {task.Title}
        </h3>
        <div className="flex flex-col gap-1">
          <Badge className={getStatusClass()}>
            {task.Status}
          </Badge>
          <Badge className={getPriorityClass()}>
            {task.Priority}
          </Badge>
        </div>
      </div>

      {task.Description && (
        <p className={cn(
          "text-sm text-muted-foreground line-clamp-2",
          task.Completed && "opacity-70"
        )}>
          {task.Description}
        </p>
      )}

      {/* Only show project info in global view */}
      {showProjectInfo && project && (
        <p className="text-xs text-muted-foreground">
          Project: {project.Name || project.Title}
        </p>
      )}

      <div className="flex flex-wrap gap-2 pt-1 text-xs text-muted-foreground">
        {task.Deadline && (
          <div className={cn(
            "flex items-center",
            isOverdue() && "text-red-500"
          )}>
            <Calendar className="h-3 w-3 mr-1" />
            {format(new Date(task.Deadline), 'MMM d, yyyy')}
            {isOverdue() && <AlertTriangle className="h-3 w-3 ml-1 text-red-500" />}
          </div>
        )}
        
        {isTeamTask ? (
          <div className="flex items-center">
            <Users className="h-3 w-3 mr-1" />
            Team
          </div>
        ) : task.UserId ? (
          <div className="flex items-center">
            <User className="h-3 w-3 mr-1" />
            Assigned
          </div>
        ) : null}
      </div>

      <div className="flex justify-between items-center pt-2">
        <Button variant="ghost" size="sm" onClick={onClick}>
          Details
        </Button>

        {!task.Completed && canComplete && onComplete && (
          <Button 
            size="sm" 
            variant="outline"
            onClick={(e) => {
              e.stopPropagation();
              onComplete();
            }}
          >
            Complete
          </Button>
        )}
      </div>
    </Card>
  );
}