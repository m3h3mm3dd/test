// src/contexts/AuthContext.tsx

'use client';

import { createContext, useState, useEffect, useContext, ReactNode } from 'react';
import { useRouter } from 'next/navigation';

interface User {
  Id: string;
  FirstName: string;
  LastName: string;
  Email: string;
  ProfileUrl?: string;
  Role?: string;
}

interface AuthContextType {
  user: User | null;
  loading: boolean;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  loading: true,
  logout: () => {},
  isAuthenticated: false,
});

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  useEffect(() => {
    // Simple check if token exists, without making API calls
    const token = localStorage.getItem('taskup_token');
    
    // For demo purposes, create a basic user object if token exists
    if (token) {
      setUser({
        Id: "demo-user",
        FirstName: "User",
        LastName: "",
        Email: "user@example.com",
        Role: "Project Owner"
      });
    }
    
    setLoading(false);
  }, []);

  const logout = () => {
    localStorage.removeItem('taskup_token');
    setUser(null);
    router.push('/login');
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}