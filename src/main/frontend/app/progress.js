import React, { useState } from "react";
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

  const hourCount = 24;
  const daysCount = 6;

  function renderTimeTable() {
    return Array.from({ length: hourCount }, (_, i) => (
      <View style={styles.timeTableRow} key={`row-${i}`}>
        <Text style={styles.timeTableHour}>
          {i.toString().padStart(2, "0")}
        </Text>
        {Array.from({ length: daysCount }, (_, j) => (
          <View style={styles.timeTableCell} key={`cell-${i}-${j}`} />
        ))}
      </View>
    ));
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
        {activeTab === "Planner" && <Text>플래너 내용</Text>}
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
  },
  timeTableBox: {
    marginHorizontal: 27,
    borderRadius: 10,
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
    borderRadius: 4,
    marginRight: 1,
  },
});
