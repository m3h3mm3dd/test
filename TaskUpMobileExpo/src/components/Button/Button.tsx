import React, { useMemo } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  ActivityIndicator, 
  ViewStyle,
  TextStyle,
  Platform
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withSequence,
  Easing
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Metrics from '../../theme/Metrics';
import { triggerImpact } from '../../utils/HapticUtils';

const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

export type ButtonVariant = 'primary' | 'secondary' | 'tertiary' | 'success' | 'danger';
export type ButtonSize = 'small' | 'medium' | 'large';

interface ButtonProps {
  title: string;
  onPress: () => void;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  loading?: boolean;
  icon?: keyof typeof Feather.glyphMap;
  iconPosition?: 'left' | 'right';
  fullWidth?: boolean;
  round?: boolean;
  style?: ViewStyle;
  textStyle?: TextStyle;
  animationType?: 'spring' | 'bounce' | 'pulse' | 'ripple';
  gradientColors?: string[];
}

const Button = ({
  title,
  onPress,
  variant = 'primary',
  size = 'medium',
  disabled = false,
  loading = false,
  icon,
  iconPosition = 'left',
  fullWidth = false,
  round = false,
  style,
  textStyle,
  animationType = 'spring',
  gradientColors
}: ButtonProps) => {
  // Animation shared values
  const scale = useSharedValue(1);
  const rippleScale = useSharedValue(0);
  const rippleOpacity = useSharedValue(0);
  const contentOpacity = useSharedValue(1);
  const loadingOpacity = useSharedValue(loading ? 1 : 0);
  
  // Compute variant-based styles
  const buttonConfig = useMemo(() => {
    const config: {
      backgroundColor: string,
      borderColor: string,
      textColor: string,
      disabledBackgroundColor: string,
      disabledTextColor: string,
      gradientColors: string[]
    } = {
      backgroundColor: Colors.primary[500],
      borderColor: 'transparent',
      textColor: Colors.neutrals.white,
      disabledBackgroundColor: Colors.neutrals.gray300,
      disabledTextColor: Colors.neutrals.gray600,
      gradientColors: gradientColors || []
    };
    
    switch (variant) {
      case 'primary':
        config.backgroundColor = Colors.primary[500];
        config.textColor = Colors.neutrals.white;
        config.gradientColors = gradientColors || [Colors.primary[400], Colors.primary[600]];
        break;
      case 'secondary':
        config.backgroundColor = 'transparent';
        config.borderColor = Colors.primary[500];
        config.textColor = Colors.primary[500];
        config.disabledBackgroundColor = 'transparent';
        config.disabledTextColor = Colors.neutrals.gray400;
        config.gradientColors = [];
        break;
      case 'tertiary':
        config.backgroundColor = 'transparent';
        config.textColor = Colors.primary[500];
        config.disabledBackgroundColor = 'transparent';
        config.disabledTextColor = Colors.neutrals.gray400;
        config.gradientColors = [];
        break;
      case 'success':
        config.backgroundColor = Colors.success[500];
        config.textColor = Colors.neutrals.white;
        config.disabledBackgroundColor = Colors.neutrals.gray300;
        config.gradientColors = gradientColors || [Colors.success[400], Colors.success[600]];
        break;
      case 'danger':
        config.backgroundColor = Colors.error[500];
        config.textColor = Colors.neutrals.white;
        config.disabledBackgroundColor = Colors.neutrals.gray300;
        config.gradientColors = gradientColors || [Colors.error[400], Colors.error[600]];
        break;
    }
    
    return config;
  }, [variant, gradientColors]);
  
  // Size configuration
  const sizeConfig = useMemo(() => {
    const config: {
      height: number,
      paddingHorizontal: number,
      borderRadius: number,
      fontSize: number,
      iconSize: number
    } = {
      height: Metrics.buttonHeight.md,
      paddingHorizontal: 20,
      borderRadius: 8,
      fontSize: Typography.sizes.md,
      iconSize: 18
    };
    
    switch (size) {
      case 'small':
        config.height = Metrics.buttonHeight.sm;
        config.paddingHorizontal = 16;
        config.borderRadius = 6;
        config.fontSize = Typography.sizes.sm;
        config.iconSize = 14;
        break;
      case 'large':
        config.height = Metrics.buttonHeight.lg;
        config.paddingHorizontal = 24;
        config.borderRadius = 10;
        config.fontSize = Typography.sizes.lg;
        config.iconSize = 22;
        break;
    }
    
    return config;
  }, [size]);
  
  // Handle animations
  const handlePressIn = () => {
    if (!onPress || disabled) return;
    
    switch (animationType) {
      case 'spring':
        scale.value = withTiming(0.95, { duration: 100 });
        break;
      case 'bounce':
        scale.value = withTiming(0.9, { duration: 100 });
        break;
      case 'pulse':
        scale.value = withTiming(0.95, { duration: 100 });
        break;
      case 'ripple':
        rippleScale.value = 0;
        rippleOpacity.value = 0.3;
        rippleScale.value = withTiming(1, { duration: 400 });
        rippleOpacity.value = withTiming(0, { duration: 400 });
        break;
    }
  };
  
  const handlePressOut = () => {
    if (!onPress || disabled) return;
    
    switch (animationType) {
      case 'spring':
        scale.value = withSpring(1, { damping: 12, stiffness: 150 });
        break;
      case 'bounce':
        scale.value = withSequence(
          withTiming(1.05, { duration: 150 }),
          withTiming(1, { duration: 150 })
        );
        break;
      case 'pulse':
        scale.value = withTiming(1, { duration: 200 });
        break;
    }
  };
  
  const handlePress = () => {
    if (disabled || loading) return;
    
    triggerImpact(variant === 'primary' 
      ? Haptics.ImpactFeedbackStyle.Medium 
      : Haptics.ImpactFeedbackStyle.Light);
      
    // If loading state changes, animate it
    if (loading) {
      contentOpacity.value = withTiming(0, { duration: 150 });
      loadingOpacity.value = withTiming(1, { duration: 150 });
    } else {
      loadingOpacity.value = withTiming(0, { duration: 150 });
      contentOpacity.value = withTiming(1, { duration: 150 });
    }
    
    onPress();
  };
  
  // Animated styles
  const buttonAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: disabled ? 0.7 : 1
    };
  });
  
  const contentAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: contentOpacity.value
    };
  });
  
  const loadingAnimatedStyle = useAnimatedStyle(() => {
    return {
      opacity: loadingOpacity.value,
      position: 'absolute',
      alignSelf: 'center'
    };
  });
  
  const rippleAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: rippleScale.value }],
      opacity: rippleOpacity.value
    };
  });
  
  // Render icon if provided
  const renderIcon = () => {
    if (!icon) return null;
    
    return (
      <Feather 
        name={icon} 
        size={sizeConfig.iconSize} 
        color={disabled ? buttonConfig.disabledTextColor : buttonConfig.textColor}
        style={[
          styles.icon, 
          iconPosition === 'right' && styles.iconRight
        ]} 
      />
    );
  };
  
  // Determine button content
  const ButtonContent = () => (
    <Animated.View style={[styles.contentContainer, contentAnimatedStyle]}>
      {iconPosition === 'left' && renderIcon()}
      <Text 
        style={[
          styles.text, 
          { 
            color: disabled ? buttonConfig.disabledTextColor : buttonConfig.textColor,
            fontSize: sizeConfig.fontSize
          },
          textStyle
        ]}
        numberOfLines={1}
      >
        {title}
      </Text>
      {iconPosition === 'right' && renderIcon()}
    </Animated.View>
  );
  
  return (
    <AnimatedTouchable
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={disabled || loading}
      activeOpacity={0.9}
      style={[
        styles.button, 
        {
          height: sizeConfig.height,
          paddingHorizontal: sizeConfig.paddingHorizontal,
          borderRadius: round ? sizeConfig.height / 2 : sizeConfig.borderRadius,
          backgroundColor: 
            variant === 'secondary' || variant === 'tertiary' 
              ? 'transparent' 
              : disabled 
                ? buttonConfig.disabledBackgroundColor 
                : buttonConfig.backgroundColor,
          borderWidth: variant === 'secondary' ? 1 : 0,
          borderColor: disabled 
            ? buttonConfig.disabledTextColor
            : buttonConfig.borderColor,
          width: fullWidth ? '100%' : 'auto'
        },
        buttonAnimatedStyle,
        style
      ]}
      accessible={true}
      accessibilityRole="button"
      accessibilityState={{ disabled: disabled || loading }}
      accessibilityLabel={title}
    >
      {buttonConfig.gradientColors.length > 0 && !disabled ? (
        <AnimatedLinearGradient
          colors={buttonConfig.gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={[StyleSheet.absoluteFill, { 
            borderRadius: round ? sizeConfig.height / 2 : sizeConfig.borderRadius
          }]}
        />
      ) : null}
      
      {animationType === 'ripple' && (
        <Animated.View 
          style={[
            styles.ripple, 
            { 
              backgroundColor: variant === 'secondary' || variant === 'tertiary'
                ? buttonConfig.textColor
                : Colors.neutrals.white
            },
            rippleAnimatedStyle
          ]} 
        />
      )}
      
      <ButtonContent />
      
      <Animated.View style={loadingAnimatedStyle}>
        <ActivityIndicator 
          color={
            variant === 'secondary' || variant === 'tertiary'
              ? disabled 
                ? buttonConfig.disabledTextColor 
                : buttonConfig.textColor
              : Colors.neutrals.white
          }
          size={size === 'small' ? 'small' : 'small'}
        />
      </Animated.View>
    </AnimatedTouchable>
  );
};

const styles = StyleSheet.create({
  button: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.1,
        shadowRadius: 8,
      },
      android: {
        elevation: 3
      }
    })
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center'
  },
  text: {
    fontWeight: Typography.weights.medium
  },
  icon: {
    marginRight: 8
  },
  iconRight: {
    marginRight: 0,
    marginLeft: 8
  },
  ripple: {
    position: 'absolute',
    width: '300%',
    height: '300%',
    borderRadius: 1000,
    opacity: 0
  }
});

export default Button;