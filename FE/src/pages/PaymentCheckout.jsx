import { usePaymentCheckout } from "../hooks/usePaymentCheckout";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";

function PaymentCheckout() {
  const {
    checkout,
    reservation,
    loading,
    error,
    status,
    formattedCountdown,
    progressPercent,
    cancelModalOpen,
    cancelling,
    cancelError,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancel,
    navigate,
  } = usePaymentCheckout();

  // Resolve payable amount: checkout amount, or reservation snapshot, or invoice total
  const displayAmount =
    checkout?.amount ||
    checkout?.vietQr?.amount ||
    reservation?.quotedTotal ||
    reservation?.amount ||
    0;

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="billing" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 lg:px-6">
        {loading ? (
          <div className="mx-auto mt-16 flex max-w-[480px] flex-col items-center justify-center rounded-[20px] border border-[#dfe7f5] bg-white/80 p-12 text-center shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-md">
            <span className="material-symbols-outlined animate-spin text-[36px] text-[#1d5fe5]">
              progress_activity
            </span>
            <div className="mt-4 text-[16px] font-bold text-[#0b1c30]">
              Initializing VietQR payment session...
            </div>
            <div className="mt-1 text-[13px] text-[#8996a9]">
              Connecting to secure banking gateway via SePay
            </div>
          </div>
        ) : error && !checkout ? (
          <div className="mx-auto mt-12 max-w-[500px] rounded-[20px] border border-[#fecdca] bg-white p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-[#d92d20]">
              error_outline
            </span>
            <h2 className="mt-3 text-[18px] font-bold text-[#b42318]">
              Payment Session Not Found
            </h2>
            <p className="mt-2 text-[13px] text-[#58657a]">{error}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#1d5fe5] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                Explore Available Units
              </button>
              <button
                onClick={() => navigate("/billing")}
                className="inline-flex items-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#3a475a] transition hover:bg-[#f8faff]"
              >
                My Invoices
              </button>
            </div>
          </div>
        ) : status === "success" ? (
          /* STATUS: PAYMENT SUCCESS */
          <div className="mx-auto mt-8 max-w-[540px] rounded-[22px] border border-[#a6f4c5] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ecfdf3] text-[#12b76a]">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h1 className="mt-5 text-[24px] font-extrabold text-[#027a48]">
              Payment Successful!
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#475467]">
              We have received your payment via SePay. Your storage unit has been automatically activated.
            </p>

            <div className="mt-6 rounded-[14px] border border-[#e4e7ec] bg-[#f8f9fc] p-4 text-left text-[13px]">
              <div className="flex justify-between py-1.5 border-b border-[#eaecf0]">
                <span className="text-[#667085]">Reservation Code:</span>
                <span className="font-bold text-[#0b1c30]">
                  {reservation?.reservationCode || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#eaecf0]">
                <span className="text-[#667085]">Paid Amount:</span>
                <span className="font-bold text-[#1d5fe5]">
                  {formatVnd(displayAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#667085]">Status:</span>
                <span className="inline-flex items-center gap-1 font-bold text-[#0e7b4c]">
                  <span className="h-2 w-2 rounded-full bg-[#12b76a]"></span>
                  Active &amp; Ready to Use
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                onClick={() => navigate("/dashboard")}
                className="w-full sm:w-auto flex items-center justify-center gap-2 rounded-[12px] bg-[#12b76a] px-6 py-3 text-[14px] font-bold text-white shadow-md transition hover:bg-[#0e9f5d]"
              >
                <span className="material-symbols-outlined text-[20px]">inventory_2</span>
                Go to My Units Now
              </button>
              <button
                onClick={() => navigate("/billing")}
                className="w-full sm:w-auto rounded-[12px] border border-[#d0d5dd] bg-white px-5 py-3 text-[14px] font-semibold text-[#344054] transition hover:bg-[#f9fafb]"
              >
                View Invoice History
              </button>
            </div>
          </div>
        ) : status === "expired" ? (
          /* STATUS: RESERVATION HOLD EXPIRED */
          <div className="mx-auto mt-8 max-w-[520px] rounded-[22px] border border-[#fedf89] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fffcf5] text-[#d97706]">
              <span className="material-symbols-outlined text-[48px]">schedule</span>
            </div>
            <h1 className="mt-5 text-[22px] font-extrabold text-[#b54708]">
              Reservation Hold Expired (15 Minutes)
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#475467]">
              The temporary holding window for this unit has expired. The unit has been released back into the system for other customers.
            </p>
            <div className="mt-6">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#1d5fe5] px-6 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                Browse &amp; Reserve Again
              </button>
            </div>
          </div>
        ) : status === "failed" ? (
          /* STATUS: CANCELLED */
          <div className="mx-auto mt-8 max-w-[520px] rounded-[22px] border border-[#fecdca] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fffbfa] text-[#d92d20]">
              <span className="material-symbols-outlined text-[48px]">cancel</span>
            </div>
            <h1 className="mt-5 text-[22px] font-extrabold text-[#b42318]">
              Reservation Cancelled
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#475467]">
              You have cancelled this checkout session. The storage unit has been released back to available.
            </p>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#1d5fe5] px-6 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                Find Another Unit
              </button>
            </div>
          </div>
        ) : (
          /* STATUS: AWAITING PAYMENT - SHOW QR & 15-MIN COUNTDOWN */
          <div className="mx-auto max-w-[480px]">
            {/* 15-Minute Countdown Bar */}
            <div className="overflow-hidden rounded-[18px] border border-[#fedf89] bg-[#fffcf5] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#b54708]">
                  <span className="material-symbols-outlined animate-pulse text-[20px] text-[#f79009]">
                    timer
                  </span>
                  Hold Time Remaining:
                </div>
                <div className="font-mono text-[20px] font-black tracking-wider text-[#b54708]">
                  {formattedCountdown}
                </div>
              </div>

              {/* Progress bar */}
              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#fef0c7]">
                <div
                  className="h-full bg-gradient-to-r from-[#f79009] to-[#d92d20] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            {/* VietQR Box */}
            <div className="mt-5 rounded-[22px] border border-[#dfe7f5] bg-white p-6 text-center shadow-[0_12px_32px_rgba(15,23,42,0.05)]">
              <div className="text-[18px] font-black text-[#0b1c30]">
                Scan VietQR to Pay
              </div>
              {reservation?.reservationCode && (
                <div className="mt-1 text-[13px] text-[#58657a]">
                  Reservation Code: <span className="font-bold text-[#0b1c30]">{reservation.reservationCode}</span>
                </div>
              )}

              {/* QR Image */}
              {checkout?.vietQr?.qrImageUrl ? (
                <div className="mt-4 flex flex-col items-center">
                  <div className="relative h-[280px] w-[280px] overflow-hidden rounded-[16px] border border-[#dfe7f5] bg-white p-2 shadow-sm">
                    <img
                      src={checkout.vietQr.qrImageUrl}
                      alt="VietQR"
                      className="h-full w-full object-contain"
                    />
                  </div>

                  <div className="mt-3 text-[14px] font-bold text-[#0b1c30]">
                    {checkout.vietQr.accountName || "Self Storage System"}
                  </div>
                  <div className="text-[24px] font-black text-[#1d5fe5]">
                    {formatVnd(displayAmount)}
                  </div>

                  {/* Transfer Details */}
                  <div className="mt-4 w-full rounded-[14px] bg-[#f8faff] border border-[#e8effd] p-3.5 text-left text-[12px] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Bank:</span>
                      <span className="font-bold text-[#0b1c30]">{checkout.vietQr.bankCode || "MBBank"}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[#64748b]">Account Number:</span>
                      <span className="font-bold text-[#0b1c30]">{checkout.vietQr.accountNo}</span>
                    </div>
                    {checkout.vietQr.transferContent && (
                      <div className="flex justify-between border-t border-[#e2e8f0] pt-2">
                        <span className="text-[#64748b]">Reference / Memo:</span>
                        <span className="font-mono font-bold text-[#1d5fe5]">{checkout.vietQr.transferContent}</span>
                      </div>
                    )}
                  </div>

                  {/* Live sync pulse */}
                  <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#58657a]">
                    <span className="material-symbols-outlined animate-spin text-[16px] text-[#1d5fe5]">
                      sync
                    </span>
                    Listening for payment confirmation via SePay...
                  </div>
                </div>
              ) : (
                <div className="mt-4 py-8 text-center">
                  <div className="text-[24px] font-black text-[#1d5fe5]">
                    {formatVnd(displayAmount)}
                  </div>
                  <p className="mt-2 text-[12px] text-[#8996a9]">
                    Reconnecting to VietQR gateway...
                  </p>
                </div>
              )}

              {/* Cancel Button */}
              <div className="mt-6 border-t border-[#f2f4fa] pt-4">
                <button
                  type="button"
                  onClick={handleOpenCancelModal}
                  className="rounded-[10px] border border-[#fecdca] bg-white px-4 py-2 text-[12px] font-bold text-[#b42318] hover:bg-[#fffbfa] transition"
                >
                  Cancel this reservation
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

      {/* CONFIRM CANCEL MODAL */}
      {cancelModalOpen && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm"
          onClick={(e) => e.target === e.currentTarget && handleCloseCancelModal()}
        >
          <div className="w-full max-w-[400px] rounded-[22px] border border-[#dfe7f5] bg-white p-6 shadow-[0_24px_60px_rgba(15,23,42,0.18)]">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fee4e2] text-[#d92d20]">
                <span className="material-symbols-outlined text-[22px]">warning</span>
              </div>
              <div>
                <h3 className="text-[16px] font-bold text-[#0b1c30]">Cancel Reservation</h3>
                <p className="text-[12px] text-[#64748b]">This action will release the unit</p>
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-[#58657a]">
              Are you sure you want to cancel this reservation? The storage unit will be immediately released back into the system.
            </p>

            {cancelError && (
              <div className="mt-3 rounded-[10px] bg-[#fff1f1] border border-[#fecdca] p-2.5 text-[12px] font-semibold text-[#b3261e]">
                {cancelError}
              </div>
            )}

            <div className="mt-6 flex justify-end gap-2.5">
              <button
                type="button"
                onClick={handleCloseCancelModal}
                disabled={cancelling}
                className="rounded-[10px] border border-[#dfe7f5] bg-white px-4 py-2 text-[13px] font-semibold text-[#3a475a] hover:bg-[#f8faff] transition disabled:opacity-50"
              >
                No, Keep Reservation
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="rounded-[10px] bg-[#d92d20] px-4 py-2 text-[13px] font-bold text-white shadow transition hover:bg-[#b42318] disabled:opacity-50"
              >
                {cancelling ? "Cancelling..." : "Confirm Cancellation"}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentCheckout;
