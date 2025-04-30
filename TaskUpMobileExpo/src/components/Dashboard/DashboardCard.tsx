import React from 'react'
import { StyleSheet, View, Text, TouchableOpacity, Dimensions } from 'react-native'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  interpolate,
  Extrapolation,
  withSpring
} from 'react-native-reanimated'
import { LinearGradient } from 'expo-linear-gradient'
import { Feather } from '@expo/vector-icons'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Spacing from '../../theme/Spacing'
import { triggerImpact } from '../../utils/HapticUtils'
import * as Haptics from 'expo-haptics'

const { width } = Dimensions.get('window')
const CARD_WIDTH = width * 0.75

interface DashboardCardProps {
  title: string
  value: string | number
  icon: keyof typeof Feather.glyphMap
  gradientColors: string[]
  onPress?: () => void
  description?: string
  loading?: boolean
}

const DashboardCard = ({ 
  title, 
  value, 
  icon, 
  gradientColors, 
  onPress,
  description,
  loading = false
}: DashboardCardProps) => {
  const scale = useSharedValue(1)
  const rotation = useSharedValue(0)
  
  const handlePressIn = () => {
    scale.value = withTiming(0.95, { duration: 150 })
    rotation.value = withTiming(3, { duration: 250 })
  }
  
  const handlePressOut = () => {
    scale.value = withTiming(1, { duration: 200 })
    rotation.value = withTiming(0, { duration: 250 })
  }
  
  const handlePress = () => {
    if (onPress) {
      triggerImpact(Haptics.ImpactFeedbackStyle.Medium)
      onPress()
    }
  }
  
  const animatedStyle = useAnimatedStyle(() => {
    const rotateZ = interpolate(
      rotation.value,
      [0, 3],
      [0, 3],
      Extrapolation.CLAMP
    )
    
    return {
      transform: [
        { scale: scale.value },
        { perspective: 1000 },
        { rotateY: `${rotateZ}deg` }
      ]
    }
  })

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
      <Animated.View style={[styles.card, animatedStyle]}>
        <LinearGradient
          colors={gradientColors}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={styles.gradient}
        >
          <View style={styles.iconContainer}>
            <Feather name={icon} size={24} color="#fff" />
          </View>
          
          <Text style={styles.title}>{title}</Text>
          <Text style={styles.value}>{loading ? '...' : value}</Text>
          
          {description && (
            <Text style={styles.description}>{description}</Text>
          )}
          
          <View style={styles.decorativeDots}>
            <View style={[styles.dot, styles.dot1]} />
            <View style={[styles.dot, styles.dot2]} />
            <View style={[styles.dot, styles.dot3]} />
          </View>
        </LinearGradient>
      </Animated.View>
    </TouchableOpacity>
  )
}

const styles = StyleSheet.create({
  card: {
    width: CARD_WIDTH,
    height: 180,
    borderRadius: 20,
    marginRight: 16,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10
  },
  gradient: {
    flex: 1,
    padding: 20,
    borderRadius: 20,
    overflow: 'hidden'
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
    fontSize: Typography.sizes.bodySmall,
    color: 'rgba(255, 255, 255, 0.8)',
    marginBottom: 8
  },
  value: {
    fontSize: Typography.sizes.title,
    fontWeight: Typography.weights.bold,
    color: Colors.neutrals.white
  },
  description: {
    fontSize: Typography.sizes.caption,
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
})

export default DashboardCard