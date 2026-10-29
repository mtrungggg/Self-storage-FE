import { useEffect, useMemo, useRef, useState } from "react";
import staffFacilityService from "../api/staffFacilityService";
import StaffUnitStatus from "./StaffUnitStatus";
import StaffMaintenanceOrder from "./StaffMaintenanceOrder";

const STATUS_CONFIG = {
  available: {
    label: "Available",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  occupied: {
    label: "Occupied",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  reserved: {
    label: "Reserved",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  maintenance: {
    label: "Maintenance",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  under_maintenance: {
    label: "Under Maint.",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

function formatMoney(value) {
  if (value == null) return "—";
  return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);
}

function compactUnitType(unitTypeName) {
  const name = String(unitTypeName || "").toLowerCase();
  const area = String(unitTypeName || "").match(/\d+(?:[.,]\d+)?\s*m[²2]?/i)?.[0]?.replace("m2", "m²") || "";
  const size = name.includes("extra large") ? "XL" : name.includes("large") ? "L" : name.includes("medium") ? "M" : name.includes("small") ? "S" : name.includes("mini") ? "MN" : "ST";
  const condition = name.includes("seafood") || name.includes("freeze") || name.includes("cold") ? "C" : name.includes("warm") || name.includes("heat") ? "W" : name.includes("climate") ? "CL" : "D";
  return [size, condition, area].filter(Boolean).join(" · ");
}

export default function StaffFacilityUnits({ initialFacilityId = "1" }) {
  const [facilityId, setFacilityId] = useState(String(initialFacilityId || "1"));
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searched, setSearched] = useState(false);
  const [error, setError] = useState("");
  const [activeFilter, setActiveFilter] = useState("all");
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedUnitId, setExpandedUnitId] = useState(null);

  const requestId = useRef(0);

  const counts = useMemo(() => {
    return units.reduce((result, unit) => {
      const status = String(unit.status || "unknown").toLowerCase();
      result[status] = (result[status] || 0) + 1;
      return result;
    }, {});
  }, [units]);

  const loadUnits = async (id = Number(facilityId), clear = true) => {
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
      if (currentRequest === requestId.current) setUnits(data || []);
    } catch (err) {
      if (currentRequest === requestId.current) {
        setError(err.message || "Unable to load facility units.");
      }
    } finally {
      if (currentRequest === requestId.current) setLoading(false);
    }
  };

  useEffect(() => {
    if (initialFacilityId) {
      setFacilityId(String(initialFacilityId));
      loadUnits(Number(initialFacilityId));
    }
  }, [initialFacilityId]);

  const filteredUnits = useMemo(() => {
    return units.filter((unit) => {
      const status = String(unit.status || "").toLowerCase();
      const matchesFilter =
        activeFilter === "all" ||
        status === activeFilter ||
        (activeFilter === "maintenance" && (status === "maintenance" || status === "under_maintenance"));

      if (!matchesFilter) return false;

      if (!searchQuery.trim()) return true;
      const q = searchQuery.toLowerCase().trim();
      return (
        unit.unitCode?.toLowerCase().includes(q) ||
        unit.unitTypeName?.toLowerCase().includes(q) ||
        unit.customerName?.toLowerCase().includes(q) ||
        unit.currentAgreementNo?.toLowerCase().includes(q)
      );
    });
  }, [units, activeFilter, searchQuery]);

  return (
    <section className="mt-4 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
      {/* Single Compact Toolbar Row */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-2.5">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition ${
              activeFilter === "all"
                ? "bg-slate-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            All ({units.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("available")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === "available"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            Available ({counts.available || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("occupied")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === "occupied"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            Occupied ({counts.occupied || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("maintenance")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 ${
              activeFilter === "maintenance"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            Maintenance ({(counts.maintenance || 0) + (counts.under_maintenance || 0)})
          </button>
        </div>

        <div className="flex items-center gap-1.5">
          <div className="relative">
            <span className="material-symbols-outlined absolute left-2 top-1.5 text-[14px] text-slate-400">
              search
            </span>
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Filter code, tenant..."
              className="w-36 sm:w-48 rounded-lg border border-slate-200 bg-slate-50/80 pl-6 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-[#1d5fe5] focus:bg-white"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => loadUnits(Number(facilityId), false)}
            className="flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:text-slate-900 transition disabled:opacity-50"
            title="Refresh units"
          >
            <span className={`material-symbols-outlined text-[15px] ${loading ? "animate-spin" : ""}`}>
              sync
            </span>
          </button>
        </div>
      </div>

      {error && (
        <div role="alert" className="my-3 rounded-lg bg-red-50 p-3 text-xs text-red-700">
          {error}
        </div>
      )}

      {loading && units.length === 0 && (
        <div className="py-8 text-center text-xs text-slate-400">Loading units...</div>
      )}

      {!loading && !error && searched && filteredUnits.length === 0 && (
        <div className="my-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
          No units found matching this criteria.
        </div>
      )}

      {filteredUnits.length > 0 && (
        <div className="mt-3 space-y-3">
          <div className="overflow-hidden rounded-xl border border-[#dfe7f5] bg-white">
            <div className="grid grid-cols-[72px_minmax(0,1fr)_88px_72px] gap-2 border-b border-[#eef1f8] bg-[#f8faff] px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-[#718299] sm:grid-cols-[82px_minmax(0,1.3fr)_92px_minmax(0,1fr)_80px]">
              <span>Unit</span><span>Type</span><span>Status</span><span className="hidden sm:block">Customer</span><span className="text-right">Manage</span>
            </div>
            <div className="max-h-[430px] divide-y divide-[#eef1f8] overflow-y-auto">
              {filteredUnits.map((unit) => {
                const status = STATUS_CONFIG[String(unit.status || "").toLowerCase()] || STATUS_CONFIG.available;
                const expanded = expandedUnitId === unit.unitId;
                return (
                  <div key={unit.unitId} className="grid grid-cols-[72px_minmax(0,1fr)_88px_72px] items-center gap-2 px-3 py-2.5 text-xs transition hover:bg-[#f8faff] sm:grid-cols-[82px_minmax(0,1.3fr)_92px_minmax(0,1fr)_80px]">
                    <span className="font-mono font-bold text-[#0b1c30]">{unit.unitCode || `#${unit.unitId}`}</span>
                    <span className="truncate text-[#58657a]" title={unit.unitTypeName}>{compactUnitType(unit.unitTypeName)}</span>
                    <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-1.5 py-0.5 text-[10px] font-bold ${status.badge}`}><span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />{status.label}</span>
                    <span className="hidden truncate text-[#58657a] sm:block">{unit.customerName || "—"}</span>
                    <button type="button" onClick={() => setExpandedUnitId(expanded ? null : unit.unitId)} className={`justify-self-end rounded-lg border px-2 py-1 text-[10px] font-bold transition ${expanded ? "border-[#1d5fe5] bg-[#1d5fe5] text-white" : "border-[#d8e3f5] text-[#1d5fe5] hover:bg-[#eef4ff]"}`}>{expanded ? "Close" : "Manage"}</button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Inline Expanded Management Drawer for selected unit */}
          {expandedUnitId && (() => {
            const unit = units.find((u) => u.unitId === expandedUnitId);
            if (!unit) return null;
            return (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      Managing Unit {unit.unitCode || `#${unit.unitId}`}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({unit.unitTypeName || "Storage Unit"})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedUnitId(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800"
                  >
                    ✕ Close
                  </button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Status Change Module */}
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">
                        tune
                      </span>
                      <span>Unit status</span>
                    </h4>
                    <StaffUnitStatus
                      unit={unit}
                      onUpdated={(updated) =>
                        setUnits((current) =>
                          current.map((entry) =>
                            entry.unitId === updated.unitId ? updated : entry
                          )
                        )
                      }
                    />
                  </div>

                  {/* Maintenance Order Module */}
                  <div className="bg-slate-50/80 p-3.5 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-rose-600">
                        build
                      </span>
                      <span>Maintenance</span>
                    </h4>
                    <StaffMaintenanceOrder
                      unitId={unit.unitId}
                      onCreated={() => loadUnits(Number(facilityId), false)}
                    />
                  </div>
                </div>
              </div>
            );
          })()}
        </div>
      )}
    </section>
  );
}
