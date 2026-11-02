import { useEffect, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import facilityService from "../api/facilityService";
import SupportDropdown from "./SupportDropdown";

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export default function UnitTransferRequest({ agreementId, facilityId }) {
  const [open, setOpen] = useState(false);
  const [unitTypes, setUnitTypes] = useState([]);
  const [typesLoading, setTypesLoading] = useState(false);
  const [requestedUnitTypeId, setRequestedUnitTypeId] = useState("");
  const [requestedEffectiveDate, setRequestedEffectiveDate] = useState(localDate);
  const [reason, setReason] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const lock = useRef(false);

  useEffect(() => {
    if (!open || unitTypes.length > 0) return undefined;
    let active = true;
    setTypesLoading(true);
    facilityService.getUnitTypes()
      .then((data) => { if (active) setUnitTypes(Array.isArray(data) ? data : []); })
      .catch((err) => { if (active) setError(err.message || "Unable to load unit types."); })
      .finally(() => { if (active) setTypesLoading(false); });
    return () => { active = false; };
  }, [open, unitTypes.length]);

  async function submit(event) {
    event.preventDefault();
    const unitTypeId = Number(requestedUnitTypeId);
    if (!Number.isInteger(unitTypeId) || unitTypeId <= 0) {
      setError("Vui lòng chọn loại kho bạn muốn chuyển tới.");
      return;
    }
    if (lock.current) return;
    lock.current = true;
    setLoading(true);
    setError("");
    try {
      const targetFacility = Number(facilityId) || 1;
      const data = await rentalService.requestUnitTransfer(agreementId, {
        requestedUnitTypeId: unitTypeId,
        requestedFacilityId: targetFacility,
        moveOutDate: requestedEffectiveDate,
        moveInDate: requestedEffectiveDate,
        reason: reason.trim() || "Yêu cầu đổi kho",
      });
      setResult(data);
    } catch (err) {
      setError(err.message || "Không thể gửi yêu cầu chuyển kho.");
    } finally {
      lock.current = false;
      setLoading(false);
    }
  }

  if (result) {
    return (
      <div role="status" className="mt-2 rounded-lg border border-emerald-200 bg-emerald-50 p-3 text-xs text-emerald-800">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900">
          <span>✓ Đã gửi yêu cầu chuyển kho thành công!</span>
        </div>
        <p className="mt-1 text-emerald-700">
          Mã yêu cầu: #{result.id} · Trạng thái: {result.status || "Chờ duyệt"}.
        </p>
        <p className="mt-0.5 text-[11px] text-emerald-600">
          Quản lý cơ sở sẽ nhận được thông báo ngay và tiến hành duyệt kho cho bạn.
        </p>
      </div>
    );
  }

  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="mt-2 border-t border-[#dfe7f5] pt-2 text-xs">
      <summary className="cursor-pointer font-semibold text-[#1d5fe5] hover:underline">
        Yêu cầu đổi / chuyển kho (Transfer Unit)
      </summary>
      <form onSubmit={submit} className="mt-2 space-y-2.5">
        <SupportDropdown
          label="Loại kho muốn chuyển tới (Target Type)"
          icon="warehouse"
          disabled={typesLoading}
          value={requestedUnitTypeId}
          onChange={setRequestedUnitTypeId}
          placeholder={typesLoading ? "Đang tải danh sách kho..." : "Chọn loại kho mới"}
          options={unitTypes.map((type) => ({ value: String(type.id), label: type.name || type.displayName || `Loại #${type.id}` }))}
        />
        <label className="block font-semibold text-slate-600">
          Ngày chuyển dự kiến (Effective Date)
          <input
            type="date"
            required
            min={localDate()}
            value={requestedEffectiveDate}
            onChange={(event) => setRequestedEffectiveDate(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs text-[#0b1c30] focus:border-blue-500 focus:outline-none"
          />
        </label>
        <label className="block font-semibold text-slate-600">
          Lý do chuyển kho (Reason)
          <textarea
            required
            rows="2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs text-[#0b1c30] focus:border-blue-500 focus:outline-none"
            placeholder="Ví dụ: Cần kho diện tích lớn hơn, đổi vị trí gần thang máy..."
          />
        </label>
        {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs font-medium text-red-700 border border-red-200">{error}</p>}
        <button
          type="submit"
          disabled={loading || typesLoading}
          className="rounded-lg bg-[#1d5fe5] hover:bg-[#154fc4] px-3.5 py-1.5 font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs"
        >
          {loading ? "Đang gửi yêu cầu..." : "Gửi yêu cầu chuyển kho"}
        </button>
      </form>
    </details>
  );
}
