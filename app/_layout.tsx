import { DarkTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';
import { QuizProvider } from '@/screens/QuizContext';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <AuthProvider>
      <QuizProvider>
        <ThemeProvider value={DarkTheme}>
          <Stack>
            <Stack.Screen name="login" options={{ headerShown: false }} />
            <Stack.Screen name="register" options={{ headerShown: false }} />
            <Stack.Screen name="setup" options={{ headerShown: false }} />
            <Stack.Screen name="index" options={{ 
              headerShown: true,
              title: 'Quiz App'
            }} />
            <Stack.Screen name="quiz" options={{ 
              headerShown: true,
              title: 'Quiz'
            }} />
            <Stack.Screen name="result" options={{ 
              headerShown: true,
              title: 'Results'
            }} />
          </Stack>
          <StatusBar style="light" />
        </ThemeProvider>
      </QuizProvider>
    </AuthProvider>
  );
}


