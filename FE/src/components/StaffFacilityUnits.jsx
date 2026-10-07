import { useMemo, useRef, useState } from "react";
import staffFacilityService from "../api/staffFacilityService";
import StaffUnitStatus from "./StaffUnitStatus";
import StaffMaintenanceOrder from "./StaffMaintenanceOrder";

const STATUS_STYLE = {
  available: "border-green-300 bg-green-50 text-green-800",
  reserved: "border-amber-300 bg-amber-50 text-amber-800",
  occupied: "border-blue-300 bg-blue-50 text-blue-800",
  maintenance: "border-red-300 bg-red-50 text-red-800",
  under_maintenance: "border-red-300 bg-red-50 text-red-800",
};

function formatMoney(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default function StaffFacilityUnits() {
  const [facilityId, setFacilityId] = useState("");
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const requestId = useRef(0);

  const counts = useMemo(() => units.reduce((result, unit) => {
    const status = String(unit.status || "unknown").toLowerCase();
    result[status] = (result[status] || 0) + 1;
    return result;
  }, {}), [units]);

  async function loadUnits(id = Number(facilityId), clear = true) {
    if (!Number.isInteger(id) || id <= 0) {
      setError("Facility ID must be a positive whole number.");
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setSearched(true);
    setError("");
    if (clear) setUnits([]);
    try {
      const data = await staffFacilityService.getUnits(id);
      if (currentRequest === requestId.current) setUnits(data);
    } catch (err) {
      if (currentRequest === requestId.current) setError(err.message || "Unable to load facility units.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    loadUnits();
  }

  return <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><h2 className="text-lg font-bold">Facility Units</h2><p className="text-xs text-[#8996a9]">Live unit status from the facility</p></div>
      <form onSubmit={submit} className="flex items-end gap-2 text-sm">
        <label className="font-semibold text-[#58657a]">Facility ID<input type="number" min="1" step="1" required value={facilityId} onChange={(event) => setFacilityId(event.target.value)} className="mt-1 block w-36 rounded-lg border p-2 text-[#0b1c30]" /></label>
        <button disabled={loading} className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white disabled:opacity-50">{loading ? "Loading..." : "View units"}</button>
      </form>
    </div>

    {error && <p role="alert" className="mt-4 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
    {loading && <p role="status" className="mt-4 text-sm">Loading facility units...</p>}
    {!loading && !error && searched && units.length === 0 && <p className="mt-4 rounded-xl border border-dashed p-6 text-center text-sm text-[#8996a9]">No units returned by the server.</p>}
    {units.length > 0 && <>
      <div className="mt-4 flex flex-wrap gap-2 text-xs font-semibold">
        <span className="rounded-full bg-[#eef4ff] px-3 py-1">All ({units.length})</span>
        {Object.entries(counts).map(([status, count]) => <span key={status} className={`rounded-full border px-3 py-1 capitalize ${STATUS_STYLE[status] || "border-gray-300 bg-gray-50"}`}>{status.replaceAll("_", " ")} ({count})</span>)}
      </div>
      <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {units.map((unit) => {
          const status = String(unit.status || "unknown").toLowerCase();
          return <article key={unit.unitId} className={`rounded-xl border p-4 ${STATUS_STYLE[status] || "border-gray-300 bg-gray-50"}`}>
            <div className="flex items-center justify-between gap-2"><strong>{unit.unitCode || `Unit #${unit.unitId}`}</strong><span className="text-xs font-bold capitalize">{status.replaceAll("_", " ")}</span></div>
            <p className="mt-1 text-xs">{unit.unitTypeName || `Type #${unit.unitTypeId}`}</p>
            <dl className="mt-3 space-y-1 border-t border-current/15 pt-2 text-xs">
              <div className="flex justify-between gap-2"><dt>Current rate</dt><dd className="font-semibold">{formatMoney(unit.currentRate)}</dd></div>
              {unit.currentAgreementNo && <div><dt>Agreement</dt><dd className="break-words font-semibold">{unit.currentAgreementNo}</dd></div>}
              {unit.customerName && <div><dt>Customer</dt><dd className="break-words font-semibold">{unit.customerName}</dd></div>}
            </dl>
            <StaffUnitStatus unit={unit} onUpdated={(updated) => setUnits((current) => current.map((entry) => entry.unitId === updated.unitId ? updated : entry))} />
            <StaffMaintenanceOrder unitId={unit.unitId} onCreated={() => loadUnits(Number(facilityId), false)} />
          </article>;
        })}
      </div>
    </>}
  </section>;
}
