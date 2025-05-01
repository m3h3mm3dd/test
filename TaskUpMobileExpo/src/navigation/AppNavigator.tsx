import React, { useEffect } from 'react';
import { Platform, StatusBar } from 'react-native';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import Animated, { 
  useSharedValue, 
  useAnimatedStyle, 
  withTiming,
  withSequence 
} from 'react-native-reanimated';

// Import screens
import TaskDetailsScreen from '../screens/TaskDetailsScreen';
import SettingsScreen from '../screens/SettingsScreen';
import OfflineNotice from '../components/OfflineNotice';

// Import navigation stacks and tabs
import AuthStack from './AuthStack';
import MainTabs from './MainTabs';

// Import hooks, context, and types
import { useNetworkStatus } from '../hooks/useNetworkStatus';
import { useAuth } from '../context/AuthProvider';
import { useTheme } from '../hooks/useColorScheme';
import Screens from '../constants/Screens';

// Define navigator types
export type RootStackParamList = {
  [Screens.MAIN_TABS]: undefined;
  [Screens.TASK_DETAILS]: { taskId: string };
  [Screens.SETTINGS]: undefined;
  Auth: undefined;
};

// Create stack navigator
const Stack = createNativeStackNavigator<RootStackParamList>();

/**
 * Root Navigation Container
 * Handles authentication state and main/auth navigation flow
 */
const AppNavigator = () => {
  const { colors } = useTheme();
  
  // Use the modified useNetworkStatus hook that doesn't use setOfflineMode
  const { isConnected } = useNetworkStatus();
  const { isLoading, userToken } = useAuth();
  
  // Animation for smooth transitions
  const navigationOpacity = useSharedValue(0);
  
  useEffect(() => {
    // Animate in the navigator
    navigationOpacity.value = withSequence(
      withTiming(0, { duration: 100 }),
      withTiming(1, { duration: 400 })
    );
    
    // Update status bar based on theme
    StatusBar.setBarStyle('dark-content');
    if (Platform.OS === 'android') {
      StatusBar.setBackgroundColor('transparent');
      StatusBar.setTranslucent(true);
    }
  }, []);
  
  const containerStyle = useAnimatedStyle(() => {
    return {
      flex: 1,
      opacity: navigationOpacity.value
    };
  });

  // Don't render anything while loading
  if (isLoading) {
    return null;
  }
  
  return (
    <Animated.View style={containerStyle}>
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
            animationDuration: 300,
            fullScreenGestureEnabled: true,
          }}
        >
          {userToken == null ? (
            // Auth screens - default to Auth stack when not logged in
            <Stack.Screen 
              name="Auth" 
              component={AuthStack} 
              options={{ animation: 'fade' }}
            />
          ) : (
            // Main app screens - when logged in
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
    </Animated.View>
  );
};

export default AppNavigator;