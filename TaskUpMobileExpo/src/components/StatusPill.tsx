import React, { useEffect } from 'react'
import { 
  StyleSheet, 
  Text, 
  View, 
  ViewStyle, 
  TextStyle,
  StyleProp
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  cancelAnimation
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'in-progress' | 'completed' | 'default'

type PriorityType = 'low' | 'medium' | 'high' | 'default'

interface StatusPillProps {
  label: string
  type?: StatusType
  priority?: PriorityType
  icon?: keyof typeof Feather.glyphMap
  animate?: boolean
  small?: boolean
  pill?: boolean
  style?: StyleProp<ViewStyle>
  textStyle?: StyleProp<TextStyle>
}

const StatusPill = ({
  label,
  type = 'default',
  priority,
  icon,
  animate = false,
  small = false,
  pill = true,
  style,
  textStyle
}: StatusPillProps) => {
  // Animation values
  const scale = useSharedValue(1)
  const opacity = useSharedValue(1)
  
  useEffect(() => {
    // Setup animation if animate is true
    if (animate) {
      // Different animation patterns based on status type
      if (type === 'error' || (priority && priority === 'high')) {
        // Pulsing animation for error and high priority
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Infinite repeat
          true // Reverse
        )
      } else if (type === 'warning' || (priority && priority === 'medium')) {
        // Subtle pulse for warnings and medium priority
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1, 
          true
        )
      } else if (type === 'pending') {
        // Fade animation for pending status
        opacity.value = withRepeat(
          withSequence(
            withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        )
      }
    }
    
    return () => {
      // Cleanup animations on unmount
      cancelAnimation(scale)
      cancelAnimation(opacity)
    }
  }, [animate, type, priority])
  
  // Determine background color based on type and priority
  const getBackgroundColor = () => {
    if (priority) {
      switch (priority) {
        case 'high':
          return 'rgba(213, 0, 0, 0.15)'
        case 'medium':
          return 'rgba(255, 171, 0, 0.15)'
        case 'low':
          return 'rgba(0, 200, 83, 0.15)'
        default:
          return 'rgba(155, 155, 155, 0.15)'
      }
    }
    
    switch (type) {
      case 'success':
      case 'completed':
        return 'rgba(0, 200, 83, 0.15)'
      case 'warning':
        return 'rgba(255, 171, 0, 0.15)'
      case 'error':
        return 'rgba(213, 0, 0, 0.15)'
      case 'info':
        return 'rgba(0, 184, 212, 0.15)'
      case 'pending':
        return 'rgba(155, 155, 155, 0.15)'
      case 'in-progress':
        return 'rgba(61, 90, 254, 0.15)'
      default:
        return 'rgba(155, 155, 155, 0.15)'
    }
  }
  
  // Determine text color based on type and priority
  const getTextColor = () => {
    if (priority) {
      switch (priority) {
        case 'high':
          return Colors.secondary.red
        case 'medium':
          return Colors.warning
        case 'low':
          return Colors.secondary.green
        default:
          return Colors.neutrals.gray700
      }
    }
    
    switch (type) {
      case 'success':
      case 'completed':
        return Colors.secondary.green
      case 'warning':
        return Colors.warning
      case 'error':
        return Colors.secondary.red
      case 'info':
        return Colors.info
      case 'pending':
        return Colors.neutrals.gray700
      case 'in-progress':
        return Colors.primary.blue
      default:
        return Colors.neutrals.gray700
    }
  }
  
  // Determine icon color (same as text color)
  const getIconColor = () => getTextColor()
  
  // Get border color (slightly darker than background)
  const getBorderColor = () => {
    const textColor = getTextColor()
    return textColor + '40' // Add 25% opacity
  }
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    }
  })
  
  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderRadius: pill ? 50 : 6,
          paddingVertical: small ? 4 : 6,
          paddingHorizontal: small ? 8 : 12
        },
        animatedStyle,
        style
      ]}
    >
      {icon && (
        <Feather 
          name={icon} 
          size={small ? 12 : 14} 
          color={getIconColor()} 
          style={styles.icon} 
        />
      )}
      
      <Text 
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: small ? Typography.sizes.caption : Typography.sizes.bodySmall
          },
          textStyle
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  text: {
    fontWeight: Typography.weights.medium
  },
  icon: {
    marginRight: 4
  }
})

export default StatusPill