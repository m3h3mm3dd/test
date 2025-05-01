import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  TextInput,
  Dimensions,
  StatusBar,
  Keyboard,
  ActivityIndicator,
  Platform
} from 'react-native'
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence,
  withSpring,
  FadeIn,
  SlideInRight,
  SlideInUp,
  FadeOut,
  runOnJS,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import * as Haptics from 'expo-haptics'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { LinearGradient } from 'expo-linear-gradient'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Avatar from '../components/Avatar/Avatar'
import AvatarStack from '../components/Avatar/AvatarStack'
import StatusPill from '../components/StatusPill'
import Card from '../components/Card'
import { triggerImpact } from '../utils/HapticUtils'
import { timeAgo, formatDateString } from '../utils/helpers'

const { width, height } = Dimensions.get('window')
const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Attachment {
  id: string
  name: string
  size: string
  type: string
  url: string
  thumbnail?: string
  uploadedAt: string
  uploadedBy: {
    id: string
    name: string
  }
}

interface Comment {
  id: string
  text: string
  createdAt: string
  user: {
    id: string
    name: string
    avatar?: string
  }
}

interface TaskData {
  id: string
  title: string
  description: string
  status: 'todo' | 'in_progress' | 'completed' | 'blocked'
  priority: 'low' | 'medium' | 'high'
  dueDate: string
  project: {
    id: string
    name: string
    color: string
  }
  assignees: {
    id: string
    name: string
    avatar?: string
  }[]
  creator: {
    id: string
    name: string
    avatar?: string
  }
  subtasks: Subtask[]
  attachments: Attachment[]
  comments: Comment[]
  createdAt: string
  updatedAt: string
  timeTracking?: {
    estimated: number
    spent: number
  }
  tags?: string[]
}

const TaskDetailsScreen = ({ navigation, route }) => {
  const { taskId } = route.params || {}
  const [task, setTask] = useState<TaskData | null>(null)
  const [activeTab, setActiveTab] = useState('info')
  const [commentText, setCommentText] = useState('')
  const [subtaskText, setSubtaskText] = useState('')
  const [isEditing, setIsEditing] = useState(false)
  const [editableFields, setEditableFields] = useState({
    title: '',
    description: '',
    status: '',
    priority: '',
    dueDate: ''
  })
  const [isStatusMenuOpen, setIsStatusMenuOpen] = useState(false)
  const [isPriorityMenuOpen, setIsPriorityMenuOpen] = useState(false)
  
  const insets = useSafeAreaInsets()
  const commentInputRef = useRef<TextInput>(null)
  const scrollViewRef = useRef<ScrollView>(null)
  
  // Animated values
  const scrollY = useSharedValue(0)
  const headerHeight = useSharedValue(60 + insets.top)
  const headerTitleOpacity = useSharedValue(0)
  const statusMenuHeight = useSharedValue(0)
  const priorityMenuHeight = useSharedValue(0)
  const keyboardHeight = useSharedValue(0)
  const commentContainerHeight = useSharedValue(56)
  const editingScale = useSharedValue(1)
  const editingOpacity = useSharedValue(0)
  
  // Load task data
  useEffect(() => {
    // Simulate data fetching
    setTimeout(() => {
      const mockTask: TaskData = {
        id: 'task-001',
        title: 'Design Dashboard UI Components',
        description: 'Create all necessary UI components for the new dashboard interface. Follow the design system guidelines and ensure consistency across all elements. Include dark mode versions of all components.',
        status: 'in_progress',
        priority: 'high',
        dueDate: '2025-05-15T00:00:00.000Z',
        project: {
          id: 'proj-001',
          name: 'Website Redesign',
          color: '#3D5AFE'
        },
        assignees: [
          {
            id: 'user-001',
            name: 'Alex Johnson'
          },
          {
            id: 'user-002',
            name: 'Morgan Smith'
          }
        ],
        creator: {
          id: 'user-003',
          name: 'Jamie Parker'
        },
        subtasks: [
          {
            id: 'subtask-001',
            title: 'Design navigation component',
            completed: true
          },
          {
            id: 'subtask-002',
            title: 'Create card components with variants',
            completed: true
          },
          {
            id: 'subtask-003',
            title: 'Design data visualization widgets',
            completed: false
          },
          {
            id: 'subtask-004',
            title: 'Implement dark mode versions',
            completed: false
          }
        ],
        attachments: [
          {
            id: 'att-001',
            name: 'Dashboard Wireframes.pdf',
            size: '2.4 MB',
            type: 'pdf',
            url: 'https://example.com/files/dashboard-wireframes.pdf',
            uploadedAt: '2025-04-20T14:30:00.000Z',
            uploadedBy: {
              id: 'user-003',
              name: 'Jamie Parker'
            }
          },
          {
            id: 'att-002',
            name: 'Component Specs.docx',
            size: '1.8 MB',
            type: 'document',
            url: 'https://example.com/files/component-specs.docx',
            uploadedAt: '2025-04-22T09:15:00.000Z',
            uploadedBy: {
              id: 'user-001',
              name: 'Alex Johnson'
            }
          }
        ],
        comments: [
          {
            id: 'comment-001',
            text: 'I\'ve uploaded the wireframes for reference. Let me know if you need any clarification on the design.',
            createdAt: '2025-04-20T14:35:00.000Z',
            user: {
              id: 'user-003',
              name: 'Jamie Parker'
            }
          },
          {
            id: 'comment-002',
            text: 'I think we should prioritize the data visualization components since they\'ll take the most time to implement.',
            createdAt: '2025-04-22T10:20:00.000Z',
            user: {
              id: 'user-002',
              name: 'Morgan Smith'
            }
          }
        ],
        createdAt: '2025-04-18T09:00:00.000Z',
        updatedAt: '2025-04-22T10:20:00.000Z',
        timeTracking: {
          estimated: 24,
          spent: 10
        },
        tags: ['Design', 'UI', 'Dashboard']
      }
      
      setTask(mockTask)
      
      // Set editable fields with current values
      setEditableFields({
        title: mockTask.title,
        description: mockTask.description,
        status: mockTask.status,
        priority: mockTask.priority,
        dueDate: mockTask.dueDate
      })
    }, 1000)
  }, [taskId])
  
  // Setup keyboard listeners
  useEffect(() => {
    const keyboardWillShowListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillShow' : 'keyboardDidShow',
      (event) => {
        keyboardHeight.value = event.endCoordinates.height
        commentContainerHeight.value = withTiming(56 + Math.min(100, event.endCoordinates.height / 4))
      }
    )
    
    const keyboardWillHideListener = Keyboard.addListener(
      Platform.OS === 'ios' ? 'keyboardWillHide' : 'keyboardDidHide',
      () => {
        keyboardHeight.value = 0
        commentContainerHeight.value = withTiming(56)
      }
    )
    
    return () => {
      keyboardWillShowListener.remove()
      keyboardWillHideListener.remove()
    }
  }, [])

  // Update edit mode animation
  useEffect(() => {
    if (isEditing) {
      editingScale.value = withSequence(
        withTiming(1.05, { duration: 100 }),
        withTiming(1, { duration: 200 })
      )
      editingOpacity.value = withTiming(1, { duration: 300 })
    } else {
      editingOpacity.value = withTiming(0, { duration: 200 })
    }
  }, [isEditing])
  
  // Handle back press
  const handleBackPress = () => {
    triggerImpact()
    navigation.goBack()
  }
  
  // Handle tab change
  const handleTabChange = (tab) => {
    triggerImpact()
    setActiveTab(tab)
    
    // Close any open menus when changing tabs
    if (isStatusMenuOpen) {
      setIsStatusMenuOpen(false)
      statusMenuHeight.value = withTiming(0, { duration: 300 })
    }
    
    if (isPriorityMenuOpen) {
      setIsPriorityMenuOpen(false)
      priorityMenuHeight.value = withTiming(0, { duration: 300 })
    }
    
    // Scroll to top when changing tabs
    scrollViewRef.current?.scrollTo({ y: 0, animated: true })
  }
  
  // Toggle edit mode
  const handleEditToggle = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    if (isEditing) {
      // Save changes
      if (task) {
        setTask({
          ...task,
          title: editableFields.title,
          description: editableFields.description,
          status: editableFields.status,
          priority: editableFields.priority,
          dueDate: editableFields.dueDate
        })
      }
    }
    
    setIsEditing(!isEditing)
  }
  
  // Toggle subtask completion
  const handleSubtaskToggle = (subtaskId) => {
    triggerImpact()
    
    if (!task) return
    
    setTask({
      ...task,
      subtasks: task.subtasks.map(subtask =>
        subtask.id === subtaskId
          ? { ...subtask, completed: !subtask.completed }
          : subtask
      )
    })
  }
  
  // Add new subtask
  const handleAddSubtask = () => {
    if (!subtaskText.trim() || !task) return
    
    triggerImpact()
    
    const newSubtask: Subtask = {
      id: `subtask-${Date.now()}`,
      title: subtaskText.trim(),
      completed: false
    }
    
    setTask({
      ...task,
      subtasks: [...task.subtasks, newSubtask]
    })
    
    setSubtaskText('')
  }
  
  // Submit new comment
  const handleSubmitComment = () => {
    if (!commentText.trim() || !task) return
    
    triggerImpact()
    
    const newComment: Comment = {
      id: `comment-${Date.now()}`,
      text: commentText.trim(),
      createdAt: new Date().toISOString(),
      user: {
        id: 'user-001', // Current user
        name: 'Alex Johnson'
      }
    }
    
    setTask({
      ...task,
      comments: [...task.comments, newComment]
    })
    
    setCommentText('')
    Keyboard.dismiss()
  }
  
  // Toggle status menu
  const handleStatusMenuToggle = () => {
    triggerImpact()
    
    setIsStatusMenuOpen(!isStatusMenuOpen)
    statusMenuHeight.value = withTiming(
      isStatusMenuOpen ? 0 : 220,
      { duration: 300 }
    )
    
    // Close priority menu if open
    if (isPriorityMenuOpen) {
      setIsPriorityMenuOpen(false)
      priorityMenuHeight.value = withTiming(0, { duration: 300 })
    }
  }
  
  // Toggle priority menu
  const handlePriorityMenuToggle = () => {
    triggerImpact()
    
    setIsPriorityMenuOpen(!isPriorityMenuOpen)
    priorityMenuHeight.value = withTiming(
      isPriorityMenuOpen ? 0 : 160,
      { duration: 300 }
    )
    
    // Close status menu if open
    if (isStatusMenuOpen) {
      setIsStatusMenuOpen(false)
      statusMenuHeight.value = withTiming(0, { duration: 300 })
    }
  }
  
  // Change task status
  const handleStatusChange = (status) => {
    if (!task) return
    
    triggerImpact()
    setEditableFields({ ...editableFields, status })
    
    if (!isEditing) {
      setTask({
        ...task,
        status
      })
    }
    
    // Close menu
    setIsStatusMenuOpen(false)
    statusMenuHeight.value = withTiming(0, { duration: 300 })
  }
  
  // Change task priority
  const handlePriorityChange = (priority) => {
    if (!task) return
    
    triggerImpact()
    setEditableFields({ ...editableFields, priority })
    
    if (!isEditing) {
      setTask({
        ...task,
        priority
      })
    }
    
    // Close menu
    setIsPriorityMenuOpen(false)
    priorityMenuHeight.value = withTiming(0, { duration: 300 })
  }
  
  // Scroll handler for animations
  const handleScroll = (event) => {
    const offsetY = event.nativeEvent.contentOffset.y
    scrollY.value = offsetY
    
    // Show/hide header title based on scroll position
    if (offsetY > 60) {
      headerTitleOpacity.value = withTiming(
        Math.min(1, (offsetY - 60) / 30),
        { duration: 200 }
      )
    } else {
      headerTitleOpacity.value = withTiming(0, { duration: 200 })
    }
  }
  
  // Get formatted status text
  const getStatusText = (status) => {
    switch (status) {
      case 'todo': return 'To Do'
      case 'in_progress': return 'In Progress'
      case 'completed': return 'Completed'
      case 'blocked': return 'Blocked'
      default: return 'Unknown'
    }
  }
  
  // Get status color
  const getStatusColor = (status) => {
    switch (status) {
      case 'todo': return Colors.neutrals.gray600
      case 'in_progress': return Colors.primary.blue
      case 'completed': return Colors.success[500]
      case 'blocked': return Colors.error[500]
      default: return Colors.neutrals.gray600
    }
  }
  
  // Get priority text and color
  const getPriorityConfig = (priority) => {
    switch (priority) {
      case 'low':
        return { text: 'Low', color: Colors.success[500], icon: 'arrow-down' }
      case 'medium':
        return { text: 'Medium', color: Colors.warning[500], icon: 'minus' }
      case 'high':
        return { text: 'High', color: Colors.error[500], icon: 'arrow-up' }
      default:
        return { text: 'Unknown', color: Colors.neutrals.gray600, icon: 'help-circle' }
    }
  }
  
  // Get file icon based on type
  const getFileIcon = (type) => {
    switch (type) {
      case 'pdf': return 'file-text'
      case 'image': return 'image'
      case 'document': return 'file'
      case 'spreadsheet': return 'grid'
      case 'presentation': return 'monitor'
      default: return 'file'
    }
  }
  
  // Calculate progress
  const calculateProgress = () => {
    if (!task || !task.subtasks.length) return 0
    
    const completed = task.subtasks.filter(subtask => subtask.completed).length
    return completed / task.subtasks.length
  }
  
  // Animated styles
  const headerTitleStyle = useAnimatedStyle(() => {
    return {
      opacity: headerTitleOpacity.value,
      transform: [
        { translateY: interpolate(
            headerTitleOpacity.value,
            [0, 1],
            [10, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })
  
  const statusMenuStyle = useAnimatedStyle(() => {
    return {
      height: statusMenuHeight.value,
      overflow: 'hidden'
    }
  })
  
  const priorityMenuStyle = useAnimatedStyle(() => {
    return {
      height: priorityMenuHeight.value,
      overflow: 'hidden'
    }
  })
  
  const commentContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { 
          translateY: interpolate(
            keyboardHeight.value,
            [0, 300],
            [0, -20],
            Extrapolation.CLAMP
          ) 
        }
      ]
    }
  })

  const editModeStyle = useAnimatedStyle(() => {
    return {
      opacity: editingOpacity.value,
      transform: [{ scale: editingScale.value }]
    }
  })
  
  if (!task) {
    return (
      <View style={styles.loadingContainer}>
        <ActivityIndicator size="large" color={Colors.primary.blue} />
        <Text style={styles.loadingText}>Loading task details...</Text>
      </View>
    )
  }
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="dark-content" backgroundColor="transparent" translucent />
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          { paddingTop: insets.top }
        ]}
      >
        <TouchableOpacity 
          style={styles.backButton}
          onPress={handleBackPress}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather name="arrow-left" size={24} color={Colors.neutrals.gray800} />
        </TouchableOpacity>
        
        <Animated.Text 
          style={[styles.headerTitle, headerTitleStyle]} 
          numberOfLines={1}
        >
          {task.title}
        </Animated.Text>
        
        <TouchableOpacity 
          style={[
            styles.editButton,
            isEditing && styles.editButtonActive
          ]}
          onPress={handleEditToggle}
          hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
        >
          <Feather 
            name={isEditing ? "check" : "edit-2"} 
            size={20} 
            color={isEditing ? Colors.neutrals.white : Colors.neutrals.gray800} 
          />
        </TouchableOpacity>
      </Animated.View>

      {/* Editing Mode Indicator */}
      {isEditing && (
        <Animated.View style={[styles.editingIndicator, editModeStyle]}>
          <Feather name="edit-3" size={14} color={Colors.neutrals.white} />
          <Text style={styles.editingText}>Editing Mode</Text>
        </Animated.View>
      )}
      
      {/* Main Content */}
      <ScrollView
        ref={scrollViewRef}
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {/* Title Section */}
        <View style={styles.titleSection}>
          {isEditing ? (
            <TextInput
              style={styles.titleInput}
              value={editableFields.title}
              onChangeText={(text) => setEditableFields({ ...editableFields, title: text })}
              placeholder="Task title"
              placeholderTextColor={Colors.neutrals.gray400}
              selectionColor={Colors.primary.blue}
            />
          ) : (
            <Text style={styles.taskTitle}>{task.title}</Text>
          )}
          
          <View style={styles.metaContainer}>
            <TouchableOpacity 
              style={[
                styles.projectBadge,
                { backgroundColor: `${task.project.color}15` }
              ]}
              onPress={() => navigation.navigate('ProjectDetails', { projectId: task.project.id })}
            >
              <View 
                style={[
                  styles.projectColor, 
                  { backgroundColor: task.project.color }
                ]} 
              />
              <Text 
                style={[
                  styles.projectName,
                  { color: task.project.color }
                ]}
              >
                {task.project.name}
              </Text>
            </TouchableOpacity>
            
            <View style={styles.dateContainer}>
              <Feather 
                name="calendar" 
                size={14} 
                color={
                  new Date(task.dueDate) < new Date() && task.status !== 'completed'
                    ? Colors.error[500] 
                    : Colors.neutrals.gray600
                } 
              />
              <Text 
                style={[
                  styles.dateText,
                  new Date(task.dueDate) < new Date() && task.status !== 'completed' && styles.overdueDateText
                ]}
              >
                {formatDateString(task.dueDate)}
              </Text>
            </View>
          </View>
        </View>
        
        {/* Status and Priority */}
        <View style={styles.statusSection}>
          <View style={styles.statusContainer}>
            <Text style={styles.statusLabel}>Status</Text>
            <TouchableOpacity
              style={styles.statusSelector}
              onPress={handleStatusMenuToggle}
            >
              <View 
                style={[
                  styles.statusDot,
                  { backgroundColor: getStatusColor(isEditing ? editableFields.status : task.status) }
                ]} 
              />
              <Text style={styles.statusText}>
                {getStatusText(isEditing ? editableFields.status : task.status)}
              </Text>
              <Feather name="chevron-down" size={16} color={Colors.neutrals.gray600} />
            </TouchableOpacity>
            
            {/* Status Dropdown Menu */}
            <Animated.View style={[styles.dropdownMenu, statusMenuStyle]}>
              {['todo', 'in_progress', 'completed', 'blocked'].map((status) => (
                <TouchableOpacity
                  key={status}
                  style={[
                    styles.dropdownItem,
                    (isEditing ? editableFields.status : task.status) === status && styles.dropdownItemActive
                  ]}
                  onPress={() => handleStatusChange(status)}
                >
                  <View 
                    style={[
                      styles.statusDot,
                      { backgroundColor: getStatusColor(status) }
                    ]} 
                  />
                  <Text 
                    style={[
                      styles.dropdownItemText,
                      (isEditing ? editableFields.status : task.status) === status && styles.dropdownItemTextActive
                    ]}
                  >
                    {getStatusText(status)}
                  </Text>
                  
                  {(isEditing ? editableFields.status : task.status) === status && (
                    <Feather name="check" size={16} color={Colors.primary.blue} />
                  )}
                </TouchableOpacity>
              ))}
            </Animated.View>
          </View>
          
          <View style={styles.priorityContainer}>
            <Text style={styles.priorityLabel}>Priority</Text>
            <TouchableOpacity
              style={styles.prioritySelector}
              onPress={handlePriorityMenuToggle}
            >
              <View 
                style={[
                  styles.priorityDot,
                  { backgroundColor: getPriorityConfig(isEditing ? editableFields.priority : task.priority).color }
                ]} 
              />
              <Text style={styles.priorityText}>
                {getPriorityConfig(isEditing ? editableFields.priority : task.priority).text}
              </Text>
              <Feather name="chevron-down" size={16} color={Colors.neutrals.gray600} />
            </TouchableOpacity>
            
            {/* Priority Dropdown Menu */}
            <Animated.View style={[styles.dropdownMenu, priorityMenuStyle]}>
              {['low', 'medium', 'high'].map((priority) => {
                const config = getPriorityConfig(priority);
                return (
                  <TouchableOpacity
                    key={priority}
                    style={[
                      styles.dropdownItem,
                      (isEditing ? editableFields.priority : task.priority) === priority && styles.dropdownItemActive
                    ]}
                    onPress={() => handlePriorityChange(priority)}
                  >
                    <View style={styles.priorityItemIcon}>
                      <Feather name={config.icon} size={14} color={config.color} />
                    </View>
                    <Text 
                      style={[
                        styles.dropdownItemText,
                        (isEditing ? editableFields.priority : task.priority) === priority && styles.dropdownItemTextActive
                      ]}
                    >
                      {config.text}
                    </Text>
                    
                    {(isEditing ? editableFields.priority : task.priority) === priority && (
                      <Feather name="check" size={16} color={Colors.primary.blue} />
                    )}
                  </TouchableOpacity>
                );
              })}
            </Animated.View>
          </View>
        </View>
        
        {/* Assignees */}
        <View style={styles.assigneesSection}>
          <View style={styles.sectionHeaderRow}>
            <Text style={styles.sectionTitle}>Assignees</Text>
            {isEditing && (
              <TouchableOpacity style={styles.addButton}>
                <Feather name="plus" size={16} color={Colors.primary.blue} />
                <Text style={styles.addButtonText}>Add</Text>
              </TouchableOpacity>
            )}
          </View>
          <View style={styles.assigneesContainer}>
            {task.assignees.map((assignee) => (
              <View key={assignee.id} style={styles.assigneeItem}>
                <Avatar
                  name={assignee.name}
                  imageUrl={assignee.avatar}
                  size={42}
                  status="online"
                />
                <Text style={styles.assigneeName}>{assignee.name}</Text>
              </View>
            ))}
            
            {!isEditing && task.assignees.length < 5 && (
              <TouchableOpacity style={styles.addAssigneeButton}>
                <Feather name="plus" size={20} color={Colors.primary.blue} />
              </TouchableOpacity>
            )}
          </View>
        </View>
        
        {/* Tab Navigation */}
        <View style={styles.tabsContainer}>
          <ScrollView
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.tabsScrollContainer}
          >
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'info' && styles.activeTab
              ]}
              onPress={() => handleTabChange('info')}
            >
              <Feather 
                name="info" 
                size={16} 
                color={activeTab === 'info' ? Colors.primary.blue : Colors.neutrals.gray600} 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'info' && styles.activeTabText
                ]}
              >
                Details
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'subtasks' && styles.activeTab
              ]}
              onPress={() => handleTabChange('subtasks')}
            >
              <Feather 
                name="check-square" 
                size={16} 
                color={activeTab === 'subtasks' ? Colors.primary.blue : Colors.neutrals.gray600} 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'subtasks' && styles.activeTabText
                ]}
              >
                Subtasks
              </Text>
              <View style={styles.subtaskCount}>
                <Text style={styles.subtaskCountText}>{task.subtasks.length}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'attachments' && styles.activeTab
              ]}
              onPress={() => handleTabChange('attachments')}
            >
              <Feather 
                name="paperclip" 
                size={16} 
                color={activeTab === 'attachments' ? Colors.primary.blue : Colors.neutrals.gray600} 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'attachments' && styles.activeTabText
                ]}
              >
                Files
              </Text>
              <View style={styles.subtaskCount}>
                <Text style={styles.subtaskCountText}>{task.attachments.length}</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[
                styles.tab,
                activeTab === 'comments' && styles.activeTab
              ]}
              onPress={() => handleTabChange('comments')}
            >
              <Feather 
                name="message-circle" 
                size={16} 
                color={activeTab === 'comments' ? Colors.primary.blue : Colors.neutrals.gray600} 
                style={styles.tabIcon}
              />
              <Text 
                style={[
                  styles.tabText,
                  activeTab === 'comments' && styles.activeTabText
                ]}
              >
                Comments
              </Text>
              <View style={styles.subtaskCount}>
                <Text style={styles.subtaskCountText}>{task.comments.length}</Text>
              </View>
            </TouchableOpacity>
          </ScrollView>
        </View>
        
        {/* Tab Content */}
        <View style={styles.tabContent}>
          {/* Info Tab */}
          {activeTab === 'info' && (
            <Animated.View 
              style={styles.infoContainer}
              entering={FadeIn.duration(300)}
            >
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Description</Text>
              </View>
              {isEditing ? (
                <TextInput
                  style={styles.descriptionInput}
                  value={editableFields.description}
                  onChangeText={(text) => setEditableFields({ ...editableFields, description: text })}
                  placeholder="Add a detailed description of the task..."
                  placeholderTextColor={Colors.neutrals.gray400}
                  multiline
                  numberOfLines={5}
                  selectionColor={Colors.primary.blue}
                />
              ) : (
                <Text style={styles.descriptionText}>{task.description}</Text>
              )}
              
              {/* Time Tracking */}
              {task.timeTracking && (
                <View style={styles.timeTrackingSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Time Tracking</Text>
                    <View style={styles.timeTrackingHeader}>
                      <Feather name="clock" size={16} color={Colors.primary.blue} />
                      <Text style={styles.timeTrackingValue}>
                        {task.timeTracking.spent}/{task.timeTracking.estimated}h
                      </Text>
                    </View>
                  </View>
                  <View style={styles.timeTrackingBar}>
                    <View 
                      style={[
                        styles.timeTrackingProgress, 
                        { 
                          width: `${Math.min(
                            100, 
                            (task.timeTracking.spent / task.timeTracking.estimated) * 100
                          )}%` 
                        }
                      ]} 
                    />
                  </View>
                  <View style={styles.timeTrackingLabels}>
                    <Text style={styles.timeLabel}>
                      {task.timeTracking.spent}h logged
                    </Text>
                    <Text style={styles.timeLabel}>
                      {task.timeTracking.estimated}h estimated
                    </Text>
                  </View>
                </View>
              )}
              
              {/* Tags */}
              {task.tags && task.tags.length > 0 && (
                <View style={styles.tagsSection}>
                  <View style={styles.sectionHeaderRow}>
                    <Text style={styles.sectionTitle}>Tags</Text>
                    {isEditing && (
                      <TouchableOpacity style={styles.addButton}>
                        <Feather name="plus" size={16} color={Colors.primary.blue} />
                        <Text style={styles.addButtonText}>Add</Text>
                      </TouchableOpacity>
                    )}
                  </View>
                  <View style={styles.tagsContainer}>
                    {task.tags.map((tag, index) => (
                      <View key={index} style={styles.tag}>
                        <Text style={styles.tagText}>{tag}</Text>
                        {isEditing && (
                          <TouchableOpacity style={styles.removeTagButton}>
                            <Feather name="x" size={12} color={Colors.primary.blue} />
                          </TouchableOpacity>
                        )}
                      </View>
                    ))}
                  </View>
                </View>
              )}
              
              {/* Additional Details */}
              <Card style={styles.detailsCard}>
                <View style={styles.detailsSection}>
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Created by</Text>
                    <Text style={styles.detailValue}>{task.creator.name}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Created on</Text>
                    <Text style={styles.detailValue}>{formatDateString(task.createdAt, { year: 'numeric' })}</Text>
                  </View>
                  
                  <View style={styles.detailItem}>
                    <Text style={styles.detailLabel}>Last updated</Text>
                    <Text style={styles.detailValue}>{timeAgo(task.updatedAt)}</Text>
                  </View>
                </View>
              </Card>
            </Animated.View>
          )}
          
          {/* Subtasks Tab */}
          {activeTab === 'subtasks' && (
            <Animated.View 
              style={styles.subtasksContainer}
              entering={FadeIn.duration(300)}
            >
              <View style={styles.progressSection}>
                <View style={styles.progressTextContainer}>
                  <Text style={styles.progressLabel}>Progress</Text>
                  <Text style={styles.progressPercentage}>
                    {Math.round(calculateProgress() * 100)}%
                  </Text>
                </View>
                
                <View style={styles.progressBar}>
                  <View 
                    style={[
                      styles.progressFill, 
                      { width: `${calculateProgress() * 100}%` }
                    ]} 
                  >
                    {calculateProgress() > 0.05 && (
                      <LinearGradient
                        colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0.3)', 'rgba(255,255,255,0.1)']}
                        start={{ x: 0, y: 0.5 }}
                        end={{ x: 1, y: 0.5 }}
                        style={styles.progressGlow}
                      />
                    )}
                  </View>
                </View>
              </View>
              
              <View style={styles.subtasksList}>
                {task.subtasks.map((subtask, index) => (
                  <Animated.View
                    key={subtask.id}
                    entering={SlideInUp.delay(index * 80).duration(300)}
                  >
                    <TouchableOpacity
                      style={[
                        styles.subtaskItem,
                        subtask.completed && styles.subtaskCompleted
                      ]}
                      onPress={() => handleSubtaskToggle(subtask.id)}
                      activeOpacity={0.7}
                    >
                      <View 
                        style={[
                          styles.checkbox,
                          subtask.completed && styles.checkboxChecked
                        ]}
                      >
                        {subtask.completed && (
                          <Feather name="check" size={14} color={Colors.neutrals.white} />
                        )}
                      </View>
                      
                      <Text 
                        style={[
                          styles.subtaskTitle,
                          subtask.completed && styles.subtaskTitleCompleted
                        ]}
                      >
                        {subtask.title}
                      </Text>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              
              {/* Add Subtask Input */}
              <View style={styles.addSubtaskContainer}>
                <TextInput
                  style={styles.addSubtaskInput}
                  value={subtaskText}
                  onChangeText={setSubtaskText}
                  placeholder="Add a subtask..."
                  placeholderTextColor={Colors.neutrals.gray400}
                  returnKeyType="done"
                  onSubmitEditing={handleAddSubtask}
                  selectionColor={Colors.primary.blue}
                />
                
                <TouchableOpacity
                  style={[
                    styles.addSubtaskButton,
                    !subtaskText.trim() && styles.addSubtaskButtonDisabled
                  ]}
                  onPress={handleAddSubtask}
                  disabled={!subtaskText.trim()}
                >
                  <Feather 
                    name="plus" 
                    size={20} 
                    color={subtaskText.trim() ? Colors.neutrals.white : Colors.neutrals.gray400} 
                  />
                </TouchableOpacity>
              </View>
            </Animated.View>
          )}
          
          {/* Attachments Tab */}
          {activeTab === 'attachments' && (
            <Animated.View 
              style={styles.attachmentsContainer}
              entering={FadeIn.duration(300)}
            >
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Files & Attachments</Text>
              </View>
              
              <View style={styles.attachmentsList}>
                {task.attachments.map((attachment, index) => (
                  <Animated.View
                    key={attachment.id}
                    entering={SlideInRight.delay(index * 80).duration(300)}
                  >
                    <TouchableOpacity style={styles.attachmentItem} activeOpacity={0.7}>
                      <View 
                        style={[
                          styles.attachmentIcon,
                          { backgroundColor: `${task.project.color}15` }
                        ]}
                      >
                        <Feather 
                          name={getFileIcon(attachment.type)} 
                          size={22} 
                          color={task.project.color} 
                        />
                      </View>
                      
                      <View style={styles.attachmentInfo}>
                        <Text style={styles.attachmentName} numberOfLines={1}>
                          {attachment.name}
                        </Text>
                        <Text style={styles.attachmentMeta}>
                          {attachment.size} • Uploaded {timeAgo(attachment.uploadedAt)}
                        </Text>
                      </View>
                      
                      <View style={styles.attachmentActions}>
                        <TouchableOpacity style={styles.attachmentActionButton}>
                          <Feather name="eye" size={16} color={Colors.primary.blue} />
                        </TouchableOpacity>
                        <TouchableOpacity style={styles.attachmentActionButton}>
                          <Feather name="download" size={16} color={Colors.primary.blue} />
                        </TouchableOpacity>
                      </View>
                    </TouchableOpacity>
                  </Animated.View>
                ))}
              </View>
              
              <TouchableOpacity style={styles.uploadButton}>
                <Feather name="upload" size={18} color={Colors.primary.blue} />
                <Text style={styles.uploadButtonText}>Upload File</Text>
              </TouchableOpacity>
            </Animated.View>
          )}
          
          {/* Comments Tab */}
          {activeTab === 'comments' && (
            <Animated.View 
              style={styles.commentsContainer}
              entering={FadeIn.duration(300)}
            >
              <View style={styles.sectionHeaderRow}>
                <Text style={styles.sectionTitle}>Discussion</Text>
              </View>
              
              <View style={styles.commentsList}>
                {task.comments.map((comment, index) => (
                  <Animated.View
                    key={comment.id}
                    entering={SlideInRight.delay(index * 80).duration(300)}
                  >
                    <View style={styles.commentItem}>
                      <Avatar
                        name={comment.user.name}
                        imageUrl={comment.user.avatar}
                        size={40}
                        status="online"
                      />
                      
                      <View style={styles.commentContent}>
                        <View style={styles.commentHeader}>
                          <Text style={styles.commentAuthor}>{comment.user.name}</Text>
                          <Text style={styles.commentTime}>{timeAgo(comment.createdAt)}</Text>
                        </View>
                        
                        <Text style={styles.commentText}>{comment.text}</Text>
                        
                        <View style={styles.commentActions}>
                          <TouchableOpacity style={styles.commentAction}>
                            <Feather name="heart" size={14} color={Colors.neutrals.gray500} />
                            <Text style={styles.commentActionText}>Like</Text>
                          </TouchableOpacity>
                          <TouchableOpacity style={styles.commentAction}>
                            <Feather name="message-circle" size={14} color={Colors.neutrals.gray500} />
                            <Text style={styles.commentActionText}>Reply</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Animated.View>
                ))}
              </View>
              
              {/* Empty space to prevent comment input from covering content */}
              <View style={{ height: 90 }} />
            </Animated.View>
          )}
        </View>
      </ScrollView>
      
      {/* Comment Input (only visible in Comments tab) */}
      {activeTab === 'comments' && (
        <Animated.View 
          style={[
            styles.commentInputContainer,
            { paddingBottom: insets.bottom ? insets.bottom : 16 },
            commentContainerStyle
          ]}
          entering={FadeIn}
        >
          <Avatar
            name="Alex Johnson" // Current user
            size={36}
            status="online"
          />
          
          <TextInput
            ref={commentInputRef}
            style={styles.commentInput}
            value={commentText}
            onChangeText={setCommentText}
            placeholder="Add a comment..."
            placeholderTextColor={Colors.neutrals.gray400}
            multiline
            selectionColor={Colors.primary.blue}
          />
          
          <TouchableOpacity
            style={[
              styles.sendButton,
              commentText.trim() ? styles.sendButtonActive : styles.sendButtonDisabled
            ]}
            onPress={handleSubmitComment}
            disabled={!commentText.trim()}
          >
            <Feather 
              name="send" 
              size={20} 
              color={commentText.trim() ? Colors.neutrals.white : Colors.neutrals.gray400} 
            />
          </TouchableOpacity>
        </Animated.View>
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light
  },
  loadingText: {
    marginTop: 12,
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700
  },
  header: {
    height: 60,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    backgroundColor: Colors.background.light,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200,
    zIndex: 10
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.gray100
  },
  headerTitle: {
    position: 'absolute',
    left: 70,
    right: 70,
    textAlign: 'center',
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  editButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center'
  },
  editButtonActive: {
    backgroundColor: Colors.primary.blue
  },
  editingIndicator: {
    position: 'absolute',
    top: 70,
    right: 16,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    zIndex: 5
  },
  editingText: {
    color: Colors.neutrals.white,
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    marginLeft: 4
  },
  scrollView: {
    flex: 1
  },
  scrollContent: {
    paddingBottom: 40
  },
  titleSection: {
    padding: 20
  },
  taskTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 12,
    lineHeight: 32
  },
  titleInput: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: 12,
    padding: 0,
    borderBottomWidth: 2,
    borderBottomColor: Colors.primary.blue + '40',
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flexWrap: 'wrap'
  },
  projectBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.gray100,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 16,
    marginBottom: 6
  },
  projectColor: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 6
  },
  projectName: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium
  },
  dateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 12,
    marginBottom: 6
  },
  dateText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginLeft: 4
  },
  overdueDateText: {
    color: Colors.error[500],
    fontWeight: Typography.weights.medium
  },
  statusSection: {
    flexDirection: 'row',
    paddingHorizontal: 20,
    paddingBottom: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  statusContainer: {
    flex: 1,
    marginRight: 8,
    zIndex: 2
  },
  statusLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginBottom: 8
  },
  statusSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  statusDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  statusText: {
    flex: 1,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray800
  },
  priorityContainer: {
    flex: 1,
    marginLeft: 8,
    zIndex: 2
  },
  priorityLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginBottom: 8
  },
  prioritySelector: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 12,
    paddingHorizontal: 12,
    paddingVertical: 10,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  priorityDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: 8
  },
  priorityItemIcon: {
    width: 20,
    alignItems: 'center',
    marginRight: 8
  },
  priorityText: {
    flex: 1,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray800
  },
  dropdownMenu: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    marginTop: 8,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 8,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray200,
    zIndex: 100
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  dropdownItemActive: {
    backgroundColor: Colors.primary.blue + '10'
  },
  dropdownItemText: {
    flex: 1,
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800
  },
  dropdownItemTextActive: {
    fontWeight: Typography.weights.medium,
    color: Colors.primary.blue
  },
  assigneesSection: {
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  sectionHeaderRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16
  },
  sectionTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: Colors.primary.blue + '15'
  },
  addButtonText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.primary.blue,
    marginLeft: 4
  },
  assigneesContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  assigneeItem: {
    alignItems: 'center',
    marginRight: 16,
    marginBottom: 12
  },
  assigneeName: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray700,
    marginTop: 6,
    textAlign: 'center'
  },
  addAssigneeButton: {
    width: 42,
    height: 42,
    borderRadius: 21,
    backgroundColor: Colors.neutrals.gray100,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray200,
    borderStyle: 'dashed'
  },
  tabsContainer: {
    paddingTop: 6,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  tabsScrollContainer: {
    paddingHorizontal: 20
  },
  tab: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginRight: 16,
    borderRadius: 20
  },
  activeTab: {
    backgroundColor: Colors.primary.blue + '10',
    borderBottomWidth: 0
  },
  tabIcon: {
    marginRight: 6
  },
  tabText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray600
  },
  activeTabText: {
    color: Colors.primary.blue,
    fontWeight: Typography.weights.semibold
  },
  subtaskCount: {
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2,
    marginLeft: 6
  },
  subtaskCountText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray700,
    fontWeight: Typography.weights.medium
  },
  tabContent: {
    flex: 1
  },
  infoContainer: {
    padding: 20
  },
  descriptionText: {
    fontSize: Typography.sizes.body,
    lineHeight: 24,
    color: Colors.neutrals.gray800,
    marginBottom: 24
  },
  descriptionInput: {
    fontSize: Typography.sizes.body,
    lineHeight: 24,
    color: Colors.neutrals.gray800,
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 12,
    minHeight: 120,
    textAlignVertical: 'top'
  },
  timeTrackingSection: {
    marginBottom: 24,
    padding: 16,
    backgroundColor: Colors.neutrals.gray50,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray200
  },
  timeTrackingHeader: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  timeTrackingValue: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.blue,
    marginLeft: 6
  },
  timeTrackingBar: {
    height: 8,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 4,
    overflow: 'hidden',
    marginVertical: 12
  },
  timeTrackingProgress: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: 4,
    position: 'relative'
  },
  progressGlow: {
    position: 'absolute',
    top: 0,
    right: 0,
    bottom: 0,
    left: 0
  },
  timeTrackingLabels: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  timeLabel: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  tagsSection: {
    marginBottom: 24
  },
  tagsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap'
  },
  tag: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.primary.blue + '15',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 16,
    marginRight: 8,
    marginBottom: 8
  },
  tagText: {
    fontSize: Typography.sizes.caption,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  removeTagButton: {
    marginLeft: 4,
    padding: 2
  },
  detailsCard: {
    borderRadius: 12,
    padding: 0,
    overflow: 'hidden',
    marginTop: 8
  },
  detailsSection: {
    backgroundColor: Colors.neutrals.gray50
  },
  detailItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  detailLabel: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  detailValue: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray800,
    fontWeight: Typography.weights.medium
  },
  subtasksContainer: {
    padding: 20
  },
  progressSection: {
    marginBottom: 20
  },
  progressTextContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8
  },
  progressLabel: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  progressPercentage: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.bold,
    color: Colors.primary.blue
  },
  progressBar: {
    height: 10,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 5,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: 5,
    overflow: 'hidden'
  },
  subtasksList: {
    marginBottom: 20
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  subtaskCompleted: {
    opacity: 0.7
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.blue
  },
  subtaskTitle: {
    flex: 1,
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800
  },
  subtaskTitleCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.neutrals.gray500
  },
  addSubtaskContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray300,
    paddingHorizontal: 12,
    paddingVertical: 4,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 1
  },
  addSubtaskInput: {
    flex: 1,
    height: 40,
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800
  },
  addSubtaskButton: {
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center'
  },
  addSubtaskButtonDisabled: {
    backgroundColor: Colors.neutrals.gray300
  },
  attachmentsContainer: {
    padding: 20
  },
  attachmentsList: {
    marginBottom: 20
  },
  attachmentItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2
  },
  attachmentIcon: {
    width: 48,
    height: 48,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12
  },
  attachmentInfo: {
    flex: 1
  },
  attachmentName: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  attachmentMeta: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  attachmentActions: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  attachmentActionButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: Colors.primary.blue + '15',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  },
  uploadButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderWidth: 1,
    borderColor: Colors.primary.blue,
    borderRadius: 12,
    borderStyle: 'dashed'
  },
  uploadButtonText: {
    fontSize: Typography.sizes.body,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium,
    marginLeft: 8
  },
  commentsContainer: {
    padding: 20
  },
  commentsList: {
    marginBottom: 20
  },
  commentItem: {
    flexDirection: 'row',
    marginBottom: 20
  },
  commentContent: {
    flex: 1,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 12,
    borderTopLeftRadius: 0,
    padding: 12,
    marginLeft: 12
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  commentAuthor: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  commentTime: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray500
  },
  commentText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800,
    lineHeight: 20
  },
  commentActions: {
    flexDirection: 'row',
    marginTop: 8
  },
  commentAction: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 16
  },
  commentActionText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray500,
    marginLeft: 4
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200,
    paddingHorizontal: 16,
    paddingTop: 12,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.05,
    shadowRadius: 6,
    elevation: 5
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    marginHorizontal: 12,
    maxHeight: 120,
    fontSize: Typography.sizes.body
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  sendButtonActive: {
    backgroundColor: Colors.primary.blue
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutrals.gray200
  }
})

export default TaskDetailsScreen