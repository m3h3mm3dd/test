import React, { useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSequence,
  withDelay,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import { triggerNotification } from '../utils/HapticUtils';
import { useTheme } from '../hooks/useColorScheme';
import { useNetworkStatus } from '../hooks/useNetworkStatus';

interface OfflineNoticeProps {
  onRetry?: () => void;
}

const OfflineNotice = ({ onRetry }: OfflineNoticeProps) => {
  const insets = useSafeAreaInsets();
  const { colors, isDark } = useTheme();
  const { checkConnection } = useNetworkStatus();
  
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  
  useEffect(() => {
    // Trigger haptic feedback for offline notice
    triggerNotification(Haptics.NotificationFeedbackType.Warning);
    
    // Animate the notice in
    translateY.value = withSequence(
      withTiming(-100, { duration: 0 }),
      withTiming(0, { duration: 300 })
    );
    
    opacity.value = withTiming(1, { duration: 300 });
    
    // Slight bounce effect for attention
    setTimeout(() => {
      translateY.value = withSequence(
        withTiming(-5, { duration: 150 }),
        withTiming(0, { duration: 150 })
      );
    }, 300);
  }, []);
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }],
      opacity: opacity.value
    };
  });
  
  const handleRetry = () => {
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Animate retry attempt
    translateY.value = withSequence(
      withTiming(-3, { duration: 100 }),
      withTiming(0, { duration: 100 })
    );
    
    if (onRetry) {
      onRetry();
    } else {
      checkConnection();
    }
  };

  return (
    <Animated.View 
      style={[
        styles.container, 
        { 
          backgroundColor: isDark ? Colors.warning[800] : Colors.warning[500],
          paddingTop: insets.top 
        },
        animatedStyle
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLabel="You are offline"
      entering={FadeIn.duration(300)}
      exiting={FadeOut.duration(300)}
    >
      <View style={styles.content}>
        <Feather name="wifi-off" size={18} color={Colors.neutrals.white} />
        <Text style={styles.text}>You are offline</Text>
        <TouchableOpacity 
          style={styles.retryButton}
          onPress={handleRetry}
          accessibilityRole="button"
          accessibilityLabel="Retry connection"
        >
          <Feather name="refresh-cw" size={16} color={Colors.neutrals.white} />
          <Text style={styles.retryText}>Retry</Text>
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
    backgroundColor: Colors.warning[500],
    zIndex: 1000
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 8,
    paddingHorizontal: 16
  },
  text: {
    flex: 1,
    fontSize: Typography.sizes.sm,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.white,
    marginLeft: 8
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 4,
    paddingHorizontal: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 4
  },
  retryText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.white,
    marginLeft: 4
  }
});

export default OfflineNotice;