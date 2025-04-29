import React, { useState } from 'react'
import { StyleSheet, Text, TextInput, View } from 'react-native'
import { InputProps } from '../../types/UITypes'
import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Metrics from '../../theme/Metrics'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'

const TextInputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  disabled = false,
  error,
  style,
  inputStyle
}: InputProps) => {
  const [isFocused, setIsFocused] = useState(false)
  const focusAnim = useSharedValue(0)

  const handleFocus = () => {
    setIsFocused(true)
    focusAnim.value = withTiming(1, { duration: 200 })
  }

  const handleBlur = () => {
    setIsFocused(false)
    focusAnim.value = withTiming(0, { duration: 200 })
  }

  const borderAnimStyle = useAnimatedStyle(() => {
    return {
      borderColor: error
        ? Colors.error
        : focusAnim.value === 1
        ? Colors.primary.blue
        : Colors.neutrals.gray300
    }
  })

  return (
    <View style={[styles.container, style]}>
      {label && <Text style={styles.label}>{label}</Text>}
      <Animated.View style={[styles.inputContainer, borderAnimStyle]}>
        <TextInput
          style={[styles.input, disabled && styles.disabledInput, inputStyle]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={Colors.neutrals.gray500}
          accessible={true}
          accessibilityLabel={label || placeholder}
          accessibilityState={{ disabled }}
          autoCapitalize="none"
        />
      </Animated.View>
      {error && <Text style={styles.errorText}>{error}</Text>}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16
  },
  label: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray800,
    marginBottom: 8
  },
  inputContainer: {
    height: Metrics.inputHeight,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray300,
    borderRadius: 8,
    backgroundColor: Colors.neutrals.white,
    paddingHorizontal: 12
  },
  input: {
    flex: 1,
    color: Colors.neutrals.gray900,
    fontSize: Typography.sizes.body,
    height: '100%'
  },
  disabledInput: {
    backgroundColor: Colors.neutrals.gray100,
    color: Colors.neutrals.gray600
  },
  errorText: {
    color: Colors.error,
    fontSize: Typography.sizes.bodySmall,
    marginTop: 4
  }
})

export default TextInputField