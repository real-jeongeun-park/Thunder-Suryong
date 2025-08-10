import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  TextInput,
  Modal,
  TouchableWithoutFeedback,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import BottomNavigation from "../components/BottomNavigation";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../src/constants";

export default function QuizScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("퀴즈");
  const [modalVisibleId, setModalVisibleId] = useState(null);
  const inputRef = useRef(null);
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState([]);
  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [newQuizName, setNewQuizName] = useState("");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [isFolderSelectVisible, setIsFolderSelectVisible] = useState(false);

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
        router.push("/");
      }
    }
    checkLogin();
  }, []);

  /// 퀴즈 폴더 가져오기
  /// 퀴즈 폴더 가져오기
  /// 퀴즈 폴더 가져오기

  useEffect(() => {
    const getQuizFolder = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/quizFolder/get`, {
          nickname: userInfo.nickname,
        });

        const mappedFolders = res.data.map((f) => ({
          folderId: f.folderId,
          folderName: f.folderName,
        }));

        setFolders(mappedFolders);
      } catch (err) {
        console.log(err);
      }
    };

    if (userInfo !== null) {
      getQuizFolder();
    }
  }, [userInfo]);

  /// 퀴즈 폴더 생성하기
  /// 퀴즈 폴더 생성하기
  /// 퀴즈 폴더 생성하기

  const handleCreateFolder = async () => {
      const newFolderName = folderName.trim();
      if (newFolderName) {
        try {
          const res = await axios.post(`${API_BASE_URL}/api/quizFolder/create`, {
            nickname: userInfo.nickname,
            folderName: newFolderName,
          });

          const newFolder = {
            folderId: res.data,
            folderName: newFolderName,
          };

          setFolders((prev) => [...prev, newFolder]);
        } catch (e) {
          console.log("failed to store folder name ", e);
        } finally {
          setFolderName("");
          setIsCreatingFolder(false);
        }
      }
    };

  return (
    <SafeAreaWrapper backgroundTop="#ffffffff" backgroundBottom="#ffffffff">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
      >
        <Text style={styles.title}>퀴즈 폴더</Text>

        {folders.length === 0 && !isCreatingFolder ? (
          <>
            <Image
              source={require("../assets/images/emptynote.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyMessage}>
              아직 생성된 퀴즈가 없어요!{"\n"}학습한 내용을 점검해보세요!
            </Text>
          </>
        ) : (
          <ScrollView style={{ marginBottom: 10 }}>
            {folders.map((f, index) => (
              <TouchableOpacity
                key={index}
                style={styles.folderItem}
                onPress={() =>
                  router.push({
                    pathname: "/quiz_folder",
                    params: { folderId: f.folderId },
                  })
                }
              >
                <Feather name="folder" size={20} color="#A18CD1" />
                <Text style={styles.folderText}>{f.folderName}</Text>
              </TouchableOpacity>
            ))}

            {isCreatingFolder && (
              <View style={styles.inputWrapper}>
                <Feather name="folder" size={20} color="#B697F4" />
                <TextInput
                  style={styles.input}
                  placeholder="폴더 이름을 입력하세요."
                  placeholderTextColor="#717171"
                  value={folderName}
                  onChangeText={setFolderName}
                  autoFocus
                  onSubmitEditing={handleCreateFolder}
                  returnKeyType="done"
                />
              </View>
            )}
          </ScrollView>
        )}

        <View style={styles.floatingButtons}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => setIsCreatingFolder(true)}
          >
            <Feather name="folder-plus" size={24} color="#B9A4DA" />
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.circleButton}
            onPress={() => {
              if (folders.length > 0) setIsFolderSelectVisible(true);
              else alert("퀴즈를 생성하려면 먼저 폴더를 만들어주세요!");
            }}
          >
            <Text
              style={{ fontWeight: "800", fontSize: 16, color: "rgb(75 75 75)"}}
            >
               퀴즈
             </Text>
          </TouchableOpacity>
        </View>

        <Modal visible={isFolderSelectVisible} transparent animationType="fade">
          <TouchableWithoutFeedback
            onPress={() => setIsFolderSelectVisible(false)}
          >
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                {/* 하얀 모달 박스 스타일 적용 */}
                <View style={styles.modalContent}>
                  <Text
                    style={{
                      fontSize: 18,
                      fontWeight: "bold",
                      marginBottom: 15,
                    }}
                  >
                    퀴즈를 추가할 폴더를 선택하세요.
                  </Text>
                  {folders.map((f, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.modalFolderItem}
                      onPress={() => {
                        setIsFolderSelectVisible(false);
                        router.push({
                          pathname: "/create_quiz1",
                          params: {
                            folderId: f.folderId,
                          },
                        });
                      }}
                    >
                      <Feather name="folder" size={20} color="#A18CD1" />
                      <Text style={{ marginLeft: 10, fontSize: 16 }}>
                        {f.folderName}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>

        {/* 하단 네비게이션 바 */}
        <BottomNavigation />
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 20,
  },
  title: {
    fontFamily: "Abhaya Libre ExtraBold",
    fontSize: 32,
    fontWeight: "800",
    color: "#3C3C3C",
    marginBottom: 20,
    paddingTop: 20,
  },
  emptyMessage: {
    fontFamily: "Abel",
    fontSize: 24,
    textAlign: "center",
    color: "#3C3C3C",
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FAF7FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE6FA",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 110,
    right: 20,
    flexDirection: "row",
    gap: 10,
  },
  circleButton: {
    width: 47,
    height: 47,
    borderRadius: 23.5,
    borderWidth: 1,
    borderColor: "#ECE4F7",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECE4F7",
  },
  emptyImage: {
    width: 180,
    height: 200,
    alignSelf: "center",
    marginTop: 150,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEE6FA",
    borderRadius: 10,
    backgroundColor: "#FAF7FF",
  },
  folderText: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
  },
  modalFolderItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontSize: 12,
  },
  navTextInactive: {
    color: "#ccc",
  },
  navTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  dotActive: {
    backgroundColor: "#222",
  },
  dotInactive: {
    backgroundColor: "#ccc",
  },
});
