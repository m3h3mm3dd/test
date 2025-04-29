import React from 'react'
import { StyleSheet, View } from 'react-native'
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
import { Feather } from '@expo/vector-icons';

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
            <Feather name="home" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name={Screens.PROJECT}
        component={ProjectScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color }) => (
            <Feather name="folder" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name={Screens.PROFILE}
        component={ProfileScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  )
}

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
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
  }
})

export default AppNavigator