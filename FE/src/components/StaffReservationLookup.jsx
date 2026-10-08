import { useRef, useState } from "react";
import staffReservationService from "../api/staffReservationService";
import StaffAssignUnit from "./StaffAssignUnit";
import StaffHandoverForm from "./StaffHandoverForm";
import QrCameraScanner from "./QrCameraScanner";

function formatMoney(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

export default function StaffReservationLookup() {
  const [query, setQuery] = useState("");
  const [facilityId, setFacilityId] = useState("");
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [cameraActive, setCameraActive] = useState(false);
  const requestId = useRef(0);

  async function search(keyword = query.trim(), clearResults = true) {
    if (!keyword) {
      setError("Enter a reservation code, phone number, or QR value.");
      return;
    }

    const currentRequest = ++requestId.current;
    setLoading(true);
    setError("");
    setSearched(true);
    if (clearResults) setResults([]);
    try {
      const data = await staffReservationService.lookup(keyword, facilityId);
      if (currentRequest === requestId.current) setResults(data);
    } catch (err) {
      if (currentRequest === requestId.current) setError(err.message || "Unable to look up reservations.");
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  }

  function submit(event) {
    event.preventDefault();
    search();
  }

  function handleQrScan(scannedCode) {
    setCameraActive(false);
    setQuery(scannedCode);
    search(scannedCode);
  }

  return (
    <section className="mt-5 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[#1d5fe5]">qr_code_scanner</span>
          <h2 className="text-[14px] font-bold">Check-in</h2>
        </div>
        <button
          type="button"
          onClick={() => setCameraActive((v) => !v)}
          className={`inline-flex items-center gap-1.5 rounded-[9px] border px-3 py-1.5 text-xs font-bold transition ${
            cameraActive
              ? "border-[#2dd4a0] bg-[#effcf6] text-[#0e7b4c]"
              : "border-[#dfe7f5] bg-[#f8faff] text-[#3a475a] hover:border-[#1d5fe5] hover:text-[#1d5fe5]"
          }`}
        >
          <span className="material-symbols-outlined text-[16px]">
            {cameraActive ? "videocam_off" : "photo_camera"}
          </span>
          <span>{cameraActive ? "Close" : "Scan QR"}</span>
        </button>
      </div>

      {cameraActive && (
        <div className="mt-4 max-w-md mx-auto">
          <QrCameraScanner
            onScan={handleQrScan}
            onClose={() => setCameraActive(false)}
          />
        </div>
      )}

      <form onSubmit={submit} className="mt-3 flex flex-wrap items-end gap-3">
        <label className="min-w-[260px] flex-1 text-xs font-semibold text-[#58657a]">
          Search
          <input
            autoComplete="off"
            autoFocus
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Code, phone, or QR..."
            className="mt-1 w-full rounded-[9px] border border-[#dfe7f5] px-3 py-2 text-sm text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
          />
        </label>
        <label className="text-xs font-semibold text-[#58657a]">
          Facility ID
          <input
            type="number"
            min="1"
            step="1"
            value={facilityId}
            onChange={(event) => setFacilityId(event.target.value)}
            className="mt-1 block w-28 rounded-[9px] border border-[#dfe7f5] px-3 py-2 text-sm text-[#0b1c30] outline-none focus:border-[#1d5fe5]"
          />
        </label>
        <button disabled={loading} className="rounded-[9px] bg-[#1d5fe5] px-4 py-2 text-sm font-bold text-white transition hover:bg-[#1550c7] disabled:opacity-50">
          {loading ? "..." : "Search"}
        </button>
      </form>

      {error && <p role="alert" className="mt-3 rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {!loading && !error && searched && results.length === 0 && (
        <p className="mt-3 rounded-lg border border-dashed border-[#dfe7f5] p-4 text-center text-xs text-[#8996a9]">No results.</p>
      )}
      {results.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {results.map((item) => (
            <article key={item.reservationId} className="rounded-xl border border-[#dfe7f5] bg-[#f8faff] p-3 text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <strong className="text-sm text-[#0b1c30]">{item.reservationCode}</strong>
                <span className="rounded-full bg-[#eef4ff] px-2 py-0.5 font-semibold text-[#1d5fe5]">{item.status || "Unknown"}</span>
              </div>
              <div className="mt-2.5 grid grid-cols-2 gap-x-2 gap-y-1 text-xs">
                <span className="font-semibold text-slate-800 truncate">{item.customerName || "—"}</span>
                <span className="text-right text-slate-500">{item.customerPhone || "—"}</span>
                <span className="text-slate-500">Unit: {item.unitCode || item.unitTypeName || "—"}</span>
                <span className="text-right font-bold text-slate-900">{formatMoney(item.quotedTotal)}</span>
              </div>
              {!item.unitCode && (
                <StaffAssignUnit reservationId={item.reservationId} facilityId={item.facilityId} onAssigned={() => search(query.trim(), false)} />
              )}
              {item.unitCode && !["checked_in", "completed"].includes(String(item.status).toLowerCase()) && (
                <StaffHandoverForm reservationId={item.reservationId} onCreated={() => search(query.trim(), false)} />
              )}
            </article>
          ))}
        </div>
      )}
    </section>
  );
}
