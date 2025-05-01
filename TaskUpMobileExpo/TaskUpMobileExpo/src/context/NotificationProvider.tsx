import React, { createContext, useContext, useState, useEffect } from 'react';
import * as Haptics from 'expo-haptics';
import { triggerNotification } from '../utils/HapticUtils';

// Define notification context type
interface NotificationContextType {
  hasNotifications: boolean;
  unreadNotifications: number;
  notifications: Notification[];
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
  addNotification: (notification: Notification) => void;
}

// Notification type
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'task' | 'team' | 'project' | 'system';
  isRead: boolean;
  createdAt: string;
  relatedId?: string;
}

// Create the context
const NotificationContext = createContext<NotificationContextType>({
  hasNotifications: false,
  unreadNotifications: 0,
  notifications: [],
  markAsRead: async () => {},
  markAllAsRead: async () => {},
  refreshNotifications: async () => {},
  addNotification: () => {}
});

// Provider component
export const NotificationProvider = ({ children }: { children: React.ReactNode }) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // Calculate derived values
  const hasNotifications = notifications.length > 0;
  const unreadNotifications = notifications.filter(n => !n.isRead).length;
  
  // Load notifications on mount
  useEffect(() => {
    refreshNotifications();
  }, []);
  
  // Trigger haptic when new unread notification appears
  useEffect(() => {
    if (unreadNotifications > 0) {
      triggerNotification(Haptics.NotificationFeedbackType.Success);
    }
  }, [unreadNotifications]);
  
  // Mock API call to refresh notifications
  const refreshNotifications = async (): Promise<void> => {
    try {
      setIsLoading(true);
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Load sample notifications
      const mockNotifications: Notification[] = [
        {
          id: '1',
          title: 'Task assigned',
          message: 'You have been assigned a new task: "Update dashboard UI"',
          type: 'task',
          isRead: false,
          createdAt: new Date().toISOString(),
          relatedId: 'task-1'
        },
        {
          id: '2',
          title: 'Project deadline approaching',
          message: 'Project "Mobile App Redesign" is due in 3 days',
          type: 'project',
          isRead: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
          relatedId: 'project-1'
        }
      ];
      
      setNotifications(mockNotifications);
    } catch (error) {
      console.error('Error refreshing notifications:', error);
    } finally {
      setIsLoading(false);
    }
  };
  
  // Mark a notification as read
  const markAsRead = async (id: string): Promise<void> => {
    try {
      // Update local state immediately for better UX
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, isRead: true } : notification
        )
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 300));
      
      // In a real app, you would call an API here
    } catch (error) {
      console.error('Error marking notification as read:', error);
      
      // Revert on error
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => 
          notification.id === id ? { ...notification, isRead: false } : notification
        )
      );
    }
  };
  
  // Mark all notifications as read
  const markAllAsRead = async (): Promise<void> => {
    try {
      // Update local state immediately
      setNotifications(prevNotifications => 
        prevNotifications.map(notification => ({ ...notification, isRead: true }))
      );
      
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // In a real app, you would call an API here
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      
      // Refresh to get correct state on error
      await refreshNotifications();
    }
  };
  
  // Add a new notification
  const addNotification = (notification: Notification): void => {
    setNotifications(prev => [notification, ...prev]);
    
    // Trigger a haptic feedback for new notification
    triggerNotification(Haptics.NotificationFeedbackType.Success);
  };
  
  return (
    <NotificationContext.Provider value={{
      hasNotifications,
      unreadNotifications,
      notifications,
      markAsRead,
      markAllAsRead,
      refreshNotifications,
      addNotification
    }}>
      {children}
    </NotificationContext.Provider>
  );
};

// Hook to use the context
export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (context === undefined) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export default NotificationContext;