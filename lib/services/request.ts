import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Base URL
const BASE_URL = "https://api.boostfury.com"; // Update this with your NestJS server URL
const TOKEN_KEY = "@auth_token";

// Create axios instance
const request = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Initialize token from AsyncStorage
const initializeToken = async () => {
  try {
    const token = await AsyncStorage.getItem(TOKEN_KEY);
    if (token) {
      request.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    }
  } catch (error) {
    console.error("Error initializing token:", error);
  }
};

// Call initializeToken when the module loads
initializeToken();

// Add request interceptor
request.interceptors.request.use(
  (config) => {
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Add response interceptor
request.interceptors.response.use(
  (response) => {
    return response;
  },
  (error: AxiosError) => {
    return Promise.reject(error);
  }
);

// Add auth token to requests and store in AsyncStorage
export const setAuthToken = async (token: string | null) => {
  if (token) {
    try {
      await AsyncStorage.setItem(TOKEN_KEY, token);
      request.defaults.headers.common["Authorization"] = `Bearer ${token}`;
    } catch (error) {
      console.error("Error setting token:", error);
    }
  } else {
    try {
      await AsyncStorage.removeItem(TOKEN_KEY);
      delete request.defaults.headers.common["Authorization"];
    } catch (error) {
      console.error("Error removing token:", error);
    }
  }
};

export default request;
