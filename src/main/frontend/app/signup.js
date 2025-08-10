// app/signup.js

import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { useState } from "react";

import {
  Modal,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
  Platform,
} from "react-native";

import * as SecureStore from "expo-secure-store";
import axios from "axios";
import { API_BASE_URL } from "../src/constants";

export default function Signup() {
  const router = useRouter();

  const [nicknameStatus, setNicknameStatus] = useState("");
  const [emailStatus, setEmailStatus] = useState("");
  const [passwordStatus, setPasswordStatus] = useState(""); // password == passwordConfirm 확인

  const [nickname, setNickname] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirm, setPasswordConfirm] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [agreePrivacy, setAgreePrivacy] = useState(false);
  const [visible, setVisible] = useState(false);
  const [popupType, setPopupType] = useState(null); // "terms" or "privacy"

  const TERMS_TEXT = `
이용약관

제 1 조 (목적)
본 약관은 [벼락수룡](이하 "서비스")가 제공하는 모든 서비스의 이용조건 및 절차, 이용자와 서비스의 권리·의무 및 책임사항을 규정함을 목적으로 합니다.

제 2 조 (약관의 효력 및 변경)

이용자는 본 약관에 동의함으로써 서비스 이용 자격을 갖습니다.

본 약관은 서비스 화면에 게시하거나 기타 방법으로 공지함으로써 효력이 발생합니다.

서비스는 필요한 경우 사전 예고 없이 본 약관을 변경할 수 있으며, 변경된 약관은 서비스 화면에 게시함으로써 효력이 발생합니다.

제 3 조 (회원 가입 및 계정 관리)

회원 가입 시 서비스는 다음의 정보를 수집합니다.

- 이메일

- 닉네임

- 비밀번호

이용자는 허위 정보를 제공해서는 안 되며, 타인의 개인정보를 도용할 경우 서비스 이용이 제한될 수 있습니다.

계정 정보는 이용자 본인이 직접 관리하며, 제3자에게 양도, 대여할 수 없습니다.

제 4 조 (서비스 이용)

서비스는 연중무휴, 1일 24시간 제공을 원칙으로 합니다.

서비스는 운영상 또는 기술상의 필요에 따라 서비스의 전부 또는 일부를 일시 중지할 수 있으며, 이 경우 사전 공지를 원칙으로 합니다. 단, 긴급한 경우 사후에 공지할 수 있습니다.

제 5 조 (이용 제한 및 해지)

이용자가 다음 각 호에 해당하는 경우 서비스는 사전 통보 없이 이용을 제한하거나 계정을 삭제할 수 있습니다.

- 타인의 정보 도용

- 법령 또는 본 약관 위반

- 서비스의 정상적인 운영을 방해하는 행위

- 이용자는 언제든지 서비스 내 제공되는 절차를 통해 회원 탈퇴를 요청할 수 있습니다.

제 6 조 (개인정보 보호)
서비스는 관련 법령 및 개인정보 처리방침에 따라 이용자의 개인정보를 보호합니다.

제 7 조 (책임 제한)

서비스는 천재지변, 시스템 장애, 제3자의 불법 행위 등 서비스의 합리적인 통제 범위를 벗어난 사유로 인한 손해에 대해 책임을 지지 않습니다.

서비스는 이용자 상호 간 또는 이용자와 제3자 간에 발생한 분쟁에 개입하지 않으며, 이에 따른 손해 배상 책임이 없습니다.

제 8 조 (준거법 및 관할법원)
본 약관의 해석 및 적용에는 대한민국 법률이 적용되며, 서비스와 이용자 간 발생한 분쟁에 대해서는 관할 법원에 소를 제기할 수 있습니다.
  `;

  const PRIVACY_TEXT = `
개인정보 처리방침

[벼락수룡](이하 "서비스")는 이용자의 개인정보를 중요시하며, 「개인정보 보호법」 등 관련 법령을 준수합니다. 본 개인정보 처리방침은 서비스 이용 시 수집하는 개인정보의 항목, 이용 목적, 보관 및 파기 절차 등을 명확히 안내합니다.

1. 수집하는 개인정보 항목
서비스는 회원가입 및 원활한 서비스 제공을 위해 다음과 같은 개인정보를 수집합니다.

- 이메일

- 닉네임

- 비밀번호

2. 개인정보의 수집 및 이용 목적
수집된 개인정보는 다음의 목적을 위해 사용됩니다.

- 회원 가입 및 계정 관리

- 서비스 이용에 따른 본인 확인 및 인증

- 고객 문의 응대 및 공지사항 전달

- 서비스 품질 향상을 위한 분석 및 통계

3. 개인정보의 보관 및 파기
보관 기간: 회원 탈퇴 시 즉시 삭제하며, 법령에서 정한 경우 해당 기간 동안 보관합니다.

관련 법령에 의한 보관: 전자상거래 등에서의 소비자 보호에 관한 법률 등

파기 절차: 보관 기간이 종료된 개인정보는 재생이 불가능한 방법으로 안전하게 파기합니다.

4. 개인정보의 제3자 제공
서비스는 이용자의 개인정보를 원칙적으로 외부에 제공하지 않습니다. 다만, 이용자의 사전 동의가 있거나 법령에 따라 요구되는 경우에 한해 예외적으로 제공합니다.

5. 개인정보 처리 위탁
서비스는 원활한 업무 처리를 위해 필요한 경우 개인정보 처리 업무를 외부에 위탁할 수 있으며, 이 경우 위탁업체와의 계약을 통해 개인정보 보호 의무를 명확히 규정합니다.

6. 이용자의 권리와 행사 방법
이용자는 언제든지 자신의 개인정보 열람, 정정, 삭제를 요청할 수 있으며, 서비스는 지체 없이 조치합니다.

7. 개인정보 보호를 위한 조치
서비스는 개인정보의 분실, 도난, 유출, 변조 또는 훼손을 방지하기 위해 다음과 같은 조치를 취합니다.

- 접근 권한 최소화

8. 변경 사항 고지
본 방침이 변경될 경우, 변경 사항을 사전에 공지합니다.


  `;

  function emailValidate(email) {
    const email_regex = /^[a-zA-Zx0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,4}$/i;
    return email_regex.test(email);
  }

  const checkNickname = () => {
    if (!nickname.trim()) return;
    axios
      .post(`${API_BASE_URL}/api/nickname`, { nickname })
      .then((res) => {
        if (res.data) {
          setNicknameStatus("true");
        } else {
          // 겹침
          console.log(res);
          setNicknameStatus("false");
        }
      })
      .catch((err) => {
        console.log(err);
        setNicknameStatus("false");
      });
  };

  const checkEmail = () => {
    if (!email.trim()) return;
    if (!emailValidate(email)) {
      setEmailStatus("false");
      return;
    }

    axios
      .post(`${API_BASE_URL}/api/email`, { email })
      .then((res) => {
        if (res.data) {
          setEmailStatus("true");
        } else {
          // 겹침
          console.log(res);
          setEmailStatus("false");
        }
      })
      .catch((err) => {
        /* console.log("emailDuplicateCheck failed");
        console.log(err); */
        setEmailStatus("false");
      });
  };

  const passwordEqual = (passwordConfirm: string) => {
    if (password == passwordConfirm) setPasswordStatus("true");
    else setPasswordStatus("false");
  };

  const handleSignup = async () => {
    // 다 잘 입력됐나 확인
    if (
      !agreeTerms ||
      !agreePrivacy ||
      nicknameStatus !== "true" ||
      emailStatus !== "true" ||
      passwordStatus !== "true"
    ) {
      setPopupType("alert");
      setVisible(true);
    } else {
      axios
        .post(`${API_BASE_URL}/api/signup`, { nickname, email, password })
        .then(async (res) => {
          const token = res.data.token;

          if (Platform.OS === "web") {
            localStorage.setItem("accessToken", token);
          } else {
            await SecureStore.setItemAsync("accessToken", token);
          }

          // 무사히 회원가입 완료
          setPopupType("success");
          setVisible(true);
          setTimeout(() => {
            setVisible(false);
            router.push("/question1");
          }, 1000);
        })
        .catch((err) => {
          // 서버 에러로 회원가입 실패
          setPopupType("fail");
          setVisible(true);
        });
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>회원가입을 해주세요.</Text>

      {/* 닉네임 */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="닉네임"
          placeholderTextColor="#999"
          style={styles.input}
          value={nickname}
          onChangeText={(text) => {
            setNickname(text);
            setNicknameStatus("");
          }}
        />
        <TouchableOpacity style={styles.checkButton} onPress={checkNickname}>
          <Text style={styles.checkButtonText}>중복 확인</Text>
        </TouchableOpacity>
      </View>

      {nicknameStatus == "true" && (
        <Text style={{ color: "green", marginBottom: 10, marginLeft: 5 }}>
          사용 가능한 닉네임입니다.
        </Text>
      )}
      {nicknameStatus == "false" && (
        <Text style={{ color: "red", marginBottom: 10, marginLeft: 5 }}>
          이미 등록된 닉네임입니다. 다른 닉네임을 사용해 주세요.
        </Text>
      )}

      {/* 이메일 */}
      <View style={styles.inputRow}>
        <TextInput
          placeholder="이메일 주소"
          placeholderTextColor="#999"
          style={styles.input}
          value={email}
          onChangeText={(text) => {
            setEmail(text);
            setEmailStatus("");
          }}
        />
        <TouchableOpacity style={styles.checkButton} onPress={checkEmail}>
          <Text style={styles.checkButtonText}>중복 확인</Text>
        </TouchableOpacity>
      </View>

      {emailStatus == "true" && (
        <Text style={{ color: "green", marginBottom: 10, marginLeft: 5 }}>
          사용 가능한 이메일입니다.
        </Text>
      )}
      {emailStatus == "false" && (
        <Text style={{ color: "red", marginBottom: 10, marginLeft: 5 }}>
          이미 등록된 이메일이거나, 이메일 형식이 잘못 되었습니다.
        </Text>
      )}

      {/* 비밀번호 */}
      <TextInput
        placeholder="비밀번호"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.inputFull}
        value={password}
        onChangeText={setPassword}
      />

      {/* 비밀번호 확인 */}
      <TextInput
        placeholder="비밀번호 확인"
        placeholderTextColor="#999"
        secureTextEntry
        style={styles.inputFull}
        value={passwordConfirm}
        onChangeText={(text) => {
          setPasswordConfirm(text);
          passwordEqual(text);
        }}
      />

      {passwordStatus == "true" && (
        <Text style={{ color: "green", marginBottom: 10, marginLeft: 5 }}>
          비밀번호가 일치합니다.
        </Text>
      )}
      {passwordStatus == "false" && (
        <Text style={{ color: "red", marginBottom: 10, marginLeft: 5 }}>
          입력한 비밀번호가 틀립니다. 다시 입력하세요.
        </Text>
      )}

      {/* 체크박스 */}
      <View style={styles.checkboxRow}>
        <Checkbox
          value={agreeTerms}
          onValueChange={setAgreeTerms}
          color={agreeTerms ? "#B491DD" : undefined}
        />
        <TouchableOpacity
          onPress={() => {
            setPopupType("terms");
            setVisible(true);
          }}
        >
          <Text style={[styles.checkboxLabel, styles.underline]}>
            이용 약관
          </Text>
        </TouchableOpacity>
        <Text>에 동의합니다.</Text>
      </View>

      <View style={styles.checkboxRow}>
        <Checkbox
          value={agreePrivacy}
          onValueChange={setAgreePrivacy}
          color={agreePrivacy ? "#B491DD" : undefined}
        />
        <TouchableOpacity
          onPress={() => {
            setPopupType("privacy");
            setVisible(true);
          }}
        >
          <Text style={[styles.checkboxLabel, styles.underline]}>
            개인정보 처리 방침
          </Text>
        </TouchableOpacity>
        <Text>에 동의합니다.</Text>
      </View>

      {/* 팝업 모달 */}
      <Modal
        transparent={true}
        animationType="fade"
        visible={visible}
        onRequestClose={() => setVisible(false)}
      >
        <View style={styles.modalContainer}>
          <View style={styles.modalContent}>
            <ScrollView style={{ maxHeight: 400 }}>
              <Text>
                {popupType === "alert" &&
                  "입력 또는 체크 되지 않은 칸이 있습니다."}
                {popupType == "terms" && TERMS_TEXT}
                {popupType == "privacy" && PRIVACY_TEXT}
                {popupType === "success" && "회원가입 성공!"}
                {popupType === "fail" &&
                  "회원가입에 실패했습니다. 잠시 후 다시 시도해 주세요."}
              </Text>
            </ScrollView>

            {/* 닫기 버튼: success일 때만 숨김 */}
            {popupType !== "success" && (
              <TouchableOpacity
                onPress={() => setVisible(false)}
                style={styles.closeButton}
              >
                <Text style={styles.buttonText}>닫기</Text>
              </TouchableOpacity>
            )}
          </View>
        </View>
      </Modal>

      {/* 회원가입 버튼 */}
      <TouchableOpacity style={styles.submitButton} onPress={handleSignup}>
        <Text style={styles.submitButtonText}>회원가입</Text>
      </TouchableOpacity>

      {/* 로그인하러 가기 */}
      <TouchableOpacity onPress={() => router.push("/login")}>
        <Text style={styles.bottomText}>
          이미 가입하셨나요? {">"} 로그인하기
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    //paddingTop: 100,
    paddingHorizontal: 30,
    flex: 1,
    backgroundColor: "#fff",
    justifyContent: "center",
  },
  title: {
    fontSize: 18,
    fontWeight: "bold",
    marginBottom: 30,
  },
  inputRow: {
    flexDirection: "row",
    marginBottom: 15,
    alignItems: "center",
  },
  input: {
    flex: 1,
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 5,
    paddingHorizontal: 10,
  },
  inputFull: {
    borderBottomWidth: 1,
    borderColor: "#ccc",
    paddingVertical: 5,
    paddingHorizontal: 10,
    marginBottom: 15,
  },
  checkButton: {
    marginLeft: 10,
    paddingVertical: 6,
    paddingHorizontal: 10,
    borderRadius: 15,
    backgroundColor: "#eee",
  },
  checkButtonText: {
    fontSize: 12,
    color: "#555",
  },
  checkboxRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 10,
    flexWrap: "wrap",
  },
  checkboxLabel: {
    marginLeft: 8,
    fontSize: 14,
  },
  submitButton: {
    marginTop: 20,
    backgroundColor: "#B491DD",
    paddingVertical: 15,
    borderRadius: 10,
    alignItems: "center",
  },
  submitButtonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  bottomText: {
    marginTop: 20,
    textAlign: "center",
    color: "#666",
    fontSize: 12,
  },
  modalContainer: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    backgroundColor: "white",
    padding: 20,
    borderRadius: 15,
    width: "80%",
    alignItems: "center",
  },
  closeButton: {
    marginTop: 20,
    backgroundColor: "#B491DD",
    paddingVertical: 10,
    paddingHorizontal: 30,
    borderRadius: 8,
  },
  buttonText: {
    color: "#fff",
    fontWeight: "bold",
  },
  underline: {
    textDecorationLine: "underline",
  },
});
