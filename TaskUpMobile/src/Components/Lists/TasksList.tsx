import React, { useState } from 'react';
import { StyleSheet, View, FlatList } from 'react-native';
import { TaskCard } from '../Cards/TaskCard';
import { EmptyState } from '../UI/EmptyState';

interface TasksListProps {
  tasks: any[];
  variant?: 'default' | 'compact' | 'minimal';
  limit?: number;
}

export const TasksList = ({ 
  tasks: initialTasks, 
  variant = 'default', 
  limit 
}: TasksListProps) => {
  const [tasks, setTasks] = useState(initialTasks);
  const data = limit ? tasks.slice(0, limit) : tasks;

  const handleStatusChange = (taskId: string, status: string) => {
    setTasks(
      tasks.map((task) =>
        task.id === taskId ? { ...task, status } : task
      )
    );
  };

  if (data.length === 0) {
    return (
      <EmptyState 
        title="No Tasks Found"
        message="You don't have any tasks yet. Create your first task to get started."
        icon="list-outline"
      />
    );
  }

  return (
    <View style={styles.container}>
      {data.map((task) => (
        <TaskCard
          key={task.id}
          task={task}
          variant={variant}
          onStatusChange={handleStatusChange}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
});