import React, { useState } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
  TextInput,
} from "react-native";

export default function TimerScreen() {
  const [subjects, setSubjects] = useState([
    { name: "고급기계학습", time: "00:00:00" },
    { name: "심층학습", time: "00:00:00" },
    { name: "클라우드 컴퓨팅", time: "00:00:00" },
    { name: "알고리즘", time: "00:00:00" },
    { name: "추천시스템", time: "00:00:00" },
  ]);

  const [modalVisible, setModalVisible] = useState(false);
  const [newSubjectName, setNewSubjectName] = useState("");
  const [isDeleteMode, setIsDeleteMode] = useState(false);
  const [selectedForDelete, setSelectedForDelete] = useState<string[]>([]);

  const handleAddSubject = () => {
    if (newSubjectName.trim()) {
      setSubjects([...subjects, { name: newSubjectName.trim(), time: "00:00:00" }]);
      setNewSubjectName("");
      setModalVisible(false);
    }
  };

  const handleDeleteModeToggle = () => {
    if (isDeleteMode && selectedForDelete.length > 0) {
      // 삭제 실행
      setSubjects(subjects.filter((s) => !selectedForDelete.includes(s.name)));
      setSelectedForDelete([]);
    }
    setIsDeleteMode(!isDeleteMode);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.header}>타이머</Text>

      {/* 메인 타이머 */}
      <View style={styles.timerContainer}>
        <Text style={styles.timerText}>00 : 00 : 00</Text>
      </View>

      {/* 헤더 */}
      <View style={styles.tableHeader}>
        <Text style={styles.tableHeaderText}>과목</Text>
        <Text style={styles.tableHeaderText}>시간</Text>
        <Text style={styles.tableHeaderText}>pause/quit</Text>
      </View>

      {/* 과목 리스트 */}
      <FlatList
        data={subjects}
        keyExtractor={(item) => item.name}
        renderItem={({ item }) => (
          <View style={styles.subjectRow}>
            {isDeleteMode && (
              <TouchableOpacity
                style={styles.checkbox}
                onPress={() => {
                  if (selectedForDelete.includes(item.name)) {
                    setSelectedForDelete(
                      selectedForDelete.filter((n) => n !== item.name)
                    );
                  } else {
                    setSelectedForDelete([...selectedForDelete, item.name]);
                  }
                }}
              >
                {selectedForDelete.includes(item.name) && (
                  <Text style={styles.checkboxMark}>✔️</Text>
                )}
              </TouchableOpacity>
            )}
            <View style={styles.cell}>
              <Text style={styles.subjectText}>{item.name}</Text>
            </View>
            <View style={styles.cell}>
              <Text style={styles.subjectText}>{item.time}</Text>
            </View>
            <View style={[styles.cell, styles.buttonGroup]}>
              <TouchableOpacity style={styles.circleButton}>
                <Text style={styles.buttonSymbol}>⏸</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.circleButton}>
                <Text style={styles.buttonSymbol}>■</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}
        ListFooterComponent={
          <View style={styles.footerButtonGroup}>
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setModalVisible(true)}
            >
              <Text style={styles.addButtonText}>과목 추가하기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={handleDeleteModeToggle}
            >
              <Text style={styles.addButtonText}>
                {isDeleteMode ? "선택 삭제" : "과목 삭제하기"}
              </Text>
            </TouchableOpacity>
          </View>
        }
      />

      {/* 과목 추가 모달 */}
      <Modal
        animationType="fade"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>과목을 추가해주세요.</Text>
            <TextInput
              style={styles.modalInput}
              placeholder="과목명을 입력해주세요."
              placeholderTextColor="#B491DD"
              value={newSubjectName}
              onChangeText={setNewSubjectName}
            />
            <View style={styles.modalButtonContainer}>
              <TouchableOpacity onPress={() => setModalVisible(false)}>
                <Text style={styles.modalCancel}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleAddSubject}>
                <Text style={styles.modalConfirm}>확인</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff", padding: 20 },
  header: { fontSize: 22, fontWeight: "bold", marginBottom: 12 },
  timerContainer: { alignItems: "center", marginBottom: 30 },
  timerText: {
    fontSize: 48,
    color: "#B491DD",
    fontWeight: "bold",
    letterSpacing: 4,
  },
  tableHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    backgroundColor: "#B491DD",
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 6,
  },
  tableHeaderText: {
    color: "#fff",
    fontWeight: "bold",
    flex: 1,
    textAlign: "center",
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#E5DDF8",
    paddingVertical: 10,
    paddingHorizontal: 12,
    marginTop: 6,
    borderRadius: 8,
  },
  cell: { flex: 1, justifyContent: "center" },
  subjectText: { textAlign: "center" },
  buttonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 8,
  },
  circleButton: {
    width: 26,
    height: 26,
    borderRadius: 13,
    backgroundColor: "#fff",
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: "#ccc",
  },
  buttonSymbol: { fontSize: 12 },

  // ✅ 추가/삭제 버튼
  footerButtonGroup: {
    flexDirection: "row",
    justifyContent: "center",
    gap: 10,
    marginTop: 16,
    marginBottom: 40,
  },
  addButton: {
    backgroundColor: "#C1ACED",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  deleteButton: {
    backgroundColor: "#C1ACED",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
  },
  addButtonText: {
    color: "#fff",
    fontWeight: "600",
    fontSize: 14,
  },

  // ✅ 체크박스
  checkbox: {
    width: 18,
    height: 18,
    borderRadius: 4,
    borderWidth: 1,
    borderColor: "#aaa",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 8,
  },
  checkboxMark: {
    fontSize: 12,
  },

  // ✅ 모달
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 24,
    borderRadius: 12,
    width: "80%",
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 16,
    fontWeight: "bold",
    marginBottom: 16,
  },
  modalInput: {
    width: "100%",
    borderRadius: 10,
    backgroundColor: "#F5EDFF",
    padding: 12,
    fontSize: 14,
    marginBottom: 20,
    color: "#000",
  },
  modalButtonContainer: {
  flexDirection: "row",
  justifyContent: "center", // 중앙 정렬
  gap: 12, // 또는 아래처럼 margin으로 대체 가능
},
modalCancel: {
  color: "#C0C0C0",
  fontSize: 16,
  marginRight: 100, // 버튼 간격을 좁게
  textAlign: "center",
},
modalConfirm: {
  color: "#8D5ACF",
  fontSize: 16,
  marginLeft: 6,
  textAlign: "center",
},

});
