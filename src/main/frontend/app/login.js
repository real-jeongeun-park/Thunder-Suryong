// app/login.js
import Checkbox from "expo-checkbox";
import { useRouter } from "expo-router";
import { useState } from "react";
import * as SecureStore from 'expo-secure-store';

import {
  Platform,
  StyleSheet,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";

import axios from 'axios';
import { API_BASE_URL } from "../src/constants";

export default function LoginScreen() {
  const router = useRouter();
  const [autoLogin, setAutoLogin] = useState(false);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [emptyEmail, setEmptyEmail] = useState(false);
  const [emptyPassword, setEmptyPassword] = useState(false);
  const [loginFail, setLoginFail] = useState(false);

  const tryLogin = () => {
        if(!email.trim()){
            // 이메일 입력 x
            setEmptyEmail(true);
        }

        if(!password.trim()){
            // 패스워드 입력 x
            setEmptyPassword(true);
        }

        if(email.trim() && password.trim()){
            // 둘 다 입력됨
            axios.post(`${API_BASE_URL}/api/login`, {email, password})
            .then(async (res) => {
                console.log(API_BASE_URL);

                const token = res.data.token;

                if(Platform.OS === 'web'){
                    localStorage.setItem("accessToken", token);
                } else{
                    await SecureStore.setItemAsync("accessToken", token);
                }

                router.push("/main");
            })
            .catch((err) => {
                console.log(err);
                setLoginFail(true);
            })
        }
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>로그인을 해주세요.</Text>

      <TextInput
        style={styles.input}
        placeholder="이메일 주소"
        placeholderTextColor="#aaa"
        value={email}
        onChangeText={(text) => {
            setEmail(text);
            setEmptyEmail(false);
            setLoginFail(false);
        }}
      />

      {emptyEmail && <Text style={{color: "red", marginBottom: 15, marginLeft: 5}}>이메일을 입력하세요.</Text>}

      <TextInput
        style={styles.input}
        placeholder="비밀번호"
        placeholderTextColor="#aaa"
        secureTextEntry
        value={password}
        onChangeText={(text) => {
            setPassword(text);
            setEmptyPassword(false);
            setLoginFail(false);
        }}
      />

      {emptyPassword && <Text style={{color: "red", marginBottom: 15, marginLeft: 5}}>비밀번호를 입력하세요.</Text>}

      <View style={styles.checkboxRow}>
        <Checkbox
          value={autoLogin}
          onValueChange={setAutoLogin}
          color={autoLogin ? "#B491DD" : undefined}
        />
        <TouchableOpacity
          onPress={() => {
            setPopupType("terms");
            setVisible(true);
          }}
        >
          <Text style={[styles.checkboxLabel]}>자동 로그인</Text>
        </TouchableOpacity>
      </View>

      {loginFail && <Text style={{color: "red", marginBottom: 15, marginLeft: 5}}>이메일 또는 비밀번호가 틀립니다.</Text>}

      <TouchableOpacity
        style={styles.loginBtn}
        onPress={tryLogin}
      >
        <Text style={styles.loginText}>로그인</Text>
      </TouchableOpacity>

      <TouchableOpacity onPress={() => router.push("/signup")}>
        <Text style={styles.signupLink}>
          아직 회원이 아니신가요? &gt; 회원가입하기
        </Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    justifyContent: "center",
    backgroundColor: "#fff",
  },
  title: { fontSize: 18, fontWeight: "bold", marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    borderRadius: 8,
    padding: 12,
    marginBottom: 12,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  checkboxWrapper: { flexDirection: "row", alignItems: "center" },
  findText: { fontSize: 12, color: "#555" },
  loginBtn: {
    backgroundColor: "#a582d9",
    padding: 16,
    borderRadius: 10,
    alignItems: "center",
  },
  loginText: { color: "#fff", fontWeight: "bold" },
  signupLink: {
    fontSize: 12,
    color: "#888",
    textAlign: "center",
    marginTop: 20,
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
});
