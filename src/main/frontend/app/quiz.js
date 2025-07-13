// quiz.js
import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
} from "react-native";
import { useRouter } from "expo-router";
import { Feather } from "@expo/vector-icons";

export default function QuizScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("퀴즈");

  const tabs = [
    { name: "홈", label: "홈" },
    { name: "노트", label: "노트" },
    { name: "퀴즈", label: "퀴즈" },
    { name: "마이페이지", label: "마이페이지" },
  ];

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      {/* 상단 타이틀 */}
      <Text style={styles.title}>퀴즈</Text>

      <ScrollView contentContainerStyle={styles.scrollContent}>
        <Image
          source={require("../assets/images/emptynote.png")}
          style={styles.emptyImage}
          resizeMode="contain"
        />

        <Text style={styles.emptyMessage}>
          아직 생성된 문제가 없어요!{"\n"}학습한 내용을 점검해보세요!
        </Text>

        {/* 맞춤형 문제 생성 버튼 */}
        <TouchableOpacity
          style={styles.createButton}
          activeOpacity={0.7}
          onPress={() => router.push("/createquiz_selectnote")}  // 여기를 이렇게 변경
        >
          <View style={styles.createButtonBackground} />
          <Feather
            name="file-text"
            size={29}
            color="#B9A4DA"
            style={styles.createButtonIcon}
          />
          <View style={styles.createButtonTextWrapper}>
            <Text style={styles.createButtonTitle}>맞춤형 문제 생성</Text>
            <Text style={styles.createButtonSubtitle}>
              노트를 선택해 문제를 만들어보세요.
            </Text>
          </View>
        </TouchableOpacity>
      </ScrollView>

      {/* 오른쪽 하단 플로팅 버튼 하나만 */}
      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => alert("폴더 추가")}
        >
          <Feather name="folder-plus" size={24} color="#B9A4DA" />
        </TouchableOpacity>
      </View>

      {/* 하단 네비게이션 */}
      <View style={styles.bottomNav}>
        {tabs.map((tab, index) => (
          <TouchableOpacity
            key={index}
            style={styles.navItem}
            onPress={() => {
              setActiveTab(tab.name);
              if (tab.name === "노트") router.push("/note");
              else if (tab.name === "퀴즈") router.push("/quiz");
              else if (tab.name === "마이페이지") router.push("/mypage");
              else if (tab.name === "홈") router.push("/main");
            }}
          >
            <View
              style={[
                styles.dot,
                activeTab === tab.name
                  ? styles.dotActive
                  : styles.dotInactive,
              ]}
            />
            <Text
              style={[
                styles.navText,
                activeTab === tab.name
                  ? styles.navTextActive
                  : styles.navTextInactive,
              ]}
            >
              {tab.label}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    paddingTop: 70,
  },
  title: {
    fontFamily: "Abhaya Libre ExtraBold",
    fontSize: 32,
    fontWeight: "800",
    color: "#3C3C3C",
    marginLeft: 23,
    marginBottom: 20,
  },
  scrollContent: {
    alignItems: "center",
  },
  emptyImage: {
    width: 180,
    height: 200,
    marginTop: 150,
  },
  emptyMessage: {
    fontFamily: "Abel",
    fontSize: 24,
    textAlign: "center",
    color: "#3C3C3C",
    marginTop: 10,
  },
  createButton: {
    width: "90%",
    height: 85,
    borderRadius: 12,
    backgroundColor: "#ECE4F7",
    marginTop: 40,
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 20,
    position: "relative",
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ECE4F7",
    borderRadius: 12,
  },
  createButtonIcon: {
    marginRight: 20,
  },
  createButtonTextWrapper: {
    flex: 1,
  },
  createButtonTitle: {
    fontSize: 18,
    fontWeight: "bold",
    color: "#3C3C3C",
    marginBottom: 4,
  },
  createButtonSubtitle: {
    fontSize: 14,
    color: "#3C3C3C",
  },
  floatingButtons: {
    position: "absolute",
    bottom: 110,
    right: 20,
    flexDirection: "row",
  },
  circleButton: {
    width: 47,
    height: 47,
    borderRadius: 23.5,
    borderWidth: 1,
    borderColor: "#ECE4F7",
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "#ECE4F7",
  },
  bottomNav: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    flexDirection: "row",
    justifyContent: "space-around",
    height: 100,
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    paddingBottom: 30,
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontSize: 12,
  },
  navTextInactive: {
    color: "#ccc",
  },
  navTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  dotActive: {
    backgroundColor: "#222",
  },
  dotInactive: {
    backgroundColor: "#ccc",
  },
});
