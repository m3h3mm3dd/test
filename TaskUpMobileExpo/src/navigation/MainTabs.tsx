import React, { useEffect } from 'react'
import { View, StyleSheet, Platform } from 'react-native'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import { useSafeAreaInsets } from 'react-native-safe-area-context'
import { Feather } from '@expo/vector-icons'
import Animated, {
  useAnimatedStyle,
  useSharedValue,
  withSpring,
  withTiming
} from 'react-native-reanimated'
import { BlurView } from 'expo-blur'

// Import screens
import DashboardScreen from '../screens/DashboardScreen'
import ProjectsListScreen from '../screens/ProjectsListScreen'
import TasksListScreen from '../screens/TasksListScreen'
import ProfileScreen from '../screens/ProfileScreen'

// Import theme
import Colors from '../theme/Colors'
import Metrics from '../theme/Metrics'
import Typography from '../theme/Typography'

// Create tab navigator
const Tab = createBottomTabNavigator()

// Animated tab indicator
const TabIndicator = ({ state, descriptors, navigation }) => {
  const { routes, index: activeIndex } = state
  const translateX = useSharedValue(0)
  const tabWidth = 100 / routes.length
  
  // Update indicator position when active tab changes
  useEffect(() => {
    translateX.value = withSpring(activeIndex * tabWidth, {
      damping: 15,
      stiffness: 120
    })
  }, [activeIndex])
  
  // Animated style for indicator
  const indicatorStyle = useAnimatedStyle(() => {
    return {
      transform: [{ translateX: `${translateX.value}%` }],
      width: `${tabWidth}%`
    }
  })
  
  return (
    <Animated.View style={[styles.indicatorContainer, indicatorStyle]}>
      <View style={styles.indicator} />
    </Animated.View>
  )
}

// Custom tab bar with animations
const CustomTabBar = ({ state, descriptors, navigation }) => {
  const insets = useSafeAreaInsets()
  
  return (
    <View style={[styles.tabBarContainer, { paddingBottom: Math.max(insets.bottom, 10) }]}>
      <BlurView intensity={80} tint="light" style={StyleSheet.absoluteFill} />
      <View style={styles.tabBarContent}>
        {state.routes.map((route, index) => {
          const { options } = descriptors[route.key]
          const label = options.tabBarLabel || options.title || route.name
          const isFocused = state.index === index
          
          // Get icon name based on route
          const getIconName = () => {
            switch (route.name) {
              case 'Dashboard':
                return 'grid'
              case 'Projects':
                return 'briefcase'
              case 'Tasks':
                return 'check-square'
              case 'Profile':
                return 'user'
              default:
                return 'circle'
            }
          }
          
          const onPress = () => {
            const event = navigation.emit({
              type: 'tabPress',
              target: route.key,
              canPreventDefault: true,
            })
            
            if (!isFocused && !event.defaultPrevented) {
              navigation.navigate(route.name)
            }
          }
          
          const onLongPress = () => {
            navigation.emit({
              type: 'tabLongPress',
              target: route.key,
            })
          }
          
          return (
            <TouchableTab
              key={route.key}
              label={label}
              icon={getIconName()}
              isFocused={isFocused}
              onPress={onPress}
              onLongPress={onLongPress}
            />
          )
        })}
      </View>
      
      <TabIndicator
        state={state}
        descriptors={descriptors}
        navigation={navigation}
      />
    </View>
  )
}

// Animated tab button
const TouchableTab = ({ label, icon, isFocused, onPress, onLongPress }) => {
  const scale = useSharedValue(1)
  const opacity = useSharedValue(isFocused ? 1 : 0.5)
  
  // Update opacity when focus changes
  useEffect(() => {
    opacity.value = withTiming(isFocused ? 1 : 0.5, { duration: 200 })
  }, [isFocused])
  
  // Handle press animations
  const handlePressIn = () => {
    scale.value = withTiming(0.9, { duration: 100 })
  }
  
  const handlePressOut = () => {
    scale.value = withSpring(1, { damping: 15, stiffness: 150 })
  }
  
  // Animated styles
  const containerStyle = useAnimatedStyle(() => {
    return {
      transform: [{ scale: scale.value }],
      opacity: opacity.value
    }
  })
  
  return (
    <Animated.View style={[styles.tabContainer, containerStyle]}>
      <TouchableOpacity
        style={styles.tabButton}
        onPress={onPress}
        onLongPress={onLongPress}
        onPressIn={handlePressIn}
        onPressOut={handlePressOut}
        activeOpacity={0.7}
      >
        <Feather 
          name={icon} 
          size={22} 
          color={isFocused ? Colors.primary.blue : Colors.neutrals.gray500} 
        />
        <Animated.Text 
          style={[
            styles.tabLabel,
            { 
              color: isFocused ? Colors.primary.blue : Colors.neutrals.gray500,
              fontWeight: isFocused ? Typography.weights.semibold : Typography.weights.medium
            }
          ]}
        >
          {label}
        </Animated.Text>
      </TouchableOpacity>
    </Animated.View>
  )
}

// Main Tabs Navigator Component
const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarShowLabel: false,
        tabBarStyle: {
          position: 'absolute',
          height: 0,
          opacity: 0,
        }
      }}
      tabBar={props => <CustomTabBar {...props} />}
    >
      <Tab.Screen name="Dashboard" component={DashboardScreen} />
      <Tab.Screen name="Projects" component={ProjectsListScreen} />
      <Tab.Screen name="Tasks" component={TasksListScreen} />
      <Tab.Screen name="Profile" component={ProfileScreen} />
    </Tab.Navigator>
  )
}

const styles = StyleSheet.create({
  tabBarContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    height: Metrics.tabBarHeight + 20, // Add extra space for bottom inset
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    overflow: 'hidden',
    ...Platform.select({
      ios: {
        shadowColor: Colors.neutrals.black,
        shadowOffset: { width: 0, height: -4 },
        shadowOpacity: 0.1,
        shadowRadius: 8
      },
      android: {
        elevation: 8
      }
    })
  },
  tabBarContent: {
    flexDirection: 'row',
    height: Metrics.tabBarHeight
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
    fontSize: Typography.sizes.caption,
    marginTop: 4
  },
  indicatorContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    height: 2,
    alignItems: 'center'
  },
  indicator: {
    width: 20,
    height: 2,
    backgroundColor: Colors.primary.blue,
    borderRadius: 1
  }
})

export default MainTabs