import React, { createContext, useState, useContext } from 'react';
import { loginUser, registerUser } from './api';

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(() => localStorage.getItem('token'));
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('user');
    return saved ? JSON.parse(saved) : null;
  });

  const login = async (username, password) => {
    try {
      const data = await loginUser(username, password);
      if (data && data.token) {
        setToken(data.token);
        localStorage.setItem('token', data.token);
        const userData = { username, role: data.role, isCaptain: data.role === 'ClubCaptain', userid: data.userId || data.userid };
        setUser(userData);
        localStorage.setItem('user', JSON.stringify(userData));
      }
    } catch (error) {
      console.error("Login failed:", error);
      throw error;
    }
  };

  const register = async (username, password) => {
    await registerUser(username, password);
  };

  const logout = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  };

  const promoteToCaptain = () => {
    if (user) {
      const updatedUser = { ...user, role: 'ClubCaptain', isCaptain: true };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  return (
    <AuthContext.Provider value={{ token, user, login, register, logout, promoteToCaptain }}>
      {children}
    </AuthContext.Provider>
  );
};