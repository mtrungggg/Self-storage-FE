import axios from "axios";
import appConfig from "../config/appConfig";
import STORAGE_KEYS from "../constants/storageKeys";

export const apiClient = axios.create({
  baseURL: appConfig.api.baseUrl,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: appConfig.api.timeoutMs,
});

// Request Interceptor: Tự động trích xuất Access Token (ưu tiên sessionStorage theo từng tab để hỗ trợ mở song song Customer & Staff)
apiClient.interceptors.request.use(
  (config) => {
    const token =
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
    if (token) {
      if (!sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
        sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, token);
      }
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// Response Interceptor: Xử lý phản hồi và chuẩn hoá lỗi
apiClient.interceptors.response.use(
  (response) => {
    // Trả về data (thường là ApiResponse schema: { success, message, data, errors })
    return response.data;
  },
  (error) => {
    const { response } = error;

    if (response) {
      const status = response.status;
      const apiResponse = response.data;
      let errorMessage = apiResponse?.message;

      if (!errorMessage && apiResponse?.errors) {
        if (Array.isArray(apiResponse.errors)) {
          errorMessage = apiResponse.errors.join(", ");
        } else if (typeof apiResponse.errors === "object") {
          errorMessage = Object.values(apiResponse.errors).flat().join(", ");
        }
      }

      if (!errorMessage) {
        errorMessage = apiResponse?.title || error.message || "An unexpected error occurred.";
      }

      if (status === 401) {
        // Hết phiên hoặc token không hợp lệ
        sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
        localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
        if (
          !window.location.pathname.includes("/login") &&
          !window.location.pathname.includes("/register")
        ) {
          window.location.href = "/login?sessionExpired=true";
        }
      } else if (status === 403) {
        console.warn("Bạn không có quyền thực hiện thao tác này (403 Forbidden).");
      } else if (status === 429) {
        console.warn("Bạn đã gửi quá nhiều yêu cầu. Vui lòng thử lại sau giây lát (429 Rate Limit).");
      }

      return Promise.reject({
        status,
        message: errorMessage,
        raw: response.data,
      });
    }

    return Promise.reject({
      status: 0,
      message: "Không thể kết nối đến máy chủ Backend. Vui lòng kiểm tra lại dịch vụ Backend đang chạy.",
      raw: error,
    });
  }
);

export default apiClient;
