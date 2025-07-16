import React, { createContext, useContext, useState, useEffect } from 'react';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Mock user data for demo
const mockUser = {
  id: '1',
  email: 'demo@skillswap.com',
  name: 'John Doe',
  bio: 'Passionate learner and teacher with expertise in web development and design.',
  region: 'North America',
  timezone: 'EST',
  profilePictureUrl: 'https://images.pexels.com/photos/771742/pexels-photo-771742.jpeg?auto=compress&cs=tinysrgb&w=400',
  karmaPoints: 450,
  skillsOffered: [],
  skillsRequested: [],
  learningGoals: ['Master React', 'Learn Machine Learning', 'Improve Design Skills'],
  createdAt: '2024-01-01T00:00:00Z',
  updatedAt: '2024-01-15T00:00:00Z'
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    // Check for stored auth token
    const token = localStorage.getItem('authToken');
    if (token) {
      setUser(mockUser);
    }
  }, []);

  const login = async (email, password) => {
    setIsLoading(true);
    try {
      // Mock login - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      localStorage.setItem('authToken', 'mock-token');
      setUser(mockUser);
    } catch (error) {
      throw new Error('Invalid credentials');
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      // Mock registration - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      const newUser = { ...mockUser, ...userData, id: Math.random().toString() };
      localStorage.setItem('authToken', 'mock-token');
      setUser(newUser);
    } catch (error) {
      throw new Error('Registration failed');
    } finally {
      setIsLoading(false);
    }
  };

  const logout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      // Mock profile update - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 500));
      if (user) {
        setUser({ ...user, ...profileData });
      }
    } catch (error) {
      throw new Error('Profile update failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      register,
      logout,
      updateProfile,
      isLoading
    }}>
      {children}
    </AuthContext.Provider>
  );
};