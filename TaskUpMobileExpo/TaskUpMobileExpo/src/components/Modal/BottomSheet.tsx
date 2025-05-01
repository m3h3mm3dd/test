import React, { useEffect, useRef } from 'react';
import { 
  StyleSheet, 
  View, 
  TouchableOpacity, 
  Text,
  BackHandler,
  Platform,
  Keyboard,
  ViewStyle,
  TextStyle
} from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS,
  interpolate,
  Extrapolation,
  useAnimatedGestureHandler,
  withSpring,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import { PanGestureHandler } from 'react-native-gesture-handler';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { BlurView } from 'expo-blur';
import { Feather } from '@expo/vector-icons';
import * as Haptics from 'expo-haptics';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import { triggerImpact } from '../../utils/HapticUtils';
import { useTheme } from '../../hooks/useColorScheme';

interface BottomSheetProps {
  isVisible: boolean;
  onClose: () => void;
  children: React.ReactNode;
  title?: string;
  snapPoints?: number[];
  closeOnBackdropPress?: boolean;
  enableDragToDismiss?: boolean;
  height?: number | string;
  animationDuration?: number;
  showHandle?: boolean;
  showCloseButton?: boolean;
  headerStyle?: ViewStyle;
  headerTextStyle?: TextStyle;
  backdropOpacity?: number;
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

const BottomSheet = ({ 
  isVisible, 
  onClose, 
  children, 
  title,
  snapPoints = [0.5, 0.8],
  closeOnBackdropPress = true,
  enableDragToDismiss = true,
  height = 'auto',
  animationDuration = 300,
  showHandle = true,
  showCloseButton = false,
  headerStyle,
  headerTextStyle,
  backdropOpacity = 0.5
}: BottomSheetProps) => {
  const { colors, isDark } = useTheme();
  const insets = useSafeAreaInsets();
  const windowHeight = global.innerHeight || 800; // Fallback height
  
  const translateY = useSharedValue(typeof height === 'number' ? height : windowHeight);
  const opacity = useSharedValue(0);
  const activeSnapPoint = useSharedValue(0);
  const dragStartY = useSharedValue(0);
  const gestureActive = useSharedValue(false);
  const backdropBlur = useSharedValue(0);
  
  // Use ref to track if sheet is mounted
  const isSheetMounted = useRef(false);
  
  // Calculate appropriate sheet height
  const getSheetHeight = () => {
    if (typeof height === 'number') return height;
    return 'auto';
  };
  
  // Handle back button on Android
  useEffect(() => {
    const handleBackPress = () => {
      if (isVisible) {
        closeSheet();
        return true;
      }
      return false;
    };
    
    if (Platform.OS === 'android') {
      BackHandler.addEventListener('hardwareBackPress', handleBackPress);
    }
    
    return () => {
      if (Platform.OS === 'android') {
        BackHandler.removeEventListener('hardwareBackPress', handleBackPress);
      }
    };
  }, [isVisible]);
  
  // Handle keyboard hiding when sheet is shown
  useEffect(() => {
    if (isVisible) {
      Keyboard.dismiss();
    }
  }, [isVisible]);
  
  useEffect(() => {
    if (isVisible) {
      isSheetMounted.current = true;
      triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
      opacity.value = withTiming(1, { duration: animationDuration });
      backdropBlur.value = withTiming(20, { duration: animationDuration * 1.5 });
      translateY.value = withSpring(
        getSnapPointValue(snapPoints[0]), 
        { damping: 20, stiffness: 300 }
      );
      activeSnapPoint.value = 0;
    } else {
      opacity.value = withTiming(0, { duration: animationDuration });
      backdropBlur.value = withTiming(0, { duration: animationDuration });
      translateY.value = withSpring(
        windowHeight, 
        { damping: 20, stiffness: 200 },
        () => {
          if (isSheetMounted.current) {
            runOnJS(finishClosing)();
          }
        }
      );
    }
  }, [isVisible]);
  
  const getSnapPointValue = (point: number) => {
    if (typeof point === 'number') {
      return windowHeight - windowHeight * point;
    }
    return 0;
  };
  
  const handleBackdropPress = () => {
    if (closeOnBackdropPress) {
      triggerImpact(Haptics.ImpactFeedbackStyle.Light);
      closeSheet();
    }
  };
  
  const closeSheet = () => {
    opacity.value = withTiming(0, { duration: animationDuration });
    backdropBlur.value = withTiming(0, { duration: animationDuration });
    translateY.value = withSpring(
      windowHeight, 
      { damping: 20, stiffness: 200 },
      () => {
        if (isSheetMounted.current) {
          runOnJS(onClose)();
        }
      }
    );
  };
  
  const finishClosing = () => {
    isSheetMounted.current = false;
  };
  
  // Gesture handler for dragging
  const gestureHandler = useAnimatedGestureHandler({
    onStart: (_, ctx: any) => {
      ctx.startY = translateY.value;
      dragStartY.value = translateY.value;
      gestureActive.value = true;
    },
    onActive: (event, ctx) => {
      if (!enableDragToDismiss) return;
      
      const newTranslateY = ctx.startY + event.translationY;
      // Prevent dragging up beyond the highest snap point
      const highestSnapPoint = getSnapPointValue(Math.max(...snapPoints));
      if (newTranslateY < highestSnapPoint) {
        // Apply resistance when dragging beyond highest snap point
        const overdrag = highestSnapPoint - newTranslateY;
        translateY.value = highestSnapPoint - overdrag * 0.2;
      } else {
        translateY.value = newTranslateY;
      }
    },
    onEnd: (event) => {
      if (!enableDragToDismiss) return;
      
      gestureActive.value = false;
      
      // Determine whether to snap to a point or dismiss
      if (event.velocityY > 500) {
        // Fast flick down, dismiss
        closeSheet();
        return;
      }
      
      // Find closest snap point
      const snapPointsValues = snapPoints.map(point => getSnapPointValue(point));
      const currentPosition = translateY.value;
      
      // Get distance to each snap point
      const distances = snapPointsValues.map(snapPoint => 
        Math.abs(currentPosition - snapPoint)
      );
      
      // Find index of closest snap point
      const closestPointIndex = distances.indexOf(Math.min(...distances));
      
      // If dragging down and beyond the lowest snap point, close
      if (
        event.velocityY > 0 && 
        currentPosition > getSnapPointValue(snapPoints[0]) && 
        enableDragToDismiss
      ) {
        closeSheet();
        return;
      }
      
      // Otherwise snap to closest point
      translateY.value = withSpring(
        snapPointsValues[closestPointIndex], 
        { damping: 20, stiffness: 300 }
      );
      activeSnapPoint.value = closestPointIndex;
    }
  });
  
  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value * backdropOpacity
    };
  });
  
  const backdropBlurStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      intensity: backdropBlur.value
    };
  });
  
  const sheetStyle = useAnimatedStyle(() => {
    // Define the maximum negative offset the sheet can have
    const minY = getSnapPointValue(Math.max(...snapPoints));
    
    return {
      transform: [{ translateY: translateY.value }],
      height: typeof height === 'number' ? height : undefined,
      maxHeight: typeof height === 'string' ? '85%' : undefined,
    };
  });
  
  const handleStyle = useAnimatedStyle(() => {
    // Scale handle based on drag distance
    const dragDistance = Math.abs(translateY.value - dragStartY.value);
    const scale = interpolate(
      dragDistance,
      [0, 100],
      [1, 1.2],
      Extrapolation.CLAMP
    );
    
    return {
      opacity: interpolate(
        translateY.value,
        [windowHeight * 0.7, windowHeight],
        [1, 0],
        Extrapolation.CLAMP
      ),
      transform: [
        { scaleX: gestureActive.value ? scale : 1 }
      ]
    };
  });

  if (!isVisible && opacity.value === 0 && !isSheetMounted.current) return null;

  return (
    <View 
      style={styles.container} 
      accessible={true} 
      accessibilityViewIsModal={true}
      accessibilityRole="dialog"
    >
      <Animated.View 
        style={[styles.backdrop, backdropStyle]}
        entering={FadeIn.duration(animationDuration)}
        exiting={FadeOut.duration(animationDuration)}
      >
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      </Animated.View>
      
      {isDark && (
        <AnimatedBlurView 
          style={StyleSheet.absoluteFill}
          intensity={10}
          animatedProps={backdropBlurStyle}
          tint="dark" 
        />
      )}
      
      <PanGestureHandler onGestureEvent={gestureHandler} enabled={enableDragToDismiss}>
        <Animated.View 
          style={[
            styles.sheetContainer, 
            { 
              backgroundColor: isDark ? colors.card.background : Colors.neutrals.white,
              paddingBottom: insets.bottom + 16
            },
            sheetStyle
          ]}
        >
          {showHandle && (
            <Animated.View style={[styles.handleContainer, handleStyle]}>
              <View 
                style={[
                  styles.handle, 
                  { backgroundColor: isDark ? Colors.neutrals[600] : Colors.neutrals[300] }
                ]} 
              />
            </Animated.View>
          )}
          
          {(title || showCloseButton) && (
            <View style={[styles.titleContainer, headerStyle]}>
              {showCloseButton && (
                <TouchableOpacity 
                  style={styles.closeButton}
                  onPress={closeSheet}
                  hitSlop={{ top: 20, bottom: 20, left: 20, right: 20 }}
                >
                  <Feather 
                    name="x" 
                    size={24} 
                    color={isDark ? colors.text.primary : Colors.neutrals.gray700} 
                  />
                </TouchableOpacity>
              )}
              
              {title && (
                <Text 
                  style={[
                    styles.title,
                    { color: isDark ? colors.text.primary : Colors.neutrals.gray900 },
                    headerTextStyle
                  ]}
                >
                  {title}
                </Text>
              )}
              
              {/* Empty view for spacing when close button is shown */}
              {showCloseButton && <View style={styles.spacer} />}
            </View>
          )}
          
          <View 
            style={[
              styles.content,
              (!title && !showCloseButton) && { paddingTop: 0 }
            ]}
          >
            {children}
          </View>
        </Animated.View>
      </PanGestureHandler>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    zIndex: 1000
  },
  backdrop: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: 'rgba(0, 0, 0, 0.5)'
  },
  backdropTouchable: {
    width: '100%',
    height: '100%'
  },
  sheetContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: Colors.neutrals.white,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.15,
    shadowRadius: 12,
    elevation: 24
  },
  handleContainer: {
    paddingVertical: 10,
    alignItems: 'center',
    zIndex: 10
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.neutrals.gray300
  },
  titleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 16,
    paddingBottom: 16,
    paddingTop: 8,
    borderBottomWidth: 1,
    borderBottomColor: Colors.neutrals.gray200
  },
  closeButton: {
    padding: 4,
    alignSelf: 'flex-start'
  },
  spacer: {
    width: 28 // Same size as the close button for balance
  },
  title: {
    flex: 1,
    fontSize: Typography.sizes.lg,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray900,
    textAlign: 'center'
  },
  content: {
    padding: 16
  }
});

export default BottomSheet;