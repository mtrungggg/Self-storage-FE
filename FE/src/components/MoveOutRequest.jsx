import DatePicker from "@/components/ui/date-picker";
import { useEffect, useId, useRef, useState } from "react";
import RefundPreview from "./RefundPreview";
import rentalService from "../api/rentalService";
import { useLanguage } from "../context/LanguageContext";

const POPULAR_BANKS = [
  "Vietcombank (VCB)",
  "Techcombank (TCB)",
  "BIDV",
  "VietinBank",
  "Agribank",
  "MB Bank",
  "ACB",
  "VPBank",
  "TPBank",
  "Sacombank",
  "HDBank",
  "VIB",
  "SHB",
  "MSB",
  "SeABank",
  "OCB",
];

export default function MoveOutRequest({ agreementId }) {
  const id = useId();
  const lock = useRef(false);
  const { t, formatCurrency, formatDate, translateStatus } = useLanguage();

  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [bankName, setBankName] = useState("Vietcombank (VCB)");
  const [accountNumber, setAccountNumber] = useState("");
  const [accountHolder, setAccountHolder] = useState("");

  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");

  const [bankSubmitted, setBankSubmitted] = useState(false);
  const [payoutCompleted, setPayoutCompleted] = useState(null);

  const syncStateFromStorage = () => {
    try {
      if (!agreementId) return;
      const payoutRaw = localStorage.getItem(`refund_payout_completed_${agreementId}`);
      if (payoutRaw) {
        setPayoutCompleted(JSON.parse(payoutRaw));
      }
      const bankRaw = localStorage.getItem(`refund_bank_info_${agreementId}`);
      if (bankRaw) {
        const parsed = JSON.parse(bankRaw);
        if (parsed.bankName) setBankName(parsed.bankName);
        if (parsed.accountNumber) setAccountNumber(parsed.accountNumber);
        if (parsed.accountHolder) setAccountHolder(parsed.accountHolder);
        setBankSubmitted(true);
      }
    } catch (err) {
      console.warn("Storage sync error:", err);
    }
  };

  useEffect(() => {
    syncStateFromStorage();

    const handleStorageChange = (e) => {
      if (!e.key || e.key.includes(String(agreementId))) {
        syncStateFromStorage();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    return () => window.removeEventListener("storage", handleStorageChange);
  }, [agreementId]);

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError("");

    if (!date) {
      setError(t("common.required", "Date required"));
      return;
    }

    if (!bankName.trim() || !accountNumber.trim() || !accountHolder.trim()) {
      setError(t("common.required", "Bank details required"));
      return;
    }

    lock.current = true;
    setSending(true);

    try {
      const bankData = {
        bankName: bankName.trim(),
        bankAccountNumber: accountNumber.trim(),
        accountNumber: accountNumber.trim(),
        bankAccountHolder: accountHolder.trim().toUpperCase(),
        accountHolder: accountHolder.trim().toUpperCase(),
        submittedAt: new Date().toISOString(),
      };

      localStorage.setItem(`refund_bank_info_${agreementId}`, JSON.stringify(bankData));
      window.dispatchEvent(new Event("storage"));

      await rentalService.requestMoveOut(agreementId, {
        requestedMoveOutDate: date,
        reason: reason.trim(),
        ...bankData,
      });

      setBankSubmitted(true);
    } catch (err) {
      if (err.message && (err.message.includes("already requested") || err.message.includes("409"))) {
        setBankSubmitted(true);
      } else {
        setError(err.message || t("common.error", "Error requesting move-out"));
      }
    } finally {
      lock.current = false;
      setSending(false);
    }
  }

  return (
    <details className="mt-2 border-t border-[#dfe7f5] pt-2 text-xs">
      <summary className="cursor-pointer font-semibold text-zinc-900 dark:text-zinc-100 hover:underline">
        {t("moveout.preview", "Move-out & Refund Preview")}
      </summary>
      <RefundPreview agreementId={agreementId} />

      {payoutCompleted ? (
        <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 text-xs text-emerald-950 space-y-3 shadow-xs">
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[22px]">verified</span>
            <div>
              <h4 className="font-bold text-sm text-emerald-900">{t("status.refunded", "Refund Completed")}</h4>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2 rounded-lg bg-white/90 p-2.5 border border-emerald-200">
            <div>
              <span className="text-[10px] text-slate-500 block">{t("common.net_refund", "Refund Amount")}:</span>
              <span className="font-bold text-emerald-700 text-xs">
                {formatCurrency(payoutCompleted.amount)}
              </span>
            </div>
            {payoutCompleted.transactionRef && (
              <div>
                <span className="text-[10px] text-slate-500 block">{t("table.code", "Ref")}:</span>
                <span className="font-mono font-bold text-slate-800 text-xs">{payoutCompleted.transactionRef}</span>
              </div>
            )}
            {payoutCompleted.bankName && (
              <div>
                <span className="text-[10px] text-slate-500 block">{t("common.account_number", "Account")}:</span>
                <span className="font-semibold text-slate-700 text-xs">{payoutCompleted.bankName} - {payoutCompleted.accountNumber}</span>
              </div>
            )}
            {payoutCompleted.completedAt && (
              <div>
                <span className="text-[10px] text-slate-500 block">{t("common.date", "Date")}:</span>
                <span className="text-slate-600 text-xs">{formatDate(payoutCompleted.completedAt)}</span>
              </div>
            )}
          </div>

          {payoutCompleted.proofUrl && (
            <div className="space-y-1.5 border-t border-emerald-200 pt-2.5">
              <span className="font-bold text-emerald-900 flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px]">receipt_long</span>
                {t("common.upload_proof", "Receipt Proof")}:
              </span>
              <div className="overflow-hidden rounded-lg border border-emerald-200 bg-white p-1 max-w-sm">
                <img
                  src={payoutCompleted.proofUrl}
                  alt={t("common.upload_proof", "Proof")}
                  className="max-h-56 w-full object-contain rounded-md"
                />
              </div>
            </div>
          )}
        </div>
      ) : bankSubmitted ? (
        <div className="mt-3 rounded-xl border border-blue-200 bg-blue-50/80 p-3.5 text-xs text-blue-950 space-y-2.5">
          <div className="flex items-start gap-2.5">
            <span className="material-symbols-outlined text-blue-600 text-[20px] mt-0.5">mark_email_read</span>
            <div>
              <p className="font-bold text-blue-950 text-xs leading-snug">
                {t("moveout.request_submitted", "Bank details submitted")}
              </p>
            </div>
          </div>

          <div className="rounded-lg bg-white/90 p-2.5 border border-blue-100 space-y-1.5 text-slate-700">
            <p className="font-semibold text-slate-800 text-[11px]">{t("common.bank_info", "Bank Information")}:</p>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
              <div>
                <span className="text-slate-400 block text-[10px]">{t("common.bank_name", "Bank")}:</span>
                <strong className="text-slate-800">{bankName || "—"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{t("common.account_number", "Account")}:</span>
                <strong className="text-slate-800 font-mono">{accountNumber || "—"}</strong>
              </div>
              <div>
                <span className="text-slate-400 block text-[10px]">{t("common.account_holder", "Holder")}:</span>
                <strong className="text-slate-800 uppercase">{accountHolder || "—"}</strong>
              </div>
            </div>
          </div>

          <div className="flex items-center justify-between border-t border-blue-200/60 pt-2 text-[11px]">
            <span className="text-blue-700 font-medium flex items-center gap-1">
              <span className="material-symbols-outlined text-[14px]">schedule</span>
              {translateStatus("pending_manager_payout")}
            </span>
            <button
              type="button"
              onClick={() => setBankSubmitted(false)}
              className="text-zinc-900 dark:text-zinc-100 font-semibold underline hover:text-blue-800 cursor-pointer"
            >
              {t("common.edit", "Edit")}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} aria-busy={sending} className="mt-3 space-y-3">
          <fieldset disabled={sending} className="space-y-3 text-xs">
            <div>
              <label htmlFor={`${id}-date`} className="mb-1 block font-semibold text-slate-700">
                {t("moveout.expected_date", "Expected Move-out Date")} *
              </label>
              <DatePicker id={`${id}-date`} required value={date} onChange={(event) => setDate(event.target.value)} />
            </div>

            <div>
              <label htmlFor={`${id}-reason`} className="mb-1 block font-semibold text-slate-700">
                {t("moveout.reason", "Reason (Optional)")}
              </label>
              <textarea
                id={`${id}-reason`}
                rows={2}
                value={reason}
                onChange={(event) => setReason(event.target.value)}
                placeholder={t("common.notes", "Notes...")}
                className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-100"
              />
            </div>

            <div className="rounded-xl border border-indigo-100 bg-indigo-50/50 p-3 space-y-2.5">
              <div className="flex items-center gap-1.5 font-bold text-slate-800 text-xs">
                <span className="material-symbols-outlined text-zinc-900 dark:text-zinc-100 text-[18px]">account_balance</span>
                <span>{t("common.bank_info", "Bank Account for Refund")} *</span>
              </div>

              <div className="space-y-2 pt-1">
                <div>
                  <label htmlFor={`${id}-bank`} className="mb-1 block text-[11px] font-semibold text-slate-700">
                    {t("common.bank_name", "Beneficiary Bank")} *
                  </label>
                  <select
                    id={`${id}-bank`}
                    required
                    value={bankName}
                    onChange={(e) => setBankName(e.target.value)}
                    className="w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-100 cursor-pointer"
                  >
                    {POPULAR_BANKS.map((b) => (
                      <option key={b} value={b}>
                        {b}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <div>
                    <label htmlFor={`${id}-acc`} className="mb-1 block text-[11px] font-semibold text-slate-700">
                      {t("common.account_number", "Account Number")} *
                    </label>
                    <input
                      id={`${id}-acc`}
                      type="text"
                      required
                      value={accountNumber}
                      onChange={(e) => setAccountNumber(e.target.value)}
                      placeholder={t("common.account_number", "Account number")}
                      className="w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-100 font-mono"
                    />
                  </div>

                  <div>
                    <label htmlFor={`${id}-holder`} className="mb-1 block text-[11px] font-semibold text-slate-700">
                      {t("common.account_holder", "Account Holder")} *
                    </label>
                    <input
                      id={`${id}-holder`}
                      type="text"
                      required
                      value={accountHolder}
                      onChange={(e) => setAccountHolder(e.target.value)}
                      placeholder={t("common.account_holder", "Holder name")}
                      className="w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-xs outline-none focus:border-zinc-900 dark:border-zinc-100 uppercase"
                    />
                  </div>
                </div>
              </div>
            </div>

            {error && <p role="alert" className="text-red-600 text-xs">{error}</p>}

            <button
              type="submit"
              disabled={sending || !date || !bankName || !accountNumber || !accountHolder}
              className="w-full rounded-lg bg-zinc-900 text-white hover:bg-blue-700 p-2.5 font-bold text-white transition disabled:opacity-50 text-xs shadow-xs cursor-pointer"
            >
              {sending ? t("common.loading", "Submitting...") : t("moveout.send_bank", "Submit Bank Account")}
            </button>
          </fieldset>
        </form>
      )}
    </details>
  );
}
