import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
  Easing,
} from 'react-native-reanimated';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from './Text';
import Icon from 'react-native-vector-icons/Ionicons';

interface SegmentedOption {
  label: string;
  value: string;
  icon?: string;
}

interface SegmentedProps {
  options: SegmentedOption[];
  value: string;
  onChange: (value: string) => void;
}

export const Segmented = ({ options, value, onChange }: SegmentedProps) => {
  const { theme } = useTheme();
  const selectedIndex = options.findIndex(option => option.value === value);
  const position = useSharedValue(selectedIndex !== -1 ? selectedIndex : 0);

  React.useEffect(() => {
    const newIndex = options.findIndex(option => option.value === value);
    if (newIndex !== -1) {
      position.value = withTiming(newIndex, {
        duration: 200,
        easing: Easing.bezier(0.25, 0.1, 0.25, 1),
      });
    }
  }, [value, options, position]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [
        {
          translateX: withTiming(position.value * (100 / options.length) + '%', {
            duration: 200,
            easing: Easing.bezier(0.25, 0.1, 0.25, 1),
          }),
        },
      ],
    };
  });

  return (
    <View
      style={[
        styles.container,
        {
          backgroundColor: theme.colors.card,
          borderColor: theme.colors.border,
        },
      ]}
    >
      <Animated.View
        style={[
          styles.indicator,
          {
            backgroundColor: theme.colors.primary + '20',
            width: `${100 / options.length}%`,
          },
          indicatorStyle,
        ]}
      />
      
      {options.map((option, index) => (
        <TouchableOpacity
          key={option.value}
          style={[
            styles.option,
            { width: `${100 / options.length}%` },
          ]}
          onPress={() => onChange(option.value)}
          activeOpacity={0.7}
        >
          {option.icon && (
            <Icon
              name={option.icon}
              size={16}
              color={value === option.value ? theme.colors.primary : theme.colors.textSecondary}
              style={styles.icon}
            />
          )}
          <Text
            variant="button"
            style={{
              color: value === option.value ? theme.colors.primary : theme.colors.textSecondary,
            }}
          >
            {option.label}
          </Text>
        </TouchableOpacity>
      ))}
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    height: 40,
    borderRadius: 8,
    flexDirection: 'row',
    alignItems: 'center',
    position: 'relative',
    borderWidth: 1,
    flex: 1,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: '100%',
    borderRadius: 6,
  },
  option: {
    height: '100%',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
  },
  icon: {
    marginRight: 4,
  },
});