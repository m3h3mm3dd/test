import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  StatusBar,
  Dimensions,
  FlatList,
  ActivityIndicator
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInRight,
  Layout
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { BlurView } from 'expo-blur';
import { SharedElement } from 'react-navigation-shared-element';
import * as Haptics from 'expo-haptics';
import { useNavigation, useRoute } from '@react-navigation/native';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import Card from '../components/Card';
import Button from '../components/Button/Button';
import AvatarStack from '../components/Avatar/AvatarStack';
import Avatar from '../components/Avatar/Avatar';
import StatusPill from '../components/StatusPill';
import SwipeableRow from '../components/SwipeableRow';
import FAB from '../components/FAB';
import SegmentedControl from '../components/Controls/SegmentedControl';
import { triggerImpact } from '../utils/HapticUtils';
import { timeAgo } from '../utils/helpers';
import { useTheme } from '../hooks/useTheme';

const { width, height } = Dimensions.get('window');
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

// Tab options
const TABS = [
  { id: 'overview', label: 'Overview', icon: 'grid' },
  { id: 'tasks', label: 'Tasks', icon: 'check-square' },
  { id: 'files', label: 'Files', icon: 'file' },
  { id: 'team', label: 'Team', icon: 'users' }
];

// Task Priority enum
enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

// Task Status enum
enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

// Project Details Screen
const ProjectDetailsScreen = () => {
  const navigation = useNavigation();
  const route = useRoute();
  const { projectId } = route.params || { projectId: '1' };
  const insets = useSafeAreaInsets();
  const { theme } = useTheme();
  
  // Refs
  const scrollRef = useRef(null);
  
  // State
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);
  const [files, setFiles] = useState([]);
  const [activities, setActivities] = useState([]);
  
  // Animation values
  const headerHeight = useSharedValue(300);
  const headerOpacity = useSharedValue(1);
  const scrollY = useSharedValue(0);
  const titleOpacity = useSharedValue(0);
  
  // Load project data
  useEffect(() => {
    fetchProjectDetails();
  }, [projectId]);
  
  // Simulate API call to fetch project details
  const fetchProjectDetails = async () => {
    setLoading(true);
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    // Project data
    const projectData = {
      id: projectId,
      title: 'Mobile App Redesign',
      description: 'Redesign the mobile app UI/UX with new brand guidelines. Focus on improving user experience and implementing new visual identity across all screens.',
      status: 'in-progress',
      startDate: '2025-04-15',
      dueDate: '2025-05-15',
      tasksTotal: 12,
      tasksCompleted: 8,
      progress: 0.67,
      color: Colors.primary.blue,
      icon: 'smartphone',
      team: [
        { id: '1', name: 'Alex Johnson', role: 'Project Manager', imageUrl: null, status: 'online' },
        { id: '2', name: 'Morgan Smith', role: 'UI Designer', imageUrl: null, status: 'away' },
        { id: '3', name: 'Jamie Parker', role: 'Developer', imageUrl: null, status: 'offline' }
      ],
      client: 'InnovateTech Solutions',
      createdBy: 'Alex Johnson',
      createdAt: '2025-04-10T09:30:00Z'
    };
    
    // Task data
    const tasksData = [
      {
        id: '1',
        title: 'Create wireframes for mobile screens',
        description: 'Design wireframes for all key screens following new guidelines',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: '2025-04-18',
        assignee: projectData.team[1], // Morgan
        completedAt: '2025-04-17T16:45:00Z'
      },
      {
        id: '2',
        title: 'Design UI components',
        description: 'Create reusable UI components for the mobile app',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: '2025-04-22',
        assignee: projectData.team[1], // Morgan
        completedAt: '2025-04-21T14:30:00Z'
      },
      {
        id: '3',
        title: 'Implement navigation flow',
        description: 'Code the navigation structure with proper transitions',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: '2025-05-01',
        assignee: projectData.team[2] // Jamie
      },
      {
        id: '4',
        title: 'Create login and authentication screens',
        description: 'Implement new design for login, signup, and password recovery',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: '2025-05-05',
        assignee: projectData.team[2] // Jamie
      },
      {
        id: '5',
        title: 'Conduct usability testing',
        description: 'Test with 5-7 users and gather feedback',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: '2025-05-10',
        assignee: projectData.team[0] // Alex
      }
    ];
    
    // Files data
    const filesData = [
      {
        id: '1',
        name: 'Design System.fig',
        type: 'figma',
        size: '8.4 MB',
        uploadedBy: projectData.team[1],
        uploadedAt: '2025-04-16T10:15:00Z'
      },
      {
        id: '2',
        name: 'App Wireframes.pdf',
        type: 'pdf',
        size: '3.2 MB',
        uploadedBy: projectData.team[1],
        uploadedAt: '2025-04-17T16:45:00Z'
      },
      {
        id: '3',
        name: 'Project Requirements.docx',
        type: 'document',
        size: '1.8 MB',
        uploadedBy: projectData.team[0],
        uploadedAt: '2025-04-12T09:30:00Z'
      },
      {
        id: '4',
        name: 'Brand Assets.zip',
        type: 'archive',
        size: '24.6 MB',
        uploadedBy: projectData.team[1],
        uploadedAt: '2025-04-14T11:20:00Z'
      }
    ];
    
    // Activities data
    const activitiesData = [
      {
        id: '1',
        type: 'task_completed',
        user: projectData.team[1],
        task: 'Create wireframes for mobile screens',
        timestamp: '2025-04-17T16:45:00Z'
      },
      {
        id: '2',
        type: 'file_uploaded',
        user: projectData.team[1],
        file: 'App Wireframes.pdf',
        timestamp: '2025-04-17T16:45:00Z'
      },
      {
        id: '3',
        type: 'task_completed',
        user: projectData.team[1],
        task: 'Design UI components',
        timestamp: '2025-04-21T14:30:00Z'
      },
      {
        id: '4',
        type: 'task_assigned',
        user: projectData.team[0],
        assignee: projectData.team[2],
        task: 'Implement navigation flow',
        timestamp: '2025-04-22T10:15:00Z'
      },
      {
        id: '5',
        type: 'comment',
        user: projectData.team[2],
        comment: 'I've started working on the navigation implementation. Will update progress tomorrow.',
        timestamp: '2025-04-24T17:30:00Z'
      },
      {
        id: '6',
        type: 'task_status_changed',
        user: projectData.team[2],
        task: 'Implement navigation flow',
        oldStatus: 'todo',
        newStatus: 'in-progress',
        timestamp: '2025-04-25T09:45:00Z'
      }
    ];
    
    // Update state
    setProject(projectData);
    setTasks(tasksData);
    setFiles(filesData);
    setActivities(activitiesData);
    setLoading(false);
  };
  
  // Handle scroll for header animations
  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.y;
    scrollY.value = scrollOffset;
    
    // Animate header
    const newHeight = Math.max(100, 300 - scrollOffset);
    headerHeight.value = withTiming(newHeight, { duration: 100 });
    
    // Fade in/out title
    if (scrollOffset > 150) {
      titleOpacity.value = withTiming(1, { duration: 200 });
    } else {
      titleOpacity.value = withTiming(0, { duration: 200 });
    }
    
    // Fade out header content when scrolled down
    const contentOpacity = Math.max(0, 1 - (scrollOffset / 150));
    headerOpacity.value = withTiming(contentOpacity, { duration: 100 });
  };
  
  // Navigate back
  const handleBack = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    navigation.goBack();
  };
  
  // Switch tabs
  const handleTabPress = (tabId) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    setActiveTab(tabId);
    
    // Scroll to top when changing tabs
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: 0, animated: true });
    }
  };
  
  // Navigate to task details
  const handleTaskPress = (task) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    navigation.navigate('TaskDetailsScreen', { taskId: task.id });
  };
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value
    };
  });
  
  const headerContentStyle = useAnimatedStyle(() => {
    return {
      opacity: headerOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            headerOpacity.value,
            [0, 1],
            [-20, 0],
            Extrapolation.CLAMP
          ) 
        }
      ]
    };
  });
  
  const headerTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: titleOpacity.value
    };
  });
  
  // Render task item
  const renderTaskItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      layout={Layout.springify()}
    >
      <SwipeableRow
        rightActions={[
          {
            icon: 'check',
            label: item.status === TaskStatus.COMPLETED ? 'Undo' : 'Complete',
            color: Colors.secondary.green,
            onPress: () => {
              if (item.status === TaskStatus.COMPLETED) {
                // Set task to in-progress
                setTasks(prev => prev.map(t => 
                  t.id === item.id ? { ...t, status: TaskStatus.IN_PROGRESS } : t
                ));
              } else {
                // Set task to completed
                setTasks(prev => prev.map(t => 
                  t.id === item.id ? { ...t, status: TaskStatus.COMPLETED, completedAt: new Date().toISOString() } : t
                ));
              }
            }
          }
        ]}
      >
        <Card
          style={styles.taskCard}
          onPress={() => handleTaskPress(item)}
          animationType="scale"
        >
          <View style={styles.taskCardContent}>
            <View style={styles.taskHeader}>
              <StatusPill 
                label={
                  item.status === TaskStatus.COMPLETED 
                    ? 'Completed' 
                    : item.status === TaskStatus.IN_PROGRESS 
                      ? 'In Progress' 
                      : 'To Do'
                }
                type={item.status as any}
                small
              />
              
              <StatusPill 
                label={
                  item.priority === TaskPriority.HIGH 
                    ? 'High' 
                    : item.priority === TaskPriority.MEDIUM 
                      ? 'Medium' 
                      : 'Low'
                }
                priority={item.priority as any}
                small
              />
            </View>
            
            <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
            
            {item.description && (
              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            <View style={styles.taskFooter}>
              <View style={styles.taskAssignee}>
                <Avatar 
                  name={item.assignee?.name || 'Unassigned'} 
                  imageUrl={item.assignee?.imageUrl} 
                  size={24} 
                />
                <Text style={styles.taskAssigneeName}>
                  {item.assignee?.name || 'Unassigned'}
                </Text>
              </View>
              
              <View style={styles.taskDueDate}>
                <Feather 
                  name="calendar" 
                  size={14}
                  color={isOverdue(item.dueDate) && item.status !== TaskStatus.COMPLETED
                    ? theme.status.error
                    : theme.text.secondary
                  }
                />
                <Text 
                  style={[
                    styles.taskDueDateText,
                    isOverdue(item.dueDate) && item.status !== TaskStatus.COMPLETED && styles.overdue
                  ]}
                >
                  {formatDate(item.dueDate)}
                </Text>
              </View>
            </View>
          </View>
        </Card>
      </SwipeableRow>
    </Animated.View>
  );
  
  // Render file item
  const renderFileItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      layout={Layout.springify()}
    >
      <Card
        style={styles.fileCard}
        onPress={() => {}}
        animationType="scale"
      >
        <View style={styles.fileCardContent}>
          <View style={styles.fileIconContainer}>
            <Feather 
              name={
                item.type === 'figma' 
                  ? 'figma' 
                  : item.type === 'pdf' 
                    ? 'file-text' 
                    : item.type === 'archive' 
                      ? 'archive' 
                      : 'file'
              }
              size={24}
              color={getFileColor(item.type)}
            />
          </View>
          
          <View style={styles.fileDetails}>
            <Text style={styles.fileName} numberOfLines={1}>{item.name}</Text>
            <Text style={styles.fileInfo}>
              {item.size} • {timeAgo(item.uploadedAt)}
            </Text>
          </View>
          
          <TouchableOpacity style={styles.fileAction}>
            <Feather name="download" size={20} color={theme.primary.main} />
          </TouchableOpacity>
        </View>
      </Card>
    </Animated.View>
  );
  
  // Render activity item
  const renderActivityItem = ({ item, index }) => (
    <Animated.View
      entering={FadeInRight.delay(index * 100).duration(400)}
      style={styles.activityItem}
      layout={Layout.springify()}
    >
      <View style={styles.activityTimeline}>
        <View style={styles.activityDot} />
        <View style={styles.activityLine} />
      </View>
      
      <View style={styles.activityContent}>
        <View style={styles.activityHeader}>
          <Avatar 
            name={item.user?.name || 'System'} 
            imageUrl={item.user?.imageUrl} 
            size={32} 
          />
          
          <View style={styles.activityDetails}>
            <Text style={styles.activityUser}>{item.user?.name}</Text>
            <Text style={styles.activityTime}>{timeAgo(item.timestamp)}</Text>
          </View>
        </View>
        
        <View style={styles.activityMessage}>
          {getActivityMessage(item)}
        </View>
      </View>
    </Animated.View>
  );
  
  // Render team member
  const renderTeamMember = ({ item, index }) => (
    <Animated.View
      entering={FadeInDown.delay(index * 100).duration(400)}
      layout={Layout.springify()}
    >
      <Card
        style={styles.teamMemberCard}
        onPress={() => {}}
        animationType="spring"
      >
        <View style={styles.teamMemberContent}>
          <View style={styles.teamMemberLeft}>
            <Avatar 
              name={item.name} 
              imageUrl={item.imageUrl} 
              size={56}
              status={item.status as any}
            />
          </View>
          
          <View style={styles.teamMemberInfo}>
            <Text style={styles.teamMemberName}>{item.name}</Text>
            <Text style={styles.teamMemberRole}>{item.role}</Text>
          </View>
          
          <View style={styles.teamMemberActions}>
            <TouchableOpacity style={styles.teamMemberAction}>
              <Feather name="message-circle" size={20} color={theme.primary.main} />
            </TouchableOpacity>
            <TouchableOpacity style={styles.teamMemberAction}>
              <Feather name="mail" size={20} color={theme.primary.main} />
            </TouchableOpacity>
          </View>
        </View>
      </Card>
    </Animated.View>
  );
  
  // Get activity message based on type
  const getActivityMessage = (activity) => {
    switch (activity.type) {
      case 'task_completed':
        return (
          <Text style={styles.activityText}>
            Completed task <Text style={styles.activityHighlight}>{activity.task}</Text>
          </Text>
        );
      case 'file_uploaded':
        return (
          <Text style={styles.activityText}>
            Uploaded file <Text style={styles.activityHighlight}>{activity.file}</Text>
          </Text>
        );
      case 'task_assigned':
        return (
          <Text style={styles.activityText}>
            Assigned <Text style={styles.activityHighlight}>{activity.task}</Text> to <Text style={styles.activityHighlight}>{activity.assignee.name}</Text>
          </Text>
        );
      case 'comment':
        return (
          <View>
            <Text style={styles.activityText}>Added a comment:</Text>
            <Text style={styles.activityComment}>{activity.comment}</Text>
          </View>
        );
      case 'task_status_changed':
        return (
          <Text style={styles.activityText}>
            Changed status of <Text style={styles.activityHighlight}>{activity.task}</Text> from <Text style={styles.activityHighlight}>{formatStatus(activity.oldStatus)}</Text> to <Text style={styles.activityHighlight}>{formatStatus(activity.newStatus)}</Text>
          </Text>
        );
      default:
        return <Text style={styles.activityText}>{activity.type}</Text>;
    }
  };
  
  // Format task status for display
  const formatStatus = (status) => {
    switch (status) {
      case 'todo':
        return 'To Do';
      case 'in-progress':
        return 'In Progress';
      case 'completed':
        return 'Completed';
      default:
        return status;
    }
  };
  
  // Get color for file type
  const getFileColor = (type) => {
    switch (type) {
      case 'figma':
        return '#F24E1E';
      case 'pdf':
        return '#FF5252';
      case 'document':
        return '#2196F3';
      case 'archive':
        return '#FF9800';
      default:
        return theme.text.secondary;
    }
  };
  
  // Check if a date is in the past
  const isOverdue = (dateString) => {
    return new Date(dateString) < new Date();
  };
  
  // Format date for display
  const formatDate = (dateString) => {
    const options = { month: 'short', day: 'numeric' };
    return new Date(dateString).toLocaleDateString('en-US', options);
  };
  
  // Render active tab content
  const renderTabContent = () => {
    if (!project) return null;
    
    switch (activeTab) {
      case 'overview':
        return (
          <View style={styles.overviewContainer}>
            <Animated.View entering={FadeIn.delay(100).duration(500)}>
              <Card style={styles.descriptionCard}>
                <Text style={styles.sectionTitle}>Description</Text>
                <Text style={styles.description}>
                  {project.description}
                </Text>
              </Card>
            </Animated.View>
            
            <Animated.View entering={FadeIn.delay(200).duration(500)}>
              <Card style={styles.detailsCard}>
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Feather name="calendar" size={16} color={theme.text.secondary} />
                    <Text style={styles.detailText}>Start Date</Text>
                  </View>
                  <Text style={styles.detailValue}>{formatDate(project.startDate)}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Feather name="calendar" size={16} color={theme.text.secondary} />
                    <Text style={styles.detailText}>Due Date</Text>
                  </View>
                  <Text 
                    style={[
                      styles.detailValue,
                      isOverdue(project.dueDate) && styles.overdue
                    ]}
                  >
                    {formatDate(project.dueDate)}
                  </Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Feather name="briefcase" size={16} color={theme.text.secondary} />
                    <Text style={styles.detailText}>Client</Text>
                  </View>
                  <Text style={styles.detailValue}>{project.client}</Text>
                </View>
                
                <View style={styles.divider} />
                
                <View style={styles.detailRow}>
                  <View style={styles.detailLabel}>
                    <Feather name="user" size={16} color={theme.text.secondary} />
                    <Text style={styles.detailText}>Created By</Text>
                  </View>
                  <Text style={styles.detailValue}>{project.createdBy}</Text>
                </View>
              </Card>
            </Animated.View>
            
            <Animated.View 
              style={styles.progressSection}
              entering={FadeIn.delay(300).duration(500)}
            >
              <Text style={styles.sectionTitle}>Progress</Text>
              
              <View style={styles.progressCircleContainer}>
                <View style={styles.progressCircle}>
                  <View style={styles.progressCircleInner}>
                    <Text style={styles.progressPercent}>{Math.round(project.progress * 100)}%</Text>
                    <Text style={styles.progressLabel}>Complete</Text>
                  </View>
                </View>
                
                <View style={styles.progressStats}>
                  <View style={styles.progressStat}>
                    <Text style={styles.progressStatValue}>{project.tasksCompleted}</Text>
                    <Text style={styles.progressStatLabel}>Completed</Text>
                  </View>
                  
                  <View style={styles.progressStatDivider} />
                  
                  <View style={styles.progressStat}>
                    <Text style={styles.progressStatValue}>
                      {project.tasksTotal - project.tasksCompleted}
                    </Text>
                    <Text style={styles.progressStatLabel}>Remaining</Text>
                  </View>
                </View>
              </View>
            </Animated.View>
            
            <Animated.View
              style={styles.activitySection}
              entering={FadeIn.delay(400).duration(500)}
            >
              <Text style={styles.sectionTitle}>Recent Activity</Text>
              
              <View style={styles.activityTimeline}>
                {activities.slice(0, 3).map((activity, index) => (
                  <View key={activity.id}>
                    {renderActivityItem({ item: activity, index })}
                  </View>
                ))}
                
                <TouchableOpacity style={styles.viewAllButton}>
                  <Text style={styles.viewAllText}>View All Activities</Text>
                  <Feather name="chevron-right" size={16} color={theme.primary.main} />
                </TouchableOpacity>
              </View>
            </Animated.View>
          </View>
        );
      
      case 'tasks':
        return (
          <View style={styles.tasksContainer}>
            <View style={styles.taskFilters}>
              <SegmentedControl
                segments={[
                  { id: 'all', label: 'All' },
                  { id: 'todo', label: 'To Do' },
                  { id: 'in-progress', label: 'In Progress' },
                  { id: 'completed', label: 'Completed' }
                ]}
                selectedId="all"
                onChange={() => {}}
              />
            </View>
            
            <View style={styles.tasksList}>
              {tasks.map((task, index) => (
                <View key={task.id} style={{ marginBottom: 12 }}>
                  {renderTaskItem({ item: task, index })}
                </View>
              ))}
            </View>
            
            <Button
              title="Add Task"
              icon="plus"
              onPress={() => {}}
              variant="secondary"
              style={styles.addTaskButton}
            />
          </View>
        );
      
      case 'files':
        return (
          <View style={styles.filesContainer}>
            <View style={styles.filesList}>
              {files.map((file, index) => (
                <View key={file.id} style={{ marginBottom: 12 }}>
                  {renderFileItem({ item: file, index })}
                </View>
              ))}
            </View>
            
            <Button
              title="Upload File"
              icon="upload"
              onPress={() => {}}
              variant="secondary"
              style={styles.uploadButton}
            />
          </View>
        );
      
      case 'team':
        return (
          <View style={styles.teamContainer}>
            <Text style={styles.teamCount}>
              {project.team.length} Team Members
            </Text>
            
            <View style={styles.teamList}>
              {project.team.map((member, index) => (
                <View key={member.id} style={{ marginBottom: 12 }}>
                  {renderTeamMember({ item: member, index })}
                </View>
              ))}
            </View>
            
            <Button
              title="Add Member"
              icon="user-plus"
              onPress={() => {}}
              variant="secondary"
              style={styles.addMemberButton}
            />
          </View>
        );
        
      default:
        return null;
    }
  };
  
  // Loading state
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { height: 300, backgroundColor: project?.color || theme.primary.main }]}>
          <View style={styles.headerActions}>
            <TouchableOpacity style={styles.backButton} onPress={handleBack}>
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
          </View>
        </View>
        
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={theme.primary.main} />
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={project?.color || theme.primary.main} />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          headerAnimatedStyle, 
          { backgroundColor: project?.color || theme.primary.main }
        ]}
      >
        {/* Background gradient */}
        <LinearGradient
          colors={[
            project?.color || theme.primary.main, 
            adjustColorBrightness(project?.color || theme.primary.main, -20)
          ]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        <View style={[styles.headerActions, { paddingTop: insets.top }]}>
          <TouchableOpacity style={styles.backButton} onPress={handleBack}>
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Animated.Text 
            style={[styles.headerTitle, headerTitleStyle]}
            numberOfLines={1}
          >
            {project?.title}
          </Animated.Text>
          
          <TouchableOpacity style={styles.moreButton}>
            <Feather name="more-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Animated.View style={[styles.headerContent, headerContentStyle]}>
          <View style={styles.headerIconContainer}>
            <Feather name={project?.icon || 'briefcase'} size={30} color="#fff" />
          </View>
          
          <SharedElement id={`project.${project?.id}.title`}>
            <Text style={styles.projectTitle}>{project?.title}</Text>
          </SharedElement>
          
          <View style={styles.headerStats}>
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{project?.tasksTotal}</Text>
              <Text style={styles.headerStatLabel}>Tasks</Text>
            </View>
            
            <View style={styles.headerStatDivider} />
            
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{project?.team.length}</Text>
              <Text style={styles.headerStatLabel}>Members</Text>
            </View>
            
            <View style={styles.headerStatDivider} />
            
            <View style={styles.headerStat}>
              <Text style={styles.headerStatValue}>{Math.round(project?.progress * 100)}%</Text>
              <Text style={styles.headerStatLabel}>Complete</Text>
            </View>
          </View>
          
          <View style={styles.headerTeam}>
            <AvatarStack 
              users={project?.team}
              maxDisplay={5}
              size={36}
            />
          </View>
        </Animated.View>
      </Animated.View>
      
      {/* Tabs */}
      <View style={styles.tabsContainer}>
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {TABS.map(tab => (
            <TouchableOpacity
              key={tab.id}
              style={[
                styles.tabButton,
                activeTab === tab.id && styles.activeTabButton
              ]}
              onPress={() => handleTabPress(tab.id)}
            >
              <Feather 
                name={tab.icon} 
                size={18} 
                color={activeTab === tab.id ? theme.primary.main : theme.text.secondary} 
              />
              <Text 
                style={[
                  styles.tabButtonText,
                  activeTab === tab.id && styles.activeTabButtonText
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      
      {/* Content */}
      <ScrollView
        ref={scrollRef}
        style={styles.content}
        contentContainerStyle={styles.contentContainer}
        onScroll={handleScroll}
        scrollEventThrottle={16}
        showsVerticalScrollIndicator={false}
      >
        {renderTabContent()}
      </ScrollView>
      
      {/* FAB */}
      <FAB
        icon={
          activeTab === 'tasks' 
            ? 'plus' 
            : activeTab === 'files' 
              ? 'upload' 
              : activeTab === 'team' 
                ? 'user-plus' 
                : 'plus'
        }
        onPress={() => {}}
        gradientColors={[project?.color || theme.primary.main, adjustColorBrightness(project?.color || theme.primary.main, -20)]}
      />
    </View>
  );
};

// Helper function to adjust color brightness
const adjustColorBrightness = (color: string, percent: number) => {
  const num = parseInt(color.replace('#', ''), 16);
  const amt = Math.round(2.55 * percent);
  const R = (num >> 16) + amt;
  const G = (num >> 8 & 0x00FF) + amt;
  const B = (num & 0x0000FF) + amt;
  
  const newR = Math.min(255, Math.max(0, R));
  const newG = Math.min(255, Math.max(0, G));
  const newB = Math.min(255, Math.max(0, B));
  
  return '#' + (
    (newR << 16 | newG << 8 | newB)
      .toString(16)
      .padStart(6, '0')
  );
};

// Configure shared element transitions
ProjectDetailsScreen.sharedElements = (route, otherRoute, showing) => {
  const { projectId } = route.params;
  return [
    { id: `project.${projectId}.card` },
    { id: `project.${projectId}.title` }
  ];
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    height: 300,
    width: '100%',
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10
  },
  headerActions: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    height: 60
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  moreButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  headerTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    maxWidth: 200
  },
  headerContent: {
    flex: 1,
    paddingHorizontal: Spacing.lg,
    justifyContent: 'center'
  },
  headerIconContainer: {
    width: 60,
    height: 60,
    borderRadius: 16,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  projectTitle: {
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: Spacing.md
  },
  headerStats: {
    flexDirection: 'row',
    marginBottom: Spacing.md
  },
  headerStat: {
    alignItems: 'center'
  },
  headerStatValue: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  headerStatLabel: {
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  headerStatDivider: {
    width: 1,
    height: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: Spacing.lg
  },
  headerTeam: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  tabsContainer: {
    height: 60,
    backgroundColor: Colors.neutrals.white,
    marginTop: 300,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 4,
    zIndex: 5
  },
  tabs: {
    flexDirection: 'row',
    paddingHorizontal: Spacing.lg,
    height: '100%'
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    marginRight: Spacing.md,
    borderRadius: 8
  },
  activeTabButton: {
    backgroundColor: 'rgba(61, 90, 254, 0.1)'
  },
  tabButtonText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray600,
    marginLeft: Spacing.xs
  },
  activeTabButtonText: {
    color: Colors.primary.blue
  },
  content: {
    flex: 1,
    marginTop: 60
  },
  contentContainer: {
    paddingBottom: 100
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 100
  },
  
  // Overview tab styles
  overviewContainer: {
    padding: Spacing.lg
  },
  descriptionCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.lg
  },
  sectionTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.md
  },
  description: {
    fontSize: Typography.sizes.body,
    lineHeight: 24,
    color: Colors.neutrals.gray800
  },
  detailsCard: {
    padding: Spacing.lg,
    marginBottom: Spacing.xl
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: Spacing.sm
  },
  detailLabel: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  detailText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginLeft: Spacing.xs
  },
  detailValue: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900
  },
  divider: {
    height: 1,
    backgroundColor: Colors.neutrals.gray200,
    marginVertical: Spacing.xs
  },
  overdue: {
    color: Colors.secondary.red
  },
  progressSection: {
    marginBottom: Spacing.xl
  },
  progressCircleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between'
  },
  progressCircle: {
    width: 140,
    height: 140,
    borderRadius: 70,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 8,
    borderColor: 'rgba(61, 90, 254, 0.2)'
  },
  progressCircleInner: {
    alignItems: 'center'
  },
  progressPercent: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.blue
  },
  progressLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  progressStats: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  progressStat: {
    alignItems: 'center'
  },
  progressStatValue: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900
  },
  progressStatLabel: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  progressStatDivider: {
    width: 1,
    height: 40,
    backgroundColor: Colors.neutrals.gray300,
    marginHorizontal: Spacing.lg
  },
  activitySection: {
    marginBottom: Spacing.xl
  },
  activityTimeline: {
    position: 'relative'
  },
  activityItem: {
    flexDirection: 'row',
    marginBottom: Spacing.lg
  },
  activityDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: Colors.primary.blue,
    borderWidth: 2,
    borderColor: Colors.neutrals.white
  },
  activityLine: {
    position: 'absolute',
    top: 12,
    left: 5,
    width: 2,
    height: '100%',
    backgroundColor: Colors.neutrals.gray300
  },
  activityContent: {
    flex: 1,
    marginLeft: Spacing.md,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: Spacing.md,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  activityHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  activityDetails: {
    marginLeft: Spacing.sm
  },
  activityUser: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900
  },
  activityTime: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  activityMessage: {
    marginTop: 4
  },
  activityText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800,
    lineHeight: 22
  },
  activityHighlight: {
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  activityComment: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700,
    backgroundColor: Colors.neutrals.gray100,
    padding: Spacing.md,
    borderRadius: 8,
    marginTop: Spacing.xs,
    lineHeight: 20
  },
  viewAllButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: Spacing.sm,
    marginBottom: Spacing.lg,
    marginLeft: 20
  },
  viewAllText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.primary.blue,
    marginRight: Spacing.xs
  },
  
  // Tasks tab styles
  tasksContainer: {
    padding: Spacing.lg
  },
  taskFilters: {
    marginBottom: Spacing.lg
  },
  tasksList: {
    marginBottom: Spacing.lg
  },
  taskCard: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  taskCardContent: {
    padding: Spacing.md
  },
  taskHeader: {
    flexDirection: 'row',
    marginBottom: Spacing.sm
  },
  taskTitle: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  taskDescription: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700,
    marginBottom: Spacing.sm,
    lineHeight: 20
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs
  },
  taskAssignee: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  taskAssigneeName: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray700,
    marginLeft: 8
  },
  taskDueDate: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  taskDueDateText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray700,
    marginLeft: 4
  },
  addTaskButton: {
    alignSelf: 'center',
    minWidth: 150
  },
  
  // Files tab styles
  filesContainer: {
    padding: Spacing.lg
  },
  filesList: {
    marginBottom: Spacing.lg
  },
  fileCard: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  fileCardContent: {
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center'
  },
  fileIconContainer: {
    width: 44,
    height: 44,
    borderRadius: 8,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  fileDetails: {
    flex: 1,
    marginRight: Spacing.md
  },
  fileName: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900,
    marginBottom: 2
  },
  fileInfo: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  fileAction: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  uploadButton: {
    alignSelf: 'center',
    minWidth: 150
  },
  
  // Team tab styles
  teamContainer: {
    padding: Spacing.lg
  },
  teamCount: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginBottom: Spacing.md
  },
  teamList: {
    marginBottom: Spacing.lg
  },
  teamMemberCard: {
    borderRadius: 12,
    overflow: 'hidden'
  },
  teamMemberContent: {
    padding: Spacing.md,
    flexDirection: 'row',
    alignItems: 'center'
  },
  teamMemberLeft: {
    marginRight: Spacing.md
  },
  teamMemberInfo: {
    flex: 1
  },
  teamMemberName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: 2
  },
  teamMemberRole: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  teamMemberActions: {
    flexDirection: 'row'
  },
  teamMemberAction: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  addMemberButton: {
    alignSelf: 'center',
    minWidth: 150
  }
});

export default ProjectDetailsScreen;