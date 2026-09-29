import { useAccessControl } from "../hooks/useAccessControl";
import Header from "../components/Header";
import Footer from "../components/Footer";

function AccessControl() {
  const {
    wallets,
    guestPins,
    accessLogs,
    trustBadges,
    activeUnit,
    setActiveUnit,
    showPin,
    setShowPin,
    unlocking,
    handleUnlock,
    alerts,
    toggleAlert,
  } = useAccessControl();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="access" />

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">Mã PIN &amp; Khóa điện tử</h1>
            <p className="mt-1 text-[13px] text-[#58657a]">
              Quản lý mã truy cập và điều khiển khóa thông minh.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <button className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-white px-3.5 py-2 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff]">
              <span className="material-symbols-outlined text-[16px]">sync_alt</span>
              Đổi mã PIN
            </button>
            <button className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-4 py-2 text-[12px] font-bold text-white shadow-[0_10px_20px_rgba(29,95,229,0.25)] hover:bg-[#174fc7]">
              <span className="material-symbols-outlined text-[16px]">add</span>
              Cấp mã khách
            </button>
          </div>
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-between gap-3 rounded-[14px] border border-[#dfe7f5] bg-white p-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setActiveUnit("main")}
              className={`rounded-[10px] px-3.5 py-2 text-left text-[12px] font-semibold transition ${
                activeUnit === "main" ? "bg-[#0b1c30] text-white shadow-sm" : "border border-[#dfe7f5] text-[#3a475a] hover:bg-[#f8faff]"
              }`}
            >
              <div>Kho chính #B-204</div>
              <div className={`text-[10px] font-normal ${activeUnit === "main" ? "text-[#c7d1e6]" : "text-[#8996a9]"}`}>5' × 10' • Tầng 1</div>
            </button>

            <button
              onClick={() => setActiveUnit("garage")}
              className={`rounded-[10px] px-3.5 py-2 text-left text-[12px] font-semibold transition ${
                activeUnit === "garage" ? "bg-[#0b1c30] text-white shadow-sm" : "border border-[#dfe7f5] text-[#3a475a] hover:bg-[#f8faff]"
              }`}
            >
              <div>Kho phụ #D-118</div>
              <div className={`text-[10px] font-normal ${activeUnit === "garage" ? "text-[#c7d1e6]" : "text-[#8996a9]"}`}>10' × 20' • Ngoài trời</div>
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
            <span>Khóa thông minh</span>
            <span className="flex items-center gap-1 rounded-full bg-[#e7f8ee] px-2.5 py-0.5 text-[11px] font-bold text-[#0e7b4c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
              Đã khóa
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#58657a]">
              <span className="material-symbols-outlined text-[15px]">battery_5_bar</span>
              94%
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#58657a]">
              <span className="material-symbols-outlined text-[15px]">bluetooth</span>
              Tín hiệu tốt
            </span>
            <span className="flex items-center gap-1 text-[11px] text-[#58657a]">
              <span className="material-symbols-outlined text-[15px]">near_me</span>
              Cách ~3m
            </span>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_340px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="text-[15px] font-bold text-[#0b1c30]">Bàn phím &amp; Khóa từ xa</div>
                <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">Kho #B-204</span>
              </div>
              <p className="mt-0.5 text-[11px] text-[#8996a9]">Mã hóa bảo mật 256-bit</p>

              <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4">
                <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Mã PIN chính</div>
                <div className="mt-2 flex flex-wrap items-center gap-3">
                  <div className="flex items-center gap-2 text-[20px] font-bold tracking-[0.25em] text-[#0b1c30]">
                    {showPin ? "4 9 2 #" : "• • • • 9 2 #"}
                    <button onClick={() => setShowPin((v) => !v)} className="material-symbols-outlined text-[18px] text-[#8996a9] hover:text-[#0b1c30]">
                      {showPin ? "visibility_off" : "visibility"}
                    </button>
                  </div>
                  <div className="ml-auto flex items-center gap-2">
                    <button className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd]">
                      <span className="material-symbols-outlined text-[14px]">content_copy</span>
                      Sao chép
                    </button>
                    <button className="flex items-center gap-1 rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd]">
                      <span className="material-symbols-outlined text-[14px]">autorenew</span>
                      Tạo lại mã
                    </button>
                  </div>
                </div>
                <div className="mt-2 text-[11px] text-[#8996a9]">Nhập trực tiếp trên bàn phím tại cửa kho.</div>
              </div>

              <div className="mt-4 rounded-[12px] bg-[#0b1c30] p-4 text-white">
                <div className="flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#7fd8b1]">
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                  Mở khóa Bluetooth
                </div>
                <div className="mt-1 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <div className="text-[14px] font-bold">Mở khóa một chạm</div>
                    <p className="mt-1 max-w-[380px] text-[11px] leading-relaxed text-[#c7d1e6]">
                      Tự động nhận diện khi đến gần kho trong phạm vi 5 mét.
                    </p>
                  </div>
                  <button
                    onClick={handleUnlock}
                    className="flex items-center gap-2 rounded-[10px] bg-[#1d5fe5] px-4 py-2.5 text-[13px] font-bold text-white hover:bg-[#174fc7]"
                  >
                    <span className="material-symbols-outlined text-[16px]">{unlocking ? "lock_open" : "lock"}</span>
                    {unlocking ? "Đang mở..." : "Mở khóa kho"}
                  </button>
                </div>
              </div>

              <div className="mt-4">
                <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Ví điện tử &amp; Thẻ NFC</div>
                <div className="mt-2 grid grid-cols-1 gap-2 md:grid-cols-3">
                  {wallets.map((wallet) => (
                    <div key={wallet.title} className="flex items-center gap-2.5 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">{wallet.icon}</span>
                      <div>
                        <div className="text-[12px] font-semibold text-[#0b1c30]">{wallet.title}</div>
                        <div className={`text-[10px] ${wallet.active ? "text-[#0e7b4c]" : "text-[#8996a9]"}`}>{wallet.status}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[15px] font-bold text-[#0b1c30]">Mã khách &amp; Ủy quyền</div>
                  <p className="mt-0.5 max-w-[480px] text-[11px] text-[#8996a9]">
                    Cấp quyền mở kho tạm thời cho đối tác hoặc người thân.
                  </p>
                </div>
                <button className="flex items-center gap-1 rounded-[10px] bg-[#1d5fe5] px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-[#174fc7]">
                  <span className="material-symbols-outlined text-[16px]">add</span>
                  Cấp mã mới
                </button>
              </div>

              <div className="mt-4 space-y-3">
                {guestPins.map((guest) => (
                  <div key={guest.id} className={`rounded-[12px] border p-3.5 ${guest.status === "expired" ? "border-[#eef1f8] bg-[#f8faff] opacity-80" : "border-[#eef1f8] bg-white"}`}>
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="text-[13px] font-bold text-[#0b1c30]">{guest.name}</span>
                        <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">{guest.tag}</span>
                      </div>
                      {guest.status === "active" ? (
                        <span className="flex items-center gap-1 text-[11px] font-semibold text-[#0e7b4c]">
                          <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                          Hoạt động
                        </span>
                      ) : (
                        <span className="rounded-full bg-[#eef1f8] px-2 py-0.5 text-[10px] font-semibold text-[#8996a9]">Hết hạn</span>
                      )}
                    </div>
                    <div className="mt-1 text-[11px] text-[#8996a9]">{guest.schedule}</div>
                    <div className="mt-2 flex items-center justify-between">
                      <span className={`text-[12px] font-semibold ${guest.status === "expired" ? "text-[#8996a9] line-through" : "text-[#0b1c30]"}`}>
                        Mã PIN: {guest.code}
                      </span>
                      <button
                        className={`rounded-md px-3 py-1 text-[11px] font-semibold ${
                          guest.action === "Hủy mã" ? "bg-[#fdecec] text-[#c0362c] hover:bg-[#fad7d7]" : "border border-[#dfe7f5] text-[#3a475a] hover:bg-[#f8faff]"
                        }`}
                      >
                        {guest.action}
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                Cổng vào &amp; Thang máy
                <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[10px] font-semibold text-[#1d5fe5]">Trạm #04</span>
              </div>

              <div className="mt-3 flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3a475a]">directions_car</span>
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Barrier Cổng Nam</div>
                    <div className="text-[10px] text-[#8996a9]">Mã bấm: #9410*</div>
                  </div>
                </div>
                <button className="rounded-md bg-[#1d5fe5] px-3 py-1 text-[11px] font-bold text-white hover:bg-[#174fc7]">Mở barrier</button>
              </div>

              <div className="mt-2 flex items-center justify-between rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                <div className="flex items-center gap-2">
                  <span className="material-symbols-outlined text-[18px] text-[#3a475a]">elevator</span>
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Thang máy Tầng 2</div>
                    <div className="text-[10px] text-[#8996a9]">Phân tầng tự động đến kho</div>
                  </div>
                </div>
                <span className="material-symbols-outlined text-[16px] text-[#0e7b4c]">check_circle</span>
              </div>

              <p className="mt-3 text-[10px] text-[#8996a9]">
                Cổng mở 24/7. Vui lòng giữ khoảng cách 2m khi quét thẻ.
              </p>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between text-[13px] font-bold text-[#0b1c30]">
                Nhật ký mở khóa
                <span className="text-[10px] font-semibold text-[#8996a9]">Trực tiếp</span>
              </div>

              <div className="mt-3 space-y-3">
                {accessLogs.map((log) => (
                  <div key={log.title + log.time} className="flex gap-2.5">
                    <span className="mt-1 h-2 w-2 shrink-0 rounded-full" style={{ backgroundColor: log.dot }} />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="truncate text-[12px] font-semibold text-[#0b1c30]">{log.title}</span>
                        <span className="shrink-0 text-[10px] text-[#8996a9]">{log.time}</span>
                      </div>
                      <div className="truncate text-[11px] text-[#8996a9]">{log.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-3 w-full rounded-[10px] border border-[#dfe7f5] py-2 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff]">
                Xem tất cả lịch sử
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold text-[#0b1c30]">Cảnh báo an ninh</div>

              <div className="mt-3 space-y-2.5">
                <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 cursor-pointer">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Cửa mở quá 15 phút</div>
                    <div className="text-[10px] text-[#8996a9]">Phát còi và gửi thông báo điện thoại</div>
                  </div>
                  <input type="checkbox" checked={alerts.doorOpen} onChange={() => toggleAlert("doorOpen")} className="h-4 w-4 accent-[#1d5fe5]" />
                </label>

                <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 cursor-pointer">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Sai mã PIN 5 lần</div>
                    <div className="text-[10px] text-[#8996a9]">Khóa 30 phút và ghi hình camera</div>
                  </div>
                  <input type="checkbox" checked={alerts.wrongPin} onChange={() => toggleAlert("wrongPin")} className="h-4 w-4 accent-[#1d5fe5]" />
                </label>

                <label className="flex items-center justify-between gap-2 rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 cursor-pointer">
                  <div>
                    <div className="text-[12px] font-semibold text-[#0b1c30]">Mở ngoài giờ (22h – 06h)</div>
                    <div className="text-[10px] text-[#8996a9]">Cảnh báo trung tâm an ninh 24/7</div>
                  </div>
                  <input type="checkbox" checked={alerts.afterHours} onChange={() => toggleAlert("afterHours")} className="h-4 w-4 accent-[#1d5fe5]" />
                </label>
              </div>
            </div>
          </aside>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 rounded-[14px] border border-[#dfe7f5] bg-white p-5 md:grid-cols-4">
          {trustBadges.map((item) => (
            <div key={item.title} className="flex items-center gap-3">
              <span className="material-symbols-outlined text-[22px] text-[#0e7b4c]">{item.icon}</span>
              <div>
                <div className="text-[13px] font-bold text-[#0b1c30]">{item.title}</div>
                <div className="text-[11px] text-[#8996a9]">{item.text}</div>
              </div>
            </div>
          ))}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default AccessControl;
