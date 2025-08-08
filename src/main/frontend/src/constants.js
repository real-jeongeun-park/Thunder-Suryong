import { Platform } from "react-native";
import Constants from "expo-constants";

const API_BASE_URL =
  Platform.OS === "web"
    ? "http://localhost:8080" // 웹 개발 시 로컬 API
    : Constants.expoConfig.extra.API_BASE_URL; // 모바일에서는 .env 값

export { API_BASE_URL };
