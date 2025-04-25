import { useCallback } from 'react';
import {
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  Easing,
  interpolate,
  Extrapolation,
} from 'react-native-reanimated';

export const useAnimation = () => {
  const createTimedAnimation = useCallback(
    (
      initialValue: number,
      finalValue: number,
      duration: number = 300,
      easing: any = Easing.bezier(0.25, 0.1, 0.25, 1),
      delay: number = 0
    ) => {
      const animationValue = useSharedValue(initialValue);

      const runAnimation = () => {
        if (delay > 0) {
          animationValue.value = withDelay(
            delay,
            withTiming(finalValue, {
              duration,
              easing,
            })
          );
        } else {
          animationValue.value = withTiming(finalValue, {
            duration,
            easing,
          });
        }
      };

      const resetAnimation = () => {
        animationValue.value = initialValue;
      };

      return {
        value: animationValue,
        run: runAnimation,
        reset: resetAnimation,
      };
    },
    []
  );

  const createSpringAnimation = useCallback(
    (
      initialValue: number,
      finalValue: number,
      config: any = { damping: 10, stiffness: 100 },
      delay: number = 0
    ) => {
      const animationValue = useSharedValue(initialValue);

      const runAnimation = () => {
        if (delay > 0) {
          animationValue.value = withDelay(
            delay,
            withSpring(finalValue, config)
          );
        } else {
          animationValue.value = withSpring(finalValue, config);
        }
      };

      const resetAnimation = () => {
        animationValue.value = initialValue;
      };

      return {
        value: animationValue,
        run: runAnimation,
        reset: resetAnimation,
      };
    },
    []
  );

  const createSequence = useCallback(
    (animations: any[], initialRun: boolean = false) => {
      if (initialRun) {
        animations.forEach((animation) => {
          animation.run();
        });
      }

      const runSequence = () => {
        animations.forEach((animation) => {
          animation.run();
        });
      };

      const resetSequence = () => {
        animations.forEach((animation) => {
          animation.reset();
        });
      };

      return {
        run: runSequence,
        reset: resetSequence,
      };
    },
    []
  );

  const interpolateValue = useCallback(
    (
      animationValue: any,
      inputRange: number[],
      outputRange: number[],
      extrapolation: Extrapolation = Extrapolation.CLAMP
    ) => {
      return interpolate(
        animationValue.value,
        inputRange,
        outputRange,
        extrapolation
      );
    },
    []
  );

  return {
    createTimedAnimation,
    createSpringAnimation,
    createSequence,
    interpolateValue,
  };
};