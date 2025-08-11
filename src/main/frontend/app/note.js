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
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import BottomNavigation from "../components/BottomNavigation";


export default function NoteScreen() {
  const router = useRouter();
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState([]);
  const [isFolderSelectVisible, setIsFolderSelectVisible] = useState(false);
  const [isNoFolderModalVisible, setIsNoFolderModalVisible] = useState(false);
  const [userInfo, setUserInfo] = useState(null);
  const [moreModalVisible, setMoreModalVisible] = useState(false);
  const [selectedFolderId, setSelectedFolderId] = useState(null);
  const [newFolderRename, setNewFolderRename] = useState("");

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

  useEffect(() => {
    if(userInfo !== null){
        getFolders();
    }
  }, [userInfo]);

  const getFolders = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/folder/get`, {
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

  // 폴더 생성
  const handleCreateFolder = async () => {
    const newFolderName = folderName.trim();
    if (newFolderName) {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/folder/create`, {
          nickname: userInfo.nickname,
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

  const handleRenameFolder = async() => {
    if(!newFolderRename.trim()){
        alert("폴더 이름을 입력하세요.");
        return;
    }
    if(!selectedFolderId){
        return;
    }

    try{
        const response = await axios.post(`${API_BASE_URL}/api/folder/rename`, {
            folderId: selectedFolderId,
            folderName: newFolderRename,
        });

        await getFolders();
        setMoreModalVisible(false);
    } catch(e){
        console.log("failed to rename folder", e);
    }
  }

  const handleRemoveFolder = async() => {
    if(!selectedFolderId){
        return;
    }

    try{
        const response = await axios.post(`${API_BASE_URL}/api/folder/remove`, {
            folderId: selectedFolderId,
        });

        await getFolders();
        setMoreModalVisible(false);
    } catch(e){
        console.log("failed to delete folder ", e);
    }
  }


  return (
    <SafeAreaWrapper backgroundTop="#ffffffff" backgroundBottom="#ffffffff">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={styles.container}
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
              <View key={index} style={styles.folderItem}>
                <TouchableOpacity
                  style={{ flex: 1, flexDirection: "row", alignItems: "center" }}
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

                <TouchableOpacity
                  onPress={() => {
                    setSelectedFolderId(f.folderId);
                    setNewFolderRename(f.folderName);
                    setMoreModalVisible(true);
                  }}
                  style={{ paddingHorizontal: 10, paddingVertical: 5 }}
                >
                  <Feather name="more-horizontal" size={24} color="#888" />
                </TouchableOpacity>
              </View>
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
              else setIsNoFolderModalVisible(true);
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

        <Modal visible={isNoFolderModalVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setIsNoFolderModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <Text style={{ fontSize: 16, marginBottom: 20, textAlign: "center" }}>
                    노트를 생성하려면 먼저 폴더를 만들어주세요!
                  </Text>
                  <TouchableOpacity
                    style={{
                      backgroundColor: "#A18CD1",
                      paddingVertical: 10,
                      borderRadius: 8,
                      alignItems: "center",
                    }}
                    onPress={() => setIsNoFolderModalVisible(false)}
                  >
                    <Text style={{ color: "#fff", fontSize: 16 }}>확인</Text>
                  </TouchableOpacity>
                </View>
              </TouchableWithoutFeedback>
            </View>
          </TouchableWithoutFeedback>
        </Modal>        

        <Modal visible={moreModalVisible} transparent animationType="fade">
          <TouchableWithoutFeedback onPress={() => setMoreModalVisible(false)}>
            <View style={styles.modalOverlay}>
              <TouchableWithoutFeedback>
                <View style={styles.modalContent}>
                  <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 20, position: "relative", }}>
                    <Text
                      style={{
                        flex: 1,
                        fontWeight: "bold",
                        fontSize: 18,
                        textAlign: "center",
                      }}
                    >
                      노트 폴더 편집
                    </Text>
                    <TouchableOpacity
                      onPress={() => setMoreModalVisible(false)}
                      style={{
                        position: "absolute",
                        right: 0,
                        padding: 5,
                      }}
                    >
                      <Feather name="x" size={24} color="#333" />
                    </TouchableOpacity>
                  </View>

                  <TextInput
                    value={newFolderRename}
                    onChangeText={setNewFolderRename}
                    style={{
                      borderWidth: 1,
                      borderColor: "#ccc",
                      borderRadius: 8,
                      padding: 8,
                      marginBottom: 15,
                      fontSize: 16,
                    }}
                    placeholder="새로운 폴더 이름을 작성해주세요."
                    returnKeyType="done"
                    onSubmitEditing={handleRenameFolder}
                  />

                  <View style={{ flexDirection: "row" }}>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#A18CD1",
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: "center",
                        flex: 1,
                        marginRight: 5,
                      }}
                      onPress={handleRenameFolder}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>변경</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={{
                        backgroundColor: "#B0B0B0",
                        paddingVertical: 12,
                        borderRadius: 8,
                        alignItems: "center",
                        flex: 1,
                        marginLeft: 5,
                      }}
                      onPress={handleRemoveFolder}
                    >
                      <Text style={{ color: "white", fontSize: 16 }}>삭제</Text>
                    </TouchableOpacity>
                  </View>
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
