import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Dimensions,
  ScrollView,
  Image,
  Platform,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Menu, Button, Provider as PaperProvider } from "react-native-paper";
import * as ImagePicker from "expo-image-picker";

import axios from "axios";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";

import { useData } from "@/context/DataContext";

const { height: screenHeight } = Dimensions.get("window");

export default function ExamInfoInput() {
  const router = useRouter();
  const { data, setData } = useData();
  const { startDate, endDate, examName, subjects } = data;

  let subjectList = [];
  try {
    subjectList = JSON.parse(subjects);
    if (!Array.isArray(subjectList)) {
      subjectList = [];
    }
  } catch (e) {
    console.log(e);
    subjectList = [];
  }

  const examPeriod = `${startDate} ~ ${endDate}`;

  // 입력 상태
  const [selectedSubject, setSelectedSubject] = useState(subjectList[0] || "");
  const [week, setWeek] = useState("");
  const [content, setContent] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  // 저장 배열
  const [subjectInfo, setSubjectInfo] = useState([]);
  const [loading, setLoading] = useState(false);

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

  // 추가 버튼 핸들러
  const handleAddSubjectInfo = () => {
    if (!selectedSubject || !week || !content) {
      alert("과목, 주차/단원, 내용/분량을 모두 입력하세요!");
      return;
    }
    setSubjectInfo([
      ...subjectInfo,
      { subject: selectedSubject, week, content },
    ]);
    setWeek("");
    setContent("");
  };

  const pickImage = async () => {
    if (Platform.OS === "web") {
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
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ImagePicker.MediaTypeOptions.Images,
        base64: false, // 앱용
        allowsEditing: false,
        quality: 1,
      });

      if (!result.canceled && result.assets.length > 0) {
        const pickedImage = result.assets[0];
        uploadImage(pickedImage.uri); // uri을 보냄
      }
    }
  };

  const uploadBase64Image = async (base64) => {
    // 웹용
    setLoading(true);

    try {
      const response = await axios.post(`${API_BASE_URL}/api/ocr/web`, {
        base64: base64,
      });

      useAi(response.data);
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

    if (uri.endsWith("png")) {
      fileType = "image/png";
    }

    const file = {
      uri,
      type: fileType,
      name: `upload.${fileType.split("/")[1]}`,
    };

    formData.append("image", file);

    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/ocr/app`,
        formData
      );
      useAi(response.data);
    } catch (e) {
      console.log(e);
    } finally {
      setLoading(false);
    }
  };

  const useAi = async (request) => {
    if (request.trim()) {
      // 있어야만 실행
      try {
        const response = await axios.post(`${API_BASE_URL}/api/ai/syllabus`, {
          request: request,
        });

        const { weekList, contentList } = response.data;

        const newSubjectInfoList = weekList.map((week, index) => ({
          subject: selectedSubject,
          week,
          content: contentList[index],
        }));

        setSubjectInfo([...subjectInfo, ...newSubjectInfoList]);
      } catch (e) {
        console.log(e);
      }
    }
  };

  const handleSubmit = () => {
    if (subjectInfo.length === 0) {
      alert("하나 이상의 공부 분량을 추가하세요.");
      return;
    }

    setData((prev) => ({
      ...prev,
      subjectInfo: JSON.stringify(subjectInfo),
    }));
    router.push("/exam_schedule4");
  };

  // 내용 수정
  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null); // 수정 중인 전체 배열 인덱스
  const [editWeek, setEditWeek] = useState("");
  const [editContent, setEditContent] = useState("");

  // 필터된 subjectInfo (선택한 과목에 해당하는 것만)
  const filteredSubjectInfo = subjectInfo.filter(
    (info) => info.subject === selectedSubject
  );

  const openEditModal = (filteredIdx) => {
    const info = filteredSubjectInfo[filteredIdx];
    if (!info) return;

    // 전체 배열에서 실제 인덱스 찾기 (동일한 객체를 찾음)
    const realIndex = subjectInfo.findIndex(
      (item) =>
        item.subject === info.subject &&
        item.week === info.week &&
        item.content === info.content
    );

    if (realIndex === -1) return;

    setEditIndex(realIndex);
    setEditWeek(info.week);
    setEditContent(info.content);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (editWeek.trim() === "" || editContent.trim() === "") {
      alert("주차/단원, 내용/분량을 모두 입력하세요!");
      return;
    }

    setSubjectInfo((prev) => {
      const newArr = [...prev];
      if (editIndex !== null && editIndex >= 0) {
        newArr[editIndex] = {
          ...newArr[editIndex],
          week: editWeek,
          content: editContent,
        };
      }
      return newArr;
    });

    setEditModalVisible(false);
  };

  const handleDeleteSubjectInfo = (filteredIdx) => {
    // 필터된 배열에서의 인덱스를 전체 배열 인덱스로 변환 후 삭제
    const info = filteredSubjectInfo[filteredIdx];
    if (!info) return;

    const realIndex = subjectInfo.findIndex(
      (item) =>
        item.subject === info.subject &&
        item.week === info.week &&
        item.content === info.content
    );
    if (realIndex === -1) return;

    setSubjectInfo((prev) => {
      const newArr = [...prev];
      newArr.splice(realIndex, 1);
      return newArr;
    });
  };

  const handleToggleImportant = (filteredIdx) => {
    // 현재 subjectInfo에서 해당 filteredIdx(=같은 subject의 filtered idx → 실제 인덱스 변환 필요)
    const info = filteredSubjectInfo[filteredIdx];
    if (!info) return;

    const realIndex = subjectInfo.findIndex(
      (item) =>
        item.subject === info.subject &&
        item.week === info.week &&
        item.content === info.content
    );
    if (realIndex === -1) return;

    setSubjectInfo((prev) => {
      const newArr = [...prev];
      newArr[realIndex] = {
        ...newArr[realIndex],
        important: !newArr[realIndex].important, // 토글
      };
      return newArr;
    });
  };

  return (
    <PaperProvider>
      <SafeAreaWrapper backgroundTop="#EFE5FF" backgroundBottom="#ffffffff">
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
            <TouchableOpacity onPress={() => router.back()}>
              <Ionicons name="chevron-back" size={32} color="#535353" />
            </TouchableOpacity>
          </View>

          {/* 상단 날짜 및 안내 */}
          <View style={styles.headerContainer}>
            <Text style={styles.headerTitle}>분량을 입력해주세요.</Text>
            <Text style={styles.periodText}>{examPeriod}</Text>
            <FlatList
              data={[examName, ...subjectList]}
              horizontal
              keyExtractor={(item, idx) => item + idx}
              showsHorizontalScrollIndicator={false}
              renderItem={({ item }) => (
                <View style={styles.subjectBadge}>
                  <Text style={styles.subjectBadgeText}>{item}</Text>
                </View>
              )}
              style={{ maxHeight: 40 }}
              contentContainerStyle={{ alignItems: "center" }}
            />
          </View>

          <View style={styles.inputContainer}>
            <View style={styles.formBox}>
              <Text style={styles.inputText}>과목</Text>
              {/* 드롭다운(과목 선택) + 사진 추가 버튼 */}
              <View style={styles.dropdownRow}>
                <View style={styles.dropdown}>
                  <Menu
                    visible={menuVisible}
                    onDismiss={() => setMenuVisible(false)}
                    anchor={
                      <Button
                        onPress={() => setMenuVisible(true)}
                        labelStyle={{ color: "#717171" }}
                        style={{ borderColor: "#F4F1F5", borderRadius: 5 }}
                      >
                        {selectedSubject || "과목 선택"}
                      </Button>
                    }
                    contentStyle={{ backgroundColor: "#FAF8FD" }}
                  >
                    {subjectList.map((subject) => (
                      <Menu.Item
                        key={subject}
                        onPress={() => {
                          setSelectedSubject(subject);
                          setMenuVisible(false);
                        }}
                        title={subject}
                        titleStyle={{ color: "#555555ff", fontSize: 16 }}
                      />
                    ))}
                  </Menu>
                </View>

                <TouchableOpacity
                  style={styles.photoAddBtn}
                  onPress={pickImage}
                >
                  <Text style={styles.photoAddBtnText}>
                    강의계획서로 추가하기
                  </Text>
                </TouchableOpacity>
              </View>

              {/* 주차/단원 입력 */}
              <Text style={styles.inputText}>주차/단원</Text>
              <TextInput
                style={styles.input}
                placeholder="예시: 2주차"
                placeholderTextColor="#717171"
                value={week}
                onChangeText={setWeek}
              />
              {/* 내용/분량 입력 */}
              <Text style={styles.inputText}>내용/분량</Text>
              <TextInput
                style={styles.input}
                placeholder="예시: 클라우드 컨셉 개요"
                placeholderTextColor="#717171"
                value={content}
                onChangeText={setContent}
              />
              {/* 안내/추가 버튼 */}
              <TouchableOpacity
                style={styles.directAddBtn}
                onPress={handleAddSubjectInfo}
              >
                <Text style={styles.directAddBtnText}>직접 추가하기</Text>
              </TouchableOpacity>

              {/* 저장된 데이터 확인 */}
              <ScrollView
                style={{ marginTop: 20, maxHeight: screenHeight * 0.28 }}
                showsVerticalScrollIndicator={false}
              >
                {filteredSubjectInfo.map((info, idx) => (
                  <View key={idx} style={styles.subjectInfoItem}>
                    <View
                      style={{
                        flexDirection: "row",
                        justifyContent: "space-between",
                        alignItems: "center",
                      }}
                    >
                      <View>
                        <Text style={styles.subjectInfoWeek}>{info.week}</Text>
                        <Text style={styles.subjectInfoContent}>
                          {info.content}
                        </Text>
                      </View>
                      <View
                        style={{ flexDirection: "row", alignItems: "center" }}
                      >
                        {/* 별 icon */}
                        <TouchableOpacity
                          onPress={() => handleToggleImportant(idx)}
                          style={{ marginRight: 6 }} // 여유
                        >
                          <Ionicons
                            name={info.important ? "star" : "star-outline"}
                            size={22}
                            color={info.important ? "#ffc23dff" : "#BDBDBD"}
                          />
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => openEditModal(idx)}
                          style={styles.editButton}
                        >
                          <Text style={{ color: "#5e43c2" }}>수정</Text>
                        </TouchableOpacity>
                        <TouchableOpacity
                          onPress={() => handleDeleteSubjectInfo(idx)}
                          style={[styles.editButton, { marginLeft: 10 }]}
                        >
                          <Text style={styles.subjectItemDelete}>✕</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  </View>
                ))}
              </ScrollView>

              {/* 수정 모달 */}
              <Modal
                visible={editModalVisible}
                transparent
                animationType="none"
                onRequestClose={() => setEditModalVisible(false)}
              >
                <View style={styles.modalBackground}>
                  <View style={styles.modalContainer}>
                    <Text style={styles.modalTitle}>수정하기</Text>

                    <Text style={styles.modalLabel}>주차/단원</Text>
                    <TextInput
                      style={styles.modalInput}
                      value={editWeek}
                      onChangeText={setEditWeek}
                      placeholder="예시: 2주차"
                    />
                    <Text style={styles.modalLabel}>내용/분량</Text>
                    <TextInput
                      style={[styles.modalInput, { height: 80 }]}
                      value={editContent}
                      onChangeText={setEditContent}
                      placeholder="예시: 클라우드 컨셉 개요"
                      multiline
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
                          { backgroundColor: "#7A4DD6" },
                        ]}
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
        </View>
      </SafeAreaWrapper>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "300",
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
  },
  backButtonContainer: {
    //position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  headerContainer: {
    paddingTop: 18,
    paddingLeft: 20,
    alignItems: "flex-start",
    backgroundColor: "#EFE5FF",
    height: "24%",
  },
  headerTitle: {
    fontSize: 30,
    fontWeight: "bold",
    color: "#535353",
    paddingBottom: 10,
  },
  periodText: {
    fontSize: 18,
    color: "#535353",
    fontWeight: "500",
    marginBottom: 20,
  },
  subjectBadge: {
    backgroundColor: "#E5DFF5",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 16,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectBadgeText: {
    color: "#7A4DD6",
    fontSize: 14,
  },
  inputContainer: {
    flex: 1,
    borderTopLeftRadius: 30,
    borderTopRightRadius: 30,
    backgroundColor: "#fff",
    paddingTop: 10,
  },
  formBox: {
    paddingHorizontal: 21,
  },
  dropdown: {
    flex: 1,
    height: 35,
    backgroundColor: "#FAF8FD",
    borderColor: "#F4F1F5",
    borderWidth: 0.2,
    borderRadius: 5,
    justifyContent: "center",
    marginRight: 10,
    alignSelf: "flex-start",
  },
  dropdownRow: {
    flexDirection: "row",
    alignItems: "center",
    width: "100%",
    paddingTop: 10,
  },
  photoAddBtn: {
    flex: 1,
    height: 35,
    marginLeft: 10,
    backgroundColor: "#E5DFF5",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
  },
  photoAddBtnText: {
    color: "#5e43c2ff",
    fontSize: 14,
  },
  input: {
    //height: 45,
    padding: 14,
    backgroundColor: "#FAF8FD",
    borderColor: "#F4F1F5",
    borderWidth: 0.2,
    borderRadius: 5,
    fontSize: 15,
    color: "#717171",
    paddingHorizontal: 10,
    marginTop: 10,
  },
  inputText: {
    fontSize: 15,
    color: "#535353",
    fontWeight: "bold",
    marginTop: 15,
  },
  directAddBtn: {
    width: 120,
    height: 35,
    backgroundColor: "#E5DFF5",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 15,
    alignSelf: "flex-end",
  },
  directAddBtnText: {
    color: "#5e43c2ff",
    fontSize: 14,
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
  subjectInfoItem: {
    backgroundColor: "#e6e1f3ff",
    padding: 10,
    borderRadius: 8,
    marginBottom: 8,
  },
  subjectInfoWeek: {
    marginLeft: 12,
    fontWeight: "600",
    color: "#333",
    fontSize: 14,
  },
  subjectInfoContent: {
    marginLeft: 12,
    color: "#555",
    marginTop: 4,
    maxWidth: 350,
  },
  editButton: {
    paddingHorizontal: 6,
    paddingVertical: 6,
  },
  subjectItemDelete: {
    color: "#9c73b8ff",
    fontSize: 18,
    fontWeight: "bold",
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
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  modalBtn: {
    flex: 1,
    paddingVertical: 12,
    borderRadius: 8,
    marginHorizontal: 6,
    alignItems: "center",
  },
  // 모달 배경 (반투명 검은 배경)
  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "center",
    alignItems: "center",
  },

  // 모달 박스 스타일 (흰 배경+둥근 모서리)
  pickerContainer: {
    width: "85%",
    backgroundColor: "#fff",
    borderRadius: 20,
    paddingVertical: 20,
    paddingHorizontal: 24,
    // 그림자 (iOS)
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 5 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    // 엘리베이션 (Android)
    elevation: 10,
    alignItems: "center",
  },

  // 모달 타이틀
  modalTitle: {
    fontWeight: "bold",
    fontSize: 20,
    marginBottom: 18,
    color: "#333",
    textAlign: "center",
  },

  // Picker 스타일 - 여기서는 기본적 스타일만 적용.
  // NativePicker가 네이티브 모양을 그대로 사용하는 게 자연스러움
  picker: {
    width: "100%",
    // iOS에서는 높이가 자동으로 조절됨
    // Android에서 필요시 높이 지정 가능
    height: 160,
  },

  // 닫기 버튼 스타일
  modalBtn: {
    backgroundColor: "#6c4ed5",
    borderRadius: 10,
    paddingVertical: 14,
    width: "100%",
    marginTop: 24,
    alignItems: "center",
  },

  modalBtnText: {
    color: "white",
    fontWeight: "bold",
    fontSize: 16,
  },
});
