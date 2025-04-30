import React, { useEffect } from 'react';
import { Platform, TouchableOpacity, StyleSheet, Dimensions } from 'react-native';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Feather } from '@expo/vector-icons';
import { BlurView } from 'expo-blur';
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming,
  Easing,
  interpolateColor,
  withSequence
} from 'react-native-reanimated';
import { Box, Text } from 'native-base';

// Import screens
import DashboardScreen from '../screens/DashboardScreen';
import ProjectsListScreen from '../screens/ProjectsListScreen';
import TasksListScreen from '../screens/TasksListScreen';
import ProfileScreen from '../screens/ProfileScreen';

// Import theme and hooks
import { useTheme } from '../hooks/useColorScheme';
import * as Haptics from 'expo-haptics';
import Screens from '../constants/Screens';
import TabBarBackground from '../components/ui/TabBarBackground';
import { triggerSelection, triggerImpact } from '../utils/HapticUtils';

const { width } = Dimensions.get('window');

// Define navigator types
export type MainTabParamList = {
  [Screens.DASHBOARD]: undefined;
  'Projects': undefined;
  'Tasks': undefined;
  [Screens.PROFILE]: undefined;
};

// Create tab navigator
const Tab = createBottomTabNavigator<MainTabParamList>();

// Animated tab indicator
const TabIndicator = ({ state, descriptors, navigation }) => {
  const { routes, index: activeIndex } = state;
  const { colors } = useTheme();
  const translateX = useSharedValue(0);
  const indicatorWidth = useSharedValue(20);
  const indicatorOpacity = useSharedValue(0);
  const tabWidth = 100 / routes.length;
  
  // Update indicator position when active tab changes
  useEffect(() => {
    indicatorOpacity.value = withSequence(
      withTiming(0, { duration: 50 }),
      withTiming(1, { duration: 250 })
    );
    
    translateX.value = withSpring(activeIndex * tabWidth + (tabWidth / 2) - 10, {
      damping: 15,
      stiffness: 150,
      mass: 0.5
    });
  }, [activeIndex, tabWidth]);
  
  // Animated style for indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: translateX.value }],
      opacity: indicatorOpacity.value,
      width: indicatorWidth.value
    };
  });
  
  return (
    <Animated.View 
      style={[
        {
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          alignItems: 'center'
        }
      ]}
    >
      <Animated.View 
        style={[
          {
            position: 'absolute',
            top: 4,
            width: 20,
            height: 3,
            backgroundColor: colors.primary[500],
            borderRadius: 1.5
          },
          indicatorStyle
        ]}
      />
    </Animated.View>
  );
};

// Custom tab bar with animations
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets();
  const { colors, metrics } = useTheme();
  const blurTint = 'light';
  const tabBarOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Animate tab bar in
    tabBarOpacity.value = withTiming(1, { duration: 500 });
  }, []);
  
  const tabBarStyle = useAnimatedStyle(() => {
    return {
      opacity: tabBarOpacity.value
    };
  });
  
  return (
    <Animated.View 
      style={[
        styles.tabBarContainer,
        { 
          height: metrics.tabBarHeight + Math.max(insets.bottom, 10),
        },
        tabBarStyle
      ]}
    >
      <TabBarBackground 
        intensity={85}
        tint={blurTint}
        style={{ height: metrics.tabBarHeight + Math.max(insets.bottom, 10) }}
      />
      
      <Box 
        style={[
          styles.tabBarContent,
          { height: metrics.tabBarHeight }
        ]}
      >
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key];
          const label = options.tabBarLabel || options.title || route.name;
          const isFocused = state.index === index;
          
          // Get icon name based on route
          const getIconName = () => {
            switch (route.name) {
              case Screens.DASHBOARD:
                return 'grid';
              case 'Projects':
                return 'briefcase';
              case 'Tasks':
                return 'check-square';
              case Screens.PROFILE:
                return 'user';
              default:
                return 'circle';
            }
          };
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            });
            
            if (!isFocused && !event.defaultPrevented) {
              // Haptic feedback for tab press
              triggerImpact(Haptics.ImpactFeedbackStyle.Light);
              navigation.navigate(route.name);
            }
          };
          
          const onLongPress = () => {
            triggerImpact(Haptics.ImpactFeedbackStyle.Medium);
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            });
          };
          
          return (
            <TouchableTab
              key={route.key}
              label={label}
              icon={getIconName()}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          );
        })}
      </Box>
      
      <TabIndicator
        state={state}
        descriptors={descriptors}
        navigation={navigation}
      />
    </Animated.View>
  );
};

// Animated tab button
const TouchableTab = ({ label, icon, isFocused, onPress, onLongPress }) => {
  const { colors, typography } = useTheme();
  const scale = useSharedValue(1);
  const opacity = useSharedValue(isFocused ? 1 : 0.6);
  const iconColor = useSharedValue(isFocused ? colors.primary[500] : colors.neutrals[500]);
  
  // Update opacity when focus changes
  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0.6, { 
      duration: 200,
      easing: Easing.bezier(0.25, 0.1, 0.25, 1) 
    });
    
    iconColor.value = withTiming(
      isFocused ? colors.primary[500] : colors.neutrals[500],
      { duration: 200 }
    );
  }, [isFocused]);
  
  // Handle press animations
  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 });
  };
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 });
  };
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    };
  });
  
  const iconStyle = useAnimatedStyle(() => {
    return {
      color: iconColor.value
    };
  });
  
  return (
    <Animated.View 
      style={[styles.tabContainer, containerStyle]}
    >
      <TouchableOpacity
        style={styles.tabButton}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
        accessible={true}
        accessibilityRole="tab"
        accessibilityState={{ selected: isFocused }}
        accessibilityLabel={label}
      >
        <Animated.View style={iconStyle}>
          <Feather 
            name={icon} 
            size={22} 
            color={isFocused ? colors.primary[500] : colors.neutrals[500]} 
          />
        </Animated.View>
        
        <Animated.Text 
          style={[
            styles.tabLabel,
            {
              fontSize: typography.sizes.xs,
              marginTop: 4,
              color: isFocused ? colors.primary[500] : colors.neutrals[500],
              fontWeight: isFocused ? typography.weights.semibold : typography.weights.medium
            }
          ]}
        >
          {label}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

// Main Tabs Navigator Component
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          display: 'none'
        }
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name={Screens.DASHBOARD} component={DashboardScreen} />
      <Tab.Screen name="Projects" component={ProjectsListScreen} />
      <Tab.Screen name="Tasks" component={TasksListScreen} />
      <Tab.Screen name={Screens.PROFILE} component={ProfileScreen} />
    </Tab.Navigator>
  );
};

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: -4 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    elevation: 10,
    zIndex: 100,
  },
  tabBarContent: {
    flexDirection: 'row',
    paddingTop: 8,
  },
  tabContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center'
  },
  tabButton: {
    alignItems: 'center',
    justifyContent: 'center',
    width: '100%',
    height: '100%'
  },
  tabLabel: {
    textAlign: 'center',
  },
});

export default MainTabs;