// app/timer.js (예시 경로)
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,

  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import { Ionicons } from "@expo/vector-icons";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { format } from "date-fns";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

export default function TimerScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const today = format(new Date(), "yyyy-MM-dd");
  const [subjects, setSubjects] = useState([]);
  const [runningSubjectName, setRunningSubjectName] = useState(null);
  const [startTime, setStartTime] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

  // 로그인 여부 체크
  useEffect(() => {
    async function checkLogin() {
      try {
        let token;
        if (Platform.OS === "web") token = localStorage.getItem("accessToken");
        else token = await SecureStore.getItemAsync("accessToken");

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

  // 과목 받아오기
  useEffect(() => {
    const getSubject = async () => {
      try {
        const res1 = await axios.post(`${API_BASE_URL}/api/subject/get`, {
          nickname: userInfo.nickname,
        });
        const { subjectNameList, subjectIdList } = res1.data;

        const res2 = await axios.post(`${API_BASE_URL}/api/totalTime/get`, {
          subjectIdList,
          date: today,
        });
        const totalTimeList = res2.data;

        if (subjectIdList && subjectIdList.length > 0) {
          const list = subjectIdList.map((id, idx) => ({
            id,
            name: subjectNameList[idx],
            time: totalTimeList[idx],
            isRunning: false,
          }));
          setSubjects(list);
        } else {
          setSubjects([]);
          setSubjects(subjectList);
        }
      } catch (err) {
        console.log("failed to load subjects ", err);
      }
    };
    if (userInfo !== null) getSubject();
  }, [userInfo]);

  const getNow = () => new Date().toTimeString().slice(0, 8);

  // 서버 저장
  const saveTimer = async (subject, endTime) => {
    try {
      await axios.post(`${API_BASE_URL}/api/timer/create`, {
        nickname: userInfo.nickname,
        subjectId: subject.id,
        date: today,
        startTime,
        endTime,
      });

      await axios.post(`${API_BASE_URL}/api/totalTime/create`, {
        subjectId: subject.id,
        date: today,
        totalTime: subject.time,
      });

      setStartTime(null);
    } catch (err) {
      console.log("failed to save time ", err);
    }
  };

  // 시작
  const handleStart = (name) => {
    if (runningSubjectName && runningSubjectName !== name) {
      alert("다른 과목의 타이머가 이미 실행 중입니다. 먼저 멈춰주세요.");
      return;
    }
    setSubjects((prev) =>
      prev.map((s) => (s.name === name ? { ...s, isRunning: true } : s))
    );
    setRunningSubjectName(name);
    setStartTime(getNow());
  };

  // 정지
  const handleStop = (name) => {
    if (!runningSubjectName) return;
    if (runningSubjectName !== name) {
      alert("다른 과목의 타이머가 이미 실행 중입니다. 먼저 멈춰주세요.");
      return;
    }

    setSubjects((prev) =>
      prev.map((s) => (s.name === name ? { ...s, isRunning: false } : s))
    );
    setRunningSubjectName(null);

    const selected = subjects.find((s) => s.name === name);
    if (selected) saveTimer(selected, getNow());
  };

  // 1초 증가
  useEffect(() => {
    const intervals = {};
    subjects.forEach((subject) => {
      if (subject.isRunning && !intervals[subject.name]) {
        intervals[subject.name] = setInterval(() => {
          setSubjects((prev) =>
            prev.map((s) => {
              if (s.name === subject.name && s.isRunning) {
                const [h, m, sec] = s.time.split(":").map(Number);
                const totalSec = h * 3600 + m * 60 + sec + 1;
                const hh = String(Math.floor(totalSec / 3600)).padStart(2, "0");
                const mm = String(Math.floor((totalSec % 3600) / 60)).padStart(2, "0");
                const ss = String(totalSec % 60).padStart(2, "0");
                return { ...s, time: `${hh}:${mm}:${ss}` };
              }
              return s;
            })
          );
        }, 1000);
      }
    });
    return () => Object.values(intervals).forEach(clearInterval);
  }, [subjects]);

  const runningSubject = subjects.find((s) => s.name === runningSubjectName);

  return (
    <View style={[styles.container, { paddingTop: insets.top + 6 }]}>
      {/* 🔙 뒤로가기 + 타이틀 */}
      <View style={styles.headerRow}>
        <TouchableOpacity onPress={() => router.back()} style={{ padding: 4 }}>
          <Ionicons name="chevron-back" size={28} color="#000" />
        </TouchableOpacity>
        <Text style={styles.header}>타이머</Text>
      </View>

        {/* 헤더 */}
        <View style={styles.tableHeader}>
          <Text style={styles.tableHeaderText}>과목</Text>
          <Text style={styles.tableHeaderText}>시간</Text>
          <Text style={styles.tableHeaderText}>시작/일시정지</Text>
        </View>

      {/* 표 헤더 */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>과목</Text>
        <Text style={styles.tableHeaderText}>시간</Text>
        <Text style={styles.tableHeaderText}>시작/일시정지</Text>
      </View>

      {/* 과목 리스트 */}
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
              <TouchableOpacity
                style={styles.circleButton}
                onPress={() =>
                  item.isRunning ? handleStop(item.name) : handleStart(item.name)
                }
              >
                <Ionicons
                  name={item.isRunning ? "pause-circle-outline" : "play-circle-outline"}
                  size={28}
                  color="#8D5ACF"
                />
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListEmptyComponent={
          <View style={{ padding: 20, alignItems: "center" }}>
            <Text style={{ fontSize: 16, color: "#999" }}>
              표시할 과목이 없습니다.
            </Text>
          </View>
        }
        contentContainerStyle={{ paddingBottom: 24 + insets.bottom }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", paddingHorizontal: 20 },
  headerRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    gap: 8,
  },
  header: { fontSize: 22, fontWeight: "bold" },

  timerContainer: { alignItems: "center", marginBottom: 24 }
  todayText: {
    fontSize: 24,
    color: "#B491DD",
    fontWeight: "bold",
    letterSpacing: 4,
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
  cell: { flex: 1, justifyContent: "center" },
  subjectText: { textAlign: "center" },

  buttonGroup: { flexDirection: "row", justifyContent: "center", gap: 8 },
  circleButton: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 1,
    borderColor: "#ddd",
  },
});
