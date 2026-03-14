import { RootStackParamList } from "@/App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useEffect, useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View
} from "react-native";
import { useQuiz } from "./QuizContext";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Quiz">;
};

export default function PreviewQuizTab({ navigation }: Props) {
  const { questions, timer } = useQuiz();
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string | string[]>
  >({});
  const [timeRemaining, setTimeRemaining] = useState<number>(timer);

  const currentQuestion = questions[currentIndex];

  useEffect(() => {
    setTimeRemaining(timer);
  }, [timer]);

  useEffect(() => {
    if (timeRemaining <= 0) {
      handleFinish();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining]);

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? "0" : ""}${secs}`;
  };

  const handleSelect = (choice: string) => {
    if (!currentQuestion) return;

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

    questions.forEach((q) => {
      const userAnswer = selectedAnswers[q.id];

      if (Array.isArray(q.answer)) {
        const sortedUser = ((userAnswer as string[]) || []).slice().sort();
        const sortedCorrect = q.answer.slice().sort();

        if (JSON.stringify(sortedUser) === JSON.stringify(sortedCorrect)) {
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

  const handleFinish = () => {
    const score = calculateScore();
    navigation.navigate("Result", { score });
  };

  if (!currentQuestion) {
    return (
      <View style={styles.container}>
        <Text style={styles.emptyText}>No questions available</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <View style={styles.timerContainer}>
        <Text style={styles.timerLabel}>Time Remaining:</Text>
        <Text style={[styles.timer, timeRemaining < 60 && styles.timerDanger]}>
          {formatTime(timeRemaining)}
        </Text>
      </View>

      <Text style={styles.question}>
        {currentIndex + 1}. {currentQuestion.question}
      </Text>

      {Object.entries(currentQuestion.choices).map(
        ([key, value]: [string, string]) => {
          const answerValue = selectedAnswers[currentQuestion.id];
          const isSelected = Array.isArray(answerValue)
            ? answerValue.includes(key)
            : answerValue === key;

          return (
            <TouchableOpacity
              key={key}
              style={[styles.choice, isSelected && styles.choiceSelected]}
              onPress={() => handleSelect(key)}
            >
              <Text style={isSelected ? styles.selectedText : {}}>
                {key}. {value}
              </Text>
            </TouchableOpacity>
          );
        },
      )}

      <View style={styles.navigation}>
        <TouchableOpacity
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex(currentIndex - 1)}
        >
          <Text style={[styles.navBtn, currentIndex === 0 && styles.disabled]}>
            Previous
          </Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity onPress={handleFinish}>
            <Text style={styles.navBtn}>Finish</Text>
          </TouchableOpacity>
        ) : (
          <TouchableOpacity onPress={() => setCurrentIndex(currentIndex + 1)}>
            <Text style={styles.navBtn}>Next</Text>
          </TouchableOpacity>
        )}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20 },
  timerContainer: {
    alignItems: "center",
    marginBottom: 20,
    padding: 10,
    backgroundColor: "#f0f0f0",
    borderRadius: 5,
  },
  timerLabel: { fontSize: 16, marginBottom: 5 },
  timer: { fontSize: 32, fontWeight: "bold", color: "green" },
  timerDanger: { color: "red" },
  question: { fontSize: 20, marginBottom: 15, fontWeight: "600" },
  choice: {
    padding: 12,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 5,
    borderWidth: 2,
    borderColor: "transparent",
  },
  choiceSelected: {
    backgroundColor: "#b3e5fc",
    borderColor: "#0288d1",
  },
  selectedText: { fontWeight: "bold" },
  navigation: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 20,
  },
  navBtn: { fontSize: 18, color: "blue", fontWeight: "bold", padding: 10 },
  disabled: { color: "#ccc" },
  emptyText: { fontSize: 18, textAlign: "center", marginTop: 50 },
});
