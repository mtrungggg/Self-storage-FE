import { useEffect, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import facilityService from "../api/facilityService";

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export default function UnitTransferRequest({ agreementId }) {
  const [open, setOpen] = useState(false);
  const [unitTypes, setUnitTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [requestedUnitTypeId, setRequestedUnitTypeId] = useState("");
  const [requestedEffectiveDate, setRequestedEffectiveDate] = useState(localDate);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const lock = useRef(false);

  useEffect(() => {
    if (!open || unitTypes.length > 0) return undefined;
    let active = true;
    setTypesLoading(true);
    facilityService.getUnitTypes()
      .then((data) => { if (active) setUnitTypes(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err.message || "Unable to load unit types."); })
      .finally(() => { if (active) setTypesLoading(false); });
    return () => { active = false; };
  }, [open, unitTypes.length]);

  async function submit(event) {
    event.preventDefault();
    const unitTypeId = Number(requestedUnitTypeId);
    if (!Number.isInteger(unitTypeId) || unitTypeId <= 0) {
      setError("Select a requested unit type.");
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      const data = await rentalService.requestUnitTransfer(agreementId, {
        requestedUnitTypeId: unitTypeId,
        requestedEffectiveDate,
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

  if (result) return <div role="status" className="mt-3 rounded-lg bg-green-50 p-3 text-xs text-green-800"><strong>Transfer request submitted.</strong><p className="mt-1">Request #{result.id} · {result.status}</p>{result.requestedUnitTypeName && <p>{result.fromUnitCode} → {result.requestedUnitTypeName}</p>}</div>;

  return <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="mt-3 border-t border-[#dfe7f5] pt-3 text-xs">
    <summary className="cursor-pointer font-semibold text-[#1d5fe5]">Request a different unit</summary>
    <form onSubmit={submit} className="mt-3 space-y-2">
      <label className="block font-semibold text-[#58657a]">Requested unit type
        <select required disabled={typesLoading} value={requestedUnitTypeId} onChange={(event) => setRequestedUnitTypeId(event.target.value)} className="mt-1 block w-full rounded-lg border bg-white p-2 text-[#0b1c30]"><option value="">{typesLoading ? "Loading unit types..." : "Select unit type"}</option>{unitTypes.map((type) => <option key={type.id} value={type.id}>{type.name || type.displayName || `Unit type #${type.id}`}</option>)}</select>
      </label>
      <label className="block font-semibold text-[#58657a]">Effective date<input type="date" required min={localDate()} value={requestedEffectiveDate} onChange={(event) => setRequestedEffectiveDate(event.target.value)} className="mt-1 block w-full rounded-lg border p-2 text-[#0b1c30]" /></label>
      <label className="block font-semibold text-[#58657a]">Reason<textarea required rows="3" value={reason} onChange={(event) => setReason(event.target.value)} className="mt-1 block w-full rounded-lg border p-2 text-[#0b1c30]" placeholder="Explain why you need a different unit" /></label>
      {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-red-700">{error}</p>}
      <button disabled={loading || typesLoading} className="rounded-lg bg-[#1d5fe5] px-3 py-2 font-bold text-white disabled:opacity-50">{loading ? "Submitting..." : "Submit transfer request"}</button>
    </form>
  </details>;
}
