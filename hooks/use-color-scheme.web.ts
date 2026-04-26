import { useTheme } from '@/contexts/ThemeContext';

/**
 * App color scheme from ThemeContext (light / dark), persisted across sessions.
 */
export function useColorScheme(): 'light' | 'dark' | null {
  const { colorScheme } = useTheme();
  return colorScheme;
}
