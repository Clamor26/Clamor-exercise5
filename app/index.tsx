import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 28, marginBottom: 20 },
  button: {
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 16, textAlign: "center" },
});

export default function HomeScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quiz App</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("quiz")}
      >
        <Text style={styles.buttonText}>Start Quiz</Text>
      </TouchableOpacity>
    </View>
  );
}
