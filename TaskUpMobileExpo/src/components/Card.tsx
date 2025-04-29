import React from 'react'
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ViewStyle, 
  StyleProp,
  Platform
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import { SharedElement } from 'react-navigation-shared-element'
import { LinearGradient } from 'expo-linear-gradient'

import Colors from '../../theme/Colors'
import Spacing from '../../theme/Spacing'
import { triggerImpact } from '../../utils/HapticUtils'

interface CardProps {
  children: React.ReactNode
  style?: StyleProp<ViewStyle>
  onPress?: () => void
  disabled?: boolean
  elevation?: number
  sharedElementId?: string
  gradientColors?: string[]
  gradientStart?: { x: number; y: number }
  gradientEnd?: { x: number; y: number }
  animationType?: 'spring' | 'scale' | 'tilt' | 'none'
  borderRadius?: number
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)

const Card = ({
  children,
  style,
  onPress,
  disabled = false,
  elevation = 2,
  sharedElementId,
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
  animationType = 'spring',
  borderRadius = 12
}: CardProps) => {
  // Animation values
  const scale = useSharedValue(1)
  const rotateX = useSharedValue(0)
  const rotateY = useSharedValue(0)
  const shadowOpacity = useSharedValue(elevation * 0.08)
  
  // Handle animation on press
  const handlePressIn = () => {
    if (disabled) return
    
    if (animationType === 'spring' || animationType === 'scale') {
      scale.value = withTiming(0.98, { duration: 150 })
      shadowOpacity.value = withTiming(elevation * 0.05, { duration: 150 })
    } else if (animationType === 'tilt') {
      rotateX.value = withTiming(10, { duration: 150 })
      rotateY.value = withTiming(-10, { duration: 150 })
    }
  }
  
  const handlePressOut = () => {
    if (disabled) return
    
    if (animationType === 'spring') {
      scale.value = withSpring(1, { 
        damping: 12, 
        stiffness: 200 
      })
      shadowOpacity.value = withTiming(elevation * 0.08, { duration: 200 })
    } else if (animationType === 'scale') {
      scale.value = withTiming(1, { duration: 150 })
      shadowOpacity.value = withTiming(elevation * 0.08, { duration: 150 })
    } else if (animationType === 'tilt') {
      rotateX.value = withSpring(0, { 
        damping: 10, 
        stiffness: 100 
      })
      rotateY.value = withSpring(0, { 
        damping: 10, 
        stiffness: 100 
      })
    }
  }
  
  const handlePress = () => {
    if (disabled || !onPress) return
    
    triggerImpact()
    onPress()
  }
  
  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { perspective: 1000 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` }
      ]
    }
  })
  
  const shadowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: shadowOpacity.value
    }
  })
  
  // Adjust shadow based on elevation
  const shadowStyles = {
    shadowColor: Colors.neutrals.black,
    shadowOffset: { 
      width: 0, 
      height: Math.max(1, Math.round(elevation / 2))
    },
    shadowOpacity: elevation * 0.08,
    shadowRadius: Math.max(1, Math.round(elevation))
  }
  
  // Determine if card is pressable
  const CardContainer = onPress ? AnimatedTouchable : Animated.View
  const cardProps = onPress ? {
    activeOpacity: 0.9,
    onPress: handlePress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    disabled
  } : {}
  
  // Content to display
  const content = (
    <CardContainer
      style={[
        styles.card, 
        { 
          borderRadius,
          elevation: Platform.OS === 'android' ? elevation : 0,
        },
        shadowStyles,
        shadowAnimatedStyle,
        cardAnimatedStyle,
        style
      ]}
      {...cardProps}
    >
      {gradientColors && gradientColors.length >= 2 ? (
        <AnimatedLinearGradient
          colors={gradientColors}
          start={gradientStart}
          end={gradientEnd}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius }
          ]}
        />
      ) : null}
      
      <View style={styles.contentContainer}>
        {children}
      </View>
    </CardContainer>
  )
  
  // If shared element ID is provided, wrap in SharedElement
  if (sharedElementId) {
    return (
      <SharedElement id={sharedElementId}>
        {content}
      </SharedElement>
    )
  }
  
  return content
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutrals.white,
    overflow: 'hidden'
  },
  contentContainer: {
    overflow: 'hidden'
  }
})

export default Card