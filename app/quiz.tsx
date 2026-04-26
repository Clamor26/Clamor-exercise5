import { Colors } from "@/constants/theme";
import { Question, QuestionType, useQuiz } from "@/screens/QuizContext";
import { useColorScheme } from "@/hooks/use-color-scheme";
import { router } from "expo-router";
import React, { useCallback, useState } from "react";
import { Alert, FlatList, ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from "react-native";

const styles = StyleSheet.create({
  container: { flex: 1 },
  tabBar: {
    flexDirection: "row",
    backgroundColor: "#f0f0f0",
    borderBottomWidth: 1,
    borderBottomColor: "#ddd",
  },
  tab: {
    flex: 1,
    paddingVertical: 12,
    alignItems: "center",
    justifyContent: "center",
  },
  activeTab: {
    backgroundColor: "#fff",
    borderBottomWidth: 3,
    borderBottomColor: "#0288d1",
  },
  tabText: {
    fontSize: 14,
    color: "#666",
    fontWeight: "500",
  },
  activeTabText: {
    color: "#0288d1",
    fontWeight: "bold",
  },
  content: { flex: 1 },
  padding: { padding: 20 },
  title: { fontSize: 28, marginBottom: 20, textAlign: "center" },
  question: { fontSize: 20, marginBottom: 15 },
  choice: {
    padding: 10,
    backgroundColor: "#eee",
    marginBottom: 10,
    borderRadius: 5,
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
  timerSection: {
    backgroundColor: "#f5f5f5",
    padding: 15,
    borderRadius: 8,
    marginBottom: 20,
  },
  sectionTitle: { fontSize: 18, fontWeight: "bold", marginBottom: 10 },
  timerInput: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
    fontSize: 16,
  },
  timerInfo: { fontSize: 14, color: "#666" },
  questionListSection: { marginBottom: 20 },
  emptyText: {
    fontSize: 14,
    color: "#999",
    textAlign: "center",
    marginTop: 10,
  },
  questionItem: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  questionContent: { flex: 1 },
  questionNumber: { fontWeight: "bold", color: "#0288d1" },
  questionText: { fontSize: 14, marginVertical: 5 },
  questionType: { fontSize: 12, color: "#999" },
  actions: { flexDirection: "row", gap: 8 },
  editBtn: {
    backgroundColor: "#4CAF50",
    padding: 8,
    borderRadius: 4,
  },
  deleteBtn: {
    backgroundColor: "#f44336",
    padding: 8,
    borderRadius: 4,
  },
  btnText: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  addBtn: {
    backgroundColor: "#0288d1",
    padding: 15,
    borderRadius: 8,
    alignItems: "center",
  },
  addBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  label: { fontSize: 14, fontWeight: "600", marginBottom: 6 },
});

export default function QuizScreen() {
  const { questions, timer, setTimer, addQuestion, editQuestion, deleteQuestion } = useQuiz();
  const colorScheme = useColorScheme() ?? "light";
  const palette = Colors[colorScheme];
  const borderSubtle = colorScheme === "dark" ? "#444" : "#ddd";
  const tabBarBg = colorScheme === "dark" ? "#252526" : "#f0f0f0";
  const tabActiveBg = colorScheme === "dark" ? "#2d2d30" : "#fff";
  const choiceBg = colorScheme === "dark" ? "#252526" : "#eee";
  const choiceSelectedBg = colorScheme === "dark" ? "#1a3d52" : "#b3e5fc";
  const [activeTab, setActiveTab] = useState<"preview" | "settings">("preview");
  const [currentIndex, setCurrentIndex] = useState<number>(0);
  const [selectedAnswers, setSelectedAnswers] = useState<Record<number, string | string[]>>({});
  const [timeRemaining, setTimeRemaining] = useState<number>(timer);
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>({
    type: "multiple",
    question: "",
    choices: { A: "", B: "", C: "", D: "" },
    answer: "A",
  });
  const settingsScrollRef = React.useRef<ScrollView>(null);

  const currentQuestion = questions[currentIndex];

  React.useEffect(() => {
    setTimeRemaining(timer);
  }, [timer]);

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

  const calculateScore = useCallback((): number => {
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
  }, [questions, selectedAnswers]);

  const handleFinish = useCallback(() => {
    const score = calculateScore();
    router.push(`/result?score=${score}`);
  }, [calculateScore]);

  React.useEffect(() => {
    if (activeTab !== "preview") return;

    if (timeRemaining <= 0) {
      handleFinish();
      return;
    }

    const interval = setInterval(() => {
      setTimeRemaining((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(interval);
  }, [timeRemaining, activeTab, handleFinish]);

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      type: "multiple",
      question: "",
      choices: { A: "", B: "", C: "", D: "" },
      answer: "A",
    });
    setShowForm(true);
    settingsScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData(question);
    setShowForm(true);
    settingsScrollRef.current?.scrollTo({ y: 0, animated: true });
  };

  const handleSave = () => {
    if (!formData.question?.trim()) {
      Alert.alert("Error", "Question cannot be empty");
      return;
    }

    if (
      !formData.choices ||
      Object.values(formData.choices).some((c) => !c?.trim())
    ) {
      Alert.alert("Error", "All choices must be filled");
      return;
    }

    if (editingId) {
      editQuestion(editingId, {
        id: editingId,
        type: formData.type as QuestionType,
        question: formData.question,
        choices: formData.choices,
        answer: formData.answer || "A",
      });
      Alert.alert("Success", "Question updated");
    } else {
      const newId = Math.max(...questions.map((q) => q.id), 0) + 1;
      addQuestion({
        id: newId,
        type: formData.type as QuestionType,
        question: formData.question,
        choices: formData.choices,
        answer: formData.answer || "A",
      });
      Alert.alert("Success", "Question added");
    }
    setShowForm(false);
  };

  const handleDelete = (id: number) => {
    // cross-platform confirm fallback
    const confirmed = typeof confirm === "function" ? confirm("Delete question?") : false;
    if (confirmed) {
      deleteQuestion(id);
    }
  };

  const updateChoice = (key: string, value: string) => {
    setFormData({
      ...formData,
      choices: {
        ...formData.choices,
        [key]: value,
      },
    });
  };

  if (!currentQuestion && activeTab === "preview") {
    return (
      <View style={[styles.container, { backgroundColor: palette.background }]}>
        <View style={[styles.tabBar, { backgroundColor: tabBarBg, borderBottomColor: borderSubtle }]}>
          <TouchableOpacity
            style={[styles.tab, styles.activeTab, { backgroundColor: tabActiveBg, borderBottomColor: palette.tint }]}
            onPress={() => setActiveTab("preview")}>
            <Text style={[styles.tabText, styles.activeTabText, { color: palette.tint }]}>Preview Quiz</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.tab} onPress={() => setActiveTab("settings")}>
            <Text style={[styles.tabText, { color: palette.icon }]}>Quiz Settings</Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.content, styles.padding]}>
          <Text style={[styles.title, { color: palette.text }]}>No questions available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={[styles.container, { backgroundColor: palette.background }]}>
      <View style={[styles.tabBar, { backgroundColor: tabBarBg, borderBottomColor: borderSubtle }]}>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "preview" && [
              styles.activeTab,
              { backgroundColor: tabActiveBg, borderBottomColor: palette.tint },
            ],
          ]}
          onPress={() => setActiveTab("preview")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "preview"
                ? [styles.activeTabText, { color: palette.tint }]
                : { color: palette.icon },
            ]}>
            Preview Quiz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[
            styles.tab,
            activeTab === "settings" && [
              styles.activeTab,
              { backgroundColor: tabActiveBg, borderBottomColor: palette.tint },
            ],
          ]}
          onPress={() => setActiveTab("settings")}>
          <Text
            style={[
              styles.tabText,
              activeTab === "settings"
                ? [styles.activeTabText, { color: palette.tint }]
                : { color: palette.icon },
            ]}>
            Quiz Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === "preview" ? (
          <ScrollView contentContainerStyle={styles.padding}>
            <View style={[styles.timerContainer, { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f0f0f0" }]}>
              <Text style={[styles.timerLabel, { color: palette.text }]}>Time Remaining:</Text>
                <Text
                  style={[
                    styles.timer,
                    { color: timeRemaining < 60 ? "#ff6b6b" : colorScheme === "dark" ? "#7bed9f" : "green" },
                  ]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>

            <Text style={[styles.question, { color: palette.text }]}>
              {currentIndex + 1}. {currentQuestion?.question}
            </Text>

            {currentQuestion && Object.entries(currentQuestion.choices).map(
              ([key, value]: [string, string]) => {
                const answerValue = selectedAnswers[currentQuestion.id];
                const isSelected = Array.isArray(answerValue)
                  ? answerValue.includes(key)
                  : answerValue === key;

                return (
                  <TouchableOpacity
                    key={key}
                    style={[
                      styles.choice,
                      {
                        backgroundColor: isSelected ? choiceSelectedBg : choiceBg,
                        borderWidth: 1,
                        borderColor: isSelected ? palette.tint : borderSubtle,
                      },
                    ]}
                    onPress={() => handleSelect(key)}>
                    <Text style={[{ color: palette.text }, isSelected && styles.selectedText]}>
                      {key}. {value}
                    </Text>
                  </TouchableOpacity>
                );
              }
            )}

            <View style={styles.navigation}>
                <TouchableOpacity
                disabled={currentIndex === 0}
                onPress={() => setCurrentIndex(currentIndex - 1)}
              >
                <Text
                  style={[
                    styles.navBtn,
                    { color: palette.tint },
                    currentIndex === 0 && { color: palette.icon, opacity: 0.45 },
                  ]}>
                  Previous
                </Text>
              </TouchableOpacity>

              {currentIndex === questions.length - 1 ? (
                <TouchableOpacity onPress={handleFinish}>
                  <Text style={[styles.navBtn, { color: palette.tint }]}>Finish</Text>
                </TouchableOpacity>
              ) : (
                <TouchableOpacity onPress={() => setCurrentIndex(currentIndex + 1)}>
                  <Text style={[styles.navBtn, { color: palette.tint }]}>Next</Text>
                </TouchableOpacity>
              )}
            </View>
          </ScrollView>
        ) : (
          <ScrollView ref={settingsScrollRef} style={{ flex: 1 }} contentContainerStyle={styles.padding}>
            {showForm && (
              <View style={[styles.timerSection, { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5" }]}>
                <Text style={[styles.sectionTitle, { color: palette.text }]}>
                  {editingId ? "Edit Question" : "Add New Question"}
                </Text>

                <Text style={[styles.label, { color: palette.text }]}>Question Type:</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  {(["multiple", "truefalse", "checkbox"] as QuestionType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        {
                          flex: 1,
                          padding: 8,
                          borderWidth: 1,
                          borderColor: borderSubtle,
                          borderRadius: 5,
                          alignItems: "center",
                          backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "transparent",
                        },
                        formData.type === type && { backgroundColor: "#0288d1", borderColor: "#0288d1" },
                      ]}
                      onPress={() => setFormData({ ...formData, type })}
                    >
                      <Text
                  style={
                    formData.type === type
                      ? { color: "#fff", fontWeight: "bold", fontSize: 12 }
                      : { color: palette.icon, fontSize: 12 }
                  }>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={[styles.label, { color: palette.text }]}>Question:</Text>
                <TextInput
                  style={[
                    styles.timerInput,
                    {
                      minHeight: 100,
                      textAlignVertical: "top",
                      color: palette.text,
                      backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
                      borderColor: borderSubtle,
                    },
                  ]}
                  placeholder="Enter question"
                  placeholderTextColor={palette.icon}
                  value={formData.question}
                  onChangeText={(text) => setFormData({ ...formData, question: text })}
                  multiline
                />

                <Text style={[styles.label, { color: palette.text }]}>Choices:</Text>
                {formData.choices && Object.entries(formData.choices).map(([key, value]) => (
                  <View key={key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontWeight: "bold", width: 30, marginRight: 8, color: palette.text }}>{key}:</Text>
                    <TextInput
                      style={[
                        styles.timerInput,
                        {
                          flex: 1,
                          marginBottom: 0,
                          color: palette.text,
                          backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
                          borderColor: borderSubtle,
                        },
                      ]}
                      placeholder={`Choice ${key}`}
                      placeholderTextColor={palette.icon}
                      value={value}
                      onChangeText={(text) => updateChoice(key, text)}
                    />
                  </View>
                ))}

                <Text style={[styles.label, { color: palette.text }]}>Correct Answer:</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  {formData.choices && Object.keys(formData.choices).map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        {
                          flex: 1,
                          padding: 8,
                          borderWidth: 1,
                          borderColor: borderSubtle,
                          borderRadius: 5,
                          alignItems: "center",
                          backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "transparent",
                        },
                        formData.answer === key && { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
                      ]}
                      onPress={() => setFormData({ ...formData, answer: key })}
                    >
                      <Text
                        style={
                          formData.answer === key
                            ? { color: "#fff", fontWeight: "bold" }
                            : { color: palette.icon, fontWeight: "bold" }
                        }>
                        {key}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <View style={{ flexDirection: "row", gap: 10, marginTop: 15 }}>
                  <TouchableOpacity style={[{ flex: 1, backgroundColor: "#4CAF50", padding: 12, borderRadius: 5 }]} onPress={handleSave}>
                    <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>Save</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={[{ flex: 1, backgroundColor: "#999", padding: 12, borderRadius: 5 }]}
                    onPress={() => setShowForm(false)}
                  >
                    <Text style={{ color: "#fff", fontWeight: "bold", textAlign: "center" }}>Cancel</Text>
                  </TouchableOpacity>
                </View>
              </View>
            )}

            <View style={[styles.timerSection, { backgroundColor: colorScheme === "dark" ? "#2a2a2a" : "#f5f5f5" }]}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Quiz Timer (seconds)</Text>
              <TextInput
                style={[
                  styles.timerInput,
                  {
                    color: palette.text,
                    backgroundColor: colorScheme === "dark" ? "#1a1a1a" : "#fff",
                    borderColor: borderSubtle,
                  },
                ]}
                placeholder="Enter timer in seconds"
                placeholderTextColor={palette.icon}
                keyboardType="numeric"
                value={timer.toString()}
                onChangeText={(text) => setTimer(parseInt(text) || 300)}
              />
              <Text style={[styles.timerInfo, { color: palette.icon }]}>
                Current: {Math.floor(timer / 60)}m {timer % 60}s
              </Text>
            </View>

            <View style={styles.questionListSection}>
              <Text style={[styles.sectionTitle, { color: palette.text }]}>Questions Management</Text>

              {questions.length === 0 ? (
                <Text style={[styles.emptyText, { color: palette.icon }]}>No questions added yet</Text>
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={questions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View
                      style={[
                        styles.questionItem,
                        {
                          backgroundColor: colorScheme === "dark" ? "#1e1e1e" : "#fff",
                          borderColor: colorScheme === "dark" ? "#444" : "#ddd",
                        },
                      ]}>
                      <View style={styles.questionContent}>
                        <Text style={[styles.questionNumber, { color: palette.tint }]}>Q{item.id}:</Text>
                        <Text style={[styles.questionText, { color: palette.text }]}>{item.question}</Text>
                        <Text style={[styles.questionType, { color: palette.icon }]}>Type: {item.type}</Text>
                      </View>
                      <View style={styles.actions}>
                        <TouchableOpacity
                          style={styles.editBtn}
                          onPress={() => handleEdit(item)}
                        >
                          <Text style={styles.btnText}>Edit</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          style={styles.deleteBtn}
                          onPress={() => handleDelete(item.id)}
                        >
                          <Text style={styles.btnText}>Delete</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  )}
                />
              )}

              <TouchableOpacity style={styles.addBtn} onPress={handleAddNew}>
                <Text style={styles.addBtnText}>+ Add Question</Text>
              </TouchableOpacity>
            </View>

          </ScrollView>
        )}
      </View>
    </View>
  );
}
