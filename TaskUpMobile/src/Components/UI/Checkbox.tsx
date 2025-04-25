import React from 'react';
import { StyleSheet, TouchableOpacity, View, ViewStyle } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from './Text';
import Icon from 'react-native-vector-icons/Ionicons';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  label?: string;
  disabled?: boolean;
  style?: ViewStyle;
}

export const Checkbox = ({
  checked,
  onToggle,
  label,
  disabled = false,
  style,
}: CheckboxProps) => {
  const { theme } = useTheme();
  const scale = useSharedValue(1);
  const checkOpacity = useSharedValue(checked ? 1 : 0);

  React.useEffect(() => {
    checkOpacity.value = withTiming(checked ? 1 : 0, {
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1),
    });
  }, [checked, checkOpacity]);

  const handlePress = () => {
    if (!disabled) {
      onToggle();
      scale.value = withTiming(0.8, {
        duration: 100,
        easing: Easing.bezier(0.25, 0.1,.25, 1),
      });
      
      setTimeout(() => {
        scale.value = withTiming(1, {
          duration: 100,
          easing: Easing.bezier(0.25, 0.1, 0.25, 1),
        });
      }, 100);
    }
  };

  const containerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
    };
  });

  const checkAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: checkOpacity.value,
    };
  });

  return (
    <TouchableOpacity
      onPress={handlePress}
      disabled={disabled}
      style={[styles.container, style]}
      activeOpacity={0.8}
    >
      <Animated.View
        style={[
          styles.checkbox,
          {
            borderColor: checked ? theme.colors.primary : theme.colors.border,
            backgroundColor: checked ? theme.colors.primary : 'transparent',
            opacity: disabled ? 0.5 : 1,
          },
          containerAnimatedStyle,
        ]}
      >
        <Animated.View style={checkAnimatedStyle}>
          <Icon name="checkmark" size={14} color="white" />
        </Animated.View>
      </Animated.View>
      
      {label && (
        <Text
          variant="body"
          style={[
            styles.label,
            {
              color: disabled ? theme.colors.textSecondary : theme.colors.text,
            },
          ]}
        >
          {label}
        </Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  checkbox: {
    width: 22,
    height: 22,
    borderRadius: 4,
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  label: {
    marginLeft: 8,
  },
});