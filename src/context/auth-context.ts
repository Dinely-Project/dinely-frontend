import { createContext } from 'react';

export interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  status: string;
  phone?: string | null;

  employee_role?: string | null;
  employee_level?: number | null;
  salary?: number | null;
}

export interface AuthContextType {
  token: string | null;
  user: User | null;
  loading: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);
