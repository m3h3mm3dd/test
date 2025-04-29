import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import AppNavigator from './src/navigation/AppNavigator';
import { StatusBar } from 'react-native';
import Colors from './src/theme/Colors';
import * as Haptics from 'expo-haptics';

export default function App() {
  React.useEffect(() => {
    // App initialization effect
    const initApp = async () => {
      try {
        // Initialize haptics when app starts
        await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
      } catch (error) {
        console.log('Error initializing app:', error);
      }
    };

    initApp();
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <StatusBar barStyle="dark-content" backgroundColor={Colors.background.light} />
        <AppNavigator />
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}