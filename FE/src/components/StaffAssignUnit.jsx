import { useEffect, useRef, useState } from "react";
import staffReservationService from "../api/staffReservationService";
import staffFacilityService from "../api/staffFacilityService";

export default function StaffAssignUnit({ reservationId, facilityId, onAssigned }) {
  const [storageUnitId, setStorageUnitId] = useState("");
  const [availableUnits, setAvailableUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(Boolean(facilityId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);

  useEffect(() => {
    let active = true;
    if (!facilityId) return undefined;
    setUnitsLoading(true);
    staffFacilityService.getUnits(facilityId)
      .then((units) => {
        if (active) setAvailableUnits(units.filter((unit) => String(unit.status).toLowerCase() === "available"));
      })
      .catch((err) => { if (active) setError(err.message || "Unable to load available units."); })
      .finally(() => { if (active) setUnitsLoading(false); });
    return () => { active = false; };
  }, [facilityId]);

  async function submit(event) {
    event.preventDefault();
    const unitId = Number(storageUnitId);
    if (!Number.isInteger(unitId) || unitId <= 0) {
      setError("Storage Unit ID must be a positive whole number.");
      return;
    }
    if (lock.current) return;

    lock.current = true;
    setLoading(true);
    setError("");
    try {
      await staffReservationService.assignUnit(reservationId, unitId);
      setStorageUnitId("");
      await onAssigned();
    } catch (err) {
      setError(err.message || "Unable to assign the storage unit.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 border-t border-[#dfe7f5] pt-3">
      <div className="flex flex-wrap items-end gap-2">
        <label className="font-semibold text-[#58657a]">
          Storage Unit ID
          {facilityId ? <select required disabled={unitsLoading} value={storageUnitId} onChange={(event) => setStorageUnitId(event.target.value)} className="mt-1 block min-w-48 rounded-lg border border-[#dfe7f5] bg-white px-3 py-2 text-[#0b1c30] outline-none focus:border-[#1d5fe5]"><option value="">{unitsLoading ? "Loading units..." : "Select an available unit"}</option>{availableUnits.map((unit) => <option key={unit.unitId} value={unit.unitId}>{unit.unitCode} · {unit.unitTypeName}</option>)}</select> : <input type="number" min="1" step="1" required value={storageUnitId} onChange={(event) => setStorageUnitId(event.target.value)} className="mt-1 block w-36 rounded-lg border border-[#dfe7f5] bg-white px-3 py-2 text-[#0b1c30] outline-none focus:border-[#1d5fe5]" />}
        </label>
        <button disabled={loading} className="rounded-lg bg-[#0e7b4c] px-3 py-2 font-bold text-white disabled:opacity-50">
          {loading ? "Assigning..." : "Assign Unit"}
        </button>
      </div>
      {error && <p role="alert" className="mt-2 text-red-600">{error}</p>}
      {!unitsLoading && facilityId && availableUnits.length === 0 && !error && <p className="mt-2 text-[#8996a9]">No available units at this facility.</p>}
    </form>
  );
}
