import React, { useEffect } from 'react';
import { StyleSheet, View, Text, Image, ViewStyle } from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  FadeIn
} from 'react-native-reanimated';
import { LinearGradient } from 'expo-linear-gradient';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import { getInitials } from '../../utils/helpers';
import { useTheme } from '../../hooks/useColorScheme';
import StatusBadge from '../Badge/StatusBadge';

interface AvatarProps {
  imageUrl?: string | null;
  name: string;
  size?: number;
  status?: 'online' | 'offline' | 'busy' | 'away';
  ringColor?: string;
  style?: ViewStyle;
  gradientColors?: string[];
}

const Avatar = ({
  imageUrl,
  name,
  size = 40,
  status,
  ringColor,
  style,
  gradientColors
}: AvatarProps) => {
  const { colors, isDark } = useTheme();
  
  // Animation values
  const scale = useSharedValue(1);
  const ringOpacity = useSharedValue(ringColor ? 1 : 0);
  const avatarOpacity = useSharedValue(0);
  
  // Default gradient colors
  const defaultGradient = gradientColors || [
    colors.primary[500],
    colors.primary[700]
  ];
  
  useEffect(() => {
    // Fade in animation
    avatarOpacity.value = withTiming(1, { duration: 300 });
    
    // Ring animation if ringColor changes
    if (ringColor) {
      ringOpacity.value = withTiming(1, { duration: 300 });
    } else {
      ringOpacity.value = withTiming(0, { duration: 300 });
    }
  }, [ringColor]);
  
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return Colors.status.online;
      case 'busy':
        return Colors.status.busy;
      case 'away':
        return Colors.status.away;
      case 'offline':
      default:
        return Colors.status.offline;
    }
  };
  
  // Calculate proportional values based on size
  const initials = getInitials(name || '');
  const fontSize = size * 0.4;
  const borderWidth = size * 0.075;
  const statusSize = size * 0.3;
  const statusBorderWidth = size * 0.05;
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      opacity: avatarOpacity.value
    };
  });
  
  const ringStyle = useAnimatedStyle(() => {
    return {
      opacity: ringOpacity.value,
      borderColor: ringColor || colors.primary[500]
    };
  });

  return (
    <Animated.View 
      style={[styles.container, containerStyle, style]}
      entering={FadeIn.duration(300)}
    >
      <Animated.View 
        style={[
          styles.ring,
          { 
            width: size + borderWidth * 2,
            height: size + borderWidth * 2,
            borderRadius: (size + borderWidth * 2) / 2,
            borderWidth
          },
          ringStyle
        ]}
      />
      
      {imageUrl ? (
        <Image
          source={{ uri: imageUrl }}
          style={[
            styles.image,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={`Profile image of ${name}`}
        />
      ) : (
        <View 
          style={[
            styles.placeholder,
            { width: size, height: size, borderRadius: size / 2 }
          ]}
        >
          <LinearGradient
            colors={defaultGradient}
            style={StyleSheet.absoluteFill}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
          />
          <Text 
            style={[
              styles.initialsText,
              { fontSize }
            ]}
          >
            {initials}
          </Text>
        </View>
      )}
      
      {status && (
        <View
          style={[
            styles.statusIndicatorContainer,
            { 
              right: 0,
              bottom: 0
            }
          ]}
        >
          <StatusBadge 
            status={status} 
            size={statusSize} 
          />
        </View>
      )}
    </Animated.View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ring: {
    position: 'absolute',
    borderColor: Colors.primary[500]
  },
  image: {
    width: '100%',
    height: '100%'
  },
  placeholder: {
    backgroundColor: Colors.primary[500],
    alignItems: 'center',
    justifyContent: 'center',
    overflow: 'hidden'
  },
  initialsText: {
    color: Colors.neutrals.white,
    fontWeight: Typography.weights.semibold
  },
  statusIndicatorContainer: {
    position: 'absolute'
  }
});

export default Avatar;