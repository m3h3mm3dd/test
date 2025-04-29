import React from 'react'
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native'
import * as Haptics from 'expo-haptics'
import Animated, { useAnimatedStyle, useSharedValue, withTiming } from 'react-native-reanimated'
import { ListItemProps } from '../../types/UITypes'
import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'

const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity)

const ListItem = ({ title, subtitle, leftIcon, rightIcon, onPress }: ListItemProps) => {
  const scale = useSharedValue(1)
  
  const handlePress = () => {
    if (!onPress) return
    
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    onPress()
  }
  
  const handlePressIn = () => {
    if (!onPress) return
    scale.value = withTiming(0.98, { duration: 100 })
  }
  
  const handlePressOut = () => {
    if (!onPress) return
    scale.value = withTiming(1, { duration: 100 })
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
        accessible: true,
        accessibilityRole: 'button',
        activeOpacity: 0.7
      }
    : {}

  return (
    <Container
      style={[styles.container, onPress && animatedStyle]}
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
    marginBottom: 8
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