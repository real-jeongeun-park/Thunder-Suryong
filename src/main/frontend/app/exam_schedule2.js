import { useState } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

export default function ExamInfoInput() {
  const router = useRouter();
  const [examName, setExamName] = useState("");
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [showModal, setShowModal] = useState(false);
  // 시험 날짜
  const { startDate, endDate } = useLocalSearchParams();
  const examPeriod = `${startDate}~${endDate}`;

  const handleAddSubject = () => {
    if (subject.trim() && subjects.length < 20) {
      setSubjects([...subjects, subject.trim()]);
      setSubject("");
    }
  };

  const handleRemoveSubject = (removeIdx) => {
    setSubjects(subjects.filter((_, idx) => idx !== removeIdx));
  };

  return (
    <View style={styles.container}>
      {/* 뒤로가기 버튼 */}
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={32} color="#535353" />
        </TouchableOpacity>
      </View>
      {/* 상단 날짜 및 안내 */}
      <View style={styles.headerContainer}>
        <Text style={styles.headerTitle}>시험 정보를 입력해주세요.</Text>
        <Text style={styles.periodText}>{examPeriod}</Text>
      </View>
      <View style={styles.inputContainer}>
        {/* 시험명 입력 */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>시험명</Text>
          <TextInput
            style={styles.textInput}
            placeholder="ex) 2025년 1학기 중간고사"
            maxLength={20}
            value={examName}
            onChangeText={setExamName}
          />
          <Text style={styles.counter1}>{examName.length}/20</Text>
        </View>
        {/* 과목 입력 */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>과목</Text>
          <View style={styles.subjectRow}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="과목명을 입력해주세요."
              maxLength={20}
              value={subject}
              onChangeText={setSubject}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddSubject}>
              <Text style={styles.addBtnText}>추가</Text>
            </TouchableOpacity>
          </View>
          {/*시간표 불러오기, 초기화 버튼*/}
          <View style={styles.btnRow}>
            <TouchableOpacity
              style={styles.addScheduleBtn}
              onPress={() => {
                //갤러리에서 시간표 이미지 불러오기
              }}
            >
              <Text style={styles.addScheduleBtnText}>시간표 불러오기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.addScheduleBtn}
              onPress={() => {
                if (subjects.length > 0) {
                  setShowModal(true);
                }
              }}
            >
              <Text style={styles.addScheduleBtnText}>초기화</Text>
            </TouchableOpacity>
            <Text style={styles.counter2}>{subject.length}/20</Text>
          </View>
          {/* 과목 리스트 */}
          <FlatList
            data={subjects}
            keyExtractor={(item, idx) => item + idx}
            renderItem={({ item, index }) => (
              <View style={styles.subjectItemRow}>
                <Text style={styles.subjectItemText}>{item}</Text>
                <TouchableOpacity onPress={() => handleRemoveSubject(index)}>
                  <Text style={styles.subjectItemDelete}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        </View>
      </View>
      {/* 입력 완료 버튼 */}
      <TouchableOpacity
        style={styles.submitBtn}
        onPress={() => {
          router.push({
            pathname: "/exam_schedule3",
            params: {
              examName,
              startDate,
              endDate,
              subjects: JSON.stringify(subjects),
            },
          });
        }}
      >
        <Text style={styles.submitBtnText}>입력 완료</Text>
      </TouchableOpacity>
      {/* 초기화 모달 */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={() => setShowModal(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalBox}>
            <Text style={styles.modalTitle}>초기화하시겠습니까?</Text>
            <Text style={styles.modalDesc}>과목 목록이 모두 삭제됩니다.</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#e0e0e0" }]}
                onPress={() => setShowModal(false)}
              >
                <Text style={{ color: "#535353" }}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.modalBtn, { backgroundColor: "#B491DD" }]}
                onPress={() => {
                  setSubjects([]);
                  setShowModal(false);
                }}
              >
                <Text style={{ color: "#fff" }}>초기화</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#EFE5FF",
    //paddingHorizontal: 24,
    //spaddingTop: 50,
  },
  headerContainer: {
    paddingTop: 60,
    paddingLeft: 30,
    //marginBottom: 30,
    alignItems: "flex-start",
    backgroundColor: "#EFE5FF",
    height: "24%",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "left",
    //paddingLeft: 20,
    //marginBottom: 20,
    paddingBottom: 10,
    color: "#535353",
  },
  periodText: {
    fontSize: 18,
    color: "#535353",
    fontWeight: "500",
    marginBottom: 10,
  },
  inputContainer: {
    flex: 1,
    borderRadius: 30,
    backgroundColor: "#ffffffff",
    paddingTop: 30,
  },
  inputBox: {
    marginBottom: 24,
    paddingHorizontal: 30,
  },
  label: {
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 8,
    color: "#535353",
  },
  textInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 14,
    fontSize: 15,
    color: "#535353",
  },
  counter1: {
    alignSelf: "flex-end",
    fontSize: 12,
    color: "#C0C0C0",
    marginTop: 2,
  },
  counter2: {
    fontSize: 12,
    color: "#C0C0C0",
    marginTop: 2,
    paddingLeft: 140,
    marginLeft: "auto",
    marginRight: 100,
  },
  subjectRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  btnRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginVertical: 10,
  },
  addScheduleBtn: {
    //width: 100,
    backgroundColor: "#e0e0e0ff",
    paddingVertical: 8,
    borderRadius: 8,
    alignItems: "center",
    justifyContent: "center",
    marginRight: 10, // 버튼 사이 간격
  },
  addScheduleBtnText: {
    color: "#535353",
    paddingHorizontal: 10,
  },
  addBtn: {
    backgroundColor: "#EFE5FF",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 18,
    marginLeft: 8,
    borderWidth: 1,
    borderColor: "#B491DD",
  },
  addBtnText: {
    color: "#7A4DD6",
    fontWeight: "bold",
    fontSize: 15,
  },
  subjectItemRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    backgroundColor: "#e6e1f3ff",
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  subjectItemText: {
    color: "#665783ff",
    fontSize: 14,
    flex: 1,
  },
  subjectItemDelete: {
    color: "#9c73b8ff",
    fontSize: 18,
    marginLeft: 16,
    fontWeight: "bold",
  },

  submitBtn: {
    position: "absolute",
    bottom: 30,
    left: 20,
    right: 20,
    backgroundColor: "#000",
    borderRadius: 8,
    padding: 20,
    alignItems: "center",
  },
  submitBtnText: {
    color: "#fff",
    fontWeight: "bold",
    fontSize: 16,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.3)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalBox: {
    width: 300,
    backgroundColor: "#fff",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: "bold",
    marginVertical: 6,
    color: "#222",
    textAlign: "center",
  },
  modalDesc: {
    fontSize: 15,
    color: "#444",
    marginBottom: 20,
    textAlign: "center",
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
    marginHorizontal: 4,
  },
});
