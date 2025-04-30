import React, { useEffect } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation,
  Easing
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import Colors from '../../theme/Colors'

interface SkeletonLoaderProps {
  width: number | string
  height: number
  borderRadius?: number
  style?: ViewStyle
  shimmerColors?: string[]
}

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const SkeletonLoader = ({ 
  width, 
  height, 
  borderRadius = 4, 
  style,
  shimmerColors = [
    'rgba(0, 0, 0, 0.03)',
    'rgba(0, 0, 0, 0.07)',
    'rgba(0, 0, 0, 0.03)'
  ]
}: SkeletonLoaderProps) => {
  const shimmerPosition = useSharedValue(-100)
  const opacity = useSharedValue(0.6)

  useEffect(() => {
    // Main shimmer animation
    shimmerPosition.value = withRepeat(
      withTiming(100, { duration: 1200, easing: Easing.ease }),
      -1,
      false
    )
    
    // Subtle opacity animation for more natural look
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    )

    return () => {
      cancelAnimation(shimmerPosition)
      cancelAnimation(opacity)
    }
  }, [])

  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerPosition.value }]
    }
  })
  
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        containerStyle,
        style
      ]}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Loading content"
    >
      <AnimatedLinearGradient
        colors={shimmerColors}
        start={{ x: 0, y: 0.5 }}
        end={{ x: 1, y: 0.5 }}
        style={[styles.shimmer, shimmerStyle]}
      />
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.neutrals.gray200,
    overflow: 'hidden'
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    bottom: 0,
    left: 0,
    right: 0,
    width: '300%'
  }
})

export default SkeletonLoader