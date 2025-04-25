import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProjectsListScreen } from '../Screens/Projects/ProjectsListScreen';
import { ProjectDetailScreen } from '../Screens/Projects/ProjectDetailScreen';
import { CreateProjectScreen } from '../Screens/Projects/CreateProjectScreen';
import { EditProjectScreen } from '../Screens/Projects/EditProjectScreen';
import { ProjectTasksScreen } from '../Screens/Projects/ProjectTasksScreen';
import { ProjectTeamsScreen } from '../Screens/Projects/ProjectTeamsScreen';
import { ProjectStakeholdersScreen } from '../Screens/Projects/ProjectStakeholdersScreen';
import { ProjectActivityScreen } from '../Screens/Projects/ProjectActivityScreen';
import { useTheme } from '../Hooks/UseTheme';
import { IconButton } from '../Components/UI/IconButton';

const Stack = createStackNavigator();

export const ProjectNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontFamily: theme.fonts.medium,
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="ProjectsList"
        component={ProjectsListScreen}
        options={{
          title: 'Projects',
        }}
      />
      <Stack.Screen
        name="ProjectDetail"
        component={ProjectDetailScreen}
        options={({ navigation, route }) => ({
          title: 'Project Details',
          headerRight: () => (
            <IconButton
              name="create-outline"
              onPress={() => navigation.navigate('EditProject', { projectId: route.params.projectId })}
              style={{ marginRight: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="CreateProject"
        component={CreateProjectScreen}
        options={{
          title: 'Create Project',
        }}
      />
      <Stack.Screen
        name="EditProject"
        component={EditProjectScreen}
        options={{
          title: 'Edit Project',
        }}
      />
      <Stack.Screen
        name="ProjectTasks"
        component={ProjectTasksScreen}
        options={{
          title: 'Project Tasks',
        }}
      />
      <Stack.Screen
        name="ProjectTeams"
        component={ProjectTeamsScreen}
        options={{
          title: 'Project Teams',
        }}
      />
      <Stack.Screen
        name="ProjectStakeholders"
        component={ProjectStakeholdersScreen}
        options={{
          title: 'Stakeholders',
        }}
      />
      <Stack.Screen
        name="ProjectActivity"
        component={ProjectActivityScreen}
        options={{
          title: 'Activity',
        }}
      />
    </Stack.Navigator>
  );
};