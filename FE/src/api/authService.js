import apiClient from "./apiClient";

export const authService = {
  /**
   * Đăng nhập người dùng bằng email và mật khẩu
   * @param {{ email: string, password: string }} credentials
   */
  async login({ email, password }) {
    const res = await apiClient.post("/auth/login", { email, password });
    if (res?.data?.accessToken) {
      sessionStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.user) {
        const serialized = JSON.stringify(res.data.user);
        sessionStorage.setItem("currentUser", serialized);
        localStorage.setItem("currentUser", serialized);
      }
    }
    return res;
  },

  /**
   * Đăng ký tài khoản mới và gửi mã OTP qua Gmail
   * @param {{ fullName: string, email: string, password: string, phoneNumber?: string }} data
   */
  async register(data) {
    return await apiClient.post("/auth/register", data);
  },

  /**
   * Xác thực mã OTP để kích hoạt tài khoản
   * @param {{ email: string, otpCode: string }} data
   */
  async verifyOtp({ email, otpCode }) {
    const res = await apiClient.post("/auth/verify-otp", { email, otpCode });
    if (res?.data?.accessToken) {
      sessionStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.user) {
        const serialized = JSON.stringify(res.data.user);
        sessionStorage.setItem("currentUser", serialized);
        localStorage.setItem("currentUser", serialized);
      }
    }
    return res;
  },

  /**
   * Gửi lại mã xác thực OTP
   * @param {string} email
   */
  async resendOtp(email) {
    return await apiClient.post("/auth/resend-otp", { email });
  },

  /**
   * Lấy thông tin tài khoản hiện tại từ JWT token
   */
  async getCurrentUser() {
    return await apiClient.get("/auth/me");
  },

  /**
   * Đăng nhập bằng Google ID Token
   * @param {string} idToken
   */
  async googleLogin(idToken) {
    const res = await apiClient.post("/auth/google-login", { idToken });
    if (res?.data?.accessToken) {
      sessionStorage.setItem("accessToken", res.data.accessToken);
      localStorage.setItem("accessToken", res.data.accessToken);
      if (res.data.user) {
        const serialized = JSON.stringify(res.data.user);
        sessionStorage.setItem("currentUser", serialized);
        localStorage.setItem("currentUser", serialized);
      }
    }
    return res;
  },

  /**
   * Đăng xuất người dùng
   */
  logout() {
    sessionStorage.removeItem("accessToken");
    sessionStorage.removeItem("currentUser");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("currentUser");
  },

  /**
   * Kiểm tra xem user có đang đăng nhập hay không
   */
  isAuthenticated() {
    return !!(sessionStorage.getItem("accessToken") || localStorage.getItem("accessToken"));
  },

  /**
   * Lấy user đã lưu trong sessionStorage (theo tab) hoặc localStorage
   */
  getStoredUser() {
    const user = sessionStorage.getItem("currentUser") || localStorage.getItem("currentUser");
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
