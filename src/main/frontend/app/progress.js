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
  const [isLoading, setIsLoading] = useState(true);
  const [userInfo, setUserInfo] = useState(false);
  const [dailyTotalTimes, setDailyTotalTimes] = useState([]);
  const hourCount = 24;
  const daysCount = 7;

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
    const getTotalTimes = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/totalTime/getByMonth`, {
          nickname: userInfo.nickname,
          month: selectedMonth,
        });
        setDailyTotalTimes(response.data);
      } catch (err) {
        console.log("failed to load total times ", err);
      }
    };
    if (userInfo !== null) {
      getTotalTimes();
    }
  }, [userInfo, selectedMonth]);

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
          isExpanded: false,
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
    if (isLoading) {
      return <Text style={{ textAlign: "center", marginTop: 10 }}>계획 불러오는 중...</Text>;
    }

    if (!plans || plans.length === 0) {
      return <Text style={{ textAlign: "center", marginTop: 10 }}>등록된 계획이 없습니다.</Text>;
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
                {plan.todos.map((todo) => (
                  <View key={todo.id} style={styles.subTodoItem}>
                    <Checkbox
                      style={{ marginRight: 8 }}
                      value={todo.checked}
                      onValueChange={(newValue) =>
                        handleCheckboxChange(plan.id, todo.id, newValue)
                      }
                    />
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

  const renderTimeTable = () => {
    return Array.from({ length: hourCount }, (_, i) => {
      let hour = (6 + i) % 24;
      if (hour === 0) hour = 24;
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
  };

  return (
    <View style={styles.container}>
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
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
              <Text style={[styles.tagText, { color: textColor }]}>{text}</Text>
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
              <Text style={isActive ? styles.activeTab : styles.inactiveTab}>{tab}</Text>
              {isActive && <View style={styles.underline} />}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      <View style={styles.contentContainer}>
        {activeTab === "Time table" && (
          <ScrollView style={styles.timeTableBox} showsVerticalScrollIndicator={false}>
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