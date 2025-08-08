import { Platform } from "react-native";

const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8080"
    : "http://192.168.219.101:8080"; // ✅ 모바일은 IP 주소 사용

export { API_BASE_URL };
