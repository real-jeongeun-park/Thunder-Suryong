import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";
import * as SecureStore from 'expo-secure-store';
import { Platform } from "react-native";
import axios from "axios";

const { width } = Dimensions.get("window");

export default function CreatedQuizScreen() {
  const router = useRouter();

  const {
    problemName: initialProblemName,
    questionCount: initialQuestionCount,
    selectedTypes: selectedTypesParam,
    quizList,
    noteIds: noteIdsParam
  } = useLocalSearchParams();

  const selectedTypes = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(selectedTypesParam));
    } catch {
      return [2];
    }
  }, [selectedTypesParam]);

  //
  const noteIds = useMemo(() => {
    try {
      return JSON.parse(decodeURIComponent(noteIdsParam));
    } catch {
      return [];
    }
  }, [noteIdsParam]);


  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedOptions, setSelectedOptions] = useState([]);
  const [subjectiveAnswer, setSubjectiveAnswer] = useState("");
  const [subjectiveAnswers, setSubjectiveAnswers] = useState(
    Array(parseInt(initialQuestionCount)).fill("")
  );
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [quizProblemName, setQuizProblemName] = useState(
    initialProblemName || "새로운 문제지"
  );

  const [totalQuestions, setTotalQuestions] = useState(
    parseInt(initialQuestionCount) > 0 ? parseInt(initialQuestionCount) : 5
  );

  const [questionStatuses, setQuestionStatuses] = useState(
    Array(totalQuestions).fill(null)
  );
  const [userAnswers, setUserAnswers] = useState(
    Array(totalQuestions).fill(null)
  );

  let parsedQuizList = [];
  try {
    parsedQuizList = JSON.parse(decodeURIComponent(quizList));
  } catch (e) {
    console.error("❌ quizList JSON 파싱 오류:", e, quizList);
    parsedQuizList = [];
  }

  // (자동 유형 판별 및 정답 추출)
  const questions = parsedQuizList.map((quiz) => {
     const { question } = quiz;

    // fix: answer는 quiz.answer가 아닌 correctAnswer[0]에서 추출
    const rawAnswer = Array.isArray(quiz.correctAnswer) ? quiz.correctAnswer[0] : quiz.correctAnswer;
    const safeAnswer = typeof rawAnswer === "string" ? rawAnswer.trim() : null;

    let correctAnswer = [safeAnswer];
    let type = "subjective";
    let solution = quiz.solution || "";
    let options = [];

    if (question.includes("@@")) {
      const [q, answerPartRaw] = question.split("@@");

      // 여기서도 .trim()을 바로 쓰지 않고 안전하게 처리
      const answerPart = typeof answerPartRaw === "string" ? answerPartRaw.trim() : "";

      // 객관식 보기 구분자 포함 시
      if (answerPart.includes("|")) {
        const candidates = answerPart.split("|").map(opt => opt.trim());
        options = candidates;

        if (
          candidates.length === 2 &&
          candidates.includes("O") &&
          candidates.includes("X")
        ) {
          type = "ox";
          // 대문자 정답 추출 시도 + fallback으로 'O'
          correctAnswer = [safeAnswer?.toUpperCase() ?? "O"];
          options = ["O", "X"];
        } else {
          type = "objective";
          // 보기 기반 정답 추론 제거하고 safeAnswer 사용
          correctAnswer = [safeAnswer ?? candidates[0]];
        }
      } else if (["O", "X"].includes(answerPart.toUpperCase())) {
        type = "ox";
        correctAnswer = [safeAnswer?.toUpperCase() ?? answerPart.toUpperCase()];
        options = ["O", "X"];
      } else {
        type = "subjective";
        correctAnswer = [safeAnswer ?? answerPart];
      }

      return {
        ...quiz,
        question: q.trim(),
        correctAnswer,
        solution,
        type,
        options,
      };
    } else {
      return {
        ...quiz,
        correctAnswer: [safeAnswer ?? null],
        solution,
        type,
        options: [],
      };
    }
  });


  console.log("🧪 파싱 전 quizList:", decodeURIComponent(quizList));
  console.log("🧪 파싱 후 questions:", questions);

  const currentRaw = questions[currentQuestionIndex] || {};
  const rawQuestion = currentRaw.question || "";

  let [mainTextRaw, optionsRaw] = rawQuestion.includes("@@")
    ? rawQuestion.split("@@")
    : [rawQuestion, ""];

  const mainText = mainTextRaw.trim().replace(/^[\s\-–—]+/, "");
  const options = optionsRaw ? optionsRaw.split("|") : [];

  const currentQuestion = questions[currentQuestionIndex];
  const questionNavScrollViewRef = useRef(null);
  const inputRef = useRef(null);

  const [nickname, setNickname] = useState("");

  useEffect(() => {
    async function checkLogin() {
      try {
        let token;

        // 플랫폼에 따라 accessToken 조회
        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
        } else {
          token = await SecureStore.getItemAsync("accessToken");
        }

        if (!token) throw new Error("Token not found");

        // /api/validation 호출하여 nickname 받아오기
        const res = await axios.get("http://localhost:8080/api/validation", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        setNickname(res.data.nickname);  // nickname 설정
      } catch (err) {
        console.log(err);
        router.push("/");  // 인증 실패 시 로그인 화면으로
      }
    }

    checkLogin();
  }, []);



  useEffect(() => {
    if (questionNavScrollViewRef.current) {
      const boxWidth = 43 + 10;
      const offset = currentQuestionIndex * boxWidth - width / 2 + boxWidth / 2;
      questionNavScrollViewRef.current.scrollTo({
        x: offset > 0 ? offset : 0,
        animated: true
      });
    }
    const savedAnswer = userAnswers[currentQuestionIndex];
    if (currentQuestion.type === "subjective") {
      setSubjectiveAnswer(subjectiveAnswers[currentQuestionIndex] || "");
    } else {
      setSelectedOptions(savedAnswer || []);
    }

    console.log("🔍 현재 문제 타입:", currentQuestion?.type);

  }, [currentQuestionIndex]);

  const handleOptionPress = (option) => {
    if (isSubmitted) return;
    const updated = [...selectedOptions];
    const index = updated.indexOf(option);
    if (index > -1) {
      updated.splice(index, 1);
    } else {
      updated.push(option);
    }
    setSelectedOptions(updated);
    const updatedAnswers = [...userAnswers];
    updatedAnswers[currentQuestionIndex] = [...updated]; // 배열 복사로 저장
    setUserAnswers(updatedAnswers);
  };

  const handleSubjectiveChange = (text) => {
    setSubjectiveAnswer(text);
    const newAnswers = [...subjectiveAnswers];
    newAnswers[currentQuestionIndex] = text;
    setSubjectiveAnswers(newAnswers);

    const updated = [...userAnswers];
    updated[currentQuestionIndex] = text;
    setUserAnswers(updated);
  };

  // 정답 비교 함수 (대소문자 + 문장 끝 기호 무시)
  const isCorrectAnswer = (answer, correctAnswer) => {
    const normalize = (arr) =>
      Array.isArray(arr)
        ? arr.map((v) =>
            v
              ?.trim()
              .toLowerCase()
              .replace(/[.,!?]+$/, "")  //  문장 끝 .,!? 제거
          ).sort()
        : [arr?.trim().toLowerCase().replace(/[.,!?]+$/, "")];

    const user = normalize(answer);
    const correct = normalize(correctAnswer);

    return (
      user.length === correct.length &&
      user.every((v, i) => v === correct[i])
    );
  };

  const handleNextOrSubmit = () => {
    const updatedAnswers = [...userAnswers];
    const userAnswer =
      currentQuestion.type === "subjective"
        ? subjectiveAnswer
        : selectedOptions;
    updatedAnswers[currentQuestionIndex] = userAnswer;
    setUserAnswers(updatedAnswers);


    const updatedStatuses = [...questionStatuses];
    updatedStatuses[currentQuestionIndex] =
      isCorrectAnswer(userAnswer, currentQuestion.correctAnswer)
        ? "correct"
        : "incorrect";

    setQuestionStatuses(updatedStatuses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finalStatuses = questions.map((q, idx) => {
        const answer = updatedAnswers[idx];
        return isCorrectAnswer(answer, q.correctAnswer)
          ? "correct"
          : "incorrect";
      });

      setQuestionStatuses(finalStatuses);
      setIsSubmitted(true);

      sendResultsToBackend();
    }
  };

  const sendResultsToBackend = async () => {
    try {
      const finalQuizList = questions.map((q, idx) => {
            const userAnswer = userAnswers[idx];
            return {
              ...q,
              correctAnswer: Array.isArray(userAnswer) ? userAnswer : [userAnswer],  // 정답을 배열로
            };
          });
      const res = await fetch("http://localhost:8080/api/quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nickname: nickname,
          quizTitle: quizProblemName,
          noteIds: noteIds,
          quizList: finalQuizList,
        }),
      });

      const result = await res.json();
      console.log("퀴즈 결과 전송 완료:", result);
    } catch (err) {
      console.error("퀴즈 결과 전송 실패:", err);
    }
  };


  const renderOptionStyle = (option) => {
    const isSelected = selectedOptions.includes(option);
    //const isCorrect = isSubmitted && currentQuestion.correctAnswer.includes(option);
    const isCorrect = isSubmitted && currentQuestion.correctAnswer?.map(a => a.trim().toLowerCase()).includes(option.trim().toLowerCase());
    const isWrong =
      isSubmitted &&
      selectedOptions.includes(option) &&
      !currentQuestion.correctAnswer.includes(option);

    return {
      borderWidth: 0.6,
      borderColor: isCorrect
        ? "#72A13F"
        : isWrong
        ? "#C95B51"
        : isSelected && !isSubmitted
        ? "#7A4EC6"
        : "#B493C3",
      backgroundColor: isCorrect
        ? "#E8F2DF"
        : isWrong
        ? "#F4D2CF"
        : isSelected && !isSubmitted
        ? "#F4F0FA"
        : "#FAF8FD",
      borderRadius: 5,
      paddingVertical: 12,
      paddingHorizontal: 15,
      marginBottom: 10
    };
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()} style={styles.backButton}>
            <Ionicons name="chevron-back-outline" size={24} color="#black" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{quizProblemName}</Text>
        </View>

        <View style={styles.questionNavWrapper}>
          <ScrollView
            ref={questionNavScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.questionNavContainer}
          >
            {questions.map((_, i) => {
              const status = questionStatuses[i];
              let bgColor = "#FAF8FD";
              if (isSubmitted) {
                if (status === "correct") bgColor = "#E8F2DF";
                else if (status === "incorrect") bgColor = "#F4D2CF";
              }
              return (
                <TouchableOpacity
                  key={i}
                  onPress={() => setCurrentQuestionIndex(i)}
                  style={{
                    ...styles.questionNavBox,
                    backgroundColor: bgColor,
                    borderColor: currentQuestionIndex === i ? "#7A4EC6" : "#B493C3"
                  }}
                >
                  <Text
                    style={{
                      ...styles.questionNavText,
                      ...(currentQuestionIndex === i && styles.questionNavTextActive)
                    }}
                  >
                    {i + 1}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        <ScrollView style={styles.questionContentContainer} keyboardShouldPersistTaps="handled">
          <Text style={styles.questionText}>
            문제 {currentQuestionIndex + 1}. {mainText}
          </Text>


          {currentQuestion.type === "objective" && currentQuestion.options?.length > 0 && (
            currentQuestion.options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleOptionPress(option)}
                style={renderOptionStyle(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))
          )}

          {currentQuestion.type === "ox" && (
            <>
              <TouchableOpacity
                onPress={() => handleOptionPress("O")}
                style={renderOptionStyle("O")}
              >
                <Text style={styles.optionText}>O</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => handleOptionPress("X")}
                style={renderOptionStyle("X")}
              >
                <Text style={styles.optionText}>X</Text>
              </TouchableOpacity>
            </>
          )}


          {currentQuestion.type === "subjective" && (
            <TextInput
              ref={inputRef}
              style={{
                ...styles.optionBox,
                minHeight: 100,
                textAlignVertical: "top"
              }}
              multiline
              editable={!isSubmitted}
              value={subjectiveAnswer}
              onChangeText={handleSubjectiveChange}
            />
          )}

          {isSubmitted && (
            <View style={styles.solutionBox}>
              <Text style={styles.solutionText}>
                {currentQuestion.solution
                  ? `해설: ${currentQuestion.solution}`
                  : "해당 문제에 대한 해설이 없습니다."}
              </Text>
            </View>
          )}


          <View style={{ height: 100 }} />
        </ScrollView>

        {!isSubmitted ? (
          <TouchableOpacity
            onPress={handleNextOrSubmit}
            style={styles.bottomButton}
          >
            <Text style={styles.bottomButtonText}>
              {currentQuestionIndex === questions.length - 1 ? "정답 확인하기" : "다음"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bottomButtonGroup}>
            <TouchableOpacity
              onPress={() => {
                // 여기에 selectedTypes 배열로 어떤 유형 선택했는지 전달
                router.push({
                  pathname: "/quiz",
                  params: {
                    newQuizName: quizProblemName,
                    subjective: selectedTypes.includes(1) ? "true" : "false",
                    objective: selectedTypes.includes(2) ? "true" : "false",
                    ox: selectedTypes.includes(3) ? "true" : "false"
                  }
                });
              }}
              style={{ ...styles.bottomButton, marginRight: 10, flex: 1 }}
            >
              <Text style={styles.bottomButtonText}>끝내기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              onPress={() => {
                setIsSubmitted(false);
                setQuestionStatuses(Array(totalQuestions).fill(null));
                setUserAnswers(Array(totalQuestions).fill(null));
                setSubjectiveAnswers(Array(totalQuestions).fill(""));
                setCurrentQuestionIndex(0);
                setSelectedOptions([]);
                setSubjectiveAnswer("");
              }}
              style={{ ...styles.bottomButton, flex: 1 }}
            >
              <Text style={styles.bottomButtonText}>다시 풀기</Text>
            </TouchableOpacity>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: "#fff"
  },
  container: {
    flex: 1,
    paddingHorizontal: 20
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 10
  },
  backButton: {
    paddingRight: 10
  },
  headerTitle: {
    fontSize: 20,
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
    fontSize: 16,
    fontWeight: "400",
    color: "#3C3C3C",
    marginBottom: 20
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
  solutionBox: {
    borderWidth: 0.6,
    borderColor: "#B493C3",
    borderRadius: 5,
    padding: 15,
    minHeight: 100,
    backgroundColor: "#FAF8FD",
    marginTop: 20
  },
  solutionText: {
    fontSize: 14,
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
