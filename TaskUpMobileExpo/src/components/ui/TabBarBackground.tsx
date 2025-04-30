import React from 'react';
import { View, StyleSheet, ViewStyle, Platform } from 'react-native';
import { BlurView } from 'expo-blur';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated';
import Colors from '../../theme/Colors';

interface TabBarBackgroundProps {
  style?: ViewStyle;
  intensity?: number;
  tint?: 'dark' | 'light' | 'default';
}

const AnimatedBlurView = Animated.createAnimatedComponent(BlurView);

export default function TabBarBackground({ 
  style, 
  intensity = 80,
  tint = 'light'
}: TabBarBackgroundProps) {
  const blurIntensity = useSharedValue(0);
  const opacity = useSharedValue(0);
  
  // Animate in smoothly
  React.useEffect(() => {
    blurIntensity.value = withTiming(intensity, { duration: 400 });
    opacity.value = withTiming(1, { duration: 300 });
  }, []);
  
  const blurStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value,
      ...StyleSheet.absoluteFillObject,
    };
  });
  
  // For Android, we use a simple background since BlurView might not work well
  if (Platform.OS === 'android') {
    return (
      <View style={[styles.container, style]}>
        <Animated.View 
          style={[
            StyleSheet.absoluteFill, 
            { backgroundColor: 'rgba(255, 255, 255, 0.95)' },
            blurStyle
          ]} 
        />
      </View>
    );
  }
  
  return (
    <View style={[styles.container, style]}>
      <AnimatedBlurView 
        intensity={intensity} 
        tint={tint} 
        style={[StyleSheet.absoluteFill, blurStyle]} 
      />
      <Animated.View 
        style={[
          StyleSheet.absoluteFill, 
          { backgroundColor: 'rgba(255, 255, 255, 0.7)' },
          blurStyle
        ]} 
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: 83,
    backgroundColor: 'transparent',
    borderTopWidth: 1,
    borderTopColor: 'rgba(0, 0, 0, 0.07)',
    overflow: 'hidden',
  },
});