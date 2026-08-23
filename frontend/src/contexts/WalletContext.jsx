import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const WalletContext = createContext(undefined);

export const useWallet = () => {
  const context = useContext(WalletContext);
  if (!context) {
    throw new Error('useWallet must be used within a WalletProvider');
  }
  return context;
};

export const WalletProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const getWallet = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/wallet`, {
        method: 'GET',
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load wallet');
      return data;
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <WalletContext.Provider value={{ getWallet, isLoading }}>{children}</WalletContext.Provider>
  );
};
