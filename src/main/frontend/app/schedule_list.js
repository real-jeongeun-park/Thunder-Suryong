import React from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 아이콘 라이브러리 사용(선택)
import { useRouter } from "expo-router";

const examList = [
  { id: "1", name: "2025 1학기 기말고사" },
  { id: "2", name: "2024 2학기 기말고사" },
  { id: "3", name: "2024 2학기 중간고사" },
];

const router = useRouter();

const ExamListScreen = () => {
  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.examItem, index === 0 && styles.firstExam]}
    >
      <Ionicons
        name="document-text-outline"
        size={22}
        color="#9A7DD5"
        style={{ marginRight: 10 }}
      />
      <Text style={styles.examText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="chevron-back" size={32} color="#535353" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>나의 시험</Text>
      </View>
      <FlatList
        data={examList}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    //paddingTop: 60,
  },
  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  titleContainer: {
    backgroundColor: "#F2E9FE",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5A4366",
    marginTop: 10,
    marginLeft: 50,
  },
  examItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2E9FE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 15,
  },
  firstExam: {
    backgroundColor: "#fff",
    borderColor: "#9A7DD5",
    borderWidth: 1,
  },
  examText: {
    fontSize: 16,
    color: "#5A4366",
    fontWeight: "500",
  },
});

export default ExamListScreen;
