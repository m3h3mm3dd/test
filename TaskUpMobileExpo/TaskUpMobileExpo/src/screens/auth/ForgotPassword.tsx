
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
  Keyboard
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  withDelay,
  FadeIn,
  FadeInUp,
  FadeInDown,
  FadeOut,
  ZoomOut,
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

type ForgotPasswordProps = {
  navigation: any;
};

const ForgotPassword: React.FC<ForgotPasswordProps> = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Form state
  const [email, setEmail] = useState('');
  const [emailError, setEmailError] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  
  // Animation values
  const inputScale = useSharedValue(1);
  const formPosition = useSharedValue(50);
  const formOpacity = useSharedValue(0);
  const headerOpacity = useSharedValue(0);
  const buttonOpacity = useSharedValue(0);
  const successOpacity = useSharedValue(0);
  const successScale = useSharedValue(0.8);
  const buttonScale = useSharedValue(1);
  const backgroundGradientPosition = useSharedValue(0);
  
  // Keyboard listeners
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
  
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Start animations sequence
    headerOpacity.value = withTiming(1, { duration: 600 });
    
    // Background gradient animation
    backgroundGradientPosition.value = withTiming(1, { 
      duration: 2000,
      easing: Easing.out(Easing.exp)
    });
    
    // Start form entrance animation with spring for more natural feel
    formOpacity.value = withTiming(1, { duration: 700 });
    formPosition.value = withSpring(0, {
      damping: 14,
      stiffness: 100,
      mass: 1
    });
    
    // Button opacity animation
    buttonOpacity.value = withDelay(600, withTiming(1, { duration: 500 }));
    
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);
  
  // Handle form submission
  const handleSubmit = () => {
    // Dismiss keyboard
    Keyboard.dismiss();
    
    // Validate email
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
    
    // Animate button press
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // Clear any previous errors
    setEmailError('');
    
    // Show loading state
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    // Simulate API call
    setTimeout(() => {
      setLoading(false);
      
      // Show success state with smooth transition
      formOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setSuccess)(true);
      });
      
      // Animate success message
      successOpacity.value = withTiming(1, { duration: 500 });
      successScale.value = withSpring(1, { 
        damping: 12,
        stiffness: 100
      });
      
      // Trigger success haptic
      triggerImpact(Haptics.NotificationFeedbackType.Success);
    }, 2000);
  };
  
  // Handle back button press
  const handleBack = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate exit
    formOpacity.value = withTiming(0, { duration: 200 });
    headerOpacity.value = withTiming(0, { duration: 200 });
    
    setTimeout(() => {
      navigation.goBack();
    }, 200);
  };
  
  // Handle login button press
  const handleLogin = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate exit
    successOpacity.value = withTiming(0, { duration: 200 });
    headerOpacity.value = withTiming(0, { duration: 200 });
    
    setTimeout(() => {
      navigation.goBack();
    }, 200);
  };
  
  // Animation for input validation error
  const shakeInput = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // More natural shake animation
    inputScale.value = withSequence(
      withTiming(1.01, { duration: 30 }),
      withTiming(0.99, { duration: 30 }),
      withTiming(1.01, { duration: 30 }),
      withTiming(0.99, { duration: 30 }),
      withTiming(1.01, { duration: 30 }),
      withTiming(0.99, { duration: 30 }),
      withSpring(1, { damping: 10, stiffness: 300 })
    );
  };
  
  // Animated styles
  const inputAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: inputScale.value }]
    };
  });
  
  const headerAnimatedStyle = useAnimatedStyle(() => {
    return { opacity: headerOpacity.value };
  });
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [{ translateY: formPosition.value }]
    };
  });
  
  const successAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: successOpacity.value,
      transform: [{ scale: successScale.value }]
    };
  });
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: buttonOpacity.value,
      transform: [{ scale: buttonScale.value }]
    };
  });
  
  const backgroundGradientStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: interpolate(backgroundGradientPosition.value, [0, 1], [-50, 0]) }
      ]
    };
  });

  return (
    <View style={styles.container}>
      {/* Background gradient with animation */}
      <Animated.View style={[StyleSheet.absoluteFill, backgroundGradientStyle]}>
        <LinearGradient
          colors={[Colors.primary[700], Colors.primary[500], Colors.primary.blue]}
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
          </Animated.View>
          
          {/* Title */}
          <Animated.View 
            style={[styles.titleContainer, headerAnimatedStyle]}
            entering={FadeInDown.delay(300).duration(600)}
          >
            <Text style={styles.title}>Reset Password</Text>
            <Text style={styles.subtitle}>
              Enter your email and we'll send you a link to reset your password
            </Text>
          </Animated.View>
          
          {/* Form */}
          <Animated.View 
            style={[styles.formContainer, formAnimatedStyle]}
            entering={FadeInUp.delay(400).duration(800)}
          >
            {success ? (
              <Animated.View 
                style={[styles.successContainer, successAnimatedStyle]}
              >
                <View style={styles.successIconContainer}>
                  <LinearGradient
                    colors={['rgba(0, 200, 83, 0.2)', 'rgba(0, 200, 83, 0.05)']}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    borderRadius={60}
                  />
                  <Feather name="check-circle" size={60} color={Colors.success[500]} />
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
                  icon="log-in"
                  iconPosition="left"
                />
              </Animated.View>
            ) : (
              <>
                <Animated.View style={inputAnimatedStyle}>
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
                    animateSuccess
                  />
                </Animated.View>
                
                <Animated.View style={buttonAnimatedStyle}>
                  <Button
                    title="Send Reset Link"
                    onPress={handleSubmit}
                    fullWidth
                    loading={loading}
                    style={styles.submitButton}
                    gradientColors={[Colors.primary.blue, Colors.primary[700]]}
                    animationType="bounce"
                    icon="send"
                    iconPosition="right"
                    round
                  />
                </Animated.View>
              </>
            )}
          </Animated.View>
          
          {/* Footer */}
          <Animated.View 
            style={[styles.footerContainer, headerAnimatedStyle]}
            entering={FadeInUp.delay(600).duration(800)}
          >
            <TouchableOpacity 
              onPress={handleLogin}
              hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
              style={styles.footerButton}
              activeOpacity={0.8}
            >
              <Text style={styles.footerText}>
                <Feather name="arrow-left" size={16} color="#fff" /> Back to login
              </Text>
            </TouchableOpacity>
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
    marginBottom: Spacing.xl
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
    marginBottom: Spacing.xl,
    transform: [{ translateY: 50 }],
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  submitButton: {
    height: 56,
    marginTop: Spacing.lg
  },
  footerContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl
  },
  footerButton: {
    padding: 10,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
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
  },
  // Decorative elements
  decorationCircle1: {
    position: 'absolute',
    width: 200,
    height: 200,
    borderRadius: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    top: -50,
    right: -50
  },
  decorationCircle2: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.05)',
    bottom: 100,
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

export default ForgotPassword;