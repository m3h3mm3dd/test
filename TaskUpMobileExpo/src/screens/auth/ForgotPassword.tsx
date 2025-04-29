import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
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
  FadeInDown,
  SlideInLeft
} from 'react-native-reanimated'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import { LinearGradient } from 'expo-linear-gradient'
import * as Haptics from 'expo-haptics'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Spacing from '../../theme/Spacing'
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import { isValidEmail } from '../../utils/validators'
import { triggerImpact } from '../../utils/HapticUtils'

const ForgotPassword = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  
  // Form state
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  const [success, setSuccess] = useState(false)
  
  // Animation values
  const inputScale = useSharedValue(1)
  const successOpacity = useSharedValue(0)
  
  useEffect(() => {
    StatusBar.setBarStyle('light-content')
    return () => {
      StatusBar.setBarStyle('dark-content')
    }
  }, [])
  
  // Handle form submission
  const handleSubmit = () => {
    // Dismiss keyboard
    Keyboard.dismiss()
    
    // Validate email
    if (!email) {
      setEmailError('Email is required')
      shakeInput()
      return
    }
    
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email')
      shakeInput()
      return
    }
    
    // Clear any previous errors
    setEmailError('')
    
    // Show loading state
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    setLoading(true)
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false)
      
      // Show success state
      setSuccess(true)
      
      // Animate success message
      successOpacity.value = withTiming(1, { duration: 500 })
      
      // Trigger success haptic
      triggerImpact(Haptics.NotificationFeedbackType.Success)
    }, 2000)
  }
  
  // Handle back button press
  const handleBack = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }
  
  // Handle login button press
  const handleLogin = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }
  
  // Animation for input validation error
  const shakeInput = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    // Add a subtle shake animation
    inputScale.value = withSequence(
      withTiming(1.02, { duration: 100 }),
      withTiming(0.98, { duration: 100 }),
      withTiming(1.02, { duration: 100 }),
      withSpring(1)
    )
  }
  
  // Animated styles
  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputScale.value }]
    }
  })
  
  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value
    }
  })

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
          </View>
          
          {/* Title */}
          <Animated.View 
            style={styles.titleContainer}
            entering={FadeInDown.delay(300).duration(600)}
          >
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password
            </Text>
          </Animated.View>
          
          {/* Form */}
          <Animated.View 
            style={[styles.formContainer, inputAnimatedStyle]}
            entering={FadeInUp.delay(400).duration(800)}
          >
            {success ? (
              <Animated.View 
                style={[styles.successContainer, successAnimatedStyle]}
                entering={FadeIn.duration(500)}
              >
                <View style={styles.successIconContainer}>
                  <Feather name="check-circle" size={60} color={Colors.secondary.green} />
                </View>
                
                <Text style={styles.successTitle}>Check Your Email</Text>
                
                <Text style={styles.successText}>
                  We've sent a password reset link to:
                </Text>
                
                <Text style={styles.successEmail}>{email}</Text>
                
                <Text style={styles.successHint}>
                  If you don't see the email, check your spam folder
                </Text>
                
                <Button
                  title="Return to Login"
                  onPress={handleLogin}
                  style={styles.loginButton}
                  variant="secondary"
                  animationType="spring"
                />
              </Animated.View>
            ) : (
              <>
                <Input
                  label="Email Address"
                  value={email}
                  onChangeText={setEmail}
                  placeholder="your.email@example.com"
                  keyboardType="email-address"
                  autoCapitalize="none"
                  leftIcon="mail"
                  error={emailError}
                />
                
                <Button
                  title="Send Reset Link"
                  onPress={handleSubmit}
                  fullWidth
                  loading={loading}
                  style={styles.submitButton}
                  gradientColors={[Colors.primary.blue, Colors.primary.darkBlue]}
                  animationType="bounce"
                />
              </>
            )}
          </Animated.View>
          
          {/* Footer */}
          <Animated.View 
            style={styles.footerContainer}
            entering={SlideInLeft.delay(600).duration(800)}
          >
            <TouchableOpacity 
              onPress={handleLogin}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
            >
              <Text style={styles.footerText}>
                <Feather name="arrow-left" size={16} color="#fff" /> Back to login
              </Text>
            </TouchableOpacity>
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
    marginBottom: Spacing.xl
  },
  backButton: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
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
  formContainer: {
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
  submitButton: {
    height: 56,
    marginTop: Spacing.lg
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl
  },
  footerText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.white,
    fontWeight: Typography.weights.medium
  },
  successContainer: {
    paddingVertical: Spacing.lg,
    alignItems: 'center'
  },
  successIconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(0, 200, 83, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg
  },
  successTitle: {
    fontSize: Typography.sizes.bodyLarge,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.sm
  },
  successText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray700,
    marginBottom: Spacing.xs,
    textAlign: 'center'
  },
  successEmail: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.blue,
    marginBottom: Spacing.md,
    textAlign: 'center'
  },
  successHint: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    marginBottom: Spacing.xl,
    textAlign: 'center'
  },
  loginButton: {
    minWidth: 200
  }
})

export default ForgotPassword