import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text,
  Dimensions,
  ViewStyle,
  TextStyle,
  LayoutAnimation,
  Platform,
  UIManager
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  withSpring,
  withSequence,
  interpolate,
  Extrapolation,
  FadeOut,
  FadeIn,
  SlideInDown
} from 'react-native-reanimated';
import { Feather } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import * as Haptics from 'expo-haptics';
import Svg, { Circle } from 'react-native-svg';
import { ActivityIndicator } from 'react-native';

import Colors from '../theme/Colors';
import Typography from '../theme/Typography';
import { triggerImpact } from '../utils/HapticUtils';

// Enable layout animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const { width, height } = Dimensions.get('window');
const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);
const AnimatedGradient = Animated.createAnimatedComponent(LinearGradient);

// Fab positioning options
type FabPosition = 'bottomRight' | 'bottomLeft' | 'topRight' | 'topLeft' | 'center';

// FAB size options
type FabSize = 'small' | 'medium' | 'large';

// Props interface
interface FABProps {
  onPress: () => void;
  icon: keyof typeof Feather.glyphMap;
  secondaryIcon?: keyof typeof Feather.glyphMap;
  label?: string;
  position?: FabPosition;
  size?: FabSize;
  color?: string;
  gradientColors?: string[];
  visible?: boolean;
  extended?: boolean;
  loading?: boolean;
  disabled?: boolean;
  style?: ViewStyle;
  labelStyle?: TextStyle;
  animationType?: 'scale' | 'bounce' | 'rotate' | 'pulse';
  mini?: boolean;
  children?: React.ReactNode;
  onLongPress?: () => void;
  mainButtonStyle?: ViewStyle;
  shadow?: boolean;
  iconColor?: string;
  showProgress?: boolean;
  progress?: number;
}

const FAB = ({
  onPress,
  icon,
  secondaryIcon,
  label,
  position = 'bottomRight',
  size = 'medium',
  color = Colors.primary[500],
  gradientColors,
  visible = true,
  extended = false,
  loading = false,
  disabled = false,
  style,
  labelStyle,
  animationType = 'scale',
  mini = false,
  children,
  onLongPress,
  mainButtonStyle,
  shadow = true,
  iconColor = Colors.neutrals.white,
  showProgress = false,
  progress = 0
}: FABProps) => {
  const [isExtended, setIsExtended] = useState(extended);
  const [currentIcon, setCurrentIcon] = useState(icon);
  
  // Animation shared values
  const scale = useSharedValue(1);
  const rotation = useSharedValue(0);
  const opacity = useSharedValue(visible ? 1 : 0);
  const translateY = useSharedValue(visible ? 0 : 30);
  const progressValue = useSharedValue(progress);
  
  // Update animations when props change
  useEffect(() => {
    opacity.value = withTiming(visible ? 1 : 0, { duration: 200 });
    translateY.value = withTiming(visible ? 0 : 30, { duration: 200 });
    
    progressValue.value = withTiming(progress, { duration: 300 });
  }, [visible, progress]);
  
  // Update extended state
  useEffect(() => {
    if (extended !== isExtended) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setIsExtended(extended);
    }
  }, [extended]);
  
  // Toggle icon if secondary is provided
  const toggleIcon = () => {
    if (secondaryIcon) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setCurrentIcon(currentIcon === icon ? secondaryIcon : icon);
      rotation.value = withTiming(rotation.value + 180, { duration: 300 });
    }
  };
  
  // Calculate size values
  const getSizeValue = () => {
    if (mini) return 40;
    
    switch (size) {
      case 'small': return 48;
      case 'large': return 64;
      case 'medium':
      default: return 56;
    }
  };
  
  // Get position style
  const getPositionStyle = (): ViewStyle => {
    const positionStyle: ViewStyle = { position: 'absolute' };
    
    switch (position) {
      case 'bottomRight':
        positionStyle.bottom = 26;
        positionStyle.right = 16;
        break;
      case 'bottomLeft':
        positionStyle.bottom = 26;
        positionStyle.left = 16;
        break;
      case 'topRight':
        positionStyle.top = 26;
        positionStyle.right = 16;
        break;
      case 'topLeft':
        positionStyle.top = 26;
        positionStyle.left = 16;
        break;
      case 'center':
        positionStyle.alignSelf = 'center';
        positionStyle.bottom = 26;
        break;
    }
    
    return positionStyle;
  };
  
  // Calculate icon size based on FAB size
  const getIconSize = () => {
    if (mini) return 16;
    
    switch (size) {
      case 'small': return 18;
      case 'large': return 28;
      case 'medium':
      default: return 24;
    }
  };
  
  // Handle press events
  const handlePress = () => {
    if (disabled || loading) return;
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
    
    // Add animation based on type
    switch (animationType) {
      case 'rotate':
        rotation.value = withSequence(
          withTiming(rotation.value + 45, { duration: 150 }),
          withTiming(rotation.value, { duration: 150 })
        );
        break;
      case 'bounce':
        scale.value = withSequence(
          withTiming(0.9, { duration: 100 }),
          withSpring(1.1, { damping: 10, stiffness: 200 }),
          withTiming(1, { duration: 100 })
        );
        break;
      case 'pulse':
        scale.value = withSequence(
          withTiming(0.9, { duration: 100 }),
          withTiming(1, { duration: 200 })
        );
        break;
      case 'scale':
      default:
        scale.value = withSequence(
          withTiming(0.9, { duration: 100 }),
          withTiming(1, { duration: 200 })
        );
        break;
    }
    
    // Toggle icon if secondary icon provided
    toggleIcon();
    
    // Call press handler
    onPress();
  };
  
  const handlePressIn = () => {
    if (disabled || loading) return;
    
    scale.value = withTiming(0.95, { duration: 100 });
  };
  
  const handlePressOut = () => {
    if (disabled || loading) return;
    
    scale.value = withTiming(1, { duration: 200 });
  };
  
  const handleLongPress = () => {
    if (disabled || loading || !onLongPress) return;
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Heavy);
    onLongPress();
  };
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      transform: [
        { translateY: translateY.value },
        { scale: scale.value }
      ]
    };
  });
  
  const iconStyle = useAnimatedStyle(() => {
    return {
      transform: [{ rotate: `${rotation.value}deg` }]
    };
  });
  
  const progressCircleStyle = useAnimatedStyle(() => {
    return {
      transform: [
        { rotate: `-${interpolate(
            progressValue.value,
            [0, 1],
            [0, 360],
            Extrapolation.CLAMP
          )}deg` 
        }
      ]
    };
  });
  
  // Default colors if none provided
  const defaultGradient = gradientColors || [color, darkenColor(color, 15)];
  
  // Bubble buttons if provided as children
  const renderBubbleButtons = () => {
    if (!children) return null;
    
    return (
      <Animated.View 
        style={styles.bubbleContainer}
        entering={FadeIn.duration(300).delay(100)}
        exiting={FadeOut.duration(200)}
      >
        {children}
      </Animated.View>
    );
  };
  
  // Render progress indicator
  const renderProgress = () => {
    if (!showProgress || progress === 0) return null;
    
    const sizeValue = getSizeValue();
    const strokeWidth = sizeValue * 0.05;
    const radius = (sizeValue - strokeWidth) / 2;
    const circumference = 2 * Math.PI * radius;
    
    return (
      <Animated.View style={[StyleSheet.absoluteFill, styles.progressContainer]}>
        <Svg height={sizeValue} width={sizeValue} style={StyleSheet.absoluteFill}>
          {/* Background Circle */}
          <Circle
            cx={sizeValue / 2}
            cy={sizeValue / 2}
            r={radius}
            stroke="rgba(255, 255, 255, 0.3)"
            strokeWidth={strokeWidth}
            fill="transparent"
          />
          
          {/* Progress Circle */}
          <Animated.View style={progressCircleStyle}>
            <Circle
              cx={sizeValue / 2}
              cy={sizeValue / 2}
              r={radius}
              stroke={Colors.neutrals.white}
              strokeWidth={strokeWidth}
              strokeDasharray={circumference}
              strokeDashoffset={circumference * (1 - progress)}
              strokeLinecap="round"
              fill="transparent"
              transform={`rotate(90, ${sizeValue / 2}, ${sizeValue / 2})`}
            />
          </Animated.View>
        </Svg>
      </Animated.View>
    );
  };
  
  const fabSize = getSizeValue();
  const iconSize = getIconSize();
  
  return (
    <AnimatedTouchable
      style={[
        styles.container,
        getPositionStyle(),
        containerStyle,
        style
      ]}
      onPress={handlePress}
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onLongPress={handleLongPress}
      activeOpacity={0.9}
      disabled={disabled || loading}
      accessibilityRole="button"
      accessibilityLabel={label || "Action button"}
      accessibilityState={{ disabled: disabled || loading }}
      entering={SlideInDown.springify().damping(15).delay(300)}
    >
      {renderBubbleButtons()}
      
      <AnimatedGradient
        colors={defaultGradient}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={[
          styles.button,
          {
            width: isExtended && label ? 'auto' : fabSize,
            height: fabSize,
            borderRadius: fabSize / 2,
            opacity: disabled ? 0.7 : 1
          },
          shadow && styles.shadow,
          mainButtonStyle
        ]}
      >
        {loading ? (
          <ActivityIndicator color={iconColor} size={iconSize} />
        ) : (
          <View style={styles.contentContainer}>
            <Animated.View style={iconStyle}>
              <Feather name={currentIcon} size={iconSize} color={iconColor} />
            </Animated.View>
            
            {isExtended && label && (
              <Animated.Text 
                style={[
                  styles.label,
                  { 
                    marginLeft: 8,
                    opacity: isExtended ? 1 : 0 
                  },
                  labelStyle
                ]}
                entering={FadeIn.duration(200)}
              >
                {label}
              </Animated.Text>
            )}
          </View>
        )}
        
        {renderProgress()}
      </AnimatedGradient>
    </AnimatedTouchable>
  );
};

// Helper to darken color
const darkenColor = (color: string, percent: number): string => {
  // Convert hex to RGB
  let r = parseInt(color.substring(1, 3), 16);
  let g = parseInt(color.substring(3, 5), 16);
  let b = parseInt(color.substring(5, 7), 16);
  
  // Darken
  r = Math.floor(r * (1 - percent / 100));
  g = Math.floor(g * (1 - percent / 100));
  b = Math.floor(b * (1 - percent / 100));
  
  // Convert back to hex
  return `#${r.toString(16).padStart(2, '0')}${g.toString(16).padStart(2, '0')}${b.toString(16).padStart(2, '0')}`;
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    zIndex: 999
  },
  button: {
    justifyContent: 'center',
    alignItems: 'center'
  },
  contentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16
  },
  shadow: {
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 8
  },
  label: {
    color: Colors.neutrals.white,
    fontSize: Typography.sizes.md,
    fontWeight: Typography.weights.medium
  },
  bubbleContainer: {
    position: 'absolute',
    bottom: 70,
    alignItems: 'center'
  },
  progressContainer: {
    justifyContent: 'center',
    alignItems: 'center'
  }
});

export default FAB;