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
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { useData } from "@/context/DataContext";

export default function CreateQuizSelectNote() {
  const router = useRouter();
  const [openFolder, setOpenFolder] = useState(null);
  const [inputText, setInputText] = useState("");
  const [selectedNotes, setSelectedNotes] = useState([]);
  const [folders, setFolders] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const { data, setData } = useData();

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

  return (
    <View style={styles.container}>
      {/* 상단 헤더 */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="arrow-back" size={24} color="black" />
        </TouchableOpacity>
        <Text style={styles.headerText}>노트 선택 또는 내용 입력</Text>
      </View>

      {/* 폴더와 노트 리스트 스크롤 */}
      <ScrollView contentContainerStyle={styles.scrollContent}>
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

        {/* 노트 없이 문제 생성 */}
        <View style={styles.customInputBox}>
          <Text style={styles.customInputLabel}>
            노트 없이도 문제 생성이 가능해요!{"\n"}
            문제로 만들고 싶은 내용을 적어보세요.
          </Text>
          <TextInput
            style={styles.input}
            placeholder="내용을 입력하세요..."
            multiline
            value={inputText}
            onChangeText={setInputText}
          />
        </View>
      </ScrollView>

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
                    onPress={() => removeSelectedNote(item)}
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
        onPress={() => {
            if(selectedNotes.length === 0 && !inputText){
                alert("하나 이상의 노트를 선택하거나 문제 내용을 입력하세요.");
                return;
            }

            setData((prev) => ({
                ...prev,
                selectedNotes: JSON.stringify(selectedNotes),
                inputText,
            }));
            router.push("/createquiz2");
        }}
      >
        <Text style={styles.selectButtonText}>선택 완료</Text>
      </TouchableOpacity>
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
    marginBottom: 20,
  },
  headerText: {
    fontSize: 24,
    fontWeight: "600",
    marginLeft: 10,
  },
  scrollContent: {
    paddingBottom: 120, // 선택 버튼+선택 노트 공간 고려
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
    marginTop: 10,
  },
  customInputLabel: {
    fontSize: 16,
    color: "#3C3C3C",
    marginBottom: 10,
    fontWeight: 600,
    textAlign: "center",
  },
  input: {
    backgroundColor: "#fff",
    borderWidth: 1,
    borderColor: "#D9CAEB",
    borderRadius: 8,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  selectedNotesContainer: {
    position: "absolute",
    bottom: 70,
    left: 20,
    right: 20,
    minHeight: 40,
    paddingBottom: 10,
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
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
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
});