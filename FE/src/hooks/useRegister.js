import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { getRegisterFaqs } from "../data/registerRepository";
import { useAuth } from "../context/AuthContext";
import { ApiError } from "../data/apiClient";

// Application layer: encapsulates Register page state, side effects and data wiring.
// Flow: submit registration -> backend emails an OTP -> verify OTP to receive the session.
export function useRegister() {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp } = useAuth();
  const [accountType, setAccountType] = useState("individual");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const faqs = getRegisterFaqs();

  const [step, setStep] = useState("form"); // "form" | "otp"
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [otpCode, setOtpCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [infoMessage, setInfoMessage] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (password !== confirmPassword) {
      setError("Mật khẩu xác nhận không khớp.");
      return;
    }

    setLoading(true);
    try {
      await register({ fullName, email, password, phoneNumber: phoneNumber || undefined });
      setInfoMessage(`Mã OTP đã được gửi tới ${email}. Vui lòng kiểm tra hộp thư.`);
      setStep("otp");
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Đăng ký thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await verifyOtp({ email, otpCode });
      navigate("/home", { replace: true });
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Xác thực OTP thất bại. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleResendOtp = async () => {
    setError("");
    setLoading(true);
    try {
      await resendOtp({ email });
      setInfoMessage(`Đã gửi lại mã OTP tới ${email}.`);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : "Không thể gửi lại mã OTP.");
    } finally {
      setLoading(false);
    }
  };

  return {
    accountType,
    setAccountType,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    faqs,
    step,
    fullName,
    setFullName,
    email,
    setEmail,
    phoneNumber,
    setPhoneNumber,
    password,
    setPassword,
    confirmPassword,
    setConfirmPassword,
    otpCode,
    setOtpCode,
    loading,
    error,
    infoMessage,
    handleSubmit,
    handleVerifyOtp,
    handleResendOtp,
  };
}
