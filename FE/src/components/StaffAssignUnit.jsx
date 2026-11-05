import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import staffReservationService from "../api/staffReservationService";
import staffFacilityService from "../api/staffFacilityService";

export default function StaffAssignUnit({
 reservationId, facilityId, currentUnitCode, onAssigned }) {
  const [storageUnitId, setStorageUnitId] = useState("");
  const { t } = useLanguage();
  const [availableUnits, setAvailableUnits] = useState([]);
  const [unitsLoading, setUnitsLoading] = useState(Boolean(facilityId));
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const lock = useRef(false);

  useEffect(() => {
    let active = true;
    if (!facilityId) return undefined;
    setUnitsLoading(true);
    staffFacilityService.getUnits(facilityId)
      .then((units) => {
        if (active) {
          const filtered = units.filter(
            (unit) =>
              String(unit.status || unit.physicalStatus).toLowerCase() === "available"
          );
          setAvailableUnits(filtered);
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Không thể tải danh sách ô kho trống.");
      })
      .finally(() => {
        if (active) setUnitsLoading(false);
      });
    return () => {
      active = false;
    };
  }, [facilityId]);

  async function submit(event) {
    event.preventDefault();
    const unitId = Number(storageUnitId);
    if (!Number.isInteger(unitId) || unitId <= 0) {
      setError("Vui lòng chọn một ô kho hợp lệ.");
      return;
    }
    if (lock.current) return;

    lock.current = true;
    setLoading(true);
    setError("");
    try {
      await staffReservationService.assignUnit(reservationId, unitId);
      setStorageUnitId("");
      if (onAssigned) {
        await onAssigned();
      }
    } catch (err) {
      setError(err.message || "Không thể đổi ô kho. Vui lòng thử lại.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  return (
    <form onSubmit={submit} className="mt-2 text-xs">
      <div className="flex flex-wrap items-end gap-2">
        <label className="font-semibold text-slate-700 flex-1 min-w-[200px]">
          <span className="block mb-1 text-[11px] text-amber-900 font-bold">
            {currentUnitCode
              ? `Chọn ô kho thay thế cho kho hiện tại (${currentUnitCode}):`
              : "Chọn ô kho khả dụng để gán cho đơn đặt:"}
          </span>
          {facilityId ? (
            <SelectDropdown
              required
              disabled={unitsLoading}
              value={storageUnitId}
              onChange={(event) => setStorageUnitId(event.target.value)}
              className="mt-0.5 block w-full rounded-lg border border-[#dfe7f5] bg-white px-3 py-1.5 text-[#0b1c30] outline-none focus:border-zinc-900 dark:border-zinc-100"
            >
              <option value="">
                {unitsLoading ? "Đang tải danh sách kho..." : "-- Chọn ô kho tương đương khả dụng --"}
              </option>
              {availableUnits.map((unit) => (
                <option key={unit.unitId} value={unit.unitId}>
                  Kho {unit.unitCode} · {unit.unitTypeName || "Tiêu chuẩn"} {unit.dimensions ? `(${unit.dimensions})` : ""}
                </option>
              ))}
            </SelectDropdown>
          ) : (
            <input
              type="number"
              min="1"
              step="1"
              required
              placeholder="Nhập ID ô kho..."
              value={storageUnitId}
              onChange={(event) => setStorageUnitId(event.target.value)}
              className="mt-0.5 block w-full rounded-lg border border-[#dfe7f5] bg-white px-3 py-1.5 text-[#0b1c30] outline-none focus:border-zinc-900 dark:border-zinc-100"
            />
          )}
        </label>
        <button
          type="submit"
          disabled={loading || !storageUnitId}
          className="rounded-lg bg-zinc-900 text-white hover:bg-blue-700 px-3.5 py-1.5 font-bold text-white transition disabled:opacity-50 shadow-xs text-xs whitespace-nowrap"
        >
          {loading ? "Đang lưu đổi kho..." : "Xác nhận đổi ô kho"}
        </button>
      </div>
      {error && <p role="alert" className="mt-1 text-red-600 font-semibold">{error}</p>}
      {!unitsLoading && facilityId && availableUnits.length === 0 && !error && (
        <p className="mt-1 text-slate-500 italic">{t("staff.no_available_units", "Không có ô kho trống khả dụng tại cơ sở này để đổi.")}</p>
      )}
    </form>
  );
}
