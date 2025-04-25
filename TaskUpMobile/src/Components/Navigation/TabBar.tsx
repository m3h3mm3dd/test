import React from 'react';
import { View, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import Animated, {
  useAnimatedStyle,
  withSpring,
  useSharedValue,
  interpolateColor,
  useDerivedValue,
} from 'react-native-reanimated';
import { BottomTabBarProps } from '@react-navigation/bottom-tabs';
import { useTheme } from '../../Hooks/UseTheme';
import { Text } from '../UI/Text';
import Icon from 'react-native-vector-icons/Ionicons';

const { width } = Dimensions.get('window');

export const TabBar = ({ state, descriptors, navigation }: BottomTabBarProps) => {
  const { theme } = useTheme();
  const tabWidth = width / state.routes.length;
  const indicatorPosition = useSharedValue(0);

  React.useEffect(() => {
    indicatorPosition.value = withSpring(state.index * tabWidth, {
      damping: 20,
      stiffness: 200,
    });
  }, [state.index, indicatorPosition, tabWidth]);

  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: indicatorPosition.value }],
    };
  });

  return (
    <View style={[styles.container, { backgroundColor: 'transparent' }]}>
      <View
        style={[
          styles.tabBar,
          {
            backgroundColor: theme.colors.card,
          },
        ]}
      >
        <Animated.View
          style={[
            styles.indicator,
            { width: tabWidth, backgroundColor: theme.colors.primary + '20' },
            indicatorStyle,
          ]}
        />

        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label =
            options.tabBarLabel !== undefined
              ? options.tabBarLabel
              : options.title !== undefined
              ? options.title
              : route.name;

          const isFocused = state.index === index;

          const progress = useDerivedValue(() => {
            return isFocused ? withSpring(1) : withSpring(0);
          });

          const animatedIconStyle = useAnimatedStyle(() => {
            return {
              transform: [{ scale: progress.value * 0.2 + 0.8 }],
            };
          });

          const animatedTextStyle = useAnimatedStyle(() => {
            const color = interpolateColor(
              progress.value,
              [0, 1],
              [theme.colors.textSecondary, theme.colors.primary]
            );

            return {
              color,
              opacity: progress.value,
              transform: [
                { 
                  translateY: withSpring(progress.value * -2, {
                    damping: 20,
                    stiffness: 300,
                  }) 
                },
              ],
            };
          });

          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });

            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name);
            }
          };

          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };

          const renderIcon = () => {
            let iconName = '';
            if (route.name === 'Dashboard') {
              iconName = isFocused ? 'home' : 'home-outline';
            } else if (route.name === 'Projects') {
              iconName = isFocused ? 'folder' : 'folder-outline';
            } else if (route.name === 'Tasks') {
              iconName = isFocused ? 'list' : 'list-outline';
            } else if (route.name === 'Teams') {
              iconName = isFocused ? 'people' : 'people-outline';
            } else if (route.name === 'Profile') {
              iconName = isFocused ? 'person' : 'person-outline';
            }

            return (
              <Animated.View style={animatedIconStyle}>
                <Icon
                  name={iconName}
                  size={24}
                  color={isFocused ? theme.colors.primary : theme.colors.textSecondary}
                />
              </Animated.View>
            );
          };

          return (
            <TouchableOpacity
              key={index}
              accessibilityRole="button"
              accessibilityState={isFocused ? { selected: true } : {}}
              accessibilityLabel={options.tabBarAccessibilityLabel}
              testID={options.tabBarTestID}
              onPress={onPress}
              onLongPress={onLongPress}
              style={styles.tabButton}
              activeOpacity={0.7}
            >
              {renderIcon()}
              <Animated.Text style={[styles.tabLabel, animatedTextStyle]}>
                {label as string}
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
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    alignItems: 'center',
    justifyContent: 'center',
    height: 80,
  },
  tabBar: {
    flexDirection: 'row',
    width: '90%',
    height: 60,
    borderRadius: 30,
    overflow: 'hidden',
  },
  indicator: {
    position: 'absolute',
    height: '100%',
    top: 0,
    left: 0,
    borderRadius: 30,
  },
  tabButton: {
    flex: 1,
    alignItems: 'center',
    justifyContent: 'center',
  },
  tabLabel: {
    fontSize: 11,
    marginTop: 4,
    fontWeight: '500',
  },
});