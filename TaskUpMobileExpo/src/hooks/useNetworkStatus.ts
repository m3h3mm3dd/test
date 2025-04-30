
import { useState, useEffect, useCallback } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import { Platform } from 'react-native';

interface NetworkStatusOptions {
  onConnected?: () => void;
  onDisconnected?: () => void;
}

interface NetworkStatusHook {
  isConnected: boolean;
  isInternetReachable: boolean | null;
  connectionType: string | null;
  checkConnection: () => Promise<NetInfoState>;
  isConnecting: boolean;
  lastUpdated: Date | null;
}

/**
 * Enhanced hook to monitor network connectivity status with callbacks
 */
export const useNetworkStatus = (options?: NetworkStatusOptions): NetworkStatusHook => {
  // Network state
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true);
  const [connectionType, setConnectionType] = useState<string | null>(null);
  const [isConnecting, setIsConnecting] = useState<boolean>(false);
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null);
  
  // Update connection status from NetInfo state
  const updateConnectionStatus = useCallback((state: NetInfoState) => {
    const wasConnected = isConnected;
    const nowConnected = !!state.isConnected;
    
    setIsConnected(nowConnected);
    setIsInternetReachable(!!state.isInternetReachable);
    setConnectionType(state.type);
    setLastUpdated(new Date());
    
    // Fire callbacks for connection changes
    if (!wasConnected && nowConnected) {
      options?.onConnected?.();
    } else if (wasConnected && !nowConnected) {
      options?.onDisconnected?.();
    }
    
    setIsConnecting(false);
  }, [isConnected, options]);
  
  // Function to manually check connection status
  const checkConnection = useCallback(async (): Promise<NetInfoState> => {
    try {
      setIsConnecting(true);
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
  
  // Setup listeners on mount
  useEffect(() => {
    // Don't run on web as NetInfo has limited support
    if (Platform.OS === 'web') {
      return;
    }
    
    // Initial check
    checkConnection();
    
    // Subscribe to network info updates
    const unsubscribe = NetInfo.addEventListener(updateConnectionStatus);
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe();
    };
  }, [checkConnection, updateConnectionStatus]);
  
  return {
    isConnected,
    isInternetReachable,
    connectionType,
    checkConnection,
    isConnecting,
    lastUpdated
  };
};

export default useNetworkStatus;