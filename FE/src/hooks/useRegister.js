import { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

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
      setErrorMessage("Please fill in all required fields (*).");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("Password must be at least 6 characters long.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please verify your password.");
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
        res?.message || "Registration successful! A 6-digit OTP code has been sent to your email."
      );
      setIsOtpStep(true);
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(err?.message || "Registration failed. Please try again.");
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
      setErrorMessage("Please enter the complete 6-digit OTP code.");
      return;
    }

    setOtpLoading(true);
    try {
      const res = await verifyOtp(email.trim(), cleanCode);
      setSuccessMessage(res?.message || "Account activated successfully! Redirecting...");

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
      setErrorMessage(err?.message || "Invalid or expired OTP code.");
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
      setSuccessMessage(res?.message || "A new OTP code has been sent to your email.");
      setResendCooldown(60);
    } catch (err) {
      setErrorMessage(err?.message || "Failed to resend OTP code. Please try again.");
    } finally {
      setResendLoading(false);
    }
  };

  const openOtpForEmail = (targetEmail) => {
    setEmail(targetEmail);
    setIsOtpStep(true);
    setErrorMessage("");
    setSuccessMessage("Please enter the OTP sent to " + targetEmail);
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
