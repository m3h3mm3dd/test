import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  StatusBar 
} from 'react-native';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming, 
  withSequence, 
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import AsyncStorage from '@react-native-async-storage/async-storage';

const SplashScreen = ({ navigation }) => {
  // Animation values
  const logoScale = useSharedValue(0);
  const logoOpacity = useSharedValue(0);
  const textOpacity = useSharedValue(0);
  const containerOpacity = useSharedValue(1);

  useEffect(() => {
    StatusBar.setBarStyle('light-content');
    
    // Start animation sequence
    startAnimations();
    
    return () => {
      StatusBar.setBarStyle('dark-content');
    };
  }, []);

  // Animation sequence
  const startAnimations = () => {
    // Logo animation
    logoScale.value = withSequence(
      withTiming(0.8, { duration: 800, easing: Easing.out(Easing.expo) }),
      withTiming(1, { duration: 500, easing: Easing.inOut(Easing.cubic) })
    );
    
    // Logo opacity
    logoOpacity.value = withTiming(1, { duration: 1000 });
    
    // Text animation
    textOpacity.value = withDelay(
      600,
      withTiming(1, { duration: 800 })
    );
    
    // After animations complete, check if user is first time
    setTimeout(checkFirstTimeUser, 2600);
  };

  // Check if first time user
  const checkFirstTimeUser = async () => {
    try {
      const hasLaunched = await AsyncStorage.getItem('@TaskUp:hasLaunched');
      
      // Fade out animation
      containerOpacity.value = withTiming(0, 
        { 
          duration: 800, 
          easing: Easing.out(Easing.expo) 
        }, 
        () => {
          // After fade out complete, navigate to appropriate screen
          if (hasLaunched) {
            runOnJS(navigateToLogin)();
          } else {
            // Mark as launched and navigate to onboarding
            AsyncStorage.setItem('@TaskUp:hasLaunched', 'true');
            runOnJS(navigateToOnboarding)();
          }
        }
      );
    } catch (error) {
      // On error, default to login
      navigateToLogin();
    }
  };

  // Navigation helpers
  const navigateToLogin = () => {
    navigation.replace('LoginScreen');
  };

  const navigateToOnboarding = () => {
    navigation.replace('OnboardingScreen');
  };

  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: containerOpacity.value
    };
  });

  const logoStyle = useAnimatedStyle(() => {
    return {
      opacity: logoOpacity.value,
      transform: [
        { scale: logoScale.value }
      ]
    };
  });

  const textStyle = useAnimatedStyle(() => {
    return {
      opacity: textOpacity.value,
      transform: [
        { translateY: withTiming(textOpacity.value * 20, { duration: 800 }) }
      ]
    };
  });

  return (
    <Animated.View style={[styles.container, containerStyle]}>
      <LinearGradient
        colors={[Colors.primary.darkBlue, Colors.primary.blue]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <Animated.View style={[styles.logoContainer, logoStyle]}>
        <View style={styles.logoCircle}>
          <Feather name="check-square" size={48} color="#fff" />
        </View>
      </Animated.View>
      
      <Animated.Text style={[styles.appName, textStyle]}>
        TaskUp
      </Animated.Text>
      
      <Animated.Text style={[styles.tagline, textStyle]}>
        Productivity Simplified
      </Animated.Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  logoContainer: {
    alignItems: 'center',
    marginBottom: 20
  },
  logoCircle: {
    width: 100,
    height: 100,
    borderRadius: 50,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  appName: {
    fontSize: 42,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white,
    marginBottom: 8
  },
  tagline: {
    fontSize: Typography.sizes.bodyLarge,
    color: 'rgba(255, 255, 255, 0.8)'
  }
});

export default SplashScreen;