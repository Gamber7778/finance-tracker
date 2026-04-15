'use client';

import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import * as auth from './auth';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  username: string;
  login: (login: string, password: string) => boolean;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    setIsAuthenticated(auth.hasSession());
    setIsLoading(false);
  }, []);

  const login = useCallback((loginName: string, password: string): boolean => {
    if (auth.verifyCredentials(loginName, password)) {
      auth.setSession();
      setIsAuthenticated(true);
      return true;
    }
    return false;
  }, []);

  const logout = useCallback(() => {
    auth.clearSession();
    setIsAuthenticated(false);
  }, []);

  return (
    <AuthContext.Provider value={{
      isAuthenticated,
      isLoading,
      username: auth.getUsername(),
      login,
      logout,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within AuthProvider');
  return context;
}
