// src/contexts/MatchContext.jsx
import React, { createContext, useContext, useState } from 'react';

const MatchContext = createContext(undefined);

export const useMatch = () => {
  const context = useContext(MatchContext);
  if (!context) {
    throw new Error('useMatch must be used within a MatchProvider');
  }
  return context;
};

export const MatchProvider = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);

  const API_BASE = 'http://127.0.0.1:5000/api';

  /** Generic GET helper */
  const apiGet = async (endpoint) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Send cookies/session
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  };

  /** Generic POST/PUT helper */
  const apiSend = async (endpoint, method, body) => {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      method,
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include', // ✅ Send cookies/session
      body: JSON.stringify(body),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || data.message || 'Request failed');
    return data;
  };

  // ✅ Get matches
  const getMatches = async () => {
    setIsLoading(true);
    try {
      return await apiGet('/match-requests/matches');
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Send a match request
  const sendMatchRequest = async (receiverId, skillsOffered = [], skillsRequested = []) => {
    return await apiSend('/match-requests', 'POST', {
      receiverId,
      skillsOffered,
      skillsRequested,
    });
  };

  // ✅ Get sent requests
  const getSentRequests = async () => {
    return await apiGet('/match-requests/sent');
  };

  // ✅ Get incoming requests
  const getIncomingRequests = async () => {
    return await apiGet('/match-requests/incoming');
  };

  // ✅ Respond to request
  const respondToRequest = async (requestId, status) => {
    return await apiSend(`/match-requests/${requestId}`, 'PUT', { status });
  };

  // ✅ Check if already requested (prevents duplicates)
  const hasAlreadyRequested = async (receiverId) => {
    try {
      const sent = await getSentRequests();
      return sent.some((req) => {
        const rid = req.receiverId?._id ?? req.receiverId;
        return String(rid) === String(receiverId) && req.status === 'Pending';
      });
    } catch {
      return false; // fail open to allow request if check fails
    }
  };

  return (
    <MatchContext.Provider
      value={{
        getMatches,
        sendMatchRequest,
        getSentRequests,
        getIncomingRequests,
        respondToRequest,
        hasAlreadyRequested,
        isLoading,
      }}
    >
      {children}
    </MatchContext.Provider>
  );
};
