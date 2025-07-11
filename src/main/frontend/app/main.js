import { Ionicons } from "@expo/vector-icons";
import { LinearGradient } from "expo-linear-gradient";
import { useEffect, useState } from "react";
import {
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";
import { Calendar } from "react-native-calendars";

import * as SecureStore from 'expo-secure-store';
import axios from 'axios';

import { Platform } from "react-native";
import { useRouter } from "expo-router";

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("홈");

  const tabs = [
    { name: "홈", label: "홈" },
    { name: "노트", label: "노트" },
    { name: "퀴즈", label: "퀴즈" },
    { name: "마이페이지", label: "마이페이지" },
  ];
  const [modalVisible, setModalVisible] = useState(false); // BottomSheet 대신 Modal

  // 사용자 로그인 여부 확인
  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
     async function checkLogin() {
        try{
            let token;

            if(Platform.OS === 'web'){
                token = localStorage.getItem("accessToken");
            } else{
                token = await SecureStore.getItemAsync("accessToken");
            }

            if(!token) throw new Error("Token not found");
            const res = await axios.get("http://localhost:8080/api/validation", {
                headers: {
                    Authorization: `Bearer ${token}`
                }
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

  return (
    <View style={{ flex: 1 }}>
      <View style={{ flex: 1 }}>
        <ScrollView contentContainerStyle={styles.container}>
          <LinearGradient
            colors={["#F4EDFF", "#FFFFFF"]}
            style={styles.gradient}
          >
            <View style={styles.contentWrapper}>
              {/* 상단 제목 */}

              {userInfo && <Text style={styles.title}>{userInfo.nickname}님, 어서오세요!</Text>}

              {/* 상단 버튼 2개 */}
              <View style={styles.topButtons}>
                <TouchableOpacity
                  style={styles.actionButton}
                  onPress={() => setModalVisible(true)}
                >
                  <Text style={styles.buttonText}>일정 불러오기</Text>
                </TouchableOpacity>
                <TouchableOpacity style={styles.actionButton}>
                  <Text style={styles.buttonText}>새로운 일정 생성</Text>
                </TouchableOpacity>
              </View>

              {/* 타이머 + 캐릭터 나란히 배치 */}
              <View style={styles.rowContainer}>
                <TouchableOpacity style={styles.timerButton}>
                  <Ionicons name="time-outline" size={30} color="#B491DD" />
                  <Text style={styles.timerText}>Timer</Text>
                </TouchableOpacity>

                <Image
                  source={require("../assets/images/main.png")}
                  style={styles.character}
                  resizeMode="contain"
                />
              </View>
            </View>
          </LinearGradient>

          {/* 캘린더 */}
          <Calendar
            style={styles.calendar}
            theme={{
              selectedDayBackgroundColor: "#B491DD",
              todayTextColor: "#B491DD",
              arrowColor: "#B491DD",
              monthTextColor: "#333",
            }}
          />
        </ScrollView>
      </View>
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.sheetContent}>
            <Text
              style={{ fontSize: 16, fontWeight: "bold", marginBottom: 10 }}
            >
              오늘 할 일!
            </Text>
            <Text>- 데이터 분석 복습</Text>
            <Text>- 알고리즘 연습</Text>
            <Text>- 앱 개발 마무리</Text>
            <TouchableOpacity onPress={() => setModalVisible(false)}>
              <Text
                style={{ marginTop: 20, color: "#B491DD", fontWeight: "bold" }}
              >
                닫기
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => setActiveTab(tab.name)}
          >
            <View
              style={[
                styles.dot,
                activeTab === tab.name ? styles.dotActive : styles.dotInactive,
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
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  topButtons: {
    flexDirection: "row",
    gap: 10,
    marginBottom: 20,
    alignSelf: "flex-end",
  },
  actionButton: {
    backgroundColor: "#E7DDF3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: "#4A3B73",
    fontWeight: "bold",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 20,
  },
  timerButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#F6F0FF",
    padding: 16,
    borderRadius: 20,
  },
  character: {
    width: 300,
    height: 300,
    marginTop: 20,
  },
  timerText: {
    marginTop: 4,
    color: "#B491DD",
    fontWeight: "500",
  },
  calendar: {
    width: "100%",
    borderRadius: 15,
    padding: 10,
    backgroundColor: "#fff",
    marginBottom: 20,
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    height: 100,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingBottom: 30,
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
  navText: {
    fontSize: 12,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navTextInactive: {
    color: "#ccc",
  },
  navTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    justifyContent: "flex-end",
    backgroundColor: "rgba(0,0,0,0)",
  },
  sheetContent: {
    backgroundColor: "white",
    padding: 20,
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  gradient: {
    width: "100%", // 전체 너비
    // padding 제거함!!
  },

  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
});
