import React, { useState, useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Platform,
  KeyboardAvoidingView,
  FlatList,
  TextInput,
  Modal,
} from "react-native";
import { useRouter, useLocalSearchParams } from "expo-router";
import { Feather } from "@expo/vector-icons";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import BottomNavigation from "../components/BottomNavigation";

export default function QuizScreen() {
  const router = useRouter();
  const { newQuizName, subjective, objective, ox } = useLocalSearchParams();

  const [quizList, setQuizList] = useState([]);
  const [activeTab, setActiveTab] = useState("퀴즈");
  const [editId, setEditId] = useState(null);
  const [editedName, setEditedName] = useState("");
  const [modalVisibleId, setModalVisibleId] = useState(null);
  const inputRef = useRef(null);

  const [isEditing, setIsEditing] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [moveModalVisible, setMoveModalVisible] = useState(false);

  useEffect(() => {
    if (newQuizName) {
      setQuizList((prev) => {
        if (prev.some((q) => q.name === newQuizName)) return prev;
        return [
          {
            id: Date.now().toString(),
            name: newQuizName,
            subjective: subjective === "true",
            objective: objective === "true",
            ox: ox === "true",
          },
          ...prev,
        ];
      });
    }
  }, [newQuizName, subjective, objective, ox]);

  useEffect(() => {
    if (editId && inputRef.current) {
      inputRef.current.focus();
    }
  }, [editId]);

  const handleDelete = (id) => {
    setQuizList((prev) => prev.filter((item) => item.id !== id));
    setModalVisibleId(null);
  };

  const handleEdit = (id, name) => {
    setEditId(id);
    setEditedName(name);
    setModalVisibleId(null);
  };

  const handleSaveEdit = (id) => {
    setQuizList((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const trimmed = editedName.trim();
          return {
            ...item,
            name: trimmed.length > 0 ? trimmed : item.name,
          };
        }
        return item;
      })
    );
    setEditId(null);
  };

  const toggleSelect = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const cancelEditing = () => {
    setIsEditing(false);
    setSelectedIds([]);
  };

  const handleBulkDelete = () => {
    setQuizList((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id))
    );
    cancelEditing();
  };

  const handleMoveToFolder = (folderName) => {
    router.push({
      pathname: "/quiz_folder",
      params: {
        folder: folderName,
        items: JSON.stringify(
          quizList.filter((item) => selectedIds.includes(item.id))
        ),
      },
    });
    setQuizList((prev) =>
      prev.filter((item) => !selectedIds.includes(item.id))
    );
    cancelEditing();
  };

  const handleAddFolder = () => {
    const newId = Date.now().toString();
    const newFolder = {
      id: newId,
      name: "새 폴더",
      subjective: false,
      objective: false,
      ox: false,
    };
    setQuizList((prev) => [newFolder, ...prev]);
    setEditId(newId);
    setEditedName("새 폴더");
  };

  const renderQuizItem = ({ item: quiz }) => {
    const isSelected = selectedIds.includes(quiz.id);
    return (
      <TouchableOpacity
        key={quiz.id}
        style={[
          styles.quizItem,
          isSelected && { backgroundColor: "#D3C1E5" },
          { flex: 1 },
        ]}
        onPress={() => isEditing && toggleSelect(quiz.id)}
        activeOpacity={isEditing ? 0.7 : 1}
      >
        <View style={styles.quizItemIconWrapper}>
          <Feather name="help-circle" size={24} color="#B9A4DA" />
        </View>
        <View style={styles.contentArea}>
          {editId === quiz.id ? (
            <TextInput
              ref={inputRef}
              style={styles.quizName}
              value={editedName}
              onChangeText={setEditedName}
              onBlur={() => handleSaveEdit(quiz.id)}
              onSubmitEditing={() => handleSaveEdit(quiz.id)}
            />
          ) : (
            <Text style={styles.quizName}>{quiz.name}</Text>
          )}
          <View style={styles.tagContainer}>
            {quiz.subjective && (
              <View style={styles.tagBox}>
                <Text style={styles.tagText}>주관식</Text>
              </View>
            )}
            {quiz.objective && (
              <View style={styles.tagBox}>
                <Text style={styles.tagText}>객관식</Text>
              </View>
            )}
            {quiz.ox && (
              <View style={styles.tagBox}>
                <Text style={styles.tagText}>OX</Text>
              </View>
            )}
          </View>
        </View>
        {!isEditing && (
          <TouchableOpacity onPress={() => setModalVisibleId(quiz.id)}>
            <Feather name="more-horizontal" size={20} color="#A9A9A9" />
          </TouchableOpacity>
        )}

        <Modal
          transparent
          visible={modalVisibleId === quiz.id}
          animationType="fade"
          onRequestClose={() => setModalVisibleId(null)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            onPress={() => setModalVisibleId(null)}
            activeOpacity={1}
          >
            <View style={styles.modalMenu}>
              <TouchableOpacity onPress={() => handleEdit(quiz.id, quiz.name)}>
                <Text style={styles.modalItem}>이름 변경</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => handleDelete(quiz.id)}>
                <Text style={styles.modalItem}>삭제</Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </TouchableOpacity>
    );
  };

  const CreateQuizButton = () => (
    <View style={styles.createButtonWrapper}>
      <TouchableOpacity
        style={styles.createButton}
        activeOpacity={0.7}
        onPress={() => router.push("/createquiz_selectnote")}
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
    </View>
  );

  const tabs = [
    { name: "홈", label: "홈" },
    { name: "노트", label: "노트" },
    { name: "퀴즈", label: "퀴즈" },
    { name: "마이페이지", label: "마이페이지" },
  ];

  return (
    <SafeAreaWrapper backgroundTop="#ffffffff" backgroundBottom="#ffffffff">
      <KeyboardAvoidingView
        behavior={Platform.OS === "ios" ? "padding" : "height"}
        style={[
          styles.container,
          {
            paddingHorizontal: 20,
          },
        ]}
      >
        <View
          style={{
            flexDirection: "row",
            justifyContent: "space-between",
            alignItems: "center",
          }}
        >
          <Text style={styles.title}>퀴즈</Text>
          {!isEditing ? (
            <TouchableOpacity onPress={() => setIsEditing(true)}>
              <Text style={{ fontSize: 16, color: "#7D6DAF" }}>편집</Text>
            </TouchableOpacity>
          ) : (
            <View style={{ flexDirection: "row", gap: 12 }}>
              <TouchableOpacity onPress={() => setMoveModalVisible(true)}>
                <Text style={{ fontSize: 16, color: "#7D6DAF" }}>이동</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleBulkDelete}>
                <Text style={{ fontSize: 16, color: "#7D6DAF" }}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={cancelEditing}>
                <Text style={{ fontSize: 16, color: "#7D6DAF" }}>취소</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>

        {quizList.length === 0 ? (
          <ScrollView
            contentContainerStyle={styles.scrollContentEmpty}
            style={{ flex: 1 }}
          >
            <Image
              source={require("../assets/images/emptynote.png")}
              style={styles.emptyImage}
              resizeMode="contain"
            />
            <Text style={styles.emptyMessage}>
              아직 생성된 문제가 없어요!{"\n"}학습한 내용을 점검해보세요!
            </Text>
            <CreateQuizButton />
          </ScrollView>
        ) : (
          <FlatList
            data={quizList}
            keyExtractor={(item) => item.id}
            renderItem={renderQuizItem}
            contentContainerStyle={{ paddingBottom: 20 }}
            ListFooterComponent={<CreateQuizButton />}
          />
        )}

        <View style={styles.floatingButtons}>
          <TouchableOpacity
            style={styles.circleButton}
            onPress={handleAddFolder}
          >
            <Feather name="folder-plus" size={24} color="#B9A4DA" />
          </TouchableOpacity>
        </View>

        <BottomNavigation />

        <Modal
          visible={moveModalVisible}
          transparent
          animationType="fade"
          onRequestClose={() => setMoveModalVisible(false)}
        >
          <TouchableOpacity
            style={styles.modalOverlay}
            activeOpacity={1}
            onPressOut={() => setMoveModalVisible(false)}
          >
            <View style={styles.modalMenu}>
              {["폴더1", "폴더2", "폴더3"].map((folder) => (
                <TouchableOpacity
                  key={folder}
                  onPress={() => handleMoveToFolder(folder)}
                >
                  <Text style={styles.modalItem}>{folder}로 이동</Text>
                </TouchableOpacity>
              ))}
            </View>
          </TouchableOpacity>
        </Modal>
      </KeyboardAvoidingView>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#FFFFFF" },
  title: {
    fontFamily: "Abhaya Libre ExtraBold",
    fontSize: 32,
    fontWeight: "800",
    color: "#3C3C3C",
    marginLeft: 3,
    marginBottom: 20,
    paddingTop: 20,
  },
  scrollContentEmpty: {
    flexGrow: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingBottom: 20,
  },
  emptyImage: { width: 180, height: 200, marginBottom: 20 },
  emptyMessage: {
    fontFamily: "Abel",
    fontSize: 24,
    textAlign: "center",
    color: "#3C3C3C",
    marginTop: 10,
  },
  createButtonWrapper: {
    marginTop: 20,
    marginBottom: 10,
    width: "100%",
    paddingHorizontal: 0,
  },
  createButton: {
    width: "100%",
    height: 85,
    borderRadius: 12,
    backgroundColor: "#ECE4F7",
    justifyContent: "center",
    paddingLeft: 20,
    paddingRight: 20,
    flexDirection: "row",
    alignItems: "center",
  },
  createButtonBackground: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "#ECE4F7",
    borderRadius: 12,
  },
  createButtonIcon: { marginRight: 20 },
  createButtonTextWrapper: { flex: 1 },
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
    //paddingBottom: 30,
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
  quizItem: {
    width: "100%",
    height: 65,
    backgroundColor: "#F4EDFD",
    borderWidth: 0.6,
    borderColor: "#ECE4F7",
    borderRadius: 10,
    marginBottom: 10,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 15,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 1.0,
    elevation: 2,
  },
  quizItemIconWrapper: {
    width: 38,
    height: 38,
    borderRadius: 8,
    backgroundColor: "#E4D9F4",
    borderWidth: 0.6,
    borderColor: "#B9A4DA",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 15,
  },
  contentArea: {
    flex: 1,
    justifyContent: "center",
  },
  quizName: {
    fontWeight: "700",
    fontSize: 20,
    color: "#3C3C3C",
    marginBottom: 6,
  },
  tagContainer: {
    flexDirection: "row",
    alignItems: "center",
  },
  tagBox: {
    backgroundColor: "#FAF8FD",
    borderWidth: 0.6,
    borderColor: "#ECE4F7",
    borderRadius: 5,
    paddingHorizontal: 8,
    paddingVertical: 3,
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  tagText: {
    fontWeight: "400",
    fontSize: 10,
    lineHeight: 12,
    color: "#3C3C3C",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.2)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalMenu: {
    backgroundColor: "white",
    borderRadius: 10,
    padding: 15,
    elevation: 5,
    width: 150,
  },
  modalItem: {
    paddingVertical: 10,
    fontSize: 16,
    color: "#3C3C3C",
  },
});