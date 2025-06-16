import axios from "axios";
import { API_CONFIG } from "../config/apiConfig";

// API Client đơn giản cho ứng dụng xem phim miễn phí
const apiClient = axios.create({
  baseURL: API_CONFIG.BASE_URL,
  timeout: API_CONFIG.TIMEOUT,
  headers: API_CONFIG.DEFAULT_HEADERS,
});

// Request interceptor - chỉ log requests cho debugging
apiClient.interceptors.request.use(
  (config) => {
    // Log API calls trong development mode
    if (API_CONFIG.IS_DEVELOPMENT) {
    }
    return config;
  },
  (error) => {
    console.error("Request error:", error);
    return Promise.reject(error);
  }
);

// Response interceptor - xử lý lỗi cơ bản
apiClient.interceptors.response.use(
  (response) => {
    // Log successful responses trong development
    if (API_CONFIG.IS_DEVELOPMENT) {
    }
    return response;
  },
  (error) => {
    // Xử lý các lỗi phổ biến
    if (error.response) {
      const status = error.response.status;
      const message = error.response.data?.detail || error.response.data?.message || 'Unknown error';
      
      switch (status) {
        case 404:
          console.error(`❌ Not Found: ${error.config.url}`);
          break;
        case 500:
          console.error(`❌ Server Error: ${message}`);
          break;
        case 503:
          console.error(`❌ Service Unavailable: Backend server may be down`);
          break;
        default:
          console.error(`❌ API Error ${status}: ${message}`);
      }
    } else if (error.request) {
      console.error("❌ Network Error: Unable to reach backend server");
    } else {
      console.error("❌ Request Setup Error:", error.message);
    }
    
    return Promise.reject(error);
  }
);

export default apiClient;
