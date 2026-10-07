import { useEffect, useRef, useState } from "react";
import staffAgreementService from "../api/staffAgreementService";

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

export default function StaffOverdueAgreements() {
  const [facilityId, setFacilityId] = useState("");
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
    load("");
    return () => { requestId.current++; };
  }, []);

  return <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
    <div className="flex flex-wrap items-end justify-between gap-3">
      <div><h2 className="text-lg font-bold">Overdue Agreements</h2><p className="text-xs text-[#8996a9]">Agreements requiring inspection or unit sealing</p></div>
      <form onSubmit={(event) => { event.preventDefault(); load(); }} className="flex items-end gap-2 text-sm">
        <label className="font-semibold text-[#58657a]">Facility ID (optional)<input type="number" min="1" step="1" value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="mt-1 block w-36 rounded-lg border p-2 text-[#0b1c30]" /></label>
        <button disabled={loading} className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white disabled:opacity-50">Load</button>
      </form>
    </div>

    {loading && <p role="status" className="mt-4 text-sm">Loading overdue agreements...</p>}
    {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {!loading && !error && agreements.length === 0 && <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-[#8996a9]">No overdue agreements returned by the server.</p>}
    {!loading && !error && agreements.length > 0 && <div className="mt-4 grid gap-3 md:grid-cols-2 xl:grid-cols-3">
      {agreements.map((agreement) => {
        const days = overdueDays(agreement.endDate);
        return <article key={agreement.agreementId} className="rounded-xl border border-red-200 bg-red-50/50 p-4 text-sm">
          <div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-bold">{agreement.agreementNo || `Agreement #${agreement.agreementId}`}</h3><p className="text-xs text-[#58657a]">Unit {agreement.unitCode || agreement.storageUnitId}</p></div><span className="rounded-full bg-red-100 px-2 py-1 text-xs font-bold text-red-700">{days == null ? "Overdue" : `${days} days overdue`}</span></div>
          <dl className="mt-3 grid grid-cols-2 gap-3 text-xs">
            <div><dt className="text-[#8996a9]">Customer</dt><dd className="font-semibold">{agreement.customerName || agreement.customerId}</dd></div>
            <div><dt className="text-[#8996a9]">Phone</dt><dd className="font-semibold">{agreement.customerPhone || "—"}</dd></div>
            <div><dt className="text-[#8996a9]">End date</dt><dd className="font-semibold">{agreement.endDate || "—"}</dd></div>
            <div><dt className="text-[#8996a9]">Outstanding</dt><dd className="font-semibold text-red-700">{formatMoney(agreement.outstandingBalance)}</dd></div>
            <div><dt className="text-[#8996a9]">Agreement status</dt><dd className="font-semibold">{agreement.agreementStatus || "—"}</dd></div>
            <div><dt className="text-[#8996a9]">Credential status</dt><dd className="font-semibold">{agreement.credentialStatus || "—"}</dd></div>
          </dl>
        </article>;
      })}
    </div>}
  </section>;
}
