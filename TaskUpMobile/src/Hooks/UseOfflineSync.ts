import { useState, useEffect } from 'react';
import NetInfo from '@react-native-community/netinfo';
import { StorageUtils } from '../Utils/StorageUtils';
import { ApiService } from '../Services/ApiService';

interface PendingOperation {
  id: string;
  endpoint: string;
  method: 'post' | 'put' | 'delete';
  data?: any;
  timestamp: number;
}

interface UseOfflineSyncResult {
  isConnected: boolean | null;
  pendingOperations: number;
  syncStatus: 'idle' | 'syncing' | 'completed' | 'error';
  forceSyncNow: () => Promise<void>;
}

const PENDING_OPERATIONS_KEY = '@TaskUp:pendingOperations';

export const useOfflineSync = (): UseOfflineSyncResult => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [pendingOperations, setPendingOperations] = useState<number>(0);
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'completed' | 'error'>('idle');
  
  useEffect(() => {
    const unsubscribe = NetInfo.addEventListener(state => {
      setIsConnected(state.isConnected);
      
      if (state.isConnected) {
        syncPendingOperations();
      }
    });
    
    loadPendingOperationsCount();
    
    return () => {
      unsubscribe();
    };
  }, []);

  const loadPendingOperationsCount = async () => {
    const operations = await getPendingOperations();
    setPendingOperations(operations.length);
  };

  const getPendingOperations = async (): Promise<PendingOperation[]> => {
    const operations = await StorageUtils.getObject(PENDING_OPERATIONS_KEY);
    return operations || [];
  };

  const savePendingOperations = async (operations: PendingOperation[]): Promise<void> => {
    await StorageUtils.setObject(PENDING_OPERATIONS_KEY, operations);
    setPendingOperations(operations.length);
  };

  const addPendingOperation = async (
    endpoint: string,
    method: 'post' | 'put' | 'delete',
    data?: any
  ): Promise<string> => {
    const operations = await getPendingOperations();
    const newOperation: PendingOperation = {
      id: Date.now().toString(),
      endpoint,
      method,
      data,
      timestamp: Date.now(),
    };
    
    await savePendingOperations([...operations, newOperation]);
    return newOperation.id;
  };

  const removePendingOperation = async (id: string): Promise<void> => {
    const operations = await getPendingOperations();
    const updatedOperations = operations.filter(op => op.id !== id);
    await savePendingOperations(updatedOperations);
  };

  const syncPendingOperations = async (): Promise<void> => {
    try {
      const operations = await getPendingOperations();
      
      if (operations.length === 0) {
        return;
      }
      
      setSyncStatus('syncing');
      
      for (const operation of operations) {
        try {
          if (operation.method === 'post') {
            await ApiService.post(operation.endpoint, operation.data);
          } else if (operation.method === 'put') {
            await ApiService.put(operation.endpoint, operation.data);
          } else if (operation.method === 'delete') {
            await ApiService.delete(operation.endpoint);
          }
          
          await removePendingOperation(operation.id);
        } catch (error) {
          console.error(`Failed to sync operation: ${operation.id}`, error);
          
          // If the error is not a network error, remove the operation to avoid endless retry
          if (error.response && error.response.status !== 0) {
            await removePendingOperation(operation.id);
          }
        }
      }
      
      setSyncStatus('completed');
      
      // Reset status after a delay
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    } catch (error) {
      console.error('Sync failed:', error);
      setSyncStatus('error');
      
      // Reset status after a delay
      setTimeout(() => {
        setSyncStatus('idle');
      }, 3000);
    }
  };

  const forceSyncNow = async (): Promise<void> => {
    if (isConnected) {
      await syncPendingOperations();
    }
  };

  return {
    isConnected,
    pendingOperations,
    syncStatus,
    forceSyncNow,
  };
};

// Helper functions for using offline sync in services
export const addOfflineOperation = async (
  endpoint: string,
  method: 'post' | 'put' | 'delete',
  data?: any
): Promise<string> => {
  const operations = await StorageUtils.getObject(PENDING_OPERATIONS_KEY) || [];
  const newOperation: PendingOperation = {
    id: Date.now().toString(),
    endpoint,
    method,
    data,
    timestamp: Date.now(),
  };
  
  operations.push(newOperation);
  await StorageUtils.setObject(PENDING_OPERATIONS_KEY, operations);
  return newOperation.id;
};