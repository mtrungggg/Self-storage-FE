import { useCustomerDashboard } from "../hooks/useCustomerDashboard";
import Header from "../components/Header";
import Footer from "../components/Footer";

function CustomerDashboard() {
  const {
    accessLogs,
    quickActions,
    trustBadges,
    showPin,
    setShowPin,
    mainLocked,
    setMainLocked,
    garageLocked,
    setGarageLocked,
    tempPath,
    humidityPath,
  } = useCustomerDashboard();

  return (
    <div className="min-h-screen bg-[#f5f7fd] text-[#0b1c30]">
      <Header active="dashboard" />

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#3a475a]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Kho an toàn
            </span>
            <span>Tự động thanh toán: Bật</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              Trạm #04
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-[12px] font-semibold text-[#0b1c30]">Cổng Nam • 43m</div>
            <button className="flex items-center gap-1.5 rounded-[10px] bg-[#1d5fe5] px-3.5 py-1.5 text-[12px] font-bold text-white hover:bg-[#174fc7]">
              <span className="material-symbols-outlined text-[16px]">sensor_door</span>
              Mở cổng
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">Chào Alex Morgan</h1>
          <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">#VS-884920</span>
        </div>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">home</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Kho đang thuê</div>
            <div className="text-[16px] font-bold text-[#0b1c30]">2 kho</div>
            <div className="text-[11px] text-[#58657a]">#B-204 • #D-118</div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#0e7b4c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
              Hoạt động tốt
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">key</span>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Khóa điện tử
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
            </div>
            <div className="text-[16px] font-bold text-[#0b1c30]">2 khóa</div>
            <div className="text-[11px] text-[#58657a]">Bluetooth • Thẻ từ</div>
            <div className="mt-2 text-[11px] text-[#58657a]">
              1 khách chia sẻ
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">credit_card</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Kỳ thanh toán</div>
            <div className="text-[16px] font-bold text-[#0b1c30]">01/11/2025</div>
            <div className="text-[11px] text-[#58657a]">$101.00 • Visa 4092</div>
            <div className="mt-2 text-[11px] text-[#58657a]">
              Tự động trừ thẻ
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">thermostat</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Môi trường kho</div>
            <div className="text-[16px] font-bold text-[#0b1c30]">21.1°C • 48%</div>
            <div className="text-[11px] text-[#58657a]">Điều kiện tối ưu</div>
            <div className="mt-2 flex items-center gap-1.5 text-[11px] font-semibold text-[#0e7b4c]">
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
              Ẩm mốc: 0%
            </div>
          </div>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">Kho chính</span>
                    Khoang B • Tầng 1
                  </div>
                  <h2 className="mt-1 text-[18px] sm:text-[19px] font-bold text-[#0b1c30]">Kho #B-204 (5' × 10')</h2>
                  <p className="text-[11px] text-[#8996a9]">Lối 2, Tầng trệt • Cạnh thang máy</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2 text-[#0e7b4c]">
                  <span className="material-symbols-outlined text-[18px]">lock</span>
                  <span className="text-[12px] font-bold">Đã khóa</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
                <div className="relative overflow-hidden rounded-[12px] border border-[#eef1f8]">
                  <div
                    className="h-full min-h-[200px] w-full bg-cover bg-center"
                    style={{
                      backgroundImage:
                        "linear-gradient(180deg, rgba(15,30,45,0.05), rgba(15,30,45,0.4)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80')",
                    }}
                  />
                  <div className="absolute bottom-2 left-2 rounded-md bg-white/90 px-2 py-1 text-[10px] font-semibold text-[#0b1c30]">
                    Camera
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Diện tích</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">4.6 m²</div>
                    <div className="text-[10px] text-[#8996a9]">1.5 × 3m</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Sức chứa</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">1 phòng</div>
                    <div className="text-[10px] text-[#8996a9]">~40 thùng</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Pin khóa</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">94%</div>
                    <div className="text-[10px] text-[#0e7b4c]">Tốt</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Nhiệt độ</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">20° – 22°C</div>
                    <div className="text-[10px] text-[#8996a9]">Ổn định</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Cảm biến</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">Hồng ngoại</div>
                    <div className="text-[10px] text-[#0e7b4c]">Bảo vệ</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Bảo hiểm</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">$5,000</div>
                    <div className="text-[10px] text-[#8996a9]">Gói chuẩn</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="flex flex-col justify-between rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Khóa Bluetooth</div>
                  <button
                    onClick={() => setMainLocked((v) => !v)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#1d5fe5] py-2.5 text-[13px] font-bold text-white hover:bg-[#174fc7]"
                  >
                    <span className="material-symbols-outlined text-[16px]">{mainLocked ? "lock_open" : "lock"}</span>
                    {mainLocked ? "Mở khóa kho" : "Khóa lại kho"}
                  </button>
                </div>

                <div className="rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-3.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                    Mã PIN
                    <button onClick={() => setShowPin((v) => !v)} className="text-[#1d5fe5] hover:underline">
                      {showPin ? "Ẩn PIN" : "Hiện PIN"}
                    </button>
                  </div>
                  <div className="mt-1 flex items-center gap-2 text-[16px] font-bold tracking-[0.2em] text-[#0b1c30]">
                    {showPin ? "4 9 2 #" : "• • • • #"}
                    <span className="material-symbols-outlined cursor-pointer text-[16px] text-[#8996a9]">content_copy</span>
                    <span className="material-symbols-outlined cursor-pointer text-[16px] text-[#8996a9]">refresh</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="flex-1 rounded-md border border-[#dfe7f5] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd]">Lưu vào Ví</button>
                    <button className="flex-1 rounded-md border border-[#dfe7f5] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f5f7fd]">Tạo mã khách</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">Kho phụ</span>
                    Garage ngoài trời
                  </div>
                  <h2 className="mt-1 text-[18px] sm:text-[19px] font-bold text-[#0b1c30]">Kho #D-118 (10' × 20')</h2>
                  <p className="text-[11px] text-[#8996a9]">Dốc Tây • Cửa số 18</p>
                </div>
                <div className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2 text-[#0e7b4c]">
                  <span className="material-symbols-outlined text-[18px]">shield_lock</span>
                  <span className="text-[12px] font-bold">Đã khóa</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Sức chứa</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">18.6 m²</div>
                  <div className="text-[10px] text-[#8996a9]">Để vừa ô tô / đồ lớn</div>
                </div>
                <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Mã cổng</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">#4180*</div>
                  <div className="text-[10px] text-[#8996a9]">Cổng phía Tây</div>
                </div>
              </div>

              <button
                onClick={() => setGarageLocked((v) => !v)}
                className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-white py-2.5 text-[13px] font-bold text-[#0b1c30] hover:bg-[#f8faff] md:w-auto md:px-6"
              >
                <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">{garageLocked ? "garage" : "garage_home"}</span>
                {garageLocked ? "Mở cửa cuốn" : "Đóng cửa cuốn"}
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <div className="text-[14px] font-bold text-[#0b1c30]">Nhiệt độ &amp; Độ ẩm (#B-204)</div>
                  <p className="text-[11px] text-[#8996a9]">Cảm biến 24h thời gian thực</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#3a475a]">
                  <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">24 giờ qua</span>
                  <span className="flex items-center gap-1 text-[#0e7b4c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                    Ổn định
                  </span>
                </div>
              </div>

              <svg viewBox="0 0 320 90" className="mt-4 h-[140px] w-full">
                <path d={tempPath} fill="none" stroke="#1d5fe5" strokeWidth="2" />
                <path d={humidityPath} fill="none" stroke="#0e7b4c" strokeWidth="2" />
              </svg>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#3a475a]">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#1d5fe5]" />
                  Nhiệt độ: 21.2°C
                </span>
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-[#0e7b4c]" />
                  Độ ẩm: 48%
                </span>
              </div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[18px] text-[#0e7b4c]">fence</span>
                  Cổng ra vào
                </div>
                <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
              </div>
              <div className="mt-1 text-[11px] text-[#8996a9]">Trạm #04 • Austin, TX</div>

              <div className="mt-3 space-y-2 text-[11px] text-[#58657a]">
                <div className="flex items-center justify-between">
                  <span>Địa chỉ:</span>
                  <span className="font-semibold text-[#0b1c30]">420 E Cesar Chavez</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Mã bàn phím:</span>
                  <span className="font-semibold text-[#0b1c30]">#9410*</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Thang máy:</span>
                  <span className="font-semibold text-[#0b1c30]">Khoang 1 &amp; 2</span>
                </div>
              </div>

              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#1d5fe5] py-2.5 text-[12px] font-bold text-white hover:bg-[#174fc7]">
                <span className="material-symbols-outlined text-[16px]">sensor_door</span>
                Mở Cổng Nam
              </button>
              <button className="mt-2 w-full rounded-[10px] border border-[#dfe7f5] py-2 text-[11px] font-semibold text-[#3a475a] hover:bg-[#f8faff]">
                Đặt cầu bốc dỡ
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">history</span>
                Nhật ký ra vào
              </div>

              <div className="mt-3 space-y-3">
                {accessLogs.map((log) => (
                  <div key={log.title} className="flex gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1d5fe5]">
                      <span className="material-symbols-outlined text-[16px]">{log.icon}</span>
                    </span>
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

              <button className="mt-3 text-[12px] font-semibold text-[#1d5fe5] hover:underline">Xem tất cả lịch sử</button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold text-[#0b1c30]">Thao tác nhanh</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button key={action.title} className="flex flex-col items-center justify-center rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 text-center transition hover:bg-[#eef4ff]">
                    <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">{action.icon}</span>
                    <div className="mt-1.5 text-[11px] font-bold text-[#0b1c30]">{action.title}</div>
                  </button>
                ))}
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

export default CustomerDashboard;

