import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  Easing,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import { triggerImpact } from '../utils/HapticUtils';

const { width, height } = Dimensions.get('window');

interface AnimatedSplashProps {
  onAnimationComplete: () => void;
}

const AnimatedSplash = ({ onAnimationComplete }: AnimatedSplashProps) => {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const logoScale = useSharedValue(0.8);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);
  const gradientProgress = useSharedValue(0);
  
  // Trigger haptic feedback at key animation points
  const triggerHapticFeedback = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
  };

  useEffect(() => {
    // Logo entrance animation
    logoScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1.1, { 
        duration: 400, 
        easing: Easing.out(Easing.cubic) 
      }),
      withTiming(1, { 
        duration: 300, 
        easing: Easing.inOut(Easing.quad) 
      })
    );
    
    logoOpacity.value = withTiming(1, { 
      duration: 600, 
      easing: Easing.out(Easing.cubic) 
    }, () => {
      // Trigger haptic when logo appears
      runOnJS(triggerHapticFeedback)();
    });
    
    // Text fade in after logo
    textOpacity.value = withDelay(600, 
      withTiming(1, { duration: 600 })
    );
    
    // Gradient animation
    gradientProgress.value = withTiming(1, { 
      duration: 1500,
      easing: Easing.inOut(Easing.cubic) 
    });
    
    // Exit animation
    const timeout = setTimeout(() => {
      containerOpacity.value = withTiming(0, { 
        duration: 500,
        easing: Easing.out(Easing.cubic) 
      }, () => {
        runOnJS(onAnimationComplete)();
      });
    }, 2000);
    
    return () => clearTimeout(timeout);
  }, []);
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => ({
    opacity: containerOpacity.value
  }));
  
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [
      { scale: logoScale.value }
    ]
  }));
  
  const textStyle = useAnimatedStyle(() => ({
    opacity: textOpacity.value,
    transform: [
      { 
        translateY: interpolateColor(
          textOpacity.value,
          [0, 1],
          [20, 0]
        ) 
      }
    ]
  }));
  
  const gradientStyle = useAnimatedStyle(() => {
    return {
      opacity: gradientProgress.value
    };
  });

  return (
    <Animated.View style={[
      styles.container,
      containerStyle,
      { paddingTop: insets.top + 30 }
    ]}>
      <Animated.View style={[styles.gradientContainer, gradientStyle]}>
        <LinearGradient
          colors={[Colors.primary[900], Colors.primary[700], Colors.primary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        />
      </Animated.View>
      
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.logoCircle}>
          <Text style={styles.logoText}>TU</Text>
        </View>
      </Animated.View>
      
      <Animated.Text style={[styles.title, textStyle]}>
        TaskUp
      </Animated.Text>
      
      <Animated.Text style={[styles.subtitle, textStyle]}>
        Organize. Collaborate. Achieve.
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light
  },
  gradientContainer: {
    ...StyleSheet.absoluteFillObject,
  },
  gradient: {
    ...StyleSheet.absoluteFillObject,
  },
  logoContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: Colors.neutrals.white,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.primary[500]
  },
  title: {
    fontSize: 32,
    fontWeight: '700',
    color: Colors.neutrals.white,
    marginBottom: 10
  },
  subtitle: {
    fontSize: 16,
    fontWeight: '500',
    color: Colors.neutrals.white,
    opacity: 0.9
  }
});

export default AnimatedSplash;