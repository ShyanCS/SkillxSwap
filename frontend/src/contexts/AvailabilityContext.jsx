import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const AvailabilityContext = createContext(undefined);

export const useAvailability = () => {
  const context = useContext(AvailabilityContext);
  if (!context) {
    throw new Error('useAvailability must be used within an AvailabilityProvider');
  }
  return context;
};

export const AvailabilityProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const request = async (path, options = {}) => {
    const res = await fetch(`${API_BASE_URL}${path}`, {
      credentials: 'include',
      headers: options.body ? { 'Content-Type': 'application/json' } : undefined,
      ...options,
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Request failed');
    return data;
  };

  // { timezone, slots: [{ dayOfWeek, startMinute, endMinute }] }
  const getMyAvailability = async () => {
    setIsLoading(true);
    try {
      return await request('/api/availability');
    } finally {
      setIsLoading(false);
    }
  };

  const getUserAvailability = async (userId) => request(`/api/availability/${userId}`);

  // Replaces the whole week in one call, matching the editor's save model.
  const saveAvailability = async (slots) =>
    request('/api/availability', { method: 'PUT', body: JSON.stringify({ slots }) });

  return (
    <AvailabilityContext.Provider
      value={{ getMyAvailability, getUserAvailability, saveAvailability, isLoading }}
    >
      {children}
    </AvailabilityContext.Provider>
  );
};
