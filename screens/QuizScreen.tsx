import { RootStackParamList } from "@/App";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import React, { useState } from "react";
import { StyleSheet, Text, TouchableOpacity, View } from "react-native";
import PreviewQuizTab from "./PreviewQuizTab";
import QuizSettingsTab from "./QuizSettingsTab";

type Props = {
  navigation: NativeStackNavigationProp<RootStackParamList, "Quiz">;
};

export default function QuizScreen({ navigation }: Props) {
  const [activeTab, setActiveTab] = useState<"preview" | "settings">("preview");

  return (
    <View style={styles.container}>
      {/* Tab Navigation */}
      <View style={styles.tabBar}>
        <TouchableOpacity
          style={[styles.tab, activeTab === "preview" && styles.activeTab]}
          onPress={() => setActiveTab("preview")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "preview" && styles.activeTabText,
            ]}
          >
            Preview Quiz
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.tab, activeTab === "settings" && styles.activeTab]}
          onPress={() => setActiveTab("settings")}
        >
          <Text
            style={[
              styles.tabText,
              activeTab === "settings" && styles.activeTabText,
            ]}
          >
            Quiz Settings
          </Text>
        </TouchableOpacity>
      </View>

      {/* Tab Content */}
      <View style={styles.content}>
        {activeTab === "preview" ? (
          <PreviewQuizTab navigation={navigation} />
        ) : (
          <QuizSettingsTab />
        )}
      </View>
    </View>
  );
}

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
});
