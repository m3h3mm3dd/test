import React, { useState, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  interpolate, 
  Extrapolation,
  FadeIn,
  FadeInRight,
  FadeOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import Button from '../components/Button/Button';
import { triggerImpact } from '../utils/HapticUtils';

const { width } = Dimensions.get('window');

// Onboarding screens data
const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Manage Tasks Effectively',
    description: 'Keep track of all your tasks in one place. Organize, prioritize, and never miss a deadline again.',
    icon: 'check-square'
  },
  {
    id: '2',
    title: 'Collaborate with Your Team',
    description: 'Share projects, assign tasks, and communicate with team members seamlessly.',
    icon: 'users'
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Monitor your productivity with detailed analytics and reports to improve your workflow.',
    icon: 'bar-chart-2'
  }
];

const OnboardingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Animation values
  const slidePosition = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  
  // Handle next screen
  const handleNext = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate button press
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    if (activeIndex < ONBOARDING_DATA.length - 1) {
      // Go to next onboarding screen
      setActiveIndex(prev => prev + 1);
      slidePosition.value = withTiming(activeIndex + 1, { duration: 400 });
    } else {
      // Complete onboarding
      navigation.replace('LoginScreen');
    }
  };
  
  // Handle skip
  const handleSkip = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace('LoginScreen');
  };
  
  // Button animated style
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });
  
  return (
    <View style={styles.container}>
      <StatusBar barStyle="light-content" backgroundColor={Colors.primary.darkBlue} />
      
      {/* Background gradient */}
      <LinearGradient
        colors={[Colors.primary.darkBlue, Colors.primary.blue]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      {/* Skip button */}
      {activeIndex < ONBOARDING_DATA.length - 1 && (
        <TouchableOpacity 
          style={[styles.skipButton, { top: insets.top + 16 }]}
          onPress={handleSkip}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      )}
      
      {/* Slides container */}
      <View style={styles.slidesContainer}>
        {ONBOARDING_DATA.map((item, index) => (
          <Animated.View 
            key={item.id}
            style={[
              styles.slide,
              {
                opacity: activeIndex === index ? 1 : 0,
                display: activeIndex === index ? 'flex' : 'none'
              }
            ]}
            entering={FadeInRight.duration(500)}
            exiting={FadeOut.duration(200)}
          >
            <View style={styles.iconContainer}>
              <Feather name={item.icon} size={60} color="#fff" />
            </View>
            
            <Text style={styles.title}>{item.title}</Text>
            <Text style={styles.description}>{item.description}</Text>
          </Animated.View>
        ))}
      </View>
      
      {/* Pagination */}
      <View style={styles.paginationContainer}>
        {ONBOARDING_DATA.map((_, index) => (
          <View 
            key={index} 
            style={[
              styles.paginationDot,
              activeIndex === index && styles.paginationDotActive
            ]}
          />
        ))}
      </View>
      
      {/* Next button */}
      <Animated.View style={[
        styles.buttonContainer, 
        { paddingBottom: insets.bottom + 20 },
        buttonStyle
      ]}>
        <Button
          title={activeIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
          onPress={handleNext}
          style={styles.button}
          animationType="bounce"
          icon={activeIndex === ONBOARDING_DATA.length - 1 ? "arrow-right" : undefined}
          iconPosition="right"
        />
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center'
  },
  skipButton: {
    position: 'absolute',
    right: 16,
    zIndex: 10,
    padding: 8
  },
  skipText: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)',
    fontWeight: Typography.weights.medium
  },
  slidesContainer: {
    flex: 1,
    width: width,
    justifyContent: 'center',
    alignItems: 'center'
  },
  slide: {
    width: width,
    padding: Spacing.xl,
    justifyContent: 'center',
    alignItems: 'center'
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl
  },
  title: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: Spacing.md,
    textAlign: 'center'
  },
  description: {
    fontSize: Typography.sizes.body,
    color: 'rgba(255, 255, 255, 0.8)',
    textAlign: 'center',
    lineHeight: 24,
    maxWidth: width * 0.8
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.xl
  },
  paginationDot: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: 'rgba(255, 255, 255, 0.3)',
    marginHorizontal: 4
  },
  paginationDotActive: {
    backgroundColor: Colors.neutrals.white,
    width: 20
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: Spacing.xl,
    paddingVertical: Spacing.lg
  },
  button: {
    minWidth: 200,
    alignSelf: 'center'
  }
});

export default OnboardingScreen;