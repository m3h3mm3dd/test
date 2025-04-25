import React, { useState, useEffect } from 'react';
import {
  View,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Image,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../../Hooks/UseTheme';
import { useAuth } from '../../Hooks/UseAuth';
import { Text } from '../../Components/UI/Text';
import { Card } from '../../Components/UI/Card';
import { Avatar } from '../../Components/UI/Avatar';
import { Badge } from '../../Components/UI/Badge';
import { IconButton } from '../../Components/UI/IconButton';
import { ProjectCard } from '../../Components/Cards/ProjectCard';
import { TaskCard } from '../../Components/Cards/TaskCard';
import { ProjectService } from '../../Services/ProjectService';
import { TaskService } from '../../Services/TaskService';
import Icon from 'react-native-vector-icons/Ionicons';

export const ProfileScreen = () => {
  const { theme } = useTheme();
  const { user } = useAuth();
  const navigation = useNavigation();
  const [projects, setProjects] = useState([]);
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    loadUserData();
  }, []);
  
  const loadUserData = async () => {
    try {
      setLoading(true);
      // In a real app, you would fetch from API with user ID
      // For now, let's use mock data
      const projectsData = await ProjectService.getProjects();
      const tasksData = await TaskService.getTasks();
      
      // Filter for just a few items for display
      setProjects(projectsData.slice(0, 2));
      setTasks(tasksData.slice(0, 3));
      
      setLoading(false);
    } catch (error) {
      console.error('Failed to load user data', error);
      setLoading(false);
    }
  };
  
  return (
    <ScrollView 
      style={[styles.container, { backgroundColor: theme.colors.background }]}
      contentContainerStyle={styles.content}
    >
      <View style={styles.header}>
        <View style={styles.profileHeader}>
          <Avatar
            name={user?.name || 'User'}
            uri={user?.avatar}
            size={80}
          />
          
          <View style={styles.profileInfo}>
            <Text variant="h1">{user?.name || 'User Name'}</Text>
            <Text
              variant="subtitle"
              style={{ color: theme.colors.textSecondary }}
            >
              {user?.email || 'user@example.com'}
            </Text>
            <View style={styles.roleBadge}>
              <Badge
                label={user?.role || 'User'}
                color={theme.colors.primary}
              />
            </View>
          </View>
        </View>
        
        <TouchableOpacity
          style={[
            styles.editProfileButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigation.navigate('EditProfile')}
        >
          <Icon name="create-outline" size={16} color={theme.colors.primary} />
          <Text
            variant="button"
            style={{ color: theme.colors.primary, marginLeft: 6 }}
          >
            Edit Profile
          </Text>
        </TouchableOpacity>
      </View>
      
      <View style={styles.statsContainer}>
        <Card style={styles.statCard}>
          <Text
            variant="h2"
            style={{ color: theme.colors.primary }}
          >
            12
          </Text>
          <Text
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Projects
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text
            variant="h2"
            style={{ color: theme.colors.primary }}
          >
            48
          </Text>
          <Text
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Tasks
          </Text>
        </Card>
        
        <Card style={styles.statCard}>
          <Text
            variant="h2"
            style={{ color: theme.colors.primary }}
          >
            86%
          </Text>
          <Text
            variant="caption"
            style={{ color: theme.colors.textSecondary }}
          >
            Completed
          </Text>
        </Card>
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h2">Recent Projects</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Projects')}>
            <Text
              variant="button"
              style={{ color: theme.colors.primary }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        {projects.map(project => (
          <ProjectCard
            key={project.id}
            project={project}
            variant="horizontal"
          />
        ))}
      </View>
      
      <View style={styles.section}>
        <View style={styles.sectionHeader}>
          <Text variant="h2">Active Tasks</Text>
          <TouchableOpacity onPress={() => navigation.navigate('Tasks')}>
            <Text
              variant="button"
              style={{ color: theme.colors.primary }}
            >
              View All
            </Text>
          </TouchableOpacity>
        </View>
        
        {tasks.map(task => (
          <TaskCard
            key={task.id}
            task={task}
            variant="compact"
          />
        ))}
      </View>
      
      <View style={styles.buttonContainer}>
        <TouchableOpacity
          style={[
            styles.settingsButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigation.navigate('Settings')}
        >
          <Icon name="settings-outline" size={20} color={theme.colors.primary} />
          <Text
            variant="button"
            style={{ color: theme.colors.primary, marginLeft: 8 }}
          >
            Settings
          </Text>
        </TouchableOpacity>
        
        <TouchableOpacity
          style={[
            styles.notificationsButton,
            {
              backgroundColor: theme.colors.card,
              borderColor: theme.colors.border,
            },
          ]}
          onPress={() => navigation.navigate('Notifications')}
        >
          <Icon name="notifications-outline" size={20} color={theme.colors.primary} />
          <Text
            variant="button"
            style={{ color: theme.colors.primary, marginLeft: 8 }}
          >
            Notifications
          </Text>
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: 16,
    paddingBottom: 40,
  },
  header: {
    marginBottom: 24,
  },
  profileHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  profileInfo: {
    marginLeft: 16,
    flex: 1,
  },
  roleBadge: {
    marginTop: 8,
  },
  editProfileButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 24,
  },
  statCard: {
    flex: 1,
    marginHorizontal: 4,
    padding: 12,
    alignItems: 'center',
  },
  section: {
    marginBottom: 24,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 8,
  },
  settingsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    marginRight: 8,
  },
  notificationsButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    flex: 1,
    marginLeft: 8,
  },
});