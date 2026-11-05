import { useState, useMemo, useEffect } from "react";
import { usePaymentCheckout } from "../hooks/usePaymentCheckout";
import { useLanguage } from "../context/LanguageContext";
import Header from "../components/Header";
import Footer from "../components/Footer";
import PageBackground from "../components/PageBackground";
import { formatVnd } from "../lib/utils";
import { CHECKOUT_STATUS } from "../constants/paymentConstants";

function PaymentCheckout() {
  const { t, formatCurrency } = useLanguage();
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

  const displayAmount =
    checkout?.amount ||
    checkout?.vietQr?.amount ||
    reservation?.quotedTotal ||
    reservation?.amount ||
    0;

  const bankCode = checkout?.vietQr?.bankCode || "MBBank";
  const accountNo = checkout?.vietQr?.accountNo || "0817495759";
  const accountName = checkout?.vietQr?.accountName || "VO THAI HOANG KHOI";
  const memo = checkout?.vietQr?.transferContent || checkout?.invoiceNo || (reservation?.reservationCode ? `DH${reservation.reservationCode.slice(-4)}` : "DH5010");

  const qrCandidateUrls = useMemo(() => {
    const list = [];
    const roundedAmount = Math.round(Number(displayAmount) || 0);

    list.push(
      `https://qr.sepay.vn/img?bank=${encodeURIComponent(bankCode)}&acc=${encodeURIComponent(accountNo)}&template=compact&amount=${roundedAmount}&des=${encodeURIComponent(memo)}`
    );

    list.push(
      `https://img.vietqr.io/image/${encodeURIComponent(bankCode)}-${encodeURIComponent(accountNo)}-compact.png?amount=${roundedAmount}&addInfo=${encodeURIComponent(memo)}&accountName=${encodeURIComponent(accountName)}`
    );

    if (checkout?.vietQr?.qrImageUrl) {
      const normalized = checkout.vietQr.qrImageUrl.replace("https://vietqr.app/img", "https://qr.sepay.vn/img");
      if (!list.includes(normalized)) list.push(normalized);
      if (!list.includes(checkout.vietQr.qrImageUrl)) list.push(checkout.vietQr.qrImageUrl);
    }

    const emvcoPayload = `2|99|${bankCode}|${accountNo}|${accountName}|0|0|${roundedAmount}|${memo}`;
    list.push(`https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(emvcoPayload)}`);

    return list;
  }, [bankCode, accountNo, accountName, memo, displayAmount, checkout?.vietQr?.qrImageUrl]);

  const [qrIndex, setQrIndex] = useState(0);
  const [copiedField, setCopiedField] = useState(null);

  useEffect(() => {
    setQrIndex(0);
  }, [qrCandidateUrls]);

  const handleQrImgError = () => {
    if (qrIndex < qrCandidateUrls.length - 1) {
      setQrIndex((prev) => prev + 1);
    }
  };

  const copyToClipboard = (text, fieldName) => {
    if (!text) return;
    navigator.clipboard.writeText(String(text));
    setCopiedField(fieldName);
    setTimeout(() => {
      setCopiedField(null);
    }, 2000);
  };

  const currentQrSrc = qrCandidateUrls[qrIndex] || qrCandidateUrls[0];

  return (
    <div className="relative flex min-h-screen flex-col text-[#0b1c30]">
      <PageBackground />
      <Header active="billing" />

      <main className="mx-auto w-full max-w-[1280px] flex-1 px-4 py-8 lg:px-6">
        {loading ? (
          <div className="mx-auto mt-16 flex max-w-[480px] flex-col items-center justify-center rounded-[20px] border border-[#dfe7f5] bg-white/80 p-12 text-center shadow-[0_12px_32px_rgba(15,23,42,0.04)] backdrop-blur-md">
            <span className="material-symbols-outlined animate-spin text-[36px] text-zinc-900 dark:text-zinc-100">
              progress_activity
            </span>
            <div className="mt-4 text-[16px] font-bold text-[#0b1c30]">
              {t("common.loading", "Loading...")}
            </div>
          </div>
        ) : error && !checkout ? (
          <div className="mx-auto mt-12 max-w-[500px] rounded-[20px] border border-[#fecdca] bg-white p-8 text-center shadow-sm">
            <span className="material-symbols-outlined text-[48px] text-[#d92d20]">
              error_outline
            </span>
            <h2 className="mt-3 text-[18px] font-bold text-[#b42318]">
              {t("billing.pay_failed", "Payment Error")}
            </h2>
            <p className="mt-2 text-[13px] text-[#58657a]">{error}</p>
            <div className="mt-6 flex flex-wrap items-center justify-center gap-3">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-zinc-900 text-white px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[18px]">search</span>
                {t("home.available_units", "Available Units")}
              </button>
              <button
                onClick={() => navigate("/billing")}
                className="inline-flex items-center gap-2 rounded-[12px] border border-[#dfe7f5] bg-white px-5 py-2.5 text-[13px] font-semibold text-[#3a475a] transition hover:bg-[#f8faff]"
              >
                {t("nav.billing", "Invoices")}
              </button>
            </div>
          </div>
        ) : status === CHECKOUT_STATUS.SUCCESS ? (
          <div className="mx-auto mt-8 max-w-[540px] rounded-[22px] border border-[#a6f4c5] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#ecfdf3] text-[#12b76a]">
              <span className="material-symbols-outlined text-[48px]">check_circle</span>
            </div>
            <h1 className="mt-5 text-[24px] font-extrabold text-[#027a48]">
              {t("billing.pay_success", "Payment Successful")}
            </h1>
            <p className="mt-2 text-[14px] leading-relaxed text-[#475467]">
              {t("common.success", "Success")}
            </p>

            <div className="mt-6 rounded-[14px] border border-[#e4e7ec] bg-[#f8f9fc] p-4 text-left text-[13px]">
              <div className="flex justify-between py-1.5 border-b border-[#eaecf0]">
                <span className="text-[#667085]">{t("table.code", "Code")}:</span>
                <span className="font-bold text-[#0b1c30]">
                  {reservation?.reservationCode || "N/A"}
                </span>
              </div>
              <div className="flex justify-between py-1.5 border-b border-[#eaecf0]">
                <span className="text-[#667085]">{t("common.amount", "Amount")}:</span>
                <span className="font-bold text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(displayAmount)}
                </span>
              </div>
              <div className="flex justify-between py-1.5">
                <span className="text-[#667085]">{t("billing.payment_method", "Method")}:</span>
                <span className="font-medium text-[#0b1c30]">{t("billing.bank_transfer", "Bank Transfer")}</span>
              </div>
            </div>

            <div className="mt-6 flex flex-wrap justify-center gap-3">
              <button
                onClick={() => navigate("/my-units")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-[#0b1c30] px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#182d49]"
              >
                <span className="material-symbols-outlined text-[18px]">warehouse</span>
                {t("nav.my_units", "My Units")}
              </button>
              <button
                onClick={() => navigate("/access-control")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-zinc-900 text-white px-5 py-2.5 text-[13px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[18px]">key</span>
                {t("access.pin_display", "PIN Code")}
              </button>
            </div>
          </div>
        ) : status === CHECKOUT_STATUS.EXPIRED ? (
          <div className="mx-auto mt-8 max-w-[520px] rounded-[22px] border border-[#fecdca] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fffbfa] text-[#d92d20]">
              <span className="material-symbols-outlined text-[48px]">timer_off</span>
            </div>
            <h1 className="mt-5 text-[22px] font-extrabold text-[#b42318]">
              {t("status.expired", "Expired")}
            </h1>
            <div className="mt-6">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-zinc-900 text-white px-6 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[20px]">refresh</span>
                {t("my_units.rent_btn", "Rent Unit")}
              </button>
            </div>
          </div>
        ) : status === CHECKOUT_STATUS.FAILED ? (
          <div className="mx-auto mt-8 max-w-[520px] rounded-[22px] border border-[#fecdca] bg-white p-8 text-center shadow-[0_16px_40px_rgba(16,24,40,0.06)]">
            <div className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-[#fffbfa] text-[#d92d20]">
              <span className="material-symbols-outlined text-[48px]">cancel</span>
            </div>
            <h1 className="mt-5 text-[22px] font-extrabold text-[#b42318]">
              {t("status.cancelled", "Cancelled")}
            </h1>
            <div className="mt-6 flex justify-center gap-3">
              <button
                onClick={() => navigate("/home")}
                className="inline-flex items-center gap-2 rounded-[12px] bg-zinc-900 text-white px-6 py-3 text-[14px] font-bold text-white shadow-sm transition hover:bg-[#154ec1]"
              >
                <span className="material-symbols-outlined text-[20px]">search</span>
                {t("my_units.rent_btn", "Rent Unit")}
              </button>
            </div>
          </div>
        ) : (
          <div className="mx-auto max-w-[490px]">
            <div className="overflow-hidden rounded-[20px] border border-[#fedf89] bg-[#fffcf5] p-4 shadow-sm">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-[14px] font-bold text-[#b54708]">
                  <span className="material-symbols-outlined animate-pulse text-[20px] text-[#f79009]">
                    timer
                  </span>
                  {t("common.due_date", "Hold Time")}:
                </div>
                <div className="font-mono text-[20px] font-black tracking-wider text-[#b54708]">
                  {formattedCountdown}
                </div>
              </div>

              <div className="mt-3 h-1.5 w-full overflow-hidden rounded-full bg-[#fef0c7]">
                <div
                  className="h-full bg-gradient-to-r from-[#f79009] to-[#d92d20] transition-all duration-1000"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
            </div>

            <div className="mt-5 rounded-[24px] border border-[#dfe7f5] bg-white p-6 text-center shadow-[0_12px_32px_rgba(15,23,42,0.06)]">
              <div className="text-[19px] font-black text-[#0b1c30]">
                {t("billing.vnpay_qr", "VietQR Payment")}
              </div>
              {reservation?.reservationCode && (
                <div className="mt-1 text-[13px] text-[#58657a]">
                  {t("table.code", "Code")}:{" "}
                  <span className="font-bold text-[#0b1c30]">{reservation.reservationCode}</span>
                </div>
              )}

              <div className="mt-4 flex flex-col items-center">
                <div className="relative h-[290px] w-[290px] overflow-hidden rounded-[18px] border-2 border-[#dfe7f5] bg-white p-2.5 shadow-sm transition hover:shadow-md">
                  <img
                    key={currentQrSrc}
                    src={currentQrSrc}
                    alt="VietQR Payment Code"
                    onError={handleQrImgError}
                    className="h-full w-full object-contain"
                  />
                </div>

                <div className="mt-2 text-[11px] text-[#8996a9] flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[14px] text-emerald-600">verified</span>
                  {t("billing.payment_method", "Mobile Banking / E-Wallet")}
                </div>

                <div className="mt-3 text-[14px] font-bold text-[#0b1c30]">
                  G1SelfStorageSystem
                </div>
                <div className="text-[26px] font-black text-zinc-900 dark:text-zinc-100">
                  {formatCurrency(displayAmount)}
                </div>

                <div className="mt-4 w-full rounded-[16px] bg-[#f8faff] border border-[#e8effd] p-4 text-left text-[12px] space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-[#64748b]">{t("common.bank_name", "Bank")}:</span>
                    <span className="font-bold text-[#0b1c30]">{bankCode}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#edf2fc] pt-2">
                    <span className="text-[#64748b]">{t("common.account_number", "Account Number")}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-bold text-[13px] text-[#0b1c30]">{accountNo}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(accountNo, "acc")}
                        className="rounded-md bg-white border border-[#dfe7f5] px-2 py-0.5 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-[#edf3ff] transition"
                      >
                        {copiedField === "acc" ? t("common.confirm", "Copied") : t("common.download", "Copy")}
                      </button>
                    </div>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#edf2fc] pt-2">
                    <span className="text-[#64748b]">{t("common.account_holder", "Account Holder")}:</span>
                    <span className="font-bold text-[#0b1c30]">{accountName}</span>
                  </div>

                  <div className="flex items-center justify-between border-t border-[#edf2fc] pt-2">
                    <span className="text-[#64748b]">{t("common.notes", "Memo")}:</span>
                    <div className="flex items-center gap-2">
                      <span className="font-mono font-black text-[13px] text-zinc-900 dark:text-zinc-100">{memo}</span>
                      <button
                        type="button"
                        onClick={() => copyToClipboard(memo, "memo")}
                        className="rounded-md bg-white border border-[#dfe7f5] px-2 py-0.5 text-[11px] font-semibold text-zinc-900 dark:text-zinc-100 hover:bg-[#edf3ff] transition"
                      >
                        {copiedField === "memo" ? t("common.confirm", "Copied") : t("common.download", "Copy")}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-center gap-2 text-[12px] text-[#58657a]">
                  <span className="material-symbols-outlined animate-spin text-[16px] text-zinc-900 dark:text-zinc-100">
                    sync
                  </span>
                  {t("common.loading", "Listening for payment...")}
                </div>
              </div>

              <div className="mt-6 border-t border-[#f2f4fa] pt-4">
                <button
                  type="button"
                  onClick={handleOpenCancelModal}
                  className="rounded-[10px] border border-[#fecdca] bg-white px-4 py-2 text-[12px] font-bold text-[#b42318] hover:bg-[#fffbfa] transition"
                >
                  {t("common.cancel", "Cancel Reservation")}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      <Footer />

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
                <h3 className="text-[16px] font-bold text-[#0b1c30]">{t("common.confirm", "Confirm Cancel")}</h3>
              </div>
            </div>

            <p className="mt-4 text-[13px] leading-relaxed text-[#58657a]">
              {t("common.warning", "Are you sure you want to cancel this reservation?")}
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
                {t("common.back", "Keep")}
              </button>
              <button
                type="button"
                onClick={handleConfirmCancel}
                disabled={cancelling}
                className="rounded-[10px] bg-[#d92d20] px-4 py-2 text-[13px] font-bold text-white shadow transition hover:bg-[#b42318] disabled:opacity-50"
              >
                {cancelling ? t("common.loading", "Cancelling...") : t("common.cancel", "Confirm Cancel")}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default PaymentCheckout;
