import React from 'react'
import { createNativeStackNavigator } from '@react-navigation/native-stack'

// Import screens
import LoginScreen from '../screens/auth/LoginScreen'
import SignUpStep1 from '../screens/auth/SignUpStep1_Email'
import SignUpStep2 from '../screens/auth/SignUpStep2_OTP'
import SignUpStep3 from '../screens/auth/SignUpStep3_Profile'
import ForgotPassword from '../screens/auth/ForgotPassword'

// Stack navigator
const Stack = createNativeStackNavigator()

/**
 * Authentication stack navigator
 * Handles all authentication-related screens
 */
const AuthStack = () => {
  return (
    <Stack.Navigator
      initialRouteName="Login"
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
        gestureEnabled: true,
        contentStyle: {
          backgroundColor: 'transparent'
        }
      }}
    >
      <Stack.Screen name="Login" component={LoginScreen} />
      <Stack.Screen name="SignUpStep1" component={SignUpStep1} />
      <Stack.Screen name="SignUpStep2" component={SignUpStep2} />
      <Stack.Screen name="SignUpStep3" component={SignUpStep3} />
      <Stack.Screen name="ForgotPassword" component={ForgotPassword} />
    </Stack.Navigator>
  )
}

export default AuthStack