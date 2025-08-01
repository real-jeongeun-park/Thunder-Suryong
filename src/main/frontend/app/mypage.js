import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter, usePathname } from "expo-router";

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

  const tabs = [
    { name: "홈", label: "홈", path: "/main" },
    { name: "노트", label: "노트", path: "/note" },
    { name: "퀴즈", label: "퀴즈", path: "/quiz" },
    { name: "마이페이지", label: "마이페이지", path: "/mypage" },
  ];

  const activeTab = tabs.find((t) => pathname === t.path)?.name;

  function formatMonth(date) {
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
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
    <View style={{ flex: 1 }}>
      <LinearGradient colors={["#F4EDFB", "#FFFFFF"]} style={styles.gradient}>
        <ScrollView contentContainerStyle={styles.scrollContent}>
          <Text style={styles.title}>나의 시험</Text>

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
              아직 시간표를 불러오지 않았어요!{"\n"}사진으로 시간표를 불러와주세요.
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
                const newMonth = `${month.year}-${String(month.month).padStart(2, "0")}`;
                setMarkedDates(getMarkedDatesForMonth(newMonth));
              }}
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
            />
            <View style={styles.legendContainer}>
              <View style={[styles.legendItem, { backgroundColor: "#E4D7F5" }]}> <Text style={styles.legendText}>1-3h</Text></View>
              <View style={[styles.legendItem, { backgroundColor: "#BFA1E2" }]}> <Text style={styles.legendText}>3-6h</Text></View>
              <View style={[styles.legendItem, { backgroundColor: "#8D5ACF" }]}> <Text style={styles.legendText}>6h-</Text></View>
            </View>
          </View>
        </ScrollView>
      </LinearGradient>

      {/* 하단 배경 */}
      <View style={styles.footerContainer}>
        <View style={styles.handleBar} />
        <TouchableOpacity style={styles.logoutButton} onPress={() => console.log("로그아웃")}> <Text style={styles.logoutText}>로그아웃</Text></TouchableOpacity>
        <TouchableOpacity onPress={() => console.log("회원 탈퇴하기")}> <Text style={styles.withdrawText}>회원 탈퇴하기</Text></TouchableOpacity>
      </View>

      <View style={styles.bottomNav}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => router.push(tab.path)}
          >
            <View
              style={[styles.dot, activeTab === tab.name ? styles.dotActive : styles.dotInactive]}
            />
            <Text
              style={[styles.navText, activeTab === tab.name ? styles.navTextActive : styles.navTextInactive]}
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
  gradient: { flex: 1 },
  scrollContent: { padding: 20, paddingBottom: 80 },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 12 },
  examCardWhiteRow: {
    flexDirection: "row", justifyContent: "space-between", alignItems: "center",
    backgroundColor: "#fff", borderRadius: 12, paddingVertical: 14, paddingHorizontal: 16,
    borderWidth: 1, borderColor: "#D3BFFF", marginBottom: 8,
  },
  examText: { fontSize: 16, fontWeight: "bold", color: "#5E3BCB" },
  ddayTagSmallInside: {
    backgroundColor: "#E9E0F5", paddingHorizontal: 10, paddingVertical: 4, borderRadius: 16,
  },
  ddayText: { fontSize: 12, color: "#663399" },
  historyButton: { alignItems: "flex-end", marginTop: 8 },
  historyText: { fontSize: 12, color: "#9E73D9", fontWeight: "500" },
  subTitle: { fontSize: 18, fontWeight: "bold", marginTop: 32, marginBottom: 12 },
  timetableBox: { alignItems: "center", marginBottom: 20 },
  timetableImage: { width: 180, height: 200, marginVertical: 10 },
  emptyMessage: { textAlign: "center", color: "#3C3C3C", fontSize: 14, marginBottom: 10 },
  uploadButton: {
    backgroundColor: "#9E73D9", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20,
  },
  uploadText: { fontSize: 12, color: "#fff", fontWeight: "500" },
  studyTitle: { fontSize: 18, fontWeight: "bold", marginTop: 12, marginBottom: 12 },
  calendarWrapper: {
    backgroundColor: "#fff", borderRadius: 12, padding: 10,
    borderWidth: 1, borderColor: "#9E73D9",
  },
  legendContainer: { flexDirection: "row", justifyContent: "flex-start", marginTop: 10, gap: 8 },
  legendItem: { borderRadius: 6, paddingHorizontal: 10, paddingVertical: 4 },
  legendText: { fontSize: 12, color: "#000" },
  footerContainer: {
    backgroundColor: "#F6F2FC", alignItems: "center", paddingTop: 15, paddingBottom: 24,
    marginTop: 0, borderTopLeftRadius: 60, borderTopRightRadius: 60,
    ...Platform.select({
      ios: { shadowColor: " " },
      android: { elevation: 0 },
    }),
  },
  handleBar: {
    width: 40, height: 6, borderRadius: 3, backgroundColor: "#D1D1D1", marginBottom: 25,
  },
  logoutButton: {
    backgroundColor: "#9B73D2", paddingVertical: 16, paddingHorizontal: 60,
    borderRadius: 20, marginBottom: 25,
  },
  logoutText: { color: "white", fontSize: 18, fontWeight: "bold" },
  withdrawText: { color: "#C0C0C0", fontSize: 13, textDecorationLine: "underline" },
  bottomNav: {
    flexDirection: "row", justifyContent: "space-around", height: 100,
    backgroundColor: "#fff", borderTopWidth: 1, borderColor: "#eee", paddingBottom: 30,
  },
  navItem: { alignItems: "center", justifyContent: "center", flex: 1 },
  navText: { fontSize: 12 },
  navTextInactive: { color: "#ccc" },
  navTextActive: { color: "#000", fontWeight: "bold" },
  dot: { width: 12, height: 12, borderRadius: 4, marginBottom: 8 },
  dotActive: { backgroundColor: "#222" },
  dotInactive: { backgroundColor: "#ccc" },
});
