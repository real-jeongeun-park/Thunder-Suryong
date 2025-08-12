import { Ionicons } from "@expo/vector-icons";
import { addDays, format, subDays } from "date-fns";
import Checkbox from "expo-checkbox";
import { LinearGradient } from "expo-linear-gradient";
import { useRouter } from "expo-router";
import { useEffect, useState, useRef } from "react";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import SafeAreaWrapper from "../components/SafeAreaWrapper";
import BottomNavigation from "../components/BottomNavigation";

import {
  Animated,
  Image,
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
  TouchableWithoutFeedback,
} from "react-native";
import { Calendar } from "react-native-calendars";
import { differenceInDays, parseISO } from "date-fns";

import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { Dimensions } from "react-native";

export default function HomeScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();
  const [activeTab, setActiveTab] = useState("홈");
  const [date, setDate] = useState(new Date());
  const [calendarVisible, setCalendarVisible] = useState(false);
  const [isExpanded, setIsExpanded] = useState(false);
  const [selectedExam, setSelectedExam] = useState(null);
  const { height: screenHeight } = Dimensions.get("window");
  const { width: screenWidth } = Dimensions.get("window");
  const [sheetHeight] = useState(new Animated.Value(screenHeight * 0.35));
  const [addOpen, setAddOpen] = useState(false);
  const [adding, setAdding] = useState(false);
  const [addForm, setAddForm] = useState({
    subjectId: "",
    week: "",
    title: "",
  });
  const [menuState, setMenuState] = useState({ visible: false, x: 0, y: 0 });
  const anchorRefs = useRef({});
  const [menuTargetId, setMenuTargetId] = useState(null);
  const [confirmOpen, setConfirmOpen] = useState(false);
  const [editOpen, setEditOpen] = useState(false);
  const [editForm, setEditForm] = useState({ title: "", week: "" });
  const [moveOpen, setMoveOpen] = useState(false);
  const [moveDate, setMoveDate] = useState(format(new Date(), "yyyy-MM-dd"));
  const [moving, setMoving] = useState(false);
  const [bubbleText, setBubbleText] = useState("");
  const [userInfo, setUserInfo] = useState(null);
  const [rate, setRate] = useState(null);
  const [plans, setPlans] = useState([]);
  const [entireSubjects, setEntireSubjects] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [suryongName, setSuryongName] = useState("");
  const [finalSuryong, setFinalSuryong] = useState(null);
  const [isDefaultExamExecuted, setIsDefaultExamExecuted] = useState(false);
  const [totalRate, setTotalRate] = useState(null);

  // 남은 날짜에 따른 수룡이 말풍선 메시지
  // 남은 날짜에 따른 수룡이 말풍선 메시지
  // 남은 날짜에 따른 수룡이 말풍선 메시지
  const bubbleMessages = {
    relaxed: [
      "차분히 시작하는 오늘, 정말 멋져요.",
      "작은 하루가 쌓여 큰 힘이 돼요.",
      "편안하게 준비하는 모습이 보기 좋아요.",
      "느긋한 지금이 기초를 다지기 딱 좋은 시간이죠.",
      "꾸준한 하루들이 미래를 비춰줄 거예요.",
      "오늘의 공부가 내일을 가볍게 만들어요.",
      "서두르지 않아도 좋아요, 방향은 맞아요.",
      "천천히 해도 괜찮아요, 한 걸음씩 나아가요.",
      "지금처럼만 하면 충분히 잘하고 있는 거예요.",
      "잠깐 숨 돌리는 시간도 공부 그 자체예요.",
      "노력은 언젠가 꼭 빛나게 마련이에요.",
      "마음 편하게, 쉬엄쉬엄 해도 괜찮아요.",
    ],

    focus: [
      "이 순간의 집중이 나를 한층 더 성장시켜요.",
      "조금만 더 힘내면 큰 결실을 얻을 거예요.",
      "쌓아온 시간들이 든든한 버팀목이 되어줘요.",
      "몰입할 때 내가 가장 멋진 모습이에요.",
      "멈추지 않고 한 걸음 더 나아가는 중이에요.",
      "오늘의 노력이 곧 자랑스러운 추억이 될 거예요.",
      "이미 좋은 흐름을 타고 있어요, 아주 잘 하고 있어요.",
      "남들이 못 본 노력을 내가 쌓고 있는 거죠.",
      "집중력이 최고인 오늘! 응원할게요.",
      "마음이 흔들릴 땐 잠깐 숨 쉬어도 괜찮아요.",
      "아주 조금만 더 힘내면 기대했던 만큼 성장할 수 있어요.",
      "내 속도대로 가면 충분히 멋진 결과가 와요.",
    ],

    urgent: [
      "지금이 마지막 스퍼트! 함께 달려봐요.",
      "여기까지 온 내 노력, 진짜 대단해요.",
      "모든 준비가 결실로 바뀌는 순간이에요.",
      "조금만 더 힘내면 목표에 도달해요.",
      "마지막까지 집중하면 분명 멋진 결과 있을 거예요!",
      "끝까지 내 자신을 믿어봐요, 힘이 돼줄 거예요.",
      "어느새 마지막을 앞두고 있어요, 감회가 남다르죠?",
      "더 나아가기 위한 한 걸음, 지금이 딱 필요할 때예요.",
      '스스로에게 "할 수 있다" 한 마디 건네주세요.',
      "마무리가 곧 최고의 순간이 될 거예요.",
      "포기하지 마세요, 끝까지 응원해요.",
      "조금 지쳤더라도, 잠깐 숨 고르고 앞으로 가요. 잘 하고 있으니까요!",
    ],

    final: [
      "마음 다해 준비한 만큼 반드시 빛날 순간이에요.",
      "그동안 쌓아온 경험이 오늘 빛을 발할 거예요. 잘 하고 있어요!",
      "마지막까지 평온함과 자신감, 꼭 챙겨주세요.",
      "내 노력이 빛나는 날! 응원해요.",
      "모든 준비는 끝났어요, 이제 날개를 펼칠 시간입니다.",
      "마지막 한 걸음도 힘차게 내디뎌요.",
      "수룡이가 응원해요! 이번 시험도, 앞으로의 미래도요!",
      "결과도 중요하지만 과정이 더 의미 있으니까요.",
      "마무리하는 지금이 가장 자랑스러운 순간이에요.",
      "여기까지 온 것만으로도 이미 멋져요.",
      "끝까지 '나'답게, 내 속도로 아름답게 완주해요.",
    ],
  };

  const suryongImages = {
    water33: [
      require("../assets/images/dragon/33_water1.png"),
      require("../assets/images/dragon/33_water2.png"),
    ],
    thunder33: [
      require("../assets/images/dragon/33_thunder1.png"),
      require("../assets/images/dragon/33_thunder2.png"),
    ],
    grass33: [require("../assets/images/dragon/33_grass1.png")],

    water66: [require("../assets/images/dragon/66_water1.png")],
    thunder66: [
      require("../assets/images/dragon/66_thunder1.png"),
      require("../assets/images/dragon/66_thunder2.png"),
      require("../assets/images/dragon/66_thunder3.png"),
    ],
    grass66: [
      require("../assets/images/dragon/66_grass1.png"),
      require("../assets/images/dragon/66_grass2.png"),
    ],

    water100: [require("../assets/images/dragon/100_water1.png")],
    thunder100: [
      require("../assets/images/dragon/100_thunder1.png"),
      require("../assets/images/dragon/100_thunder2.png"),
    ],
    grass100: [require("../assets/images/dragon/100_grass1.png")],
  };

  const floatAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(floatAnim, {
          toValue: -10, // 위로 이동
          duration: 1500,
          useNativeDriver: true,
        }),
        Animated.timing(floatAnim, {
          toValue: 0, // 원래 위치
          duration: 1500,
          useNativeDriver: true,
        }),
      ])
    ).start();
  }, [floatAnim]);

  // 로그인 체크
  // 로그인 체크
  // 로그인 체크
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

  // 남은 날짜에 따른 응원 메시지 설정
  // 남은 날짜에 따른 응원 메시지 설정
  // 남은 날짜에 따른 응원 메시지 설정
  useEffect(() => {
    const getBubbleText = async () => {
      if (!selectedExam) {
        setBubbleText(
          "'새로운 시험 생성' 버튼을 눌러 먼저 시험 정보를 입력해 보세요!"
        );
      } else {
        if (!selectedExam || !selectedExam.startDate) return;

        const diff = differenceInDays(
          parseISO(selectedExam.startDate),
          new Date()
        );

        let group;
        if (diff >= 7) group = "relaxed";
        else if (diff >= 3) group = "focus";
        else if (diff >= 1) group = "urgent";
        else group = "final";

        const messages = bubbleMessages[group];
        const randomIndex = Math.floor(Math.random() * messages.length);
        setBubbleText(messages[randomIndex]);
      }
    };
    if (isDefaultExamExecuted) {
      getBubbleText();
    }
  }, [isDefaultExamExecuted]);

  // 날짜 바꿀 때마다 plans 다시 받아오기
  // 날짜 바꿀 때마다 plans 다시 받아오기
  // 날짜 바꿀 때마다 plans 다시 받아오기
  useEffect(() => {
    if (userInfo !== null) {
      fetchPlans();
    }
  }, [userInfo, date]); // date가 변경될 때마다 계획 다시 불러오기

  // plans 받기
  // plans 받기
  // plans 받기
  async function fetchPlans() {
    try {
      setIsLoading(true);

      // 선택된 날짜를 포맷
      const formattedDate = format(date, "yyyy-MM-dd");

      const res = await axios.post(`${API_BASE_URL}/api/plan/date`, {
        nickname: userInfo.nickname,
        date: formattedDate,
      });

      const result = res.data;

      const transformed = Object.entries(result).map(([subject, todos]) => ({
        id: subject,
        title: subject,
        isExpanded: true,
        checked: false,
        todos: todos.map((todo) => ({
          id: todo.id,
          week: todo.week,
          title: todo.content,
          checked: todo.learned,
        })),
      }));

      setPlans(transformed);
    } catch (err) {
      console.log("계획 불러오기 실패", err);
    } finally {
      setIsLoading(false);
    }
  }

  // 기본 시험 가져오기
  // 기본 시험 가져오기
  // 기본 시험 가져오기
  useEffect(() => {
    async function fetchDefaultExam() {
      try {
        let token;
        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
        } else {
          token = await SecureStore.getItemAsync("accessToken");
        }
        const res = await axios.post(
          `${API_BASE_URL}/api/exam/get`,
          { nickname: userInfo.nickname },
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );

        const data = res.data;
        const defaultIndex = data.defaultExams.findIndex((v) => v === true);

        if (defaultIndex !== -1) {
          setSelectedExam({
            examName: data.examNames[defaultIndex],
            examId: data.examIds[defaultIndex],
            startDate: data.startDates ? data.startDates[defaultIndex] : null,
          });
        } else {
          setSelectedExam(null);
        }
        setIsDefaultExamExecuted(true);
      } catch (err) {
        console.log(
          "기본 시험 정보 불러오기 실패!",
          err.response || err.message || err
        );
        setSelectedExam(null);
      }
    }

    if (userInfo !== null && userInfo.nickname) {
      fetchDefaultExam();
      fetchEntireSubjects();
    }
  }, [userInfo]);

  // 전체 과목 이름 받아옴
  // 전체 과목 이름 받아옴
  // 전체 과목 이름 받아옴
  const fetchEntireSubjects = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/subject/get`, {
        nickname: userInfo.nickname,
      });

      const subjects = res.data.subjectNameList.map((name, idx) => ({
        name: name,
        id: res.data.subjectIdList[idx],
      }));

      setEntireSubjects(subjects);
    } catch (e) {
      console.log("failed to load entire subjects ", e);
    }
  };

  // 수룡이 종류 불러오기
  // 수룡이 종류 불러오기
  // 수룡이 종류 불러오기
  useEffect(() => {
    const getSuryongName = async () => {
      try {
        const res = await axios.post(`${API_BASE_URL}/api/member/getSuryong`, {
          nickname: userInfo.nickname,
        });
        setSuryongName(res.data);
      } catch (e) {
        console.log("failed to load suryong name", e);
        setSuryongName("");
      }
    };
    if (userInfo !== null) {
      getSuryongName();
    }
  }, [userInfo]);

  // 달성률에 따른 이미지 이름 설정
  // 달성률에 따른 이미지 이름 설정
  // 달성률에 따른 이미지 이름 설정
  useEffect(() => {
    const getFinalSuryong = async (item) => {
      const name = suryongName + item;
      const count = suryongImages[name].length;
      const randomIndex = Math.floor(Math.random() * count);
      setFinalSuryong({
        name: name,
        index: randomIndex,
      });

      console.log(name);
      console.log(count);
      console.log(randomIndex);
    };

    if (suryongName && isDefaultExamExecuted) {
      let rate = null;

      if (!selectedExam && !totalRate) {
        rate = 33;
      } else if (selectedExam && totalRate) {
        rate = totalRate;
      }

      if (rate !== null) {
        getFinalSuryong(rate);
      }
    }
  }, [suryongName, isDefaultExamExecuted, totalRate]);

  // 전체 계획 달성률 계산
  // 전체 계획 달성률 계산
  // 전체 계획 달성률 계산
  const getTotalRate = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/plan/getTotalRate`, {
        nickname: userInfo.nickname,
      });
      const data = res.data.toFixed(0);

      let rate;
      if (data < 33) {
        rate = 33;
      } else if (data < 66) {
        rate = 66;
      } else if (data < 100) {
        rate = 100;
      } else {
        rate = 100; // 100 이상일 경우
      }

      setTotalRate(rate);
    } catch (e) {
      console.log("failed to load total achievement rate", e);
    }
  };

  useEffect(() => {
    if (selectedExam) {
      getTotalRate();
    }
  }, [selectedExam]);

  // 오늘의 계획 달성률 계산
  // 오늘의 계획 달성률 계산
  // 오늘의 계획 달성률 계산
  const getAchievementRate = async () => {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/plan/achievement`,
        {
          nickname: userInfo.nickname,
          today: format(new Date(), "yyyy-MM-dd"),
        }
      );
      setRate(response.data.toFixed(0)); // 소수점 표기 x
    } catch (err) {
      console.log("달성률 계산 실패\n", err);
    }
  };

  useEffect(() => {
    if (userInfo !== null) {
      getAchievementRate();
    }
  }, [userInfo]);

  // 메뉴 위치 계산 및 오픈
  // 메뉴 위치 계산 및 오픈
  // 메뉴 위치 계산 및 오픈
  const openMenu = (id) => {
    const ref = anchorRefs.current[id];
    ref?.measureInWindow((x, y, width, height) => {
      const menuWidth = 180; // 아래 스타일 width와 맞추세요
      setMenuState({
        visible: true,
        x: x + width - menuWidth, // 아이콘 오른쪽 정렬
        y: y + height + 8, // 아이콘 아래 약간 띄움
      });
      setMenuTargetId(id);
    });
  };

  // 메뉴 닫기
  const closeMenu = () => setMenuState((s) => ({ ...s, visible: false }));

  // 수정 모달 보여줌
  // 수정 모달 보여줌
  // 수정 모달 보여줌
  const onEdit = () => {
    // 메뉴가 열린 대상(todo)을 plans에서 찾기
    const current = (() => {
      for (const g of plans) {
        const t = g.todos.find((x) => x.id === menuTargetId);
        if (t) return t;
      }
      return null;
    })();

    if (current) {
      setEditForm({
        title: current.title ?? "",
        week: String(current.week ?? ""),
      });
      setEditOpen(true);
    }
    closeMenu();
  };

  // 과목 수정 내용 저장
  // 과목 수정 내용 저장
  // 과목 수정 내용 저장
  const saveEdit = async () => {
    try {
      if (!editForm.title.trim() || !editForm.week.trim()) {
        alert("입력되지 않은 항목이 존재합니다.");
        return;
      }

      const res = axios.post(`${API_BASE_URL}/api/plan/changePlan`, {
        planId: menuTargetId,
        week: editForm.week,
        content: editForm.title,
      });

      await fetchPlans();
      setEditOpen(false);
    } catch (e) {
      console.log("수정 실패", e);
    } finally {
    }
  };

  // 삭제 모달 보여줌
  // 삭제 모달 보여줌
  // 삭제 모달 보여줌
  const onDelete = () => {
    closeMenu();
    setConfirmOpen(true);
  };

  // 화면 모달 보여줌
  // 화면 모달 보여줌
  // 화면 모달 보여줌
  const onMove = () => {
    // 기본값: 현재 화면의 date로 초기화
    setMoveDate(format(date, "yyyy-MM-dd"));
    closeMenu();
    setMoveOpen(true);
  };

  // 계획 삭제
  // 계획 삭제
  // 계획 삭제
  const confirmDelete = async () => {
    try {
      const res = await axios.post(`${API_BASE_URL}/api/plan/deleteByPlanId`, {
        planId: menuTargetId,
      });

      await fetchPlans();
    } catch (e) {
      console.log("삭제 실패", e);
    } finally {
      setConfirmOpen(false);
    }
  };

  const confirmMove = async () => {
    setMoving(true);
    try {
      const res = await axios.post(`${API_BASE_URL}/api/plan/changeDate`, {
        date: moveDate,
        planId: menuTargetId,
      });

      await fetchPlans();
    } catch (e) {
      console.log("이동 실패", e);
    } finally {
      setMoving(false);
      setMoveOpen(false);
    }
  };

  const confirmAdd = async () => {
    setAdding(true);
    try {
      if (!addForm.subjectId || !addForm.title.trim()) return;

      const res = await axios.post(`${API_BASE_URL}/api/plan/createOne`, {
        subjectId: addForm.subjectId,
        week: addForm.week,
        content: addForm.title,
        date: format(date, "yyyy-MM-dd"),
      });

      await fetchPlans();
    } catch (e) {
      console.log("추가 실패", e);
    } finally {
      setAdding(false);
      setAddOpen(false);
    }
  };

  const toggleExpand = (id) => {
    setPlans((prev) =>
      prev.map((plan) =>
        plan.id === id ? { ...plan, isExpanded: !plan.isExpanded } : plan
      )
    );
  };

  const toggleSheet = () => {
    const toValue = isExpanded
      ? screenHeight * 0.35
      : screenHeight * 0.87 - insets.bottom; // safe area bottom 제외
    Animated.timing(sheetHeight, {
      toValue,
      duration: 300,
      useNativeDriver: false,
    }).start();
    setIsExpanded(!isExpanded);
  };

  // 체크 변경 함수
  // 체크 변경 함수
  // 체크 변경 함수
  const handleCheckboxChange = async (planGroupId, todoId, newValue) => {
    try {
      await axios.patch(`${API_BASE_URL}/api/plan/${todoId}/learned`, {
        learned: newValue,
        nickname: userInfo.nickname,
      });
      // 프론트 상태도 업데이트
      setPlans((prevPlans) =>
        prevPlans.map((plan) =>
          plan.id === planGroupId
            ? {
                ...plan,
                todos: plan.todos.map((todo) =>
                  todo.id === todoId ? { ...todo, checked: newValue } : todo
                ),
              }
            : plan
        )
      );
      getAchievementRate();
      getTotalRate();
    } catch (err) {
      console.error("체크박스 상태 변경 실패\n", err);
    }
  };

  return (
    <SafeAreaWrapper backgroundTop="#EFE5FF" backgroundBottom="#ffffffff">
      <View
        style={{
          flex: 1,
        }}
      >
        <LinearGradient colors={["#EFE5FF", "#FFFFFF"]} style={styles.gradient}>
          <View contentContainerStyle={styles.container}>
            <View style={styles.contentWrapper}>
              {userInfo && (
                <View style={{ flexDirection: "row", alignItems: "center" }}>
                  {selectedExam && selectedExam.examName ? (
                    <>
                      <Text style={[styles.title]}>
                        {selectedExam.examName}
                      </Text>
                    </>
                  ) : (
                    <Text style={[styles.title]}>
                      {userInfo.nickname}님, 어서오세요!
                    </Text>
                  )}

                  {selectedExam &&
                    selectedExam.examName &&
                    selectedExam.startDate &&
                    (() => {
                      const diff =
                        differenceInDays(
                          parseISO(selectedExam.startDate),
                          new Date()
                        ) + 1;
                      const displayText =
                        diff === 0
                          ? "D-DAY"
                          : diff > 0
                          ? `D-${diff}`
                          : `D+${Math.abs(diff)}`;

                      return (
                        <View style={[styles.ddayBox, { marginLeft: 12 }]}>
                          <Text style={styles.ddayText}>{displayText}</Text>
                        </View>
                      );
                    })()}
                </View>
              )}

              {/* 상단 버튼 */}
              <View
                style={selectedExam ? styles.topButtons : styles.topButtons2}
              >
                {/* 달성률 Touch 영역 */}
                {selectedExam && (
                  <TouchableOpacity
                    style={styles.achievementRate}
                    onPress={() => {
                      router.push("/progress");
                    }}
                    activeOpacity={0.8}
                  >
                    <View
                      style={{ flexDirection: "row", alignItems: "center" }}
                    >
                      <Text
                        style={{
                          color: "#6c4ed5",
                          fontWeight: "bold",
                          fontSize: 15,
                        }}
                      >
                        오늘 계획 {rate}% 달성!
                      </Text>
                      <Ionicons
                        name="chevron-forward"
                        size={15}
                        color="#6c4ed5"
                        style={{ marginLeft: 4, marginTop: 2 }}
                      />
                    </View>
                  </TouchableOpacity>
                )}
                {/* 시험이 없을 때만 일정 버튼 노출 */}
                {!selectedExam && (
                  <View
                    style={{
                      flexDirection: "row",
                      gap: 10,
                      justifyContent: "flex-end",
                    }}
                  >
                    <TouchableOpacity
                      style={styles.actionButton}
                      onPress={() => {
                        router.push("/exam_schedule");
                      }}
                    >
                      <Text style={styles.buttonText}>새로운 시험 생성</Text>
                    </TouchableOpacity>
                  </View>
                )}
              </View>

              {/* 타이머 + 캐릭터 나란히 배치 */}
              <View style={styles.rowContainer}>
                <TouchableOpacity
                  style={styles.timerButton}
                  onPress={() => router.push("/timer")}
                >
                  <Ionicons name="time-outline" size={30} color="#B491DD" />
                  <Text style={styles.timerText}>Timer</Text>
                </TouchableOpacity>
                {finalSuryong && (
                  <Animated.Image
                    source={
                      suryongImages[finalSuryong.name][finalSuryong.index]
                    }
                    style={[
                      styles.character,
                      {
                        width: screenWidth * 0.65,
                        height: screenHeight * 0.35,
                        transform: [{ translateY: floatAnim }],
                      },
                    ]}
                    resizeMode="contain"
                  />
                )}
              </View>
            </View>
            {/* 말풍선 */}
            {bubbleText && (
              <View style={styles.speechContainer}>
                <View style={styles.bubble}>
                  <Text style={styles.bubbleText}>{bubbleText}</Text>
                </View>
              </View>
            )}
          </View>
        </LinearGradient>

        {/* 드래그 가능한 시트: 높이 애니메이션, 안에 일정 및 달력 UI 포함 */}
        <Animated.View
          style={[styles.sheet, { height: sheetHeight, bottom: 65 }]}
        >
          <TouchableOpacity onPress={toggleSheet}>
            <View style={styles.handleBar} />
          </TouchableOpacity>

          {/* 날짜 선택 및 이동 컨트롤 */}
          <View style={styles.header}>
            <TouchableOpacity onPress={() => setDate(subDays(date, 1))}>
              <Ionicons name="chevron-back" size={20} />
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setCalendarVisible(true)}>
              <Text style={styles.dateText}>
                {format(date, "yyyy년 M월 d일")}
              </Text>
            </TouchableOpacity>
            <TouchableOpacity onPress={() => setDate(addDays(date, 1))}>
              <Ionicons name="chevron-forward" size={20} />
            </TouchableOpacity>
          </View>

          {/* 오늘의 계획 카드 영역 */}
          <ScrollView showsVerticalScrollIndicator={false} style={styles.card}>
            <Text style={styles.toDoTitle}>오늘의 계획</Text>

            {isLoading ? (
              <Text style={{ alignSelf: "center", marginTop: 10 }}>
                불러오는 중...
              </Text>
            ) : !plans || plans.length === 0 ? (
              <Text style={{ alignSelf: "center", marginTop: 10 }}>
                계획이 없습니다.
              </Text>
            ) : (
              [...plans]
                .sort((a, b) => a.id.localeCompare(b.id))
                .map((plan) => (
                  <View key={plan.id}>
                    <View style={styles.planItem}>
                      <Text style={styles.planText}>{plan.title}</Text>
                      <TouchableOpacity onPress={() => toggleExpand(plan.id)}>
                        <Ionicons
                          name={
                            plan.isExpanded ? "chevron-forward" : "chevron-down"
                          }
                          size={16}
                          color="#555"
                        />
                      </TouchableOpacity>
                    </View>

                    {/* 펼쳐진 todo 항목별 체크박스 및 제목 */}
                    {plan.isExpanded && (
                      <View style={styles.subTodoContainer}>
                        {plan.todos.map((todo) => (
                          <View key={todo.id} style={styles.subTodoItem}>
                            <Checkbox
                              color={todo.checked ? "#B491DD" : undefined}
                              value={todo.checked}
                              onValueChange={(newValue) =>
                                handleCheckboxChange(plan.id, todo.id, newValue)
                              }
                            />
                            <View style={styles.subTodoTextContainer}>
                              <Text style={styles.subTodoText}>
                                <Text style={styles.subTodoWeek}>
                                  {todo.week}{" "}
                                </Text>
                                <Text>{todo.title}</Text>
                              </Text>
                            </View>
                            <View
                              ref={(el) => {
                                if (el) anchorRefs.current[todo.id] = el;
                              }}
                              collapsable={false}
                            >
                              <TouchableOpacity
                                onPress={() => openMenu(todo.id)}
                                activeOpacity={0.6}
                              >
                                <Ionicons
                                  name="ellipsis-vertical"
                                  size={16}
                                  color="#866394ff"
                                  style={{ paddingRight: 5 }}
                                />
                              </TouchableOpacity>
                            </View>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                ))
            )}
            <TouchableOpacity
              onPress={() => {
                // 기본 과목(첫 번째 과목)으로 초기화
                const firstSubjectId = plans[0]?.id;
                setAddForm({
                  subjectId: firstSubjectId,
                  week: "",
                  title: "",
                });

                setAddOpen(true);
              }}
              style={{
                backgroundColor: "#E7DDF3",
                paddingHorizontal: 12,
                paddingVertical: 8,
                borderRadius: 10,
                alignSelf: "flex-start",
                marginTop: 5,
              }}
              activeOpacity={0.8}
            >
              <Text style={{ color: "#4A3B73", fontWeight: "bold" }}>
                추가+
              </Text>
            </TouchableOpacity>
          </ScrollView>

          <Modal visible={calendarVisible} transparent animationType="none">
            <View style={styles.modalBackground}>
              <View style={styles.calendarContainer}>
                <Calendar
                  onDayPress={(day) => {
                    setDate(new Date(day.dateString));
                    setCalendarVisible(false);
                  }}
                  markedDates={{
                    [format(date, "yyyy-MM-dd")]: {
                      selected: true,
                      selectedColor: "#B491DD",
                    },
                  }}
                />
                <TouchableOpacity onPress={() => setCalendarVisible(false)}>
                  <Text
                    style={{
                      marginTop: 10,
                      color: "#B491DD",
                      textAlign: "center",
                    }}
                  >
                    닫기
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </Modal>
          <Modal
            transparent
            visible={menuState.visible}
            animationType="none"
            onRequestClose={closeMenu}
          >
            {/* 바깥 터치 시 닫힘 */}
            <TouchableWithoutFeedback onPress={closeMenu}>
              <View style={styles.menuOverlay} />
            </TouchableWithoutFeedback>

            <View
              style={[
                styles.dropdownMenu,
                { top: menuState.y, left: menuState.x },
              ]}
            >
              <TouchableOpacity style={styles.menuItem} onPress={onEdit}>
                <Text style={styles.menuText}>수정</Text>
              </TouchableOpacity>
              <TouchableOpacity style={styles.menuItem} onPress={onDelete}>
                <Text style={styles.menuText}>삭제</Text>
              </TouchableOpacity>
              <TouchableOpacity
                style={[styles.menuItem, { borderBottomWidth: 0 }]}
                onPress={onMove}
              >
                <Text style={[styles.menuText, { color: "rebeccapurple" }]}>
                  다른 날에 하기
                </Text>
              </TouchableOpacity>
            </View>
          </Modal>
          <Modal
            visible={confirmOpen}
            transparent
            animationType="none"
            onRequestClose={() => setConfirmOpen(false)}
          >
            <View style={styles.modalBackground}>
              <View
                style={[styles.calendarContainer, { alignItems: "center" }]}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#333" }}
                >
                  삭제하시겠습니까?
                </Text>
                <Text
                  style={{
                    marginTop: 8,
                    fontSize: 13,
                    color: "#666",
                    textAlign: "center",
                  }}
                >
                  항목을 삭제하면 되돌릴 수 없습니다.
                </Text>

                <View style={{ flexDirection: "row", marginTop: 16, gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setConfirmOpen(false)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: "#eee",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: "#333", fontWeight: "600" }}>
                      취소
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={confirmDelete}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: "#E57373",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      삭제
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={editOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setEditOpen(false)}
          >
            <View style={styles.modalBackground}>
              <View
                style={[styles.calendarContainer, { alignItems: "stretch" }]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#333",
                    alignSelf: "center",
                  }}
                >
                  항목 수정
                </Text>

                <Text style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
                  주차
                </Text>
                <TextInput
                  value={String(editForm.week)}
                  onChangeText={(v) => setEditForm((s) => ({ ...s, week: v }))}
                  keyboardType="numeric"
                  style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                  placeholder="예: 3주차"
                />

                <Text style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
                  내용
                </Text>
                <TextInput
                  value={editForm.title}
                  onChangeText={(v) => setEditForm((s) => ({ ...s, title: v }))}
                  style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                  placeholder="학습 내용"
                />

                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 16,
                    gap: 10,
                    alignSelf: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setEditOpen(false)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: "#eee",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: "#333", fontWeight: "600" }}>
                      취소
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={saveEdit}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: "#6c4ed5",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      저장
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={moveOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setMoveOpen(false)}
          >
            <View style={styles.modalBackground}>
              <View
                style={[styles.calendarContainer, { alignItems: "center" }]}
              >
                <Text
                  style={{ fontSize: 16, fontWeight: "700", color: "#333" }}
                >
                  이동할 날짜를 선택하세요
                </Text>

                <View style={{ marginTop: 12, width: "100%" }}>
                  <Calendar
                    onDayPress={(day) => setMoveDate(day.dateString)}
                    markedDates={{
                      [moveDate]: { selected: true, selectedColor: "#B491DD" },
                    }}
                  />
                </View>

                <View style={{ flexDirection: "row", marginTop: 16, gap: 10 }}>
                  <TouchableOpacity
                    onPress={() => setMoveOpen(false)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: "#eee",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: "#333", fontWeight: "600" }}>
                      취소
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={confirmMove}
                    disabled={moving}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: moving ? "#B9AEE3" : "#6c4ed5",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {moving ? "이동 중..." : "이동"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
          <Modal
            visible={addOpen}
            transparent
            animationType="fade"
            onRequestClose={() => setAddOpen(false)}
          >
            <View style={styles.modalBackground}>
              <View
                style={[styles.calendarContainer, { alignItems: "stretch" }]}
              >
                <Text
                  style={{
                    fontSize: 16,
                    fontWeight: "700",
                    color: "#333",
                    alignSelf: "center",
                  }}
                >
                  일정 추가
                </Text>

                {/* 과목 선택 */}
                <Text style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
                  과목
                </Text>
                <ScrollView
                  horizontal
                  showsHorizontalScrollIndicator={false}
                  style={{ marginTop: 6 }}
                  contentContainerStyle={{ gap: 8 }}
                >
                  {(entireSubjects ?? []).map((p) => {
                    const selected = addForm.subjectId === p.id;
                    return (
                      <TouchableOpacity
                        key={p.id}
                        onPress={() =>
                          setAddForm((s) => ({ ...s, subjectId: p.id }))
                        }
                        style={{
                          paddingVertical: 8,
                          paddingHorizontal: 12,
                          borderRadius: 999,
                          borderWidth: 1,
                          borderColor: selected ? "#6c4ed5" : "#ddd",
                          backgroundColor: selected ? "#F0EBFF" : "#fff",
                        }}
                        activeOpacity={0.8}
                      >
                        <Text
                          style={{
                            color: selected ? "#6c4ed5" : "#444",
                            fontWeight: "600",
                          }}
                        >
                          {p.name}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </ScrollView>

                {/* 주차 */}
                <Text style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
                  주차
                </Text>
                <TextInput
                  value={String(addForm.week)}
                  onChangeText={(v) => setAddForm((s) => ({ ...s, week: v }))}
                  style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                  placeholder="예: 3주차"
                  placeholderTextColor="#797979ff"
                />

                {/* 내용 */}
                <Text style={{ marginTop: 12, fontSize: 12, color: "#666" }}>
                  내용
                </Text>
                <TextInput
                  value={addForm.title}
                  onChangeText={(v) => setAddForm((s) => ({ ...s, title: v }))}
                  style={{
                    marginTop: 6,
                    borderWidth: 1,
                    borderColor: "#ddd",
                    borderRadius: 10,
                    paddingHorizontal: 12,
                    paddingVertical: 10,
                  }}
                  placeholder="학습 내용"
                  placeholderTextColor="#797979ff"
                />

                <View
                  style={{
                    flexDirection: "row",
                    marginTop: 16,
                    gap: 10,
                    alignSelf: "center",
                  }}
                >
                  <TouchableOpacity
                    onPress={() => setAddOpen(false)}
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor: "#eee",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: "#333", fontWeight: "600" }}>
                      취소
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={confirmAdd}
                    disabled={
                      adding || !addForm.subjectId || !addForm.title.trim()
                    }
                    style={{
                      paddingVertical: 10,
                      paddingHorizontal: 16,
                      borderRadius: 10,
                      backgroundColor:
                        adding || !addForm.subjectId || !addForm.title.trim()
                          ? "#B9AEE3"
                          : "#6c4ed5",
                    }}
                    activeOpacity={0.8}
                  >
                    <Text style={{ color: "#fff", fontWeight: "700" }}>
                      {adding ? "추가 중..." : "추가"}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>
            </View>
          </Modal>
        </Animated.View>
        <BottomNavigation />
      </View>
    </SafeAreaWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: "#fff",
    alignItems: "center",
    flex: 1,
    height: "100%",
  },
  title: {
    fontSize: 25,
    fontWeight: "bold",
    //marginTop: "10%",
    marginBottom: 10,
    alignSelf: "flex-start",
  },
  topButtons: {
    flexDirection: "row",
    //justifyContent: "flex-end",
    width: "100%",
    //gap: 10,
    marginBottom: 10,
    //alignSelf: "flex-end",
  },
  topButtons2: {
    flexDirection: "row",
    justifyContent: "flex-end",
    width: "100%",
    //gap: 10,
    marginBottom: 10,
    //alignSelf: "flex-end",
  },
  achievementRate: {
    //backgroundColor: "#e5ddff",
    paddingVertical: 8,
    paddingHorizontal: 5,
    alignSelf: "flex-start",
  },
  actionButton: {
    backgroundColor: "#E7DDF3",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: 10,
  },
  buttonText: {
    color: "#4A3B73",
    fontWeight: "bold",
  },
  rowContainer: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    width: "100%",
    marginBottom: 20,
  },
  timerButton: {
    flexDirection: "column",
    alignItems: "center",
    backgroundColor: "#F6F0FF",
    padding: 10,
    borderRadius: 20,
  },
  character: {
    //width: 250,
    //height: 250,
    marginTop: 20,
  },
  speechContainer: {
    position: "absolute",
    left: 20, // 왼쪽으로 붙이기
    bottom: 60, // 수룡이 위쪽으로 당기기
    flexDirection: "row",
    alignItems: "center",
    zIndex: 10, // 수룡이 위에 보이도록
  },
  bubble: {
    backgroundColor: "#fff",
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 16,
    maxWidth: 230,

    // 입체감 있는 그림자
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.25,
    shadowRadius: 6,
    elevation: 6,

    // 살짝 테두리로 입체감 보완
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.05)",
  },
  bubbleText: {
    fontSize: 14,
    color: "#5b5b5b",
    fontWeight: "600",
  },
  timerText: {
    marginTop: 4,
    color: "#B491DD",
    fontWeight: "500",
  },
  gradient: {
    width: "100%",
    height: "100%",
  },
  contentWrapper: {
    paddingHorizontal: 20,
    paddingTop: 30,
  },
  sheet: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    backgroundColor: "#f4edff",
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
    padding: 16,
  },
  handleBar: {
    width: 40,
    height: 6,
    borderRadius: 3,
    backgroundColor: "#D0D4DB",
    marginBottom: 12,
    alignSelf: "center",
  },
  header: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 10,
    marginBottom: 10,
  },
  dateText: {
    fontSize: 16,
    fontWeight: "bold",
    color: "#6c4ed5",
  },
  card: {
    backgroundColor: "#f5f0ff",
    borderRadius: 20,
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 5,
  },
  toDoTitle: {
    fontSize: 18,
    fontWeight: "bold",
    alignSelf: "center",
    marginBottom: 12,
  },
  planItem: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 8,
    paddingHorizontal: 4,
    backgroundColor: "#faf5ff",
    borderRadius: 12,
    marginBottom: 8,
  },
  planText: {
    marginLeft: 8,
    fontSize: 16,
    flex: 1,
  },
  subTodoContainer: {
    marginLeft: 10,
    marginTop: 4,
  },
  subTodoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
  },
  subTodoTextContainer: {
    flex: 1,
    marginLeft: 15,
    marginRight: 10,
  },
  subTodoWeek: {
    fontSize: 14,
    color: "#333",
    fontWeight: "500",
    flexShrink: 0,
  },
  subTodoText: {
    flexWrap: "wrap",
    flexShrink: 1,
  },
  modalBackground: {
    flex: 1,
    backgroundColor: "#00000088",
    justifyContent: "center",
    alignItems: "center",
  },
  calendarContainer: {
    backgroundColor: "white",
    borderRadius: 16,
    padding: 20,
    width: "90%",
    alignItems: "center",
  },
  bottomNav: {
    flexDirection: "row",
    justifyContent: "space-around",
    backgroundColor: "#fff",
    borderTopWidth: 1,
    borderColor: "#eee",
  },
  navItem: {
    alignItems: "center",
    justifyContent: "center",
    flex: 1,
  },
  navText: {
    fontSize: 12,
  },
  navTextInactive: {
    color: "#ccc",
  },
  navTextActive: {
    color: "#000",
    fontWeight: "bold",
  },
  dot: {
    width: 12,
    height: 12,
    borderRadius: 4,
    marginBottom: 8,
  },
  dotActive: {
    backgroundColor: "#222",
  },
  dotInactive: {
    backgroundColor: "#ccc",
  },
  ddayBox: {
    backgroundColor: "#ae9dccff", // 예: 빨간색 박스
    paddingVertical: 6,
    paddingHorizontal: 12,
    borderRadius: 8,
    alignSelf: "flex-start", // 텍스트 너비만큼 박스 크기 조정
    //marginTop: "10%",
  },
  ddayText: {
    color: "#fff", // 흰색 텍스트
    fontWeight: "bold",
    fontSize: 16,
  },
  menuOverlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "transparent",
  },
  dropdownMenu: {
    position: "absolute",
    width: 180,
    backgroundColor: "#fff",
    borderRadius: 12,
    paddingVertical: 6,
    // 그림자
    shadowColor: "#000",
    shadowOpacity: 0.15,
    shadowRadius: 8,
    shadowOffset: { width: 0, height: 4 },
    elevation: 8,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  menuItem: {
    paddingVertical: 12,
    paddingHorizontal: 14,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.08)",
  },
  menuText: {
    fontSize: 15,
    color: "#333",
    fontWeight: "400",
    marginLeft: 5,
  },
});
