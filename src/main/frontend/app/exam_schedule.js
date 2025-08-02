import { useState, useEffect } from "react";
import { useRouter } from "expo-router";
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  FlatList,
  Platform,
} from "react-native";
import { format, addMonths, subMonths, startOfMonth } from "date-fns";
import { Calendar } from "react-native-calendars";
import Ionicons from "react-native-vector-icons/Ionicons";

import axios from "axios";
import { API_BASE_URL } from "../src/constants";
import * as SecureStore from "expo-secure-store";

import { useData } from "@/context/DataContext";

export default function ExamDatePicker() {
  const router = useRouter();
  const [selectedDate, setSelectedDate] = useState(null);
  const [monthList, setMonthList] = useState([startOfMonth(new Date())]);
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);

  const { setData } = useData();

  const [userInfo, setUserInfo] = useState(null);

  useEffect(() => {
    const checkLogin = async () => {
      try {
        let token;

        if (Platform.OS === "web") {
          token = localStorage.getItem("accessToken");
        } else {
          // 앱
          token = await SecureStore.getItemAsync("accessToken");
        }

        if (!token) throw new Error("Token not found");

        const res = await axios.get(`${API_BASE_URL}/api/validation`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      } catch (e) {
        console.log(e);
        setUserInfo(null);
        router.push("/"); // 처음으로 돌아감
      }
    };

    checkLogin();
  }, []);

  const handleDateSelect = (dateString) => {
    setSelectedDate(dateString);

    if (!startDate || (startDate && endDate)) {
      setStartDate(dateString);
      setEndDate(null);
    } else {
      if (new Date(dateString) < new Date(startDate)) {
        setStartDate(dateString);
      } else {
        setEndDate(dateString);
      }
    }
  };

  const getMarkedDates = () => {
    // 1. 현재 달(혹은 표시되는 달들)의 모든 날짜를 구함
    const getAllDates = (months) => {
      let dates = [];
      months.forEach((monthStart) => {
        let current = new Date(monthStart);
        let nextMonth = new Date(monthStart);
        nextMonth.setMonth(nextMonth.getMonth() + 1);
        while (current < nextMonth) {
          dates.push(current.toISOString().slice(0, 10));
          current.setDate(current.getDate() + 1);
        }
      });
      return dates;
    };

    // 예시: 표시되는 달이 7월, 8월이라면
    const allDates = getAllDates([new Date(2025, 6, 1), new Date(2025, 7, 1)]);

    const marks = {};

    // 2. 모든 날짜에 대해 토·일 색상 지정
    allDates.forEach((dateStr) => {
      const day = new Date(dateStr).getDay();
      if (day === 0) {
        // 일요일
        marks[dateStr] = { textColor: "red" };
      } else if (day === 6) {
        // 토요일
        marks[dateStr] = { textColor: "blue" };
      }
    });

    // 3. 기간 마킹(시작~종료)
    if (startDate) {
      marks[startDate] = {
        ...(marks[startDate] || {}),
        startingDay: true,
        color: "#B491DD",
        textColor: marks[startDate]?.textColor || "#fff",
      };
    }
    if (endDate) {
      marks[endDate] = {
        ...(marks[endDate] || {}),
        endingDay: true,
        color: "#B491DD",
        textColor: marks[endDate]?.textColor || "#fff",
      };
    }
    if (startDate && endDate) {
      let current = new Date(startDate);
      current.setDate(current.getDate() + 1);
      const last = new Date(endDate);
      while (current < last) {
        const dateStr = current.toISOString().slice(0, 10);
        marks[dateStr] = {
          ...(marks[dateStr] || {}),
          color: "#E5DFF5",
          textColor: marks[dateStr]?.textColor || "#000",
        };
        current.setDate(current.getDate() + 1);
      }
    }

    return marks;
  };

  const loadMoreMonths = (direction) => {
    const lastMonth =
      direction === "next"
        ? addMonths(monthList[monthList.length - 1], 1)
        : subMonths(monthList[0], 1);

    setMonthList((prev) =>
      direction === "next" ? [...prev, lastMonth] : [lastMonth, ...prev]
    );
  };

  const renderMonth = ({ item }) => {
    const monthKey = format(item, "yyyy-MM");
    const monthStart = format(item, "yyyy-MM-01");

    return (
      <View style={styles.monthContainer}>
        <Text style={styles.monthLabel}>{format(item, "yyyy.MM")}</Text>
        <Calendar
          current={monthStart}
          onDayPress={(day) => {
            handleDateSelect(day.dateString);
          }}
          hideArrows={true}
          hideDayNames={true}
          renderHeader={() => null}
          hideExtraDays={true}
          markingType={"period"}
          markedDates={getMarkedDates()}
          theme={{
            todayTextColor: "#000000ff",
            //todayButtonFontWeight: "normal",
            arrowColor: "#000",
            textSectionTitleColor: "#000",
            monthTextColor: "#000",
            selectedDayBackgroundColor: "#000",
            selectedDayTextColor: "#fff",
          }}
        />
        <View style={styles.divider} />
      </View>
    );
  };

  return (
    <View style={styles.container}>
      <View style={styles.backButtonContainer}>
        <TouchableOpacity
          onPress={() => {
            router.back();
          }}
        >
          <Ionicons name="chevron-back" size={32} color="#535353" />
        </TouchableOpacity>
      </View>
      <View style={styles.headerContainer}>
        <View style={styles.headerRow}>
          <Text style={styles.header}>
            {!startDate
              ? "시험 시작 일자를\n선택해 주세요."
              : !endDate
              ? "시험 종료 일자를\n선택해 주세요."
              : "시험 기간이\n맞나요?\n"}
          </Text>
          {startDate && (
            <Text style={styles.selectedDateText}>
              {format(new Date(startDate), "yyyy.MM.dd")} ~{" "}
              {endDate ? format(new Date(endDate), "yyyy.MM.dd") : ""}
            </Text>
          )}
        </View>
        <View style={styles.weekRow}>
          {["일", "월", "화", "수", "목", "금", "토"].map((day, idx) => (
            <Text key={idx} style={styles.dayText}>
              {day}
            </Text>
          ))}
        </View>
      </View>
      <FlatList
        data={monthList}
        keyExtractor={(item) => item.toString()}
        renderItem={renderMonth}
        onEndReached={() => loadMoreMonths("next")}
        onEndReachedThreshold={0.8}
        onScrollBeginDrag={() => loadMoreMonths("prev")}
        style={styles.monthList}
        showsVerticalScrollIndicator={false}
      />
      <TouchableOpacity
        style={styles.button}
        onPress={() => {
          if (!startDate || !endDate) {
            alert("시작일과 종료일을 모두 선택해주세요.");
            return;
          } else {
            setData((prev) => ({
              ...prev,
              startDate: startDate,
              endDate: endDate,
            }));
            router.push("/exam_schedule2");
          }
        }}
      >
        <Text style={styles.buttonText}>입력 완료</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  backButtonContainer: {
    position: "absolute",
    top: 10,
    left: 10,
    zIndex: 10,
  },
  container: {
    flex: 1,
    backgroundColor: "#EFE5FF",
    //paddingTop: 60,
  },
  headerContainer: {
    //paddingBottom: 20,
    paddingTop: 60,
    //marginBottom: 10,
    backgroundColor: "#EFE5FF",
  },
  header: {
    fontSize: 30,
    fontWeight: "bold",
    textAlign: "left",
    //paddingLeft: 20,
    marginBottom: 20,
    paddingBottom: 10,
    color: "#535353",
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-end",
    paddingHorizontal: 30,
    marginBottom: 10,
  },
  selectedDateText: {
    fontSize: 18,
    color: "#535353",
    fontWeight: "500",
    paddingBottom: 8,
  },

  weekRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    paddingHorizontal: 30,
    marginRight: 10,
    marginBottom: 10,
  },
  dayText: {
    flex: 1,
    textAlign: "center",
    color: "#535353",
  },
  divider: {
    height: 1,
    backgroundColor: "#D3D3D3",
    marginTop: 20,
    marginBottom: 10,
    marginHorizontal: 10, // 원하는 만큼 좌우 여백
  },
  monthList: {
    borderRadius: 30,
    backgroundColor: "#fff",
    paddingTop: 20,
  },
  monthContainerContainer: {
    paddingVertical: 20,
  },
  monthContainer: {
    marginBottom: 20,
    paddingHorizontal: 20,
  },
  monthLabel: {
    fontSize: 18,
    fontWeight: "600",
    marginBottom: 5,
    color: "#535353",
    paddingLeft: 10,
  },
  button: {
    backgroundColor: "#000",
    padding: 20,
    borderRadius: 8,
    margin: 20,
    position: "absolute",
    bottom: 30,
    shadowColor: "#000",
    zIndex: 100,
    alignSelf: "center",
    width: "90%",
  },
  buttonText: {
    color: "#fff",
    textAlign: "center",
    fontWeight: "bold",
    fontSize: 16,
  },
});
