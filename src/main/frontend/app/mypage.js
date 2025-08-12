// app/mypage.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Modal,
  Image,
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
  const [modalVisible, setModalVisible] = useState(false);

  const collectedDragons = [
    require("../assets/images/dragon/33_water2.png"),
    require("../assets/images/dragon/33_grass1.png"),
    require("../assets/images/dragon/33_thunder2.png"),
    require("../assets/images/dragon/66_water1.png"),
    require("../assets/images/dragon/66_grass1.png"),
    require("../assets/images/dragon/66_thunder2.png"),
    require("../assets/images/dragon/100_water1.png"),
    require("../assets/images/dragon/100_grass1.png"),
    require("../assets/images/dragon/100_thunder2.png"),
  ];

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
    const [h, m, s] = timeString.split(":" ).map(Number);
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
            <View style={styles.titleRow}>
              <Text style={styles.title}>마이페이지</Text>
              <TouchableOpacity
                style={styles.iconButton}
                onPress={() => router.push("/account")}
              >
                <Ionicons name="person-circle-outline" size={24} color="#663399" />
              </TouchableOpacity>
            </View>
            <Text style={[styles.subtitle, styles.extraBottomSpace]}>나의 시험</Text>
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
              <TouchableOpacity onPress={() => router.push("/schedule_list") }>
                <Text style={styles.listButtonText}>지난 시험 보기 &gt;</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => router.push("/exam_schedule") }>
                <Text style={styles.listButtonText}>새로운 시험 생성 &gt;</Text>
              </TouchableOpacity>
            </View>

            <Text style={[styles.subtitle, styles.extraTopSpace, styles.extraBottomSpace]}>
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

            <View style={styles.sectionHeader}>
  <Text style={styles.subtitle}>수룡이 도감</Text>
  <TouchableOpacity
    onPress={() => setModalVisible(true)}
    style={styles.viewAllButtonWrapper}
  >
    <Text style={styles.listButtonText}>전체 보기 &gt;</Text>
  </TouchableOpacity>
</View>

<View style={styles.collectedRow}>
  {collectedDragons.slice(0, 3).map((img, idx) => (
    <View key={idx} style={styles.suryongCard}>
      <Image source={img} style={styles.suryongImageGrid} />
    </View>
  ))}
</View>

<Modal visible={modalVisible} transparent animationType="slide">
  <View style={styles.modalOverlay}>
    <View style={styles.modalContent}>
      <Text style={styles.modalTitle}>수룡이 도감 전체 보기</Text>

      <ScrollView contentContainerStyle={styles.modalScroll}>
       <View style={styles.gridWrapper}>
  {collectedDragons.map((img, idx) => (
    <View key={idx} style={styles.suryongCard}>
      <Image source={img} style={styles.suryongImageGrid} />
    </View>
  ))}    
        </View>
      </ScrollView>

      <TouchableOpacity
        onPress={() => setModalVisible(false)}
        style={styles.modalCloseButton}
      >
        <Text style={{ color: "#663399", fontWeight: "bold" }}>닫기</Text>
      </TouchableOpacity>
    </View>
  </View>
</Modal>
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

  title: {
    fontFamily: "Abhaya Libre ExtraBold",
    fontSize: 32,
    fontWeight: "800",
    color: "#3C3C3C",
    marginLeft: 3,
    marginBottom: 20,
    paddingTop: 20,
  },

  titleRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  subtitle: { fontSize: 24, fontWeight: "bold" },
  extraTopSpace: { marginTop: 28 },
  extraBottomSpace: { marginBottom: 20 },

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

  collectedRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 8,
  },

  suryongImage: {
    width: 100,
    height: 100,
    resizeMode: "contain",
    borderRadius: 12,
  },

  // ✅ 수집한 수룡이 섹션
  sectionHeader: {
    marginTop: 28,
    marginBottom: 8,
    paddingBottom: 8,
  },

  viewAllButtonWrapper: {
    alignItems: "flex-end",
    width: "100%",
    marginTop: 4,
  },

  // ✅ 모달 관련
  modalOverlay: {
  flex: 1,
  backgroundColor: "rgba(0, 0, 0, 0.5)",
  justifyContent: "center",     // 🔥 세로 중앙 정렬
  alignItems: "center",         // 🔥 가로 중앙 정렬
  },

  modalContent: {
  width: 360,
  height: 600,              // 또는 360
  maxWidth: 400,             // 너무 커지지 않도록
  backgroundColor: "#fff",
  borderRadius: 20,
  paddingVertical: 24,
  paddingHorizontal: 16,
  alignItems: "center",

},

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginTop: 20,
    marginBottom: 10,
    color: "#000000",
  },

modalScroll: {
  flexGrow: 1, // 핵심!
  justifyContent: "center", // 수직 가운데 정렬
  alignItems: "center",     // 수평 가운데 정렬
  paddingVertical: 20,
},

gridWrapper: {
  flexDirection: "row",
  flexWrap: "wrap",
  justifyContent: "space-between",
  paddingHorizontal: 10,
},

  collectedRow: {
  flexDirection: "row",
  justifyContent: "space-between",
  paddingHorizontal: 12,
  marginBottom: 8,
},

  suryongImageGrid: {
  width: 82,           // 고정 너비
  height:130,          // 고정 높이
  resizeMode: "contain",
  borderRadius: 12,
},

suryongCard: {
  width: "30%", // 3개가 한 줄에 들어오게
  aspectRatio: 0.75, // 조금 더 세로 길게
  backgroundColor: "#fff",
  borderRadius: 10,
  borderWidth: 1,
  borderColor: "#9E73D9",
  alignItems: "center",
  justifyContent: "center",
  marginBottom: 14,  // 카드 간 세로 간격
},

suryongImageCard: {
  width: "100%",
  height: "100%",
  resizeMode: "contain",
  borderRadius: 15,
},

  modalCloseButton: {
    marginTop: 20,
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#E9E0F5",
    borderRadius: 12,
  },
});
