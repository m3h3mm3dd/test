
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
  TextInput,
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
import Button from '../../components/Button/Button';
import { triggerImpact } from '../../utils/HapticUtils';

// Number of OTP digits
const OTP_LENGTH = 6;

// Timer duration in seconds
const TIMER_DURATION = 60;

const { width, height } = Dimensions.get('window');

type SignUpStep2Props = {
  route: any;
  navigation: any;
};

const SignUpStep2: React.FC<SignUpStep2Props> = ({ route, navigation }) => {
  const { email } = route.params || { email: 'user@example.com' };
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // OTP state
  const [otp, setOtp] = useState(Array(OTP_LENGTH).fill(''));
  const [otpError, setOtpError] = useState('');
  const [focusedIndex, setFocusedIndex] = useState(0);
  const [loading, setLoading] = useState(false);
  
  // Timer state
  const [timerCount, setTimerCount] = useState(TIMER_DURATION);
  const [isResendActive, setIsResendActive] = useState(false);
  
  // Refs for OTP inputs
  const inputRefs = useRef<Array<TextInput | null>>([]);
  
  // Animation values
  const progressWidth = useSharedValue(66);
  const otpContainerScale = useSharedValue(1);
  const buttonScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const formPosition = useSharedValue(50);
  const headerOpacity = useSharedValue(0);
  const otpShakeValues = Array(OTP_LENGTH).fill(0).map(() => useSharedValue(0));
  const successPulse = useSharedValue(0);
  const backgroundPosition = useSharedValue(0);
  const timerBarWidth = useSharedValue(100);
  
  // Keyboard listeners to adjust scroll when keyboard appears/disappears
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
  
  // Initialize refs for OTP inputs
  useEffect(() => {
    inputRefs.current = Array(OTP_LENGTH).fill(null);
  }, []);
  
  // Setup initial animations
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
    
    return () => {
      StatusBar.setBarStyle('dark-content');
    }
  }, []);
  
  // Setup timer animation
  useEffect(() => {
    let interval: NodeJS.Timeout;
    
    if (timerCount > 0) {
      // Update timer countdown
      interval = setInterval(() => {
        setTimerCount(prev => prev - 1);
      }, 1000);
      
      // Animate timer bar
      timerBarWidth.value = withTiming((timerCount / TIMER_DURATION) * 100, { 
        duration: 1000 
      });
    } else {
      setIsResendActive(true);
    }
    
    return () => clearInterval(interval);
  }, [timerCount]);
  
  // Auto-focus first input on mount
  useEffect(() => {
    // Small delay to ensure component is mounted
    const timer = setTimeout(() => {
      if (inputRefs.current[0]?.focus) {
        inputRefs.current[0]?.focus();
      }
    }, 500);
    
    return () => clearTimeout(timer);
  }, []);
  
  // Format timer
  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };
  
  // Handle OTP input
  const handleOtpChange = (text: string, index: number) => {
    // Only allow digits
    if (!/^\d*$/.test(text)) return;
    
    // Update OTP array
    const newOtp = [...otp];
    newOtp[index] = text.substr(0, 1);
    setOtp(newOtp);
    
    // Clear any previous errors
    if (otpError) setOtpError('');
    
    // If input is filled and not the last input, focus next input
    if (text.length === 1 && index < OTP_LENGTH - 1) {
      inputRefs.current[index + 1]?.focus();
      setFocusedIndex(index + 1);
    }
    
    // If all inputs are filled, trigger verification
    if (text.length === 1 && index === OTP_LENGTH - 1) {
      // Check if all inputs are filled
      if (newOtp.every(digit => digit !== '')) {
        Keyboard.dismiss();
        // Wait for keyboard to dismiss
        setTimeout(() => {
          handleVerifyOtp();
        }, 300);
      }
    }
  };
  
  // Handle backspace key press
  const handleKeyPress = (e: any, index: number) => {
    if (e.nativeEvent.key === 'Backspace' && index > 0 && otp[index] === '') {
      // Focus previous input on backspace if current input is empty
      inputRefs.current[index - 1]?.focus();
      setFocusedIndex(index - 1);
    }
  };
  
  // Handle OTP input focus
  const handleInputFocus = (index: number) => {
    setFocusedIndex(index);
  };
  
  // Verify OTP
  const handleVerifyOtp = () => {
    if (otp.some(digit => digit === '')) {
      setOtpError('Please enter a valid 6-digit code');
      shakeOtpInputs();
      return;
    }
    
    // Animate button press
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    
    // Clear any previous errors
    setOtpError('');
    
    // Show loading state
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    // Simulate API verification
    setTimeout(() => {
      setLoading(false);
      
      // For demo, accept any 6-digit code
      const enteredOtp = otp.join('');
      
      // Success animation
      successPulse.value = withSequence(
        withTiming(1, { duration: 300 }),
        withDelay(500, withTiming(0, { duration: 300 }))
      );
      
      // Animate exit
      formOpacity.value = withTiming(0, { duration: 300 });
      headerOpacity.value = withTiming(0, { duration: 300 });
      
      // Short delay then navigate to next step
      setTimeout(() => {
        navigation.navigate('SignUpStep3', { email });
      }, 800);
      
    }, 1500);
  };
  
  // Resend OTP
  const handleResendOtp = () => {
    if (!isResendActive) return;
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // Reset timer and disable resend button
    setTimerCount(TIMER_DURATION);
    setIsResendActive(false);
    
    // Clear current OTP and errors
    setOtp(Array(OTP_LENGTH).fill(''));
    setOtpError('');
    
    // Animate OTP container
    otpContainerScale.value = withSequence(
      withTiming(1.05, { duration: 200 }),
      withTiming(1, { duration: 200 })
    );
    
    // Focus first input
    if (inputRefs.current[0]?.focus) {
      inputRefs.current[0]?.focus();
      setFocusedIndex(0);
    }
  };
  
  // Go back to previous step
  const handleBack = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // Animate exit
    formOpacity.value = withTiming(0, { duration: 300 });
    headerOpacity.value = withTiming(0, { duration: 300 });
    
    setTimeout(() => {
      navigation.goBack();
    }, 300);
  };
  
  // Animation for input validation error
  const shakeOtpInputs = () => {
    triggerImpact(Haptics.NotificationFeedbackType.Error);
    
    // Shake animation for OTP inputs
    otpShakeValues.forEach((shakeValue, index) => {
      shakeValue.value = withSequence(
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(-3, { duration: 50 }),
        withTiming(3, { duration: 50 }),
        withTiming(0, { duration: 50 })
      );
    });
  };
  
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
  
  const otpContainerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: otpContainerScale.value }]
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
  
  const successOverlayStyle = useAnimatedStyle(() => {
    return {
      opacity: successPulse.value,
      transform: [{ scale: interpolate(successPulse.value, [0, 1], [0.9, 1.05], Extrapolation.CLAMP) }]
    };
  });
  
  const timerBarStyle = useAnimatedStyle(() => {
    return {
      width: `${timerBarWidth.value}%`
    };
  });
  
  // Get animated style for each OTP input
  const getInputAnimatedStyle = (index: number) => {
    return useAnimatedStyle(() => {
      return {
        transform: [{ translateX: otpShakeValues[index].value }]
      };
    });
  };

  return (
    <View style={styles.container}>
      {/* Success overlay animation */}
      <Animated.View style={[styles.successOverlay, successOverlayStyle]}>
        <LinearGradient
          colors={['rgba(0, 200, 83, 0.9)', 'rgba(0, 200, 83, 0.7)']}
          style={StyleSheet.absoluteFill}
        />
        <Feather name="check-circle" size={60} color="#fff" />
      </Animated.View>
      
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
              Step 2 of 3
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
            <Text style={styles.title}>Verify Your Email</Text>
            <Text style={styles.subtitle}>
              Enter the 6-digit code sent to {'\n'}
              <Text style={styles.emailText}>{email}</Text>
            </Text>
          </Animated.View>
          
          {/* OTP Inputs */}
          <Animated.View 
            style={[styles.otpContainer, formAnimatedStyle, otpContainerAnimatedStyle]}
            entering={FadeInUp.delay(600).duration(800)}
          >
            <View style={styles.otpInputsContainer}>
              {Array(OTP_LENGTH).fill(0).map((_, index) => {
                // Get animated style for this input
                const inputAnimatedStyle = getInputAnimatedStyle(index);
                
                return (
                  <Animated.View 
                    key={index} 
                    style={[
                      styles.otpInputWrapper,
                      focusedIndex === index && styles.otpInputWrapperFocused,
                      otp[index] && styles.otpInputWrapperFilled,
                      inputAnimatedStyle
                    ]}
                  >
                    <TextInput
                      ref={el => inputRefs.current[index] = el}
                      style={[
                        styles.otpInput,
                        otp[index] && styles.otpInputFilled
                      ]}
                      keyboardType="number-pad"
                      maxLength={1}
                      value={otp[index]}
                      onChangeText={(text) => handleOtpChange(text, index)}
                      onKeyPress={(e) => handleKeyPress(e, index)}
                      onFocus={() => handleInputFocus(index)}
                      selectTextOnFocus
                    />
                  </Animated.View>
                );
              })}
            </View>
            
            {otpError ? (
              <Text style={styles.errorText}>{otpError}</Text>
            ) : (
              <Text style={styles.helperText}>Enter verification code</Text>
            )}
            
            {/* Timer with visual bar */}
            <View style={styles.timerSection}>
              <View style={styles.timerContainer}>
                <Text style={styles.timerText}>
                  {isResendActive ? 'Resend code?' : `Resend code in ${formatTime(timerCount)}`}
                </Text>
                
                <TouchableOpacity
                  onPress={handleResendOtp}
                  disabled={!isResendActive}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[
                    styles.resendButton,
                    !isResendActive && styles.resendButtonDisabled
                  ]}
                  activeOpacity={0.8}
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
              
              {!isResendActive && (
                <View style={styles.timerBarContainer}>
                  <Animated.View style={[styles.timerBar, timerBarStyle]} />
                </View>
              )}
            </View>
            
            <Animated.View style={buttonAnimatedStyle}>
              <Button
                title="Verify & Continue"
                onPress={handleVerifyOtp}
                fullWidth
                loading={loading}
                style={styles.verifyButton}
                gradientColors={[Colors.primary.blue, Colors.primary[700]]}
                animationType="bounce"
                icon="arrow-right"
                iconPosition="right"
                round
              />
            </Animated.View>
          </Animated.View>
          
          {/* Helper text */}
          <Animated.View 
            style={[styles.helperContainer, headerAnimatedStyle]}
            entering={FadeInUp.delay(800).duration(600)}
          >
            <TouchableOpacity 
              activeOpacity={0.8}
              style={styles.helpButtonContainer}
            >
              <Text style={styles.helpText}>
                Having trouble? <Text style={styles.helpLink}>Contact Support</Text>
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
  successOverlay: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10
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
    shadowOffset: { width: 0, height: 12 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  otpInputsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: Spacing.md
  },
  otpInputWrapper: {
    width: 50,
    height: 60,
    borderRadius: 12,
    borderWidth: 1.5,
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
  otpInputWrapperFilled: {
    backgroundColor: 'rgba(61, 90, 254, 0.05)',
    borderColor: Colors.primary.blue
  },
  otpInput: {
    width: '100%',
    height: '100%',
    fontSize: 24,
    fontWeight: Typography.weights.bold,
    textAlign: 'center',
    color: Colors.neutrals.gray900
  },
  otpInputFilled: {
    color: Colors.primary.blue
  },
  errorText: {
    color: Colors.error[500],
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
  timerSection: {
    marginBottom: Spacing.xl
  },
  timerContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.sm
  },
  timerText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  resendButton: {
    marginLeft: Spacing.xs,
    paddingVertical: 4,
    paddingHorizontal: 10,
    borderRadius: 12,
    backgroundColor: 'rgba(61, 90, 254, 0.1)'
  },
  resendButtonDisabled: {
    backgroundColor: 'transparent'
  },
  resendText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.primary.blue
  },
  resendTextDisabled: {
    color: Colors.neutrals.gray400
  },
  timerBarContainer: {
    height: 4,
    backgroundColor: 'rgba(61, 90, 254, 0.2)',
    borderRadius: 2,
    overflow: 'hidden',
    width: '80%',
    alignSelf: 'center',
    marginTop: Spacing.sm
  },
  timerBar: {
    height: '100%',
    backgroundColor: Colors.primary.blue,
    borderRadius: 2
  },
  verifyButton: {
    height: 56
  },
  helperContainer: {
    alignItems: 'center'
  },
  helpButtonContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    paddingHorizontal: 20,
    paddingVertical: 10,
    borderRadius: 20
  },
  helpText: {
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  helpLink: {
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    textDecorationLine: 'underline'
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

export default SignUpStep2;