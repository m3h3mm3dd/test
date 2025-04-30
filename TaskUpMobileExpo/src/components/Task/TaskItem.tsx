import React, { useEffect } from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Dimensions 
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  Extrapolation,
  interpolate,
  withSpring
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import { PanGestureHandler } from 'react-native-gesture-handler'
import * as Haptics from 'expo-haptics'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Spacing from '../../theme/Spacing'
import { formatDateString } from '../../utils/helpers'
import AvatarStack from '../Avatar/AvatarStack'
import { triggerImpact } from '../../utils/HapticUtils'

interface User {
  id: string
  name: string
  imageUrl?: string | null
}

interface Task {
  id: string
  title: string
  description: string
  status: 'pending' | 'in-progress' | 'completed'
  dueDate: string
  priority: 'low' | 'medium' | 'high'
  project: string
  assignees: User[]
}

interface TaskItemProps {
  task: Task
  onPress?: () => void
  onStatusChange?: (id: string, status: string) => void
}

const { width } = Dimensions.get('window')

const TaskItem = ({ task, onPress, onStatusChange }: TaskItemProps) => {
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed'
  const isPriorityHigh = task.priority === 'high'
  
  // Animation values
  const cardScale = useSharedValue(1)
  const cardOpacity = useSharedValue(1)
  const priorityPulse = useSharedValue(1)
  const translateX = useSharedValue(0)
  const swipeLeftThreshold = width * -0.3
  const swipeRightThreshold = width * 0.3
  
  useEffect(() => {
    // Entrance animation
    cardScale.value = withSpring(1, { damping: 12, stiffness: 100 })
    
    // Animate priority indicator for high priority overdue tasks
    if (isOverdue && isPriorityHigh) {
      priorityPulse.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 800, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        true // Reverse
      )
    } else {
      priorityPulse.value = 1
    }
    
    return () => {
      // Clean up animations
      cardOpacity.value = withTiming(0, { duration: 200 })
    }
  }, [isOverdue, isPriorityHigh])
  
  const handlePressIn = () => {
    cardScale.value = withTiming(0.98, { duration: 100 })
  }
  
  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 12, stiffness: 150 })
  }
  
  const handlePress = () => {
    if (onPress) {
      triggerImpact(Haptics.ImpactFeedbackStyle.Light)
      onPress()
    }
  }
  
  const onGestureEvent = ({ nativeEvent }) => {
    // Limit the translation for visual cue but without resistance
    translateX.value = nativeEvent.translationX
  }
  
  const onGestureEnd = ({ nativeEvent }) => {
    // Check swipe distance and velocity
    const hasSwiped = 
      nativeEvent.translationX < swipeLeftThreshold || 
      nativeEvent.translationX > swipeRightThreshold ||
      Math.abs(nativeEvent.velocityX) > 800
    
    if (hasSwiped) {
      if (nativeEvent.translationX < 0) {
        // Swiped left - mark as completed
        triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
        translateX.value = withTiming(swipeLeftThreshold, { duration: 200 })
        
        if (onStatusChange) {
          const newStatus = task.status === 'completed' ? 'in-progress' : 'completed'
          setTimeout(() => {
            onStatusChange(task.id, newStatus)
            translateX.value = withTiming(0, { duration: 300 })
          }, 500)
        } else {
          // Reset position after animation
          setTimeout(() => {
            translateX.value = withTiming(0, { duration: 300 })
          }, 500)
        }
      } else {
        // Swiped right - archive or other action
        triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
        translateX.value = withTiming(swipeRightThreshold, { duration: 200 })
        
        // Reset position after animation
        setTimeout(() => {
          translateX.value = withTiming(0, { duration: 300 })
        }, 500)
      }
    } else {
      // Not swiped enough - reset position
      translateX.value = withTiming(0, { duration: 300 })
    }
  }
  
  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: cardScale.value },
        { translateX: translateX.value }
      ],
      opacity: cardOpacity.value
    }
  })
  
  const priorityAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: priorityPulse.value }]
    }
  })
  
  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [swipeLeftThreshold, 0],
      [1, 0],
      Extrapolation.CLAMP
    )
    
    return { opacity }
  })
  
  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      translateX.value,
      [0, swipeRightThreshold],
      [0, 1],
      Extrapolation.CLAMP
    )
    
    return { opacity }
  })
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'high':
        return Colors.secondary.red
      case 'medium':
        return Colors.warning
      case 'low':
      default:
        return Colors.secondary.green
    }
  }
  
  const getStatusColor = () => {
    switch (task.status) {
      case 'completed':
        return Colors.secondary.green
      case 'in-progress':
        return Colors.primary.blue
      case 'pending':
      default:
        return Colors.neutrals.gray400
    }
  }
  
  const getStatusLabel = () => {
    switch (task.status) {
      case 'completed':
        return 'Completed'
      case 'in-progress':
        return 'In Progress'
      case 'pending':
      default:
        return 'To Do'
    }
  }

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={`Task: ${task.title}, Status: ${getStatusLabel()}, Priority: ${task.priority}, Due: ${formatDateString(task.dueDate)}`}
    >
      <Animated.View style={[styles.leftActionContainer, leftActionStyle]}>
        <View style={[styles.actionButton, styles.completeAction]}>
          <Feather name="check" size={20} color="#fff" />
          <Text style={styles.actionText}>
            {task.status === 'completed' ? 'Uncomplete' : 'Complete'}
          </Text>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.rightActionContainer, rightActionStyle]}>
        <View style={[styles.actionButton, styles.archiveAction]}>
          <Feather name="archive" size={20} color="#fff" />
          <Text style={styles.actionText}>Archive</Text>
        </View>
      </Animated.View>
      
      <PanGestureHandler 
        onGestureEvent={onGestureEvent}
        onEnded={onGestureEnd}
      >
        <Animated.View style={[styles.card, cardAnimatedStyle]}>
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.cardTouchable}
          >
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Animated.View 
                  style={[
                    styles.priorityIndicator, 
                    { backgroundColor: getPriorityColor() },
                    priorityAnimatedStyle
                  ]} 
                />
                <Text style={styles.title} numberOfLines={1}>{task.title}</Text>
              </View>
              
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor() }]}>
                <Text style={styles.statusText}>{getStatusLabel()}</Text>
              </View>
            </View>
            
            <Text style={styles.description} numberOfLines={2}>
              {task.description}
            </Text>
            
            <View style={styles.footer}>
              <View style={styles.projectContainer}>
                <Feather name="folder" size={14} color={Colors.neutrals.gray600} />
                <Text style={styles.projectText}>{task.project}</Text>
              </View>
              
              <View style={styles.metaContainer}>
                <AvatarStack 
                  users={task.assignees}
                  size={24}
                  maxDisplay={2}
                />
                
                <View style={styles.dueDateContainer}>
                  <Feather 
                    name="calendar" 
                    size={14} 
                    color={isOverdue ? Colors.secondary.red : Colors.neutrals.gray600} 
                  />
                  <Text 
                    style={[
                      styles.dueDateText,
                      isOverdue && styles.overdueText
                    ]}
                  >
                    {formatDateString(task.dueDate)}
                  </Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        </Animated.View>
      </PanGestureHandler>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 130
  },
  leftActionContainer: {
    position: 'absolute',
    left: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center'
  },
  rightActionContainer: {
    position: 'absolute',
    right: 16,
    top: 0,
    bottom: 0,
    justifyContent: 'center'
  },
  actionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 12,
    borderRadius: 8
  },
  completeAction: {
    backgroundColor: Colors.secondary.green
  },
  archiveAction: {
    backgroundColor: Colors.neutrals.gray600
  },
  actionText: {
    color: '#fff',
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.bodySmall,
    marginLeft: 8
  },
  card: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 3,
    height: '100%'
  },
  cardTouchable: {
    padding: Spacing.md,
    flex: 1
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xs
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1
  },
  priorityIndicator: {
    width: 10,
    height: 10,
    borderRadius: 5,
    marginRight: Spacing.xs
  },
  title: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    flex: 1
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 4,
    marginLeft: Spacing.sm
  },
  statusText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.white
  },
  description: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700,
    marginBottom: Spacing.md,
    flex: 1
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  },
  projectContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  projectText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginLeft: 4
  },
  metaContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  dueDateContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: Spacing.sm
  },
  dueDateText: {
    fontSize: Typography.sizes.caption,
    color: Colors.neutrals.gray600,
    marginLeft: 4
  },
  overdueText: {
    color: Colors.secondary.red,
    fontWeight: Typography.weights.medium
  }
})

export default TaskItem