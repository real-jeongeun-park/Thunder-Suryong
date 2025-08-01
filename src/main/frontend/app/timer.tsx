// src/main/frontend/app/timer.tsx

import React, { useState } from "react";
import { View, Text, TouchableOpacity, StyleSheet, FlatList } from "react-native";

export default function TimerScreen() {
  const [selectedTab, setSelectedTab] = useState("일반");

  const subjects = [
    { name: "고급기계학습", time: "00:00:00" },
    { name: "심층학습", time: "00:00:00" },
    { name: "클라우드 컴퓨팅", time: "00:00:00" },
    { name: "알고리즘", time: "00:00:00" },
    { name: "추천시스템", time: "00:00:00" },
  ];

  return (
    <View style={styles.container}>
      <Text style={styles.header}>타이머</Text>

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
            <View style={styles.cell}>
              <Text style={styles.subjectText}>{item.name}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.subjectText}>{item.time}</Text>
            </View>
            <View style={[styles.cell, styles.buttonGroup]}>
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
  cell: {
    flex: 1,
    justifyContent: "center",
  },
  subjectText: {
    textAlign: "center",
  },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
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
