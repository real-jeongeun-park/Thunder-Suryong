import { Platform } from "react-native";
import Constants from "expo-constants";
import { REACT_APP_API_BASE_URL } from "@env";

export const API_BASE_URL =
  Platform.OS === "web"
    ? REACT_APP_API_BASE_URL
    : Constants.expoConfig.extra.API_BASE_URL;