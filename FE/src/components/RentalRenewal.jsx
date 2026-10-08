import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import rentalService from "../api/rentalService";
import { formatVnd } from "../lib/utils";

export default function RentalRenewal({ unit, onClose }) {
  const navigate = useNavigate();
  const dialog = useRef(null);
  const lock = useRef(false);
  const [months, setMonths] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [timeLeft, setTimeLeft] = useState(15 * 60);

  useEffect(() => {
    const element = dialog.current;
    element.showModal();
    return () => element.close();
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
      setError(err.status === 404 ? "Rental agreement not found." : err.message || "Unable to request renewal.");
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
      className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-md overflow-y-auto rounded-2xl bg-white p-6 text-[#0b1c30] shadow-xl backdrop:bg-black/40"
    >
      <div className="flex items-center justify-between gap-3">
        <h2 id="renewal-title" className="text-lg font-bold">
          Renew Unit {unit.unitCode}
        </h2>
        <button
          type="button"
          disabled={busy}
          onClick={onClose}
          className="rounded-lg border px-3 py-1 text-sm disabled:opacity-50"
        >
          Close
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
                Giữ chỗ thanh toán (15 phút):
              </span>
              <span className="font-mono text-sm font-black text-[#b54708]">
                {formattedCountdown}
              </span>
            </div>
            <p className="mt-1 text-[11px] text-[#8c510a]">
              Hóa đơn gia hạn đã được đưa vào Lịch sử thanh toán. Vui lòng thanh toán trong vòng 15 phút.
            </p>
          </div>

          <dl className="space-y-2 rounded-xl bg-[#f8faff] p-3 text-xs border border-[#dfe7f5]">
            {[
              ["Request #", result.renewalId],
              ["Current end date", result.oldEndDate],
              ["Requested end date", result.newEndDate],
              ["Monthly rate", formatVnd(result.monthlyRate)],
              ["Total renewal amount", formatVnd(result.totalRenewalAmount)],
              ["Status", "Awaiting Payment"],
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
              className="w-full rounded-xl bg-[#1d5fe5] py-2.5 text-xs font-bold text-white transition hover:bg-[#154ec1]"
            >
              Pay Now (SePay VietQR)
            </button>
            <button
              type="button"
              onClick={() => {
                onClose();
                navigate("/billing");
              }}
              className="w-full rounded-xl border border-[#dfe7f5] bg-white py-2 text-xs font-semibold text-slate-700 transition hover:bg-slate-50"
            >
              View in Payment History
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={submit} aria-busy={busy} className="mt-4 space-y-4 text-sm">
          <label className="block font-semibold">
            Renewal months
            <select
              disabled={busy}
              value={months}
              onChange={(event) => setMonths(Number(event.target.value))}
              className="mt-2 w-full rounded-lg border border-[#dfe7f5] p-2"
            >
              {Array.from({ length: 12 }, (_, index) => index + 1).map((value) => (
                <option key={value} value={value}>
                  {value} {value === 1 ? "month" : "months"}
                </option>
              ))}
            </select>
          </label>
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <button
            type="submit"
            disabled={busy}
            className="w-full rounded-lg bg-[#1d5fe5] p-3 font-semibold text-white disabled:opacity-50"
          >
            {busy ? "Submitting..." : "Request renewal"}
          </button>
        </form>
      )}
    </dialog>
  );
}
