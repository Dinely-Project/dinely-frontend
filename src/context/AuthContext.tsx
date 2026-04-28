import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import api from '../api/axios';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [token, setToken] = useState<string | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const storedToken = localStorage.getItem('dinely_token');

    if (!storedToken) {
      setLoading(false);
      return;
    }

    api
      .get('/api/auth/me')
      .then((response) => {
        setUser(response.data.user || response.data);
        setToken(storedToken);
      })
      .catch((error) => {
        console.error('Failed to fetch user', error);
        localStorage.removeItem('dinely_token');
        setToken(null);
        setUser(null);
      })
      .finally(() => {
        setLoading(false);
      });
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem('dinely_token', token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem('dinely_token');
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
};
