import { useState, useEffect, useCallback } from 'react'
import NetInfo, { NetInfoState } from '@react-native-community/netinfo'

interface NetworkStatusHook {
  isConnected: boolean
  isInternetReachable: boolean | null
  connectionType: string | null
  checkConnection: () => Promise<NetInfoState>
}

/**
 * Hook to monitor network connectivity status
 * @returns NetworkStatusHook object with connection status and methods
 */
export const useNetworkStatus = (): NetworkStatusHook => {
  // Network state
  const [isConnected, setIsConnected] = useState<boolean>(true)
  const [isInternetReachable, setIsInternetReachable] = useState<boolean | null>(true)
  const [connectionType, setConnectionType] = useState<string | null>(null)
  
  // Function to manually check connection status
  const checkConnection = useCallback(async (): Promise<NetInfoState> => {
    try {
      const state = await NetInfo.fetch()
      updateConnectionStatus(state)
      return state
    } catch (error) {
      console.error('Error checking network status:', error)
      // In case of error, assume disconnected
      setIsConnected(false)
      setIsInternetReachable(false)
      throw error
    }
  }, [])
  
  // Update connection status from NetInfo state
  const updateConnectionStatus = (state: NetInfoState) => {
    setIsConnected(!!state.isConnected)
    setIsInternetReachable(!!state.isInternetReachable)
    setConnectionType(state.type)
  }
  
  // Setup listeners on mount
  useEffect(() => {
    // Initial check
    checkConnection()
    
    // Subscribe to network info updates
    const unsubscribe = NetInfo.addEventListener(updateConnectionStatus)
    
    // Cleanup subscription on unmount
    return () => {
      unsubscribe()
    }
  }, [])
  
  return {
    isConnected,
    isInternetReachable,
    connectionType,
    checkConnection
  }
}

export default useNetworkStatus
