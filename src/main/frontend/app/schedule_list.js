// app/exam_list.js (예시 경로)
import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import axios from "axios";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";

export default function ExamListScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets(); // ← Safe Area

  const [userInfo, setUserInfo] = useState(null);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    async function checkLogin() {
      try {
        let token;
        if (Platform.OS === "web") token = localStorage.getItem("accessToken");
        else token = await SecureStore.getItemAsync("accessToken");
        if (!token) throw new Error("Token not found");

        const res = await axios.get(`${API_BASE_URL}/api/validation`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(res.data);
      } catch (err) {
        console.log(err);
        setUserInfo(null);
        router.push("/");
      }
    }
    checkLogin();
  }, []);

  // 시험 가져오기
  useEffect(() => {
    const getExams = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/exam/get`, {
          nickname: userInfo.nickname,
        });

        const { examIds, examNames, defaultExams } = response.data;
        const list = examIds.map((examId, i) => ({
          id: String(examId),
          name: examNames[i],
          isDefault: defaultExams[i],
        }));
        setExams(list);
      } catch (err) {
        console.log(err);
      }
    };
    if (userInfo?.nickname) getExams();
  }, [userInfo]);

  const handleExamPress = async (id) => {
    try {
      await axios.get(`${API_BASE_URL}/api/exam/id`, { params: { id } });
      router.push("/main");
    } catch (e) {
      console.log(e);
    }
  };

  const renderItem = ({ item }) => (
    <TouchableOpacity
      style={[styles.examItem, item.isDefault && styles.defaultExam]}
      onPress={() => handleExamPress(item.id)}
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
      {/* 상단 헤더: SafeArea 반영 */}
      <View style={[styles.titleContainer, { paddingTop: insets.top + 10 }]}>
        <View style={[styles.backButtonContainer, { top: insets.top + 10 }]}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back" size={32} color="#535353" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>시험 목록</Text>
      </View>

      <FlatList
        data={exams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 20, paddingBottom: 20 }}
        ListEmptyComponent={
          <View style={{ padding: 24, alignItems: "center" }}>
            <Text style={{ color: "#888" }}>표시할 시험이 없습니다.</Text>
          </View>
        }
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  titleContainer: {
    backgroundColor: "#F2E9FE",
    paddingBottom: 15,
  },
  backButtonContainer: {
    position: "absolute",
    left: 10,
    // top은 SafeArea로 동적으로 지정
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5A4366",
    marginTop: 10,
    marginLeft: 50, // back 버튼과 간격
  },

  examItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2E9FE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 15,
    borderWidth: 1,
    borderColor: "#E8DDFB",
  },
  defaultExam: {
    backgroundColor: "#fff",
    borderColor: "#9A7DD5",
  },
  examText: {
    fontSize: 16,
    color: "#5A4366",
    fontWeight: "500",
  },
});
