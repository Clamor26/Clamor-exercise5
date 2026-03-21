import { Question, QuestionType, useQuiz } from "@/screens/QuizContext";
import { router } from "expo-router";
import React, { useState } from "react";
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
});

export default function QuizScreen() {
  const { questions, timer, setTimer, addQuestion, editQuestion, deleteQuestion } = useQuiz();
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
  }, [timeRemaining, activeTab]);

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
    router.push(`/result?score=${score}`);
  };

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
    setShowForm(true);    settingsScrollRef.current?.scrollTo({ y: 0, animated: true });  };

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
      <View style={styles.container}>
        <View style={styles.tabBar}>
          <TouchableOpacity
            style={[styles.tab, activeTab === "preview" && styles.activeTab]}
            onPress={() => setActiveTab("preview")}
          >
            <Text style={[styles.tabText, activeTab === "preview" && styles.activeTabText]}>
              Preview Quiz
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[styles.tab, activeTab === "settings" && styles.activeTab]}
            onPress={() => setActiveTab("settings")}
          >
            <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>
              Quiz Settings
            </Text>
          </TouchableOpacity>
        </View>
        <View style={[styles.content, styles.padding]}>
          <Text style={styles.title}>No questions available</Text>
        </View>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "preview" && styles.activeTab]}
          onPress={() => setActiveTab("preview")}
        >
          <Text style={[styles.tabText, activeTab === "preview" && styles.activeTabText]}>
            Preview Quiz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <Text style={[styles.tabText, activeTab === "settings" && styles.activeTabText]}>
            Quiz Settings
          </Text>
        </TouchableOpacity>
      </View>

      <View style={styles.content}>
        {activeTab === "preview" ? (
          <ScrollView contentContainerStyle={styles.padding}>
            <View style={styles.timerContainer}>
              <Text style={styles.timerLabel}>Time Remaining:</Text>
              <Text style={[styles.timer, timeRemaining < 60 && styles.timerDanger]}>
                {formatTime(timeRemaining)}
              </Text>
            </View>

            <Text style={styles.question}>
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
                    style={[styles.choice, isSelected && styles.choiceSelected]}
                    onPress={() => handleSelect(key)}
                  >
                    <Text style={isSelected ? styles.selectedText : {}}>
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
        ) : (
          <ScrollView ref={settingsScrollRef} style={{ flex: 1 }} contentContainerStyle={styles.padding}>
            {showForm && (
              <View style={styles.timerSection}>
                <Text style={styles.sectionTitle}>
                  {editingId ? "Edit Question" : "Add New Question"}
                </Text>

                <Text style={styles.label}>Question Type:</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  {(["multiple", "truefalse", "checkbox"] as QuestionType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        { flex: 1, padding: 8, borderWidth: 1, borderColor: "#ddd", borderRadius: 5, alignItems: "center" },
                        formData.type === type && { backgroundColor: "#0288d1", borderColor: "#0288d1" },
                      ]}
                      onPress={() => setFormData({ ...formData, type })}
                    >
                      <Text style={formData.type === type ? { color: "#fff", fontWeight: "bold", fontSize: 12 } : { color: "#666", fontSize: 12 }}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Question:</Text>
                <TextInput
                  style={[styles.timerInput, { minHeight: 100, textAlignVertical: "top" }]}
                  placeholder="Enter question"
                  value={formData.question}
                  onChangeText={(text) => setFormData({ ...formData, question: text })}
                  multiline
                />

                <Text style={styles.label}>Choices:</Text>
                {formData.choices && Object.entries(formData.choices).map(([key, value]) => (
                  <View key={key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontWeight: "bold", width: 30, marginRight: 8 }}>{key}:</Text>
                    <TextInput
                      style={[styles.timerInput, { flex: 1, marginBottom: 0 }]}
                      placeholder={`Choice ${key}`}
                      value={value}
                      onChangeText={(text) => updateChoice(key, text)}
                    />
                  </View>
                ))}

                <Text style={styles.label}>Correct Answer:</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  {formData.choices && Object.keys(formData.choices).map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        { flex: 1, padding: 8, borderWidth: 1, borderColor: "#ddd", borderRadius: 5, alignItems: "center" },
                        formData.answer === key && { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
                      ]}
                      onPress={() => setFormData({ ...formData, answer: key })}
                    >
                      <Text style={formData.answer === key ? { color: "#fff", fontWeight: "bold" } : { color: "#666", fontWeight: "bold" }}>
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

            <View style={styles.timerSection}>
              <Text style={styles.sectionTitle}>Quiz Timer (seconds)</Text>
              <TextInput
                style={styles.timerInput}
                placeholder="Enter timer in seconds"
                keyboardType="numeric"
                value={timer.toString()}
                onChangeText={(text) => setTimer(parseInt(text) || 300)}
              />
              <Text style={styles.timerInfo}>
                Current: {Math.floor(timer / 60)}m {timer % 60}s
              </Text>
            </View>

            <View style={styles.questionListSection}>
              <Text style={styles.sectionTitle}>Questions Management</Text>

              {questions.length === 0 ? (
                <Text style={styles.emptyText}>No questions added yet</Text>
              ) : (
                <FlatList
                  scrollEnabled={false}
                  data={questions}
                  keyExtractor={(item) => item.id.toString()}
                  renderItem={({ item }) => (
                    <View style={styles.questionItem}>
                      <View style={styles.questionContent}>
                        <Text style={styles.questionNumber}>Q{item.id}:</Text>
                        <Text style={styles.questionText}>{item.question}</Text>
                        <Text style={styles.questionType}>Type: {item.type}</Text>
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

            {showForm && (
              <View style={styles.timerSection}>
                <Text style={styles.sectionTitle}>
                  {editingId ? "Edit Question" : "Add New Question"}
                </Text>

                <Text style={styles.label}>Question Type:</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  {(["multiple", "truefalse", "checkbox"] as QuestionType[]).map((type) => (
                    <TouchableOpacity
                      key={type}
                      style={[
                        { flex: 1, padding: 8, borderWidth: 1, borderColor: "#ddd", borderRadius: 5, alignItems: "center" },
                        formData.type === type && { backgroundColor: "#0288d1", borderColor: "#0288d1" },
                      ]}
                      onPress={() => setFormData({ ...formData, type })}
                    >
                      <Text style={formData.type === type ? { color: "#fff", fontWeight: "bold", fontSize: 12 } : { color: "#666", fontSize: 12 }}>
                        {type}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>

                <Text style={styles.label}>Question:</Text>
                <TextInput
                  style={[styles.timerInput, { minHeight: 100, textAlignVertical: "top" }]}
                  placeholder="Enter question"
                  value={formData.question}
                  onChangeText={(text) => setFormData({ ...formData, question: text })}
                  multiline
                />

                <Text style={styles.label}>Choices:</Text>
                {formData.choices && Object.entries(formData.choices).map(([key, value]) => (
                  <View key={key} style={{ flexDirection: "row", alignItems: "center", marginBottom: 8 }}>
                    <Text style={{ fontWeight: "bold", width: 30, marginRight: 8 }}>{key}:</Text>
                    <TextInput
                      style={[styles.timerInput, { flex: 1, marginBottom: 0 }]}
                      placeholder={`Choice ${key}`}
                      value={value}
                      onChangeText={(text) => updateChoice(key, text)}
                    />
                  </View>
                ))}

                <Text style={styles.label}>Correct Answer:</Text>
                <View style={{ flexDirection: "row", gap: 8, marginBottom: 10 }}>
                  {formData.choices && Object.keys(formData.choices).map((key) => (
                    <TouchableOpacity
                      key={key}
                      style={[
                        { flex: 1, padding: 8, borderWidth: 1, borderColor: "#ddd", borderRadius: 5, alignItems: "center" },
                        formData.answer === key && { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
                      ]}
                      onPress={() => setFormData({ ...formData, answer: key })}
                    >
                      <Text style={formData.answer === key ? { color: "#fff", fontWeight: "bold" } : { color: "#666", fontWeight: "bold" }}>
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
          </ScrollView>
        )}
      </View>
    </View>
  );
}
