import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState, useMemo } from "react";
import managerTicketService from "../api/managerTicketService";
import staffFacilityService from "../api/staffFacilityService";

function generateSamplePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

// Tách mã kho và hậu tố trạng thái (ví dụ: "A-906-PENDING-INSPECT" -> code: "A-906", badge: "Chờ kiểm tra")
function formatUnitCodeDisplay(rawCode) {
  if (!rawCode) return { code: "—", badge: null };
  const str = String(rawCode).trim();
  const match = str.match(/^(.*?)(?:-(PENDING-INSPECT|OCCUPIED|AVAILABLE|MAINTENANCE|CLEANING))$/i);
  if (match) {
    const code = match[1];
    const suffix = match[2].toUpperCase();
    let badgeLabel = suffix;
    let badgeClass = "bg-slate-100 text-slate-700 border-slate-200";
    if (suffix === "PENDING-INSPECT") {
      badgeLabel = "Chờ kiểm tra";
      badgeClass = "bg-amber-100 text-amber-800 border-amber-300";
    } else if (suffix === "OCCUPIED") {
      badgeLabel = "Đang thuê";
      badgeClass = "bg-blue-100 text-blue-800 border-blue-300";
    } else if (suffix === "AVAILABLE") {
      badgeLabel = "Khả dụng";
      badgeClass = "bg-emerald-100 text-emerald-800 border-emerald-300";
    } else if (suffix === "MAINTENANCE") {
      badgeLabel = "Bảo trì";
      badgeClass = "bg-rose-100 text-rose-800 border-rose-300";
    } else if (suffix === "CLEANING") {
      badgeLabel = "Đang dọn dẹp";
      badgeClass = "bg-sky-100 text-sky-800 border-sky-300";
    }
    return { code, badge: { label: badgeLabel, className: badgeClass } };
  }
  return { code: str, badge: null };
}

// Trích xuất số diện tích (m²) từ chuỗi kích thước/tên loại kho
function extractAreaNumber(unit) {
  if (!unit) return 0;
  if (unit.area && typeof unit.area === "number") return unit.area;
  const text = `${unit.dimensions || ""} ${unit.unitTypeName || ""} ${unit.typeName || ""}`;
  const match = text.match(/(\d+(?:\.\d+)?)\s*(?:m2|m²)/i);
  if (match) return parseFloat(match[1]);
  return 0;
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
  const { t, translateStatus, formatCurrency } = useLanguage();
  const [allUnits, setAllUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [allowCrossType, setAllowCrossType] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [reason, setReason] = useState("Sự cố hư hỏng nặng (Severe_Need_Relocation)");
  const [customReason, setCustomReason] = useState("");
  const [notes, setNotes] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  // Chế độ Hủy hợp đồng & Hoàn tiền 100%
  const [showRefundConfirm, setShowRefundConfirm] = useState(false);
  const [refundReason, setRefundReason] = useState("Cơ sở hết kho thay thế sự cố, không thể tiếp tục bàn giao kho");
  const [refundCustomReason, setRefundCustomReason] = useState("");
  const [refundNotes, setRefundNotes] = useState("");
  const [refundSubmitting, setRefundSubmitting] = useState(false);
  const [refundSuccessResult, setRefundSuccessResult] = useState(null);

  // Extract strictly numeric agreement ID - NEVER fallback to ticket ID or ticket code
  const rawAgreementId =
    agreement?.id ||
    agreement?.agreementId ||
    ticket?.agreementId ||
    agreementId;

  const parsedId = Number(rawAgreementId);
  const effectiveAgreementId = !isNaN(parsedId) && parsedId > 0 ? parsedId : null;

  const effectiveAgreementNo =
    agreement?.agreementNo ||
    ticket?.agreementNo ||
    (effectiveAgreementId ? `AGR-${effectiveAgreementId}` : "—");

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

  const formattedOldUnit = useMemo(
    () => formatUnitCodeDisplay(effectiveOldUnitCode),
    [effectiveOldUnitCode]
  );

  // Resolve target unit type ID
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

  // Determine current unit details and available units
  const { currentUnitTypeId, currentArea, availableSameTypeUnits, availableAllUnits } = useMemo(() => {
    let targetType = initialUnitTypeId;
    let currentUnit = null;

    if (allUnits.length > 0 && (effectiveOldUnitCode !== "—" || effectiveOldUnitId)) {
      currentUnit = allUnits.find(
        (u) =>
          (effectiveOldUnitId && String(u.unitId || u.id) === String(effectiveOldUnitId)) ||
          (effectiveOldUnitCode && (u.unitCode === effectiveOldUnitCode || u.unitCode === formattedOldUnit.code))
      );
      if (currentUnit && !targetType) {
        targetType = currentUnit.unitTypeId || currentUnit.typeId || currentUnit.type;
      }
    }

    const currArea = extractAreaNumber(currentUnit);

    const availableInFacility = allUnits.filter((u) => {
      const isAvailable = String(u.status || u.physicalStatus).toLowerCase() === "available";
      const isNotCurrent =
        u.unitCode !== effectiveOldUnitCode &&
        u.unitCode !== formattedOldUnit.code &&
        (!effectiveOldUnitId || String(u.unitId || u.id) !== String(effectiveOldUnitId));
      const matchesFacility =
        !effectiveFacilityId ||
        !u.facilityId ||
        String(u.facilityId) === String(effectiveFacilityId);

      return isAvailable && isNotCurrent && matchesFacility;
    });

    const sameType = availableInFacility.filter((u) =>
      targetType ? String(u.unitTypeId || u.typeId || u.type) === String(targetType) : true
    );

    // Sắp xếp danh sách mở rộng:
    // 1. Kho cùng loại lên đầu
    // 2. Kho có diện tích >= kho cũ (Miễn phí nâng cấp)
    // 3. Diện tích giảm dần
    const sortedAll = [...availableInFacility].sort((a, b) => {
      const aSame = targetType && String(a.unitTypeId || a.typeId || a.type) === String(targetType);
      const bSame = targetType && String(b.unitTypeId || b.typeId || b.type) === String(targetType);
      if (aSame && !bSame) return -1;
      if (!aSame && bSame) return 1;

      const aArea = extractAreaNumber(a);
      const bArea = extractAreaNumber(b);

      const aUpgrade = aArea >= currArea && currArea > 0;
      const bUpgrade = bArea >= currArea && currArea > 0;
      if (aUpgrade && !bUpgrade) return -1;
      if (!aUpgrade && bUpgrade) return 1;

      return bArea - aArea;
    });

    return {
      currentUnitTypeId: targetType,
      currentArea: currArea,
      availableSameTypeUnits: sameType,
      availableAllUnits: sortedAll,
    };
  }, [allUnits, initialUnitTypeId, effectiveOldUnitCode, effectiveOldUnitId, formattedOldUnit.code, effectiveFacilityId]);

  // Tự động bật mở rộng nếu không còn kho cùng loại nhưng còn các kho khác
  useEffect(() => {
    if (availableSameTypeUnits.length === 0 && availableAllUnits.length > 0) {
      setAllowCrossType(true);
    }
  }, [availableSameTypeUnits.length, availableAllUnits.length]);

  const displayUnits = allowCrossType ? availableAllUnits : availableSameTypeUnits;

  // Auto-select first available unit
  useEffect(() => {
    if (displayUnits.length > 0) {
      const exists = displayUnits.some((u) => String(u.unitId || u.id) === String(selectedUnitId));
      if (!exists) {
        setSelectedUnitId(String(displayUnits[0].unitId || displayUnits[0].id));
      }
    } else {
      setSelectedUnitId("");
    }
  }, [displayUnits, selectedUnitId]);

  // Reset modal state on open
  useEffect(() => {
    if (isOpen) {
      setSuccessResult(null);
      setRefundSuccessResult(null);
      setShowRefundConfirm(false);
      setError("");
      setCustomReason("");
      setNotes("");
      setRefundCustomReason("");
      setRefundNotes("");
      setAllowCrossType(false);
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
      setError("Vui lòng chọn một ô kho thay thế để điều chuyển.");
      return;
    }

    const finalReason = reason === "other" ? customReason.trim() : reason;
    if (!finalReason) {
      setError("Vui lòng nhập lý do điều chuyển (Reason).");
      return;
    }

    setSubmitting(true);
    setError("");

    const selectedUnit = displayUnits.find(
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
        oldUnitCode: formattedOldUnit.code,
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

  async function handleEmergencyCancelRefund(e) {
    e.preventDefault();
    if (!effectiveAgreementId) {
      setError("Không tìm thấy mã hợp đồng để hủy và hoàn tiền.");
      return;
    }

    const finalRefundReason = refundReason === "other" ? refundCustomReason.trim() : refundReason;
    if (!finalRefundReason) {
      setError("Vui lòng nhập lý do hủy hợp đồng & hoàn tiền.");
      return;
    }

    setRefundSubmitting(true);
    setError("");

    try {
      const payload = {
        reason: finalRefundReason,
        notes: refundNotes.trim(),
        ticketId: ticket?.id || undefined,
      };

      const result = await managerTicketService.emergencyCancelAndRefund(effectiveAgreementId, payload);
      setRefundSuccessResult(result);

      if (onSuccess) {
        onSuccess({ cancelled: true, ...result });
      }
    } catch (err) {
      setError(err.message || "Không thể thực hiện hủy hợp đồng và hoàn tiền.");
    } finally {
      setRefundSubmitting(false);
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
                {showRefundConfirm
                  ? "Hủy hợp đồng & Hoàn tiền 100% (Emergency Full Refund)"
                  : "Đổi kho khẩn cấp (Emergency Reassign)"}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {showRefundConfirm
                ? "Phương án xử lý khẩn cấp khi cơ sở hết kho thay thế hoặc khách không đồng ý đổi loại kho."
                : "Điều phối chuyển kho tương đương cùng cơ sở cho khách hàng (0 VNĐ)."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            disabled={submitting || refundSubmitting}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Success View: Cancel & Refund */}
        {refundSuccessResult ? (
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-2xl border border-amber-300 bg-amber-50 p-4 text-amber-950 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-amber-900 text-sm">
                <span className="material-symbols-outlined text-amber-600 text-[22px]">assignment_turned_in</span>
                <span>{t("tickets.cancel_and_refund_success", "Hủy hợp đồng & Duyệt hoàn tiền 100% thành công!")}</span>
              </div>
              <p className="text-amber-900 leading-relaxed">
                {t("tickets.agreement_cancelled", "Hệ thống đã hủy hợp đồng")} <strong>#{refundSuccessResult.agreementNo || effectiveAgreementNo}</strong> {t("tickets.and_auto_refund_100", "và tự động phê duyệt hoàn trả 100% với số tiền")} <strong>{(refundSuccessResult.totalRefundAmount || 0).toLocaleString("vi-VN")} VNĐ</strong> 
              </p>

              <div className="grid grid-cols-2 gap-2 border-t border-amber-200 pt-2.5">
                <div>
                  <span className="text-slate-500 block text-[11px]">Kho sự cố:</span>
                  <strong className="text-rose-800 text-sm">Kho {refundSuccessResult.unitCode || formattedOldUnit.code}</strong>
                  <span className="block text-[10px] text-rose-600 font-semibold">→ Trạng thái: MAINTENANCE</span>
                </div>
                <div>
                  <span className="text-slate-500 block text-[11px]">Trạng thái hợp đồng:</span>
                  <strong className="text-amber-800 text-sm">{translateStatus("cancelled")}</strong>
                  <span className="block text-[10px] text-amber-700 font-semibold">→ Đã gửi thông báo cho khách</span>
                </div>
              </div>

              
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-amber-800 hover:bg-amber-900 px-4 py-2 font-bold text-white text-xs shadow-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : successResult ? (
          /* Success View: Reassign */
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 space-y-2.5 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <span className="material-symbols-outlined text-emerald-600 text-[22px]">task_alt</span>
                <span>{t("tickets.reassign_success", "Đổi kho khẩn cấp thành công!")}</span>
              </div>
              <p className="text-emerald-900 leading-relaxed">
                {t("modal.new_qr_activated", "Mã QR Gate Pass mới đã được kích hoạt.")}
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
                className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2 font-bold text-white text-xs shadow-xs transition cursor-pointer"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : showRefundConfirm ? (
          /* Confirmation View: Cancel Agreement & 100% Refund */
          <form onSubmit={handleEmergencyCancelRefund} className="mt-4 space-y-4 text-xs">
            <div className="rounded-xl border border-rose-300 bg-rose-50/80 p-3.5 space-y-2 text-rose-950">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <span className="material-symbols-outlined text-[18px] text-rose-600">warning</span>
                <span>Phương án Hủy hợp đồng &amp; Hoàn trả 100% tiền</span>
              </div>
              <p className="text-xs text-rose-800 leading-relaxed">
                Áp dụng khi cơ sở <strong>hết sạch ô kho thay thế</strong> hoặc khách hàng không đồng ý đổi sang loại kho khác. Hệ thống sẽ tự động:
              </p>
              <ul className="list-disc pl-5 space-y-1 text-[11px] text-rose-900">
                <li>Chuyển ô kho gặp sự cố sang trạng thái <strong>MAINTENANCE</strong> (bảo trì).</li>
                <li>Hủy hợp đồng <strong>#{effectiveAgreementNo}</strong> (Chuyển sang <strong>{translateStatus("cancelled")}</strong>).</li>
                <li>Thu hồi toàn bộ mã PIN / QR mở cửa hiện có của khách.</li>
                <li>Tự động lập và phê duyệt hoàn trả <strong>100% số tiền</strong> đã thanh toán của hợp đồng này.</li>
              </ul>
            </div>

            {/* Thông tin hợp đồng */}
            <div className="rounded-xl border border-slate-200 bg-slate-50 p-3 space-y-1.5 text-[11px]">
              <div className="grid grid-cols-2 gap-2">
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
                  <span className="text-slate-500">Kho sự cố:</span>{" "}
                  <strong className="text-rose-700 font-bold">Kho {formattedOldUnit.code}</strong>
                </div>
              </div>
            </div>

            {/* Lý do hủy hợp đồng */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wide mb-1">
                Lý do hủy hợp đồng &amp; Hoàn cọc 100% *
              </label>
              <SelectDropdown
                value={refundReason}
                onChange={(e) => setRefundReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 mb-2"
              >
                <option value="Cơ sở hết kho thay thế sự cố, không thể tiếp tục bàn giao kho">Cơ sở hết kho thay thế sự cố, không thể tiếp tục bàn giao kho</option>
                <option value="Khách hàng không đồng ý đổi sang loại kho khác do sự cố">Khách hàng không đồng ý đổi sang loại kho khác do sự cố</option>
                <option value="Kho bị hỏng hóc nghiêm trọng tại thời điểm nhận kho">Kho bị hỏng hóc nghiêm trọng tại thời điểm nhận kho</option>
                <option value="other">Lý do khác (Nhập chi tiết)...</option>
              </SelectDropdown>

              {refundReason === "other" && (
                <input
                  type="text"
                  required
                  value={refundCustomReason}
                  onChange={(e) => setRefundCustomReason(e.target.value)}
                  placeholder="Nhập lý do hủy và hoàn tiền cụ thể..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500"
                />
              )}
            </div>

            {/* Ghi chú thêm */}
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Ghi chú phê duyệt hoàn tiền (Notes):
              </label>
              <textarea
                rows={2}
                value={refundNotes}
                onChange={(e) => setRefundNotes(e.target.value)}
                placeholder="Ghi chú thêm về thông tin tài khoản hoặc biên bản xử lý..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
              />
            </div>

            {error && (
              <div role="alert" className="rounded-lg bg-rose-50 p-2.5 text-rose-700 font-semibold">
                {error}
              </div>
            )}

            {/* Footer Buttons for Cancel & Refund */}
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              <button
                type="button"
                disabled={refundSubmitting}
                onClick={() => {
                  setShowRefundConfirm(false);
                  setError("");
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">arrow_back</span>
                <span>Quay lại đổi kho</span>
              </button>

              <button
                type="submit"
                disabled={!effectiveAgreementId || refundSubmitting}
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
              >
                <span className="material-symbols-outlined text-[16px]">cancel_presentation</span>
                <span>{refundSubmitting ? "Đang hủy & hoàn tiền..." : "Xác nhận Hủy HĐ & Hoàn tiền 100%"}</span>
              </button>
            </div>
          </form>
        ) : (
          /* Reassign Form */
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {!effectiveAgreementId && (
              <div role="alert" className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-800 text-xs flex items-start gap-2 shadow-xs">
                <span className="material-symbols-outlined text-rose-600 text-[18px] shrink-0 mt-0.5">error</span>
                <div>
                  <strong className="block font-bold">Không tìm thấy mã hợp đồng hợp lệ (Missing Agreement ID)</strong>
                  <span>Ticket sự cố này chưa được liên kết với một Hợp đồng thuê hợp lệ. Vui lòng kiểm tra lại trước khi thực hiện đổi kho khẩn cấp hoặc hủy hoàn tiền.</span>
                </div>
              </div>
            )}

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
                  <strong className="text-rose-700 font-bold">Kho {formattedOldUnit.code}</strong>
                  {formattedOldUnit.badge && (
                    <span
                      className={`ml-1.5 inline-block px-1.5 py-0.5 rounded text-[10px] font-semibold border ${formattedOldUnit.badge.className}`}
                    >
                      {formattedOldUnit.badge.label}
                    </span>
                  )}
                </div>
              </div>
              {ticket?.reportNote && (
                <p className="text-[11px] text-slate-700 border-t border-rose-200 pt-1.5 italic">
                  Ghi chú từ báo cáo Staff: &ldquo;{ticket.reportNote}&rdquo;
                </p>
              )}
            </div>

            {/* Dropdown kho mới & Tùy chọn Mở rộng */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <label className="block font-bold text-slate-800 uppercase tracking-wide">
                  Chọn ô kho mới thay thế (Available) *
                </label>
                {availableSameTypeUnits.length > 0 && (
                  <button
                    type="button"
                    onClick={() => setAllowCrossType((prev) => !prev)}
                    className="text-[11px] font-semibold text-indigo-600 hover:text-indigo-800 underline cursor-pointer"
                  >
                    {allowCrossType ? "Thu gọn về kho cùng loại" : "+ Mở rộng chọn kho khác / nâng cấp"}
                  </button>
                )}
              </div>

              {loadingUnits ? (
                <p className="text-slate-400 italic">Đang tải danh sách kho trống tại cơ sở...</p>
              ) : (
                <>
                  {availableSameTypeUnits.length === 0 && !allowCrossType && (
                    <div className="rounded-xl border border-amber-300 bg-amber-50 p-3 text-amber-900 text-xs space-y-2">
                      <div className="flex items-center gap-1.5 font-bold">
                        <span className="material-symbols-outlined text-[18px] text-amber-600">warning</span>
                        <span>Hiện không còn ô kho khả dụng cùng loại (UnitTypeId{currentUnitTypeId ? `: #${currentUnitTypeId}` : ""})</span>
                      </div>
                      <p className="text-[11px] text-amber-800">
                        Cơ sở đã hết kho trống cùng loại với kho của khách. Bấm nút bên dưới để mở rộng tìm kho khác hoặc nâng cấp miễn phí.
                      </p>
                    </div>
                  )}

                  {/* Nút gạt / Checkbox Mở rộng theo yêu cầu đề bài */}
                  <label className="flex items-start gap-2.5 p-2.5 rounded-xl border border-indigo-200 bg-indigo-50/60 cursor-pointer hover:bg-indigo-50 transition">
                    <input
                      type="checkbox"
                      checked={allowCrossType}
                      onChange={(e) => setAllowCrossType(e.target.checked)}
                      className="mt-0.5 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500 cursor-pointer"
                    />
                    <div className="text-[11px]">
                      <span className="font-bold text-indigo-950 block">
                        Mở rộng: Cho phép chọn ô kho loại khác / lớn hơn tại cơ sở
                      </span>
                      <span className="text-indigo-700">
                        Hỗ trợ đổi ngang 0 VNĐ do sự cố không thể bàn giao ô kho cùng loại (Ưu tiên ô kho diện tích lớn hơn).
                      </span>
                    </div>
                  </label>

                  {displayUnits.length === 0 ? (
                    <div className="rounded-xl border border-rose-300 bg-rose-50 p-3 text-rose-900 text-xs">
                      Cơ sở này hiện không còn bất kỳ ô kho trống (Available) nào để thay thế! Vui lòng chọn phương án <strong>Hủy HĐ &amp; Hoàn tiền 100%</strong>.
                    </div>
                  ) : (
                    <SelectDropdown
                      required
                      value={selectedUnitId}
                      onChange={(e) => setSelectedUnitId(e.target.value)}
                      className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100"
                    >
                      {displayUnits.map((unit) => {
                        const unitId = unit.unitId || unit.id;
                        const isSame =
                          currentUnitTypeId &&
                          String(unit.unitTypeId || unit.typeId || unit.type) === String(currentUnitTypeId);
                        const area = extractAreaNumber(unit);
                        let badgeTag = "";
                        if (isSame) {
                          badgeTag = "[Cùng loại]";
                        } else if (area >= currentArea && currentArea > 0) {
                          badgeTag = `✨ Miễn phí nâng cấp (${area}m²)`;
                        } else {
                          badgeTag = `[Đổi ngang loại khác${area > 0 ? ` - ${area}m²` : ""}]`;
                        }

                        return (
                          <option key={unitId} value={unitId}>
                            Kho {unit.unitCode} · {unit.unitTypeName || unit.type || "Tiêu chuẩn"} {unit.dimensions ? `(${unit.dimensions})` : ""} · Tầng {unit.floorNumber || "1"} — {badgeTag}
                          </option>
                        );
                      })}
                    </SelectDropdown>
                  )}
                </>
              )}
            </div>

            {/* Nhập Reason (lý do điều chuyển) */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wide mb-1">
                Lý do điều chuyển (Reason) *
              </label>
              <SelectDropdown
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100 mb-2"
              >
                <option value="Sự cố hư hỏng nặng (Severe_Need_Relocation)">Sự cố hư hỏng nặng (Severe_Need_Relocation)</option>
                <option value="Kho bị ẩm mốc, thấm dột trần / sàn">Kho bị ẩm mốc, thấm dột trần / sàn</option>
                <option value="Kẹt cửa kho / Hỏng khóa không khắc phục tại chỗ được">Kẹt cửa kho / Hỏng khóa không khắc phục tại chỗ được</option>
                <option value="Lý do kỹ thuật / bảo trì định kỳ cơ sở">Lý do kỹ thuật / bảo trì định kỳ cơ sở</option>
                <option value="other">Lý do khác (Nhập chi tiết)...</option>
              </SelectDropdown>

              {reason === "other" && (
                <input
                  type="text"
                  required
                  value={customReason}
                  onChange={(e) => setCustomReason(e.target.value)}
                  placeholder="Nhập lý do điều chuyển cụ thể..."
                  className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100"
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
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100 focus:bg-white"
              />
            </div>

            {/* Cam kết / Xác nhận chuẩn:
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
            <div className="flex items-center justify-between border-t border-slate-100 pt-3">
              {/* Nút dự phòng: Hủy HĐ & Hoàn tiền 100% khi hết kho thay thế */}
              <button
                type="button"
                onClick={() => {
                  setError("");
                  setShowRefundConfirm(true);
                }}
                className="inline-flex items-center gap-1 rounded-lg border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3 py-1.5 font-bold text-[11px] transition cursor-pointer"
                title="Sử dụng khi cơ sở hết kho thay thế hoặc khách không đồng ý đổi kho"
              >
                <span className="material-symbols-outlined text-[15px] text-amber-700">cancel</span>
                <span>⚠️ Hết kho thay thế — Hủy HĐ &amp; Hoàn tiền 100%</span>
              </button>

              <div className="flex items-center gap-2">
                <button
                  id="btn-cancel-emergency-reassign"
                  type="button"
                  disabled={submitting}
                  onClick={onClose}
                  className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 font-semibold text-slate-700 hover:bg-slate-50 transition cursor-pointer"
                >
                  Hủy
                </button>
                <button
                  id="btn-confirm-emergency-reassign"
                  type="submit"
                  disabled={!effectiveAgreementId || submitting || !selectedUnitId || displayUnits.length === 0}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                >
                  <span className="material-symbols-outlined text-[16px]">published_with_changes</span>
                  <span>{submitting ? "Đang xử lý..." : "Xác nhận đổi kho khẩn cấp"}</span>
                </button>
              </div>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
