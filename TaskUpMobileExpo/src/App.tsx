import React, { useEffect, useState } from 'react';
import { StatusBar, LogBox } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import * as Haptics from 'expo-haptics';
import { SafeAreaProvider } from 'react-native-safe-area-context';

import AppNavigator from './navigation/AppNavigator';
import Colors from './theme/Colors';
import SplashScreen from './screens/SplashScreen';
import { triggerImpact } from './utils/HapticUtils';

// Ignore specific warnings
LogBox.ignoreLogs([
  'ViewPropTypes will be removed',
  'ColorPropType will be removed',
]);

const App = () => {
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
        <NavigationContainer>
          <AppNavigator />
        </NavigationContainer>
      </GestureHandlerRootView>
    </SafeAreaProvider>
  );
};

export default App;