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
  Image,
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
  const [questionName, setQuestionName] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const [modalRealText, setModalRealText] = useState("");
  const { data, setData } = useData();
  const [isLoading, setIsLoading] = useState(false);

  const { selectedNotes, inputText, folderId } = data;
  const [parsedSelectedNotes, setParsedSelectedNotes] = useState([]);
  const [realInputText, setRealInputText] = useState("");

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

  // notes parse
  useEffect(() => {
        const parseNotes = () => {
            try{
                if(selectedNotes){
                    setParsedSelectedNotes(JSON.parse(selectedNotes));
                }
                else{
                    setParsedSelectedNotes([]);
                }
            } catch(e){
                console.log("failed to parse selected notes ", e);
                setParsedSelectedNotes([]);
            }
        };

        if(userInfo !== null){
            parseNotes();
        }
  }, [userInfo, selectedNotes])

  // inputText 설정
  useEffect(() => {
    const setRealText = () => {
        if(inputText && inputText !== ""){
            setRealInputText(inputText);
        } else{
            setRealInputText("");
        }
    }
    if(userInfo !== null){
        setRealText();
    }
  }, [userInfo, inputText])

  const handleRemoveNote = (noteId) => {
        setParsedSelectedNotes((prev) => prev.filter((note) => note.noteId !== noteId));
  };

  const handleRemoveText = () => setRealInputText("");

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  // 퀴즈 생성 버튼 클릭 시
  const handleGenerateQuiz = async () => {
    if(!questionName.trim()){
        setModalRealText("문제지 이름을 입력해 주세요!");
        setShowModal(true);
        return;
    }

    if(selectedTypes.length === 0) {
        setModalRealText("적어도 하나의 문제 유형을 선택해 주세요!");
        setShowModal(true);
        return;
    }

    if(!questionCount || parseInt(questionCount) <= 0){
        setModalRealText("문제 수를 정확히 입력하세요.");
        setShowModal(true);
        return;
    }

    if(parsedSelectedNotes.length > 0){
        setIsLoading(true);

        const selectedTypeNames = selectedTypes.map((id) => {
            const found = questionTypeOptions.find((t) => t.id === id);
            return found?.name;
        });
        const noteIds = parsedSelectedNotes.map((note) => {
            return note.noteId;
        });

        const infoForQuestion = {
            noteIds,
            quizTitle: questionName.trim(),
            problemTypes: selectedTypeNames,
            problemCount: parseInt(questionCount),
            nickname: userInfo.nickname,
            inputText: realInputText,
            folderId,
        }

        try{
            const res = await axios.post(`${API_BASE_URL}/api/quiz/create`, infoForQuestion);

            setData((prev) => ({
                ...prev,
                questionName,
                questionCount,
                quizId: res.data,
            }));

            setIsLoading(false);
            router.push("/quiz");
        } catch(e){
            console.log("failed to generate quiz ", e);
        }
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


        <View style={styles.scrollContent}>
          { parsedSelectedNotes.length > 0 && (
            <View>
              <Text style={styles.subHeader}>선택된 노트</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
                {parsedSelectedNotes.length > 0 && parsedSelectedNotes.map((note, idx) => (
                  <View key={idx} style={styles.selectedNoteBox}>
                    <Text style={styles.selectedNoteText}>{note.folderName} - {note.noteTitle}</Text>
                    <TouchableOpacity onPress={() => handleRemoveNote(note.noteId)}>
                      <Ionicons name="close-circle" size={18} color="#fff" style={{ marginLeft: 5 }} />
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            </View>
          )}

          {realInputText && (
            <View>
              <View style={styles.customInputBox}>
                <Text style={styles.subHeader}>직접 입력한 내용</Text>
                <TouchableOpacity onPress={handleRemoveText}>
                  <Ionicons name="close-circle" size={18} color="#BA94CC"/>
                </TouchableOpacity>
              </View>
              <TextInput
                style={styles.customInput}
                multiline
                value={realInputText}
                onChangeText={setRealInputText}
              />
            </View>
          )}
          <View>
              <Text style={[styles.subHeader, { marginTop: 30, } ]}>문제지 이름</Text>
              <TextInput
                style={styles.input}
                value={questionName}
                onChangeText={setQuestionName}
                placeholder="문제지 이름을 입력해 주세요."
                maxLength={20}
              />
              <Text style={styles.charCount}>{questionName.length} / 20</Text>
          </View>
          <Text style={[styles.subHeader, { marginTop: 30, } ]}>문제 유형</Text>
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
          <View>
              <Text style={[styles.subHeader, { marginTop: 30, } ]}>문제 수</Text>
              <TextInput
                style={styles.input}
                value={questionCount}
                onChangeText={setQuestionCount}
                placeholder="생성할 문제 수를 입력해 주세요."
                placeholderTextColor="CCC"
                keyboardType="numeric"
              />
          </View>
        </View>

        <View style={styles.footer}>
          <TouchableOpacity style={styles.selectButton} onPress={handleGenerateQuiz}>
            <Text style={styles.selectButtonText}>퀴즈 생성</Text>
          </TouchableOpacity>
        </View>

        {isLoading && (
          <View style={styles.loadingOverlay}>
            <Image
                source={require("../assets/images/main.png")}
                style={styles.character}
                resizeMode="contain"
            />
            <Text style={styles.loadingText}>생성 중입니다....</Text>
          </View>
        )}

      <Modal
        transparent
        animationType="fade"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => setShowModal(false)}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalText}>{modalRealText}</Text>
          </View>
        </View>
      </Modal>
    </View>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 80,
    height: "100%",
  },
  scrollContent: {
    paddingBottom: 20,  // 스크롤 안쪽 여백
  },
  footer: {
    paddingVertical: 10,
  },
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingText: {
    color: "white",
    fontSize: 20,
    fontWeight: 300,
  },
  character: {
    width: 170,
    height: 170,
    marginBottom: 20,
    marginRight: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 30,
    marginTop: 40,
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
    width: "100%",
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
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#CCC",
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
  selectButton: {
    height: 53,
    backgroundColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 14,
  },
  selectButtonText: {
    color: "#fff",
    fontSize: 18,
    fontWeight: "700",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    maxWidth: "80%",
    backgroundColor: "#fff",
    borderRadius: 10,
    paddingHorizontal: 40,
    paddingVertical: 30,
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
  customInputBox: {
    marginTop: 30,
    flexDirection: "row",
    alignItems: "center",
  },
  customInput: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D9CAEB",
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
    marginTop: 10,
  },
});