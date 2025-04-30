import { createContext } from 'react';

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<{ success: boolean, error?: string }>;
  signUp: (userData: any) => Promise<{ success: boolean, data?: any, error?: string }>;
  signOut: () => Promise<void>;
  user: any;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  user: null,
  isLoading: true,
});