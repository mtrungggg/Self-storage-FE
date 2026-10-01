import { useNavigate } from "react-router-dom";
import { useCustomerDashboard } from "../hooks/useCustomerDashboard";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";

function CustomerDashboard() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const {
    accessLogs,
    showPin,
    setShowPin,
    tempPath,
    humidityPath,
    activeRentals,
    primaryRental,
    credentials,
    credentialsLoading,
    rentalsLoading,
    rentalsError,
    copyFeedback,
    copyPinToClipboard,
  } = useCustomerDashboard();

  const facilityName = primaryRental?.facilityName || "";

  const nextBillingDate = primaryRental?.endDate
    ? new Date(primaryRental.endDate).toLocaleDateString("vi-VN")
    : "—";

  const pinDisplay = credentialsLoading
    ? "Đang tải..."
    : showPin
    ? credentials?.keypadPin
      ? `${credentials.keypadPin} #`
      : "Chưa tạo PIN #"
    : "• • • • • • #";

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="dashboard" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {/* Top bar thông báo cơ sở */}
        {primaryRental ? (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#3a475a]">
            <div className="flex flex-wrap items-center gap-3">
              <span className="flex items-center gap-1.5 text-[#0e7b4c]">
                <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
                Kho an toàn &amp; Bảo mật
              </span>
              <span className="hidden sm:inline">•</span>
              <span>Tự động thanh toán: {primaryRental?.autoRenew ? "Bật" : "Tiêu chuẩn"}</span>
              <span className="hidden sm:inline">•</span>
              <span className="text-[#1d5fe5]">
                {facilityName}
              </span>
            </div>

            <button
              onClick={() => navigate("/access-control")}
              className="rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-1 text-[11px] font-bold text-[#1d5fe5] hover:bg-[#eef4ff]"
            >
              Xem mã PIN ra vào
            </button>
          </div>
        ) : (
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-2.5 text-[12px] font-semibold text-[#3a475a]">
            <div className="flex items-center gap-2 text-[#58657a]">
              <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">info</span>
              Bạn chưa có hợp đồng thuê kho nào đang hoạt động
            </div>
            <button
              onClick={() => navigate("/")}
              className="text-[12px] font-bold text-[#1d5fe5] hover:underline"
            >
              Khám phá kho ngay &rarr;
            </button>
          </div>
        )}

        {/* Tiêu đề chào đón */}
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <h1 className="text-[22px] sm:text-[24px] font-bold tracking-[-0.02em] text-white drop-shadow-[0_2px_6px_rgba(0,0,0,0.5)]">
              Chào {user?.fullName || user?.email || "bạn"}
            </h1>
            {user?.id && (
              <span className="rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                #VS-{user.id}
              </span>
            )}
          </div>

          <button
            onClick={() => navigate("/")}
            className="flex items-center gap-1.5 rounded-[10px] bg-white/90 px-3.5 py-2 text-[12px] font-bold text-[#1d5fe5] shadow-sm backdrop-blur-md transition hover:bg-white hover:shadow"
          >
            <span className="material-symbols-outlined text-[16px]">add_circle</span>
            {activeRentals.length > 0 ? "Đặt thuê thêm kho" : "Khám phá kho trống"}
          </button>
        </div>

        {rentalsError && (
          <div className="mt-3 rounded-[12px] border border-[#fecdca] bg-[#fff1f1] px-4 py-3 text-[13px] font-semibold text-[#b3261e]">
            {rentalsError}
          </div>
        )}

        {/* Trạng thái tải hoặc tóm tắt hợp đồng */}
        {rentalsLoading && (
          <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-3 text-[13px] text-[#58657a]">
            <span className="material-symbols-outlined animate-spin text-[18px] text-[#1d5fe5]">progress_activity</span>
            Đang tải dữ liệu kho của bạn từ hệ thống...
          </div>
        )}

        {!rentalsLoading && !rentalsError && (
          <div className="mt-3 rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-3 text-[13px]">
            {primaryRental ? (
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div>
                  <span className="font-bold text-[#0b1c30]">Kho #{primaryRental.unitCode}</span>
                  <span className="text-[#58657a]">
                    {" "}• {formatVnd(primaryRental.monthlyRate)}/tháng
                  </span>
                  {activeRentals.length > 1 && (
                    <span className="ml-2 rounded-full bg-[#eef4ff] px-2.5 py-0.5 text-[11px] font-bold text-[#1d5fe5]">
                      +{activeRentals.length - 1} kho khác
                    </span>
                  )}
                </div>
                <span className="rounded-full bg-[#ecfdf3] px-2.5 py-0.5 text-[11px] font-bold text-[#027a48]">
                  Hợp đồng: {primaryRental.agreementNo}
                </span>
              </div>
            ) : (
              <div className="flex items-center justify-between gap-3">
                <span className="text-[#58657a]">Bạn chưa có hợp đồng thuê kho nào đang hoạt động.</span>
                <button
                  onClick={() => navigate("/")}
                  className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[12px] font-bold text-white hover:bg-[#174fc7]"
                >
                  Khám phá kho ngay
                </button>
              </div>
            )}
          </div>
        )}

        {/* 4 Thẻ chỉ số tổng quan */}
        <div className="mt-5 grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-4">
          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">home</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Kho đang thuê
            </div>
            <div className="text-[17px] font-bold text-[#0b1c30]">
              {activeRentals.length} kho
            </div>
            <div className="truncate text-[11px] font-medium text-[#58657a]">
              {activeRentals.length > 0
                ? activeRentals.map((r) => `#${r.unitCode}`).join(" • ")
                : "Chưa có kho nào"}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">pin</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Mã PIN bàn phím
            </div>
            <div className="text-[17px] font-bold text-[#1d5fe5]">
              {credentials?.keypadPin ? `#${credentials.keypadPin}` : "Chưa cấp"}
            </div>
            <div className="text-[11px] font-medium text-[#58657a]">
              Nhập tại cửa kho &amp; cổng
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">credit_card</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Kỳ thanh toán tới
            </div>
            <div className="text-[17px] font-bold text-[#0b1c30]">
              {nextBillingDate}
            </div>
            <div className="truncate text-[11px] font-medium text-[#58657a]">
              {primaryRental ? `${formatVnd(primaryRental.monthlyRate)}` : "—"}
            </div>
          </div>

          <div className="rounded-[14px] border border-[#dfe7f5] bg-white p-4 shadow-sm">
            <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">thermostat</span>
            <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Môi trường kho
            </div>
            <div className="text-[17px] font-bold text-[#0b1c30]">
              {primaryRental ? "21.1°C • 48%" : "—"}
            </div>
            <div className="truncate text-[11px] font-medium text-[#58657a]">
              {primaryRental?.unitTypeName || "—"}
            </div>
          </div>
        </div>

        {/* Nội dung chính: Chi tiết kho & Sidebar thông tin */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[1fr_320px]">
          <div className="space-y-6">
            {activeRentals.length === 0 ? (
              /* Giao diện khi chưa có kho */
              <div className="flex flex-col items-center justify-center rounded-[16px] border border-[#dfe7f5] bg-white p-10 text-center shadow-sm">
                <span className="material-symbols-outlined text-[54px] text-[#1d5fe5]">
                  inventory_2
                </span>
                <h2 className="mt-3 text-[19px] font-bold text-[#0b1c30]">
                  Bạn chưa có hợp đồng thuê kho nào đang hoạt động
                </h2>
                <p className="mt-2 max-w-[460px] text-[13px] leading-relaxed text-[#58657a]">
                  Hệ thống kho tự quản thông minh với giá thuê chỉ từ 1.000đ/tháng, mở khóa bằng mã PIN bàn phím số cá nhân.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-5 rounded-[10px] bg-[#1d5fe5] px-6 py-2.5 text-[13px] font-bold text-white shadow transition hover:bg-[#174fc7]"
                >
                  Khám phá kho trống &amp; Đặt ngay
                </button>
              </div>
            ) : (
              <>
                {/* THẺ KHO CHÍNH */}
                {primaryRental && (
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                          <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">
                            Kho chính
                          </span>
                          Khu vực Zone {primaryRental.zoneLabel || "A"} • Tầng {primaryRental.floorLabel || "1"}
                        </div>
                        <h2 className="mt-1 text-[18px] sm:text-[20px] font-bold text-[#0b1c30]">
                          Kho #{primaryRental.unitCode} ({primaryRental.unitTypeName})
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-1.5 text-[#0e7b4c]">
                        <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
                        <span className="text-[12px] font-bold">Đang hiệu lực</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-4 md:grid-cols-[220px_1fr]">
                      <div className="relative overflow-hidden rounded-[12px] border border-[#eef1f8]">
                        <div
                          className="h-full min-h-[190px] w-full bg-cover bg-center"
                          style={{
                            backgroundImage:
                              "linear-gradient(180deg, rgba(15,30,45,0.05), rgba(15,30,45,0.4)), url('https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80')",
                          }}
                        />
                        <div className="absolute bottom-2 left-2 flex items-center gap-1 rounded-md bg-white/95 px-2 py-1 text-[10px] font-semibold text-[#0b1c30] shadow-sm">
                          Camera 24/7
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                        <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                            Diện tích
                          </div>
                          <div className="text-[14px] font-bold text-[#0b1c30]">
                            {primaryRental.areaM2 ? `${primaryRental.areaM2} m²` : "3.0 m²"}
                          </div>
                          <div className="text-[10px] text-[#8996a9]">
                            {primaryRental.dimensions || "1.5 × 2.0m"}
                          </div>
                        </div>

                        <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                            Thể tích lưu trữ
                          </div>
                          <div className="text-[14px] font-bold text-[#0b1c30]">
                            {primaryRental.volumeM3 ? `${primaryRental.volumeM3} m³` : "7.5 m³"}
                          </div>
                          <div className="text-[10px] text-[#8996a9]">
                            {primaryRental.unitTypeName}
                          </div>
                        </div>

                        <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                            Pin khóa cửa
                          </div>
                          <div className="text-[14px] font-bold text-[#0b1c30]">100%</div>
                          <div className="text-[10px] font-semibold text-[#0e7b4c]">Tốt</div>
                        </div>

                        <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                            Nhiệt độ
                          </div>
                          <div className="text-[14px] font-bold text-[#0b1c30]">20° – 22°C</div>
                          <div className="text-[10px] text-[#8996a9]">Ổn định</div>
                        </div>

                        <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                            Cảm biến an ninh
                          </div>
                          <div className="text-[14px] font-bold text-[#0b1c30]">Hồng ngoại</div>
                          <div className="text-[10px] font-semibold text-[#0e7b4c]">Đang bảo vệ</div>
                        </div>

                        <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                          <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                            Giá thuê
                          </div>
                          <div className="text-[14px] font-bold text-[#1d5fe5]">
                            {formatVnd(primaryRental.monthlyRate)}
                          </div>
                          <div className="text-[10px] text-[#8996a9]">Hàng tháng</div>
                        </div>
                      </div>
                    </div>

                    {/* Mã PIN bàn phím số chính */}
                    <div className="mt-4 rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-4">
                      <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                        Mã PIN bàn phím mở cửa kho #{primaryRental.unitCode}
                        <button
                          onClick={() => setShowPin((v) => !v)}
                          className="font-bold text-[#1d5fe5] hover:underline"
                        >
                          {showPin ? "Ẩn PIN" : "Hiện PIN"}
                        </button>
                      </div>

                      <div className="mt-2 flex items-center gap-3 text-[20px] font-bold tracking-[0.2em] text-[#0b1c30]">
                        <span>{pinDisplay}</span>
                        {credentials?.keypadPin && (
                          <button
                            onClick={copyPinToClipboard}
                            title="Sao chép mã PIN"
                            className="rounded p-1 text-[#8996a9] transition hover:bg-white hover:text-[#1d5fe5]"
                          >
                            <span className="material-symbols-outlined text-[18px]">
                              {copyFeedback ? "done" : "content_copy"}
                            </span>
                          </button>
                        )}
                        {copyFeedback && (
                          <span className="text-[11px] font-bold text-[#0e7b4c]">Đã chép!</span>
                        )}
                      </div>

                      <div className="mt-3 flex items-center gap-2">
                        <button
                          onClick={copyPinToClipboard}
                          disabled={!credentials?.keypadPin}
                          className="rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#3a475a] transition hover:bg-[#f5f7fd] disabled:opacity-50"
                        >
                          Sao chép mã PIN
                        </button>
                        <button
                          onClick={() => navigate("/access-control")}
                          className="rounded-md border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-semibold text-[#1d5fe5] transition hover:bg-[#f5f7fd]"
                        >
                          Đổi mã PIN
                        </button>
                      </div>
                    </div>
                  </div>
                )}

                {/* CÁC KHO PHỤ KHÁC */}
                {activeRentals.slice(1).map((rental, index) => (
                  <div
                    key={rental.agreementId || index}
                    className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                          <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">
                            Kho #{index + 2}
                          </span>
                          Khu vực Zone {rental.zoneLabel || "B"} • Tầng {rental.floorLabel || "1"}
                        </div>
                        <h2 className="mt-1 text-[18px] sm:text-[19px] font-bold text-[#0b1c30]">
                          Kho #{rental.unitCode} ({rental.unitTypeName})
                        </h2>
                      </div>
                      <div className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-1.5 text-[#0e7b4c]">
                        <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
                        <span className="text-[12px] font-bold">Đang hiệu lực</span>
                      </div>
                    </div>

                    <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-3">
                      <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                          Diện tích
                        </div>
                        <div className="text-[13px] font-bold text-[#0b1c30]">
                          {rental.areaM2 ? `${rental.areaM2} m²` : "—"}
                        </div>
                        <div className="text-[10px] text-[#8996a9]">
                          {rental.dimensions || "Chuẩn quy cách"}
                        </div>
                      </div>

                      <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                          Giá thuê
                        </div>
                        <div className="text-[13px] font-bold text-[#1d5fe5]">
                          {formatVnd(rental.monthlyRate)}/tháng
                        </div>
                        <div className="text-[10px] text-[#8996a9]">Hợp đồng #{rental.agreementNo}</div>
                      </div>

                      <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                        <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                          Hạn thuê
                        </div>
                        <div className="text-[13px] font-bold text-[#0b1c30]">
                          {rental.endDate ? new Date(rental.endDate).toLocaleDateString("vi-VN") : "—"}
                        </div>
                        <div className="text-[10px] font-semibold text-[#0e7b4c]">Đang hiệu lực</div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between rounded-[8px] bg-[#f8faff] p-3 text-[12px]">
                      <span className="text-[#58657a]">Dùng chung mã PIN bàn phím tài khoản để mở cửa kho #{rental.unitCode}</span>
                      <button
                        onClick={() => navigate("/access-control")}
                        className="font-bold text-[#1d5fe5] hover:underline"
                      >
                        Quản lý mã PIN &rarr;
                      </button>
                    </div>
                  </div>
                ))}

                {/* Biểu đồ nhiệt độ & độ ẩm thời gian thực */}
                {primaryRental && (
                  <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <div className="text-[14px] font-bold text-[#0b1c30]">
                          Nhiệt độ &amp; Độ ẩm (#{primaryRental.unitCode})
                        </div>
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
                )}
              </>
            )}
          </div>

          {/* Cột bên phải: Cổng ra vào, Nhật ký truy cập & Phím tắt */}
          <aside className="space-y-6">
            {primaryRental ? (
              <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                    <span className="material-symbols-outlined text-[18px] text-[#0e7b4c]">fence</span>
                    Cổng ra vào cơ sở
                  </div>
                  <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                </div>

                <div className="mt-3 space-y-2 text-[11px] text-[#58657a]">
                  <div className="flex items-center justify-between">
                    <span>Mã bàn phím cổng:</span>
                    <span className="font-semibold text-[#1d5fe5]">
                      {credentials?.keypadPin ? `#${credentials.keypadPin}*` : "Đang tạo mã..."}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span>Vị trí kho:</span>
                    <span className="font-semibold text-[#0b1c30]">
                      Zone {primaryRental.zoneLabel || "A"} • Tầng {primaryRental.floorLabel || "1"}
                    </span>
                  </div>
                </div>

                <button
                  onClick={() => navigate("/access-control")}
                  className="mt-3 w-full rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] py-2 text-[11px] font-semibold text-[#1d5fe5] transition hover:bg-[#eef4ff]"
                >
                  Quản lý mã PIN ra vào
                </button>
              </div>
            ) : (
              <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
                <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                  <span className="material-symbols-outlined text-[18px] text-[#8996a9]">fence</span>
                  Cổng ra vào cơ sở
                </div>
                <p className="mt-2 text-[12px] leading-relaxed text-[#58657a]">
                  Mã PIN cổng sẽ tự động cấp sau khi bạn hoàn tất đặt thuê kho.
                </p>
                <button
                  onClick={() => navigate("/")}
                  className="mt-3 flex w-full items-center justify-center gap-2 rounded-[10px] bg-[#1d5fe5] py-2 text-[12px] font-bold text-white transition hover:bg-[#174fc7]"
                >
                  Tìm và thuê kho
                </button>
              </div>
            )}

            {/* Nhật ký truy cập */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[13px] font-bold text-[#0b1c30]">
                <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">history</span>
                Nhật ký ra vào &amp; Giao dịch
              </div>

              {accessLogs.length > 0 ? (
                <div className="mt-3 space-y-3">
                  {accessLogs.map((log, index) => (
                    <div key={index} className="flex gap-2.5">
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
              ) : (
                <div className="py-6 text-center text-[12px] text-[#8996a9]">
                  Chưa có lịch sử ra vào nào được ghi nhận.
                </div>
              )}

              {accessLogs.length > 0 && (
                <button
                  onClick={() => navigate("/access-control")}
                  className="mt-3 text-[12px] font-semibold text-[#1d5fe5] hover:underline"
                >
                  Xem chi tiết phân quyền
                </button>
              )}
            </div>

            {/* Thao tác nhanh */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="text-[13px] font-bold text-[#0b1c30]">Thao tác nhanh</div>
              <div className="mt-3 grid grid-cols-2 gap-3">
                <button
                  onClick={() => navigate("/")}
                  className="flex flex-col items-center justify-center rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 text-center transition hover:bg-[#eef4ff]"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">swap_horiz</span>
                  <div className="mt-1.5 text-[11px] font-bold text-[#0b1c30]">Đổi kho</div>
                </button>

                <button
                  onClick={() => navigate("/billing")}
                  className="flex flex-col items-center justify-center rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 text-center transition hover:bg-[#eef4ff]"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">receipt_long</span>
                  <div className="mt-1.5 text-[11px] font-bold text-[#0b1c30]">Hóa đơn</div>
                </button>

                <button
                  onClick={() => navigate("/support")}
                  className="flex flex-col items-center justify-center rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 text-center transition hover:bg-[#eef4ff]"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">event_note</span>
                  <div className="mt-1.5 text-[11px] font-bold text-[#0b1c30]">Báo trả kho</div>
                </button>

                <button
                  onClick={() => navigate("/support")}
                  className="flex flex-col items-center justify-center rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3 text-center transition hover:bg-[#eef4ff]"
                >
                  <span className="material-symbols-outlined text-[20px] text-[#1d5fe5]">support_agent</span>
                  <div className="mt-1.5 text-[11px] font-bold text-[#0b1c30]">Hỗ trợ 24/7</div>
                </button>
              </div>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CustomerDashboard;
