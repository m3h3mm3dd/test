import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  Image, 
  ScrollView, 
  KeyboardAvoidingView,
  Platform,
  Dimensions,
  StatusBar,
  Alert
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeInDown,
  FadeInUp,
  SlideInDown
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
  const checkboxScale = useSharedValue(1)
  
  // Initialize animations
  useEffect(() => {
    StatusBar.setBarStyle('light-content')
    
    // Logo animation
    logoScale.value = withSequence(
      withTiming(1.2, { duration: 800 }),
      withTiming(1, { duration: 400 })
    )
    
    // Form fade in
    formOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 800 })
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
    
    // If validation passes, attempt login
    if (isValid) {
      triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
      setLoading(true)
      
      // Simulate API call
      setTimeout(() => {
        setLoading(false)
        
        // Navigate to dashboard on success
        navigation.replace('MainTabs')
      }, 1500)
    }
  }
  
  // Toggle remember me checkbox
  const toggleRememberMe = () => {
    setRememberMe(!rememberMe)
    
    // Animate checkbox
    checkboxScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, { damping: 12 })
    )
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
  }
  
  // Navigate to forgot password
  const navigateToForgotPassword = () => {
    navigation.navigate('ForgotPassword')
  }
  
  // Navigate to sign up
  const navigateToSignUp = () => {
    navigation.navigate('SignUpStep1')
  }
  
  // Animated styles
  const logoAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: logoScale.value }]
    }
  })
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value
    }
  })
  
  const checkboxAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: checkboxScale.value }]
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
            { paddingTop: insets.top + 40, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Logo and header */}
          <Animated.View style={[styles.logoContainer, logoAnimatedStyle]}>
            <View style={styles.logoCircle}>
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
            entering={FadeInUp.delay(700).duration(800)}
          >
            <Text style={styles.formTitle}>Login</Text>
            
            <View style={styles.inputGroup}>
              <Input
                label="Email"
                value={email}
                onChangeText={setEmail}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail"
                error={emailError}
              />
              
              <Input
                label="Password"
                value={password}
                onChangeText={setPassword}
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
              
              <TouchableOpacity onPress={navigateToForgotPassword}>
                <Text style={styles.forgotPasswordText}>Forgot Password?</Text>
              </TouchableOpacity>
            </View>
            
            <Button
              title="Login"
              onPress={handleLogin}
              fullWidth
              loading={loading}
              style={styles.loginButton}
              gradientColors={[Colors.primary.blue, Colors.primary.darkBlue]}
              animationType="bounce"
            />
            
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR</Text>
              <View style={styles.divider} />
            </View>
            
            <View style={styles.socialButtonsContainer}>
              <Animated.View entering={SlideInDown.delay(1200).duration(500)}>
                <TouchableOpacity style={styles.socialButton}>
                  <Feather name="github" size={20} color={Colors.neutrals.gray700} />
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View entering={SlideInDown.delay(1300).duration(500)}>
                <TouchableOpacity style={styles.socialButton}>
                  <Feather name="twitter" size={20} color={Colors.neutrals.gray700} />
                </TouchableOpacity>
              </Animated.View>
              
              <Animated.View entering={SlideInDown.delay(1400).duration(500)}>
                <TouchableOpacity style={styles.socialButton}>
                  <Feather name="mail" size={20} color={Colors.neutrals.gray700} />
                </TouchableOpacity>
              </Animated.View>
            </View>
          </Animated.View>
          
          {/* Sign up link */}
          <Animated.View 
            style={styles.signUpContainer}
            entering={FadeInUp.delay(1600).duration(600)}
          >
            <Text style={styles.signUpText}>Don't have an account?</Text>
            <TouchableOpacity onPress={navigateToSignUp}>
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
    backgroundColor: Colors.background.light
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
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.md
  },
  appName: {
    fontSize: 32,
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
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 20,
    elevation: 10
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
    backgroundColor: Colors.neutrals.white,
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  signUpContainer: {
    flexDirection: 'row',
    marginTop: Spacing.xl
  },
  signUpText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.white
  },
  signUpLink: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    marginLeft: Spacing.xs,
    textDecorationLine: 'underline'
  },
  versionText: {
    position: 'absolute',
    alignSelf: 'center',
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.6)'
  }
})

export default LoginScreen