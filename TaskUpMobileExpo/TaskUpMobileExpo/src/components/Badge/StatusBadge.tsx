import React, { useEffect } from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence
} from 'react-native-reanimated';

import Colors from '../../theme/Colors';
import { useTheme } from '../../hooks/useColorScheme';

interface StatusBadgeProps {
  status?: 'online' | 'busy' | 'away' | 'offline';
  size?: number;
  style?: ViewStyle;
  animate?: boolean;
  borderColor?: string;
}

const StatusBadge = ({ 
  status = 'offline', 
  size = 10, 
  style,
  animate = true,
  borderColor
}: StatusBadgeProps) => {
  const { colors, isDark } = useTheme();
  const pulseScale = useSharedValue(1);
  
  useEffect(() => {
    // Animate pulse effect for active statuses
    if (animate && (status === 'online' || status === 'busy')) {
      pulseScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 1000 }),
          withTiming(1.2, { duration: 1000 })
        ),
        -1, // Infinite repeat
        true // Reverse
      );
    } else {
      pulseScale.value = withTiming(1, { duration: 300 });
    }
  }, [status, animate]);
  
  const getBadgeColor = () => {
    switch (status) {
      case 'online':
        return Colors.status.online;
      case 'busy':
        return Colors.status.busy;
      case 'away':
        return Colors.status.away;
      case 'offline':
      default:
        return Colors.status.offline;
    }
  };
  
  const pulseAnimStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: pulseScale.value }]
    };
  });

  return (
    <View
      style={[
        styles.badgeContainer,
        { 
          width: size * 1.5, 
          height: size * 1.5, 
          borderRadius: size * 1.5 / 2,
          borderColor: borderColor || (isDark ? colors.background.dark : Colors.neutrals.white)
        },
        style
      ]}
      accessible={true}
      accessibilityRole="image"
      accessibilityLabel={`Status: ${status}`}
    >
      <Animated.View
        style={[
          styles.badge,
          { 
            width: size, 
            height: size, 
            borderRadius: size / 2, 
            backgroundColor: getBadgeColor() 
          },
          pulseAnimStyle
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  badgeContainer: {
    borderWidth: 1.5,
    backgroundColor: Colors.neutrals.white,
    alignItems: 'center',
    justifyContent: 'center'
  },
  badge: {
    backgroundColor: Colors.status.online
  }
});

export default StatusBadge;