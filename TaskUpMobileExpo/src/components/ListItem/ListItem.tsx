import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming,
  withSpring
} from 'react-native-reanimated'
import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import { triggerImpact } from '../../utils/HapticUtils'

interface ListItemProps {
  title: string
  subtitle?: string
  leftIcon?: React.ReactNode
  rightIcon?: React.ReactNode
  onPress?: () => void
  disabled?: boolean
  highlighted?: boolean
  onLongPress?: () => void
  testID?: string
}

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const ListItem = ({ 
  title, 
  subtitle, 
  leftIcon, 
  rightIcon, 
  onPress,
  disabled = false,
  highlighted = false,
  onLongPress,
  testID
}: ListItemProps) => {
  const scale = useSharedValue(1)
  
  const handlePress = () => {
    if (!onPress || disabled) return
    
    triggerImpact(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }
  
  const handlePressIn = () => {
    if (!onPress || disabled) return
    scale.value = withTiming(0.98, { duration: 100 })
  }
  
  const handlePressOut = () => {
    if (!onPress || disabled) return
    scale.value = withSpring(1, { damping: 15, stiffness: 300 })
  }
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }]
    }
  })

  const Container = onPress ? AnimatedTouchable : View
  const containerProps = onPress
    ? {
        onPress: handlePress,
        onPressIn: handlePressIn,
        onPressOut: handlePressOut,
        onLongPress: onLongPress,
        disabled,
        testID,
        accessible: true,
        accessibilityRole: 'button',
        accessibilityLabel: title,
        accessibilityHint: subtitle,
        accessibilityState: { disabled },
        activeOpacity: 0.7
      }
    : { testID }

  return (
    <Container
      style={[
        styles.container, 
        onPress && animatedStyle,
        highlighted && styles.highlighted,
        disabled && styles.disabled
      ]}
      {...containerProps}
    >
      {leftIcon && <View style={styles.leftIcon}>{leftIcon}</View>}
      <View style={styles.contentContainer}>
        <Text 
          style={styles.title}
          numberOfLines={1}
          ellipsizeMode="tail"
        >
          {title}
        </Text>
        {subtitle && (
          <Text 
            style={styles.subtitle}
            numberOfLines={1}
            ellipsizeMode="tail"
          >
            {subtitle}
          </Text>
        )}
      </View>
      {rightIcon && <View style={styles.rightIcon}>{rightIcon}</View>}
    </Container>
  )
}

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 8,
    marginBottom: 8,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 3,
    elevation: 2
  },
  highlighted: {
    backgroundColor: Colors.primary.blue + '10' // 10% opacity
  },
  disabled: {
    opacity: 0.6
  },
  leftIcon: {
    marginRight: 16
  },
  contentContainer: {
    flex: 1
  },
  title: {
    fontSize: Typography.sizes.body,
    fontWeight: Typography.weights.medium,
    color: Colors.neutrals.gray900,
    marginBottom: 4
  },
  subtitle: {
    fontSize: Typography.sizes.bodySmall,
    color: Colors.neutrals.gray600
  },
  rightIcon: {
    marginLeft: 16
  }
})

export default ListItem