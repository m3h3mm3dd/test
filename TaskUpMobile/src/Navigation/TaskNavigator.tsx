import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { TasksListScreen } from '../Screens/Tasks/TasksListScreen';
import { TaskDetailScreen } from '../Screens/Tasks/TaskDetailScreen';
import { CreateTaskScreen } from '../Screens/Tasks/CreateTaskScreen';
import { EditTaskScreen } from '../Screens/Tasks/EditTaskScreen';
import { useTheme } from '../Hooks/UseTheme';
import { IconButton } from '../Components/UI/IconButton';

const Stack = createStackNavigator();

export const TaskNavigator = () => {
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
        name="TasksList"
        component={TasksListScreen}
        options={{
          title: 'Tasks',
        }}
      />
      <Stack.Screen
        name="TaskDetail"
        component={TaskDetailScreen}
        options={({ navigation, route }) => ({
          title: 'Task Details',
          headerRight: () => (
            <IconButton
              name="create-outline"
              onPress={() => navigation.navigate('EditTask', { taskId: route.params.taskId })}
              style={{ marginRight: 16 }}
            />
          ),
        })}
      />
      <Stack.Screen
        name="CreateTask"
        component={CreateTaskScreen}
        options={{
          title: 'Create Task',
        }}
      />
      <Stack.Screen
        name="EditTask"
        component={EditTaskScreen}
        options={{
          title: 'Edit Task',
        }}
      />
    </Stack.Navigator>
  );
};