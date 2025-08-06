import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  Modal,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

export default function CreateQuizSelectType() {
  const router = useRouter();
  const { selectedNotesParam, inputTextParam } = useLocalSearchParams();

  const [selectedNotes, setSelectedNotes] = useState([]);
  const [inputText, setInputText] = useState("");
  const [problemName, setProblemName] = useState("");
  const [questionCount, setQuestionCount] = useState("");
  const [selectedTypes, setSelectedTypes] = useState([]);
  const [showModal, setShowModal] = useState(false);

  const questionTypeOptions = [
    { id: 1, name: "주관식" },
    { id: 2, name: "객관식" },
    { id: 3, name: "O/X 문제" },
  ];

  useEffect(() => {
    if (selectedNotesParam) {
      setSelectedNotes(selectedNotesParam.split(","));
    }
    if (inputTextParam) {
      setInputText(inputTextParam);
    }
  }, [selectedNotesParam, inputTextParam]);

  const toggleType = (id) => {
    setSelectedTypes((prev) =>
      prev.includes(id) ? prev.filter((t) => t !== id) : [...prev, id]
    );
  };

  const handleRemoveNote = (noteId) => {
    setSelectedNotes((prev) => prev.filter((id) => id !== noteId));
  };

  const handleRemoveText = () => setInputText("");

  const onSubmit = () => {
    if (selectedNotes.length === 0 && inputText.trim() === "") {
      setShowModal(true);
      return;
    }
    const finalProblemName = problemName.trim() === "" ? "새로운 문제지" : problemName;
    const finalQuestionCount = parseInt(questionCount) > 0 ? parseInt(questionCount) : 5;

    router.push({
      pathname: "/createdquiz",
      params: {
        problemName: finalProblemName,
        questionCount: finalQuestionCount.toString(),
        selectedTypes: JSON.stringify(selectedTypes),
        inputText: inputText.trim(),
      },
    });
  };

  const closeModalAndGoBack = () => {
    setShowModal(false);
    router.push("/createquiz_selectnote");
  };

  return (
    <>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <Ionicons name="arrow-back" size={24} color="black" />
          </TouchableOpacity>
          <Text style={styles.headerText}>문제 유형을 선택해주세요.</Text>
        </View>

        <Text style={styles.subHeader}>선택된 노트</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginTop: 10 }}>
          {selectedNotes.map((note, idx) => (
            <View key={idx} style={styles.selectedNoteBox}>
              <Text style={styles.selectedNoteText}>{note}</Text>
              <TouchableOpacity onPress={() => handleRemoveNote(note)}>
                <Ionicons name="close-circle" size={18} color="#fff" style={{ marginLeft: 5 }} />
              </TouchableOpacity>
            </View>
          ))}
        </ScrollView>

        {inputText !== "" && (
          <View style={styles.inputTextBox}>
            <View style={styles.inputTextHeader}>
              <Text style={styles.inputTextLabel}>직접 입력한 내용</Text>
              <TouchableOpacity onPress={handleRemoveText}>
                <Ionicons name="close-circle" size={18} color="#fff" />
              </TouchableOpacity>
            </View>
            <TextInput
              style={styles.inputTextArea}
              multiline
              value={inputText}
              onChangeText={setInputText}
            />
          </View>
        )}

        <Text style={styles.subHeader}>문제지 이름 설정</Text>
        <TextInput
          style={styles.input}
          value={problemName}
          onChangeText={setProblemName}
          placeholder="문제지 이름을 입력해주세요"
          maxLength={20}
        />
        <Text style={styles.charCount}>{problemName.length} / 20</Text>

        <Text style={styles.subHeader}>문제 유형 선택</Text>
        <View style={styles.typesWrap}>
          {questionTypeOptions.map((type) => (
            <TouchableOpacity
              key={type.id}
              style={[styles.typeBtn, selectedTypes.includes(type.id) && styles.typeBtnSelected]}
              onPress={() => toggleType(type.id)}
            >
              <Text
                style={[styles.typeText, selectedTypes.includes(type.id) && styles.typeTextSelected]}
              >
                {type.name}
              </Text>
            </TouchableOpacity>
          ))}
        </View>

        <Text style={styles.subHeader}>문제 수 선택</Text>
        <TextInput
          style={styles.input}
          value={questionCount}
          onChangeText={setQuestionCount}
          placeholder="생성할 문제 수를 입력해주세요"
          keyboardType="numeric"
        />

        <TouchableOpacity style={styles.submitButton} onPress={onSubmit}>
          <Text style={styles.submitButtonText}>완료</Text>
        </TouchableOpacity>
      </ScrollView>

      <Modal
        transparent
        animationType="fade"
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <TouchableOpacity style={styles.modalCloseBtn} onPress={closeModalAndGoBack}>
              <Ionicons name="close" size={24} color="#000" />
            </TouchableOpacity>
            <Text style={styles.modalText}>노트를 선택하거나{"\n"}내용을 입력해주세요!</Text>
          </View>
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: "#fff",
    paddingBottom: 80,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  headerText: {
    fontSize: 18,
    fontWeight: "600",
    marginLeft: 10,
  },
  subHeader: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
    marginTop: 30,
  },
  selectedNoteBox: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#BA94CC",
    borderRadius: 15,
    paddingHorizontal: 15,
    paddingVertical: 6,
    marginRight: 8,
  },
  selectedNoteText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },
  inputTextBox: {
    backgroundColor: "#f4edfd",
    borderRadius: 10,
    padding: 15,
    marginTop: 20,
  },
  inputTextHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 10,
  },
  inputTextLabel: {
    fontSize: 16,
    fontWeight: "700",
    color: "#222",
  },
  inputTextArea: {
    backgroundColor: "#fff",
    borderRadius: 6,
    padding: 10,
    minHeight: 100,
    textAlignVertical: "top",
  },
  input: {
    marginTop: 10,
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 5,
    paddingHorizontal: 15,
    height: 42,
  },
  charCount: {
    alignSelf: "flex-end",
    marginTop: 4,
    fontSize: 12,
    color: "#999",
  },
  typesWrap: {
    flexDirection: "row",
    flexWrap: "wrap",
    marginTop: 10,
    gap: 10,
  },
  typeBtn: {
    width: 108,
    height: 33,
    borderRadius: 5,
    borderWidth: 1,
    borderColor: "#BA94CC",
    justifyContent: "center",
    alignItems: "center",
  },
  typeBtnSelected: {
    backgroundColor: "#BA94CC",
  },
  typeText: {
    color: "#BA94CC",
    fontWeight: "500",
  },
  typeTextSelected: {
    color: "#fff",
  },
  submitButton: {
    marginTop: 40,
    height: 50,
    backgroundColor: "#000",
    borderRadius: 10,
    justifyContent: "center",
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "600",
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: 280,
    backgroundColor: "#fff",
    borderRadius: 10,
    padding: 20,
    alignItems: "center",
  },
  modalCloseBtn: {
    position: "absolute",
    top: 10,
    right: 10,
  },
  modalText: {
    fontSize: 16,
    fontWeight: "600",
    color: "#000",
    textAlign: "center",
  },
});