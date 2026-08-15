import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const SessionContext = createContext(undefined);

export const useSession = () => {
  const context = useContext(SessionContext);
  if (!context) {
    throw new Error('useSession must be used within a SessionProvider');
  }
  return context;
};

export const SessionProvider = ({ children }) => {
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

  const apiSend = async (path, method, body) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: body ? JSON.stringify(body) : undefined,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  const getSchedulableMatches = async () => {
    setIsLoading(true);
    try {
      return await apiGet('/api/sessions/schedulable-matches');
    } finally {
      setIsLoading(false);
    }
  };

  const createSession = async (sessionData) => {
    return await apiSend('/api/sessions', 'POST', sessionData);
  };

  const getSessions = async () => {
    setIsLoading(true);
    try {
      return await apiGet('/api/sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const cancelSession = async (sessionId) => {
    return await apiSend(`/api/sessions/${sessionId}/cancel`, 'PUT');
  };

  const completeSession = async (sessionId) => {
    return await apiSend(`/api/sessions/${sessionId}/complete`, 'PUT');
  };

  return (
    <SessionContext.Provider
      value={{
        getSchedulableMatches,
        createSession,
        getSessions,
        cancelSession,
        completeSession,
        isLoading,
      }}
    >
      {children}
    </SessionContext.Provider>
  );
};
