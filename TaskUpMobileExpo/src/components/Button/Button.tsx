import React, { useMemo } from 'react'
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ViewStyle,
  TextStyle,
  View,
  Dimensions
} from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'
import { Feather } from '@expo/vector-icons'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Metrics from '../../theme/Metrics'
import { triggerImpact } from '../../utils/HapticUtils'

const { width } = Dimensions.get('window')
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient)
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger'
export type ButtonSize = 'small' | 'medium' | 'large'

interface ButtonProps {
  title: string
  onPress: () => void
  variant?: ButtonVariant
  size?: ButtonSize
  disabled?: boolean
  loading?: boolean
  icon?: keyof typeof Feather.glyphMap
  iconPosition?: 'left' | 'right'
  fullWidth?: boolean
  round?: boolean
  style?: ViewStyle
  textStyle?: TextStyle
  animationType?: 'spring' | 'bounce' | 'pulse' | 'ripple'
  gradientColors?: string[]
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  round = false,
  style,
  textStyle,
  animationType = 'spring',
  gradientColors
}: ButtonProps) => {
  // Animation shared values
  const scale = useSharedValue(1)
  const rippleScale = useSharedValue(0)
  const rippleOpacity = useSharedValue(0)
  const contentOpacity = useSharedValue(1)
  const loadingOpacity = useSharedValue(loading ? 1 : 0)
  
  // Compute variant-based styles
  const buttonConfig = useMemo(() => {
    const config: {
      backgroundColor: string,
      borderColor: string,
      textColor: string,
      disabledBackgroundColor: string,
      disabledTextColor: string,
      gradientColors: string[]
    } = {
      backgroundColor: Colors.primary.blue,
      borderColor: 'transparent',
      textColor: Colors.neutrals.white,
      disabledBackgroundColor: Colors.neutrals.gray300,
      disabledTextColor: Colors.neutrals.gray600,
      gradientColors: gradientColors || []
    }
    
    switch (variant) {
      case 'primary':
        config.backgroundColor = Colors.primary.blue
        config.textColor = Colors.neutrals.white
        config.gradientColors = gradientColors || [Colors.primary.blue, Colors.primary.darkBlue]
        break
      case 'secondary':
        config.backgroundColor = 'transparent'
        config.borderColor = Colors.primary.blue
        config.textColor = Colors.primary.blue
        config.disabledBackgroundColor = 'transparent'
        config.disabledTextColor = Colors.neutrals.gray400
        config.gradientColors = []
        break
      case 'tertiary':
        config.backgroundColor = 'transparent'
        config.textColor = Colors.primary.blue
        config.disabledBackgroundColor = 'transparent'
        config.disabledTextColor = Colors.neutrals.gray400
        config.gradientColors = []
        break
      case 'success':
        config.backgroundColor = Colors.secondary.green
        config.textColor = Colors.neutrals.white
        config.disabledBackgroundColor = Colors.neutrals.gray300
        config.gradientColors = gradientColors || ['#00C853', '#009688']
        break
      case 'danger':
        config.backgroundColor = Colors.secondary.red
        config.textColor = Colors.neutrals.white
        config.disabledBackgroundColor = Colors.neutrals.gray300
        config.gradientColors = gradientColors || [Colors.secondary.red, '#C62828']
        break
    }
    
    return config
  }, [variant, gradientColors])
  
  // Size configuration
  const sizeConfig = useMemo(() => {
    const config: {
      height: number,
      paddingHorizontal: number,
      borderRadius: number,
      fontSize: number,
      iconSize: number
    } = {
      height: Metrics.buttonHeight,
      paddingHorizontal: 20,
      borderRadius: 8,
      fontSize: Typography.sizes.body,
      iconSize: 18
    }
    
    switch (size) {
      case 'small':
        config.height = 36
        config.paddingHorizontal = 16
        config.borderRadius = 6
        config.fontSize = Typography.sizes.bodySmall
        config.iconSize = 14
        break
      case 'large':
        config.height = 56
        config.paddingHorizontal = 24
        config.borderRadius = 10
        config.fontSize = Typography.sizes.bodyLarge
        config.iconSize = 22
        break
    }
    
    return config
  }, [size])
  
  // Handle animations
  const handlePressIn = () => {
    switch (animationType) {
      case 'spring':
        scale.value = withTiming(0.95, { duration: 100 })
        break
      case 'bounce':
        scale.value = withTiming(0.9, { duration: 100 })
        break
      case 'pulse':
        scale.value = withTiming(0.95, { duration: 100 })
        break
      case 'ripple':
        rippleScale.value = 0
        rippleOpacity.value = 0.3
        rippleScale.value = withTiming(1, { duration: 400 })
        rippleOpacity.value = withTiming(0, { duration: 400 })
        break
    }
  }
  
  const handlePressOut = () => {
    switch (animationType) {
      case 'spring':
        scale.value = withSpring(1, { damping: 12, stiffness: 150 })
        break
      case 'bounce':
        scale.value = withSequence(
          withTiming(1.05, { duration: 150 }),
          withTiming(1, { duration: 150 })
        )
        break
      case 'pulse':
        scale.value = withTiming(1, { duration: 200 })
        break
    }
  }
  
  const handlePress = () => {
    triggerImpact(variant === 'primary' 
      ? Haptics.ImpactFeedbackStyle.Medium 
      : Haptics.ImpactFeedbackStyle.Light)
      
    // If loading state changes, animate it
    if (loading) {
      contentOpacity.value = withTiming(0, { duration: 150 })
      loadingOpacity.value = withDelay(100, withTiming(1, { duration: 150 }))
    } else {
      loadingOpacity.value = withTiming(0, { duration: 150 })
      contentOpacity.value = withDelay(100, withTiming(1, { duration: 150 }))
    }
    
    onPress()
  }
  
  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.7 : 1
    }
  })
  
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value
    }
  })
  
  const loadingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: loadingOpacity.value,
      position: 'absolute',
      alignSelf: 'center'
    }
  })
  
  const rippleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rippleScale.value }],
      opacity: rippleOpacity.value
    }
  })
  
  // Render icon if provided
  const renderIcon = () => {
    if (!icon) return null
    
    return (
      <Feather 
        name={icon} 
        size={sizeConfig.iconSize} 
        color={disabled ? buttonConfig.disabledTextColor : buttonConfig.textColor}
        style={[
          styles.icon, 
          iconPosition === 'right' && styles.iconRight
        ]} 
      />
    )
  }
  
  // Determine button content
  const ButtonContent = () => (
    <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
      {iconPosition === 'left' && renderIcon()}
      <Text 
        style={[
          styles.text, 
          { 
            color: disabled ? buttonConfig.disabledTextColor : buttonConfig.textColor,
            fontSize: sizeConfig.fontSize
          },
          textStyle
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {iconPosition === 'right' && renderIcon()}
    </Animated.View>
  )
  
  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        styles.button,
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: round ? sizeConfig.height / 2 : sizeConfig.borderRadius,
          backgroundColor: 
            variant === 'secondary' || variant === 'tertiary' 
              ? 'transparent' 
              : disabled 
                ? buttonConfig.disabledBackgroundColor 
                : buttonConfig.backgroundColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: disabled 
            ? buttonConfig.disabledTextColor
            : buttonConfig.borderColor,
          width: fullWidth ? '100%' : 'auto'
        },
        buttonAnimatedStyle,
        style
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={title}
    >
      {buttonConfig.gradientColors.length > 0 && !disabled ? (
        <AnimatedLinearGradient
          colors={buttonConfig.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { 
            borderRadius: round ? sizeConfig.height / 2 : sizeConfig.borderRadius
          }]}
        />
      ) : null}
      
      {animationType === 'ripple' && (
        <Animated.View 
          style={[
            styles.ripple, 
            { 
              backgroundColor: variant === 'secondary' || variant === 'tertiary'
                ? buttonConfig.textColor
                : Colors.neutrals.white
            },
            rippleAnimatedStyle
          ]} 
        />
      )}
      
      <ButtonContent />
      
      <Animated.View style={loadingAnimatedStyle}>
        <ActivityIndicator 
          color={
            variant === 'secondary' || variant === 'tertiary'
              ? disabled 
                ? buttonConfig.disabledTextColor 
                : buttonConfig.textColor
              : Colors.neutrals.white
          }
          size={size === 'small' ? 'small' : 'small'}
        />
      </Animated.View>
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: Typography.weights.medium
  },
  icon: {
    marginRight: 8
  },
  iconRight: {
    marginRight: 0,
    marginLeft: 8
  },
  ripple: {
    position: 'absolute',
    width: width * 1.5,
    height: width * 1.5,
    borderRadius: width * 0.75,
    opacity: 0
  }
})

export default Button