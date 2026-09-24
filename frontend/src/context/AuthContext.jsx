import React, { createContext, useContext, useState, useEffect } from 'react';
import API from '../services/api';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  // Initialize auth from token
  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('learnpulse_token');
      if (token) {
        try {
          const res = await API.get('/auth/me');
          if (res.data.success) {
            setUser(res.data.user);
          }
        } catch (error) {
          console.error('Session restore failed:', error);
          localStorage.removeItem('learnpulse_token');
          setUser(null);
        }
      }
      setLoading(false);
    };

    initAuth();
  }, []);

  // Login
  const login = async (email, password) => {
    const res = await API.post('/auth/login', { email, password });
    if (res.data.success) {
      localStorage.setItem('learnpulse_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // Register
  const register = async (userData) => {
    const res = await API.post('/auth/register', userData);
    if (res.data.success) {
      localStorage.setItem('learnpulse_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // 1-Click Quick Demo Login (Student / Instructor / Admin)
  const demoLogin = async (role) => {
    const res = await API.post('/auth/demo-login', { role });
    if (res.data.success) {
      localStorage.setItem('learnpulse_token', res.data.token);
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // Update Profile
  const updateProfile = async (profileData) => {
    const res = await API.put('/auth/profile', profileData);
    if (res.data.success) {
      setUser(res.data.user);
      return res.data.user;
    }
  };

  // Logout
  const logout = () => {
    localStorage.removeItem('learnpulse_token');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      loading,
      login,
      register,
      demoLogin,
      updateProfile,
      logout,
      isAuthenticated: !!user,
      isStudent: user?.role === 'student',
      isInstructor: user?.role === 'instructor',
      isAdmin: user?.role === 'admin'
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
