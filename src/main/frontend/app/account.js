// app/account.js
import React, { useState, useEffect } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Platform,
  Alert,
  Modal,
  TextInput,
} from "react-native";
import { useRouter } from "expo-router";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import axios from "axios";
import * as SecureStore from "expo-secure-store";
import { Ionicons } from "@expo/vector-icons";
import { API_BASE_URL } from "../src/constants";

export default function AccountScreen() {
  const router = useRouter();
  const insets = useSafeAreaInsets();

  const [userInfo, setUserInfo] = useState(null);

  // 모달 상태
  const [showPwModal, setShowPwModal] = useState(false);
  const [showWithdrawModal, setShowWithdrawModal] = useState(false);

  // 비밀번호 변경 입력값
  const [currentPw, setCurrentPw] = useState("");
  const [newPw, setNewPw] = useState("");
  const [newPw2, setNewPw2] = useState("");

  useEffect(() => {
    (async () => {
      try {
        let token;
        if (Platform.OS === "web") token = localStorage.getItem("accessToken");
        else token = await SecureStore.getItemAsync("accessToken");
        if (!token) throw new Error("No token");

        const res = await axios.get(`${API_BASE_URL}/api/validation`, {
          headers: { Authorization: `Bearer ${token}` },
        });
        setUserInfo(res.data);
      } catch (e) {
        console.log(e);
        router.replace("/");
      }
    })();
  }, []);

  // 플랫폼별 alert 함수 정의
  const showAlert = (title, message) => {
    if (Platform.OS === "web") {
      window.alert(`${title}\n${message}`);
    } else {
      showAlert(title, message);
    }
  };

  // 로그아웃
  const handleLogout = async () => {
    try {
      if (Platform.OS === "web") localStorage.removeItem("accessToken");
      else await SecureStore.deleteItemAsync("accessToken");
      router.replace("/");
    } catch (e) {
      console.log(e);
      showAlert("오류", "로그아웃 중 문제가 발생했습니다.");
    }
  };

  // 비밀번호 변경
  const handleChangePassword = async () => {
    if (!currentPw || !newPw || !newPw2) {
      showAlert("안내", "모든 항목을 입력해주세요.");
      return;
    }
    if (newPw !== newPw2) {
      showAlert("안내", "새 비밀번호가 일치하지 않습니다.");
      return;
    }

    try {
        // JWT 토큰 가져오기
        const token = Platform.OS === "web"
          ? localStorage.getItem("accessToken")
          : await SecureStore.getItemAsync("accessToken");

        // 백엔드에 POST 요청 보내기
        await axios.post(`${API_BASE_URL}/api/member/changePassword`, {
          currentPassword: currentPw,
          newPassword: newPw,
        }, {
          headers: { Authorization: `Bearer ${token}` }
        });

        // 성공 시 모달 닫기 + 메시지 출력
        setTimeout(() => {
          showAlert("완료", "비밀번호가 변경되었습니다.");
          setShowPwModal(false);
          setCurrentPw("");
          setNewPw("");
          setNewPw2("");
        }, 100);
    } catch (e) {
      showAlert("오류", e.response.data);
      console.log(e);
    }
  };

  // 회원 탈퇴
  const handleWithdraw = async () => {
    try {
      // JWT 토큰 가져오기
      const token = Platform.OS === "web"
        ? localStorage.getItem("accessToken")
        : await SecureStore.getItemAsync("accessToken");

      // 백엔드에 DELETE 요청
      await axios.delete(`${API_BASE_URL}/api/member/withdraw`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      // 탈퇴 성공 시 토큰 삭제 + 메인화면 이동
      if (Platform.OS === "web") {
        localStorage.removeItem("accessToken");
      } else {
        await SecureStore.deleteItemAsync("accessToken");
      }

      setShowWithdrawModal(false);

      setTimeout(() => {
        showAlert("탈퇴 완료", "회원 탈퇴가 정상적으로 처리되었습니다.");
        router.replace("/");
      }, 100);

        } catch (e) {
          console.log(e);
          showAlert("오류", "회원 탈퇴에 실패했습니다.");
        }
      };


  return (
    <View style={{ flex: 1, backgroundColor: "#fff" }}>
      {/* 상단 헤더 (iPhone notch 피해서 살짝 아래) */}
      <View style={[styles.header, { marginTop: insets.top + 8 }]}>
        <TouchableOpacity onPress={() => router.back()} style={styles.backBtn}>
          <Ionicons name="chevron-back" size={24} color="#222" />
        </TouchableOpacity>
        <Text style={styles.headerTitle}>계정 정보</Text>
      </View>

      <ScrollView contentContainerStyle={styles.container}>
        {/* 계정 정보 카드 */}
        <View style={styles.card}>
          <Text style={styles.label}>이메일</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>
              {userInfo?.email || "@현재 사용자의 이메일"}
            </Text>
          </View>
          <Text style={styles.helperTextDanger}>
            죄송합니다. 사용중인 이메일은 수정 불가합니다.
          </Text>

          <View style={{ height: 16 }} />

          <Text style={styles.label}>비밀번호</Text>
          <View style={styles.inputDisabled}>
            <Text style={styles.inputDisabledText}>********</Text>
          </View>

          <TouchableOpacity
            style={styles.linkRight}
            onPress={() => setShowPwModal(true)}
          >
            <Text style={styles.linkText}>비밀번호 수정하기 &gt;</Text>
          </TouchableOpacity>
        </View>

        <View style={{ height: 36 }} />

        {/* 로그아웃 */}
        <TouchableOpacity style={styles.primaryBtn} onPress={handleLogout}>
          <Text style={styles.primaryBtnText}>로그아웃</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* 하단 중앙: 회원 탈퇴하기 */}
      <View style={[styles.footer, { paddingBottom: Math.max(12, insets.bottom) }]}>
        <TouchableOpacity onPress={() => setShowWithdrawModal(true)}>
          <Text style={styles.withdrawText}>회원 탈퇴하기</Text>
        </TouchableOpacity>
      </View>

      {/* ===== 비밀번호 변경 모달 ===== */}
      <Modal transparent visible={showPwModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <Text style={styles.modalTitle}>비밀번호를 변경하시겠습니까?</Text>

            <TextInput
              style={styles.modalInput}
              placeholder="@현재 사용자의 비밀번호를 입력해주세요."
              secureTextEntry
              value={currentPw}
              onChangeText={setCurrentPw}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="@새로운 비밀번호를 입력해주세요."
              secureTextEntry
              value={newPw}
              onChangeText={setNewPw}
            />
            <TextInput
              style={styles.modalInput}
              placeholder="@동일한 비밀번호를 입력해주세요."
              secureTextEntry
              value={newPw2}
              onChangeText={setNewPw2}
            />

            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setShowPwModal(false)}>
                <Text style={styles.cancelBtn}>취소</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleChangePassword}>
                <Text style={styles.confirmBtn}>수정</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* ===== 회원 탈퇴 모달 ===== */}
      <Modal transparent visible={showWithdrawModal} animationType="fade">
        <View style={styles.modalOverlay}>
          <View style={styles.modalContentSmall}>
            <Text style={styles.modalTitle}>회원 탈퇴하시겠습니까?</Text>
            <View style={styles.modalBtnRow}>
              <TouchableOpacity onPress={() => setShowWithdrawModal(false)}>
                <Text style={styles.cancelBtn}>아니요</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={handleWithdraw}>
                <Text style={styles.confirmBtn}>예</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>
    </View>
  );
}

const styles = StyleSheet.create({
  // 헤더
  header: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    marginBottom: 8,
  },
  backBtn: { padding: 4, marginRight: 8 },
  headerTitle: { fontSize: 20, fontWeight: "800", color: "#222" },

  // 본문
  container: { padding: 20 },
  card: {
    borderWidth: 1,
    borderColor: "#9E73D9",
    borderRadius: 12,
    padding: 16,
  },
  label: { fontWeight: "bold", marginBottom: 8, fontSize: 14, color: "#2b2b2b" },
  inputDisabled: {
    backgroundColor: "#F0EEF5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
  },
  inputDisabledText: { color: "#888" },
  helperTextDanger: { marginTop: 8, color: "#D05A5A", fontSize: 12 },
  linkRight: { alignSelf: "flex-end", marginTop: 8 },
  linkText: { color: "#8D5ACF", fontWeight: "600" },

  primaryBtn: {
    backgroundColor: "#9B73D2",
    paddingVertical: 16,
    borderRadius: 12,
    alignItems: "center",
  },
  primaryBtnText: { color: "#fff", fontWeight: "bold", fontSize: 16 },

  // 하단 푸터
  footer: {
    alignItems: "center",
    borderTopWidth: 1,
    borderColor: "#eee",
    backgroundColor: "#fff",
    paddingTop: 12,
  },
  withdrawText: { color: "#C0C0C0", textDecorationLine: "underline" },

  // 모달 공통
  modalOverlay: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    backgroundColor: "rgba(0,0,0,0.3)",
  },
  modalContent: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "80%",
  },
  modalContentSmall: {
    backgroundColor: "#fff",
    padding: 20,
    borderRadius: 12,
    width: "70%",
  },
  modalTitle: {
    fontWeight: "bold",
    fontSize: 16,
    textAlign: "center",
    marginBottom: 16,
    color: "#222",
  },
  modalInput: {
    backgroundColor: "#F5F5F5",
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 12,
    marginBottom: 8,
  },
  modalBtnRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginTop: 12,
  },
  cancelBtn: { color: "#999", fontSize: 16 },
  confirmBtn: { color: "#8D5ACF", fontSize: 16, fontWeight: "bold" },
});
