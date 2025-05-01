// App.js
import React, { useEffect, useState } from 'react';
import { LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import * as NavigationBar from 'expo-navigation-bar';

// Import components
import AppNavigator from './src/navigation/AppNavigator';
import AnimatedSplash from './src/components/AnimatedSplash';
import { ThemeProvider } from './src/theme/ThemeProvider';
import { AuthProvider } from './src/context/AuthProvider';
import { NotificationProvider } from './src/context/NotificationProvider';
import Colors from './src/theme/Colors';
import { triggerImpact } from './src/utils/HapticUtils';

// Enable native screens for better performance
enableScreens(true);

// Keep splash screen visible while loading app
SplashScreen.preventAutoHideAsync()
  .catch(error => {
    console.warn('Error preventing splash screen from hiding:', error);
  });

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Failed prop type',
  'Non-serializable values were found in the navigation state',
  'Animated: `useNativeDriver`',
  'In React 18, SSRProvider is not necessary',
  '"shadow*" style props are deprecated',
  '"textShadow*" style props are deprecated'
]);

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [showSplash, setShowSplash] = useState(true);

  useEffect(() => {
    // Setup Android navigation bar (bottom bar)
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(Colors.background.light)
        .catch(error => console.log('NavigationBar error:', error));
        
      NavigationBar.setButtonStyleAsync('dark')
        .catch(error => console.log('NavigationBar error:', error));
    }
    
    // App initialization
    const initApp = async () => {
      try {
        // Prepare assets, make API calls, etc.
        await Promise.all([
          // Initialize haptics with gentle feedback to indicate app is loading
          Platform.OS !== 'web' && triggerImpact(Haptics.ImpactFeedbackStyle.Light),
          
          // Artificially delay for demonstration
          new Promise(resolve => setTimeout(resolve, 500))
        ]);
        
        // Set app as ready and hide system splash screen
        await SplashScreen.hideAsync();
        setIsReady(true);
      } catch (error) {
        console.log('Error initializing app:', error);
        await SplashScreen.hideAsync();
        setIsReady(true);
      }
    };

    initApp();
  }, []);

  // Handle our custom splash screen completion
  const handleSplashComplete = () => {
    setShowSplash(false);
  };

  return (
    <SafeAreaProvider>
      <ThemeProvider>
        <AuthProvider>
          <NotificationProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              {!isReady ? null : (
                showSplash ? (
                  <AnimatedSplash onAnimationComplete={handleSplashComplete} />
                ) : (
                  <AppNavigator />
                )
              )}
            </GestureHandlerRootView>
          </NotificationProvider>
        </AuthProvider>
      </ThemeProvider>
    </SafeAreaProvider>
  );
};

export default App;