import SelectDropdown from "@/components/ui/select-dropdown";
import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import rentalService from "../api/rentalService";
import { useLanguage } from "../context/LanguageContext";

export default function RentalRenewal({ unit, onClose }) {
  const navigate = useNavigate();
  const { t, formatCurrency, formatDate, translateStatus } = useLanguage();
  const dialog = useRef(null);
  const lock = useRef(false);
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const element = dialog.current;
    if (element && !element.open) {
      element.showModal();
    }
    return () => {
      if (element && element.open) element.close();
    };
  }, []);

  useEffect(() => {
    if (!result) return;
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, [result]);

  const formattedCountdown = `${Math.floor(timeLeft / 60)
    .toString()
    .padStart(2, "0")}:${(timeLeft % 60).toString().padStart(2, "0")}`;

  async function submit(event) {
    event.preventDefault();
    if (lock.current || result) return;
    lock.current = true;
    setBusy(true);
    setError("");
    try {
      const data = await rentalService.renewAgreement(unit.id, months);
      setResult(data);
      setTimeLeft(15 * 60);
    } catch (err) {
      setError(err.status === 404 ? t("common.no_data", "Not found") : err.message || t("common.error", "Failed to renew"));
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <dialog
      ref={dialog}
      onCancel={(event) => {
        if (lock.current) event.preventDefault();
        else onClose();
      }}
      aria-labelledby="renewal-title"
      className={`fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 text-[#0b1c30] shadow-2xl backdrop:bg-black/40 ${result ? "max-h-[85vh] overflow-y-auto" : "min-h-[380px] overflow-visible"}`}
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="renewal-title" className="text-lg font-bold">
          {t("renewal.title", "Renew")} • {t("common.unit", "Unit")} {unit.unitCode}
        </h2>
        <button
          id="btn-close-renewal-modal"
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50 cursor-pointer"
        >
          {t("common.close", "Close")}
        </button>
      </div>

      {result ? (
        <div className="mt-4 space-y-3 text-sm">
          <div className="rounded-xl border border-[#fedf89] bg-[#fffcf5] p-3">
            <div className="flex items-center justify-between text-xs font-bold text-[#b54708]">
              <span className="flex items-center gap-1.5">
                <span className="material-symbols-outlined text-[16px] animate-pulse text-[#f79009]">
                  timer
                </span>
                {t("common.due_date", "Hold Time")}:
              </span>
              <span className="font-mono text-sm font-black text-[#b54708]">
                {formattedCountdown}
              </span>
            </div>
          </div>

          <dl className="space-y-2 rounded-xl bg-[#f8faff] p-3 text-xs border border-[#dfe7f5]">
            {[
              [t("table.code", "Code"), result.renewalId],
              [t("common.end_date", "Current Expiry"), result.oldEndDate ? formatDate(result.oldEndDate) : "—"],
              [t("renewal.new_end_date", "New Expiry"), result.newEndDate ? formatDate(result.newEndDate) : "—"],
              [t("renewal.renewal_fee", "Renewal Amount"), formatCurrency(result.totalRenewalAmount)],
              [t("common.status", "Status"), translateStatus("pending_payment")],
            ].map(([label, value]) => (
              <div key={label} className="flex flex-wrap justify-between gap-2">
                <dt className="text-slate-600">{label}</dt>
                <dd className="font-semibold text-slate-900">{value}</dd>
              </div>
            ))}
          </dl>

          <div className="flex flex-col gap-2 pt-2">
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/checkout", {
                  state: {
                    renewalId: result.renewalId,
                    amount: result.totalRenewalAmount,
                    agreementNo: unit.unitCode,
                  },
                });
              }}
              className="w-full rounded-xl bg-zinc-900 text-white py-2.5 text-xs font-bold text-white transition hover:bg-[#154ec1]"
            >
              {t("billing.pay_now", "Pay Now")}
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/billing");
              }}
              className="w-full rounded-xl border border-[#dfe7f5] bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              {t("nav.billing", "Invoices")}
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} aria-busy={busy} className="mt-4 space-y-4 text-sm">
          <label className="block font-semibold">
            {t("renewal.select_months", "Select Duration")}
            <SelectDropdown
              disabled={busy}
              value={months}
              onChange={(event) => setMonths(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-[#dfe7f5] p-2"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value} {t("renewal.months_count", "months")}
                </option>
              ))}
            </SelectDropdown>
          </label>
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-zinc-900 text-white p-3 font-semibold text-white disabled:opacity-50"
          >
            {busy ? t("common.loading", "Submitting...") : t("my_units.renew", "Renew")}
          </button>
        </form>
      )}
    </dialog>
  );
}
