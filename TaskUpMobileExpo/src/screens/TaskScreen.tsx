import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  ScrollView,
  TouchableOpacity,
  Keyboard,
  Alert,
  Dimensions,
  Platform
} from 'react-native'
import Animated, { 
  FadeIn, 
  SlideInRight, 
  SlideInUp,
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSequence,
  withSpring,
  interpolateColor,
  Extrapolation,
  interpolate,
  Layout
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import * as Haptics from 'expo-haptics'
import { Feather } from '@expo/vector-icons'
import { BlurView } from 'expo-blur'
import { LinearGradient } from 'expo-linear-gradient'

import Colors from '../theme/Colors'
import Typography from '../theme/Typography'
import Spacing from '../theme/Spacing'
import Input from '../components/Input/Input'
import Button from '../components/Button/Button'
import Checkbox from '../components/Checkbox/Checkbox'
import Card from '../components/Card'
import StatusPill from '../components/StatusPill'
import AvatarStack from '../components/Avatar/AvatarStack'
import { triggerImpact, triggerResult } from '../utils/HapticUtils'
import { formatDateString } from '../utils/helpers'

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)
const { width, height } = Dimensions.get('window')

// Enums for task priority and status
enum TaskPriority {
  LOW = 'low',
  MEDIUM = 'medium',
  HIGH = 'high'
}

enum TaskStatus {
  TODO = 'todo',
  IN_PROGRESS = 'in-progress',
  COMPLETED = 'completed'
}

// Sample projects data (in a real app this would come from an API)
const SAMPLE_PROJECTS = [
  { id: '1', name: 'Mobile App Redesign', color: Colors.primary.blue },
  { id: '2', name: 'Website Development', color: Colors.secondary.green },
  { id: '3', name: 'Market Research', color: '#9C27B0' },
  { id: '4', name: 'Marketing Campaign', color: '#FF9800' }
]

// Sample users data (in a real app this would come from an API)
const SAMPLE_USERS = [
  { id: '1', name: 'Alex Johnson', imageUrl: null },
  { id: '2', name: 'Morgan Smith', imageUrl: null },
  { id: '3', name: 'Jamie Parker', imageUrl: null },
  { id: '4', name: 'Taylor Reed', imageUrl: null },
  { id: '5', name: 'Jordan Casey', imageUrl: null }
]

const TaskScreen = ({ navigation, route }) => {
  const { taskId, isNew } = route.params || {}
  const insets = useSafeAreaInsets()
  
  // Refs
  const scrollViewRef = useRef(null)
  
  // State
  const [task, setTask] = useState({
    id: taskId || `new-${Date.now()}`,
    title: '',
    description: '',
    dueDate: '',
    priority: TaskPriority.MEDIUM,
    status: TaskStatus.TODO,
    projectId: '',
    projectName: '',
    projectColor: '',
    assignees: []
  })
  const [errors, setErrors] = useState({
    title: '',
    dueDate: ''
  })
  const [isSaving, setIsSaving] = useState(false)
  const [showDatePicker, setShowDatePicker] = useState(false)
  const [showProjectPicker, setShowProjectPicker] = useState(false)
  const [showAssigneePicker, setShowAssigneePicker] = useState(false)
  
  // Animation values
  const saveProgress = useSharedValue(0)
  const headerHeight = useSharedValue(100)
  const formOpacity = useSharedValue(0)
  const cardScale = useSharedValue(1)
  const gradientPosition = useSharedValue({ x: 0, y: 0 })
  const gradientScale = useSharedValue(1)
  
  // Load task data if editing
  useEffect(() => {
    if (taskId && !isNew) {
      // Simulate fetching task data
      setTimeout(() => {
        setTask({
          id: taskId,
          title: 'Complete mobile design',
          description: 'Finish the design for the mobile application including all screens and components',
          dueDate: '2025-05-10',
          priority: TaskPriority.HIGH,
          status: TaskStatus.IN_PROGRESS,
          projectId: '1',
          projectName: 'Mobile App Redesign',
          projectColor: Colors.primary.blue,
          assignees: [
            { id: '2', name: 'Morgan Smith', imageUrl: null }
          ]
        })
      }, 300)
    }
    
    // Animate form entrance
    formOpacity.value = withTiming(1, { duration: 600 })
    
    // Animate gradient
    const intervalId = setInterval(() => {
      gradientPosition.value = {
        x: Math.random() * width,
        y: Math.random() * height / 2
      }
      gradientScale.value = withTiming(1 + Math.random() * 0.5, { duration: 10000 })
    }, 10000)
    
    // Detect keyboard to adjust UI
    const keyboardDidShow = Keyboard.addListener('keyboardDidShow', () => {
      headerHeight.value = withTiming(70, { duration: 300 })
      if (scrollViewRef.current) {
        scrollViewRef.current.scrollTo({ y: 50, animated: true })
      }
    })
    
    const keyboardDidHide = Keyboard.addListener('keyboardDidHide', () => {
      headerHeight.value = withTiming(100, { duration: 300 })
    })
    
    return () => {
      clearInterval(intervalId)
      keyboardDidShow.remove()
      keyboardDidHide.remove()
    }
  }, [taskId, isNew])
  
  // Form field change handler
  const handleChange = (field, value) => {
    // Clear error when field is edited
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }))
    }
    
    setTask(prev => ({ ...prev, [field]: value }))
  }
  
  // Toggle task completion
  const handleToggleComplete = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    setTask(prev => {
      const newStatus = prev.status === TaskStatus.COMPLETED 
        ? TaskStatus.IN_PROGRESS 
        : TaskStatus.COMPLETED
        
      return { ...prev, status: newStatus }
    })
  }
  
  // Set task priority
  const handleSetPriority = (priority) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    setTask(prev => ({ ...prev, priority }))
  }
  
  // Select project
  const handleSelectProject = (project) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    setTask(prev => ({ 
      ...prev, 
      projectId: project.id, 
      projectName: project.name,
      projectColor: project.color
    }))
    
    setShowProjectPicker(false)
  }
  
  // Toggle assignee selection
  const handleToggleAssignee = (user) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    setTask(prev => {
      const isAlreadyAssigned = prev.assignees.some(a => a.id === user.id)
      
      if (isAlreadyAssigned) {
        // Remove user
        return {
          ...prev,
          assignees: prev.assignees.filter(a => a.id !== user.id)
        }
      } else {
        // Add user
        return {
          ...prev,
          assignees: [...prev.assignees, user]
        }
      }
    })
  }
  
  // Validate form before saving
  const validateForm = () => {
    const newErrors = {
      title: '',
      dueDate: ''
    }
    
    let isValid = true
    
    if (!task.title.trim()) {
      newErrors.title = 'Title is required'
      isValid = false
    }
    
    if (!task.dueDate) {
      newErrors.dueDate = 'Due date is required'
      isValid = false
    } else {
      // Simple date validation (a more thorough validation would be needed in a real app)
      const dateRegex = /^\d{4}-\d{2}-\d{2}$/
      if (!dateRegex.test(task.dueDate)) {
        newErrors.dueDate = 'Invalid date format (YYYY-MM-DD)'
        isValid = false
      }
    }
    
    setErrors(newErrors)
    return isValid
  }
  
  // Save task
  const handleSave = async () => {
    if (!validateForm()) {
      triggerImpact(Haptics.ImpactFeedbackStyle.Heavy)
      
      // Animate card shake to indicate error
      cardScale.value = withSequence(
        withTiming(0.98, { duration: 100 }),
        withTiming(1.01, { duration: 100 }),
        withTiming(0.99, { duration: 100 }),
        withSpring(1)
      )
      
      return
    }
    
    setIsSaving(true)
    saveProgress.value = 0
    
    // Animate progress
    saveProgress.value = withTiming(1, { duration: 1500 })
    
    // Simulate API call
    setTimeout(() => {
      triggerResult(true)
      setIsSaving(false)
      
      // Show success feedback
      cardScale.value = withSequence(
        withTiming(0.95, { duration: 100 }),
        withSpring(1.02, { damping: 15 }),
        withTiming(1, { duration: 200 })
      )
      
      // Navigate back after success animation
      setTimeout(() => {
        navigation.goBack()
      }, 300)
    }, 1500)
  }
  
  // Handle cancel
  const handleCancel = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    if (task.title || task.description || task.dueDate) {
      Alert.alert(
        'Discard Changes',
        'Are you sure you want to discard your changes?',
        [
          { text: 'Keep Editing', style: 'cancel' },
          { 
            text: 'Discard', 
            style: 'destructive',
            onPress: () => navigation.goBack()
          }
        ]
      )
    } else {
      navigation.goBack()
    }
  }
  
  // Set due date with a sample date picker interface (simplified for this example)
  const handleSetDueDate = (dateString) => {
    handleChange('dueDate', dateString)
    setShowDatePicker(false)
  }
  
  // Animated styles
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: headerHeight.value,
      opacity: interpolate(
        headerHeight.value,
        [70, 100],
        [0.8, 1],
        Extrapolation.CLAMP
      )
    }
  })
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            formOpacity.value,
            [0, 1],
            [50, 0],
            Extrapolation.CLAMP
          ) 
        }
      ]
    }
  })
  
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: cardScale.value }]
    }
  })
  
  const saveButtonAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: isSaving 
        ? interpolate(
            saveProgress.value,
            [0, 1],
            [150, 150], // Same width during animation for a loading effect
            Extrapolation.CLAMP
          )
        : 150
    }
  })
  
  const gradientAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: gradientPosition.value.x },
        { translateY: gradientPosition.value.y },
        { scale: gradientScale.value }
      ]
    }
  })
  
  const renderDatePicker = () => {
    // In a real app, you'd use a proper date picker like react-native-date-picker
    // This is a simplified example
    const today = new Date()
    const tomorrow = new Date(today)
    tomorrow.setDate(tomorrow.getDate() + 1)
    const nextWeek = new Date(today)
    nextWeek.setDate(nextWeek.getDate() + 7)
    
    const formatDate = (date) => {
      return date.toISOString().split('T')[0] // YYYY-MM-DD format
    }
    
    return (
      <Card style={styles.pickerCard}>
        <Text style={styles.pickerTitle}>Select Due Date</Text>
        
        <TouchableOpacity 
          style={styles.pickerOption}
          onPress={() => handleSetDueDate(formatDate(today))}
        >
          <Feather name="calendar" size={16} color={Colors.primary.blue} />
          <Text style={styles.pickerOptionText}>Today</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.pickerOption}
          onPress={() => handleSetDueDate(formatDate(tomorrow))}
        >
          <Feather name="calendar" size={16} color={Colors.primary.blue} />
          <Text style={styles.pickerOptionText}>Tomorrow</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={styles.pickerOption}
          onPress={() => handleSetDueDate(formatDate(nextWeek))}
        >
          <Feather name="calendar" size={16} color={Colors.primary.blue} />
          <Text style={styles.pickerOptionText}>Next Week</Text>
        </TouchableOpacity>
        
        <TouchableOpacity 
          style={[styles.pickerOption, styles.pickerOptionLast]}
          onPress={() => setShowDatePicker(false)}
        >
          <Feather name="x" size={16} color={Colors.secondary.red} />
          <Text style={[styles.pickerOptionText, { color: Colors.secondary.red }]}>Cancel</Text>
        </TouchableOpacity>
      </Card>
    )
  }
  
  const renderProjectPicker = () => {
    return (
      <Card style={styles.pickerCard}>
        <Text style={styles.pickerTitle}>Select Project</Text>
        
        {SAMPLE_PROJECTS.map(project => (
          <TouchableOpacity 
            key={project.id}
            style={styles.pickerOption}
            onPress={() => handleSelectProject(project)}
          >
            <View 
              style={[
                styles.projectColorDot, 
                { backgroundColor: project.color }
              ]} 
            />
            <Text style={styles.pickerOptionText}>{project.name}</Text>
          </TouchableOpacity>
        ))}
        
        <TouchableOpacity 
          style={[styles.pickerOption, styles.pickerOptionLast]}
          onPress={() => setShowProjectPicker(false)}
        >
          <Feather name="x" size={16} color={Colors.secondary.red} />
          <Text style={[styles.pickerOptionText, { color: Colors.secondary.red }]}>Cancel</Text>
        </TouchableOpacity>
      </Card>
    )
  }
  
  const renderAssigneePicker = () => {
    return (
      <Card style={styles.pickerCard}>
        <Text style={styles.pickerTitle}>Select Assignees</Text>
        
        {SAMPLE_USERS.map(user => {
          const isSelected = task.assignees.some(a => a.id === user.id)
          
          return (
            <TouchableOpacity 
              key={user.id}
              style={[
                styles.pickerOption,
                isSelected && styles.pickerOptionSelected
              ]}
              onPress={() => handleToggleAssignee(user)}
            >
              <View style={styles.assigneeOption}>
                <View style={styles.assigneeAvatar}>
                  <Text style={styles.assigneeInitials}>
                    {user.name.split(' ').map(n => n[0]).join('')}
                  </Text>
                </View>
                <Text style={styles.pickerOptionText}>{user.name}</Text>
              </View>
              
              {isSelected && (
                <Feather name="check" size={16} color={Colors.primary.blue} />
              )}
            </TouchableOpacity>
          )
        })}
        
        <TouchableOpacity 
          style={[styles.pickerOption, styles.pickerOptionLast]}
          onPress={() => setShowAssigneePicker(false)}
        >
          <Feather name="check-circle" size={16} color={Colors.primary.blue} />
          <Text style={[styles.pickerOptionText, { color: Colors.primary.blue }]}>
            Done ({task.assignees.length} selected)
          </Text>
        </TouchableOpacity>
      </Card>
    )
  }
  
  return (
    <View style={styles.container}>
      {/* Animated background gradient */}
      <View style={StyleSheet.absoluteFill}>
        <AnimatedLinearGradient
          colors={['rgba(61, 90, 254, 0.05)', 'rgba(33, 150, 243, 0.05)', 'rgba(0, 200, 83, 0.05)']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, gradientAnimatedStyle]}
        />
      </View>
      
      {/* Header */}
      <Animated.View 
        style={[
          styles.header, 
          headerAnimatedStyle,
          { paddingTop: insets.top }
        ]}
        entering={SlideInRight.delay(100).springify()}
      >
        <View style={styles.headerContent}>
          <TouchableOpacity 
            onPress={handleCancel}
            style={styles.backButton}
          >
            <Feather name="arrow-left" size={24} color={Colors.primary.blue} />
          </TouchableOpacity>
          
          <Text style={styles.title}>
            {isNew ? 'Create New Task' : 'Edit Task'}
          </Text>
          
          {!isNew && (
            <View style={styles.headerStatus}>
              <StatusPill 
                label={
                  task.status === TaskStatus.COMPLETED 
                    ? 'Completed' 
                    : task.status === TaskStatus.IN_PROGRESS 
                      ? 'In Progress' 
                      : 'To Do'
                }
                type={task.status as any}
                small
              />
            </View>
          )}
        </View>
      </Animated.View>
      
      {/* Main content */}
      <ScrollView 
        ref={scrollViewRef}
        style={styles.content}
        contentContainerStyle={[
          styles.contentContainer,
          { paddingBottom: insets.bottom + 100 }
        ]}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Animated.View 
          style={[styles.formContainer, formAnimatedStyle]}
          entering={FadeIn.duration(500)}
        >
          <Animated.View 
            style={[styles.cardContainer, cardAnimatedStyle]}
            layout={Layout.springify()}
          >
            <Card 
              style={styles.formCard}
              elevation={3}
            >
              {/* Task info section */}
              <Text style={styles.sectionTitle}>Task Information</Text>
              
              <Input
                label="Task Title"
                placeholder="Enter task title"
                value={task.title}
                onChangeText={(text) => handleChange('title', text)}
                error={errors.title}
                rightIcon={task.title ? "check" : undefined}
                required
              />
              
              <Input
                label="Description"
                placeholder="Enter task description"
                value={task.description}
                onChangeText={(text) => handleChange('description', text)}
                multiline
                numberOfLines={4}
              />
              
              <Input
                label="Due Date"
                placeholder="YYYY-MM-DD"
                value={task.dueDate}
                onChangeText={(text) => handleChange('dueDate', text)}
                error={errors.dueDate}
                rightIcon="calendar"
                onRightIconPress={() => setShowDatePicker(true)}
                required
              />
              
              {/* Priority selection */}
              <View style={styles.priorityContainer}>
                <Text style={styles.label}>Priority</Text>
                <View style={styles.priorityOptions}>
                  <TouchableOpacity 
                    style={[
                      styles.priorityOption,
                      task.priority === TaskPriority.LOW && styles.priorityOptionSelected,
                      { borderColor: Colors.success[500] }
                    ]}
                    onPress={() => handleSetPriority(TaskPriority.LOW)}
                  >
                    <Feather 
                      name="arrow-down" 
                      size={16} 
                      color={
                        task.priority === TaskPriority.LOW
                          ? Colors.success[500]
                          : Colors.neutrals.gray500
                      } 
                    />
                    <Text 
                      style={[
                        styles.priorityText,
                        task.priority === TaskPriority.LOW && {
                          color: Colors.success[500],
                          fontWeight: Typography.weights.bold
                        }
                      ]}
                    >
                      Low
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.priorityOption,
                      task.priority === TaskPriority.MEDIUM && styles.priorityOptionSelected,
                      { borderColor: Colors.warning[500] }
                    ]}
                    onPress={() => handleSetPriority(TaskPriority.MEDIUM)}
                  >
                    <Feather 
                      name="minus" 
                      size={16} 
                      color={
                        task.priority === TaskPriority.MEDIUM
                          ? Colors.warning[500]
                          : Colors.neutrals.gray500
                      } 
                    />
                    <Text 
                      style={[
                        styles.priorityText,
                        task.priority === TaskPriority.MEDIUM && {
                          color: Colors.warning[500],
                          fontWeight: Typography.weights.bold
                        }
                      ]}
                    >
                      Medium
                    </Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={[
                      styles.priorityOption,
                      task.priority === TaskPriority.HIGH && styles.priorityOptionSelected,
                      { borderColor: Colors.secondary.red }
                    ]}
                    onPress={() => handleSetPriority(TaskPriority.HIGH)}
                  >
                    <Feather 
                      name="arrow-up" 
                      size={16} 
                      color={
                        task.priority === TaskPriority.HIGH
                          ? Colors.secondary.red
                          : Colors.neutrals.gray500
                      } 
                    />
                    <Text 
                      style={[
                        styles.priorityText,
                        task.priority === TaskPriority.HIGH && {
                          color: Colors.secondary.red,
                          fontWeight: Typography.weights.bold
                        }
                      ]}
                    >
                      High
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
              
              {/* Project selection */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Project</Text>
                <TouchableOpacity 
                  style={styles.projectSelector}
                  onPress={() => setShowProjectPicker(true)}
                >
                  {task.projectId ? (
                    <View style={styles.selectedProject}>
                      <View 
                        style={[
                          styles.projectColorDot, 
                          { backgroundColor: task.projectColor }
                        ]} 
                      />
                      <Text style={styles.selectedProjectText}>
                        {task.projectName}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.placeholderText}>Select a project</Text>
                  )}
                  <Feather name="chevron-down" size={16} color={Colors.neutrals.gray500} />
                </TouchableOpacity>
              </View>
              
              {/* Assignees */}
              <View style={styles.fieldContainer}>
                <Text style={styles.label}>Assignees</Text>
                <TouchableOpacity 
                  style={styles.assigneeSelector}
                  onPress={() => setShowAssigneePicker(true)}
                >
                  {task.assignees.length > 0 ? (
                    <View style={styles.assigneesPreview}>
                      <AvatarStack 
                        users={task.assignees}
                        size={30}
                        maxDisplay={3}
                      />
                      <Text style={styles.assigneesCount}>
                        {task.assignees.length} {task.assignees.length === 1 ? 'person' : 'people'}
                      </Text>
                    </View>
                  ) : (
                    <Text style={styles.placeholderText}>Assign team members</Text>
                  )}
                  <Feather name="users" size={16} color={Colors.neutrals.gray500} />
                </TouchableOpacity>
              </View>
              
              {/* Completion status (for editing existing tasks) */}
              {!isNew && (
                <View style={styles.completedContainer}>
                  <Text style={styles.completedLabel}>
                    Mark as completed
                  </Text>
                  <Checkbox 
                    checked={task.status === TaskStatus.COMPLETED} 
                    onToggle={handleToggleComplete}
                    animationType="bounce"
                    activeColor={Colors.secondary.green}
                  />
                </View>
              )}
            </Card>
          </Animated.View>
          
          {/* Date picker */}
          {showDatePicker && renderDatePicker()}
          
          {/* Project picker */}
          {showProjectPicker && renderProjectPicker()}
          
          {/* Assignee picker */}
          {showAssigneePicker && renderAssigneePicker()}
        </Animated.View>
      </ScrollView>
      
      {/* Footer */}
      <Animated.View 
        style={[
          styles.footer,
          { paddingBottom: insets.bottom + 16 }
        ]}
        entering={SlideInUp.delay(600).springify()}
      >
        {Platform.OS === 'ios' && (
          <BlurView
            style={StyleSheet.absoluteFill}
            blurType="light"
            blurAmount={20}
          />
        )}
        <View style={styles.footerBackground} />
        
        <View style={styles.buttonContainer}>
          <Button
            title="Cancel"
            onPress={handleCancel}
            variant="secondary"
            style={styles.cancelButton}
            animationType="spring"
          />
          
          <Animated.View style={saveButtonAnimatedStyle}>
            <Button
              title={isSaving ? "Saving..." : "Save Task"}
              onPress={handleSave}
              loading={isSaving}
              disabled={isSaving}
              variant="primary"
              icon={isSaving ? undefined : "check"}
              animationType="bounce"
              gradientColors={[Colors.primary[400], Colors.primary[700]]}
            />
          </Animated.View>
        </View>
      </Animated.View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  header: {
    paddingHorizontal: Spacing.lg,
    borderBottomWidth: 1,
    borderBottomColor: 'rgba(0, 0, 0, 0.05)',
    backgroundColor: Colors.background.light,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 4,
    zIndex: 10
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    height: '100%'
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(61, 90, 254, 0.1)'
  },
  title: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginLeft: Spacing.md,
    flex: 1
  },
  headerStatus: {
    marginLeft: Spacing.md
  },
  content: {
    flex: 1
  },
  contentContainer: {
    padding: Spacing.lg
  },
  formContainer: {
    width: '100%'
  },
  cardContainer: {
    width: '100%',
    marginBottom: Spacing.lg
  },
  formCard: {
    borderRadius: 16,
    padding: Spacing.lg
  },
  sectionTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.md
  },
  priorityContainer: {
    marginBottom: Spacing.lg
  },
  label: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray800,
    marginBottom: Spacing.sm
  },
  priorityOptions: {
    flexDirection: 'row',
    justifyContent: 'space-between'
  },
  priorityOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray300,
    borderRadius: 8,
    flex: 1,
    marginHorizontal: 4,
    justifyContent: 'center'
  },
  priorityOptionSelected: {
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderWidth: 2
  },
  priorityText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700,
    marginLeft: 6
  },
  fieldContainer: {
    marginBottom: Spacing.lg
  },
  projectSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray300,
    borderRadius: 8,
    height: 56
  },
  selectedProject: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  projectColorDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginRight: Spacing.sm
  },
  selectedProjectText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray900
  },
  placeholderText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray500
  },
  assigneeSelector: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: Spacing.md,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray300,
    borderRadius: 8,
    height: 56
  },
  assigneesPreview: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  assigneesCount: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray900,
    marginLeft: Spacing.sm
  },
  completedContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: Spacing.md,
    backgroundColor: 'rgba(0, 0, 0, 0.03)',
    borderRadius: 8,
    padding: Spacing.md
  },
  completedLabel: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800,
    fontWeight: Typography.weights.medium
  },
  footer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    paddingTop: Spacing.md,
    paddingHorizontal: Spacing.lg
  },
  footerBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Platform.OS === 'ios' ? 'rgba(255, 255, 255, 0.7)' : Colors.background.light,
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.05)',
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  cancelButton: {
    marginRight: Spacing.md,
    width: 100
  },
  pickerCard: {
    borderRadius: 16,
    marginTop: Spacing.md,
    padding: Spacing.md
  },
  pickerTitle: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray800,
    marginBottom: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200,
    paddingBottom: Spacing.sm
  },
  pickerOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray100
  },
  pickerOptionSelected: {
    backgroundColor: 'rgba(61, 90, 254, 0.05)'
  },
  pickerOptionLast: {
    borderBottomWidth: 0
  },
  pickerOptionText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray800,
    marginLeft: Spacing.sm
  },
  assigneeOption: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  assigneeAvatar: {
    width: 30,
    height: 30,
    borderRadius: 15,
    backgroundColor: Colors.primary[500],
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.sm
  },
  assigneeInitials: {
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  }
})

export default TaskScreen