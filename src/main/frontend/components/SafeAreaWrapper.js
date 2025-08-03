import React from "react";
import { View, StyleSheet } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function SafeAreaWrapper({
  children,
  backgroundTop = "#EFE5FF", // 기본 상단 배경색
  backgroundBottom = "#FFFFFF", // 기본 하단 배경색
  style,
  disableBottomPadding = false,
}) {
  const insets = useSafeAreaInsets();

  return (
    <View style={[styles.container, style]}>
      {/* Safe Area 위쪽 배경 */}
      <View
        style={[
          styles.topInset,
          {
            height: insets.top,
            backgroundColor: backgroundTop,
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          },
        ]}
      />

      {/* Safe Area 아래쪽 배경 */}
      <View
        style={[
          styles.bottomInset,
          {
            height: insets.bottom,
            backgroundColor: backgroundBottom,
            position: "absolute",
            bottom: 0,
            left: 0,
            right: 0,
            zIndex: 10,
          },
        ]}
      />

      {/* 본문 영역 */}
      <View
        style={{
          flex: 1,
          paddingTop: insets.top,
          paddingBottom: disableBottomPadding ? 0 : insets.bottom,
        }}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  topInset: {},
  bottomInset: {},
});
