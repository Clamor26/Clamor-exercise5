import AsyncStorage from '@react-native-async-storage/async-storage';
import { router } from 'expo-router';
import {
  GoogleAuthProvider,
  User as FirebaseUser,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithCredential,
  signInWithEmailAndPassword,
  signInWithPopup,
  signOut,
  updateProfile,
} from 'firebase/auth';
import React, { createContext, ReactNode, useContext, useEffect, useState } from 'react';
import { Platform } from 'react-native';
import { auth } from '../lib/firebase';

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
  loginWithGoogle: (idToken?: string) => Promise<void>;
  registerWithGoogle: (idToken?: string) => Promise<void>;
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
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      try {
        if (!firebaseUser) {
          setUser(null);
          setIsAuthenticated(false);
          return;
        }

        const localProfileStr = await AsyncStorage.getItem('userProfile');
        const localProfile = localProfileStr ? (JSON.parse(localProfileStr) as Partial<User>) : null;
        const userData = buildUserFromFirebase(firebaseUser, localProfile);
        setUser(userData);
        setIsAuthenticated(true);
      } catch (error) {
        console.error('Auth state sync failed:', error);
      } finally {
        setIsLoading(false);
      }
    });

    return unsubscribe;
  }, []);

  const buildUserFromFirebase = (firebaseUser: FirebaseUser, localProfile?: Partial<User> | null): User => {
    const firstNameFromFirebase = firebaseUser.displayName?.split(' ')[0];
    const lastNameFromFirebase = firebaseUser.displayName?.split(' ').slice(1).join(' ') || undefined;

    return {
      email: firebaseUser.email ?? localProfile?.email ?? '',
      firstName: localProfile?.firstName ?? firstNameFromFirebase,
      lastName: localProfile?.lastName ?? lastNameFromFirebase,
      profilePhoto: localProfile?.profilePhoto ?? firebaseUser.photoURL ?? undefined,
      homepageRedirect: localProfile?.homepageRedirect,
    };
  };

  const saveLocalProfile = async (userData: User) => {
    try {
      await AsyncStorage.setItem('userProfile', JSON.stringify(userData));
      setUser(userData);
    } catch (error) {
      console.error('Save user failed:', error);
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    if (!normalizedEmail || !normalizedPassword) {
      throw new Error('Email and password are required');
    }

    await signInWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
    router.replace('/(tabs)' as any);
  };

  const register = async (email: string, password: string) => {
    const normalizedEmail = email.trim();
    const normalizedPassword = password.trim();
    if (!normalizedEmail || !normalizedPassword) {
      throw new Error('Email and password are required');
    }

    await createUserWithEmailAndPassword(auth, normalizedEmail, normalizedPassword);
    router.push('/setup' as any);
  };

  const loginWithGoogle = async (idToken?: string) => {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.replace('/(tabs)' as any);
      return;
    }

    if (!idToken) {
      throw new Error('Missing Google ID token');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
    router.replace('/(tabs)' as any);
  };

  const registerWithGoogle = async (idToken?: string) => {
    if (Platform.OS === 'web') {
      const provider = new GoogleAuthProvider();
      await signInWithPopup(auth, provider);
      router.push('/setup' as any);
      return;
    }

    if (!idToken) {
      throw new Error('Missing Google ID token');
    }
    const credential = GoogleAuthProvider.credential(idToken);
    await signInWithCredential(auth, credential);
    router.push('/setup' as any);
  };

  const setupAccount = async (firstName: string, lastName: string, profilePhoto?: string, homepageRedirect?: string) => {
    if (!auth.currentUser) {
      throw new Error('No authenticated user');
    }

    const fullUser: User = {
      email: auth.currentUser.email ?? user?.email ?? '',
      firstName,
      lastName,
      profilePhoto,
      homepageRedirect,
    };
    await updateProfile(auth.currentUser, {
      displayName: `${firstName} ${lastName}`.trim(),
      photoURL: profilePhoto || null,
    });
    await saveLocalProfile(fullUser);
    router.replace('/(tabs)' as any);
  };

  const logout = async () => {
    await signOut(auth);
    setUser(null);
    setIsAuthenticated(false);
    router.push('/login' as any);
  };

  if (isLoading) {
    return null;
  }

  return (
    <AuthContext.Provider
      value={{ user, isAuthenticated, login, register, loginWithGoogle, registerWithGoogle, setupAccount, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

