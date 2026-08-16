import React, { createContext, useContext } from 'react';
import { API_BASE_URL } from '../config/api';

const DashboardContext = createContext(undefined);

export const useDashboard = () => {
  const context = useContext(DashboardContext);
  if (!context) {
    throw new Error('useDashboard must be used within a DashboardProvider');
  }
  return context;
};

export const DashboardProvider = ({ children }) => {
  const getDashboard = async () => {
    const res = await fetch(`${API_BASE_URL}/api/dashboard`, {
      method: 'GET',
      credentials: 'include',
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to load dashboard');
    return data;
  };

  return (
    <DashboardContext.Provider value={{ getDashboard }}>
      {children}
    </DashboardContext.Provider>
  );
};
