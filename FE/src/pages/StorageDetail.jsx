import { Link } from "react-router-dom";
import { useStorageDetail } from "../hooks/useStorageDetail";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";

const DURATION_OPTIONS = [
  { months: 1, label: "1 tháng" },
  { months: 3, label: "3 tháng" },
  { months: 6, label: "6 tháng" },
  { months: 12, label: "12 tháng" },
];

function StorageDetail() {
  const {
    unit,
    moveInOptions,
    moveInOption,
    setMoveInOption,
    customDate,
    setCustomDate,
    minCustomDateISO,
    isCustomDateInvalid,
    resolvedStartDate,
    durationMonths,
    setDurationMonths,
    voucherInput,
    setVoucherInput,
    appliedVoucher,
    handleApplyVoucher,
    handleClearVoucher,
    agreeTerms,
    setAgreeTerms,
    agreeLock,
    setAgreeLock,
    canSubmit,
    pricing,
    pricingLoading,
    pricingError,
    bookingLoading,
    bookingError,
    submitBooking,
  } = useStorageDetail();

  // pricing.totalAmount là số thực tế từ backend tính toán và tạo đơn VietQR
  const totalToday = pricing?.totalAmount ?? 0;
  const monthlyRent = pricing?.baseMonthlyRate ?? unit.rentPrice ?? 0;

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="rent" />

      {/* Facility Header */}
      <div className="border-b border-[#e6ebf5] bg-white">
        <div className="mx-auto flex max-w-[1280px] flex-wrap items-center justify-between gap-3 px-4 py-3 lg:px-6">
          <div className="flex items-center gap-3">
            <span className="flex h-9 w-9 items-center justify-center rounded-[10px] bg-[#eef4ff] text-[#1d5fe5]">
              <span className="material-symbols-outlined text-[18px]">domain</span>
            </span>
            <div>
              <div className="text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
                {unit.facilityName} • {unit.address}
              </div>
              <div className="text-[14px] font-bold text-[#0b1c30]">{unit.floor}</div>
            </div>
          </div>
          <div className="flex items-center gap-4 text-[12px] font-semibold text-[#3a475a]">
            <Link to="/facility-map" className="flex items-center gap-1 text-[#1d5fe5] hover:underline">
              Sơ đồ kho
              <span className="material-symbols-outlined text-[14px]">arrow_forward</span>
            </Link>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        {/* Breadcrumb & Reservation Timer */}
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
          <div className="text-[12px] font-semibold text-[#58657a]">
            <Link to="/home" className="hover:underline">Trang chủ</Link> / Kho {unit.unitCode}
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#fff1e6] px-3 py-1 text-[12px] font-bold text-[#b45309]">
            <span className="material-symbols-outlined text-[15px]">schedule</span>
            Giữ chỗ: 14:59
          </div>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Unit Info Box */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center gap-2 text-[11px] font-bold">
                <span className="rounded-full bg-[#0e7b4c] px-2.5 py-1 text-white">Sẵn sàng</span>
                <span className="rounded-full border border-[#dfe7f5] px-2.5 py-1 text-[#3a475a]">Tầng trệt</span>
                <span className="rounded-full border border-[#dfe7f5] px-2.5 py-1 text-[#3a475a]">Khóa điện tử</span>
              </div>

              <h1 className="mt-3 text-[22px] sm:text-[24px] font-bold leading-snug tracking-[-0.02em] text-[#0b1c30]">
                Kho {unit.unitCode}
              </h1>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">straighten</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Kích thước</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">{unit.sizeLabel || "5' x 10'"} x {unit.height || "2.7m"}</div>
                  <div className="text-[11px] text-[#8996a9]">{unit.volume || "12.7 m³"}</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">device_thermostat</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Nhiệt độ</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">20°C – 22°C</div>
                  <div className="text-[11px] text-[#8996a9]">Kiểm soát độ ẩm</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">lock</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">An ninh</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">Khóa điện tử</div>
                  <div className="text-[11px] text-[#8996a9]">Cảm biến PIR</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <span className="material-symbols-outlined text-[18px] text-[#1d5fe5]">door_open</span>
                  <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Truy cập</div>
                  <div className="text-[13px] font-bold text-[#0b1c30]">24/7</div>
                  <div className="text-[11px] text-[#8996a9]">Không chạm</div>
                </div>
              </div>

              {/* Đặc tính ô kho & Mục đích sử dụng thực tế từ Backend */}
              <div className="mt-5 border-t border-[#eef1f8] pt-4">
                <div className="text-[13px] font-bold text-[#0b1c30]">Mô tả sức chứa &amp; Tiêu chuẩn ô kho</div>

                <div className="mt-2.5 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-4 text-[13px]">
                  <p className="leading-relaxed text-[#3a475a]">
                    <span className="font-bold text-[#0b1c30]">{unit.typeName}:</span>{" "}
                    {unit.fitNote || "Phù hợp lưu trữ hàng hóa, đồ đạc gia đình, tài liệu hồ sơ hoặc trang thiết bị cá nhân."}
                  </p>

                  <div className="mt-3 flex flex-wrap gap-2 text-[11px] font-semibold text-[#0e7b4c]">
                    <span className="flex items-center gap-1 rounded-full bg-[#ecfdf3] px-3 py-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Khóa thông minh điện tử 24/7
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-[#ecfdf3] px-3 py-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Camera an ninh &amp; Cảm biến PIR
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-[#ecfdf3] px-3 py-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      {unit.climateControlled ? "Có điều hòa mát 20°C – 22°C" : "Kho khô ráo, thông thoáng"}
                    </span>
                    <span className="flex items-center gap-1 rounded-full bg-[#ecfdf3] px-3 py-1">
                      <span className="material-symbols-outlined text-[14px]">check_circle</span>
                      Xe đẩy hàng miễn phí tại sảnh
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bước 1: Ngày chuyển vào */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">1</span>
                  Ngày nhận kho &amp; Chuyển vào
                </div>
                <span className="text-[11px] font-semibold text-[#1d5fe5]">Kích hoạt từ ngày chọn</span>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {moveInOptions.map((opt) => (
                  <button
                    key={opt.id}
                    onClick={() => setMoveInOption(opt.id)}
                    className={`rounded-[10px] border px-3 py-2.5 text-[12px] font-semibold transition ${
                      moveInOption === opt.id
                        ? "border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5]"
                        : "border-[#dfe7f5] bg-white text-[#3a475a]"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-[10px] bg-[#f8faff] p-3">
                <div className="flex items-center gap-3">
                  <div className="flex h-10 w-10 flex-col items-center justify-center rounded-[8px] bg-[#0b1c30] text-white">
                    <span className="text-[9px] leading-none">THÁNG</span>
                    <span className="text-[13px] font-bold leading-none">
                      {String(resolvedStartDate.getMonth() + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0b1c30]">
                      Bắt đầu: {resolvedStartDate.toLocaleDateString("vi-VN", { weekday: "long", day: "2-digit", month: "2-digit", year: "numeric" })}
                    </div>
                    <div className="text-[11px] text-[#8996a9]">Cổng barrier tự động mở 24/7 từ 06:00 sáng</div>
                  </div>
                </div>
                {moveInOption === "custom" && (
                  <div>
                    <input
                      type="date"
                      value={customDate}
                      min={minCustomDateISO}
                      onChange={(e) => setCustomDate(e.target.value)}
                      className={`rounded-[8px] border px-2.5 py-1.5 text-[12px] font-semibold outline-none ${
                        isCustomDateInvalid ? "border-red-400 text-red-600" : "border-[#dfe7f5] text-[#0b1c30]"
                      }`}
                    />
                    {isCustomDateInvalid && (
                      <div className="mt-1 text-[11px] font-semibold text-red-600">Ngày phải ở tương lai</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Bước 2: Thời hạn thuê & Mã khuyến mãi */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3 flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">2</span>
                  Thời hạn thuê &amp; Mã ưu đãi
                </div>
                <span className="text-[11px] text-[#8996a9]">Linh hoạt gia hạn</span>
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setDurationMonths(opt.months)}
                    className={`flex flex-col items-center justify-center rounded-[10px] border p-3 transition ${
                      durationMonths === opt.months
                        ? "border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5]"
                        : "border-[#dfe7f5] bg-white text-[#3a475a] hover:bg-[#f8faff]"
                    }`}
                  >
                    <span className="text-[14px] font-bold">{opt.label}</span>
                    <span className="mt-0.5 text-[10px] text-[#8996a9]">
                      {opt.months >= 6 ? "Ưu đãi dài hạn" : "Tiêu chuẩn"}
                    </span>
                  </button>
                ))}
              </div>

              {/* Ô nhập Voucher / Mã khuyến mãi */}
              <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                <div className="text-[12px] font-bold text-[#0b1c30]">Mã khuyến mãi / Voucher giảm giá</div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="Nhập mã voucher (ví dụ: PROMO10, GIAM20)"
                    className="flex-1 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] font-semibold uppercase text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                  />
                  {appliedVoucher ? (
                    <button
                      type="button"
                      onClick={handleClearVoucher}
                      className="rounded-[8px] border border-[#fecdca] bg-[#fff1f1] px-3.5 py-2 text-[12px] font-bold text-[#b3261e] hover:bg-[#fee4e2]"
                    >
                      Hủy mã
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={!voucherInput.trim()}
                      className="rounded-[8px] bg-[#0b1c30] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#132741] disabled:opacity-50"
                    >
                      Áp dụng
                    </button>
                  )}
                </div>

                {appliedVoucher && pricing?.discountAmount > 0 && (
                  <div className="mt-2 flex items-center gap-1.5 text-[11px] font-bold text-[#0e7b4c]">
                    <span className="material-symbols-outlined text-[15px]">check_circle</span>
                    Đã áp dụng mã {appliedVoucher}: Giảm {formatVnd(pricing.discountAmount)}!
                  </div>
                )}
              </div>
            </div>

            {/* Bước 3: Hướng dẫn kích hoạt & Nhận mã mở khóa */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex items-center gap-2 text-[14px] font-bold text-[#0b1c30]">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-[#1d5fe5] text-[12px] text-white">3</span>
                Nhận mã mở khóa &amp; Check-in 24/7
              </div>
              <p className="mt-1 text-[11px] text-[#8996a9]">
                Quy trình hoàn toàn tự động, không cần chờ đợi bàn giao thủ công.
              </p>

              <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-3 text-[12px]">
                <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="flex items-center gap-1.5 font-bold text-[#1d5fe5]">
                    <span className="material-symbols-outlined text-[16px]">qr_code_scanner</span>
                    1. Quét QR Thanh toán
                  </div>
                  <p className="mt-1 text-[11px] text-[#58657a]">
                    Thanh toán số tiền hiển thị qua app ngân hàng tức thì.
                  </p>
                </div>

                <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="flex items-center gap-1.5 font-bold text-[#1d5fe5]">
                    <span className="material-symbols-outlined text-[16px]">pin</span>
                    2. Cấp mã PIN tức thì
                  </div>
                  <p className="mt-1 text-[11px] text-[#58657a]">
                    Hệ thống cấp ngay mã PIN 6 số và mã mở barrier trên màn hình.
                  </p>
                </div>

                <div className="rounded-[10px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="flex items-center gap-1.5 font-bold text-[#0e7b4c]">
                    <span className="material-symbols-outlined text-[16px]">verified</span>
                    3. Nhận kho 24/7
                  </div>
                  <p className="mt-1 text-[11px] text-[#58657a]">
                    Chuyển đồ vào kho bất cứ lúc nào không giới hạn thời gian.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] lg:sticky lg:top-4">
            <div className="flex items-center justify-between text-[11px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">
              Bảng kê đặt chỗ
              <span className="rounded-full bg-[#0b1c30] px-2 py-0.5 text-[10px] text-white">Giữ giá</span>
            </div>

            <div className="mt-2 text-[15px] font-bold text-[#0b1c30]">Chi phí thanh toán</div>

            {/* Thời gian thuê (durationMonths gửi lên API tính giá thực tế) */}
            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setDurationMonths(opt.months)}
                  className={`rounded-[8px] border px-1.5 py-1.5 text-[11px] font-bold transition ${
                    durationMonths === opt.months
                      ? "border-[#1d5fe5] bg-[#eef4ff] text-[#1d5fe5]"
                      : "border-[#dfe7f5] bg-white text-[#3a475a]"
                  }`}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {pricingError && (
              <div className="mt-3 rounded-[8px] bg-[#fff1f1] px-3 py-2 text-[11px] font-semibold text-[#b3261e]">
                {pricingError}
              </div>
            )}

            {pricingLoading ? (
              <div className="mt-4 flex items-center gap-2 text-[12px] text-[#58657a]">
                <span className="material-symbols-outlined animate-spin text-[16px]">progress_activity</span>
                Đang tính giá thuê...
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">Thuê kho x{durationMonths} tháng ({unit.sizeLabel || unit.dimension})</span>
                  <span className="font-semibold text-[#0b1c30]">{formatVnd(pricing?.rentAmount)}</span>
                </div>
                {pricing?.discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="flex items-center gap-1 text-[#0e7b4c]">
                      <span className="material-symbols-outlined text-[14px]">sell</span>
                      Giảm giá
                    </span>
                    <span className="font-semibold text-[#0e7b4c]">-{formatVnd(pricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="flex items-center gap-1 text-[#3a475a]">
                    Tiền cọc
                    <span className="material-symbols-outlined text-[13px] text-[#8996a9]">info</span>
                  </span>
                  <span className="text-right font-semibold text-[#0b1c30]">
                    {formatVnd(pricing?.securityDeposit)}
                    <span className="block text-[10px] font-normal text-[#0e7b4c]">Hoàn trả</span>
                  </span>
                </div>
                {pricing?.bookingFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#3a475a]">Phí đặt chỗ</span>
                    <span className="font-semibold text-[#0b1c30]">{formatVnd(pricing.bookingFee)}</span>
                  </div>
                )}
                {pricing?.taxAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#3a475a]">Thuế</span>
                    <span className="font-semibold text-[#0b1c30]">{formatVnd(pricing.taxAmount)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-[#eef1f8] pt-3">
              <span className="text-[14px] font-bold text-[#0b1c30]">Tổng lần đầu (thanh toán qua QR)</span>
              <span className="text-[20px] font-bold text-[#0b1c30]">{formatVnd(totalToday)}</span>
            </div>

            <div className="mt-3 rounded-[10px] bg-[#f8faff] p-3 text-[11px] text-[#58657a]">
              <div className="flex items-center justify-between text-[12px] font-semibold text-[#0b1c30]">
                Hàng tháng tiếp theo
                <span>{formatVnd(monthlyRent)}/tháng</span>
              </div>
              <div className="mt-1">
                Hủy bất kỳ lúc nào trước khi nhận kho.
              </div>
            </div>

            <div className="mt-3 space-y-1.5 text-[11px] text-[#58657a]">
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">lock</span>
                Bảo mật chuẩn 256-bit
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">event_available</span>
                Hủy miễn phí trước 24h
              </div>
              <div className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[14px] text-[#0e7b4c]">verified</span>
                Giữ giá trong 12 tháng
              </div>
            </div>

            <div className="mt-4 space-y-2 text-[11px] text-[#58657a]">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>
                  Tôi đồng ý với <span className="font-semibold text-[#1d5fe5]">Thỏa thuận Thuê kho</span>.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeLock} onChange={() => setAgreeLock((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>
                  Tôi xác nhận mở khóa qua ứng dụng hoặc mã PIN được cấp.
                </span>
              </label>
            </div>

            {bookingError && (
              <div className="mt-3 rounded-[8px] bg-[#fff1f1] px-3 py-2 text-[11px] font-semibold text-[#b3261e]">
                {bookingError}
              </div>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={() => submitBooking().catch(() => {})}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3 text-[14px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingLoading ? (
                <span className="material-symbols-outlined animate-spin text-[18px]">progress_activity</span>
              ) : (
                <span className="material-symbols-outlined text-[18px]">lock</span>
              )}
              {bookingLoading ? "Đang xử lý..." : "Xác nhận đặt chỗ & Thanh toán"}
              {!bookingLoading && <span className="material-symbols-outlined text-[18px]">arrow_forward</span>}
            </button>

            <div className="mt-2 text-center text-[11px] text-[#8996a9]">Giữ chỗ theo thời hạn hiển thị khi đặt</div>
            <div className="mt-2 text-center text-[11px] text-[#8996a9]">
              Hotline hỗ trợ: <span className="font-semibold text-[#1d5fe5]">1900 6868</span>
            </div>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StorageDetail;
