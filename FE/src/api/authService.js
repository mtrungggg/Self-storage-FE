import authApi from "../services/api/authApi";
import STORAGE_KEYS from "../constants/storageKeys";

function persistAuthSession(res) {
  if (res?.data?.accessToken) {
    sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.accessToken);
    localStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, res.data.accessToken);
    if (res.data.user) {
      const serialized = JSON.stringify(res.data.user);
      sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, serialized);
      localStorage.setItem(STORAGE_KEYS.CURRENT_USER, serialized);
    }
  }
}

export const authService = {
  async login({ email, password }) {
    const res = await authApi.login({ email, password });
    persistAuthSession(res);
    return res;
  },

  async register(data) {
    return await authApi.register(data);
  },

  async verifyOtp({ email, otpCode }) {
    const res = await authApi.verifyOtp({ email, otpCode });
    persistAuthSession(res);
    return res;
  },

  async resendOtp(email) {
    return await authApi.resendOtp(email);
  },

  async getCurrentUser() {
    return await authApi.getCurrentUser();
  },

  async googleLogin(idToken) {
    const res = await authApi.googleLogin(idToken);
    persistAuthSession(res);
    return res;
  },

  logout() {
    sessionStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    sessionStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
    localStorage.removeItem(STORAGE_KEYS.ACCESS_TOKEN);
    localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  isAuthenticated() {
    return !!(
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
    );
  },

  getStoredUser() {
    const user =
      sessionStorage.getItem(STORAGE_KEYS.CURRENT_USER) ||
      localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
    return user ? JSON.parse(user) : null;
  },
};

export default authService;
