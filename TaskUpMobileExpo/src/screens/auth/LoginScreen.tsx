// TaskUpMobileExpo/src/screens/auth/LoginScreen.tsx

import React, { useState, useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Keyboard
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown,
  Easing
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

const { width, height } = Dimensions.get('window')

const LoginScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  const scrollViewRef = useRef()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [rememberMe, setRememberMe] = useState(false)
  const [loading, setLoading] = useState(false)
  
  // Validation state
  const [emailError, setEmailError] = useState('')
  const [passwordError, setPasswordError] = useState('')
  
  // Animation values
  const logoScale = useSharedValue(0.8)
  const formOpacity = useSharedValue(0)
  const formTranslateY = useSharedValue(50)
  const formScale = useSharedValue(0.98)
  const checkboxScale = useSharedValue(1)
  const buttonScale = useSharedValue(1)
  const backgroundGradientPosition = useSharedValue(0)
  const socialButtonsOpacity = useSharedValue(0)
  
  // Keyboard listeners to adjust scroll when keyboard appears/disappears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        scrollViewRef.current?.scrollTo({ y: 100, animated: true })
      }
    )
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        scrollViewRef.current?.scrollTo({ y: 0, animated: true })
      }
    )
    
    return () => {
      keyboardDidShowListener.remove()
      keyboardDidHideListener.remove()
    }
  }, [])
  
  // Initialize animations
  useEffect(() => {
    StatusBar.setBarStyle('light-content')
    
    // Background gradient animation
    backgroundGradientPosition.value = withTiming(1, { 
      duration: 3000,
      easing: Easing.out(Easing.exp)
    })
    
    // Logo animation with bounce effect
    logoScale.value = withSequence(
      withTiming(1.1, { duration: 600, easing: Easing.out(Easing.back(2)) }),
      withTiming(1, { duration: 400, easing: Easing.inOut(Easing.ease) })
    )
    
    // Form animations
    formOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 600 })
    )
    
    formTranslateY.value = withDelay(
      600,
      withSpring(0, { 
        damping: 14,
        stiffness: 100,
        mass: 1
      })
    )
    
    formScale.value = withDelay(
      600,
      withSpring(1, { 
        damping: 14,
        stiffness: 100,
        mass: 1
      })
    )
    
    // Social buttons fade in last
    socialButtonsOpacity.value = withDelay(
      1000,
      withTiming(1, { duration: 600 })
    )
    
    return () => {
      StatusBar.setBarStyle('dark-content')
    }
  }, [])
  
  // Handle login submission
  const handleLogin = () => {
    // Validate inputs
    let isValid = true
    
    if (!email) {
      setEmailError('Email is required')
      isValid = false
    } else if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email')
      isValid = false
    } else {
      setEmailError('')
    }
    
    if (!password) {
      setPasswordError('Password is required')
      isValid = false
    } else if (password.length < 6) {
      setPasswordError('Password must be at least 6 characters')
      isValid = false
    } else {
      setPasswordError('')
    }
    
    // Animate button press with subtle bounce
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 15, stiffness: 300 })
    )
    
    // If validation passes, attempt login
    if (isValid) {
      triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
      setLoading(true)
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        
        // Navigate with fade out animation
        formOpacity.value = withTiming(0, { duration: 300 })
        logoScale.value = withTiming(0.8, { duration: 300 })
        
        // Navigate after animation completes
        setTimeout(() => {
          navigation.replace('MainTabs')
        }, 300)
      }, 1500)
    } else {
      triggerImpact(Haptics.NotificationFeedbackType.Error)
      
      // Shake form on validation error
      formScale.value = withSequence(
        withTiming(0.98, { duration: 100 }),
        withTiming(1.01, { duration: 100 }),
        withTiming(0.99, { duration: 100 }),
        withSpring(1, { damping: 12 })
      )
    }
  }
  
  // Toggle remember me checkbox
  const toggleRememberMe = () => {
    setRememberMe(!rememberMe)
    
    // Animate checkbox with bounce
    checkboxScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    )
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
  }
  
  // Navigate to forgot password
  const navigateToForgotPassword = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.navigate('ForgotPassword')
  }
  
  // Navigate to sign up
  const navigateToSignUp = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    // Animate exit
    formOpacity.value = withTiming(0, { duration: 300 })
    
    setTimeout(() => {
      navigation.navigate('SignUpStep1')
    }, 300)
  }
  
  // Handle social login
  const handleSocialLogin = (provider) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
    // Implementation would go here
    console.log(`Login with ${provider}`)
  }
  
  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }]
    }
  })
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [
        { translateY: formTranslateY.value },
        { scale: formScale.value }
      ]
    }
  })
  
  const checkboxAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkboxScale.value }]
    }
  })
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    }
  })
  
  const backgroundGradientStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      backgroundGradientPosition.value,
      [0, 1],
      [-width * 0.3, 0],
      Extrapolation.CLAMP
    )
    
    return {
      transform: [{ translateX }]
    }
  })
  
  const socialButtonsStyle = useAnimatedStyle(() => {
    return {
      opacity: socialButtonsOpacity.value
    }
  })

  return (
    <View style={styles.container}>
      {/* Background gradient with animation */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundGradientStyle]}>
        <LinearGradient
          colors={[Colors.primary[800], Colors.primary[600], Colors.primary.blue]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
      </Animated.View>
      
      {/* Background decoration */}
      <View style={styles.decorationCircle1} />
      <View style={styles.decorationCircle2} />
      <View style={styles.decorationCircle3} />
      
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={styles.keyboardAvoidingView}
      >
        <ScrollView 
          ref={scrollViewRef}
          contentContainerStyle={[
            styles.scrollContent,
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and header */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoCircle}>
              <LinearGradient
                colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
                borderRadius={40}
              />
              <Feather name="check-square" size={48} color="#fff" />
            </View>
            <Animated.Text 
              style={styles.appName}
              entering={FadeInDown.delay(300).duration(600)}
            >
              TaskUp
            </Animated.Text>
            <Animated.Text 
              style={styles.appTagline}
              entering={FadeInDown.delay(500).duration(600)}
            >
              Manage tasks with ease
            </Animated.Text>
          </Animated.View>
          
          {/* Login form */}
          <Animated.View 
            style={[styles.formContainer, formAnimatedStyle]}
          >
            <Text style={styles.formTitle}>Login</Text>
            
            <View style={styles.inputGroup}>
              <Input
                label="Email"
                value={email}
                onChangeText={(text) => {
                  setEmail(text)
                  if (emailError) setEmailError('')
                }}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail"
                error={emailError}
                animateSuccess={email.length > 0 && isValidEmail(email)}
              />
              
              <Input
                label="Password"
                value={password}
                onChangeText={(text) => {
                  setPassword(text)
                  if (passwordError) setPasswordError('')
                }}
                placeholder="Enter your password"
                secureTextEntry
                leftIcon="lock"
                error={passwordError}
              />
            </View>
            
            <View style={styles.optionsRow}>
              <TouchableOpacity 
                style={styles.rememberMeContainer}
                onPress={toggleRememberMe}
                activeOpacity={0.7}
              >
                <Animated.View 
                  style={[
                    styles.checkbox, 
                    rememberMe && styles.checkboxChecked,
                    checkboxAnimatedStyle
                  ]}
                >
                  {rememberMe && (
                    <Feather name="check" size={14} color="#fff" />
                  )}
                </Animated.View>
                <Text style={styles.rememberMeText}>Remember me</Text>
              </TouchableOpacity>
              
              <TouchableOpacity 
                onPress={navigateToForgotPassword}
                activeOpacity={0.7}
              >
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            
            <Animated.View style={buttonAnimatedStyle}>
              <Button
                title="Login"
                onPress={handleLogin}
                fullWidth
                loading={loading}
                style={styles.loginButton}
                gradientColors={[Colors.primary.blue, Colors.primary[700]]}
                animationType="bounce"
                round
              />
            </Animated.View>
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>
            
            <Animated.View 
              style={[styles.socialButtonsContainer, socialButtonsStyle]}
            >
              <TouchableOpacity 
                style={styles.socialButton}
                activeOpacity={0.8}
                onPress={() => handleSocialLogin('github')}
              >
                <LinearGradient
                  colors={['rgba(0, 0, 0, 0.8)', 'rgba(0, 0, 0, 0.6)']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  borderRadius={25}
                />
                <Feather name="github" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                activeOpacity={0.8}
                onPress={() => handleSocialLogin('twitter')}
              >
                <LinearGradient
                  colors={['#1DA1F2', '#0C85D0']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  borderRadius={25}
                />
                <Feather name="twitter" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity 
                style={styles.socialButton}
                activeOpacity={0.8}
                onPress={() => handleSocialLogin('google')}
              >
                <LinearGradient
                  colors={['#DB4437', '#C31C17']}
                  style={StyleSheet.absoluteFill}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  borderRadius={25}
                />
                <Feather name="mail" size={20} color="#fff" />
              </TouchableOpacity>
            </Animated.View>
          </Animated.View>
          
          {/* Sign up link */}
          <Animated.View 
            style={styles.signUpContainer}
            entering={FadeInUp.delay(1600).duration(600)}
          >
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <TouchableOpacity 
              onPress={navigateToSignUp}
              activeOpacity={0.7}
              style={styles.signUpButton}
            >
              <Text style={styles.signUpLink}>Sign Up</Text>
            </TouchableOpacity>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Version info */}
      <Animated.Text 
        style={[styles.versionText, { bottom: insets.bottom + 8 }]}
        entering={FadeIn.delay(2000).duration(1000)}
      >
        Version 1.0.0
      </Animated.Text>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: Colors.primary[700]
  },
  keyboardAvoidingView: {
    flex: 1
  },
  scrollContent: {
    flexGrow: 1,
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: Spacing.lg
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xxl
  },
  logoCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  appName: {
    fontSize: 36,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: Spacing.xs
  },
  appTagline: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  formContainer: {
    width: '100%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 24,
    padding: Spacing.xl,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  formTitle: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.gray900,
    marginBottom: Spacing.lg
  },
  inputGroup: {
    marginBottom: Spacing.md
  },
  optionsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: Spacing.xl
  },
  rememberMeContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 4,
    borderWidth: 2,
    borderColor: Colors.primary.blue,
    marginRight: Spacing.xs,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkboxChecked: {
    backgroundColor: Colors.primary.blue
  },
  rememberMeText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray700
  },
  forgotPasswordText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  loginButton: {
    height: 56
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: Spacing.xl
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: Colors.neutrals.gray300
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray600
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginBottom: Spacing.md
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 8,
    elevation: 6,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: Spacing.md,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 30
  },
  signUpText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.white
  },
  signUpButton: {
    marginLeft: Spacing.xs,
  },
  signUpLink: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    textDecorationLine: 'underline'
  },
  versionText: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.6)'
  },
  // Decorative elements
  decorationCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -50,
    right: -70
  },
  decorationCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 80,
    left: -70
  },
  decorationCircle3: {
    position: 'absolute',
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 150,
    right: -30
  }
})

export default LoginScreen