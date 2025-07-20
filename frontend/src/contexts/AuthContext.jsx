import React, { createContext, useContext, useState, useEffect } from 'react';

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

  // Fetch current user from backend on initial load (optional route: /me)
  useEffect(() => {
    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const res = await fetch(`http://127.0.0.1:5000/api/auth/me`, {
          method: 'GET',
          credentials: 'include',
        });
        if (res.ok) {
          const data = await res.json();
          setUser(data.user);
        }
      } catch (error) {
        console.error('Failed to fetch user:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchUser();
  }, []);

  // ✅ Actual login using backend
  const login = async (email, password) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/auth/login`, {
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
      const res = await fetch(`http://127.0.0.1:5000/api/auth/me`, {
        method: 'GET',
        credentials: 'include',
      });
      if (res.ok) {
        const data = await res.json();
        setUser(data.user);
      }
    } catch (error) {
      console.error('Failed to fetch user details:', error);
    }
  };

  // ✅ Actual logout
  const logout = async () => {
    try {
      await fetch(`http://127.0.0.1:5000/api/auth/logout`, {
        method: 'POST',
        credentials: 'include',
      });
    } catch (e) {
      console.warn('Logout API failed silently');
    }
    setUser(null);
  };

  const register = async (userData) => {
    setIsLoading(true);
    try {
      const res = await fetch(`http://127.0.0.1:5000/api/auth/register`, {
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
      const res = await fetch(`http://127.0.0.1:5000/api/auth/update-profile`, {
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
        isLoading,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};
