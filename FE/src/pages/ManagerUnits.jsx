import SelectDropdown from "@/components/ui/select-dropdown";
import CustomCombobox from "@/components/ui/CustomCombobox";
import { useLanguage } from "../context/LanguageContext";
import { formatVnd } from "../lib/utils";
import { X, Trash2, GripVertical, Check, Image as ImageIcon, Upload } from "lucide-react";
import { useEffect, useMemo, useState, useRef } from "react";
import managerService from "../api/managerCoreService";
import apiClient from "../api/apiClient";
import facilityService from "../api/facilityService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { UNIT_PHYSICAL_STATUS_OPTIONS as STATUS_OPTIONS } from "../constants/managerConstants";
import PAGINATION from "../constants/pagination";

const STATUS_VI_MAP = {
  available: "Khả dụng",
  occupied: "Đang thuê",
  maintenance: "Bảo trì",
  cleaning: "Vệ sinh",
  pending_inspection: "Chờ nghiệm thu",
  reserved: "Đã đặt trước",
  out_of_service: "Tạm ngưng",
};

const STATUS_EN_MAP = {
  available: "Available",
  occupied: "Occupied",
  maintenance: "Maintenance",
  cleaning: "Cleaning",
  pending_inspection: "Pending Inspection",
  reserved: "Reserved",
  out_of_service: "Out of Service",
};

function getUnitStatusOptions(isVi) {
  return [
    {
      value: "available",
      label: (
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-emerald-500 shrink-0" />
          <span>{isVi ? "Khả dụng" : "Available"}</span>
        </div>
      ),
    },
    {
      value: "occupied",
      label: (
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-blue-600 shrink-0" />
          <span>{isVi ? "Đang thuê" : "Occupied"}</span>
        </div>
      ),
    },
    {
      value: "maintenance",
      label: (
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-amber-500 shrink-0" />
          <span>{isVi ? "Bảo trì" : "Maintenance"}</span>
        </div>
      ),
    },
    {
      value: "cleaning",
      label: (
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-cyan-500 shrink-0" />
          <span>{isVi ? "Vệ sinh" : "Cleaning"}</span>
        </div>
      ),
    },
    {
      value: "pending_inspection",
      label: (
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-orange-500 shrink-0" />
          <span>{isVi ? "Chờ nghiệm thu" : "Pending Inspection"}</span>
        </div>
      ),
    },
    {
      value: "reserved",
      label: (
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-purple-500 shrink-0" />
          <span>{isVi ? "Đã đặt trước" : "Reserved"}</span>
        </div>
      ),
    },
    {
      value: "out_of_service",
      label: (
        <div className="flex items-center gap-2">
          <span className="h-2.5 w-2.5 rounded-full bg-rose-500 shrink-0" />
          <span>{isVi ? "Tạm ngưng" : "Out of Service"}</span>
        </div>
      ),
    },
  ];
}

const DEFAULT_SYSTEM_CATEGORIES = [
  { id: 1, name: "Kho hàng khô", surchargeAmount: 0, isActive: true },
  { id: 2, name: "Kho mát điều hòa", surchargeAmount: 500, isActive: true },
  { id: 3, name: "Kho lạnh / Thủy hải sản", surchargeAmount: 1000, isActive: true },
  { id: 4, name: "Kho hóa chất", surchargeAmount: 2000, isActive: true },
  { id: 5, name: "Kho sưởi ấm", surchargeAmount: 800, isActive: true },
  { id: 6, name: "Kho núi lửa", surchargeAmount: 200, isActive: true },
];

const emptyUnitForm = {
  unitCode: "",
  unitTypeId: "",
  categoryName: "Kho hàng khô",
  lengthM: 2,
  widthM: 1.5,
  heightM: 2.5,
  areaId: "",
  floorLabel: "1",
  zoneLabel: "A",
  physicalStatus: "available",
  isListed: true,
  notes: "",
  imageUrl: "",
};

const VALID_CATEGORY_KEYWORDS = [
  "kho", "tủ", "tu", "lạnh", "lanh", "đông", "dong", "mát", "mat",
  "khô", "hóa chất", "hoa chat", "sưởi", "suoi", "nhiệt độ", "nhiet do",
  "tài liệu", "tai lieu", "hàng", "hang", "storage", "cold", "dry", "locker",
  "climate", "warm", "chemical", "archive", "freeze", "seafood",
];

function analyzeStorageCategory(rawName, adminCategories = []) {
  const trimmed = String(rawName || "").trim();
  if (trimmed.length < 3 || /^\d+$/.test(trimmed) || !/[a-zA-ZÀ-ỹ]/.test(trimmed) || new Set(trimmed).size <= 2) {
    return { valid: false, group: "", surcharge: 0 };
  }
  const lower = trimmed.toLowerCase();
  const matchedAdmin = adminCategories.find((c) => c.name?.toLowerCase() === lower);
  const hasKeyword = matchedAdmin || VALID_CATEGORY_KEYWORDS.some((kw) => lower.includes(kw));
  if (!hasKeyword) {
    return { valid: false, group: "", surcharge: 0 };
  }

  let group = trimmed;
  if (lower.includes("hóa chất") || lower.includes("hoa chat") || lower.includes("chemical")) group = "Kho hóa chất";
  else if (lower.includes("lạnh") || lower.includes("lanh") || lower.includes("đông") || lower.includes("dong") || lower.includes("cold") || lower.includes("freeze") || lower.includes("seafood")) group = "Kho lạnh / Thủy hải sản";
  else if (lower.includes("mát") || lower.includes("mat") || lower.includes("điều hòa") || lower.includes("nhiệt độ") || lower.includes("climate")) group = "Kho mát điều hòa";
  else if (lower.includes("sưởi") || lower.includes("suoi") || lower.includes("warm")) group = "Kho sưởi ấm";
  else if (lower.includes("khô") || lower.includes("dry") || lower.includes("tủ") || lower.includes("locker")) group = "Kho hàng khô";

  const catObj = matchedAdmin || adminCategories.find((c) => c.name?.toLowerCase() === group.toLowerCase());
  return { valid: true, group, surcharge: Number(catObj?.surchargeAmount ?? 0) };
}


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

function findBestUnitTypeId(unitTypes, categoryName, areaM2) {
  if (!unitTypes || unitTypes.length === 0) return "1";
  const lower = (categoryName || "").toLowerCase();
  let typeCode = "DRY";
  if (lower.includes("lạnh") || lower.includes("thủy hải sản") || lower.includes("seafood") || lower.includes("cold")) {
    typeCode = "SEAFOOD";
  } else if (lower.includes("sưởi") || lower.includes("warm") || lower.includes("heat")) {
    typeCode = "WARM";
  } else if (lower.includes("mát") || lower.includes("điều hòa") || lower.includes("climate")) {
    typeCode = "CLIMATE";
  }

  const matchingTypes = unitTypes.filter((t) => {
    const c = (t.code || "").toUpperCase();
    const n = (t.name || "").toLowerCase();
    if (typeCode === "SEAFOOD") return c.includes("SEAFOOD") || n.includes("seafood");
    if (typeCode === "WARM") return c.includes("WARM") || n.includes("warm");
    if (typeCode === "CLIMATE") return c.includes("CLIMATE") || n.includes("climate");
    return c.includes("DRY") || n.includes("dry") || c.includes("LOCKER") || n.includes("locker");
  });

  const candidates = matchingTypes.length > 0 ? matchingTypes : unitTypes;
  const area = Number(areaM2) || 3;
  let best = candidates[0];
  let minDiff = Math.abs((Number(best.areaM2) || 0) - area);
  for (const t of candidates) {
    const diff = Math.abs((Number(t.areaM2) || 0) - area);
    if (diff < minDiff) {
      minDiff = diff;
      best = t;
    }
  }
  return best ? String(best.id) : "1";
}

// Chuẩn hóa nhãn Loại kho (Việt hóa nếu fallback từ UnitType tiếng Anh hoặc tên kỹ thuật)
function getDisplayCategoryName(unit) {
  if (!unit) return "Kho hàng khô";
  const rawCat = String(unit.storageCategory || unit.categoryName || unit.unitTypeName || "").trim();
  if (!rawCat) return "Kho hàng khô";
  const lower = rawCat.toLowerCase();
  if (lower.includes("climate") || lower.includes("mát") || lower.includes("điều hòa")) return "Kho mát điều hòa";
  if (lower.includes("seafood") || lower.includes("cold") || lower.includes("lạnh") || lower.includes("thủy hải sản")) return "Kho lạnh / Thủy hải sản";
  if (lower.includes("warm") || lower.includes("heat") || lower.includes("sưởi")) return "Kho sưởi ấm";
  if (lower.includes("chemical") || lower.includes("hóa chất")) return "Kho hóa chất";
  if (lower.includes("dry") || lower.includes("khô")) return "Kho hàng khô";
  if (lower.includes("locker") || lower.includes("tủ")) return "Tủ đồ cá nhân (Locker)";
  return rawCat;
}

// Tách nhãn Loại kho & Kích thước từ thông tin thực tế của ô kho
function getUnitTypeAndSizeLabels(unitTypes, unit) {
  const typeLabel = getDisplayCategoryName(unit);
  const len = Number(unit.customLengthM ?? unit.lengthM ?? 2);
  const wid = Number(unit.customWidthM ?? unit.widthM ?? 1.5);
  const area = Number(unit.customAreaM2 ?? unit.areaM2 ?? (len * wid).toFixed(2));
  const sizeLabel = `${len}m × ${wid}m (${area} m²)`;
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
  const { t, translateStatus, lang } = useLanguage();
  const isVi = lang === "vi";
  const label = (vi, en) => (isVi ? vi : en);
  const unitStatusOptions = useMemo(() => getUnitStatusOptions(isVi), [isVi]);
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [tab, setTab] = useState("units");

  // --- Units tab state ---
  const [units, setUnits] = useState([]);
  const [unitTypes, setUnitTypes] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(true);
  const [statusFilter, setStatusFilter] = useState("");
  const [search, setSearch] = useState("");
  const [showUnitForm, setShowUnitForm] = useState(false);
  const [pricingConfig, setPricingConfig] = useState({ pricePerSquareMeter: 100, categories: DEFAULT_SYSTEM_CATEGORIES });
  useEffect(() => {
    apiClient
      .get("/v1/pricing-config")
      .then((res) => {
        const d = res?.data ?? res;
        if (d && Array.isArray(d.categories) && d.categories.length > 0) {
          setPricingConfig({
            pricePerSquareMeter: Number(d.pricePerSquareMeter ?? 100),
            categories: d.categories,
          });
        }
      })
      .catch(() => {});
  }, []);

  const [unitForm, setUnitForm] = useState(emptyUnitForm);
  const [categoryError, setCategoryError] = useState("");
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
      const statusName = isVi ? (STATUS_VI_MAP[nextStatus] || nextStatus) : (STATUS_EN_MAP[nextStatus] || nextStatus);
      setNotice(
        isVi
          ? `Đã đổi trạng thái kho ${unit.unitCode} sang ${statusName}.`
          : `Changed status of unit ${unit.unitCode} to ${statusName}.`
      );
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, physicalStatus: prevStatus } : u))
      );
      setError(
        err?.message ||
          (isVi ? "Không thể cập nhật trạng thái ô kho." : "Unable to update unit status.")
      );
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
      setNotice(
        isVi
          ? `Kho ${unit.unitCode} hiện đã ${nextVal ? "Hiển thị cho khách thuê" : "Ẩn"}.`
          : `Unit ${unit.unitCode} is now ${nextVal ? "Listed for rent" : "Hidden"}.`
      );
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setUnits((prev) =>
        prev.map((u) => (u.id === unit.id ? { ...u, isListed: !nextVal } : u))
      );
      setError(
        err?.message ||
          (isVi ? "Không thể cập nhật niêm yết." : "Unable to update unit listing status.")
      );
    }
  }

  function openEditUnit(unit) {
    setEditingUnitId(unit.id);
    setPendingDrop(null);
    const { notes, imageUrl } = parseNotesAndImage(unit.notes, unit.imageUrl);
    const cat = getDisplayCategoryName(unit);
    const len = Number(unit.customLengthM ?? unit.lengthM) || 2;
    const wid = Number(unit.customWidthM ?? unit.widthM) || 1.5;
    const hei = Number(unit.customHeightM ?? unit.heightM) || 2.5;
    const area = Number(unit.customAreaM2 ?? unit.areaM2) || (len * wid);
    const matchedTypeId = unit.unitTypeId ? String(unit.unitTypeId) : findBestUnitTypeId(unitTypes, cat, area);

    setUnitForm({
      unitCode: unit.unitCode || "",
      unitTypeId: matchedTypeId,
      categoryName: cat,
      lengthM: len,
      widthM: wid,
      heightM: hei,
      areaId: unit.areaId ? String(unit.areaId) : "",
      floorLabel: unit.floorLabel || "1",
      zoneLabel: unit.zoneLabel || "A",
      physicalStatus: unit.physicalStatus || "available",
      isListed: unit.isListed !== false,
      notes,
      imageUrl,
    });
    setCategoryError("");
    setShowUnitForm(true);
  }

  async function submitUnit(event) {
    event.preventDefault();
    const trimmedCat = (unitForm.categoryName || "").trim();
    if (!trimmedCat) {
      setCategoryError(
        isVi
          ? "Vui lòng chọn hoặc nhập tên loại kho."
          : "Please select or enter a storage category name."
      );
      return;
    }
    const catAnalysis = analyzeStorageCategory(trimmedCat, pricingConfig.categories || []);
    if (!catAnalysis.valid) {
      setCategoryError(
        isVi
          ? "Loại kho không hợp lệ. Vui lòng nhập đúng loại kho lưu trữ (VD: Kho hàng khô, Kho lạnh, Kho hóa chất...)."
          : "Invalid storage category. Please enter a valid storage type (e.g. Dry storage, Cold storage, Chemical storage...)."
      );
      return;
    }
    setCategoryError("");
    setSavingUnit(true);
    setError("");
    try {
      const len = Number(unitForm.lengthM) || 2;
      const wid = Number(unitForm.widthM) || 1.5;
      const hei = Number(unitForm.heightM) || 2.5;
      const areaM2 = Number((len * wid).toFixed(2));
      const chosenCat = trimmedCat || "Kho hàng khô";
      const matchedCat = (pricingConfig.categories || []).find(
        (c) => c.name?.toLowerCase() === chosenCat.toLowerCase()
      );
      const surcharge = Number(matchedCat?.surchargeAmount ?? 0);
      const basePerSqm = Number(pricingConfig.pricePerSquareMeter ?? 100);
      const customMonthlyRate = areaM2 * basePerSqm + surcharge;
      const matchedTypeId = findBestUnitTypeId(unitTypes, chosenCat, areaM2);

      const basePayload = {
        unitTypeId: Number(matchedTypeId) || (unitTypes[0]?.id ? Number(unitTypes[0].id) : 1),
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

      const customDimensions = {
        categoryName: chosenCat,
        storageCategory: chosenCat,
        lengthM: len,
        widthM: wid,
        heightM: hei,
        customLengthM: len,
        customWidthM: wid,
        customHeightM: hei,
        customAreaM2: areaM2,
        customMonthlyRate,
      };
      let createdUnitId = null;
      if (editingUnitId) {
        await managerService.updateUnit(editingUnitId, {
          ...basePayload,
          ...customDimensions,
          unitCode: unitForm.unitCode,
        });
        setNotice(
          isVi
            ? `Đã cập nhật ô kho ${unitForm.unitCode} thành công.`
            : `Successfully updated storage unit ${unitForm.unitCode}.`
        );
      } else {
        // Create unit from drop
        const created = await managerService.createUnit(facilityId, {
          ...basePayload,
          ...customDimensions,
          unitCode: unitForm.unitCode,
        });

        createdUnitId = created?.id;
        if (!createdUnitId) {
          throw new Error(
            isVi
              ? "Không thể lấy mã định danh ô kho sau khi tạo."
              : "Unable to retrieve unit ID after creation."
          );
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
        setNotice(
          isVi
            ? `Đã thêm ô kho mới [${unitForm.unitCode}] vào mặt bằng thành công.`
            : `Successfully added new unit [${unitForm.unitCode}] to floor plan.`
        );
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
      setError(
        err?.message ||
          (isVi ? "Không thể lưu thông tin ô kho." : "Unable to save storage unit.")
      );
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

    const confirmMsg = isVi
      ? `Bạn có chắc chắn muốn xóa kho "${unitCode}" khỏi hệ thống không?`
      : `Are you sure you want to delete unit "${unitCode}" from the system?`;

    if (!window.confirm(confirmMsg)) {
      return;
    }
    setIsDeletingUnit(true);
    try {
      await managerService.deleteUnit(unitId);
      setNotice(
        isVi
          ? `Đã xóa kho ${unitCode} thành công.`
          : `Successfully deleted unit ${unitCode}.`
      );
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
      setError(
        err?.message ||
          (isVi
            ? "Không thể xóa ô kho. Vui lòng kiểm tra ràng buộc hợp đồng."
            : "Unable to delete unit. Please check active contract constraints.")
      );
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
      setNotice(
        isVi ? "Đã lưu sơ đồ mặt bằng thành công." : "Floor plan saved successfully."
      );
      setTimeout(() => setNotice(""), 3500);
      await loadLayout();
    } catch (err) {
      setError(
        err?.message || (isVi ? "Không thể lưu mặt bằng." : "Unable to save floor plan.")
      );
    } finally {
      setSavingLayout(false);
    }
  }

  function openCreateUnitModal(area, unitX, unitY) {
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
    const initialCategory = "Kho hàng khô";
    const initialLen = 2;
    const initialWid = 1.5;
    const initialArea = initialLen * initialWid;
    const matchedTypeId = findBestUnitTypeId(unitTypes, initialCategory, initialArea);

    setPendingDrop({
      area,
      unitX,
      unitY,
      width: 22,
      height: 16,
    });

    setEditingUnitId(null);
    setUnitForm({
      ...emptyUnitForm,
      unitCode: nextCode,
      unitTypeId: matchedTypeId,
      areaId: area.areaId ? String(area.areaId) : "",
      floorLabel,
      zoneLabel,
      categoryName: initialCategory,
      lengthM: initialLen,
      widthM: initialWid,
      heightM: 2.5,
    });
    setCategoryError("");
    setShowUnitForm(true);
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
      setNotice(
        isVi
          ? "Đã di chuyển vị trí kho vào ô lưới. Nhấn 'Lưu mặt bằng' để lưu lại."
          : "Moved unit to grid slot. Click 'Save Floor Plan' to save."
      );
      setTimeout(() => setNotice(""), 3500);
      return;
    }

    if (data.type === "new-unit") {
      openCreateUnitModal(area, unitX, unitY);
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
                placeholder={isVi ? "Tìm mã kho..." : "Search unit code..."}
                className="rounded-xl border border-[#dfe7f5] px-3 py-1.5 text-xs outline-none focus:border-zinc-400"
              />
              <SelectDropdown
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-48"
              >
                <option value="">{t("manager.all_statuses", isVi ? "Tất cả trạng thái" : "All Statuses")}</option>
                {STATUS_OPTIONS.map(([value]) => (
                  <option key={value} value={value}>
                    {isVi ? (STATUS_VI_MAP[value] || value) : (STATUS_EN_MAP[value] || value)}
                  </option>
                ))}
              </SelectDropdown>
            </div>
          </div>

          <div className="mt-3 overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-slate-200 text-[11px] font-bold uppercase tracking-wider text-slate-500">
                  <th className="px-3.5 py-2.5 w-[11%]">{t("common.unit", isVi ? "Mã kho" : "Unit")}</th>
                  <th className="px-3.5 py-2.5 w-[14%]">{t("table.type", isVi ? "Loại kho" : "Type")}</th>
                  <th className="px-3.5 py-2.5 w-[15%]">{t("table.size", isVi ? "Kích thước" : "Size")}</th>
                  <th className="px-3.5 py-2.5 w-[14%] text-right font-bold text-blue-700">
                    {isVi ? "Giá thuê / tháng" : "Monthly Rate"}
                  </th>
                  <th className="px-3.5 py-2.5 w-[13%]">{t("table.zone", isVi ? "Khu vực / Tầng" : "Zone / Floor")}</th>
                  <th className="px-3.5 py-2.5 w-[15%]">{t("common.status", isVi ? "Trạng thái" : "Status")}</th>
                  <th className="px-3.5 py-2.5 w-[10%]">{isVi ? "Hiển thị" : "Listed"}</th>
                  <th className="px-3.5 py-2.5 w-[12%] text-right">{t("manager.actions", isVi ? "Thao tác" : "Actions")}</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loadingUnits ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      {t("manager.loading_units", isVi ? "Đang tải danh sách ô kho..." : "Loading storage units...")}
                    </td>
                  </tr>
                ) : units.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-6 text-center text-slate-400">
                      {t("manager.no_units_found", isVi ? "Không tìm thấy ô kho nào." : "No storage units found.")}
                    </td>
                  </tr>
                ) : (
                  units.map((unit) => {
                    const displayCategory = getDisplayCategoryName(unit);
                    const len = Number(unit.customLengthM ?? unit.lengthM ?? 2);
                    const wid = Number(unit.customWidthM ?? unit.widthM ?? 1.5);
                    const area = Number(unit.customAreaM2 ?? unit.areaM2 ?? (len * wid).toFixed(2));
                    const displaySize = `${len}m × ${wid}m (${area} m²)`;

                    const matchedCat = (pricingConfig.categories || []).find(
                      (c) => c.name?.toLowerCase() === displayCategory.toLowerCase()
                    );
                    const surcharge = Number(matchedCat?.surchargeAmount ?? unit.categorySurcharge ?? 0);
                    const basePerSqm = Number(unit.basePricePerSqm ?? pricingConfig.pricePerSquareMeter ?? 100);
                    const calculatedPrice = Number(unit.customMonthlyRate || (area * basePerSqm + surcharge));

                    return (
                    <tr key={unit.id} className="hover:bg-slate-50/70 transition-colors">
                      <td className="px-3.5 py-2.5 font-bold text-slate-900">{unit.unitCode}</td>
                      <td className="px-3.5 py-2.5 font-semibold text-slate-800" title={displayCategory}>
                        <span className="inline-flex items-center rounded-md bg-slate-100 border border-slate-200 px-2 py-0.5 text-[11px] font-bold text-slate-800">
                          {displayCategory}
                        </span>
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-700 font-mono text-[11px]" title={displaySize}>{displaySize}</td>
                      <td className="px-3.5 py-2.5 text-right font-mono text-xs font-bold text-blue-600">
                        {formatVnd(calculatedPrice)}
                      </td>
                      <td className="px-3.5 py-2.5 text-slate-600">
                        <span className="font-semibold text-slate-800">{unit.zoneLabel || "A"}</span> / {isVi ? "Tầng" : "Floor"} {unit.floorLabel || "1"}
                      </td>
                      <td className="px-3.5 py-2.5">
                        <SelectDropdown
                          value={unit.physicalStatus}
                          options={unitStatusOptions}
                          onChange={(e) => handleQuickStatusChange(unit, e.target?.value ?? e)}
                          className="w-40"
                        />
                      </td>
                      <td className="px-3.5 py-2.5">
                        <label className="inline-flex items-center gap-1.5 cursor-pointer text-xs">
                          <input
                            type="checkbox"
                            checked={Boolean(unit.isListed)}
                            onChange={() => handleToggleListed(unit)}
                            className="h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                          />
                          <span className={unit.isListed ? "font-semibold text-emerald-700" : "text-slate-400"}>
                            {unit.isListed ? (isVi ? "Hiển thị" : "Listed") : (isVi ? "Ẩn" : "Hidden")}
                          </span>
                        </label>
                      </td>
                      <td className="px-3.5 py-2.5 text-right space-x-1.5">
                        <button
                          type="button"
                          onClick={() => openEditUnit(unit)}
                          className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-2.5 py-1 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                        >
                          {t("common.edit", isVi ? "Sửa" : "Edit")}
                        </button>
                        <button
                          type="button"
                          disabled={isDeletingUnit}
                          onClick={() => handleDeleteUnit(unit.id)}
                          className="inline-flex items-center gap-1 rounded-lg border border-rose-200 bg-rose-50 px-2.5 py-1 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer disabled:opacity-40"
                        >
                          <Trash2 size={12} />
                          <span>{t("common.delete", isVi ? "Xóa" : "Delete")}</span>
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
                {isVi
                  ? `Sơ đồ phân bổ kho (${layout?.facilityName || "Cơ sở"})`
                  : `Storage Floor Plan (${layout?.facilityName || "Facility"})`}
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
                <span>{savingLayout ? (isVi ? "Đang lưu..." : "Saving...") : (isVi ? "Lưu mặt bằng" : "Save Floor Plan")}</span>
              </button>
            </div>
          </div>

          {/* Clean 1-Item Drag & Drop Bar */}
          <div className="mt-3 flex flex-wrap items-center justify-between gap-3 rounded-xl border border-blue-200 bg-blue-50/60 p-3 shadow-xs">
            <div>
              <p className="text-xs font-bold text-blue-900">
                {isVi ? "Kéo thả ô kho rỗng vào lưới mặt bằng" : "Drag and drop empty unit into grid"}
              </p>
              <p className="text-[11px] text-blue-700">
                {isVi
                  ? "Kéo ô bên cạnh và thả vào một vị trí ô lưới nét đứt để tạo và cấu hình thông tin ô kho mới:"
                  : "Drag the unit card and drop onto a dashed slot to create and configure a new unit:"}
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
                title={isVi ? "Kéo ô này thả vào vị trí lưới nét đứt trên mặt bằng" : "Drag this card onto a dashed slot on the floor plan"}
              >
                <GripVertical size={14} className="text-blue-500" />
                <span>{isVi ? "Ô kho rỗng (Kéo vào mặt bằng)" : "Empty unit (Drag to floor plan)"}</span>
              </div>
            </div>
          </div>

          {loadingLayout ? (
            <div className="mt-4 rounded-xl border border-dashed border-[#dfe7f5] p-10 text-center text-xs text-[#8996a9]">
              {t("manager.rendering_floor_plan", isVi ? "Đang kết xuất mặt bằng..." : "Rendering floor plan...")}
            </div>
          ) : (
            <>
              {/* Floor Plan Canvas */}
              <div className="mt-4 overflow-x-auto rounded-2xl border border-[#c9d9ef] bg-[radial-gradient(circle_at_20%_10%,#eff7ff,transparent_38%),linear-gradient(145deg,#cbdcf0,#eaf2fb_45%,#d7e4f3)] p-4 shadow-inner">
                <div className="relative min-h-[480px] min-w-[820px] overflow-hidden rounded-xl border border-white/80 bg-[linear-gradient(rgba(65,103,146,0.12)_1px,transparent_1px),linear-gradient(90deg,rgba(65,103,146,0.12)_1px,transparent_1px)] bg-[size:32px_32px]">
                  {/* Floor Plan Badge */}
                  <div className="absolute left-5 top-3.5 z-20 rounded-lg bg-slate-900/90 px-3.5 py-1.5 text-[10px] font-bold text-white shadow-md">
                    {layout?.facilityName || "FACILITY"} · {isVi ? "BẢN ĐỒ MẶT BẰNG" : "FLOOR PLAN"}
                  </div>

                  {/* Legend */}
                  <div className="absolute bottom-3.5 left-5 z-20 flex items-center gap-4 text-[10px] font-medium text-slate-700 bg-white/85 backdrop-blur-xs px-3 py-1.5 rounded-lg border border-white/60 shadow-xs">
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-emerald-500 shadow-xs" />
                      {isVi ? "Khả dụng" : "Available"} ({mapPositions.filter((p) => p.physicalStatus === "available").length})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-indigo-500 shadow-xs" />
                      {isVi ? "Đang thuê" : "Occupied"} ({mapPositions.filter((p) => p.physicalStatus === "occupied").length})
                    </span>
                    <span className="flex items-center gap-1.5">
                      <span className="inline-block h-2.5 w-2.5 rounded-full bg-amber-500 shadow-xs" />
                      {isVi ? "Đã đặt" : "Reserved"} ({mapPositions.filter((p) => p.physicalStatus === "reserved").length})
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

                    // Grid System: 6 columns x 7 rows = 42 slots per zone (fills entire zone height & width)
                    const GRID_COLS = 6;
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
                          <span className="text-[9px] font-semibold text-slate-500">{zoneUnits.length} {isVi ? "ô kho" : "units"}</span>
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
                                    title={`${occupyingUnit.unitCode} (${occupyingUnit.physicalStatus}) - ${isVi ? "Kéo để đổi ô lưới" : "Drag to change slot"}`}
                                    className={`absolute flex flex-col items-center justify-center rounded-lg border text-[10px] font-bold tracking-tight transition duration-150 cursor-grab hover:scale-102 hover:shadow-md overflow-hidden ${mapStatusStyle(occupyingUnit.physicalStatus)} ${
                                      selected ? "ring-2 ring-blue-600 shadow-md z-20" : "z-10 shadow-xs"
                                    }`}
                                    style={{
                                      left: `${slotX * scale}px`,
                                      top: `${slotY * scale}px`,
                                      width: `${slotW * scale * (Number(occupyingUnit.areaM2 || 0) >= 10 ? 1.45 : Number(occupyingUnit.areaM2 || 0) >= 6 ? 1.25 : 1)}px`,
                                      height: `${slotH * scale * (Number(occupyingUnit.areaM2 || 0) >= 10 ? 1.35 : 1)}px`,
                                    }}
                                  >
                                    <span className="truncate max-w-full px-1">{occupyingUnit.unitCode}</span>
                                    <span className="truncate max-w-full px-0.5 text-[8px] font-normal opacity-75">{formatMapStatusLabel(occupyingUnit.physicalStatus)}</span>
                                  </div>
                                );
                              }

                              // Empty dashed slot (click or drop to create unit)
                              return (
                                <div
                                  key={`slot-${r}-${c}`}
                                  onClick={() => openCreateUnitModal(area, slotX, slotY)}
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
                                  title={isVi ? `Ô lưới trống (Hàng ${r + 1}, Cột ${c + 1}) - Bấm hoặc thả ô kho vào đây để tạo mới` : `Empty slot (Row ${r + 1}, Col ${c + 1}) - Click or drop unit here to create`}
                                >
                                  <span className="text-[11px] font-bold select-none opacity-60">
                                    {isHovered ? (isVi ? "+ Thả" : "+ Drop") : "+"}
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
                      {isVi ? `Đang chọn: ${selectedUnit.unitCode}` : `Selected: ${selectedUnit.unitCode}`}
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
                      {isVi ? "Chỉnh sửa thông tin kho" : "Edit Unit Details"}
                    </button>
                    <button
                      type="button"
                      disabled={isDeletingUnit}
                      onClick={() => handleDeleteUnit(selectedUnit.unitId)}
                      className="rounded-lg border border-rose-200 bg-rose-50 px-3 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition cursor-pointer"
                    >
                      {isVi ? "Xóa kho này" : "Delete This Unit"}
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
                  {editingUnitId ? (isVi ? "Chỉnh sửa ô kho" : "Edit Storage Unit") : (isVi ? "Thêm ô kho mới" : "Add New Storage Unit")}
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
                      {isVi ? "Mã kho *" : "Unit Code *"}
                    </label>
                    <input
                      required
                      value={unitForm.unitCode}
                      onChange={(e) => setUnitForm((p) => ({ ...p, unitCode: e.target.value.toUpperCase() }))}
                      className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 px-3 py-2 text-xs font-mono font-bold text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-500 dark:bg-zinc-800"
                      placeholder={isVi ? "VD: A-101" : "e.g. A-101"}
                    />
                  </div>

                  <div>
                    <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                      {isVi ? "Trạng thái" : "Status"}
                    </label>
                    <SelectDropdown
                      value={unitForm.physicalStatus}
                      options={unitStatusOptions}
                      onChange={(e) => setUnitForm((p) => ({ ...p, physicalStatus: e.target?.value ?? e }))}
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Row 2: Loại kho (Combobox thông minh) */}
                <div>
                  <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                    {isVi ? "Loại kho * (Chọn từ danh sách hoặc nhập mới)" : "Storage Category * (Select from list or enter new)"}
                  </label>
                  <CustomCombobox
                    value={unitForm.categoryName}
                    onChange={(val) => {
                      setUnitForm((p) => ({ ...p, categoryName: val }));
                      if (categoryError) setCategoryError("");
                    }}
                    options={pricingConfig.categories || []}
                    error={categoryError}
                    placeholder={isVi ? "Chọn hoặc nhập tên loại kho..." : "Select or enter category name..."}
                    required
                  />
                </div>

                <div>
                  <div className="grid grid-cols-3 gap-2.5">
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        {isVi ? "Chiều dài (m) *" : "Length (m) *"}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        required
                        placeholder="VD: 10"
                        value={unitForm.lengthM}
                        onChange={(e) => setUnitForm((p) => ({ ...p, lengthM: e.target.value === "" ? "" : Number(e.target.value) }))}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        {isVi ? "Chiều rộng (m) *" : "Width (m) *"}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        required
                        placeholder="VD: 2"
                        value={unitForm.widthM}
                        onChange={(e) => setUnitForm((p) => ({ ...p, widthM: e.target.value === "" ? "" : Number(e.target.value) }))}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                    <div>
                      <label className="block font-semibold text-slate-700 dark:text-zinc-300 mb-1">
                        {isVi ? "Chiều cao trần (m)" : "Ceiling Height (m)"}
                      </label>
                      <input
                        type="number"
                        step="0.1"
                        min="0.5"
                        placeholder="VD: 2.5"
                        value={unitForm.heightM}
                        onChange={(e) => setUnitForm((p) => ({ ...p, heightM: e.target.value === "" ? "" : Number(e.target.value) }))}
                        className="w-full rounded-xl border border-slate-200 dark:border-zinc-700 bg-white dark:bg-zinc-900 px-3 py-2 text-xs font-semibold text-slate-900 dark:text-zinc-100 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
                      />
                    </div>
                  </div>
                  <p className="mt-1 text-[11px] text-slate-500 dark:text-zinc-400">
                    {isVi
                      ? "💡 Diện tích sàn tính bằng Dài × Rộng (m²). Chiều cao trần để tính thể tích chứa đồ (m³)."
                      : "💡 Floor area = Length × Width (m²). Ceiling height is used for volume (m³)."}
                  </p>
                </div>

                {/* Minimalist Price & Area Card */}
                {(() => {
                  const len = Math.max(0, Number(unitForm.lengthM) || 0);
                  const wid = Math.max(0, Number(unitForm.widthM) || 0);
                  const area = Number((len * wid).toFixed(2));
                  const matchedCat = (pricingConfig.categories || []).find(
                    (c) => c.name?.toLowerCase() === (unitForm.categoryName || "").trim().toLowerCase()
                  );
                  const surcharge = Number(matchedCat?.surchargeAmount ?? 0);
                  const basePerSqm = Number(pricingConfig.pricePerSquareMeter ?? 100);
                  const totalMonthly = area * basePerSqm + surcharge;

                  return (
                    <div className="rounded-xl border border-slate-200/80 bg-slate-50 p-4 text-xs space-y-2.5 shadow-2xs">
                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">{isVi ? "Diện tích mặt sàn" : "Floor Area"}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-slate-400 text-[11px]">({len}m × {wid}m)</span>
                          <strong className="text-sm font-bold text-slate-900">{area.toFixed(1)} m²</strong>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <span className="text-slate-600 font-medium">{isVi ? "Phụ phí loại kho" : "Category Surcharge"}</span>
                        <span className="font-semibold text-slate-800">
                          {surcharge > 0 ? `+ ${surcharge.toLocaleString(isVi ? "vi-VN" : "en-US")} ${isVi ? "đ" : "₫"}` : `+ 0 ${isVi ? "đ" : "₫"}`}
                        </span>
                      </div>

                      <div className="border-t border-slate-200/80 pt-2.5 flex items-center justify-between">
                        <span className="font-bold text-slate-800 text-xs">{isVi ? "Giá thuê / tháng" : "Monthly Rate"}</span>
                        <span className="text-base font-extrabold text-blue-600">
                          {totalMonthly.toLocaleString(isVi ? "vi-VN" : "en-US")} {isVi ? "đ" : "₫"}
                        </span>
                      </div>
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
                    <span>{isVi ? "Hiển thị cho khách thuê" : "Listed for rent"}</span>
                  </label>
                </div>

                {/* Image Upload & URL */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isVi ? "Hình ảnh ô kho" : "Unit Image"}
                  </label>
                  <div className="flex items-center gap-2">
                    <input
                      type="url"
                      value={unitForm.imageUrl}
                      onChange={(e) => setUnitForm((p) => ({ ...p, imageUrl: e.target.value }))}
                      placeholder={isVi ? "Dán link ảnh (https://...)" : "Paste image link (https://...)"}
                      className="flex-1 rounded-xl border border-slate-200 px-3 py-2 text-xs outline-none focus:border-blue-500"
                    />
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="inline-flex items-center gap-1 rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer shrink-0"
                    >
                      <Upload size={13} />
                      <span>{isVi ? "Tải ảnh" : "Upload"}</span>
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
                          {isVi ? "Đã chọn ảnh ô kho" : "Unit image selected"}
                        </span>
                        <button
                          type="button"
                          onClick={() => setUnitForm((p) => ({ ...p, imageUrl: "" }))}
                          className="text-[11px] text-rose-600 font-semibold hover:underline cursor-pointer"
                        >
                          {isVi ? "Xóa ảnh" : "Remove image"}
                        </button>
                      </div>
                    </div>
                  )}
                </div>

                {/* Notes */}
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">
                    {isVi ? "Ghi chú" : "Notes"}
                  </label>
                  <input
                    value={unitForm.notes}
                    onChange={(e) => setUnitForm((p) => ({ ...p, notes: e.target.value }))}
                    placeholder={isVi ? "Ghi chú vị trí, gần thang máy / cửa ra vào..." : "Location notes, near elevator / door..."}
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
                  {isVi ? "Hủy bỏ" : "Cancel"}
                </button>
                <button
                  type="submit"
                  disabled={savingUnit}
                  className="rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 px-5 py-2 text-xs font-bold shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  {savingUnit ? (isVi ? "Đang lưu..." : "Saving...") : editingUnitId ? (isVi ? "Cập nhật kho" : "Update Unit") : (isVi ? "Tạo ô kho" : "Create Unit")}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
}

