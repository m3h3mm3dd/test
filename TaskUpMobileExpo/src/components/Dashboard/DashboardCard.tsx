import React, { useEffect } from 'react';
import { StyleSheet, View, Text, TouchableOpacity, Dimensions, Platform } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSpring,
  withRepeat,
  withSequence,
  Easing,
  FadeIn,
  SlideInRight
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Spacing from '../../theme/Spacing';
import { triggerImpact } from '../../utils/HapticUtils';
import { useTheme } from '../../hooks/useColorScheme';

const { width } = Dimensions.get('window');
const CARD_WIDTH = width * 0.7;

const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

interface DashboardCardProps {
  title: string;
  value: string | number;
  icon?: keyof typeof Feather.glyphMap;
  gradientColors?: string[];
  onPress?: () => void;
  description?: string;
  loading?: boolean;
  trending?: 'up' | 'down' | 'flat';
  trendingValue?: string;
  highlight?: boolean;
  index?: number;
}

const DashboardCard = ({ 
  title, 
  value, 
  icon = 'box', 
  gradientColors, 
  onPress,
  description,
  loading = false,
  trending,
  trendingValue,
  highlight = false,
  index = 0
}: DashboardCardProps) => {
  const { isDark, colors } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const iconScale = useSharedValue(1);
  const cardOpacity = useSharedValue(0);
  const shadowOpacity = useSharedValue(0);
  const shimmerPosition = useSharedValue(-CARD_WIDTH);
  
  useEffect(() => {
    // Entry animation with staggered delay based on index
    const entryDelay = index * 150;
    cardOpacity.value = withTiming(1, { duration: 500, easing: Easing.out(Easing.cubic) });
    shadowOpacity.value = withTiming(highlight ? 0.5 : 0.2, { duration: 800 });
    
    // Icon pulse animation for highlight cards
    if (highlight) {
      iconScale.value = withRepeat(
        withSequence(
          withTiming(1, { duration: 500 }),
          withTiming(1.2, { duration: 800, easing: Easing.out(Easing.cubic) }),
          withTiming(1, { duration: 500 })
        ),
        -1,
        true
      );
    }
    
    // Shimmer animation for loading state or as ambient effect
    shimmerPosition.value = withRepeat(
      withTiming(CARD_WIDTH * 2, { duration: 3000, easing: Easing.inOut(Easing.quad) }),
      -1,
      false
    );
  }, [highlight, index]);
  
  // Handle press animations
  const handlePressIn = () => {
    scale.value = withTiming(0.96, { duration: 150 });
    rotation.value = withTiming(0.5, { duration: 250 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 180 });
    rotation.value = withSpring(0, { damping: 10, stiffness: 100 });
  };
  
  const handlePress = () => {
    if (onPress) {
      triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
      onPress();
    }
  };
  
  // Default gradient if none provided
  const cardGradientColors = gradientColors || [
    colors.primary[500],
    colors.primary[700]
  ];
  
  // Animated styles
  const cardAnimatedStyle = useAnimatedStyle(() => {
    const rotateY = `${rotation.value}deg`;
    
    return {
      transform: [
        { scale: scale.value },
        { perspective: 1000 },
        { rotateY }
      ],
      opacity: cardOpacity.value,
      shadowOpacity: shadowOpacity.value
    };
  });
  
  const iconAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: iconScale.value }]
    };
  });
  
  const shimmerAnimatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: shimmerPosition.value }]
    };
  });
  
  // Get icon for trending indicator
  const getTrendingIcon = () => {
    if (!trending) return null;
    
    const iconName = trending === 'up' ? 'trending-up' : 
                     trending === 'down' ? 'trending-down' : 
                     'minus';
                     
    const iconColor = trending === 'up' ? Colors.success[500] :
                     trending === 'down' ? Colors.error[500] :
                     Colors.neutrals.white;
                     
    return (
      <View style={styles.trendingContainer}>
        <Feather name={iconName} size={14} color={iconColor} />
        {trendingValue && (
          <Text style={[
            styles.trendingText,
            { color: iconColor }
          ]}>
            {trendingValue}
          </Text>
        )}
      </View>
    );
  };

  return (
    <TouchableOpacity
      activeOpacity={0.9}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      disabled={loading}
      accessible={true}
      accessibilityRole="button"
      accessibilityLabel={`${title}: ${value}`}
      accessibilityHint="Double tap to view details"
    >
      <Animated.View 
        style={[styles.card, cardAnimatedStyle]}
        entering={SlideInRight.delay(index * 100).springify().damping(14)}
      >
        <AnimatedGradient
          colors={cardGradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          {/* Shimmer effect */}
          <Animated.View style={[styles.shimmer, shimmerAnimatedStyle]}>
            <LinearGradient
              colors={['transparent', 'rgba(255,255,255,0.2)', 'transparent']}
              start={{ x: 0, y: 0.5 }}
              end={{ x: 1, y: 0.5 }}
              style={StyleSheet.absoluteFill}
            />
          </Animated.View>
          
          <Animated.View style={[styles.iconContainer, iconAnimatedStyle]}>
            <Feather name={icon} size={24} color="#fff" />
          </Animated.View>
          
          <Text style={styles.title}>{title}</Text>
          
          <View style={styles.valueRow}>
            <Text style={styles.value}>{loading ? '...' : value}</Text>
            {getTrendingIcon()}
          </View>
          
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          
          <View style={styles.decorativeDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </AnimatedGradient>
      </Animated.View>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 20,
    marginRight: 16,
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: 10 },
        shadowOpacity: 0.2,
        shadowRadius: 20,
      },
      android: {
        elevation: 6
      }
    })
  },
  gradient: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden'
  },
  shimmer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    width: CARD_WIDTH * 3,
    height: '100%',
  },
  iconContainer: {
    width: 48,
    height: 48,
    borderRadius: 12,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 16
  },
  title: {
    fontSize: Typography.sizes.sm,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8
  },
  valueRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  value: {
    fontSize: Typography.sizes['2xl'],
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  trendingContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginLeft: 8,
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderRadius: 10,
    paddingHorizontal: 6,
    paddingVertical: 2
  },
  trendingText: {
    fontSize: Typography.sizes.xs,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.white,
    marginLeft: 4
  },
  description: {
    fontSize: Typography.sizes.xs,
    color: 'rgba(255, 255, 255, 0.7)',
    marginTop: 8
  },
  decorativeDots: {
    position: 'absolute',
    right: 0,
    bottom: 0,
    opacity: 0.3
  },
  dot: {
    position: 'absolute',
    borderRadius: 30,
    backgroundColor: 'rgba(255, 255, 255, 0.4)'
  },
  dot1: {
    width: 60,
    height: 60,
    bottom: -30,
    right: -30
  },
  dot2: {
    width: 40,
    height: 40,
    bottom: 0,
    right: 20
  },
  dot3: {
    width: 24,
    height: 24,
    bottom: 20,
    right: 0
  }
});

export default DashboardCard;