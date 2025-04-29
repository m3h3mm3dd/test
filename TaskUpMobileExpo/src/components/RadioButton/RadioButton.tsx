import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import Colors from '../../theme/Colors'

interface RadioButtonProps {
  selected: boolean
  onSelect: () => void
  size?: number
  disabled?: boolean
}

const RadioButton = ({ selected, onSelect, size = 24, disabled = false }: RadioButtonProps) => {
  const scale = useSharedValue(1)
  const innerScale = useSharedValue(selected ? 1 : 0)
  
  const handlePress = () => {
    if (disabled) return
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    scale.value = withTiming(0.8, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 })
    })
    onSelect()
    innerScale.value = withTiming(1, { duration: 150 })
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

  React.useEffect(() => {
    innerScale.value = withTiming(selected ? 1 : 0, { duration: 150 })
  }, [selected])

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
          { width: size, height: size, borderRadius: size / 2 },
          disabled && styles.disabledContainer,
          animatedStyle
        ]}
      >
        <Animated.View
          style={[
            styles.innerCircle,
            { width: size * 0.5, height: size * 0.5, borderRadius: size * 0.5 / 2 },
            disabled && styles.disabledInnerCircle,
            innerAnimatedStyle
          ]}
        />
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    borderColor: Colors.primary.blue,
    justifyContent: 'center',
    alignItems: 'center'
  },
  innerCircle: {
    backgroundColor: Colors.primary.blue
  },
  disabledContainer: {
    borderColor: Colors.neutrals.gray400
  },
  disabledInnerCircle: {
    backgroundColor: Colors.neutrals.gray400
  }
})

export default RadioButton