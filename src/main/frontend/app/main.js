import { Ionicons } from "@expo/vector-icons";
import { addDays, format, subDays } from "date-fns";
import Checkbox from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import {
  Animated,
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

export default function HomeScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("홈");
  const [date, setDate] = useState(new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [sheetHeight] = useState(new Animated.Value(380));
  const [isExpanded, setIsExpanded] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const tabs = [
    { name: "홈", label: "홈" },
    { name: "노트", label: "노트" },
    { name: "퀴즈", label: "퀴즈" },
    { name: "마이페이지", label: "마이페이지" },
  ];

  const [plans, setPlans] = useState([
      {
        id: 1,
        title: "추천시스템",
        isExpanded: false,
        checked: false,
        todos: [
          { id: "1-1", title: "하이퍼파라미터 튜닝", checked: false },
          { id: "1-2", title: "논문 읽기", checked: false },
        ],
      },
      {
        id: 2,
        title: "고급기계학습",
        isExpanded: false,
        checked: false,
        todos: [{ id: "2-1", title: "과제 3번 제출", checked: false }],
      },
    ]);

    const toggleExpand = (id) => {
      setPlans((prev) =>
        prev.map((plan) =>
          plan.id === id ? { ...plan, isExpanded: !plan.isExpanded } : plan
        )
      );
    };

    const toggleSheet = () => {
      const toValue = isExpanded ? 380 : 800;
      Animated.timing(sheetHeight, {
        toValue,
        duration: 300,
        useNativeDriver: false,
      }).start();
      setIsExpanded(!isExpanded);
    };

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
          <LinearGradient colors={["#F4EDFF", "#FFFFFF"]} style={styles.gradient}>
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
        </ScrollView>
        <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
                <TouchableOpacity onPress={toggleSheet}>
                  <View style={styles.handleBar} />
                </TouchableOpacity>

                <View style={styles.header}>
                  <TouchableOpacity onPress={() => setDate(subDays(date, 1))}>
                    <Ionicons name="chevron-back" size={20} />
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setCalendarVisible(true)}>
                    <Text style={styles.dateText}>
                      {format(date, "yyyy년 M월 d일")}
                    </Text>
                  </TouchableOpacity>
                  <TouchableOpacity onPress={() => setDate(addDays(date, 1))}>
                    <Ionicons name="chevron-forward" size={20} />
                  </TouchableOpacity>
                </View>

                <View style={styles.card}>
                  <Text style={styles.toDoTitle}>오늘의 계획</Text>
                  {plans.map((plan) => (
                    <View key={plan.id}>
                      <View style={styles.planItem}>
                        <Text style={styles.planText}>{plan.title}</Text>
                        <TouchableOpacity onPress={() => toggleExpand(plan.id)}>
                          <Ionicons
                            name={plan.isExpanded ? "chevron-back" : "chevron-down"}
                            size={16}
                            color="#555"
                          />
                        </TouchableOpacity>
                      </View>
                      {plan.isExpanded && (
                        <View style={styles.subTodoContainer}>
                          {plan.todos.map((todo) => (
                            <View key={todo.id} style={styles.subTodoItem}>
                              <Checkbox value={todo.checked} />
                              <Text style={styles.subTodoText}>{todo.title}</Text>
                            </View>
                          ))}
                        </View>
                      )}
                    </View>
                  ))}
                  <TouchableOpacity style={styles.addButton}>
                    <Text style={styles.addButtonText}>+ 과목</Text>
                  </TouchableOpacity>
                </View>

                <Modal visible={calendarVisible} transparent animationType="slide">
                  <View style={styles.modalBackground}>
                    <View style={styles.calendarContainer}>
                      <Calendar
                        onDayPress={(day) => {
                          setDate(new Date(day.dateString));
                          setCalendarVisible(false);
                        }}
                        markedDates={{
                          [format(date, "yyyy-MM-dd")]: {
                            selected: true,
                            selectedColor: "#B491DD",
                          },
                        }}
                      />
                      <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                        <Text
                          style={{
                            marginTop: 10,
                            color: "#B491DD",
                            textAlign: "center",
                          }}
                        >
                          닫기
                        </Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                </Modal>
              </Animated.View>
      </View>
      <View style={styles.bottomNav}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => {
              setActiveTab(tab.name);
              if (tab.name === "노트") router.push("/note");
              else if (tab.name === "퀴즈") router.push("/quiz");
              else if (tab.name === "마이페이지") router.push("/mypage");
            }}
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
    flex: 1,
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
    width: 250,
    height: 250,
    marginTop: 20,
  },
  timerText: {
    marginTop: 4,
    color: "#B491DD",
    fontWeight: "500",
  },
  gradient: {
    width: "100%",
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f4edff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  handleBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D0D4DB",
    marginBottom: 12,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c4ed5",
  },
  card: {
    backgroundColor: "#f5f0ff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  toDoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 12,
  },
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "#faf5ff",
    borderRadius: 12,
    marginBottom: 8,
  },
  planText: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  subTodoContainer: {
    marginLeft: 32,
    marginTop: 4,
  },
  subTodoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  subTodoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  addButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 16,
    backgroundColor: "#e5ddff",
  },
  addButtonText: {
    color: "#6c4ed5",
    fontWeight: "bold",
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    alignItems: "center",
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
