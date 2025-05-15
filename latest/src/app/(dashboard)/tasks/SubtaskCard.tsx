'use client';

import React from 'react';
import { motion } from 'framer-motion';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CheckCircle2, ChevronRight, Clock } from 'lucide-react';
import { cn } from '@/lib/utils';
import { format } from 'date-fns';

interface SubtaskCardProps {
  subtask: {
    id: string;
    title: string;
    description?: string;
    status: string;
    completed: boolean;
    createdAt: string;
    dueDate?: string;
  };
  onComplete?: () => void;
  onClick?: () => void;
  parentTaskId: string;
}

export function SubtaskCard({ subtask, onComplete, onClick, parentTaskId }: SubtaskCardProps) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="overflow-hidden"
    >
      <Card className="p-4 cursor-pointer hover:shadow-md transition-all" onClick={onClick}>
        <div className="flex justify-between items-start gap-2">
          <div className="flex-1">
            <h4 className={cn(
              "font-medium text-base mb-1",
              subtask.completed && "line-through opacity-70"
            )}>
              {subtask.title}
            </h4>
            
            {subtask.description && (
              <p className={cn(
                "text-sm text-muted-foreground line-clamp-2 mb-3",
                subtask.completed && "opacity-60"
              )}>
                {subtask.description}
              </p>
            )}
            
            <div className="flex items-center gap-3 text-xs text-muted-foreground">
              <div className="flex items-center gap-1">
                <Clock className="h-3.5 w-3.5" />
                <span>{format(new Date(subtask.createdAt), 'MMM d, yyyy')}</span>
              </div>
              
              {subtask.dueDate && (
                <div className="flex items-center gap-1">
                  <Clock className="h-3.5 w-3.5" />
                  <span>Due: {format(new Date(subtask.dueDate), 'MMM d, yyyy')}</span>
                </div>
              )}
            </div>
          </div>
          
          <div className="flex flex-col gap-2 items-end">
            <Badge variant={subtask.completed ? 'success' : subtask.status === 'In Progress' ? 'info' : 'default'}>
              {subtask.status}
            </Badge>
            
            {!subtask.completed && onComplete && (
              <Button 
                size="sm" 
                variant="ghost" 
                className="h-8 px-2"
                onClick={(e) => {
                  e.stopPropagation();
                  onComplete();
                }}
              >
                <CheckCircle2 className="h-4 w-4 mr-1" />
                <span>Complete</span>
              </Button>
            )}
          </div>
        </div>
        
        <div className="flex justify-end mt-2">
          <Button 
            variant="ghost" 
            size="sm" 
            className="opacity-50 hover:opacity-100"
            onClick={(e) => {
              e.stopPropagation();
              onClick && onClick();
            }}
          >
            <span className="text-xs">View Details</span>
            <ChevronRight className="h-3.5 w-3.5 ml-1" />
          </Button>
        </div>
      </Card>
    </motion.div>
  );
}

export default SubtaskCard;