import axios from "axios";
import Constants from "expo-constants";
import { Platform } from "react-native";

const envBaseUrl = process.env.EXPO_PUBLIC_API_URL?.trim();

const getFallbackBaseUrl = () => {
  const hostUri = Constants.expoConfig?.hostUri;
  const lanHost = hostUri?.split(":")[0];

  if (lanHost && lanHost !== "localhost" && lanHost !== "127.0.0.1") {
    return `http://${lanHost}:3000`;
  }

  if (Platform.OS === "android") {
    return "http://10.0.2.2:3000";
  }

  return "http://localhost:3000";
};

const API = axios.create({
  baseURL: envBaseUrl || getFallbackBaseUrl(),
  timeout: 10000,
});

export default API;
