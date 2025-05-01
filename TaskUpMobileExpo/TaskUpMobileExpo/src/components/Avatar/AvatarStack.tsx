import React, { useState, useEffect } from 'react';
import { StyleSheet, View, Text, Pressable, LayoutAnimation, Platform, UIManager } from 'react-native';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolation,
  FadeIn,
  FadeOut
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Avatar from './Avatar';
import { triggerImpact } from '../../utils/HapticUtils';
import { useTheme } from '../../hooks/useColorScheme';

// Enable layout animation for Android
if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

interface User {
  id: string;
  name: string;
  imageUrl?: string | null;
}

interface AvatarStackProps {
  users: User[];
  maxDisplay?: number;
  size?: number;
  onPress?: (users: User[]) => void;
  expanded?: boolean;
  showExpand?: boolean;
  horizontal?: boolean;
  spacing?: number;
  colorTokens?: string[];
}

const AvatarStack = ({
  users = [],
  maxDisplay = 3,
  size = 36,
  onPress,
  expanded: initialExpanded = false,
  showExpand = true,
  horizontal = true,
  spacing = -8,
  colorTokens
}: AvatarStackProps) => {
  const { colors, isDark } = useTheme();
  const [expanded, setExpanded] = useState(initialExpanded);
  const expandProgress = useSharedValue(initialExpanded ? 1 : 0);
  const reorderProgress = useSharedValue(0);
  const totalOpacity = useSharedValue(0);
  
  // Define random colors for avatars without images
  const getAvatarColors = () => {
    return colorTokens || [
      colors.primary[500],
      colors.secondary[500],
      colors.primary[700],
      colors.secondary[700],
      colors.primary[400],
      colors.secondary[400]
    ];
  };
  
  useEffect(() => {
    // Animate initial appearance
    totalOpacity.value = withTiming(1, { duration: 400 });
    
    // Animate if expanded prop changes
    if (expanded !== initialExpanded) {
      LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
      setExpanded(initialExpanded);
      expandProgress.value = withTiming(initialExpanded ? 1 : 0, { duration: 300 });
    }
  }, [initialExpanded]);
  
  const handlePress = () => {
    if (!showExpand || users.length <= maxDisplay) return;
    
    // Toggle expanded state with animation
    LayoutAnimation.configureNext({
      duration: 300,
      update: { type: 'spring', springDamping: 0.8 },
      delete: { type: 'linear', duration: 100 }
    });
    
    const newExpandedState = !expanded;
    setExpanded(newExpandedState);
    expandProgress.value = withTiming(newExpandedState ? 1 : 0, { duration: 300 });
    
    // Haptic feedback
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // Reorder animation when expanding/collapsing
    reorderProgress.value = 0;
    reorderProgress.value = withTiming(1, { duration: 400 });
    
    if (onPress) {
      onPress(users);
    }
  };
  
  // No users, render nothing
  if (users.length === 0) return null;
  
  // Determine users to display based on expanded state
  const displayedUsers = expanded ? users : users.slice(0, maxDisplay);
  const remainingCount = users.length - maxDisplay;
  const showMoreIndicator = !expanded && users.length > maxDisplay && showExpand;
  
  // Calculate overlap to determine spacing
  const effectiveSpacing = horizontal ? spacing : spacing / 2;
  
  // Calculate container width/height based on orientation
  const containerDimension = 
    users.length > 0 
      ? size + ((Math.min(expanded ? users.length - 1 : maxDisplay - 1, users.length - 1)) * effectiveSpacing)
      : size;
  
  // Main animated style for the container
  const containerAnimStyle = useAnimatedStyle(() => {
    return {
      opacity: totalOpacity.value,
      width: horizontal ? containerDimension : 'auto',
      height: horizontal ? 'auto' : containerDimension
    };
  });

  return (
    <Pressable 
      onPress={handlePress} 
      disabled={users.length <= maxDisplay || !showExpand}
      accessibilityRole="button"
      accessibilityLabel={
        showMoreIndicator 
          ? `${users.length} users assigned, tap to see all` 
          : `${users.length} users assigned`
      }
    >
      <Animated.View style={[
        styles.container, 
        horizontal ? styles.horizontalContainer : styles.verticalContainer,
        containerAnimStyle
      ]}>
        {displayedUsers.map((user, index) => {
          // Calculate position based on index and expanded state
          const position = index * effectiveSpacing;
          
          const avatarStyle = useAnimatedStyle(() => {
            // Different animation for each avatar when expanding/collapsing
            const delayFactor = expanded ? index : displayedUsers.length - index - 1;
            const delay = delayFactor * 50;
            
            // Scale animation
            const scale = withDelay(
              delay,
              withSpring(1, { damping: 12, stiffness: 120 })
            );
            
            return {
              transform: [
                { scale },
                { 
                  translateX: horizontal ? position : 0,
                  translateY: horizontal ? 0 : position
                }
              ],
              zIndex: 100 - index
            };
          });
          
          // Get color for this user's avatar
          const avatarColor = getAvatarColors()[index % getAvatarColors().length];
          
          return (
            <Animated.View 
              key={user.id} 
              style={[
                styles.avatarContainer,
                avatarStyle
              ]}
              entering={FadeIn.duration(300).delay(index * 50)}
            >
              <Avatar 
                imageUrl={user.imageUrl}
                name={user.name}
                size={size}
                ringColor={expanded ? avatarColor : undefined}
              />
            </Animated.View>
          );
        })}
        
        {showMoreIndicator && (
          <View style={[
            styles.moreIndicator, 
            { 
              width: size, 
              height: size, 
              borderRadius: size / 2,
              left: horizontal ? displayedUsers.length * effectiveSpacing : 0,
              top: horizontal ? 0 : displayedUsers.length * effectiveSpacing,
              backgroundColor: isDark ? colors.neutrals[700] : colors.neutrals[200]
            }
          ]}>
            <Text style={[
              styles.moreText,
              { color: isDark ? colors.neutrals[300] : colors.neutrals[700] }
            ]}>
              +{remainingCount}
            </Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'relative'
  },
  horizontalContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    height: 36
  },
  verticalContainer: {
    flexDirection: 'column',
    alignItems: 'flex-start',
    width: 36
  },
  avatarContainer: {
    position: 'absolute'
  },
  moreIndicator: {
    position: 'absolute',
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 1.5,
    borderColor: Colors.neutrals.white
  },
  moreText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold
  }
});

export default AvatarStack;