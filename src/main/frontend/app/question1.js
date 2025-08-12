import { Ionicons } from "@expo/vector-icons";
import { useNavigation } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";

import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  ScrollView,
} from "react-native";

import { useData } from "@/context/DataContext";

import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../src/constants";

export default function StudyTimeScreen() {
  const navigation = useNavigation();
  const [hours, setHours] = useState("");
  const [emptyHours, setEmptyHours] = useState(false);
  const router = useRouter();

  const { setData } = useData();

  useEffect(() => {
    async function checkLogin() {
      try {
        let token;

        if (Platform.OS === "web") token = localStorage.getItem("accessToken");
        else token = await SecureStore.getItemAsync("accessToken");

        if (!token) throw new Error("Token not found");

        const res = await axios.get(`${API_BASE_URL}/api/validation`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (err) {
        console.log(err);
        router.push("/");
      }
    }

    checkLogin();
  }, []);

  const selectComplete = () => {
    if (!hours.trim()) {
      setEmptyHours(true);
      return;
    }

    setData((prev) => ({ ...prev, studyTime: hours }));
    router.push("/question2");
  };

  return (
    <TouchableWithoutFeedback
      onPress={() => {
        if (Platform.OS !== "web") Keyboard.dismiss();
      }}
    >
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : "height"} // Android까지 대응
      >
        <View style={styles.backButton}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          keyboardShouldPersistTaps="handled"
        >
          <View style={styles.container}>
            {/* 상단 뒤로가기 */}

            {/* 질문 */}
            <Text style={styles.title}>
              하루에 몇 시간까지 공부할 수 있나요?
            </Text>

            {/* 중앙 입력 영역 */}
            <View style={styles.center}>
              <TextInput
                style={styles.input}
                value={hours}
                placeholder="숫자를 입력해주세요."
                placeholderTextColor="#ccc"
                keyboardType="numeric"
                onChangeText={(text) => {
                  setHours(text);
                  setEmptyHours(false);
                }}
              />
              <Text style={styles.subText}>
                최대 시간을 입력하면 맞춤형으로 계획해드릴게요.
              </Text>
              {emptyHours && (
                <Text style={{ color: "red", marginTop: 10 }}>
                  공부 시간을 입력하세요.
                </Text>
              )}
            </View>

            {/* 하단 버튼들 */}
            <View style={styles.bottomButtons}>
              <TouchableOpacity
                style={styles.confirmButton}
                onPress={selectComplete}
              >
                <Text style={styles.confirmText}>선택 완료</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  router.push("/question4");
                }}
              >
                <Text style={styles.skipText}>나중에 하기</Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 64,
    justifyContent: "space-between",
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
    zIndex: 1,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginBottom: 24,
    marginTop: 32,
  },
  center: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 100, // ← 숫자 조절해서 위치 조정 가능!
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
    color: "#000",
  },
  subText: {
    marginTop: 8,
    color: "#aaa",
    fontSize: 13,
  },
  bottomButtons: {
    paddingBottom: 32,
  },
  confirmButton: {
    backgroundColor: "#B491DD",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipText: {
    marginTop: 16,
    color: "#000",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
});
