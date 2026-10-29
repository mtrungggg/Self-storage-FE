import { useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { getDefaultRouteForUser } from "../constants/roles";
import STORAGE_KEYS from "../constants/storageKeys";

// Application layer: encapsulates Login page state, side effects and API data wiring.
export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();

  const [email, setEmail] = useState(() => localStorage.getItem(STORAGE_KEYS.REMEMBERED_EMAIL) || "");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [loading, setLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");
  const [unverifiedEmail, setUnverifiedEmail] = useState(null);

  // Check if session expired query param exists
  const sessionExpired = new URLSearchParams(location.search).get("sessionExpired");

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");
    setUnverifiedEmail(null);

    const cleanEmail = email.trim();
    if (!cleanEmail || !password) {
      setErrorMessage("Please enter both email and password.");
      return;
    }

    setLoading(true);
    try {
      const res = await login(cleanEmail, password);
      const msg = res?.message || "Login successful! Redirecting...";
      setSuccessMessage(msg);

      if (rememberMe) {
        localStorage.setItem(STORAGE_KEYS.REMEMBERED_EMAIL, cleanEmail);
      } else {
        localStorage.removeItem(STORAGE_KEYS.REMEMBERED_EMAIL);
      }

      const user = res?.data?.user;
      const returnUrl = location.state?.from?.pathname;

      const defaultRoute = getDefaultRouteForUser(user);
      const targetRoute = returnUrl && defaultRoute === "/home" ? returnUrl : defaultRoute;

      setTimeout(() => {
        navigate(targetRoute);
      }, 700);
    } catch (err) {
      const msg = err?.message || "Login failed. Please check your credentials.";
      setErrorMessage(msg);

      // Check if the account has not been activated yet
      const lower = msg.toLowerCase();
      if (
        lower.includes("chưa được kích hoạt") ||
        lower.includes("chưa kích hoạt") ||
        lower.includes("not activated") ||
        lower.includes("xác thực mã otp")
      ) {
        setUnverifiedEmail(cleanEmail);
      }
    } finally {
      setLoading(false);
    }
  };

  return {
    email,
    setEmail,
    password,
    setPassword,
    showPassword,
    setShowPassword,
    rememberMe,
    setRememberMe,
    loading,
    errorMessage,
    successMessage,
    sessionExpired,
    unverifiedEmail,
    setUnverifiedEmail,
    handleSubmit,
  };
}

export default useLogin;
