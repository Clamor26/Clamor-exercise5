import { router, Stack } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';


export default function AuthLayout() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/index');
    }
  }, [isAuthenticated]);

  return <Stack screenOptions={{ headerShown: false }} />;
}

