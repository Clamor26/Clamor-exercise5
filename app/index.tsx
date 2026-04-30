import { router } from 'expo-router';
import { useEffect } from 'react';

import { useAuth } from '../contexts/AuthContext';

export default function IndexRedirect() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/(tabs)');
      return;
    }

    router.replace('/login');
  }, [isAuthenticated]);

  return null;
}
