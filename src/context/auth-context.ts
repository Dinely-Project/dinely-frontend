import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
