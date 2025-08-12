import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
  Platform,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as SecureStore from "expo-secure-store";
import { useData } from "@/context/DataContext";
import { API_BASE_URL } from "../src/constants";
const { width } = Dimensions.get("window");
import axios from "axios";

export default function CreatedQuizScreen() {
  const router = useRouter();
  const { data, setData } = useData();
  const { questionName, quizId, questionCount } = data;
  const [question, setQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [subjectiveAnswer, setSubjectiveAnswer] = useState("");
  const [questionParseComplete, setQuestionParseComplete] = useState(false);
  const [selectedOption, setSelectedOption] = useState("");
  const [userAnswers, setUserAnswers] = useState([]);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // 로그인 여부 체크
  useEffect(() => {
    async function checkLogin() {
      try {
        let token;

        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
        } else {
          token = await SecureStore.getItemAsync("accessToken");
        }

        if (!token) throw new Error("Token not found");
        const res = await axios.get(`${API_BASE_URL}/api/validation`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setUserInfo(res.data);
      } catch (err) {
        console.log(err);
        setUserInfo(null);
        router.push("/");
      }
    }

    checkLogin();
  }, []);

  // quiz 불러옴
  useEffect(() => {
    const getQuizzes = async () => {
      try {
        const response = await axios.post(`${API_BASE_URL}/api/quiz/get`, {
          quizId,
          currentQuestionIndex,
          isResultPage: "false",
        });

        setQuestion(response.data);
        setQuestionParseComplete(false);
      } catch (err) {
        console.log("failed to load quiz ", err);
      }
    };

    if (userInfo && userInfo !== "") {
      getQuizzes();
    }
  }, [userInfo, quizId, currentQuestionIndex]);

  // 객관식 부분 parse
  useEffect(() => {
    if (
      (question?.type === "objective" || question?.type === "ox") &&
      !questionParseComplete &&
      typeof question.question === "string" &&
      question.question.includes("@@")
    ) {
      const [newQuestion, afterSplitStr] = question.question.split("@@");
      const newOptions = afterSplitStr.split("|");

      setQuestion((prev) => ({
        ...prev,
        question: newQuestion,
        options: newOptions,
      }));

      setQuestionParseComplete(true);
    }
  }, [question?.type, question?.question, questionParseComplete]);

  const selectOption = (option) => {
    if (selectedOption === option) {
      setSelectedOption(null);
    } else {
      setSelectedOption(option);
    }
  };

  // 문제 이동
  useEffect(() => {
    const item = userAnswers.find(
      (item) => item.index === currentQuestionIndex
    );
    if (question?.type === "subjective") {
      setSubjectiveAnswer(item ? item.answer : "");
    } else {
      setSelectedOption(item ? item.answer : "");
    }
  }, [currentQuestionIndex, userAnswers, question?.type]);

  const handleMoveQuestion = (newIndex) => {
    const isSubjective = question.type === "subjective";
    const answer = isSubjective ? subjectiveAnswer : selectedOption;
    const nextIndex = newIndex != null ? newIndex : currentQuestionIndex + 1;

    setUserAnswers((prev) => {
      const filtered = prev.filter(
        (item) => item.index !== currentQuestionIndex
      );
      return [...filtered, { index: currentQuestionIndex, answer }];
    });

    setCurrentQuestionIndex(nextIndex);
  };

  // 제출
  useEffect(() => {
    const handleSubmitAnswer = async () => {
      const answer =
        question.type === "subjective" ? subjectiveAnswer : selectedOption;

      // 현재 문제 답 덮어쓰기
      const updatedAnswers = [
        ...userAnswers.filter((item) => item.index !== currentQuestionIndex),
        { index: currentQuestionIndex, answer },
      ];

      try {
        const response = await axios.post(`${API_BASE_URL}/api/quiz/score`, {
          userAnswers: updatedAnswers,
          quizId,
        });

        router.push({
          pathname: "/quiz_result",
          params: { quizId },
        });
      } catch (err) {
        console.log("failed to get answers ", err);
      }
    };

    if (isSubmitted) {
      handleSubmitAnswer();
    }
  }, [isSubmitted]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          {questionName && (
            <Text style={styles.headerTitle}>{questionName}</Text>
          )}
        </View>

        {question && (
          <>
            <View style={styles.questionNavWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.questionNavContainer}
              >
                {Array.from({ length: parseInt(questionCount) }, (_, i) => (
                  <TouchableOpacity
                    key={i}
                    style={{
                      ...styles.questionNavBox,
                      backgroundColor:
                        currentQuestionIndex === i ? "#EDE1FF" : "#FAF8FD",
                      borderColor:
                        currentQuestionIndex === i ? "#7A4EC6" : "#B493C3",
                    }}
                    onPress={() => {
                      handleMoveQuestion(i);
                    }}
                  >
                    <Text
                      style={{
                        ...styles.questionNavText,
                        ...(currentQuestionIndex === i &&
                          styles.questionNavTextActive),
                      }}
                    >
                      {i + 1}
                    </Text>
                  </TouchableOpacity>
                ))}
              </ScrollView>
            </View>

            <ScrollView style={styles.questionContentContainer}>
              <Text style={styles.questionText}>
                {currentQuestionIndex + 1}
                {". "}
                {question.question}
                {question.type === "subjective"
                  ? " (주관식)"
                  : question.type === "objective"
                  ? " (객관식, 1개 선택)"
                  : " (O/X)"}
              </Text>

              {question.type !== "subjective" && questionParseComplete ? (
                question.options.map((option, idx) => (
                  <TouchableOpacity
                    key={idx}
                    style={{
                      borderWidth: 0.6,
                      borderColor: "#B493C3",
                      backgroundColor:
                        selectedOption === option ? "#EDE1FF" : "#FAF8FD",
                      borderRadius: 5,
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      marginBottom: 10,
                    }}
                    onPress={() => {
                      selectOption(option);
                    }}
                  >
                    <Text style={styles.optionText}>{option}</Text>
                  </TouchableOpacity>
                ))
              ) : (
                <TextInput
                  style={{
                    ...styles.optionBox,
                    minHeight: 100,
                    textAlignVertical: "top",
                    fontSize: 17,
                  }}
                  multiline
                  value={subjectiveAnswer}
                  onChangeText={setSubjectiveAnswer}
                  placeholder="답안을 입력하세요."
                />
              )}

              <View style={{ height: 100 }} />
            </ScrollView>
          </>
        )}

        <View style={styles.bottomButtonGroup}>
          {currentQuestionIndex === questionCount - 1 ? (
            <TouchableOpacity
              style={{ ...styles.bottomButton, flex: 1, marginRight: 10 }}
              onPress={() => {
                setIsSubmitted(true);
              }}
            >
              <Text style={styles.bottomButtonText}>정답 확인</Text>
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              style={{ ...styles.bottomButton, flex: 1, marginRight: 10 }}
              onPress={() => {
                handleMoveQuestion();
              }}
            >
              <Text style={styles.bottomButtonText}>다음</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
    </SafeAreaView>
  );
}

// styles는 기존 styles 객체 그대로 사용

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
    paddingTop: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 10,
    marginBottom: 20,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3C3C3C",
  },
  questionNavWrapper: {
    height: 53,
    marginBottom: 10,
  },
  questionNavContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5,
  },
  questionNavBox: {
    width: 43,
    height: 43,
    borderRadius: 5,
    justifyContent: "center",
    alignItems: "center",
    marginHorizontal: 5,
    backgroundColor: "#FAF8FD",
    borderWidth: 0.6,
    borderColor: "#B493C3",
  },
  questionNavText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C3C3C",
  },
  questionNavTextActive: {
    fontSize: 17,
    fontWeight: "400",
  },
  questionContentContainer: {
    flex: 1,
  },
  questionText: {
    fontSize: 20,
    fontWeight: "600",
    color: "#3C3C3C",
    marginBottom: 20,
    marginTop: 10,
  },
  optionBox: {
    borderWidth: 0.6,
    borderColor: "#B493C3",
    borderRadius: 5,
    paddingVertical: 12,
    paddingHorizontal: 15,
    marginBottom: 10,
    backgroundColor: "#FAF8FD",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#3C3C3C",
  },
  bottomButton: {
    backgroundColor: "#262626",
    borderRadius: 10,
    height: 53,
    justifyContent: "center",
    alignItems: "center",
  },
  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400",
  },
  bottomButtonGroup: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20,
  },
});
