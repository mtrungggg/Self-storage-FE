import { useEffect, useMemo, useState } from "react";
import managerService from "../api/managerService";
import facilityService from "../api/facilityService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { UNIT_PHYSICAL_STATUS_OPTIONS as STATUS_OPTIONS } from "../constants/managerConstants";
import PAGINATION from "../constants/pagination";

const emptyUnitForm = { unitCode: "", unitTypeId: "", areaId: "", floorLabel: "", zoneLabel: "", physicalStatus: "under_inspection", isListed: true, notes: "" };

function mapStatusStyle(status) {
  const key = String(status || "").toLowerCase();
  if (key === "available") return "border-emerald-300 bg-emerald-100 text-emerald-800 shadow-[0_7px_0_#79c99d]";
  if (key === "occupied") return "border-blue-300 bg-blue-100 text-blue-800 shadow-[0_7px_0_#8eb5e9]";
  if (key === "reserved") return "border-amber-300 bg-amber-100 text-amber-800 shadow-[0_7px_0_#dfbc68]";
  return "border-rose-300 bg-rose-100 text-rose-800 shadow-[0_7px_0_#e8a0a0]";
}

function ManagerUnits() {
  const { facilityId } = useManagerFacility();
  const [tab, setTab] = useState("units");

  // --- Units tab state ---
  const [units, setUnits] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [unitForm, setUnitForm] = useState(emptyUnitForm);
  const [editingUnitId, setEditingUnitId] = useState(null);
  const [savingUnit, setSavingUnit] = useState(false);

  // --- Map layout tab state ---
  const [layout, setLayout] = useState(null);
  const [loadingLayout, setLoadingLayout] = useState(true);
  const [savingLayout, setSavingLayout] = useState(false);
  const [selectedMapUnitId, setSelectedMapUnitId] = useState(null);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    facilityService.getUnitTypes().then(setUnitTypes).catch(() => setUnitTypes([]));
  }, []);

  async function loadUnits() {
    if (!facilityId) return;
    setLoadingUnits(true);
    setError("");
    try {
      const page = await managerService.getUnits(facilityId, { status: statusFilter || undefined, search: search || undefined, pageSize: PAGINATION.MAX_PAGE_SIZE });
      setUnits(page?.items ?? []);
    } catch (err) {
      setError(err?.message || "Failed to load units list.");
    } finally {
      setLoadingUnits(false);
    }
  }

  async function loadLayout() {
    if (!facilityId) return;
    setLoadingLayout(true);
    setError("");
    try {
      setLayout(await managerService.getMapLayout(facilityId));
    } catch (err) {
      setError(err?.message || "Failed to load floor plan layout.");
    } finally {
      setLoadingLayout(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadUnits(); }, [facilityId, statusFilter]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { loadLayout(); }, [facilityId]);

  function openCreateUnit() {
    setEditingUnitId(null);
    setUnitForm(emptyUnitForm);
    setShowUnitForm(true);
  }

  function openEditUnit(unit) {
    setEditingUnitId(unit.id);
    setUnitForm({
      unitCode: unit.unitCode || "",
      unitTypeId: String(unit.unitTypeId || ""),
      areaId: unit.areaId ? String(unit.areaId) : "",
      floorLabel: unit.floorLabel || "",
      zoneLabel: unit.zoneLabel || "",
      physicalStatus: unit.physicalStatus || "under_inspection",
      isListed: unit.isListed,
      notes: unit.notes || "",
    });
    setShowUnitForm(true);
  }

  async function submitUnit(event) {
    event.preventDefault();
    setSavingUnit(true);
    setError("");
    try {
      const payload = {
        unitCode: unitForm.unitCode,
        unitTypeId: Number(unitForm.unitTypeId),
        areaId: unitForm.areaId ? Number(unitForm.areaId) : undefined,
        floorLabel: unitForm.floorLabel || undefined,
        zoneLabel: unitForm.zoneLabel || undefined,
        physicalStatus:
          unitForm.physicalStatus === "under_inspection"
            ? "pending_inspection"
            : unitForm.physicalStatus,
        isListed: unitForm.isListed,
        notes: unitForm.notes || undefined,
      };
      if (editingUnitId) await managerService.updateUnit(editingUnitId, payload);
      else await managerService.createUnit(facilityId, payload);
      setNotice(editingUnitId ? "Unit updated successfully." : "New unit added successfully.");
      setShowUnitForm(false);
      await loadUnits();
    } catch (err) {
      setError(err?.message || "Failed to save unit.");
    } finally {
      setSavingUnit(false);
    }
  }

  function updatePosition(unitId, field, value) {
    setLayout((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        unitPositions: prev.unitPositions.map((pos) =>
          pos.unitId === unitId ? { ...pos, [field]: Number(value) || 0 } : pos
        ),
      };
    });
  }

  async function saveLayout() {
    if (!layout) return;
    setSavingLayout(true);
    setError("");
    try {
      await managerService.updateMapLayout(facilityId, layout.unitPositions);
      setNotice("Floor plan layout saved successfully.");
      await loadLayout();
    } catch (err) {
      setError(err?.message || "Failed to save floor plan layout.");
    } finally {
      setSavingLayout(false);
    }
  }

  const areaNameById = useMemo(() => Object.fromEntries((layout?.areas ?? []).map((area) => [area.areaId, area.name])), [layout]);
  const mapPositions = useMemo(() => {
    if (layout?.unitPositions?.length) return layout.unitPositions;
    return units.map((unit, index) => ({
      unitId: unit.id,
      unitCode: unit.unitCode,
      areaId: unit.areaId || layout?.areas?.[0]?.areaId || 0,
      x: 7 + (index % 8) * 11,
      y: 22 + Math.floor(index / 8) * 19,
      width: 74,
      height: 42,
      rotationDegrees: 0,
      physicalStatus: unit.physicalStatus,
    }));
  }, [layout, units]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold">Units &amp; Floor Plan</h1>
        <div className="flex gap-2">
          <button type="button" onClick={() => setTab("units")} className={`rounded-[8px] px-3 py-1.5 text-[11px] font-bold ${tab === "units" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"}`}>Unit List</button>
          <button type="button" onClick={() => setTab("layout")} className={`rounded-[8px] px-3 py-1.5 text-[11px] font-bold ${tab === "layout" ? "bg-[#1d5fe5] text-white" : "border border-[#dfe7f5] text-[#3a475a]"}`}>Floor Plan</button>
        </div>
      </div>

      {notice && <p role="status" className="mt-3 rounded-[8px] bg-[#e7f8ee] px-3 py-2 text-[10px] font-semibold text-[#0e7b4c]">{notice}</p>}
      {error && <p role="alert" className="mt-3 rounded-[8px] bg-[#fdecec] px-3 py-2 text-[10px] font-semibold text-[#c0362c]">{error}</p>}

      {tab === "units" && (
        <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <input value={search} onChange={(e) => setSearch(e.target.value)} onBlur={loadUnits} placeholder="Search unit code..." className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px]" />
              <select value={statusFilter} onChange={(e) => setStatusFilter(e.target.value)} className="rounded-[8px] border border-[#dfe7f5] px-2.5 py-1.5 text-[11px]">
                <option value="">All Statuses</option>
                {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
              </select>
            </div>
            <button type="button" onClick={openCreateUnit} className="rounded-md bg-[#1d5fe5] px-3 py-1.5 text-xs font-semibold text-white transition hover:bg-[#154ec2]">
              Add Unit
            </button>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2.5 w-[20%]">Unit Code</th>
                  <th className="px-4 py-2.5 w-[22%]">Type</th>
                  <th className="px-4 py-2.5 w-[20%]">Zone / Floor</th>
                  <th className="px-4 py-2.5 w-[16%]">Status</th>
                  <th className="px-4 py-2.5 w-[10%]">Listed</th>
                  <th className="px-4 py-2.5 w-[12%] text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingUnits ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">Loading units...</td></tr>
                ) : units.length === 0 ? (
                  <tr><td colSpan={6} className="py-6 text-center text-slate-400">No units found.</td></tr>
                ) : (
                  units.map((unit) => (
                    <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5 font-semibold text-slate-900">{unit.unitCode}</td>
                      <td className="px-4 py-2.5 text-slate-600">{unit.unitTypeName}</td>
                      <td className="px-4 py-2.5 text-slate-600">{unit.zoneLabel || "—"} / {unit.floorLabel || "—"}</td>
                      <td className="px-4 py-2.5 font-medium text-slate-800">{STATUS_OPTIONS.find(([value]) => value === unit.physicalStatus)?.[1] || unit.physicalStatus}</td>
                      <td className="px-4 py-2.5 text-slate-600">{unit.isListed ? "Yes" : "No"}</td>
                      <td className="px-4 py-2.5 text-right">
                        <button type="button" onClick={() => openEditUnit(unit)} className="rounded border border-slate-300 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition">Edit</button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {tab === "layout" && (
        <div className="mt-4 rounded-[16px] border border-[#dfe7f5] bg-white p-4 shadow-[0_10px_26px_rgba(15,23,42,0.03)]">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-[10px] text-[#8996a9]">Select a unit on the map to inspect coordinates; values below can be adjusted manually.</p>
            <button type="button" disabled={savingLayout || !layout} onClick={saveLayout} className="rounded-[8px] bg-[#1d5fe5] px-3 py-1.5 text-[11px] font-bold text-white disabled:opacity-60">
              {savingLayout ? "Saving..." : "Save Layout"}
            </button>
          </div>
          {loadingLayout ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#dfe7f5] p-10 text-center text-[11px] text-[#8996a9]">Rendering floor plan...</div>
          ) : mapPositions.length === 0 ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#dfe7f5] p-10 text-center text-[11px] text-[#8996a9]">No unit positions configured for this floor plan.</div>
          ) : (
            <>
              <div className="mt-4 overflow-x-auto rounded-2xl border border-[#c9d9ef] bg-[radial-gradient(circle_at_20%_10%,#eff7ff,transparent_38%),linear-gradient(145deg,#cbdcf0,#eaf2fb_45%,#d7e4f3)] p-4 shadow-inner">
                <div className="relative min-h-[440px] min-w-[760px] overflow-hidden rounded-xl border border-white/80 bg-[linear-gradient(rgba(65,103,146,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(65,103,146,0.12)_1px,transparent_1px)] bg-[size:32px_32px] [perspective:1000px]">
                  <div className="absolute left-5 top-4 rounded-lg bg-slate-900/85 px-3 py-2 text-[10px] font-bold text-white shadow-lg">{layout.facilityName} · FLOORPLAN</div>
                  <div className="absolute bottom-4 left-5 flex gap-2 text-[9px] font-bold"><span className="rounded bg-emerald-100 px-2 py-1 text-emerald-700">Available</span><span className="rounded bg-blue-100 px-2 py-1 text-blue-700">Occupied</span><span className="rounded bg-amber-100 px-2 py-1 text-amber-700">Reserved</span></div>
                  {layout.areas.map((area, index) => <div key={area.areaId} className="absolute top-16 rounded-xl border border-dashed border-[#7896ba]/50 bg-white/25 px-3 py-2 text-[10px] font-bold text-[#476584]" style={{ left: `${4 + (index % 3) * 32}%`, width: "29%", height: "78%" }}>{area.code || area.name}</div>)}
                  {mapPositions.map((pos, index) => {
                    const selected = selectedMapUnitId === pos.unitId;
                    const left = Number(pos.x) || 7 + (index % 8) * 11;
                    const top = Number(pos.y) || 22 + Math.floor(index / 8) * 19;
                    const width = Math.max(Number(pos.width) || 74, 54);
                    const height = Math.max(Number(pos.height) || 42, 34);
                    return <button key={pos.unitId} type="button" onClick={() => setSelectedMapUnitId(pos.unitId)} title={`${pos.unitCode} · ${pos.physicalStatus}`} className={`absolute flex items-center justify-center rounded-md border text-[10px] font-extrabold transition duration-200 hover:-translate-y-1 hover:brightness-105 ${mapStatusStyle(pos.physicalStatus)} ${selected ? "ring-4 ring-[#1d5fe5]/30 -translate-y-1" : ""}`} style={{ left, top, width, height, transform: `rotate(${Number(pos.rotationDegrees) || 0}deg) skewY(-5deg)` }}>{pos.unitCode}</button>;
                  })}
                </div>
              </div>
              {selectedMapUnitId && <p className="mt-2 text-[10px] font-semibold text-[#1d5fe5]">Selected: {mapPositions.find((position) => position.unitId === selectedMapUnitId)?.unitCode}</p>}
            </>
          )}
          <div className="mt-3 overflow-x-auto">
            <table className="w-full min-w-[720px] text-left text-[11px]">
              <thead>
                <tr className="border-b border-[#eef1f8] text-[9px] font-bold uppercase tracking-[0.04em] text-[#8996a9]">
                  <th className="py-2 pr-2">Unit Code</th>
                  <th className="py-2 pr-2">Zone</th>
                  <th className="py-2 pr-2 text-right">X</th>
                  <th className="py-2 pr-2 text-right">Y</th>
                  <th className="py-2 pr-2 text-right">Width</th>
                  <th className="py-2 pr-2 text-right">Height</th>
                  <th className="py-2 pr-2 text-right">Rotation</th>
                </tr>
              </thead>
              <tbody>
                {loadingLayout ? (
                  <tr><td colSpan={7} className="py-4 text-center text-[#8996a9]">Loading layout...</td></tr>
                ) : !layout?.unitPositions?.length ? (
                  <tr><td colSpan={7} className="py-4 text-center text-[#8996a9]">No positions established yet.</td></tr>
                ) : (
                  layout.unitPositions.map((pos) => (
                    <tr key={pos.unitId} className="border-b border-[#f2f5fb]">
                      <td className="py-2 pr-2 font-semibold">{pos.unitCode}</td>
                      <td className="py-2 pr-2 text-[#58657a]">{areaNameById[pos.areaId] || "—"}</td>
                      {["x", "y", "width", "height", "rotationDegrees"].map((field) => (
                        <td key={field} className="py-2 pr-2 text-right">
                          <input
                            type="number"
                            value={pos[field]}
                            onChange={(e) => updatePosition(pos.unitId, field, e.target.value)}
                            className="w-20 rounded-[6px] border border-[#dfe7f5] px-1.5 py-1 text-right text-[11px]"
                          />
                        </td>
                      ))}
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {showUnitForm && (
        <dialog open className="fixed inset-0 m-auto w-[calc(100%-2rem)] max-w-lg rounded-[16px] border border-[#dfe7f5] bg-white p-5 shadow-xl backdrop:bg-black/40">
          <form onSubmit={submitUnit}>
            <div className="flex items-center justify-between">
              <h2 className="text-[14px] font-bold">{editingUnitId ? "Edit Storage Unit" : "Add New Storage Unit"}</h2>
              <button type="button" onClick={() => setShowUnitForm(false)} className="text-[11px] font-semibold text-[#58657a] underline">Close</button>
            </div>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Unit Code *
                <input required value={unitForm.unitCode} onChange={(e) => setUnitForm((p) => ({ ...p, unitCode: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Unit Type *
                <select required value={unitForm.unitTypeId} onChange={(e) => setUnitForm((p) => ({ ...p, unitTypeId: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]">
                  <option value="" disabled>Select unit type</option>
                  {unitTypes.map((type) => <option key={type.id} value={type.id}>{type.code} — {type.name}</option>)}
                </select>
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Floor
                <input value={unitForm.floorLabel} onChange={(e) => setUnitForm((p) => ({ ...p, floorLabel: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Zone
                <input value={unitForm.zoneLabel} onChange={(e) => setUnitForm((p) => ({ ...p, zoneLabel: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a]">
                Status
                <select value={unitForm.physicalStatus} onChange={(e) => setUnitForm((p) => ({ ...p, physicalStatus: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]">
                  {STATUS_OPTIONS.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                </select>
              </label>
              <label className="flex items-center gap-2 text-[10px] font-semibold text-[#3a475a]">
                <input type="checkbox" checked={unitForm.isListed} onChange={(e) => setUnitForm((p) => ({ ...p, isListed: e.target.checked }))} className="h-3.5 w-3.5 accent-[#1d5fe5]" />
                List publicly for customer booking
              </label>
              <label className="flex flex-col gap-1 text-[10px] font-semibold text-[#3a475a] sm:col-span-2">
                Notes
                <input value={unitForm.notes} onChange={(e) => setUnitForm((p) => ({ ...p, notes: e.target.value }))} className="rounded-[6px] border border-[#dfe7f5] px-2 py-1.5 text-[11px]" />
              </label>
            </div>
            <button type="submit" disabled={savingUnit} className="mt-4 w-full rounded-[8px] bg-[#1d5fe5] py-2 text-[11px] font-bold text-white disabled:opacity-60">
              {savingUnit ? "Saving..." : "Save Unit"}
            </button>
          </form>
        </dialog>
      )}
    </>
  );
}

export default ManagerUnits;
