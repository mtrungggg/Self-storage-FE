import { apiClient } from "./apiClient";

// Data layer: maps to the backend's /api/Auth endpoints (see Swagger).
const ENDPOINTS = {
  login: "/api/Auth/login",
  register: "/api/Auth/register",
  verifyOtp: "/api/Auth/verify-otp",
  resendOtp: "/api/Auth/resend-otp",
  googleLogin: "/api/Auth/google-login",
  me: "/api/Auth/me",
};

export function login({ email, password }) {
  return apiClient.post(ENDPOINTS.login, { email, password });
}

export function register({ fullName, email, password, phoneNumber }) {
  return apiClient.post(ENDPOINTS.register, { fullName, email, password, phoneNumber });
}

export function verifyOtp({ email, otpCode }) {
  return apiClient.post(ENDPOINTS.verifyOtp, { email, otpCode });
}

export function resendOtp({ email }) {
  return apiClient.post(ENDPOINTS.resendOtp, { email });
}

export function googleLogin({ idToken }) {
  return apiClient.post(ENDPOINTS.googleLogin, { idToken });
}

export function fetchCurrentUser(token) {
  return apiClient.get(ENDPOINTS.me, { token });
}
