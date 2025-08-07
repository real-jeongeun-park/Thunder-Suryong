import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
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
  TextInputBase,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";

import { useData } from "@/context/DataContext";

import axios from "axios";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";

import * as ImagePicker from "expo-image-picker";
import { parseISO, addDays, format } from "date-fns";
import {
  Menu,
  Button,
  Provider as PaperProvider,
  Portal,
  Dialog,
} from "react-native-paper";

export default function ExamInfoInput() {
  const router = useRouter();

  const [examName, setExamName] = useState("");
  const [emptyExamName, setEmptyExamName] = useState(false);
  const [subject, setSubject] = useState("");
  const [subjects, setSubjects] = useState([]);
  const [emptySubjects, setEmptySubjects] = useState(false);
  const [loading, setLoading] = useState(false);

  const [datePickerDialogVisible, setDatePickerDialogVisible] = useState(false);
  const [selectedDateIndex, setSelectedDateIndex] = useState(null);
  const [selectedDates, setSelectedDates] = useState([]);

  const { data, setData } = useData();

  const startDate = data.startDate;
  const endDate = data.endDate;

  const [showModal, setShowModal] = useState(false);

  const [userInfo, setUserInfo] = useState(null);

  const [menuVisible, setMenuVisible] = useState(false);
  const [selectedDate, setSelectedDate] = useState(
    selectedDateIndex !== null ? selectedDates[selectedDateIndex] : null
  );

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

        const res = await axios.get(`${API_BASE_URL}/api/validation`, {
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

  // 시험기간 내 날짜 리스트 생성 (yyyy-MM-dd 배열)
  const generateDateOptions = () => {
    const dates = [];
    if (!startDate || !endDate) return dates;
    let currDate = parseISO(startDate);
    const lastDate = parseISO(endDate);

    while (currDate <= lastDate) {
      dates.push(format(currDate, "yyyy-MM-dd"));
      currDate = addDays(currDate, 1);
    }
    return dates;
  };

  // 날짜 선택 모달 띄우기 함수
  const openDatePicker = (index) => {
    setSelectedDateIndex(index);
    setDatePickerDialogVisible(true);
  };
  const closeDatePicker = () => {
    setSelectedDateIndex(false);
    setSelectedDate(false);
    setDatePickerDialogVisible(false);

    console.log(selectedDates);
  };

  // 날짜 선택 시 동작
  const onDateSelected = (date) => {
    setSelectedDates((prevDates) => {
      const newDates = [...prevDates];
      newDates[selectedDateIndex] = date;
      return newDates;
    });
  };

  // 과목 추가할 때 selectedDates 배열도 같이 업데이트
  const handleAddSubject = () => {
    if (subject.trim() && subjects.length < 30) {
      setSubjects([...subjects, subject.trim()]);
      setSelectedDates([...selectedDates, null]); // 새 과목에 날짜 기본 null
      setSubject("");
      setEmptySubjects(false);
    }
  };

  // 과목 삭제 시 selectedDates 배열도 동기화
  const handleRemoveSubject = (removeIdx) => {
    setSubjects(subjects.filter((_, idx) => idx !== removeIdx));
    setSelectedDates(selectedDates.filter((_, idx) => idx !== removeIdx));
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
      const res = await axios.post(`${API_BASE_URL}/api/ocr/web`, {
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

  const uploadImage = async (uri) => {
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
      const res = await axios.post(`${API_BASE_URL}/api/ocr/app`, formData);
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
        const res = await axios.post(`${API_BASE_URL}/api/ai/schedule`, {
          request,
        });
        setSubjects((prev) => [...prev, ...res.data]);
      } catch (err) {
        console.log(err);
      }
    }
  };

  const handleSubmit = async () => {
    const isExamnameEmpty = !examName.trim();
    const isSubjectsEmpty = subjects.length === 0;
    const isInvalidDates =
      selectedDates.length === 0 ||
      selectedDates.length !== subjects.length ||
      Array.from(selectedDates).some((date) => !date || date.trim() === "");

    if (isExamnameEmpty) {
      setEmptyExamName(true);
    }
    if (isSubjectsEmpty) {
      setEmptySubjects(true);
    } else if (isInvalidDates) {
      alert("각 과목의 시험 날짜를 선택해주세요.");
    }

    if (!isExamnameEmpty && !isSubjectsEmpty && !isInvalidDates) {
      setData((prev) => ({
        ...prev,
        examName,
        subjects: JSON.stringify(subjects),
        subjectDates: JSON.stringify(selectedDates),
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
    <PaperProvider>
      <SafeAreaWrapper backgroundTop="#EFE5FF" backgroundBottom="#ffffffff">
        <Portal.Host>
          <View
            style={{
              flex: 1,
            }}
          >
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
                <Text style={styles.headerTitle}>
                  시험 정보를 {"\n"}입력해주세요.
                </Text>
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
                    <Text style={{ color: "red" }}>
                      시험명을 입력해 주세요.
                    </Text>
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
                    <TouchableOpacity
                      style={styles.addBtn}
                      onPress={handleAddSubject}
                    >
                      <Text style={styles.addBtnText}>추가</Text>
                    </TouchableOpacity>
                  </View>
                  {/*시간표 불러오기, 초기화 버튼*/}
                  <View style={styles.btnRow}>
                    <View style={{ flexDirection: "row" }}>
                      <TouchableOpacity
                        style={styles.addScheduleBtn}
                        onPress={pickImage}
                      >
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
                    </View>
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
                    style={{ maxHeight: 250 }}
                    showsVerticalScrollIndicator={false}
                    renderItem={({ item, index }) => (
                      <View style={styles.subjectItemRow}>
                        <Text style={styles.subjectItemText}>{item}</Text>
                        <TouchableOpacity
                          onPress={() => openDatePicker(index)}
                          style={styles.editButton}
                        >
                          <Text style={styles.dateSelectText}>
                            {selectedDates[index]
                              ? format(parseISO(selectedDates[index]), "M/d")
                              : "날짜 선택"}
                          </Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => openEditModal(index)}
                          style={styles.editButton}
                        >
                          <Text style={{ color: "#5e43c2" }}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleRemoveSubject(index)}
                        >
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
                            style={[
                              styles.modalBtn,
                              { backgroundColor: "#e0e0e0" },
                            ]}
                          >
                            <Text style={{ color: "#535353" }}>취소</Text>
                          </TouchableOpacity>

                          <TouchableOpacity
                            onPress={handleSaveEdit}
                            style={[
                              styles.modalBtn,
                              { backgroundColor: "#B491DD" },
                            ]}
                          >
                            <Text style={{ color: "white" }}>저장</Text>
                          </TouchableOpacity>
                        </View>
                      </View>
                    </View>
                  </Modal>

                  {/* 날짜 선택 모달 */}
                  <Portal>
                    <Dialog
                      visible={datePickerDialogVisible}
                      onDismiss={closeDatePicker}
                    >
                      <Dialog.Title
                        style={{
                          fontSize: 20,
                          fontWeight: "bold",
                          color: "#4B3F72",
                          textAlign: "center",
                        }}
                      >
                        시험 날짜 선택
                      </Dialog.Title>
                      <Dialog.Content>
                        <View style={styles.dropdownRow}>
                          <View style={styles.dropdown}>
                            <Menu
                              visible={menuVisible}
                              onDismiss={() => setMenuVisible(false)}
                              anchor={
                                <Button
                                  mode="outlined"
                                  onPress={() => setMenuVisible(true)}
                                  labelStyle={{
                                    color: selectedDate ? "#5e43c2" : "#717171",
                                  }}
                                  style={[
                                    styles.dropdownButton,
                                    { borderColor: "#F4F1F5", borderRadius: 5 },
                                  ]}
                                  contentStyle={{
                                    flexDirection: "row-reverse",
                                  }}
                                  icon="chevron-down"
                                  uppercase={false}
                                >
                                  {selectedDate
                                    ? format(
                                        parseISO(selectedDate),
                                        "yyyy-MM-dd"
                                      )
                                    : "날짜 선택"}
                                </Button>
                              }
                              contentStyle={{
                                backgroundColor: "#FAF8FD",
                                borderRadius: 8,
                              }}
                            >
                              {generateDateOptions().map((date) => (
                                <Menu.Item
                                  key={date}
                                  onPress={() => {
                                    setSelectedDate(date);
                                    setSelectedDates((prevDates) => {
                                      const newDates = [...prevDates];
                                      newDates[selectedDateIndex] = date;
                                      return newDates;
                                    });
                                    setMenuVisible(false);
                                  }}
                                  title={format(parseISO(date), "yyyy-MM-dd")}
                                  titleStyle={{ color: "#555", fontSize: 16 }}
                                  style={{ paddingVertical: 8 }}
                                />
                              ))}
                            </Menu>
                          </View>
                        </View>
                      </Dialog.Content>
                      <Dialog.Actions>
                        <Button
                          onPress={closeDatePicker}
                          labelStyle={{ color: "#7A4DD6" }}
                        >
                          저장
                        </Button>
                      </Dialog.Actions>
                    </Dialog>
                  </Portal>
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
                    <Text style={styles.modalDesc}>
                      과목 목록이 모두 삭제됩니다.
                    </Text>
                    <View style={styles.modalBtnRow}>
                      <TouchableOpacity
                        style={[
                          styles.modalBtn,
                          { backgroundColor: "#e0e0e0" },
                        ]}
                        onPress={() => setShowModal(false)}
                      >
                        <Text style={{ color: "#535353" }}>취소</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        style={[
                          styles.modalBtn,
                          { backgroundColor: "#B491DD" },
                        ]}
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
          </View>
        </Portal.Host>
      </SafeAreaWrapper>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    //position: "absolute",
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
    paddingTop: 20,
    paddingLeft: 20,
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
  dateSelectText: {
    //padding: 5,
    borderRadius: 7,
    color: "#7547aaff",
    marginRight: 10,
    //shadowColor: "#535353", // 그림자 색상 (어두운 회색)
    //shadowOpacity: 0.3, // 투명도 (0~1)
    //shadowOffset: { width: 0, height: 2 }, // 그림자 위치(오프셋)
    //shadowRadius: 4, // 블러 반경
    //elevation: 5, // Android 그림자 깊이
  },

  inputContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
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
    //paddingLeft: 80,
    marginLeft: "auto",
    //marginRight: 100,
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
    flex: 1,
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
    borderColor: "#EFE5FF",
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
    maxWidth: 250,
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
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)", // 더 진한 배경으로 집중감 상승
    justifyContent: "center",
    alignItems: "center",
  },

  modalBox: {
    width: 320,
    backgroundColor: "#fff",
    borderRadius: 20, // 둥근 모서리 더 부드럽게
    paddingVertical: 24,
    paddingHorizontal: 30,
    alignItems: "center",
    shadowColor: "#000", // 그림자 효과 추가 (iOS)
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.25,
    shadowRadius: 8,
    elevation: 7, // Android 그림자
  },

  modalTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: "#4B3F72", // 조금 더 세련된 딥보라색
    marginBottom: 18,
    textAlign: "center",
  },

  modalDesc: {
    fontSize: 16,
    color: "#666",
    marginBottom: 24,
    textAlign: "center",
    lineHeight: 22,
  },

  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    width: "100%",
  },

  modalBtn: {
    flex: 1,
    marginHorizontal: 6,
    paddingVertical: 14,
    borderRadius: 12, // 버튼 모서리 부드럽게
    alignItems: "center",
    justifyContent: "center",
    shadowColor: "#000", // 버튼 그림자 (선택적)
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.12,
    shadowRadius: 4,
    elevation: 4,
  },

  // 취소 버튼 스타일 (밝은 회색)
  modalBtnCancel: {
    backgroundColor: "#E6E6E6",
  },
  modalBtnCancelText: {
    color: "#555",
    fontWeight: "600",
  },

  // 저장/초기화 버튼 스타일 (메인 보라색)
  modalBtnConfirm: {
    backgroundColor: "#7A4DD6",
  },
  modalBtnConfirmText: {
    color: "#fff",
    fontWeight: "700",
  },

  // 날짜 선택 모달 내 버튼 스타일
  modalBtnText: {
    fontSize: 16,
    color: "#7A4DD6",
    fontWeight: "600",
    paddingHorizontal: 20,
    paddingVertical: 10,
    textAlign: "center",
  },

  pickerContainer: {
    width: 320,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    padding: 24,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 8,
  },

  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
    marginBottom: 20,
    //backgroundColor: "#000000ff",
  },

  dropdown: {
    backgroundColor: "#ffffffff",
    flex: 1,
    height: 40,
    backgroundColor: "#FAF8FD",
    borderColor: "#D8CDED",
    borderWidth: 1,
    borderRadius: 10,
    justifyContent: "center",
  },

  dropdownButton: {
    height: 40,
    justifyContent: "center",
  },

  // 수정 입력박스 모달 텍스트 인풋
  textInputModify: {
    backgroundColor: "#FBFBFB",
    borderRadius: 12,
    borderColor: "#D4C9E6",
    borderWidth: 1,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 16,
    color: "#555",
    width: "100%",
    marginBottom: 20,
  },
});
