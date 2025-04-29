import React, { useState, useEffect } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
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
import Input from '../../components/Input/Input'
import Button from '../../components/Button/Button'
import { isValidEmail } from '../../utils/validators'
import { triggerImpact } from '../../utils/HapticUtils'

const SignUpStep1 = ({ navigation }) => {
  const insets = useSafeAreaInsets()
  
  // Form state
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState('')
  const [loading, setLoading] = useState(false)
  
  // Animation values
  const progressWidth = useSharedValue(33)
  const emailInputScale = useSharedValue(1)
  
  useEffect(() => {
    StatusBar.setBarStyle('light-content')
    return () => {
      StatusBar.setBarStyle('dark-content')
    }
  }, [])
  
  // Validate email and proceed to next step
  const handleContinue = () => {
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
    
    // Simulate API check for existing email
    setTimeout(() => {
      setLoading(false)
      
      // Navigate to next step with email
      navigation.navigate('SignUpStep2', { email })
    }, 1500)
  }
  
  // Animation for input validation error
  const shakeInput = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    // Add a subtle shake animation
    emailInputScale.value = withSpring(1.02, { damping: 2, stiffness: 500 }, () => {
      emailInputScale.value = withSpring(1)
    })
  }
  
  // Go back to login screen
  const handleBack = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    navigation.goBack()
  }
  
  // Animated styles
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`
    }
  })
  
  const emailInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: emailInputScale.value }]
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
            
            <Animated.Text 
              style={styles.stepText}
              entering={FadeIn.delay(300).duration(600)}
            >
              Step 1 of 3
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
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Let's start with your email</Text>
          </Animated.View>
          
          {/* Form */}
          <Animated.View 
            style={[styles.formContainer, emailInputAnimatedStyle]}
            entering={FadeInUp.delay(600).duration(800)}
          >
            <Input
              label="Email Address"
              value={email}
              onChangeText={setEmail}
              placeholder="your.email@example.com"
              keyboardType="email-address"
              autoCapitalize="none"
              leftIcon="mail"
              error={emailError}
              animateSuccess
            />
            
            <Text style={styles.privacyText}>
              By continuing, you agree to our 
              <Text style={styles.link}> Terms of Service </Text> 
              and 
              <Text style={styles.link}> Privacy Policy</Text>
            </Text>
            
            <Button
              title="Continue"
              onPress={handleContinue}
              fullWidth
              loading={loading}
              style={styles.continueButton}
              gradientColors={[Colors.primary.blue, Colors.primary.darkBlue]}
              animationType="bounce"
            />
          </Animated.View>
          
          {/* Alternative signup options */}
          <Animated.View 
            style={styles.alternativesContainer}
            entering={FadeInUp.delay(800).duration(600)}
          >
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
              <View style={styles.divider} />
            </View>
            
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity style={styles.socialButton}>
                <Feather name="github" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Feather name="twitter" size={20} color="#fff" />
              </TouchableOpacity>
              
              <TouchableOpacity style={styles.socialButton}>
                <Feather name="mail" size={20} color="#fff" />
              </TouchableOpacity>
            </View>
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
    marginBottom: Spacing.xs
  },
  subtitle: {
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
    elevation: 10,
    marginBottom: Spacing.xl
  },
  privacyText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600,
    textAlign: 'center',
    marginTop: Spacing.lg,
    marginBottom: Spacing.xl,
    lineHeight: 20
  },
  link: {
    color: Colors.primary.blue,
    fontWeight: Typography.weights.medium
  },
  continueButton: {
    height: 56
  },
  alternativesContainer: {
    marginTop: Spacing.md
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: Spacing.lg
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  dividerText: {
    marginHorizontal: Spacing.md,
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: Typography.weights.medium
  },
  socialButtonsContainer: {
    flexDirection: 'row',
    justifyContent: 'center'
  },
  socialButton: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginHorizontal: Spacing.sm
  }
})

export default SignUpStep1