import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getLoginFeatures } from "../data/loginRepository";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../data/apiClient";

// Application layer: encapsulates Login page state, side effects and data wiring.
export function useLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useAuth();
  const [accountType, setAccountType] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const features = getLoginFeatures();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      await login({ email, password });
      const redirectTo = location.state?.from?.pathname ?? "/home";
      navigate(redirectTo, { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng nhập thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  return {
    accountType,
    setAccountType,
    showPassword,
    setShowPassword,
    loading,
    error,
    email,
    setEmail,
    password,
    setPassword,
    features,
    handleSubmit,
  };
}
