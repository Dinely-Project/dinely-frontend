import React, { createContext, useState, useEffect, type ReactNode } from 'react';
import api, { AUTH_TOKEN_KEY } from '../api/axios';

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
    let isMounted = true;

const restoreSession = async () => {
  console.log('1. restoreSession started');
  const storedToken = localStorage.getItem(AUTH_TOKEN_KEY);
  console.log('2. storedToken:', storedToken ? 'EXISTS' : 'NULL');

  if (!storedToken) {
    setLoading(false);
    return;
  }

  try {
    setToken(storedToken);
    console.log('3. calling /api/auth/me');
    const response = await api.get('/api/auth/me');
    console.log('4. response data:', response.data);
    if (!isMounted) return;
    setUser(response.data.user ?? response.data);
    console.log('5. user set');
  } catch (error) {
    console.error('6. error:', error);
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  } finally {
    if (isMounted) {
      setLoading(false);
      console.log('7. loading set to false');
    }
  }
};

    restoreSession();

    return () => {
      isMounted = false;
    };
  }, []);

  const login = (token: string, user: User) => {
    localStorage.setItem(AUTH_TOKEN_KEY, token);
    setToken(token);
    setUser(user);
  };

  const logout = () => {
    localStorage.removeItem(AUTH_TOKEN_KEY);
    setToken(null);
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{ token, user, loading, login, logout }}>
      {children}
    </AuthContext.Provider>
  );

};

