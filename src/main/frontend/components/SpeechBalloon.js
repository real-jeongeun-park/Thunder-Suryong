import React from "react";
import { View, Text, StyleSheet } from "react-native";

export default function SpeechBalloon({
  children,
  bubbleStyle,
  tailStyle,
  textStyle,
  tailPosition = "left",
}) {
  return (
    <View style={styles.container}>
      {/* 말풍선 본체 */}
      <View
        style={[
          styles.bubble,
          tailPosition === "right" && styles.bubbleRight,
          bubbleStyle,
        ]}
      >
        <Text style={[styles.text, textStyle]}>{children}</Text>
      </View>
      {/* 말풍선 꼬리 */}
      {/* <View
        style={[
          styles.tail,
          tailPosition === "right" ? styles.tailRight : styles.tailLeft,
          tailStyle,
        ]}
      />*/}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    alignItems: "flex-end", // 'flex-end' → 'center'로 변경해서 꼬리와 본체가 수직 중앙 정렬
  },
  bubble: {
    backgroundColor: "#c9c4dfff",
    paddingVertical: 12,
    paddingHorizontal: 18,
    borderRadius: 20,
    maxWidth: "80%",
  },
  bubbleRight: {
    backgroundColor: "#afa5d6ff",
  },
  text: {
    color: "#fff",
    fontSize: 15,
  },
  tail: {
    width: 0,
    height: 0,
    borderTopWidth: 10, // 꼬리 크기 약간 조절. 기존 18에서 작게 줄임
    borderTopColor: "transparent",
    borderLeftWidth: 15, // 꼬리 너비를 본문 두께에 어울리게 맞춤
    borderLeftColor: "#afa5d6ff",
    borderRadius: 2,
    position: "absolute",
    left: 124,
  },
  tailLeft: {},
  tailRight: {
    borderLeftColor: "#afa5d6ff",
    marginLeft: 0,
    marginRight: 2,
    transform: [{ scaleX: -1 }],
  },
});
