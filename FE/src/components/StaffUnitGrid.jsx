import { useEffect, useState } from "react";
import staffFacilityService from "../api/staffFacilityService";

export default function StaffUnitGrid({ facilityId }) {
  const [units, setUnits] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [sizeFilter, setSizeFilter] = useState("");
  const [selectedUnit, setSelectedUnit] = useState(null);

  const loadUnits = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffFacilityService.getUnits(facilityId, {
        status: statusFilter,
        sizeCategory: sizeFilter,
      });
      setUnits(data || []);
    } catch (err) {
      setError(err?.message || "Unable to load units.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUnits();
  }, [facilityId, statusFilter, sizeFilter]);

  const viewDetail = async (unitId) => {
    try {
      const data = await staffFacilityService.getUnitDetail(unitId);
      setSelectedUnit(data);
    } catch (err) {
      alert(err?.message || "Failed to load unit details");
    }
  };

  const getStatusBadge = (status) => {
    const s = String(status).toLowerCase();
    if (s === "available" || s === "vacant")
      return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">Available</span>;
    if (s === "occupied" || s === "rented")
      return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-blue-50 text-blue-700 border border-blue-200">Occupied</span>;
    if (s === "reserved" || s === "pending")
      return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-amber-50 text-amber-700 border border-amber-200">Reserved</span>;
    return <span className="px-2 py-0.5 text-[11px] font-semibold rounded-full bg-rose-50 text-rose-700 border border-rose-200">Maintenance</span>;
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
          {[
            { id: "", label: "All" },
            { id: "available", label: "Available" },
            { id: "occupied", label: "Occupied" },
            { id: "reserved", label: "Reserved" },
            { id: "maintenance", label: "Maintenance" },
          ].map((st) => (
            <button
              key={st.id}
              onClick={() => setStatusFilter(st.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                statusFilter === st.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {st.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs font-semibold text-slate-500">Size:</span>
          <select
            value={sizeFilter}
            onChange={(e) => setSizeFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg outline-none"
          >
            <option value="">All</option>
            <option value="small">Small (≤ 5m²)</option>
            <option value="medium">Medium (5 - 15m²)</option>
            <option value="large">Large (&gt; 15m²)</option>
          </select>

          <button
            onClick={loadUnits}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Storage Units Grid */}
      {loading ? (
        <div className="p-10 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading storage units...
        </div>
      ) : error ? (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      ) : units.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          No units found for current filter.
        </div>
      ) : (
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-2.5">
          {units.map((u) => {
            const isAvail = String(u.physicalStatus).toLowerCase() === "available";
            return (
              <div
                key={u.unitId}
                onClick={() => viewDetail(u.unitId)}
                className={`p-3 rounded-xl border cursor-pointer transition hover:shadow-sm ${
                  isAvail
                    ? "bg-emerald-50/30 border-emerald-200 hover:border-emerald-400"
                    : u.physicalStatus === "occupied"
                    ? "bg-white border-slate-200 hover:border-blue-400"
                    : u.physicalStatus === "reserved"
                    ? "bg-amber-50/30 border-amber-200 hover:border-amber-400"
                    : "bg-rose-50/30 border-rose-200 hover:border-rose-400"
                }`}
              >
                <div className="flex items-center justify-between mb-1">
                  <span className="font-bold text-xs text-slate-900">{u.unitCode}</span>
                  {getStatusBadge(u.physicalStatus)}
                </div>

                <div className="text-[11px] text-slate-600 font-medium">
                  {u.unitTypeName || "Unit"}
                </div>

                <div className="text-[11px] text-slate-500 mt-0.5">
                  {u.areaM2 ? `${u.areaM2} m²` : `${u.widthM}x${u.lengthM}m`}
                </div>

                {u.currentRate ? (
                  <div className="text-[11px] font-semibold text-emerald-700 mt-1">
                    {Number(u.currentRate).toLocaleString("en-US")} ₫/mo
                  </div>
                ) : null}

                {u.customerName ? (
                  <div className="text-[10px] text-blue-700 font-medium mt-1 truncate">
                    {u.customerName}
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      )}

      {/* Unit Detail Modal */}
      {selectedUnit && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 overflow-hidden text-xs">
            <div className="px-5 py-3.5 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-sm text-slate-900">Unit {selectedUnit.unitCode}</h3>
                <p className="text-[11px] text-slate-500">{selectedUnit.facilityName}</p>
              </div>
              <button
                onClick={() => setSelectedUnit(null)}
                className="text-xs font-semibold text-slate-400 hover:text-slate-700 px-2 py-1 rounded"
              >
                Close
              </button>
            </div>

            <div className="p-5 space-y-3">
              <div className="grid grid-cols-2 gap-2 bg-slate-50 p-3 rounded-lg border border-slate-100">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Status</span>
                  <div className="mt-0.5">{getStatusBadge(selectedUnit.physicalStatus)}</div>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Type</span>
                  <span className="font-semibold text-slate-800">{selectedUnit.unitTypeName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Dimensions</span>
                  <span className="text-slate-700">{selectedUnit.lengthM}m x {selectedUnit.widthM}m x {selectedUnit.heightM}m</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase font-semibold block">Area</span>
                  <span className="text-slate-700">{selectedUnit.areaM2} m²</span>
                </div>
              </div>

              <div className="bg-emerald-50/50 border border-emerald-100 p-3 rounded-lg space-y-1">
                <div className="flex justify-between items-center">
                  <span className="text-emerald-800">Monthly Rate:</span>
                  <span className="font-bold text-emerald-700">
                    {Number(selectedUnit.monthlyRate || 0).toLocaleString("en-US")} ₫
                  </span>
                </div>
                <div className="flex justify-between items-center text-emerald-700">
                  <span>Standard Deposit:</span>
                  <span>
                    {Number(selectedUnit.depositAmount || 0).toLocaleString("en-US")} ₫
                  </span>
                </div>
              </div>

              {selectedUnit.currentAgreement ? (
                <div className="p-3 bg-blue-50/50 border border-blue-100 rounded-lg space-y-1 text-[11px]">
                  <span className="font-bold text-blue-900 block">Current Agreement:</span>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Agreement No:</span>
                    <span className="font-semibold">{selectedUnit.currentAgreement.agreementNo}</span>
                  </div>
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Customer:</span>
                    <span className="font-semibold">{selectedUnit.currentAgreement.customerName}</span>
                  </div>
                  {selectedUnit.currentAgreement.customerPhone ? (
                    <div className="flex justify-between text-slate-700">
                      <span className="text-slate-500">Phone:</span>
                      <span>{selectedUnit.currentAgreement.customerPhone}</span>
                    </div>
                  ) : null}
                  <div className="flex justify-between text-slate-700">
                    <span className="text-slate-500">Term:</span>
                    <span>{selectedUnit.currentAgreement.startDate} → {selectedUnit.currentAgreement.endDate}</span>
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 text-center bg-slate-50 p-2.5 rounded-lg border border-dashed border-slate-200">
                  Unit is vacant and ready for walk-in rental.
                </div>
              )}
            </div>

            <div className="px-5 py-2.5 bg-slate-50 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setSelectedUnit(null)}
                className="px-3.5 py-1.5 bg-slate-900 text-white font-medium rounded-lg hover:bg-slate-800"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
