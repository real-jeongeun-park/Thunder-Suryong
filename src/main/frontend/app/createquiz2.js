import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
  Platform,
  Alert,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useNavigation, useRoute } from "@react-navigation/native";
import axios from "axios";
import * as SecureStore from 'expo-secure-store';
import { API_BASE_URL } from "../src/constants";
import { useData } from "@/context/DataContext";

export default function CreateQuizSelectType() {
  const router = useRouter();
  const [userInfo, setUserInfo] = useState(null);
  const [problemName, setProblemName] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const { data, setData } = useData();

  const { selectedNotes, inputText } = data;

  let parsedSelectedNotes = [];

  try {
    if (selectedNotes) {
      parsedSelectedNotes = JSON.parse(selectedNotes);
    }
  } catch (e) {
    console.error("JSON 파싱 실패:", e);
    parsedSelectedNotes = [];
  }

  const questionTypeOptions = [
    { id: 1, name: "주관식" },
    { id: 2, name: "객관식" },
    { id: 3, name: "O/X 문제" },
  ];

  // 로그인 여부 체크
  useEffect(() => {
      async function checkLogin() {
        try {
          let token;

          if (Platform.OS === "web") {
            token = localStorage.getItem("accessToken");
          } else {
            token = await SecureStore.getItemAsync("accessToken");
          }

          if (!token) throw new Error("Token not found");
          const res = await axios.get(`${API_BASE_URL}/api/validation`, {
            headers: {
              Authorization: `Bearer ${token}`,
            },
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

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleRemoveNote = (noteId) => {
    setSelectedNotes((prev) => prev.filter((note) => note.id !== noteId));
  };

  const handleRemoveText = () => setInputText("");


  const closeModalAndGoBack = () => {
    setShowModal(false);
    router.back();
  };

  const handleGenerateQuiz = async () => {
    if (!userInfo || !userInfo.nickname) {
      Alert.alert("잠시만요", "로그인 정보를 불러오는 중입니다. 다시 시도해주세요.");
      return;
    }

    if (selectedTypes.length === 0) {
        Alert.alert("알림", "적어도 하나의 문제 유형을 선택해주세요!");
        return;
      }

    const selectedTypeNames = selectedTypes.map((id) => {
      const found = questionTypeOptions.find((t) => t.id === id);
      return found?.name;
    });

    const payload = {
      noteIds: noteIds,
      quizTitle: problemName.trim() === "" ? "새로운 문제지" : problemName.trim(),
      problemCount: parseInt(questionCount) || 5,
      problemTypes: selectedTypeNames,
      nickname: userInfo?.nickname,
      inputText: inputText.trim(),
    };

    console.log(" payload 확인:", payload);  // 삭제하기

    try {
      const response = await axios.post(
        "http://localhost:8080/api/quiz/generate",
        { payload, }
      );
      const quizList = response.data;

      // 🔧 문자열 리스트 → 객체 리스트로 변환
      const parsedQuizList = quizList.map((item) => {
        const parts = item.split("@@");

        const question = parts[0]?.trim();
        const isSubjective = parts.length === 3;  // 주관식은 @@정답@@해설 형식

        let options = "";
        let answer = "";
        let solution = "";
        let type = "subjective";

        if (isSubjective) {
          // 주관식: 문제@@정답@@해설
          answer = parts[1]?.trim();
          solution = parts[2]?.trim();
        } else {
          // 객관식/ox: 문제@@보기@@정답@@해설
          options = parts[1]?.trim();
          answer = parts[2]?.trim();
          solution = parts[3]?.trim();

          if (options.toUpperCase() === "O|X") {
            type = "ox";
          } else if (options.includes("|")) {
            type = "objective";
          }
        }

        return {
          question: `${question}${options ? "@@" + options : ""}`,
          correctAnswer: [answer] || [], // 백엔드의 answer 필드 사용
          solution: solution,
          type: type,
        };
      });

      router.push({
        pathname: "/createdquiz",
        params: {
          quizList: encodeURIComponent(JSON.stringify(parsedQuizList)),
          problemName: problemName.trim() === "" ? "새로운 문제지" : problemName.trim(),
          questionCount: (parseInt(questionCount) || 5).toString(),
          selectedTypes: encodeURIComponent(JSON.stringify(selectedTypes)),
          noteIds: encodeURIComponent(JSON.stringify(noteIds)),
        },
      });
    } catch (error) {
      console.error("퀴즈 생성 오류:", error);
      Alert.alert("오류", "퀴즈 생성에 실패했어요!");
    }
  };

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="chevron-back-outline" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>문제 유형 선택</Text>
        </View>

        <Text style={styles.subHeader}>선택된 노트</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {Array.isArray(parsedSelectedNotes) && parsedSelectedNotes.map((note, idx) => (
            <View key={idx} style={styles.selectedNoteBox}>
              <Text style={styles.selectedNoteText}>{note.folderName} - {note.noteTitle}</Text>
              <TouchableOpacity onPress={() => handleRemoveNote(note.noteId)}>
                <Ionicons name="close-circle" size={18} color="#fff" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {inputText && (
          <View style={styles.inputTextBox}>
            <View style={styles.inputTextHeader}>
              <Text style={styles.inputTextLabel}>직접 입력한 내용</Text>
              <TouchableOpacity onPress={handleRemoveText}>
                <Ionicons name="close-circle" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.inputTextArea}
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
          </View>
        )}

        <Text style={styles.subHeader}>문제지 이름 설정</Text>
        <TextInput
          style={styles.input}
          value={problemName}
          onChangeText={setProblemName}
          placeholder="문제지 이름을 입력해주세요"
          maxLength={20}
        />
        <Text style={styles.charCount}>{problemName.length} / 20</Text>

        <Text style={styles.subHeader}>문제 유형 선택</Text>
        <View style={styles.typesWrap}>
          {questionTypeOptions.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeBtn, selectedTypes.includes(type.id) && styles.typeBtnSelected]}
              onPress={() => toggleType(type.id)}
            >
              <Text
                style={[styles.typeText, selectedTypes.includes(type.id) && styles.typeTextSelected]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subHeader}>문제 수 선택</Text>
        <TextInput
          style={styles.input}
          value={questionCount}
          onChangeText={setQuestionCount}
          placeholder="생성할 문제 수를 입력해주세요"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.submitButton} onPress={handleGenerateQuiz}>
          <Text style={styles.submitButtonText}>완료</Text>
        </TouchableOpacity>
      </View>

      <Modal
        transparent
        animationType="fade"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModalAndGoBack}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalText}>노트를 선택하거나{"\n"}내용을 입력해주세요!</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
    marginTop: 50,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginTop: 30,
  },
  selectedNoteBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BA94CC",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedNoteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  inputTextBox: {
    backgroundColor: "#f4edfd",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  inputTextHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inputTextLabel: {
    fontWeight: "600",
    color: "#fff",
  },
  inputTextArea: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 15,
    height: 42,
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontSize: 12,
    color: "#999",
  },
  typesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  typeBtn: {
    width: 108,
    height: 33,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#BA94CC",
    justifyContent: "center",
    alignItems: "center",
  },
  typeBtnSelected: {
    backgroundColor: "#BA94CC",
  },
  typeText: {
    color: "#BA94CC",
    fontWeight: "500",
  },
  typeTextSelected: {
    color: "#fff",
  },
  submitButton: {
    marginTop: 40,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
});