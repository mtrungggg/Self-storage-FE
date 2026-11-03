import { useEffect, useRef, useState } from "react";
import rentalService from "../api/rentalService";
import facilityService from "../api/facilityService";
import SupportDropdown from "./SupportDropdown";
import { useLanguage } from "../context/LanguageContext";

function localDate() {
  const date = new Date();
  const offset = date.getTimezoneOffset() * 60000;
  return new Date(date.getTime() - offset).toISOString().slice(0, 10);
}

export default function UnitTransferRequest({ agreementId, facilityId, currentFacilityName = "" }) {
  const { t } = useLanguage();
  const [open, setOpen] = useState(false);
  const [facilities, setFacilities] = useState([]);
  const [facilitiesLoading, setFacilitiesLoading] = useState(false);
  const [transferMode, setTransferMode] = useState("same_facility"); // 'same_facility' | 'cross_facility'
  const [selectedFacilityId, setSelectedFacilityId] = useState(facilityId ? String(facilityId) : "");
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
    if (facilityId && transferMode === "same_facility") {
      setSelectedFacilityId(String(facilityId));
    }
  }, [facilityId, transferMode]);

  useEffect(() => {
    if (!open) return undefined;
    let active = true;

    if (facilities.length === 0) {
      setFacilitiesLoading(true);
      facilityService.getFacilities()
        .then((data) => {
          if (active) setFacilities(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (active) console.warn("Failed to load facilities:", err);
        })
        .finally(() => {
          if (active) setFacilitiesLoading(false);
        });
    }

    if (unitTypes.length === 0) {
      setTypesLoading(true);
      facilityService.getUnitTypes()
        .then((data) => {
          if (active) setUnitTypes(Array.isArray(data) ? data : []);
        })
        .catch((err) => {
          if (active) setError(err.message || t("common.no_data", "Không thể tải danh sách loại kho."));
        })
        .finally(() => {
          if (active) setTypesLoading(false);
        });
    }

    return () => { active = false; };
  }, [open, facilities.length, unitTypes.length, t]);

  async function submit(event) {
    event.preventDefault();
    const targetFacility = Number(selectedFacilityId) || Number(facilityId);
    if (!Number.isInteger(targetFacility) || targetFacility <= 0) {
      setError("Vui lòng chọn cơ sở bạn muốn chuyển tới.");
      return;
    }

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
      const data = await rentalService.requestUnitTransfer(agreementId, {
        requestedUnitTypeId: unitTypeId,
        requestedFacilityId: targetFacility,
        moveOutDate: requestedEffectiveDate,
        moveInDate: requestedEffectiveDate,
        reason: reason.trim() || (transferMode === "cross_facility" ? "Yêu cầu chuyển sang cơ sở khác" : "Yêu cầu đổi kho cùng cơ sở"),
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
    const targetFacilityObj = facilities.find((f) => String(f.id) === String(selectedFacilityId));
    return (
      <div role="status" className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 p-3.5 text-xs text-emerald-800 space-y-1.5">
        <div className="flex items-center gap-1.5 font-bold text-emerald-900 text-sm">
          <span>✓ {t("transfer.submit_success", "Đã gửi yêu cầu chuyển kho thành công!")}</span>
        </div>
        <p className="text-emerald-800">
          Mã yêu cầu: <span className="font-mono font-bold">#{result.id}</span> · Trạng thái:{" "}
          <span className="font-semibold">{result.status || t("status.pending", "Chờ duyệt")}</span>.
        </p>
        {targetFacilityObj && (
          <p className="text-emerald-700">
            {transferMode === "cross_facility" ? t("transfer.target_facility", "Cơ sở chuyển tới:") : t("common.facility", "Cơ sở:")}{" "}
            <span className="font-semibold text-emerald-900">{targetFacilityObj.name}</span>
          </p>
        )}
        <p className="text-[11px] text-emerald-600">
          {t("transfer.notice", "Quản lý cơ sở sẽ nhận được yêu cầu và liên hệ điều phối lịch chuyển kho cho bạn.")}
        </p>
      </div>
    );
  }

  const otherFacilities = facilities.filter((f) => String(f.id) !== String(facilityId));

  return (
    <details open={open} onToggle={(event) => setOpen(event.currentTarget.open)} className="mt-2 border-t border-[#dfe7f5] pt-2 text-xs">
      <summary className="cursor-pointer font-semibold text-[#1d5fe5] hover:underline">
        {t("transfer.title", "Yêu cầu đổi / chuyển kho (Transfer Unit)")}
      </summary>
      <form onSubmit={submit} className="mt-2 space-y-2.5">
        {/* Chế độ chuyển kho */}
        <div className="space-y-1.5">
          <label className="block text-[10px] font-extrabold uppercase tracking-[0.08em] text-[#718299]">
            {t("transfer.scope", "Phạm vi chuyển kho")}
          </label>
          <div className="grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={() => {
                setTransferMode("same_facility");
                setSelectedFacilityId(String(facilityId));
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer ${
                transferMode === "same_facility"
                  ? "border-[#1d5fe5] bg-[#1d5fe5]/10 text-[#1d5fe5] shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">domain</span>
              {t("transfer.same_facility", "Cùng cơ sở")}
            </button>

            <button
              type="button"
              onClick={() => {
                setTransferMode("cross_facility");
                if (otherFacilities.length > 0 && String(selectedFacilityId) === String(facilityId)) {
                  setSelectedFacilityId(String(otherFacilities[0].id));
                }
              }}
              className={`flex items-center justify-center gap-1.5 rounded-xl border p-2 text-xs font-bold transition cursor-pointer ${
                transferMode === "cross_facility"
                  ? "border-[#1d5fe5] bg-[#1d5fe5]/10 text-[#1d5fe5] shadow-xs"
                  : "border-slate-200 bg-white text-slate-600 hover:border-slate-300 hover:bg-slate-50"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
              {t("transfer.cross_facility", "Chuyển cơ sở khác")}
            </button>
          </div>
        </div>

        {/* Dropdown chọn cơ sở khác nếu chọn Chuyển cơ sở khác */}
        {transferMode === "cross_facility" ? (
          <div className="space-y-1.5">
            <SupportDropdown
              label={t("transfer.target_facility", "Cơ sở muốn chuyển tới (Target Facility)")}
              icon="warehouse"
              disabled={facilitiesLoading}
              value={selectedFacilityId}
              onChange={setSelectedFacilityId}
              placeholder={facilitiesLoading ? t("common.loading", "Đang tải danh sách cơ sở...") : t("transfer.target_facility_placeholder", "Chọn cơ sở đích")}
              options={otherFacilities.map((f) => ({
                value: String(f.id),
                label: `${f.name} (${f.city || f.address || "Chi nhánh"})`,
              }))}
            />

            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-2.5 text-[11px] text-blue-800 flex items-start gap-2">
              <span className="material-symbols-outlined text-[16px] text-blue-600 mt-0.5 shrink-0">info</span>
              <div>
                <span className="font-bold text-blue-900">{t("transfer.cross_facility_note", "Chuyển liên cơ sở:")}</span> Yêu cầu chuyển từ{" "}
                <span className="font-semibold text-blue-950">
                  {currentFacilityName || facilities.find((f) => String(f.id) === String(facilityId))?.name || "cơ sở hiện tại"}
                </span>{" "}
                sang cơ sở mới sẽ được quản lý 2 chi nhánh phối hợp xếp lịch chuyển đồ và bàn giao kho cho bạn.
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-slate-50/80 p-2.5 flex items-center justify-between text-xs text-slate-600">
            <span className="flex items-center gap-1.5 font-medium">
              <span className="material-symbols-outlined text-[16px] text-slate-400">store</span>
              {t("transfer.current_facility", "Cơ sở hiện tại:")}
            </span>
            <span className="font-bold text-slate-800">
              {currentFacilityName || facilities.find((f) => String(f.id) === String(facilityId))?.name || "Cơ sở hiện tại"}
            </span>
          </div>
        )}

        {/* Chọn loại kho mới */}
        <SupportDropdown
          label={t("transfer.target_type", "Loại kho muốn chuyển tới (Target Type)")}
          icon="view_in_ar"
          disabled={typesLoading}
          value={requestedUnitTypeId}
          onChange={setRequestedUnitTypeId}
          placeholder={typesLoading ? t("common.loading", "Đang tải danh sách kho...") : t("transfer.target_type_placeholder", "Chọn loại kho mới")}
          options={unitTypes.map((type) => ({
            value: String(type.id),
            label: `${type.name || type.displayName || `Loại #${type.id}`}${type.dimensions ? ` (${type.dimensions})` : ""}`,
          }))}
        />

        {/* Ngày chuyển dự kiến */}
        <label className="block font-semibold text-slate-600">
          {t("transfer.effective_date", "Ngày chuyển dự kiến (Effective Date)")}
          <input
            type="date"
            required
            min={localDate()}
            value={requestedEffectiveDate}
            onChange={(event) => setRequestedEffectiveDate(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs text-[#0b1c30] focus:border-blue-500 focus:outline-none"
          />
        </label>

        {/* Lý do chuyển kho */}
        <label className="block font-semibold text-slate-600">
          {t("common.reason", "Lý do chuyển kho (Reason)")}
          <textarea
            required
            rows="2"
            value={reason}
            onChange={(event) => setReason(event.target.value)}
            className="mt-1 block w-full rounded-lg border border-slate-200 p-2 text-xs text-[#0b1c30] focus:border-blue-500 focus:outline-none"
            placeholder={
              transferMode === "cross_facility"
                ? "Ví dụ: Chuyển nhà/công ty sang khu vực khác, cần kho gần địa chỉ mới hơn..."
                : "Ví dụ: Cần kho diện tích lớn hơn, đổi vị trí gần thang máy..."
            }
          />
        </label>

        {error && <p role="alert" className="rounded-lg bg-red-50 p-2 text-xs font-medium text-red-700 border border-red-200">{error}</p>}

        <button
          type="submit"
          disabled={loading || typesLoading || facilitiesLoading}
          className="rounded-lg bg-[#1d5fe5] hover:bg-[#154fc4] px-3.5 py-2 font-bold text-white transition disabled:opacity-50 cursor-pointer shadow-xs w-full flex items-center justify-center gap-1.5"
        >
          {loading ? (
            t("common.loading", "Đang gửi yêu cầu...")
          ) : (
            <>
              <span className="material-symbols-outlined text-[16px]">send</span>
              {t("transfer.submit", "Gửi yêu cầu chuyển kho")}
            </>
          )}
        </button>
      </form>
    </details>
  );
}
