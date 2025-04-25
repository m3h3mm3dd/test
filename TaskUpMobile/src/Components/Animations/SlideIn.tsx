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

type Direction = 'left' | 'right' | 'top' | 'bottom';

interface SlideInProps {
  children: ReactNode;
  from: Direction;
  distance?: number;
  duration?: number;
  delay?: number;
  style?: ViewStyle;
  onAnimationComplete?: () => void;
  withFade?: boolean;
}

export const SlideIn = ({
  children,
  from = 'bottom',
  distance = 100,
  duration = 500,
  delay = 0,
  style,
  onAnimationComplete,
  withFade = true,
}: SlideInProps) => {
  const translateX = useSharedValue(0);
  const translateY = useSharedValue(0);
  const opacity = useSharedValue(withFade ? 0 : 1);

  React.useEffect(() => {
    const setupInitialPosition = () => {
      if (from === 'left') {
        translateX.value = -distance;
      } else if (from === 'right') {
        translateX.value = distance;
      } else if (from === 'top') {
        translateY.value = -distance;
      } else if (from === 'bottom') {
        translateY.value = distance;
      }
      
      if (withFade) {
        opacity.value = 0;
      }
    };

    const animateToFinalPosition = () => {
      const animationFinished = () => {
        if (onAnimationComplete) {
          onAnimationComplete();
        }
      };

      translateX.value = withDelay(
        delay,
        withTiming(
          0,
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

      translateY.value = withDelay(
        delay,
        withTiming(0, {
          duration,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        })
      );

      if (withFade) {
        opacity.value = withDelay(
          delay,
          withTiming(1, {
            duration,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          })
        );
      }
    };

    setupInitialPosition();
    animateToFinalPosition();
  }, [translateX, translateY, opacity, from, distance, duration, delay, onAnimationComplete, withFade]);

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { translateX: translateX.value },
        { translateY: translateY.value },
      ],
      opacity: opacity.value,
    };
  });

  return (
    <Animated.View style={[animatedStyle, style]}>
      {children}
    </Animated.View>
  );
};