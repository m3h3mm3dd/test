import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';
import * as Haptics from 'expo-haptics';
import { triggerNotification } from '../utils/HapticUtils';

interface NetworkStatusOptions {
  onConnected?: () => void;
  onDisconnected?: () => void;
  enableHapticFeedback?: boolean;
}

interface NetworkStatusHook {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  checkConnection: () => Promise<NetInfoState>;
  isConnecting: boolean;
  lastUpdated: Date | null;
  isOfflineMode: boolean;
}

/**
 * Enhanced hook to monitor network connectivity status with callbacks and haptic feedback
 */
export const useNetworkStatus = (options?: NetworkStatusOptions): NetworkStatusHook => {
  // Network state
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  const [isOfflineMode, setIsOfflineMode] = useState<boolean>(false);
  
  const enableHapticFeedback = options?.enableHapticFeedback !== false;
  
  // Update connection status from NetInfo state
  const updateConnectionStatus = useCallback((state: NetInfoState) => {
    const wasConnected = isConnected;
    const nowConnected = !!state.isConnected && !isOfflineMode;
    
    setIsConnected(nowConnected);
    setIsInternetReachable(state.isInternetReachable !== false && !isOfflineMode);
    setConnectionType(state.type);
    setLastUpdated(new Date());
    
    // Fire callbacks and haptic feedback for connection changes
    if (!wasConnected && nowConnected) {
      if (enableHapticFeedback && Platform.OS !== 'web') {
        triggerNotification(Haptics.NotificationFeedbackType.Success);
      }
      options?.onConnected?.();
    } else if (wasConnected && !nowConnected) {
      if (enableHapticFeedback && Platform.OS !== 'web') {
        triggerNotification(Haptics.NotificationFeedbackType.Warning);
      }
      options?.onDisconnected?.();
    }
    
    setIsConnecting(false);
  }, [isConnected, options, enableHapticFeedback, isOfflineMode]);
  
  // Function to manually check connection status
  const checkConnection = useCallback(async (): Promise<NetInfoState> => {
    try {
      setIsConnecting(true);
      
      // Handle web platform differently
      if (Platform.OS === 'web') {
        const state = { isConnected: navigator.onLine, isInternetReachable: navigator.onLine, type: 'unknown' };
        updateConnectionStatus(state as NetInfoState);
        return state as NetInfoState;
      }
      
      const state = await NetInfo.fetch();
      updateConnectionStatus(state);
      return state;
    } catch (error) {
      console.error('Error checking network status:', error);
      // In case of error, assume disconnected
      setIsConnected(false);
      setIsInternetReachable(false);
      setIsConnecting(false);
      options?.onDisconnected?.();
      throw error;
    }
  }, [updateConnectionStatus, options]);
  
  // Handle offline mode changes
  useEffect(() => {
    if (isOfflineMode) {
      setIsConnected(false);
      setIsInternetReachable(false);
      if (enableHapticFeedback && Platform.OS !== 'web') {
        triggerNotification(Haptics.NotificationFeedbackType.Warning);
      }
      options?.onDisconnected?.();
    } else {
      // When coming out of offline mode, check connection status
      checkConnection();
    }
  }, [isOfflineMode, checkConnection, options, enableHapticFeedback]);
  
  // Setup listeners on mount
  useEffect(() => {
    // Don't use NetInfo on web as it has limited support
    if (Platform.OS === 'web') {
      const handleOnline = () => {
        updateConnectionStatus({ 
          isConnected: true, 
          isInternetReachable: true, 
          type: 'unknown' 
        } as NetInfoState);
      };
      
      const handleOffline = () => {
        updateConnectionStatus({ 
          isConnected: false, 
          isInternetReachable: false, 
          type: 'unknown' 
        } as NetInfoState);
      };
      
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);
      
      // Initial check
      updateConnectionStatus({ 
        isConnected: navigator.onLine, 
        isInternetReachable: navigator.onLine, 
        type: 'unknown' 
      } as NetInfoState);
      
      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    } else {
      // Initial check for mobile
      checkConnection();
      
      // Subscribe to network info updates
      const unsubscribe = NetInfo.addEventListener(updateConnectionStatus);
      
      // Cleanup subscription on unmount
      return () => {
        unsubscribe();
      };
    }
  }, [checkConnection, updateConnectionStatus]);
  
  return {
    isConnected,
    isInternetReachable,
    connectionType,
    checkConnection,
    isConnecting,
    lastUpdated,
    isOfflineMode
  };
};

export default useNetworkStatus;