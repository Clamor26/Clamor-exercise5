import type { Question } from "@/app/questions";
import { questions } from "@/app/questions";
import { router } from "expo-router";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";

const styles = StyleSheet.create({
  container: { padding: 20, flex: 1 },
  title: { fontSize: 28, marginBottom: 20, textAlign: "center" },
  question: { fontSize: 20, marginBottom: 15 },
  choice: {
    padding: 10,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 5,
  },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navBtn: { fontSize: 18, color: "blue" },
});

export default function QuizScreen() {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string | string[]>
  >({});
  const [started, setStarted] = useState(false);

  if (!started) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>Quiz App</Text>
        <TouchableOpacity
          onPress={() => setStarted(true)}
          style={{ marginTop: 20 }}
        >
          <Text style={{ fontSize: 18, color: "blue" }}>Start Quiz</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const currentQuestion: Question | undefined = questions?.[currentIndex];

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.title}>No questions available.</Text>
      </View>
    );
  }

  const handleSelect = (choice: string) => {
    if (currentQuestion.type === "checkbox") {
      const existing = (selectedAnswers[currentQuestion.id] as string[]) || [];
      if (existing.includes(choice)) {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion.id]: existing.filter((c) => c !== choice),
        });
      } else {
        setSelectedAnswers({
          ...selectedAnswers,
          [currentQuestion.id]: [...existing, choice],
        });
      }
    } else {
      setSelectedAnswers({
        ...selectedAnswers,
        [currentQuestion.id]: choice,
      });
    }
  };

  const calculateScore = (): number => {
    let score = 0;

    questions.forEach((q: Question) => {
      const userAnswer = selectedAnswers[q.id];

      if (Array.isArray(q.answer)) {
        const sortedUser = (userAnswer as string[]) || [];
        const sortedCorrect = [...q.answer].sort();
        const sortedUserCopy = [...sortedUser].sort();

        if (JSON.stringify(sortedUserCopy) === JSON.stringify(sortedCorrect)) {
          score++;
        }
      } else {
        if (userAnswer === q.answer) {
          score++;
        }
      }
    });

    return score;
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.question}>
        {currentIndex + 1}. {currentQuestion.question}
      </Text>

      {Object.entries(currentQuestion.choices).map(
        ([key, value]: [string, string]) => (
          <TouchableOpacity
            key={key}
            style={styles.choice}
            onPress={() => handleSelect(key)}
          >
            <Text>
              {key}. {value}
            </Text>
          </TouchableOpacity>
        )
      )}

      <View style={styles.navigation}>
        <TouchableOpacity
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex(currentIndex - 1)}
        >
          <Text style={styles.navBtn}>Previous</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            onPress={() => {
              const score = calculateScore();
              router.navigate({
                pathname: "result" as any,
                params: { score: score.toString() },
              });
            }}
          >
            <Text style={styles.navBtn}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity
            onPress={() => setCurrentIndex(currentIndex + 1)}
          >
            <Text style={styles.navBtn}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}
