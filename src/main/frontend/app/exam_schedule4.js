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
  Dimensions,
  ScrollView,
  Platform,
  Image,
  Modal,
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Menu, Button, Provider as PaperProvider } from "react-native-paper";

import axios from "axios";
import { useData } from "@/context/DataContext";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../src/constants";

const { width } = Dimensions.get("window");

export default function ExamInfoInput() {
  const router = useRouter();
  const { data, setData } = useData();

  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const { startDate, endDate, examName, subjects, subjectInfo } = data;
  const parsedSubjectInfo = JSON.parse(subjectInfo);
  const newSubjectList = [
    ...new Set(parsedSubjectInfo.map((item) => item.subject)),
  ]; // selected 된 것만

  const [plans, setPlans] = useState([]);
  const [selectedSubject, setSelectedSubject] = useState("");

  // 로그인 상태 여부 확인
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

        setUserInfo(res.data); // userInfo.nickname으로 받아옴
      } catch (e) {
        console.log(e);
        setUserInfo(null);
        router.push("/"); // 처음으로 돌아감
      }
    };

    checkLogin();
  }, []);

  // 자동 생성된 계획을 받아옴
  useEffect(() => {
    const getPlans = async () => {
      setLoading(true);
      try {
        const response = await axios.post(`${API_BASE_URL}/api/ai/plan`, {
          subjectInfo: parsedSubjectInfo,
          nickname: userInfo.nickname,
          endDate,
        });

        const { date, subject, week, content } = response.data;

        const newPlanList = date.map((date, index) => ({
          date,
          subject: subject[index],
          week: week[index],
          content: content[index],
        }));

        if (Platform.OS !== "web") {
          const cleanedPlans = newPlanList.map((plan) => ({
            ...plan,
            subject: plan.subject ? plan.subject.replace(/^"(.*)"$/, "$1") : "",
          }));

          setPlans(cleanedPlans);

          if (cleanedPlans.length > 0 && !selectedSubject) {
            const firstSubject = [
              ...new Set(cleanedPlans.map((item) => item.subject)),
            ][0];
            if (firstSubject) {
              setSelectedSubject(firstSubject);
            }
          }
        } else {
          setPlans(newPlanList);
          if (newPlanList.length > 0 && !selectedSubject) {
            const firstSubject = [
              ...new Set(newPlanList.map((item) => item.subject)),
            ][0];
            if (firstSubject) {
              setSelectedSubject(firstSubject);
            }
          }
        }
      } catch (e) {
        console.log(e);
      } finally {
        setLoading(false);
      }
    };

    if (userInfo) {
      getPlans();
    }
  }, [userInfo]);

  // 선택된 과목의 계획들만 필터링 (간단하고 명확하게)
  const getSelectedPlans = () => {
    if (!selectedSubject || !plans || plans.length === 0) {
      return [];
    }

    return plans.filter((plan) => {
      if (!plan || !plan.subject) return false;
      return plan.subject.trim() === selectedSubject.trim();
    });
  };

  const selectedPlans = getSelectedPlans();

  // 디버깅용 로그 (필요시 사용)
  console.log("현재 선택된 과목:", selectedSubject);
  console.log("전체 계획 수:", plans.length);
  console.log("필터된 계획 수:", selectedPlans.length);

  const [editModalVisible, setEditModalVisible] = useState(false);
  const [editIndex, setEditIndex] = useState(null);
  const [editDate, setEditDate] = useState("");
  const [editWeek, setEditWeek] = useState("");
  const [editContent, setEditContent] = useState("");

  // 수정 모달 관련 함수들
  const openEditModal = (index) => {
    const plan = selectedPlans[index];
    if (!plan) return;

    setEditIndex(index);
    setEditDate(plan.date);
    setEditWeek(plan.week);
    setEditContent(plan.content);
    setEditModalVisible(true);
  };

  const handleSaveEdit = () => {
    if (!editDate.trim() || !editWeek.trim() || !editContent.trim()) {
      alert("날짜, 주차/단원, 내용을 모두 입력하세요!");
      return;
    }

    // 원본 plans 배열에서 해당 계획의 인덱스 찾기
    const targetPlan = selectedPlans[editIndex];
    const originalIndex = plans.findIndex(
      (p) =>
        p.date === targetPlan.date &&
        p.subject === targetPlan.subject &&
        p.week === targetPlan.week &&
        p.content === targetPlan.content
    );

    if (originalIndex === -1) {
      alert("수정할 계획을 찾지 못했습니다.");
      setEditModalVisible(false);
      return;
    }

    // plans 업데이트
    const updatedPlans = [...plans];
    updatedPlans[originalIndex] = {
      ...updatedPlans[originalIndex],
      date: editDate,
      week: editWeek,
      content: editContent,
    };

    setPlans(updatedPlans);
    setEditModalVisible(false);
  };

  const handleDeletePlan = (index) => {
    const targetPlan = selectedPlans[index];
    if (!targetPlan) return;

    const originalIndex = plans.findIndex(
      (p) =>
        p.date === targetPlan.date &&
        p.subject === targetPlan.subject &&
        p.week === targetPlan.week &&
        p.content === targetPlan.content
    );

    if (originalIndex === -1) {
      alert("삭제할 계획을 찾지 못했습니다.");
      return;
    }

    const updatedPlans = [...plans];
    updatedPlans.splice(originalIndex, 1);
    setPlans(updatedPlans);
  };

  const handleSubmit = async () => {
    try {
      const response = await axios.post(`${API_BASE_URL}/api/exam/create`, {
        nickname: userInfo.nickname,
        startDate,
        endDate,
        examName,
      });

      const examId = response.data;

      const response2 = await axios.post(`${API_BASE_URL}/api/subject/create`, {
        examId,
        subjects: JSON.parse(subjects),
      });

      const transformedPlans = {
        examId,
        subject: plans.map((p) => p.subject),
        week: plans.map((p) => p.week),
        content: plans.map((p) => p.content),
        date: plans.map((p) => p.date),
      };

      const response3 = await axios.post(
        `${API_BASE_URL}/api/plan/create`,
        transformedPlans
      );
      router.push("/main");
    } catch (e) {
      console.log(e);
    }
  };

  return (
    <PaperProvider>
      <SafeAreaWrapper backgroundTop="#EFE5FF" backgroundBottom="#ffffffff">
        <View style={styles.container}>
          <View
            style={{
              flex: 1,
            }}
          >
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
              <Text style={styles.headerTitle}>계획을 등록해주세요.</Text>
              <Text style={styles.subHeaderText}>
                생성된 계획을 확인하고 등록해주세요!
              </Text>
            </View>
            <View style={styles.inputContainer}>
              <View style={styles.formBox}>
                {/* 기간 */}
                <Text style={styles.inputText}>기간</Text>
                <Text style={styles.periodText}>
                  {startDate} ~ {endDate}
                </Text>
                {/* 시험명 */}
                <Text style={styles.inputText}>시험명</Text>
                <Text style={styles.periodText}>{examName}</Text>
                {/* 일정 */}
                <Text style={styles.inputText}>일정</Text>
                <View style={styles.subjectScrollContainer}>
                  <ScrollView horizontal showsHorizontalScrollIndicator={true}>
                    {newSubjectList.map((subject, index) => (
                      <TouchableOpacity
                        key={index}
                        style={[
                          styles.subjectBadge,
                          selectedSubject === subject &&
                            styles.subjectBadgeSelected,
                        ]}
                        onPress={() => setSelectedSubject(subject)}
                      >
                        <Text
                          style={[
                            styles.subjectBadgeText,
                            selectedSubject === subject &&
                              styles.subjectBadgeTextSelected,
                          ]}
                        >
                          {subject}
                        </Text>
                      </TouchableOpacity>
                    ))}
                  </ScrollView>
                </View>

                <View style={styles.scheduleListContainer}>
                  {loading ? (
                    <Text style={styles.noScheduleText}>
                      일정을 불러오는 중입니다...
                    </Text>
                  ) : selectedPlans.length === 0 ? (
                    <Text style={styles.noScheduleText}>
                      선택한 과목의 일정이 없습니다.
                    </Text>
                  ) : (
                    <ScrollView
                      style={{ maxHeight: 300 }}
                      showsVerticalScrollIndicator={false}
                    >
                      {selectedPlans.map((plan, idx) => (
                        <View key={idx} style={styles.scheduleItem}>
                          <Text style={styles.scheduleWeek}>
                            날짜: {plan.date}
                          </Text>
                          <Text style={styles.scheduleWeek}>
                            주차/단원: {plan.week}
                          </Text>
                          <Text style={styles.scheduleContent}>
                            내용: {plan.content}
                          </Text>

                          <View style={{ flexDirection: "row", marginTop: 8 }}>
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                { backgroundColor: "#b6a3dbff" },
                              ]}
                              onPress={() => openEditModal(idx)}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                }}
                              >
                                수정
                              </Text>
                            </TouchableOpacity>
                            <TouchableOpacity
                              style={[
                                styles.actionButton,
                                {
                                  backgroundColor: "#7c66a8ff",
                                  marginLeft: 10,
                                },
                              ]}
                              onPress={() => {
                                //if (confirm("정말 삭제하시겠습니까?")) {
                                handleDeletePlan(idx);
                                //}
                              }}
                            >
                              <Text
                                style={{
                                  color: "white",
                                  paddingHorizontal: 8,
                                  paddingVertical: 2,
                                }}
                              >
                                삭제
                              </Text>
                            </TouchableOpacity>
                          </View>
                        </View>
                      ))}
                    </ScrollView>
                  )}
                </View>
              </View>
            </View>
            <Modal
              visible={editModalVisible}
              transparent={true}
              animationType="fade"
              onRequestClose={() => setEditModalVisible(false)}
            >
              <View style={styles.modalBackground}>
                <View style={styles.modalContainer}>
                  <Text style={styles.modalTitle}>계획 수정하기</Text>

                  <TextInput
                    style={styles.modalInput}
                    value={editDate}
                    onChangeText={setEditDate}
                    placeholder="날짜 (YYYY-MM-DD)"
                  />
                  <TextInput
                    style={styles.modalInput}
                    value={editWeek}
                    onChangeText={setEditWeek}
                    placeholder="주차/단원"
                  />
                  <TextInput
                    style={[styles.modalInput, { height: 80 }]}
                    value={editContent}
                    onChangeText={setEditContent}
                    multiline
                    placeholder="내용"
                  />

                  <View
                    style={{
                      flexDirection: "row",
                      justifyContent: "space-between",
                    }}
                  >
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: "#ccc", marginRight: 10 },
                      ]}
                      onPress={() => setEditModalVisible(false)}
                    >
                      <Text>취소</Text>
                    </TouchableOpacity>
                    <TouchableOpacity
                      style={[
                        styles.modalButton,
                        { backgroundColor: "#7A4DD6" },
                      ]}
                      onPress={handleSaveEdit}
                    >
                      <Text style={{ color: "white" }}>저장</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
            </Modal>
            {/* 입력 완료 버튼 */}
            <TouchableOpacity style={styles.submitBtn} onPress={handleSubmit}>
              <Text style={styles.submitBtnText}>입력 완료</Text>
            </TouchableOpacity>
          </View>
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
  },
  backButtonContainer: {
    //position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  headerContainer: {
    paddingTop: 20,
    paddingLeft: 30,
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
  subHeaderText: {
    fontSize: 18,
    color: "#535353",
    fontWeight: "500",
    marginBottom: 20,
  },
  periodText: {
    fontSize: 16,
    color: "#535353",
    fontWeight: "450",
    marginBottom: 20,
    paddingHorizontal: 10,
    paddingVertical: 8,
  },
  subjectBadge: {
    width: 100,
    backgroundColor: "#BEBEBE",
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 8,
    marginRight: 10,
    alignItems: "center",
    justifyContent: "center",
  },
  subjectBadgeText: {
    color: "#3a3a3aff",
    fontSize: 14,
    fontWeight: "normal",
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
    height: 35,
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
    paddingHorizontal: 10,
  },
  directAddGuide: {
    width: 200,
    backgroundColor: "#c0c0c0ff",
    marginTop: 10,
    marginBottom: 5,
    alignItems: "center",
    borderRadius: 5,
  },
  directAddGuideText: {
    color: "#616161ff",
    fontSize: 14,
  },
  directAddBtn: {
    width: 100,
    height: 40,
    backgroundColor: "#c0c0c0ff",
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginTop: 20,
    alignSelf: "flex-end",
  },
  directAddBtnText: {
    color: "#616161ff",
    fontSize: 12,
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
  subjectScrollContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
  },
  subjectBadgeSelected: {
    backgroundColor: "#E8E6EB",
  },
  subjectBadgeTextSelected: {
    color: "#3a3a3aff",
  },
  scheduleListContainer: {
    paddingHorizontal: 20,
    paddingVertical: 10,
    backgroundColor: "#fff",
    flex: 1,
  },
  noScheduleText: {
    color: "#999",
    fontSize: 14,
    fontStyle: "italic",
  },
  scheduleItem: {
    backgroundColor: "#E5DFF5",
    borderRadius: 8,
    padding: 12,
    marginBottom: 10,
  },
  scheduleWeek: {
    fontWeight: "bold",
    color: "#665783",
    marginBottom: 4,
  },
  scheduleContent: {
    color: "#665783",
  },
  actionButton: {
    borderRadius: 6,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },

  modalBackground: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },

  modalContainer: {
    width: "85%",
    backgroundColor: "white",
    borderRadius: 12,
    padding: 20,
  },

  modalTitle: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 16,
    textAlign: "center",
  },

  modalInput: {
    borderWidth: 1,
    borderColor: "#ccc",
    borderRadius: 6,
    padding: 10,
    marginBottom: 12,
    fontSize: 16,
  },

  modalButton: {
    flex: 1,
    borderRadius: 6,
    paddingVertical: 12,
    alignItems: "center",
  },
});
