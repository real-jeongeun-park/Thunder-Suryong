import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
  Image,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { useData } from "@/context/DataContext";
import axios from "axios";
import * as ImagePicker from "expo-image-picker";
import { TextInputBase } from "react-native";

export default function ExamInfoInput() {
  const router = useRouter();

  const [examName, setExamName] = useState("");
  const [emptyExamName, setEmptyExamName] = useState(false);
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [emptySubjects, setEmptySubjects] = useState(false);
  const [loading, setLoading] = useState(false);

  const { data, setData } = useData();

  const startDate = data.startDate;
  const endDate = data.endDate;

  const [showModal, setShowModal] = useState(false);

  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        let token;

        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
        } else {
          // 앱
          token = await SecureStore.getItemAsync("accessToken");
        }

        if (!token) throw new Error("Token not found");

        const res = await axios.get("http://localhost:8080/api/validation", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        console.log(e);
        setUserInfo(null);
        router.push("/"); // 처음으로 돌아감
      }
    };

    checkLogin();
  }, []);

  const handleAddSubject = () => {
    if (subject.trim() && subjects.length < 30) {
      setSubjects([...subjects, subject.trim()]);
      setSubject("");
      setEmptySubjects(false);
    }
  };

  const handleRemoveSubject = (removeIdx) => {
    setSubjects(subjects.filter((_, idx) => idx !== removeIdx));
  };

  const pickImage = async () => {
    if (Platform.OS === "web") {
      // 웹일 경우. file:/// 사용 안됨 -> base64 사용
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: true, // 웹용
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const pickedImage = result.assets[0];
        uploadBase64Image(pickedImage.base64);
      }
    } else {
      // 앱일 경우
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: false, // 앱용
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const pickedImage = result.assets[0];
        uploadImage(pickedImage.uri);
      }
    }
  };

  const uploadBase64Image = async (base64) => {
    // 웹용
    setLoading(true);

    try {
      const res = await axios.post("http://localhost:8080/api/ocr/web", {
        base64: base64,
      });

      console.log(res.data);
      useAi(res.data);
    } catch (err) {
      console.log(err);
    } finally {
      setLoading(false);
    }
  };

  const uploadImage = async (uri: string) => {
    // 앱용
    setLoading(true);

    const formData = new FormData();
    let fileType = "image/jpeg";

    if (uri.endsWith(".png")) {
      fileType = "image/png";
    }

    const file = {
      uri,
      type: fileType,
      name: `upload.${fileType.split("/")[1]}`,
    };

    formData.append("image", file);

    try {
      const res = await axios.post(
        "http://localhost:8080/api/ocr/app",
        formData
      );
      console.log(res.data);
      useAi(res.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const useAi = async (request) => {
    if (request.trim()) {
      // 과목 뽑아오기
      try {
        const res = await axios.post("http://localhost:8080/api/ai/schedule", {request});
        setSubjects((prev) => [...prev, ...res.data]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleSubmit = async () => {
    if (!examName.trim()) {
      setEmptyExamName(true);
    }

    if (subjects.length === 0) {
      setEmptySubjects(true);
    }

    if (examName.trim() && subjects.length !== 0) {
      // data 존재
      setData((prev) => ({
        ...prev,
        examName,
        subjects: JSON.stringify(subjects),
      }));
      router.push("/exam_schedule3");
    }
  };

  // 내용 수정
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editSubjectName, setEditSubjectName] = useState("");

  const openEditModal = (index) => {
    setEditIndex(index);
    setEditSubjectName(subjects[index]);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editSubjectName.trim() === "") {
      alert("과목명을 입력해 주세요.");
      return;
    }

    setSubjects((prev) => {
      const newArr = [...prev];
      newArr[editIndex] = editSubjectName.trim();
      return newArr;
    });

    setEditModalVisible(false);
  };

  return (
    <View style={styles.container}>
      {loading && (
        <View style={styles.loadingOverlay}>
          <Image
            source={require("../assets/images/main.png")}
            style={styles.character}
            resizeMode="contain"
          />
          <Text style={styles.loadingText}>로딩 중입니다....</Text>
        </View>
      )}

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
        <Text style={styles.periodText}>
          {startDate} ~ {endDate}
        </Text>
      </View>
      <View style={styles.inputContainer}>
        {/* 시험명 입력 */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>시험명</Text>
          <TextInput
            style={styles.textInput}
            placeholder="예시: 2025년 1학기 중간고사"
            maxLength={30}
            value={examName}
            onChangeText={(text) => {
              setExamName(text);
              setEmptyExamName(false);
            }}
          />
          <Text style={styles.counter1}>{examName.length}/30</Text>
          {emptyExamName && (
            <Text style={{ color: "red" }}>시험명을 입력해 주세요.</Text>
          )}
        </View>
        {/* 과목 입력 */}
        <View style={styles.inputBox}>
          <Text style={styles.label}>과목</Text>
          <View style={styles.subjectRow}>
            <TextInput
              style={[styles.textInput, { flex: 1 }]}
              placeholder="과목명을 입력해주세요."
              maxLength={30}
              value={subject}
              onChangeText={setSubject}
            />
            <TouchableOpacity style={styles.addBtn} onPress={handleAddSubject}>
              <Text style={styles.addBtnText}>추가</Text>
            </TouchableOpacity>
          </View>
          {/*시간표 불러오기, 초기화 버튼*/}
          <View style={styles.btnRow}>
            <TouchableOpacity style={styles.addScheduleBtn} onPress={pickImage}>
              <Text style={styles.addScheduleBtnText}>
                에타 시간표 불러오기
              </Text>
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
            <Text style={styles.counter2}>{subject.length}/30</Text>
          </View>
          {emptySubjects && (
            <Text style={{ color: "red" }}>
              과목을 하나 이상 추가해 주세요.
            </Text>
          )}
          {/* 과목 리스트 */}
          <FlatList
            data={subjects}
            keyExtractor={(item, idx) => item + idx}
            style={{ maxHeight: 300 }}
            showsVerticalScrollIndicator={false}
            renderItem={({ item, index }) => (
              <View style={styles.subjectItemRow}>
                <Text style={styles.subjectItemText}>{item}</Text>
                <TouchableOpacity
                  onPress={() => openEditModal(index)}
                  style={styles.editButton}
                >
                  <Text style={{ color: "#5e43c2" }}>수정</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={() => handleRemoveSubject(index)}>
                  <Text style={styles.subjectItemDelete}>✕</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          {/* 수정 모달 */}
          <Modal
            visible={editModalVisible}
            transparent
            animationType="none"
            onRequestClose={() => setEditModalVisible(false)}
          >
            <View style={styles.modalBackground}>
              <View style={styles.modalBox}>
                <Text style={styles.modalTitle}>과목명 수정</Text>

                <TextInput
                  style={styles.textInputModify}
                  value={editSubjectName}
                  onChangeText={setEditSubjectName}
                  placeholder="과목명을 입력해주세요"
                />

                <View style={styles.modalBtnRow}>
                  <TouchableOpacity
                    onPress={() => setEditModalVisible(false)}
                    style={[styles.modalBtn, { backgroundColor: "#e0e0e0" }]}
                  >
                    <Text style={{ color: "#535353" }}>취소</Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={handleSaveEdit}
                    style={[styles.modalBtn, { backgroundColor: "#B491DD" }]}
                  >
                    <Text style={{ color: "white" }}>저장</Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </View>
      </View>
      {/* 입력 완료 버튼 */}
      <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
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
  loadingOverlay: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: "rgba(0,0,0,0.65)",
    justifyContent: "center",
    alignItems: "center",
    zIndex: 9999,
  },
  loadingText: {
    color: "white",
    fontSize: 20,
    fontWeight: 300,
  },
  character: {
    width: 170,
    height: 170,
    marginBottom: 20,
    marginRight: 40,
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
  textInputModify: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    padding: 14,
    marginBottom: 10,
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
    borderRadius: 8,
    paddingVertical: 10,
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
  // modal styles
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 16,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 12,
    color: "#333",
    textAlign: "center",
  },
  modalLabel: {
    fontWeight: "600",
    marginBottom: 6,
    color: "#555",
  },
  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    fontSize: 15,
    marginBottom: 12,
    color: "#333",
  },
});
