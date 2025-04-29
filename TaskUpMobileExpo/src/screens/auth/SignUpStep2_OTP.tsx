import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  TextInput,
  Keyboard
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  FadeIn,
  FadeInUp,
  FadeInDown
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Spacing from '../../theme/Spacing'
import Button from '../../components/Button/Button'
import { triggerImpact } from '../../utils/HapticUtils'

// Number of OTP digits
const OTP_LENGTH = 6

// Timer duration in seconds
const TIMER_DURATION = 60

const SignUpStep2 = ({ route, navigation }) => {
  const { email } = route.params || { email: 'user@example.com' }
  const insets = useSafeAreaInsets()
  
  // OTP state
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''))
  const [otpError, setOtpError] = useState('')
  const [focusedIndex, setFocusedIndex] = useState(0)
  const [loading, setLoading] = useState(false)
  
  // Timer state
  const [timerCount, setTimerCount] = useState(TIMER_DURATION)
  const [isResendActive, setIsResendActive] = useState(false)
  
  // Refs for OTP inputs
  const inputRefs = useRef([])
  
  // Animation values
  const progressWidth = useSharedValue(66)
  const otpContainerScale = useSharedValue(1)
  const otpShakeValues = Array(OTP_LENGTH).fill(0).map(() => useSharedValue(0))
  
  // Initialize refs for OTP inputs
  useEffect(() => {
    inputRefs.current = Array(OTP_LENGTH).fill(null).map((_, i) => inputRefs.current[i] || React.createRef())
  }, [])
  
  // Setup timer
  useEffect(() => {
    let interval
    
    if (timerCount > 0) {
      interval = setInterval(() => {
        setTimerCount(prev => prev - 1)
      }, 1000)
    } else {
      setIsResendActive(true)
    }
    
    return () => clearInterval(interval)
  }, [timerCount])
  
  // Auto-focus first input on mount
  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      if (inputRefs.current[0]?.focus) {
        inputRefs.current[0].focus()
      }
    }, 500)
    
    return () => clearTimeout(timer)
  }, [])
  
  // Format timer
  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60)
    const secs = seconds % 60
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`
  }
  
  // Handle OTP input
  const handleOtpChange = (text, index) => {
    // Only allow digits
    if (!/^\d*$/.test(text)) return
    
    // Update OTP array
    const newOtp = [...otp]
    newOtp[index] = text.substr(0, 1)
    setOtp(newOtp)
    
    // Clear any previous errors
    if (otpError) setOtpError('')
    
    // If input is filled and not the last input, focus next input
    if (text.length === 1 && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1].focus()
      setFocusedIndex(index + 1)
    }
    
    // If all inputs are filled, trigger verification
    if (text.length === 1 && index === OTP_LENGTH - 1) {
      // Check if all inputs are filled
      if (newOtp.every(digit => digit !== '')) {
        Keyboard.dismiss()
        // Wait for keyboard to dismiss
        setTimeout(() => {
          handleVerifyOtp()
        }, 300)
      }
    }
  }
  
  // Handle backspace key press
  const handleKeyPress = (e, index) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      // Focus previous input on backspace if current input is empty
      inputRefs.current[index - 1].focus()
      setFocusedIndex(index - 1)
    }
  }
  
  // Handle OTP input focus
  const handleInputFocus = (index) => {
    setFocusedIndex(index)
  }
  
  // Verify OTP
  const handleVerifyOtp = () => {
    if (otp.some(digit => digit === '')) {
      setOtpError('Please enter a valid 6-digit code')
      shakeOtpInputs()
      return
    }
    
    // Clear any previous errors
    setOtpError('')
    
    // Show loading state
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)
    
    // Simulate API verification
    setTimeout(() => {
      setLoading(false)
      
      // For demo, accept any 6-digit code
      // In production, this would validate against an API
      const enteredOtp = otp.join('')
      
      // Demo: Always accept "123456" as valid
      if (enteredOtp === '123456') {
        // Navigate to next step
        navigation.navigate('SignUpStep3', { email })
      } else {
        // Show error for invalid OTP
        setOtpError('Invalid verification code. Please try again.')
        shakeOtpInputs()
      }
    }, 1500)
  }
  
  // Resend OTP
  const handleResendOtp = () => {
    if (!isResendActive) return
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    // Reset timer and disable resend button
    setTimerCount(TIMER_DURATION)
    setIsResendActive(false)
    
    // Clear current OTP and errors
    setOtp(Array(OTP_LENGTH).fill(''))
    setOtpError('')
    
    // Focus first input
    if (inputRefs.current[0]?.focus) {
      inputRefs.current[0].focus()
      setFocusedIndex(0)
    }
    
    // Show success animation
    otpContainerScale.value = withSequence(
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 200 })
    )
  }
  
  // Go back to previous step
  const handleBack = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }
  
  // Animation for input validation error
  const shakeOtpInputs = () => {
    triggerImpact(Haptics.NotificationFeedbackType.Error)
    
    // Shake animation for OTP inputs
    otpShakeValues.forEach((shakeValue, index) => {
      shakeValue.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(0, { duration: 50 })
      )
    })
  }
  
  // Animated styles
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`
    }
  })
  
  const otpContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: otpContainerScale.value }]
    }
  })
  
  // Get animated style for each OTP input
  const getInputAnimatedStyle = (index) => {
    return useAnimatedStyle(() => {
      return {
        transform: [{ translateX: otpShakeValues[index].value }]
      }
    })
  }

  return (
    <View style={styles.container}>
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.primary.darkBlue, Colors.primary.blue]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button */}
          <View style={styles.header}>
            <TouchableOpacity 
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Animated.Text 
              style={styles.stepText}
              entering={FadeIn.delay(300).duration(600)}
            >
              Step 2 of 3
            </Animated.Text>
          </View>
          
          {/* Progress indicator */}
          <Animated.View 
            style={styles.progressContainer}
            entering={FadeInDown.delay(400).duration(600)}
          >
            <View style={styles.progressBar}>
              <Animated.View 
                style={[styles.progressIndicator, progressAnimatedStyle]} 
              />
            </View>
          </Animated.View>
          
          {/* Title */}
          <Animated.View 
            style={styles.titleContainer}
            entering={FadeInDown.delay(500).duration(600)}
          >
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </Animated.View>
          
          {/* OTP Inputs */}
          <Animated.View 
            style={[styles.otpContainer, otpContainerAnimatedStyle]}
            entering={FadeInUp.delay(600).duration(800)}
          >
            <View style={styles.otpInputsContainer}>
              {Array(OTP_LENGTH).fill(0).map((_, index) => {
                // Get animated style for this input
                const inputAnimatedStyle = getInputAnimatedStyle(index)
                
                return (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.otpInputWrapper,
                      focusedIndex === index && styles.otpInputWrapperFocused,
                      inputAnimatedStyle
                    ]}
                  >
                    <TextInput
                      ref={el => inputRefs.current[index] = el}
                      style={styles.otpInput}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[index]}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => handleInputFocus(index)}
                      selectTextOnFocus
                    />
                  </Animated.View>
                )
              })}
            </View>
            
            {otpError ? (
              <Text style={styles.errorText}>{otpError}</Text>
            ) : (
              <Text style={styles.helperText}>Enter verification code</Text>
            )}
            
            <View style={styles.timerContainer}>
              <Text style={styles.timerText}>
                {isResendActive ? 'Didn\'t receive code?' : `Resend code in ${formatTime(timerCount)}`}
              </Text>
              
              <TouchableOpacity
                onPress={handleResendOtp}
                disabled={!isResendActive}
              >
                <Text 
                  style={[
                    styles.resendText,
                    !isResendActive && styles.resendTextDisabled
                  ]}
                >
                  Resend
                </Text>
              </TouchableOpacity>
            </View>
            
            <Button
              title="Verify & Continue"
              onPress={handleVerifyOtp}
              fullWidth
              loading={loading}
              style={styles.verifyButton}
              gradientColors={[Colors.primary.blue, Colors.primary.darkBlue]}
              animationType="bounce"
            />
          </Animated.View>
          
          {/* Helper text */}
          <Animated.View 
            style={styles.helperContainer}
            entering={FadeInUp.delay(800).duration(600)}
          >
            <Text style={styles.helpText}>
              Having trouble? <Text style={styles.helpLink}>Contact Support</Text>
            </Text>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.background.light
  },
  keyboardAvoidingView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: Spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  stepText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.white,
    fontWeight: Typography.weights.medium
  },
  progressContainer: {
    marginBottom: Spacing.xl
  },
  progressBar: {
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 2,
    overflow: 'hidden'
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 2
  },
  titleContainer: {
    marginBottom: Spacing.xl
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: Spacing.sm
  },
  subtitle: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)',
    lineHeight: 24
  },
  emailText: {
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white
  },
  otpContainer: {
    width: '100%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 24,
    padding: Spacing.xl,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10,
    marginBottom: Spacing.xl
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md
  },
  otpInputWrapper: {
    width: 48,
    height: 56,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: Colors.neutrals.gray300,
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: Colors.neutrals.white
  },
  otpInputWrapperFocused: {
    borderColor: Colors.primary.blue,
    borderWidth: 2,
    shadowColor: Colors.primary.blue,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    color: Colors.neutrals.gray900
  },
  errorText: {
    color: Colors.secondary.red,
    fontSize: Typography.sizes.bodySmall,
    marginBottom: Spacing.md,
    textAlign: 'center'
  },
  helperText: {
    color: Colors.neutrals.gray600,
    fontSize: Typography.sizes.bodySmall,
    marginBottom: Spacing.md,
    textAlign: 'center'
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl
  },
  timerText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  resendText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.blue,
    marginLeft: Spacing.xs
  },
  resendTextDisabled: {
    color: Colors.neutrals.gray400
  },
  verifyButton: {
    height: 56
  },
  helperContainer: {
    alignItems: 'center'
  },
  helpText: {
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  helpLink: {
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    textDecorationLine: 'underline'
  }
})

export default SignUpStep2