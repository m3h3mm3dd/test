import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  ViewStyle, 
  StyleProp,
  Platform
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  interpolate,
  Extrapolation,
  FadeIn
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';

import Colors from '../theme/Colors';
import Spacing from '../theme/Spacing';
import { triggerImpact } from '../utils/HapticUtils';
import { useTheme } from '../hooks/useColorScheme';

interface CardProps {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  onPress?: () => void;
  disabled?: boolean;
  elevation?: number;
  gradientColors?: string[];
  gradientStart?: { x: number; y: number };
  gradientEnd?: { x: number; y: number };
  animationType?: 'spring' | 'scale' | 'tilt' | 'none';
  borderRadius?: number;
  index?: number;
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedLinearGradient = Animated.createAnimatedComponent(LinearGradient);

const Card = ({
  children,
  style,
  onPress,
  disabled = false,
  elevation = 2,
  gradientColors,
  gradientStart = { x: 0, y: 0 },
  gradientEnd = { x: 1, y: 1 },
  animationType = 'spring',
  borderRadius = 12,
  index = 0
}: CardProps) => {
  const { colors, isDark } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const rotateX = useSharedValue(0);
  const rotateY = useSharedValue(0);
  const shadowOpacity = useSharedValue(isDark ? 0.3 : elevation * 0.08);
  const cardOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Entry animation with staggered delay based on index
    cardOpacity.value = withTiming(1, { duration: 300 });
  }, []);
  
  // Handle animation on press
  const handlePressIn = () => {
    if (disabled) return;
    
    if (animationType === 'spring' || animationType === 'scale') {
      scale.value = withTiming(0.97, { duration: 150 });
      shadowOpacity.value = withTiming(isDark ? 0.2 : elevation * 0.05, { duration: 150 });
    } else if (animationType === 'tilt') {
      rotateX.value = withTiming(3, { duration: 150 });
      rotateY.value = withTiming(-3, { duration: 150 });
    }
  };
  
  const handlePressOut = () => {
    if (disabled) return;
    
    if (animationType === 'spring') {
      scale.value = withSpring(1, { 
        damping: 12, 
        stiffness: 200 
      });
      shadowOpacity.value = withTiming(isDark ? 0.3 : elevation * 0.08, { duration: 200 });
    } else if (animationType === 'scale') {
      scale.value = withTiming(1, { duration: 150 });
      shadowOpacity.value = withTiming(isDark ? 0.3 : elevation * 0.08, { duration: 150 });
    } else if (animationType === 'tilt') {
      rotateX.value = withSpring(0, { 
        damping: 10, 
        stiffness: 100 
      });
      rotateY.value = withSpring(0, { 
        damping: 10, 
        stiffness: 100 
      });
    }
  };
  
  const handlePress = () => {
    if (disabled || !onPress) return;
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    onPress();
  };
  
  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { scale: scale.value },
        { perspective: 1000 },
        { rotateX: `${rotateX.value}deg` },
        { rotateY: `${rotateY.value}deg` }
      ],
      opacity: cardOpacity.value
    };
  });
  
  const shadowAnimatedStyle = useAnimatedStyle(() => {
    return {
      shadowOpacity: shadowOpacity.value
    };
  });
  
  // Adjust shadow based on elevation
  const shadowStyles = {
    shadowColor: isDark ? Colors.neutrals.black : Colors.neutrals.black,
    shadowOffset: { 
      width: 0, 
      height: Math.max(1, Math.round(elevation / 2))
    },
    shadowOpacity: isDark ? 0.3 : elevation * 0.08,
    shadowRadius: Math.max(1, Math.round(elevation)),
    elevation: isDark ? elevation * 0.7 : elevation
  };
  
  // Determine if card is pressable
  const CardContainer = onPress ? AnimatedTouchable : Animated.View;
  const cardProps = onPress ? {
    activeOpacity: 0.9,
    onPress: handlePress,
    onPressIn: handlePressIn,
    onPressOut: handlePressOut,
    disabled,
    accessibilityRole: 'button'
  } : {};
  
  return (
    <CardContainer
      style={[
        styles.card, 
        { 
          borderRadius,
          backgroundColor: isDark ? colors.card.background : Colors.neutrals.white,
          borderColor: isDark ? colors.card.border : 'transparent',
          borderWidth: isDark ? 1 : 0,
        },
        shadowStyles,
        shadowAnimatedStyle,
        cardAnimatedStyle,
        style
      ]}
      {...cardProps}
      entering={FadeIn.delay(index * 50).duration(300)}
    >
      {gradientColors && gradientColors.length >= 2 ? (
        <AnimatedLinearGradient
          colors={gradientColors}
          start={gradientStart}
          end={gradientEnd}
          style={[
            StyleSheet.absoluteFillObject,
            { borderRadius }
          ]}
        />
      ) : null}
      
      <View style={styles.contentContainer}>
        {children}
      </View>
    </CardContainer>
  );
};

const styles = StyleSheet.create({
  card: {
    backgroundColor: Colors.neutrals.white,
    padding: Spacing.md,
    overflow: 'hidden'
  },
  contentContainer: {
    overflow: 'hidden'
  }
});

export default Card;