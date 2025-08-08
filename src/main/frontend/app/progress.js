import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import Checkbox from "expo-checkbox";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../src/constants";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

const tabs = ["Time table", "Planner", "Completion rate"];
const studyTags = [
  { text: "0-3h", bgColor: "rgb(228, 215, 245)", textColor: "#6D7582" },
  { text: "3-6h", bgColor: "rgb(191, 161, 226)", textColor: "#F3EEFB" },
  { text: "6h+", bgColor: "rgb(141, 90, 207)", textColor: "#F3EEFB" },
];

export default function CalendarTimetableScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [plans, setPlans] = useState([]);
  const [loadingPlans, setLoadingPlans] = useState(false);
  const [loadingStudyTimes, setLoadingStudyTimes] = useState(false);
  const [userInfo, setUserInfo] = useState(false);
  const [dailyTotalTimes, setDailyTotalTimes] = useState([]);
  const hourCount = 24;
  const daysCount = 7;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [studyTimes, setStudyTimes] = useState([]);

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
    async function fetchSubjects() {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/subject/get`, {
          nickname: userInfo.nickname,
        });

        const { subjectNameList, subjectIdList } = res.data;
        if (subjectIdList && subjectNameList.length === subjectIdList.length) {
          const list = subjectIdList.map((id, idx) => ({
            id,
            name: subjectNameList[idx],
          }));
          setSubjects(list);
          if (list.length > 0) setSelectedSubject(list[0].name);
        } else {
          setSubjects([]);
        }
      } catch (e) {
        console.error("과목 불러오기 실패", e);
      }
    }
    if (userInfo) fetchSubjects();
  }, [userInfo]);

  useEffect(() => {
    const getTotalTimes = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/totalTime/getByMonth`,
          {
            nickname: userInfo.nickname,
            month: selectedMonth,
          }
        );
        setDailyTotalTimes(response.data);
      } catch (err) {
        console.log("failed to load total times ", err);
      }
    };
    if (userInfo !== null) {
      getTotalTimes();
    }
  }, [userInfo, selectedMonth]);

  useEffect(() => {
    setLoadingStudyTimes(true);

    const fetchStudyTimes = async () => {
      if (!userInfo || subjects.length === 0) return;

      try {
        const subjectIdList = subjects.map((s) => s.id);

        const res = await axios.post(`${API_BASE_URL}/api/totalTime/get`, {
          subjectIdList,
          date: selectedDate,
        });

        setStudyTimes(res.data);
      } catch (err) {
        console.error("공부 시간 불러오기 실패", err);
        setStudyTimes([]);
      } finally {
        setLoadingStudyTimes(false);
      }
    };

    fetchStudyTimes();
  }, [userInfo, subjects, selectedDate]);

  const renderStudyTimeSummary = () => {
    if (loadingStudyTimes) {
      return (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          불러오는 중...
        </Text>
      );
    }

    if (!subjects || subjects.length === 0) {
      return (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          등록된 과목이 없습니다.
        </Text>
      );
    }

    if (!studyTimes || studyTimes.length === 0) {
      return (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          공부 시간 데이터를 불러오는 중입니다...
        </Text>
      );
    }

    return (
      <View style={{ paddingHorizontal: 20 }}>
        <Text style={{ fontWeight: "bold", fontSize: 18, marginBottom: 12 }}>
          {format(new Date(selectedDate), "yyyy / M / d일")}
        </Text>

        {subjects.map((subject, idx) => {
          const time = studyTimes[idx] || "00:00:00"; // 공부 시간 없으면 기본 0시간 표시

          return (
            <View key={subject.id || idx} style={{ marginBottom: 8 }}>
              <Text style={{ fontSize: 16, color: "#4b3a99" }}>
                {subject.name || subject} : {time}
              </Text>
            </View>
          );
        })}
      </View>
    );
  };

  const getColorFromTime = (timeString) => {
    if (!timeString) return undefined;
    const [hours, minutes, seconds] = timeString.split(":").map(Number);
    const totalHours = hours + minutes / 60 + seconds / 3600;
    if (0 < totalHours && totalHours < 3) return "rgb(228, 215, 245)";
    else if (3 <= totalHours && totalHours < 6) return "rgb(191, 161, 226)";
    else if (totalHours >= 6) return "rgb(141, 90, 207)";
  };

  const getMarkedDates = () => {
    const marks = {};
    for (const [date, time] of Object.entries(dailyTotalTimes)) {
      const color = getColorFromTime(time);
      if (color) {
        marks[date] = {
          selected: true,
          selectedColor: color,
        };
      }
    }
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "grey",
    };
    return marks;
  };

  useEffect(() => {
    async function fetchPlans() {
      try {
        setLoadingPlans(true);
        const response = await axios.post(`${API_BASE_URL}/api/plan/date`, {
          nickname: userInfo.nickname,
          date: selectedDate,
        });
        const result = response.data;
        const transformed = Object.entries(result).map(([subject, todos]) => ({
          id: subject,
          title: subject,
          isExpanded: true,
          todos: todos.map((todo) => ({
            id: todo.id,
            week: todo.week,
            title: todo.content,
            checked: todo.learned,
          })),
        }));
        setPlans(transformed);
      } catch (e) {
        console.error("계획 불러오기 실패", e);
        setPlans([]);
      } finally {
        setLoadingPlans(false);
      }
    }

    if (activeTab === "Planner") {
      fetchPlans();
    }
  }, [selectedDate, activeTab, userInfo]);

  const toggleExpand = (id) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, isExpanded: !plan.isExpanded } : plan
      )
    );
  };

  const handleCheckboxChange = async (planGroupId, todoId, newValue) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/plan/${todoId}/learned`, {
        learned: newValue,
        nickname: userInfo.nickname,
      });
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
    } catch (e) {
      console.error("체크박스 상태 변경 실패", e);
    }
  };

  const renderPlans = () => {
    if (loadingPlans) {
      return (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          계획 불러오는 중...
        </Text>
      );
    }

    if (!plans || plans.length === 0) {
      return (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          등록된 계획이 없습니다.
        </Text>
      );
    }

    return (
      <ScrollView style={styles.card}>
        <Text style={styles.toDoTitle}>
          {format(selectedDate, "yyyy년 M월 d일")} 계획
        </Text>
        {plans.map((plan) => (
          <View key={plan.id}>
            <View style={styles.planItem}>
              <Text styles={styles.planText}>{plan.title}</Text>
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
                {plan.todos
                  .filter((todo) => todo.checked)
                  .map((todo) => (
                    <View key={todo.id} style={styles.subTodoItem}>
                      <View style={styles.subTodoTextContainer}>
                        <Text style={styles.subTodoText}>
                          <Text style={styles.subTodoWeek}>{todo.week} </Text>
                          <Text>{todo.title}</Text>
                        </Text>
                      </View>
                    </View>
                  ))}
              </View>
            )}
          </View>
        ))}

        <TouchableOpacity style={styles.addButton}>
          <Text style={styles.addButtonText}>+ 과목</Text>
        </TouchableOpacity>
      </ScrollView>
    );
  };

  return (
    <SafeAreaWrapper backgroundTop="#ffffffff" backgroundBottom="#ffffffff">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={32} color="#535353" />
          </TouchableOpacity>
          <Text style={styles.headerText}>통계</Text>
        </View>

        <View style={styles.calendarWrapper}>
          <Calendar
            current={selectedDate}
            onDayPress={(day) => setSelectedDate(day.dateString)}
            onMonthChange={(monthInfo) =>
              setSelectedMonth(monthInfo.dateString.slice(0, 7))
            }
            markedDates={getMarkedDates()}
            theme={{
              calendarBackground: "#fff",
              textMonthFontWeight: "bold",
              monthTextColor: "#000",
              arrowColor: "#663399",
              textSectionTitleColor: "#000",
              dayTextColor: "#000",
              textDayFontWeight: "500",
              textDayFontSize: 16,
            }}
            style={styles.calendar}
          />
          <View style={styles.tagRow}>
            {studyTags.map(({ text, bgColor, textColor }, idx) => (
              <View
                key={text}
                style={[
                  styles.tagBase,
                  { backgroundColor: bgColor },
                  idx !== studyTags.length - 1 && { marginRight: 6 },
                ]}
              >
                <Text style={[styles.tagText, { color: textColor }]}>
                  {text}
                </Text>
              </View>
            ))}
          </View>
        </View>

        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
        >
          {tabs.map((tab) => {
            const isActive = activeTab === tab;
            return (
              <TouchableOpacity
                key={tab}
                onPress={() => setActiveTab(tab)}
                style={styles.tabButton}
                activeOpacity={0.7}
              >
                <Text style={isActive ? styles.activeTab : styles.inactiveTab}>
                  {tab}
                </Text>
                {isActive && <View style={styles.underline} />}
              </TouchableOpacity>
            );
          })}
        </ScrollView>

        <View style={styles.contentContainer}>
          {activeTab === "Time table" && renderStudyTimeSummary()}
          {activeTab === "Planner" && (
            <ScrollView style={styles.plannerBox}>{renderPlans()}</ScrollView>
          )}
          {activeTab === "Completion rate" && <Text>완성도 내용</Text>}
        </View>
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#ffffffff",
    justifyContent: "flex-start",
  },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    paddingHorizontal: 10,
    justifyContent: "center", // 가로 가운데 정렬
    position: "relative", // 절대 위치 요소들 있으면 컨텍스트 유지용(필요에 따라)
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 0,
    //marginBottom: 8,
    flex: 1, // 텍스트가 headerRow 내에서 공간을 넓게 차지하게
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  calendar: {
    marginHorizontal: 30,
    marginBottom: 14,
  },
  tagRow: {
    flexDirection: "row",
    marginLeft: 18,
    marginBottom: 12,
  },
  tagBase: {
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  tagText: {
    fontWeight: "bold",
    fontSize: 10,
  },
  tabRow: {
    //backgroundColor: "#9B73D2",
    flexDirection: "row",
    paddingHorizontal: 20,
    maxHeight: 40,
    alignItems: "center",
  },
  tabButton: {
    marginRight: 30,
  },
  activeTab: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#B493C3",
  },
  inactiveTab: {
    fontSize: 18,
    color: "#ccc",
  },
  underline: {
    marginTop: 4,
    height: 2,
    marginBottom: 2,
    width: "100%",
    backgroundColor: "#B493C3",
  },
  contentContainer: {
    paddingHorizontal: 20,
    // backgroundColor: "#B493C3",
    //alignItems: "stretch",
    //minHeight: 500,
    //flexDirection: "column",
    flexGrow: 1,
    justifyContent: "flex-start", // 세로 가운데 정렬
    //alignItems: "center",
  },
  plannerBox: {
    width: "100%",
  },
  card: {
    backgroundColor: "#f5f0ff", // 연한 보라 배경
    borderRadius: 10, // 둥근 모서리
    padding: 16, // 안쪽 여백
    //shadowColor: "#000", // 그림자 색
    //shadowOffset: { width: 0, height: 2 }, // 그림자 위치
    //shadowOpacity: 0.1, // 그림자 투명도
    //shadowRadius: 4, // 그림자 퍼짐
    elevation: 5, // 안드로이드용 그림자 효과
    width: "100%",
  },
  toDoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 12,
    color: "#533a99", // 약간 진한 보라색
  },
  planItem: {
    flexDirection: "row", // 가로 정렬
    alignItems: "center",
    //justifyContent: "space-between", // 좌우 끝 정렬
    paddingVertical: 8,
    paddingHorizontal: 10,
    backgroundColor: "#faf5ff",
    borderRadius: 8,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: "#d3c5f7",
  },
  planText: {
    fontSize: 16,
    fontWeight: "500",
    color: "#4b3a99",
    flex: 1,
  },
  subTodoContainer: {
    marginLeft: 24,
    marginBottom: 10,
  },
  subTodoItem: {
    flexDirection: "row", // 가로 정렬
    alignItems: "center",
    marginBottom: 6,
  },
  subTodoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  addButton: {
    alignSelf: "flex-start",
    marginTop: 10,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 16,
    backgroundColor: "#d7ccf9",
  },
  addButtonText: {
    color: "#5e43c2",
    fontWeight: "bold",
    fontSize: 14,
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
});
