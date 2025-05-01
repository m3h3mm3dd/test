// App.js
import React, { useEffect, useState } from 'react';
import { LogBox, StatusBar } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import { SafeAreaProvider } from 'react-native-safe-area-context';

// Import root navigator
import AppNavigator from './src/navigation/AppNavigator';
import Colors from './src/theme/Colors';
import SplashScreen from './src/screens/SplashScreen';
import { triggerImpact } from './src/utils/HapticUtils';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

export default function App() {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    // App initialization
    const initApp = async () => {
      try {
        // Initialize haptics
        await triggerImpact(Haptics.ImpactFeedbackStyle.Light);
        
        // Simulate loading time for splash screen
        setTimeout(() => {
          setIsReady(true);
        }, 2000);
      } catch (error) {
        console.log('Error initializing app:', error);
        setIsReady(true);
      }
    };

    initApp();
  }, []);

  // Show splash screen while loading
  if (!isReady) {
    return <SplashScreen />;
  }

  return (
    <SafeAreaProvider>
      <GestureHandlerRootView style={{ flex: 1 }}>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
        <AppNavigator />
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
}