import { Link } from "react-router-dom";
import { useLogin } from "../hooks/useLogin";
import { BRAND_NAME, SSL_BADGE_TEXT, SUPPORT_HOTLINE, CURRENCY_LABEL } from "../constants/brand";

function Login() {
  const {
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
  } = useLogin();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <header className="h-[74px] border-b border-[#e6ebf5] bg-[#f8f9ff]">
        <div className="mx-auto flex h-full max-w-[1200px] items-center justify-between px-4 lg:px-5">
          <div className="flex items-center gap-4">
            <div className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#0b1c30] text-white shadow-sm">
              <span className="material-symbols-outlined text-[18px]">lock</span>
            </div>

            <div className="flex items-center gap-3">
              <span className="text-[27px] font-bold tracking-[-0.04em] text-[#0b1c30]">{BRAND_NAME}</span>
              <span className="hidden text-[10px] font-semibold uppercase tracking-[0.14em] text-[#58657a] md:inline-block">
                Enterprise Secure Storage
              </span>
            </div>
          </div>

          <div className="flex items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
            <div className="hidden items-center gap-2 rounded-md border border-[#dde8fb] bg-[#eef4ff] px-2 py-1.5 md:flex">
              <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">verified_user</span>
              <span>{SSL_BADGE_TEXT}</span>
            </div>

            <div className="hidden items-center gap-2 rounded-md bg-[#eef4ff] px-2 py-1.5 text-[#214db7] lg:flex">
              <span className="material-symbols-outlined text-[16px]">phone_in_talk</span>
              <span>Hotline: {SUPPORT_HOTLINE}</span>
            </div>

            <div className="flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">language</span>
              <span>{CURRENCY_LABEL}</span>
            </div>

            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#101827] text-white">
              <span className="material-symbols-outlined text-[18px]">person</span>
            </div>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-[1200px] px-4 pb-8 pt-8 lg:px-5">
        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[440px_620px]">
          <aside className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="inline-flex items-center gap-2 rounded-full bg-[#edf8f4] px-3 py-1.5 text-[10px] font-bold uppercase tracking-[0.08em] text-[#0f7a4c]">
              <span className="h-2.5 w-2.5 rounded-full bg-[#2dd4a0] shadow-[0_0_12px_rgba(45,212,160,0.7)]" />
              Hệ thống an ninh hoạt động 24/7
            </div>

            <div className="mt-4 overflow-hidden rounded-[12px] border border-[#dfe7f5] bg-[#dfe7f5]">
              <div
                className="h-[220px] w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(15,30,45,0.15), rgba(15,30,45,0.22)), url('https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1200&q=80')",
                }}
              />
            </div>

            <div className="mt-4 flex items-center gap-3 rounded-[12px] bg-[#0d1b2a] px-3 py-3 text-white shadow-[0_8px_24px_rgba(13,27,42,0.15)]">
              <div className="flex h-7 w-7 items-center justify-center rounded-full border border-white/30 bg-white/10">
                <span className="material-symbols-outlined text-[16px]">verified</span>
              </div>
              <span className="text-[15px] font-semibold">Cơ sở VaultSpace Central Park</span>
            </div>

            <div className="mt-5 space-y-3">
              {features.map((item) => (
                <div key={item.title} className="flex items-center gap-3 rounded-[12px] border border-[#e6edf7] bg-[#f9fbff] p-3.5">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-[10px] ${item.tone}`}>
                    <span className="material-symbols-outlined text-[20px]">{item.icon}</span>
                  </div>
                  <div className="min-w-0">
                    <div className="text-[14px] font-bold text-[#111827]">{item.title}</div>
                    <div className="text-[12px] text-[#596780]">{item.text}</div>
                  </div>
                </div>
              ))}
            </div>

            <div className="mt-6 rounded-[12px] border border-[#dfe7f5] bg-[#f9fbff] p-4">
              <div className="flex items-end justify-between">
                <div className="text-[20px] font-bold text-[#0b1c30]">1,842+</div>
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[#e9efff] text-[#1d5fe5]">
                  <span className="material-symbols-outlined text-[16px]">info</span>
                </div>
              </div>
              <div className="mt-3 h-2.5 w-full overflow-hidden rounded-full bg-[#dfe9ff]">
                <div className="h-full w-[99.98%] rounded-full bg-gradient-to-r from-[#1e67f2] via-[#2b7cff] to-[#85ceff]" />
              </div>
              <div className="mt-2 flex items-center justify-between text-[11px] text-[#5e6d82]">
                <span>Tỷ lệ hoạt động</span>
                <span className="font-bold text-[#17306d]">99.98%</span>
              </div>
            </div>
          </aside>

          <section className="rounded-[16px] border border-[#dfe7f5] bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="mb-5">
              <div className="flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.12em] text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[16px]">lock_open</span>
                Cổng đăng nhập bảo mật
              </div>

              <h1 className="mt-3 text-[28px] font-bold tracking-[-0.05em] text-[#0b1c30]">Chào mừng trở lại</h1>
              <p className="mt-2 text-[13px] leading-6 text-[#58657a]">
                Quản lý kho, khóa số và thanh toán tự động — tất cả trong một tài khoản.
              </p>
            </div>

            <div className="mb-5 grid grid-cols-2 gap-2 rounded-[12px] bg-[#eef4ff] p-1.5">
              <button
                type="button"
                onClick={() => setAccountType("individual")}
                className={`flex items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold transition ${
                  accountType === "individual" ? "bg-white text-[#0d1b2a] shadow-sm" : "text-[#58657a]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">person</span>
                Khách hàng cá nhân
              </button>

              <button
                type="button"
                onClick={() => setAccountType("business")}
                className={`flex items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-[14px] font-semibold transition ${
                  accountType === "business" ? "bg-white text-[#0d1b2a] shadow-sm" : "text-[#58657a]"
                }`}
              >
                <span className="material-symbols-outlined text-[18px]">business_center</span>
                Doanh nghiệp
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="flex items-center gap-2 rounded-[10px] border border-[#f5b5b8] bg-[#fdecec] px-3 py-2.5 text-[13px] font-semibold text-[#b3261e]">
                  <span className="material-symbols-outlined text-[18px]">error</span>
                  {error}
                </div>
              )}

              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#0f172a]">Email hoặc Số điện thoại</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">person</span>
                  <input
                    type="text"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={accountType === "business" ? "Email doanh nghiệp hoặc MST" : "tenban@congty.vn hoặc 090 123 4567"}
                    className="w-full rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] text-[#122033] placeholder:text-[#7a8595] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#dbeafe]"
                  />
                </div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-[#0f172a]">Mật khẩu bảo mật</label>
                  <button type="button" className="text-[12px] font-semibold text-[#1d5fe5] hover:underline">
                    Quên mật khẩu?
                  </button>
                </div>

                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">lock</span>
                  <input
                    type={showPassword ? "text" : "password"}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••••••"
                    className="w-full rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-11 text-[13px] text-[#122033] placeholder:text-[#7a8595] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#dbeafe]"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword((prev) => !prev)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-[#687586]"
                  >
                    <span className="material-symbols-outlined text-[18px]">{showPassword ? "visibility_off" : "visibility"}</span>
                  </button>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-2 pt-1">
                <label className="flex items-center gap-2 text-[12px] text-[#455265]">
                  <input type="checkbox" defaultChecked className="h-4 w-4 accent-[#1d5fe5]" />
                  Ghi nhớ phiên đăng nhập trên thiết bị này
                </label>
                <label className="flex items-center gap-2 text-[12px] text-[#455265]">
                  <input type="checkbox" className="h-4 w-4 accent-[#1d5fe5]" />
                  Bật Face ID / Vân tay
                </label>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3.5 text-[15px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-[#174fc7] disabled:opacity-75"
              >
                <span className="material-symbols-outlined text-[18px]">lock</span>
                {loading ? "Đang xác thực thông tin..." : "Đăng nhập an toàn"}
              </button>
            </form>

            <div className="mt-5 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7a8595]">
              <span className="h-px flex-1 bg-[#dfe7f5]" />
              hoặc đăng nhập bằng
              <span className="h-px flex-1 bg-[#dfe7f5]" />
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 text-[13px] font-semibold text-[#182638]">
                <span className="material-symbols-outlined text-[18px]">g_mobiledata</span>
                Tiếp tục với Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 text-[13px] font-semibold text-[#182638]">
                <span className="material-symbols-outlined text-[18px]">apple</span>
                Apple ID
              </button>
            </div>

            <div className="mt-6 flex items-center justify-center gap-2 text-[11px] text-[#778297]">
              <span className="material-symbols-outlined text-[14px]">security</span>
              <span>Đăng nhập nhanh bằng Mã PIN kho</span>
            </div>

            <div className="mt-5 text-center text-[12px] text-[#5f6c7a]">
              Chưa có mã định danh kho VaultSpace? {" "}
              <Link to="/register" className="font-semibold text-[#1d5fe5] hover:underline">
                Đăng ký thuê kho ngay
              </Link>
            </div>

            <div className="mt-5 flex items-center justify-center gap-4 text-[11px] text-[#6c7a8d]">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">verified_user</span> Cloudflare Zero Trust Guard</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">shield</span> Mã hóa dữ liệu TLS 1.3</span>
            </div>
          </section>
        </div>
      </main>

      <footer className="border-t border-[#e3eaf5] bg-[#f6f8fe] px-4 py-4 text-[12px] text-[#64728a]">
        <div className="mx-auto flex max-w-[1200px] items-center justify-between gap-4">
          <div>© 2025 {BRAND_NAME} Logistics Inc. All rights reserved.</div>
          <div className="flex items-center gap-3">
            <span>ISO 27001 Certified</span>
            <span>•</span>
            <span>AES-256 Storage Encryption</span>
            <span>•</span>
            <span>SOC 2 Type II Compliant</span>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default Login;
