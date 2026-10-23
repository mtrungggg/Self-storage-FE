import { useNavigate, useLocation } from "react-router-dom";
import { useStorageDetail } from "../hooks/useStorageDetail";
import { useAuth } from "../hooks/useAuth";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";

const DURATION_OPTIONS = [
  { months: 1, label: "1 month" },
  { months: 3, label: "3 months" },
  { months: 6, label: "6 months" },
  { months: 12, label: "12 months" },
];

function StorageDetail() {
  const {
    unit,
    sizeTiers,
    currentSizeId,
    largerSizes,
    handleSelectSize,
    sizeUpgradeMessage,
    setSizeUpgradeMessage,
    moveInOptions,
    moveInOption,
    setMoveInOption,
    customDate,
    setCustomDate,
    minCustomDateISO,
    isCustomDateInvalid,
    resolvedStartDate,
    resolvedStartDateLabel,
    holdCountdownStr,
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
    cancelModalOpen,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancel,
  } = useStorageDetail();

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const totalToday = pricing?.totalAmount ?? 0;

  const handleConfirmClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    submitBooking().catch(() => {});
  };

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="rent" />

      {/* Facility Header */}
      <div className="border-b border-[#e6ebf5] bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-2.5 lg:px-6">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={handleOpenCancelModal}
              className="inline-flex items-center gap-1 rounded-[8px] border border-[#dfe7f5] bg-[#f8faff] px-2.5 py-1 text-[12px] font-semibold text-[#58657a] hover:bg-white hover:text-[#b42318] hover:border-[#fecdca] transition"
              title="Hủy đặt kho và quay lại trang chủ"
            >
              <span className="material-symbols-outlined text-[16px]">arrow_back</span>
              <span>Hủy &amp; Quay lại</span>
            </button>
            <span className="text-[#dfe7f5]">|</span>
            <div className="text-[14px] font-bold text-[#0b1c30]">{unit.facilityName}</div>
          </div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#fff1e6] px-3.5 py-1 text-[12px] font-bold text-[#b45309]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#f59e0b]" />
            Hold Time Remaining: {holdCountdownStr}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            {/* Unit Info Box */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center gap-2.5">
                  <h1 className="text-[22px] sm:text-[24px] font-bold leading-snug tracking-[-0.02em] text-[#0b1c30]">
                    Unit {unit.unitCode}
                  </h1>
                  <span className="inline-flex items-center gap-1 rounded-full bg-[#eef4ff] px-3 py-1 text-[12px] font-bold text-[#1d5fe5]">
                    <span className="material-symbols-outlined text-[15px]">straighten</span>
                    {unit.sizeLabel || unit.dimension} • {unit.areaM2 || 3} m²
                  </span>
                </div>
                <div className="text-[12px] font-semibold text-[#64748b]">
                  {unit.typeName || "Self Storage Unit"}
                </div>
              </div>

              {/* Size change / upgrade success alert */}
              {sizeUpgradeMessage && (
                <div className="mt-3.5 flex items-center justify-between rounded-[12px] border border-[#b7eb8f] bg-[#f6ffed] p-3 text-[13px] font-semibold text-[#237804]">
                  <div className="flex items-center gap-2">
                    <span className="material-symbols-outlined text-[18px] text-[#52c41a]">check_circle</span>
                    <span>{sizeUpgradeMessage}</span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSizeUpgradeMessage("")}
                    className="text-[#8c8c8c] hover:text-[#262626] transition"
                    title="Đóng thông báo"
                  >
                    <span className="material-symbols-outlined text-[16px]">close</span>
                  </button>
                </div>
              )}

              {/* Quick Upgrade Callout if current unit has larger options */}
              {largerSizes.length > 0 && (
                <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-[12px] border border-[#fed7aa] bg-[#fffaf5] p-3.5">
                  <div className="flex items-start gap-2.5">
                    <span className="material-symbols-outlined mt-0.5 text-[20px] text-[#ea580c]">upgrade</span>
                    <div>
                      <div className="text-[13px] font-bold text-[#9a3412]">
                        Kho này có vẻ hơi nhỏ cho đồ đạc của bạn?
                      </div>
                      <div className="text-[12px] text-[#7c2d12]">
                        Bạn có thể nâng cấp ngay sang kho lớn hơn để có thêm không gian rộng rãi:
                      </div>
                    </div>
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    {largerSizes.slice(0, 2).map((tier) => (
                      <button
                        key={tier.id}
                        type="button"
                        onClick={() => handleSelectSize(tier.id)}
                        className="inline-flex items-center gap-1 rounded-[8px] border border-[#f97316] bg-white px-2.5 py-1 text-[12px] font-bold text-[#ea580c] shadow-sm hover:bg-[#fff7ed] transition"
                      >
                        <span className="material-symbols-outlined text-[15px]">arrow_upward</span>
                        Đổi sang {tier.name} ({tier.dimensions} - {tier.areaM2}m²)
                      </button>
                    ))}
                  </div>
                </div>
              )}

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Dimensions</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">{unit.sizeLabel || unit.dimension || "5' x 10'"} x {unit.height || "2.8m"}</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">{unit.volume || "12.7 m³"} ({unit.areaM2 || 3} m²)</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Climate</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">20°C – 22°C</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">Humidity Control</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Security</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">Digital Smart Lock</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">PIR Motion Sensor</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Access</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">24/7 Keyless</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">Personal PIN</div>
                </div>
              </div>

              {/* Unit Photos */}
              <div className="mt-5 border-t border-[#eef1f8] pt-4">
                <div className="text-[13px] font-bold text-[#0b1c30]">Space &amp; Unit Photos</div>

                <div className="mt-3">
                  <div className="mt-4 grid grid-cols-1 gap-3 sm:grid-cols-2">
                    <div className="relative overflow-hidden rounded-[10px] border border-[#dfe7f5] bg-slate-100">
                      <img
                        src={unit.image || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80"}
                        alt={`Interior view of unit ${unit.unitCode}`}
                        className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                      />
                      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        Interior view: {unit.unitCode} ({unit.sizeLabel || unit.dimension})
                      </div>
                    </div>

                    <div className="relative overflow-hidden rounded-[10px] border border-[#dfe7f5] bg-slate-100">
                      <img
                        src="https://images.unsplash.com/photo-1586528116311-ad8dd3c8310d?auto=format&fit=crop&w=800&q=80"
                        alt={`Corridor of facility ${unit.facilityName}`}
                        className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                      />
                      <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[11px] font-medium text-white backdrop-blur-sm">
                        Wide Hallway &amp; CCTV Security
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Step 1: Chọn Kích Thước Kho & Đổi Size Lớn Hơn */}
            <div id="storage-size-selection" className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-3.5">
                <div>
                  <div className="text-[14px] font-bold text-[#0b1c30]">
                    1. Kích thước kho &amp; Tùy chọn đổi size (Storage Unit Size)
                  </div>
                  <div className="text-[12px] text-[#58657a]">
                    Kho hiện tại quá nhỏ? Bạn có thể chọn kích cỡ lớn hơn ngay tại đây, giá thuê sẽ tự động cập nhật:
                  </div>
                </div>
                <span className="rounded-full bg-[#f1f5f9] px-3 py-1 text-[11px] font-semibold text-[#475569]">
                  {sizeTiers.length} kích thước có sẵn
                </span>
              </div>

              {/* Size cards grid */}
              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
                {sizeTiers.map((tier) => {
                  const isCurrent = tier.id === currentSizeId;
                  const isLarger = tier.areaM2 > (unit.areaM2 || 3);
                  const percentDifference = Math.round(
                    ((tier.areaM2 - (unit.areaM2 || 3)) / (unit.areaM2 || 3)) * 100
                  );

                  return (
                    <div
                      key={tier.id}
                      onClick={() => handleSelectSize(tier.id)}
                      className={`group relative flex flex-col justify-between rounded-[14px] border p-4 cursor-pointer transition-all ${
                        isCurrent
                          ? "border-[#1d5fe5] bg-[#f0f6ff] shadow-md ring-2 ring-[#1d5fe5]/20"
                          : "border-[#e2e8f0] bg-white hover:border-[#1d5fe5]/60 hover:bg-[#fafcff] hover:shadow-sm"
                      }`}
                    >
                      <div>
                        {/* Header of card: Icon + Name + Badge */}
                        <div className="flex items-start justify-between gap-2">
                          <div className="flex items-center gap-2">
                            <div
                              className={`flex h-8 w-8 items-center justify-center rounded-[8px] ${
                                isCurrent
                                  ? "bg-[#1d5fe5] text-white"
                                  : "bg-[#eef4ff] text-[#1d5fe5]"
                              }`}
                            >
                              <span className="material-symbols-outlined text-[18px]">
                                {tier.icon || "warehouse"}
                              </span>
                            </div>
                            <div>
                              <div className="text-[14px] font-bold text-[#0b1c30]">{tier.name}</div>
                              <div className="text-[11px] font-semibold text-[#64748b]">
                                {tier.dimensions} • {tier.height} cao
                              </div>
                            </div>
                          </div>

                          {isCurrent ? (
                            <span className="inline-flex items-center gap-1 rounded-full bg-[#1d5fe5] px-2.5 py-0.5 text-[10px] font-extrabold tracking-wide text-white">
                              ĐANG CHỌN
                            </span>
                          ) : isLarger ? (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-[#ffedd5] px-2 py-0.5 text-[10px] font-extrabold text-[#c2410c]">
                              +{percentDifference}% rộng hơn
                            </span>
                          ) : (
                            <span className="rounded-full bg-[#f1f5f9] px-2 py-0.5 text-[10px] font-semibold text-[#64748b]">
                              {tier.areaM2} m²
                            </span>
                          )}
                        </div>

                        {/* Capacity and specs */}
                        <div className="mt-3 space-y-1.5 border-t border-[#edf2f7] pt-2.5">
                          <div className="flex items-center justify-between text-[11px]">
                            <span className="font-medium text-[#64748b]">Diện tích &amp; Thể tích:</span>
                            <span className="font-bold text-[#0b1c30]">
                              {tier.areaM2} m² ({tier.volume})
                            </span>
                          </div>
                          <div className="flex items-start justify-between gap-2 text-[11px]">
                            <span className="shrink-0 font-medium text-[#64748b]">Sức chứa:</span>
                            <span className="text-right font-semibold text-[#1e293b]">
                              {tier.capacityLabel}
                            </span>
                          </div>
                          <div className="rounded-[8px] bg-slate-50 p-2 text-[11px] text-[#475569] leading-relaxed">
                            {tier.fitsSummary}
                          </div>
                        </div>
                      </div>

                      {/* Footer button */}
                      <div className="mt-3.5 pt-2 border-t border-[#edf2f7]">
                        <button
                          type="button"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleSelectSize(tier.id);
                          }}
                          className={`w-full rounded-[8px] py-1.5 text-[12px] font-bold transition flex items-center justify-center gap-1 ${
                            isCurrent
                              ? "bg-[#1d5fe5] text-white cursor-default"
                              : isLarger
                              ? "bg-[#ea580c] text-white hover:bg-[#c2410c]"
                              : "border border-[#cbd5e1] bg-white text-[#334155] hover:bg-[#f8fafc]"
                          }`}
                        >
                          {isCurrent ? (
                            <>
                              <span className="material-symbols-outlined text-[16px]">check</span>
                              Kho đang được chọn
                            </>
                          ) : isLarger ? (
                            <>
                              <span className="material-symbols-outlined text-[16px]">arrow_upward</span>
                              Đổi sang kho lớn hơn này
                            </>
                          ) : (
                            <>Đổi sang kích thước này</>
                          )}
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Helpful storage advice note */}
              <div className="mt-3.5 flex items-center gap-3 rounded-[10px] bg-[#f8faff] p-3 text-[12px] text-[#475569]">
                <span className="material-symbols-outlined text-[20px] text-[#1d5fe5] shrink-0">info</span>
                <span>
                  <strong>Mẹo chọn kho:</strong> Nếu bạn đang phân vân giữa 2 kích cỡ, việc chọn kho lớn hơn một bậc (ví dụ từ Small lên Medium) sẽ giúp bạn dễ dàng sắp xếp lối đi bên trong kho để lấy đồ đạc mà không bị chật chội.
                </span>
              </div>
            </div>

            {/* Step 2: Move-in Date */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3">
                <div className="text-[14px] font-bold text-[#0b1c30]">
                  2. Move-in &amp; Keyless Access Date (Ngày nhận kho)
                </div>
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
                    <span className="text-[9px] leading-none">MONTH</span>
                    <span className="text-[13px] font-bold leading-none">
                      {String(resolvedStartDate.getMonth() + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <div className="text-[13px] font-semibold text-[#0b1c30]">
                      Start date: {resolvedStartDateLabel}
                    </div>
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
                      <div className="mt-1 text-[11px] font-semibold text-red-600">Date must be in the future</div>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Step 3: Rental Duration & Promo Code */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3">
                <div className="text-[14px] font-bold text-[#0b1c30]">
                  3. Rental Term &amp; Discount Voucher (Thời hạn thuê &amp; Khuyến mãi)
                </div>
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
                  </button>
                ))}
              </div>

              {/* Promo code input */}
              <div className="mt-4 rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3.5">
                <div className="text-[12px] font-bold text-[#0b1c30]">Promo Code / Discount Voucher</div>
                <div className="mt-2 flex gap-2">
                  <input
                    type="text"
                    value={voucherInput}
                    onChange={(e) => setVoucherInput(e.target.value)}
                    placeholder="Enter voucher code (e.g. PROMO10, SAVE20)"
                    className="flex-1 rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-2 text-[12px] font-semibold uppercase text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
                  />
                  {appliedVoucher ? (
                    <button
                      type="button"
                      onClick={handleClearVoucher}
                      className="rounded-[8px] border border-[#fecdca] bg-[#fff1f1] px-3.5 py-2 text-[12px] font-bold text-[#b3261e] hover:bg-[#fee4e2]"
                    >
                      Remove
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleApplyVoucher}
                      disabled={!voucherInput.trim()}
                      className="rounded-[8px] bg-[#0b1c30] px-4 py-2 text-[12px] font-bold text-white transition hover:bg-[#132741] disabled:opacity-50"
                    >
                      Apply
                    </button>
                  )}
                </div>

                {appliedVoucher && pricing?.discountAmount > 0 && (
                  <div className="mt-2 text-[11px] font-bold text-[#0e7b4c]">
                    Voucher {appliedVoucher} applied: Save {formatVnd(pricing.discountAmount)}!
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <aside className="h-fit rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] lg:sticky lg:top-4">
            <div className="text-[15px] font-bold text-[#0b1c30]">Order Summary</div>

            {/* Selected Storage Unit Size Summary */}
            <div className="mt-3 rounded-[12px] border border-[#dfe7f5] bg-[#f8faff] p-3 text-[12px]">
              <div className="flex items-center justify-between">
                <span className="text-[#64748b]">Kho đang chọn:</span>
                <span className="font-bold text-[#0b1c30]">Unit {unit.unitCode}</span>
              </div>
              <div className="mt-1 flex items-center justify-between font-semibold">
                <span className="text-[#1d5fe5]">{unit.sizeLabel || unit.dimension}</span>
                <span className="text-[#475569]">{unit.areaM2 || 3} m² • {unit.volume || "8.4 m³"}</span>
              </div>
              {largerSizes.length > 0 && (
                <a
                  href="#storage-size-selection"
                  className="mt-2.5 flex items-center justify-center gap-1 rounded-[8px] border border-[#fed7aa] bg-[#fffaf5] py-1 text-[11px] font-bold text-[#ea580c] hover:bg-[#ffedd5] transition"
                >
                  <span className="material-symbols-outlined text-[14px]">upgrade</span>
                  Kho quá nhỏ? Bấm đổi kho lớn hơn
                </a>
              )}
            </div>

            {/* Rental Duration Tabs */}
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
              <div className="mt-4 py-3 text-center text-[12px] text-[#58657a]">
                Calculating pricing...
              </div>
            ) : (
              <div className="mt-4 space-y-2.5 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">Rent x{durationMonths} mo ({unit.sizeLabel || unit.dimension})</span>
                  <span className="font-semibold text-[#0b1c30]">{formatVnd(pricing?.rentAmount)}</span>
                </div>
                {pricing?.discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#0e7b4c]">Voucher discount</span>
                    <span className="font-semibold text-[#0e7b4c]">-{formatVnd(pricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">Security Deposit</span>
                  <span className="text-right font-semibold text-[#0b1c30]">
                    {formatVnd(pricing?.securityDeposit)}
                  </span>
                </div>
                {pricing?.bookingFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#3a475a]">Hold Fee</span>
                    <span className="font-semibold text-[#0b1c30]">{formatVnd(pricing.bookingFee)}</span>
                  </div>
                )}
                {pricing?.taxAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#3a475a]">VAT Tax</span>
                    <span className="font-semibold text-[#0b1c30]">{formatVnd(pricing.taxAmount)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-[#eef1f8] pt-3">
              <span className="text-[14px] font-bold text-[#0b1c30]">Initial Payment (VietQR)</span>
              <span className="text-[20px] font-bold text-[#1d5fe5]">{formatVnd(totalToday)}</span>
            </div>

            <div className="mt-4 space-y-2 text-[11px] text-[#58657a]">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>
                  I agree to the <span className="font-semibold text-[#1d5fe5]">Storage Rental Agreement</span>.
                </span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeLock} onChange={() => setAgreeLock((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>
                  I confirm keyless unlocking via portal or assigned personal keypad PIN.
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
              onClick={handleConfirmClick}
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] bg-[#1d5fe5] py-3 text-[14px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-[#174fc7] disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingLoading ? "Processing..." : "Confirm Reservation & Pay"}
            </button>

            <button
              type="button"
              onClick={handleOpenCancelModal}
              className="mt-2.5 flex w-full items-center justify-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white py-2.5 text-[13px] font-semibold text-[#58657a] hover:border-[#fecdca] hover:bg-[#fffbfa] hover:text-[#b42318] transition"
            >
              <span className="material-symbols-outlined text-[16px]">close</span>
              Hủy đặt kho (Cancel)
            </button>
          </aside>
        </div>
      </main>

      <Footer />

      {/* CONFIRM CANCEL MODAL */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleCloseCancelModal()}
        >
          <div className="w-full max-w-[420px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fee4e2] text-[#d92d20]">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Xác nhận hủy đặt kho</h3>
                <p className="text-[12px] text-[#64748b]">Cancel Storage Reservation</p>
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-[#58657a]">
              Bạn có chắc chắn muốn hủy quá trình đặt ô kho này không? Các tùy chọn bạn đã chọn sẽ không được lưu và bạn sẽ quay về danh sách tìm kiếm kho.
            </p>

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                className="rounded-[10px] border border-[#dfe7f5] bg-white px-4 py-2 text-[13px] font-semibold text-[#3a475a] hover:bg-[#f8faff] transition"
              >
                Tiếp tục đặt kho
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                className="rounded-[10px] bg-[#d92d20] px-4 py-2 text-[13px] font-bold text-white shadow transition hover:bg-[#b42318]"
              >
                Xác nhận hủy
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default StorageDetail;
