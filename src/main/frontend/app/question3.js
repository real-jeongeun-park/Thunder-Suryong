import { Ionicons } from "@expo/vector-icons";
import { useNavigation, useRoute } from "@react-navigation/native";
import { useRouter } from "expo-router";
import { useState, useEffect } from "react";
import {
  Keyboard,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  TouchableWithoutFeedback,
  View,
} from "react-native";

import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { API_BASE_URL } from "../src/constants";

import { useData } from "../context/DataContext";

export default function StudyOptionScreen() {
  const navigation = useNavigation();
  const [hours, setHours] = useState("");
  const router = useRouter();
  const route = useRoute();

  const [customStyle, setCustomStyle] = useState("");
  const [selected, setSelected] = useState([]);

  const [emptySelected, setEmptySelected] = useState(false);

  const { data, setData } = useData();

  const [userInfo, setUserInfo] = useState(null);

  const options = [
    "하루에 한 과목씩 집중한다.",
    "하루에 여러 과목을 조금씩 공부한다.",
    "문제를 풀며 개념을 이해한다.",
    "개념노트를 만든다.",
  ];

  useEffect(() => {
    async function checkLogin() {
      try {
        let token;

        if (Platform.OS === "web") token = localStorage.getItem("accessToken");
        else token = await SecureStore.getItemAsync("accessToken");

        if (!token) throw new Error("Token not found");

        const res = await axios.get(`${API_BASE_URL}/api/validation`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserInfo(res.data);
      } catch (err) {
        console.log(err);
        router.push("/");
      }
    }

    checkLogin();
  }, []);

  const toggleOption = (text) => {
    /* 옵션 list 객체에 넣음 */

    if (selected.includes(text)) {
      setSelected(selected.filter((item) => item !== text));
    } else {
      setSelected([...selected, text]);
      setEmptySelected(false);
    }

    console.log(selected);
    console.log(selected.length);
  };

  const selectComplete = () => {
    let newSelected = [...selected];

    if (customStyle && !newSelected.includes(customStyle)) {
      newSelected.push(customStyle);
    }

    if (newSelected.length === 0) {
      setEmptySelected(true);
      return;
    }

    const newData = {
      ...data,
      studyStyle: newSelected,
      nickname: userInfo.nickname,
    };

    setSelected(newSelected);
    console.log(newData);

    axios
      .post("http://localhost:8080/api/style", newData)
      .then((res) => {
        router.push("/main");
      })
      .catch((err) => {
        console.log(err);
        // 오류가 생겼습니다 띄우기
      });
  };

  return (
    <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <View style={styles.container}>
          {/* 상단 뒤로가기 */}
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
          >
            <Ionicons name="chevron-back" size={24} color="black" />
          </TouchableOpacity>

          {/* 질문 */}
          <View>
            <Text style={styles.title}>나의 학습 스타일을 선택해주세요.</Text>
            <Text style={styles.subtitle}>중복 선택 가능합니다.</Text>
          </View>

          <ScrollView
            style={{ flex: 1, marginTop: 10 }} // 여기엔 layout만 남기고!
            keyboardShouldPersistTaps="handled"
            contentContainerStyle={{
              justifyContent: "flex-start", // 여기에 넣기!!!
              paddingBottom: 16,
            }}
          >
            {options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                style={styles.option}
                onPress={() => toggleOption(option)}
              >
                <View
                  style={[
                    styles.circle,
                    selected.includes(option) && styles.circleSelected,
                  ]}
                />
                <Text
                  style={[
                    styles.optionText,
                    selected.includes(option) && styles.optionTextSelected,
                  ]}
                >
                  {option}
                </Text>
              </TouchableOpacity>
            ))}

            {/* 기타 입력란도 여기에 포함 */}
            <TouchableOpacity
              style={{ flexDirection: "row", alignItems: "center" }}
            >
              <View style={[styles.circle, styles.circleCustom]} />
              <TextInput
                placeholder="기타 : 나의 학습 스타일을 입력해 주세요."
                placeholderTextColor="#ccc"
                value={customStyle}
                onChangeText={(text) => {
                  setCustomStyle(text);
                  setEmptySelected(false);
                }}
                style={[styles.textInput, styles.optionTextSelected]}
              />
            </TouchableOpacity>

            {emptySelected && (
              <Text style={{ color: "red", marginTop: 15 }}>
                학습 스타일을 최소 한 개 이상 선택해 주세요.
              </Text>
            )}
          </ScrollView>

          {/* 하단 버튼들 */}
          <View style={styles.bottomButtons}>
            <TouchableOpacity
              style={styles.confirmButton}
              onPress={selectComplete}
            >
              <Text style={styles.confirmText}>선택 완료</Text>
            </TouchableOpacity>
          </View>
        </View>
      </KeyboardAvoidingView>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#fff",
    paddingHorizontal: 24,
    paddingTop: 64,
    justifyContent: "space-between",
  },
  backButton: {
    position: "absolute",
    top: 44,
    left: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: "bold",
    marginTop: 32,
    marginBottom: 8,
  },
  subtitle: {
    color: "#BFC0C1",
    fontSize: 16,
    marginBottom: 100,
  },
  input: {
    fontSize: 18,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
    paddingVertical: 8,
    color: "#000",
  },
  subText: {
    marginTop: 8,
    color: "#aaa",
    fontSize: 13,
  },
  bottomButtons: {
    paddingBottom: 32,
  },
  confirmButton: {
    backgroundColor: "#A78BFA",
    paddingVertical: 14,
    borderRadius: 8,
    alignItems: "center",
  },
  confirmText: {
    color: "#fff",
    fontSize: 16,
    fontWeight: "bold",
  },
  skipText: {
    marginTop: 16,
    color: "#000",
    fontSize: 14,
    textAlign: "center",
    textDecorationLine: "underline",
  },
  circle: {
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: "#D9D9D9",
    marginRight: 12,
  },
  textInput: {
    flex: 1,
  },
  optionsContainer: {
    flex: 1,
  },
  option: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 20,
  },
  optionText: {
    color: "#BFC0C1",
    fontSize: 16,
  },
  optionTextSelected: {
    color: "#000",
  },
  center: {
    flex: 1,
    justifyContent: "flex-start",
    marginTop: 10, // ← 숫자 조절해서 위치 조정 가능!
  },
  circleSelected: {
    backgroundColor: "#9B73D2",
  },
  circleCustom: {
    backgroundColor: "#808080",
  },
  contentContainer: {
    justifyContent: "flex-start",
  },
});
