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
import { MaterialIcons } from '@expo/vector-icons';

const tabs = ["Study time", "Planner", "Completion rate"];
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
  const [loadingStudyTimes, setLoadingStudyTimes] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(false);
  const [dailyTotalTimes, setDailyTotalTimes] = useState([]);
  const hourCount = 24;
  const daysCount = 7;

  const [subjects, setSubjects] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState(null);

  const [studyTimes, setStudyTimes] = useState([]);

  const formatTimeToKorean = (time) => {
    const [hh, mm, ss] = time.split(":");
    return `${hh}시 ${mm}분 ${ss}초`;
  }

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
      if (!userInfo || subjects.length === 0) {
        setLoadingStudyTimes(false);
        return;
      }

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
      return <Text style={styles.loadingText}>불러오는 중...</Text>;
    }

    if (!subjects || subjects.length === 0) {
      return <Text style={styles.loadingText}>등록된 과목이 없습니다.</Text>;
    }

    if (!studyTimes || studyTimes.length === 0) {
      return (
        <Text style={styles.loadingText}>
          공부 시간 데이터를 불러오는 중입니다...
        </Text>
      );
    }

    return (
      <View style={styles.timeContainer}>
        <Text style={styles.dateText}>
          {format(new Date(selectedDate), "yyyy년 M월 d일 공부 시간")}
        </Text>

        {subjects.map((subject, idx) => {
          const time = studyTimes[idx] || "00:00:00";
          return (
            time !== "00:00:00" && (
              <View key={subject.id || idx} style={styles.subjectRow}>
                <MaterialIcons name="schedule" size={20} color="#6b4d9a" style={{ marginRight: 8 }} />
                <Text style={styles.subjectText}>
                    <Text>{subject.name}: </Text>
                    <Text style={{ fontWeight: "600", }}>{formatTimeToKorean(time)}</Text>
                </Text>
              </View>
            )
          );
        })}
      </View>
    );
  }

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
        setIsLoading(true);
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
        setIsLoading(false);
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

  // --- renderPlans: 이제 ScrollView를 반환하지 않고 단순 View를 반환합니다.
  // 바깥에서 하나의 ScrollView로 전체 스크롤을 담당하게 합니다.
  const renderPlans = () => {
    if (isLoading) {
      return (
        <View style={styles.card}>
          <Text style={styles.loadingText}>
            계획 불러오는 중...
          </Text>
        </View>
      );
    }

    if (!plans || plans.length === 0) {
      return (
        <View style={styles.card}>
          <Text style={styles.loadingText}>
            등록된 계획이 없습니다.
          </Text>
        </View>
      );
    }

    return (
      <View style={styles.card}>
        <Text style={styles.toDoTitle}>
          {format(new Date(selectedDate), "yyyy년 M월 d일")} 계획
        </Text>
        {plans.map((plan) => (
          <View key={plan.id}>
            <View style={styles.planItem}>
              {/* 여기에 styles -> style로 수정했음 */}
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
      </View>
    );
  };

  return (
    <SafeAreaWrapper backgroundTop="#ffffffff" backgroundBottom="#ffffffff">
      <View style={styles.container}>
        <View style={styles.headerRow}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => router.back()}
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

        {/* 탭 행: zIndex와 배경색을 줘서 스크롤 영역 위에 항상 보이게 함 */}
        <ScrollView
          horizontal
          showsHorizontalScrollIndicator={false}
          contentContainerStyle={styles.tabRow}
          style={styles.tabRowWrapper}
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

        {/* content 영역: Planner일 때 바깥 ScrollView 하나만 사용 */}
        <View style={styles.contentContainer}>
          {activeTab === "Study time" && (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              {renderStudyTimeSummary()}
            </ScrollView>
          )}
          {activeTab === "Planner" && (
            <ScrollView
              style={styles.scrollView}
              contentContainerStyle={{
                paddingBottom: 20,
              }}
              showsVerticalScrollIndicator={false}
            >
              {renderPlans()}
            </ScrollView>
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
    justifyContent: "center",
    position: "relative",
    marginBottom: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 0,
  },
  backButton: {
    position: "absolute",
    left: 10,
  },
  calendar: {
    marginHorizontal: 30,
    marginBottom: 14,
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: "#9E73D9",
    marginHorizontal: 20,
    marginBottom: 10,
    marginTop: 10,
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
  // 탭의 contentContainerStyle (스크롤 내부의 레이아웃)
  tabRow: {
    flexDirection: "row",
    paddingHorizontal: 20,
    alignItems: "center",
  },
  // 탭을 감싸는 바깥 스타일: 배경과 zIndex를 줘서 스크롤 콘텐츠 위에 있도록 함
  tabRowWrapper: {
    backgroundColor: "#ffffff",
    zIndex: 10,
    elevation: 3,
    paddingVertical: 8,
    maxHeight: 50,
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
  // contentContainer은 View이므로 flex:1로 채움
  contentContainer: {
    paddingHorizontal: 20,
    flex: 1,
    justifyContent: "flex-start",
  },
  plannerBox: {
    width: "100%",
  },
  // planner 전체 스크롤 담당
  scrollView: {
    flex: 1,
    width: "100%",
  },
  card: {
    backgroundColor: "#f5f0ff",
    borderRadius: 10,
    padding: 16,
    elevation: 5,
    width: "100%",
    marginTop: 10,
  },
  toDoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 12,
    color: "#533a99",
  },
  planItem: {
    flexDirection: "row",
    alignItems: "center",
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
    marginLeft: 10,
    marginBottom: 10,
  },
  subTodoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 6,
  },
  subTodoText: {
    marginLeft: 8,
    fontSize: 14,
    color: "#333",
  },
  subTodoTextContainer: {
    flex: 1,
  },
  subTodoWeek: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flexShrink: 0,
  },
  timeContainer: {
    paddingHorizontal: 24,
    backgroundColor: "#f9f7fd", // 아주 연한 보라
    borderRadius: 16,
    paddingVertical: 16,
    marginTop: 10,
    elevation: 6,
    width: "100%",
  },
  dateText: {
    fontWeight: "700",
    fontSize: 18,
    marginBottom: 16,
    color: "#5b3e99", // 좀 더 딥한 보라
    textAlign: "center",
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    backgroundColor: "#ede9fb", // 아주 부드러운 보라톤 박스
    paddingVertical: 12,
    paddingHorizontal: 16,
    borderRadius: 12,
    shadowColor: "#a999d8",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 6,
    elevation: 3,
  },
  subjectText: {
    fontSize: 15,
    color: "#5b3e99",
  },
  loadingText: {
    textAlign: "center",
  }
});