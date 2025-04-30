import React, { useEffect } from 'react';
import { StyleSheet, Text, View, TouchableOpacity } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSequence,
  runOnJS,
  withSpring,
  Easing,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';
import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import { useTheme } from '../../hooks/useColorScheme';

interface ToastProps {
  message: string;
  type?: 'success' | 'error' | 'info' | 'warning';
  duration?: number;
  onDismiss: () => void;
  action?: {
    label: string;
    onPress: () => void;
  };
  icon?: keyof typeof Feather.glyphMap;
  showProgress?: boolean;
}

const Toast = ({ 
  message, 
  type = 'info', 
  duration = 3000, 
  onDismiss,
  action,
  icon,
  showProgress = true
}: ToastProps) => {
  const { colors, isDark } = useTheme();
  const translateY = useSharedValue(-100);
  const opacity = useSharedValue(0);
  const scale = useSharedValue(0.9);
  const progress = useSharedValue(1);
  
  // Auto-dismiss timer
  let dismissTimer: NodeJS.Timeout;

  useEffect(() => {
    // Trigger haptic feedback based on toast type
    switch (type) {
      case 'success':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Success);
        break;
      case 'error':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Error);
        break;
      case 'warning':
        Haptics.notificationAsync(Haptics.NotificationFeedbackType.Warning);
        break;
      case 'info':
        Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        break;
    }

    // Animate in
    scale.value = withSpring(1, { damping: 12, stiffness: 200 });
    translateY.value = withSpring(0, { damping: 20, stiffness: 200 });
    opacity.value = withTiming(1, { duration: 200 });
    
    // Progress animation
    if (showProgress) {
      progress.value = withTiming(0, { 
        duration,
        easing: Easing.linear
      });
    }

    // Set dismiss timer
    dismissTimer = setTimeout(() => {
      dismiss();
    }, duration);

    return () => {
      if (dismissTimer) {
        clearTimeout(dismissTimer);
      }
    };
  }, []);

  const dismiss = () => {
    if (dismissTimer) {
      clearTimeout(dismissTimer);
    }
    
    translateY.value = withTiming(-100, { duration: 300 });
    opacity.value = withTiming(0, { duration: 300 }, () => {
      runOnJS(onDismiss)();
    });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ],
      opacity: opacity.value
    };
  });
  
  const progressAnimatedStyle = useAnimatedStyle(() => {
    return {
      width: `${progress.value * 100}%`
    };
  });

  const getBackgroundColor = () => {
    switch (type) {
      case 'success':
        return Colors.success[500];
      case 'error':
        return Colors.error[500];
      case 'warning':
        return Colors.warning[500];
      case 'info':
      default:
        return Colors.primary[500];
    }
  };
  
  const getIcon = () => {
    if (icon) return icon;
    
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'alert-circle';
      case 'warning':
        return 'alert-triangle';
      case 'info':
      default:
        return 'info';
    }
  };

  return (
    <Animated.View
      style={[
        styles.container,
        { backgroundColor: getBackgroundColor() },
        animatedStyle
      ]}
      accessible={true}
      accessibilityRole="alert"
      accessibilityLiveRegion="assertive"
      entering={FadeIn.springify().mass(0.8)}
      exiting={FadeOut.duration(200)}
    >
      <View style={styles.content}>
        <Feather name={getIcon()} size={20} color={Colors.neutrals.white} style={styles.icon} />
        
        <Text style={styles.message}>{message}</Text>
        
        {action && (
          <TouchableOpacity 
            style={styles.actionButton}
            onPress={() => {
              action.onPress();
              dismiss();
            }}
          >
            <Text style={styles.actionText}>{action.label}</Text>
          </TouchableOpacity>
        )}
        
        <TouchableOpacity onPress={dismiss} style={styles.closeButton}>
          <Feather name="x" size={18} color={Colors.neutrals.white} />
        </TouchableOpacity>
      </View>
      
      {showProgress && (
        <View style={styles.progressContainer}>
          <Animated.View 
            style={[
              styles.progressBar,
              progressAnimatedStyle
            ]} 
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 50,
    left: 16,
    right: 16,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: Colors.neutrals.black,
    shadowOpacity: 0.15,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 12,
    elevation: 6
  },
  content: {
    padding: 16,
    flexDirection: 'row',
    alignItems: 'center'
  },
  icon: {
    marginRight: 12
  },
  message: {
    flex: 1,
    color: Colors.neutrals.white,
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium
  },
  actionButton: {
    marginLeft: 8,
    paddingHorizontal: 8,
    paddingVertical: 4
  },
  actionText: {
    color: Colors.neutrals.white,
    fontWeight: Typography.weights.bold,
    fontSize: Typography.sizes.body
  },
  closeButton: {
    marginLeft: 8,
    padding: 4
  },
  progressContainer: {
    height: 4,
    width: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.2)'
  },
  progressBar: {
    height: '100%',
    backgroundColor: 'rgba(255, 255, 255, 0.5)'
  }
});

export default Toast;