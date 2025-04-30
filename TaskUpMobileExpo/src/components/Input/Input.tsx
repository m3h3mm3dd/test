import React, { useState, useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TextInput, 
  View, 
  TouchableOpacity, 
  ViewStyle,
  TextStyle,
  NativeSyntheticEvent,
  TextInputFocusEventData,
  KeyboardTypeOptions,
  Platform
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  interpolate,
  Extrapolation,
  interpolateColor,
  withSequence,
  FadeIn
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Metrics from '../../theme/Metrics';
import { triggerImpact } from '../../utils/HapticUtils';
import { useTheme } from '../../hooks/useColorScheme';

interface InputProps {
  label: string;
  value: string;
  onChangeText: (text: string) => void;
  placeholder?: string;
  secureTextEntry?: boolean;
  disabled?: boolean;
  error?: string;
  helper?: string;
  rightIcon?: keyof typeof Feather.glyphMap;
  leftIcon?: keyof typeof Feather.glyphMap;
  onRightIconPress?: () => void;
  onLeftIconPress?: () => void;
  keyboardType?: KeyboardTypeOptions;
  autoCapitalize?: 'none' | 'sentences' | 'words' | 'characters';
  autoCorrect?: boolean;
  style?: ViewStyle;
  inputStyle?: TextStyle;
  maxLength?: number;
  multiline?: boolean;
  numberOfLines?: number;
  onFocus?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  onBlur?: (e: NativeSyntheticEvent<TextInputFocusEventData>) => void;
  animateSuccess?: boolean;
  returnKeyType?: 'done' | 'go' | 'next' | 'search' | 'send';
  onSubmitEditing?: () => void;
  required?: boolean;
}

const AnimatedTextInput = Animated.createAnimatedComponent(TextInput);
const AnimatedText = Animated.createAnimatedComponent(Text);

const Input = ({
  label,
  value,
  onChangeText,
  placeholder = '',
  secureTextEntry = false,
  disabled = false,
  error,
  helper,
  rightIcon,
  leftIcon,
  onRightIconPress,
  onLeftIconPress,
  keyboardType,
  autoCapitalize = 'none',
  autoCorrect = false,
  style,
  inputStyle,
  maxLength,
  multiline = false,
  numberOfLines = 1,
  onFocus,
  onBlur,
  animateSuccess = false,
  returnKeyType,
  onSubmitEditing,
  required = false
}: InputProps) => {
  const { colors, isDark } = useTheme();
  const [isFocused, setIsFocused] = useState(false);
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  
  // Shared animation values
  const focusAnimation = useSharedValue(0);
  const labelPosition = useSharedValue(value ? 1 : 0);
  const errorAnimScale = useSharedValue(0);
  const successAnimScale = useSharedValue(0);
  const inputOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Animate in
    inputOpacity.value = withTiming(1, { duration: 300 });
    
    // Animate label position when value changes
    if (value) {
      labelPosition.value = withTiming(1, { duration: 200 });
    } else if (!isFocused) {
      labelPosition.value = withTiming(0, { duration: 200 });
    }
    
    // Show success animation when value is valid and animateSuccess is true
    if (value && !error && animateSuccess) {
      setTimeout(() => {
        setShowSuccess(true);
        successAnimScale.value = withTiming(1, { duration: 300 });
        setTimeout(() => {
          successAnimScale.value = withTiming(0, { duration: 300 });
          setTimeout(() => {
            setShowSuccess(false);
          }, 300);
        }, 1000);
      }, 300);
    }
  }, [value, error]);
  
  useEffect(() => {
    // Animate border when error changes
    if (error) {
      errorAnimScale.value = withTiming(1, { duration: 300 });
      triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    } else {
      errorAnimScale.value = withTiming(0, { duration: 200 });
    }
  }, [error]);
  
  const handleFocus = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(true);
    focusAnimation.value = withTiming(1, { duration: 200 });
    labelPosition.value = withTiming(1, { duration: 200 });
    
    // Subtle haptic feedback
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    if (onFocus) {
      onFocus(e);
    }
  };
  
  const handleBlur = (e: NativeSyntheticEvent<TextInputFocusEventData>) => {
    setIsFocused(false);
    focusAnimation.value = withTiming(0, { duration: 200 });
    
    if (!value) {
      labelPosition.value = withTiming(0, { duration: 200 });
    }
    
    if (onBlur) {
      onBlur(e);
    }
  };
  
  const togglePasswordVisibility = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    setIsPasswordVisible(!isPasswordVisible);
  };
  
  // Animated styles
  const containerAnimatedStyle = useAnimatedStyle(() => {
    const borderColor = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [
        isDark ? colors.input.border : Colors.neutrals.gray300, 
        colors.primary[500]
      ]
    );
    
    return {
      borderColor: error ? Colors.error[500] : borderColor,
      opacity: inputOpacity.value
    };
  });
  
  const labelAnimatedStyle = useAnimatedStyle(() => {
    const top = interpolate(
      labelPosition.value,
      [0, 1],
      [multiline ? 16 : (Metrics.inputHeight.md - 20) / 2, -10],
      Extrapolation.CLAMP
    );
    
    const fontSize = interpolate(
      labelPosition.value,
      [0, 1],
      [Typography.sizes.md, Typography.sizes.xs],
      Extrapolation.CLAMP
    );
    
    const backgroundColor = interpolateColor(
      labelPosition.value,
      [0, 1],
      ['transparent', isDark ? colors.background.light : Colors.background.light]
    );
    
    const color = interpolateColor(
      focusAnimation.value,
      [0, 1],
      [
        isDark ? colors.text.secondary : Colors.neutrals.gray600, 
        colors.primary[500]
      ]
    );
    
    return {
      top,
      fontSize,
      backgroundColor,
      color: error ? Colors.error[500] : color,
      transform: [
        { translateY: 0 },
        { translateX: 0 },
        { scale: labelPosition.value === 0 ? 1 : 0.9 }
      ]
    };
  });
  
  const inputAnimatedStyle = useAnimatedStyle(() => {
    const translateY = interpolate(
      labelPosition.value,
      [0, 1],
      [0, 0],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [{ translateY }]
    };
  });
  
  const errorShakeStyle = useAnimatedStyle(() => {
    return {
      opacity: errorAnimScale.value,
      transform: [
        { 
          translateX: interpolate(
            errorAnimScale.value,
            [0, 0.25, 0.5, 0.75, 1],
            [0, -2, 0, 2, 0],
            Extrapolation.CLAMP
          )
        }
      ]
    };
  });
  
  const successAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: successAnimScale.value,
      transform: [{ scale: successAnimScale.value }]
    };
  });
  
  // Default placeholder is empty when using a floating label
  const dynamicPlaceholder = isFocused || labelPosition.value === 1 ? placeholder : '';
  
  // Password visibility icon
  const getPasswordIcon = () => isPasswordVisible ? 'eye-off' : 'eye';
  
  const inputHeight = multiline 
    ? Math.max(Metrics.inputHeight.md, numberOfLines * 24) 
    : Metrics.inputHeight.md;
  
  return (
    <Animated.View 
      style={[styles.container, style]}
      entering={FadeIn.duration(300)}
    >
      <Animated.View 
        style={[
          styles.inputContainer, 
          {
            height: inputHeight,
            paddingTop: multiline ? 24 : 0,
            backgroundColor: isDark ? colors.input.background : Colors.neutrals.white
          },
          containerAnimatedStyle
        ]}
      >
        <AnimatedText 
          style={[
            styles.label, 
            labelAnimatedStyle
          ]}
        >
          {label}{required && <Text style={styles.requiredAsterisk}>*</Text>}
        </AnimatedText>
        
        {leftIcon && (
          <TouchableOpacity 
            style={styles.leftIcon} 
            onPress={onLeftIconPress}
            disabled={!onLeftIconPress}
            accessibilityRole={onLeftIconPress ? 'button' : undefined}
            accessibilityLabel={onLeftIconPress ? `${leftIcon} button` : undefined}
          >
            <Feather 
              name={leftIcon} 
              size={18} 
              color={
                error ? Colors.error[500] : 
                isFocused ? colors.primary[500] : 
                isDark ? colors.text.secondary : Colors.neutrals.gray600
              } 
            />
          </TouchableOpacity>
        )}
        
        <AnimatedTextInput
          style={[
            styles.input, 
            {
              paddingLeft: leftIcon ? 40 : 12,
              paddingRight: (rightIcon || secureTextEntry) ? 40 : 12,
              paddingTop: multiline ? 8 : 0,
              paddingBottom: multiline ? 8 : 0,
              height: multiline ? '100%' : '100%',
              textAlignVertical: multiline ? 'top' : 'center',
              color: isDark ? colors.text.primary : Colors.neutrals.gray900
            },
            disabled && [
              styles.disabledInput, 
              { backgroundColor: isDark ? 'rgba(0,0,0,0.2)' : Colors.neutrals.gray100 }
            ],
            inputStyle,
            inputAnimatedStyle
          ]}
          placeholder={dynamicPlaceholder}
          placeholderTextColor={isDark ? colors.input.placeholderText : Colors.neutrals.gray500}
          value={value}
          onChangeText={onChangeText}
          secureTextEntry={secureTextEntry && !isPasswordVisible}
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          accessible={true}
          accessibilityLabel={label}
          accessibilityHint={placeholder}
          accessibilityState={{ disabled }}
          autoCapitalize={autoCapitalize}
          autoCorrect={autoCorrect}
          keyboardType={keyboardType}
          maxLength={maxLength}
          multiline={multiline}
          numberOfLines={multiline ? numberOfLines : undefined}
          returnKeyType={returnKeyType}
          onSubmitEditing={onSubmitEditing}
        />
        
        {secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={togglePasswordVisibility}
            accessible={true}
            accessibilityRole="button"
            accessibilityLabel={`${isPasswordVisible ? 'Hide' : 'Show'} password`}
          >
            <Feather 
              name={getPasswordIcon()} 
              size={18} 
              color={isDark ? colors.text.secondary : Colors.neutrals.gray600} 
            />
          </TouchableOpacity>
        )}
        
        {rightIcon && !secureTextEntry && (
          <TouchableOpacity 
            style={styles.rightIcon} 
            onPress={onRightIconPress}
            disabled={!onRightIconPress}
            accessibilityRole={onRightIconPress ? 'button' : undefined}
            accessibilityLabel={onRightIconPress ? `${rightIcon} button` : undefined}
          >
            <Feather 
              name={rightIcon} 
              size={18} 
              color={
                error ? Colors.error[500] : 
                isFocused ? colors.primary[500] : 
                isDark ? colors.text.secondary : Colors.neutrals.gray600
              } 
            />
          </TouchableOpacity>
        )}
        
        {showSuccess && (
          <Animated.View style={[styles.successIcon, successAnimStyle]}>
            <Feather 
              name="check-circle" 
              size={18} 
              color={Colors.success[500]} 
            />
          </Animated.View>
        )}
      </Animated.View>
      
      <Animated.View style={errorShakeStyle}>
        {error && <Text style={styles.errorText}>{error}</Text>}
      </Animated.View>
      
      {helper && !error && (
        <Text 
          style={[
            styles.helperText,
            { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 }
          ]}
        >
          {helper}
        </Text>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    marginBottom: 20
  },
  inputContainer: {
    position: 'relative',
    borderWidth: 1,
    borderColor: Colors.neutrals.gray300,
    borderRadius: 8,
    backgroundColor: Colors.neutrals.white,
    justifyContent: 'center'
  },
  label: {
    position: 'absolute',
    left: 12,
    paddingHorizontal: 4,
    zIndex: 1,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray600
  },
  requiredAsterisk: {
    color: Colors.error[500],
    fontWeight: Typography.weights.bold
  },
  input: {
    flex: 1,
    color: Colors.neutrals.gray900,
    fontSize: Typography.sizes.md,
    paddingHorizontal: 12
  },
  disabledInput: {
    backgroundColor: Colors.neutrals.gray100,
    color: Colors.neutrals.gray600
  },
  leftIcon: {
    position: 'absolute',
    left: 12,
    height: '100%',
    justifyContent: 'center',
    zIndex: 2
  },
  rightIcon: {
    position: 'absolute',
    right: 12,
    height: '100%',
    justifyContent: 'center',
    zIndex: 2
  },
  errorText: {
    color: Colors.error[500],
    fontSize: Typography.sizes.xs,
    marginTop: 4,
    marginLeft: 4
  },
  helperText: {
    color: Colors.neutrals.gray600,
    fontSize: Typography.sizes.xs,
    marginTop: 4,
    marginLeft: 4
  },
  successIcon: {
    position: 'absolute',
    right: 12,
    top: '50%',
    transform: [{ translateY: -9 }]
  }
});

export default Input;