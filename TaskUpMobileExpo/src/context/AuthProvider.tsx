import React, { createContext, useState, useEffect, useContext } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as Haptics from 'expo-haptics';

import ApiService from '../api/ApiService';
import { Storage } from '../constants';
import { triggerNotification, triggerResult } from '../utils/HapticUtils';

// Auth context type
interface AuthContextType {
  isLoading: boolean;
  userToken: string | null;
  user: any;
  signIn: (email: string, password: string) => Promise<{ success: boolean, error?: string }>;
  signUp: (userData: any) => Promise<{ success: boolean, data?: any, error?: string }>;
  signOut: () => Promise<void>;
  updateUser: (userData: any) => Promise<boolean>;
}

// Create the context
const AuthContext = createContext<AuthContextType>({
  isLoading: true,
  userToken: null,
  user: null,
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  updateUser: async () => false
});

// Auth provider component
export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [userToken, setUserToken] = useState<string | null>(null);
  const [user, setUser] = useState<any>(null);
  
  // Initialize auth state from storage
  useEffect(() => {
    const bootstrapAsync = async () => {
      try {
        // Load token and user data from storage
        const token = await AsyncStorage.getItem(Storage.AUTH_TOKEN);
        const userData = await AsyncStorage.getItem(Storage.USER_DATA);
        
        if (token && userData) {
          setUserToken(token);
          setUser(JSON.parse(userData));
        }
      } catch (error) {
        console.error('Error loading auth data:', error);
      } finally {
        // Artificial delay for splash screen
        setTimeout(() => {
          setIsLoading(false);
        }, 500);
      }
    };
    
    bootstrapAsync();
  }, []);
  
  // Sign in function
  const signIn = async (email: string, password: string) => {
    try {
      setIsLoading(true);
      const response = await ApiService.login(email, password);
      
      // Save token and user data
      await AsyncStorage.setItem(Storage.AUTH_TOKEN, response.token);
      await AsyncStorage.setItem(Storage.USER_DATA, JSON.stringify(response.user));
      
      setUserToken(response.token);
      setUser(response.user);
      
      // Success haptic feedback
      triggerNotification(Haptics.NotificationFeedbackType.Success);
      
      return { success: true };
    } catch (error) {
      console.error('Login error:', error);
      
      // Error haptic feedback
      triggerNotification(Haptics.NotificationFeedbackType.Error);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Login failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign up function
  const signUp = async (userData: any) => {
    try {
      setIsLoading(true);
      const { name, email, phone, password } = userData;
      
      const response = await ApiService.register(name, email, phone, password);
      
      // Save token and user data
      await AsyncStorage.setItem(Storage.AUTH_TOKEN, response.token);
      await AsyncStorage.setItem(Storage.USER_DATA, JSON.stringify(response.user));
      
      setUserToken(response.token);
      setUser(response.user);
      
      // Success haptic feedback
      triggerResult(true);
      
      return { success: true, data: response.user };
    } catch (error) {
      console.error('Registration error:', error);
      
      // Error haptic feedback
      triggerResult(false);
      
      return { 
        success: false, 
        error: error instanceof Error ? error.message : 'Registration failed' 
      };
    } finally {
      setIsLoading(false);
    }
  };
  
  // Sign out function
  const signOut = async () => {
    try {
      setIsLoading(true);
      
      // Clear storage
      await AsyncStorage.removeItem(Storage.AUTH_TOKEN);
      await AsyncStorage.removeItem(Storage.USER_DATA);
      
      setUserToken(null);
      setUser(null);
      
      // Light haptic feedback
      triggerImpact(Haptics.ImpactFeedbackStyle.Light);
    } catch (error) {
      console.error('Sign out error:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Update user data
  const updateUser = async (userData: any) => {
    try {
      // Update in storage
      const currentUser = { ...user, ...userData };
      await AsyncStorage.setItem(Storage.USER_DATA, JSON.stringify(currentUser));
      
      setUser(currentUser);
      return true;
    } catch (error) {
      console.error('Update user error:', error);
      return false;
    }
  };
  
  return (
    <AuthContext.Provider value={{
      isLoading,
      userToken,
      user,
      signIn,
      signUp,
      signOut,
      updateUser
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export default AuthContext;