import { useState, useEffect } from "react";
import { useRouter, useLocalSearchParams } from "expo-router";
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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Menu, Button, Provider as PaperProvider } from "react-native-paper";

import axios from "axios";
import { useData } from "@/context/DataContext";
import * as SecureStore from "expo-secure-store";

const { width } = Dimensions.get("window");

export default function ExamInfoInput() {
  const router = useRouter();
  const { data, setData } = useData();

  const [loading, setLoading] = useState(false);
  const [userInfo, setUserInfo] = useState(null);

  const { examName, startDate, endDate, subjectInfos } = data;
  const parsedSubjectInfos = JSON.parse(data.subjectInfos);
  const newSubjectList = [...new Set(parsedSubjectInfos.map(item => item.subject))];
  // 다 불러옴

  const [plans, setPlans] = useState([]);

  useEffect(() => {
    const checkLogin = async () => {
      try{
        let token;

        if(Platform.OS === 'web'){
            token = localStorage.getItem("accessToken");
        } else{
           // 앱
           token = await SecureStore.getItemAsync("accessToken");
        }

        if(!token) throw new Error("Token not found");

        const res = await axios.get("http://localhost:8080/api/validation", {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        });

        setUserInfo(res.data); // userInfo.nickname으로 받아옴
      } catch(e){
        console.log(e);
        setUserInfo(null);
        router.push("/"); // 처음으로 돌아감
      }
    };

    checkLogin();
  }, [])

  useEffect(() => {
    const getPlans = async () => {
      setLoading(true);
      try {
        const response = await axios.post("http://localhost:8080/api/ai/plans", {
          subjectInfos: parsedSubjectInfos,
          nickname: userInfo.nickname,
          startDate,
          endDate,
        });

        const { date, subject, week, content } = response.data; // 모두 다 리스트 형태

        const newPlanList = date.map((date, index) => ({
            date,
            subject: subject[index],
            week: week[index],
            content: content[index],
        }));

        setPlans(prev => [...prev, ...newPlanList]);
      } catch (e) {
        console.log(e);
      } finally{
        setLoading(false);
      }
    };

    if (userInfo) {
      getPlans(); // userInfo가 반드시 있어야 함
    }
  }, [userInfo]); // userInfo가 바뀔 때마다 실행됨

  const [plans, setPlans] = useState([
    {
      subject: "수학",
      date: "2025-07-15",
      week: "3주차",
      content: "수학 1단원 복습",
      plan: "문제집 20~30쪽 풀기",
    },
    {
      subject: "영어",
      date: "2025-07-16",
      week: "2주차",
      content: "영어 단어 암기",
      plan: "단어장 1~3쪽",
    },
    // ...다른 과목 plan 추가
  ]);

  // 입력 상태
  const [selectedSubject, setSelectedSubject] = useState(newSubjectList[0] || "");

  // 선택된 과목의 plan만 보여주기
  const selectedPlans = plans.filter((p) => p.subject === selectedSubject);

  const handleSubmit = async () => {
    try{
        const response = await axios.post("http://localhost:8080/api/createExam", {
            list: { startDate,
            endDate,
            examName,
            newSubjectList},
            nickname: userInfo.nickname,
        }); // exam db에 저장
        // console.log(newSubjectList.length);
        // console.log(plans.length);

        const transformedPlans = {
          date: plans.map(p => p.date),
          subject: plans.map(p => p.subject),
          week: plans.map(p => p.week),
          content: plans.map(p => p.content),
        };

        const response2 = await axios.post("http://localhost:8080/api/createPlan", {
            plans: transformedPlans,
            nickname: userInfo.nickname,
        });

        // plan db에 저장

        console.log(response.data);
        console.log(response2.data); // 디버깅

        router.push("/main");
    } catch(e){
        console.log(e);
    }
  }

  return (
    <PaperProvider>
      <View style={styles.container}>
        {loading && <View style={styles.loadingOverlay}>
            <Image source={require("../assets/images/main.png")} style={styles.character} resizeMode="contain"/>
            <Text style={styles.loadingText}>로딩 중입니다....</Text>
        </View>}
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
            <Text style={styles.periodText}>{startDate} ~ {endDate}</Text>
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
              {selectedPlans.length === 0 ? (
                <Text style={styles.noScheduleText}>
                  선택한 과목의 일정이 없습니다.
                </Text>
              ) : (
                selectedPlans.map((plan, idx) => (
                  <View key={idx} style={styles.scheduleItem}>
                    <Text style={styles.scheduleWeek}>날짜: {plan.date}</Text>
                    <Text style={styles.scheduleWeek}>
                      주차/단원: {plan.week}
                    </Text>
                    <Text style={styles.scheduleContent}>
                      내용: {plan.content}
                    </Text>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
        {/* 입력 완료 버튼 */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={handleSubmit}
        >
          <Text style={styles.submitBtnText}>입력 완료</Text>
        </TouchableOpacity>
      </View>
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
    backgroundColor: 'rgba(0,0,0,0.65)',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 9999,
  },
  loadingText: {
    color: 'white',
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
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  headerContainer: {
    paddingTop: 60,
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
    borderRadius: 30,
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
});
