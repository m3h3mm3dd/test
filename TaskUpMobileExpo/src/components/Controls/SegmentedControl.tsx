import React, { useEffect, useRef } from 'react'
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  LayoutChangeEvent,
  Dimensions 
} from 'react-native'
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  interpolateColor,
  runOnJS
} from 'react-native-reanimated'
import * as Haptics from 'expo-haptics'

import Colors from '../../theme/Colors'
import Typography from '../../theme/Typography'
import Spacing from '../../theme/Spacing'
import { triggerSelection } from '../../utils/HapticUtils'

interface Segment {
  id: string
  label: string
}

interface SegmentedControlProps {
  segments: Segment[]
  selectedId: string
  onChange: (id: string) => void
  primaryColor?: string
  secondaryColor?: string
  animationDuration?: number
}

const SegmentedControl = ({
  segments,
  selectedId,
  onChange,
  primaryColor = Colors.primary.blue,
  secondaryColor = Colors.neutrals.gray600,
  animationDuration = 250
}: SegmentedControlProps) => {
  const segmentWidths = useRef<{ [key: string]: number }>({})
  const segmentPositions = useRef<{ [key: string]: number }>({})
  const containerWidth = useSharedValue(0)
  
  // Animation values
  const selectedPosition = useSharedValue(0)
  const selectedWidth = useSharedValue(0)
  const activationProgress = useSharedValue(1)
  
  useEffect(() => {
    // When selectedId changes externally, update the indicator position and width
    const selectedSegmentIndex = segments.findIndex(s => s.id === selectedId)
    
    if (selectedSegmentIndex >= 0) {
      const position = segmentPositions.current[selectedId] || 0
      const width = segmentWidths.current[selectedId] || 0
      
      selectedPosition.value = withTiming(position, { duration: animationDuration })
      selectedWidth.value = withTiming(width, { duration: animationDuration })
      
      activationProgress.value = withTiming(0, { duration: animationDuration / 2 }, () => {
        activationProgress.value = withTiming(1, { duration: animationDuration / 2 })
      })
    }
  }, [selectedId])
  
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    containerWidth.value = event.nativeEvent.layout.width
  }
  
  const handleSegmentLayout = (id: string, event: LayoutChangeEvent) => {
    const { width, x } = event.nativeEvent.layout
    segmentWidths.current[id] = width
    segmentPositions.current[id] = x
    
    // Initialize indicator position for initially selected segment
    if (id === selectedId) {
      selectedPosition.value = x
      selectedWidth.value = width
    }
  }
  
  const handlePress = (id: string) => {
    if (id !== selectedId) {
      triggerSelection()
      onChange(id)
    }
  }
  
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: selectedPosition.value }],
      width: selectedWidth.value,
      opacity: activationProgress.value
    }
  })

  return (
    <View 
      style={styles.container} 
      onLayout={handleContainerLayout}
      accessible={true}
      accessibilityRole="tablist"
    >
      <Animated.View style={[styles.indicator, indicatorStyle]} />
      
      <View style={styles.segments}>
        {segments.map((segment) => {
          const isSelected = segment.id === selectedId
          
          const textColorAnimated = useDerivedValue(() => {
            // For the selected segment, interpolate to primary color as activation progresses
            if (isSelected) {
              return interpolateColor(
                activationProgress.value,
                [0, 1],
                [secondaryColor, primaryColor]
              )
            } 
            // For non-selected segments, keep secondary color
            return secondaryColor
          })
          
          const textStyle = useAnimatedStyle(() => {
            return {
              color: textColorAnimated.value,
              transform: [
                { 
                  scale: isSelected 
                    ? withTiming(1.05, { duration: animationDuration }) 
                    : withTiming(1, { duration: animationDuration })
                }
              ]
            }
          })
          
          return (
            <TouchableOpacity
              key={segment.id}
              style={styles.segment}
              onPress={() => handlePress(segment.id)}
              onLayout={(event) => handleSegmentLayout(segment.id, event)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={segment.label}
            >
              <Animated.Text style={[styles.segmentText, textStyle]}>
                {segment.label}
              </Animated.Text>
            </TouchableOpacity>
          )
        })}
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.neutrals.gray100,
    padding: 4,
    position: 'relative'
  },
  segments: {
    flexDirection: 'row',
    flex: 1
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2
  },
  segmentText: {
    fontSize: Typography.sizes.bodySmall,
    fontWeight: Typography.weights.medium
  },
  indicator: {
    position: 'absolute',
    height: 32,
    backgroundColor: Colors.neutrals.white,
    borderRadius: 6,
    top: 4,
    left: 4,
    zIndex: 1,
    shadowColor: Colors.neutrals.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2
  }
})

export default SegmentedControl