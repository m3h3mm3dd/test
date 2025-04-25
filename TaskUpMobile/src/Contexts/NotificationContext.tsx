import React, { createContext, useContext } from 'react';

interface NotificationContextType {
  hasNotifications: boolean;
  unreadNotifications: number;
  markAllAsRead: () => Promise<void>;
  refreshNotifications: () => Promise<void>;
}

export const NotificationContext = createContext<NotificationContextType>({
  hasNotifications: false,
  unreadNotifications: 0,
  markAllAsRead: async () => {},
  refreshNotifications: async () => {},
});

export const useNotification = () => useContext(NotificationContext);