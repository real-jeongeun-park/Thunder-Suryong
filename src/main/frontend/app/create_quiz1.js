// creatquiz_selectnote.js
import { useEffect, useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  TextInput,
  FlatList,
  Platform,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useData } from "@/context/DataContext";

export default function CreateQuizSelectNote() {
  const router = useRouter();
  const { folderId } = useLocalSearchParams();
  const [openFolder, setOpenFolder] = useState(null);
  const [inputText, setInputText] = useState("");
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const { data, setData } = useData();
  const [showModal, setShowModal] = useState(false);
  const [modalText, setModalText] = useState("");

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

  useEffect(() => {
    const getFoldersAndNotes = async() => {
        try{
            const response = await axios.post(`${API_BASE_URL}/api/folder/getFolderAndNote`, {
                nickname: userInfo.nickname,
            });

            setFolders(response.data);
        } catch(err){
            console.log("failed to load folders and notes ", err);
        }
    }

    if(userInfo !== null){
        getFoldersAndNotes();
    }
  }, [userInfo])

  // 노트 선택 토글 함수
  const toggleNoteSelection = (folderName, noteTitle, noteId) => {
    if(selectedNotes.some(note => note.noteId === noteId)){
        setSelectedNotes(selectedNotes.filter(note => note.noteId !== noteId));
    } else{
        setSelectedNotes([...selectedNotes, { folderName, noteTitle, noteId }]);
    }
  };

  // 선택 해제 함수 (엑스 버튼)
  const removeSelectedNote = (noteId) => {
    setSelectedNotes(selectedNotes.filter((note) => note.noteId !== noteId));
  };

  // 선택 완료 시
  const handleSelectComplete = () => {
    if(!selectedNotes || selectedNotes.length === 0){
        setModalText("하나 이상의 노트를 선택하세요.");
        setShowModal(true);
        return;
    }

    setData((prev) => ({
        ...prev,
        selectedNotes: JSON.stringify(selectedNotes),
        inputText,
        folderId,
    }));

    router.push("/create_quiz2");
  }

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back-outline" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>노트 선택 또는 내용 입력</Text>
      </View>

      {/* 폴더와 노트 리스트 스크롤 */}
      <ScrollView
        style={{ maxHeight: 300 }}
        contentContainerStyle={styles.scrollContent}
      >
        {/* 폴더 리스트 */}
        {folders.map((folder, idx) => (
          <View key={idx} style={{ marginBottom: 10 }}>
            <TouchableOpacity
              style={styles.folderBox}
              onPress={() => setOpenFolder(openFolder === idx ? null : idx)}
            >
              <Text style={styles.folderText}>{folder.folderName}</Text>
            </TouchableOpacity>

            {/* 해당 폴더가 열려 있을 때만 노트 목록 표시 */}
            {openFolder === idx &&
              folder.noteTitles.map((noteTitle, noteIdx) => {
                const noteId = folder.noteIds[noteIdx];
                const selected = selectedNotes.some(note => note.noteId === noteId);
                return (
                  <TouchableOpacity
                    key={noteIdx}
                    style={[
                      styles.noteBox,
                      selected && styles.noteBoxSelected,
                    ]}
                    onPress={() => toggleNoteSelection(folder.folderName, noteTitle, folder.noteIds[noteIdx])}
                    activeOpacity={0.7}
                  >
                    <Ionicons
                      name="document-text"
                      size={18}
                      color="#BA94CC"
                      style={{ marginRight: 8 }}
                    />
                    <Text style={styles.noteText}>{noteTitle}</Text>
                  </TouchableOpacity>
                );
              })}
          </View>
        ))}
        </ScrollView>

        {/* 노트 없이 문제 생성 */}
        <View style={styles.customInputBox}>
          <Text style={styles.customInputLabel}>
            📌 추가로 입력하고자 하는 공부 분량이 있다면 자유롭게 적어보세요.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="내용을 입력하세요..."
            multiline
            scrollEnabled={true}
            value={inputText}
            onChangeText={setInputText}
          />
        </View>

      {/* 선택한 노트 가로 스크롤 영역 (선택 버튼 바로 위) */}
      {selectedNotes.length > 0 && (
        <View style={styles.selectedNotesContainer}>
          <FlatList
            horizontal
            data={selectedNotes}
            keyExtractor={(item) => item.noteId}
            showsHorizontalScrollIndicator={false}
            renderItem={({ item }) => {
              return (
                <View style={styles.selectedNoteBox}>
                  <Text style={styles.selectedNoteText}>{item.folderName} - {item.noteTitle}</Text>
                  <TouchableOpacity
                    onPress={() => removeSelectedNote(item.noteId)}
                    hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                    style={styles.removeIcon}
                  >
                    <Ionicons name="close-circle" size={20} color="#fff" />
                  </TouchableOpacity>
                </View>
              );
            }}
          />
        </View>
      )}

      {/* 하단 선택 버튼 */}
      <TouchableOpacity
        style={styles.selectButton}
        activeOpacity={0.8}
        onPress={handleSelectComplete}
      >
        <Text style={styles.selectButtonText}>선택 완료</Text>
      </TouchableOpacity>
      
      <Modal
        transparent
        animationType="fade"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={() => { setShowModal(false) }}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalText}>{modalText}</Text>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 30,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    marginTop: 30,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "600",
    marginLeft: 10,
  },
  scrollContent: {
    paddingBottom: 20, // 선택 버튼+선택 노트 공간 고려
  },
  folderBox: {
    backgroundColor: "#f4edfd",
    borderWidth: 1,
    borderColor: "#FAF8FD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 8,
  },
  folderText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#5C3D99",
  },
  noteBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#ffffff",
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderLeftWidth: 3,
    borderColor: "#BA94CC",
    marginBottom: 4,
    marginLeft: 10,
  },
  noteBoxSelected: {
    backgroundColor: "#D9CAEB",
  },
  noteText: {
    fontSize: 15,
    color: "#3C3C3C",
  },
  customInputBox: {
    backgroundColor: "#FAF8FD",
    borderRadius: 10,
    padding: 15,
    marginBottom: 60,
  },
  customInputLabel: {
    fontSize: 16,
    color: "#3C3C3C",
    marginBottom: 10,
    fontWeight: 600,
    paddingHorizontal: 10,
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D9CAEB",
    borderRadius: 8,
    padding: 10,
    height: 100,
    textAlignVertical: "top",
  },
  selectedNotesContainer: {
    marginVertical: 10,
    marginBottom: 10,
    left: 5,
    right: 20,
    minHeight: 40,
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
  removeIcon: {
    marginLeft: 6,
  },
  selectButton: {
    height: 50,
    backgroundColor: "#000",
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
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
});