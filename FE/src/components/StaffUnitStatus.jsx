import { useRef, useState } from "react";
import staffFacilityService from "../api/staffFacilityService";

const OPTIONS = [
  { value: "available", label: "Available" },
  { value: "under_maintenance", label: "Under Maintenance" },
  { value: "cleaning", label: "Cleaning" },
  { value: "damaged", label: "Damaged / Need Repair" },
];

export default function StaffUnitStatus({ unit, onUpdated }) {
  const currentStatus = String(unit.physicalStatus || unit.status || "").toLowerCase();
  const [status, setStatus] = useState(OPTIONS.some((option) => option.value === currentStatus) ? currentStatus : "available");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);

  async function submit(event) {
    event.preventDefault();
    if (lock.current || status === currentStatus) return;
    lock.current = true;
    setLoading(true);
    setError("");
    setSaved(false);
    try {
      await staffFacilityService.updatePhysicalStatus(unit.facilityId, unit.unitId, {
        physicalStatus: status,
      });
      onUpdated({ ...unit, status, physicalStatus: status });
      setSaved(true);
    } catch (err) {
      setError(err.message || "Unable to update the unit physical status.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-3 border-t border-current/15 pt-3 text-xs">
      <label className="font-semibold block text-slate-800">
        Update Physical Status
        <select
          value={status}
          disabled={loading}
          onChange={(event) => {
            setStatus(event.target.value);
            setSaved(false);
          }}
          className="mt-1 block w-full rounded-lg border border-[#dfe7f5] bg-white p-2 text-[#0b1c30]"
        >
          {OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>
      <button
        disabled={loading || status === currentStatus}
        className="mt-2 rounded-lg bg-[#0b1c30] px-3 py-2 font-bold text-white transition hover:bg-[#152a45] disabled:opacity-40"
      >
        {loading ? "Saving..." : "Save Status"}
      </button>
      {error && <p role="alert" className="mt-2 text-red-700">{error}</p>}
      {saved && <p role="status" className="mt-2 text-green-700">Physical status updated successfully.</p>}
    </form>
  );
}
