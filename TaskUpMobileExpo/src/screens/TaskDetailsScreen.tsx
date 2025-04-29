import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  ScrollView, 
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  TextInput,
  ActivityIndicator,
  FlatList
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInRight,
  SlideInLeft,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'
import { BlurView } from 'expo-blur'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Card from '../components/Card'
import Button from '../components/Button/Button'
import StatusPill from '../components/StatusPill'
import Avatar from '../components/Avatar/Avatar'
import Input from '../components/Input/Input'
import AvatarStack from '../components/Avatar/AvatarStack'
import SwipeableRow from '../components/SwipeableRow'
import SkeletonLoader from '../components/SkeletonLoader'
import FAB from '../components/FAB'
import { triggerImpact } from '../utils/HapticUtils'

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView)

interface Comment {
  id: string
  author: {
    id: string
    name: string
    imageUrl?: string | null
  }
  text: string
  timestamp: string
}

interface Subtask {
  id: string
  title: string
  completed: boolean
}

interface Attachment {
  id: string
  name: string
  type: 'image' | 'document' | 'link'
  url: string
  thumbnail?: string
  size?: string
}

const TaskDetailsScreen = ({ route, navigation }) => {
  const { taskId } = route.params || {}
  const insets = useSafeAreaInsets()
  
  // UI State
  const [loading, setLoading] = useState(true)
  const [editMode, setEditMode] = useState(false)
  const [newComment, setNewComment] = useState('')
  const [submittingComment, setSubmittingComment] = useState(false)
  const [activeTab, setActiveTab] = useState<'details' | 'subtasks' | 'comments' | 'attachments'>('details')
  
  // Task Data
  const [task, setTask] = useState({
    id: '',
    title: '',
    description: '',
    status: 'in-progress',
    priority: 'high',
    dueDate: '',
    project: '',
    assignees: [],
    createdBy: {
      id: '1',
      name: 'Alex Johnson',
      imageUrl: null
    },
    createdAt: ''
  })
  
  const [subtasks, setSubtasks] = useState<Subtask[]>([])
  const [comments, setComments] = useState<Comment[]>([])
  const [attachments, setAttachments] = useState<Attachment[]>([])
  
  // Animation values
  const scrollY = useSharedValue(0)
  const headerHeight = useSharedValue(250)
  const editFormHeight = useSharedValue(0)
  const commentInputHeight = useSharedValue(50)
  
  // Refs
  const commentInputRef = useRef<TextInput>(null)
  
  // Load task data
  useEffect(() => {
    // Simulating API call to fetch task data
    const timer = setTimeout(() => {
      setTask({
        id: taskId || '1',
        title: 'Design System Updates',
        description: 'Update button and card components with new styling guidelines. Implement new color scheme and typography across all UI elements following the latest design system specifications.',
        status: 'in-progress',
        priority: 'high',
        dueDate: '2025-05-10',
        project: 'Mobile App Redesign',
        assignees: [
          { id: '1', name: 'Alex Johnson', imageUrl: null },
          { id: '2', name: 'Morgan Smith', imageUrl: null }
        ],
        createdBy: {
          id: '1',
          name: 'Alex Johnson',
          imageUrl: null
        },
        createdAt: '2025-04-25'
      })
      
      setSubtasks([
        { id: '1', title: 'Update button component styles', completed: true },
        { id: '2', title: 'Implement new card shadows', completed: false },
        { id: '3', title: 'Apply typography changes', completed: false },
        { id: '4', title: 'Update color palette', completed: true }
      ])
      
      setComments([
        {
          id: '1',
          author: { id: '2', name: 'Morgan Smith', imageUrl: null },
          text: 'I started working on the button component. Should we use the new shadows for all states or just for hover?',
          timestamp: '2025-04-26T10:32:00Z'
        },
        {
          id: '2',
          author: { id: '1', name: 'Alex Johnson', imageUrl: null },
          text: 'Let\'s apply the new shadows to all states to maintain consistency. The design team specified this in the documentation.',
          timestamp: '2025-04-26T11:15:00Z'
        }
      ])
      
      setAttachments([
        {
          id: '1',
          name: 'Design System Documentation.pdf',
          type: 'document',
          url: '#',
          size: '2.4 MB'
        },
        {
          id: '2',
          name: 'Button Component Mockup.png',
          type: 'image',
          url: '#',
          thumbnail: '#',
          size: '856 KB'
        }
      ])
      
      setLoading(false)
    }, 1500)
    
    return () => clearTimeout(timer)
  }, [taskId])
  
  // Handle subtask toggle
  const toggleSubtask = (id: string) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    setSubtasks(prev => prev.map(subtask => {
      if (subtask.id === id) {
        return { ...subtask, completed: !subtask.completed }
      }
      return subtask
    }))
  }
  
  // Handle comment submission
  const submitComment = () => {
    if (!newComment.trim()) return
    
    setSubmittingComment(true)
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    // Simulate API delay
    setTimeout(() => {
      const newCommentObj: Comment = {
        id: Date.now().toString(),
        author: { id: '1', name: 'Alex Johnson', imageUrl: null },
        text: newComment.trim(),
        timestamp: new Date().toISOString()
      }
      
      setComments(prev => [...prev, newCommentObj])
      setNewComment('')
      setSubmittingComment(false)
    }, 500)
  }
  
  // Handle scroll events
  const handleScroll = (event) => {
    const y = event.nativeEvent.contentOffset.y
    scrollY.value = y
    
    // Collapse/expand header based on scroll position
    const newHeight = Math.max(120, 250 - y)
    headerHeight.value = withTiming(newHeight, { duration: 100 })
  }
  
  // Toggle edit mode
  const toggleEditMode = () => {
    setEditMode(prev => !prev)
    editFormHeight.value = withTiming(editMode ? 0 : 300, { duration: 300 })
  }
  
  // Handle status change
  const changeStatus = (status: string) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    setTask(prev => ({ ...prev, status }))
  }
  
  // Handle priority change
  const changePriority = (priority: string) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    setTask(prev => ({ ...prev, priority }))
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
      [120, 180],
      [0, 1],
      Extrapolation.CLAMP
    )
    
    return {
      opacity
    }
  })
  
  const headerContentStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      headerHeight.value,
      [120, 180],
      [0, 1],
      Extrapolation.CLAMP
    )
    
    return {
      opacity,
      transform: [
        { 
          translateY: interpolate(
            headerHeight.value,
            [120, 250],
            [-20, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    }
  })
  
  const headerTitleStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      headerHeight.value,
      [150, 200],
      [1, 0],
      Extrapolation.CLAMP
    )
    
    return {
      opacity
    }
  })
  
  const editFormStyle = useAnimatedStyle(() => {
    return {
      height: editFormHeight.value,
      opacity: editFormHeight.value === 0 ? 0 : 1
    }
  })
  
  // Calculate subtask progress
  const completedSubtasks = subtasks.filter(st => st.completed).length
  const totalSubtasks = subtasks.length
  const subtaskProgress = totalSubtasks ? completedSubtasks / totalSubtasks : 0
  
  // Render loading state
  if (loading) {
    return (
      <View style={[styles.container, { paddingTop: insets.top }]}>
        <View style={[styles.header, { height: 250 }]}>
          <View style={styles.headerControls}>
            <TouchableOpacity 
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            
            <SkeletonLoader width={80} height={32} borderRadius={16} backgroundColor="rgba(255, 255, 255, 0.15)" />
          </View>
          
          <View style={styles.headerContent}>
            <SkeletonLoader width="80%" height={28} borderRadius={4} backgroundColor="rgba(255, 255, 255, 0.15)" style={{ marginBottom: 12 }} />
            <SkeletonLoader width="60%" height={18} borderRadius={4} backgroundColor="rgba(255, 255, 255, 0.15)" />
          </View>
        </View>
        
        <View style={styles.tabsContainer}>
          <SkeletonLoader.Row style={styles.tabs}>
            {['details', 'subtasks', 'comments', 'attachments'].map((_, index) => (
              <SkeletonLoader 
                key={index}
                width={80} 
                height={40}
                borderRadius={20}
                backgroundColor={Colors.neutrals.gray200}
                style={{ marginRight: 8 }}
              />
            ))}
          </SkeletonLoader.Row>
        </View>
        
        <ScrollView style={styles.content}>
          <View style={styles.section}>
            <SkeletonLoader.Task style={{ marginBottom: 16 }} />
            <SkeletonLoader.Task style={{ marginBottom: 16 }} />
            <SkeletonLoader.Task />
          </View>
        </ScrollView>
      </View>
    )
  }
  
  // Render different tab content based on activeTab
  const renderTabContent = () => {
    switch (activeTab) {
      case 'details':
        return (
          <Animated.View 
            entering={FadeIn.delay(100).duration(300)}
            style={styles.section}
          >
            <View style={styles.metaSection}>
              <Animated.View 
                entering={FadeInDown.delay(200).duration(400)}
                style={styles.metaItem}
              >
                <Text style={styles.metaLabel}>Project</Text>
                <Card 
                  style={styles.projectCard}
                  animationType="spring"
                  elevation={2}
                  borderRadius={8}
                  onPress={() => navigation.navigate('ProjectDetails', { projectId: '1' })}
                >
                  <View style={styles.projectCardContent}>
                    <View style={[styles.projectIcon, { backgroundColor: 'rgba(61, 90, 254, 0.1)' }]}>
                      <Feather name="smartphone" size={16} color={Colors.primary.blue} />
                    </View>
                    <Text style={styles.projectName}>{task.project}</Text>
                    <Feather name="chevron-right" size={16} color={Colors.neutrals.gray600} />
                  </View>
                </Card>
              </Animated.View>
              
              <Animated.View 
                entering={FadeInDown.delay(300).duration(400)}
                style={styles.metaItem}
              >
                <Text style={styles.metaLabel}>Status</Text>
                <View style={styles.pillsContainer}>
                  <TouchableOpacity onPress={() => changeStatus('pending')}>
                    <StatusPill 
                      label="To Do" 
                      type={task.status === 'pending' ? 'pending' : 'default'} 
                      style={[
                        styles.pill, 
                        task.status === 'pending' && styles.activePill
                      ]} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => changeStatus('in-progress')}>
                    <StatusPill 
                      label="In Progress" 
                      type={task.status === 'in-progress' ? 'in-progress' : 'default'} 
                      style={[
                        styles.pill, 
                        task.status === 'in-progress' && styles.activePill
                      ]} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => changeStatus('completed')}>
                    <StatusPill 
                      label="Completed" 
                      type={task.status === 'completed' ? 'completed' : 'default'} 
                      style={[
                        styles.pill, 
                        task.status === 'completed' && styles.activePill
                      ]} 
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
              
              <Animated.View 
                entering={FadeInDown.delay(400).duration(400)}
                style={styles.metaItem}
              >
                <Text style={styles.metaLabel}>Priority</Text>
                <View style={styles.pillsContainer}>
                  <TouchableOpacity onPress={() => changePriority('low')}>
                    <StatusPill 
                      label="Low" 
                      priority={task.priority === 'low' ? 'low' : 'default'} 
                      style={[
                        styles.pill, 
                        task.priority === 'low' && styles.activePill
                      ]} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => changePriority('medium')}>
                    <StatusPill 
                      label="Medium" 
                      priority={task.priority === 'medium' ? 'medium' : 'default'} 
                      style={[
                        styles.pill, 
                        task.priority === 'medium' && styles.activePill
                      ]} 
                    />
                  </TouchableOpacity>
                  
                  <TouchableOpacity onPress={() => changePriority('high')}>
                    <StatusPill 
                      label="High" 
                      priority={task.priority === 'high' ? 'high' : 'default'} 
                      style={[
                        styles.pill, 
                        task.priority === 'high' && styles.activePill
                      ]} 
                      animate={task.priority === 'high'}
                    />
                  </TouchableOpacity>
                </View>
              </Animated.View>
              
              <Animated.View 
                entering={FadeInDown.delay(500).duration(400)}
                style={styles.metaItem}
              >
                <Text style={styles.metaLabel}>Due Date</Text>
                <View style={styles.dueDateContainer}>
                  <Feather name="calendar" size={16} color={Colors.neutrals.gray600} />
                  <Text style={styles.dueDate}>{task.dueDate}</Text>
                  <TouchableOpacity style={styles.editDateButton}>
                    <Feather name="edit-3" size={14} color={Colors.primary.blue} />
                  </TouchableOpacity>
                </View>
              </Animated.View>
              
              <Animated.View 
                entering={FadeInDown.delay(600).duration(400)}
                style={styles.metaItem}
              >
                <Text style={styles.metaLabel}>Assignees</Text>
                <View style={styles.assigneesContainer}>
                  <AvatarStack 
                    users={task.assignees}
                    maxDisplay={3}
                    size={36}
                    expanded={true}
                  />
                  <TouchableOpacity style={styles.addAssigneeButton}>
                    <Feather name="plus" size={16} color={Colors.primary.blue} />
                    <Text style={styles.addAssigneeText}>Add</Text>
                  </TouchableOpacity>
                </View>
              </Animated.View>
            </View>
            
            <Animated.View 
              entering={FadeInDown.delay(700).duration(400)}
              style={styles.descriptionSection}
            >
              <Text style={styles.sectionTitle}>Description</Text>
              <Card style={styles.descriptionCard}>
                <Text style={styles.description}>{task.description}</Text>
                <TouchableOpacity style={styles.editDescriptionButton}>
                  <Feather name="edit-2" size={16} color={Colors.primary.blue} />
                </TouchableOpacity>
              </Card>
            </Animated.View>
          </Animated.View>
        )
        
      case 'subtasks':
        return (
          <Animated.View 
            entering={FadeIn.delay(100).duration(300)}
            style={styles.section}
          >
            <View style={styles.subtasksHeader}>
              <Text style={styles.sectionTitle}>Subtasks</Text>
              <View style={styles.subtasksProgress}>
                <View style={styles.progressTrack}>
                  <Animated.View 
                    style={[
                      styles.progressFill, 
                      { width: `${Math.round(subtaskProgress * 100)}%` }
                    ]}
                    entering={FadeInRight.duration(1000)}
                  />
                </View>
                <Text style={styles.progressText}>
                  {completedSubtasks}/{totalSubtasks} completed
                </Text>
              </View>
            </View>
            
            <View style={styles.subtasksList}>
              {subtasks.map((subtask, index) => (
                <Animated.View 
                  key={subtask.id}
                  entering={FadeInDown.delay(200 + index * 100).duration(400)}
                >
                  <SwipeableRow
                    rightActions={[
                      {
                        icon: 'trash-2',
                        label: 'Delete',
                        color: Colors.secondary.red,
                        onPress: () => {
                          setSubtasks(prev => prev.filter(st => st.id !== subtask.id))
                        },
                        destructive: true
                      }
                    ]}
                  >
                    <TouchableOpacity 
                      style={styles.subtaskItem}
                      onPress={() => toggleSubtask(subtask.id)}
                      activeOpacity={0.7}
                    >
                      <View 
                        style={[
                          styles.checkbox, 
                          subtask.completed && styles.checkboxChecked
                        ]}
                      >
                        {subtask.completed && (
                          <Feather name="check" size={14} color="#fff" />
                        )}
                      </View>
                      <Text 
                        style={[
                          styles.subtaskTitle,
                          subtask.completed && styles.subtaskCompleted
                        ]}
                      >
                        {subtask.title}
                      </Text>
                    </TouchableOpacity>
                  </SwipeableRow>
                </Animated.View>
              ))}
            </View>
            
            <Animated.View 
              entering={FadeInUp.delay(600).duration(400)}
              style={styles.addSubtaskContainer}
            >
              <Button
                title="Add Subtask"
                icon="plus"
                variant="secondary"
                onPress={() => {}}
                style={styles.addSubtaskButton}
                animationType="spring"
              />
            </Animated.View>
          </Animated.View>
        )
        
      case 'comments':
        return (
          <Animated.View 
            entering={FadeIn.delay(100).duration(300)}
            style={[styles.section, styles.commentsSection]}
          >
            <Text style={styles.sectionTitle}>Comments</Text>
            
            <View style={styles.commentsList}>
              {comments.map((comment, index) => (
                <Animated.View 
                  key={comment.id}
                  entering={
                    comment.author.id === '1' 
                      ? SlideInRight.delay(200 + index * 100).duration(400) 
                      : SlideInLeft.delay(200 + index * 100).duration(400)
                  }
                  style={[
                    styles.commentContainer,
                    comment.author.id === '1' && styles.ownCommentContainer
                  ]}
                >
                  <View style={styles.commentHeader}>
                    <Avatar 
                      name={comment.author.name}
                      imageUrl={comment.author.imageUrl}
                      size={32}
                      ringColor={comment.author.id === '1' ? Colors.primary.blue : undefined}
                    />
                    <View style={styles.commentAuthorContainer}>
                      <Text style={styles.commentAuthor}>{comment.author.name}</Text>
                      <Text style={styles.commentTimestamp}>
                        {new Date(comment.timestamp).toLocaleString()}
                      </Text>
                    </View>
                  </View>
                  
                  <View 
                    style={[
                      styles.commentBubble,
                      comment.author.id === '1' 
                        ? styles.ownCommentBubble 
                        : styles.otherCommentBubble
                    ]}
                  >
                    <Text style={styles.commentText}>{comment.text}</Text>
                  </View>
                </Animated.View>
              ))}
            </View>
          </Animated.View>
        )
        
      case 'attachments':
        return (
          <Animated.View 
            entering={FadeIn.delay(100).duration(300)}
            style={styles.section}
          >
            <Text style={styles.sectionTitle}>Attachments</Text>
            
            <View style={styles.attachmentsList}>
              {attachments.map((attachment, index) => (
                <Animated.View 
                  key={attachment.id}
                  entering={FadeInDown.delay(200 + index * 100).duration(400)}
                >
                  <Card 
                    style={styles.attachmentCard}
                    animationType="scale"
                    onPress={() => {}}
                  >
                    <View style={styles.attachmentContent}>
                      <View 
                        style={[
                          styles.attachmentIconContainer,
                          attachment.type === 'image' && styles.imageIconContainer,
                          attachment.type === 'document' && styles.documentIconContainer
                        ]}
                      >
                        <Feather 
                          name={
                            attachment.type === 'image' 
                              ? 'image' 
                              : attachment.type === 'document' 
                                ? 'file-text' 
                                : 'link'
                          } 
                          size={20} 
                          color="#fff" 
                        />
                      </View>
                      
                      <View style={styles.attachmentDetails}>
                        <Text style={styles.attachmentName}>{attachment.name}</Text>
                        <Text style={styles.attachmentMeta}>{attachment.size}</Text>
                      </View>
                      
                      <TouchableOpacity style={styles.downloadButton}>
                        <Feather name="download" size={18} color={Colors.primary.blue} />
                      </TouchableOpacity>
                    </View>
                  </Card>
                </Animated.View>
              ))}
            </View>
            
            <Animated.View 
              entering={FadeInUp.delay(600).duration(400)}
              style={styles.addAttachmentContainer}
            >
              <Button
                title="Add Attachment"
                icon="paperclip"
                variant="secondary"
                onPress={() => {}}
                style={styles.addAttachmentButton}
                animationType="spring"
              />
            </Animated.View>
          </Animated.View>
        )
    }
  }
  
  // Render tab buttons
  const renderTab = (id: typeof activeTab, label: string, icon: keyof typeof Feather.glyphMap) => {
    const isActive = activeTab === id
    
    return (
      <TouchableOpacity 
        style={[styles.tabButton, isActive && styles.activeTabButton]} 
        onPress={() => setActiveTab(id)}
      >
        <Feather 
          name={icon} 
          size={16} 
          color={isActive ? Colors.primary.blue : Colors.neutrals.gray600} 
        />
        <Text 
          style={[
            styles.tabLabel, 
            isActive && styles.activeTabLabel
          ]}
        >
          {label}
        </Text>
      </TouchableOpacity>
    )
  }
  
  return (
    <View style={[styles.container, { paddingTop: insets.top }]}>
      <Animated.View style={[styles.header, headerAnimatedStyle]}>
        <View style={styles.headerControls}>
          <TouchableOpacity 
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Feather name="arrow-left" size={24} color="#fff" />
          </TouchableOpacity>
          
          <Animated.View style={headerTitleStyle}>
            <Text style={styles.headerTitle} numberOfLines={1}>
              {task.title}
            </Text>
          </Animated.View>
          
          <TouchableOpacity 
            style={styles.moreButton}
            onPress={() => {}}
          >
            <Feather name="more-vertical" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        
        <Animated.View style={[styles.headerContent, headerContentStyle]}>
          <Text style={styles.headerTaskTitle} numberOfLines={2}>
            {task.title}
          </Text>
          
          <View style={styles.taskMeta}>
            <StatusPill 
              label={
                task.status === 'in-progress' 
                  ? 'In Progress' 
                  : task.status === 'completed' 
                    ? 'Completed' 
                    : 'To Do'
              } 
              type={task.status as any} 
              style={styles.headerPill}
              small
            />
            
            <StatusPill 
              label={
                task.priority === 'high' 
                  ? 'High Priority' 
                  : task.priority === 'medium' 
                    ? 'Medium Priority' 
                    : 'Low Priority'
              } 
              priority={task.priority as any} 
              style={styles.headerPill}
              small
            />
          </View>
        </Animated.View>
      </Animated.View>
      
      <View style={styles.tabsContainer}>
        <ScrollView 
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabs}
        >
          {renderTab('details', 'Details', 'info')}
          {renderTab('subtasks', 'Subtasks', 'check-square')}
          {renderTab('comments', 'Comments', 'message-square')}
          {renderTab('attachments', 'Attachments', 'paperclip')}
        </ScrollView>
      </View>
      
      <ScrollView 
        style={styles.content}
        onScroll={handleScroll}
        scrollEventThrottle={16}
      >
        {renderTabContent()}
        
        <View style={{ height: 100 }} />
      </ScrollView>
      
      {activeTab === 'comments' && (
        <KeyboardAvoidingView
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          keyboardVerticalOffset={Platform.OS === 'ios' ? 100 : 20}
          style={styles.commentInputContainer}
        >
          <View style={styles.commentInputWrapper}>
            <TextInput
              ref={commentInputRef}
              style={styles.commentInput}
              placeholder="Type a comment..."
              value={newComment}
              onChangeText={setNewComment}
              multiline
            />
            
            <TouchableOpacity 
              style={[
                styles.sendButton,
                (!newComment.trim() || submittingComment) && styles.sendButtonDisabled
              ]}
              onPress={submitComment}
              disabled={!newComment.trim() || submittingComment}
            >
              {submittingComment ? (
                <ActivityIndicator size="small" color="#fff" />
              ) : (
                <Feather name="send" size={16} color="#fff" />
              )}
            </TouchableOpacity>
          </View>
        </KeyboardAvoidingView>
      )}
      
      <FAB
        onPress={() => {
          if (activeTab === 'subtasks') {
            // Logic to add subtask
          } else if (activeTab === 'attachments') {
            // Logic to add attachment
          } else {
            // Generic action
          }
        }}
        icon={
          activeTab === 'subtasks' 
            ? 'check-square' 
            : activeTab === 'attachments' 
              ? 'paperclip' 
              : 'edit'
        }
        position="bottomRight"
        gradientColors={[Colors.primary.blue, Colors.primary.darkBlue]}
      />
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    height: 250,
    backgroundColor: Colors.primary.blue,
    paddingHorizontal: Spacing.lg,
    paddingBottom: Spacing.lg,
    justifyContent: 'space-between'
  },
  headerControls: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    height: 56
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
    justifyContent: 'flex-end'
  },
  headerTaskTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: Spacing.sm
  },
  taskMeta: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  headerPill: {
    marginRight: Spacing.sm
  },
  tabsContainer: {
    paddingVertical: Spacing.sm,
    backgroundColor: Colors.neutrals.white,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 3,
    zIndex: 2
  },
  tabs: {
    paddingHorizontal: Spacing.lg
  },
  tabButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: Spacing.sm,
    paddingHorizontal: Spacing.md,
    borderRadius: 20,
    marginRight: Spacing.sm
  },
  activeTabButton: {
    backgroundColor: 'rgba(61, 90, 254, 0.1)'
  },
  tabLabel: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray600,
    marginLeft: Spacing.xs
  },
  activeTabLabel: {
    color: Colors.primary.blue
  },
  content: {
    flex: 1
  },
  section: {
    padding: Spacing.lg
  },
  metaSection: {
    marginBottom: Spacing.lg
  },
  metaItem: {
    marginBottom: Spacing.md
  },
  metaLabel: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray700,
    marginBottom: Spacing.xs
  },
  projectCard: {
    padding: Spacing.md
  },
  projectCardContent: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  projectIcon: {
    width: 32,
    height: 32,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm
  },
  projectName: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray900,
    flex: 1
  },
  pillsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: Spacing.xs
  },
  pill: {
    marginRight: Spacing.sm,
    marginBottom: Spacing.sm
  },
  activePill: {
    transform: [{ scale: 1.05 }]
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 8,
    padding: Spacing.md,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1
  },
  dueDate: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray900,
    marginLeft: Spacing.sm,
    flex: 1
  },
  editDateButton: {
    width: 28,
    height: 28,
    borderRadius: 14,
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  assigneesContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 8,
    padding: Spacing.md,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 1
  },
  addAssigneeButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 16,
    backgroundColor: 'rgba(61, 90, 254, 0.1)'
  },
  addAssigneeText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.primary.blue,
    marginLeft: 4
  },
  descriptionSection: {
    marginBottom: Spacing.lg
  },
  sectionTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.md
  },
  descriptionCard: {
    padding: Spacing.lg,
    backgroundColor: Colors.neutrals.white
  },
  description: {
    fontSize: Typography.sizes.body,
    lineHeight: 24,
    color: Colors.neutrals.gray800
  },
  editDescriptionButton: {
    position: 'absolute',
    top: 12,
    right: 12,
    width: 32,
    height: 32,
    borderRadius: 16,
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  subtasksHeader: {
    marginBottom: Spacing.md
  },
  subtasksProgress: {
    marginTop: Spacing.sm
  },
  progressTrack: {
    height: 6,
    backgroundColor: Colors.neutrals.gray200,
    borderRadius: 3,
    marginBottom: Spacing.xs,
    overflow: 'hidden'
  },
  progressFill: {
    height: '100%',
    backgroundColor: Colors.secondary.green,
    borderRadius: 3
  },
  progressText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  subtasksList: {
    marginBottom: Spacing.lg
  },
  subtaskItem: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 8,
    marginBottom: Spacing.sm,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  checkbox: {
    width: 24,
    height: 24,
    borderRadius: 6,
    borderWidth: 2,
    borderColor: Colors.primary.blue,
    marginRight: Spacing.md,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.blue
  },
  subtaskTitle: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray900,
    flex: 1
  },
  subtaskCompleted: {
    textDecorationLine: 'line-through',
    color: Colors.neutrals.gray500
  },
  addSubtaskContainer: {
    alignItems: 'center'
  },
  addSubtaskButton: {
    minWidth: 160
  },
  commentsSection: {
    paddingBottom: 80
  },
  commentsList: {
    marginBottom: Spacing.lg
  },
  commentContainer: {
    marginBottom: Spacing.md,
    maxWidth: '80%'
  },
  ownCommentContainer: {
    alignSelf: 'flex-end'
  },
  commentHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 4
  },
  commentAuthorContainer: {
    marginLeft: Spacing.sm
  },
  commentAuthor: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900
  },
  commentTimestamp: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  commentBubble: {
    padding: Spacing.md,
    borderRadius: 16,
    marginTop: 4
  },
  otherCommentBubble: {
    backgroundColor: Colors.neutrals.white,
    borderTopLeftRadius: 4,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1
  },
  ownCommentBubble: {
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
    borderTopRightRadius: 4
  },
  commentText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800,
    lineHeight: 22
  },
  commentInputContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.neutrals.white,
    borderTopWidth: 1,
    borderTopColor: Colors.neutrals.gray200,
    padding: Spacing.md
  },
  commentInputWrapper: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  commentInput: {
    flex: 1,
    backgroundColor: Colors.neutrals.gray100,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 10,
    fontSize: Typography.sizes.body,
    maxHeight: 100
  },
  sendButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: Spacing.sm
  },
  sendButtonDisabled: {
    backgroundColor: Colors.neutrals.gray400
  },
  attachmentsList: {
    marginBottom: Spacing.lg
  },
  attachmentCard: {
    marginBottom: Spacing.sm
  },
  attachmentContent: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md
  },
  attachmentIconContainer: {
    width: 40,
    height: 40,
    borderRadius: 8,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  imageIconContainer: {
    backgroundColor: Colors.secondary.green
  },
  documentIconContainer: {
    backgroundColor: Colors.primary.blue
  },
  attachmentDetails: {
    flex: 1
  },
  attachmentName: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900,
    marginBottom: 2
  },
  attachmentMeta: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600
  },
  downloadButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  addAttachmentContainer: {
    alignItems: 'center'
  },
  addAttachmentButton: {
    minWidth: 180
  }
})

export default TaskDetailsScreen