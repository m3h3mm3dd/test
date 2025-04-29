import React from 'react';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ThemeContext } from './src/Contexts/ThemeContext';
import { AuthContext } from './src/Contexts/AuthContext';
import { NotificationContext } from './src/Contexts/NotificationContext';
import { darkTheme } from './src/theme/Theme';

// Create a simple placeholder while we build out the app
export default function App() {
  const [isDarkMode, setIsDarkMode] = React.useState(true);
  const [userToken, setUserToken] = React.useState(null);
  const [user, setUser] = React.useState(null);
  
  const authContext = {
    signIn: async () => {},
    signUp: async () => {},
    signOut: async () => {},
    user: null,
    isLoading: false
  };
  
  const themeContext = {
    isDarkMode: true,
    theme: darkTheme,
    toggleTheme: async () => {}
  };
  
  const notificationContext = {
    hasNotifications: false,
    unreadNotifications: 0,
    markAllAsRead: async () => {},
    refreshNotifications: async () => {}
  };

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthContext.Provider value={authContext}>
          <ThemeContext.Provider value={themeContext}>
            <NotificationContext.Provider value={notificationContext}>
              <NavigationContainer>
                {/* Start with just the Login screen */}
                <LoginScreenPlaceholder />
              </NavigationContainer>
            </NotificationContext.Provider>
          </ThemeContext.Provider>
        </AuthContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}

// A placeholder login screen component
const LoginScreenPlaceholder = () => {
  return (
    <View style={{
      flex: 1, 
      alignItems: 'center', 
      justifyContent: 'center',
      backgroundColor: '#121212'
    }}>
      <Text style={{
        fontSize: 24,
        fontWeight: 'bold',
        color: 'white',
        marginBottom: 20
      }}>
        TaskUp Mobile
      </Text>
      <Text style={{color: 'white'}}>
        Your project management app
      </Text>
    </View>
  );
};

// Add View and Text imports at the top
import { View, Text } from 'react-native';