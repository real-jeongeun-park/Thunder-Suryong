<<<<<<< HEAD
import React, { useState, useEffect } from "react";
=======
// MyPageScreen.js
import React, { useState } from "react";
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
<<<<<<< HEAD
=======
  Image,
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
  Platform,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, usePathname } from "expo-router";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import BottomNavigation from "../components/BottomNavigation";
<<<<<<< HEAD
import { format } from "date-fns";
import axios from "axios";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";

export default function MyPageScreen() {
  const studyTags = [
    { text: "0-3h", bgColor: "rgb(228, 215, 245)", textColor: "#6D7582" },
    { text: "3-6h", bgColor: "rgb(191, 161, 226)", textColor: "#F3EEFB" },
    { text: "6h+", bgColor: "rgb(141, 90, 207)", textColor: "#F3EEFB" },
  ];

  const router = useRouter();
  const pathname = usePathname();

  const [selectedDate, setSelectedDate] = useState(
    format(new Date(), "yyyy-MM-dd")
  );
  const [selectedMonth, setSelectedMonth] = useState(
    format(new Date(), "yyyy-MM")
  );

  const [userInfo, setUserInfo] = useState(false);
  const [examInfo, setExamInfo] = useState(null);
  const [dailyTotalTimes, setDailyTotalTimes] = useState([]);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

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
    const getCurrentExam = async() => {
        try{
            const response = await axios.post(`${API_BASE_URL}/api/exam/getOne`, {
                nickname: userInfo.nickname,
            });
            setExamInfo(response.data);
        } catch(err){
            console.log("failed to get current exam info ", err);
        }
    }

    if(userInfo !== null){
        getCurrentExam();
    }
  }, [userInfo])

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

  const getDDay = (targetDate) => {
    if (!targetDate) return "D-0";

    const today = new Date();
    const exam = new Date(targetDate);

    // 시/분/초/밀리초 제거 (날짜만 비교)
    today.setHours(0, 0, 0, 0);
    exam.setHours(0, 0, 0, 0);

    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

    if (diffDays > 0) return `D-${diffDays}`;
    if (diffDays === 0) return "D-DAY";
    return `D+${Math.abs(diffDays)}`;
  };

  return (
    <SafeAreaWrapper backgroundTop="#EFE5FF" backgroundBottom="#ffffffff">
=======

export default function MyPageScreen() {
  const router = useRouter();
  const pathname = usePathname();
  const today = new Date();

  const [examInfo, setExamInfo] = useState({
    name: "2025 1학기 기말고사",
    date: "2025-09-05",
  });

  const [markedDates, setMarkedDates] = useState(
    getMarkedDatesForMonth(formatMonth(today))
  );

  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  const tabs = [
    { name: "홈", label: "홈", path: "/main" },
    { name: "노트", label: "노트", path: "/note" },
    { name: "퀴즈", label: "퀴즈", path: "/quiz" },
    { name: "마이페이지", label: "마이페이지", path: "/mypage" },
  ];

  const activeTab = tabs.find((t) => pathname === t.path)?.name;

  function formatMonth(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(
      2,
      "0"
    )}`;
  }

  function getMarkedDatesForMonth(month) {
    const dates = {};
    for (let day = 1; day <= 31; day++) {
      const date = `${month}-${String(day).padStart(2, "0")}`;
      const hours = Math.floor(Math.random() * 7);
      if (hours === 0) continue;
      let color = "";
      if (hours >= 6) color = "#8D5ACF";
      else if (hours >= 3) color = "#BFA1E2";
      else color = "#E4D7F5";

      dates[date] = {
        customStyles: {
          container: {
            backgroundColor: color,
            borderRadius: 18,
            width: 36,
            height: 36,
            justifyContent: "center",
            alignItems: "center",
          },
          text: {
            color: "#FFFFFF",
            fontWeight: "bold",
          },
        },
      };
    }
    return dates;
  }

  function getDDay(targetDate) {
    if (!targetDate) return "D-0";
    const today = new Date();
    const exam = new Date(targetDate);
    const diffTime = exam.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return `D-${diffDays}`;
  }

  return (
    <SafeAreaWrapper backgroundTop="#EFE5FF" backgroundBottom="#ffffffff">
      {/* 본문 */}
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
      <View style={{ flex: 1 }}>
        <LinearGradient colors={["#EFE5FF", "#FFFFFF"]} style={styles.gradient}>
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <Text style={styles.title}>나의 시험</Text>
<<<<<<< HEAD
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

            <Text style={styles.title}>나의 공부 시간</Text>
            <View style={styles.calendarWrapper}>
              <Calendar
                current={selectedDate}
                onDayPress={(day) => setSelectedDate(day.dateString)}
                onMonthChange={(monthInfo) => {
                  const month = monthInfo.dateString.slice(0, 7);
                  setSelectedMonth(month);
                }}
                markedDates={getMarkedDates()}
=======

            <View style={styles.examCardWhiteRow}>
              <Text style={styles.examText}>{examInfo.name}</Text>
              <View style={styles.ddayTagSmallInside}>
                <Text style={styles.ddayText}>{getDDay(examInfo.date)}</Text>
              </View>
            </View>

            <TouchableOpacity
              style={styles.historyButton}
              onPress={() => router.push("/past-exams")}
            >
              <Text style={styles.historyText}>지난 시험 보기 &gt;</Text>
            </TouchableOpacity>

            <Text style={styles.subTitle}>시간표</Text>

            <View style={styles.timetableBox}>
              <Image
                source={require("../assets/images/emptynote.png")}
                style={styles.timetableImage}
                resizeMode="contain"
              />
              <Text style={styles.emptyMessage}>
                아직 시간표를 불러오지 않았어요!{"\n"}사진으로 시간표를
                불러와주세요.
              </Text>
              <TouchableOpacity style={styles.uploadButton}>
                <Text style={styles.uploadText}>사진으로 시간표 불러오기</Text>
              </TouchableOpacity>
            </View>

            <Text style={styles.studyTitle}>나의 공부 시간</Text>
            <View style={styles.calendarWrapper}>
              <Calendar
                current={formatMonth(today) + "-01"}
                markingType="custom"
                markedDates={markedDates}
                onMonthChange={(month) => {
                  const newMonth = `${month.year}-${String(
                    month.month
                  ).padStart(2, "0")}`;
                  setMarkedDates(getMarkedDatesForMonth(newMonth));
                }}
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
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
<<<<<<< HEAD
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
=======
              />
              <View style={styles.legendContainer}>
                <View
                  style={[styles.legendItem, { backgroundColor: "#E4D7F5" }]}
                >
                  <Text style={styles.legendText}>1-3h</Text>
                </View>
                <View
                  style={[styles.legendItem, { backgroundColor: "#BFA1E2" }]}
                >
                  <Text style={styles.legendText}>3-6h</Text>
                </View>
                <View
                  style={[styles.legendItem, { backgroundColor: "#8D5ACF" }]}
                >
                  <Text style={styles.legendText}>6h-</Text>
                </View>
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
              </View>
            </View>
          </ScrollView>
        </LinearGradient>

        <View style={styles.footerContainer}>
          <View style={styles.handleBar} />
          <TouchableOpacity
            style={styles.logoutButton}
            onPress={() => console.log("로그아웃")}
          >
            <Text style={styles.logoutText}>로그아웃</Text>
          </TouchableOpacity>
          <TouchableOpacity onPress={() => setShowWithdrawModal(true)}>
            <Text style={styles.withdrawText}>회원 탈퇴하기</Text>
          </TouchableOpacity>
        </View>

        {showWithdrawModal && (
          <View style={styles.modalOverlay}>
            <View style={styles.modalContent}>
              <Text style={styles.modalText}>회원 탈퇴하시겠습니까?</Text>
              <View style={styles.modalButtonContainer}>
                <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                  <Text style={styles.modalCancel}>아니요</Text>
                </TouchableOpacity>
                <TouchableOpacity
                  onPress={() => {
                    console.log("탈퇴 완료");
                    setShowWithdrawModal(false);
                  }}
                >
                  <Text style={styles.modalConfirm}>예</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        )}

        <BottomNavigation />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 80 },
<<<<<<< HEAD
  title: { fontSize: 24, fontWeight: "bold", marginBottom: 20 },
=======
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginBottom: 20,
    //marginTop: "15%",
  },
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
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
<<<<<<< HEAD
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
=======
  historyButton: { alignItems: "flex-end", marginTop: 8 },
  historyText: { fontSize: 12, color: "#9E73D9", fontWeight: "500" },
  subTitle: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 12,
  },
  timetableBox: { alignItems: "center", marginBottom: 20 },
  timetableImage: { width: 180, height: 200, marginVertical: 10 },
  emptyMessage: {
    textAlign: "center",
    color: "#3C3C3C",
    fontSize: 14,
    marginBottom: 10,
  },
  uploadButton: {
    backgroundColor: "#9E73D9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
  },
  uploadText: { fontSize: 12, color: "#fff", fontWeight: "500" },
  studyTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 12,
    marginBottom: 12,
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
<<<<<<< HEAD
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
=======
    padding: 10,
    borderWidth: 1,
    borderColor: "#9E73D9",
  },
  legendContainer: {
    flexDirection: "row",
    justifyContent: "flex-start",
    marginTop: 10,
    gap: 8,
  },
  legendItem: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  legendText: { fontSize: 12, color: "#000" },
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
  footerContainer: {
    backgroundColor: "#F6F2FC",
    alignItems: "center",
    paddingTop: 15,
    paddingBottom: 24,
    borderTopLeftRadius: 60,
    borderTopRightRadius: 60,
<<<<<<< HEAD
=======
    ...Platform.select({
      ios: { shadowColor: " " },
      android: { elevation: 0 },
    }),
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
  },
  handleBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D1D1D1",
    marginBottom: 25,
  },
  logoutButton: {
    backgroundColor: "#9B73D2",
    paddingVertical: 16,
    paddingHorizontal: 60,
    borderRadius: 20,
    marginBottom: 25,
  },
  logoutText: { color: "white", fontSize: 18, fontWeight: "bold" },
  withdrawText: {
    color: "#C0C0C0",
    fontSize: 13,
    textDecorationLine: "underline",
  },
<<<<<<< HEAD
=======
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    //height: 100,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    //paddingBottom: 30,
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  navText: { fontSize: 12 },
  navTextInactive: { color: "#ccc" },
  navTextActive: { color: "#000", fontWeight: "bold" },
  dot: { width: 12, height: 12, borderRadius: 4, marginBottom: 8 },
  dotActive: { backgroundColor: "#222" },
  dotInactive: { backgroundColor: "#ccc" },
>>>>>>> d449e8b54cce5adfec3e19fc3ec4346c523ae4c2
  modalOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 999,
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 30,
    borderRadius: 12,
    alignItems: "center",
    width: "80%",
  },
  modalText: { fontSize: 16, fontWeight: "bold", marginBottom: 20 },
  modalButtonContainer: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 20,
  },
  modalCancel: {
    color: "#C0C0C0",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 16,
  },
  modalConfirm: {
    color: "#8D5ACF",
    fontSize: 16,
    textAlign: "center",
    paddingHorizontal: 16,
  },
});
