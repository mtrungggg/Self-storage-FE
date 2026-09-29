import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "./useAuth";

// Application layer: encapsulates Register page state, side effects and API data wiring.
export function useRegister() {
  const navigate = useNavigate();
  const { register, verifyOtp, resendOtp } = useAuth();

  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // OTP Verification state
  const [isOtpStep, setIsOtpStep] = useState(false);
  const [otpCode, setOtpCode] = useState("");
  const [resendCooldown, setResendCooldown] = useState(0);

  const [loading, setLoading] = useState(false);
  const [otpLoading, setOtpLoading] = useState(false);
  const [resendLoading, setResendLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [successMessage, setSuccessMessage] = useState("");

  const cooldownTimerRef = useRef(null);

  // Countdown timer for OTP resend cooldown
  useEffect(() => {
    if (resendCooldown > 0) {
      cooldownTimerRef.current = setInterval(() => {
        setResendCooldown((prev) => {
          if (prev <= 1) {
            clearInterval(cooldownTimerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(cooldownTimerRef.current);
  }, [resendCooldown]);

  const handleSubmit = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanFullName = fullName.trim();
    const cleanEmail = email.trim();

    if (!cleanFullName || !cleanEmail || !password) {
      setErrorMessage("Vui lòng điền đầy đủ các thông tin bắt buộc (*).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Mật khẩu phải chứa ít nhất 6 ký tự.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Mật khẩu xác nhận không khớp. Vui lòng kiểm tra lại.");
      return;
    }

    setLoading(true);
    try {
      const res = await register({
        fullName: cleanFullName,
        email: cleanEmail,
        password,
        phoneNumber: phoneNumber.trim() || undefined,
      });

      setSuccessMessage(
        res?.message || "Đăng ký thành công! Mã OTP 6 chữ số đã được gửi đến email của bạn."
      );
      setIsOtpStep(true);
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(err?.message || "Đăng ký không thành công. Vui lòng thử lại.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage("");
    setSuccessMessage("");

    const cleanCode = otpCode.trim();
    if (!cleanCode || cleanCode.length !== 6) {
      setErrorMessage("Vui lòng nhập đầy đủ mã OTP gồm 6 chữ số.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await verifyOtp(email.trim(), cleanCode);
      setSuccessMessage(res?.message || "Kích hoạt tài khoản thành công! Đang chuyển hướng...");

      const user = res?.data?.user;
      const roles = user?.roles || [];

      setTimeout(() => {
        if (roles.includes("admin") || roles.includes("system_admin")) {
          navigate("/admin-overview");
        } else if (
          roles.includes("staff") ||
          roles.includes("facility_staff") ||
          roles.includes("manager")
        ) {
          navigate("/staff-dashboard");
        } else {
          navigate("/home");
        }
      }, 800);
    } catch (err) {
      setErrorMessage(err?.message || "Mã OTP không chính xác hoặc đã hết hạn.");
    } finally {
      setOtpLoading(false);
    }
  };

  const handleResendOtp = async () => {
    if (resendCooldown > 0 || resendLoading) return;

    setErrorMessage("");
    setSuccessMessage("");
    setResendLoading(true);
    try {
      const res = await resendOtp(email.trim());
      setSuccessMessage(res?.message || "Mã OTP mới đã được gửi lại vào email của bạn.");
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(err?.message || "Gửi lại OTP không thành công. Vui lòng thử lại.");
    } finally {
      setResendLoading(false);
    }
  };

  const openOtpForEmail = (targetEmail) => {
    setEmail(targetEmail);
    setIsOtpStep(true);
    setErrorMessage("");
    setSuccessMessage("Vui lòng nhập mã OTP được gửi tới " + targetEmail);
  };

  return {
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
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isOtpStep,
    setIsOtpStep,
    otpCode,
    setOtpCode,
    resendCooldown,
    loading,
    otpLoading,
    resendLoading,
    errorMessage,
    successMessage,
    handleSubmit,
    handleVerifyOtp,
    handleResendOtp,
    openOtpForEmail,
  };
}

export default useRegister;
