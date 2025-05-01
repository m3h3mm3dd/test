
import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/useColorScheme';
import { motion } from 'framer-motion';

// Import screens
import OnboardingScreen from '@/screens/auth/OnboardingScreen';
import LoginScreen from '@/screens/auth/LoginScreen';
import SignUpStep1 from '@/screens/auth/SignUpStep1_Email';
import SignUpStep2 from '@/screens/auth/SignUpStep2_OTP';
import SignUpStep3 from '@/screens/auth/SignUpStep3_Profile';
import ForgotPasswordScreen from '@/screens/auth/ForgotPassword';

// Import constants
import Screens from '@/constants/Screens';

// Define navigator types
export type AuthStackParamList = {
  [Screens.ONBOARDING]: undefined;
  [Screens.LOGIN]: undefined;
  'SignUpStep1': undefined;
  'SignUpStep2': { email: string };
  'SignUpStep3': { email: string, verificationCode: string };
  [Screens.FORGOT_PASSWORD]: undefined;
};

// Stack navigator
const Stack = createNativeStackNavigator<AuthStackParamList>();

/**
 * Authentication stack navigator with smooth transitions
 * Handles all authentication-related screens
 */
const AuthStack = () => {
  const { colors } = useTheme();
  
  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Stack.Navigator
        initialRouteName={Screens.ONBOARDING}
        screenOptions={{
          headerShown: false,
          animation: 'slide_from_right',
          gestureEnabled: true,
          contentStyle: {
            backgroundColor: colors.background.light
          },
          animationDuration: 250,
        }}
      >
        <Stack.Screen name={Screens.ONBOARDING} component={OnboardingScreen} />
        <Stack.Screen name={Screens.LOGIN} component={LoginScreen} />
        <Stack.Screen name="SignUpStep1" component={SignUpStep1} />
        <Stack.Screen name="SignUpStep2" component={SignUpStep2} />
        <Stack.Screen name="SignUpStep3" component={SignUpStep3} />
        <Stack.Screen name={Screens.FORGOT_PASSWORD} component={ForgotPasswordScreen} />
      </Stack.Navigator>
    </motion.div>
  );
};

export default AuthStack;