import React, { useEffect, useRef } from "react";
import {
  SafeAreaView,
  View,
  Text,
  Image,
  StyleSheet,
  Pressable,
  Animated,
  Platform,
  useWindowDimensions,
  StatusBar,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import * as Haptics from "expo-haptics";
import Svg, { Defs, RadialGradient, Stop, Rect, Path } from "react-native-svg";
import { useRouter } from "expo-router";

const COLORS = {
  primary: "#8c60c5ff",
  primaryDark: "#8B5CFF",
  bgTop: "#FFFFFF",
  bgBottom: "#F3EEFF",
  waveFront: "#ECE6FF",
  waveBack: "#F2EDFF",
  text: "#0B0920",
  subtext: "rgba(11,9,32,0.64)",
};

export default function Welcome() {
  const router = useRouter();
  const { width, height } = useWindowDimensions();

  // ===== 애니메이션 값 정의
  const fadeTitle = useRef(new Animated.Value(0)).current;
  const fadeSubtitle = useRef(new Animated.Value(0)).current;
  const fadeButtons = useRef(new Animated.Value(0)).current;
  const transTitle = useRef(new Animated.Value(10)).current;
  const transSubtitle = useRef(new Animated.Value(10)).current;
  const transButtons = useRef(new Animated.Value(10)).current;
  const scalePrimary = useRef(new Animated.Value(1)).current;
  const scaleSecondary = useRef(new Animated.Value(1)).current;
  const floatAnim = useRef(new Animated.Value(0)).current;

  // 스프링 애니메이션 유틸 (버튼 클릭 시 살짝 눌리는 효과)
  const springTo = (anim, toValue) =>
    Animated.spring(anim, {
      toValue,
      useNativeDriver: true,
      speed: 20,
      bounciness: 6,
    }).start();

  const pressIn = (anim) => () => springTo(anim, 0.97);
  const pressOut = (anim) => () => springTo(anim, 1);

  useEffect(() => {
    // 타이틀 → 부제목 → 버튼 순서로 순차 페이드인 + 위로 이동
    Animated.sequence([
      Animated.parallel([
        Animated.timing(fadeTitle, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(transTitle, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeSubtitle, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(transSubtitle, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
      Animated.parallel([
        Animated.timing(fadeButtons, {
          toValue: 1,
          duration: 420,
          useNativeDriver: true,
        }),
        Animated.timing(transButtons, {
          toValue: 0,
          duration: 420,
          useNativeDriver: true,
        }),
      ]),
    ]).start();

    // 마스코트 이미지 살짝 떠다니는 효과 반복
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: 1,
          duration: 2000,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0,
          duration: 2000,
          useNativeDriver: true,
        }),
      ]),
      { resetBeforeIteration: true, isInteraction: false }
    ).start();
  }, []);

  // 이미지 크기 (화면 비율에 따라 조절)
  const IMG_SIZE = Math.min(width * 0.58, 248);
  const floatY = floatAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, -4],
  });

  // 후광 크기 (화면보다 크게 하여 가장자리 보이지 않게)
  const HALO_SCALE = 1.8;
  const haloSize = Math.max(width, 390) * HALO_SCALE;
  const haloLeft = (width - haloSize) / 2;
  const haloTop = 64;

  // 하단 물결 높이 (화면 크기에 비례)
  const WAVE_HEIGHT = Math.min(280, Math.max(190, Math.round(height * 0.28)));

  // 회원가입 버튼 클릭
  const onPressSignup = async () => {
    try {
      await Haptics.selectionAsync(); // 햅틱 피드백
    } catch {}
    router.replace("/signup");
  };

  // 로그인 버튼 클릭
  const onPressLogin = async () => {
    try {
      await Haptics.selectionAsync(); // 햅틱 피드백
    } catch {}
    router.replace("/login");
  };

  // Android에서 상단 StatusBar 영역까지 그라데이션이 연장되도록 높이 설정
  const STATUS_BAR_HEIGHT =
    Platform.OS === "android" ? StatusBar.currentHeight || 0 : 0;

  return (
    <View style={{ flex: 1, backgroundColor: COLORS.bgTop }}>
      {/* 시스템 StatusBar 영역까지 콘텐츠 표시 */}
      <StatusBar
        barStyle="dark-content"
        translucent
        backgroundColor="transparent"
        animated
      />

      {/* 세로 방향 배경 그라데이션 */}
      <LinearGradient
        colors={[COLORS.bgTop, COLORS.bgBottom]}
        start={{ x: 0.5, y: 0 }}
        end={{ x: 0.5, y: 1 }}
        style={[StyleSheet.absoluteFillObject]}
        pointerEvents="none"
      />

      {/* 마스코트 뒤의 원형 후광 */}
      <View style={StyleSheet.absoluteFill} pointerEvents="none">
        <Svg
          width={haloSize}
          height={haloSize}
          viewBox={`0 0 ${haloSize} ${haloSize}`}
          style={{ position: "absolute", left: haloLeft, top: haloTop }}
        >
          <Defs>
            <RadialGradient id="halo" cx="50%" cy="45%" r="50%">
              <Stop offset="0%" stopColor={COLORS.primary} stopOpacity="0.18" />
              <Stop
                offset="60%"
                stopColor={COLORS.primary}
                stopOpacity="0.10"
              />
              <Stop offset="100%" stopColor={COLORS.primary} stopOpacity="0" />
            </RadialGradient>
          </Defs>
          <Rect
            x="0"
            y="0"
            width={haloSize}
            height={haloSize}
            fill="url(#halo)"
          />
        </Svg>
      </View>

      {/* 하단 레이어드 물결 */}
      <View
        style={[styles.waveContainer, { height: WAVE_HEIGHT }]}
        pointerEvents="none"
      >
        <Svg
          width="100%"
          height="100%"
          viewBox="0 0 375 140"
          preserveAspectRatio="none"
        >
          {/* 뒷 물결 */}
          <Path
            d="M0,94 C70,120 120,60 190,86 C260,112 305,88 375,110 L375,140 L0,140 Z"
            fill="#F2EDFF"
          />
          {/* 앞 물결 */}
          <Path
            d="M0,88 C60,122 130,52 200,80 C265,105 315,78 375,104 L375,140 L0,140 Z"
            fill="#ECE6FF"
          />
        </Svg>
      </View>

      {/* SafeAreaView 안의 메인 콘텐츠 */}
      <SafeAreaView style={{ flex: 1, backgroundColor: "transparent" }}>
        <View style={styles.content}>
          <View style={{ height: 40 }} />

          {/* 마스코트 이미지 (살짝 떠다니는 애니메이션) */}
          <Animated.Image
            source={require("../assets/images/index.png")}
            resizeMode="contain"
            style={{
              width: IMG_SIZE,
              height: IMG_SIZE,
              marginBottom: 20,
              marginTop: 100,
              transform: [{ translateY: floatY }],
            }}
          />

          {/* 제목 */}
          <Animated.Text
            style={[
              styles.title,
              { opacity: fadeTitle, transform: [{ translateY: transTitle }] },
            ]}
          >
            벼락수룡에 오신 걸 환영해요!
          </Animated.Text>

          {/* 부제 */}
          <Animated.Text
            style={[
              styles.subtitle,
              {
                opacity: fadeSubtitle,
                transform: [{ translateY: transSubtitle }],
              },
            ]}
          >
            수룡이가 벼락치기를 도와줄게요.
          </Animated.Text>

          <View style={{ flex: 1 }} />

          {/* 버튼 영역 */}
          <Animated.View
            style={[
              styles.buttonsWrap,
              {
                opacity: fadeButtons,
                transform: [{ translateY: transButtons }],
              },
            ]}
          >
            {/* 회원가입 버튼 */}
            <Animated.View style={{ transform: [{ scale: scalePrimary }] }}>
              <Pressable
                onPress={onPressSignup}
                onPressIn={pressIn(scalePrimary)}
                onPressOut={pressOut(scalePrimary)}
                style={styles.primaryButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="회원가입 버튼"
                accessible
              >
                <LinearGradient
                  colors={[COLORS.primary, COLORS.primaryDark]}
                  start={{ x: 0, y: 0 }}
                  end={{ x: 1, y: 1 }}
                  style={StyleSheet.absoluteFill}
                />
                <Text style={[styles.buttonText, { color: "#FFF" }]}>
                  회원가입
                </Text>
              </Pressable>
            </Animated.View>

            <View style={{ height: 12 }} />

            {/* 로그인 버튼 */}
            <Animated.View style={{ transform: [{ scale: scaleSecondary }] }}>
              <Pressable
                onPress={onPressLogin}
                onPressIn={pressIn(scaleSecondary)}
                onPressOut={pressOut(scaleSecondary)}
                android_ripple={{
                  color:
                    Platform.OS === "android"
                      ? "rgba(109,74,255,0.12)"
                      : undefined,
                }}
                style={styles.secondaryButton}
                hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                accessibilityRole="button"
                accessibilityLabel="로그인 버튼"
                accessible
              >
                <Text style={[styles.buttonText, { color: COLORS.primary }]}>
                  로그인
                </Text>
              </Pressable>
            </Animated.View>
          </Animated.View>

          <View style={{ height: 20 }} />
        </View>
      </SafeAreaView>
    </View>
  );
}

const styles = StyleSheet.create({
  waveContainer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    alignItems: "center",
  },
  title: {
    fontSize: 30,
    lineHeight: 36,
    fontWeight: "800",
    color: COLORS.text,
    textAlign: "center",
    letterSpacing: -0.3,
  },
  subtitle: {
    fontSize: 20,
    lineHeight: 20,
    fontWeight: "600",
    color: COLORS.subtext,
    marginTop: 18,
    textAlign: "center",
  },
  buttonsWrap: {
    width: "100%",
  },
  primaryButton: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    overflow: "hidden",
  },
  secondaryButton: {
    height: 56,
    borderRadius: 14,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 2,
    borderColor: COLORS.primary,
    backgroundColor: "#FFFFFF",
    marginBottom: 40,
  },
  buttonText: {
    fontSize: 16,
    fontWeight: "800",
  },
  disclaimer: {
    marginTop: 12,
    fontSize: 12,
    color: COLORS.subtext,
    textAlign: "center",
    maxWidth: 320,
    alignSelf: "center",
  },
});
