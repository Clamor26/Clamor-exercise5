import AsyncStorage from '@react-native-async-storage/async-storage';
import { router, useLocalSearchParams } from 'expo-router';
import React, { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, StyleSheet, Text, TouchableOpacity, View } from 'react-native';

import { Colors } from '@/constants/theme';
import { useColorScheme } from '@/hooks/use-color-scheme';

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const score = parseInt(params.score as string, 10) || 0;
  const [highScore, setHighScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);
  const colorScheme = useColorScheme() ?? 'light';
  const palette = Colors[colorScheme];

  const loadHighScore = useCallback(async () => {
    try {
      const saved = await AsyncStorage.getItem('HIGH_SCORE');
      const highest = saved ? parseInt(saved, 10) : 0;

      if (score > highest) {
        await AsyncStorage.setItem('HIGH_SCORE', score.toString());
        setHighScore(score);
      } else {
        setHighScore(highest);
      }
    } catch (err) {
      console.error('Error loading high score:', err);
    } finally {
      setLoading(false);
    }
  }, [score]);

  useEffect(() => {
    void loadHighScore();
  }, [loadHighScore]);

  if (loading) {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <ActivityIndicator size="large" color={palette.text} />
        <Text style={[styles.title, { color: palette.text, marginTop: 16 }]}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <Text style={[styles.title, { color: palette.text }]}>Quiz Complete!</Text>
      <Text style={[styles.text, { color: palette.text }]}>Your Score: {score}</Text>
      <Text style={[styles.text, { color: palette.text }]}>High Score: {highScore}</Text>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: palette.tint }]}
        onPress={() => router.replace('/')}>
        <Text style={[styles.buttonLabel, { color: palette.textOnTint }]}>Back to Home</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  title: { fontSize: 28, marginBottom: 20, fontWeight: 'bold' },
  text: { fontSize: 18, marginBottom: 10 },
  button: {
    marginTop: 24,
    paddingVertical: 14,
    paddingHorizontal: 28,
    borderRadius: 10,
  },
  buttonLabel: {
    fontSize: 16,
    fontWeight: '600',
  },
});
