import React, { useEffect } from 'react';
import { View, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withRepeat,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import LottieView from 'lottie-react-native';

import Colors from '../theme/Colors';

const { width, height } = Dimensions.get('window');

const SplashScreen = () => {
  // Animation values
  const logoScale = useSharedValue(0.9);
  const logoOpacity = useSharedValue(0);
  const backgroundOpacity = useSharedValue(0);
  const gradientPosition = useSharedValue(-width);
  
  useEffect(() => {
    // Animate in the logo and background
    logoOpacity.value = withTiming(1, { duration: 800 });
    logoScale.value = withTiming(1, { duration: 1000, easing: Easing.out(Easing.cubic) });
    backgroundOpacity.value = withTiming(1, { duration: 800 });
    
    // Animate gradient shine effect
    gradientPosition.value = withRepeat(
      withTiming(width * 2, { duration: 2500, easing: Easing.inOut(Easing.cubic) }),
      -1,
      false
    );
  }, []);
  
  // Animated styles
  const logoStyle = useAnimatedStyle(() => ({
    opacity: logoOpacity.value,
    transform: [{ scale: logoScale.value }]
  }));
  
  const backgroundStyle = useAnimatedStyle(() => ({
    opacity: backgroundOpacity.value
  }));
  
  const gradientStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: gradientPosition.value }]
  }));
  
  // Create a simple TaskUp logo effect
  const TaskUpLogo = () => (
    <View style={styles.logoContainer}>
      <LinearGradient
        colors={[Colors.primary[500], Colors.primary[700]]}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.logoBackground}
      >
        <Animated.Text style={styles.logoText}>TU</Animated.Text>
      </LinearGradient>
    </View>
  );

  return (
    <View style={styles.container}>
      <Animated.View style={[styles.background, backgroundStyle]} />
      
      <Animated.View style={[styles.logoWrapper, logoStyle]}>
        <TaskUpLogo />
        <Animated.View style={[styles.shimmer, gradientStyle]}>
          <LinearGradient
            colors={['transparent', 'rgba(255,255,255,0.3)', 'transparent']}
            start={{ x: 0, y: 0.5 }}
            end={{ x: 1, y: 0.5 }}
            style={styles.gradient}
          />
        </Animated.View>
      </Animated.View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light
  },
  background: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: Colors.background.light
  },
  logoWrapper: {
    alignItems: 'center',
    justifyContent: 'center',
    width: 120,
    height: 120,
  },
  logoContainer: {
    width: 100,
    height: 100,
    borderRadius: 50,
    overflow: 'hidden',
    alignItems: 'center', 
    justifyContent: 'center',
    backgroundColor: Colors.primary[500],
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
    elevation: 10
  },
  logoBackground: {
    width: '100%',
    height: '100%',
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoText: {
    fontSize: 42,
    fontWeight: '800',
    color: Colors.neutrals.white
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: width * 2,
  },
  gradient: {
    width: '100%',
    height: '100%',
    transform: [{ skewX: '-30deg' }]
  }
});

export default SplashScreen;