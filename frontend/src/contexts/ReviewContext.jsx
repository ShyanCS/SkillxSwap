import React, { createContext, useContext, useState } from 'react';
import { API_BASE_URL } from '../config/api';

const ReviewContext = createContext(undefined);

export const useReview = () => {
  const context = useContext(ReviewContext);
  if (!context) {
    throw new Error('useReview must be used within a ReviewProvider');
  }
  return context;
};

export const ReviewProvider = ({ children }) => {
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

  const getReviewableSessions = async () => {
    setIsLoading(true);
    try {
      return await apiGet('/api/reviews/reviewable-sessions');
    } finally {
      setIsLoading(false);
    }
  };

  const getGivenReviews = async () => {
    setIsLoading(true);
    try {
      return await apiGet('/api/reviews');
    } finally {
      setIsLoading(false);
    }
  };

  const submitReview = async (sessionId, rating, comment) => {
    const res = await fetch(`${API_BASE_URL}/api/reviews`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      credentials: 'include',
      body: JSON.stringify({ sessionId, rating, comment }),
    });
    const data = await res.json();
    if (!res.ok) throw new Error(data.error || 'Failed to submit review');
    return data;
  };

  return (
    <ReviewContext.Provider value={{ getReviewableSessions, getGivenReviews, submitReview, isLoading }}>
      {children}
    </ReviewContext.Provider>
  );
};
