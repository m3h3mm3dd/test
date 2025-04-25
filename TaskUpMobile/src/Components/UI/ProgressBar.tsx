import React, { useEffect } from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../Hooks/UseTheme';

interface ProgressBarProps {
  progress: number;
  height?: number;
  backgroundColor?: string;
  progressColor?: string;
  animated?: boolean;
  duration?: number;
  style?: ViewStyle;
}

export const ProgressBar = ({
  progress,
  height = 6,
  backgroundColor,
  progressColor,
  animated = true,
  duration = 800,
  style,
}: ProgressBarProps) => {
  const { theme } = useTheme();
  const widthValue = useSharedValue(0);

  useEffect(() => {
    if (animated) {
      widthValue.value = withTiming(progress, {
        duration,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    } else {
      widthValue.value = progress;
    }
  }, [progress, animated, duration, widthValue]);

  const progressStyle = useAnimatedStyle(() => {
    return {
      width: `${widthValue.value * 100}%`,
    };
  });

  const getProgressColor = () => {
    if (progressColor) return progressColor;
    
    if (progress < 0.3) return theme.colors.error;
    if (progress < 0.7) return theme.colors.warning;
    return theme.colors.success;
  };

  return (
    <View
      style={[
        styles.container,
        {
          height,
          backgroundColor: backgroundColor || theme.colors.border,
          borderRadius: height / 2,
        },
        style,
      ]}
    >
      <Animated.View
        style={[
          styles.progress,
          {
            backgroundColor: getProgressColor(),
            borderRadius: height / 2,
          },
          progressStyle,
        ]}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    width: '100%',
    overflow: 'hidden',
  },
  progress: {
    height: '100%',
  },
});