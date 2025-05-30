import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';
import { Platform } from 'react-native';
import App from './App';

// Enable screens for better performance with react-navigation
enableScreens();

// Add polyfill for web platform if needed
if (Platform.OS === 'web') {
  // Add any web-specific polyfills here
}

// Register the root component
registerRootComponent(App);