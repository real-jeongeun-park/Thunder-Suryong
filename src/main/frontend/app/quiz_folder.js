import { Feather } from "@expo/vector-icons";
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

export default function quizFolder() {
  const router = useRouter();
  const { folderId } = useLocalSearchParams();
  const [quizzes, setQuizzes] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [folderName, setFolderName] = useState(null);
  const [noteNames, setNoteNames] = useState([]);

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

    if (userInfo) {
      getFolderName();
      getQuizzes();
    }
  }, [userInfo]);

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
            <TouchableOpacity onPress={() => router.back()}>
              <Feather name="arrow-left" size={24} color="black" />
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
              <TouchableOpacity
                onPress={() =>
                  router.push({
                    pathname: "/quiz_result",
                    params: {
                      quizId: item.quizId,
                    },
                  })
                }
              >
                <View style={styles.noteCard}>
                  <Feather name="file" size={20} color="#A18CD1" />
                  <View style={{ flex: 1 }}>
                    <Text style={styles.noteText}>{item.quizTitle}</Text>
                  </View>
                </View>
              </TouchableOpacity>
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
            <Text style={{ fontWeight: "800", fontSize: 16, color: "rgb(75 75 75)"}}>
               퀴즈
             </Text>
          </TouchableOpacity>
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
});
