import React, { useState } from "react";
import {
    Alert,
    FlatList,
    ScrollView,
    StyleSheet,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { Question, QuestionType, useQuiz } from "./QuizContext";

export default function QuizSettingsTab() {
  const {
    questions,
    addQuestion,
    editQuestion,
    deleteQuestion,
    timer,
    setTimer,
  } = useQuiz();
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState<number | null>(null);
  const [formData, setFormData] = useState<Partial<Question>>({
    type: "multiple",
    question: "",
    choices: { A: "", B: "", C: "", D: "" },
    answer: "A",
  });

  const handleAddNew = () => {
    setEditingId(null);
    setFormData({
      type: "multiple",
      question: "",
      choices: { A: "", B: "", C: "", D: "" },
      answer: "A",
    });
    setShowForm(true);
  };

  const handleEdit = (question: Question) => {
    setEditingId(question.id);
    setFormData(question);
    setShowForm(true);
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
    Alert.alert("Delete Question", "Are you sure?", [
      { text: "Cancel", onPress: () => {} },
      {
        text: "Delete",
        onPress: () => {
          deleteQuestion(id);
          Alert.alert("Success", "Question deleted");
        },
      },
    ]);
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

  return (
    <ScrollView style={{ flex: 1 }} contentContainerStyle={styles.container}>
      {/* Timer Section */}
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

      {/* Questions List */}
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

      {/* Form */}
      {showForm && (
        <View style={styles.form}>
          <Text style={styles.formTitle}>
            {editingId ? "Edit Question" : "Add New Question"}
          </Text>

          {/* Type Selection */}
          <Text style={styles.label}>Question Type:</Text>
          <View style={styles.typeButtons}>
            {["multiple", "truefalse", "checkbox"].map((type) => (
              <TouchableOpacity
                key={type}
                style={[
                  styles.typeBtn,
                  formData.type === type && styles.typeBtnActive,
                ]}
                onPress={() =>
                  setFormData({
                    ...formData,
                    type: type as QuestionType,
                  })
                }
              >
                <Text
                  style={
                    formData.type === type
                      ? styles.typeBtnTextActive
                      : styles.typeBtnText
                  }
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          {/* Question Text */}
          <Text style={styles.label}>Question:</Text>
          <TextInput
            style={styles.input}
            placeholder="Enter question"
            value={formData.question}
            onChangeText={(text) =>
              setFormData({ ...formData, question: text })
            }
            multiline
          />

          {/* Choices */}
          <Text style={styles.label}>Choices:</Text>
          {formData.choices &&
            Object.entries(formData.choices).map(([key, value]) => (
              <View key={key} style={styles.choiceInput}>
                <Text style={styles.choiceLabel}>{key}:</Text>
                <TextInput
                  style={styles.choiceTextInput}
                  placeholder={`Choice ${key}`}
                  value={value}
                  onChangeText={(text) => updateChoice(key, text)}
                />
              </View>
            ))}

          {/* Answer */}
          <Text style={styles.label}>Correct Answer:</Text>
          <View style={styles.answerButtons}>
            {formData.choices &&
              Object.keys(formData.choices).map((key) => (
                <TouchableOpacity
                  key={key}
                  style={[
                    styles.answerBtn,
                    formData.answer === key && styles.answerBtnActive,
                  ]}
                  onPress={() => setFormData({ ...formData, answer: key })}
                >
                  <Text
                    style={
                      formData.answer === key
                        ? styles.answerBtnTextActive
                        : styles.answerBtnText
                    }
                  >
                    {key}
                  </Text>
                </TouchableOpacity>
              ))}
          </View>

          {/* Form Actions */}
          <View style={styles.formActions}>
            <TouchableOpacity style={styles.saveBtn} onPress={handleSave}>
              <Text style={styles.saveBtnText}>Save</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.cancelBtn}
              onPress={() => setShowForm(false)}
            >
              <Text style={styles.cancelBtnText}>Cancel</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { padding: 15 },
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
  form: {
    backgroundColor: "#f9f9f9",
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    marginBottom: 20,
  },
  formTitle: { fontSize: 16, fontWeight: "bold", marginBottom: 15 },
  label: { fontSize: 14, fontWeight: "600", marginTop: 12, marginBottom: 5 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 10,
    borderRadius: 5,
    fontSize: 14,
  },
  typeButtons: { flexDirection: "row", gap: 8, marginBottom: 10 },
  typeBtn: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
  },
  typeBtnActive: { backgroundColor: "#0288d1", borderColor: "#0288d1" },
  typeBtnText: { color: "#666", fontSize: 12 },
  typeBtnTextActive: { color: "#fff", fontWeight: "bold", fontSize: 12 },
  choiceInput: { flexDirection: "row", alignItems: "center", marginBottom: 8 },
  choiceLabel: { fontWeight: "bold", width: 30, marginRight: 8 },
  choiceTextInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 8,
    borderRadius: 4,
    fontSize: 13,
  },
  answerButtons: { flexDirection: "row", gap: 8, marginBottom: 10 },
  answerBtn: {
    flex: 1,
    padding: 8,
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 5,
    alignItems: "center",
  },
  answerBtnActive: { backgroundColor: "#4CAF50", borderColor: "#4CAF50" },
  answerBtnText: { color: "#666", fontWeight: "bold" },
  answerBtnTextActive: { color: "#fff", fontWeight: "bold" },
  formActions: { flexDirection: "row", gap: 10, marginTop: 15 },
  saveBtn: {
    flex: 1,
    backgroundColor: "#4CAF50",
    padding: 12,
    borderRadius: 5,
  },
  saveBtnText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
  cancelBtn: { flex: 1, backgroundColor: "#999", padding: 12, borderRadius: 5 },
  cancelBtnText: { color: "#fff", fontWeight: "bold", textAlign: "center" },
});
