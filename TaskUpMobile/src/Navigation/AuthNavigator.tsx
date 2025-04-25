import React from 'react';
import { createStackNavigator } from '@react-navigation/stack';
import { LoginScreen } from '../Screens/Auth/LoginScreen';
import { SignUpScreen } from '../Screens/Auth/SignUpScreen';
import { ForgotPasswordScreen } from '../Screens/Auth/ForgotPasswordScreen';
import { OTPVerificationScreen } from '../Screens/Auth/OTPVerificationScreen';
import { useTheme } from '../Hooks/UseTheme';

const Stack = createStackNavigator();

export const AuthNavigator = () => {
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
        cardStyle: { backgroundColor: theme.colors.background },
      }}
    >
      <Stack.Screen 
        name="Login" 
        component={LoginScreen} 
        options={{ headerShown: false }}
      />
      <Stack.Screen 
        name="SignUp" 
        component={SignUpScreen} 
        options={{ 
          title: 'Create Account',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="ForgotPassword" 
        component={ForgotPasswordScreen} 
        options={{ 
          title: 'Reset Password',
          headerBackTitleVisible: false,
        }}
      />
      <Stack.Screen 
        name="OTPVerification" 
        component={OTPVerificationScreen} 
        options={{ 
          title: 'Verify Code',
          headerBackTitleVisible: false,
        }}
      />
    </Stack.Navigator>
  );
};