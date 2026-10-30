import { X } from "lucide-react";
import { useEffect, useMemo, useState } from "react";
import managerService from "../api/managerService";
import facilityService from "../api/facilityService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { UNIT_PHYSICAL_STATUS_OPTIONS as STATUS_OPTIONS } from "../constants/managerConstants";
import PAGINATION from "../constants/pagination";

const emptyUnitForm = { unitCode: "", unitTypeId: "", areaId: "", floorLabel: "", zoneLabel: "", physicalStatus: "available", isListed: true, notes: "" };

function mapStatusStyle(status) {
  const key = String(status || "").toLowerCase();
  if (key === "available") return "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-sm";
  if (key === "occupied") return "border-indigo-300 bg-indigo-50 text-indigo-800 shadow-sm";
  if (key === "reserved") return "border-amber-300 bg-amber-50 text-amber-800 shadow-sm";
  return "border-rose-300 bg-rose-50 text-rose-800 shadow-sm";
}

function getStatusBadgeStyle(status) {
  const s = String(status || "").toLowerCase();
  if (s === "available") return "border-emerald-300 bg-emerald-100 text-emerald-800 focus:ring-emerald-400";
  if (s === "occupied") return "border-blue-300 bg-blue-100 text-blue-800 focus:ring-blue-400";
  if (s === "reserved") return "border-amber-300 bg-amber-100 text-amber-800 focus:ring-amber-400";
  return "border-rose-300 bg-rose-100 text-rose-800 focus:ring-rose-400";
}

function getNextUnitCode(existingUnits, zone = "A", floor = "1", offset = 0) {
  const z = (zone || "A").trim().toUpperCase();
  const f = (floor || "1").trim();
  const pattern = new RegExp(`^${z}-${f}(\\d+)$`, "i");
  let maxSeq = 0;
  for (const u of existingUnits || []) {
    const code = (u.unitCode || "").trim();
    const match = code.match(pattern);
    if (match) {
      const num = parseInt(match[1], 10);
      if (!isNaN(num) && num > maxSeq) {
        maxSeq = num;
      }
    }
  }

  const nextSeq = maxSeq > 0 ? maxSeq + 1 + offset : 1 + offset;
  const padded = nextSeq < 10 ? `0${nextSeq}` : `${nextSeq}`;
  return `${z}-${f}${padded}`;
}

function ManagerUnits() {
  const { facilityId, loading: facilityLoading } = useManagerFacility();
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
    if (!facilityId) {
      if (!facilityLoading) setLoadingUnits(false);
      return;
    }
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
    if (!facilityId) {
      if (!facilityLoading) setLoadingLayout(false);
      return;
    }
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
  useEffect(() => {
    if (!facilityLoading && !facilityId) { setLoadingUnits(false); } else if (facilityId) { loadUnits(); }
  }, [facilityId, statusFilter, facilityLoading]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!facilityLoading && !facilityId) { setLoadingLayout(false); } else if (facilityId) { loadLayout(); }
  }, [facilityId, facilityLoading]);

  const [bulkCount, setBulkCount] = useState(1);
  const [updatingUnitId, setUpdatingUnitId] = useState(null);

  async function handleQuickStatusChange(unit, nextStatus) {
    if (unit.physicalStatus === nextStatus) return;
    setUpdatingUnitId(unit.id);
    const prevStatus = unit.physicalStatus;
    // Optimistic local state update
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, physicalStatus: nextStatus } : u))
    );
    try {
      await managerService.updateUnit(unit.id, { physicalStatus: nextStatus });
      setNotice(`Unit ${unit.unitCode} status changed to ${nextStatus}.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      // Revert optimistic update
      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, physicalStatus: prevStatus } : u))
      );
      setError(err?.message || "Failed to update unit status.");
    } finally {
      setUpdatingUnitId(null);
    }
  }

  async function handleToggleListed(unit) {
    setUpdatingUnitId(unit.id);
    const nextVal = !unit.isListed;
    // Optimistic local state update
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, isListed: nextVal } : u))
    );
    try {
      await managerService.updateUnit(unit.id, { isListed: nextVal });
      setNotice(`Unit ${unit.unitCode} is now ${nextVal ? "Listed" : "Unlisted"}.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      // Revert
      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, isListed: !nextVal } : u))
      );
      setError(err?.message || "Failed to update listing status.");
    } finally {
      setUpdatingUnitId(null);
    }
  }

  function handleSelectZone(zone) {
    setUnitForm((prev) => {
      const floor = prev.floorLabel || "1";
      const nextCode = getNextUnitCode(units, zone, floor, 0);
      return { ...prev, zoneLabel: zone, unitCode: nextCode };
    });
  }

  function handleSelectFloor(floor) {
    setUnitForm((prev) => {
      const zone = prev.zoneLabel || "A";
      const nextCode = getNextUnitCode(units, zone, floor, 0);
      return { ...prev, floorLabel: floor, unitCode: nextCode };
    });
  }

  function openCreateUnit() {
    setEditingUnitId(null);
    setBulkCount(1);
    const initialZone = "A";
    const initialFloor = "1";
    const initialCode = getNextUnitCode(units, initialZone, initialFloor, 0);
    const defaultTypeId = unitTypes[0]?.id ? String(unitTypes[0].id) : "";
    setUnitForm({
      unitCode: initialCode,
      unitTypeId: defaultTypeId,
      areaId: "",
      floorLabel: initialFloor,
      zoneLabel: initialZone,
      physicalStatus: "available",
      isListed: true,
      notes: "",
    });
    setShowUnitForm(true);
  }

  function openEditUnit(unit) {
    setEditingUnitId(unit.id);
    setBulkCount(1);
    setUnitForm({
      unitCode: unit.unitCode || "",
      unitTypeId: String(unit.unitTypeId || ""),
      areaId: unit.areaId ? String(unit.areaId) : "",
      floorLabel: unit.floorLabel || "1",
      zoneLabel: unit.zoneLabel || "A",
      physicalStatus: unit.physicalStatus || "available",
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
      const basePayload = {
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

      if (editingUnitId) {
        await managerService.updateUnit(editingUnitId, {
          ...basePayload,
          unitCode: unitForm.unitCode,
        });
        setNotice(`Unit ${unitForm.unitCode} updated successfully.`);
      } else {
        const count = Math.max(1, Number(bulkCount) || 1);
        const createdCodes = [];
        for (let i = 0; i < count; i++) {
          const code =
            count === 1
              ? unitForm.unitCode
              : getNextUnitCode(units, unitForm.zoneLabel || "A", unitForm.floorLabel || "1", i);
          await managerService.createUnit(facilityId, {
            ...basePayload,
            unitCode: code,
          });
          createdCodes.push(code);
        }
        setNotice(
          count === 1
            ? `New unit ${createdCodes[0]} added successfully.`
            : `Successfully created ${count} units (${createdCodes[0]} to ${createdCodes[createdCodes.length - 1]}).`
        );
      }
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

  const areaNameById = useMemo(() => {
    const map = {};
    (layout?.areas ?? []).forEach((area) => {
      map[area.areaId] = area.name || area.code;
    });
    return map;
  }, [layout]);

  const zoneAreas = useMemo(() => {
    const rawZones = (layout?.areas ?? []).filter(
      (a) => a.areaType === "zone" || (a.code && a.code.toUpperCase().includes("-Z"))
    );

    const za = rawZones.find((z) => (z.code || "").toUpperCase() === "F1-ZA");
    const zb = rawZones.find((z) => (z.code || "").toUpperCase() === "F1-ZB");
    const f2za = rawZones.find((z) => (z.code || "").toUpperCase() === "F2-ZA");

    return [
      za || { areaId: 3, code: "F1-ZA", name: "Floor 1 - Zone A" },
      zb || { areaId: 4, code: "F1-ZB", name: "Floor 1 - Zone B" },
      f2za || { areaId: 42, code: "F2-ZA", name: "Floor 2 - Zone A" },
    ];
  }, [layout]);

  const mapPositions = useMemo(() => {
    if (layout?.unitPositions?.length) return layout.unitPositions;
    return units.map((unit, index) => {
      const isB = (unit.unitCode || "").toUpperCase().startsWith("B");
      const targetAreaId = isB ? (zoneAreas[1]?.areaId || 4) : (zoneAreas[0]?.areaId || 3);
      return {
        unitId: unit.id,
        unitCode: unit.unitCode,
        areaId: unit.areaId || targetAreaId,
        x: 10 + (index % 4) * 26,
        y: 10 + Math.floor(index / 4) * 28,
        width: 18,
        height: 18,
        rotationDegrees: 0,
        physicalStatus: unit.physicalStatus,
      };
    });
  }, [layout, units, zoneAreas]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold">Units &amp; Floor Plan</h1>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setTab("units")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              tab === "units"
                ? "bg-white text-slate-900 font-semibold shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Unit List
          </button>
          <button
            type="button"
            onClick={() => setTab("layout")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all ${
              tab === "layout"
                ? "bg-white text-slate-900 font-semibold shadow-sm"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            Floor Plan
          </button>
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
                  <th className="px-4 py-2.5 w-[18%]">Unit Code</th>
                  <th className="px-4 py-2.5 w-[22%]">Type</th>
                  <th className="px-4 py-2.5 w-[16%]">Zone / Floor</th>
                  <th className="px-4 py-2.5 w-[20%]">Status</th>
                  <th className="px-4 py-2.5 w-[14%]">Listed</th>
                  <th className="px-4 py-2.5 w-[10%] text-right">Actions</th>
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
                      <td className="px-4 py-2.5 text-slate-600">
                        <span className="font-semibold text-slate-800">{unit.zoneLabel || "A"}</span> / Floor {unit.floorLabel || "1"}
                      </td>
                      <td className="px-4 py-2.5">
                        <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
                          unit.physicalStatus === "available"
                            ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                            : unit.physicalStatus === "occupied"
                            ? "bg-indigo-50 text-indigo-700 border-indigo-200"
                            : unit.physicalStatus === "reserved"
                            ? "bg-amber-50 text-amber-700 border-amber-200"
                            : "bg-rose-50 text-rose-700 border-rose-200"
                        }`}>
                          <span className={`h-1.5 w-1.5 rounded-full ${
                            unit.physicalStatus === "available"
                              ? "bg-emerald-500"
                              : unit.physicalStatus === "occupied"
                              ? "bg-indigo-500"
                              : unit.physicalStatus === "reserved"
                              ? "bg-amber-500"
                              : "bg-rose-500"
                          }`} />
                          {unit.physicalStatus === "available"
                            ? "Available"
                            : unit.physicalStatus === "occupied"
                            ? "Occupied"
                            : unit.physicalStatus === "reserved"
                            ? "Reserved"
                            : unit.physicalStatus === "maintenance"
                            ? "Maintenance"
                            : unit.physicalStatus === "cleaning"
                            ? "Cleaning"
                            : unit.physicalStatus}
                        </span>
                      </td>
                      <td className="px-4 py-2.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={unit.isListed}
                          disabled={updatingUnitId === unit.id}
                          onClick={() => handleToggleListed(unit)}
                          className={`relative inline-flex h-5 w-9 flex-shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                            unit.isListed ? "bg-[#2563eb]" : "bg-slate-300"
                          }`}
                          title={unit.isListed ? "Publicly listed on store (click to unlist)" : "Unlisted (click to list)"}
                        >
                          <span
                            className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                              unit.isListed ? "translate-x-4" : "translate-x-0"
                            }`}
                          />
                        </button>
                      </td>
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
                <div className="relative min-h-[460px] min-w-[780px] overflow-hidden rounded-xl border border-white/80 bg-[linear-gradient(rgba(65,103,146,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(65,103,146,0.12)_1px,transparent_1px)] bg-[size:32px_32px]">
                  {/* Top Header Badge */}
                  <div className="absolute left-5 top-3.5 z-20 rounded-lg bg-slate-900/90 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-md flex items-center gap-1.5">
                    {layout.facilityName} · FLOOR PLAN
                  </div>

                  {/* Subtle Clean Legend (8px color dots + #475569 text, no pill background) */}
                  <div className="absolute bottom-3.5 left-5 z-20 flex items-center gap-4 text-[10px] font-medium text-[#475569] bg-white/70 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/60 shadow-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-emerald-500 shadow-xs" />
                      <span>Available</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-indigo-500 shadow-xs" />
                      <span>Occupied</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-amber-500 shadow-xs" />
                      <span>Reserved</span>
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2 w-2 rounded-full bg-rose-500 shadow-xs" />
                      <span>Maintenance</span>
                    </span>
                  </div>

                  {/* Exactly 3 Zone Containers: F1-ZA, F1-ZB, F2-ZA */}
                  {zoneAreas.map((area, areaIdx) => {
                    const zoneCode = (area.code || "").toUpperCase();
                    const zoneUnits = mapPositions.filter((pos) => {
                      if (area.areaId && pos.areaId && Number(area.areaId) === Number(pos.areaId)) return true;
                      const uCode = (pos.unitCode || "").toUpperCase();
                      if (zoneCode === "F1-ZA") {
                        return /^A-?1\d+/.test(uCode) || (uCode.startsWith("A-") && !uCode.startsWith("A-2"));
                      }
                      if (zoneCode === "F1-ZB") {
                        return /^B-?1\d+/.test(uCode) || uCode.startsWith("B-");
                      }
                      if (zoneCode === "F2-ZA") {
                        return /^A-?2\d+/.test(uCode);
                      }
                      return false;
                    });

                    return (
                      <div
                        key={area.areaId || area.code}
                        className="absolute top-14 rounded-xl border border-dashed border-[#7896ba]/60 bg-white/35 shadow-xs"
                        style={{
                          left: `${3 + areaIdx * 32.5}%`,
                          width: "31%",
                          height: "76%",
                        }}
                      >
                        {/* Zone Header Label */}
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#7896ba]/20 bg-white/40 rounded-t-xl text-[10px] font-bold text-[#35506e]">
                          <span>{area.code} · {area.name}</span>
                          <span className="text-[9px] font-medium text-slate-500">{zoneUnits.length} units</span>
                        </div>

                        {/* Relative Canvas inside this Zone */}
                        <div className="relative w-full h-[calc(100%-28px)] overflow-visible">
                          {zoneUnits.map((pos, uIdx) => {
                            const selected = selectedMapUnitId === pos.unitId;
                            // Scale factor: 2.2 allows units to spread gracefully across the zone canvas
                            const scale = 2.2;
                            const left = (Number(pos.x) || (10 + (uIdx % 3) * 32)) * scale;
                            const top = (Number(pos.y) || (10 + Math.floor(uIdx / 3) * 28)) * scale;
                            // Proportional Width & Height (scaled by unit dimensions)
                            const rawW = Number(pos.width) > 0 ? Number(pos.width) : 18;
                            const rawH = Number(pos.height) > 0 ? Number(pos.height) : 18;
                            const width = Math.max(Math.round(rawW * scale), 32);
                            const height = Math.max(Math.round(rawH * scale), 26);

                            return (
                              <button
                                key={pos.unitId}
                                type="button"
                                onClick={() => setSelectedMapUnitId(pos.unitId)}
                                title={`${pos.unitCode} (${rawW}x${rawH}) · ${pos.physicalStatus}`}
                                className={`absolute flex items-center justify-center rounded-md border text-[10px] font-bold tracking-tight transition duration-150 hover:-translate-y-0.5 hover:shadow-md ${mapStatusStyle(pos.physicalStatus)} ${
                                  selected ? "ring-2 ring-[#2563eb] shadow-md -translate-y-0.5 z-20" : "z-10 shadow-xs"
                                }`}
                                style={{
                                  left: `${left}px`,
                                  top: `${top}px`,
                                  width: `${width}px`,
                                  height: `${height}px`,
                                  transform: `rotate(${Number(pos.rotationDegrees) || 0}deg)`,
                                  padding: "0 2px",
                                }}
                              >
                                <span className="truncate">{pos.unitCode}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
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
                      <td className="py-2 pr-2 font-semibold text-slate-800">{pos.unitCode}</td>
                      <td className="py-2 pr-2 text-[#58657a]">
                        {areaNameById[pos.areaId] ||
                          (pos.unitCode?.startsWith("A")
                            ? "Floor 1 - Zone A"
                            : pos.unitCode?.startsWith("B")
                            ? "Floor 1 - Zone B"
                            : "Floor 2 - Zone A")}
                      </td>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <form onSubmit={submitUnit}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3.5 mb-4">
                <div>
                  <h2 className="text-base font-bold text-slate-900">
                    {editingUnitId ? "Edit Storage Unit" : "Add New Storage Unit"}
                  </h2>
                  {!editingUnitId && (
                    <p className="text-[11px] text-slate-500">
                      Smart auto-generated code and bulk creation
                    </p>
                  )}
                </div>
                <button
                  type="button"
                  onClick={() => setShowUnitForm(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

            <div className="mt-4 space-y-4">
              {/* Segmented Selector for Zone */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Zone <span className="text-blue-600 font-normal">· 1-Click Select</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["A", "B", "C"].map((z) => {
                    const isSelected = (unitForm.zoneLabel || "A") === z;
                    return (
                      <button
                        key={z}
                        type="button"
                        onClick={() => handleSelectZone(z)}
                        className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-200"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Zone {z}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Segmented Selector for Floor */}
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Floor <span className="text-blue-600 font-normal">· 1-Click Select</span>
                </label>
                <div className="grid grid-cols-3 gap-2">
                  {["1", "2", "3"].map((f) => {
                    const isSelected = (unitForm.floorLabel || "1") === f;
                    return (
                      <button
                        key={f}
                        type="button"
                        onClick={() => handleSelectFloor(f)}
                        className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                          isSelected
                            ? "border-blue-600 bg-blue-50 text-blue-700 shadow-sm ring-2 ring-blue-200"
                            : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                        }`}
                      >
                        Tầng {f}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Unit Code (Smart Auto-Generated) */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Mã kho (Unit Code) *
                  </label>
                  <input
                    required
                    value={unitForm.unitCode}
                    onChange={(e) => setUnitForm((p) => ({ ...p, unitCode: e.target.value.toUpperCase() }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs font-mono font-bold text-slate-900 focus:outline-none focus:border-blue-500"
                    placeholder="e.g. A-111"
                  />
                  <p className="mt-1 text-[10px] text-emerald-600 font-semibold">
                    ✓ Tự sinh mã tiếp theo trong Zone {unitForm.zoneLabel || "A"} (Tầng {unitForm.floorLabel || "1"})
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Loại kho (Unit Type) *
                  </label>
                  <select
                    required
                    value={unitForm.unitTypeId}
                    onChange={(e) => setUnitForm((p) => ({ ...p, unitTypeId: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    <option value="" disabled>Select unit type</option>
                    {unitTypes.map((type) => (
                      <option key={type.id} value={type.id}>
                        {type.code} — {type.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Bulk Creation Selector (Only in Create Mode) */}
              {!editingUnitId && (
                <div className="rounded-xl border border-blue-100 bg-blue-50/50 p-3">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-800">
                      Tạo nhanh hàng loạt (Bulk Create Units)
                    </span>
                    <span className="text-[11px] text-blue-600 font-semibold">
                      Tạo liên tiếp 1 chạm
                    </span>
                  </div>
                  <div className="grid grid-cols-3 gap-2">
                    {[1, 5, 10].map((num) => (
                      <button
                        key={num}
                        type="button"
                        onClick={() => setBulkCount(num)}
                        className={`rounded-lg border py-1.5 text-xs font-bold transition-all ${
                          bulkCount === num
                            ? "border-blue-600 bg-blue-600 text-white shadow-sm"
                            : "border-slate-200 bg-white text-slate-700 hover:bg-slate-50"
                        }`}
                      >
                        {num === 1 ? "1 kho" : `${num} kho`}
                      </button>
                    ))}
                  </div>
                  {bulkCount > 1 && (
                    <p className="mt-2 text-[11px] text-blue-700 font-medium">
                      ⚡ Sẽ tự sinh {bulkCount} kho liên tiếp:{" "}
                      <span className="font-mono font-bold">
                        {Array.from({ length: Math.min(bulkCount, 4) })
                          .map((_, i) =>
                            getNextUnitCode(units, unitForm.zoneLabel || "A", unitForm.floorLabel || "1", i)
                          )
                          .join(", ")}
                        {bulkCount > 4 ? "..." : ""}
                      </span>
                    </p>
                  )}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Trạng thái ban đầu
                  </label>
                  <select
                    value={unitForm.physicalStatus}
                    onChange={(e) => setUnitForm((p) => ({ ...p, physicalStatus: e.target.value }))}
                    className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                  >
                    {STATUS_OPTIONS.map(([value, label]) => (
                      <option key={value} value={value}>{label}</option>
                    ))}
                  </select>
                </div>

                <div className="flex items-center pt-5">
                  <label className="flex items-center gap-2 cursor-pointer text-xs font-semibold text-slate-700">
                    <input
                      type="checkbox"
                      checked={unitForm.isListed}
                      onChange={(e) => setUnitForm((p) => ({ ...p, isListed: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    Publicly listed for customer booking (Listed)
                  </label>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Ghi chú (Notes)
                </label>
                <input
                  value={unitForm.notes}
                  onChange={(e) => setUnitForm((p) => ({ ...p, notes: e.target.value }))}
                  placeholder="Ghi chú vị trí, gần cửa sổ / thang máy..."
                  className="w-full rounded-lg border border-slate-200 px-3 py-2 text-xs text-slate-800 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>

            <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                onClick={() => setShowUnitForm(false)}
                className="rounded-lg border border-slate-200 bg-white px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Hủy bỏ
              </button>
              <button
                type="submit"
                disabled={savingUnit}
                className="rounded-lg bg-blue-600 px-4 py-2 text-xs font-bold text-white hover:bg-blue-700 shadow-sm transition disabled:opacity-50"
              >
                {savingUnit
                  ? "Đang lưu..."
                  : editingUnitId
                  ? "Cập nhật kho"
                  : bulkCount > 1
                  ? `Lưu ${bulkCount} kho hàng loạt`
                  : "Tạo ô kho"}
              </button>
            </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

export default ManagerUnits;
