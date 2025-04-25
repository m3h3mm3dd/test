import React, { useEffect, useState } from 'react';
import { StatusBar } from 'react-native';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import SplashScreen from 'react-native-splash-screen';
import { AuthContext } from './src/Contexts/AuthContext';
import { ThemeContext } from './src/Contexts/ThemeContext';
import { NotificationContext } from './src/Contexts/NotificationContext';
import { AppNavigator } from './src/Navigation/AppNavigator';
import { Theme, darkTheme, lightTheme } from './src/Theme/Theme';
import { StorageUtils } from './src/Utils/StorageUtils';
import { ApiService } from './src/Services/ApiService';
import Toast from 'react-native-toast-message';

const App = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState(null);
  const [isDarkMode, setIsDarkMode] = useState(true);
  const [theme, setTheme] = useState<Theme>(darkTheme);
  const [hasNotifications, setHasNotifications] = useState(false);
  const [unreadNotifications, setUnreadNotifications] = useState(0);

  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        const token = await StorageUtils.getToken();
        
        if (token) {
          const userInfo = await ApiService.getUserInfo();
          setUser(userInfo);
          setUserToken(token);
          
          const storedThemeMode = await StorageUtils.getThemeMode();
          if (storedThemeMode) {
            setIsDarkMode(storedThemeMode === 'dark');
          }
          
          const notificationCount = await ApiService.getUnreadNotificationsCount();
          setUnreadNotifications(notificationCount);
          setHasNotifications(notificationCount > 0);
        }
      } catch (error) {
        console.log('Error retrieving auth state', error);
      } finally {
        setIsLoading(false);
        SplashScreen.hide();
      }
    };

    bootstrapAsync();
  }, []);

  useEffect(() => {
    setTheme(isDarkMode ? darkTheme : lightTheme);
  }, [isDarkMode]);

  const authContext = {
    signIn: async (email: string, password: string) => {
      try {
        const response = await ApiService.login(email, password);
        const { token, user: userData } = response;
        
        await StorageUtils.setToken(token);
        setUserToken(token);
        setUser(userData);
        
        return { success: true };
      } catch (error) {
        return { 
          success: false, 
          error: error.message || 'Failed to login' 
        };
      }
    },
    signUp: async (userData: any) => {
      try {
        const response = await ApiService.register(userData);
        return { success: true, data: response };
      } catch (error) {
        return { 
          success: false, 
          error: error.message || 'Failed to register' 
        };
      }
    },
    signOut: async () => {
      try {
        await ApiService.logout();
        await StorageUtils.removeToken();
        setUserToken(null);
        setUser(null);
      } catch (error) {
        console.log('Error signing out', error);
        await StorageUtils.removeToken();
        setUserToken(null);
        setUser(null);
      }
    },
    user,
    isLoading
  };

  const themeContext = {
    isDarkMode,
    theme,
    toggleTheme: async () => {
      const newMode = !isDarkMode;
      setIsDarkMode(newMode);
      await StorageUtils.setThemeMode(newMode ? 'dark' : 'light');
    }
  };

  const notificationContext = {
    hasNotifications,
    unreadNotifications,
    markAllAsRead: async () => {
      try {
        await ApiService.markAllNotificationsAsRead();
        setUnreadNotifications(0);
        setHasNotifications(false);
      } catch (error) {
        console.log('Error marking notifications as read', error);
      }
    },
    refreshNotifications: async () => {
      try {
        const count = await ApiService.getUnreadNotificationsCount();
        setUnreadNotifications(count);
        setHasNotifications(count > 0);
      } catch (error) {
        console.log('Error refreshing notifications', error);
      }
    }
  };

  if (isLoading) {
    return null;
  }

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <AuthContext.Provider value={authContext}>
          <ThemeContext.Provider value={themeContext}>
            <NotificationContext.Provider value={notificationContext}>
              <StatusBar
                barStyle={isDarkMode ? 'light-content' : 'dark-content'}
                backgroundColor={theme.colors.background}
              />
              <NavigationContainer theme={{
                dark: isDarkMode,
                colors: {
                  primary: theme.colors.primary,
                  background: theme.colors.background,
                  card: theme.colors.card,
                  text: theme.colors.text,
                  border: theme.colors.border,
                  notification: theme.colors.notification,
                }
              }}>
                <AppNavigator />
              </NavigationContainer>
              <Toast />
            </NotificationContext.Provider>
          </ThemeContext.Provider>
        </AuthContext.Provider>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
};

export default App;