// NoteScreen.js
import { Feather } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Image,
  KeyboardAvoidingView,
  Modal,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

export default function NoteScreen() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState("노트");
  const [isCreatingFolder, setIsCreatingFolder] = useState(false);
  const [folderName, setFolderName] = useState("");
  const [folders, setFolders] = useState([]);

  const [isFolderSelectVisible, setIsFolderSelectVisible] = useState(false);

  const tabs = [
    { name: "홈", label: "홈" },
    { name: "노트", label: "노트" },
    { name: "퀴즈", label: "퀴즈" },
    { name: "마이페이지", label: "마이페이지" },
  ];

  const handleCreateFolder = () => {
    if (folderName.trim()) {
      const newFolder = { name: folderName.trim(), notes: [] };
      setFolders([...folders, newFolder]);
      setFolderName("");
      setIsCreatingFolder(false);
    }
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === "ios" ? "padding" : "height"}
      style={styles.container}
    >
      <Text style={styles.title}>학습 노트</Text>

      {folders.length === 0 && !isCreatingFolder ? (
        <>
          <Image
            source={require("../assets/images/emptynote.png")}
            style={styles.emptyImage}
            resizeMode="contain"
          />
          <Text style={styles.emptyMessage}>
            아직 생성된 노트가 없어요!{"\n"}학습한 내용을 기록해보세요!
          </Text>
        </>
      ) : (
        <ScrollView style={{ marginHorizontal: 20, marginBottom: 10 }}>
          {folders.map((folder, index) => (
            <TouchableOpacity
              key={index}
              style={styles.folderItem}
              onPress={() =>
                router.push({
                  pathname: "/notefolder",
                  params: { folderName: folder.name },
                })
              }
            >
              <Feather name="folder" size={20} color="#A18CD1" />
              <Text style={styles.folderText}>{folder.name}</Text>
            </TouchableOpacity>
          ))}

          {isCreatingFolder && (
            <View style={styles.inputWrapper}>
              <Feather name="folder" size={20} color="#B697F4" />
              <TextInput
                style={styles.input}
                placeholder="폴더 이름을 입력하세요"
                value={folderName}
                onChangeText={setFolderName}
                autoFocus
                onSubmitEditing={handleCreateFolder}
                returnKeyType="done"
              />
            </View>
          )}
        </ScrollView>
      )}

      <View style={styles.floatingButtons}>
        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => setIsCreatingFolder(true)}
        >
          <Feather name="folder-plus" size={24} color="#B9A4DA" />
        </TouchableOpacity>

        <TouchableOpacity
          style={styles.circleButton}
          onPress={() => {
            if (folders.length > 0) setIsFolderSelectVisible(true);
            else alert("먼저 폴더를 생성해주세요!");
          }}
        >
          <Feather name="file-plus" size={24} color="#B9A4DA" />
        </TouchableOpacity>
      </View>

      <Modal visible={isFolderSelectVisible} transparent animationType="fade">
        <TouchableWithoutFeedback onPress={() => setIsFolderSelectVisible(false)}>
          <View style={styles.modalOverlay}>
            <TouchableWithoutFeedback>
              {/* 수정: styles.folderSelectModal → styles.modalContent로 변경해서 하얀 모달 박스 스타일 적용 */}
              <View style={styles.modalContent}>
                <Text style={{ fontSize: 18, fontWeight: "bold", marginBottom: 15 }}>
                  노트를 추가할 폴더를 선택하세요
                </Text>
                {folders.map((folder, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={styles.modalFolderItem}
                    onPress={() => {
                      setIsFolderSelectVisible(false);
                      router.push({
                        pathname: "/notefolder",
                        params: {
                          folderName: folder.name,
                          openAddNote: "true",
                        },
                      });
                    }}
                  >
                    <Feather name="folder" size={20} color="#A18CD1" />
                    <Text style={{ marginLeft: 10, fontSize: 16 }}>{folder.name}</Text>
                  </TouchableOpacity>
                ))}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>

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
  emptyMessage: {
    fontFamily: "Abel",
    fontSize: 24,
    textAlign: "center",
    color: "#3C3C3C",
    marginTop: 10,
  },
  inputWrapper: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    backgroundColor: "#FAF7FF",
    borderRadius: 10,
    borderWidth: 1,
    borderColor: "#EEE6FA",
    marginBottom: 10,
  },
  input: {
    flex: 1,
    marginLeft: 10,
    fontSize: 16,
  },
  floatingButtons: {
    position: "absolute",
    bottom: 110,
    right: 20,
    flexDirection: "row",
    gap: 10,
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
  emptyImage: {
    width: 180,
    height: 200,
    alignSelf: "center",
    marginTop: 150,
  },
  folderItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: "#EEE6FA",
    borderRadius: 10,
    backgroundColor: "#FAF7FF",
  },
  folderText: {
    fontSize: 16,
    marginLeft: 10,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.8)",
    justifyContent: "center",
    alignItems: "center",
    padding: 20,
  },
  // 수정: 모달 내부 하얀 박스 스타일 (원래 folderSelectModal을 modalContent로 바꿈)
  modalContent: {
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    width: "90%",
  },
  modalFolderItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 12,
    borderBottomWidth: 1,
    borderColor: "#eee",
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
