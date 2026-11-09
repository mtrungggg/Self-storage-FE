import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { X, Trash2, GripVertical, Check, Image as ImageIcon, Upload } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import managerService from "../api/managerService";
import facilityService from "../api/facilityService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { UNIT_PHYSICAL_STATUS_OPTIONS as STATUS_OPTIONS } from "../constants/managerConstants";
import PAGINATION from "../constants/pagination";

const emptyUnitForm = {
  unitCode: "",
  unitTypeId: "",
  areaId: "",
  floorLabel: "1",
  zoneLabel: "A",
  physicalStatus: "available",
  isListed: true,
  notes: "",
  imageUrl: "",
};


const STORAGE_TYPES = [
  { id: "DRY", label: "Kho hàng khô (Dry)" },
  { id: "SEAFOOD", label: "Kho đông lạnh / Hải sản (Cold/Seafood)" },
  { id: "WARM", label: "Kho sưởi ấm (Heated Warm)" },
  { id: "CLIMATE", label: "Kho kiểm soát nhiệt độ (Climate)" },
  { id: "LOCKER", label: "Tủ khóa thông minh (Smart Locker)" },
];

const UNIT_SIZES = [
  { id: "MINI", label: "Mini (1m x 1m - 1m²)" },
  { id: "S", label: "Nhỏ - S (1.5m x 2m - 3m²)" },
  { id: "M", label: "Vừa - M (2m x 3m - 6m²)" },
  { id: "L", label: "Lớn - L (3m x 4m - 10-12m²)" },
  { id: "XL", label: "Cực lớn - XL (4m x 4m - 16-20m²)" },
];

function parseTypeAndSizeFromUnitType(typeObj) {
  if (!typeObj) return { storageType: "DRY", size: "S" };
  const code = (typeObj.code || "").toUpperCase();
  const name = (typeObj.name || "").toLowerCase();

  let storageType = "DRY";
  if (code.includes("SEAFOOD") || name.includes("seafood") || name.includes("cold")) storageType = "SEAFOOD";
  else if (code.includes("WARM") || name.includes("warm") || name.includes("heat")) storageType = "WARM";
  else if (code.includes("CLIMATE") || name.includes("climate")) storageType = "CLIMATE";
  else if (code.includes("LOCKER") || name.includes("locker")) storageType = "LOCKER";

  let size = "S";
  if (code.includes("MINI") || (typeObj.areaM2 && typeObj.areaM2 <= 1.5)) size = "MINI";
  else if (code.startsWith("S-") || (typeObj.areaM2 && typeObj.areaM2 <= 3.5)) size = "S";
  else if (code.startsWith("M-") || (typeObj.areaM2 && typeObj.areaM2 <= 6.5)) size = "M";
  else if (code.startsWith("L-") || (typeObj.areaM2 && typeObj.areaM2 <= 12)) size = "L";
  else if (code.startsWith("XL-") || (typeObj.areaM2 && typeObj.areaM2 > 12)) size = "XL";

  return { storageType, size };
}

function resolveUnitTypeId(unitTypes, storageType, size) {
  if (!unitTypes || unitTypes.length === 0) return "1";

  // Exact type and size
  let match = unitTypes.find((t) => {
    const { storageType: st, size: s } = parseTypeAndSizeFromUnitType(t);
    return st === storageType && s === size;
  });

  // Fallback to size
  if (!match) {
    match = unitTypes.find((t) => {
      const { size: s } = parseTypeAndSizeFromUnitType(t);
      return s === size;
    });
  }

  // Fallback to type
  if (!match) {
    match = unitTypes.find((t) => {
      const { storageType: st } = parseTypeAndSizeFromUnitType(t);
      return st === storageType;
    });
  }

  return match ? String(match.id) : String(unitTypes[0].id);
}

// Tách nhãn Loại kho & Kích thước từ unitTypeId để hiển thị thành 2 cột riêng trong bảng
function getUnitTypeAndSizeLabels(unitTypes, unit) {
  const typeObj = unitTypes.find((t) => String(t.id) === String(unit.unitTypeId));
  if (!typeObj) {
    return { typeLabel: unit.unitTypeName || "—", sizeLabel: "—" };
  }
  const { storageType, size } = parseTypeAndSizeFromUnitType(typeObj);
  const typeLabel = STORAGE_TYPES.find((st) => st.id === storageType)?.label.split(" (")[0] || unit.unitTypeName || "—";
  const sizeBase = UNIT_SIZES.find((sz) => sz.id === size)?.label.split(" (")[0] || size;
  const sizeLabel = typeObj.areaM2 ? `${sizeBase} (${typeObj.areaM2} m²)` : sizeBase;
  return { typeLabel, sizeLabel };
}

function mapStatusStyle(status) {
  const key = String(status || "").toLowerCase();
  if (key === "available") return "border-emerald-300 bg-emerald-50 text-emerald-800 shadow-xs";
  if (key === "occupied") return "border-indigo-300 bg-indigo-50 text-indigo-800 shadow-xs";
  if (key === "reserved") return "border-amber-300 bg-amber-50 text-amber-800 shadow-xs";
  return "border-rose-300 bg-rose-50 text-rose-800 shadow-xs";
}

function formatMapStatusLabel(status) {
  const key = String(status || "").toLowerCase().trim();
  if (key === "pending_inspection") return "pending";
  if (key === "out_of_service") return "out of svc";
  if (key === "maintenance") return "maint.";
  return key;
}

function getNextUnitCode(existingUnits, zone = "A", floor = "1", offset = 0) {
  const z = (zone || "A").trim().toUpperCase();
  const f = (floor || "1").trim();
  const pattern = new RegExp(`^${z}-?${f}(\\d+)$`, "i");
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

function parseNotesAndImage(rawNotes, fallbackImageUrl = "") {
  if (!rawNotes) return { notes: "", imageUrl: fallbackImageUrl || "" };
  const match = rawNotes.match(/\[IMG:([^\]]+)\]/);
  if (match) {
    return {
      imageUrl: match[1].trim(),
      notes: rawNotes.replace(/\[IMG:[^\]]+\]\s*/, "").trim(),
    };
  }
  return { notes: rawNotes, imageUrl: fallbackImageUrl || "" };
}

export default function ManagerUnits() {
  const { t, translateStatus } = useLanguage();
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
  const [activeDropZone, setActiveDropZone] = useState(null);
  const [hoveredSlot, setHoveredSlot] = useState(null);
  const [pendingDrop, setPendingDrop] = useState(null);
  const [isDeletingUnit, setIsDeletingUnit] = useState(false);

  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const fileInputRef = useRef(null);

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
      const page = await managerService.getUnits(facilityId, {
        status: statusFilter || undefined,
        search: search || undefined,
        pageSize: PAGINATION.MAX_PAGE_SIZE,
      });
      setUnits(page?.items ?? []);
    } catch (err) {
      setError(err?.message || "Không thể tải danh sách ô kho.");
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
      setError(err?.message || "Không thể tải sơ đồ mặt bằng.");
    } finally {
      setLoadingLayout(false);
    }
  }

  useEffect(() => {
    if (!facilityLoading && !facilityId) setLoadingUnits(false);
    else if (facilityId) loadUnits();
  }, [facilityId, statusFilter, facilityLoading]);

  useEffect(() => {
    if (!facilityLoading && !facilityId) setLoadingLayout(false);
    else if (facilityId) loadLayout();
  }, [facilityId, facilityLoading]);

  async function handleQuickStatusChange(unit, nextStatus) {
    if (unit.physicalStatus === nextStatus) return;
    const prevStatus = unit.physicalStatus;
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, physicalStatus: nextStatus } : u))
    );
    try {
      await managerService.updateUnit(unit.id, {
        unitCode: unit.unitCode,
        unitTypeId: unit.unitTypeId,
        areaId: unit.areaId || undefined,
        floorLabel: unit.floorLabel || "",
        zoneLabel: unit.zoneLabel || "",
        physicalStatus: nextStatus,
        isListed: unit.isListed,
        notes: unit.notes ?? "",
        imageUrl: unit.imageUrl ?? "",
      });
      setNotice(`Đã đổi trạng thái kho ${unit.unitCode} sang ${nextStatus}.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, physicalStatus: prevStatus } : u))
      );
      setError(err?.message || "Không thể cập nhật trạng thái ô kho.");
    }
  }

  async function handleToggleListed(unit) {
    const nextVal = !unit.isListed;
    setUnits((prev) =>
      prev.map((u) => (u.id === unit.id ? { ...u, isListed: nextVal } : u))
    );
    try {
      await managerService.updateUnit(unit.id, {
        unitCode: unit.unitCode,
        unitTypeId: unit.unitTypeId,
        areaId: unit.areaId || undefined,
        floorLabel: unit.floorLabel || "",
        zoneLabel: unit.zoneLabel || "",
        physicalStatus: unit.physicalStatus,
        isListed: nextVal,
        notes: unit.notes ?? "",
        imageUrl: unit.imageUrl ?? "",
      });
      setNotice(`Kho ${unit.unitCode} hiện đã ${nextVal ? "Hiển thị cho khách thuê" : "Ẩn"}.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, isListed: !nextVal } : u))
      );
      setError(err?.message || "Không thể cập nhật niêm yết.");
    }
  }

  function openEditUnit(unit) {
    setEditingUnitId(unit.id);
    setPendingDrop(null);
    const { notes, imageUrl } = parseNotesAndImage(unit.notes, unit.imageUrl);
    setUnitForm({
      unitCode: unit.unitCode || "",
      unitTypeId: String(unit.unitTypeId || ""),
      areaId: unit.areaId ? String(unit.areaId) : "",
      floorLabel: unit.floorLabel || "1",
      zoneLabel: unit.zoneLabel || "A",
      physicalStatus: unit.physicalStatus || "available",
      isListed: unit.isListed !== false,
      notes,
      imageUrl,
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
        floorLabel: unitForm.floorLabel || "1",
        zoneLabel: unitForm.zoneLabel || "A",
        physicalStatus:
          unitForm.physicalStatus === "under_inspection"
            ? "pending_inspection"
            : unitForm.physicalStatus,
        isListed: Boolean(unitForm.isListed),
        notes: (unitForm.notes ?? "").trim(),
        imageUrl: (unitForm.imageUrl ?? "").trim(),
      };

      let createdUnitId = null;
      if (editingUnitId) {
        await managerService.updateUnit(editingUnitId, {
          ...basePayload,
          unitCode: unitForm.unitCode,
        });
        setNotice(`Đã cập nhật ô kho ${unitForm.unitCode} thành công.`);
      } else {
        // Create unit from drop
        const created = await managerService.createUnit(facilityId, {
          ...basePayload,
          unitCode: unitForm.unitCode,
        });

        createdUnitId = created?.id;
        if (!createdUnitId) {
          throw new Error("Không thể lấy mã định danh ô kho sau khi tạo.");
        }

        const width = pendingDrop?.width || 22;
        const height = pendingDrop?.height || 16;
        const targetAreaId = pendingDrop?.area?.areaId || (basePayload.areaId ? Number(basePayload.areaId) : undefined);

        // Lưu ngay vị trí tọa độ ô kho mới vào sơ đồ mặt bằng trên backend
        if (targetAreaId) {
          const newPos = {
            unitId: Number(createdUnitId),
            areaId: Number(targetAreaId),
            x: Math.round(Number(pendingDrop?.unitX ?? 10)),
            y: Math.round(Number(pendingDrop?.unitY ?? 10)),
            width,
            height,
            rotationDegrees: 0,
            metadata: "{}",
          };

          const currentPositions = (layout?.unitPositions || [])
            .filter((p) => p.unitId !== createdUnitId)
            .map((pos) => {
              const matchedUnit = units.find((u) => u.id === pos.unitId);
              const effectiveAreaId = pos.areaId
                ? Number(pos.areaId)
                : (matchedUnit?.areaId ? Number(matchedUnit.areaId) : undefined);
              return {
                unitId: Number(pos.unitId),
                areaId: effectiveAreaId,
                x: Math.round(Number(pos.x) || 0),
                y: Math.round(Number(pos.y) || 0),
                width: Number(pos.width) > 0 ? Number(pos.width) : 22,
                height: Number(pos.height) > 0 ? Number(pos.height) : 16,
                rotationDegrees: Number(pos.rotationDegrees) || 0,
                metadata: pos.metadata || "{}",
              };
            });

          await managerService.updateMapLayout(facilityId, {
            positions: [...currentPositions, newPos],
          });
        }

        setSelectedMapUnitId(createdUnitId);
        setNotice(`Đã thêm ô kho mới [${unitForm.unitCode}] vào mặt bằng thành công.`);
      }

      setShowUnitForm(false);
      setPendingDrop(null);
      await loadUnits();
      await loadLayout();
      if (createdUnitId) {
        setSelectedMapUnitId(createdUnitId);
      }
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Không thể lưu thông tin ô kho.");
    } finally {
      setSavingUnit(false);
    }
  }

  function handleImageFileChange(e) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      setUnitForm((prev) => ({ ...prev, imageUrl: reader.result }));
    };
    reader.readAsDataURL(file);
  }

  async function handleDeleteUnit(unitId) {
    if (!unitId) return;
    const unitObj = units.find((u) => u.id === unitId) || (layout?.unitPositions || []).find((p) => p.unitId === unitId);
    const unitCode = unitObj?.unitCode || `ID #${unitId}`;

    if (!window.confirm(`Bạn có chắc chắn muốn xóa kho "${unitCode}" khỏi hệ thống không?`)) {
      return;
    }
    setIsDeletingUnit(true);
    try {
      await managerService.deleteUnit(unitId);
      setNotice(`Đã xóa kho ${unitCode} thành công.`);
      setTimeout(() => setNotice(""), 3500);

      if (selectedMapUnitId === unitId) {
        setSelectedMapUnitId(null);
      }
      setUnits((prev) => prev.filter((u) => u.id !== unitId));
      setLayout((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unitPositions: (prev.unitPositions || []).filter((pos) => pos.unitId !== unitId),
        };
      });
    } catch (err) {
      setError(err?.message || "Không thể xóa ô kho. Vui lòng kiểm tra ràng buộc hợp đồng.");
    } finally {
      setIsDeletingUnit(false);
    }
  }

  async function saveLayout() {
    if (!layout) return;
    setSavingLayout(true);
    setError("");
    try {
      const payload = {
        positions: (layout.unitPositions || []).map((pos) => {
          const matchedUnit = units.find((u) => u.id === pos.unitId);
          const effectiveAreaId = pos.areaId
            ? Number(pos.areaId)
            : (matchedUnit?.areaId ? Number(matchedUnit.areaId) : undefined);
          return {
            unitId: Number(pos.unitId),
            areaId: effectiveAreaId,
            x: Math.round(Number(pos.x) || 0),
            y: Math.round(Number(pos.y) || 0),
            width: Number(pos.width) > 0 ? Number(pos.width) : 22,
            height: Number(pos.height) > 0 ? Number(pos.height) : 16,
            rotationDegrees: Number(pos.rotationDegrees) || 0,
            metadata: pos.metadata || "{}",
          };
        }),
      };

      await managerService.updateMapLayout(facilityId, payload);
      setNotice("Đã lưu sơ đồ mặt bằng thành công.");
      setTimeout(() => setNotice(""), 3500);
      await loadLayout();
    } catch (err) {
      setError(err?.message || "Không thể lưu mặt bằng.");
    } finally {
      setSavingLayout(false);
    }
  }

  // Handle Drop on a specific grid slot
  function handleDropOnSlot(e, area, row, col) {
    e.preventDefault();
    e.stopPropagation();
    setActiveDropZone(null);
    setHoveredSlot(null);

    const rawData = e.dataTransfer.getData("application/json");
    if (!rawData) return;
    let data;
    try { data = JSON.parse(rawData); } catch { return; }

    const unitX = 5 + col * 27;
    const unitY = 5 + row * 21;

    if (data.type === "move-unit") {
      const unitId = data.unitId;
      setLayout((prev) => {
        if (!prev) return prev;
        return {
          ...prev,
          unitPositions: (prev.unitPositions || []).map((pos) =>
            pos.unitId === unitId
              ? { ...pos, x: unitX, y: unitY, areaId: area.areaId || pos.areaId }
              : pos
          ),
        };
      });
      setSelectedMapUnitId(unitId);
      setNotice("Đã di chuyển vị trí kho vào ô lưới. Nhấn 'Lưu mặt bằng' để lưu lại.");
      setTimeout(() => setNotice(""), 3500);
      return;
    }

    if (data.type === "new-unit") {
      const zoneCode = (area.code || "").toUpperCase();
      const match = zoneCode.match(/^F(\d+)-Z([A-Z])/i);
      let zoneLabel = match ? match[2].toUpperCase() : "A";
      let floorLabel = match ? match[1] : "1";
      if (!match) {
        if (zoneCode === "F1-ZA") { zoneLabel = "A"; floorLabel = "1"; }
        else if (zoneCode === "F1-ZB") { zoneLabel = "B"; floorLabel = "1"; }
        else if (zoneCode === "F2-ZA") { zoneLabel = "A"; floorLabel = "2"; }
        else if (area.name?.includes("B")) { zoneLabel = "B"; }
      }

      const allKnownUnits = [...units, ...(layout?.unitPositions || [])];
      const nextCode = getNextUnitCode(allKnownUnits, zoneLabel, floorLabel, 0);
      const defaultTypeId = unitTypes[0]?.id ? String(unitTypes[0].id) : "1";

      setPendingDrop({
        area,
        unitX,
        unitY,
        width: 22,
        height: 16,
      });

      setEditingUnitId(null);
      setUnitForm({
        unitCode: nextCode,
        unitTypeId: defaultTypeId,
        areaId: area.areaId ? String(area.areaId) : "",
        floorLabel,
        zoneLabel,
        physicalStatus: "available",
        isListed: true,
        notes: "",
        imageUrl: "",
      });
      setShowUnitForm(true);
    }
  }

  const mapPositions = layout?.unitPositions || [];

  const zoneAreas = useMemo(() => {
    if (!layout?.areas?.length) {
      return [
        { code: "F1-ZA", name: "Floor 1 - Zone A", areaId: 1 },
        { code: "F1-ZB", name: "Floor 1 - Zone B", areaId: 2 },
        { code: "F2-ZA", name: "Floor 2 - Zone A", areaId: 3 },
      ];
    }
    return layout.areas;
  }, [layout]);

  const selectedUnit = useMemo(() => {
    if (!selectedMapUnitId) return null;
    return mapPositions.find((pos) => pos.unitId === selectedMapUnitId) || null;
  }, [mapPositions, selectedMapUnitId]);

  return (
    <>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h1 className="text-[20px] font-bold">{t("manager.units", "Quản lý ô kho & Mặt bằng")}</h1>
        <div className="flex items-center bg-slate-100 p-1 rounded-xl gap-1 border border-slate-200/60">
          <button
            type="button"
            onClick={() => setTab("units")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              tab === "units"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("manager.unit_list", "Danh sách ô kho")}
          </button>
          <button
            type="button"
            onClick={() => setTab("layout")}
            className={`rounded-lg px-3.5 py-1.5 text-xs font-medium transition-all cursor-pointer ${
              tab === "layout"
                ? "bg-white text-slate-900 font-semibold shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            {t("manager.floor_plan", "Bản đồ mặt bằng")}
          </button>
        </div>
      </div>

      {notice && (
        <p role="status" className="mt-3 rounded-xl bg-emerald-50 border border-emerald-200 px-3 py-2 text-xs font-semibold text-emerald-800">
          {notice}
        </p>
      )}
      {error && (
        <p role="alert" className="mt-3 rounded-xl bg-rose-50 border border-rose-200 px-3 py-2 text-xs font-semibold text-rose-800">
          {error}
        </p>
      )}

      {/* TAB 1: UNITS LIST */}
      {tab === "units" && (
        <div className="mt-4 rounded-2xl border border-[#dfe7f5] bg-white p-4 shadow-xs">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2 w-full sm:w-auto">
              <input
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                onBlur={loadUnits}
                placeholder="Tìm mã kho..."
                className="rounded-xl border border-[#dfe7f5] px-3 py-1.5 text-xs outline-none focus:border-zinc-400"
              />
              <SelectDropdown
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="">{t("manager.all_statuses", "Tất cả trạng thái")}</option>
                {STATUS_OPTIONS.map(([value, label]) => (
                  <option key={value} value={value}>{label}</option>
                ))}
              </SelectDropdown>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-4 py-2.5 w-[13%]">{t("common.unit", "Mã kho")}</th>
                  <th className="px-4 py-2.5 w-[14%]">{t("table.type", "Loại kho")}</th>
                  <th className="px-4 py-2.5 w-[14%]">{t("table.size", "Kích thước")}</th>
                  <th className="px-4 py-2.5 w-[14%]">{t("table.zone", "Khu vực / Tầng")}</th>
                  <th className="px-4 py-2.5 w-[17%]">{t("common.status", "Trạng thái")}</th>
                  <th className="px-4 py-2.5 w-[14%]">Hiển thị khách thuê</th>
                  <th className="px-4 py-2.5 w-[14%] text-right">{t("manager.actions", "Thao tác")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingUnits ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400">{t("manager.loading_units", "Đang tải danh sách ô kho...")}</td></tr>
                ) : units.length === 0 ? (
                  <tr><td colSpan={7} className="py-6 text-center text-slate-400">{t("manager.no_units_found", "Không tìm thấy ô kho nào.")}</td></tr>
                ) : (
                  units.map((unit) => {
                    const { typeLabel, sizeLabel } = getUnitTypeAndSizeLabels(unitTypes, unit);
                    return (
                    <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-4 py-2.5 font-bold text-slate-900">{unit.unitCode}</td>
                      <td className="px-4 py-2.5 text-slate-600" title={typeLabel}>{typeLabel}</td>
                      <td className="px-4 py-2.5 text-slate-600" title={sizeLabel}>{sizeLabel}</td>
                      <td className="px-4 py-2.5 text-slate-600">
                        <span className="font-semibold text-slate-800">{unit.zoneLabel || "A"}</span> / Tầng {unit.floorLabel || "1"}
                      </td>
                      <td className="px-4 py-2.5">
                        <SelectDropdown
                          value={unit.physicalStatus}
                          onChange={(e) => handleQuickStatusChange(unit, e.target.value)}
                          className="w-36"
                        >
                          {STATUS_OPTIONS.map(([value, label]) => (
                            <option key={value} value={value}>{label}</option>
                          ))}
                        </SelectDropdown>
                      </td>
                      <td className="px-4 py-2.5">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={Boolean(unit.isListed)}
                            onChange={() => handleToggleListed(unit)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={unit.isListed ? "font-semibold text-emerald-700" : "text-slate-400"}>
                            {unit.isListed ? "Hiển thị" : "Ẩn"}
                          </span>
                        </label>
                      </td>
                      <td className="px-4 py-2.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditUnit(unit)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingUnit}
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 size={12} />
                          <span>Xóa</span>
                        </button>
                      </td>
                    </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: FLOOR PLAN LAYOUT */}
      {tab === "layout" && (
        <div className="mt-4 rounded-2xl border border-[#dfe7f5] bg-white p-4 shadow-xs">
          {/* Floor Plan Header Toolbar: Only Save Layout */}
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">
                Sơ đồ phân bổ kho ({layout?.facilityName || "Cơ sở"})
              </span>
            </div>
            <div>
              <button
                type="button"
                disabled={savingLayout || !layout}
                onClick={saveLayout}
                className="flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 px-4 py-2 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <Check size={14} />
                <span>{savingLayout ? "Đang lưu..." : "Lưu mặt bằng (Save Layout)"}</span>
              </button>
            </div>
          </div>

          {/* Clean 1-Item Drag & Drop Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 shadow-xs">
            <div>
              <p className="text-xs font-bold text-blue-900">
                Kéo thả ô kho rỗng vào lưới mặt bằng
              </p>
              <p className="text-[11px] text-blue-700">
                Kéo ô bên cạnh và thả vào một vị trí ô lưới nét đứt để tạo và cấu hình thông tin ô kho mới:
              </p>
            </div>

            <div>
              <div
                draggable
                onDragStart={(e) => {
                  e.dataTransfer.setData(
                    "application/json",
                    JSON.stringify({ type: "new-unit" })
                  );
                }}
                className="flex cursor-grab items-center gap-2 rounded-xl border-2 border-dashed border-blue-500 bg-white px-4 py-2 text-xs font-bold text-blue-700 shadow-sm hover:scale-102 hover:shadow-md active:cursor-grabbing transition"
                title="Kéo ô này thả vào vị trí lưới nét đứt trên mặt bằng"
              >
                <GripVertical size={14} className="text-blue-500" />
                <span>Ô kho rỗng (Kéo vào mặt bằng)</span>
              </div>
            </div>
          </div>

          {loadingLayout ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#dfe7f5] p-10 text-center text-xs text-[#8996a9]">
              {t("manager.rendering_floor_plan", "Đang kết xuất mặt bằng...")}
            </div>
          ) : (
            <>
              {/* Floor Plan Canvas */}
              <div className="mt-4 overflow-x-auto rounded-2xl border border-[#c9d9ef] bg-[radial-gradient(circle_at_20%_10%,#eff7ff,transparent_38%),linear-gradient(145deg,#cbdcf0,#eaf2fb_45%,#d7e4f3)] p-4 shadow-inner">
                <div className="relative min-h-[480px] min-w-[820px] overflow-hidden rounded-xl border border-white/80 bg-[linear-gradient(rgba(65,103,146,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(65,103,146,0.12)_1px,transparent_1px)] bg-[size:32px_32px]">
                  {/* Floor Plan Badge */}
                  <div className="absolute left-5 top-3.5 z-20 rounded-lg bg-slate-900/90 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-md">
                    {layout?.facilityName || "FACILITY"} · BẢN ĐỒ MẶT BẰNG
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-3.5 left-5 z-20 flex items-center gap-4 text-[10px] font-medium text-slate-700 bg-white/85 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/60 shadow-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
                      Khả dụng ({mapPositions.filter((p) => p.physicalStatus === "available").length})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-xs" />
                      Đang thuê ({mapPositions.filter((p) => p.physicalStatus === "occupied").length})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs" />
                      Đã đặt ({mapPositions.filter((p) => p.physicalStatus === "reserved").length})
                    </span>
                  </div>

                  {/* Render 3 Zone Areas with Aligned Grid Slots */}
                  {zoneAreas.map((area, areaIdx) => {
                    const zoneCode = (area.code || "").toUpperCase();
                    const zoneUnits = mapPositions.filter((pos) => {
                      if (pos.areaId && zoneAreas.some((a) => Number(a.areaId) === Number(pos.areaId))) {
                        return Number(area.areaId) === Number(pos.areaId);
                      }
                      const uCode = (pos.unitCode || "").toUpperCase();
                      if (zoneCode === "F1-ZA") return /^A-?1\d+/.test(uCode) || (uCode.startsWith("A-") && !uCode.startsWith("A-2"));
                      if (zoneCode === "F1-ZB") return /^B-?1\d+/.test(uCode) || uCode.startsWith("B-");
                      if (zoneCode === "F2-ZA") return /^A-?2\d+/.test(uCode);
                      return false;
                    });

                    // Grid System: 4 columns x 7 rows = 28 slots per zone (fills entire zone height & width)
                    const GRID_COLS = 4;
                    const GRID_ROWS = 7;
                    const scale = 2.2;
                    const slotW = 22;
                    const slotH = 16;

                    return (
                      <div
                        key={area.areaId || area.code}
                        onDragOver={(e) => {
                          e.preventDefault();
                          e.dataTransfer.dropEffect = "copy";
                          if (activeDropZone !== (area.code || area.name)) setActiveDropZone(area.code || area.name);
                        }}
                        onDragLeave={(e) => {
                          if (!e.currentTarget.contains(e.relatedTarget)) setActiveDropZone(null);
                        }}
                        className={`absolute top-14 rounded-xl border transition-all ${
                          activeDropZone === (area.code || area.name)
                            ? "border-2 border-blue-600 bg-blue-100/50 shadow-lg ring-4 ring-blue-400/30 z-30"
                            : "border-dashed border-[#7896ba]/60 bg-white/40 shadow-xs"
                        }`}
                        style={{
                          left: `${3 + areaIdx * 32.5}%`,
                          width: "31%",
                          height: "82%",
                        }}
                      >
                        {/* Zone Header Label */}
                        <div className="flex items-center justify-between px-3 py-1.5 border-b border-[#7896ba]/20 bg-white/50 rounded-t-xl text-[10px] font-bold text-[#35506e]">
                          <span>{area.code} · {area.name}</span>
                          <span className="text-[9px] font-semibold text-slate-500">{zoneUnits.length} ô kho</span>
                        </div>

                        {/* Relative Grid Canvas inside this Zone */}
                        <div className="relative w-full h-[calc(100%-28px)] p-2">
                          {/* Render Grid Slots (3 cols x 4 rows) */}
                          {Array.from({ length: GRID_ROWS }).map((_, r) =>
                            Array.from({ length: GRID_COLS }).map((__, c) => {
                              const slotX = 5 + c * 27;
                              const slotY = 5 + r * 21;

                              // Check if a unit is placed close to this slot
                              const occupyingUnit = zoneUnits.find((u) => {
                                const ux = Number(u.x) || 0;
                                const uy = Number(u.y) || 0;
                                return Math.abs(ux - slotX) < 14 && Math.abs(uy - slotY) < 12;
                              });

                              const isHovered = hoveredSlot === `${area.areaId || area.code}-${r}-${c}`;

                              if (occupyingUnit) {
                                const selected = selectedMapUnitId === occupyingUnit.unitId;
                                return (
                                  <div
                                    key={`unit-${occupyingUnit.unitId}`}
                                    draggable
                                    onDragStart={(e) => {
                                      e.dataTransfer.setData(
                                        "application/json",
                                        JSON.stringify({ type: "move-unit", unitId: occupyingUnit.unitId })
                                      );
                                    }}
                                    onClick={() => setSelectedMapUnitId(occupyingUnit.unitId)}
                                    title={`${occupyingUnit.unitCode} (${occupyingUnit.physicalStatus}) - Kéo để đổi ô lưới`}
                                    className={`absolute flex flex-col items-center justify-center rounded-lg border text-[10px] font-bold tracking-tight transition duration-150 cursor-grab hover:scale-102 hover:shadow-md overflow-hidden ${mapStatusStyle(occupyingUnit.physicalStatus)} ${
                                      selected ? "ring-2 ring-blue-600 shadow-md z-20" : "z-10 shadow-xs"
                                    }`}
                                    style={{
                                      left: `${slotX * scale}px`,
                                      top: `${slotY * scale}px`,
                                      width: `${slotW * scale}px`,
                                      height: `${slotH * scale}px`,
                                    }}
                                  >
                                    <span className="truncate max-w-full px-1">{occupyingUnit.unitCode}</span>
                                    <span className="truncate max-w-full px-0.5 text-[8px] font-normal opacity-75">{formatMapStatusLabel(occupyingUnit.physicalStatus)}</span>
                                  </div>
                                );
                              }

                              // Empty dashed slot
                              return (
                                <div
                                  key={`slot-${r}-${c}`}
                                  onDragOver={(e) => {
                                    e.preventDefault();
                                    e.dataTransfer.dropEffect = "copy";
                                    setHoveredSlot(`${area.areaId || area.code}-${r}-${c}`);
                                  }}
                                  onDragLeave={() => setHoveredSlot(null)}
                                  onDrop={(e) => handleDropOnSlot(e, area, r, c)}
                                  className={`absolute rounded-lg border-2 border-dashed flex flex-col items-center justify-center transition-all cursor-pointer ${
                                    isHovered
                                      ? "border-blue-500 bg-blue-100/80 ring-2 ring-blue-400 text-blue-700 font-bold z-20 scale-102"
                                      : "border-slate-300/70 bg-white/30 text-slate-400 hover:border-blue-400 hover:bg-white/60"
                                  }`}
                                  style={{
                                    left: `${slotX * scale}px`,
                                    top: `${slotY * scale}px`,
                                    width: `${slotW * scale}px`,
                                    height: `${slotH * scale}px`,
                                  }}
                                  title={`Ô lưới trống (Hàng ${r + 1}, Cột ${c + 1}) - Thả ô kho vào đây`}
                                >
                                  <span className="text-[11px] font-bold select-none opacity-60">
                                    {isHovered ? "+ Thả" : "+"}
                                  </span>
                                </div>
                              );
                            })
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Selected Unit Mini Action Bar */}
              {selectedUnit && (
                <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/70 p-3 text-xs shadow-xs">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-900 text-sm">
                      Đang chọn: {selectedUnit.unitCode}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold border ${mapStatusStyle(selectedUnit.physicalStatus)}`}>
                      {selectedUnit.physicalStatus}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        const target = units.find((u) => u.id === selectedUnit.unitId) || {
                          id: selectedUnit.unitId,
                          unitCode: selectedUnit.unitCode,
                          areaId: selectedUnit.areaId,
                          physicalStatus: selectedUnit.physicalStatus,
                          isListed: true,
                        };
                        openEditUnit(target);
                      }}
                      className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                    >
                      Chỉnh sửa thông tin kho
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingUnit}
                      onClick={() => handleDeleteUnit(selectedUnit.unitId)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                    >
                      Xóa kho này
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* MODAL: CREATE FROM DROP / EDIT UNIT */}
      {showUnitForm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 backdrop-blur-xs p-4 overflow-y-auto">
          <div className="relative w-full max-w-md rounded-2xl border border-slate-200 bg-white p-6 shadow-2xl">
            <form onSubmit={submitUnit}>
              <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-4">
                <h2 className="text-base font-bold text-slate-900">
                  {editingUnitId ? "Chỉnh sửa ô kho" : "Thêm ô kho mới"}
                </h2>
                <button
                  type="button"
                  onClick={() => { setShowUnitForm(false); setPendingDrop(null); }}
                  className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition cursor-pointer"
                  aria-label="Close modal"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="space-y-3.5 text-xs">
                {/* Row 1: Unit Code & Status */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Mã kho *
                    </label>
                    <input
                      required
                      value={unitForm.unitCode}
                      onChange={(e) => setUnitForm((p) => ({ ...p, unitCode: e.target.value.toUpperCase() }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-500 dark:bg-zinc-800"
                      placeholder="VD: A-101"
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Trạng thái
                    </label>
                    <SelectDropdown
                      value={unitForm.physicalStatus}
                      onChange={(e) => setUnitForm((p) => ({ ...p, physicalStatus: e.target.value }))}
                      className="w-full"
                    >
                      {STATUS_OPTIONS.map(([value, label]) => (
                        <option key={value} value={value}>{label}</option>
                      ))}
                    </SelectDropdown>
                  </div>
                </div>

                {/* Row 2: 2 Independent Dropdowns (Loại kho & Kích thước) */}
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Loại kho *
                    </label>
                    <SelectDropdown
                      value={(() => {
                        const curObj = unitTypes.find((t) => String(t.id) === String(unitForm.unitTypeId));
                        return parseTypeAndSizeFromUnitType(curObj).storageType;
                      })()}
                      onChange={(e) => {
                        const curObj = unitTypes.find((t) => String(t.id) === String(unitForm.unitTypeId));
                        const { size: curSize } = parseTypeAndSizeFromUnitType(curObj);
                        const nextId = resolveUnitTypeId(unitTypes, e.target.value, curSize);
                        setUnitForm((p) => ({ ...p, unitTypeId: nextId }));
                      }}
                      className="w-full"
                    >
                      {STORAGE_TYPES.map((st) => (
                        <option key={st.id} value={st.id}>{st.label}</option>
                      ))}
                    </SelectDropdown>
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      Kích thước *
                    </label>
                    <SelectDropdown
                      value={(() => {
                        const curObj = unitTypes.find((t) => String(t.id) === String(unitForm.unitTypeId));
                        return parseTypeAndSizeFromUnitType(curObj).size;
                      })()}
                      onChange={(e) => {
                        const curObj = unitTypes.find((t) => String(t.id) === String(unitForm.unitTypeId));
                        const { storageType: curType } = parseTypeAndSizeFromUnitType(curObj);
                        const nextId = resolveUnitTypeId(unitTypes, curType, e.target.value);
                        setUnitForm((p) => ({ ...p, unitTypeId: nextId }));
                      }}
                      className="w-full"
                    >
                      {UNIT_SIZES.map((sz) => (
                        <option key={sz.id} value={sz.id}>{sz.label}</option>
                      ))}
                    </SelectDropdown>
                  </div>
                </div>

                {/* Mapped asset specification tag */}
                {(() => {
                  const mapped = unitTypes.find((t) => String(t.id) === String(unitForm.unitTypeId));
                  if (!mapped) return null;
                  return (
                    <div className="rounded-lg bg-blue-50/70 dark:bg-blue-950/30 border border-blue-200/70 dark:border-blue-800/50 px-2.5 py-1.5 text-[11px] flex items-center justify-between text-blue-900 dark:text-blue-300">
                      <span className="font-bold">{mapped.code}</span>
                      <span className="truncate max-w-[260px] opacity-80">{mapped.name}</span>
                    </div>
                  );
                })()}

                {/* Listing checkbox */}
                <div>
                  <label className="flex items-center gap-2 cursor-pointer font-semibold text-slate-700 dark:text-zinc-300">
                    <input
                      type="checkbox"
                      checked={unitForm.isListed}
                      onChange={(e) => setUnitForm((p) => ({ ...p, isListed: e.target.checked }))}
                      className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                    />
                    <span>Hiển thị cho khách thuê</span>
                  </label>
                </div>

                {/* Image Upload & URL */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Hình ảnh ô kho
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={unitForm.imageUrl}
                      onChange={(e) => setUnitForm((p) => ({ ...p, imageUrl: e.target.value }))}
                      placeholder="Dán link ảnh (https://...)"
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                    >
                      <Upload size={13} />
                      <span>Tải ảnh</span>
                    </button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleImageFileChange}
                    />
                  </div>

                  {unitForm.imageUrl && (
                    <div className="mt-2 flex items-center gap-3 rounded-xl border border-slate-200 p-2 bg-slate-50">
                      <img
                        src={unitForm.imageUrl}
                        alt="Preview kho"
                        className="h-12 w-16 rounded-lg object-cover border border-slate-200 shrink-0"
                        onError={(e) => { e.currentTarget.style.display = 'none'; }}
                      />
                      <div className="flex-1 min-w-0">
                        <span className="text-[11px] font-semibold text-slate-700 block truncate">
                          Đã chọn ảnh ô kho
                        </span>
                        <button
                          type="button"
                          onClick={() => setUnitForm((p) => ({ ...p, imageUrl: "" }))}
                          className="text-[11px] text-rose-600 font-semibold hover:underline cursor-pointer"
                        >
                          Xóa ảnh
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    Ghi chú
                  </label>
                  <input
                    value={unitForm.notes}
                    onChange={(e) => setUnitForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder="Ghi chú vị trí, gần thang máy / cửa ra vào..."
                    className="w-full rounded-xl border border-slate-200 px-3 py-2 text-xs text-slate-800 outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="mt-5 flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
                <button
                  type="button"
                  onClick={() => { setShowUnitForm(false); setPendingDrop(null); }}
                  className="rounded-xl border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy bỏ
                </button>
                <button
                  type="submit"
                  disabled={savingUnit}
                  className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 px-5 py-2 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {savingUnit ? "Đang lưu..." : editingUnitId ? "Cập nhật kho" : "Tạo ô kho"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}
