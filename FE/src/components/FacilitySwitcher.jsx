import { useManagerFacility } from "../context/ManagerFacilityContext";

/**
 * Thanh chọn kho (facility) dùng chung cho các màn hình quản lý kho của Manager và Admin.
 * Hiển thị mã kho, tên kho, địa chỉ và cho phép chuyển đổi nhanh kho đang làm việc.
 */
export function FacilitySwitcher() {
  const { facilities, facilityId, setFacilityId, loading, error, activeFacility } = useManagerFacility();

  return (
    <div className="flex flex-wrap items-center justify-between gap-3 border-b border-[#eef1f8] bg-white px-4 py-2.5 lg:px-6 shadow-[0_1px_2px_rgba(0,0,0,0.02)]">
      <div className="flex flex-wrap items-center gap-2.5">
        <div className="flex h-7 w-7 items-center justify-center rounded-[6px] bg-[#eef4ff] text-[#1d5fe5]">
          <span className="material-symbols-outlined text-[16px]">domain</span>
        </div>
        <span className="text-[10px] font-bold uppercase tracking-[0.05em] text-[#8996a9]">
          Cơ sở kho đang quản lý:
        </span>
        {loading ? (
          <span className="text-[11px] text-[#8996a9]">Đang tải danh sách kho...</span>
        ) : error ? (
          <span className="text-[11px] font-semibold text-[#c0362c]">{error}</span>
        ) : (
          <select
            value={facilityId ?? ""}
            onChange={(event) => setFacilityId(Number(event.target.value))}
            className="rounded-[8px] border border-[#dfe7f5] bg-white px-3 py-1.5 text-[11px] font-bold text-[#1d5fe5] shadow-sm transition hover:border-[#1d5fe5] focus:outline-none focus:ring-2 focus:ring-[#eef4ff]"
          >
            {facilities.map((facility) => (
              <option key={facility.id} value={facility.id}>
                {facility.code} — {facility.name} ({facility.city || "Việt Nam"})
              </option>
            ))}
          </select>
        )}
      </div>

      {activeFacility && (
        <div className="hidden sm:flex items-center gap-1.5 text-[11px] font-medium text-[#64748b]">
          <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">location_on</span>
          <span className="truncate max-w-[350px]">
            {activeFacility.addressLine || activeFacility.city}
          </span>
        </div>
      )}
    </div>
  );
}

export default FacilitySwitcher;
