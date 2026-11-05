import { useRef, useEffect, useState } from "react";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import GridGradientBackground from "@/components/ui/grid-gradient-background";
import { useAuth } from "../context/AuthContext";
import { useLogin } from "../hooks/useLogin";
import { useRegister } from "../hooks/useRegister";
import { useLanguage } from "../context/LanguageContext";
import ThemeSwitcher from "../components/ThemeSwitcher";
import LanguageSwitcher from "../components/LanguageSwitcher";
import { cn } from "@/lib/utils";
import { getDefaultRouteForUser } from "../constants/roles";

const slideVariants = {
  enter: (direction) => ({
    x: direction > 0 ? 36 : -36,
    opacity: 0,
    filter: "blur(4px)",
  }),
  center: {
    x: 0,
    opacity: 1,
    filter: "blur(0px)",
    transition: {
      duration: 0.28,
      ease: [0.22, 1, 0.36, 1],
    },
  },
  exit: (direction) => ({
    x: direction > 0 ? -36 : 36,
    opacity: 0,
    filter: "blur(4px)",
    transition: {
      duration: 0.2,
      ease: [0.22, 1, 0.36, 1],
    },
  }),
};

export default function AuthScene() {
  const navigate = useNavigate();
  const location = useLocation();
  const { googleLogin } = useAuth();
  const { t } = useLanguage();

  const isRegister = location.pathname.startsWith("/register");

  // Track navigation direction: 1 = going to register (slide left), -1 = going to login (slide right)
  const prevPathRef = useRef(location.pathname);
  const direction = isRegister ? 1 : -1;

  useEffect(() => {
    prevPathRef.current = location.pathname;
    setGoogleError("");
  }, [location.pathname]);

  // Google OAuth state & hidden button ref
  const googleHiddenBtnRef = useRef(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGoogleCredential = async (idToken) => {
    setGoogleLoading(true);
    setGoogleError("");
    try {
      const res = await googleLogin(idToken);
      const user = res?.data?.user;
      setTimeout(() => {
        const dest = getDefaultRouteForUser(user);
        navigate(dest);
      }, 700);
    } catch (err) {
      setGoogleError(err?.message || "Google sign-in failed. Please try again.");
    } finally {
      setGoogleLoading(false);
    }
  };

  useEffect(() => {
    const clientId =
      import.meta.env.VITE_GOOGLE_CLIENT_ID ||
      "827798715826-ef477sod2l5a1f34484no0v78r1fbdsl.apps.googleusercontent.com";

    const initGsi = () => {
      if (window.google?.accounts?.id) {
        // Prevent duplicate initialize() calls causing [GSI_LOGGER] multiple calls warning
        if (window.__gsiInitializedClientId !== clientId) {
          try {
            window.google.accounts.id.initialize({
              client_id: clientId,
              callback: async (response) => {
                if (response?.credential) {
                  await handleGoogleCredential(response.credential);
                }
              },
              auto_select: false,
              cancel_on_tap_outside: true,
            });
            window.__gsiInitializedClientId = clientId;
          } catch (err) {
            console.warn("Google Identity initialization error:", err);
          }
        }

        if (googleHiddenBtnRef.current && !googleHiddenBtnRef.current.hasChildNodes()) {
          try {
            window.google.accounts.id.renderButton(googleHiddenBtnRef.current, {
              type: "standard",
              theme: "outline",
              size: "large",
              width: 320,
            });
          } catch (err) {
            console.warn("Google renderButton error:", err);
          }
        }
      }
    };

    if (window.google?.accounts?.id) {
      initGsi();
    } else {
      const timer = setInterval(() => {
        if (window.google?.accounts?.id) {
          clearInterval(timer);
          initGsi();
        }
      }, 250);
      return () => clearInterval(timer);
    }
  }, []);

  const handleGoogleBtnClick = () => {
    if (googleLoading) return;
    setGoogleError("");

    if (!window.google?.accounts?.id) {
      setGoogleError(
        t(
          "auth.google_init_error",
          "Google Sign-In đang khởi động. Vui lòng thử lại sau vài giây hoặc kiểm tra kết nối mạng."
        )
      );
      return;
    }

    const nativeBtn =
      googleHiddenBtnRef.current?.querySelector('div[role="button"]') ||
      googleHiddenBtnRef.current?.querySelector('div[tabindex="0"]');

    if (nativeBtn) {
      nativeBtn.click();
    } else {
      const currentOrigin = window.location.origin;
      const altOrigin =
        window.location.hostname === "localhost"
          ? `http://127.0.0.1:${window.location.port || 5173}`
          : `http://localhost:${window.location.port || 5173}`;

      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed() || notification.isSkippedMoment()) {
          setGoogleError(
            t(
              "auth.google_origin_warning",
              `Đăng nhập Google bị chặn: Nguồn truy cập (${currentOrigin}) chưa được cấp quyền trong Google Cloud Console. Hãy thử truy cập bằng ${altOrigin} hoặc đăng nhập trực tiếp bằng Email/Mật khẩu bên dưới.`
            )
          );
        }
      });
    }
  };

  // Login hook
  const {
    email: loginEmail,
    setEmail: setLoginEmail,
    password: loginPassword,
    setPassword: setLoginPassword,
    showPassword: showLoginPassword,
    setShowPassword: setShowLoginPassword,
    rememberMe,
    setRememberMe,
    loading: loginLoading,
    errorMessage: loginError,
    successMessage: loginSuccess,
    sessionExpired,
    unverifiedEmail,
    handleSubmit: handleLoginSubmit,
  } = useLogin();

  // Register hook
  const {
    fullName,
    setFullName,
    email: registerEmail,
    setEmail: setRegisterEmail,
    phoneNumber,
    setPhoneNumber,
    password: registerPassword,
    setPassword: setRegisterPassword,
    confirmPassword,
    setConfirmPassword,
    showPassword: showRegisterPassword,
    setShowPassword: setShowRegisterPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    isOtpStep,
    setIsOtpStep,
    otpCode,
    setOtpCode,
    resendCooldown,
    loading: registerLoading,
    otpLoading,
    resendLoading,
    errorMessage: registerError,
    successMessage: registerSuccess,
    handleSubmit: handleRegisterSubmit,
    handleVerifyOtp,
    handleResendOtp,
    openOtpForEmail,
  } = useRegister();

  const hasConfirm = confirmPassword.length > 0;
  const isMatch = hasConfirm && registerPassword === confirmPassword;
  const isMismatch = hasConfirm && registerPassword !== confirmPassword;

  return (
    <GridGradientBackground className="flex min-h-screen flex-col overflow-x-hidden overflow-y-auto">
      {/* Hidden real GSI container for triggering standard popup */}
      <div ref={googleHiddenBtnRef} className="hidden pointer-events-none opacity-0 fixed -top-[1000px]" aria-hidden="true" />

      {/* Header */}
      <header className="relative z-10 flex-shrink-0 h-[64px] sm:h-[68px] border-b border-zinc-200/80 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 backdrop-blur-md select-none">
        <div className="mx-auto flex h-full max-w-[1100px] items-center justify-between px-4 lg:px-6">
          <Link to="/home" className="flex items-center gap-3 transition hover:opacity-90">
            <div className="flex h-9 w-9 sm:h-10 sm:w-10 items-center justify-center rounded-[12px] bg-gradient-to-br from-zinc-900 to-zinc-800 text-white shadow-md">
              <span className="material-symbols-outlined text-[20px] sm:text-[22px]">warehouse</span>
            </div>
            <span className="text-[20px] sm:text-[21px] tracking-tight">
              <span className="font-black text-[#0a3d91]">G1</span>
              <span className="font-bold text-[#0b1c30]">SelfStorage</span>
            </span>
          </Link>
          <div className="flex items-center gap-2">
            <ThemeSwitcher />
            <LanguageSwitcher />
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="relative z-10 flex flex-1 items-center justify-center px-3.5 sm:px-4 py-5 sm:py-7 lg:py-9">
        <div className="mx-auto w-full max-w-[450px] sm:max-w-[475px] my-auto">
          {/* Card Container */}
          <motion.section
            layout
            transition={{
              layout: { duration: 0.32, ease: [0.22, 1, 0.36, 1] },
            }}
            className="relative overflow-hidden rounded-[20px] sm:rounded-[24px] border border-zinc-200/80 dark:border-zinc-800 bg-white/90 dark:bg-zinc-900/90 p-5 sm:p-7 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.06)] backdrop-blur-xl"
          >
            {/* Smooth Tab Switcher */}
            <div className="mb-6 flex h-11 rounded-[12px] bg-zinc-100/80 dark:bg-zinc-800/80 p-1 backdrop-blur-md">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={cn(
                  "relative flex h-full flex-1 items-center justify-center rounded-[9px] text-[13px] font-semibold transition-colors duration-200",
                  !isRegister ? "text-[#0b1c30]" : "text-[#587291] hover:text-[#0b1c30]"
                )}
              >
                {!isRegister && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-[9px] bg-white shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">login</span>
                  {t("auth.sign_in", "Sign In")}
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className={cn(
                  "relative flex h-full flex-1 items-center justify-center rounded-[9px] text-[13px] font-semibold transition-colors duration-200",
                  isRegister ? "text-[#0b1c30]" : "text-[#587291] hover:text-[#0b1c30]"
                )}
              >
                {isRegister && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-[9px] bg-white shadow-xs"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">person_add</span>
                  {t("auth.sign_up", "Sign Up")}
                </span>
              </button>
            </div>

            {/* Google error banner */}
            {googleError && (
              <div className="mb-4 flex items-center justify-between gap-2 rounded-[10px] border border-red-300 bg-red-50/90 p-3 text-[13px] text-red-800 backdrop-blur-sm">
                <div className="flex items-center gap-2">
                <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
                <span>{googleError}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setGoogleError("")}
                  className="rounded p-0.5 text-red-500 hover:bg-red-100 hover:text-red-700 transition cursor-pointer"
                  title={t("common.close", "Đóng")}
                >
                  <span className="material-symbols-outlined text-[16px]">close</span>
                </button>
              </div>
            )}

            {/* Smooth Animated Scene Content */}
            <AnimatePresence mode="wait" custom={direction} initial={false}>
              {!isRegister ? (
                /* ================= SIGN IN VIEW ================= */
                <motion.div
                  key="signin-scene"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <h1 className="text-[24px] font-bold tracking-tight text-[#0b1c30]">
                      {t("auth.sign_in", "Sign In")}
                    </h1>
                  </div>

                  {/* Status & Error Alerts */}
                  {sessionExpired && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-amber-300 bg-amber-50/80 p-3 text-[13px] text-amber-900 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                      <span>{t("auth.session_expired", "Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.")}</span>
                    </div>
                  )}

                  {loginError && (
                    <div className="rounded-[10px] border border-red-300 bg-red-50/80 p-3 text-[13px] text-red-800 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
                        <span>{loginError}</span>
                      </div>
                      {unverifiedEmail && (
                        <div className="mt-2.5 flex items-center justify-between border-t border-red-200/80 pt-2 text-[12px]">
                          <span>{t("auth.activate_account_prompt", "Kích hoạt tài khoản này?")}</span>
                          <button
                            type="button"
                            onClick={() => {
                              openOtpForEmail(unverifiedEmail);
                              navigate("/register");
                            }}
                            className="font-bold text-zinc-900 dark:text-zinc-100 hover:underline"
                          >
                            {t("auth.verify_otp_link", "Xác thực mã OTP →")}
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {loginSuccess && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-emerald-300 bg-emerald-50/80 p-3 text-[13px] text-emerald-800 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                      <span>{loginSuccess}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={(e) => { setGoogleError(""); handleLoginSubmit(e); }} className="space-y-3.5">
                    <div>
                      <label htmlFor="login-email" className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                        {t("auth.email_or_username", "Email or Username")}
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">
                          mail
                        </span>
                        <input
                          id="login-email"
                          name="email"
                          type="email"
                          autoComplete="username"
                          required
                          value={loginEmail}
                          onChange={(e) => { if (googleError) setGoogleError(""); setLoginEmail(e.target.value); }}
                          className="h-11 w-full rounded-[12px] border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 pl-10 pr-4 text-[13px] text-[#122033] outline-none backdrop-blur-md transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label htmlFor="login-password" className="text-[13px] font-semibold text-[#0f172a]">
                          {t("auth.password", "Password")}
                        </label>
                        <button
                          type="button"
                          className="text-[12px] font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                        >
                          {t("auth.forgot_password", "Forgot password?")}
                        </button>
                      </div>

                      <div className="relative">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">
                          lock
                        </span>
                        <input
                          id="login-password"
                          name="password"
                          type={showLoginPassword ? "text" : "password"}
                          autoComplete="current-password"
                          required
                          value={loginPassword}
                          onChange={(e) => { if (googleError) setGoogleError(""); setLoginPassword(e.target.value); }}
                          className="h-11 w-full rounded-[12px] border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 pl-10 pr-10 text-[13px] text-[#122033] outline-none backdrop-blur-md transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          aria-label={showLoginPassword ? "Hide password" : "Show password"}
                          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#687586] hover:text-[#0f172a]"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showLoginPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center pt-0.5">
                      <label className="flex cursor-pointer items-center gap-2 text-[13px] text-[#455265]">
                        <input
                          id="login-remember"
                          name="rememberMe"
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded accent-zinc-900"
                        />
                        {t("auth.remember_me", "Remember me")}
                      </label>
                    </div>

                    {/* Submit button - Đồng bộ chiều cao h-11 */}
                    <button
                      type="submit"
                      disabled={loginLoading || googleLoading}
                      className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-[14px] font-bold text-white shadow-xs transition hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-70 cursor-pointer"
                    >
                      {loginLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {t("auth.signing_in", "Signing in...")}
                        </span>
                      ) : (
                        t("auth.sign_in", "Sign In")
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="my-4 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7a8595]">
                    <span className="h-px flex-1 bg-black/10" />
                    {t("auth.or_continue_with", "or continue with")}
                    <span className="h-px flex-1 bg-black/10" />
                  </div>

                  {/* Google Sign In - Đồng bộ chiều cao h-11 */}
                  <div>
                    <button
                      type="button"
                      disabled={googleLoading || loginLoading}
                      onClick={handleGoogleBtnClick}
                      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[12px] border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 text-[13px] font-semibold text-[#182638] shadow-sm backdrop-blur-md transition hover:bg-white disabled:opacity-60"
                    >
                      {googleLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin text-zinc-900 dark:text-zinc-100" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          {t("auth.connecting_google", "Đang kết nối Google...")}
                        </span>
                      ) : (
                        <>
                          <svg className="h-4 w-4" viewBox="0 0 24 24">
                            <path
                              fill="#4285F4"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="#34A853"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="#FBBC05"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="#EA4335"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          {t("auth.continue_google", "Continue with Google")}
                        </>
                      )}
                    </button>
                  </div>

                  {/* Switch to Sign Up */}
                  <div className="pt-2 text-center text-[13px] text-[#5f6c7a]">
                    {t("auth.no_account", "Don't have an account?")}{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                    >
                      {t("auth.sign_up", "Sign up")}
                    </button>
                  </div>
                </motion.div>
              ) : (
                /* ================= SIGN UP / OTP VIEW ================= */
                <motion.div
                  key="signup-scene"
                  custom={direction}
                  variants={slideVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  className="space-y-4"
                >
                  <div className="mb-2">
                    <h1 className="text-[24px] font-bold tracking-tight text-[#0b1c30]">
                      {isOtpStep ? t("auth.verify_account_title", "Xác thực tài khoản") : t("auth.sign_up", "Đăng ký tài khoản")}
                    </h1>
                    {isOtpStep && (
                      <p className="mt-1 text-[13px] text-[#58657a]">
                        {t("auth.verify_account_subtitle", "Nhập mã gồm 6 chữ số đã được gửi đến email của bạn")}
                      </p>
                    )}
                  </div>

                  {/* Status & Error Alerts */}
                  {registerError && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-red-300 bg-red-50/80 p-3 text-[13px] text-red-800 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[18px] text-red-600">error</span>
                      <span>{registerError}</span>
                    </div>
                  )}

                  {registerSuccess && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-emerald-300 bg-emerald-50/80 p-3 text-[13px] text-emerald-800 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[18px] text-emerald-600">check_circle</span>
                      <span>{registerSuccess}</span>
                    </div>
                  )}

                  {isOtpStep ? (
                    /* OTP Verification Step */
                    <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#dbeafe]/80 text-zinc-900 dark:text-zinc-100 backdrop-blur-sm">
                        <span className="material-symbols-outlined text-[28px]">mark_email_read</span>
                      </div>

                      <div className="text-[13px] text-[#58657a]">
                        {t("auth.sent_code_to", "Chúng tôi đã gửi mã xác thực gồm 6 chữ số tới")}{" "}
                        <strong className="text-[#0b1c30]">{registerEmail}</strong>.
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="h-12 w-52 rounded-[12px] border-2 border-zinc-900 dark:border-zinc-100 bg-white/80 text-center font-mono text-[24px] font-bold tracking-[0.3em] text-[#0b1c30] outline-none shadow-sm backdrop-blur-md focus:bg-white focus:ring-4 focus:ring-[#dbeafe]"
                        />
                        <div className="mt-1.5 text-[11px] text-[#8996a9]">
                          {t("auth.code_valid_time", "Mã có hiệu lực trong 10 phút")}
                        </div>
                      </div>

                      <div className="space-y-3 pt-1">
                        <button
                          type="submit"
                          disabled={otpLoading || otpCode.length !== 6}
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-[14px] font-bold text-white shadow-xs transition hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-60"
                        >
                          {otpLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              {t("auth.verifying", "Đang xác thực...")}
                            </span>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[18px]">verified</span>
                              {t("auth.verify_and_activate", "Xác thực & Kích hoạt")}
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-between text-[12px]">
                          <button
                            type="button"
                            onClick={() => setIsOtpStep(false)}
                            className="font-medium text-[#58657a] hover:underline"
                          >
                            {t("auth.back_to_edit", "← Quay lại chỉnh sửa")}
                          </button>

                          <button
                            type="button"
                            disabled={resendLoading || resendCooldown > 0}
                            onClick={handleResendOtp}
                            className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline disabled:opacity-50"
                          >
                            {resendCooldown > 0
                              ? `${t("auth.resend_in", "Gửi lại sau")} ${resendCooldown}s`
                              : resendLoading
                              ? t("auth.resending", "Đang gửi lại...")
                              : t("auth.resend_code", "Gửi lại mã")}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* Registration Form */
                    <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                      <div>
                        <label htmlFor="register-fullname" className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                          {t("auth.full_name", "Full Name")} *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">
                            person
                          </span>
                          <input
                            id="register-fullname"
                            name="fullName"
                            type="text"
                            autoComplete="name"
                            required
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-11 w-full rounded-[12px] border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 pl-10 pr-4 text-[13px] text-[#122033] outline-none backdrop-blur-md transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor="register-email" className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                            {t("auth.email_or_username", "Email Address")} *
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">
                              mail
                            </span>
                            <input
                              id="register-email"
                              name="email"
                              type="email"
                              autoComplete="email"
                              required
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              className="h-11 w-full rounded-[12px] border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 pl-10 pr-4 text-[13px] text-[#122033] outline-none backdrop-blur-md transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                            />
                          </div>
                        </div>

                        <div>
                          <label htmlFor="register-phone" className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                            {t("auth.phone_number", "Phone Number")}
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">
                              phone
                            </span>
                            <input
                              id="register-phone"
                              name="phone"
                              type="tel"
                              autoComplete="tel"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="h-11 w-full rounded-[12px] border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 pl-10 pr-4 text-[13px] text-[#122033] outline-none backdrop-blur-md transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label htmlFor="register-password" className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                            {t("auth.password", "Password")} *
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">
                              lock
                            </span>
                            <input
                              id="register-password"
                              name="newPassword"
                              type={showRegisterPassword ? "text" : "password"}
                              autoComplete="new-password"
                              required
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              className="h-11 w-full rounded-[12px] border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 pl-10 pr-10 text-[13px] text-[#122033] outline-none backdrop-blur-md transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword((prev) => !prev)}
                              aria-label={showRegisterPassword ? "Hide password" : "Show password"}
                              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#687586] hover:text-[#0f172a]"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {showRegisterPassword ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label htmlFor="register-confirm-password" className="mb-1.5 block text-[13px] font-semibold text-[#0f172a]">
                            {t("auth.confirm_password", "Confirm Password")} *
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">
                              lock_reset
                            </span>
                            <input
                              id="register-confirm-password"
                              name="confirmPassword"
                              type={showConfirmPassword ? "text" : "password"}
                              autoComplete="new-password"
                              required
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={`h-11 w-full rounded-[12px] border py-0 pl-10 pr-10 text-[13px] text-[#122033] outline-none backdrop-blur-md transition ${
                                isMismatch
                                  ? "border-red-400 bg-red-50/60 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200"
                                  : isMatch
                                  ? "border-emerald-400 bg-emerald-50/50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                                  : "border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              aria-label={showConfirmPassword ? "Hide password" : "Show password"}
                              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#687586] hover:text-[#0f172a]"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {showConfirmPassword ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                          </div>
                        </div>
                      </div>

                      {/* Password strength & match indicator */}
                      <div>
                        <div className="flex gap-1.5 pt-1">
                          <div className={`h-1.5 flex-1 rounded-full ${registerPassword.length >= 6 ? "bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900" : "bg-black/10"}`} />
                          <div className={`h-1.5 flex-1 rounded-full ${registerPassword.length >= 8 ? "bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900" : "bg-black/10"}`} />
                          <div className={`h-1.5 flex-1 rounded-full ${registerPassword.length >= 10 ? "bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900" : "bg-black/10"}`} />
                          <div
                            className={`h-1.5 flex-1 rounded-full ${
                              isMatch ? "bg-[#0e7b4c]" : isMismatch ? "bg-red-500" : "bg-black/10"
                            }`}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px]">
                          <span className="text-[#64748b]">{t("auth.min_chars", "Tối thiểu 6 ký tự")}</span>
                          {isMismatch && (
                            <span className="font-semibold text-red-600">{t("auth.passwords_must_match", "✕ Mật khẩu phải khớp nhau")}</span>
                          )}
                          {isMatch && (
                            <span className="font-semibold text-emerald-600">{t("auth.passwords_match", "✓ Mật khẩu khớp")}</span>
                          )}
                          {!hasConfirm && (
                            <span className="text-[#8996a9]">{t("auth.passwords_hint", "Mật khẩu xác nhận cần trùng khớp")}</span>
                          )}
                        </div>
                      </div>

                      {/* Terms agreement */}
                      <div className="pt-0.5">
                        <label className="flex items-start gap-2 text-[12px] text-[#455265]">
                          <input
                            id="register-terms"
                            name="terms"
                            type="checkbox"
                            required
                            defaultChecked
                            className="mt-0.5 h-4 w-4 rounded accent-zinc-900"
                          />
                          <span>
                            {t("auth.terms_agreement", "Tôi đồng ý với Điều khoản dịch vụ và Chính sách bảo mật.")}
                          </span>
                        </label>
                      </div>

                      {/* Submit button - Đồng bộ chiều cao h-11 */}
                      <button
                        type="submit"
                        disabled={registerLoading || googleLoading}
                        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-zinc-900 dark:bg-zinc-100 dark:text-zinc-900 text-[14px] font-bold text-white shadow-xs transition hover:bg-zinc-800 dark:hover:bg-zinc-200 disabled:opacity-70 cursor-pointer"
                      >
                        {registerLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            {t("auth.creating_account", "Signing up...")}
                          </span>
                        ) : (
                          t("auth.sign_up", "Sign Up")
                        )}
                      </button>

                      {/* Divider */}
                      <div className="my-4 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7a8595]">
                        <span className="h-px flex-1 bg-black/10" />
                        {t("auth.or_continue_with", "hoặc tiếp tục với")}
                        <span className="h-px flex-1 bg-black/10" />
                      </div>

                      {/* Google Sign Up - Đồng bộ chiều cao h-11 */}
                      <div>
                        <button
                          type="button"
                          disabled={googleLoading || registerLoading}
                          onClick={handleGoogleBtnClick}
                          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[12px] border border-zinc-200/90 dark:border-zinc-800 bg-white/95 dark:bg-zinc-900/90 text-[13px] font-semibold text-[#182638] shadow-sm backdrop-blur-md transition hover:bg-white disabled:opacity-60"
                        >
                          {googleLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="h-4 w-4 animate-spin text-zinc-900 dark:text-zinc-100" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              {t("auth.connecting_google", "Đang kết nối Google...")}
                            </span>
                          ) : (
                            <>
                              <svg className="h-4 w-4" viewBox="0 0 24 24">
                                <path
                                  fill="#4285F4"
                                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                                />
                                <path
                                  fill="#34A853"
                                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                                />
                                <path
                                  fill="#FBBC05"
                                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                                />
                                <path
                                  fill="#EA4335"
                                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                                />
                              </svg>
                              {t("auth.continue_google", "Continue with Google")}
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Switch to Sign In */}
                  <div className="pt-2 text-center text-[13px] text-[#5f6c7a]">
                    {t("auth.already_have_account", "Đã có tài khoản?")}{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="font-semibold text-zinc-900 dark:text-zinc-100 hover:underline"
                    >
                      {t("auth.sign_in", "Sign in")}
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </main>

      {/* Footer - Màu xanh biển nhạt ở dạng tĩnh */}
      <footer className="relative z-10 flex-shrink-0 border-t border-zinc-200/80 dark:border-zinc-800 bg-white/85 dark:bg-zinc-900/85 px-4 py-3.5 sm:py-4 text-[12px] text-[#475569] backdrop-blur-md select-none">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-2 sm:flex-row">
          <div>
            © 2025 <span className="font-black text-[#0a3d91]">G1</span><span className="font-bold text-[#0b1c30]">SelfStorage</span>. {t("auth.all_rights_reserved", "Bảo lưu mọi quyền.")}
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#64748b]">
            <Link to="/support" className="transition hover:text-zinc-900 dark:text-zinc-100 hover:underline">{t("auth.help_center", "Trung tâm trợ giúp")}</Link>
            <span>•</span>
            <span>{t("auth.terms_service", "Điều khoản dịch vụ")}</span>
            <span>•</span>
            <span>{t("auth.privacy_policy", "Chính sách bảo mật")}</span>
          </div>
        </div>
      </footer>
    </GridGradientBackground>
  );
}
