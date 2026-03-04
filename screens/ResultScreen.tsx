import { RootStackParamList } from "@/App";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { RouteProp } from "@react-navigation/native";
import React, { useEffect, useState } from "react";
import { Button, StyleSheet, Text, View } from "react-native";

type Props = {
  route: RouteProp<RootStackParamList, "Result">;
  navigation: any;
};

export default function ResultScreen({ route, navigation }: Props) {
  const { score } = route.params;
  const [highScore, setHighScore] = useState<number>(0);

  useEffect(() => {
    loadHighScore();
  }, []);

  const loadHighScore = async () => {
    const saved = await AsyncStorage.getItem("HIGH_SCORE");
    const highest = saved ? parseInt(saved) : 0;

    if (score > highest) {
      await AsyncStorage.setItem("HIGH_SCORE", score.toString());
      setHighScore(score);
    } else {
      setHighScore(highest);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz Completed!</Text>
      <Text style={styles.score}>Your Score: {score}</Text>
      <Text style={styles.score}>Highest Score: {highScore}</Text>

      <View style={styles.buttonContainer}>
        <Button
          title="Play Again"
          onPress={() => navigation.navigate("Home")}
        />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: "center", alignItems: "center" },
  title: { fontSize: 24, marginBottom: 20 },
  score: { fontSize: 18, marginBottom: 10 },
  buttonContainer: { marginTop: 30, width: "80%" },
});
