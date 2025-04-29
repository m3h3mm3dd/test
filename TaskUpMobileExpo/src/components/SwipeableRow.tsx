import React, { useRef, useCallback } from 'react'
import { 
  StyleSheet, 
  View, 
  Text,
  TouchableOpacity, 
  Dimensions,
  ViewStyle
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  runOnJS,
  useDerivedValue,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { 
  PanGestureHandler, 
  PanGestureHandlerGestureEvent,
  TapGestureHandler
} from 'react-native-gesture-handler'
import { Feather } from '@expo/vector-icons'
import * as Haptics from 'expo-haptics'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import { triggerImpact } from '../../utils/HapticUtils'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const MAX_SWIPE_WIDTH = Math.min(SCREEN_WIDTH * 0.65, 250)

interface SwipeAction {
  icon: keyof typeof Feather.glyphMap
  label: string
  color: string
  onPress: () => void
  destructive?: boolean
}

interface SwipeableRowProps {
  children: React.ReactNode
  leftActions?: SwipeAction[]
  rightActions?: SwipeAction[]
  onSwipeStart?: () => void
  onSwipeEnd?: () => void
  friction?: number
  threshold?: number
  disabled?: boolean
  simultaneousHandlers?: React.RefObject<any>
  style?: ViewStyle
  containerStyle?: ViewStyle
}

const SwipeableRow = ({
  children,
  leftActions = [],
  rightActions = [],
  onSwipeStart,
  onSwipeEnd,
  friction = 1.5,
  threshold = 0.4,
  disabled = false,
  simultaneousHandlers,
  style,
  containerStyle
}: SwipeableRowProps) => {
  // Calculate action widths
  const leftActionsWidth = leftActions.length * 80
  const rightActionsWidth = rightActions.length * 80
  
  // Use maximum swipe width or actions width
  const maxLeftSwipe = Math.min(leftActionsWidth || 0, MAX_SWIPE_WIDTH)
  const maxRightSwipe = Math.min(rightActionsWidth || 0, MAX_SWIPE_WIDTH)
  
  // Animation values
  const translateX = useSharedValue(0)
  const prevTranslateX = useSharedValue(0)
  const isSwipeActive = useSharedValue(false)
  
  // Gesture handler refs
  const panRef = useRef(null)
  const tapRef = useRef(null)
  
  // Handle swipe completion
  const handleSwipeComplete = useCallback((direction: 'left' | 'right') => {
    const actions = direction === 'left' ? rightActions : leftActions
    if (actions.length === 0) return
    
    // Trigger haptic feedback
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    // If there's only one action, execute it
    if (actions.length === 1) {
      actions[0].onPress()
      resetPosition()
    }
  }, [leftActions, rightActions])
  
  // Reset row position
  const resetPosition = () => {
    translateX.value = withTiming(0, { duration: 200 })
    isSwipeActive.value = false
    prevTranslateX.value = 0
    
    if (onSwipeEnd) {
      onSwipeEnd()
    }
  }
  
  // Pan gesture handler
  const onGestureEvent = (event: PanGestureHandlerGestureEvent) => {
    if (disabled) return
    
    const { translationX, velocityX } = event.nativeEvent
    
    // Calculate drag with friction
    let dragX = translationX
    
    // Apply friction for over-drag
    if ((prevTranslateX.value === 0 && dragX > 0 && leftActions.length === 0) || 
        (prevTranslateX.value === 0 && dragX < 0 && rightActions.length === 0)) {
      // Disable swipe if no actions
      dragX = 0
    } else if (prevTranslateX.value > 0 && dragX + prevTranslateX.value > maxLeftSwipe) {
      // Apply friction when dragging beyond limit
      const overdrag = dragX + prevTranslateX.value - maxLeftSwipe
      dragX = translationX - overdrag / friction
    } else if (prevTranslateX.value < 0 && dragX + prevTranslateX.value < -maxRightSwipe) {
      // Apply friction when dragging beyond limit
      const overdrag = Math.abs(dragX + prevTranslateX.value) - maxRightSwipe
      dragX = translationX + overdrag / friction
    }
    
    // Update translateX
    translateX.value = prevTranslateX.value + dragX
    
    // Notify when swipe starts
    if (!isSwipeActive.value && Math.abs(translationX) > 10) {
      isSwipeActive.value = true
      if (onSwipeStart) {
        runOnJS(onSwipeStart)()
      }
    }
  }
  
  const onGestureEnd = (event: PanGestureHandlerGestureEvent) => {
    if (disabled) return
    
    const { translationX, velocityX } = event.nativeEvent
    const dragX = translationX
    
    // Calculate final position
    const finalTranslateX = prevTranslateX.value + dragX
    
    // Check if swipe exceeds threshold or has sufficient velocity
    const hasHighVelocity = Math.abs(velocityX) > 500
    
    if (finalTranslateX > 0) {
      // Right swipe
      if (leftActions.length === 0) {
        // No left actions, reset
        resetPosition()
      } else if (finalTranslateX > maxLeftSwipe * threshold || 
          (finalTranslateX > 40 && hasHighVelocity && velocityX > 0)) {
        // Open left actions
        translateX.value = withSpring(maxLeftSwipe, {
          velocity: velocityX,
          damping: 20,
          stiffness: 200
        }, () => {
          prevTranslateX.value = maxLeftSwipe
        })
      } else {
        // Not enough, reset
        resetPosition()
      }
    } else if (finalTranslateX < 0) {
      // Left swipe
      if (rightActions.length === 0) {
        // No right actions, reset
        resetPosition()
      } else if (Math.abs(finalTranslateX) > maxRightSwipe * threshold || 
          (Math.abs(finalTranslateX) > 40 && hasHighVelocity && velocityX < 0)) {
        // Open right actions
        translateX.value = withSpring(-maxRightSwipe, {
          velocity: velocityX,
          damping: 20,
          stiffness: 200
        }, () => {
          prevTranslateX.value = -maxRightSwipe
          
          // If full swipe, execute action
          if (Math.abs(velocityX) > 1000) {
            runOnJS(handleSwipeComplete)('left')
          }
        })
      } else {
        // Not enough, reset
        resetPosition()
      }
    } else {
      resetPosition()
    }
  }
  
  // Derive values for actions visibility and position
  const leftActionsProgress = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [0, maxLeftSwipe],
      [0, 1],
      Extrapolation.CLAMP
    )
  })
  
  const rightActionsProgress = useDerivedValue(() => {
    return interpolate(
      translateX.value,
      [-maxRightSwipe, 0],
      [1, 0],
      Extrapolation.CLAMP
    )
  })
  
  // Animated styles
  const rowStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }]
    }
  })
  
  const leftActionsStyle = useAnimatedStyle(() => {
    return {
      width: maxLeftSwipe,
      opacity: leftActionsProgress.value,
      transform: [
        { translateX: interpolate(
            leftActionsProgress.value,
            [0, 1],
            [-maxLeftSwipe / 2, 0],
            Extrapolation.CLAMP
          ) 
        }
      ]
    }
  })
  
  const rightActionsStyle = useAnimatedStyle(() => {
    return {
      width: maxRightSwipe,
      opacity: rightActionsProgress.value,
      transform: [
        { translateX: interpolate(
            rightActionsProgress.value,
            [0, 1],
            [maxRightSwipe / 2, 0],
            Extrapolation.CLAMP
          ) 
        }
      ]
    }
  })
  
  // Handle action button press
  const handleActionPress = (action: SwipeAction) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    resetPosition()
    action.onPress()
  }
  
  // Render left actions
  const renderLeftActions = () => {
    if (!leftActions.length) return null
    
    return (
      <Animated.View style={[styles.actionsContainer, styles.leftActionsContainer, leftActionsStyle]}>
        {leftActions.map((action, index) => (
          <TouchableOpacity
            key={`left-${index}`}
            style={[
              styles.actionButton,
              { backgroundColor: action.color }
            ]}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.8}
          >
            <Feather name={action.icon} size={18} color="#fff" />
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    )
  }
  
  // Render right actions
  const renderRightActions = () => {
    if (!rightActions.length) return null
    
    return (
      <Animated.View style={[styles.actionsContainer, styles.rightActionsContainer, rightActionsStyle]}>
        {rightActions.map((action, index) => (
          <TouchableOpacity
            key={`right-${index}`}
            style={[
              styles.actionButton,
              { backgroundColor: action.color }
            ]}
            onPress={() => handleActionPress(action)}
            activeOpacity={0.8}
          >
            <Feather name={action.icon} size={18} color="#fff" />
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        ))}
      </Animated.View>
    )
  }
  
  return (
    <View style={[styles.container, containerStyle]}>
      {renderLeftActions()}
      {renderRightActions()}
      
      <PanGestureHandler
        ref={panRef}
        simultaneousHandlers={[tapRef, simultaneousHandlers].filter(Boolean)}
        onGestureEvent={onGestureEvent}
        onEnded={onGestureEnd}
        enabled={!disabled}
      >
        <Animated.View style={[styles.rowContainer, rowStyle, style]}>
          <TapGestureHandler
            ref={tapRef}
            simultaneousHandlers={[panRef, simultaneousHandlers].filter(Boolean)}
            onActivated={resetPosition}
            enabled={!disabled}
          >
            <Animated.View>
              {children}
            </Animated.View>
          </TapGestureHandler>
        </Animated.View>
      </PanGestureHandler>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    overflow: 'hidden'
  },
  rowContainer: {
    zIndex: 2
  },
  actionsContainer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    flexDirection: 'row'
  },
  leftActionsContainer: {
    left: 0,
    justifyContent: 'flex-start'
  },
  rightActionsContainer: {
    right: 0,
    justifyContent: 'flex-end'
  },
  actionButton: {
    width: 80,
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center'
  },
  actionText: {
    color: Colors.neutrals.white,
    fontSize: Typography.sizes.caption,
    marginTop: 4,
    fontWeight: Typography.weights.medium
  }
})

export default SwipeableRow