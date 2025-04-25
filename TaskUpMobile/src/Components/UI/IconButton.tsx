import React from 'react';
import {
  StyleSheet,
  TouchableOpacity,
  ViewStyle,
  ActivityIndicator,
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
} from 'react-native-reanimated';
import { useTheme } from '../../Hooks/UseTheme';
import Icon from 'react-native-vector-icons/Ionicons';

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

interface IconButtonProps {
  name: string;
  onPress: () => void;
  color?: string;
  size?: number;
  backgroundColor?: string;
  borderColor?: string;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
}

export const IconButton = ({
  name,
  onPress,
  color,
  size = 24,
  backgroundColor,
  borderColor,
  loading,
  disabled,
  style,
}: IconButtonProps) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);

  const handlePressIn = () => {
    scale.value = withSpring(0.9, { damping: 10, stiffness: 300 });
  };

  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 10, stiffness: 300 });
  };

  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  return (
    <AnimatedTouchable
      style={[
        styles.button,
        {
          backgroundColor: backgroundColor || 'transparent',
          borderColor: borderColor || 'transparent',
          opacity: disabled ? 0.5 : 1,
        },
        animatedStyle,
        style,
      ]}
      onPress={onPress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.7}
    >
      {loading ? (
        <ActivityIndicator size="small" color={color || theme.colors.primary} />
      ) : (
        <Icon
          name={name}
          size={size}
          color={color || theme.colors.primary}
        />
      )}
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1,
  },
});