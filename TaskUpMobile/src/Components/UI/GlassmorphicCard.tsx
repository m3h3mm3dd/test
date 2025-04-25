import React from 'react';
import { StyleSheet, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withSpring 
} from 'react-native-reanimated';
import { useTheme } from '../../Hooks/UseTheme';
import { BlurView } from '@react-native-community/blur';

interface GlassmorphicCardProps {
  children: React.ReactNode;
  style?: ViewStyle;
  blurAmount?: number;
  pressable?: boolean;
  onPress?: () => void;
}

export const GlassmorphicCard = ({
  children,
  style,
  blurAmount = 10,
  pressable = false,
  onPress,
}: GlassmorphicCardProps) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    if (pressable) {
      scale.value = withSpring(0.97, { damping: 15, stiffness: 300 });
    }
  };

  const handlePressOut = () => {
    if (pressable) {
      scale.value = withSpring(1, { damping: 15, stiffness: 300 });
    }
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const AnimatedComponent = pressable ? Animated.Pressable : Animated.View;
  const pressProps = pressable
    ? {
        onPress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
      }
    : {};

  return (
    <AnimatedComponent
      style={[
        styles.container,
        {
          backgroundColor: theme.isDarkMode
            ? 'rgba(40, 40, 40, 0.65)'
            : 'rgba(255, 255, 255, 0.65)',
          borderColor: theme.isDarkMode
            ? 'rgba(80, 80, 80, 0.3)'
            : 'rgba(255, 255, 255, 0.5)',
          ...theme.shadows.medium,
        },
        animatedStyle,
        style,
      ]}
      {...pressProps}
    >
      <BlurView
        style={styles.blurView}
        blurType={theme.isDarkMode ? 'dark' : 'light'}
        blurAmount={blurAmount}
        reducedTransparencyFallbackColor={
          theme.isDarkMode ? 'rgba(40, 40, 40, 0.9)' : 'rgba(255, 255, 255, 0.9)'
        }
      />
      <Animated.View style={styles.content}>{children}</Animated.View>
    </AnimatedComponent>
  );
};

const styles = StyleSheet.create({
  container: {
    overflow: 'hidden',
    borderRadius: 16,
    borderWidth: 1,
  },
  blurView: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    padding: 16,
  },
});