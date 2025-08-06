// app/mypage.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import BottomNavigation from "../components/BottomNavigation";
import { format } from "date-fns";
import axios from "axios";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";

export default function MyPageScreen() {
  const studyTags = [
    { text: "0-3h", bgColor: "rgb(228, 215, 245)", textColor: "#6D7582" },
    { text: "3-6h", bgColor: "rgb(191, 161, 226)", textColor: "#F3EEFB" },
    { text: "6h+", bgColor: "rgb(141, 90, 207)", textColor: "#F3EEFB" },
  ];

  const router = useRouter();

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  const [userInfo, setUserInfo] = useState(false);
  const [examInfo, setExamInfo] = useState(null);
  const [dailyTotalTimes, setDailyTotalTimes] = useState([]);

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
          headers: { Authorization: `Bearer ${token}` },
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
    const getCurrentExam = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/exam/getOne`, {
          nickname: userInfo.nickname,
        });
        setExamInfo(response.data);
      } catch (err) {
        console.log("failed to get current exam info ", err);
      }
    };
    if (userInfo !== null) getCurrentExam();
  }, [userInfo]);

  useEffect(() => {
    const getTotalTimes = async () => {
      try {
        const response = await axios.post(
          `${API_BASE_URL}/api/totalTime/getByMonth`,
          { nickname: userInfo.nickname, month: selectedMonth }
        );
        setDailyTotalTimes(response.data);
      } catch (err) {
        console.log("failed to load total times ", err);
      }
    };
    if (userInfo !== null) getTotalTimes();
  }, [userInfo, selectedMonth]);

  const getColorFromTime = (timeString) => {
    if (!timeString) return undefined;
    const [h, m, s] = timeString.split(":").map(Number);
    const total = h + m / 60 + s / 3600;
    if (0 < total && total < 3) return "rgb(228, 215, 245)";
    if (3 <= total && total < 6) return "rgb(191, 161, 226)";
    if (total >= 6) return "rgb(141, 90, 207)";
  };

  const getMarkedDates = () => {
    const marks = {};
    for (const [date, time] of Object.entries(dailyTotalTimes)) {
      const color = getColorFromTime(time);
      if (color) marks[date] = { selected: true, selectedColor: color };
    }
    marks[selectedDate] = {
      ...(marks[selectedDate] || {}),
      selected: true,
      selectedColor: "grey",
    };
    return marks;
  };

  const getDDay = (targetDate) => {
    if (!targetDate) return "D-0";
    const today = new Date();
    const exam = new Date(targetDate);
    today.setHours(0, 0, 0, 0);
    exam.setHours(0, 0, 0, 0);
    const diffDays = Math.floor(
      (exam.getTime() - today.getTime()) / (1000 * 60 * 60 * 24)
    );
    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return "D-DAY";
    return `D+${Math.abs(diffDays)}`;
  };

  return (
    <SafeAreaWrapper backgroundTop="#EFE5FF" backgroundBottom="#ffffffff">
      <View style={{ flex: 1 }}>
        <LinearGradient colors={["#EFE5FF", "#FFFFFF"]} style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            {/* 제목 왼쪽 / 아이콘 오른쪽 */}
            <View style={styles.titleRow}>
              <Text style={styles.title}>나의 시험</Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/account")}
              >
                <Ionicons name="person-circle-outline" size={24} color="#663399" />
              </TouchableOpacity>
            </View>

            <View style={styles.examCardWhiteRow}>
              {examInfo ? (
                <>
                  <Text style={styles.examText}>{examInfo.name}</Text>
                  <View style={styles.ddayTagSmallInside}>
                    <Text style={styles.ddayText}>{getDDay(examInfo.date)}</Text>
                  </View>
                </>
              ) : null}
            </View>

            <View style={styles.listButtonRow}>
              <TouchableOpacity onPress={() => router.push("/schedule_list")}>
                <Text style={styles.listButtonText}>지난 시험 보기 &gt;</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/exam_schedule")}>
                <Text style={styles.listButtonText}>새로운 시험 생성 &gt;</Text>
              </TouchableOpacity>
            </View>

            {/* "나의 공부 시간" 제목에 위/아래 여백 추가 */}
            <Text style={[styles.title, styles.extraTopSpace, styles.extraBottomSpace]}>
              나의 공부 시간
            </Text>

            <View style={styles.calendarWrapper}>
              <Calendar
                current={selectedDate}
                onDayPress={(d) => setSelectedDate(d.dateString)}
                onMonthChange={(m) => setSelectedMonth(m.dateString.slice(0, 7))}
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
          </ScrollView>
        </LinearGradient>

        <BottomNavigation />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 80 },
  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: 20,
  },
  title: { fontSize: 24, fontWeight: "bold" },
  extraTopSpace: { marginTop: 28 },       // "나의 공부 시간" 위쪽 여백
  extraBottomSpace: { marginBottom: 20 }, // "나의 공부 시간" 아래쪽 여백
  iconButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#EBDDFB",
    justifyContent: "center",
    alignItems: "center",
  },
  examCardWhiteRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderWidth: 1,
    borderColor: "#D3BFFF",
    marginBottom: 8,
  },
  examText: { fontSize: 16, fontWeight: "bold", color: "#5E3BCB" },
  ddayTagSmallInside: {
    backgroundColor: "#E9E0F5",
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 16,
  },
  ddayText: { fontSize: 12, color: "#663399" },
  listButtonRow: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginTop: 8,
  },
  listButtonText: {
    fontSize: 12,
    color: "#9E73D9",
    fontWeight: "500",
    marginRight: 8,
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 5,
    borderWidth: 1,
    borderColor: "#9E73D9",
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
});
