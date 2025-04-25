import React from 'react';
import { StyleSheet, View, ViewStyle } from 'react-native';
import { Text } from './Text';
import { useTheme } from '../../Hooks/UseTheme';

interface BadgeProps {
  label: string;
  color?: string;
  size?: 'small' | 'medium' | 'large';
  style?: ViewStyle;
}

export const Badge = ({ 
  label, 
  color, 
  size = 'medium', 
  style 
}: BadgeProps) => {
  const { theme } = useTheme();

  const getPadding = () => {
    switch (size) {
      case 'small':
        return { paddingVertical: 2, paddingHorizontal: 6 };
      case 'large':
        return { paddingVertical: 8, paddingHorizontal: 16 };
      default:
        return { paddingVertical: 4, paddingHorizontal: 10 };
    }
  };

  const getFontSize = () => {
    switch (size) {
      case 'small':
        return theme.fontSizes.xs;
      case 'large':
        return theme.fontSizes.md;
      default:
        return theme.fontSizes.sm;
    }
  };

  const getBorderRadius = () => {
    switch (size) {
      case 'small':
        return 4;
      case 'large':
        return 12;
      default:
        return 8;
    }
  };

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: `${color || theme.colors.primary}20`,
          borderColor: color || theme.colors.primary,
          borderRadius: getBorderRadius(),
          ...getPadding(),
        },
        style,
      ]}
    >
      <Text
        variant="caption"
        style={{
          color: color || theme.colors.primary,
          fontSize: getFontSize(),
          fontFamily: theme.fonts.medium,
        }}
      >
        {label}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
});