import React, { createContext, useContext, useState, useEffect } from 'react';

const MatchContext = createContext(undefined);

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (context === undefined) {
    throw new Error('useMatch must be used within an MatchProvider');
  }
  return context;
};

export const MatchProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

    const getMatches = async () => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/match-requests/matches`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Cannot get data');
      console.log(data);
      return data;
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <MatchContext.Provider
      value={{
        getMatches,
        isLoading,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
