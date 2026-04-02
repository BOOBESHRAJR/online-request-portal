import React, { createContext, useState, useEffect, useContext } from 'react';
import api from '../services/api';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async (retries = 2) => {
      if (user?.token) {
        try {
          const res = await api.get('/auth/me');
          setUser({ ...res.data, token: user.token });
        } catch (error) {
          // If it's a network error or 500+ and we have retries, wait and try again (Handles Render Cold Start)
          if (retries > 0 && (!error.response || error.response.status >= 500)) {
            console.log(`Render cold start detected, retrying... (${retries} left)`);
            setTimeout(() => checkAuth(retries - 1), 3000);
            return;
          }
          console.error('Session expired or server unavailable', error);
          if (error.response?.status === 401) logout();
        }
      }
      setLoading(false);
    };
    checkAuth();
  }, [user?.token]);

  const login = async (email, password) => {
    const res = await api.post('/auth/login', { email, password });
    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
  };

  const register = async (name, email, phoneNumber, password) => {
    const res = await api.post('/auth/register', { name, email, phoneNumber, password });
    localStorage.setItem('user', JSON.stringify(res.data));
    setUser(res.data);
  };

  const updateUser = async (data) => {
    const res = await api.put('/auth/profile', data);
    const updatedUser = { ...res.data };
    localStorage.setItem('user', JSON.stringify(updatedUser));
    setUser(updatedUser);
  };

  const logout = () => {
    localStorage.removeItem('user');
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ user, login, register, updateUser, logout, loading }}>
      {!loading && children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);
