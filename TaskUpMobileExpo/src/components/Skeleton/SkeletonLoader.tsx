import React, { useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  ViewStyle, 
  StyleProp, 
  LayoutChangeEvent,
  Dimensions,
  Platform
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withRepeat,
  withTiming,
  interpolate,
  Extrapolation,
  cancelAnimation,
  withSequence,
  withDelay,
  Easing
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'

import Colors from '../theme/Colors'

const { width: SCREEN_WIDTH } = Dimensions.get('window')
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

interface SkeletonLoaderProps {
  width?: number | string
  height?: number | string
  borderRadius?: number
  style?: StyleProp<ViewStyle>
  shimmerColors?: string[]
  shimmerDuration?: number
  backgroundColor?: string
  animated?: boolean
  children?: React.ReactNode
  layout?: 'circle' | 'rect' | 'card' | 'text'
  shimmerWidth?: number
  shimmerAngle?: number
  containerStyle?: StyleProp<ViewStyle>
  noShimmer?: boolean
}

const SkeletonLoader = ({
  width = '100%',
  height = 20,
  borderRadius = 4,
  style,
  shimmerColors = [
    'rgba(255, 255, 255, 0)',
    'rgba(255, 255, 255, 0.5)',
    'rgba(255, 255, 255, 0)'
  ],
  shimmerDuration = 1500,
  backgroundColor = Colors.neutrals.gray200,
  animated = true,
  children,
  layout,
  shimmerWidth = SCREEN_WIDTH,
  shimmerAngle = 15,
  containerStyle,
  noShimmer = false
}: SkeletonLoaderProps) => {
  // Animation values
  const shimmerPosition = useSharedValue(-shimmerWidth)
  const skeletonOpacity = useSharedValue(1)
  
  // Container dimensions
  const containerWidth = typeof width === 'number' ? width : 0
  const containerHeight = typeof height === 'number' ? height : 0
  
  // Handle layout based on preset
  useEffect(() => {
    if (layout) {
      switch (layout) {
        case 'circle':
          // For circles, make width and height the same
          const size = typeof width === 'number' ? width : 40
          break
        case 'card':
          // Card layout usually has more height
          break
        case 'text':
          // Text lines are usually thin
          break
      }
    }
  }, [layout])
  
  // Setup shimmer animation
  useEffect(() => {
    if (!animated || noShimmer) return
    
    // Animate shimmer from left to right repeatedly
    shimmerPosition.value = withRepeat(
      withTiming(shimmerWidth * 1.5, { 
        duration: shimmerDuration, 
        easing: Easing.inOut(Easing.ease)
      }),
      -1, // Infinite repeat
      false // No reverse
    )
    
    // Subtle opacity animation for more liveliness
    skeletonOpacity.value = withRepeat(
      withSequence(
        withTiming(0.85, { duration: shimmerDuration / 2 }),
        withTiming(1, { duration: shimmerDuration / 2 })
      ),
      -1,
      true
    )
    
    return () => {
      cancelAnimation(shimmerPosition)
      cancelAnimation(skeletonOpacity)
    }
  }, [animated, shimmerDuration, noShimmer])
  
  // Animated styles
  const shimmerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerPosition.value }]
    }
  })
  
  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: skeletonOpacity.value
    }
  })
  
  // Determine dimensions based on layout
  const getDimensions = () => {
    if (layout === 'circle') {
      const size = typeof width === 'number' ? width : 40
      return {
        width: size,
        height: size,
        borderRadius: size / 2
      }
    }
    
    return {
      width,
      height,
      borderRadius
    }
  }
  
  // Prepare gradient angle
  const gradientStart = { x: 0, y: 0.5 }
  const gradientEnd = { x: 1, y: 0.5 }
  
  // If specified to not use shimmer, just return the skeleton
  if (noShimmer) {
    return (
      <Animated.View
        style={[
          styles.container,
          getDimensions(),
          { backgroundColor },
          containerAnimatedStyle,
          style
        ]}
        accessibilityRole="none"
        accessibilityLabel="Loading"
        accessibilityState={{ busy: true }}
      >
        {children}
      </Animated.View>
    )
  }
  
  return (
    <Animated.View
      style={[
        styles.container,
        getDimensions(),
        { backgroundColor },
        containerAnimatedStyle,
        style
      ]}
      accessibilityRole="none"
      accessibilityLabel="Loading"
      accessibilityState={{ busy: true }}
    >
      {animated && (
        <AnimatedLinearGradient
          colors={shimmerColors}
          start={gradientStart}
          end={gradientEnd}
          style={[
            styles.shimmer,
            { width: shimmerWidth }
          ]}
          animatedStyle={shimmerStyle}
        />
      )}
      {children}
    </Animated.View>
  )
}

// Composite components for common skeleton layouts
SkeletonLoader.Circle = (props: Omit<SkeletonLoaderProps, 'layout'>) => (
  <SkeletonLoader 
    {...props} 
    layout="circle" 
    width={props.width || 48}
    height={props.width || 48}
    borderRadius={props.width ? (typeof props.width === 'number' ? props.width / 2 : 24) : 24}
  />
)

SkeletonLoader.Text = (props: Omit<SkeletonLoaderProps, 'layout'>) => (
  <SkeletonLoader 
    {...props} 
    layout="text" 
    height={props.height || 16}
    width={props.width || '80%'}
  />
)

SkeletonLoader.Card = (props: Omit<SkeletonLoaderProps, 'layout'>) => (
  <SkeletonLoader 
    {...props} 
    layout="card" 
    height={props.height || 120}
    borderRadius={props.borderRadius || 8}
  />
)

// Helper components for complex skeleton layouts
SkeletonLoader.Row = ({ children, style }: { children: React.ReactNode, style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.row, style]}>
    {children}
  </View>
)

SkeletonLoader.Column = ({ children, style }: { children: React.ReactNode, style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.column, style]}>
    {children}
  </View>
)

// Profile skeleton that combines multiple elements
SkeletonLoader.Profile = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.profile, style]}>
    <SkeletonLoader.Circle width={60} />
    <View style={styles.profileContent}>
      <SkeletonLoader width="70%" height={18} style={styles.mb8} />
      <SkeletonLoader width="40%" height={14} />
    </View>
  </View>
)

// List item skeleton
SkeletonLoader.ListItem = ({ 
  hasAvatar = true, 
  lines = 1,
  style
}: { 
  hasAvatar?: boolean, 
  lines?: 1 | 2 | 3,
  style?: StyleProp<ViewStyle>
}) => (
  <View style={[styles.listItem, style]}>
    {hasAvatar && (
      <SkeletonLoader.Circle width={40} style={styles.listItemAvatar} />
    )}
    <View style={styles.listItemContent}>
      <SkeletonLoader width="60%" height={16} style={styles.mb8} />
      {lines >= 2 && (
        <SkeletonLoader width="90%" height={14} style={styles.mb8} />
      )}
      {lines >= 3 && (
        <SkeletonLoader width="40%" height={14} />
      )}
    </View>
  </View>
)

// Task skeleton
SkeletonLoader.Task = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.task, style]}>
    <View style={styles.taskHeader}>
      <SkeletonLoader width={180} height={20} style={styles.mb8} />
      <SkeletonLoader width={80} height={24} borderRadius={12} />
    </View>
    <SkeletonLoader width="90%" height={16} style={styles.mb16} />
    <View style={styles.taskFooter}>
      <SkeletonLoader.Row>
        <SkeletonLoader.Circle width={24} />
        <SkeletonLoader.Circle width={24} style={{ marginLeft: -8 }} />
        <SkeletonLoader.Circle width={24} style={{ marginLeft: -8 }} />
      </SkeletonLoader.Row>
      <SkeletonLoader width={80} height={14} />
    </View>
  </View>
)

// DashboardCard skeleton
SkeletonLoader.DashboardCard = ({ style }: { style?: StyleProp<ViewStyle> }) => (
  <View style={[styles.dashboardCard, style]}>
    <SkeletonLoader 
      width={48} 
      height={48} 
      borderRadius={12} 
      style={styles.mb16} 
    />
    <SkeletonLoader 
      width="70%" 
      height={14} 
      style={styles.mb8} 
    />
    <SkeletonLoader 
      width="50%" 
      height={24} 
      style={styles.mb8} 
    />
  </View>
)

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    backgroundColor: Colors.neutrals.gray200
  },
  shimmer: {
    height: '100%',
    position: 'absolute',
    top: 0,
    left: 0
  },
  row: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  column: {
    flexDirection: 'column'
  },
  mb8: {
    marginBottom: 8
  },
  mb16: {
    marginBottom: 16
  },
  profile: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16
  },
  profileContent: {
    marginLeft: 16,
    flex: 1
  },
  listItem: {
    flexDirection: 'row',
    padding: 16,
    alignItems: 'center'
  },
  listItemAvatar: {
    marginRight: 16
  },
  listItemContent: {
    flex: 1
  },
  task: {
    padding: 16,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4
      },
      android: {
        elevation: 2
      }
    })
  },
  dashboardCard: {
    width: SCREEN_WIDTH * 0.75,
    height: 180,
    padding: 20,
    borderRadius: 20,
    backgroundColor: Colors.primary.blue + '20',
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.15,
        shadowRadius: 12
      },
      android: {
        elevation: 4
      }
    })
  },
  taskHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  taskFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center'
  }
})

export default SkeletonLoader