import React, { useEffect, useState } from 'react';
import { 
  StyleSheet, 
  View, 
  Text, 
  TouchableOpacity, 
  LayoutChangeEvent,
  ViewStyle,
  TextStyle 
} from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  useDerivedValue,
  interpolateColor,
  runOnJS,
  withSpring,
  Easing
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import Spacing from '../../theme/Spacing';
import { triggerSelection } from '../../utils/HapticUtils';
import { useTheme } from '../../hooks/useColorScheme';

interface Segment {
  id: string;
  label: string;
  icon?: string;
}

interface SegmentedControlProps {
  segments: Segment[];
  selectedId: string;
  onChange: (id: string) => void;
  primaryColor?: string;
  secondaryColor?: string;
  animationDuration?: number;
  style?: ViewStyle;
  tabStyle?: ViewStyle;
  activeTabStyle?: ViewStyle;
  tabTextStyle?: TextStyle;
  activeTabTextStyle?: TextStyle;
  vertical?: boolean;
}

const SegmentedControl = ({
  segments,
  selectedId,
  onChange,
  primaryColor,
  secondaryColor,
  animationDuration = 250,
  style,
  tabStyle,
  activeTabStyle,
  tabTextStyle,
  activeTabTextStyle,
  vertical = false
}: SegmentedControlProps) => {
  const { colors, isDark } = useTheme();
  const activeColor = primaryColor || colors.primary[500];
  const inactiveColor = secondaryColor || (isDark ? colors.neutrals[600] : colors.neutrals[500]);
  
  const [segmentWidths, setSegmentWidths] = useState<{ [key: string]: number }>({});
  const [segmentHeights, setSegmentHeights] = useState<{ [key: string]: number }>({});
  const [segmentPositions, setSegmentPositions] = useState<{ [key: string]: number }>({});
  const [containerSize, setContainerSize] = useState({ width: 0, height: 0 });
  const [isInitialized, setIsInitialized] = useState(false);
  
  // Animation values
  const selectedPosition = useSharedValue(0);
  const selectedSize = useSharedValue(vertical ? { width: 0, height: 0 } : 0);
  const activationProgress = useSharedValue(1);
  
  // Calculate indicator position when segments or selection changes
  useEffect(() => {
    if (!isInitialized || Object.keys(segmentPositions).length === 0) return;
    
    const selectedSegmentIndex = segments.findIndex(s => s.id === selectedId);
    
    if (selectedSegmentIndex >= 0) {
      const position = segmentPositions[selectedId] || 0;
      
      if (vertical) {
        const height = segmentHeights[selectedId] || 0;
        selectedPosition.value = withSpring(position, { 
          damping: 20, 
          stiffness: 300,
          mass: 0.8
        });
        selectedSize.value = { 
          width: containerSize.width - 8, 
          height 
        };
      } else {
        const width = segmentWidths[selectedId] || 0;
        selectedPosition.value = withSpring(position, { 
          damping: 20, 
          stiffness: 300,
          mass: 0.8
        });
        selectedSize.value = width;
      }
      
      // Pulse animation for indicator
      activationProgress.value = withTiming(0, { duration: animationDuration / 3 }, () => {
        activationProgress.value = withTiming(1, { duration: animationDuration / 2 });
      });
    }
  }, [selectedId, segments, segmentPositions, segmentWidths, segmentHeights, isInitialized]);
  
  const handleContainerLayout = (event: LayoutChangeEvent) => {
    const { width, height } = event.nativeEvent.layout;
    setContainerSize({ width, height });
  };
  
  const handleSegmentLayout = (id: string, event: LayoutChangeEvent) => {
    const { width, height, x, y } = event.nativeEvent.layout;
    
    setSegmentWidths(prev => ({ ...prev, [id]: width }));
    setSegmentHeights(prev => ({ ...prev, [id]: height }));
    setSegmentPositions(prev => ({ ...prev, [id]: vertical ? y : x }));
    
    // Initialize indicator position for initially selected segment
    if (id === selectedId && !isInitialized) {
      selectedPosition.value = vertical ? y : x;
      
      if (vertical) {
        selectedSize.value = { width: width - 8, height };
      } else {
        selectedSize.value = width;
      }
      
      setIsInitialized(true);
    }
  };
  
  const handlePress = (id: string) => {
    if (id !== selectedId) {
      triggerSelection();
      onChange(id);
    }
  };
  
  // Animated styles
  const indicatorStyle = useAnimatedStyle(() => {
    if (vertical) {
      return {
        transform: [{ translateY: selectedPosition.value }],
        width: selectedSize.value.width,
        height: selectedSize.value.height,
        opacity: activationProgress.value
      };
    }
    
    return {
      transform: [{ translateX: selectedPosition.value }],
      width: selectedSize.value as number,
      opacity: activationProgress.value
    };
  });

  return (
    <View 
      style={[
        styles.container, 
        vertical ? styles.verticalContainer : null,
        { backgroundColor: isDark ? colors.neutrals[700] : colors.neutrals[200] },
        style
      ]} 
      onLayout={handleContainerLayout}
      accessible={true}
      accessibilityRole="tablist"
    >
      <Animated.View style={[
        styles.indicator, 
        vertical ? styles.verticalIndicator : null,
        { backgroundColor: isDark ? colors.neutrals[600] : colors.neutrals.white },
        indicatorStyle,
        activeTabStyle
      ]} />
      
      <View style={[
        styles.segments,
        vertical ? styles.verticalSegments : null
      ]}>
        {segments.map((segment) => {
          const isSelected = segment.id === selectedId;
          
          const textColorAnimated = useDerivedValue(() => {
            // For the selected segment, interpolate to primary color as activation progresses
            if (isSelected) {
              return interpolateColor(
                activationProgress.value,
                [0, 1],
                [inactiveColor, activeColor]
              );
            } 
            // For non-selected segments, keep secondary color
            return inactiveColor;
          });
          
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
            };
          });
          
          return (
            <TouchableOpacity
              key={segment.id}
              style={[
                styles.segment,
                vertical ? styles.verticalSegment : null,
                tabStyle
              ]}
              onPress={() => handlePress(segment.id)}
              onLayout={(event) => handleSegmentLayout(segment.id, event)}
              activeOpacity={0.7}
              accessible={true}
              accessibilityRole="tab"
              accessibilityState={{ selected: isSelected }}
              accessibilityLabel={segment.label}
            >
              <Animated.Text style={[
                styles.segmentText, 
                textStyle,
                tabTextStyle,
                isSelected && activeTabTextStyle
              ]}>
                {segment.label}
              </Animated.Text>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderRadius: 8,
    backgroundColor: Colors.neutrals[200],
    padding: 4,
    position: 'relative'
  },
  verticalContainer: {
    width: 120,
    height: 'auto',
    minHeight: 80,
  },
  segments: {
    flexDirection: 'row',
    flex: 1
  },
  verticalSegments: {
    flexDirection: 'column'
  },
  segment: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 2,
    padding: 8
  },
  verticalSegment: {
    alignItems: 'flex-start',
    paddingVertical: 12
  },
  segmentText: {
    fontSize: Typography.sizes.sm,
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
  },
  verticalIndicator: {
    width: 'auto',
    height: 32
  }
});

export default SegmentedControl;