import React, { useState } from "react";
import {
  SafeAreaView,
  View,
  Text,
  FlatList,
  Image,
  Pressable,
  StyleSheet,
  StatusBar,
  ScrollView,
  TouchableOpacity,
} from "react-native";
import { useRouter } from "expo-router";
import SafeAreaWrapper from "../components/SafeAreaWrapper";

const router = useRouter();

const DATA = [
  {
    id: "1",
    source: require("../assets/images/index_water.png"),
    title: "물의 수룡",
    description:
      "물의 수룡이는 바다 깊은 곳에서 조용히 살았습니다. 누구보다 물길을 잘 타고 파도와 장난치는 걸 좋아했지만, 세상 밖은 두려웠죠. 그러나 마음속 깊은 호기심이 그를 파도 위로 이끌었습니다. 처음 맞이한 햇살과 바람, 부서지는 물방울 속에서 물의 수룡이는 깨달았습니다. 바다는 넓지만, 세상은 그보다 훨씬 더 넓고 아름답다는 것을요.",
  },
  {
    id: "2",
    source: require("../assets/images/index_thunder.png"),
    title: "전기의 수룡",
    description:
      "전기의 수룡이는 구름과 번개의 아이였습니다. 먹구름이 몰려올 때마다 그는 하늘로 뛰어올라 번개를 품고 놀았죠. 번쩍이는 빛 속에서 새로운 아이디어와 용기가 피어났습니다. 세상을 바꾸는 순간은 언제나 번개처럼 빠르고 강렬하다는 걸, 전기의 수룡이는 누구보다 잘 압니다. 오늘도 그는 번쩍이며 앞으로 나아갑니다.",
  },
  {
    id: "3",
    source: require("../assets/images/index_grass.png"),
    title: "풀의 수룡",
    description:
      "풀의 수룡이는 푸른 들판 속에서 하루하루를 성실히 보냈습니다. 새벽 햇살과 함께 눈을 뜨고, 바람 따라 흔들리는 풀잎을 가꾸는 것이 일상이었죠. 작은 뿌리가 모여 숲이 되듯, 꾸준함이 세상을 바꾼다는 걸 풀의 수룡이는 알고 있습니다. 오늘도 그는 한 걸음씩, 초록빛 길을 만들어갑니다.",
  },
];

const Header = () => (
  <View style={styles.headerBox}>
    <Text style={styles.headerText}>
      인연이 느껴지는 수룡이를 입양해주세요!
    </Text>
  </View>
);

export default function SuryongiAdoption() {
  const [selected, setSelected] = useState(null);

  const Header = () => (
    <View style={styles.headerBox}>
      <Text style={styles.headerText}>
        인연이 느껴지는 수룡이를 입양해주세요!
      </Text>
    </View>
  );

  const Grid = () => (
    <View style={styles.gridContainer}>
      <FlatList
        data={DATA}
        keyExtractor={(item) => item.id}
        numColumns={3}
        columnWrapperStyle={styles.row}
        ListHeaderComponent={<Header />}
        contentContainerStyle={{ paddingBottom: 24 }}
        renderItem={({ item }) => (
          <Pressable
            onPress={() => setSelected(item)}
            style={({ pressed }) => [
              styles.card,
              pressed && { opacity: 0.8, transform: [{ scale: 0.98 }] },
            ]}
          >
            <Image
              source={item.source}
              style={styles.thumb}
              resizeMode="cover"
            />
          </Pressable>
        )}
      />

      {/* 오버레이 (선택했을 때 표시) */}
      {selected && (
        <View style={styles.overlay}>
          {/* 배경 클릭 시 닫기 */}
          <Pressable
            style={StyleSheet.absoluteFill}
            onPress={() => setSelected(null)}
          />

          <View style={styles.overlayContent}>
            <Image
              source={selected.source}
              style={styles.hero}
              resizeMode="cover"
            />
            <Text style={styles.title}>{selected.title}</Text>
            <Text style={styles.desc}>{selected.description}</Text>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={() => {
                setSelected(null);
                router.push("/main");
              }}
            >
              <Text style={styles.confirmText}>입양하기</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}
    </View>
  );

  return (
    <SafeAreaWrapper
      backgroundTop={selected ? "rgba(0,0,0,0.58)" : "#ffffffff"}
      backgroundBottom={selected ? "rgba(0,0,0,0.58)" : "#ffffffff"}
    >
      <StatusBar barStyle="dark-content" />
      <Grid />
    </SafeAreaWrapper>
  );
}

const CARD_GAP = 12;

const styles = StyleSheet.create({
  safe: {
    flex: 1,
    backgroundColor: "#ffffffff",
  },
  backButton: {
    position: "absolute",
    top: 24,
    left: 16,
  },
  headerBox: {
    backgroundColor: "#FFFFFF",
    paddingHorizontal: 16,
    paddingVertical: 14,
    marginHorizontal: 16,
    marginTop: 200,
    marginBottom: 8,
    borderRadius: 16,
    shadowColor: "#000",
    shadowOpacity: 0.06,
    shadowOffset: { width: 0, height: 4 },
    shadowRadius: 8,
    elevation: 3,
  },
  headerText: {
    fontSize: 16,
    fontWeight: "700",
    textAlign: "center",
  },
  gridContainer: {
    flex: 1,
    //paddingHorizontal: 24,
    justifyContent: "center",
    backgroundColor: "#ffffffff",
  },
  row: {
    gap: CARD_GAP,
    paddingHorizontal: 16,
    marginTop: 40,
  },
  card: {
    flex: 1,
    aspectRatio: 3 / 4,
    borderRadius: 14,
    overflow: "hidden",
    backgroundColor: "#FFF",
    elevation: 2,
    shadowColor: "#000",
    shadowOpacity: 0.05,
    shadowOffset: { width: 0, height: 3 },
    shadowRadius: 6,
  },
  name: {
    marginTop: 6,
    fontSize: 14,
    fontWeight: "700",
    color: "#222",
  },
  thumb: {
    width: "100%",
    height: "100%",
  },
  detailWrap: {
    padding: 16,
  },
  backBtn: {
    alignSelf: "flex-start",
    paddingHorizontal: 10,
    paddingVertical: 6,
    backgroundColor: "#ECECF1",
    borderRadius: 10,
    marginBottom: 10,
  },
  backBtnText: {
    fontSize: 14,
    fontWeight: "600",
  },
  hero: {
    width: "100%",
    height: undefined,
    aspectRatio: 3 / 4,
    borderRadius: 18,
    backgroundColor: "#FFF",
    maxWidth: 300,
    maxHeight: 500,
    alignSelf: "center",
    //marginTop: 50,
  },
  overlay: {
    position: "absolute",
    top: 0,
    left: 0,
    width: "100%",
    height: "100%",
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
  },
  title: {
    fontSize: 18,
    fontWeight: "800",
    marginVertical: 10,
  },
  desc: {
    fontSize: 15,
    lineHeight: 21,
    color: "#333",
    marginVertical: 10,
  },
  bottomButtons: {
    paddingBottom: 32,
  },
  confirmButton: {
    backgroundColor: "#B491DD",
    paddingVertical: 14,
    marginHorizontal: 24,
    borderRadius: 8,
    alignItems: "center",
    marginTop: 10,
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
    paddingHorizontal: 80,
  },
});
