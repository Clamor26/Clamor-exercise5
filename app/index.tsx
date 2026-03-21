import { router } from "expo-router";
import React from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { useAuth } from '../contexts/AuthContext';

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  title: { fontSize: 28, marginBottom: 20, color: 'white' },
  button: {
    padding: 15,
    backgroundColor: "#007AFF",
    borderRadius: 8,
    marginTop: 20,
  },
  buttonText: { color: "white", fontSize: 16, textAlign: "center" },
});


export default function HomeScreen() {
  const { user, logout } = useAuth();

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome, {user?.firstName || user?.email}!</Text>
      <TouchableOpacity
        style={styles.button}
        onPress={() => router.push("quiz")}
      >
        <Text style={styles.buttonText}>Start Quiz</Text>
      </TouchableOpacity>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: '#ff4444', marginTop: 10 }]}
        onPress={logout}
      >
        <Text style={styles.buttonText}>Logout</Text>
      </TouchableOpacity>
    </View>
  );
}



