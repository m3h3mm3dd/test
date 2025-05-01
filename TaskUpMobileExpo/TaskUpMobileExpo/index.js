import { registerRootComponent } from 'expo';
import { enableScreens } from 'react-native-screens';
import App from './App';

// Enable screens for better performance with react-navigation
enableScreens();

// Register the root component
registerRootComponent(App);