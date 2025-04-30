import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  Dimensions, 
  TouchableOpacity
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withRepeat,
  withDelay,
  Easing,
  runOnJS
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useTheme } from '../theme/ThemeProvider';

const { width } = Dimensions.get('window');

const OfflineNotice = () => {
  const insets = useSafeAreaInsets();
  const { isConnected, checkConnection } = useNetworkStatus();
  const { theme } = useTheme();
  
  // Animation values
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const pulseOpacity = useSharedValue(0.5);
  
  // Show banner when offline
  useEffect(() => {
    if (!isConnected) {
      // Slide in banner
      translateY.value = withTiming(0, { 
        duration: 500,
        easing: Easing.out(Easing.back(2))
      });
      opacity.value = withTiming(1, { duration: 300 });
      
      // Pulse animation for icon
      iconScale.value = withRepeat(
        withSequence(
          withTiming(1.2, { duration: 1000 }),
          withTiming(1, { duration: 1000 })
        ),
        -1,
        true
      );
      
      // Pulse animation for signal rings
      pulseOpacity.value = withRepeat(
        withSequence(
          withTiming(0.8, { duration: 1000 }),
          withTiming(0.4, { duration: 1000 })
        ),
        -1,
        true
      );
    } else {
      // Slide out banner
      translateY.value = withTiming(-100, { duration: 300 });
      opacity.value = withTiming(0, { duration: 200 });
    }
  }, [isConnected]);
  
  // Handle retry connection
  const handleRetry = () => {
    // Animate button press
    iconScale.value = withSequence(
      withTiming(0.8, { duration: 100 }),
      withTiming(1, { duration: 100 })
    );
    
    // Check connection
    checkConnection();
  };
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value
    };
  });
  
  const iconContainerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }]
    };
  });
  
  const pulseRingStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value,
      transform: [{ scale: withTiming(iconScale.value * 1.5, { duration: 500 }) }]
    };
  });
  
  return (
    <Animated.View 
      style={[
        styles.container, 
        containerStyle, 
        { paddingTop: insets.top }
      ]}
    >
      <LinearGradient
        colors={[theme.status.error, theme.status.errorDark]}
        style={StyleSheet.absoluteFill}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
      />
      
      <View style={styles.content}>
        <View style={styles.iconSection}>
          <Animated.View style={[styles.pulseRing, pulseRingStyle]} />
          <Animated.View style={[styles.iconContainer, iconContainerStyle]}>
            <Feather name="wifi-off" size={24} color="#fff" />
          </Animated.View>
        </View>
        
        <View style={styles.textSection}>
          <Text style={styles.title}>You are offline</Text>
          <Text style={styles.message}>Please check your internet connection</Text>
        </View>
        
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
          activeOpacity={0.8}
        >
          <Feather name="refresh-cw" size={20} color="#fff" />
        </TouchableOpacity>
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
    zIndex: 10,
    height: 80
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingVertical: 8,
    height: '100%'
  },
  iconSection: {
    width: 40,
    height: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
    position: 'relative'
  },
  pulseRing: {
    position: 'absolute',
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.3)'
  },
  iconContainer: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center'
  },
  textSection: {
    flex: 1
  },
  title: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  message: {
    fontSize: Typography.sizes.caption,
    color: 'rgba(255, 255, 255, 0.8)'
  },
  retryButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginLeft: 8
  }
});

export default OfflineNotice;