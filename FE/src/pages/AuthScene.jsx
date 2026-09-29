import { useRef, useEffect, useState, useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useAuth } from "../hooks/useAuth";
import { useLogin } from "../hooks/useLogin";
import { useRegister } from "../hooks/useRegister";
import { cn } from "@/lib/utils";

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

  const isRegister = location.pathname.startsWith("/register");

  // Track navigation direction: 1 = going to register, -1 = going to login
  const prevPathRef = useRef(location.pathname);
  const direction = isRegister ? 1 : -1;

  useEffect(() => {
    prevPathRef.current = location.pathname;
  }, [location.pathname]);

  // Google OAuth state & hidden button ref
  const googleHiddenBtnRef = useRef(null);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [googleError, setGoogleError] = useState("");

  const handleGoogleCredential = useCallback(
    async (idToken) => {
      setGoogleLoading(true);
      setGoogleError("");
      try {
        const res = await googleLogin(idToken);
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
        }, 600);
      } catch (err) {
        setGoogleError(
          err?.message || "Đăng nhập Google thất bại. Vui lòng thử lại bằng email và mật khẩu."
        );
      } finally {
        setGoogleLoading(false);
      }
    },
    [googleLogin, navigate]
  );

  // Initialize Google Identity Services
  useEffect(() => {
    const initGsi = () => {
      if (window.google?.accounts?.id) {
        window.google.accounts.id.initialize({
          client_id:
            import.meta.env.VITE_GOOGLE_CLIENT_ID ||
            "928800899912-81ire3k9j09sibcegq1hriqgg231ahqr.apps.googleusercontent.com",
          callback: async (response) => {
            if (response?.credential) {
              await handleGoogleCredential(response.credential);
            }
          },
          auto_select: false,
          cancel_on_tap_outside: true,
        });

        if (googleHiddenBtnRef.current) {
          window.google.accounts.id.renderButton(googleHiddenBtnRef.current, {
            type: "standard",
            theme: "outline",
            size: "large",
            width: 320,
          });
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
  }, [handleGoogleCredential]);

  const handleGoogleBtnClick = () => {
    if (googleLoading) return;
    setGoogleError("");

    if (!window.google?.accounts?.id) {
      setGoogleError("Dịch vụ Google đang khởi tạo. Vui lòng thử lại sau vài giây hoặc tắt trình chặn quảng cáo.");
      return;
    }

    const nativeBtn =
      googleHiddenBtnRef.current?.querySelector('div[role="button"]') ||
      googleHiddenBtnRef.current?.querySelector('div[tabindex="0"]');

    if (nativeBtn) {
      nativeBtn.click();
    } else {
      window.google.accounts.id.prompt((notification) => {
        if (notification.isNotDisplayed()) {
          setGoogleError("Không thể mở cửa sổ Google. Vui lòng cho phép popup trên trình duyệt.");
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

  // Password matching check
  const hasConfirm = confirmPassword.length > 0;
  const isMatch = hasConfirm && registerPassword === confirmPassword;
  const isMismatch = hasConfirm && registerPassword !== confirmPassword;

  return (
    <div className="relative flex min-h-screen flex-col justify-between overflow-x-hidden bg-[#071322] font-sans text-white">
      {/* Background Image: Kho lưu trữ hiện đại cao cấp */}
      <div
        className="fixed inset-0 z-0 bg-cover bg-center"
        style={{
          backgroundImage: `url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=2400&q=85')`,
        }}
      />

      {/* Lớp phủ gradient Deep Navy sang trọng & làm nổi bật form */}
      <div className="fixed inset-0 z-0 bg-gradient-to-tr from-[#061220]/95 via-[#091d33]/90 to-[#0b2848]/82 backdrop-blur-[2px]" />

      {/* Ambient Glow Lights */}
      <div className="pointer-events-none fixed -left-36 -top-36 z-0 h-[460px] w-[460px] rounded-full bg-[#1d5fe5]/25 blur-[140px]" />
      <div className="pointer-events-none fixed -bottom-36 -right-36 z-0 h-[460px] w-[460px] rounded-full bg-[#0ea5e9]/18 blur-[140px]" />
      <div className="pointer-events-none fixed top-1/2 left-1/3 z-0 h-[380px] w-[380px] -translate-y-1/2 rounded-full bg-[#3b82f6]/10 blur-[130px]" />

      {/* Hidden container for Google rendered button */}
      <div
        ref={googleHiddenBtnRef}
        aria-hidden="true"
        className="pointer-events-none absolute -left-[9999px] -top-[9999px] opacity-0"
      />

      {/* Main Content Area */}
      <main className="relative z-10 flex flex-1 items-center justify-center p-4 sm:p-6 lg:p-8">
        <div className="mx-auto flex w-full max-w-[1040px] flex-col items-center justify-center lg:flex-row lg:items-center lg:gap-14">
          
          {/* Left Hero / Brand showcase */}
          <section className="mb-8 flex flex-col justify-center text-center lg:mb-0 lg:w-[480px] lg:text-left">
            {/* Logo Thương hiệu */}
            <div className="mb-5 flex items-center justify-center gap-2.5 lg:justify-start">
              <div className="flex h-10 w-10 items-center justify-center rounded-[12px] bg-[#1d5fe5] text-white shadow-[0_8px_20px_rgba(29,95,229,0.35)]">
                <span className="material-symbols-outlined text-[22px]">warehouse</span>
              </div>
              <span className="text-[22px] tracking-tight">
                <span className="font-black text-[#60a5fa]">G1</span>
                <span className="font-bold text-white">SelfStorage</span>
              </span>
            </div>

            <div className="inline-flex items-center justify-center gap-2 self-center rounded-full border border-white/20 bg-white/10 px-3.5 py-1 text-[12px] font-bold text-[#93c5fd] shadow-sm backdrop-blur-md lg:self-start">
              <span className="material-symbols-outlined text-[16px]">verified_user</span>
              Kho Tự Quản An Ninh Chuẩn ISO
            </div>

            <h2 className="mt-4 text-[30px] sm:text-[36px] font-black leading-tight tracking-[-0.03em] text-white drop-shadow-md">
              Quản lý kho an toàn, tiện lợi &amp; bảo mật
            </h2>
            <p className="mt-2 text-[14px] leading-relaxed text-[#c4d7ec]">
              Khóa điện tử không chạm 24/7, kiểm soát nhiệt ẩm máy lạnh và hợp đồng thuê linh hoạt trực tuyến.
            </p>

            <div className="mt-6 hidden space-y-3 sm:block">
              <div className="flex items-center gap-3 rounded-[14px] border border-white/15 bg-white/[0.08] p-3.5 shadow-sm backdrop-blur-md transition hover:bg-white/[0.12]">
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-white/15 text-[#60a5fa]">
                  <span className="material-symbols-outlined text-[18px]">key</span>
                </span>
                <div className="text-left text-[12px]">
                  <div className="font-bold text-white">Khóa số thông minh 24/7</div>
                  <div className="text-[#94a3b8]">Mở cổng và ô kho trực tiếp qua điện thoại</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[14px] border border-white/15 bg-white/[0.08] p-3.5 shadow-sm backdrop-blur-md transition hover:bg-white/[0.12]">
                <span className="flex h-9 w-9 items-center justify-center rounded-[9px] bg-white/15 text-[#60a5fa]">
                  <span className="material-symbols-outlined text-[18px]">receipt_long</span>
                </span>
                <div className="text-left text-[12px]">
                  <div className="font-bold text-white">Báo giá &amp; cọc minh bạch</div>
                  <div className="text-[#94a3b8]">Không phí phát sinh, hoàn trả 100% tiền cọc</div>
                </div>
              </div>
            </div>
          </section>

          {/* Right Card: Dynamic Auth Box */}
          <motion.section
            layout
            transition={{ type: "spring", stiffness: 350, damping: 30 }}
            className="w-full max-w-[460px] rounded-[24px] border border-white/40 bg-white/95 p-6 shadow-[0_25px_60px_rgba(0,0,0,0.38)] backdrop-blur-2xl sm:p-8 text-[#0b1c30]"
          >
            {/* Top Switcher Tab */}
            <div className="relative mb-6 flex h-11 rounded-[12px] bg-[#f0f4fa] p-1">
              <button
                type="button"
                onClick={() => navigate("/login")}
                className={cn(
                  "relative flex h-full flex-1 items-center justify-center rounded-[9px] text-[13px] font-bold transition-colors duration-200",
                  !isRegister ? "text-[#0b1c30]" : "text-[#587291] hover:text-[#0b1c30]"
                )}
              >
                {!isRegister && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-[9px] bg-white shadow-[0_2px_8px_rgba(29,95,229,0.12)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">login</span>
                  Đăng nhập
                </span>
              </button>

              <button
                type="button"
                onClick={() => navigate("/register")}
                className={cn(
                  "relative flex h-full flex-1 items-center justify-center rounded-[9px] text-[13px] font-bold transition-colors duration-200",
                  isRegister ? "text-[#0b1c30]" : "text-[#587291] hover:text-[#0b1c30]"
                )}
              >
                {isRegister && (
                  <motion.div
                    layoutId="auth-tab-pill"
                    className="absolute inset-0 rounded-[9px] bg-white shadow-[0_2px_8px_rgba(29,95,229,0.12)]"
                    transition={{ type: "spring", stiffness: 450, damping: 35 }}
                  />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[17px]">person_add</span>
                  Đăng ký
                </span>
              </button>
            </div>

            {/* Google error banner */}
            {googleError && (
              <div className="mb-4 flex items-center gap-2 rounded-[10px] border border-red-300 bg-red-50/90 p-3 text-[12px] text-red-800 backdrop-blur-sm">
                <span className="material-symbols-outlined text-[17px] text-red-600">error</span>
                <span>{googleError}</span>
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
                  <div className="mb-1">
                    <h1 className="text-[22px] font-bold tracking-tight text-[#0b1c30]">
                      Đăng nhập tài khoản
                    </h1>
                    <p className="text-[12px] text-[#64748b]">
                      Truy cập kho lưu trữ và hóa đơn dịch vụ của bạn
                    </p>
                  </div>

                  {/* Status & Error Alerts */}
                  {sessionExpired && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-amber-300 bg-amber-50/80 p-3 text-[12px] text-amber-900 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[17px] text-amber-600">warning</span>
                      <span>Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.</span>
                    </div>
                  )}

                  {loginError && (
                    <div className="rounded-[10px] border border-red-300 bg-red-50/80 p-3 text-[12px] text-red-800 backdrop-blur-sm">
                      <div className="flex items-center gap-2">
                        <span className="material-symbols-outlined text-[17px] text-red-600">error</span>
                        <span>{loginError}</span>
                      </div>
                      {unverifiedEmail && (
                        <div className="mt-2.5 flex items-center justify-between border-t border-red-200/80 pt-2 text-[11px]">
                          <span>Kích hoạt tài khoản này ngay?</span>
                          <button
                            type="button"
                            onClick={() => {
                              openOtpForEmail(unverifiedEmail);
                              navigate("/register");
                            }}
                            className="font-bold text-[#1d5fe5] hover:underline"
                          >
                            Nhập mã OTP →
                          </button>
                        </div>
                      )}
                    </div>
                  )}

                  {loginSuccess && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-emerald-300 bg-emerald-50/80 p-3 text-[12px] text-emerald-800 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
                      <span>{loginSuccess}</span>
                    </div>
                  )}

                  {/* Form */}
                  <form onSubmit={handleLoginSubmit} className="space-y-3.5">
                    <div>
                      <label className="mb-1.5 block text-[12px] font-bold text-[#0b1c30]">
                        Địa chỉ Email
                      </label>
                      <div className="relative">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                          mail
                        </span>
                        <input
                          type="email"
                          required
                          placeholder="name@example.com"
                          value={loginEmail}
                          onChange={(e) => setLoginEmail(e.target.value)}
                          className="h-11 w-full rounded-[12px] border border-blue-200/80 bg-white/80 pl-10 pr-4 text-[13px] text-[#0b1c30] outline-none backdrop-blur-md transition focus:border-[#1d5fe5] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="mb-1.5 flex items-center justify-between">
                        <label className="text-[12px] font-bold text-[#0b1c30]">
                          Mật khẩu
                        </label>
                        <button
                          type="button"
                          className="text-[11px] font-semibold text-[#1d5fe5] hover:underline"
                        >
                          Quên mật khẩu?
                        </button>
                      </div>

                      <div className="relative">
                        <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                          lock
                        </span>
                        <input
                          type={showLoginPassword ? "text" : "password"}
                          required
                          placeholder="••••••••"
                          value={loginPassword}
                          onChange={(e) => setLoginPassword(e.target.value)}
                          className="h-11 w-full rounded-[12px] border border-blue-200/80 bg-white/80 pl-10 pr-10 text-[13px] text-[#0b1c30] outline-none backdrop-blur-md transition focus:border-[#1d5fe5] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                        />
                        <button
                          type="button"
                          onClick={() => setShowLoginPassword((prev) => !prev)}
                          className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#8996a9] hover:text-[#0b1c30]"
                        >
                          <span className="material-symbols-outlined text-[18px]">
                            {showLoginPassword ? "visibility_off" : "visibility"}
                          </span>
                        </button>
                      </div>
                    </div>

                    {/* Remember me */}
                    <div className="flex items-center pt-0.5">
                      <label className="flex cursor-pointer items-center gap-2 text-[12px] text-[#58657a]">
                        <input
                          type="checkbox"
                          checked={rememberMe}
                          onChange={(e) => setRememberMe(e.target.checked)}
                          className="h-4 w-4 rounded accent-[#1d5fe5]"
                        />
                        Ghi nhớ đăng nhập
                      </label>
                    </div>

                    {/* Submit button */}
                    <button
                      type="submit"
                      disabled={loginLoading || googleLoading}
                      className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(29,95,229,0.22)] transition hover:bg-[#174fc7] disabled:opacity-70"
                    >
                      {loginLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Đang đăng nhập...
                        </span>
                      ) : (
                        "Đăng nhập"
                      )}
                    </button>
                  </form>

                  {/* Divider */}
                  <div className="my-3 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8996a9]">
                    <span className="h-px flex-1 bg-black/10" />
                    hoặc tiếp tục với
                    <span className="h-px flex-1 bg-black/10" />
                  </div>

                  {/* Google Sign In */}
                  <div>
                    <button
                      type="button"
                      disabled={googleLoading || loginLoading}
                      onClick={handleGoogleBtnClick}
                      className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[12px] border border-blue-200/80 bg-white/80 text-[13px] font-semibold text-[#0b1c30] shadow-sm backdrop-blur-md transition hover:bg-white disabled:opacity-60"
                    >
                      {googleLoading ? (
                        <span className="flex items-center justify-center gap-2">
                          <svg className="h-4 w-4 animate-spin text-[#1d5fe5]" viewBox="0 0 24 24" fill="none">
                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                          </svg>
                          Đang kết nối Google...
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
                          Đăng nhập bằng Google
                        </>
                      )}
                    </button>
                  </div>

                  {/* Switch to Sign Up */}
                  <div className="pt-2 text-center text-[12px] text-[#58657a]">
                    Chưa có tài khoản?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/register")}
                      className="font-bold text-[#1d5fe5] hover:underline"
                    >
                      Đăng ký ngay
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
                  <div className="mb-1">
                    <h1 className="text-[22px] font-bold tracking-tight text-[#0b1c30]">
                      {isOtpStep ? "Xác thực tài khoản" : "Tạo tài khoản mới"}
                    </h1>
                    <p className="text-[12px] text-[#64748b]">
                      {isOtpStep
                        ? "Nhập mã OTP 6 chữ số được gửi tới email để kích hoạt"
                        : "Đăng ký thành viên để thuê kho và quản lý mã PIN truy cập"}
                    </p>
                  </div>

                  {/* Status & Error Alerts */}
                  {registerError && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-red-300 bg-red-50/80 p-3 text-[12px] text-red-800 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[17px] text-red-600">error</span>
                      <span>{registerError}</span>
                    </div>
                  )}

                  {registerSuccess && (
                    <div className="flex items-center gap-2 rounded-[10px] border border-emerald-300 bg-emerald-50/80 p-3 text-[12px] text-emerald-800 backdrop-blur-sm">
                      <span className="material-symbols-outlined text-[17px] text-emerald-600">check_circle</span>
                      <span>{registerSuccess}</span>
                    </div>
                  )}

                  {isOtpStep ? (
                    /* OTP Verification Step */
                    <form onSubmit={handleVerifyOtp} className="space-y-4 text-center">
                      <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-[#eef4ff] text-[#1d5fe5]">
                        <span className="material-symbols-outlined text-[26px]">mark_email_read</span>
                      </div>

                      <div className="text-[12px] text-[#58657a]">
                        Mã xác thực đã gửi tới <strong className="text-[#0b1c30]">{registerEmail}</strong>.
                      </div>

                      <div>
                        <input
                          type="text"
                          required
                          maxLength={6}
                          value={otpCode}
                          onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, ""))}
                          className="h-12 w-52 rounded-[12px] border-2 border-[#1d5fe5] bg-white/90 text-center font-mono text-[24px] font-black tracking-[0.3em] text-[#0b1c30] outline-none shadow-sm focus:bg-white focus:ring-4 focus:ring-[#dbeafe]"
                        />
                        <div className="mt-1.5 text-[11px] text-[#8996a9]">Mã có hiệu lực trong 10 phút</div>
                      </div>

                      <div className="space-y-3 pt-1">
                        <button
                          type="submit"
                          disabled={otpLoading || otpCode.length !== 6}
                          className="flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(29,95,229,0.22)] transition hover:bg-[#174fc7] disabled:opacity-60"
                        >
                          {otpLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Đang xác thực...
                            </span>
                          ) : (
                            <>
                              <span className="material-symbols-outlined text-[17px]">verified</span>
                              Xác thực &amp; Kích hoạt
                            </>
                          )}
                        </button>

                        <div className="flex items-center justify-between text-[12px]">
                          <button
                            type="button"
                            onClick={() => setIsOtpStep(false)}
                            className="font-semibold text-[#58657a] hover:underline"
                          >
                            ← Chỉnh sửa thông tin
                          </button>

                          <button
                            type="button"
                            disabled={resendLoading || resendCooldown > 0}
                            onClick={handleResendOtp}
                            className="font-bold text-[#1d5fe5] hover:underline disabled:opacity-50"
                          >
                            {resendCooldown > 0
                              ? `Gửi lại sau ${resendCooldown}s`
                              : resendLoading
                              ? "Đang gửi lại..."
                              : "Gửi lại mã OTP"}
                          </button>
                        </div>
                      </div>
                    </form>
                  ) : (
                    /* Registration Form */
                    <form onSubmit={handleRegisterSubmit} className="space-y-3.5">
                      <div>
                        <label className="mb-1.5 block text-[12px] font-bold text-[#0b1c30]">
                          Họ và tên *
                        </label>
                        <div className="relative">
                          <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                            person
                          </span>
                          <input
                            type="text"
                            required
                            placeholder="Nguyễn Văn A"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            className="h-11 w-full rounded-[12px] border border-blue-200/80 bg-white/80 pl-10 pr-4 text-[13px] text-[#0b1c30] outline-none backdrop-blur-md transition focus:border-[#1d5fe5] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold text-[#0b1c30]">
                            Địa chỉ Email *
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                              mail
                            </span>
                            <input
                              type="email"
                              required
                              placeholder="name@example.com"
                              value={registerEmail}
                              onChange={(e) => setRegisterEmail(e.target.value)}
                              className="h-11 w-full rounded-[12px] border border-blue-200/80 bg-white/80 pl-10 pr-4 text-[13px] text-[#0b1c30] outline-none backdrop-blur-md transition focus:border-[#1d5fe5] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                            />
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold text-[#0b1c30]">
                            Số điện thoại
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                              phone
                            </span>
                            <input
                              type="tel"
                              placeholder="0912 345 678"
                              value={phoneNumber}
                              onChange={(e) => setPhoneNumber(e.target.value)}
                              className="h-11 w-full rounded-[12px] border border-blue-200/80 bg-white/80 pl-10 pr-4 text-[13px] text-[#0b1c30] outline-none backdrop-blur-md transition focus:border-[#1d5fe5] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                            />
                          </div>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold text-[#0b1c30]">
                            Mật khẩu *
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                              lock
                            </span>
                            <input
                              type={showRegisterPassword ? "text" : "password"}
                              required
                              placeholder="Tối thiểu 6 ký tự"
                              value={registerPassword}
                              onChange={(e) => setRegisterPassword(e.target.value)}
                              className="h-11 w-full rounded-[12px] border border-blue-200/80 bg-white/80 pl-10 pr-10 text-[13px] text-[#0b1c30] outline-none backdrop-blur-md transition focus:border-[#1d5fe5] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                            />
                            <button
                              type="button"
                              onClick={() => setShowRegisterPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#8996a9] hover:text-[#0b1c30]"
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {showRegisterPassword ? "visibility_off" : "visibility"}
                              </span>
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="mb-1.5 block text-[12px] font-bold text-[#0b1c30]">
                            Xác nhận mật khẩu *
                          </label>
                          <div className="relative">
                            <span className="material-symbols-outlined pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-[18px] text-[#8996a9]">
                              lock_reset
                            </span>
                            <input
                              type={showConfirmPassword ? "text" : "password"}
                              required
                              placeholder="Nhập lại mật khẩu"
                              value={confirmPassword}
                              onChange={(e) => setConfirmPassword(e.target.value)}
                              className={`h-11 w-full rounded-[12px] border py-0 pl-10 pr-10 text-[13px] text-[#0b1c30] outline-none backdrop-blur-md transition ${
                                isMismatch
                                  ? "border-red-400 bg-red-50/60 focus:border-red-500 focus:bg-white focus:ring-2 focus:ring-red-200"
                                  : isMatch
                                  ? "border-emerald-400 bg-emerald-50/50 focus:border-emerald-500 focus:bg-white focus:ring-2 focus:ring-emerald-200"
                                  : "border-blue-200/80 bg-white/80 focus:border-[#1d5fe5] focus:bg-white focus:ring-2 focus:ring-[#dbeafe]"
                              }`}
                            />
                            <button
                              type="button"
                              onClick={() => setShowConfirmPassword((prev) => !prev)}
                              className="absolute right-3 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center text-[#8996a9] hover:text-[#0b1c30]"
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
                          <div className={`h-1.5 flex-1 rounded-full ${registerPassword.length >= 6 ? "bg-[#1d5fe5]" : "bg-black/10"}`} />
                          <div className={`h-1.5 flex-1 rounded-full ${registerPassword.length >= 8 ? "bg-[#1d5fe5]" : "bg-black/10"}`} />
                          <div className={`h-1.5 flex-1 rounded-full ${registerPassword.length >= 10 ? "bg-[#1d5fe5]" : "bg-black/10"}`} />
                          <div
                            className={`h-1.5 flex-1 rounded-full ${
                              isMatch ? "bg-[#0e7b4c]" : isMismatch ? "bg-red-500" : "bg-black/10"
                            }`}
                          />
                        </div>
                        <div className="mt-1.5 flex items-center justify-between text-[11px]">
                          <span className="text-[#64748b]">Tối thiểu 6 ký tự</span>
                          {isMismatch && (
                            <span className="font-semibold text-red-600">✕ Mật khẩu chưa khớp</span>
                          )}
                          {isMatch && (
                            <span className="font-semibold text-emerald-600">✓ Mật khẩu đã khớp</span>
                          )}
                          {!hasConfirm && (
                            <span className="text-[#8996a9]">Yêu cầu trùng khớp</span>
                          )}
                        </div>
                      </div>

                      {/* Terms agreement */}
                      <div className="pt-0.5">
                        <label className="flex items-start gap-2 text-[12px] text-[#58657a]">
                          <input
                            type="checkbox"
                            required
                            defaultChecked
                            className="mt-0.5 h-4 w-4 rounded accent-[#1d5fe5]"
                          />
                          <span>
                            Tôi đồng ý với <span className="font-semibold text-[#1d5fe5]">Điều khoản dịch vụ</span> và{" "}
                            <span className="font-semibold text-[#1d5fe5]">Chính sách bảo mật</span>.
                          </span>
                        </label>
                      </div>

                      {/* Submit button */}
                      <button
                        type="submit"
                        disabled={registerLoading || googleLoading}
                        className="mt-1 flex h-11 w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] text-[13px] font-bold text-white shadow-[0_8px_20px_rgba(29,95,229,0.22)] transition hover:bg-[#174fc7] disabled:opacity-70"
                      >
                        {registerLoading ? (
                          <span className="flex items-center justify-center gap-2">
                            <svg className="h-4 w-4 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                            </svg>
                            Đang tạo tài khoản...
                          </span>
                        ) : (
                          "Đăng ký ngay"
                        )}
                      </button>

                      {/* Divider */}
                      <div className="my-3 flex items-center justify-center gap-3 text-[11px] font-semibold uppercase tracking-[0.08em] text-[#8996a9]">
                        <span className="h-px flex-1 bg-black/10" />
                        hoặc tiếp tục với
                        <span className="h-px flex-1 bg-black/10" />
                      </div>

                      {/* Google Sign Up */}
                      <div>
                        <button
                          type="button"
                          disabled={googleLoading || registerLoading}
                          onClick={handleGoogleBtnClick}
                          className="flex h-11 w-full items-center justify-center gap-2.5 rounded-[12px] border border-blue-200/80 bg-white/80 text-[13px] font-semibold text-[#0b1c30] shadow-sm backdrop-blur-md transition hover:bg-white disabled:opacity-60"
                        >
                          {googleLoading ? (
                            <span className="flex items-center justify-center gap-2">
                              <svg className="h-4 w-4 animate-spin text-[#1d5fe5]" viewBox="0 0 24 24" fill="none">
                                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                              </svg>
                              Đang kết nối Google...
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
                              Đăng ký bằng Google
                            </>
                          )}
                        </button>
                      </div>
                    </form>
                  )}

                  {/* Switch to Sign In */}
                  <div className="pt-2 text-center text-[12px] text-[#58657a]">
                    Đã có tài khoản?{" "}
                    <button
                      type="button"
                      onClick={() => navigate("/login")}
                      className="font-bold text-[#1d5fe5] hover:underline"
                    >
                      Đăng nhập ngay
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </motion.section>
        </div>
      </main>

      {/* Footer */}
      <footer className="relative z-10 flex-shrink-0 border-t border-white/10 bg-[#061220]/80 px-4 py-3.5 text-[12px] text-[#94a3b8] backdrop-blur-md select-none">
        <div className="mx-auto flex max-w-[1100px] flex-col items-center justify-between gap-2 sm:flex-row">
          <div>
            © 2025 <span className="font-black text-[#60a5fa]">G1</span><span className="font-bold text-white">SelfStorage</span>. Bản quyền thuộc về hệ thống.
          </div>
          <div className="flex items-center gap-3 text-[12px] text-[#94a3b8]">
            <span className="cursor-pointer transition hover:text-white">Trung tâm trợ giúp</span>
            <span>•</span>
            <span className="cursor-pointer transition hover:text-white">Điều khoản sử dụng</span>
            <span>•</span>
            <span className="cursor-pointer transition hover:text-white">Chính sách bảo mật</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
