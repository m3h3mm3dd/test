
import React from 'react';
import { Platform } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { useTheme } from '@/hooks/useColorScheme';
import { Box, Spinner, Center, Text } from '@chakra-ui/react';
import { motion } from 'framer-motion';

// Import screens
import TaskDetailsScreen from '@/screens/TaskDetailsScreen';
import SettingsScreen from '@/screens/SettingsScreen';
import OfflineNotice from '@/screens/OfflineNotice';
import SplashScreen from '@/screens/SplashScreen';

// Import navigation stacks and tabs
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Import hooks, context, and types
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAuth } from '@/context/AuthContext';
import Screens from '@/constants/Screens';

// Define navigator types
export type RootStackParamList = {
  [Screens.MAIN_TABS]: undefined;
  [Screens.TASK_DETAILS]: { taskId: string };
  [Screens.SETTINGS]: undefined;
  Auth: undefined;
};

// Create stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

// Loading component with animation
const LoadingScreen = () => (
  <Center flex={1} bg="background.light">
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
    >
      <Box alignItems="center">
        <Spinner size="xl" color="primary.500" mb={4} />
        <Text color="text.secondary" fontSize="md">Loading...</Text>
      </Box>
    </motion.div>
  </Center>
);

/**
 * Root Navigation Container
 * Handles authentication state and main/auth navigation flow
 */
const AppNavigator = () => {
  const { colors } = useTheme();
  const { isConnected } = useNetworkStatus();
  const { isLoading, userToken } = useAuth();
  
  // Show loading screen while checking auth state
  if (isLoading) {
    return <SplashScreen />;
  }
  
  return (
    <NavigationContainer
      theme={{
        dark: false,
        colors: {
          primary: colors.primary[500],
          background: colors.background.light,
          card: colors.background.light,
          text: colors.text.primary,
          border: colors.neutrals[200],
          notification: colors.error[500],
        },
      }}
    >
      {/* Offline notice banner */}
      {!isConnected && <OfflineNotice />}
      
      <Stack.Navigator 
        screenOptions={{
          headerShown: false,
          contentStyle: {
            backgroundColor: colors.background.light
          },
          animation: Platform.OS === 'ios' ? 'default' : 'fade_from_bottom',
          animationDuration: 250,
        }}
      >
        {userToken == null ? (
          // Auth screens
          <Stack.Screen 
            name="Auth" 
            component={AuthStack} 
            options={{ animation: 'fade' }}
          />
        ) : (
          // Main app screens
          <>
            <Stack.Screen 
              name={Screens.MAIN_TABS} 
              component={MainTabs} 
              options={{ animation: 'fade' }}
            />
            <Stack.Screen 
              name={Screens.TASK_DETAILS} 
              component={TaskDetailsScreen}
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
                contentStyle: {
                  backgroundColor: colors.background.paper
                }
              }}
            />
            <Stack.Screen 
              name={Screens.SETTINGS} 
              component={SettingsScreen}
              options={{
                animation: 'slide_from_right',
                presentation: 'card',
                contentStyle: {
                  backgroundColor: colors.background.paper
                }
              }}
            />
          </>
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
};

export default AppNavigator;