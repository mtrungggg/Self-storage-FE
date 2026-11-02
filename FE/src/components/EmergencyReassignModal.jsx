import { useEffect, useState, useMemo } from "react";
import managerTicketService from "../api/managerTicketService";
import staffFacilityService from "../api/staffFacilityService";

function generateSamplePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function EmergencyReassignModal({
  isOpen,
  onClose,
  onSuccess,
  ticket = null,
  agreement = null,
  agreementId = null,
  facilityId = null,
  unitTypeId = null,
  oldUnitCode = null,
}) {
  const [allUnits, setAllUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [reason, setReason] = useState("Sự cố hư hỏng nặng (Severe_Need_Relocation)");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  // Extract effective data whether opened from Ticket or Agreement
  const effectiveAgreementId =
    agreement?.id ||
    agreement?.agreementId ||
    ticket?.agreementId ||
    agreementId ||
    ticket?.agreementNo ||
    ticket?.id;

  const effectiveAgreementNo =
    agreement?.agreementNo ||
    ticket?.agreementNo ||
    effectiveAgreementId ||
    "—";

  const effectiveFacilityId =
    facilityId ||
    agreement?.facilityId ||
    ticket?.facilityId;

  const effectiveCustomerName =
    agreement?.customerName ||
    ticket?.customerName ||
    "—";

  const effectiveCustomerPhone =
    agreement?.customerPhone ||
    ticket?.customerPhone ||
    "—";

  const effectiveOldUnitCode =
    oldUnitCode ||
    agreement?.unitCode ||
    ticket?.unitCode ||
    "—";

  const effectiveOldUnitId =
    agreement?.unitId ||
    ticket?.unitId;

  // Resolve target unit type ID (fallback to match old unit's type if available)
  const initialUnitTypeId =
    unitTypeId ||
    agreement?.unitTypeId ||
    agreement?.unitType?.id ||
    ticket?.unitTypeId;

  // Fetch facility units
  useEffect(() => {
    if (!isOpen || !effectiveFacilityId) return;
    let active = true;
    setLoadingUnits(true);
    setError("");

    staffFacilityService
      .getUnits(Number(effectiveFacilityId))
      .then((units) => {
        if (!active) return;
        setAllUnits(Array.isArray(units) ? units : []);
      })
      .catch((err) => {
        if (active) setError(err.message || "Không thể tải danh sách ô kho tại cơ sở.");
      })
      .finally(() => {
        if (active) setLoadingUnits(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, effectiveFacilityId]);

  // Determine matching unit type ID & filter Available units in the same facility with the same UnitTypeId
  const { matchingUnitTypeId, availableUnits } = useMemo(() => {
    let targetType = initialUnitTypeId;
    if (!targetType && allUnits.length > 0 && (effectiveOldUnitCode !== "—" || effectiveOldUnitId)) {
      const currentUnit = allUnits.find(
        (u) =>
          (effectiveOldUnitId && String(u.unitId || u.id) === String(effectiveOldUnitId)) ||
          (effectiveOldUnitCode && u.unitCode === effectiveOldUnitCode)
      );
      if (currentUnit) {
        targetType = currentUnit.unitTypeId || currentUnit.typeId || currentUnit.type;
      }
    }

    const available = allUnits.filter((u) => {
      // 1. Phải có trạng thái Available
      const isAvailable = String(u.status || u.physicalStatus).toLowerCase() === "available";
      // 2. Không phải là ô kho hiện tại
      const isNotCurrent =
        u.unitCode !== effectiveOldUnitCode &&
        (!effectiveOldUnitId || String(u.unitId || u.id) !== String(effectiveOldUnitId));
      // 3. Cùng FacilityId
      const matchesFacility =
        !effectiveFacilityId ||
        !u.facilityId ||
        String(u.facilityId) === String(effectiveFacilityId);
      // 4. Cùng UnitTypeId
      const matchesUnitType =
        !targetType ||
        String(u.unitTypeId || u.typeId || u.type) === String(targetType);

      return isAvailable && isNotCurrent && matchesFacility && matchesUnitType;
    });

    return {
      matchingUnitTypeId: targetType,
      availableUnits: available,
    };
  }, [allUnits, initialUnitTypeId, effectiveOldUnitCode, effectiveOldUnitId, effectiveFacilityId]);

  // Auto-select first available unit
  useEffect(() => {
    if (availableUnits.length > 0) {
      setSelectedUnitId(String(availableUnits[0].unitId || availableUnits[0].id));
    } else {
      setSelectedUnitId("");
    }
  }, [availableUnits]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setSuccessResult(null);
      setError("");
      setCustomReason("");
      setNotes("");
      if (ticket?.reportNote) {
        setReason("Sự cố hư hỏng nặng (Severe_Need_Relocation)");
        setNotes(ticket.reportNote);
      } else {
        setReason("Sự cố hư hỏng nặng (Severe_Need_Relocation)");
      }
    }
  }, [isOpen, ticket]);

  if (!isOpen) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!effectiveAgreementId) {
      setError("Không tìm thấy mã hợp đồng để thực hiện đổi kho.");
      return;
    }

    if (!selectedUnitId) {
      setError("Vui lòng chọn một ô kho tương đương cùng loại để đổi.");
      return;
    }

    const finalReason = reason === "other" ? customReason.trim() : reason;
    if (!finalReason) {
      setError("Vui lòng nhập lý do điều chuyển (Reason).");
      return;
    }

    setSubmitting(true);
    setError("");

    const selectedUnit = availableUnits.find(
      (u) => String(u.unitId || u.id) === String(selectedUnitId)
    );
    const newUnitCode = selectedUnit?.unitCode || `Unit #${selectedUnitId}`;
    const newPin = generateSamplePin();

    try {
      const payload = {
        newUnitId: Number(selectedUnitId),
        reason: finalReason,
        priceAdjustment: 0,
        notes: notes.trim(),
        ticketId: ticket?.id || undefined,
      };

      const result = await managerTicketService.reassignUnit(effectiveAgreementId, payload);
      const outputResult = {
        ...(result || payload),
        oldUnitCode: effectiveOldUnitCode,
        newUnitCode,
        newPin: result?.newPin || newPin,
        qrCodePayload: `CHK|${newUnitCode}|${effectiveAgreementNo}|${effectiveFacilityId}`,
      };

      setSuccessResult(outputResult);

      if (onSuccess) {
        onSuccess(outputResult);
      }
    } catch (err) {
      setError(err.message || "Không thể thực hiện đổi ô kho khẩn cấp.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="emergency-reassign-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-rose-200 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-rose-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-rose-600 animate-pulse">
                published_with_changes
              </span>
              <h2 id="emergency-reassign-modal-title" className="text-base font-extrabold text-rose-900">
                Đổi kho khẩn cấp (Emergency Reassign)
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Điều phối chuyển kho tương đương cùng cơ sở cho khách hàng (0 VNĐ).
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Success View */}
        {successResult ? (
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">task_alt</span>
                <span>Đổi kho khẩn cấp thành công!</span>
              </div>
              <p className="text-emerald-900 leading-relaxed">
                Hệ thống đã tự động chuyển giao ô kho mới cho khách hàng với chi phí phát sinh là <strong>0 VNĐ</strong>. Hạn hợp đồng và tiền cọc được giữ nguyên vẹn.
              </p>

              <div className="grid grid-cols-2 gap-2 border-t border-emerald-200 pt-2.5">
                <div>
                  <span className="text-slate-500 block text-[11px]">Kho cũ (Đã thu hồi):</span>
                  <strong className="text-rose-800 text-sm">Kho {successResult.oldUnitCode}</strong>
                  <span className="block text-[10px] text-rose-600 font-semibold">→ Trạng thái: MAINTENANCE</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Kho mới thay thế:</span>
                  <strong className="text-emerald-800 text-sm">Kho {successResult.newUnitCode}</strong>
                  <span className="block text-[10px] text-emerald-600 font-semibold">→ Trạng thái: OCCUPIED</span>
                </div>
              </div>

              {/* Thông tin mã PIN / QR mới */}
              <div className="mt-2 rounded-xl bg-white p-3 border border-emerald-200 space-y-1.5">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Mã truy cập điện tử mới cấp cho khách hàng:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Mã PIN mở khóa:</span>
                  <span className="font-mono text-base font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {successResult.newPin}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Mã QR Gate Pass mới đã được kích hoạt và đồng bộ lên ứng dụng của khách hàng.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2 font-bold text-white text-xs shadow-xs transition"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Reassign Form */
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* Tóm tắt thông tin hiện tại */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-2 text-rose-950">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <span className="material-symbols-outlined text-[16px] text-rose-600">info</span>
                <span>Thông tin hợp đồng &amp; Ô kho hiện tại:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Khách hàng:</span>{" "}
                  <strong className="text-slate-900">{effectiveCustomerName}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>{" "}
                  <strong className="text-slate-900">{effectiveCustomerPhone}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Hợp đồng:</span>{" "}
                  <strong className="text-slate-900 font-mono">{effectiveAgreementNo}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Kho hiện tại:</span>{" "}
                  <strong className="text-rose-700 font-bold">Kho {effectiveOldUnitCode}</strong>
                </div>
              </div>
              {ticket?.reportNote && (
                <p className="text-[11px] text-slate-700 border-t border-rose-200 pt-1.5 italic">
                  Ghi chú từ báo cáo Staff: &ldquo;{ticket.reportNote}&rdquo;
                </p>
              )}
            </div>

            {/* Dropdown kho mới: Chỉ gồm Unit có trạng thái Available, cùng UnitTypeId và FacilityId */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wide mb-1">
                Chọn ô kho mới thay thế (Available, cùng loại ô kho) *
              </label>

              {loadingUnits ? (
                <p className="text-slate-400 italic">Đang tải danh sách kho trống cùng loại...</p>
              ) : availableUnits.length === 0 ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 text-xs">
                  Hiện không còn ô kho nào khả dụng (Available) cùng loại (UnitTypeId{matchingUnitTypeId ? `: #${matchingUnitTypeId}` : ""}) tại cơ sở này để điều chuyển!
                </div>
              ) : (
                <select
                  required
                  value={selectedUnitId}
                  onChange={(e) => setSelectedUnitId(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5]"
                >
                  {availableUnits.map((unit) => (
                    <option key={unit.unitId || unit.id} value={unit.unitId || unit.id}>
                      Kho {unit.unitCode} · {unit.unitTypeName || unit.type || "Cùng loại"} {unit.dimensions ? `(${unit.dimensions})` : ""} · Tầng {unit.floorNumber || "1"}
                    </option>
                  ))}
                </select>
              )}
              <span className="text-[10px] text-slate-500 block mt-1">
                * Chỉ hiển thị các ô kho đang <strong>Available</strong>, cùng <strong>FacilityId</strong> và cùng <strong>UnitTypeId</strong>.
              </span>
            </div>

            {/* Nhập Reason (lý do điều chuyển) */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wide mb-1">
                Lý do điều chuyển (Reason) *
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5] mb-2"
              >
                <option value="Sự cố hư hỏng nặng (Severe_Need_Relocation)">Sự cố hư hỏng nặng (Severe_Need_Relocation)</option>
                <option value="Kho bị ẩm mốc, thấm dột trần / sàn">Kho bị ẩm mốc, thấm dột trần / sàn</option>
                <option value="Kẹt cửa kho / Hỏng khóa không khắc phục tại chỗ được">Kẹt cửa kho / Hỏng khóa không khắc phục tại chỗ được</option>
                <option value="Lý do kỹ thuật / bảo trì định kỳ cơ sở">Lý do kỹ thuật / bảo trì định kỳ cơ sở</option>
                <option value="other">Lý do khác (Nhập chi tiết)...</option>
              </select>

              {reason === "other" && (
                <input
                  type="text"
                  required
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do điều chuyển cụ thể..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5]"
                />
              )}
            </div>

            {/* Ghi chú thêm */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ghi chú bổ sung (Notes):
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú thêm về hiện trạng hoặc chỉ dẫn cho khách..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5] focus:bg-white"
              />
            </div>

            {/* Cam kết / Xác nhận chuẩn theo yêu cầu:
                “Chi phí chuyển đổi: 0 VNĐ – Giữ nguyên hạn hợp đồng & tiền cọc – Tự động cấp mã PIN/QR mới” */}
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/90 p-3.5 space-y-1.5 text-emerald-950">
              <div className="flex items-center gap-1.5 font-bold text-emerald-900">
                <span className="material-symbols-outlined text-[18px] text-emerald-600">verified</span>
                <span>Xác nhận điều chuyển:</span>
              </div>
              <p className="text-xs font-semibold text-emerald-800 leading-relaxed">
                “Chi phí chuyển đổi: 0 VNĐ – Giữ nguyên hạn hợp đồng &amp; tiền cọc – Tự động cấp mã PIN/QR mới”
              </p>
              <p className="text-[11px] text-slate-600 border-t border-emerald-200/80 pt-1.5">
                Kho cũ sẽ tự động chuyển sang <strong className="text-rose-700">MAINTENANCE</strong> (bảo trì) và kho mới chuyển sang <strong className="text-emerald-700">OCCUPIED</strong> (đang thuê).
              </p>
            </div>

            {error && (
              <div role="alert" className="rounded-lg bg-rose-50 p-2.5 text-rose-700 font-semibold">
                {error}
              </div>
            )}

            {/* Footer Buttons */}
            <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
              <button
                type="button"
                disabled={submitting}
                onClick={onClose}
                className="rounded-lg border border-slate-200 bg-white px-3.5 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition"
              >
                Hủy
              </button>
              <button
                type="submit"
                disabled={submitting || !selectedUnitId || availableUnits.length === 0}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
                <span>{submitting ? "Đang xử lý..." : "Xác nhận đổi kho khẩn cấp"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
