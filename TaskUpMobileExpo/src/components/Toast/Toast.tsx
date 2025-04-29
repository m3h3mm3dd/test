import React, { useEffect } from 'react'
import { StyleSheet, Text, View } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { ToastProps } from '../../types/UITypes'
import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'

interface ToastComponentProps extends ToastProps {
  onDismiss: () => void
}

const Toast = ({ message, type, duration = 3000, onDismiss }: ToastComponentProps) => {
  const translateY = useSharedValue(-100)
  const opacity = useSharedValue(0)

  useEffect(() => {
    // Trigger haptic feedback based on toast type
    switch (type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success)
        break
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error)
        break
      case 'info':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
        break
    }

    // Animate in
    translateY.value = withTiming(0, { duration: 300 })
    opacity.value = withTiming(1, { duration: 300 })

    // Set dismiss timer
    const dismissTimer = setTimeout(() => {
      dismiss()
    }, duration)

    return () => {
      clearTimeout(dismissTimer)
    }
  }, [])

  const dismiss = () => {
    translateY.value = withTiming(-100, { duration: 300 })
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onDismiss)()
    })
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value
    }
  })

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.success
      case 'error':
        return Colors.error
      case 'info':
      default:
        return Colors.info
    }
  }

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        animatedStyle
      ]}
      accessible={true}
      accessibilityRole="alert"
    >
      <Text style={styles.message}>{message}</Text>
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    padding: 16,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    shadowColor: Colors.neutrals.black,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 8,
    elevation: 4
  },
  message: {
    flex: 1,
    color: Colors.neutrals.white,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium
  }
})

export default Toast