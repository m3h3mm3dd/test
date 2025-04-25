import React from 'react';
import { StyleSheet, View, FlatList, ScrollView } from 'react-native';
import { ProjectCard } from '../Cards/ProjectCard';
import { EmptyState } from '../UI/EmptyState';

interface ProjectsListProps {
  projects: any[];
  variant?: 'default' | 'horizontal' | 'minimal';
  limit?: number;
}

export const ProjectsList = ({ 
  projects, 
  variant = 'default', 
  limit
}: ProjectsListProps) => {
  const data = limit ? projects.slice(0, limit) : projects;

  if (data.length === 0) {
    return (
      <EmptyState 
        title="No Projects Found"
        message="You don't have any projects yet. Create your first project to get started."
        icon="folder-outline"
      />
    );
  }

  if (variant === 'horizontal') {
    return (
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.horizontalContainer}
      >
        {data.map((project) => (
          <ProjectCard
            key={project.id}
            project={project}
            variant="horizontal"
          />
        ))}
      </ScrollView>
    );
  }

  return (
    <View style={styles.container}>
      {data.map((project) => (
        <ProjectCard
          key={project.id}
          project={project}
          variant={variant}
        />
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
  },
  horizontalContainer: {
    paddingLeft: 4,
    paddingRight: 20,
  },
});