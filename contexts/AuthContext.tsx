import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';

interface User {
  email: string;
  firstName?: string;
  lastName?: string;
  profilePhoto?: string;
  homepageRedirect?: string;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (email: string, password: string) => Promise<void>;
  setupAccount: (firstName: string, lastName: string, profilePhoto?: string, homepageRedirect?: string) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('user');
      if (storedUser) {
        setUser(JSON.parse(storedUser));
        setIsAuthenticated(true);
      }
    } catch (error) {
      console.error('Auth check failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const saveUser = async (userData: User) => {
    try {
      await AsyncStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setIsAuthenticated(true);
    } catch (error) {
      console.error('Save user failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const userData: User = { email };
    await saveUser(userData);
    router.replace('/(tabs)' as any);
  };

  const register = async (email: string, password: string) => {
    await new Promise(resolve => setTimeout(resolve, 1000));
    const tempUserData = { email };

    await AsyncStorage.setItem('tempUser', JSON.stringify(tempUserData));
    setUser(tempUserData);
    setIsAuthenticated(false);
    router.push('/setup' as any);
  };

  const setupAccount = async (firstName: string, lastName: string, profilePhoto?: string, homepageRedirect?: string) => {
    const tempUserStr = await AsyncStorage.getItem('tempUser');
    if (!tempUserStr) throw new Error('No temp user');
    const tempUser = JSON.parse(tempUserStr) as any;
    const fullUser: User = {
      email: tempUser.email,
      firstName,
      lastName,
      profilePhoto,
      homepageRedirect,
    };
    await saveUser(fullUser);
    await AsyncStorage.removeItem('tempUser');
    router.replace('/(tabs)' as any);
  };

  const logout = async () => {
    await AsyncStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login' as any);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, login, register, setupAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

