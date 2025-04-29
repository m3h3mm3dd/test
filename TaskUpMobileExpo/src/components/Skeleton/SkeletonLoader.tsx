import React, { useEffect } from 'react'
import { StyleSheet, View, ViewStyle } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withRepeat,
  withTiming,
  cancelAnimation
} from 'react-native-reanimated'
import Colors from '../../theme/Colors'

interface SkeletonLoaderProps {
  width: number | string
  height: number
  borderRadius?: number
  style?: ViewStyle
}

const SkeletonLoader = ({ width, height, borderRadius = 4, style }: SkeletonLoaderProps) => {
  const opacity = useSharedValue(0.5)

  useEffect(() => {
    opacity.value = withRepeat(
      withTiming(1, { duration: 1000 }),
      -1,
      true
    )

    return () => {
      cancelAnimation(opacity)
    }
  }, [])

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  return (
    <Animated.View
      style={[
        styles.skeleton,
        { width, height, borderRadius },
        animatedStyle,
        style
      ]}
      accessible={true}
      accessibilityRole="none"
      accessibilityLabel="Loading content"
    />
  )
}

const styles = StyleSheet.create({
  skeleton: {
    backgroundColor: Colors.neutrals.gray300
  }
})

export default SkeletonLoader