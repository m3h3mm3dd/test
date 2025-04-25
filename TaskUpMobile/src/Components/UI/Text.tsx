import React from 'react';
import { Text as RNText, TextStyle, StyleSheet } from 'react-native';
import { useTheme } from '../../Hooks/UseTheme';

type TextVariant =
  | 'h1'
  | 'h2'
  | 'h3'
  | 'subtitle'
  | 'body'
  | 'body2'
  | 'caption'
  | 'button'
  | 'overline';

interface TextProps {
  children: React.ReactNode;
  variant?: TextVariant;
  style?: TextStyle;
  numberOfLines?: number;
  ellipsizeMode?: 'head' | 'middle' | 'tail' | 'clip';
  onPress?: () => void;
}

export const Text = ({
  children,
  variant = 'body',
  style,
  numberOfLines,
  ellipsizeMode,
  onPress,
  ...rest
}: TextProps) => {
  const { theme } = useTheme();

  const getVariantStyle = (): TextStyle => {
    switch (variant) {
      case 'h1':
        return {
          fontFamily: theme.fonts.bold,
          fontSize: theme.fontSizes.xxl,
          lineHeight: theme.fontSizes.xxl * 1.3,
          color: theme.colors.text,
        };
      case 'h2':
        return {
          fontFamily: theme.fonts.semiBold,
          fontSize: theme.fontSizes.xl,
          lineHeight: theme.fontSizes.xl * 1.3,
          color: theme.colors.text,
        };
      case 'h3':
        return {
          fontFamily: theme.fonts.semiBold,
          fontSize: theme.fontSizes.lg,
          lineHeight: theme.fontSizes.lg * 1.3,
          color: theme.colors.text,
        };
      case 'subtitle':
        return {
          fontFamily: theme.fonts.medium,
          fontSize: theme.fontSizes.md,
          lineHeight: theme.fontSizes.md * 1.4,
          color: theme.colors.textSecondary,
        };
      case 'body':
        return {
          fontFamily: theme.fonts.regular,
          fontSize: theme.fontSizes.md,
          lineHeight: theme.fontSizes.md * 1.5,
          color: theme.colors.text,
        };
      case 'body2':
        return {
          fontFamily: theme.fonts.regular,
          fontSize: theme.fontSizes.sm,
          lineHeight: theme.fontSizes.sm * 1.5,
          color: theme.colors.text,
        };
      case 'caption':
        return {
          fontFamily: theme.fonts.regular,
          fontSize: theme.fontSizes.xs,
          lineHeight: theme.fontSizes.xs * 1.5,
          color: theme.colors.textSecondary,
        };
      case 'button':
        return {
          fontFamily: theme.fonts.medium,
          fontSize: theme.fontSizes.sm,
          lineHeight: theme.fontSizes.sm * 1.3,
          color: theme.colors.primary,
          letterSpacing: 0.4,
        };
      case 'overline':
        return {
          fontFamily: theme.fonts.medium,
          fontSize: theme.fontSizes.xs,
          letterSpacing: 1.5,
          textTransform: 'uppercase',
          color: theme.colors.textSecondary,
        };
      default:
        return {
          fontFamily: theme.fonts.regular,
          fontSize: theme.fontSizes.md,
          lineHeight: theme.fontSizes.md * 1.5,
          color: theme.colors.text,
        };
    }
  };

  return (
    <RNText
      style={[getVariantStyle(), style]}
      numberOfLines={numberOfLines}
      ellipsizeMode={ellipsizeMode}
      onPress={onPress}
      {...rest}
    >
      {children}
    </RNText>
  );
};