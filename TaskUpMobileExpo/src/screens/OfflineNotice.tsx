import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity,
  Platform
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  withSpring,
  Easing,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import Spacing from '../theme/Spacing';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../hooks/useColorScheme';
import { triggerImpact } from '../utils/HapticUtils';

const { width } = Dimensions.get('window');
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

const OfflineNotice = () => {
  const insets = useSafeAreaInsets();
  const { isConnected, checkConnection } = useNetworkStatus();
  const { colors, isDark } = useTheme();
  const [showRetrySuccess, setShowRetrySuccess] = useState(false);
  
  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const iconRotate = useSharedValue(0);
  const pulseScale = useSharedValue(1);
  const waveProgress = useSharedValue(0);
  const retryRotation = useSharedValue(0);
  const retryScale = useSharedValue(1);
  const successScale = useSharedValue(0);
  
  // Show or hide banner based on connection status
  useEffect(() => {
    if (!isConnected) {
      // Show the banner with a spring animation
      translateY.value = withSpring(0, { 
        damping: 15,
        stiffness: 120
      });
      opacity.value = withTiming(1, { duration: 400 });
      
      // Start wave animation
      waveProgress.value = withRepeat(
        withTiming(1, { duration: 2000, easing: Easing.inOut(Easing.ease) }),
        -1,
        false
      );
      
      // Pulse animation for the icon
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1500, easing: Easing.out(Easing.ease) }),
          withTiming(1, { duration: 1500, easing: Easing.in(Easing.ease) })
        ),
        -1,
        true
      );
      
      // Add a slight rotation animation to the icon
      iconRotate.value = withRepeat(
        withSequence(
          withTiming(-0.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
          withTiming(0.05, { duration: 1000, easing: Easing.inOut(Easing.ease) })
        ),
        -1,
        true
      );
    } else {
      // Hide the success indicator if shown
      if (showRetrySuccess) {
        successScale.value = withTiming(0, { duration: 300 });
        setShowRetrySuccess(false);
      }
      
      // Hide the banner with a spring animation
      translateY.value = withSpring(-100, { 
        damping: 15,
        stiffness: 120
      });
      opacity.value = withTiming(0, { duration: 300 });
    }
  }, [isConnected]);
  
  // Handle retry connection
  const handleRetry = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate the retry button
    retryRotation.value = withSequence(
      withTiming(0, { duration: 0 }),
      withTiming(2 * Math.PI, { 
        duration: 1000,
        easing: Easing.out(Easing.cubic)
      })
    );
    
    retryScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withSpring(1, { damping: 12, stiffness: 180 })
    );
    
    // Check connection
    checkConnection().then(state => {
      if (state.isConnected) {
        // Show success indicator briefly
        setShowRetrySuccess(true);
        successScale.value = withSequence(
          withTiming(1.2, { duration: 200 }),
          withTiming(1, { duration: 150 }),
          withDelay(1000, withTiming(0, { duration: 300 }))
        );
        
        // Success haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        
        // Reset success state after animation
        setTimeout(() => {
          setShowRetrySuccess(false);
        }, 1500);
      } else {
        // Error haptic feedback
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
      }
    });
  };
  
  // Create animated styles
  const containerStyle = useAnimatedStyle(() => ({
    transform: [{ translateY: translateY.value }],
    opacity: opacity.value
  }));
  
  const iconContainerStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: pulseScale.value },
      { rotate: `${iconRotate.value}rad` }
    ]
  }));
  
  const waveStyle = useAnimatedStyle(() => ({
    opacity: interpolate(
      waveProgress.value,
      [0, 0.5, 1],
      [0, 0.7, 0],
      Extrapolation.CLAMP
    ),
    transform: [
      { scale: interpolate(
        waveProgress.value,
        [0, 1],
        [1, 2],
        Extrapolation.CLAMP
      )}
    ]
  }));
  
  const retryButtonStyle = useAnimatedStyle(() => ({
    transform: [
      { scale: retryScale.value },
      { rotate: `${retryRotation.value}rad` }
    ]
  }));
  
  const successIconStyle = useAnimatedStyle(() => ({
    transform: [{ scale: successScale.value }],
    opacity: successScale.value
  }));
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        containerStyle,
        { paddingTop: insets.top }
      ]}
      entering={FadeIn.springify()}
      exiting={FadeOut.duration(300)}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel="You are offline. Check your internet connection."
    >
      <AnimatedGradient
        colors={isDark 
          ? [colors.error[800], colors.error[700], colors.error[900]]
          : [colors.error[600], colors.error[500], colors.error[700]]
        }
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={StyleSheet.absoluteFill}
      />
      
      {/* Decorative elements */}
      <View style={styles.decorativeContainer}>
        <Animated.View style={[styles.wave, waveStyle]}>
          <LinearGradient
            colors={['rgba(255,255,255,0.1)', 'rgba(255,255,255,0)']}
            style={StyleSheet.absoluteFill}
            start={{ x: 0.5, y: 0.5 }}
            end={{ x: 1, y: 1 }}
          />
        </Animated.View>
      </View>
      
      <View style={styles.content}>
        <View style={styles.iconSection}>
          <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
            <Feather name="wifi-off" size={20} color="#fff" />
          </Animated.View>
        </View>
        
        <View style={styles.textSection}>
          <Text style={styles.title}>No Internet Connection</Text>
          <Text style={styles.message}>
            Please check your connection settings
          </Text>
        </View>
        
        <View style={styles.actionSection}>
          <Animated.View style={[styles.successIconContainer, successIconStyle]}>
            <Feather name="check-circle" size={24} color="#fff" />
          </Animated.View>
          
          <Animated.View style={retryButtonStyle}>
            <TouchableOpacity 
              style={styles.retryButton}
              onPress={handleRetry}
              activeOpacity={0.8}
              disabled={showRetrySuccess}
              accessibilityRole="button"
              accessibilityLabel="Retry connection"
              accessibilityHint="Attempts to reconnect to the internet"
            >
              <Feather name="refresh-cw" size={20} color="#fff" />
            </TouchableOpacity>
          </Animated.View>
        </View>
      </View>
      
      {/* Bottom line indicator */}
      <View style={styles.progressContainer}>
        <Animated.View 
          style={[
            styles.progressBar,
            { width: '25%' } // Fixed width for visual effect
          ]}
        />
      </View>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    zIndex: 1000,
    overflow: 'hidden'
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: Spacing.lg,
    paddingVertical: Spacing.md,
    height: 70
  },
  decorativeContainer: {
    ...StyleSheet.absoluteFillObject,
    justifyContent: 'center',
    alignItems: 'center',
    overflow: 'hidden'
  },
  wave: {
    position: 'absolute',
    width: 150,
    height: 150,
    borderRadius: 75,
    backgroundColor: 'rgba(255, 255, 255, 0.1)'
  },
  iconSection: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: Spacing.md
  },
  textSection: {
    flex: 1,
  },
  title: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.white,
    marginBottom: 2
  },
  message: {
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  actionSection: {
    position: 'relative',
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
  },
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  successIconContainer: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: Colors.success[500],
    justifyContent: 'center',
    alignItems: 'center',
    ...Platform.select({
      ios: {
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 4,
      },
      android: {
        elevation: 4
      }
    })
  },
  progressContainer: {
    height: 4,
    backgroundColor: 'rgba(0, 0, 0, 0.2)',
    overflow: 'hidden',
    width: '100%'
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.7)'
  }
});

export default OfflineNotice;