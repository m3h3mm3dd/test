import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // For now, we're using a simple mock auth state
  // In a real app, you would use a proper authentication system with JWT tokens, etc.
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Simulate checking for saved auth state
    const savedUser = localStorage.getItem('taskup_user');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data', error);
        localStorage.removeItem('taskup_user');
      }
    }
    
    // For demo purposes, set a mock user
    if (!savedUser) {
      const mockUser = {
        id: '1',
        name: 'John Doe',
        email: 'john@example.com',
        role: 'Admin'
      };
      setUser(mockUser);
      localStorage.setItem('taskup_user', JSON.stringify(mockUser));
    }
    
    setLoading(false);
  }, []);
  
  const login = async (email, password) => {
    // Mock login functionality
    setLoading(true);
    
    // Simulate API call delay
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    const mockUser = {
      id: '1',
      name: 'John Doe',
      email: email,
      role: 'Admin'
    };
    
    setUser(mockUser);
    localStorage.setItem('taskup_user', JSON.stringify(mockUser));
    setLoading(false);
    return mockUser;
  };
  
  const logout = () => {
    setUser(null);
    localStorage.removeItem('taskup_user');
  };
  
  return (
    <AuthContext.Provider value={{ user, loading, login, logout, isAuthenticated: !!user }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};