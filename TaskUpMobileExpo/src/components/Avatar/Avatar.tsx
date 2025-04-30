import React from 'react'
import { StyleSheet, View, Text, Image } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming 
} from 'react-native-reanimated'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import { getInitials } from '../../utils/helpers'

interface AvatarProps {
  imageUrl?: string | null
  name: string
  size?: number
  status?: 'online' | 'offline' | 'busy' | 'away'
  ringColor?: string
}

const Avatar = ({
  imageUrl,
  name,
  size = 40,
  status,
  ringColor
}: AvatarProps) => {
  const scale = useSharedValue(1)
  const ringOpacity = useSharedValue(ringColor ? 1 : 0)
  const statusOpacity = useSharedValue(status ? 1 : 0)
  
  React.useEffect(() => {
    if (ringColor) {
      ringOpacity.value = withTiming(1, { duration: 300 })
    } else {
      ringOpacity.value = withTiming(0, { duration: 300 })
    }
    
    if (status) {
      statusOpacity.value = withTiming(1, { duration: 300 })
    } else {
      statusOpacity.value = withTiming(0, { duration: 300 })
    }
  }, [ringColor, status])
  
  const getStatusColor = () => {
    switch (status) {
      case 'online':
        return Colors.secondary.green
      case 'busy':
        return Colors.secondary.red
      case 'away':
        return Colors.warning
      case 'offline':
      default:
        return Colors.neutrals.gray400
    }
  }
  
  const initials = getInitials(name || '')
  const fontSize = size * 0.4
  const borderWidth = size * 0.075
  const statusSize = size * 0.3
  const statusBorderWidth = size * 0.05
  
  const animatedRingStyle = useAnimatedStyle(() => {
    return {
      opacity: ringOpacity.value,
      borderColor: ringColor || Colors.primary.blue
    }
  })
  
  const animatedStatusStyle = useAnimatedStyle(() => {
    return {
      opacity: statusOpacity.value,
      backgroundColor: getStatusColor()
    }
  })

  return (
    <View style={styles.container}>
      <Animated.View 
        style={[
          styles.ring,
          { 
            width: size + borderWidth * 2,
            height: size + borderWidth * 2,
            borderRadius: (size + borderWidth * 2) / 2,
            borderWidth
          },
          animatedRingStyle
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
        <Animated.View
          style={[
            styles.statusIndicator,
            { 
              width: statusSize, 
              height: statusSize, 
              borderRadius: statusSize / 2,
              borderWidth: statusBorderWidth,
              right: 0,
              bottom: 0
            },
            animatedStatusStyle
          ]}
          accessible={true}
          accessibilityRole="image"
          accessibilityLabel={`Status: ${status}`}
        />
      )}
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    position: 'relative',
    alignItems: 'center',
    justifyContent: 'center'
  },
  ring: {
    position: 'absolute',
    borderColor: Colors.primary.blue
  },
  image: {
    width: '100%',
    height: '100%'
  },
  placeholder: {
    backgroundColor: Colors.primary.blue,
    alignItems: 'center',
    justifyContent: 'center'
  },
  initialsText: {
    color: Colors.neutrals.white,
    fontWeight: Typography.weights.semibold
  },
  statusIndicator: {
    position: 'absolute',
    borderColor: Colors.neutrals.white
  }
})

export default Avatar