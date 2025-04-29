import React from 'react'
import { StyleSheet } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs'
import Animated, { FadeIn, FadeOut } from 'react-native-reanimated'

import HomeScreen from '../screens/HomeScreen'
import TaskScreen from '../screens/TaskScreen'
import ProjectScreen from '../screens/ProjectScreen'
import ProfileScreen from '../screens/ProfileScreen'
import SettingsScreen from '../screens/SettingsScreen'
import Screens from '../constants/Screens'
import Colors from '../theme/Colors'
import Metrics from '../theme/Metrics'

const Stack = createNativeStackNavigator()
const Tab = createBottomTabNavigator()

const MainTabs = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        tabBarStyle: styles.tabBar,
        tabBarActiveTintColor: Colors.primary.blue,
        tabBarInactiveTintColor: Colors.neutrals.gray500,
        tabBarLabelStyle: styles.tabBarLabel,
        headerShown: false,
        tabBarHideOnKeyboard: true
      }}
    >
      <Tab.Screen
        name={Screens.HOME}
        component={HomeScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <TabIcon name="home" color={color} />
          )
        }}
      />
      <Tab.Screen
        name={Screens.PROJECT}
        component={ProjectScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color }) => (
            <TabIcon name="folder" color={color} />
          )
        }}
      />
      <Tab.Screen
        name={Screens.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <TabIcon name="user" color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}

// Simple placeholder for icons - would be replaced with actual icons in real implementation
const TabIcon = ({ name, color }) => {
  return (
    <Animated.View
      style={[styles.iconContainer, { backgroundColor: color }]}
      entering={FadeIn}
      exiting={FadeOut}
    />
  )
}

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName={Screens.HOME}
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background.light },
          animation: 'fade_from_bottom'
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name={Screens.TASK} component={TaskScreen} />
        <Stack.Screen name={Screens.SETTINGS} component={SettingsScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  )
}

const styles = StyleSheet.create({
  tabBar: {
    height: Metrics.tabBarHeight,
    paddingTop: 8,
    paddingBottom: 16,
    borderTopColor: Colors.neutrals.gray200,
    borderTopWidth: 1
  },
  tabBarLabel: {
    fontSize: 12,
    fontWeight: '500'
  },
  iconContainer: {
    width: 24,
    height: 24,
    borderRadius: 4
  }
})

export default AppNavigator