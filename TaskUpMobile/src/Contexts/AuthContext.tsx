import React, { createContext, useContext } from 'react';

interface AuthContextType {
  signIn: (email: string, password: string) => Promise<any>;
  signUp: (userData: any) => Promise<any>;
  signOut: () => Promise<void>;
  user: any;
  isLoading: boolean;
}

export const AuthContext = createContext<AuthContextType>({
  signIn: async () => ({ success: false }),
  signUp: async () => ({ success: false }),
  signOut: async () => {},
  user: null,
  isLoading: false,
});

export const useAuth = () => useContext(AuthContext);