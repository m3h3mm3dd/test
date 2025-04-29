import React from 'react'
import { StyleSheet, Text, TouchableOpacity, ActivityIndicator, Platform } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, { useAnimatedStyle, useSharedValue, withSpring } from 'react-native-reanimated'
import { ButtonProps } from '../../types/UITypes'
import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Metrics from '../../theme/Metrics'
import { triggerImpact } from '../../utils/HapticUtils'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const SecondaryButton = ({
  title,
  onPress,
  disabled = false,
  loading = false,
  icon,
  fullWidth = false,
  style,
  textStyle
}: ButtonProps) => {
  const scale = useSharedValue(1)

  const handlePress = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }

  const handlePressIn = () => {
    scale.value = withSpring(0.95)
  }

  const handlePressOut = () => {
    scale.value = withSpring(1)
  }

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    }
  })

  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      style={[
        styles.button,
        fullWidth && styles.fullWidth,
        disabled && styles.disabled,
        animatedStyle,
        style
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={title}
    >
      {loading ? (
        <ActivityIndicator color={Colors.primary.blue} />
      ) : (
        <>
          {icon}
          <Text style={[styles.text, textStyle]}>{title}</Text>
        </>
      )}
    </AnimatedTouchable>
  )
}

const styles = StyleSheet.create({
  button: {
    height: Metrics.buttonHeight,
    minWidth: 120,
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: Colors.primary.blue,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16
  },
  fullWidth: {
    width: '100%'
  },
  disabled: {
    borderColor: Colors.neutrals.gray400,
    opacity: 0.7
  },
  text: {
    color: Colors.primary.blue,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium
  }
})

export default SecondaryButton