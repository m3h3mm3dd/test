import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { ProfileScreen } from '../Screens/Profile/ProfileScreen';
import { EditProfileScreen } from '../Screens/Profile/EditProfileScreen';
import { NotificationsScreen } from '../Screens/Dashboard/NotificationsScreen';
import { SettingsScreen } from '../Screens/Settings/SettingsScreen';
import { AppearanceScreen } from '../Screens/Settings/AppearanceScreen';
import { NotificationSettingsScreen } from '../Screens/Settings/NotificationSettingsScreen';
import { SecuritySettingsScreen } from '../Screens/Settings/SecuritySettingsScreen';
import { AccountScreen } from '../Screens/Settings/AccountScreen';
import { useTheme } from '../Hooks/UseTheme';

const Stack = createStackNavigator();

export const ProfileNavigator = () => {
  const { theme } = useTheme();

  return (
    <Stack.Navigator
      screenOptions={{
        headerStyle: {
          backgroundColor: theme.colors.background,
          elevation: 0,
          shadowOpacity: 0,
        },
        headerTintColor: theme.colors.text,
        headerTitleStyle: {
          fontFamily: theme.fonts.medium,
          fontSize: 18,
        },
        headerBackTitleVisible: false,
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen
        name="ProfileMain"
        component={ProfileScreen}
        options={{
          title: 'Profile',
        }}
      />
      <Stack.Screen
        name="EditProfile"
        component={EditProfileScreen}
        options={{
          title: 'Edit Profile',
        }}
      />
      <Stack.Screen
        name="Notifications"
        component={NotificationsScreen}
        options={{
          title: 'Notifications',
        }}
      />
      <Stack.Screen
        name="Settings"
        component={SettingsScreen}
        options={{
          title: 'Settings',
        }}
      />
      <Stack.Screen
        name="AppearanceSettings"
        component={AppearanceScreen}
        options={{
          title: 'Appearance',
        }}
      />
      <Stack.Screen
        name="NotificationSettings"
        component={NotificationSettingsScreen}
        options={{
          title: 'Notification Settings',
        }}
      />
      <Stack.Screen
        name="SecuritySettings"
        component={SecuritySettingsScreen}
        options={{
          title: 'Security',
        }}
      />
      <Stack.Screen
        name="AccountSettings"
        component={AccountScreen}
        options={{
          title: 'Account',
        }}
      />
    </Stack.Navigator>
  );
};