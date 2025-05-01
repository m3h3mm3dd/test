
import React, { useState, useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity, 
  StatusBar,
  FlatList
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSpring, 
  interpolate, 
  useAnimatedScrollHandler,
  Extrapolation,
  FadeIn,
  FadeInRight,
  FadeInLeft,
  FadeOut,
  SlideInRight
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Spacing from '../../theme/Spacing';
import Button from '../../components/Button/Button';
import { triggerImpact } from '../../utils/HapticUtils';

const { width, height } = Dimensions.get('window');

// Onboarding screens data
const ONBOARDING_DATA = [
  {
    id: '1',
    title: 'Manage Tasks Effectively',
    description: 'Keep track of all your tasks in one place. Organize, prioritize, and never miss a deadline again.',
    icon: 'check-square',
    colors: [Colors.primary[700], Colors.primary[600], Colors.primary.blue]
  },
  {
    id: '2',
    title: 'Collaborate with Your Team',
    description: 'Share projects, assign tasks, and communicate with team members seamlessly.',
    icon: 'users',
    colors: [Colors.primary[800], Colors.primary[600], Colors.primary[400]]
  },
  {
    id: '3',
    title: 'Track Your Progress',
    description: 'Monitor your productivity with detailed analytics and reports to improve your workflow.',
    icon: 'bar-chart-2',
    colors: [Colors.primary[700], Colors.primary[500], Colors.primary[300]]
  }
];

const OnboardingScreen = ({ navigation }) => {
  const insets = useSafeAreaInsets();
  const flatListRef = useRef(null);
  const [activeIndex, setActiveIndex] = useState(0);
  
  // Animation values
  const translationX = useSharedValue(0);
  const buttonScale = useSharedValue(1);
  const skipOpacity = useSharedValue(1);
  const progressValue = useSharedValue(0);
  
  // Setup status bar
  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);
  
  // Update progress animation when active index changes
  useEffect(() => {
    const progress = activeIndex / (ONBOARDING_DATA.length - 1);
    progressValue.value = withTiming(progress, { duration: 300 });
    
    // Hide skip button on last slide
    if (activeIndex === ONBOARDING_DATA.length - 1) {
      skipOpacity.value = withTiming(0, { duration: 200 });
    } else {
      skipOpacity.value = withTiming(1, { duration: 200 });
    }
  }, [activeIndex]);
  
  // Scroll handler for slide transitions
  const scrollHandler = useAnimatedScrollHandler({
    onScroll: (event) => {
      translationX.value = event.contentOffset.x;
    },
    onEndDrag: (event) => {
      const newIndex = Math.round(event.contentOffset.x / width);
      if (newIndex !== activeIndex) {
        runOnJS(setActiveIndex)(newIndex);
      }
    },
  });
  
  // Handle next slide
  const handleNext = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate button
    buttonScale.value = withSequence(
      withTiming(0.95, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 200 })
    );
    
    if (activeIndex < ONBOARDING_DATA.length - 1) {
      // Go to next slide
      const nextIndex = activeIndex + 1;
      flatListRef.current?.scrollToIndex({ index: nextIndex, animated: true });
      setActiveIndex(nextIndex);
    } else {
      // Complete onboarding with animation
      navigation.replace('LoginScreen');
    }
  };
  
  // Handle skip
  const handleSkip = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    navigation.replace('LoginScreen');
  };
  
  // Go to specific slide
  const goToSlide = (index) => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    flatListRef.current?.scrollToIndex({ index, animated: true });
    setActiveIndex(index);
  };
  
  // Button animated style
  const buttonStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: buttonScale.value }]
    };
  });
  
  // Skip button style
  const skipButtonStyle = useAnimatedStyle(() => {
    return {
      opacity: skipOpacity.value
    };
  });
  
  // Progress bar animation
  const progressBarStyle = useAnimatedStyle(() => {
    return {
      width: `${progressValue.value * 100}%`
    };
  });
  
  // Render slide item
  const renderSlideItem = ({ item, index }) => {
    const inputRange = [
      (index - 1) * width,
      index * width,
      (index + 1) * width
    ];
    
    const slideAnimatedStyle = useAnimatedStyle(() => {
      const scale = interpolate(
        translationX.value,
        inputRange,
        [0.8, 1, 0.8],
        Extrapolation.CLAMP
      );
      
      const opacity = interpolate(
        translationX.value,
        inputRange,
        [0, 1, 0],
        Extrapolation.CLAMP
      );
      
      return {
        transform: [{ scale }],
        opacity
      };
    });
    
    return (
      <Animated.View 
        style={[styles.slide, { width }, slideAnimatedStyle]}
      >
        <View style={styles.iconContainer}>
          <LinearGradient
            colors={['rgba(255, 255, 255, 0.2)', 'rgba(255, 255, 255, 0.05)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            borderRadius={60}
          />
          <Feather name={item.icon} size={60} color="#fff" />
        </View>
        
        <Text style={styles.title}>{item.title}</Text>
        <Text style={styles.description}>{item.description}</Text>
      </Animated.View>
    );
  };
  
  return (
    <View style={styles.container}>
      {/* Background gradient that changes with slides */}
      <Animated.View style={StyleSheet.absoluteFill}>
        {ONBOARDING_DATA.map((slide, index) => {
          // Calculate when to show this background
          const bgAnimatedStyle = useAnimatedStyle(() => {
            const opacity = interpolate(
              translationX.value,
              [(index - 0.5) * width, index * width, (index + 0.5) * width],
              [0, 1, 0],
              Extrapolation.CLAMP
            );
            
            return { opacity };
          });
          
          return (
            <Animated.View 
              key={`bg-${index}`} 
              style={[StyleSheet.absoluteFill, bgAnimatedStyle]}
            >
              <LinearGradient
                colors={slide.colors}
                style={StyleSheet.absoluteFill}
                start={{ x: 0, y: 0 }}
                end={{ x: 1, y: 1 }}
              />
            </Animated.View>
          );
        })}
      </Animated.View>
      
      {/* Background decoration */}
      <View style={styles.decorationCircle1} />
      <View style={styles.decorationCircle2} />
      <View style={styles.decorationCircle3} />
      
      {/* Skip button */}
      <Animated.View 
        style={[
          styles.skipButtonContainer, 
          { top: insets.top + 16 }, 
          skipButtonStyle
        ]}
      >
        <TouchableOpacity 
          style={styles.skipButton}
          onPress={handleSkip}
          activeOpacity={0.8}
        >
          <Text style={styles.skipText}>Skip</Text>
        </TouchableOpacity>
      </Animated.View>
      
      {/* Slides */}
      <Animated.FlatList
        ref={flatListRef}
        data={ONBOARDING_DATA}
        keyExtractor={(item) => item.id}
        renderItem={renderSlideItem}
        horizontal
        pagingEnabled
        showsHorizontalScrollIndicator={false}
        onScroll={scrollHandler}
        scrollEventThrottle={16}
        style={styles.slideList}
        contentContainerStyle={{ alignItems: 'center' }}
      />
      
      {/* Custom pagination dots */}
      <View style={[
        styles.paginationOuterContainer,
        { paddingBottom: insets.bottom > 0 ? insets.bottom : 20 }
      ]}>
        <View style={styles.paginationContainer}>
          {ONBOARDING_DATA.map((_, index) => (
            <TouchableOpacity
              key={index} 
              style={[
                styles.paginationDotContainer,
                activeIndex === index && styles.activeDotContainer
              ]}
              onPress={() => goToSlide(index)}
              activeOpacity={0.8}
            >
              <View 
                style={[
                  styles.paginationDot,
                  activeIndex === index && styles.paginationDotActive
                ]}
              />
            </TouchableOpacity>
          ))}
        </View>
        
        {/* Progress bar */}
        <View style={styles.progressBarContainer}>
          <Animated.View style={[styles.progressBar, progressBarStyle]} />
        </View>
        
        {/* Next button */}
        <Animated.View style={[styles.buttonContainer, buttonStyle]}>
          <Button
            title={activeIndex === ONBOARDING_DATA.length - 1 ? "Get Started" : "Next"}
            onPress={handleNext}
            style={styles.button}
            animationType="bounce"
            icon={activeIndex === ONBOARDING_DATA.length - 1 ? "arrow-right" : "arrow-right"}
            iconPosition="right"
            gradientColors={[
              'rgba(255, 255, 255, 0.3)',
              'rgba(255, 255, 255, 0.1)'
            ]}
            round
          />
        </Animated.View>
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  skipButtonContainer: {
    position: 'absolute',
    right: 16,
    zIndex: 10
  },
  skipButton: {
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  skipText: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.white,
    fontWeight: Typography.weights.medium
  },
  slideList: {
    flex: 1
  },
  slide: {
    justifyContent: 'center',
    alignItems: 'center',
    padding: Spacing.xl
  },
  iconContainer: {
    width: 120,
    height: 120,
    borderRadius: 60,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: Spacing.xl,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.1)'
  },
  title: {
    fontSize: 28,
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
  paginationOuterContainer: {
    width: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    paddingBottom: 40,
    paddingTop: 20
  },
  paginationContainer: {
    flexDirection: 'row',
    marginBottom: Spacing.md
  },
  paginationDotContainer: {
    width: 30,
    height: 30,
    alignItems: 'center',
    justifyContent: 'center',
    marginHorizontal: 4
  },
  activeDotContainer: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 15
  },
  paginationDot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  paginationDotActive: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: Colors.neutrals.white
  },
  progressBarContainer: {
    width: '60%',
    height: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 2,
    marginBottom: Spacing.lg,
    overflow: 'hidden'
  },
  progressBar: {
    height: '100%',
    backgroundColor: Colors.neutrals.white,
    borderRadius: 2
  },
  buttonContainer: {
    width: '100%',
    paddingHorizontal: Spacing.xl
  },
  button: {
    minWidth: 200,
    alignSelf: 'center'
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
    bottom: 100,
    left: -70
  },
  decorationCircle3: {
    position: 'absolute',
    width: 80,
    height: 80,
    borderRadius: 40,
    backgroundColor: 'rgba(255, 255, 255, 0.08)',
    top: 150,
    right: -20
  }
});

export default OnboardingScreen;