import React, { useEffect } from 'react';
import { View, StyleSheet, Text, Dimensions, StatusBar } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  withDelay,
  Easing,
  interpolate,
  Extrapolation
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { useSafeAreaInsets } from 'react-native-safe-area-context';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';

const { width, height } = Dimensions.get('window');

interface SplashScreenProps {
  onAnimationComplete?: () => void;
}

const SplashScreen = ({ onAnimationComplete }: SplashScreenProps) => {
  const insets = useSafeAreaInsets();
  
  // Animation values
  const logoScale = useSharedValue(0.6);
  const logoOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);
  const gradientPosition = useSharedValue(-width);
  const taglineOpacity = useSharedValue(0);
  const taglineY = useSharedValue(20);
  const dotScale = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    // Animate background
    backgroundOpacity.value = withTiming(1, { duration: 500 });
    
    // Animate logo
    logoOpacity.value = withTiming(1, { duration: 700 });
    logoScale.value = withSequence(
      withTiming(0.8, { duration: 400, easing: Easing.out(Easing.cubic) }),
      withTiming(1.1, { duration: 500, easing: Easing.out(Easing.cubic) }),
      withTiming(1, { duration: 300, easing: Easing.inOut(Easing.quad) })
    );
    
    // Animate pulse effect around logo
    pulseScale.value = withRepeat(
      withSequence(
        withTiming(1.2, { duration: 1000, easing: Easing.inOut(Easing.quad) }),
        withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.quad) })
      ),
      -1,
      true
    );
    
    // Animate tagline
    taglineOpacity.value = withDelay(800, withTiming(1, { duration: 800 }));
    taglineY.value = withDelay(800, withTiming(0, { duration: 800, easing: Easing.out(Easing.cubic) }));
    
    // Animate decorative dots
    dotScale.value = withDelay(1200, withTiming(1, { duration: 500 }));
    
    // Animate gradient shine effect
    gradientPosition.value = withRepeat(
      withTiming(width * 2, { duration: 2000, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false
    );
    
    // Call completion callback after animation finishes
    if (onAnimationComplete) {
      const timeout = setTimeout(() => {
        onAnimationComplete();
      }, 3000);
      
      return () => clearTimeout(timeout);
    }
  }, []);
  
  // Animated styles
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value
  }));
  
  const logoContainerStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }]
  }));
  
  const pulseStyle = useAnimatedStyle(() => ({
    transform: [{ scale: pulseScale.value }],
    opacity: interpolate(
      pulseScale.value,
      [1, 1.2],
      [0.6, 0],
      Extrapolation.CLAMP
    )
  }));
  
  const gradientStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: gradientPosition.value }]
  }));
  
  const taglineStyle = useAnimatedStyle(() => ({
    opacity: taglineOpacity.value,
    transform: [{ translateY: taglineY.value }]
  }));
  
  const dotStyle = useAnimatedStyle(() => ({
    opacity: dotScale.value,
    transform: [{ scale: dotScale.value }]
  }));
  
  const dot2Style = useAnimatedStyle(() => ({
    opacity: dotScale.value * 0.7,
    transform: [{ scale: dotScale.value * 0.8 }]
  }));
  
  const dot3Style = useAnimatedStyle(() => ({
    opacity: dotScale.value * 0.5,
    transform: [{ scale: dotScale.value * 0.6 }]
  }));

  return (
    <View style={styles.container}>
      <StatusBar translucent backgroundColor="transparent" barStyle="light-content" />
      
      <Animated.View style={[StyleSheet.absoluteFill, backgroundStyle]}>
        <LinearGradient
          colors={[Colors.primary[700], Colors.primary[500]]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
      </Animated.View>
      
      {/* Decorative patterns */}
      <Animated.View style={[styles.decorativeDot, { top: height * 0.2, left: width * 0.15 }, dotStyle]}>
        <View style={[styles.dot, { backgroundColor: 'rgba(255, 255, 255, 0.2)', width: 80, height: 80 }]} />
      </Animated.View>
      
      <Animated.View style={[styles.decorativeDot, { bottom: height * 0.25, right: width * 0.1 }, dot2Style]}>
        <View style={[styles.dot, { backgroundColor: 'rgba(255, 255, 255, 0.15)', width: 120, height: 120 }]} />
      </Animated.View>
      
      <Animated.View style={[styles.decorativeDot, { bottom: height * 0.1, left: width * 0.25 }, dot3Style]}>
        <View style={[styles.dot, { backgroundColor: 'rgba(255, 255, 255, 0.1)', width: 100, height: 100 }]} />
      </Animated.View>
      
      <View style={styles.contentContainer}>
        {/* Pulse effect */}
        <Animated.View style={[styles.pulseContainer, pulseStyle]}>
          <View style={styles.pulse} />
        </Animated.View>
        
        {/* Logo */}
        <Animated.View style={[styles.logoContainer, logoContainerStyle]}>
          <LinearGradient
            colors={[Colors.primary[400], Colors.primary[600]]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={styles.logoGradient}
          >
            <Text style={styles.logoText}>TU</Text>
            <Animated.View style={[styles.shimmer, gradientStyle]}>
              <LinearGradient
                colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
                start={{ x: 0, y: 0.5 }}
                end={{ x: 1, y: 0.5 }}
                style={styles.shimmerGradient}
              />
            </Animated.View>
          </LinearGradient>
        </Animated.View>
        
        {/* Tagline */}
        <Animated.View style={[styles.taglineContainer, taglineStyle]}>
          <Text style={styles.appName}>TaskUp</Text>
          <Text style={styles.tagline}>Organize · Collaborate · Achieve</Text>
        </Animated.View>
      </View>
      
      {/* Version info */}
      <Text style={[styles.versionText, { bottom: insets.bottom + 10 }]}>Version 1.0.0</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.primary[600]
  },
  contentContainer: {
    alignItems: 'center',
    justifyContent: 'center'
  },
  logoContainer: {
    width: 120,
    height: 120,
    borderRadius: 30,
    overflow: 'hidden',
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.3,
    shadowRadius: 15,
    elevation: 10
  },
  logoGradient: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative'
  },
  logoText: {
    fontSize: 52,
    fontWeight: '800',
    color: Colors.neutrals.white,
    letterSpacing: -1
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width * 3
  },
  shimmerGradient: {
    flex: 1,
    transform: [{ skewX: '-30deg' }]
  },
  taglineContainer: {
    alignItems: 'center',
    marginTop: 30
  },
  appName: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: 10
  },
  tagline: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: 'rgba(255, 255, 255, 0.8)',
    letterSpacing: 1
  },
  pulseContainer: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75
  },
  pulse: {
    width: '100%',
    height: '100%',
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  decorativeDot: {
    position: 'absolute',
    opacity: 0.6,
    borderRadius: 100
  },
  dot: {
    borderRadius: 100
  },
  versionText: {
    position: 'absolute',
    fontSize: Typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: Typography.weights.medium
  }
});

export default SplashScreen;