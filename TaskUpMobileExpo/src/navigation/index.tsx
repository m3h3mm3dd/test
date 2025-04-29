import React, { useState, useEffect } from 'react'
import { View, ActivityIndicator, StatusBar } from 'react-native'
import { NavigationContainer } from '@react-navigation/native'
import { createNativeStackNavigator } from '@react-navigation/native-stack'
import { SafeAreaProvider } from 'react-native-safe-area-context'

// Import navigation stacks
import AuthStack from './AuthStack'
import MainTabs from './MainTabs'

// Import screens
import TaskDetailsScreen from '../screens/TaskDetailsScreen'
import SettingsScreen from '../screens/SettingsScreen'
import SplashScreen from '../screens/SplashScreen'
import OfflineNotice from '../screens/OfflineNotice'

// Import hooks & context
import { useNetworkStatus } from '../hooks/useNetworkStatus'

// Import types
import Colors from '../theme/Colors'

// Root stack navigator
const Stack = createNativeStackNavigator()

/**
 * Root Navigation Container
 * Handles authentication state and main/auth navigation flow
 */
const Navigation = () => {
  // App state
  const [isLoading, setIsLoading] = useState(true)
  const [userToken, setUserToken] = useState<string | null>(null)
  
  // Network state
  const { isConnected } = useNetworkStatus()
  
  // Simulating checking auth state
  useEffect(() => {
    // Simulate loading auth state
    const checkAuthState = async () => {
      try {
        // Simulate async operation
        await new Promise(resolve => setTimeout(resolve, 2000))
        
        // For demo, we'll start with no auth token
        setUserToken(null)
      } catch (error) {
        console.error('Error checking auth state:', error)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuthState()
  }, [])
  
  // Provide auth context functions
  const authContext = {
    signIn: async () => {
      // Simulate API call
      setUserToken('sample-token')
    },
    signOut: () => {
      setUserToken(null)
    },
    signUp: async () => {
      // Simulate API call
      setUserToken('sample-token')
    }
  }
  
  // Show loading screen while checking auth state
  if (isLoading) {
    return <SplashScreen />
  }
  
  return (
    <SafeAreaProvider>
      <NavigationContainer>
        <StatusBar
          barStyle="dark-content"
          backgroundColor={Colors.background.light}
        />
        
        {/* Offline notice banner */}
        {!isConnected && <OfflineNotice />}
        
        <Stack.Navigator screenOptions={{ headerShown: false }}>
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
                name="MainTabs" 
                component={MainTabs} 
                options={{ animation: 'fade' }}
              />
              <Stack.Screen 
                name="TaskDetails" 
                component={TaskDetailsScreen}
                options={{ 
                  animation: 'slide_from_right',
                  presentation: 'card'
                }}
              />
              <Stack.Screen 
                name="Settings" 
                component={SettingsScreen}
                options={{ 
                  animation: 'slide_from_right',
                  presentation: 'card'
                }}
              />
            </>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </SafeAreaProvider>
  )
}

export default Navigation