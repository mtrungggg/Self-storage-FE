import { createContext, useContext, useState, useEffect } from "react";
import authService from "../api/authService";
import STORAGE_KEYS from "../constants/storageKeys";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => authService.getStoredUser());
  const [token, setToken] = useState(
    () =>
      sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
      localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadUser() {
      const storedToken =
        sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN) ||
        localStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN);
      if (storedToken) {
        if (!sessionStorage.getItem(STORAGE_KEYS.ACCESS_TOKEN)) {
          sessionStorage.setItem(STORAGE_KEYS.ACCESS_TOKEN, storedToken);
        }
        try {
          const res = await authService.getCurrentUser();
          if (res?.data) {
            setUser(res.data);
            const serialized = JSON.stringify(res.data);
            sessionStorage.setItem(STORAGE_KEYS.CURRENT_USER, serialized);
            localStorage.setItem(STORAGE_KEYS.CURRENT_USER, serialized);
          }
        } catch (err) {
          console.warn("Phiên đăng nhập không hợp lệ hoặc đã hết hạn:", err.message);
          authService.logout();
          setUser(null);
          setToken(null);
        }
      }
      setLoading(false);
    }
    loadUser();
  }, []);

  const login = async (email, password) => {
    const res = await authService.login({ email, password });
    if (res?.data?.accessToken) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  const verifyOtp = async (email, otpCode) => {
    const res = await authService.verifyOtp({ email, otpCode });
    if (res?.data?.accessToken) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  const googleLogin = async (idToken) => {
    const res = await authService.googleLogin(idToken);
    if (res?.data?.accessToken) {
      setToken(res.data.accessToken);
      setUser(res.data.user);
    }
    return res;
  };

  const logout = () => {
    authService.logout();
    setUser(null);
    setToken(null);
  };

  const value = {
    user,
    token,
    isAuthenticated: !!token,
    loading,
    login,
    register: authService.register,
    verifyOtp,
    resendOtp: authService.resendOtp,
    googleLogin,
    logout,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}

export default AuthContext;
