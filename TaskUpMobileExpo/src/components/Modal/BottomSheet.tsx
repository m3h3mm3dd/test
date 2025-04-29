import React, { useEffect } from 'react'
import { StyleSheet, View, TouchableOpacity, Dimensions, Text } from 'react-native'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withTiming,
  runOnJS
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'
import { ModalProps } from '../../types/UITypes'
import Colors from '../../theme/Colors'

const { height } = Dimensions.get('window')

const BottomSheet = ({ isVisible, onClose, children }: ModalProps) => {
  const translateY = useSharedValue(height)
  const opacity = useSharedValue(0)

  useEffect(() => {
    if (isVisible) {
      Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Medium)
      opacity.value = withTiming(1, { duration: 200 })
      translateY.value = withTiming(0, { duration: 300 })
    } else {
      opacity.value = withTiming(0, { duration: 200 })
      translateY.value = withTiming(height, { duration: 300 })
    }
  }, [isVisible])

  const handleBackdropPress = () => {
    Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light)
    closeSheet()
  }

  const closeSheet = () => {
    opacity.value = withTiming(0, { duration: 200 })
    translateY.value = withTiming(height, { duration: 300 }, () => {
      runOnJS(onClose)()
    })
  }

  const backdropStyle = useAnimatedStyle(() => {
    return {
      opacity: opacity.value
    }
  })

  const sheetStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateY: translateY.value }]
    }
  })

  if (!isVisible && opacity.value === 0) return null

  return (
    <View style={styles.container} accessible={true} accessibilityRole="dialog">
      <Animated.View style={[styles.backdrop, backdropStyle]}>
        <TouchableOpacity
          style={styles.backdropTouchable}
          onPress={handleBackdropPress}
          activeOpacity={1}
        />
      </Animated.View>
      <Animated.View style={[styles.sheetContainer, sheetStyle]}>
        <View style={styles.handle} />
        <View style={styles.content}>{children}</View>
      </Animated.View>
    </View>
  )
}

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
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    paddingBottom: 34
  },
  handle: {
    width: 40,
    height: 5,
    borderRadius: 3,
    backgroundColor: Colors.neutrals.gray300,
    alignSelf: 'center',
    marginTop: 10,
    marginBottom: 10
  },
  content: {
    padding: 16
  }
})

export default BottomSheet