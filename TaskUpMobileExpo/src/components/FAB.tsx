import React, { useEffect } from 'react'
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  ViewStyle,
  Dimensions
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
  useDerivedValue,
  interpolateColor
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'
import LottieView from 'lottie-react-native'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

import Colors from '../../theme/Colors'
import { triggerImpact } from '../../utils/HapticUtils'

const { width } = Dimensions.get('window')
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)
const AnimatedLottie = Animated.createAnimatedComponent(LottieView)
const AnimatedFeather = Animated.createAnimatedComponent(Feather)

type FabSize = 'small' | 'medium' | 'large'
type FabPosition = 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft' | 'center'

interface FABProps {
  onPress: () => void
  icon?: keyof typeof Feather.glyphMap
  secondaryIcon?: keyof typeof Feather.glyphMap
  lottieSource?: any
  size?: FabSize
  position?: FabPosition
  color?: string
  gradientColors?: string[]
  style?: ViewStyle
  visible?: boolean
  disabled?: boolean
  loading?: boolean
  morphDuration?: number
  morphing?: boolean
  extended?: boolean
  showProgress?: boolean
  progressValue?: number
}

const FAB = ({
  onPress,
  icon = 'plus',
  secondaryIcon,
  lottieSource,
  size = 'medium',
  position = 'bottomRight',
  color = Colors.primary.blue,
  gradientColors,
  style,
  visible = true,
  disabled = false,
  loading = false,
  morphDuration = 300,
  morphing = false,
  extended = false,
  showProgress = false,
  progressValue = 0
}: FABProps) => {
  // Animation values
  const scale = useSharedValue(1)
  const rotation = useSharedValue(0)
  const fabVisibility = useSharedValue(visible ? 1 : 0)
  const fabExtended = useSharedValue(extended ? 1 : 0)
  const progress = useSharedValue(progressValue)
  const morphProgress = useSharedValue(0)
  const loadingProgress = useSharedValue(0)
  
  // Size based on prop
  const getSizeValue = () => {
    switch (size) {
      case 'small':
        return 40
      case 'large':
        return 64
      case 'medium':
      default:
        return 56
    }
  }
  
  // Position styles
  const getPositionStyle = () => {
    const positionStyle: ViewStyle = {
      position: 'absolute'
    }
    
    switch (position) {
      case 'bottomRight':
        positionStyle.bottom = 16
        positionStyle.right = 16
        break
      case 'bottomLeft':
        positionStyle.bottom = 16
        positionStyle.left = 16
        break
      case 'topRight':
        positionStyle.top = 16
        positionStyle.right = 16
        break
      case 'topLeft':
        positionStyle.top = 16
        positionStyle.left = 16
        break
      case 'center':
        positionStyle.alignSelf = 'center'
        break
    }
    
    return positionStyle
  }
  
  // Update animation values when props change
  useEffect(() => {
    // Update visibility
    fabVisibility.value = withTiming(visible ? 1 : 0, { duration: 200 })
    
    // Update extended state
    fabExtended.value = withTiming(extended ? 1 : 0, { duration: 300 })
    
    // Update progress
    progress.value = withTiming(progressValue, { duration: 300 })
  }, [visible, extended, progressValue])
  
  useEffect(() => {
    // When loading state changes
    if (loading) {
      loadingProgress.value = withRepeat(
        withTiming(1, { duration: 1000 }),
        -1,
        false
      )
    } else {
      loadingProgress.value = withTiming(0, { duration: 300 })
    }
  }, [loading])
  
  useEffect(() => {
    // Morphing animation between icons
    if (morphing && secondaryIcon) {
      morphProgress.value = withTiming(
        morphProgress.value === 0 ? 1 : 0, 
        { duration: morphDuration }
      )
    }
  }, [morphing])
  
  // Handle press animations
  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 })
    
    // If morphing is enabled, toggle between icons
    if (secondaryIcon && !morphing) {
      morphProgress.value = morphProgress.value === 0 ? 
        withTiming(1, { duration: morphDuration }) : 
        withTiming(0, { duration: morphDuration })
    }
  }
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { 
      damping: 15,
      stiffness: 150
    })
  }
  
  const handlePress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    
    // Animate rotation for effect
    rotation.value = withSequence(
      withTiming(rotation.value + 45, { duration: 150 }),
      withTiming(rotation.value, { duration: 150 })
    )
    
    onPress()
  }
  
  // Derived animation values
  const iconRotation = useDerivedValue(() => {
    return interpolate(
      morphProgress.value,
      [0, 1],
      [0, 45],
      Extrapolation.CLAMP
    )
  })
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    const sizeValue = getSizeValue()
    const extendedWidth = interpolate(
      fabExtended.value,
      [0, 1],
      [sizeValue, sizeValue * 2.5],
      Extrapolation.CLAMP
    )
    
    return {
      opacity: fabVisibility.value,
      transform: [
        { scale: scale.value },
        { translateY: interpolate(
            fabVisibility.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          ) 
        }
      ],
      width: extendedWidth,
      height: sizeValue,
      borderRadius: sizeValue / 2
    }
  })
  
  const iconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        morphProgress.value,
        [0, 0.5, 1],
        [1, 0, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        { rotate: `${iconRotation.value}deg` }
      ]
    }
  })
  
  const secondaryIconStyle = useAnimatedStyle(() => {
    return {
      opacity: interpolate(
        morphProgress.value,
        [0, 0.5, 1],
        [0, 0, 1],
        Extrapolation.CLAMP
      ),
      transform: [
        { rotate: `${iconRotation.value}deg` }
      ]
    }
  })
  
  const progressCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `${interpolate(
            loadingProgress.value,
            [0, 1],
            [0, 360],
            Extrapolation.CLAMP
          )}deg` 
        }
      ]
    }
  })
  
  const progressStyle = useAnimatedStyle(() => {
    return {
      opacity: showProgress ? 1 : 0,
      width: `${progress.value * 100}%`
    }
  })
  
  // Get icon size based on FAB size
  const getIconSize = () => {
    switch (size) {
      case 'small':
        return 16
      case 'large':
        return 28
      case 'medium':
      default:
        return 24
    }
  }
  
  const sizeValue = getSizeValue()
  const iconSize = getIconSize()
  
  return (
    <AnimatedTouchable
      style={[
        styles.container,
        getPositionStyle(),
        containerStyle,
        style
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
    >
      {gradientColors ? (
        <AnimatedLinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius: sizeValue / 2 }
          ]}
        />
      ) : (
        <Animated.View
          style={[
            StyleSheet.absoluteFillObject,
            { 
              backgroundColor: color,
              borderRadius: sizeValue / 2
            }
          ]}
        />
      )}
      
      {showProgress && (
        <Animated.View style={[styles.progressContainer, progressStyle]}>
          <View style={[styles.progressBar, { backgroundColor: 'rgba(255, 255, 255, 0.3)' }]} />
        </Animated.View>
      )}
      
      {loading ? (
        <View style={styles.loadingContainer}>
          <Animated.View style={[styles.loadingCircle, progressCircleStyle]}>
            <View style={styles.loadingIndicator} />
          </Animated.View>
        </View>
      ) : lottieSource ? (
        <AnimatedLottie
          source={lottieSource}
          style={{ width: iconSize * 2, height: iconSize * 2 }}
          autoPlay
          loop
        />
      ) : (
        <View style={styles.iconContainer}>
          <AnimatedFeather 
            name={icon} 
            size={iconSize} 
            color={Colors.neutrals.white} 
            style={[styles.icon, iconStyle]} 
          />
          
          {secondaryIcon && (
            <AnimatedFeather 
              name={secondaryIcon} 
              size={iconSize} 
              color={Colors.neutrals.white} 
              style={[styles.secondaryIcon, secondaryIconStyle]} 
            />
          )}
        </View>
      )}
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: Colors.neutrals.black,
    shadowOpacity: 0.25,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 6,
    overflow: 'hidden'
  },
  iconContainer: {
    position: 'relative',
    width: 24,
    height: 24,
    justifyContent: 'center',
    alignItems: 'center'
  },
  icon: {
    position: 'absolute'
  },
  secondaryIcon: {
    position: 'absolute'
  },
  loadingContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingCircle: {
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center'
  },
  loadingIndicator: {
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: Colors.neutrals.white,
    marginLeft: 8
  },
  progressContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    height: 3,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    width: '100%'
  }
})

export default FAB