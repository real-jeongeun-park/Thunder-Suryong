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

const { width } = Dimensions.get("window");

export default function CreatedQuizScreen() {
  const router = useRouter();
  const {
    problemName: initialProblemName,
    questionCount: initialQuestionCount,
    selectedTypes: selectedTypesParam
  } = useLocalSearchParams();

  const selectedTypes = useMemo(() => {
    try {
      return JSON.parse(selectedTypesParam);
    } catch {
      return [2];
    }
  }, [selectedTypesParam]);

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

  const questions = useMemo(() => {
    const types = selectedTypes;
    const mixed = Array.from({ length: totalQuestions }, (_, i) => {
      const type = types[i % types.length];
      if (type === 1) {
        return {
          id: i + 1,
          type: "subjective",
          question: `문제${i + 1}. 주관식 문제내용`,
          correctAnswer: "정답",
          solution: `해설: 주관식 문제 ${i + 1}의 정답은 '정답'입니다.`
        };
      } else if (type === 2) {
        const options = ["보기 1", "보기 2", "보기 3"];
        const correctIndex = Math.floor(Math.random() * 3);
        const correctText = `${options[correctIndex]}`;
        return {
          id: i + 1,
          type: "objective",
          question: `문제${i + 1}. 어쩌고 저쩌고 기계학습이 블라블라`,
          options: options,
          correctAnswer: [correctText],
          solution: `해설: 객관식 문제 ${i + 1}의 정답은 '${correctText}'입니다.`
        };
      } else if (type === 3) {
        // OX 문제 예시
        return {
          id: i + 1,
          type: "ox",
          question: `문제${i + 1}. OX 문제 예시입니다.`,
          options: ["O", "X"],
          correctAnswer: ["O"],
          solution: `해설: OX 문제 ${i + 1}의 정답은 'O'입니다.`
        };
      } else {
        // 기본 객관식 fallback
        const options = ["보기 1", "보기 2", "보기 3"];
        const correctIndex = Math.floor(Math.random() * 3);
        const correctText = `${options[correctIndex]}`;
        return {
          id: i + 1,
          type: "objective",
          question: `문제${i + 1}. 어쩌고 저쩌고 기계학습이 블라블라`,
          options: options,
          correctAnswer: [correctText],
          solution: `해설: 객관식 문제 ${i + 1}의 정답은 '${correctText}'입니다.`
        };
      }
    });
    return mixed.sort((a, b) => a.id - b.id); // 오름차순 정렬
  }, [totalQuestions, selectedTypes]);

  const currentQuestion = questions[currentQuestionIndex];
  const questionNavScrollViewRef = useRef(null);
  const inputRef = useRef(null);

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
    updatedAnswers[currentQuestionIndex] = updated;
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

  const isCorrectAnswer = (answer, correctAnswer) => {
    if (!Array.isArray(answer) || !Array.isArray(correctAnswer)) return false;
    if (answer.length !== correctAnswer.length) return false;
    return [...answer].sort().every((v, i) => v === correctAnswer.sort()[i]);
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
      currentQuestion.type === "subjective"
        ? userAnswer === currentQuestion.correctAnswer
          ? "correct"
          : "incorrect"
        : isCorrectAnswer(userAnswer, currentQuestion.correctAnswer)
        ? "correct"
        : "incorrect";
    setQuestionStatuses(updatedStatuses);

    if (currentQuestionIndex < questions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
    } else {
      const finalStatuses = questions.map((q, idx) => {
        const answer = updatedAnswers[idx];
        return q.type === "subjective"
          ? answer === q.correctAnswer
            ? "correct"
            : "incorrect"
          : isCorrectAnswer(answer, q.correctAnswer)
          ? "correct"
          : "incorrect";
      });
      setQuestionStatuses(finalStatuses);
      setIsSubmitted(true);
    }
  };

  const renderOptionStyle = (option) => {
    const isSelected = selectedOptions.includes(option);
    const isCorrect = isSubmitted && currentQuestion.correctAnswer.includes(option);
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
            <Ionicons name="arrow-back" size={24} color="#A9A9A9" />
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
          <Text style={styles.questionText}>{currentQuestion.question}</Text>

          {currentQuestion.type === "objective" || currentQuestion.type === "ox" ? (
            currentQuestion.options.map((option, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => handleOptionPress(option)}
                style={renderOptionStyle(option)}
              >
                <Text style={styles.optionText}>{option}</Text>
              </TouchableOpacity>
            ))
          ) : (
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
              <Text style={styles.solutionText}>{currentQuestion.solution}</Text>
            </View>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>

        {!isSubmitted ? (
          <View style={styles.bottomButtonGroup}>
            <TouchableOpacity onPress={handleNextOrSubmit} style={{ ...styles.bottomButton, flex: 1 }}>
              <Text style={styles.bottomButtonText}>
                {currentQuestionIndex === questions.length - 1 ? "정답 확인하기" : "다음"}
              </Text>
            </TouchableOpacity>
          </View>
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
    fontSize: 24,
    fontWeight: "400",
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
