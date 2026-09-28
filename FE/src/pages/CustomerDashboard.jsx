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
      <Header active="dashboard" subtitle="Secure Self Storage" />

      <div className="border-b border-[#dfe7f5] bg-[#eef4ff]">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-2 px-4 py-2 text-[11px] font-semibold text-[#3a475a] lg:px-6">
          <span>Cổng thông tin VaultSpace / Vận hành cơ sở & Tổng quan khách hàng</span>
          <div className="flex items-center gap-4">
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Giám sát an ninh 24/7 đang hoạt động
            </span>
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Đèn sinh trắc học đang hoạt động
            </span>
          </div>
        </div>
      </div>

      <main className="mx-auto max-w-[1280px] px-4 py-6 lg:px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#3a475a]">
          <div className="flex flex-wrap items-center gap-3">
            <span className="flex items-center gap-1 text-[#0e7b4c]">
              <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
              Tất cả kho an toàn
            </span>
            <span>Tự động thanh toán: Đang bật</span>
            <span className="flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">location_on</span>
              Trạm trung tâm #04
            </span>
          </div>

          <div className="flex items-center gap-3">
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Đo từ xa</div>
              <div className="text-[12px] font-semibold text-[#0b1c30]">Trong phạm vi Cổng phía Nam • Cách 43m (142 ft)</div>
              <div className="text-[10px] text-[#8996a9]">Công nghệ kết nối NFC & Bluetooth sẵn sàng</div>
            </div>
            <button className="flex items-center gap-2 rounded-[10px] bg-[#1d5fe5] px-4 py-2.5 text-[12px] font-bold text-white hover:bg-[#174fc7]">
              <span className="material-symbols-outlined text-[16px]">sensor_door</span>
              Mở Cổng 1
            </button>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <h1 className="text-[24px] font-bold tracking-[-0.02em] text-[#0b1c30]">Chào mừng trở lại, Alex Morgan</h1>
          <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#1d5fe5]">#VS-884920</span>
        </div>
        <p className="mt-1 max-w-[720px] text-[13px] text-[#58657a]">
          Hệ thống chống xâm nhập đang trực tuyến, đồng bộ với mạng an ninh VaultSpace SecureMesh™.
        </p>

        <div className="mt-5 grid grid-cols-1 gap-4 md:grid-cols-4">
          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">home</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Kho đang thuê</div>
            <div className="text-[16px] font-bold text-[#0b1c30]">2 Kho đang hoạt động</div>
            <div className="text-[11px] text-[#58657a]">Kho #B-204 &amp; Kho #D-118</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#8996a9]">
              <span>Trạng thái sử dụng</span>
              <span className="font-semibold text-[#0e7b4c]">100% An toàn</span>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">key</span>
            <div className="mt-1 flex items-center gap-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Khóa truy cập điện tử
              <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
            </div>
            <div className="text-[16px] font-bold text-[#0b1c30]">2 Khóa đang kích hoạt</div>
            <div className="text-[11px] text-[#58657a]">Mạng lưới Bluetooth di động • Đăng bộ thẻ điện thoại</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#8996a9]">
              <span>Khách được ủy quyền</span>
              <span className="font-semibold text-[#0b1c30]">1 Khách tạm thời</span>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">credit_card</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Kỳ thanh toán tiếp theo</div>
            <div className="text-[16px] font-bold text-[#0b1c30]">01/11/2025</div>
            <div className="text-[11px] text-[#58657a]">$101.00 qua thẻ Visa đuôi 4092</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#8996a9]">
              <span>Kế hoạch thanh toán</span>
              <span className="font-semibold text-[#0b1c30]">Quyết toán tự động</span>
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4">
            <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">thermostat</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Đo lường môi trường</div>
            <div className="text-[16px] font-bold text-[#0b1c30]">21.1°C (70°F) / 48% Độ ẩm RH</div>
            <div className="text-[11px] text-[#58657a]">Điều kiện bảo quản tối ưu</div>
            <div className="mt-2 flex items-center justify-between text-[11px] text-[#8996a9]">
              <span>Nguy cơ ẩm mốc</span>
              <span className="font-semibold text-[#0e7b4c]">0.00% (Bình thường)</span>
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
                    Kiểm soát nhiệt độ • Tầng 1 • Khoang B
                  </div>
                  <h2 className="mt-1 text-[19px] font-bold text-[#0b1c30]">Kho #B-204 — Kho cao cấp 5' x 10'</h2>
                  <p className="text-[11px] text-[#8996a9]">Tầng trệt Khoang B, Lối đi số 2 • Cạnh thang máy chở hàng phía Nam 1B</p>
                </div>
                <div className="flex items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2 text-right">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Trạng thái chốt thông minh</div>
                    <div className="text-[12px] font-bold text-[#0e7b4c]">Đã khóa • Kích hoạt bảo vệ</div>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[#0e7b4c]">lock</span>
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
                    Hình ảnh trực tiếp
                    <div className="text-[9px] font-normal text-[#58657a]">Camera cửa lối</div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Diện tích</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">~4.6 m²</div>
                    <div className="text-[10px] text-[#8996a9]">Rộng 1.5m • Dài 3m • Cao 2.7m</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Sức chứa</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">Căn hộ 1 phòng</div>
                    <div className="text-[10px] text-[#8996a9]">~40 Thùng chuẩn</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Mức pin khóa</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">94%</div>
                    <div className="text-[10px] text-[#8996a9]">Pin Lithium Cell Pro</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Độ nhiệt</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">20° – 22°C</div>
                    <div className="text-[10px] text-[#8996a9]">Là chân khô ráo</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Cảm biến chuyển động</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">Quang hồng ngoại</div>
                    <div className="text-[10px] text-[#8996a9]">Chống cạy phá</div>
                  </div>
                  <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                    <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Mức bảo hiểm</div>
                    <div className="text-[13px] font-bold text-[#0b1c30]">Gói $5,000</div>
                    <div className="text-[10px] text-[#8996a9]">Hạng Tenant Plus</div>
                  </div>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-3.5">
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Chốt điều khiển từ xa VaultSpace</div>
                  <button
                    onClick={() => setMainLocked((v) => !v)}
                    className="mt-2 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#1d5fe5] py-2.5 text-[13px] font-bold text-white hover:bg-[#174fc7]"
                  >
                    <span className="material-symbols-outlined text-[16px]">{mainLocked ? "lock_open" : "lock"}</span>
                    {mainLocked ? "Nhấn giữ để Mở khóa Kho" : "Nhấn giữ để Khóa lại Kho"}
                  </button>
                  <div className="mt-1 flex items-center justify-between text-[10px] text-[#8996a9]">
                    <span>Tín hiệu mạng BLE mã hóa trực tiếp</span>
                    <span>Độ trễ: 18ms</span>
                  </div>
                </div>

                <div className="rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-3.5">
                  <div className="flex items-center justify-between text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                    Mã PIN bàn phím cơ
                    <button onClick={() => setShowPin((v) => !v)} className="text-[#1d5fe5] hover:underline">
                      {showPin ? "Ẩn mã PIN" : "Hiện mã PIN"}
                    </button>
                  </div>
                  <div className="mt-2 flex items-center gap-2 text-[16px] font-bold tracking-[0.2em] text-[#0b1c30]">
                    {showPin ? "4 9 2 #" : "• • • • #"}
                    <span className="material-symbols-outlined text-[16px] text-[#8996a9]">content_copy</span>
                    <span className="material-symbols-outlined text-[16px] text-[#8996a9]">refresh</span>
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <button className="flex-1 rounded-md border border-[#dfe7f5] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#3a475a]">Thẻ Apple / Google Wallet</button>
                    <button className="flex-1 rounded-md border border-[#dfe7f5] bg-white px-2 py-1.5 text-[11px] font-semibold text-[#3a475a]">Cấp mã cho khách</button>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                    <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">Kho phụ</span>
                    Kho Garage xe vào tận nơi • Khu vực ngoài trời tầng trệt
                  </div>
                  <h2 className="mt-1 text-[19px] font-bold text-[#0b1c30]">Kho #D-118 — Kho Garage xe vào tận nơi 10' x 20'</h2>
                  <p className="text-[11px] text-[#8996a9]">Dốc lái xe phía Tây, Cửa số #18 • Khoảng vào xe trực tiếp</p>
                </div>
                <div className="flex items-center gap-2 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-2 text-right">
                  <div>
                    <div className="text-[9px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Cảm biến cửa</div>
                    <div className="text-[12px] font-bold text-[#0e7b4c]">Đã khóa • Cửa cuốn đã bật bảo vệ</div>
                  </div>
                  <span className="material-symbols-outlined text-[20px] text-[#0e7b4c]">shield_lock</span>
                </div>
              </div>

              <div className="mt-4 grid grid-cols-1 gap-3 md:grid-cols-2">
                <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Phân bố sức chứa</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">~18.6 m² (Nguyên căn nhà / Xe SUV)</div>
                  <div className="text-[10px] text-[#8996a9]">Kèm đường dốc chuyên dụng cho xe</div>
                </div>
                <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">Mã cổng vào</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">#4180*</div>
                  <div className="text-[10px] text-[#8996a9]">Rào chắn vào phía Tây</div>
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
                  <div className="text-[14px] font-bold text-[#0b1c30]">Dữ liệu vi khí hậu &amp; Độ ẩm kho #B-204</div>
                  <p className="text-[11px] text-[#8996a9]">Dữ liệu cảm biến 24h thời gian thực từ đầu dò khoang #TH-092</p>
                </div>
                <div className="flex items-center gap-2 text-[11px] font-semibold text-[#3a475a]">
                  <span className="rounded-full bg-[#eef4ff] px-2 py-1 text-[#1d5fe5]">24 Giờ qua</span>
                  <span className="flex items-center gap-1 text-[#0e7b4c]">
                    <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                    Cảm biến hoạt động tốt
                  </span>
                </div>
              </div>

              <svg viewBox="0 0 320 90" className="mt-4 h-[140px] w-full">
                <path d={tempPath} fill="none" stroke="#1d5fe5" strokeWidth="2" />
                <path d={humidityPath} fill="none" stroke="#0e7b4c" strokeWidth="2" />
              </svg>

              <div className="mt-2 flex flex-wrap items-center gap-4 text-[11px] font-semibold text-[#3a475a]">
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#1d5fe5]" />
                  Nhiệt độ: 21.2°C (Mục tiêu: 21.1°C)
                </span>
                <span className="flex items-center gap-1">
                  <span className="h-2 w-2 rounded-full bg-[#0e7b4c]" />
                  Độ ẩm: 48% RH (Khoảng an toàn: 45-55%)
                </span>
              </div>
              <div className="mt-2 text-[11px] text-[#8996a9]">Kỳ kiểm tra tiếp theo sau 12 phút</div>
            </div>
          </div>

          <aside className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#0e7b4c]">fence</span>
                Cổng kiểm soát ra vào chu vi
                <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
              </div>
              <div className="mt-1 text-[12px] font-semibold text-[#3a475a]">Trạm trung tâm Metro #04</div>

              <div className="mt-3 space-y-2 text-[11px] text-[#58657a]">
                <div className="flex items-center justify-between">
                  <span>Địa chỉ:</span>
                  <span className="text-right font-semibold text-[#0b1c30]">420 E Cesar Chavez St, Austin, TX</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Bàn phím cổng 24/7:</span>
                  <span className="font-semibold text-[#0b1c30]">#9410*</span>
                </div>
                <div className="flex items-center justify-between">
                  <span>Thang máy chở hàng:</span>
                  <span className="font-semibold text-[#0b1c30]">Khoang 1 &amp; 2 (Tầng 1-3)</span>
                </div>
              </div>

              <button className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#1d5fe5] py-2.5 text-[12px] font-bold text-white hover:bg-[#174fc7]">
                <span className="material-symbols-outlined text-[16px]">sensor_door</span>
                Kích hoạt Mở Cổng Nam
              </button>
              <button className="mt-2 w-full rounded-[10px] border border-[#dfe7f5] py-2.5 text-[12px] font-semibold text-[#3a475a] hover:bg-[#f8faff]">
                Đặt chỗ Cầu bốc hàng 3 (Miễn phí 2h)
              </button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">history</span>
                Nhật ký kiểm tra an ninh
              </div>
              <p className="mt-1 text-[11px] text-[#8996a9]">Lịch sử đóng mở cửa &amp; xác thực</p>

              <div className="mt-3 space-y-3">
                {accessLogs.map((log) => (
                  <div key={log.title} className="flex gap-2.5">
                    <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#eef4ff] text-[#1d5fe5]">
                      <span className="material-symbols-outlined text-[16px]">{log.icon}</span>
                    </span>
                    <div className="min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[12px] font-semibold text-[#0b1c30]">{log.title}</span>
                        <span className="shrink-0 text-[10px] text-[#8996a9]">{log.time}</span>
                      </div>
                      <div className="text-[11px] text-[#8996a9]">{log.note}</div>
                    </div>
                  </div>
                ))}
              </div>

              <button className="mt-3 text-[12px] font-semibold text-[#1d5fe5] hover:underline">Xem toàn bộ lịch sử 90 ngày</button>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold text-[#0b1c30]">Thao tác nhanh &amp; Dịch vụ khách thuê</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                {quickActions.map((action) => (
                  <button key={action.title} className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 text-left">
                    <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">{action.icon}</span>
                    <div className="mt-1 text-[11px] font-bold text-[#0b1c30]">{action.title}</div>
                    <div className="text-[10px] text-[#8996a9]">{action.text}</div>
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

      <Footer
        tagline="Giải pháp lưu trữ cá nhân & doanh nghiệp tiêu chuẩn cao, xác thực truy cập nghiêm ngặt cho từng khoang."
        hotline={{ label: "ĐƯỜNG DÂY NÓNG HỖ TRỢ KHẨN CẤP", phone: "1-800-555-VAULT (24/7)" }}
        columns={[
          {
            title: "Cổng thông tin khách hàng",
            items: ["Kho đang thuê của tôi", "Mã truy cập & PIN cổng", "Cài đặt tự động thanh toán & Hóa đơn", "Trạng thái khóa của truy cập", "Ủy quyền cho khách truy cập"],
          },
          {
            title: "Cơ sở & Kích thước kho",
            items: ["Hướng dẫn kích thước kho tương ứng", "Tiêu chuẩn kiểm soát nhiệt độ", "Kho Garage xe vào tận nơi", "Các gói bảo hiểm & Yêu cầu bồi thường"],
          },
          {
            title: "Hỗ trợ & Tin cậy",
            items: ["Trò chuyện hỗ trợ trực tiếp", "Cửa hàng vật dụng dọn kho", "Tài liệu chính sách thuê kho", "Chính sách quyền riêng tư & Giám sát"],
          },
        ]}
        bottomText="© 2025 VaultSpace Logistics Technologies, Inc. Bảo lưu mọi quyền. Đơn vị cung cấp kho tự quản được cấp phép."
        bottomLinks={[{ label: "Điều khoản dịch vụ" }, { label: "Giao thoả an ninh" }, { label: "Biện pháp bảo vệ" }]}
        statusText="Trạng thái: Bình thường"
      />
    </div>
  );
}

export default CustomerDashboard;

