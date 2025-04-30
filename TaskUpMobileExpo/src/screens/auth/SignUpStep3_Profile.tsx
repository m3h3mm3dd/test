
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
  Image,
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
  runOnJS,
  interpolate,
  interpolateColor,
  Extrapolation,
  FadeIn,
  FadeInUp,
  FadeInDown,
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
import { validateField } from '../../utils/validators';
import { triggerImpact } from '../../utils/HapticUtils';

// Default avatar placeholder
const DEFAULT_AVATAR = 'https://via.placeholder.com/150';

// Photo picker options
const PHOTO_OPTIONS = [
  { id: 'take', icon: 'camera', label: 'Take Photo' },
  { id: 'library', icon: 'image', label: 'Photo Library' },
  { id: 'remove', icon: 'trash-2', label: 'Remove Photo', destructive: true }
];

const { width, height } = Dimensions.get('window');

type SignUpStep3Props = {
  route: any;
  navigation: any;
};

const SignUpStep3: React.FC<SignUpStep3Props> = ({ route, navigation }) => {
  const { email } = route.params || { email: 'user@example.com' };
  const insets = useSafeAreaInsets();
  const scrollViewRef = useRef<ScrollView>(null);
  
  // Form state
  const [fullName, setFullName] = useState('');
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [avatarUri, setAvatarUri] = useState('');
  
  // Validation errors
  const [nameError, setNameError] = useState('');
  const [usernameError, setUsernameError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [confirmPasswordError, setConfirmPasswordError] = useState('');
  
  // UI state
  const [loading, setLoading] = useState(false);
  const [showPhotoOptions, setShowPhotoOptions] = useState(false);
  
  // Animation values
  const progressWidth = useSharedValue(100);
  const formScale = useSharedValue(1);
  const formOpacity = useSharedValue(0);
  const formPosition = useSharedValue(50);
  const headerOpacity = useSharedValue(0);
  const photoOptionsHeight = useSharedValue(0);
  const photoOptionsOpacity = useSharedValue(0);
  const confettiOpacity = useSharedValue(0);
  const confettiScale = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const backgroundPosition = useSharedValue(0);
  const avatarScale = useSharedValue(0.8);
  const avatarOpacity = useSharedValue(0);
  
  // Keyboard listeners to adjust scroll when keyboard appears/disappears
  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      () => {
        if (scrollViewRef.current) {
          scrollViewRef.current.scrollTo({ y: 120, animated: true });
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
    
    // Animate avatar entrance
    avatarScale.value = withSequence(
      withDelay(500, withTiming(1.1, { duration: 400 })),
      withTiming(1, { duration: 200 })
    );
    avatarOpacity.value = withDelay(500, withTiming(1, { duration: 400 }));
    
    return () => {
      StatusBar.setBarStyle('dark-content');
    }
  }, []);
  
  // Toggle photo options
  const togglePhotoOptions = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    if (showPhotoOptions) {
      // Hide photo options
      photoOptionsHeight.value = withTiming(0, { duration: 300 });
      photoOptionsOpacity.value = withTiming(0, { duration: 300 }, () => {
        runOnJS(setShowPhotoOptions)(false);
      });
    } else {
      // Show photo options
      setShowPhotoOptions(true);
      photoOptionsHeight.value = withTiming(200, { duration: 300 });
      photoOptionsOpacity.value = withTiming(1, { duration: 300 });
    }
  };
  
  // Handle photo option selection
  const handlePhotoOption = (option: typeof PHOTO_OPTIONS[0]) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Hide photo options
    togglePhotoOptions();
    
    // Animate avatar selection
    avatarScale.value = withSequence(
      withTiming(0.9, { duration: 150 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    
    // Handle option selection
    switch (option.id) {
      case 'take':
        // Simulate opening camera
        setTimeout(() => {
          setAvatarUri('https://via.placeholder.com/150/3D5AFE/FFFFFF?text=User');
        }, 500);
        break;
      
      case 'library':
        // Simulate opening photo library
        setTimeout(() => {
          setAvatarUri('https://via.placeholder.com/150/3D5AFE/FFFFFF?text=User');
        }, 500);
        break;
      
      case 'remove':
        // Remove avatar
        setAvatarUri('');
        break;
    }
  };
  
  // Validate form fields
  const validateForm = () => {
    let isValid = true;
    
    // Validate full name
    const nameErrorMsg = validateField('Full Name', fullName, { required: true, minLength: 2 });
    setNameError(nameErrorMsg);
    isValid = isValid && !nameErrorMsg;
    
    // Validate username
    const usernameErrorMsg = validateField('Username', username, { required: true, minLength: 3 });
    setUsernameError(usernameErrorMsg);
    isValid = isValid && !usernameErrorMsg;
    
    // Validate password
    const passwordErrorMsg = validateField('Password', password, { required: true, minLength: 8 });
    setPasswordError(passwordErrorMsg);
    isValid = isValid && !passwordErrorMsg;
    
    // Validate confirm password
    const confirmPasswordErrorMsg = validateField('Confirm Password', confirmPassword, { 
      required: true, 
      match: password,
      matchFieldName: 'password'
    });
    setConfirmPasswordError(confirmPasswordErrorMsg);
    isValid = isValid && !confirmPasswordErrorMsg;
    
    return isValid;
  };
  
  // Handle form submission
  const handleSubmit = () => {
    // Validate form
    if (!validateForm()) {
      // Shake form on validation error
      formScale.value = withSequence(
        withTiming(0.98, { duration: 100 }),
        withTiming(1.01, { duration: 100 }),
        withTiming(0.99, { duration: 100 }),
        withSpring(1, { damping: 12 })
      );
      
      triggerImpact(Haptics.NotificationFeedbackType.Error);
      return;
    }
    
    // Animate button press
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    
    // Show loading state
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    setLoading(true);
    
    // Simulate API call for account creation
    setTimeout(() => {
      setLoading(false);
      
      // Show success animation
      showSuccessAnimation();
      
      // Simulate navigation to dashboard
      setTimeout(() => {
        navigation.reset({
          index: 0,
          routes: [{ name: 'MainTabs' }]
        });
      }, 3000);
    }, 2000);
  };
  
  // Show success animation
  const showSuccessAnimation = () => {
    // Play success haptic
    triggerImpact(Haptics.NotificationFeedbackType.Success);
    
    // Show confetti animation
    confettiOpacity.value = withTiming(1, { duration: 300 });
    confettiScale.value = withTiming(1.5, { 
      duration: 1000,
      easing: Easing.out(Easing.back(2))
    });
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
  
  const formAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: formOpacity.value,
      transform: [
        { scale: formScale.value },
        { translateY: formPosition.value }
      ]
    };
  });
  
  const photoOptionsAnimatedStyle = useAnimatedStyle(() => {
    return {
      height: photoOptionsHeight.value,
      opacity: photoOptionsOpacity.value
    };
  });
  
  const confettiAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: confettiOpacity.value,
      transform: [
        { scale: confettiScale.value },
        { rotate: `${interpolate(confettiScale.value, [0, 1.5], [0, 45])}deg` }
      ]
    };
  });
  
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });
  
  const avatarAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: avatarOpacity.value,
      transform: [{ scale: avatarScale.value }]
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
      
      {/* Success confetti animation */}
      <Animated.View style={[styles.confettiContainer, confettiAnimatedStyle]}>
        <LinearGradient
          colors={[Colors.primary[700], Colors.primary[500]]}
          style={StyleSheet.absoluteFill}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
        />
        
        {/* Confetti particles */}
        <View style={styles.confettiParticle1} />
        <View style={styles.confettiParticle2} />
        <View style={styles.confettiParticle3} />
        <View style={styles.confettiParticle4} />
        <View style={styles.confettiParticle5} />
        <View style={styles.confettiParticle6} />
        
        <View style={styles.successIconCircle}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            borderRadius={60}
          />
          <Feather name="check" size={60} color="#fff" />
        </View>
        <Text style={styles.successText}>Account Created!</Text>
        <Text style={styles.successSubText}>Redirecting to dashboard...</Text>
      </Animated.View>
      
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
              Step 3 of 3
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
            <Text style={styles.title}>Complete Your Profile</Text>
            <Text style={styles.subtitle}>
              Add your details to finish setting up your account
            </Text>
          </Animated.View>
          
          {/* Profile form */}
          <Animated.View 
            style={[styles.formContainer, formAnimatedStyle]}
            entering={FadeInUp.delay(600).duration(800)}
          >
            {/* Avatar picker */}
            <Animated.View 
              style={[styles.avatarContainer, avatarAnimatedStyle]}
            >
              <TouchableOpacity 
                style={styles.avatarWrapper}
                onPress={togglePhotoOptions}
                activeOpacity={0.9}
              >
                {avatarUri ? (
                  <Image
                    source={{ uri: avatarUri }}
                    style={styles.avatar}
                  />
                ) : (
                  <View style={styles.avatarPlaceholder}>
                    <LinearGradient
                      colors={['rgba(61, 90, 254, 0.1)', 'rgba(61, 90, 254, 0.05)']}
                      style={StyleSheet.absoluteFill}
                      start={{ x: 0, y: 0 }}
                      end={{ x: 1, y: 1 }}
                      borderRadius={50}
                    />
                    <Feather name="user" size={40} color={Colors.primary.blue} />
                  </View>
                )}
                
                <View style={styles.avatarEditButton}>
                  <LinearGradient
                    colors={[Colors.primary.blue, Colors.primary[600]]}
                    style={StyleSheet.absoluteFill}
                    start={{ x: 0, y: 0 }}
                    end={{ x: 1, y: 1 }}
                    borderRadius={16}
                  />
                  <Feather name="camera" size={14} color="#fff" />
                </View>
              </TouchableOpacity>
              
              <Text style={styles.avatarHelperText}>
                Upload Profile Photo
              </Text>
            </Animated.View>
            
            {/* Avatar picker options */}
            {showPhotoOptions && (
              <Animated.View style={[styles.photoOptionsContainer, photoOptionsAnimatedStyle]}>
                {PHOTO_OPTIONS.map((option) => (
                  <TouchableOpacity
                    key={option.id}
                    style={styles.photoOption}
                    onPress={() => handlePhotoOption(option)}
                    activeOpacity={0.7}
                  >
                    <View 
                      style={[
                        styles.photoOptionIcon,
                        option.destructive && styles.photoOptionIconDestructive
                      ]}
                    >
                      <Feather 
                        name={option.icon} 
                        size={18} 
                        color={option.destructive ? Colors.error[500] : Colors.primary.blue} 
                      />
                    </View>
                    
                    <Text 
                      style={[
                        styles.photoOptionLabel,
                        option.destructive && styles.photoOptionLabelDestructive
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </Animated.View>
            )}
            
            {/* Form fields */}
            <Input
              label="Full Name"
              value={fullName}
              onChangeText={(text) => {
                setFullName(text);
                if (nameError) setNameError('');
              }}
              placeholder="John Doe"
              leftIcon="user"
              error={nameError}
              animateSuccess={fullName.length > 2}
            />
            
            <Input
              label="Username"
              value={username}
              onChangeText={(text) => {
                setUsername(text);
                if (usernameError) setUsernameError('');
              }}
              placeholder="johndoe"
              leftIcon="at-sign"
              error={usernameError}
              animateSuccess={username.length > 3}
            />
            
            <Input
              label="Password"
              value={password}
              onChangeText={(text) => {
                setPassword(text);
                if (passwordError) setPasswordError('');
                if (confirmPassword && confirmPasswordError && text === confirmPassword) {
                  setConfirmPasswordError('');
                }
              }}
              placeholder="Create a strong password"
              secureTextEntry
              leftIcon="lock"
              error={passwordError}
              animateSuccess={password.length >= 8}
            />
            
            <Input
              label="Confirm Password"
              value={confirmPassword}
              onChangeText={(text) => {
                setConfirmPassword(text);
                if (confirmPasswordError) setConfirmPasswordError('');
              }}
              placeholder="Repeat your password"
              secureTextEntry
              leftIcon="lock"
              error={confirmPasswordError}
              animateSuccess={confirmPassword.length > 0 && confirmPassword === password}
            />
            
            <Text style={styles.privacyText}>
              By creating an account, you agree to our
              <Text style={styles.link}> Terms of Service </Text>
              and
              <Text style={styles.link}> Privacy Policy</Text>
            </Text>
            
            <Animated.View style={buttonAnimatedStyle}>
              <Button
                title="Create Account"
                onPress={handleSubmit}
                fullWidth
                loading={loading}
                style={styles.submitButton}
                gradientColors={[Colors.primary.blue, Colors.primary[700]]}
                animationType="bounce"
                icon="check"
                iconPosition="right"
                round
              />
            </Animated.View>
          </Animated.View>
        </ScrollView>
      </KeyboardAvoidingView>
      
      {/* Photo options backdrop */}
      {showPhotoOptions && (
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            styles.backdropContainer,
            { opacity: photoOptionsOpacity.value }
          ]}
        >
          <TouchableOpacity 
            style={styles.backdrop}
            onPress={togglePhotoOptions}
            activeOpacity={1}
          />
        </Animated.View>
      )}
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
  avatarContainer: {
    alignItems: 'center',
    marginBottom: Spacing.xl
  },
  avatarWrapper: {
    width: 100,
    height: 100,
    borderRadius: 50,
    position: 'relative',
    marginBottom: Spacing.sm
  },
  avatar: {
    width: '100%',
    height: '100%',
    borderRadius: 50
  },
  avatarPlaceholder: {
    width: '100%',
    height: '100%',
    borderRadius: 50,
    backgroundColor: Colors.neutrals.white,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
    borderColor: Colors.primary.blue,
    overflow: 'hidden'
  },
  avatarEditButton: {
    position: 'absolute',
    bottom: 0,
    right: 0,
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: Colors.neutrals.white,
    overflow: 'hidden'
  },
  avatarHelperText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  photoOptionsContainer: {
    marginBottom: Spacing.xl,
    borderRadius: 16,
    backgroundColor: Colors.neutrals.white,
    overflow: 'hidden',
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4
  },
  photoOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: Spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  photoOptionIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(61, 90, 254, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  photoOptionIconDestructive: {
    backgroundColor: 'rgba(213, 0, 0, 0.1)'
  },
  photoOptionLabel: {
    fontSize: Typography.sizes.body,
    color: Colors.neutrals.gray900
  },
  photoOptionLabelDestructive: {
    color: Colors.error[500]
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
  submitButton: {
    height: 56
  },
  backdropContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end'
  },
  backdrop: {
    flex: 1
  },
  confettiContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 10,
    overflow: 'hidden'
  },
  confettiParticle1: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 4,
    backgroundColor: Colors.primary[300],
    top: '30%',
    left: '20%',
    transform: [{ rotate: '45deg' }]
  },
  confettiParticle2: {
    position: 'absolute',
    width: 30,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.secondary.green,
    top: '40%',
    right: '30%'
  },
  confettiParticle3: {
    position: 'absolute',
    width: 15,
    height: 15,
    borderRadius: 15,
    backgroundColor: Colors.secondary.yellow,
    bottom: '35%',
    left: '35%'
  },
  confettiParticle4: {
    position: 'absolute',
    width: 25,
    height: 25,
    borderRadius: 4,
    backgroundColor: Colors.primary[400],
    bottom: '45%',
    right: '25%',
    transform: [{ rotate: '30deg' }]
  },
  confettiParticle5: {
    position: 'absolute',
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: Colors.secondary.red,
    top: '25%',
    right: '40%'
  },
  confettiParticle6: {
    position: 'absolute',
    width: 22,
    height: 8,
    borderRadius: 4,
    backgroundColor: Colors.secondary.purple,
    top: '50%',
    left: '30%',
    transform: [{ rotate: '20deg' }]
  },
  successIconCircle: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.lg,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.2)',
    overflow: 'hidden'
  },
  successText: {
    fontSize: 28,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: Spacing.sm
  },
  successSubText: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)'
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

export default SignUpStep3;