import DatePicker from "@/components/ui/date-picker";
import { useMemo } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useStorageDetail } from "../hooks/useStorageDetail";
import { useAuth } from "../hooks/useAuth";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";

function StorageDetail() {
  const { t, formatCurrency } = useLanguage();
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

  const DURATION_OPTIONS = useMemo(
    () =>
      Array.from({ length: 12 }, (_, idx) => {
        const m = idx + 1;
        return {
          months: m,
          label: `${m} ${t(m === 1 ? "renewal.month_count" : "renewal.months_count", "tháng")}`,
        };
      }),
    [t]
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
        <main className="mx-auto flex w-full max-w-[1280px] flex-1 items-center justify-center p-12">
          <span className="text-sm font-semibold text-[#58657a]">{t("common.loading", "Loading storage unit...")}</span>
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
        <main className="mx-auto flex w-full max-w-[560px] flex-1 flex-col items-center justify-center p-8 text-center">
          <h1 className="text-xl font-bold text-[#0b1c30]">{t("home.no_unit_selected", "No storage unit selected")}</h1>
          <p className="mt-2 text-sm text-[#58657a]">{unitError || "Please pick an available storage unit from the catalog."}</p>
          <Link to="/home" className="mt-5 rounded-xl bg-zinc-900 px-5 py-2.5 text-sm font-bold text-white">
            {t("home.available_units", "Browse Available Units")}
          </Link>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="rent" />

      <div className="border-b border-[#e6ebf5] bg-white">
        <div className="mx-auto flex max-w-[1280px] items-center justify-between px-4 py-2.5 lg:px-6">
          <div className="text-[14px] font-bold text-[#0b1c30]">{unit.facilityName}</div>
          <div className="flex items-center gap-1.5 rounded-full bg-[#fff1e6] px-3.5 py-1 text-[12px] font-bold text-[#b45309]">
            <span className="inline-block h-2 w-2 animate-pulse rounded-full bg-[#f59e0b]" />
            {t("common.due_date", "Hold Time")}: {holdCountdownStr}
          </div>
        </div>
      </div>

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-6 lg:px-6">
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_380px]">
          <div className="space-y-6">
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <h1 className="text-[22px] sm:text-[24px] font-bold leading-snug tracking-[-0.02em] text-[#0b1c30]">
                {t("common.unit", "Unit")} {unit.unitCode}
              </h1>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">{t("common.size", "Dimensions")}</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">{unit.sizeLabel || "—"} {unit.height ? `x ${unit.height}` : ""}</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">{unit.volume || "—"}</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">{t("home.climate", "Type")}</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">{unit.typeName}</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">{unit.climateNote || "Self-Storage"}</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">{t("home.feature_cctv", "Security")}</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">{t("home.feature_smart_access", "Smart Lock")}</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">CCTV 24/7</div>
                </div>
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">{t("access.title", "Access")}</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">{t("home.feature_24_7", "24/7")}</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">{t("access.pin_display", "PIN Code")}</div>
                </div>
              </div>

              <div className="mt-5 border-t border-[#eef1f8] pt-4">
                <div className="text-[13px] font-bold text-[#0b1c30]">{t("booking.unit_images", "Unit Photos")}</div>
                <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
                  <div className="relative overflow-hidden rounded-[10px] border border-[#dfe7f5] bg-slate-100">
                    <img
                      src={unit.image || "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80"}
                      alt={`Unit ${unit.unitCode}`}
                      className="h-44 w-full object-cover transition duration-300 hover:scale-105"
                    />
                  </div>
                  <div className="relative overflow-hidden rounded-[10px] border border-[#dfe7f5] bg-slate-50 p-3 flex flex-col justify-between h-44">
                    <div className="flex items-center justify-between text-[10px] font-bold text-slate-700">
                      <span>Sơ đồ đi vào ô kho {unit.unitCode}</span>
                      <span className="rounded bg-emerald-100 px-1.5 py-0.5 text-emerald-800">
                        {unit.floorLabel || "Tầng 1"} · {unit.zoneLabel || "Zone A"}
                      </span>
                    </div>
                    <div className="grid grid-cols-3 gap-1.5 my-1.5 flex-1">
                      {["Zone A (T1)", "Zone B (T1)", "Zone A (T2)"].map((zLabel, idx) => {
                        const uCode = String(unit.unitCode || "").toUpperCase();
                        const isTarget =
                          (idx === 0 && (uCode.startsWith("A-1") || (!uCode.startsWith("B-") && !uCode.startsWith("A-2")))) ||
                          (idx === 1 && uCode.startsWith("B-")) ||
                          (idx === 2 && uCode.startsWith("A-2"));
                        return (
                          <div
                            key={zLabel}
                            className={`rounded-lg border p-1.5 flex flex-col items-center justify-center text-[10px] ${
                              isTarget
                                ? "border-blue-500 bg-blue-50 font-bold text-blue-900 ring-2 ring-blue-300"
                                : "border-dashed border-slate-300 bg-white/70 text-slate-400"
                            }`}
                          >
                            <span>{zLabel}</span>
                            {isTarget && (
                              <span className="mt-1 rounded bg-emerald-600 px-1.5 py-0.5 text-[10px] font-bold text-white shadow-xs">
                                {unit.unitCode}
                              </span>
                            )}
                          </div>
                        );
                      })}
                    </div>
                    <div className="flex items-center gap-1 text-[10px] text-slate-500">
                      <span className="material-symbols-outlined text-[13px] text-blue-600">directions</span>
                      <span>Cổng chính → {unit.floorLabel || "Tầng 1"} → {unit.unitCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3">
                <div className="text-[14px] font-bold text-[#0b1c30]">{t("common.start_date", "Ngày bắt đầu")}</div>
              </div>

              <div className="grid grid-cols-2 gap-2 md:grid-cols-4">
                {moveInOptions.map((opt) => (
                  <button
                    key={opt.id}
                    type="button"
                    onClick={() => setMoveInOption(opt.id)}
                    className={`rounded-[10px] border px-3 py-2.5 text-[12px] font-semibold transition ${
                      moveInOption === opt.id
                        ? "border-zinc-900 bg-[#eef4ff] text-zinc-900"
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
                    <span className="text-[9px] leading-none">{t("common.date", "DATE")}</span>
                    <span className="text-[13px] font-bold leading-none">
                      {String(resolvedStartDate.getMonth() + 1).padStart(2, "0")}
                    </span>
                  </div>
                  <div className="text-[13px] font-semibold text-[#0b1c30]">
                    {t("common.start_date", "Start Date")}: {resolvedStartDateLabel}
                  </div>
                </div>
                {moveInOption === "custom" && (
                  <div className="w-48 mt-1.5">
                    <DatePicker value={customDate} min={minCustomDateISO} onChange={(e) => setCustomDate(e.target.value)} />
                  </div>
                )}
              </div>
            </div>
          </div>

          <aside className="h-fit rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.04)] lg:sticky lg:top-4">
            <div className="text-[15px] font-bold text-[#0b1c30]">{t("common.total", "Order Summary")}</div>

            <div className="mt-3 grid grid-cols-4 gap-1.5">
              {DURATION_OPTIONS.map((opt) => (
                <button
                  key={opt.months}
                  type="button"
                  onClick={() => setDurationMonths(opt.months)}
                  className={`rounded-[8px] border px-1.5 py-1.5 text-[11px] font-bold transition ${
                    durationMonths === opt.months
                      ? "border-zinc-900 bg-[#eef4ff] text-zinc-900"
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
                {t("common.loading", "Calculating pricing...")}
              </div>
            ) : pricing && (
              <div className="mt-4 space-y-2 text-[12px]">
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">Monthly Rate (Month 1)</span>
                  <span className="font-semibold text-[#0b1c30]">{formatCurrency(pricing.baseMonthlyRate)}</span>
                </div>
                {durationMonths > 1 && (
                  <div className="flex items-center justify-between text-[#64748b]">
                    <span>Full Term ({durationMonths} mo)</span>
                    <span>{formatCurrency(pricing.rentSubtotal)}</span>
                  </div>
                )}
                {pricing.discountAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#0e7b4c]">Discount ({pricing.appliedPromotionCode})</span>
                    <span className="font-semibold text-[#0e7b4c]">-{formatCurrency(pricing.discountAmount)}</span>
                  </div>
                )}
                <div className="flex items-center justify-between">
                  <span className="text-[#3a475a]">{t("common.deposit", "Security Deposit")}</span>
                  <span className="font-semibold text-[#0b1c30]">{formatCurrency(pricing.depositAmount)}</span>
                </div>
                {pricing.bookingFee > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#3a475a]">Booking Fee</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(pricing.bookingFee)}</span>
                  </div>
                )}
                {pricing.taxAmount > 0 && (
                  <div className="flex items-center justify-between">
                    <span className="text-[#3a475a]">VAT ({pricing.vatRatePercent}%)</span>
                    <span className="font-semibold text-[#0b1c30]">{formatCurrency(pricing.taxAmount)}</span>
                  </div>
                )}
              </div>
            )}

            <div className="mt-4 flex items-center justify-between border-t border-[#eef1f8] pt-3">
              <div>
                <div className="text-[14px] font-bold text-[#0b1c30]">{t("common.total", "Due Today")}</div>
                {pricing?.totalContractAmount != null && durationMonths > 1 && (
                  <div className="text-[11px] text-[#64748b]">Contract total: {formatCurrency(pricing.totalContractAmount)}</div>
                )}
              </div>
              <span className="text-[20px] font-bold text-zinc-900">{formatCurrency(firstPaymentDueToday)}</span>
            </div>

            <div className="mt-4 space-y-2 text-[11px] text-[#58657a]">
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeTerms} onChange={() => setAgreeTerms((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>{t("booking.agree_terms", "I agree to the rental terms")}</span>
              </label>
              <label className="flex items-start gap-2">
                <input type="checkbox" checked={agreeLock} onChange={() => setAgreeLock((v) => !v)} className="mt-0.5 h-3.5 w-3.5 accent-[#1d5fe5]" />
                <span>{t("booking.confirm_keyless_pin", "I confirm keyless PIN opening instructions")}</span>
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
              className="mt-4 flex w-full items-center justify-center gap-2 rounded-[12px] bg-zinc-900 py-3 text-[14px] font-bold text-white shadow-[0_14px_24px_rgba(29,95,229,0.25)] transition hover:bg-zinc-800 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {bookingLoading ? t("common.loading", "Processing...") : t("home.rent_now", "Rent Now")}
            </button>
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StorageDetail;
