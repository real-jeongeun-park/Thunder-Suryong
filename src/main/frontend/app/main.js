import { Ionicons } from "@expo/vector-icons";
import { addDays, format, subDays } from "date-fns";
import Checkbox from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import BottomNavigation from "../components/BottomNavigation";

import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { differenceInDays, parseISO } from "date-fns";

import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Dimensions } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("홈");
  const [date, setDate] = useState(new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const { height: screenHeight } = Dimensions.get("window");
  const { width: screenWidth } = Dimensions.get("window");
  const [sheetHeight] = useState(new Animated.Value(screenHeight * 0.4));

  // 사용자 로그인 여부 확인
  const [userInfo, setUserInfo] = useState(null);
  // 성취률
  const [rate, setRate] = useState(null);

  const tabs = [
    { name: "홈", label: "홈" },
    { name: "노트", label: "노트" },
    { name: "퀴즈", label: "퀴즈" },
    { name: "마이페이지", label: "마이페이지" },
  ];

  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 로그인 여부 확인
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

  // 페이지에 대응되는 날짜의 계획 불러오기
  useEffect(() => {
    async function fetchPlans() {
      try {
        setIsLoading(true);
        const formattedDate = format(date, "yyyy-MM-dd"); // 선택된 날짜를 포맷

        const res = await axios.post(`${API_BASE_URL}/api/plan/date`, {
          nickname: userInfo.nickname,
          date: formattedDate,
        });

        const result = res.data;

        const transformed = Object.entries(result).map(([subject, todos]) => ({
          id: subject,
          title: subject,
          isExpanded: true,
          checked: false,
          todos: todos.map((todo) => ({
            id: todo.id,
            week: todo.week,
            title: todo.content,
            checked: todo.learned,
          })),
        }));

        setPlans(transformed);
<<<<<<< HEAD
=======
        console.log("계획 불러오기 성공");
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
      } catch (err) {
        console.log("계획 불러오기 실패", err);
      } finally {
        setIsLoading(false);
      }
    }

    if (userInfo !== null) {
      fetchPlans();
    }
  }, [userInfo, date]); // date가 변경될 때마다 계획 다시 불러오기

  useEffect(() => {
    async function fetchDefaultExam() {
      try {
        setIsLoading(true);

        let token;
        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
        } else {
          token = await SecureStore.getItemAsync("accessToken");
        }

<<<<<<< HEAD
=======
        console.log("Fetching default exam with token:", token);
        console.log("userInfo.nickname:", userInfo?.nickname);

>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
        const res = await axios.post(
          `${API_BASE_URL}/api/exam/get`,
          { nickname: userInfo.nickname },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

<<<<<<< HEAD
=======
        console.log("기본 시험 API 응답:", res.data);

>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
        const data = res.data;
        const defaultIndex = data.defaultExams.findIndex((v) => v === true);

        if (defaultIndex !== -1) {
          setSelectedExam({
            examName: data.examNames[defaultIndex],
            examId: data.examIds[defaultIndex],
            startDate: data.startDates ? data.startDates[defaultIndex] : null,
          });
        } else {
          setSelectedExam(null);
        }

<<<<<<< HEAD
=======
        console.log(selectedExam);
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
      } catch (err) {
        console.log(
          "기본 시험 정보 불러오기 실패!",
          err.response || err.message || err
        );
        setSelectedExam(null);
      } finally {
        setIsLoading(false);
      }
    }

    if (userInfo !== null && userInfo.nickname) {
      fetchDefaultExam();
    }
  }, [userInfo]);

  const toggleExpand = (id) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, isExpanded: !plan.isExpanded } : plan
      )
    );
  };

  const toggleSheet = () => {
    const toValue = isExpanded
      ? screenHeight * 0.4
      : screenHeight * 0.95 - insets.bottom; // safe area bottom 제외
    Animated.timing(sheetHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  // 체크 변경 함수
  const handleCheckboxChange = async (planGroupId, todoId, newValue) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/plan/${todoId}/learned`, {
        learned: newValue,
        nickname: userInfo.nickname,
      });

      // 프론트 상태도 업데이트
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === planGroupId
            ? {
                ...plan,
                todos: plan.todos.map((todo) =>
                  todo.id === todoId ? { ...todo, checked: newValue } : todo
                ),
              }
            : plan
        )
      );

      getAchievementRate();
    } catch (err) {
      console.error("체크박스 상태 변경 실패\n", err);
    }
  };

  // 달성률 계산
  const getAchievementRate = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/plan/achievement`,
        {
          nickname: userInfo.nickname,
          today: format(new Date(), "yyyy-MM-dd"),
        }
      );
      setRate(response.data.toFixed(0)); // 소수점 표기 x
    } catch (err) {
      console.log("달성률 계산 실패\n", err);
    }
  };

  useEffect(() => {
    if (userInfo !== null) {
      getAchievementRate();
    }
  }, [userInfo]);

<<<<<<< HEAD


  const handleRemoveExam = async () => {
    try{
      const response = await axios.post(`${API_BASE_URL}/api/exam/allFalse`, {
        nickname: userInfo.nickname,
      });

      setSelectedExam(null);
      setPlans(null);
    } catch(err){
        console.log(err);
    }
  };

=======
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
  return (
    <SafeAreaWrapper backgroundTop="#EFE5FF" backgroundBottom="#ffffffff">
      <View
        style={{
          flex: 1,
        }}
      >
        <View contentContainerStyle={styles.container}>
          <LinearGradient
            colors={["#EFE5FF", "#FFFFFF"]}
            style={styles.gradient}
          >
            <View style={styles.contentWrapper}>
              {userInfo && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {selectedExam && selectedExam.examName ? (
                    <>
                      <Text style={[styles.title]}>
                        {selectedExam.examName}
                      </Text>
                      {/* 삭제 버튼 */}
                      <TouchableOpacity
<<<<<<< HEAD
                        onPress={handleRemoveExam}
=======
                        onPress={() => setSelectedExam(null)}
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
                        style={{
                          marginLeft: 10,
                          backgroundColor: "#e57373",
                          paddingHorizontal: 8,
                          paddingVertical: 4,
                          borderRadius: 6,
                        }}
                      >
                        <Text
                          style={{
                            color: "white",
                            fontWeight: "bold",
                          }}
                        >
                          시험 삭제
                        </Text>
                      </TouchableOpacity>
                    </>
                  ) : (
                    <Text style={[styles.title]}>
                      {userInfo.nickname}님, 어서오세요!
                    </Text>
                  )}

                  {selectedExam &&
                    selectedExam.examName &&
                    selectedExam.startDate &&
                    (() => {
                      const diff =
                        differenceInDays(
                          parseISO(selectedExam.startDate),
                          new Date()
                        ) + 1;
                      const displayText =
<<<<<<< HEAD
                        diff === 0
                          ? "D-DAY"
                          : diff > 0
                          ? `D-${diff}`
                          : `D+${Math.abs(diff)}`;
=======
                        diff >= 0 ? `D-${diff}` : `D+${Math.abs(diff)}`;
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2

                      return (
                        <View style={[styles.ddayBox, { marginLeft: 12 }]}>
                          <Text style={styles.ddayText}>{displayText}</Text>
                        </View>
                      );
                    })()}
                </View>
              )}

              {/* 상단 버튼 */}
              <View
                style={selectedExam ? styles.topButtons : styles.topButtons2}
              >
                {/* 달성률 Touch 영역 */}
                {selectedExam && (
                  <TouchableOpacity
                    style={styles.achievementRate}
                    onPress={() => {
                      router.push("/progress");
                    }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          color: "#6c4ed5",
                          fontWeight: "bold",
                          fontSize: 15,
                        }}
                      >
                        오늘 계획 {rate}% 달성!
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color="#6c4ed5"
                        style={{ marginLeft: 4, marginTop: 2 }}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                {/* 시험이 없을 때만 일정 버튼 노출 */}
                {!selectedExam && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      justifyContent: "flex-end",
                    }}
                  >
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => router.push("/schedule_list")}
                    >
<<<<<<< HEAD
                      <Text style={styles.buttonText}>시험 불러오기</Text>
=======
                      <Text style={styles.buttonText}>일정 불러오기</Text>
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        router.push("/exam_schedule");
                      }}
                    >
<<<<<<< HEAD
                      <Text style={styles.buttonText}>새로운 시험 생성</Text>
=======
                      <Text style={styles.buttonText}>새로운 일정 생성</Text>
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* 타이머 + 캐릭터 나란히 배치 */}
              <View style={styles.rowContainer}>
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={() => router.push("/timer")}
                >
                  <Ionicons name="time-outline" size={30} color="#B491DD" />
                  <Text style={styles.timerText}>Timer</Text>
                </TouchableOpacity>

                <Image
                  source={require("../assets/images/main.png")}
                  style={[
                    styles.character,
                    { width: screenWidth * 0.6, height: screenHeight * 0.3 },
                  ]}
                  resizeMode="contain"
                />
              </View>
            </View>
          </LinearGradient>
        </View>

        {/* 말풍선 */}
        <View style={styles.speechContainer}>
          <Text style={styles.characterText}>
            시험이 얼마 남지 않았네요! {"\n"}오늘도 파이팅!
          </Text>
        </View>

        {/* 드래그 가능한 시트: 높이 애니메이션, 안에 일정 및 달력 UI 포함 */}
        <Animated.View style={[styles.sheet, { height: sheetHeight }]}>
          <TouchableOpacity onPress={toggleSheet}>
            <View style={styles.handleBar} />
          </TouchableOpacity>

          {/* 날짜 선택 및 이동 컨트롤 */}
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

          {/* 오늘의 계획 카드 영역 */}
          <View style={styles.card}>
            <Text style={styles.toDoTitle}>오늘의 계획</Text>

            {isLoading ? (
              <Text style={{ alignSelf: "center", marginTop: 10 }}>
                불러오는 중...
              </Text>
<<<<<<< HEAD
            ) : !plans || plans.length === 0 ? (
=======
            ) : plans.length === 0 ? (
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
              <Text style={{ alignSelf: "center", marginTop: 10 }}>
                계획이 없습니다.
              </Text>
            ) : (
              [...plans]
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((plan) => (
                  <View key={plan.id}>
                    <View style={styles.planItem}>
                      <Text style={styles.planText}>{plan.title}</Text>
                      <TouchableOpacity onPress={() => toggleExpand(plan.id)}>
                        <Ionicons
                          name={
                            plan.isExpanded ? "chevron-forward" : "chevron-down"
                          }
                          size={16}
                          color="#555"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* 펼쳐진 todo 항목별 체크박스 및 제목 */}
                    {plan.isExpanded && (
                      <View style={styles.subTodoContainer}>
                        {plan.todos.map((todo) => (
                          <View key={todo.id} style={styles.subTodoItem}>
                            <Checkbox
                              style={{ marginRight: 8 }}
                              color={todo.checked ? "#B491DD" : undefined}
                              value={todo.checked}
                              onValueChange={(newValue) =>
                                handleCheckboxChange(plan.id, todo.id, newValue)
                              }
                            />
                            <View style={styles.subTodoTextContainer}>
                              <Text style={styles.subTodoText}>
                                <Text style={styles.subTodoWeek}>
                                  {todo.week}{" "}
                                </Text>
                                <Text>{todo.title}</Text>
                              </Text>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))
            )}

            {/* 과목 추가 버튼 (터치 기능은 별도 구현 필요) */}
            <TouchableOpacity style={styles.addButton}>
              <Text style={styles.addButtonText}>+ 과목</Text>
            </TouchableOpacity>
          </View>

          <Modal visible={calendarVisible} transparent animationType="none">
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
        <BottomNavigation />
      </View>
    </SafeAreaWrapper>
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
    //marginTop: "10%",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  topButtons: {
    flexDirection: "row",
    //justifyContent: "flex-end",
    width: "100%",
    //gap: 10,
    marginBottom: 20,
    //alignSelf: "flex-end",
  },
  topButtons2: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    //gap: 10,
    marginBottom: 20,
    //alignSelf: "flex-end",
  },
  achievementRate: {
    //backgroundColor: "#e5ddff",
    paddingVertical: 8,
    paddingHorizontal: 16,
    //borderRadius: 30,
    alignSelf: "flex-start",
    //marginTop: 4,
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
    //width: 250,
    //height: 250,
    marginTop: 20,
  },
  speechContainer: {
    position: "absolute",
    width: "100%",
    top: "30%", // 세로 중앙 위치 (아래에서 translateY로 정확 조정 필요)
    //backgroundColor: "#6c4ed5",
    padding: 20,
    //transform: [{ translateY: -30 }], // translateY 값은 박스 높이에 맞게 조정
  },
  characterText: {
    backgroundColor: "#c9c4dfff",
    width: "50%",
    color: "#fff",
    padding: 10,
    paddingLeft: 15,
    borderRadius: 20,
    marginTop: 80,
    //shadowOpacity: 0.3,
    //shadowOffset: { width: 0, height: 2 },
    //shadowRadius: 4,
    //elevation: 5,
  },
  timerText: {
    marginTop: 4,
    color: "#B491DD",
    fontWeight: "500",
  },
  gradient: {
    width: "100%",
    height: "100%",
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
  subTodoTextContainer: {
    flex: 1,
  },
  subTodoWeek: {
    fontSize: 14,
    color: "#333",
    fontWeight: 500,
    flexShrink: 0,
  },
  subTodoText: {
    flexWrap: "wrap",
    flexShrink: 1,
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
  ddayBox: {
    backgroundColor: "#ae9dccff", // 예: 빨간색 박스
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start", // 텍스트 너비만큼 박스 크기 조정
    marginVertical: 10,
    //marginTop: "10%",
  },
  ddayText: {
    color: "#fff", // 흰색 텍스트
    fontWeight: "bold",
    fontSize: 16,
  },
  bubble: {
    backgroundColor: "#6c4ed5", // 말풍선 배경색
  },
  speech: {
    color: "#fff", // 텍스트 색상
    fontSize: 14,
  },
});
