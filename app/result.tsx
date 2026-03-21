import AsyncStorage from "@react-native-async-storage/async-storage";
import { router, useLocalSearchParams } from "expo-router";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
    backgroundColor: "#000",
  },
  title: { fontSize: 28, marginBottom: 20, color: "white" },
  text: { fontSize: 18, marginBottom: 10, color: "white" },
});

export default function ResultScreen() {
  const params = useLocalSearchParams();
  const score = parseInt(params.score as string) || 0;
  const [highScore, setHighScore] = useState<number>(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHighScore();
  }, []);

  const loadHighScore = async () => {
    try {
      const saved = await AsyncStorage.getItem("HIGH_SCORE");
      const highest = saved ? parseInt(saved) : 0;

      if (score > highest) {
        await AsyncStorage.setItem("HIGH_SCORE", score.toString());
        setHighScore(score);
      } else {
        setHighScore(highest);
      }
    } catch (error) {
      console.error("Error loading high score:", error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Loading...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Complete!</Text>
      <Text style={styles.text}>Your Score: {score}</Text>
      <Text style={styles.text}>High Score: {highScore}</Text>
      <Button
        title="Back to Home"
        onPress={() => router.replace("/")}
      />
    </View>
  );
}
