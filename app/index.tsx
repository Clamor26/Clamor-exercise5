import { router } from 'expo-router';
import React from 'react';
import { StyleSheet, Text, TouchableOpacity } from 'react-native';

import { ThemedText } from '@/components/themed-text';
import { ThemedView } from '@/components/themed-view';
import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';
import { useAuth } from '../contexts/AuthContext';

export default function HomeScreen() {
  const { user, logout } = useAuth();
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  return (
    <ThemedView style={styles.container}>
      <ThemedText type="title" style={[styles.title, { color: palette.text }]}>
        Welcome, {user?.firstName || user?.email}!
      </ThemedText>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: palette.tint }]}
        onPress={() => router.push('/quiz')}>
        <Text style={[styles.buttonText, { color: palette.textOnTint }]}>Start Quiz</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ff4444', marginTop: 10 }]}
        onPress={logout}>
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </ThemedView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: {
    fontSize: 28,
    marginBottom: 20,
    textAlign: 'center',
  },
  button: {
    padding: 15,
    borderRadius: 8,
    marginTop: 20,
    minWidth: 200,
  },
  buttonText: { fontSize: 16, textAlign: 'center', fontWeight: '600', color: '#fff' },
});
