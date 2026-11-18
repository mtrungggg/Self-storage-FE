import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import staffCheckInApi from "../services/api/staffCheckInApi";

export default function StaffAssignUnit({ reservationId, facilityId, unitTypeId, currentUnitCode, onAssigned }) {
  const [storageUnitId, setStorageUnitId] = useState("");
  const [reason, setReason] = useState("");
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
    staffCheckInApi
      .getUnits({
        facilityId: Number(facilityId),
        status: "available",
        unitTypeId: unitTypeId ? Number(unitTypeId) : undefined,
      })
      .then((units) => {
        if (active) {
          setAvailableUnits(
            units.filter(
              (u) =>
                String(u.physicalStatus || u.status).toLowerCase() === "available" &&
                (!unitTypeId || Number(u.unitTypeId) === Number(unitTypeId))
            )
          );
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
  }, [facilityId, unitTypeId]);

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
      await staffCheckInApi.assignReservationUnit(reservationId, unitId, reason);
      setStorageUnitId("");
      setReason("");
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
          <SelectDropdown
            required
            disabled={unitsLoading || !facilityId}
            value={storageUnitId}
            onChange={(event) => setStorageUnitId(event.target.value)}
            className="mt-0.5 block w-full rounded-lg border border-[#dfe7f5] bg-white px-3 py-1.5 text-[#0b1c30] outline-none focus:border-zinc-900"
          >
            <option value="">
              {unitsLoading ? "Đang tải danh sách kho..." : "-- Chọn ô kho tương đương khả dụng --"}
            </option>
            {availableUnits.map((unit) => (
              <option key={unit.unitId} value={unit.unitId}>
                Kho {unit.unitCode} · {unit.unitTypeName || "Tiêu chuẩn"}
              </option>
            ))}
          </SelectDropdown>
        </label>

        <input
          type="text"
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Lý do đổi kho (tuỳ chọn)"
          maxLength={255}
          className="rounded-lg border border-[#dfe7f5] bg-white px-3 py-1.5 text-xs text-[#0b1c30] outline-none focus:border-zinc-900"
        />

        <button
          type="submit"
          disabled={loading || !facilityId}
          className="rounded-lg bg-amber-600 px-3.5 py-1.5 font-bold text-white shadow-xs transition hover:bg-amber-700 disabled:opacity-50"
        >
          {loading ? t("common.loading", "Đang xử lý...") : "Xác nhận đổi kho"}
        </button>
      </div>
      {error && <p className="mt-1.5 text-[11px] font-medium text-red-600">{error}</p>}
    </form>
  );
}
