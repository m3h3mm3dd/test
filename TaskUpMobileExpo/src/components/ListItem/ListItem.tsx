import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  Text, 
  TouchableOpacity, 
  View, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import * as Haptics from 'expo-haptics';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring,
  FadeIn,
  Layout
} from 'react-native-reanimated';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import { triggerImpact } from '../../utils/HapticUtils';
import { useTheme } from '../../hooks/useColorScheme';

interface ListItemProps {
  title: string;
  subtitle?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onPress?: () => void;
  disabled?: boolean;
  highlighted?: boolean;
  onLongPress?: () => void;
  testID?: string;
  style?: ViewStyle;
  titleStyle?: TextStyle;
  subtitleStyle?: TextStyle;
  divider?: boolean;
  accessibilityLabel?: string;
  accessibilityHint?: string;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

const ListItem = ({ 
  title, 
  subtitle, 
  leftIcon, 
  rightIcon, 
  onPress,
  disabled = false,
  highlighted = false,
  onLongPress,
  testID,
  style,
  titleStyle,
  subtitleStyle,
  divider = false,
  accessibilityLabel,
  accessibilityHint,
  index = 0
}: ListItemProps) => {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const itemOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Animate in with a staggered delay based on index
    itemOpacity.value = withTiming(1, { duration: 300 });
  }, []);
  
  const handlePress = () => {
    if (!onPress || disabled) return;
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  
  const handlePressIn = () => {
    if (!onPress || disabled) return;
    scale.value = withTiming(0.98, { duration: 100 });
  };
  
  const handlePressOut = () => {
    if (!onPress || disabled) return;
    scale.value = withSpring(1, { damping: 15, stiffness: 300 });
  };
  
  const handleLongPress = () => {
    if (!onLongPress || disabled) return;
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    onLongPress();
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: itemOpacity.value
    };
  });

  const Container = onPress ? AnimatedTouchable : Animated.View;
  const containerProps = onPress
    ? {
        onPress: handlePress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        onLongPress: onLongPress ? handleLongPress : undefined,
        disabled,
        testID,
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: accessibilityLabel || title,
        accessibilityHint: accessibilityHint || subtitle,
        accessibilityState: { disabled },
        activeOpacity: 0.7
      }
    : { testID };

  return (
    <Container
      style={[
        styles.container, 
        {
          backgroundColor: isDark 
            ? highlighted 
              ? `${colors.primary[700]}30` // 30% opacity primary color
              : colors.card.background 
            : highlighted 
              ? `${Colors.primary[500]}10` // 10% opacity primary color
              : Colors.neutrals.white
        },
        divider && [
          styles.divider,
          { borderBottomColor: isDark ? colors.border : Colors.neutrals.gray200 }
        ],
        disabled && styles.disabled,
        animatedStyle,
        style
      ]}
      {...containerProps}
      entering={FadeIn.delay(index * 50).duration(300)}
      layout={Layout.springify().damping(14)}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      
      <View style={styles.contentContainer}>
        <Text 
          style={[
            styles.title,
            { color: isDark ? colors.text.primary : Colors.neutrals.gray900 },
            titleStyle
          ]}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        
        {subtitle && (
          <Text 
            style={[
              styles.subtitle,
              { color: isDark ? colors.text.secondary : Colors.neutrals.gray600 },
              subtitleStyle
            ]}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>
      
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </Container>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 12,
    marginBottom: 8,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
      },
      android: {
        elevation: 2
      }
    })
  },
  divider: {
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200,
    borderRadius: 0,
    marginBottom: 0
  },
  disabled: {
    opacity: 0.5
  },
  leftIcon: {
    marginRight: 16
  },
  contentContainer: {
    flex: 1
  },
  title: {
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  subtitle: {
    fontSize: Typography.sizes.sm,
    color: Colors.neutrals.gray600
  },
  rightIcon: {
    marginLeft: 16
  }
});

export default ListItem;