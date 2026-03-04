import { DarkTheme, DefaultTheme, ThemeProvider } from '@react-navigation/native';
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import 'react-native-reanimated';

import { useColorScheme } from '@/hooks/use-color-scheme';

export default function RootLayout() {
  const colorScheme = useColorScheme();

  return (
    <ThemeProvider value={colorScheme === 'dark' ? DarkTheme : DefaultTheme}>
      <Stack>
        <Stack.Screen 
          name="index" 
          options={{ 
            headerShown: true,
            title: 'Quiz App'
          }} 
        />
        <Stack.Screen 
          name="quiz" 
          options={{ 
            headerShown: true,
            title: 'Quiz'
          }} 
        />
        <Stack.Screen 
          name="result" 
          options={{ 
            headerShown: true,
            title: 'Results'
          }} 
        />
      </Stack>
      <StatusBar style="auto" />
    </ThemeProvider>
  );
}
