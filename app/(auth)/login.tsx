// Redirect to auth group login
import { router } from 'expo-router';
import { useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';


export default function LoginRedirect() {
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.replace('/index');
    } else {
      router.replace('/login');
    }
  }, [isAuthenticated]);

  return null;
}

