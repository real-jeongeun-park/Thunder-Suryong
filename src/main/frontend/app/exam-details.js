import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { Calendar } from "react-native-calendars";
import { LinearGradient } from "expo-linear-gradient";

export default function ExamDetailScreen() {
  const { examTitle, examDday } = useLocalSearchParams();
  const [selectedSubject, setSelectedSubject] = useState("추천시스템");
  const [isChecked, setIsChecked] = useState(false);
  const [currentMonth, setCurrentMonth] = useState(null);
  const [markedDates, setMarkedDates] = useState({});

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

  useEffect(() => {
    let initialMonth = "2025-03";

    if (examTitle === "2024 2학기 중간고사") {
      initialMonth = "2024-09";
    } else if (examTitle === "2024 2학기 기말고사") {
      initialMonth = "2024-11";
    }

    setCurrentMonth(initialMonth);
    setMarkedDates(getMarkedDatesForMonth(initialMonth));
  }, []);

  const handleMonthChange = (month) => {
    const formatted = `${month.year}-${String(month.month).padStart(2, "0")}`;
    setCurrentMonth(formatted);
    setMarkedDates(getMarkedDatesForMonth(formatted));
  };

  return (
    <LinearGradient
      colors={["#F5EDFF", "#FFFFFF"]}
      style={styles.gradient}
      start={{ x: 0.5, y: 0 }}
      end={{ x: 0.5, y: 1 }}
    >
      <ScrollView contentContainerStyle={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => history.back()}>
            <Ionicons name="chevron-back" size={24} color="#000" />
          </TouchableOpacity>
          <Text style={styles.title}>{examTitle}</Text>
          <View style={styles.ddayBox}>
            <Text style={styles.ddayText}>{examDday}</Text>
          </View>
        </View>

        {/* 캘린더 */}
        {currentMonth && (
          <View style={styles.calendarWrapper}>
            <Calendar
              current={currentMonth + "-01"}
              markingType="custom"
              markedDates={markedDates}
              onMonthChange={handleMonthChange}
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
          </View>
        )}

        {/* 공부 시간 태그 */}
        <View style={styles.tagContainer}>
          <View style={[styles.tag, { backgroundColor: "#E4D7F5" }]}>
            <Text style={styles.tagText}>1~3h</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: "#BFA1E2" }]}>
            <Text style={styles.tagText}>3~6h</Text>
          </View>
          <View style={[styles.tag, { backgroundColor: "#8D5ACF" }]}>
            <Text style={styles.tagText}>6h~</Text>
          </View>
        </View>

        {/* 과목 선택 */}
        <View style={styles.subjectBox}>
          <TouchableOpacity
            style={[styles.checkbox, isChecked && styles.checkboxChecked]}
            onPress={() => setIsChecked(!isChecked)}
          >
            {isChecked && <Ionicons name="checkmark" size={14} color="#fff" />}
          </TouchableOpacity>
          <Text style={styles.subjectText}>{selectedSubject} ⏷</Text>
        </View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  gradient: { flex: 1 },
  container: {
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 40,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 16,
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginLeft: 8,
    flex: 1,
  },
  ddayBox: {
    borderWidth: 1,
    borderColor: "#C2A6F2",
    borderRadius: 20,
    paddingHorizontal: 10,
    paddingVertical: 4,
    backgroundColor: "#fff",
  },
  ddayText: {
    color: "#A57BEF",
    fontWeight: "bold",
    fontSize: 12,
  },
  calendarWrapper: {
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 10,
    borderWidth: 1,
    borderColor: "#9E73D9",
  },
  tagContainer: {
    flexDirection: "row",
    gap: 8,
    marginVertical: 12,
  },
  tag: {
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  tagText: {
    fontSize: 12,
    color: "#000",
  },
  subjectBox: {
    backgroundColor: "#fff",
    padding: 12,
    borderRadius: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  checkbox: {
    width: 20,
    height: 20,
    borderWidth: 1,
    borderColor: "#000",
    marginRight: 12,
    borderRadius: 4,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
  },
  checkboxChecked: {
    backgroundColor: "#8D5ACF",
    borderColor: "#8D5ACF",
  },
  subjectText: {
    fontSize: 14,
    color: "#000",
  },
});
