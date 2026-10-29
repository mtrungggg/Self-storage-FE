import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { useManagerFacility } from "../context/ManagerFacilityContext";

/**
 * Top horizontal facility control bar: Minimalist, Text-only, No icons.
 * Left: Facility dropdown.
 * Right: Portal destination for page-level actions (e.g. Refresh, tab toggles).
 */
export function FacilitySwitcher() {
  const { facilities, facilityId, setFacilityId, loading, error } = useManagerFacility();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white px-4 py-2.5 lg:px-8">
      <div className="flex items-center gap-2">
        <span className="text-xs font-semibold text-slate-500">Facility:</span>
        {loading ? (
          <span className="text-xs text-slate-400">Loading facilities...</span>
        ) : error ? (
          <span className="text-xs font-semibold text-rose-600">{error}</span>
        ) : (
          <select
            value={facilityId ?? ""}
            onChange={(event) => setFacilityId(Number(event.target.value))}
            className="rounded-md border border-slate-200 bg-white px-2.5 py-1 text-xs font-medium text-slate-700 shadow-none focus:outline-none focus:border-slate-400"
          >
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.code} — {facility.name} ({facility.city || "Vietnam"})
              </option>
            ))}
          </select>
        )}
      </div>

      {/* Target container for page actions (rendered via FacilityBarActions) */}
      <div id="facility-bar-actions" className="flex items-center gap-2" />
    </div>
  );
}

/**
 * Portal component allowing any Manager page to project actions directly into the Top Facility Bar.
 */
export function FacilityBarActions({ children }) {
  const [target, setTarget] = useState(null);

  useEffect(() => {
    setTarget(document.getElementById("facility-bar-actions"));
  }, []);

  if (!target) return null;
  return createPortal(children, target);
}

export default FacilitySwitcher;
