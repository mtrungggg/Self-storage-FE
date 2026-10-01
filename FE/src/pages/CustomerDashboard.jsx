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

        {/* Trạng thái tải dữ liệu */}
        {rentalsLoading && (
          <div className="mt-3 flex items-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white px-4 py-3 text-[13px] text-[#58657a]">
            <span className="material-symbols-outlined animate-spin text-[18px] text-[#1d5fe5]">progress_activity</span>
            Đang tải dữ liệu kho của bạn từ hệ thống...
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

        {/* Danh sách kho đang sở hữu */}
        <div className="mt-6 space-y-6">
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
            activeRentals.map((rental, index) => (
              <div
                key={rental.agreementId || rental.unitCode || index}
                className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]"
              >
                {/* Header kho */}
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div>
                    <div className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                      <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">
                        {index === 0 ? "Kho chính" : `Kho #${index + 1}`}
                      </span>
                      Khu vực Zone {rental.zoneLabel || "A"} • Tầng {rental.floorLabel || "1"} • {rental.facilityName || "Thu Duc Self Storage"}
                    </div>
                    <h2 className="mt-1 text-[18px] sm:text-[20px] font-bold text-[#0b1c30]">
                      Kho #{rental.unitCode} ({rental.unitTypeName})
                    </h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="rounded-full bg-[#eef4ff] px-2.5 py-1 text-[11px] font-bold text-[#1d5fe5]">
                      Hợp đồng #{rental.agreementNo}
                    </span>
                    <div className="flex items-center gap-1.5 rounded-[10px] border border-[#dfe7f5] bg-[#f8faff] px-3 py-1.5 text-[#0e7b4c]">
                      <span className="h-2 w-2 rounded-full bg-[#2dd4a0]" />
                      <span className="text-[12px] font-bold">Đang hiệu lực</span>
                    </div>
                  </div>
                </div>

                {/* Hình ảnh và 6 thông số kỹ thuật */}
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

                  <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                    <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                        Diện tích
                      </div>
                      <div className="text-[14px] font-bold text-[#0b1c30]">
                        {rental.areaM2 ? `${rental.areaM2} m²` : "3.0 m²"}
                      </div>
                      <div className="text-[10px] text-[#8996a9]">
                        {rental.dimensions || "1.5 × 2.0m"}
                      </div>
                    </div>

                    <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                      <div className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                        Thể tích lưu trữ
                      </div>
                      <div className="text-[14px] font-bold text-[#0b1c30]">
                        {rental.volumeM3 ? `${rental.volumeM3} m³` : `${Number(rental.areaM2 || 3) * 2.5} m³`}
                      </div>
                      <div className="truncate text-[10px] text-[#8996a9]">
                        {rental.unitTypeName}
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
                        {formatVnd(rental.monthlyRate)}
                      </div>
                      <div className="text-[10px] text-[#8996a9]">Hàng tháng</div>
                    </div>
                  </div>
                </div>

                {/* Mã PIN bàn phím mở cửa kho */}
                <div className="mt-4 rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-4">
                  <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
                    Mã PIN bàn phím mở cửa kho #{rental.unitCode}
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

                {/* Biểu đồ nhiệt độ & độ ẩm thời gian thực */}
                <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#fafcff] p-4">
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="text-[13px] font-bold text-[#0b1c30]">
                      Nhiệt độ &amp; Độ ẩm (#{rental.unitCode})
                    </div>
                    <div className="flex items-center gap-2 text-[11px] font-semibold text-[#3a475a]">
                      <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 text-[#1d5fe5]">24 giờ qua</span>
                      <span className="flex items-center gap-1 text-[#0e7b4c]">
                        <span className="h-1.5 w-1.5 rounded-full bg-[#2dd4a0]" />
                        Ổn định
                      </span>
                    </div>
                  </div>

                  <svg viewBox="0 0 320 70" className="mt-3 h-[90px] w-full">
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
            ))
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default CustomerDashboard;
