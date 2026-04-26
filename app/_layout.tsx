import { DarkTheme, DefaultTheme, ThemeProvider as NavigationThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';
import 'react-native-reanimated';

import { ThemeToggle } from '@/components/theme-toggle';
import { ThemeProvider } from '@/contexts/ThemeContext';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { QuizProvider } from '@/screens/QuizContext';
import { AuthProvider } from '../contexts/AuthContext';

export default function RootLayout() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <QuizProvider>
          <RootLayoutNavigation />
        </QuizProvider>
      </AuthProvider>
    </ThemeProvider>
  );
}

function RootLayoutNavigation() {
  const colorScheme = useColorScheme() ?? 'light';
  const navigationTheme = colorScheme === 'dark' ? DarkTheme : DefaultTheme;

  return (
    <NavigationThemeProvider value={navigationTheme}>
      <Stack
        screenOptions={{
          headerRight: () => (
            <View style={{ marginRight: 8 }}>
              <ThemeToggle />
            </View>
          ),
        }}>
        <Stack.Screen name="login" options={{ headerShown: false }} />
        <Stack.Screen name="register" options={{ headerShown: false }} />
        <Stack.Screen name="setup" options={{ headerShown: false }} />
        <Stack.Screen
          name="index"
          options={{
            headerShown: true,
            title: 'Quiz App',
          }}
        />
        <Stack.Screen
          name="quiz"
          options={{
            headerShown: true,
            title: 'Quiz',
          }}
        />
        <Stack.Screen
          name="result"
          options={{
            headerShown: true,
            title: 'Results',
          }}
        />
      </Stack>
      <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
    </NavigationThemeProvider>
  );
}
