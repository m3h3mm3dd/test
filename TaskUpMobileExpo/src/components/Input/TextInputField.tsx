import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  Platform,
  ViewStyle,
  TextStyle
} from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSequence,
  Easing 
} from 'react-native-reanimated'
import { Feather } from '@expo/vector-icons'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Metrics from '../../theme/Metrics'
import { triggerImpact } from '../../utils/HapticUtils'
import * as Haptics from 'expo-haptics'

interface TextInputFieldProps {
  label: string
  placeholder?: string
  value: string
  onChangeText: (text: string) => void
  secureTextEntry?: boolean
  disabled?: boolean
  error?: string
  helper?: string
  style?: ViewStyle
  inputStyle?: TextStyle
  rightIcon?: keyof typeof Feather.glyphMap
  onRightIconPress?: () => void
  keyboardType?: 'default' | 'email-address' | 'numeric' | 'phone-pad' | 'number-pad'
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters'
  autoCorrect?: boolean
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send'
  onSubmitEditing?: () => void
  multiline?: boolean
  numberOfLines?: number
  maxLength?: number
  required?: boolean
  clearButtonMode?: 'never' | 'while-editing' | 'unless-editing' | 'always'
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput)

const TextInputField = ({
  label,
  placeholder,
  value,
  onChangeText,
  secureTextEntry = false,
  disabled = false,
  error,
  helper,
  style,
  inputStyle,
  rightIcon,
  onRightIconPress,
  keyboardType = 'default',
  autoCapitalize = 'none',
  autoCorrect = false,
  returnKeyType,
  onSubmitEditing,
  multiline = false,
  numberOfLines = 1,
  maxLength,
  required = false,
  clearButtonMode = 'while-editing'
}: TextInputFieldProps) => {
  // State for input focus
  const [isFocused, setIsFocused] = useState(false)
  const [isPasswordVisible, setIsPasswordVisible] = useState(false)
  
  // Animation values
  const focusAnim = useSharedValue(0)
  const errorShakeAnim = useSharedValue(0)
  
  // Set up error animation
  useEffect(() => {
    if (error) {
      errorShakeAnim.value = withSequence(
        withTiming(5, { duration: 50 }),
        withTiming(-5, { duration: 50 }),
        withTiming(5, { duration: 50 }),
        withTiming(0, { duration: 50 })
      )
      
      // Trigger haptic feedback for error
      triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    }
  }, [error])
  
  // Handle input focus
  const handleFocus = () => {
    setIsFocused(true)
    focusAnim.value = withTiming(1, { duration: 200, easing: Easing.bezier(0.2, 0.8, 0.2, 1) })
  }
  
  // Handle input blur
  const handleBlur = () => {
    setIsFocused(false)
    focusAnim.value = withTiming(0, { duration: 200, easing: Easing.bezier(0.2, 0.8, 0.2, 1) })
  }
  
  // Toggle password visibility
  const togglePasswordVisibility = () => {
    setIsPasswordVisible(!isPasswordVisible)
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
  }
  
  // Animated styles for border color
  const borderAnimStyle = useAnimatedStyle(() => {
    const borderColor = error
      ? Colors.secondary.red
      : focusAnim.value === 1
      ? Colors.primary.blue
      : Colors.neutrals.gray300
      
    return {
      borderColor
    }
  })
  
  // Animated style for shaking on error
  const containerAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: errorShakeAnim.value }]
    }
  })
  
  // Calculate container height
  const inputHeight = multiline 
    ? Math.max(Metrics.inputHeight, numberOfLines * 24) 
    : Metrics.inputHeight

  return (
    <Animated.View style={[styles.container, style, containerAnimStyle]}>
      {label && (
        <View style={styles.labelContainer}>
          <Text style={styles.label}>
            {label}
            {required && <Text style={styles.required}> *</Text>}
          </Text>
        </View>
      )}
      
      <Animated.View style={[styles.inputContainer, borderAnimStyle, { height: inputHeight }]}>
        <AnimatedTextInput
          style={[
            styles.input, 
            disabled && styles.disabledInput, 
            multiline && styles.multilineInput,
            inputStyle
          ]}
          placeholder={placeholder}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholderTextColor={Colors.neutrals.gray500}
          keyboardType={keyboardType}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          maxLength={maxLength}
          textAlignVertical={multiline ? 'top' : 'center'}
          accessible={true}
          accessibilityLabel={label || placeholder}
          accessibilityState={{ disabled }}
          clearButtonMode={Platform.OS === 'ios' ? clearButtonMode : 'never'}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={togglePasswordVisibility}
            accessibilityRole="button"
            accessibilityLabel={isPasswordVisible ? "Hide password" : "Show password"}
          >
            <Feather 
              name={isPasswordVisible ? 'eye-off' : 'eye'} 
              size={20} 
              color={Colors.neutrals.gray600} 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity 
            style={styles.iconButton} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            accessibilityRole={onRightIconPress ? "button" : undefined}
          >
            <Feather 
              name={rightIcon} 
              size={20} 
              color={
                error ? Colors.secondary.red : 
                isFocused ? Colors.primary.blue : 
                Colors.neutrals.gray600
              } 
            />
          </TouchableOpacity>
        )}
      </Animated.View>
      
      {error ? (
        <Text style={styles.errorText} accessibilityRole="alert">{error}</Text>
      ) : helper ? (
        <Text style={styles.helperText}>{helper}</Text>
      ) : null}
    </Animated.View>
  )
}

const styles = StyleSheet.create({
  container: {
    marginBottom: 16,
    width: '100%'
  },
  labelContainer: {
    marginBottom: 8,
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray800
  },
  required: {
    color: Colors.secondary.red,
    fontWeight: Typography.weights.bold
  },
  inputContainer: {
    flexDirection: 'row',
    borderWidth: 1,
    borderColor: Colors.neutrals.gray300,
    borderRadius: 8,
    backgroundColor: Colors.neutrals.white,
    overflow: 'hidden'
  },
  input: {
    flex: 1,
    color: Colors.neutrals.gray900,
    fontSize: Typography.sizes.body,
    paddingHorizontal: 12
  },
  multilineInput: {
    paddingTop: 12,
    paddingBottom: 12,
    textAlignVertical: 'top'
  },
  disabledInput: {
    backgroundColor: Colors.neutrals.gray100,
    color: Colors.neutrals.gray600
  },
  iconButton: {
    paddingHorizontal: 12,
    justifyContent: 'center',
    alignItems: 'center'
  },
  errorText: {
    color: Colors.secondary.red,
    fontSize: Typography.sizes.bodySmall,
    marginTop: 4,
    marginLeft: 4
  },
  helperText: {
    color: Colors.neutrals.gray600,
    fontSize: Typography.sizes.bodySmall,
    marginTop: 4,
    marginLeft: 4
  }
})

export default TextInputField