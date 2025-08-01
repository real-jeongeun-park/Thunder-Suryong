// src/main/frontend/app/timer.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

export default function TimerScreen() {
  const [selectedTab, setSelectedTab] = useState("일반");

  const subjects = [
    { name: "고급기계학습", time: "00:21:09" },
    { name: "심층학습", time: "00:00:00" },
    { name: "클라우드 컴퓨팅", time: "00:56:21" },
    { name: "알고리즘", time: "01:05:50" },
    { name: "추천시스템", time: "02:12:33" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>타이머</Text>

      {/* 탭 선택 버튼 */}
      <View style={styles.tabContainer}>
        {["일반", "뽀모도로"].map((tab) => (
          <TouchableOpacity
            key={tab}
            style={[styles.tab, selectedTab === tab && styles.selectedTab]}
            onPress={() => setSelectedTab(tab)}
          >
            <Text style={[styles.tabText, selectedTab === tab && styles.selectedTabText]}>
              {tab}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* 메인 타이머 */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>00 : 00 : 00</Text>
      </View>

      {/* 과목별 타이머 리스트 */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>과목</Text>
        <Text style={styles.tableHeaderText}>시간</Text>
        <Text style={styles.tableHeaderText}>pause/quit</Text>
      </View>

      <FlatList
        data={subjects}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.subjectRow}>
            <Text style={styles.subjectText}>{item.name}</Text>
            <Text style={styles.subjectText}>{item.time}</Text>
            <View style={styles.buttonGroup}>
              <TouchableOpacity style={styles.circleButton}>
                <Text style={styles.buttonSymbol}>⏸</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleButton}>
                <Text style={styles.buttonSymbol}>■</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    padding: 20,
  },
  header: {
    fontSize: 22,
    fontWeight: "bold",
    marginBottom: 12,
  },
  tabContainer: {
    flexDirection: "row",
    marginBottom: 20,
  },
  tab: {
    borderColor: "#B491DD",
    borderWidth: 1,
    borderRadius: 12,
    paddingHorizontal: 14,
    paddingVertical: 6,
    marginRight: 10,
  },
  selectedTab: {
    backgroundColor: "#B491DD",
  },
  tabText: {
    color: "#B491DD",
    fontWeight: "500",
  },
  selectedTabText: {
    color: "#fff",
  },
  timerContainer: {
    alignItems: "center",
    marginBottom: 30,
  },
  timerText: {
    fontSize: 48,
    color: "#B491DD",
    fontWeight: "bold",
    letterSpacing: 4,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#B491DD",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5DDF8",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
    borderRadius: 8,
  },
  subjectText: {
    flex: 1,
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    gap: 8,
  },
  circleButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonSymbol: {
    fontSize: 12,
  },
});
