import React, { createContext, useState, useContext, useEffect } from 'react';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  // State for authentication
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  
  useEffect(() => {
    // Check for saved auth state
    const savedUser = localStorage.getItem('taskup_user');
    
    if (savedUser) {
      try {
        setUser(JSON.parse(savedUser));
      } catch (error) {
        console.error('Error parsing saved user data', error);
        localStorage.removeItem('taskup_user');
      }
    }
    
    // Don't set a mock user automatically - let the user login
    
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
    // Clear user data and remove from localStorage
    setUser(null);
    localStorage.removeItem('taskup_user');
    
    // Optional: You could do additional cleanup here such as:
    // - Clear any app state
    // - Clear tokens
    // - Clear any other user-specific data in localStorage
  };
  
  return (
    <AuthContext.Provider value={{ 
      user, 
      loading, 
      login, 
      logout, 
      isAuthenticated: !!user 
    }}>
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