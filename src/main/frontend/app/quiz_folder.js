import { Feather } from "@expo/vector-icons";
import { Ionicons } from "@expo/vector-icons";
import { MaterialCommunityIcons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useEffect, useState } from "react";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import {
  Keyboard,
  FlatList,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
  Platform,
} from "react-native";
import axios from "axios";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";

import { Modal } from "react-native";

export default function quizFolder() {
  const router = useRouter();
  const { folderId } = useLocalSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [folderName, setFolderName] = useState(null);
  const [moreModalVisible, setMoreModalVisible] = useState(false);
  const [selectedQuizId, setSelectedQuizId] = useState(null);
  const [newQuizRename, setNewQuizRename] = useState("");


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
    const getFolderName = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/quizFolder/getByFolderId`,
          {
            folderId,
          }
        );
        setFolderName(response.data);
      } catch (err) {
        console.log(err);
      }
    };

    if (userInfo) {
      getFolderName();
      getQuizzes();
    }
  }, [userInfo]);

  const getQuizzes = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/quiz/getByFolderId`, {
          folderId,
        });

        setQuizzes(res.data);
      } catch (err) {
        console.log(err);
      }
  };

  const handleRenameQuiz = async() => {
    if(!newQuizRename.trim()){
        alert("노트 이름을 입력하세요.");
        return;
    }
    if(!selectedQuizId){
        return;
    }

    try{
        const response = await axios.post(`${API_BASE_URL}/api/quiz/rename`, {
            quizId: selectedQuizId,
            quizName: newQuizRename,
        });

        await getQuizzes();
        setMoreModalVisible(false);
    } catch(e){
        console.log("failed to rename quiz", e);
    }
  }

  const handleRemoveQuiz = async() => {
    if(!selectedQuizId){
        return;
    }

    try{
        const response = await axios.post(`${API_BASE_URL}/api/quiz/remove`, {
            quizId: selectedQuizId,
        });

        await getQuizzes();
        setMoreModalVisible(false);
    } catch(e){
        console.log("failed to delete quiz ", e);
    }
  }

  return (
    <SafeAreaWrapper backgroundTop="#ffffffff" backgroundBottom="#ffffffff">
      <TouchableWithoutFeedback
        onPress={() => {
          if (Platform.OS !== "web") Keyboard.dismiss();
        }}
      >
        <View style={styles.container}>
          {/* 뒤로가기 버튼 + 폴더명 */}
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              marginBottom: 40,
              marginTop: 15,
            }}
          >
            <TouchableOpacity onPress={() => router.push("/quiz_list")}>
              <Ionicons name="chevron-back-outline" size={24} color="black" />
            </TouchableOpacity>
            <Text style={[styles.title, { marginLeft: 10 }]}>{folderName}</Text>
          </View>

          <View style={styles.folderCard}>
            <Feather name="folder" size={20} color="#A18CD1" />
            <Text style={styles.folderTitle}>{folderName}</Text>
            <Text style={styles.noteCount}>{`( ${quizzes.length} )`}</Text>
          </View>

          <FlatList
            data={quizzes}
            keyExtractor={(item) => item.quizId}
            renderItem={({ item }) => (
              <View style={styles.noteCard}>
                <TouchableOpacity
                  onPress={() =>
                    router.push({
                      pathname: "/quiz_result",
                      params: { quizId: item.quizId },
                    })
                  }
                  style={{ flexDirection: "row", alignItems: "center", flex: 1 }}
                >
                  <MaterialCommunityIcons name="help-circle-outline" size={20} color="#A18CD1" />
                  <Text style={styles.noteText}>{item.quizTitle}</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  onPress={() => {
                    setSelectedQuizId(item.quizId);
                    setNewQuizRename(item.quizTitle);
                    setMoreModalVisible(true);
                  }}
                  style={{ paddingHorizontal: 10, paddingVertical: 5 }}
                >
                  <Feather name="more-horizontal" size={24} color="#888" />
                </TouchableOpacity>
              </View>
            )}
          />

          <TouchableOpacity
            style={styles.floatingButton}
            onPress={() => {
                router.push({
                    pathname: "/create_quiz1",
                    params: {
                        folderId: folderId,
                    }
                })
            }}
          >
            <MaterialCommunityIcons name="help-circle-outline" size={24} color="#A18CD1" />
          </TouchableOpacity>

          <Modal visible={moreModalVisible} transparent animationType="fade">
            <TouchableWithoutFeedback onPress={() => setMoreModalVisible(false)}>
              <View style={styles.modalOverlay}>
                <TouchableWithoutFeedback>
                  <View style={styles.modalContent}>
                    <View
                      style={{
                        flexDirection: "row",
                        alignItems: "center",
                        justifyContent: "space-between",
                        marginBottom: 8,
                      }}
                    >
                      <Text style={{ fontWeight: "bold", fontSize: 18 }}>
                        퀴즈 설정
                      </Text>
                      <TouchableOpacity onPress={() => setMoreModalVisible(false)}>
                        <Feather name="x" size={24} color="#333" />
                      </TouchableOpacity>
                    </View>

                    <TextInput
                      value={newQuizRename}
                      onChangeText={setNewQuizRename}
                      style={{
                        borderWidth: 1,
                        borderColor: "#ccc",
                        borderRadius: 8,
                        padding: 8,
                        marginBottom: 15,
                        fontSize: 16,
                      }}
                      placeholder="새로운 퀴즈 이름"
                      returnKeyType="done"
                      onSubmitEditing={handleRenameQuiz}
                    />

                    <View style={{ flex: 1, flexDirection: "row" }}>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "#A18CD1",
                          paddingVertical: 12,
                          borderRadius: 8,
                          alignItems: "center",
                          flex: 1,
                          marginRight: 5,
                        }}
                        onPress={handleRenameQuiz}
                      >
                        <Text style={{ color: "white", fontSize: 16 }}>변경</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={{
                          backgroundColor: "rgb(209 140 140)",
                          paddingVertical: 12,
                          borderRadius: 8,
                          alignItems: "center",
                          flex: 1,
                          marginLeft: 5,
                        }}
                        onPress={handleRemoveQuiz}
                      >
                        <Text style={{ color: "white", fontSize: 16 }}>삭제</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </TouchableWithoutFeedback>
              </View>
            </TouchableWithoutFeedback>
          </Modal>

        </View>
      </TouchableWithoutFeedback>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    paddingTop: 20,
    paddingHorizontal: 20,
    flex: 1,
    backgroundColor: "#fff",
  },
  title: {
    fontSize: 28,
    fontWeight: "bold",
  },
  folderCard: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderColor: "#EEE6FA",
    borderWidth: 1,
    borderRadius: 10,
    marginBottom: 10,
  },
  folderTitle: {
    fontSize: 16,
    marginLeft: 8,
  },
  noteCount: {
    marginLeft: "auto",
    fontSize: 14,
    color: "#999",
  },
  noteCard: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F6F0FF",
    padding: 12,
    borderRadius: 12,
    marginBottom: 10,
    marginLeft: 15,
  },
  noteText: {
    marginLeft: 10,
    fontSize: 16,
    flex: 1,
  },
  floatingButton: {
    position: "absolute",
    bottom: 30,
    right: 20,
    width: 50,
    height: 50,
    backgroundColor: "#EFE3FF",
    borderRadius: 25,
    justifyContent: "center",
    alignItems: "center",
  },

  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.6)",
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

});
