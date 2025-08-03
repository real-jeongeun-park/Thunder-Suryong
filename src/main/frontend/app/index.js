import { useRouter } from "expo-router";
import { useEffect, useRef, useState } from "react";
import axios from "axios";

import {
  Animated,
  Image,
  StyleSheet,
  Text,
  TouchableOpacity,
  View,
} from "react-native";

export default function Home() {
  const router = useRouter();

  const fadeHello = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const fadeButtons = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    // 순차 페이드인 애니메이션
    Animated.sequence([
      Animated.timing(fadeHello, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeSubtitle, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(fadeButtons, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <View style={styles.container}>
      {/* 수룡이 이미지 */}
      <Image
        source={require("../assets/images/index.png")}
        style={styles.character}
        resizeMode="contain"
      />

      {/* 인삿말 */}
      <Animated.Text style={[styles.title, { opacity: fadeHello }]}>
        안녕하세요!
      </Animated.Text>

      {/* 부제 */}
      <Animated.Text style={[styles.title, { opacity: fadeSubtitle }]}>
        수룡이가 벼락치기를 도와줄게요!
      </Animated.Text>

      {/* 로그인/회원가입 버튼 */}
      <Animated.View style={{ opacity: fadeButtons, marginTop: 30 }}>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/main")}
        >
          <Text style={styles.buttonText}>로그인</Text>
        </TouchableOpacity>
        <TouchableOpacity
          style={styles.button}
          onPress={() => router.replace("/signup")}
        >
          <Text style={styles.buttonText}>회원가입</Text>
        </TouchableOpacity>
      </Animated.View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    alignItems: "center",
    justifyContent: "center",
  },
  title: {
    fontSize: 24,
    fontWeight: "bold",
    marginTop: 20,
  },
  button: {
    backgroundColor: "#B491DD",
    paddingVertical: 15,
    width: 250,
    borderRadius: 10,
    marginBottom: 10,
    alignItems: "center",
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  character: {
    width: 200,
    height: 200,
    marginBottom: 30,
  },
});
