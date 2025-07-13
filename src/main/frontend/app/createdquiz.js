import React, { useState, useEffect, useRef, useMemo } from "react";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  Dimensions,
} from "react-native";
import { Ionicons } from "@expo/vector-icons";
import { useRouter, useLocalSearchParams } from "expo-router";

const { width } = Dimensions.get("window");

export default function CreatedQuizScreen() {
  const router = useRouter();
  const {
    problemName: initialProblemName,
    questionCount: initialQuestionCount,
  } = useLocalSearchParams();

  // 현재 문제 인덱스
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  // 사용자가 선택한 보기
  const [selectedOption, setSelectedOption] = useState(null);
  // 제출 여부 (정답 확인 완료)
  const [isSubmitted, setIsSubmitted] = useState(false);
  // 문제 제목
  const [quizProblemName, setQuizProblemName] = useState(
    initialProblemName || "새로운 문제지"
  );
  // 총 문제 수
  const [totalQuestions, setTotalQuestions] = useState(
    parseInt(initialQuestionCount) > 0 ? parseInt(initialQuestionCount) : 5
  );

  // 문제별 상태: "correct", "incorrect", null
  const [questionStatuses, setQuestionStatuses] = useState(
    Array(totalQuestions).fill(null)
  );
  // 문제별 유저 답안
  const [userAnswers, setUserAnswers] = useState(
    Array(totalQuestions).fill(null)
  );

  // 문제 리스트 생성 (옵션과 정답 포함)
  const questions = useMemo(() => {
    return Array.from({ length: totalQuestions }, (_, i) => {
      const options = ["보기 1", "보기 2", "보기 3", "보기 4"];
      const correctIndex = Math.floor(Math.random() * 4);
      const correctText = `${options[correctIndex]}_정답`;
      const formattedOptions = options.map((opt, idx) =>
        idx === correctIndex ? correctText : opt
      );
      return {
        id: i + 1,
        question: `문제${i + 1}. 문제내용`,
        options: formattedOptions,
        correctAnswer: correctText,
        solution: `해설: 문제 ${i + 1}의 정답은 '${correctText}'입니다.`,
      };
    });
  }, [totalQuestions]);

  const currentQuestion = questions[currentQuestionIndex];
  const questionNavScrollViewRef = useRef(null);

  // 문제 번호 스크롤 위치 조절 및 현재 선택 답 복원
  useEffect(() => {
    if (questionNavScrollViewRef.current) {
      const boxWidth = 43 + 10;
      const offset =
        currentQuestionIndex * boxWidth - width / 2 + boxWidth / 2;
      questionNavScrollViewRef.current.scrollTo({
        x: offset > 0 ? offset : 0,
        animated: true,
      });
    }
    setSelectedOption(userAnswers[currentQuestionIndex]);
  }, [currentQuestionIndex, userAnswers]);

  // 보기 선택 시
  const handleOptionPress = (option) => {
    if (isSubmitted) return; // 제출 후 선택 불가
    setSelectedOption(option);
    const updated = [...userAnswers];
    updated[currentQuestionIndex] = option;
    setUserAnswers(updated);
  };

  // 다음 문제 or 정답 확인 or 다시 풀기/끝내기 버튼 동작
  const handleNextOrSubmit = () => {
    if (!isSubmitted) {
      // 정답 확인 전: 현재 문제 선택지 저장 및 상태 갱신
      if (selectedOption !== null) {
        const updatedStatuses = [...questionStatuses];
        updatedStatuses[currentQuestionIndex] =
          selectedOption === currentQuestion.correctAnswer ? "correct" : "incorrect";
        setQuestionStatuses(updatedStatuses);
      }

      if (currentQuestionIndex < questions.length - 1) {
        // 다음 문제로 이동
        setCurrentQuestionIndex(currentQuestionIndex + 1);
        setSelectedOption(userAnswers[currentQuestionIndex + 1]);
      } else {
        // 마지막 문제 정답 확인
        const finalStatuses = questions.map((q, idx) => {
          const selected = userAnswers[idx];
          return selected === q.correctAnswer ? "correct" : "incorrect";
        });
        setQuestionStatuses(finalStatuses);
        setIsSubmitted(true);
      }
    }
  };

  // 다시 풀기 버튼 클릭시 초기화
  const handleRetry = () => {
    setCurrentQuestionIndex(0);
    setSelectedOption(null);
    setIsSubmitted(false);
    setQuestionStatuses(Array(totalQuestions).fill(null));
    setUserAnswers(Array(totalQuestions).fill(null));
  };

  // 끝내기 버튼 클릭시 quiz.js로 이동
  const handleFinish = () => {
    router.push("/quiz");
  };

  // 문제 번호 선택 시 문제 이동
  const goToQuestion = (idx) => {
    setCurrentQuestionIndex(idx);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <View style={styles.container}>
        {/* 헤더 */}
        <View style={styles.header}>
          <TouchableOpacity
            onPress={() => router.back()}
            style={styles.backButton}
          >
            <Ionicons name="arrow-back" size={24} color="#A9A9A9" />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>{quizProblemName}</Text>
        </View>

        {/* 문제 번호 영역 */}
        <View style={styles.questionNavWrapper}>
          <ScrollView
            ref={questionNavScrollViewRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            contentContainerStyle={styles.questionNavContainer}
          >
            {questions.map((_, i) => (
              <TouchableOpacity
                key={i}
                style={[
                  styles.questionNavBox,
                  currentQuestionIndex === i && styles.questionNavBoxActive,
                  isSubmitted &&
                    questionStatuses[i] === "correct" &&
                    styles.questionNavBoxCorrect,
                  isSubmitted &&
                    questionStatuses[i] === "incorrect" &&
                    styles.questionNavBoxIncorrect,
                ]}
                onPress={() => goToQuestion(i)}
              >
                <Text
                  style={[
                    styles.questionNavText,
                    currentQuestionIndex === i && styles.questionNavTextActive,
                  ]}
                >
                  {i + 1}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>

        {/* 문제 내용 및 보기 */}
        <ScrollView style={styles.questionContentContainer}>
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {currentQuestion.options.map((option, idx) => {
            const isSelected = selectedOption === option;
            const isCorrect = isSubmitted && option === currentQuestion.correctAnswer;
            const isWrong =
              isSubmitted &&
              userAnswers[currentQuestionIndex] === option &&
              option !== currentQuestion.correctAnswer;

            return (
              <TouchableOpacity
                key={idx}
                style={[
                  styles.optionBox,
                  isSelected && !isSubmitted && styles.optionBoxSelected,
                  isCorrect && styles.optionBoxCorrectView,
                  isWrong && styles.optionBoxIncorrectView,
                ]}
                onPress={() => handleOptionPress(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            );
          })}

          {/* 정답 제출 후 해설 노출 */}
          {isSubmitted && (
            <View style={styles.solutionBox}>
              <Text style={styles.solutionText}>{currentQuestion.solution}</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {/* 하단 버튼 영역 */}
        {!isSubmitted ? (
          <TouchableOpacity
            style={styles.bottomButton}
            onPress={handleNextOrSubmit}
            disabled={selectedOption === null}
          >
            <Text style={styles.bottomButtonText}>
              {currentQuestionIndex === questions.length - 1
                ? "정답 확인하기"
                : "다음"}
            </Text>
          </TouchableOpacity>
        ) : (
          <View style={styles.bottomButtonGroup}>
            <TouchableOpacity
              style={[styles.bottomButton, { marginRight: 10, flex: 1 }]}
              onPress={handleFinish}
            >
              <Text style={styles.bottomButtonText}>끝내기</Text>
            </TouchableOpacity>
            <TouchableOpacity
              style={[styles.bottomButton, { flex: 1 }]}
              onPress={handleRetry}
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
    backgroundColor: "#fff",
  },
  container: {
    flex: 1,
    paddingHorizontal: 20,
  },
  header: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    paddingTop: 10,
  },
  backButton: {
    paddingRight: 10,
  },
  headerTitle: {
    fontSize: 24,
    fontWeight: "400",
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
    backgroundColor: "rgba(170, 150, 204, 0.19)",
    borderWidth: 0.6,
    borderColor: "#B493C3",
  },
  questionNavBoxActive: {
    borderColor: "#7A4EC6",
  },
  questionNavBoxIncorrect: {
    backgroundColor: "rgba(197, 18, 0, 0.19)",
    borderColor: "#C95B51",
  },
  questionNavBoxCorrect: {
    backgroundColor: "rgba(137, 186, 85, 0.19)",
    borderColor: "#72A13F",
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
    fontSize: 16,
    fontWeight: "400",
    color: "#3C3C3C",
    marginBottom: 20,
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
  optionBoxSelected: {
    backgroundColor: "#D2B7E5",
    borderColor: "#7A4EC6",
  },
  optionBoxCorrectView: {
    backgroundColor: "rgba(232, 242, 223, 0.59)",
    borderColor: "#72A13F",
  },
  optionBoxIncorrectView: {
    backgroundColor: "rgba(244, 210, 207, 0.34)",
    borderColor: "#C95B51",
  },
  optionText: {
    fontSize: 16,
    fontWeight: "400",
    color: "#3C3C3C",
  },
  solutionBox: {
    borderWidth: 0.6,
    borderColor: "#B493C3",
    borderRadius: 5,
    padding: 15,
    minHeight: 100,
    backgroundColor: "#FAF8FD",
    marginTop: 20,
  },
  solutionText: {
    fontSize: 14,
    color: "#3C3C3C",
  },
  bottomButton: {
    backgroundColor: "#262626",
    borderRadius: 10,
    height: 53,
    justifyContent: "center",
    alignItems: "center",
    position: "relative",
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
