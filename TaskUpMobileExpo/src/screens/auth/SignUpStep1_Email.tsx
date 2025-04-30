
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StatusBar,
  Keyboard,
  Dimensions
} from 'react-native';
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
  FadeInUp,
  FadeInDown,
  runOnJS,
  Easing
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Spacing from '../../theme/Spacing';
import Input from '../../components/Input/Input';
import Button from '../../components/Button/Button';
import { isValidEmail } from '../../utils/validators';
import { triggerImpact } from '../../utils/HapticUtils';

const { width, height } = Dimensions.get('window');

type SignUpStep1Props = {
  navigation: any;
};

const SignUpStep1: React.FC<SignUpStep1Props> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  
  // Animation values
  const progressWidth = useSharedValue(33);
  const emailInputScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const formPosition = useSharedValue(50);
  const headerOpacity = useSharedValue(0);
  const backgroundPosition = useSharedValue(0);
  const socialButtonsOpacity = useSharedValue(0);
  
  // Keyboard listeners to adjust animation when keyboard appears/disappears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 100, animated: true });
        }
      }
    );
    
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 0, animated: true });
        }
      }
    );
    
    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);
  
  // Initialize animations
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Animate background
    backgroundPosition.value = withTiming(1, { 
      duration: 2000, 
      easing: Easing.out(Easing.exp) 
    });
    
    // Animate header elements
    headerOpacity.value = withTiming(1, { duration: 600 });
    
    // Animate form with spring for natural motion
    formOpacity.value = withTiming(1, { duration: 600 });
    formPosition.value = withSpring(0, {
      damping: 14,
      stiffness: 100
    });
    
    // Animate social buttons last
    socialButtonsOpacity.value = withDelay(
      800,
      withTiming(1, { duration: 600 })
    );
    
    return () => {
      StatusBar.setBarStyle('dark-content');
    }
  }, []);
  
  // Validate email and proceed to next step
  const handleContinue = () => {
    if (!email) {
      setEmailError('Email is required');
      shakeInput();
      return;
    }
    
    if (!isValidEmail(email)) {
      setEmailError('Please enter a valid email');
      shakeInput();
      return;
    }
    
    // Clear any previous errors
    setEmailError('');
    
    // Animate button press
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    
    // Show loading state
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    // Simulate API check for existing email
    setTimeout(() => {
      setLoading(false);
      
      // Animate exit before navigation
      formOpacity.value = withTiming(0, { duration: 300 });
      headerOpacity.value = withTiming(0, { duration: 300 });
      
      setTimeout(() => {
        // Navigate to next step with email
        navigation.navigate('SignUpStep2', { email });
      }, 300);
    }, 1500);
  };
  
  // Animation for input validation error
  const shakeInput = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // More natural shake animation
    emailInputScale.value = withSequence(
      withTiming(1.01, { duration: 30 }),
      withTiming(0.99, { duration: 30 }),
      withTiming(1.01, { duration: 30 }),
      withTiming(0.99, { duration: 30 }),
      withTiming(1.01, { duration: 30 }),
      withTiming(0.99, { duration: 30 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
  };
  
  // Go back to login screen
  const handleBack = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate exit
    formOpacity.value = withTiming(0, { duration: 300 });
    headerOpacity.value = withTiming(0, { duration: 300 });
    
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };
  
  // Handle social signup
  const handleSocialSignup = (provider) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    // Implementation would go here
    console.log(`Sign up with ${provider}`);
  }
  
  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => {
    const translateX = interpolate(
      backgroundPosition.value,
      [0, 1],
      [-width * 0.3, 0],
      Extrapolation.CLAMP
    );
    
    return {
      transform: [{ translateX }]
    };
  });
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return { opacity: headerOpacity.value };
  });
  
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progressWidth.value}%`
    };
  });
  
  const emailInputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: emailInputScale.value }]
    };
  });
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formPosition.value }]
    };
  });
  
  const socialButtonsAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: socialButtonsOpacity.value,
      transform: [
        { 
          translateY: interpolate(
            socialButtonsOpacity.value,
            [0, 1],
            [20, 0],
            Extrapolation.CLAMP
          ) 
        }
      ]
    };
  });

  return (
    <View style={styles.container}>
      {/* Background gradient with animation */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
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
            { paddingTop: insets.top + 20, paddingBottom: insets.bottom + 20 }
          ]}
          showsVerticalScrollIndicator={false}
        >
          {/* Header with back button */}
          <Animated.View style={[styles.header, headerAnimatedStyle]}>
            <TouchableOpacity 
              onPress={handleBack}
              style={styles.backButton}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              activeOpacity={0.8}
            >
              <Feather name="arrow-left" size={24} color="#fff" />
            </TouchableOpacity>
            
            <Animated.Text 
              style={styles.stepText}
              entering={FadeIn.delay(300).duration(600)}
            >
              Step 1 of 3
            </Animated.Text>
          </Animated.View>
          
          {/* Progress indicator */}
          <Animated.View 
            style={[styles.progressContainer, headerAnimatedStyle]}
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
            style={[styles.titleContainer, headerAnimatedStyle]}
            entering={FadeInDown.delay(500).duration(600)}
          >
            <Text style={styles.title}>Create Account</Text>
            <Text style={styles.subtitle}>Let's start with your email</Text>
          </Animated.View>
          
          {/* Form */}
          <Animated.View 
            style={[styles.formContainer, formAnimatedStyle]}
            entering={FadeInUp.delay(600).duration(800)}
          >
            <Animated.View style={emailInputAnimatedStyle}>
              <Input
                label="Email Address"
                value={email}
                onChangeText={(text) => {
                  setEmail(text);
                  if (emailError) setEmailError('');
                }}
                placeholder="your.email@example.com"
                keyboardType="email-address"
                autoCapitalize="none"
                leftIcon="mail"
                error={emailError}
                animateSuccess={email.length > 0 && isValidEmail(email)}
              />
            </Animated.View>
            
            <Text style={styles.privacyText}>
              By continuing, you agree to our 
              <Text style={styles.link}> Terms of Service </Text> 
              and 
              <Text style={styles.link}> Privacy Policy</Text>
            </Text>
            
            <Animated.View style={buttonAnimatedStyle}>
              <Button
                title="Continue"
                onPress={handleContinue}
                fullWidth
                loading={loading}
                style={styles.continueButton}
                gradientColors={[Colors.primary.blue, Colors.primary[700]]}
                animationType="bounce"
                icon="arrow-right"
                iconPosition="right"
                round
              />
            </Animated.View>
          </Animated.View>
          
          {/* Alternative signup options */}
          <Animated.View 
            style={[styles.alternativesContainer, socialButtonsAnimatedStyle]}
            entering={FadeInUp.delay(800).duration(600)}
          >
            <View style={styles.dividerContainer}>
              <View style={styles.divider} />
              <Text style={styles.dividerText}>OR SIGN UP WITH</Text>
              <View style={styles.divider} />
            </View>
            
            <View style={styles.socialButtonsContainer}>
              <TouchableOpacity 
                style={styles.socialButton}
                activeOpacity={0.8}
                onPress={() => handleSocialSignup('github')}
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
                onPress={() => handleSocialSignup('twitter')}
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
                onPress={() => handleSocialSignup('google')}
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
            </View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
    </View>
  );
};

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
    paddingHorizontal: Spacing.lg
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: Spacing.lg
  },
  backButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  stepText: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.white,
    fontWeight: Typography.weights.medium,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20
  },
  progressContainer: {
    marginBottom: Spacing.xl
  },
  progressBar: {
    height: 6,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    borderRadius: 3,
    overflow: 'hidden'
  },
  progressIndicator: {
    height: '100%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 3
  },
  titleContainer: {
    marginBottom: Spacing.xl
  },
  title: {
    fontSize: 32,
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
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
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
});

export default SignUpStep1;