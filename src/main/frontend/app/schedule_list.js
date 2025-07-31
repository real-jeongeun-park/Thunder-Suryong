import { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons"; // 아이콘 라이브러리 사용(선택)
import { useRouter } from "expo-router";

import axios from "axios";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";

export default function ExamListScreen() {
  const router = useRouter();

  const [userInfo, setUserInfo] = useState(null);
  const [exams, setExams] = useState([]);

  useEffect(() => {
    async function checkLogin(){
        try{
            let token;

            if(Platform.OS === 'web'){
                token = localStorage.getItem("accessToken");
            }
            else{
                token = await SecureStore.getItemAsync("accessToken");
            }

            if(!token){
                throw new Error("Token not found");
            }

            const res = await axios.get(`${API_BASE_URL}/api/validation`, {
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            setUserInfo(res.data);
        } catch(err){
            console.log(err);
            setUserInfo(null);
            router.push("/");
        }
    }

    checkLogin();
  }, []);

  // 시험 가져오기
  useEffect(() => {
    const getExams = async () => {
        try{
            const response = await axios.post(`${API_BASE_URL}/api/exam/get`, {
                nickname: userInfo.nickname,
            });

            const { examIds, examNames, defaultExams } = response.data;
            // 리스트

            const newExamList = examIds.map((examId, index) => ({
                id: examId,
                name: examNames[index],
                isDefault: defaultExams[index]
            }));

            setExams((prev) => [...prev, ...newExamList]);
        } catch(err){
            console.log(err);
        }
    }

    if(userInfo && userInfo.nickname){
        getExams();
    }
  }, [userInfo])

  const handleExamPress = async (id) => {
    try{
      const response = await axios.get(`${API_BASE_URL}/api/exam/id`, {
        params: { id }
      });

      router.push("/main");
    } catch(e){
      console.log(e);
    }
  };

  const renderItem = ({ item, index }) => (
    <TouchableOpacity
      style={[styles.examItem, item.isDefault && styles.defaultExam]}
      onPress={() => handleExamPress(item.id)}
    >
      <Ionicons
        name="document-text-outline"
        size={22}
        color="#9A7DD5"
        style={{ marginRight: 10 }}
      />
      <Text style={styles.examText}>{item.name}</Text>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>
      <View style={styles.titleContainer}>
        <View style={styles.backButtonContainer}>
          <TouchableOpacity
            onPress={() => {
              router.back();
            }}
          >
            <Ionicons name="chevron-back" size={32} color="#535353" />
          </TouchableOpacity>
        </View>
        <Text style={styles.title}>나의 시험</Text>
      </View>
      <FlatList
        data={exams}
        renderItem={renderItem}
        keyExtractor={(item) => item.id}
        contentContainerStyle={{ paddingTop: 20 }}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    //paddingTop: 60,
  },
  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  titleContainer: {
    backgroundColor: "#F2E9FE",
    paddingBottom: 15,
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    color: "#5A4366",
    marginTop: 10,
    marginLeft: 50,
  },
  examItem: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#F2E9FE",
    padding: 15,
    borderRadius: 8,
    marginBottom: 12,
    marginHorizontal: 15,
  },
  defaultExam: {
    backgroundColor: "#fff",
    borderColor: "#9A7DD5",
    borderWidth: 1,
  },
  examText: {
    fontSize: 16,
    color: "#5A4366",
    fontWeight: "500",
  },
});