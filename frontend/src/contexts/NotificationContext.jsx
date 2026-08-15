import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const NotificationContext = createContext(undefined);

export const useNotifications = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
};

export const NotificationProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const apiGet = async (path) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const getNotifications = async () => {
    setIsLoading(true);
    try {
      return await apiGet('/api/notifications');
    } finally {
      setIsLoading(false);
    }
  };

  const getUnreadCount = async () => {
    const data = await apiGet('/api/notifications/unread-count');
    return data.unreadCount;
  };

  const markRead = async (notificationId) => {
    const res = await fetch(`${API_BASE_URL}/api/notifications/${notificationId}/read`, {
      method: 'PUT',
      credentials: 'include',
    });
    if (!res.ok) throw new Error('Failed to mark notification as read');
  };

  return (
    <NotificationContext.Provider value={{ getNotifications, getUnreadCount, markRead, isLoading }}>
      {children}
    </NotificationContext.Provider>
  );
};
