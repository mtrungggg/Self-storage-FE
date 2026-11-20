import apiClient from "../../api/apiClient";

// Auth endpoints return the raw envelope because callers read res.data.accessToken / res.data.user.
const authApi = {
  login: ({ email, password }) => apiClient.post("/v1/auth/login", { email, password }),
  register: (data) => apiClient.post("/v1/auth/register", data),
  verifyOtp: ({ email, otpCode }) => apiClient.post("/v1/auth/verify-otp", { email, otpCode }),
  resendOtp: (email) => apiClient.post("/v1/auth/resend-otp", { email }),
  getCurrentUser: () => apiClient.get("/v1/auth/me"),
  googleLogin: (idToken) => apiClient.post("/v1/auth/google-login", { idToken }),
  getProfile: () => apiClient.get("/v1/profile"),
  updateProfile: (data) => apiClient.put("/v1/profile", data),
  changePassword: (data) => apiClient.post("/v1/change-password", data),
};

export default authApi;
