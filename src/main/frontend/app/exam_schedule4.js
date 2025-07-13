import { useState } from "react";
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
} from "react-native";
import Ionicons from "react-native-vector-icons/Ionicons";
import { Menu, Button, Provider as PaperProvider } from "react-native-paper";

const { width } = Dimensions.get("window");

export default function ExamInfoInput() {
  const router = useRouter();
  const { examName, startDate, endDate, subjects } = useLocalSearchParams();
  let subjectList = [];
  try {
    subjectList = JSON.parse(subjects);
    if (!Array.isArray(subjectList)) {
      subjectList = [];
    }
  } catch (e) {
    subjectList = [];
  }
  const examPeriod = `${startDate}~${endDate}`;

  // 입력 상태
  const [selectedSubject, setSelectedSubject] = useState(subjectList[0] || "");
  const [week, setWeek] = useState("");
  const [content, setContent] = useState("");
  const [menuVisible, setMenuVisible] = useState(false);

  // 저장 배열
  const [subjectInfos, setSubjectInfos] = useState([]);

  // 추가 버튼 핸들러
  const handleAddSubjectInfo = () => {
    if (!selectedSubject || !week || !content) {
      alert("과목, 주차/단원, 내용/분량을 모두 입력하세요!");
      return;
    }
    setSubjectInfos([
      ...subjectInfos,
      { subject: selectedSubject, week, content },
    ]);
    setWeek("");
    setContent("");
  };

  return (
    <PaperProvider>
      <View style={styles.container}>
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
            <Text style={styles.periodText}>{examPeriod}</Text>
            {/* 시험명 */}
            <Text style={styles.inputText}>시험명</Text>
            <Text style={styles.periodText}>{examName}</Text>
            {/* 일정 */}
            <Text style={styles.inputText}>일정</Text>
          </View>
        </View>
        {/* 입력 완료 버튼 */}
        <TouchableOpacity style={styles.submitBtn}>
          <Text style={styles.submitBtnText}>입력 완료</Text>
        </TouchableOpacity>
      </View>
    </PaperProvider>
  );
}

const styles = StyleSheet.create({
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
    fontWeight: "bold",
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
});
