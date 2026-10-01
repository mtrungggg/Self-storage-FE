import { Link, useNavigate, useLocation } from "react-router-dom";
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
  } = useStorageDetail();

  const navigate = useNavigate();
  const location = useLocation();
  const { user } = useAuth();
  const totalToday = pricing?.totalAmount ?? 0;
  const monthlyRent = pricing?.baseMonthlyRate ?? unit.rentPrice ?? 0;

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
          <div className="text-[14px] font-bold text-[#0b1c30]">{unit.facilityName}</div>
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
              <h1 className="text-[22px] sm:text-[24px] font-bold leading-snug tracking-[-0.02em] text-[#0b1c30]">
                Unit {unit.unitCode}
              </h1>

              <div className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
                <div className="rounded-[12px] border border-[#eef1f8] bg-[#f8faff] p-3">
                  <div className="text-[10px] font-bold uppercase tracking-[0.06em] text-[#8996a9]">Dimensions</div>
                  <div className="mt-1 text-[13px] font-bold text-[#0b1c30]">{unit.sizeLabel || "5' x 10'"} x {unit.height || "2.7m"}</div>
                  <div className="mt-0.5 text-[11px] text-[#8996a9]">{unit.volume || "12.7 m³"}</div>
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
                        Interior view of unit {unit.unitCode}
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

            {/* Step 1: Move-in Date */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3">
                <div className="text-[14px] font-bold text-[#0b1c30]">
                  1. Move-in &amp; Keyless Access Date
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

            {/* Step 2: Rental Duration & Promo Code */}
            <div className="rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
              <div className="mb-3">
                <div className="text-[14px] font-bold text-[#0b1c30]">
                  2. Rental Term &amp; Discount Voucher
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
          </aside>
        </div>
      </main>

      <Footer />
    </div>
  );
}

export default StorageDetail;
