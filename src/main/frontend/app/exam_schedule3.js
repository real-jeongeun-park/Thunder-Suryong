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
          <Text style={styles.headerTitle}>분량을 입력해주세요.</Text>
          <Text style={styles.periodText}>{examPeriod}</Text>
          <FlatList
            data={[examName, ...subjectList]}
            horizontal
            keyExtractor={(item, idx) => item + idx}
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
                onPress={() => {
                  /* 사진 추가 기능 */
                }}
              >
                <Text style={styles.photoAddBtnText}>사진으로 추가하기</Text>
              </TouchableOpacity>
            </View>

            {/* 주차/단원 입력 */}
            <Text style={styles.inputText}>주차/단원</Text>
            <TextInput
              style={styles.input}
              placeholder="ex) 1주차"
              placeholderTextColor="#717171"
              value={week}
              onChangeText={setWeek}
            />
            {/* 내용/분량 입력 */}
            <Text style={styles.inputText}>내용/분량</Text>
            <TextInput
              style={styles.input}
              placeholder="ex) 7주차 강의자료"
              placeholderTextColor="#717171"
              value={content}
              onChangeText={setContent}
            />
            {/* 안내/추가 버튼 */}
            <View style={styles.directAddGuide}>
              <Text style={styles.directAddGuideText}>
                분량을 직접 추가해주세요!
              </Text>
            </View>
            <TouchableOpacity
              style={styles.directAddBtn}
              onPress={handleAddSubjectInfo}
            >
              <Text style={styles.directAddBtnText}>추가</Text>
            </TouchableOpacity>

            {/* 저장된 데이터 확인용(디버깅) */}
            <ScrollView style={{ marginTop: 20, maxHeight: 120 }}>
              {subjectInfos.map((info, idx) => (
                <Text key={idx} style={{ color: "#616161", marginTop: 5 }}>
                  {JSON.stringify(info)}
                </Text>
              ))}
            </ScrollView>
          </View>
        </View>
        {/* 입력 완료 버튼 */}
        <TouchableOpacity
          style={styles.submitBtn}
          onPress={() => {
            router.push({
              pathname: "/exam_schedule4",
              params: {
                examName,
                startDate,
                endDate,
                subjects,
                subjectInfos: JSON.stringify(subjectInfos),
              },
            });
          }}
        >
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
