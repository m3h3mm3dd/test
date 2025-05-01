import React, { useEffect } from 'react';
import { 
  StyleSheet, 
  TouchableOpacity, 
  View, 
  Text, 
  ViewStyle, 
  TextStyle 
} from 'react-native';
import Animated, { 
  useAnimatedStyle, 
  useSharedValue, 
  withTiming, 
  withSequence,
  FadeIn
} from 'react-native-reanimated';
import * as Haptics from 'expo-haptics';
import { Feather } from '@expo/vector-icons';

import Colors from '../../theme/Colors';
import Typography from '../../theme/Typography';
import { triggerImpact } from '../../utils/HapticUtils';
import { useTheme } from '../../hooks/useColorScheme';

interface CheckboxProps {
  checked: boolean;
  onToggle: () => void;
  size?: number;
  disabled?: boolean;
  label?: string;
  labelPosition?: 'right' | 'left';
  style?: ViewStyle;
  labelStyle?: TextStyle;
  animationType?: 'scale' | 'bounce';
  activeColor?: string;
}

const Checkbox = ({ 
  checked, 
  onToggle, 
  size = 24, 
  disabled = false,
  label,
  labelPosition = 'right',
  style,
  labelStyle,
  animationType = 'scale',
  activeColor
}: CheckboxProps) => {
  const { colors, isDark } = useTheme();
  const scale = useSharedValue(1);
  const checkmarkScale = useSharedValue(checked ? 1 : 0);
  const checkboxOpacity = useSharedValue(0);
  
  // Set active color based on theme or props
  const checkboxColor = activeColor || colors.primary[500];
  
  useEffect(() => {
    // Fade in animation
    checkboxOpacity.value = withTiming(1, { duration: 300 });
    
    // Animate checkmark when checked state changes
    checkmarkScale.value = withTiming(checked ? 1 : 0, { 
      duration: 150 
    });
  }, [checked]);
  
  const handlePress = () => {
    if (disabled) return;
    
    // Haptic feedback
    triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    
    // Animation based on selected type
    if (animationType === 'scale') {
      scale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    } else if (animationType === 'bounce') {
      scale.value = withSequence(
        withTiming(0.8, { duration: 100 }),
        withTiming(1.1, { duration: 100 }),
        withTiming(1, { duration: 100 })
      );
    }
    
    onToggle();
  };
  
  const animatedStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: checkboxOpacity.value
    };
  });

  const checkmarkStyle = useAnimatedStyle(() => {
    return {
      opacity: checkmarkScale.value,
      transform: [{ scale: checkmarkScale.value }]
    };
  });

  const renderCheckbox = () => (
    <Animated.View
      style={[
        styles.container,
        { 
          width: size, 
          height: size, 
          borderRadius: size / 6,
          borderColor: checked ? checkboxColor : isDark ? colors.border : Colors.neutrals.gray400,
          backgroundColor: checked ? checkboxColor : 'transparent'
        },
        disabled && (checked ? styles.disabledCheckedContainer : styles.disabledContainer),
        animatedStyle
      ]}
    >
      {checked && (
        <Animated.View style={checkmarkStyle}>
          <Feather 
            name="check" 
            size={size * 0.6} 
            color={isDark ? Colors.neutrals.black : Colors.neutrals.white} 
          />
        </Animated.View>
      )}
    </Animated.View>
  );

  // If there's no label, just return the checkbox
  if (!label) {
    return (
      <TouchableOpacity
        activeOpacity={0.7}
        onPress={handlePress}
        disabled={disabled}
        accessible={true}
        accessibilityRole="checkbox"
        accessibilityState={{ checked, disabled }}
        style={style}
      >
        {renderCheckbox()}
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      activeOpacity={0.7}
      onPress={handlePress}
      disabled={disabled}
      style={[
        styles.rowContainer,
        { flexDirection: labelPosition === 'left' ? 'row-reverse' : 'row' },
        style
      ]}
      accessible={true}
      accessibilityRole="checkbox"
      accessibilityState={{ checked, disabled }}
      accessibilityLabel={label}
      entering={FadeIn.duration(300)}
    >
      {renderCheckbox()}
      
      <Text
        style={[
          styles.label,
          { 
            marginLeft: labelPosition === 'left' ? 0 : 10,
            marginRight: labelPosition === 'left' ? 10 : 0,
            color: disabled 
              ? isDark ? colors.text.disabled : Colors.neutrals.gray400
              : isDark ? colors.text.primary : Colors.neutrals.gray800
          },
          labelStyle
        ]}
      >
        {label}
      </Text>
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    borderWidth: 2,
    justifyContent: 'center',
    alignItems: 'center'
  },
  checkedContainer: {
    backgroundColor: Colors.primary[500]
  },
  disabledContainer: {
    borderColor: Colors.neutrals.gray300,
    backgroundColor: 'transparent'
  },
  disabledCheckedContainer: {
    borderColor: Colors.neutrals.gray400,
    backgroundColor: Colors.neutrals.gray400
  },
  rowContainer: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  label: {
    fontSize: Typography.sizes.md,
    color: Colors.neutrals.gray800
  }
});

export default Checkbox;