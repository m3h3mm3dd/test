import React, { useEffect } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring 
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import Colors from '../../theme/Colors'
import { triggerImpact } from '../../utils/HapticUtils'

interface RadioButtonProps {
  selected: boolean
  onSelect: () => void
  size?: number
  disabled?: boolean
  color?: string
  borderWidth?: number
}

const RadioButton = ({ 
  selected, 
  onSelect, 
  size = 24, 
  disabled = false,
  color = Colors.primary.blue,
  borderWidth = 2
}: RadioButtonProps) => {
  const scale = useSharedValue(1)
  const innerScale = useSharedValue(selected ? 1 : 0)
  
  const handlePress = () => {
    if (disabled) return
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    scale.value = withTiming(0.8, { duration: 80 }, () => {
      scale.value = withSpring(1, { damping: 12, stiffness: 200 })
    })
    onSelect()
  }
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    }
  })

  const innerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: innerScale.value }]
    }
  })

  useEffect(() => {
    innerScale.value = withTiming(selected ? 1 : 0, { duration: 150 })
  }, [selected])

  const getColor = () => {
    if (disabled) {
      return Colors.neutrals.gray400
    }
    return color
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="radio"
      accessibilityState={{ checked: selected, disabled }}
    >
      <Animated.View
        style={[
          styles.container,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            borderWidth,
            borderColor: getColor()
          },
          animatedStyle
        ]}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            { 
              width: size * 0.5, 
              height: size * 0.5, 
              borderRadius: size * 0.5 / 2,
              backgroundColor: getColor()
            },
            innerAnimatedStyle
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerCircle: {}
})

export default RadioButton