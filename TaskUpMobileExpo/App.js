// App.js
import React, { useEffect, useState } from 'react';
import { View, Text, StyleSheet, Platform } from 'react-native';
import { StatusBar } from 'expo-status-bar';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import * as Haptics from 'expo-haptics';
import Colors from './src/theme/Colors';

// Import your app's main navigator directly
import AppNavigator from './src/navigation/AppNavigator';

export default function App() {
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    // App initialization effect
    const initApp = async () => {
      try {
        // Only use haptics on native platforms
        if (Platform.OS !== 'web') {
          await Haptics.impactAsync(Haptics.ImpactFeedbackStyle.Light);
        }
        setIsLoading(false);
      } catch (error) {
        console.log('Error initializing app:', error);
        setError(error);
        setIsLoading(false);
      }
    };

    initApp();
  }, []);

  // Show loading screen
  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.text}>Loading TaskUp...</Text>
      </View>
    );
  }

  // Show error screen if there was an error
  if (error) {
    return (
      <View style={styles.container}>
        <Text style={styles.errorText}>Something went wrong</Text>
        <Text style={styles.errorDetail}>{error.message}</Text>
      </View>
    );
  }

  // Normal app rendering
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <StatusBar style="dark" />
      <AppNavigator />
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: Colors.background.light,
    padding: 20
  },
  text: {
    fontSize: 18,
    color: Colors.neutrals.gray800
  },
  errorText: {
    fontSize: 20,
    color: Colors.error,
    fontWeight: 'bold',
    marginBottom: 10
  },
  errorDetail: {
    fontSize: 16,
    color: Colors.neutrals.gray700,
    textAlign: 'center'
  }
});