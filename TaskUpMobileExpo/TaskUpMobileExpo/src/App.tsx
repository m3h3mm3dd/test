import React, { useEffect, useState, Suspense } from 'react';
import { StatusBar, LogBox, Platform } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import * as SplashScreen from 'expo-splash-screen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { enableScreens } from 'react-native-screens';
import * as NavigationBar from 'expo-navigation-bar';

import AnimatedSplash from './components/AnimatedSplash';
import AppNavigator from './navigation/AppNavigator';
import { ThemeProvider } from './theme/ThemeProvider';
import { AuthProvider } from './context/AuthProvider';
import { NotificationProvider } from './context/NotificationProvider';
import Colors from './theme/Colors';
import { triggerImpact } from './utils/HapticUtils';

// Enable native screens for better performance
enableScreens(true);

// Keep splash screen visible while loading app
SplashScreen.preventAutoHideAsync();

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
  'Failed prop type',
  'Non-serializable values were found in the navigation state',
  'Animated: `useNativeDriver`'
]);

const App = () => {
  const [isReady, setIsReady] = useState(false);
  const [showAnimatedSplash, setShowAnimatedSplash] = useState(true);

  useEffect(() => {
    // Setup Android navigation bar (bottom bar)
    if (Platform.OS === 'android') {
      NavigationBar.setBackgroundColorAsync(Colors.background.light);
      NavigationBar.setButtonStyleAsync('dark');
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
        
        // Set app as ready, then show animated splash
        await SplashScreen.hideAsync();
        setIsReady(true);
        
        // Hide animated splash after animation completes
        setTimeout(() => {
          setShowAnimatedSplash(false);
        }, 2000);
      } catch (error) {
        console.log('Error initializing app:', error);
        await SplashScreen.hideAsync();
        setIsReady(true);
        setShowAnimatedSplash(false);
      }
    };

    initApp();
  }, []);

  return (
    <ThemeProvider>
      <SafeAreaProvider>
        <AuthProvider>
          <NotificationProvider>
            <GestureHandlerRootView style={{ flex: 1 }}>
              <StatusBar 
                barStyle="dark-content" 
                backgroundColor="transparent" 
                translucent 
              />
              
              {showAnimatedSplash && isReady ? (
                <AnimatedSplash onAnimationComplete={() => setShowAnimatedSplash(false)} />
              ) : (
                isReady && <AppNavigator />
              )}
            </GestureHandlerRootView>
          </NotificationProvider>
        </AuthProvider>
      </SafeAreaProvider>
    </ThemeProvider>
  );
};

export default App;