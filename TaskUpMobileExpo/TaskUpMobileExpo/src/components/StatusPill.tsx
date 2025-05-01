import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  View, 
  ViewStyle, 
  TextStyle,
  StyleProp
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withRepeat,
  withSequence,
  Easing,
  FadeIn
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import { useTheme } from '../hooks/useColorScheme';

type StatusType = 'success' | 'warning' | 'error' | 'info' | 'pending' | 'in-progress' | 'completed' | 'blocked' | 'review' | 'default';

type PriorityType = 'low' | 'medium' | 'high' | 'critical' | 'default';

interface StatusPillProps {
  label: string;
  type?: StatusType;
  priority?: PriorityType;
  icon?: keyof typeof Feather.glyphMap;
  animate?: boolean;
  small?: boolean;
  pill?: boolean;
  style?: StyleProp<ViewStyle>;
  textStyle?: StyleProp<TextStyle>;
}

const StatusPill = ({
  label,
  type = 'default',
  priority,
  icon,
  animate = false,
  small = false,
  pill = true,
  style,
  textStyle
}: StatusPillProps) => {
  const { colors, isDark } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const opacity = useSharedValue(0);
  const pulseOpacity = useSharedValue(0.7);
  
  useEffect(() => {
    // Fade in animation
    opacity.value = withTiming(1, { duration: 300 });
    
    // Setup animation if animate is true
    if (animate) {
      // Different animation patterns based on status type
      if (type === 'error' || type === 'blocked' || (priority && (priority === 'high' || priority === 'critical'))) {
        // Pulsing animation for error and high priority
        scale.value = withRepeat(
          withSequence(
            withTiming(1.1, { duration: 600, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 600, easing: Easing.inOut(Easing.ease) })
          ),
          -1, // Infinite repeat
          true // Reverse
        );
      } else if (type === 'warning' || type === 'review' || (priority && priority === 'medium')) {
        // Subtle pulse for warnings and medium priority
        scale.value = withRepeat(
          withSequence(
            withTiming(1.05, { duration: 1000, easing: Easing.inOut(Easing.ease) }),
            withTiming(1, { duration: 1000, easing: Easing.inOut(Easing.ease) })
          ),
          -1, 
          true
        );
      } else if (type === 'pending' || type === 'in-progress') {
        // Fade animation for pending status
        pulseOpacity.value = withRepeat(
          withSequence(
            withTiming(0.9, { duration: 800, easing: Easing.inOut(Easing.ease) }),
            withTiming(0.7, { duration: 800, easing: Easing.inOut(Easing.ease) })
          ),
          -1,
          true
        );
      }
    }
    
    return () => {
      // Cleanup opacity animation on unmount
      opacity.value = withTiming(0, { duration: 150 });
    };
  }, [animate, type, priority]);
  
  // Determine background color based on type and priority
  const getBackgroundColor = () => {
    if (priority) {
      switch (priority) {
        case 'critical':
          return isDark ? `rgba(213, 0, 0, 0.3)` : 'rgba(213, 0, 0, 0.15)';
        case 'high':
          return isDark ? `rgba(255, 82, 82, 0.3)` : 'rgba(213, 0, 0, 0.15)';
        case 'medium':
          return isDark ? `rgba(255, 171, 0, 0.3)` : 'rgba(255, 171, 0, 0.15)';
        case 'low':
          return isDark ? `rgba(0, 200, 83, 0.3)` : 'rgba(0, 200, 83, 0.15)';
        default:
          return isDark ? `rgba(155, 155, 155, 0.3)` : 'rgba(155, 155, 155, 0.15)';
      }
    }
    
    switch (type) {
      case 'success':
      case 'completed':
        return isDark ? `rgba(0, 200, 83, 0.3)` : 'rgba(0, 200, 83, 0.15)';
      case 'warning':
      case 'review':
        return isDark ? `rgba(255, 171, 0, 0.3)` : 'rgba(255, 171, 0, 0.15)';
      case 'error':
      case 'blocked':
        return isDark ? `rgba(213, 0, 0, 0.3)` : 'rgba(213, 0, 0, 0.15)';
      case 'info':
        return isDark ? `rgba(3, 169, 244, 0.3)` : 'rgba(3, 169, 244, 0.15)';
      case 'pending':
        return isDark ? `rgba(158, 158, 158, 0.3)` : 'rgba(158, 158, 158, 0.15)';
      case 'in-progress':
        return isDark ? `rgba(61, 90, 254, 0.3)` : 'rgba(61, 90, 254, 0.15)';
      default:
        return isDark ? `rgba(158, 158, 158, 0.3)` : 'rgba(158, 158, 158, 0.15)';
    }
  };
  
  // Determine text color based on type and priority
  const getTextColor = () => {
    if (priority) {
      switch (priority) {
        case 'critical':
          return Colors.error[500];
        case 'high':
          return Colors.error[400];
        case 'medium':
          return Colors.warning[500];
        case 'low':
          return Colors.success[500];
        default:
          return isDark ? Colors.neutrals[300] : Colors.neutrals[700];
      }
    }
    
    switch (type) {
      case 'success':
      case 'completed':
        return Colors.success[500];
      case 'warning':
      case 'review':
        return Colors.warning[500];
      case 'error':
      case 'blocked':
        return Colors.error[500];
      case 'info':
        return colors.primary[500];
      case 'pending':
        return isDark ? Colors.neutrals[300] : Colors.neutrals[700];
      case 'in-progress':
        return colors.primary[500];
      default:
        return isDark ? Colors.neutrals[300] : Colors.neutrals[700];
    }
  };
  
  // Determine icon color (same as text color)
  const getIconColor = () => getTextColor();
  
  // Get border color (slightly darker than background)
  const getBorderColor = () => {
    const textColor = getTextColor();
    return `${textColor}40`; // Add 25% opacity
  };
  
  // Get the right icon based on type if not provided
  const getIconName = () => {
    if (icon) return icon;
    
    if (priority) {
      switch (priority) {
        case 'critical':
          return 'alert-octagon';
        case 'high':
          return 'arrow-up';
        case 'medium':
          return 'minus';
        case 'low':
          return 'arrow-down';
        default:
          return 'help-circle';
      }
    }
    
    switch (type) {
      case 'success':
      case 'completed':
        return 'check-circle';
      case 'warning':
        return 'alert-triangle';
      case 'error':
      case 'blocked':
        return 'alert-circle';
      case 'info':
        return 'info';
      case 'pending':
        return 'clock';
      case 'in-progress':
        return 'trending-up';
      case 'review':
        return 'eye';
      default:
        return 'help-circle';
    }
  };
  
  // Animated styles
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  });
  
  const pulseStyle = useAnimatedStyle(() => {
    return {
      opacity: pulseOpacity.value
    };
  });

  return (
    <Animated.View
      style={[
        styles.container,
        {
          backgroundColor: getBackgroundColor(),
          borderColor: getBorderColor(),
          borderRadius: pill ? 50 : 6,
          paddingVertical: small ? 4 : 6,
          paddingHorizontal: small ? 8 : 12
        },
        animatedStyle,
        style
      ]}
      accessible={true}
      accessibilityRole="text"
      accessibilityLabel={`${label} status`}
      entering={FadeIn.duration(300)}
    >
      {icon || getIconName() ? (
        <Animated.View style={type === 'pending' || type === 'in-progress' ? pulseStyle : null}>
          <Feather 
            name={getIconName()} 
            size={small ? 12 : 14} 
            color={getIconColor()} 
            style={styles.icon} 
          />
        </Animated.View>
      ) : null}
      
      <Text 
        style={[
          styles.text,
          {
            color: getTextColor(),
            fontSize: small ? Typography.sizes.xs : Typography.sizes.sm
          },
          textStyle
        ]}
        numberOfLines={1}
      >
        {label}
      </Text>
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  text: {
    fontWeight: Typography.weights.medium
  },
  icon: {
    marginRight: 4
  }
});

export default StatusPill;