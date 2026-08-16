import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const MessagingContext = createContext(undefined);

export const useMessaging = () => {
  const context = useContext(MessagingContext);
  if (!context) {
    throw new Error('useMessaging must be used within a MessagingProvider');
  }
  return context;
};

export const MessagingProvider = ({ children }) => {
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

  const getConversations = async () => {
    setIsLoading(true);
    try {
      return await apiGet('/api/messages/conversations');
    } finally {
      setIsLoading(false);
    }
  };

  // Returns a page envelope: { items, page, hasNext, ... }. Items are
  // newest-first -- the caller reverses them for display.
  const getMessages = async (conversationId, page = 0, size = 30) => {
    return await apiGet(`/api/messages/conversations/${conversationId}?page=${page}&size=${size}`);
  };

  const sendMessage = async (partnerId, body) => {
    const res = await fetch(`${API_BASE_URL}/api/messages/partners/${partnerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ body }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to send message');
    return data;
  };

  return (
    <MessagingContext.Provider value={{ getConversations, getMessages, sendMessage, isLoading }}>
      {children}
    </MessagingContext.Provider>
  );
};
