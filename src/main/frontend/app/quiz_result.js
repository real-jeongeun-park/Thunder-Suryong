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
  const { quizId } = useLocalSearchParams();

  const [question, setQuestion] = useState(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userInfo, setUserInfo] = useState(null);
  const [questionParseComplete, setQuestionParseComplete] = useState(false);
  const [quizTitle, setQuizTitle] = useState("");
  const [questionCount, setQuestionCount] = useState(0);
  const [isCorrectList, setIsCorrectList] = useState([]);
  const [selectiveAnswer, setSelectiveAnswer] = useState("");

  // 로그인 여부 체크
  // 로그인 여부 체크
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
  // quiz 불러옴
  // quiz 불러옴

  useEffect(() => {
    const getTitleAndCount = async() => {
        try{
            const response = await axios.post(`${API_BASE_URL}/api/quiz/getQuizInfo`, {
                quizId,
            });

            setQuizTitle(response.data.quizTitle);
            setQuestionCount(response.data.questionCount);
            setIsCorrectList(response.data.isCorrectList);
        } catch(err){
            console.log("failed to load quiz title and question count", err);
        }
    }

    const getQuizzes = async() => {
        try{
            const response = await axios.post(`${API_BASE_URL}/api/quiz/get`, {
                quizId,
                currentQuestionIndex,
                isResultPage: "true",
            });

            setQuestion(response.data);
            setQuestionParseComplete(false);
        } catch(err){
            console.log("failed to load quiz ", err);
        }
    }
    if(userInfo && quizId && quizId !== ""){
        getTitleAndCount();
        getQuizzes();
    }
  }, [userInfo, quizId, currentQuestionIndex]);


  // 객관식 부분 parse
  useEffect(() => {
    if (
      (question?.type === "objective" ||
      question?.type === "ox") &&
      (!questionParseComplete &&
      typeof question.question === "string" &&
      question.question.includes("@@"))
    ) {
      const [newQuestion, afterSplitStr] = question.question.split("@@");
      const newOptions = afterSplitStr.split("|");

      setQuestion(prev => ({
        ...prev,
        question: newQuestion,
        options: newOptions,
      }));

      setQuestionParseComplete(true);
      console.log(question);
    }

    if(question?.type === "subjective"){
        setSelectiveAnswer(question.userAnswer);
    }
  }, [question?.type, question?.question, questionParseComplete]);

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity style={styles.backButton} onPress={() => { router.back(); }}>
            <Ionicons name="arrow-back" size={24} color="#A9A9A9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{quizTitle} 결과</Text>
        </View>

        {question && (
          <>
            <View style={styles.questionNavWrapper}>
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                contentContainerStyle={styles.questionNavContainer}
              >
                {isCorrectList && isCorrectList.length > 0 &&
                  Array.from({ length: parseInt(questionCount) }, (_, i) => (
                    <TouchableOpacity
                      key={i}
                      style={{
                        ...styles.questionNavBox,
                        backgroundColor:
                          isCorrectList[i] ? "#E8F2DF" : "#F4D2CF",
                        borderColor:
                          isCorrectList[i] ? "#72A13F" : "#C95B51",
                      }}
                     onPress={() => { setCurrentQuestionIndex(i) }}
                    >
                      <Text
                        style={{
                          ...styles.questionNavText,
                          ...(currentQuestionIndex === i && styles.questionNavTextActive),
                        }}
                      >
                        {i + 1}
                      </Text>
                    </TouchableOpacity>
                  ))
                }
              </ScrollView>
            </View>

            <ScrollView style={styles.questionContentContainer}>
              <Text style={styles.questionText}>
                {currentQuestionIndex+1}{". "}
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
                      borderColor: question.userAnswer === option
                        ? (question.isCorrect === "true"
                            ? "#72A13F" // 선택 o + 정답
                            : "#C95B51" // 선택 o + 오답
                          )
                        : "#B493C3", // 선택 x
                      backgroundColor: question.userAnswer === option
                        ? (question.isCorrect === "true"
                            ? "#E8F2DF" // 선택 o + 정답
                            : "#F4D2CF" // 선택 o + 오답
                          )
                        : "#FAF8FD", // 선택 x
                      borderRadius: 5,
                      paddingVertical: 12,
                      paddingHorizontal: 15,
                      marginBottom: 10
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
                    borderWidth: 0.6,
                    borderColor:
                      question.userAnswer === selectiveAnswer
                        ? (question.isCorrect === "true"
                            ? "#72A13F" // 선택 o + 정답
                            : "#C95B51" // 선택 o + 오답
                          )
                        : "#B493C3", // 선택 x
                    backgroundColor:
                      question.userAnswer === selectiveAnswer
                        ? (question.isCorrect === "true"
                            ? "#E8F2DF" // 선택 o + 정답
                            : "#F4D2CF" // 선택 o + 오답
                          )
                        : "#FAF8FD", // 선택 x
                    borderRadius: 5,
                    paddingVertical: 12,
                    paddingHorizontal: 15,
                  }}
                  multiline
                  value={selectiveAnswer}
                  editable={false}
                />
              )}

              {question.isCorrect && (
                <View
                  style={{
                    borderWidth: 1,
                    borderColor: "rgb(158 158 158)", // 연한 회색 테두리
                    borderRadius: 6,
                    padding: 12,
                    marginTop: 20,
                    backgroundColor: "#fff",
                  }}
                >
                  <Text
                    style={{
                      fontSize: 16,
                      fontWeight: "bold",
                      color: question.isCorrect === "true" ? "#2E7D32" : "#C62828",
                      marginBottom: 6,
                    }}
                  >
                    {question.isCorrect === "true" ? "정답입니다!" : `오답입니다. 정답은 '${question.answer}'`}
                  </Text>
                  <Text
                    style={{
                      fontSize: 14,
                      lineHeight: 20,
                      fontWeight: "500",
                      color: "#333",
                    }}
                  >해설:{" "}
                    {question.solution || "해설이 없습니다."}
                  </Text>
                </View>
              )}

              <View style={{ height: 100 }} />
            </ScrollView>
          </>
        )}

        <View style={styles.bottomButtonGroup}>
         { currentQuestionIndex === parseInt(questionCount)-1 ? (
          <TouchableOpacity
            style={{ ...styles.bottomButton, flex: 1, marginRight: 10 }}
            onPress={() => {
                router.push("/quiz_list");
            }}
          >
            <Text style={styles.bottomButtonText}>
             종료
            </Text>
          </TouchableOpacity>
         ) : (
          <TouchableOpacity
            style={{ ...styles.bottomButton, flex: 1, marginRight: 10 }}
            onPress={() => { setCurrentQuestionIndex(currentQuestionIndex+1) }}
          >
            <Text style={styles.bottomButtonText}>
             다음
            </Text>
          </TouchableOpacity>
         )
         }

        </View>
      </View>
    </SafeAreaView>
  );
}

// styles는 기존 styles 객체 그대로 사용

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff"
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
    paddingRight: 10
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "600",
    color: "#3C3C3C"
  },
  questionNavWrapper: {
    height: 53,
    marginBottom: 10
  },
  questionNavContainer: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 5
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
    borderColor: "#B493C3"
  },
  questionNavText: {
    fontSize: 14,
    fontWeight: "600",
    color: "#3C3C3C"
  },
  questionNavTextActive: {
    fontSize: 17,
    fontWeight: "400"
  },
  questionContentContainer: {
    flex: 1
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
    backgroundColor: "#FAF8FD"
  },
  optionText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#3C3C3C"
  },
  bottomButton: {
    backgroundColor: "#262626",
    borderRadius: 10,
    height: 53,
    justifyContent: "center",
    alignItems: "center"
  },
  bottomButtonText: {
    color: "#FFFFFF",
    fontSize: 16,
    fontWeight: "400"
  },
  bottomButtonGroup: {
    flexDirection: "row",
    paddingHorizontal: 20,
    marginBottom: 20,
    position: "absolute",
    bottom: 20,
    left: 20,
    right: 20
  }
});