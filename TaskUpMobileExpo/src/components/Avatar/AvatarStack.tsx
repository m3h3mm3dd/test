import React, { useState } from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Pressable } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  withSpring,
  withDelay,
  interpolate,
  Extrapolation
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Avatar from './Avatar'
import { triggerImpact } from '../../utils/HapticUtils'

interface User {
  id: string
  name: string
  imageUrl?: string | null
}

interface AvatarStackProps {
  users: User[]
  maxDisplay?: number
  size?: number
  onPress?: (users: User[]) => void
  expanded?: boolean
}

const AvatarStack = ({
  users,
  maxDisplay = 3,
  size = 36,
  onPress,
  expanded: initialExpanded = false
}: AvatarStackProps) => {
  const [expanded, setExpanded] = useState(initialExpanded)
  const animationProgress = useSharedValue(initialExpanded ? 1 : 0)
  
  const handlePress = () => {
    setExpanded(!expanded)
    animationProgress.value = withSpring(expanded ? 0 : 1, {
      damping: 12,
      stiffness: 100
    })
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    
    if (onPress) {
      onPress(users)
    }
  }
  
  const displayedUsers = users.slice(0, expanded ? users.length : maxDisplay)
  const remainingCount = users.length - maxDisplay
  const showMoreIndicator = !expanded && users.length > maxDisplay
  
  // Calculate overlap to determine spacing
  const overlapPercentage = 0.35
  const avatarOffset = size * (1 - overlapPercentage)
  const stackWidth = (users.length - 1) * avatarOffset + size
  
  const containerStyle = useAnimatedStyle(() => {
    const width = interpolate(
      animationProgress.value,
      [0, 1],
      [avatarOffset * Math.min(users.length - 1, maxDisplay - 1) + size, stackWidth],
      Extrapolation.CLAMP
    )
    
    return {
      width
    }
  })

  return (
    <Pressable onPress={handlePress}>
      <Animated.View style={[styles.container, containerStyle]}>
        {displayedUsers.map((user, index) => {
          const animatedStyle = useAnimatedStyle(() => {
            const translateX = interpolate(
              animationProgress.value,
              [0, 1],
              [
                // When not expanded, stack avatars
                expanded ? index * avatarOffset : Math.min(index, maxDisplay - 1) * avatarOffset,
                // When expanded, spread them out
                index * avatarOffset
              ],
              Extrapolation.CLAMP
            )
            
            const scale = expanded 
              ? withDelay(index * 50, withSpring(1, { damping: 12 }))
              : withTiming(1)
            
            return {
              transform: [
                { translateX },
                { scale }
              ],
              zIndex: 100 - index
            }
          })
          
          return (
            <Animated.View key={user.id} style={animatedStyle}>
              <Avatar 
                imageUrl={user.imageUrl}
                name={user.name}
                size={size}
              />
            </Animated.View>
          )
        })}
        
        {showMoreIndicator && (
          <View style={[styles.moreIndicator, { 
            width: size, 
            height: size, 
            borderRadius: size / 2,
            left: displayedUsers.length * avatarOffset
          }]}>
            <Text style={styles.moreText}>+{remainingCount}</Text>
          </View>
        )}
      </Animated.View>
    </Pressable>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 36,
    flexDirection: 'row',
    alignItems: 'center'
  },
  moreIndicator: {
    position: 'absolute',
    backgroundColor: Colors.neutrals.gray200,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 0
  },
  moreText: {
    fontSize: Typography.sizes.caption,
    fontWeight: Typography.weights.semibold,
    color: Colors.neutrals.gray700
  }
})

export default AvatarStack