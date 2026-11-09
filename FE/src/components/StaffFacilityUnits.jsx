import { useLanguage } from "../context/LanguageContext";
import { useEffect, useMemo, useRef, useState } from "react";
import staffFacilityService from "../api/staffFacilityService";
import StaffUnitStatus from "./StaffUnitStatus";

const STATUS_CONFIG = {
  available: {
    label: "Sẵn sàng",
    badge: "border-emerald-200 bg-emerald-50 text-emerald-700",
    dot: "bg-emerald-500",
  },
  occupied: {
    label: "Đang thuê",
    badge: "border-blue-200 bg-blue-50 text-blue-700",
    dot: "bg-blue-500",
  },
  reserved: {
    label: "Giữ chỗ",
    badge: "border-amber-200 bg-amber-50 text-amber-700",
    dot: "bg-amber-500",
  },
  cleaning: {
    label: "Vệ sinh",
    badge: "border-purple-200 bg-purple-50 text-purple-700",
    dot: "bg-purple-500",
  },
  maintenance: {
    label: "Bảo trì",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
  under_maintenance: {
    label: "Đang sửa chữa",
    badge: "border-rose-200 bg-rose-50 text-rose-700",
    dot: "bg-rose-500",
  },
};

function compactUnitType(unitTypeName) {
  const name = String(unitTypeName || "").toLowerCase();
  const area = String(unitTypeName || "").match(/\d+(?:[.,]\d+)?\s*m[²2]?/i)?.[0]?.replace("m2", "m²") || "";
  const size = name.includes("extra large") ? "XL" : name.includes("large") ? "L" : name.includes("medium") ? "M" : name.includes("small") ? "S" : name.includes("mini") ? "MN" : "ST";
  const condition = name.includes("seafood") || name.includes("freeze") || name.includes("cold") ? "C" : name.includes("warm") || name.includes("heat") ? "W" : name.includes("climate") ? "CL" : "D";
  return [size, condition, area].filter(Boolean).join(" · ");
}

export default function StaffFacilityUnits({ initialFacilityId = "1" }) {
  const { t, translateStatus, lang } = useLanguage();
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
      setError("Mã cơ sở không hợp lệ.");
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
        setError(err.message || "Không thể tải danh sách ô kho của cơ sở.");
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
      {/* Thanh công cụ lọc và tìm kiếm */}
      <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-100">
        <div className="flex flex-wrap items-center gap-1.5 text-xs">
          <button
            type="button"
            onClick={() => setActiveFilter("all")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
              activeFilter === "all"
                ? "bg-zinc-900 text-white"
                : "bg-slate-100 text-slate-600 hover:bg-slate-200"
            }`}
          >
            {t("common.all", "Tất cả")} ({units.length})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("available")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "available"
                ? "bg-emerald-600 text-white"
                : "bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
            {t("status.available", "Sẵn sàng")} ({counts.available || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("occupied")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "occupied"
                ? "bg-blue-600 text-white"
                : "bg-blue-50 text-blue-700 hover:bg-blue-100 border border-blue-200/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-blue-500"></span>
            {t("status.occupied", "Đang thuê")} ({counts.occupied || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("cleaning")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "cleaning"
                ? "bg-purple-600 text-white"
                : "bg-purple-50 text-purple-700 hover:bg-purple-100 border border-purple-200/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-purple-500"></span>
            {t("status.cleaning", "Vệ sinh")} ({counts.cleaning || 0})
          </button>
          <button
            type="button"
            onClick={() => setActiveFilter("maintenance")}
            className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition flex items-center gap-1.5 cursor-pointer ${
              activeFilter === "maintenance"
                ? "bg-rose-600 text-white"
                : "bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200/60"
            }`}
          >
            <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span>
            {t("status.maintenance", "Bảo trì")} ({(counts.maintenance || 0) + (counts.under_maintenance || 0)})
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
              placeholder={t("staff.search_unit_placeholder", "Tìm mã kho, tên khách...")}
              className="w-40 sm:w-52 rounded-lg border border-slate-200 bg-slate-50/80 pl-6 pr-2.5 py-1 text-xs text-slate-800 placeholder-slate-400 outline-none focus:border-zinc-900 focus:bg-white"
            />
          </div>

          <button
            type="button"
            disabled={loading}
            onClick={() => loadUnits(Number(facilityId), false)}
            className="flex items-center rounded-lg border border-slate-200 bg-white px-2 py-1 text-slate-600 hover:text-slate-900 transition disabled:opacity-50 cursor-pointer"
            title={t("common.refresh", "Làm mới danh sách")}
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
        <div className="py-8 text-center text-xs text-slate-400">{t("common.loading", "Đang tải...")}</div>
      )}

      {!loading && !error && searched && filteredUnits.length === 0 && (
        <div className="my-4 rounded-xl border border-dashed border-slate-200 p-8 text-center text-xs text-slate-400">
          {t("common.no_data", "Không tìm thấy ô kho nào phù hợp.")}
        </div>
      )}

      {filteredUnits.length > 0 && (
        <div className="mt-3 space-y-3">
          <div className="overflow-hidden rounded-xl border border-slate-200 bg-white">
            <div className="grid grid-cols-[72px_minmax(0,1fr)_88px_72px] gap-2 border-b border-slate-100 bg-slate-50 px-3 py-2 text-[10px] font-extrabold uppercase tracking-wide text-slate-500 sm:grid-cols-[82px_minmax(0,1.3fr)_92px_minmax(0,1fr)_100px]">
              <span>{t("common.unit", "Ô kho")}</span>
              <span>{t("table.type", "Loại kho")}</span>
              <span>{t("common.status", "Trạng thái")}</span>
              <span className="hidden sm:block">{t("common.customer_upper", "KHÁCH HÀNG")}</span>
              <span className="text-right">{t("common.manage_upper", "THAO TÁC")}</span>
            </div>

            <div className="max-h-[440px] divide-y divide-slate-100 overflow-y-auto">
              {filteredUnits.map((unit) => {
                const status = STATUS_CONFIG[String(unit.status || "").toLowerCase()] || STATUS_CONFIG.available;
                const expanded = expandedUnitId === unit.unitId;
                return (
                  <div key={unit.unitId} className="grid grid-cols-[72px_minmax(0,1fr)_88px_72px] items-center gap-2 px-3 py-2.5 text-xs transition hover:bg-blue-50/30 sm:grid-cols-[82px_minmax(0,1.3fr)_92px_minmax(0,1fr)_100px]">
                    <span className="font-mono font-bold text-slate-900">{unit.unitCode || `#${unit.unitId}`}</span>
                    <span className="truncate text-slate-600" title={unit.unitTypeName}>{compactUnitType(unit.unitTypeName)}</span>
                    <span className={`inline-flex w-fit items-center gap-1 rounded-full border px-2 py-0.5 text-[10px] font-bold ${status.badge}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${status.dot}`} />
                      {translateStatus ? translateStatus(unit.status) : status.label}
                    </span>
                    <span className="hidden truncate text-slate-600 sm:block">{unit.customerName || "—"}</span>
                    <button
                      type="button"
                      onClick={() => setExpandedUnitId(expanded ? null : unit.unitId)}
                      className={`justify-self-end rounded-lg border px-2.5 py-1 text-[11px] font-semibold transition cursor-pointer ${
                        expanded
                          ? "border-zinc-900 bg-zinc-900 text-white"
                          : "border-slate-200 text-slate-700 hover:bg-slate-100 hover:text-slate-900"
                      }`}
                    >
                      {expanded ? t("common.close", "Đóng") : t("common.detail", "Chi tiết")}
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Module mở rộng điều phối trạng thái ô kho khi được chọn */}
          {expandedUnitId && (() => {
            const unit = units.find((u) => u.unitId === expandedUnitId);
            if (!unit) return null;
            return (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm animate-in fade-in">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 mb-3">
                  <div className="flex items-center gap-2">
                    <span className="font-mono font-bold text-sm text-slate-900">
                      {lang === "vi" ? "Quản lý ô kho" : "Manage Unit"} {unit.unitCode || `#${unit.unitId}`}
                    </span>
                    <span className="text-xs text-slate-500">
                      ({unit.unitTypeName || (lang === "vi" ? "Ô kho tiêu chuẩn" : "Standard Unit")})
                    </span>
                  </div>
                  <button
                    type="button"
                    onClick={() => setExpandedUnitId(null)}
                    className="text-xs font-semibold text-slate-500 hover:text-slate-800 cursor-pointer"
                  >
                    {lang === "vi" ? "✕ Đóng" : "✕ Close"}
                  </button>
                </div>
                <div>
                  <div className="bg-slate-50/80 p-4 rounded-xl border border-slate-200">
                    <h4 className="text-xs font-bold text-slate-800 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                      <span className="material-symbols-outlined text-[16px] text-zinc-900">
                        tune
                      </span>
                      <span>{lang === "vi" ? "Điều phối trạng thái kho" : "Manage Unit Physical Status"}</span>
                    </h4>
                    <StaffUnitStatus
                      unit={{ ...unit, facilityId: unit.facilityId || facilityId }}
                      onUpdated={(updated) =>
                        setUnits((current) =>
                          current.map((entry) =>
                            entry.unitId === updated.unitId ? updated : entry
                          )
                        )
                      }
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
