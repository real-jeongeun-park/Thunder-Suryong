import { View, Text, StyleSheet, TouchableOpacity, ScrollView } from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";

export default function PastExamsScreen() {
  const router = useRouter();

  const pastExams = [
    { title: "2025 1학기 중간고사", dday: "D+10" },
    { title: "2024 2학기 기말고사", dday: "D+63" },
    { title: "2024 2학기 중간고사", dday: "D+100" },
  ];

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.replace("/mypage")}>
          <Ionicons name="chevron-back" size={24} color="#000" />
        </TouchableOpacity>
        <Text style={styles.title}>나의 시험</Text>
      </View>

      {/* 현재 시험 강조 */}
      <View style={styles.examBoxFocused}>
        <Text style={styles.examTextFocused}>2025 1학기 기말고사</Text>
        <View style={styles.ddayTag}>
          <Text style={styles.ddayText}>D-35</Text>
        </View>
      </View>

      {/* 지난 시험 목록 */}
      {pastExams.map((exam, idx) => (
        <TouchableOpacity
          key={idx}
          style={styles.examBox}
          onPress={() =>
            router.push({
              pathname: "/exam-details",
              params: {
                examTitle: exam.title,
                examDday: exam.dday,
              },
            })
          }
        >
          <Text style={styles.examTextBold}>{exam.title}</Text>
        </TouchableOpacity>
      ))}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    padding: 20,
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
    gap: 8,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
  },
  examBoxFocused: {
    borderWidth: 1.5,
    borderColor: "#9E73D9",
    borderRadius: 12,
    backgroundColor: "#fff",
    padding: 16,
    marginBottom: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  examTextFocused: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#5B2DC5",
  },
  ddayTag: {
    backgroundColor: "#E9E0F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ddayText: {
    fontSize: 12,
    color: "#663399",
  },
  examBox: {
    backgroundColor: "#E4D7F5",
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
  },
  examTextBold: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#000",
  },
});
