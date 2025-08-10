import React, { useState, useEffect } from "react";
import { View, Text, TouchableOpacity, StyleSheet } from "react-native";
import { useRouter, usePathname } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";

export default function BottomNavigation() {
  const router = useRouter();
  const pathname = usePathname();

  const tabs = [
    { name: "홈", label: "홈", path: "/main" },
    { name: "노트", label: "노트", path: "/note" },
    { name: "퀴즈", label: "퀴즈", path: "/quiz_list" },
    { name: "마이페이지", label: "마이페이지", path: "/mypage" },
  ];

  const [activeTab, setActiveTab] = useState("홈");

  // pathname 변경 시 activeTab 업데이트 (초기 및 라우팅 변경 대응)
  useEffect(() => {
    const currentTab = tabs.find((t) => t.path === pathname);
    if (currentTab && currentTab.name !== activeTab) {
      setActiveTab(currentTab.name);
    }
  }, [pathname]);

  const handleTabPress = (tabName, path) => {
    setActiveTab(tabName);
    router.replace(path);
  };

  return (
    <View style={[styles.bottomNav]}>
      {tabs.map((tab, index) => (
        <TouchableOpacity
          key={index}
          style={styles.navItem}
          activeOpacity={0.7}
          onPress={() => handleTabPress(tab.name, tab.path)}
        >
          <View
            style={[
              styles.dot,
              activeTab === tab.name ? styles.dotActive : styles.dotInactive,
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
  );
}

const styles = StyleSheet.create({
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    zIndex: 10,
    paddingVertical: 20,
  },
  navItem: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  dotActive: {
    backgroundColor: "#222", // 활성화된 탭의 진한 색
  },
  dotInactive: {
    backgroundColor: "#ccc", // 비활성 탭 연한 색
  },
  navText: {
    fontSize: 12,
  },
  navTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  navTextInactive: {
    color: "#ccc",
  },
});
