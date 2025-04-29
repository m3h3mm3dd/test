import React from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import Colors from '../../theme/Colors'

interface CheckboxProps {
  checked: boolean
  onToggle: () => void
  size?: number
  disabled?: boolean
}

const Checkbox = ({ checked, onToggle, size = 24, disabled = false }: CheckboxProps) => {
  const scale = useSharedValue(1)
  
  const handlePress = () => {
    if (disabled) return
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    scale.value = withTiming(0.8, { duration: 100 }, () => {
      scale.value = withTiming(1, { duration: 100 })
    })
    onToggle()
  }
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    }
  })

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      accessible={true}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
    >
      <Animated.View
        style={[
          styles.container,
          { width: size, height: size, borderRadius: size / 6 },
          checked && styles.checkedContainer,
          disabled && styles.disabledContainer,
          animatedStyle
        ]}
      >
        {checked && (
          <View style={styles.checkmark}>
            <View style={styles.checkmarkLine1} />
            <View style={styles.checkmarkLine2} />
          </View>
        )}
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
  checkedContainer: {
    backgroundColor: Colors.primary.blue
  },
  disabledContainer: {
    borderColor: Colors.neutrals.gray400,
    backgroundColor: checked => checked ? Colors.neutrals.gray400 : 'transparent'
  },
  checkmark: {
    width: '100%',
    height: '100%',
    position: 'relative'
  },
  checkmarkLine1: {
    position: 'absolute',
    left: '20%',
    bottom: '45%',
    width: '30%',
    height: 2,
    backgroundColor: Colors.neutrals.white,
    transform: [{ rotate: '45deg' }]
  },
  checkmarkLine2: {
    position: 'absolute',
    right: '25%',
    bottom: '40%',
    width: '50%',
    height: 2,
    backgroundColor: Colors.neutrals.white,
    transform: [{ rotate: '-45deg' }]
  }
})

export default Checkbox