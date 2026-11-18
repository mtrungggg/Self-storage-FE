import DatePicker from "@/components/ui/date-picker";
import { useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useStorageDetail } from "../hooks/useStorageDetail";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

export default function CustomerStorageDetail() {
  const { t, lang, formatCurrency } = useLanguage();
  const isVi = lang === "vi";
  const label = (vi, en) => (isVi ? vi : en);

  const {
    unit,
    unitLoading,
    unitError,
    moveInOptions,
    moveInOption,
    setMoveInOption,
    customDate,
    setCustomDate,
    minCustomDateISO,
    resolvedStartDate,
    resolvedStartDateLabel,
    holdCountdownStr,
    durationMonths,
    setDurationMonths,
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

  // 12-month options with 100% synchronized VIE / ENG (no hardcoded "1 tháng")
  const DURATION_OPTIONS = useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => {
        const m = idx + 1;
        return {
          months: m,
          label: isVi ? `${m} tháng` : `${m} ${m === 1 ? "month" : "months"}`,
        };
      }),
    [isVi]
  );

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const firstPaymentDueToday = pricing?.firstPaymentAmount ?? 0;

  const handleConfirmClick = () => {
    if (!user) {
      navigate("/login", { state: { from: location } });
      return;
    }
    submitBooking().catch(() => {});
  };

  if (unitLoading) {
    return (
      <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
        <PageBackground />
        <Header active="rent" />
        <main className="mx-auto flex w-full max-w-6xl flex-1 items-center justify-center p-12">
          <div className="flex items-center gap-2.5 text-xs font-bold text-slate-500">
            <span className="material-symbols-outlined animate-spin text-[20px] text-zinc-900">progress_activity</span>
            <span>{label("Đang tải thông tin ô kho...", "Loading storage unit...")}</span>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (!unit) {
    return (
      <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
        <PageBackground />
        <Header active="rent" />
        <main className="mx-auto flex w-full max-w-md flex-1 flex-col items-center justify-center p-8 text-center">
          <span className="material-symbols-outlined text-[40px] text-slate-400">warehouse</span>
          <h1 className="mt-3 text-lg font-bold text-slate-900 dark:text-zinc-100">
            {label("Không tìm thấy ô kho đã chọn", "No storage unit selected")}
          </h1>
          <p className="mt-1.5 text-xs text-slate-500">
            {unitError || label("Vui lòng chọn một ô kho khả dụng từ danh sách.", "Please pick an available storage unit from the catalog.")}
          </p>
          <Link to="/home" className="mt-5 rounded-xl bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 transition">
            {label("Xem danh sách kho trống", "Browse Available Units")}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  const rawCategory = unit.categoryName || unit.typeName || "Kho hàng khô";
  const categoryName = rawCategory.replace(/\s*\d+(\.\d+)?\s*(m2|m²)/gi, "").trim() || rawCategory;
  const areaValue = unit.areaM2 || unit.area || 3;
  const rawDimension = unit.dimension || (unit.length && unit.width ? `${unit.length}m × ${unit.width}m` : "2.0m × 1.5m");
  const dimensionStr = rawDimension.replace(/\s*\([^)]*m[2²][^)]*\)/gi, "").trim();
  const floorName = unit.floorLabel || "1";
  const zoneName = unit.zoneLabel || "A";

  // Generate mini grid positions for floor plan
  const nearbyUnits = [
    { code: `${zoneName}-${floorName}01`, isTarget: unit.unitCode.endsWith("01") || (!unit.unitCode.includes("02") && !unit.unitCode.includes("03") && !unit.unitCode.includes("04")) },
    { code: `${zoneName}-${floorName}02`, isTarget: unit.unitCode.endsWith("02") },
    { code: `${zoneName}-${floorName}03`, isTarget: unit.unitCode.endsWith("03") },
    { code: `${zoneName}-${floorName}04`, isTarget: unit.unitCode.endsWith("04") },
    { code: `${zoneName}-${floorName}05`, isTarget: unit.unitCode.endsWith("05") },
    { code: `${zoneName}-${floorName}06`, isTarget: unit.unitCode.endsWith("06") },
  ];

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="rent" />

      {/* Facility & Hold Timer Topbar */}
      <div className="border-b border-slate-200 bg-white/80 backdrop-blur-sm dark:border-zinc-800 dark:bg-zinc-900/80">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-2.5 sm:px-6">
          <div className="flex items-center gap-2 text-xs font-bold text-slate-800 dark:text-zinc-200">
            <span className="material-symbols-outlined text-[16px] text-blue-600">location_on</span>
            <span>{unit.facilityName}</span>
          </div>
          <div className="flex items-center gap-1.5 rounded-full border border-amber-200 bg-amber-50 px-3 py-0.5 text-xs font-bold text-amber-800 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-300">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-amber-500" />
            <span>{label("Thời gian giữ chỗ:", "Hold Time:")} {holdCountdownStr}</span>
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-6xl flex-1 px-4 py-6 sm:px-6 space-y-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 items-start">
          {/* Main Unit Details (lg:col-span-7) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-4 dark:border-zinc-800">
                <div>
                  <div className="flex items-center gap-2">
                    <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900 dark:text-zinc-100">
                      {label("Ô kho", "Unit")} {unit.unitCode}
                    </h1>
                    <span className="rounded-full border border-blue-200 bg-blue-50 px-2.5 py-0.5 text-xs font-bold text-blue-700 dark:border-blue-900 dark:bg-blue-950/60 dark:text-blue-300">
                      {categoryName}
                    </span>
                  </div>
                  <p className="mt-1 text-xs text-slate-500 dark:text-zinc-400">
                    {label("Tầng", "Floor")} {floorName} • {label("Khu", "Zone")} {zoneName} • {unit.facilityName}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500 block">
                    {label("Đơn giá thuê", "Rental Rate")}
                  </span>
                  <span className="text-lg font-black text-blue-600 dark:text-blue-400">
                    {formatCurrency(unit.rentPrice)}
                    <span className="text-xs font-semibold text-slate-500">/{label("tháng", "mo")}</span>
                  </span>
                </div>
              </div>

              {/* 4 Clean Specs Cards (No Hardcoded Small Dry Goods) */}
              <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {label("Diện tích & Kích thước", "Area & Dimensions")}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {areaValue} m²
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400 font-mono">
                    {dimensionStr}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {label("Loại kho lưu trữ", "Storage Category")}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-900 dark:text-zinc-100 truncate" title={categoryName}>
                    {categoryName}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    {unit.height ? `${label("Chiều cao:", "Height:")} ${unit.height}` : label("Tiêu chuẩn", "Standard")}
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {label("An ninh & Giám sát", "Security & CCTV")}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-900 dark:text-zinc-100">
                    {label("Khóa số & PIN", "Smart PIN Lock")}
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    CCTV 24/7
                  </div>
                </div>

                <div className="rounded-xl border border-slate-100 bg-slate-50/70 p-3 dark:border-zinc-800 dark:bg-zinc-800/40">
                  <div className="text-[10px] font-bold uppercase tracking-wider text-slate-500 dark:text-zinc-400">
                    {label("Quyền ra vào", "Access Hours")}
                  </div>
                  <div className="mt-1 text-xs font-bold text-slate-900 dark:text-zinc-100">
                    24/7
                  </div>
                  <div className="mt-0.5 text-[11px] text-slate-500 dark:text-zinc-400">
                    {label("Mã PIN cá nhân", "Keyless PIN")}
                  </div>
                </div>
              </div>

              {/* Photos & Upgraded Floor Plan Grid */}
              <div className="mt-5 border-t border-slate-100 pt-4 dark:border-zinc-800">
                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100 mb-3">
                  {label("Hình ảnh thực tế & Sơ đồ vị trí ô kho", "Photos & Floor Route to Unit")}
                </div>

                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {/* Photo 1: Unit Real Photo */}
                  <div className="relative overflow-hidden rounded-xl border border-slate-200 bg-slate-100 dark:border-zinc-800">
                    <img
                      src={unit.image || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80"}
                      alt={`Unit ${unit.unitCode}`}
                      className="h-48 w-full object-cover transition duration-300 hover:scale-105"
                    />
                    <div className="absolute bottom-2 left-2 rounded bg-black/60 px-2 py-0.5 text-[10px] font-bold text-white backdrop-blur-xs">
                      {unit.unitCode} ({dimensionStr})
                    </div>
                  </div>

                  {/* Photo 2: Mini Floor Plan & Path Navigation */}
                  <div className="relative flex flex-col justify-between rounded-xl border border-blue-200 bg-gradient-to-br from-blue-50/80 via-white to-slate-50 p-3 shadow-xs dark:border-blue-900/60 dark:from-zinc-900 dark:to-zinc-950 h-48">
                    {/* Header */}
                    <div className="flex items-center justify-between text-[11px] font-bold text-slate-800 dark:text-zinc-200 border-b border-blue-100 pb-1.5 dark:border-zinc-800">
                      <span className="flex items-center gap-1">
                        <span className="material-symbols-outlined text-[15px] text-blue-600">map</span>
                        <span>{label(`Sơ đồ đi vào ô kho ${unit.unitCode}`, `Floor Plan & Route to Unit ${unit.unitCode}`)}</span>
                      </span>
                      <span className="rounded bg-blue-100 px-1.5 py-0.5 text-[10px] font-bold text-blue-800 dark:bg-blue-950 dark:text-blue-300">
                        {label(`Tầng ${floorName}`, `Floor ${floorName}`)} • {label(`Khu ${zoneName}`, `Zone ${zoneName}`)}
                      </span>
                    </div>

                    {/* Architectural Mini Grid */}
                    <div className="my-1.5 flex items-center justify-between gap-2">
                      {/* Entrance Marker */}
                      <div className="flex flex-col items-center justify-center rounded-lg border border-dashed border-emerald-400 bg-emerald-50 px-2 py-1.5 text-center dark:bg-emerald-950/40">
                        <span className="text-[13px]">🚪</span>
                        <span className="text-[9px] font-bold text-emerald-800 dark:text-emerald-300">
                          {label("Lối vào", "Entrance")}
                        </span>
                      </div>

                      {/* Direction arrow */}
                      <div className="flex items-center text-blue-500">
                        <span className="material-symbols-outlined text-[16px] animate-pulse">east</span>
                      </div>

                      {/* Grid Slots */}
                      <div className="grid grid-cols-3 gap-1.5 flex-1">
                        {nearbyUnits.map((u, i) => (
                          <div
                            key={i}
                            className={`rounded-lg p-1.5 flex flex-col items-center justify-center text-center transition-all ${
                              u.isTarget
                                ? "bg-blue-600 text-white font-extrabold shadow-sm ring-2 ring-blue-400 animate-pulse"
                                : "border border-slate-200 bg-white/90 text-slate-600 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                            }`}
                          >
                            <span className="font-mono text-[10px] leading-tight">
                              {u.isTarget ? unit.unitCode : u.code}
                            </span>
                            {u.isTarget && (
                              <span className="text-[8px] uppercase tracking-tighter opacity-90">
                                {label("Vị trí bạn chọn", "Selected")}
                              </span>
                            )}
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Route Step Path */}
                    <div className="flex items-center gap-1.5 rounded-lg bg-white/80 px-2 py-1 text-[10px] text-slate-600 dark:bg-zinc-800/80 dark:text-zinc-300 border border-slate-100 dark:border-zinc-800">
                      <span className="material-symbols-outlined text-[13px] text-blue-600">directions_walk</span>
                      <span className="truncate">
                        {label(
                          `Cổng chính → Tầng ${floorName} → Dãy ${zoneName} → ${unit.unitCode}`,
                          `Main Entrance → Floor ${floorName} → Zone ${zoneName} → ${unit.unitCode}`
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Move-in Date Picker */}
            <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900">
              <div className="text-sm font-bold text-slate-900 dark:text-zinc-100 mb-3">
                {label("Chọn ngày bắt đầu thuê", "Select Move-in Date")}
              </div>

              <div className="grid grid-cols-2 gap-2 sm:grid-cols-4">
                {moveInOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMoveInOption(opt.id)}
                    className={`rounded-xl border px-3 py-2.5 text-xs font-semibold transition cursor-pointer ${
                      moveInOption === opt.id
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-xs dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-200"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>

              <div className="mt-3.5 flex flex-wrap items-center justify-between gap-3 rounded-xl bg-slate-50 p-3 dark:bg-zinc-800/50 border border-slate-100 dark:border-zinc-800">
                <div className="flex items-center gap-2.5 text-xs">
                  <div className="flex h-9 w-9 flex-col items-center justify-center rounded-lg bg-zinc-900 text-white font-mono">
                    <span className="text-[9px] uppercase leading-none opacity-80">{label("TH", "M")}</span>
                    <span className="text-[12px] font-bold leading-none mt-0.5">
                      {String(resolvedStartDate.getMonth() + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div>
                    <span className="font-bold text-slate-900 dark:text-zinc-100 block">
                      {label("Ngày kích hoạt hợp đồng:", "Contract Start Date:")}
                    </span>
                    <span className="text-slate-500 dark:text-zinc-400">{resolvedStartDateLabel}</span>
                  </div>
                </div>

                {moveInOption === "custom" && (
                  <div className="w-48">
                    <DatePicker value={customDate} min={minCustomDateISO} onChange={(e) => setCustomDate(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* Right Sidebar: Order Summary & Term Options (lg:col-span-5) */}
          <aside className="lg:col-span-5 rounded-2xl border border-slate-200 bg-white p-5 shadow-xs dark:border-zinc-800 dark:bg-zinc-900 lg:sticky lg:top-4 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 dark:border-zinc-800">
              <h2 className="text-sm font-bold text-slate-900 dark:text-zinc-100">
                {label("Tóm tắt đặt thuê", "Order Summary")}
              </h2>
              <span className="text-xs font-semibold text-slate-500">
                {unit.unitCode}
              </span>
            </div>

            {/* Duration Selector (12 buttons) */}
            <div>
              <label className="mb-2 block text-xs font-bold text-slate-700 dark:text-zinc-300">
                {label("Thời gian thuê (Tháng)", "Rental Duration (Months)")}
              </label>
              <div className="grid grid-cols-4 gap-1.5">
                {DURATION_OPTIONS.map((opt) => (
                  <button
                    key={opt.months}
                    type="button"
                    onClick={() => setDurationMonths(opt.months)}
                    className={`rounded-lg border px-2 py-1.5 text-[11px] font-bold transition cursor-pointer ${
                      durationMonths === opt.months
                        ? "border-zinc-900 bg-zinc-900 text-white shadow-xs dark:border-zinc-100 dark:bg-zinc-100 dark:text-zinc-900"
                        : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50 dark:border-zinc-700 dark:bg-zinc-800 dark:text-zinc-300"
                    }`}
                  >
                    {opt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Pricing Error Banner */}
            {pricingError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {pricingError}
              </div>
            )}

            {/* Pricing Breakdown */}
            {pricingLoading ? (
              <div className="py-4 text-center text-xs text-slate-400 animate-pulse">
                {label("Đang tính cước phí...", "Calculating pricing...")}
              </div>
            ) : pricing && (
              <div className="space-y-2 text-xs border-t border-slate-100 pt-3 dark:border-zinc-800">
                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                  <span>{label("Đơn giá thuê / tháng:", "Monthly Rate:")}</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">{formatCurrency(pricing.baseMonthlyRate)}</span>
                </div>

                {durationMonths > 1 && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                    <span>{label(`Tổng tiền thuê (${durationMonths} tháng):`, `Full Term (${durationMonths} mo):`)}</span>
                    <span>{formatCurrency(pricing.rentSubtotal)}</span>
                  </div>
                )}

                {pricing.discountAmount > 0 && (
                  <div className="flex items-center justify-between text-emerald-600 dark:text-emerald-400 font-semibold">
                    <span>{label(`Ưu đãi (${pricing.appliedPromotionCode}):`, `Discount (${pricing.appliedPromotionCode}):`)}</span>
                    <span>-{formatCurrency(pricing.discountAmount)}</span>
                  </div>
                )}

                <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                  <span>{label("Tiền cọc giữ kho (hoàn lại):", "Security Deposit (Refundable):")}</span>
                  <span className="font-semibold text-slate-900 dark:text-zinc-100">{formatCurrency(pricing.depositAmount)}</span>
                </div>

                {pricing.bookingFee > 0 && (
                  <div className="flex items-center justify-between text-slate-600 dark:text-zinc-300">
                    <span>{label("Phí giữ chỗ:", "Booking Fee:")}</span>
                    <span className="font-semibold text-slate-900 dark:text-zinc-100">{formatCurrency(pricing.bookingFee)}</span>
                  </div>
                )}

                {pricing.taxAmount > 0 && (
                  <div className="flex items-center justify-between text-slate-500 dark:text-zinc-400">
                    <span>{label(`Thuế VAT (${pricing.vatRatePercent}%):`, `VAT (${pricing.vatRatePercent}%):`)}</span>
                    <span>{formatCurrency(pricing.taxAmount)}</span>
                  </div>
                )}
              </div>
            )}

            {/* Total Due Today */}
            <div className="flex items-center justify-between border-t border-slate-200 pt-3 dark:border-zinc-800">
              <div>
                <div className="text-xs font-bold text-slate-900 dark:text-zinc-100">
                  {label("Tổng thanh toán hôm nay", "Total Due Today")}
                </div>
                {pricing?.totalContractAmount != null && durationMonths > 1 && (
                  <div className="text-[11px] text-slate-500 dark:text-zinc-400">
                    {label("Tổng hợp đồng:", "Contract total:")} {formatCurrency(pricing.totalContractAmount)}
                  </div>
                )}
              </div>
              <span className="text-xl font-black text-blue-600 dark:text-blue-400">
                {formatCurrency(firstPaymentDueToday)}
              </span>
            </div>

            {/* Agreement Checkboxes */}
            <div className="space-y-2 border-t border-slate-100 pt-3 text-xs text-slate-600 dark:border-zinc-800 dark:text-zinc-400">
              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeTerms}
                  onChange={() => setAgreeTerms((v) => !v)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                />
                <span>{label("Tôi đồng ý với các điều khoản thuê kho", "I agree to the rental terms")}</span>
              </label>

              <label className="flex items-start gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={agreeLock}
                  onChange={() => setAgreeLock((v) => !v)}
                  className="mt-0.5 h-3.5 w-3.5 rounded border-slate-300 text-blue-600"
                />
                <span>{label("Tôi xác nhận đã hiểu hướng dẫn nhận kho & mở khóa bằng mã PIN", "I confirm keyless PIN opening instructions")}</span>
              </label>
            </div>

            {bookingError && (
              <div className="rounded-xl border border-red-200 bg-red-50 p-2.5 text-xs text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                {bookingError}
              </div>
            )}

            <button
              type="button"
              disabled={!canSubmit}
              onClick={handleConfirmClick}
              className="flex w-full items-center justify-center gap-2 rounded-xl bg-zinc-900 py-3 text-xs font-bold text-white shadow-xs hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50 transition cursor-pointer dark:bg-zinc-100 dark:text-zinc-900 dark:hover:bg-white"
            >
              {bookingLoading
                ? label("Đang xử lý đặt kho...", "Processing...")
                : label("Xác nhận thuê kho ngay", "Rent This Unit Now")}
            </button>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}
