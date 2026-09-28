import { Link } from "react-router-dom";
import { useRegister } from "../hooks/useRegister";
import { BRAND_NAME, SSL_BADGE_TEXT, SUPPORT_HOTLINE, CURRENCY_LABEL } from "../constants/brand";

function Register() {
  const {
    accountType,
    setAccountType,
    showPassword,
    setShowPassword,
    showConfirmPassword,
    setShowConfirmPassword,
    faqs,
    handleSubmit,
  } = useRegister();

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
                ENTERPRISE SECURE
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

      <main className="mx-auto max-w-[1200px] px-4 pb-10 pt-6 lg:px-5">
        <div className="mb-5 flex items-center justify-between text-[12px] font-semibold">
          <div className="flex items-center gap-2 text-[#3e4f6a]">
            <span className="material-symbols-outlined text-[16px] text-[#2a7ef7]">arrow_back</span>
            <Link to="/login" className="hover:underline">Quay lại trang chủ cũ</Link>
            <span className="text-[#c3cbdb]">•</span>
            <span className="text-[#3e4f6a]">Cơ sở An Phú Central (TP. Thủ Đức)</span>
          </div>
          <div className="flex items-center gap-2 text-[#0e7b4c]">
            <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
            <span>Hệ thống hoạt động 100% bình thường</span>
          </div>
        </div>

        <div className="grid grid-cols-1 gap-7 lg:grid-cols-[440px_620px]">
          <aside className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="relative overflow-hidden rounded-[12px] border border-[#dfe7f5] bg-[#dfe7f5]">
              <div
                className="h-[220px] w-full bg-cover bg-center"
                style={{
                  backgroundImage:
                    "linear-gradient(180deg, rgba(15,30,45,0.15), rgba(15,30,45,0.35)), url('https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=1200&q=80')",
                }}
              />
              <div className="absolute left-3 top-3 flex items-center gap-1 rounded-full bg-white/90 px-2.5 py-1 text-[11px] font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">verified</span>
                Cơ sở đạt chuẩn Hạng A+
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <div className="inline-flex items-center gap-1 rounded-full bg-[#0e7b4c] px-2.5 py-1 text-[10px] font-bold uppercase tracking-[0.08em] text-white">
                  Đặc quyền cư dân
                </div>
                <div className="mt-1.5 text-[17px] font-bold text-white">
                  Hệ sinh thái lưu trữ thông minh độc quyền
                </div>
              </div>
            </div>

            <div className="mt-4 space-y-3">
              <div className="flex items-center gap-3 rounded-[12px] border border-[#e6edf7] bg-[#f9fbff] p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#0d1b2a] text-white">
                  <span className="material-symbols-outlined text-[20px]">sensor_door</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-[#111827]">Mở cổng & Kho không chạm</div>
                  <div className="text-[12px] text-[#596780]">Mở khóa qua App hoặc Bluetooth, không cần chìa cơ.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[12px] border border-[#e6edf7] bg-[#f9fbff] p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#edf7f1] text-[#0e7b4c]">
                  <span className="material-symbols-outlined text-[20px]">device_thermostat</span>
                </div>
                <div className="min-w-0">
                  <div className="text-[14px] font-bold text-[#111827]">Giám sát vi khí hậu 24/7</div>
                  <div className="text-[12px] text-[#596780]">Cảm biến IoT giữ nhiệt độ 22-25°C, bảo vệ đồ giá trị cao.</div>
                </div>
              </div>

              <div className="flex items-center gap-3 rounded-[12px] border border-[#e6edf7] bg-[#f9fbff] p-3.5">
                <div className="flex h-10 w-10 items-center justify-center rounded-[10px] bg-[#eaf2ff] text-[#1c5fe8]">
                  <span className="material-symbols-outlined text-[20px]">percent</span>
                </div>
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-2">
                    <div className="text-[14px] font-bold text-[#111827]">Giảm 50% tháng đầu tiên</div>
                    <span className="rounded-full bg-[#0e7b4c] px-2 py-0.5 text-[9px] font-bold uppercase text-white">Ưu đãi</span>
                  </div>
                  <div className="text-[12px] text-[#596780]">Áp dụng tự động cho mọi kích thước kho từ 1-25m².</div>
                </div>
              </div>
            </div>

            <div className="mt-4 rounded-[12px] border border-[#dfe7f5] bg-[#f9fbff] p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1">
                  <div className="flex -space-x-2">
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#1d5fe5] text-[10px] font-bold text-white">TP</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#0e7b4c] text-[10px] font-bold text-white">HL</span>
                    <span className="flex h-7 w-7 items-center justify-center rounded-full border-2 border-white bg-[#f4b740] text-[10px] font-bold text-white">AN</span>
                  </div>
                </div>
                <div className="text-right">
                  <div className="flex items-center justify-end gap-1 text-[13px] font-bold text-[#0b1c30]">
                    <span className="material-symbols-outlined text-[16px] text-[#f4b740]">star</span>
                    4.9 / 5
                  </div>
                  <div className="text-[11px] text-[#596780]">Hơn 98.4% đánh giá tuyệt đối</div>
                </div>
              </div>
              <div className="mt-2 text-[12px] font-semibold text-[#1d5fe5]">12,400+ Kho đang hoạt động</div>
            </div>

            <div className="mt-4 flex items-start gap-3 rounded-[12px] border border-[#dfe7f5] bg-white p-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[#1d5fe5]">
                <span className="material-symbols-outlined text-[18px]">verified_user</span>
              </div>
              <div>
                <div className="text-[13px] font-bold text-[#111827]">Bảo hiểm tài sản tích hợp</div>
                <div className="text-[12px] text-[#596780]">Bảo hiểm Bảo Việt, bảo vệ tài sản đến 1.2 tỷ VNĐ.</div>
              </div>
            </div>
          </aside>

          <section className="rounded-[16px] border border-[#dfe7f5] bg-white p-6 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
            <div className="mb-5 flex items-center gap-2 text-[11px] font-bold uppercase tracking-[0.1em] text-[#1d5fe5]">
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-1">Đăng ký thành viên</span>
              <span className="text-[#98a3b8]">•</span>
              <span className="text-[#58657a]">Bước 1/2</span>
            </div>

            <h1 className="text-[26px] font-bold tracking-[-0.04em] text-[#0b1c30]">Tạo tài khoản lưu trữ mới</h1>
            <p className="mt-2 text-[13px] text-[#58657a]">
              Chỉ mất 1 phút để thuê kho và kích hoạt khóa số.
            </p>

            <div className="mt-5">
              <div className="mb-2 text-[13px] font-semibold text-[#0f172a]">Bạn sử dụng kho với tư cách:</div>
              <div className="grid grid-cols-2 gap-2 rounded-[12px] bg-[#eef4ff] p-1.5">
                <button
                  type="button"
                  onClick={() => setAccountType("individual")}
                  className={`flex items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold transition ${
                    accountType === "individual" ? "bg-white text-[#1d5fe5] shadow-sm" : "text-[#58657a]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">person</span>
                  Cá nhân / Gia đình
                </button>
                <button
                  type="button"
                  onClick={() => setAccountType("business")}
                  className={`flex items-center justify-center gap-2 rounded-[10px] px-3 py-2.5 text-[13px] font-semibold transition ${
                    accountType === "business" ? "bg-white text-[#1d5fe5] shadow-sm" : "text-[#58657a]"
                  }`}
                >
                  <span className="material-symbols-outlined text-[18px]">domain</span>
                  Doanh nghiệp / Hàng hóa
                </button>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3">
              <button type="button" className="flex items-center justify-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-2.5 text-[13px] font-semibold text-[#182638]">
                <span className="material-symbols-outlined text-[18px]">g_mobiledata</span>
                Đăng ký qua Google
              </button>
              <button type="button" className="flex items-center justify-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-2.5 text-[13px] font-semibold text-[#182638]">
                <span className="material-symbols-outlined text-[18px]">apple</span>
                Đăng ký với Apple ID
              </button>
            </div>

            <div className="my-5 flex items-center justify-center gap-3 text-[11px] font-medium uppercase tracking-[0.12em] text-[#7a8595]">
              <span className="h-px flex-1 bg-[#dfe7f5]" />
              hoặc điền thông tin bên dưới
              <span className="h-px flex-1 bg-[#dfe7f5]" />
            </div>

            <form className="space-y-4" onSubmit={handleSubmit}>
              <div>
                <label className="mb-2 block text-[13px] font-semibold text-[#0f172a]">Họ và tên đầy đủ *</label>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">badge</span>
                  <input
                    type="text"
                    required
                    placeholder="Ví dụ: Nguyễn Văn An"
                    className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#dbeafe]"
                  />
                </div>
                <div className="mt-1 text-[11px] text-[#8996a9]">Đúng theo CCCD/Passport</div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#0f172a]">Email liên hệ chính *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">mail</span>
                    <input
                      type="email"
                      required
                      placeholder="tenban@email.com"
                      className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-4 text-[13px] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#dbeafe]"
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-[#8996a9]">Nhận mã OTP xác nhận qua email</div>
                </div>

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#0f172a]">Số điện thoại di động *</label>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[13px]">🇻🇳 +84</span>
                    <input
                      type="tel"
                      required
                      placeholder="0912 345 678"
                      className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-16 pr-4 text-[13px] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#dbeafe]"
                    />
                  </div>
                  <div className="mt-1 text-[11px] text-[#8996a9]">Để nhận mã OTP mở khóa khẩn cấp</div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#0f172a]">Mật khẩu bảo mật *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">lock</span>
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-11 text-[13px] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#dbeafe]"
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

                <div>
                  <label className="mb-2 block text-[13px] font-semibold text-[#0f172a]">Xác nhận lại mật khẩu *</label>
                  <div className="relative">
                    <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">lock_reset</span>
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="••••••••••••"
                      className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-11 text-[13px] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#dbeafe]"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword((prev) => !prev)}
                      className="absolute right-3 top-1/2 -translate-y-1/2 text-[#0e7b4c]"
                    >
                      <span className="material-symbols-outlined text-[18px]">check_circle</span>
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <div className="mb-1.5 text-[12px] font-semibold text-[#0f172a]">Độ mạnh mật khẩu:</div>
                <div className="flex gap-1.5">
                  <div className="h-1.5 flex-1 rounded-full bg-[#1d5fe5]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#1d5fe5]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#1d5fe5]" />
                  <div className="h-1.5 flex-1 rounded-full bg-[#0e7b4c]" />
                </div>
                <div className="mt-1.5 text-[11px] text-[#8996a9]">Rất mạnh • ≥8 ký tự, có số &amp; ký tự đặc biệt</div>
              </div>

              <div>
                <div className="mb-2 flex items-center justify-between">
                  <label className="text-[13px] font-semibold text-[#0f172a]">Mã giới thiệu hoặc Mã giữ chỗ trước (Tùy chọn)</label>
                  <button type="button" className="text-[12px] font-semibold text-[#1d5fe5] hover:underline">
                    Bạn có voucher?
                  </button>
                </div>
                <div className="relative">
                  <span className="material-symbols-outlined absolute left-3 top-1/2 -translate-y-1/2 text-[18px] text-[#687586]">local_offer</span>
                  <input
                    type="text"
                    defaultValue="VAULT-SUMMER50"
                    className="w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-3 pl-10 pr-28 text-[13px] outline-none transition focus:border-[#3b82f6] focus:ring-2 focus:ring-[#dbeafe]"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 rounded-full bg-[#0e7b4c] px-2.5 py-1 text-[10px] font-bold text-white">
                    ĐÃ ÁP DỤNG
                  </span>
                </div>
              </div>

              <div className="space-y-2.5">
                <label className="flex items-start gap-2 text-[12px] text-[#455265]">
                  <input type="checkbox" required defaultChecked className="mt-0.5 h-4 w-4 accent-[#1d5fe5]" />
                  <span>
                    Tôi đồng ý với <span className="font-semibold text-[#1d5fe5]">Điều khoản dịch vụ</span> và <span className="font-semibold text-[#1d5fe5]">Chính sách riêng tư</span> của VaultSpace.
                  </span>
                </label>
                <label className="flex items-start gap-2 text-[12px] text-[#455265]">
                  <input type="checkbox" defaultChecked className="mt-0.5 h-4 w-4 accent-[#1d5fe5]" />
                  <span>Nhận cảnh báo vi khí hậu, thanh toán và ưu đãi gia hạn qua SMS &amp; Email.</span>
                </label>
              </div>

              <button
                type="submit"
                className="mt-2 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3.5 text-[15px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-[#174fc7]"
              >
                <span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                Tạo tài khoản &amp; Nhận ưu đãi 50%
              </button>

              <div className="text-center text-[12px] text-[#5f6c7a]">
                Đã có tài khoản VaultSpace? <Link to="/login" className="font-semibold text-[#1d5fe5] hover:underline">Đăng nhập tại đây</Link>
              </div>
            </form>
          </section>
        </div>

        <div className="mt-5 rounded-[14px] border border-[#dfe7f5] bg-[#eef4ff] p-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
              <span className="material-symbols-outlined text-[18px] text-[#0e7b4c]">verified_user</span>
              Bảo mật ISO 27001 &amp; SOC 2 Loại II
            </div>
            <div className="text-[12px] text-[#4d5d76]">Thông tin & camera kho được mã hóa đầu cuối AES-256</div>
            <div className="flex items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">lock_clock</span> Mở khóa 24/7</span>
              <span className="flex items-center gap-1"><span className="material-symbols-outlined text-[16px]">support_agent</span> Hỗ trợ kỹ thuật 24/7</span>
            </div>
          </div>
        </div>

        <div className="mt-8">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-[20px] font-bold text-[#0b1c30]">Những thắc mắc thường gặp khi tạo tài khoản</h2>
              <p className="mt-1 text-[13px] text-[#58657a]">Thông tin cần biết trước khi nhận kho</p>
            </div>
            <Link to="/login" className="flex items-center gap-1 text-[12px] font-semibold text-[#1d5fe5] hover:underline">
              Xem tất cả câu hỏi
              <span className="material-symbols-outlined text-[14px]">open_in_new</span>
            </Link>
          </div>

          <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-3">
            {faqs.map((item) => (
              <div key={item.title} className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#1d5fe5]">
                  <span className="material-symbols-outlined text-[18px]">{item.icon}</span>
                  {item.title}
                </div>
                <p className="mt-2 text-[12px] leading-5 text-[#58657a]">{item.text}</p>
              </div>
            ))}
          </div>
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

export default Register;
