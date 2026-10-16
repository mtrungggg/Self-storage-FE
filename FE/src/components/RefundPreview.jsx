import { useId, useRef, useState } from "react";
import rentalService from "../api/rentalService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const fields = [
  ["Deposit", "depositBalance"],
  ["Cleaning", "estimatedCleaningFee"],
  ["Repair", "estimatedRepairFee"],
  ["Overdue", "estimatedOverdueCharges"],
  ["Net refund", "estimatedNetRefund"],
];

export default function RefundPreview({ agreementId }) {
  const panelId = useId();
  const lock = useRef(false);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [opened, setOpened] = useState(false);

  async function load() {
    if (lock.current) return;
    lock.current = true;
    setOpened(true);
    setLoading(true);
    setError("");
    setPreview(null);
    try {
      setPreview(await rentalService.getRefundPreview(agreementId));
    } catch (err) {
      setError(err.status === 404 ? "Not found." : err.message || "Failed to load.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <section className="mt-2 border-t border-[#dfe7f5] pt-2 text-xs">
      <button type="button" onClick={load} disabled={loading} aria-expanded={opened} aria-controls={panelId} className="font-semibold text-[#1d5fe5] disabled:opacity-50">
        {loading ? "..." : opened ? "Refresh estimate" : "Refund estimate"}
      </button>
      <div id={panelId} hidden={!opened} aria-busy={loading}>
        {loading && <p role="status" className="mt-1 text-slate-400">Loading...</p>}
        {error && <p role="alert" className="mt-1 text-red-600">{error}</p>}
        {preview && <div className="mt-2 rounded-lg bg-[#f8faff] p-2.5">
          <dl className="space-y-1 text-xs">
            {fields.map(([label, key]) => <div key={key} className={`flex justify-between gap-2 ${key === "estimatedNetRefund" ? "border-t border-[#dfe7f5] pt-1 font-bold text-slate-900" : "text-slate-600"}`}>
              <dt>{label}</dt><dd>{typeof preview[key] === "number" && Number.isFinite(preview[key]) ? money.format(preview[key]) : "—"}</dd>
            </div>)}
          </dl>
          <p className="mt-1.5 text-[10px] text-slate-400">*Estimated only.</p>
        </div>}
      </div>
    </section>
  );
}
