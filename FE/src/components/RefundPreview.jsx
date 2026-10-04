import { useId, useRef, useState } from "react";
import rentalService from "../api/rentalService";

const money = new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" });
const fields = [
  ["Deposit balance", "depositBalance"],
  ["Estimated cleaning fee", "estimatedCleaningFee"],
  ["Estimated repair fee", "estimatedRepairFee"],
  ["Estimated overdue charges", "estimatedOverdueCharges"],
  ["Estimated net refund", "estimatedNetRefund"],
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
      setError(err.status === 404 ? "This rental agreement could not be found." : err.message || "Unable to load the refund estimate. Please try again.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <section className="mt-3 border-t border-[#dfe7f5] pt-3 text-xs">
      <button type="button" onClick={load} disabled={loading} aria-expanded={opened} aria-controls={panelId} className="font-semibold text-[#1d5fe5] disabled:opacity-50">
        {loading ? "Loading refund estimate..." : opened ? "Refresh refund estimate" : "View refund estimate"}
      </button>
      <div id={panelId} hidden={!opened} aria-busy={loading}>
        {loading && <p role="status" className="mt-2">Loading...</p>}
        {error && <p role="alert" className="mt-2 text-red-600">{error}</p>}
        {preview && <div className="mt-3 rounded-lg bg-[#f8faff] p-3">
          <p className="break-words font-semibold">Agreement {preview.agreementNo}</p>
          <dl className="mt-3 space-y-2">
            {fields.map(([label, key]) => <div key={key} className={`flex flex-wrap justify-between gap-2 ${key === "estimatedNetRefund" ? "border-t border-[#dfe7f5] pt-2 font-bold" : ""}`}>
              <dt>{label}</dt><dd>{typeof preview[key] === "number" && Number.isFinite(preview[key]) ? money.format(preview[key]) : "—"}</dd>
            </div>)}
          </dl>
          <p className="mt-3 text-[#58657a]">This is an estimate. The final refund may change after inspection.</p>
          {preview.note && <p className="mt-2 whitespace-pre-wrap break-words text-[#58657a]">{preview.note}</p>}
        </div>}
      </div>
    </section>
  );
}
