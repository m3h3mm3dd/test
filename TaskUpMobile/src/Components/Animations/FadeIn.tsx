import React, { ReactNode } from 'react';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
  withDelay,
  runOnJS,
} from 'react-native-reanimated';
import { ViewStyle } from 'react-native';

interface FadeInProps {
  children: ReactNode;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
  initialOpacity?: number;
  finalOpacity?: number;
}

export const FadeIn = ({
  children,
  duration = 500,
  delay = 0,
  style,
  onAnimationComplete,
  initialOpacity = 0,
  finalOpacity = 1,
}: FadeInProps) => {
  const opacity = useSharedValue(initialOpacity);

  React.useEffect(() => {
    opacity.value = initialOpacity;
    const animationFinished = () => {
      if (onAnimationComplete) {
        onAnimationComplete();
      }
    };

    opacity.value = withDelay(
      delay,
      withTiming(
        finalOpacity,
        {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        },
        (finished) => {
          if (finished && onAnimationComplete) {
            runOnJS(animationFinished)();
          }
        }
      )
    );
  }, [opacity, initialOpacity, finalOpacity, duration, delay, onAnimationComplete]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};