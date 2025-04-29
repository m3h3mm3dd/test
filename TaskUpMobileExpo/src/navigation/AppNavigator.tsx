// src/navigation/AppNavigator.tsx
import React from 'react';
import { StyleSheet, View, Text } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Feather } from '@expo/vector-icons';

// Import screens
import HomeScreen from '../screens/HomeScreen';
import TaskScreen from '../screens/TaskScreen';
import ProjectScreen from '../screens/ProjectScreen';
import ProfileScreen from '../screens/ProfileScreen';
import SettingsScreen from '../screens/SettingsScreen';

// Import constants
import Screens from '../constants/Screens';
import Colors from '../theme/Colors';
import Metrics from '../theme/Metrics';

const Stack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();

// Add a fallback component in case screens fail to load
const FallbackScreen = () => (
  <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
    <Text>Loading...</Text>
  </View>
);

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
        component={HomeScreen || FallbackScreen}
        options={{
          tabBarLabel: 'Home',
          tabBarIcon: ({ color }) => (
            <Feather name="home" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name={Screens.PROJECT}
        component={ProjectScreen || FallbackScreen}
        options={{
          tabBarLabel: 'Projects',
          tabBarIcon: ({ color }) => (
            <Feather name="folder" size={24} color={color} />
          )
        }}
      />
      <Tab.Screen
        name={Screens.PROFILE}
        component={ProfileScreen || FallbackScreen}
        options={{
          tabBarLabel: 'Profile',
          tabBarIcon: ({ color }) => (
            <Feather name="user" size={24} color={color} />
          )
        }}
      />
    </Tab.Navigator>
  );
};

const AppNavigator = () => {
  return (
    <NavigationContainer>
      <Stack.Navigator
        initialRouteName="MainTabs"
        screenOptions={{
          headerShown: false,
          contentStyle: { backgroundColor: Colors.background.light },
        }}
      >
        <Stack.Screen name="MainTabs" component={MainTabs} />
        <Stack.Screen name={Screens.TASK} component={TaskScreen || FallbackScreen} />
        <Stack.Screen name={Screens.SETTINGS} component={SettingsScreen || FallbackScreen} />
      </Stack.Navigator>
    </NavigationContainer>
  );
};

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
});

export default AppNavigator;