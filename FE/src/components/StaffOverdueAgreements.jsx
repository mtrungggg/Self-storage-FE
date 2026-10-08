import { useEffect, useRef, useState } from "react";
import staffAgreementService from "../api/staffAgreementService";
import StaffLockAccess from "./StaffLockAccess";

function formatMoney(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function overdueDays(endDate) {
  if (!endDate) return null;
  const end = new Date(`${endDate}T00:00:00`);
  if (Number.isNaN(end.getTime())) return null;
  return Math.max(0, Math.floor((Date.now() - end.getTime()) / 86400000));
}

export default function StaffOverdueAgreements({ initialFacilityId = "" }) {
  const [facilityId, setFacilityId] = useState(String(initialFacilityId || ""));
  const [agreements, setAgreements] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  async function load(id = facilityId) {
    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    try {
      const data = await staffAgreementService.getOverdueAgreements(id);
      if (currentRequest === requestId.current) setAgreements(data);
    } catch (err) {
      if (currentRequest === requestId.current) setError(err.message || "Unable to load overdue agreements.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  useEffect(() => {
    setFacilityId(String(initialFacilityId || ""));
    load(initialFacilityId || "");
    return () => { requestId.current++; };
  }, [initialFacilityId]);

  return <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-sm font-bold text-slate-900">Overdue</h2></div>
      <form onSubmit={(event) => { event.preventDefault(); load(); }} className="flex items-end gap-2 text-xs">
        <label className="font-semibold text-[#58657a]">Facility<input type="number" min="1" step="1" value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="mt-1 block w-28 rounded-lg border p-1.5 text-[#0b1c30]" /></label>
        <button disabled={loading} className="rounded-lg bg-[#1d5fe5] px-3 py-1.5 font-semibold text-white disabled:opacity-50">{loading ? "..." : "Filter"}</button>
      </form>
    </div>

    {loading && <p role="status" className="mt-3 text-xs text-slate-400">Loading...</p>}
    {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">{error}</p>}
    {!loading && !error && agreements.length === 0 && <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-xs text-[#8996a9]">No overdue agreements.</p>}
    {!loading && !error && agreements.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {agreements.map((agreement) => {
        const days = overdueDays(agreement.endDate);
        return <article key={agreement.agreementId} className="rounded-xl border border-red-200 bg-red-50/50 p-3 text-xs">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold">{agreement.agreementNo || `Agreement #${agreement.agreementId}`}</h3><p className="text-[11px] text-[#58657a]">Unit {agreement.unitCode || agreement.storageUnitId}</p></div><span className="rounded-full bg-red-100 px-2 py-0.5 text-[11px] font-bold text-red-700">{days == null ? "Overdue" : `${days}d`}</span></div>
          <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
            <span className="font-semibold text-slate-800 truncate">{agreement.customerName || agreement.customerId}</span>
            <span className="text-right text-slate-500">{agreement.customerPhone || "—"}</span>
            <span className="text-slate-500">End: {agreement.endDate || "—"}</span>
            <span className="text-right font-bold text-red-700">{formatMoney(agreement.outstandingBalance)}</span>
          </div>
          {days > 1 && !["locked", "suspended", "revoked"].includes(String(agreement.credentialStatus).toLowerCase()) && <StaffLockAccess agreementId={agreement.agreementId} onLocked={() => load(facilityId)} />}
          {days != null && days <= 1 && <p className="mt-2 border-t border-red-200/50 pt-2 text-[11px] text-[#58657a]">Lock eligible after &gt;1d.</p>}
        </article>;
      })}
    </div>}
  </section>;
}
