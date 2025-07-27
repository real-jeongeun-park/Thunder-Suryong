import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { format } from "date-fns";
import { useRouter } from "expo-router";
import { Platform } from "react-native";
import * as SecureStore from "expo-secure-store";
import Checkbox from "expo-checkbox";
import axios from "axios";

const tabs = ["Time table", "Planner", "Completion rate"];
const studyTags = [
  { text: "1-3h", bgColor: "rgba(155,115,210,0.2)", textColor: "#6D7582" },
  { text: "3-6h", bgColor: "rgba(155,115,210,0.65)", textColor: "#F3EEFB" },
  { text: "6h+", bgColor: "#9B73D2", textColor: "#F3EEFB" },
];

export default function CalendarTimetableScreen() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [activeTab, setActiveTab] = useState(tabs[0]);
  const [date, setDate] = useState(new Date());

  const hourCount = 24;
  const daysCount = 6;

  // --- plans 상태 및 데이터 로딩 ---
  const [plans, setPlans] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  // 날짜 선택시 plans 새로 불러오기
  useEffect(() => {
    async function fetchPlans() {
      try {
        setIsLoading(true);

        let token;
        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
        } else {
          token = await SecureStore.getItemAsync("accessToken");
        }

        if (!token) throw new Error("Token is missing");

        // 서버에 yyyy-MM-dd 형식 날짜로 요청
        const res = await axios.get(
          `http://localhost:8080/api/plans/date?date=${selectedDate}`,
          {
            headers: { Authorization: `Bearer ${token}` },
          }
        );

        // 변환: {subject: todos[]} → 배열 [{id,title,isExpanded,todos:[]}]
        const result = res.data;
        const transformed = Object.entries(result).map(([subject, todos]) => ({
          id: subject,
          title: subject,
          isExpanded: false,
          todos: todos.map((todo) => ({
            id: todo.id,
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
    fetchPlans();
  }, [selectedDate]);

  // 토글로 펼치기/접기
  const toggleExpand = (id) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, isExpanded: !plan.isExpanded } : plan
      )
    );
  };

  // 체크박스 변경시 서버에 PATCH 요청 및 상태 반영
  const handleCheckboxChange = async (planGroupId, todoId, newValue) => {
    try {
      let token;
      if (Platform.OS === "web") {
        token = localStorage.getItem("accessToken");
      } else {
        token = await SecureStore.getItemAsync("accessToken");
      }
      if (!token) throw new Error("Token is missing");

      await axios.patch(
        `http://localhost:8080/api/plans/${todoId}/learned`,
        { learned: newValue },
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      setPlans((prev) =>
        prev.map((plan) =>
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

  function renderPlans() {
    // 로딩 중일 때
    if (isLoading) {
      return (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          계획 불러오는 중...
        </Text>
      );
    }

    // 계획이 없을 때
    if (!plans || plans.length === 0) {
      return (
        <Text style={{ textAlign: "center", marginTop: 10 }}>
          등록된 계획이 없습니다.
        </Text>
      );
    }

    // 정상적으로 계획이 있을 때
    return (
      <>
        {/* 오늘의 계획 카드 영역 */}
        <ScrollView style={styles.card}>
          <Text style={styles.toDoTitle}>
            {format(date, "yyyy년 M월 d일")} 계획
          </Text>
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
                      <Checkbox
                        value={todo.checked}
                        onValueChange={(newValue) =>
                          handleCheckboxChange(plan.id, todo.id, newValue)
                        }
                      />
                      <Text style={styles.subTodoText}>{todo.title}</Text>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}

          {/* 과목 추가 버튼 */}
          <TouchableOpacity style={styles.addButton}>
            <Text style={styles.addButtonText}>+ 과목</Text>
          </TouchableOpacity>
        </ScrollView>
      </>
    );
  }

  function renderTimeTable() {
    return Array.from({ length: hourCount }, (_, i) => {
      // i: 0 ~ 23
      let hour = (6 + i) % 24;
      if (hour === 0) hour = 24; // 0시 대신 24시 표시

      return (
        <View style={styles.timeTableRow} key={`row-${i}`}>
          <Text style={styles.timeTableHour}>
            {hour.toString().padStart(2, "0")}
          </Text>
          {Array.from({ length: daysCount }, (_, j) => (
            <View style={styles.timeTableCell} key={`cell-${i}-${j}`} />
          ))}
        </View>
      );
    });
  }

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity onPress={() => router.back()}>
          <Ionicons name="chevron-back" size={32} color="#535353" />
        </TouchableOpacity>
      </View>

      {/* 상단 제목 */}
      <Text style={styles.headerText}>통계</Text>

      {/* Calendar */}
      <Calendar
        current={selectedDate}
        onDayPress={(day) => setSelectedDate(day.dateString)}
        hideExtraDays={true}
        markedDates={{
          [selectedDate]: { selected: true, selectedColor: "#ad8ecfff" },
        }}
        theme={{
          todayTextColor: "#1b7255ff",
          textDayFontWeight: "normal",
          arrowColor: "#8a539bff",
          textDayFontSize: 18,
          textMonthFontWeight: "bold",
          textDayHeaderFontWeight: "600",
          textDayHeaderFontSize: 14,
          selectedDayBackgroundColor: "#4c4653ff",
        }}
        style={styles.calendar}
      />

      {/* 공부 시간 범주 태그 */}
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
            <Text style={[styles.tagText, { color: textColor }]}>{text}</Text>
          </View>
        ))}
      </View>

      {/* 탭 메뉴 */}
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

      {/* 탭 콘텐츠 */}
      <View style={styles.contentContainer}>
        {activeTab === "Time table" && (
          <ScrollView
            style={styles.timeTableBox}
            showsVerticalScrollIndicator={false}
          >
            {renderTimeTable()}
          </ScrollView>
        )}
        {activeTab === "Planner" && (
          <ScrollView style={styles.plannerBox}>{renderPlans()}</ScrollView>
        )}
        {activeTab === "Completion rate" && <Text>완성도 내용</Text>}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //flex: 1,
    backgroundColor: "#fff",
  },
  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  headerText: {
    fontSize: 20,
    fontWeight: "500",
    textAlign: "center",
    marginTop: 16,
    marginBottom: 8,
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
    padding: 20,
    // backgroundColor: "#B493C3",
    //alignItems: "stretch",
    minHeight: 500,
    flexDirection: "column",
    justifyContent: "center", // 세로 가운데 정렬
    alignItems: "center",
  },
  timeTableBox: {
    marginHorizontal: 27,
    //borderRadius: 10,
    height: 200,
    backgroundColor: "#fff",
  },
  timeTableRow: {
    flexDirection: "row",
    alignItems: "center",
    height: 39,
  },
  timeTableHour: {
    width: 30,
    fontWeight: "bold",
    fontSize: 12,
    color: "#B493C3",
    textAlign: "center",
    marginRight: 8,
  },
  timeTableCell: {
    width: 41.7,
    height: 39,
    backgroundColor: "#FAF8FD",
    borderColor: "#B493C3",
    borderWidth: 0.6,
    //borderRadius: 4,
    //marginRight: 1,
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
});
