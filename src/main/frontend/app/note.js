// NoteScreen.js

import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../src/constants";

export default function NoteScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("노트");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState([]);

  const [isFolderSelectVisible, setIsFolderSelectVisible] = useState(false);

  const [nickname, setNickname] = useState(null);

  const tabs = [
    { name: "홈", label: "홈" },
    { name: "노트", label: "노트" },
    { name: "퀴즈", label: "퀴즈" },
    { name: "마이페이지", label: "마이페이지" },
  ];

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

        setNickname(res.data.nickname);
      } catch (err) {
        console.log(err);
        router.push("/");
      }
    }
    checkLogin();
  }, []);

  useEffect(() => {
    const getFolder = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/folder/get`, {
          nickname,
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

    if (nickname !== null) {
      getFolder();
    }
  }, [nickname]);

  // 폴더 생성
  const handleCreateFolder = async () => {
    const newFolderName = folderName.trim();
    if (newFolderName) {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/folder/create`, {
          nickname,
          folderName: newFolderName,
        });

        const newFolder = {
          folderId: res.data,
          folderName: newFolderName,
        };

        setFolders((prev) => [...prev, newFolder]);
      } catch (e) {
        console.log("failed to store folder name. For more: ", e);
      } finally {
        setFolderName("");
        setIsCreatingFolder(false);
      }
    }
  };

  return (
    <View style={{ flex: 1 }}>
      {/* SafeArea 위쪽 배경 */}
      <View
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          height: insets.top,
          backgroundColor: "#ffffffff", // 상단 배경색
          zIndex: 10,
        }}
      />

      {/* SafeArea 아래쪽 배경 */}
      <View
        style={{
          position: "absolute",
          bottom: 0,
          left: 0,
          right: 0,
          height: insets.bottom,
          backgroundColor: "#ffffffff", // 하단 배경색
          zIndex: 10,
        }}
      />

      {/* 전체 본문에 SafeAreaInsets 적용! */}
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.container,
          {
            paddingTop: insets.top,
            paddingBottom: insets.bottom,
            //paddingHorizontal: 20,
          },
        ]}
      >
        <Text style={styles.title}>학습 폴더</Text>

        {folders.length === 0 && !isCreatingFolder ? (
          <>
            <Image
              source={require("../assets/images/emptynote.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyMessage}>아직 생성된 폴더가 없어요!</Text>
          </>
        ) : (
          <ScrollView style={{ marginHorizontal: 20, marginBottom: 10 }}>
            {folders.map((f, index) => (
              <TouchableOpacity
                key={index}
                style={styles.folderItem}
                onPress={() =>
                  router.push({
                    pathname: "/notefolder",
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
              else alert("먼저 폴더를 생성해주세요!");
            }}
          >
            <Feather name="file-plus" size={24} color="#B9A4DA" />
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
                    노트를 추가할 폴더를 선택하세요.
                  </Text>
                  {folders.map((f, idx) => (
                    <TouchableOpacity
                      key={idx}
                      style={styles.modalFolderItem}
                      onPress={() => {
                        setIsFolderSelectVisible(false);
                        router.push({
                          pathname: "/notefolder",
                          params: {
                            folderId: f.folderId,
                            openAddNote: "true",
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

        {/* 하단 네비게이션 바 (안전영역 인셋 반영) */}
        <View
          style={[
            styles.bottomNav,
            {
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              paddingBottom: insets.bottom,
              height: 70 + insets.bottom,
            },
          ]}
        >
          {tabs.map((tab, index) => (
            <TouchableOpacity
              key={index}
              style={styles.navItem}
              onPress={() => {
                setActiveTab(tab.name);
                if (tab.name === "노트") router.push("/note");
                else if (tab.name === "퀴즈") router.push("/quiz");
                else if (tab.name === "마이페이지") router.push("/mypage");
                else if (tab.name === "홈") router.push("/main");
              }}
            >
              <View
                style={[
                  styles.dot,
                  activeTab === tab.name
                    ? styles.dotActive
                    : styles.dotInactive,
                ]}
              />
              <Text
                style={[
                  styles.navText,
                  activeTab === tab.name
                    ? styles.navTextActive
                    : styles.navTextInactive,
                ]}
              >
                {tab.label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </KeyboardAvoidingView>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
  },
  title: {
    fontFamily: "Abhaya Libre ExtraBold",
    fontSize: 32,
    fontWeight: "800",
    color: "#3C3C3C",
    marginLeft: 23,
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
