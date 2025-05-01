import React from 'react';
import { Stack } from 'expo-router';
import { SafeAreaProvider } from 'react-native-safe-area-context';

export default function Layout() {
  return (
    <SafeAreaProvider>
      <Stack
        screenOptions={{
          headerStyle: {
            backgroundColor: '#fff',
          },
          headerTintColor: '#3D5AFE',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      />
    </SafeAreaProvider>
  );
}