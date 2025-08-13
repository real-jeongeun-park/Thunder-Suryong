import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  TouchableOpacity,
  Dimensions,
  Platform,
} from "react-native";
import { useRouter } from "expo-router";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../src/constants";

const { width: screenWidth } = Dimensions.get("window");
const { height: screenHeight } = Dimensions.get("window");

export default function SuryongAdoption() {
  const router = useRouter();
  const [selected, setSelected] = useState(null);
  const [userInfo, setUserInfo] = useState(null);

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
        router.push("/");
      }
    }
    checkLogin();
  }, []);

  const handleSelect = async (name) => {
    if (!name?.trim()) return;
    try {
      await axios.post(`${API_BASE_URL}/api/member/selectSuryong`, {
        nickname: userInfo.nickname,
        suryongName: name,
      });
      router.push("/main");
    } catch (e) {
      console.log("failed to save suryong", e);
      setSelected(null);
    }
  };

  const description = [
    {
      name: "water",
      source: require("../assets/images/index_water.png"),
      title: "물의 수룡",
      description:
        "물의 수룡이는 바다 깊은 곳에서 조용히 살았습니다. 누구보다 물길을 잘 타고 파도와 장난치는 걸 좋아했지만, 세상 밖은 두려웠죠. 그러나 마음속 깊은 호기심이 그를 파도 위로 이끌었습니다. 처음 맞이한 햇살과 바람, 부서지는 물방울 속에서 물의 수룡이는 깨달았습니다. 바다는 넓지만, 세상은 그보다 훨씬 더 넓고 아름답다는 것을요.",
    },
    {
      name: "thunder",
      source: require("../assets/images/index_thunder.png"),
      title: "전기의 수룡",
      description:
        "전기의 수룡이는 구름과 번개의 아이였습니다. 먹구름이 몰려올 때마다 그는 하늘로 뛰어올라 번개를 품고 놀았죠. 번쩍이는 빛 속에서 새로운 아이디어와 용기가 피어났습니다. 세상을 바꾸는 순간은 언제나 번개처럼 빠르고 강렬하다는 걸, 전기의 수룡이는 누구보다 잘 압니다. 오늘도 그는 번쩍이며 앞으로 나아갑니다.",
    },
    {
      name: "grass",
      source: require("../assets/images/index_grass.png"),
      title: "풀의 수룡",
      description:
        "풀의 수룡이는 푸른 들판 속에서 하루하루를 성실히 보냈습니다. 새벽 햇살과 함께 눈을 뜨고, 바람 따라 흔들리는 풀잎을 가꾸는 것이 일상이었죠. 작은 뿌리가 모여 숲이 되듯, 꾸준함이 세상을 바꾼다는 걸 풀의 수룡이는 알고 있습니다. 오늘도 그는 한 걸음씩, 초록빛 길을 만들어갑니다.",
    },
  ];

  const renderCard = ({ item }) => (
    <Pressable
      onPress={() => setSelected(item)}
      style={({ pressed }) => [
        styles.card,
        pressed && { opacity: 0.85, transform: [{ scale: 0.97 }] },
      ]}
    >
      <Image
        source={item.source}
        style={styles.cardImage}
        resizeMode="cover"
      />
      <Text style={styles.cardTitle}>{item.title}</Text>
    </Pressable>
  );

  return (
    <SafeAreaWrapper
      backgroundTop={selected ? "rgba(0,0,0,0.58)" : "#fff"}
      backgroundBottom={selected ? "rgba(0,0,0,0.58)" : "#fff"}
    >
      <StatusBar barStyle="dark-content" />
      <View style={styles.container}>
        <FlatList
          data={description}
          keyExtractor={(item) => item.name}
          ListHeaderComponent={
            <View style={styles.headerWrapper}>
              <Text style={styles.headerTitle}>
                인연이 느껴지는 수룡이를 입양해 주세요!
              </Text>
              <Text style={styles.subtitle}>
                언제든지 다른 수룡이로 바꿀 수 있어요.
              </Text>
            </View>
          }
          contentContainerStyle={styles.listContent}
          renderItem={renderCard}
        />

        {selected && (
          <View style={styles.overlay}>
            <Pressable
              style={StyleSheet.absoluteFill}
              onPress={() => setSelected(null)}
            />
            <View style={styles.overlayContent}>
              <Image
                source={selected.source}
                style={styles.characterImage}
                resizeMode="cover"
              />
              <Text style={styles.title}>{selected.title}</Text>
              <Text style={styles.desc}>{selected.description}</Text>
              <View
                style={{
                  flexDirection: "row",
                  width: "100%",
                }}
              >
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => handleSelect(selected.name)}
                  >
                    <Text style={styles.confirmText}>입양하기</Text>
                  </TouchableOpacity>
                  <TouchableOpacity
                    style={styles.confirmButton}
                    onPress={() => setSelected(false)}
                  >
                    <Text style={styles.confirmText}>취소</Text>
                  </TouchableOpacity>
              </View>
            </View>
          </View>
        )}
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingTop: 25,
  },
  headerWrapper: {
    width: "100%",
    alignItems: "flex-start", // 왼쪽 정렬
    paddingRight: 16, // 좌측 여백(선택 사항)
  },
  headerTitle: {
    fontSize: 19,
    fontWeight: "bold",
    color: "#333",
    marginBottom: 5,
    textAlign: "left",
  },
  subtitle: {
    color: "#BFC0C1",
    fontSize: 16,
    marginBottom: 30,
    textAlign: "left",
  },
  listContent: {
    paddingBottom: 16,
    alignItems: "center",
  },
  card: {
    width: screenWidth * 0.65,
    borderRadius: 16,
    overflow: "hidden",
    backgroundColor: "#FFF",
    // Android 그림자
    padding: 10,
    marginBottom: 24,
    alignItems: "center",
    borderWidth: 1,        // 두께
    borderColor: "#ddd",  // 색상
  },
  cardImage: {
    width: "100%",
    height: screenWidth * 0.8,
    borderRadius: 10,
  },
  cardTitle: {
    fontSize: 16,
    fontWeight: "700",
    color: "#444",
    paddingVertical: 10,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    bottom: 0,
    right: 0,
    backgroundColor: "rgba(0,0,0,0.6)",
    justifyContent: "center",
    alignItems: "center",
    padding: 16,
    zIndex: 10,
  },
  overlayContent: {
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 16,
    alignItems: "center",
    maxWidth: 320,
    maxHeight: "90%"
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginTop: 20,
    marginBottom: 5,
    textAlign: "center",
  },
  desc: {
    fontSize: 15,
    lineHeight: 21,
    color: "#333",
    marginVertical: 10,
    textAlign: "center",
    paddingHorizontal: 5,
  },
  confirmButton: {
    backgroundColor: "#B491DD",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
    marginHorizontal: 5,
    flex: 1,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  characterImage: {
    width: "100%",
    height: screenWidth * 0.75,
    borderRadius: 10,
    aspectRatio: 1,
  }
});
