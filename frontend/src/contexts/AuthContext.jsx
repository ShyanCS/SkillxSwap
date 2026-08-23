import React, { createContext, useContext, useState, useEffect } from 'react';
import { API_BASE_URL } from '../config/api';
import logger from '../lib/logger';

const AuthContext = createContext(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  // Distinct from isLoading: true only until the initial session check
  // resolves. Routes must not render before this flips, otherwise a refresh
  // on a protected page redirects to /login (losing the deep link) before
  // the cookie session has been confirmed.
  const [isBootstrapping, setIsBootstrapping] = useState(true);

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
        // A 401 here is expected for signed-out visitors, not an error.
      } catch (error) {
        logger.error('Failed to restore session:', error);
      } finally {
        setIsBootstrapping(false);
      }
    };
    fetchUser();
  }, []);

  // ✅ Actual login using backend
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/login`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      if (!res.ok) {
        throw new Error(data.error || 'Login failed');
      }

      // Optionally: Fetch user after login
      await fetchUserDetails();
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  // ✅ Optional API to fetch logged-in user (if not using /me in useEffect)
  const fetchUserDetails = async () => {
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      logger.error('Failed to fetch user details:', error);
    }
  };

  // Actual logout -- backed by a real endpoint now (Phase 1); the Node
  // backend never implemented POST /api/auth/logout, so this used to 404.
  const logout = async () => {
    try {
      await fetch(`${API_BASE_URL}/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      // The cookie is cleared client-side below regardless; a failed logout
      // call only means the server may not have invalidated its record.
      logger.warn('Logout API failed silently', e);
    }
    setUser(null);
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/auth/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(userData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Registration failed');
      await fetchUserDetails(); // Optionally fetch user after registration
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const updateProfile = async (profileData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`${API_BASE_URL}/api/profile`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(profileData),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Profile update failed');
      setUser(data.user);
    } catch (error) {
      throw new Error(error.message);
    } finally {
      setIsLoading(false);
    }
  };


  return (
    <AuthContext.Provider
      value={{
        user,
        login,
        register,
        logout,
        updateProfile,
        fetchUserDetails,
        isLoading,
        isBootstrapping,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
