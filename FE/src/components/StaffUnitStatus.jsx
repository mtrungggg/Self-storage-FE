import { useRef, useState } from "react";
import staffFacilityService from "../api/staffFacilityService";

const STATUS_PILLS = [
  {
    key: "available",
    label: "Available",
    icon: "check_circle",
    activeClass: "bg-emerald-600 text-white border-emerald-600 ring-2 ring-emerald-200 shadow-sm",
    idleClass: "bg-emerald-50 text-emerald-800 border-emerald-200 hover:bg-emerald-100",
  },
  {
    key: "cleaning",
    label: "Cleaning",
    icon: "cleaning_services",
    activeClass: "bg-amber-600 text-white border-amber-600 ring-2 ring-amber-200 shadow-sm",
    idleClass: "bg-amber-50 text-amber-800 border-amber-200 hover:bg-amber-100",
  },
  {
    key: "maintenance",
    label: "Maintenance",
    icon: "build",
    activeClass: "bg-rose-600 text-white border-rose-600 ring-2 ring-rose-200 shadow-sm",
    idleClass: "bg-rose-50 text-rose-800 border-rose-200 hover:bg-rose-100",
  },
];

export default function StaffUnitStatus({ unit, onUpdated }) {
  const currentStatus = String(unit.physicalStatus || unit.status || "").toLowerCase();
  const isOccupiedOrReserved = currentStatus === "occupied" || currentStatus === "reserved";
  const [loadingStatus, setLoadingStatus] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const lock = useRef(false);

  async function handleSelectStatus(nextStatus) {
    if (lock.current || isOccupiedOrReserved) return;
    if (currentStatus === nextStatus || (nextStatus === "maintenance" && currentStatus === "under_maintenance")) return;

    const targetUnitId = unit.unitId || unit.id;
    const targetFacilityId = unit.facilityId;
    if (!targetFacilityId || !targetUnitId) {
      setError("Facility ID and Unit ID are required to update physical status.");
      return;
    }

    lock.current = true;
    setLoadingStatus(nextStatus);
    setError("");
    setNotice("");

    try {
      await staffFacilityService.updatePhysicalStatus(targetFacilityId, targetUnitId, {
        physicalStatus: nextStatus,
      });
      onUpdated?.({ ...unit, status: nextStatus, physicalStatus: nextStatus });
      setNotice(`Unit status updated to ${nextStatus.toUpperCase()} successfully.`);
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setError(err?.message || "Unable to update the unit physical status.");
    } finally {
      lock.current = false;
      setLoadingStatus(null);
    }
  }

  return (
    <div className="mt-3 border-t border-slate-200/80 pt-3 text-xs">
      <span className="block font-semibold text-slate-700 mb-2">
        Physical Status <span className="font-normal text-slate-400">· 1-Click Status Pills</span>
      </span>

      {isOccupiedOrReserved && (
        <div className="mb-2.5 rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-[11px] text-amber-900">
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <span className="material-symbols-outlined text-[15px] text-amber-700">lock</span>
            <span>Kho đang có khách ({currentStatus === "occupied" ? "Occupied · Đang thuê" : "Reserved · Đã đặt"})</span>
          </div>
          <p className="text-amber-800">
            Trạng thái vật lý bị khóa để bảo vệ hợp đồng của khách. Vui lòng sử dụng mục <strong>Tạo lệnh bảo trì</strong> bên cạnh nếu kho gặp sự cố.
          </p>
        </div>
      )}

      {/* 3 Interactive 1-Click Status Pills */}
      <div className="flex flex-wrap gap-2">
        {STATUS_PILLS.map((btn) => {
          const isCurrent =
            currentStatus === btn.key ||
            (btn.key === "maintenance" && (currentStatus === "under_maintenance" || currentStatus === "damaged"));
          const isButtonLoading = loadingStatus === btn.key;

          return (
            <button
              key={btn.key}
              type="button"
              disabled={isOccupiedOrReserved || loadingStatus != null || isCurrent}
              onClick={() => handleSelectStatus(btn.key)}
              className={`flex items-center gap-1.5 rounded-xl border px-3 py-1.5 text-xs font-bold transition shadow-2xs ${
                isCurrent
                  ? btn.activeClass
                  : isOccupiedOrReserved
                  ? "opacity-40 cursor-not-allowed bg-slate-100 text-slate-400 border-slate-200"
                  : btn.idleClass
              }`}
            >
              <span className="material-symbols-outlined text-[15px]">
                {isButtonLoading ? "hourglass_empty" : btn.icon}
              </span>
              <span>{isButtonLoading ? "Saving..." : btn.label}</span>
            </button>
          );
        })}
      </div>

      {error && <p role="alert" className="mt-2 text-[11px] font-semibold text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-2 text-[11px] font-semibold text-emerald-700">{notice}</p>}
    </div>
  );
}
