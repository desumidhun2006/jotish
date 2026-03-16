import React, { createContext, useContext, useState, useMemo } from 'react';
import { Navigate, useLocation } from 'react-router-dom';

const AuthContext = createContext(null);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    try {
      const savedUser = localStorage.getItem('auth_session');
      return savedUser ? JSON.parse(savedUser) : null;
    } catch {
      // If parsing fails, the stored item is corrupt. Clear it.
      localStorage.removeItem('auth_session');
      return null;
    }
  });

  const login = (username, password) => {
    // Hardcoded credentials as per the assignment requirements
    if (username === 'testuser' && password === 'Test123') {
      const sessionData = { username, timestamp: Date.now() };
      setUser(sessionData);
      localStorage.setItem('auth_session', JSON.stringify(sessionData));
      return true;
    }
    return false;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('auth_session');
  };

  // Memoize the context value to prevent unnecessary re-renders of consumers.
  const value = useMemo(() => ({ user, login, logout }), [user]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};

export const useAuth = () => {
  return useContext(AuthContext);
};

export const ProtectedRoute = ({ children }) => {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) {
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return children;
};