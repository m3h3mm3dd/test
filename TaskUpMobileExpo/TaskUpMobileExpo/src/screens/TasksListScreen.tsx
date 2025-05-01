import React, { useState, useEffect, useRef, useCallback } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  FlatList,
  TouchableOpacity,
  StatusBar,
  TextInput,
  ActivityIndicator,
  Dimensions,
  RefreshControl,
  Platform
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInDown,
  SlideInRight,
  interpolate,
  Extrapolation,
  Layout,
  cancelAnimation,
  Easing
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { PanGestureHandler } from 'react-native-gesture-handler'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import SegmentedControl from '../components/Controls/SegmentedControl'
import Card from '../components/Card'
import StatusPill from '../components/StatusPill'
import Avatar from '../components/Avatar/Avatar'
import AvatarStack from '../components/Avatar/AvatarStack'
import SwipeableRow from '../components/SwipeableRow'
import FAB from '../components/FAB'
import SkeletonLoader from '../components/SkeletonLoader'
import { triggerImpact, triggerNotification } from '../utils/HapticUtils'
import { formatDateString, timeAgo } from '../utils/helpers'

const { width, height } = Dimensions.get('window')
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)
const AnimatedFlatList = Animated.createAnimatedComponent(FlatList)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

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

// Task data interface
interface Task {
  id: string
  title: string
  description?: string
  status: TaskStatus
  priority: TaskPriority
  dueDate: string
  completedAt?: string
  projectId: string
  projectName: string
  projectColor: string
  assignees: Array<{ id: string, name: string, imageUrl?: string | null }>
}

// Project interface
interface Project {
  id: string
  name: string
  color: string
}

// View mode options
type ViewMode = 'list' | 'board'

// Status filter options
const STATUS_FILTERS = [
  { id: 'all', label: 'All Tasks' },
  { id: TaskStatus.TODO, label: 'To Do' },
  { id: TaskStatus.IN_PROGRESS, label: 'In Progress' },
  { id: TaskStatus.COMPLETED, label: 'Completed' }
]

// Priority filter options
const PRIORITY_OPTIONS = [
  { value: 'all', label: 'All' },
  { value: TaskPriority.HIGH, label: 'High' },
  { value: TaskPriority.MEDIUM, label: 'Medium' },
  { value: TaskPriority.LOW, label: 'Low' }
]

// Sort options
const SORT_OPTIONS = [
  { value: 'dueDate', label: 'Due Date' },
  { value: 'priority', label: 'Priority' },
  { value: 'status', label: 'Status' },
  { value: 'title', label: 'A-Z' }
]

const TasksListScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  
  // Refs
  const searchInputRef = useRef(null)
  const listRef = useRef(null)
  
  // State
  const [loading, setLoading] = useState(true)
  const [refreshing, setRefreshing] = useState(false)
  const [tasks, setTasks] = useState<Task[]>([])
  const [projects, setProjects] = useState<Project[]>([])
  const [filteredTasks, setFilteredTasks] = useState<Task[]>([])
  
  // UI state
  const [viewMode, setViewMode] = useState<ViewMode>('list')
  const [searchText, setSearchText] = useState('')
  const [showSearch, setShowSearch] = useState(false)
  const [statusFilter, setStatusFilter] = useState('all')
  const [priorityFilter, setPriorityFilter] = useState('all')
  const [projectFilter, setProjectFilter] = useState('all')
  const [sortBy, setSortBy] = useState('dueDate')
  const [showFilters, setShowFilters] = useState(false)
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null)
  
  // Animation values
  const headerHeight = useSharedValue(150)
  const scrollY = useSharedValue(0)
  const searchHeight = useSharedValue(0)
  const filtersHeight = useSharedValue(0)
  const fabScale = useSharedValue(1)
  const filterButtonRotation = useSharedValue(0)
  const backgroundParallax = useSharedValue({ x: 0, y: 0 })
  const shimmerPosition = useSharedValue(-width)
  
  // Load tasks data
  useEffect(() => {
    // Parallax background effect
    const intervalId = setInterval(() => {
      backgroundParallax.value = {
        x: Math.random() * width * 0.2,
        y: Math.random() * height * 0.2
      }
    }, 15000)
    
    // Shimmer animation
    shimmerPosition.value = withRepeat(
      withTiming(width * 2, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
      -1,
      false
    )
    
    fetchTasks()
    
    return () => {
      clearInterval(intervalId)
      cancelAnimation(shimmerPosition)
    }
  }, [])
  
  // Filter tasks when filters change
  useEffect(() => {
    if (tasks.length > 0) {
      applyFilters()
    }
  }, [tasks, searchText, statusFilter, priorityFilter, projectFilter, sortBy])
  
  // Toggle search input
  const toggleSearch = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    if (showSearch) {
      // Hide search
      searchHeight.value = withTiming(0, { duration: 300 })
      
      // Reset search
      setSearchText('')
      
      // Set flag after animation
      setTimeout(() => {
        setShowSearch(false)
      }, 300)
    } else {
      // Show search
      setShowSearch(true)
      
      // Animate search height
      searchHeight.value = withTiming(60, { duration: 300 })
      
      // Focus input after animation
      setTimeout(() => {
        searchInputRef.current?.focus()
      }, 300)
    }
  }
  
  // Toggle filters
  const toggleFilters = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    // Animate filter button rotation
    filterButtonRotation.value = withTiming(
      showFilters ? 0 : 180,
      { duration: 300 }
    )
    
    setShowFilters(!showFilters)
    
    if (showFilters) {
      filtersHeight.value = withTiming(0, { duration: 300 })
    } else {
      filtersHeight.value = withTiming(200, { duration: 300 })
    }
  }
  
  // Toggle view mode
  const toggleViewMode = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    // Add animation to transition between modes
    fabScale.value = withSequence(
      withTiming(0.8, { duration: 150 }),
      withSpring(1, { damping: 12 })
    )
    
    setViewMode(prev => (prev === 'list' ? 'board' : 'list'))
  }
  
  // Simulated API call to fetch tasks
  const fetchTasks = async (showRefreshing = false) => {
    if (showRefreshing) {
      setRefreshing(true)
    } else {
      setLoading(true)
    }
    
    // Simulate API delay
    await new Promise(resolve => setTimeout(resolve, 1500))
    
    // Mock tasks data
    const tasksData: Task[] = [
      {
        id: '1',
        title: 'Create wireframes for mobile screens',
        description: 'Design wireframes for all key screens following new guidelines',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: '2025-04-18',
        completedAt: '2025-04-17T16:45:00Z',
        projectId: '1',
        projectName: 'Mobile App Redesign',
        projectColor: Colors.primary.blue,
        assignees: [
          { id: '2', name: 'Morgan Smith', imageUrl: null }
        ]
      },
      {
        id: '2',
        title: 'Design UI components',
        description: 'Create reusable UI components for the mobile app',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.HIGH,
        dueDate: '2025-04-22',
        completedAt: '2025-04-21T14:30:00Z',
        projectId: '1',
        projectName: 'Mobile App Redesign',
        projectColor: Colors.primary.blue,
        assignees: [
          { id: '2', name: 'Morgan Smith', imageUrl: null }
        ]
      },
      {
        id: '3',
        title: 'Implement navigation flow',
        description: 'Code the navigation structure with proper transitions',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: '2025-05-01',
        projectId: '1',
        projectName: 'Mobile App Redesign',
        projectColor: Colors.primary.blue,
        assignees: [
          { id: '3', name: 'Jamie Parker', imageUrl: null }
        ]
      },
      {
        id: '4',
        title: 'Create login and authentication screens',
        description: 'Implement new design for login, signup, and password recovery',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.MEDIUM,
        dueDate: '2025-05-05',
        projectId: '1',
        projectName: 'Mobile App Redesign',
        projectColor: Colors.primary.blue,
        assignees: [
          { id: '3', name: 'Jamie Parker', imageUrl: null }
        ]
      },
      {
        id: '5',
        title: 'Conduct usability testing',
        description: 'Test with 5-7 users and gather feedback',
        status: TaskStatus.TODO,
        priority: TaskPriority.HIGH,
        dueDate: '2025-05-10',
        projectId: '1',
        projectName: 'Mobile App Redesign',
        projectColor: Colors.primary.blue,
        assignees: [
          { id: '1', name: 'Alex Johnson', imageUrl: null }
        ]
      },
      {
        id: '6',
        title: 'Write content for homepage',
        description: 'Create copy for the website homepage',
        status: TaskStatus.COMPLETED,
        priority: TaskPriority.MEDIUM,
        dueDate: '2025-04-20',
        completedAt: '2025-04-19T17:30:00Z',
        projectId: '2',
        projectName: 'Website Development',
        projectColor: Colors.secondary.green,
        assignees: [
          { id: '5', name: 'Jordan Casey', imageUrl: null }
        ]
      },
      {
        id: '7',
        title: 'Implement responsive design',
        description: 'Make website responsive for all devices',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2025-04-30',
        projectId: '2',
        projectName: 'Website Development',
        projectColor: Colors.secondary.green,
        assignees: [
          { id: '3', name: 'Jamie Parker', imageUrl: null },
          { id: '4', name: 'Taylor Reed', imageUrl: null }
        ]
      },
      {
        id: '8',
        title: 'Research market competitors',
        description: 'Analyze top 5 competitors in the market',
        status: TaskStatus.TODO,
        priority: TaskPriority.LOW,
        dueDate: '2025-05-15',
        projectId: '3',
        projectName: 'Market Research',
        projectColor: '#9C27B0',
        assignees: [
          { id: '1', name: 'Alex Johnson', imageUrl: null },
          { id: '5', name: 'Jordan Casey', imageUrl: null }
        ]
      },
      {
        id: '9',
        title: 'Create social media campaign',
        description: 'Design posts for product launch',
        status: TaskStatus.TODO,
        priority: TaskPriority.MEDIUM,
        dueDate: '2025-05-08',
        projectId: '4',
        projectName: 'Marketing Campaign',
        projectColor: '#FF9800',
        assignees: [
          { id: '2', name: 'Morgan Smith', imageUrl: null }
        ]
      },
      {
        id: '10',
        title: 'Backend API integration',
        description: 'Connect frontend to backend APIs',
        status: TaskStatus.IN_PROGRESS,
        priority: TaskPriority.HIGH,
        dueDate: '2025-05-12',
        projectId: '2',
        projectName: 'Website Development',
        projectColor: Colors.secondary.green,
        assignees: [
          { id: '4', name: 'Taylor Reed', imageUrl: null }
        ]
      }
    ]
    
    // Extract projects from tasks
    const projectsData = Array.from(new Set(tasksData.map(task => task.projectId)))
      .map(projectId => {
        const task = tasksData.find(t => t.projectId === projectId)
        return {
          id: projectId,
          name: task?.projectName || 'Unknown Project',
          color: task?.projectColor || Colors.neutrals.gray500
        }
      })
    
    // Update state
    setTasks(tasksData)
    setProjects(projectsData)
    
    // Update loading state
    setLoading(false)
    setRefreshing(false)
    
    // Show success feedback
    if (showRefreshing) {
      triggerNotification(Haptics.NotificationFeedbackType.Success)
    }
  }
  
  // Apply filters to tasks
  const applyFilters = () => {
    let filtered = [...tasks]
    
    // Apply search filter
    if (searchText) {
      const searchLower = searchText.toLowerCase()
      filtered = filtered.filter(task => 
        task.title.toLowerCase().includes(searchLower) || 
        task.description?.toLowerCase().includes(searchLower) ||
        task.projectName.toLowerCase().includes(searchLower)
      )
    }
    
    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(task => task.status === statusFilter)
    }
    
    // Apply priority filter
    if (priorityFilter !== 'all') {
      filtered = filtered.filter(task => task.priority === priorityFilter)
    }
    
    // Apply project filter
    if (projectFilter !== 'all') {
      filtered = filtered.filter(task => task.projectId === projectFilter)
    }
    
    // Apply sorting
    filtered = sortTasks(filtered, sortBy)
    
    setFilteredTasks(filtered)
  }
  
  // Sort tasks based on selected sort option
  const sortTasks = (tasks: Task[], sortBy: string) => {
    const sorted = [...tasks]
    
    switch (sortBy) {
      case 'dueDate':
        return sorted.sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
      
      case 'priority':
        // Sort by priority (HIGH > MEDIUM > LOW)
        return sorted.sort((a, b) => {
          const priorityOrder = { [TaskPriority.HIGH]: 0, [TaskPriority.MEDIUM]: 1, [TaskPriority.LOW]: 2 }
          return priorityOrder[a.priority] - priorityOrder[b.priority]
        })
      
      case 'status':
        // Sort by status (TODO > IN_PROGRESS > COMPLETED)
        return sorted.sort((a, b) => {
          const statusOrder = { [TaskStatus.TODO]: 0, [TaskStatus.IN_PROGRESS]: 1, [TaskStatus.COMPLETED]: 2 }
          return statusOrder[a.status] - statusOrder[b.status]
        })
      
      case 'title':
        return sorted.sort((a, b) => a.title.localeCompare(b.title))
      
      default:
        return sorted
    }
  }
  
  // Handle refresh
  const handleRefresh = () => {
    fetchTasks(true)
  }
  
  // Handle scroll for collapsing header
  const handleScroll = (event) => {
    const scrollOffset = event.nativeEvent.contentOffset.y
    scrollY.value = scrollOffset
    
    // Collapse header on scroll
    const newHeight = Math.max(80, 150 - scrollOffset)
    headerHeight.value = withTiming(newHeight, { duration: 100 })
  }
  
  // Navigate to task details
  const handleTaskPress = (task: Task) => {
    // Set active task to highlight the card
    setActiveTaskId(task.id)
    
    // Animate task selection
    setTimeout(() => {
      triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
      navigation.navigate('TaskDetails', { taskId: task.id })
      
      // Reset active task after navigation
      setTimeout(() => {
        setActiveTaskId(null)
      }, 500)
    }, 100)
  }
  
  // Create new task
  const handleCreateTask = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    // Animate FAB
    fabScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1.1, { damping: 8 }),
      withTiming(1, { duration: 200 })
    )
    
    navigation.navigate('TaskScreen', { isNew: true })
  }
  
  // Mark task as completed
  const handleToggleTaskComplete = (task: Task) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    // Clone tasks array
    const updatedTasks = [...tasks]
    
    // Find and update task
    const taskIndex = updatedTasks.findIndex(t => t.id === task.id)
    if (taskIndex >= 0) {
      if (updatedTasks[taskIndex].status === TaskStatus.COMPLETED) {
        // If already completed, mark as in progress
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          status: TaskStatus.IN_PROGRESS,
          completedAt: undefined
        }
      } else {
        // Mark as completed
        updatedTasks[taskIndex] = {
          ...updatedTasks[taskIndex],
          status: TaskStatus.COMPLETED,
          completedAt: new Date().toISOString()
        }
      }
      
      // Show success feedback
      setTimeout(() => {
        triggerNotification(
          updatedTasks[taskIndex].status === TaskStatus.COMPLETED
            ? Haptics.NotificationFeedbackType.Success
            : Haptics.NotificationFeedbackType.Warning
        )
      }, 100)
      
      // Update state
      setTasks(updatedTasks)
    }
  }
  
  // Delete task
  const handleDeleteTask = (taskId: string) => {
    // Show confirmation and delete
    setTasks(prev => prev.filter(task => task.id !== taskId))
    
    // Show success feedback
    triggerNotification(Haptics.NotificationFeedbackType.Success)
  }
  
  // Check if date is overdue
  const isOverdue = (dateString: string) => {
    return new Date(dateString) < new Date()
  }
  
  // Scroll to top
  const scrollToTop = () => {
    listRef.current?.scrollToOffset({ offset: 0, animated: true })
  }
  
  // Clear all filters
  const clearFilters = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    // Reset all filters
    setStatusFilter('all')
    setPriorityFilter('all')
    setProjectFilter('all')
    setSortBy('dueDate')
    setSearchText('')
    
    // Close filters panel
    if (showFilters) {
      toggleFilters()
    }
    
    // Close search if open
    if (showSearch) {
      toggleSearch()
    }
    
    // Show success feedback
    setTimeout(() => {
      triggerNotification(Haptics.NotificationFeedbackType.Success)
    }, 300)
  }
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value
    }
  })
  
  const titleOpacityStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      headerHeight.value,
      [80, 120],
      [0, 1],
      Extrapolation.CLAMP
    )
    
    return {
      opacity
    }
  })
  
  const searchAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: searchHeight.value,
      opacity: searchHeight.value > 0 ? 1 : 0,
      overflow: searchHeight.value > 0 ? 'visible' : 'hidden'
    }
  })
  
  const filtersAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: filtersHeight.value,
      opacity: filtersHeight.value > 0 ? 1 : 0,
      overflow: filtersHeight.value > 0 ? 'visible' : 'hidden'
    }
  })
  
  const fabAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: fabScale.value }]
    }
  })
  
  const filterButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${filterButtonRotation.value}deg` }]
    }
  })
  
  const backgroundAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: backgroundParallax.value.x },
        { translateY: backgroundParallax.value.y }
      ]
    }
  })
  
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerPosition.value }]
    }
  })
  
  // Render skeleton loaders
  const renderSkeletons = () => (
    <View style={styles.skeletonContainer}>
      <View style={styles.skeletonHeader}>
        <SkeletonLoader
          width={150}
          height={30}
          borderRadius={8}
        />
        <View style={styles.skeletonActions}>
          <SkeletonLoader
            width={40}
            height={40}
            borderRadius={20}
          />
          <SkeletonLoader
            width={40}
            height={40}
            borderRadius={20}
            style={{ marginLeft: 8 }}
          />
          <SkeletonLoader
            width={40}
            height={40}
            borderRadius={20}
            style={{ marginLeft: 8 }}
          />
        </View>
      </View>
      
      {[1, 2, 3, 4].map(i => (
        <SkeletonLoader.Task 
          key={i} 
          style={{ marginBottom: 16, opacity: 1 - (i * 0.15) }} 
        />
      ))}
    </View>
  )
  
  // Render task item for list view
  const renderTaskItem = ({ item, index }: { item: Task, index: number }) => {
    const isActive = activeTaskId === item.id
    
    return (
      <Animated.View
        layout={Layout.springify().damping(14)}
        entering={FadeInDown.delay(index * 50).duration(400)}
      >
        <SwipeableRow
          rightActions={[
            {
              icon: 'trash',
              label: 'Delete',
              color: Colors.secondary.red,
              onPress: () => handleDeleteTask(item.id)
            },
            {
              icon: 'check',
              label: item.status === TaskStatus.COMPLETED ? 'Undo' : 'Complete',
              color: Colors.secondary.green,
              onPress: () => handleToggleTaskComplete(item)
            }
          ]}
        >
          <Card
            style={[
              styles.taskCard,
              isActive && styles.activeTaskCard
            ]}
            onPress={() => handleTaskPress(item)}
            animationType="spring"
            elevation={isActive ? 5 : 2}
          >
            <View style={styles.taskCardHeader}>
              <View style={styles.taskCardProject}>
                <View 
                  style={[
                    styles.projectColorDot, 
                    { backgroundColor: item.projectColor }
                  ]} 
                />
                <Text style={styles.projectName} numberOfLines={1}>
                  {item.projectName}
                </Text>
              </View>
              
              <View style={styles.taskCardBadges}>
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
                  style={styles.statusPill}
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
                  animate={
                    item.priority === TaskPriority.HIGH && 
                    isOverdue(item.dueDate) && 
                    item.status !== TaskStatus.COMPLETED
                  }
                />
              </View>
            </View>
            
            <Text style={styles.taskTitle} numberOfLines={1}>{item.title}</Text>
            
            {item.description && (
              <Text style={styles.taskDescription} numberOfLines={2}>
                {item.description}
              </Text>
            )}
            
            <View style={styles.taskCardFooter}>
              <AvatarStack 
                users={item.assignees}
                size={24}
                maxDisplay={3}
              />
              
              <View style={styles.dueDate}>
                <Feather 
                  name="calendar" 
                  size={14} 
                  color={
                    isOverdue(item.dueDate) && item.status !== TaskStatus.COMPLETED
                      ? Colors.secondary.red
                      : Colors.neutrals.gray600
                  } 
                />
                <Text 
                  style={[
                    styles.dueDateText,
                    isOverdue(item.dueDate) && item.status !== TaskStatus.COMPLETED && styles.overdueText
                  ]}
                >
                  {formatDateString(item.dueDate)}
                </Text>
              </View>
            </View>
            
            {item.completedAt && (
              <View style={styles.completedInfo}>
                <Feather name="check-circle" size={12} color={Colors.secondary.green} />
                <Text style={styles.completedText}>
                  Completed {timeAgo(item.completedAt)}
                </Text>
              </View>
            )}
          </Card>
        </SwipeableRow>
      </Animated.View>
    )
  }
  
  // Render column for board view
  const renderBoardColumn = ({ status, title, color }) => {
    const columnTasks = filteredTasks.filter(task => task.status === status)
    
    return (
      <Animated.View 
        style={styles.boardColumn}
        entering={SlideInRight.delay(status === TaskStatus.TODO ? 0 : status === TaskStatus.IN_PROGRESS ? 100 : 200).springify()}
      >
        <View style={styles.boardColumnHeader}>
          <View style={[styles.boardColumnDot, { backgroundColor: color }]} />
          <Text style={styles.boardColumnTitle}>{title}</Text>
          <View style={styles.boardColumnCount}>
            <Text style={styles.boardColumnCountText}>{columnTasks.length}</Text>
          </View>
        </View>
        
        <FlatList
          data={columnTasks}
          keyExtractor={item => item.id}
          renderItem={({ item, index }) => renderBoardCard({ item, index })}
          contentContainerStyle={[
            styles.boardColumnContent,
            columnTasks.length === 0 && styles.boardEmptyContent
          ]}
          showsVerticalScrollIndicator={false}
          ListEmptyComponent={
            <View style={styles.boardEmptyState}>
              <Feather name="inbox" size={24} color={Colors.neutrals.gray300} />
              <Text style={styles.boardEmptyText}>No tasks</Text>
            </View>
          }
        />
      </Animated.View>
    )
  }
  
  // Render card for board view
  const renderBoardCard = ({ item, index }: { item: Task, index: number }) => {
    const isActive = activeTaskId === item.id
    
    return (
      <Animated.View
        entering={FadeInDown.delay(index * 80).duration(400)}
        style={styles.boardCard}
        layout={Layout.springify()}
      >
        <Card
          onPress={() => handleTaskPress(item)}
          animationType="spring"
          elevation={isActive ? 4 : 1}
          style={isActive && styles.activeBoardCard}
        >
          <View style={styles.boardCardContent}>
            <View style={styles.boardCardHeader}>
              <View 
                style={[
                  styles.projectColorDot, 
                  { backgroundColor: item.projectColor }
                ]} 
              />
              <Text style={styles.boardProjectName} numberOfLines={1}>
                {item.projectName}
              </Text>
              
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
                animate={
                  item.priority === TaskPriority.HIGH && 
                  isOverdue(item.dueDate)
                }
              />
            </View>
            
            <Text style={styles.boardCardTitle} numberOfLines={2}>{item.title}</Text>
            
            <View style={styles.boardCardFooter}>
              <AvatarStack 
                users={item.assignees}
                size={20}
                maxDisplay={2}
              />
              
              <View style={styles.boardDueDate}>
                <Feather 
                  name="calendar" 
                  size={12} 
                  color={
                    isOverdue(item.dueDate) && item.status !== TaskStatus.COMPLETED
                      ? Colors.secondary.red
                      : Colors.neutrals.gray600
                  } 
                />
                <Text 
                  style={[
                    styles.boardDueDateText,
                    isOverdue(item.dueDate) && styles.overdueText
                  ]}
                >
                  {formatDateString(item.dueDate)}
                </Text>
              </View>
            </View>
            
            {item.completedAt && (
              <View style={styles.boardCompletedInfo}>
                <Feather name="check-circle" size={10} color={Colors.secondary.green} />
                <Text style={styles.boardCompletedText}>
                  {timeAgo(item.completedAt)}
                </Text>
              </View>
            )}
          </View>
        </Card>
      </Animated.View>
    )
  }
  
  // Render board view
  const renderBoardView = () => (
    <View style={styles.boardContainer}>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={styles.boardContent}
        snapToInterval={width * 0.85 + 16}
        decelerationRate="fast"
        snapToAlignment="center"
      >
        {renderBoardColumn({ 
          status: TaskStatus.TODO, 
          title: 'To Do', 
          color: Colors.neutrals.gray400 
        })}
        
        {renderBoardColumn({ 
          status: TaskStatus.IN_PROGRESS, 
          title: 'In Progress', 
          color: Colors.primary.blue 
        })}
        
        {renderBoardColumn({ 
          status: TaskStatus.COMPLETED, 
          title: 'Completed', 
          color: Colors.secondary.green 
        })}
      </ScrollView>
    </View>
  )
  
  // Create project filters pills
  const renderProjectPills = () => {
    return (
      <View style={styles.pillsContainer}>
        <TouchableOpacity onPress={() => setProjectFilter('all')}>
          <StatusPill
            label="All Projects"
            type="default"
            style={[
              styles.filterPill,
              projectFilter === 'all' && styles.activeFilterPill
            ]}
          />
        </TouchableOpacity>
        
        {projects.map(project => (
          <TouchableOpacity
            key={project.id}
            onPress={() => setProjectFilter(project.id)}
            style={styles.projectPillTouch}
          >
            <LinearGradient
              colors={[
                projectFilter === project.id 
                  ? `${project.color}20` 
                  : 'rgba(0,0,0,0.03)',
                projectFilter === project.id 
                  ? `${project.color}10` 
                  : 'rgba(0,0,0,0.01)'
              ]}
              start={{ x: 0, y: 0 }}
              end={{ x: 1, y: 1 }}
              style={[
                styles.projectPill,
                projectFilter === project.id && {
                  borderColor: project.color,
                  borderWidth: 1
                }
              ]}
            >
              <View 
                style={[
                  styles.projectColorDot, 
                  { backgroundColor: project.color }
                ]} 
              />
              <Text 
                style={[
                  styles.projectPillText,
                  projectFilter === project.id && {
                    color: project.color,
                    fontWeight: Typography.weights.semibold
                  }
                ]}
              >
                {project.name}
              </Text>
            </LinearGradient>
          </TouchableOpacity>
        ))}
      </View>
    )
  }

  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Animated background */}
      <View style={StyleSheet.absoluteFill}>
        <AnimatedLinearGradient
          colors={['rgba(61, 90, 254, 0.03)', 'rgba(33, 150, 243, 0.01)', 'rgba(0, 200, 83, 0.02)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, backgroundAnimatedStyle]}
        />
        
        {/* Background shimmer effect */}
        <Animated.View style={[styles.backgroundShimmer, shimmerAnimatedStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255, 255, 255, 0.05)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.shimmerGradient}
          />
        </Animated.View>
      </View>
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          headerAnimatedStyle, 
          { paddingTop: insets.top }
        ]}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            style={[StyleSheet.absoluteFill, { borderBottomLeftRadius: 20, borderBottomRightRadius: 20 }]}
            blurType="light"
            blurAmount={10}
          />
        )}
        
        <Animated.View style={[styles.titleContainer, titleOpacityStyle]}>
          <View style={styles.titleRow}>
            <Text style={styles.title}>My Tasks</Text>
            <Text style={styles.taskCount}>{filteredTasks.length}</Text>
          </View>
          
          <View style={styles.headerActions}>
            <TouchableOpacity 
              style={[styles.headerButton, showSearch && styles.activeHeaderButton]}
              onPress={toggleSearch}
            >
              <Feather 
                name="search" 
                size={22} 
                color={showSearch ? Colors.primary.blue : Colors.neutrals.gray700} 
              />
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.headerButton, showFilters && styles.activeHeaderButton]}
              onPress={toggleFilters}
            >
              <Animated.View style={filterButtonAnimatedStyle}>
                <Feather 
                  name="sliders" 
                  size={22} 
                  color={showFilters ? Colors.primary.blue : Colors.neutrals.gray700} 
                />
              </Animated.View>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={styles.headerButton}
              onPress={toggleViewMode}
            >
              <Feather 
                name={viewMode === 'list' ? 'columns' : 'list'} 
                size={22} 
                color={Colors.neutrals.gray700} 
              />
            </TouchableOpacity>
          </View>
        </Animated.View>
        
        {/* Search input */}
        <Animated.View style={[styles.searchContainer, searchAnimatedStyle]}>
          <View style={styles.searchInputContainer}>
            <Feather name="search" size={18} color={Colors.neutrals.gray500} style={styles.searchIcon} />
            <TextInput
              ref={searchInputRef}
              style={styles.searchInput}
              placeholder="Search tasks..."
              placeholderTextColor={Colors.neutrals.gray500}
              value={searchText}
              onChangeText={setSearchText}
              returnKeyType="search"
            />
            {searchText.length > 0 && (
              <TouchableOpacity
                style={styles.clearButton}
                onPress={() => setSearchText('')}
              >
                <Feather name="x" size={16} color={Colors.neutrals.gray500} />
              </TouchableOpacity>
            )}
          </View>
        </Animated.View>
        
        {/* Filters */}
        <Animated.View style={[styles.filtersContainer, filtersAnimatedStyle]}>
          <ScrollView 
            horizontal 
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.filtersScrollContent}
          >
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Status</Text>
              <SegmentedControl
                segments={STATUS_FILTERS}
                selectedId={statusFilter}
                onChange={setStatusFilter}
              />
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Priority</Text>
              <View style={styles.priorityPills}>
                {PRIORITY_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setPriorityFilter(option.value)}
                  >
                    <StatusPill
                      label={option.label}
                      priority={option.value !== 'all' ? option.value as any : undefined}
                      type={option.value === 'all' ? 'default' : undefined}
                      style={[
                        styles.filterPill,
                        priorityFilter === option.value && styles.activeFilterPill
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Project</Text>
              {renderProjectPills()}
            </View>
            
            <View style={styles.filterSection}>
              <Text style={styles.filterLabel}>Sort By</Text>
              <View style={styles.pillsContainer}>
                {SORT_OPTIONS.map(option => (
                  <TouchableOpacity
                    key={option.value}
                    onPress={() => setSortBy(option.value)}
                  >
                    <StatusPill
                      label={option.label}
                      type="default"
                      icon={option.value === sortBy ? "check" : undefined}
                      style={[
                        styles.filterPill,
                        sortBy === option.value && styles.activeFilterPill
                      ]}
                    />
                  </TouchableOpacity>
                ))}
              </View>
            </View>
          </ScrollView>
          
          <TouchableOpacity 
            style={styles.clearFiltersButton}
            onPress={clearFilters}
          >
            <Feather name="x" size={14} color={Colors.neutrals.gray600} />
            <Text style={styles.clearFiltersText}>Clear Filters</Text>
          </TouchableOpacity>
        </Animated.View>
        
        {showFilters && (
          <View style={styles.filterOverlay} />
        )}
      </Animated.View>
      
      {/* Content */}
      {loading ? (
        renderSkeletons()
      ) : viewMode === 'list' ? (
        <AnimatedFlatList
          ref={listRef}
          data={filteredTasks}
          keyExtractor={item => item.id}
          renderItem={renderTaskItem}
          contentContainerStyle={[
            styles.listContent,
            { 
              paddingTop: headerHeight.value + 
                (showSearch ? searchHeight.value : 0) + 
                (showFilters ? filtersHeight.value : 0) + 16
            }
          ]}
          onScroll={handleScroll}
          scrollEventThrottle={16}
          showsVerticalScrollIndicator={false}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor={Colors.primary.blue}
              colors={[Colors.primary.blue]}
            />
          }
          ListEmptyComponent={
            <View style={styles.emptyContainer}>
              <Feather name="clipboard" size={60} color={Colors.neutrals.gray300} />
              <Text style={styles.emptyTitle}>No Tasks Found</Text>
              <Text style={styles.emptyText}>
                {searchText || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all'
                  ? 'No tasks match your search or filter criteria.'
                  : 'You don\'t have any tasks yet. Create your first task!'
                }
              </Text>
              
              {(searchText || statusFilter !== 'all' || priorityFilter !== 'all' || projectFilter !== 'all') && (
                <TouchableOpacity 
                  style={styles.clearFiltersButtonLarge}
                  onPress={clearFilters}
                >
                  <Text style={styles.clearFiltersButtonText}>Clear All Filters</Text>
                </TouchableOpacity>
              )}
            </View>
          }
        />
      ) : (
        <View 
          style={[
            styles.boardWrapper,
            { 
              marginTop: headerHeight.value + 
                (showSearch ? searchHeight.value : 0) + 
                (showFilters ? filtersHeight.value : 0)
            }
          ]}
        >
          {renderBoardView()}
        </View>
      )}
      
      {/* Quick actions bottom sheet */}
      <TouchableOpacity 
        style={styles.scrollTopButton}
        onPress={scrollToTop}
      >
        <Feather name="arrow-up" size={20} color={Colors.neutrals.white} />
      </TouchableOpacity>
      
      {/* FAB */}
      <Animated.View style={fabAnimatedStyle}>
        <FAB
          icon="plus"
          onPress={handleCreateTask}
          gradientColors={[Colors.primary.blue, Colors.primary.darkBlue]}
          animationType="bounce"
        />
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  backgroundShimmer: {
    position: 'absolute',
    top: 0,
    left: -width,
    width: width * 3,
    height: '100%'
  },
  shimmerGradient: {
    width: '100%',
    height: '100%',
    transform: [{ skewX: '-20deg' }]
  },
  header: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    backgroundColor: Platform.OS === 'ios' ? 'transparent' : Colors.background.light,
    paddingHorizontal: Spacing.lg,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20
  },
  filterOverlay: {
    position: 'absolute',
    bottom: -20,
    left: 0,
    right: 0,
    height: 20,
    backgroundColor: Colors.background.light,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  titleContainer: {
    height: 60,
    justifyContent: 'space-between'
  },
  titleRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900
  },
  taskCount: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    backgroundColor: Colors.primary.blue,
    borderRadius: 16,
    paddingHorizontal: 10,
    paddingVertical: 2,
    marginLeft: Spacing.sm,
    overflow: 'hidden'
  },
  headerActions: {
    flexDirection: 'row',
    position: 'absolute',
    right: 0,
    top: 0
  },
  headerButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm
  },
  activeHeaderButton: {
    backgroundColor: 'rgba(61, 90, 254, 0.1)'
  },
  searchContainer: {
    overflow: 'hidden'
  },
  searchInputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 44,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 22,
    paddingHorizontal: 16,
    marginBottom: Spacing.sm
  },
  searchIcon: {
    marginRight: 8
  },
  searchInput: {
    flex: 1,
    height: '100%',
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray900
  },
  clearButton: {
    padding: 4
  },
  filtersContainer: {
    overflow: 'hidden'
  },
  filtersScrollContent: {
    paddingBottom: Spacing.md
  },
  filterSection: {
    marginRight: Spacing.xl
  },
  filterLabel: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray600,
    marginBottom: 8
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  priorityPills: {
    flexDirection: 'row',
    paddingVertical: 4
  },
  filterPill: {
    marginRight: 8,
    marginBottom: 8
  },
  activeFilterPill: {
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
    borderColor: Colors.primary.blue
  },
  projectPillTouch: {
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8,
    overflow: 'hidden'
  },
  projectPill: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 12,
    borderRadius: 16
  },
  projectColorDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6
  },
  projectPillText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray700,
    fontWeight: Typography.weights.medium
  },
  clearFiltersButton: {
    flexDirection: 'row',
    alignItems: 'center',
    alignSelf: 'flex-end',
    padding: 8,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 16,
    marginTop: 4
  },
  clearFiltersText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginLeft: 4
  },
  clearFiltersButtonLarge: {
    backgroundColor: Colors.neutrals.gray100,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 20,
    marginTop: Spacing.lg
  },
  clearFiltersButtonText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700,
    fontWeight: Typography.weights.medium
  },
  listContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100
  },
  skeletonContainer: {
    flex: 1,
    marginTop: 220,
    paddingHorizontal: Spacing.lg
  },
  skeletonHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl
  },
  skeletonActions: {
    flexDirection: 'row'
  },
  taskCard: {
    borderRadius: 12,
    marginBottom: Spacing.md,
    padding: Spacing.md,
    overflow: 'hidden'
  },
  activeTaskCard: {
    borderColor: Colors.primary.blue,
    borderWidth: 1,
    transform: [{ scale: 1.02 }]
  },
  taskCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  taskCardProject: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  projectName: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    fontWeight: Typography.weights.medium
  },
  taskCardBadges: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  statusPill: {
    marginRight: 8
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
  taskCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.xs
  },
  dueDate: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dueDateText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginLeft: 4
  },
  overdueText: {
    color: Colors.secondary.red,
    fontWeight: Typography.weights.medium
  },
  completedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: Spacing.xs,
    paddingTop: Spacing.xs,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)'
  },
  completedText: {
    fontSize: Typography.sizes.caption,
    color: Colors.secondary.green,
    marginLeft: 4
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: Spacing.xxl,
    paddingHorizontal: Spacing.xl
  },
  emptyTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray800,
    marginTop: Spacing.md,
    marginBottom: Spacing.sm
  },
  emptyText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600,
    textAlign: 'center'
  },
  boardWrapper: {
    flex: 1
  },
  boardContainer: {
    flex: 1,
    paddingTop: 16
  },
  boardContent: {
    paddingHorizontal: Spacing.lg,
    paddingBottom: 100
  },
  boardColumn: {
    width: width * 0.85,
    marginRight: Spacing.md,
    height: '100%',
    backgroundColor: 'rgba(0, 0, 0, 0.01)',
    borderRadius: 16,
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(0, 0, 0, 0.05)'
  },
  boardColumnHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.md,
    paddingBottom: Spacing.sm,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)'
  },
  boardColumnDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  boardColumnTitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray800,
    flex: 1
  },
  boardColumnCount: {
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 2
  },
  boardColumnCountText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray600
  },
  boardColumnContent: {
    paddingBottom: Spacing.lg,
    minHeight: 200
  },
  boardEmptyContent: {
    flex: 1,
    justifyContent: 'center'
  },
  boardCard: {
    marginBottom: Spacing.sm
  },
  activeBoardCard: {
    borderColor: Colors.primary.blue,
    borderWidth: 1,
    transform: [{ scale: 1.02 }]
  },
  boardCardContent: {
    padding: Spacing.sm
  },
  boardCardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  boardProjectName: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    fontWeight: Typography.weights.medium,
    flex: 1,
    marginLeft: 6,
    marginRight: 8
  },
  boardCardTitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.sm,
    lineHeight: 20
  },
  boardCardFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  boardDueDate: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  boardDueDateText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginLeft: 4
  },
  boardCompletedInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 4,
    paddingTop: 4,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)'
  },
  boardCompletedText: {
    fontSize: Typography.sizes.caption,
    color: Colors.secondary.green,
    marginLeft: 4
  },
  boardEmptyState: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: Spacing.lg,
    opacity: 0.5
  },
  boardEmptyText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginTop: Spacing.sm
  },
  scrollTopButton: {
    position: 'absolute',
    bottom: 20,
    left: 20,
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 5
  }
})

export default TasksListScreen