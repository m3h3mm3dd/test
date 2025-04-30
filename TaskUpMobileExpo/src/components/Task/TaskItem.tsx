import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  TouchableOpacity, 
  Platform
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  Extrapolation,
  interpolate,
  withSpring,
  FadeIn,
  Layout
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { PanGestureHandler } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Spacing from '../../theme/Spacing';
import { formatDateString } from '../../utils/helpers';
import AvatarStack from '../Avatar/AvatarStack';
import { triggerImpact } from '../../utils/HapticUtils';
import StatusPill from '../StatusPill';
import { useTheme } from '../../hooks/useColorScheme';

interface User {
  id: string;
  name: string;
  imageUrl?: string | null;
}

interface Task {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'in-progress' | 'completed' | 'blocked' | 'review';
  dueDate: string;
  priority: 'low' | 'medium' | 'high' | 'critical';
  project: string;
  assignees: User[];
}

interface TaskItemProps {
  task: Task;
  onPress?: () => void;
  onStatusChange?: (id: string, status: string) => void;
  index?: number;
  disableSwipe?: boolean;
}

const TaskItem = ({ 
  task, 
  onPress, 
  onStatusChange,
  index = 0,
  disableSwipe = false
}: TaskItemProps) => {
  const { colors, isDark } = useTheme();
  const isOverdue = new Date(task.dueDate) < new Date() && task.status !== 'completed';
  const isPriorityHigh = task.priority === 'high' || task.priority === 'critical';
  
  // Animation values
  const cardScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const priorityPulse = useSharedValue(1);
  const translateX = useSharedValue(0);
  const swipeProgress = useSharedValue(0);
  const elevation = useSharedValue(isDark ? 2 : 3);
  const shimmerPosition = useSharedValue(-300);
  
  useEffect(() => {
    // Entrance animation with staggered delay based on index
    cardOpacity.value = withTiming(1, { 
      duration: 500,
      easing: Easing.out(Easing.quad)
    });
    
    // Animate priority indicator for high priority overdue tasks
    if (isOverdue && isPriorityHigh) {
      priorityPulse.value = withRepeat(
        withSequence(
          withTiming(1.4, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    } else {
      priorityPulse.value = 1;
    }
    
    // Subtle shimmer animation for cards
    shimmerPosition.value = withRepeat(
      withTiming(300, { duration: 2500, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
    
    return () => {
      // Clean up animations
      cardOpacity.value = withTiming(0, { duration: 200 });
    };
  }, [isOverdue, isPriorityHigh]);
  
  const handlePressIn = () => {
    cardScale.value = withTiming(0.98, { duration: 100 });
    elevation.value = withTiming(isDark ? 4 : 6, { duration: 100 });
  };
  
  const handlePressOut = () => {
    cardScale.value = withSpring(1, { damping: 12, stiffness: 150 });
    elevation.value = withTiming(isDark ? 2 : 3, { duration: 200 });
  };
  
  const handlePress = () => {
    if (onPress) {
      triggerImpact(Haptics.ImpactFeedbackStyle.Light);
      onPress();
    }
  };
  
  const onGestureEvent = ({ nativeEvent }) => {
    if (disableSwipe) return;
    
    // Update swipe progress
    const maxSwipe = 80;
    const clampedX = Math.min(Math.max(nativeEvent.translationX, -maxSwipe), maxSwipe);
    translateX.value = clampedX;
    
    // Calculate progress for background actions
    swipeProgress.value = Math.abs(clampedX) / maxSwipe;
  };
  
  const onGestureEnd = ({ nativeEvent }) => {
    if (disableSwipe) return;
    
    // Check if swipe should trigger action (more than 60% complete)
    const triggerAction = Math.abs(nativeEvent.translationX) > 60;
    
    if (triggerAction) {
      if (nativeEvent.translationX < 0) {
        // Swiped left - mark as completed
        triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
        
        if (onStatusChange) {
          const newStatus = task.status === 'completed' ? 'in-progress' : 'completed';
          onStatusChange(task.id, newStatus);
        }
      } else {
        // Swiped right - other action like favorite
        triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
      }
    }
    
    // Reset position with spring animation
    translateX.value = withSpring(0, { 
      damping: 15, 
      stiffness: 150,
      mass: 0.6
    });
    
    // Reset swipe progress
    swipeProgress.value = withTiming(0, { duration: 300 });
  };
  
  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: cardScale.value },
        { translateX: translateX.value }
      ],
      opacity: cardOpacity.value,
      shadowOpacity: interpolate(
        cardScale.value,
        [0.98, 1],
        [0.1, 0.15],
        Extrapolation.CLAMP
      ),
      elevation: elevation.value
    };
  });
  
  const priorityAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: priorityPulse.value }]
    };
  });
  
  const leftActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.max(0, -translateX.value),
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP
    );
    
    return { opacity };
  });
  
  const rightActionStyle = useAnimatedStyle(() => {
    const opacity = interpolate(
      Math.max(0, translateX.value),
      [0, 60],
      [0, 1],
      Extrapolation.CLAMP
    );
    
    return { opacity };
  });
  
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerPosition.value }]
    };
  });
  
  const getPriorityColor = () => {
    switch (task.priority) {
      case 'critical':
        return Colors.error[500];
      case 'high':
        return Colors.warning[500];
      case 'medium':
        return Colors.warning[300];
      case 'low':
      default:
        return Colors.success[500];
    }
  };
  
  const getStatusIcon = () => {
    switch (task.status) {
      case 'completed':
        return 'check-circle';
      case 'in-progress':
        return 'clock';
      case 'blocked':
        return 'alert-circle';
      case 'review':
        return 'eye';
      case 'pending':
      default:
        return 'circle';
    }
  };
  
  const getStatusLabel = () => {
    switch (task.status) {
      case 'completed':
        return 'Completed';
      case 'in-progress':
        return 'In Progress';
      case 'blocked':
        return 'Blocked';
      case 'review':
        return 'In Review';
      case 'pending':
      default:
        return 'To Do';
    }
  };

  return (
    <View 
      style={styles.container}
      accessible={true}
      accessibilityLabel={`Task: ${task.title}, Status: ${getStatusLabel()}, Priority: ${task.priority}, Due: ${formatDateString(task.dueDate)}`}
    >
      <Animated.View style={[styles.leftActionContainer, leftActionStyle]}>
        <View style={[styles.actionButton, { backgroundColor: Colors.success[500] }]}>
          <Feather name="check" size={20} color="#fff" />
          <Text style={styles.actionText}>
            {task.status === 'completed' ? 'Reopen' : 'Complete'}
          </Text>
        </View>
      </Animated.View>
      
      <Animated.View style={[styles.rightActionContainer, rightActionStyle]}>
        <View style={[styles.actionButton, { backgroundColor: colors.primary[500] }]}>
          <Feather name="star" size={20} color="#fff" />
          <Text style={styles.actionText}>Prioritize</Text>
        </View>
      </Animated.View>
      
      <PanGestureHandler 
        onGestureEvent={onGestureEvent}
        onEnded={onGestureEnd}
        enabled={!disableSwipe}
      >
        <Animated.View 
          style={[
            styles.card, 
            { backgroundColor: isDark ? colors.card.background : colors.neutrals.white },
            cardAnimatedStyle
          ]}
          entering={FadeIn.delay(index * 80).duration(300)}
          layout={Layout.springify().damping(14)}
        >
          <TouchableOpacity
            activeOpacity={0.9}
            onPress={handlePress}
            onPressIn={handlePressIn}
            onPressOut={handlePressOut}
            style={styles.cardTouchable}
          >
            {/* Shimmer effect */}
            <Animated.View style={[styles.shimmer, shimmerStyle]}>
              <View style={styles.shimmerContent} />
            </Animated.View>
            
            <View style={styles.header}>
              <View style={styles.titleContainer}>
                <Animated.View 
                  style={[
                    styles.priorityIndicator, 
                    { backgroundColor: getPriorityColor() },
                    priorityAnimatedStyle
                  ]} 
                />
                <Text 
                  style={[
                    styles.title, 
                    { color: isDark ? colors.text.primary : colors.neutrals.gray900 }
                  ]} 
                  numberOfLines={1}
                >
                  {task.title}
                </Text>
              </View>
              
              <StatusPill 
                label={getStatusLabel()}
                type={task.status}
                icon={getStatusIcon()}
                small
              />
            </View>
            
            <Text 
              style={[
                styles.description,
                { color: isDark ? colors.text.secondary : colors.neutrals.gray700 }
              ]} 
              numberOfLines={2}
            >
              {task.description}
            </Text>
            
            <View style={styles.footer}>
              <View style={styles.projectContainer}>
                <Feather 
                  name="folder" 
                  size={14} 
                  color={isDark ? colors.text.secondary : colors.neutrals.gray600} 
                />
                <Text 
                  style={[
                    styles.projectText,
                    { color: isDark ? colors.text.secondary : colors.neutrals.gray600 }
                  ]}
                >
                  {task.project}
                </Text>
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
                    color={isOverdue ? Colors.error[500] : 
                      isDark ? colors.text.secondary : colors.neutrals.gray600} 
                  />
                  <Text 
                    style={[
                      styles.dueDateText,
                      { color: isDark ? colors.text.secondary : colors.neutrals.gray600 },
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
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    height: 130,
    marginBottom: 12
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
  actionText: {
    color: '#fff',
    fontWeight: Typography.weights.medium,
    fontSize: Typography.sizes.sm,
    marginLeft: 8
  },
  card: {
    backgroundColor: Colors.neutrals.white,
    borderRadius: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3
      }
    }),
    height: '100%'
  },
  cardTouchable: {
    padding: Spacing.md,
    flex: 1,
    overflow: 'hidden',
    borderRadius: 16
  },
  shimmer: {
    position: 'absolute',
    left: 0,
    top: 0,
    width: 600,
    height: '100%',
  },
  shimmerContent: {
    width: '30%',
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.03)',
    transform: [{ skewX: '-15deg' }]
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
    color: Colors.error[500],
    fontWeight: Typography.weights.medium
  }
});

export default TaskItem;