import { useTheme as useNavigationTheme } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import { Pressable, StyleSheet } from 'react-native';

import { useTheme } from '@/contexts/ThemeContext';

/** Sun/moon control for the navigation header and auth screens. */
export function ThemeToggle() {
  const { colorScheme, setColorScheme } = useTheme();
  const { colors } = useNavigationTheme();
  const next = colorScheme === 'light' ? 'dark' : 'light';

  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={next === 'dark' ? 'Switch to dark mode' : 'Switch to light mode'}
      onPress={() => setColorScheme(next)}
      style={({ pressed }) => [styles.iconButton, { opacity: pressed ? 0.7 : 1 }]}>
      <Ionicons
        name={colorScheme === 'dark' ? 'moon' : 'sunny'}
        size={22}
        color={colors.text}
      />
    </Pressable>
  );
}

const styles = StyleSheet.create({
  iconButton: {
    padding: 8,
  },
});
