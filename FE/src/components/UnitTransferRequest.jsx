import { useEffect, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import facilityService from "../api/facilityService";
import SupportDropdown from "./SupportDropdown";

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export default function UnitTransferRequest({ agreementId }) {
  const [unitTypes, setUnitTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [requestedFacilityId, setRequestedFacilityId] = useState("");
  const [requestedUnitTypeId, setRequestedUnitTypeId] = useState("");
  const [moveOutDate, setMoveOutDate] = useState(localDate);
  const [moveInDate, setMoveInDate] = useState(localDate);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const lock = useRef(false);

  useEffect(() => {
    if (unitTypes.length > 0) return undefined;
    let active = true;
    setTypesLoading(true);
    facilityService.getUnitTypes()
      .then((data) => { if (active) setUnitTypes(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err.message || "Unable to load unit types."); })
      .finally(() => { if (active) setTypesLoading(false); });
    setFacilitiesLoading(true);
    facilityService.getFacilities()
      .then((data) => { if (active) setFacilities(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err.message || "Unable to load facilities."); })
      .finally(() => { if (active) setFacilitiesLoading(false); });
    return () => { active = false; };
  }, [unitTypes.length]);

  async function submit(event) {
    event.preventDefault();
    const unitTypeId = Number(requestedUnitTypeId);
    const facilityId = Number(requestedFacilityId);
    if (!Number.isInteger(unitTypeId) || unitTypeId <= 0) {
      setError("Select a requested unit type.");
      return;
    }
    if (!Number.isInteger(facilityId) || facilityId <= 0) {
      setError("Select a requested facility.");
      return;
    }
    if (moveOutDate > moveInDate || Math.round((new Date(`${moveInDate}T00:00:00`) - new Date(`${moveOutDate}T00:00:00`)) / 86400000) > 7) {
      setError("Move-in date must be within 7 days after move-out.");
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      const data = await rentalService.requestUnitTransfer(agreementId, {
        requestedUnitTypeId: unitTypeId,
        requestedFacilityId: facilityId,
        moveOutDate,
        moveInDate,
        reason: reason.trim(),
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Unable to request a unit transfer.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  if (result) return <div role="status" className="mt-2 rounded-lg bg-green-50 p-2.5 text-xs text-green-800"><strong>Transfer request created.</strong><p className="mt-0.5">#{result.id} · {result.status}</p><div className="mt-2 grid grid-cols-2 gap-1 text-[11px]"><span>Rent difference: {Number(result.diffRentAmount || 0).toLocaleString("vi-VN")} ₫</span><span>Deposit difference: {Number(result.diffDepositAmount || 0).toLocaleString("vi-VN")} ₫</span><strong className="col-span-2">Payment due: {Number(result.totalPaidAmount || 0).toLocaleString("vi-VN")} ₫</strong></div><p className="mt-2 text-green-700">Payment QR will be available when the payment step is activated.</p></div>;

  return <section aria-label="Unit transfer request" className="rounded-lg bg-white p-2 text-xs">
    <form onSubmit={submit} className="space-y-2">
      <SupportDropdown
        label="Facility"
        icon="location_on"
        disabled={facilitiesLoading}
        value={requestedFacilityId}
        onChange={setRequestedFacilityId}
        placeholder={facilitiesLoading ? "Loading facilities..." : "Select facility"}
        options={facilities.map((facility) => ({ value: String(facility.id), label: facility.name || facility.code || `Facility #${facility.id}` }))}
      />
      <SupportDropdown
        label="Type"
        icon="warehouse"
        disabled={typesLoading}
        value={requestedUnitTypeId}
        onChange={setRequestedUnitTypeId}
        placeholder={typesLoading ? "Loading types..." : "Select type"}
        options={unitTypes.map((type) => ({ value: String(type.id), label: type.name || type.displayName || `Type #${type.id}` }))}
      />
      <div className="grid gap-2 sm:grid-cols-2">
        <label className="block font-semibold text-slate-600">Move-out date<input type="date" required min={localDate()} value={moveOutDate} onChange={(event) => setMoveOutDate(event.target.value)} className="mt-1 block w-full rounded-lg border p-1.5 text-xs text-[#0b1c30]" /></label>
        <label className="block font-semibold text-slate-600">Move-in date<input type="date" required min={moveOutDate} max={new Date(new Date(`${moveOutDate}T00:00:00`).getTime() + 7 * 86400000).toISOString().slice(0, 10)} value={moveInDate} onChange={(event) => setMoveInDate(event.target.value)} className="mt-1 block w-full rounded-lg border p-1.5 text-xs text-[#0b1c30]" /></label>
      </div>
      <label className="block font-semibold text-slate-600">Reason<textarea required rows="2" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 block w-full rounded-lg border p-1.5 text-xs text-[#0b1c30]" placeholder="Reason..." /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-red-700">{error}</p>}
      <button disabled={loading || typesLoading} className="rounded-lg bg-[#1d5fe5] px-3 py-1.5 font-bold text-white disabled:opacity-50">{loading ? "..." : "Submit"}</button>
    </form>
  </section>;
}
