import { RootStackParamList } from "@/App";
import { Question, questions } from "@/app/questions";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import {
    ScrollView,
    StyleSheet,
    Text,
    TouchableOpacity,
    View,
} from "react-native";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Quiz">;
};

export default function QuizScreen({ navigation }: Props) {
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<
    Record<number, string | string[]>
  >({});

  const currentQuestion: Question = questions[currentIndex];

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
        const sortedUser = (userAnswer as string[] || []).sort();
        const sortedCorrect = q.answer.sort();

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

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.question}>
        {currentIndex + 1}. {currentQuestion.question}
      </Text>

      {Object.entries(currentQuestion.choices).map(([key, value]: [string, string]) => (
        <TouchableOpacity
          key={key}
          style={styles.choice}
          onPress={() => handleSelect(key)}
        >
          <Text>
            {key}. {value}
          </Text>
        </TouchableOpacity>
      ))}

      <View style={styles.navigation}>
        <TouchableOpacity
          disabled={currentIndex === 0}
          onPress={() => setCurrentIndex(currentIndex - 1)}
        >
          <Text style={styles.navBtn}>Previous</Text>
        </TouchableOpacity>

        {currentIndex === questions.length - 1 ? (
          <TouchableOpacity
            onPress={() =>
              navigation.navigate("Result", {
                score: calculateScore(),
              })
            }
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

const styles = StyleSheet.create({
  container: { padding: 20 },
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