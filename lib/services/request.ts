import axios, { AxiosError } from "axios";
import AsyncStorage from "@react-native-async-storage/async-storage";

// API Base URL
const BASE_URL = "http://q4skck4o8okwsg4og4ooc0c4.88.222.213.3.sslip.io"; // Update this with your NestJS server URL
const TOKEN_KEY = "@auth_token";

// Create axios instance
const request = axios.create({
  baseURL: BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Log all outgoing requests with full URL
request.interceptors.request.use(
  (config) => {
    const fullUrl = config.baseURL
      ? config.baseURL.replace(/\/$/, "") + (config.url || "")
      : config.url;
    const token =
      config.headers?.Authorization ||
      request.defaults.headers.common["Authorization"];
    console.log(
      "[API REQUEST]",
      config.method?.toUpperCase(),
      fullUrl,
      token ? `Bearer: ${token}` : "No Bearer Token"
    );
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

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
