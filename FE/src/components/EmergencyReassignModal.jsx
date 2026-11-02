import { useEffect, useState } from "react";
import managerTicketService from "../api/managerTicketService";
import staffFacilityService from "../api/staffFacilityService";

function generateSamplePin() {
  return String(Math.floor(100000 + Math.random() * 900000));
}

export default function EmergencyReassignModal({ ticket, facilityId, isOpen, onClose, onSuccess }) {
  const [availableUnits, setAvailableUnits] = useState([]);
  const [loadingUnits, setLoadingUnits] = useState(false);
  const [selectedUnitId, setSelectedUnitId] = useState("");
  const [notes, setNotes] = useState("Đổi kho tương đương 0 VNĐ do sự cố hư hỏng nặng (Severe_Need_Relocation)");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successResult, setSuccessResult] = useState(null);

  const agreementId = ticket?.agreementId || ticket?.agreementNo || ticket?.id;
  const oldUnitCode = ticket?.unitCode || "—";

  useEffect(() => {
    if (!isOpen || !facilityId) return;
    let active = true;
    setLoadingUnits(true);
    setError("");

    staffFacilityService
      .getUnits(Number(facilityId))
      .then((units) => {
        if (!active) return;
        const list = Array.isArray(units) ? units : [];
        const available = list.filter(
          (u) =>
            String(u.status || u.physicalStatus).toLowerCase() === "available" &&
            u.unitCode !== oldUnitCode
        );
        setAvailableUnits(available);
        if (available.length > 0) {
          setSelectedUnitId(String(available[0].unitId || available[0].id));
        }
      })
      .catch((err) => {
        if (active) setError(err.message || "Không thể tải danh sách ô kho trống tại cơ sở.");
      })
      .finally(() => {
        if (active) setLoadingUnits(false);
      });

    return () => {
      active = false;
    };
  }, [isOpen, facilityId, oldUnitCode]);

  if (!isOpen || !ticket) return null;

  async function handleSubmit(e) {
    e.preventDefault();
    if (!selectedUnitId) {
      setError("Vui lòng chọn một ô kho tương đương để đổi.");
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
        reason: "Severe_Need_Relocation - Đổi kho khẩn cấp do sự cố kho cũ",
        priceAdjustment: 0,
        notes: notes.trim(),
        ticketId: ticket.id,
      };

      const result = await managerTicketService.reassignUnit(agreementId, payload);
      const outputResult = {
        ...(result || payload),
        oldUnitCode,
        newUnitCode,
        newPin: result?.newPin || newPin,
        qrCodePayload: `CHK|${newUnitCode}|${ticket.agreementNo || agreementId}|TICKET-${ticket.id}|${facilityId}`,
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
      aria-labelledby="emergency-reassign-title"
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
              <h2 id="emergency-reassign-title" className="text-base font-extrabold text-rose-900">
                Đổi ô kho khẩn cấp (0 VNĐ) · Sự cố nặng
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              Đổi kho khẩn cấp cho khách do Staff báo cáo: <strong className="text-rose-700">Severe_Need_Relocation</strong>
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

        {/* Kết quả thành công */}
        {successResult ? (
          <div className="mt-4 space-y-3 text-xs">
            <div className="rounded-2xl border border-emerald-300 bg-emerald-50 p-4 text-emerald-950 space-y-2 shadow-xs">
              <div className="flex items-center gap-2 font-bold text-emerald-800 text-sm">
                <span className="material-symbols-outlined text-emerald-600 text-[20px]">task_alt</span>
                <span>Đổi kho khẩn cấp thành công!</span>
              </div>
              <p className="text-emerald-900">
                Hệ thống đã tự động chuyển giao ô kho mới cho khách hàng với chi phí phát sinh là <strong>0 VNĐ</strong>.
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
              <div className="mt-2 rounded-xl bg-white p-3 border border-emerald-200 space-y-1">
                <span className="text-[11px] font-bold text-slate-700 block">
                  Mã truy cập điện tử mới cấp cho khách:
                </span>
                <div className="flex items-center justify-between">
                  <span className="text-xs text-slate-600">Mã PIN mở khóa:</span>
                  <span className="font-mono text-base font-extrabold text-blue-600 bg-blue-50 px-2.5 py-0.5 rounded-lg border border-blue-200">
                    {successResult.newPin}
                  </span>
                </div>
                <div className="text-[11px] text-slate-500 pt-1">
                  Mã QR Gate Pass mới đã được tự động cập nhật trong ứng dụng của khách hàng.
                </div>
              </div>
            </div>

            <div className="flex justify-end pt-2">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg bg-emerald-700 hover:bg-emerald-800 px-4 py-2 font-bold text-white text-xs shadow-xs"
              >
                Đóng
              </button>
            </div>
          </div>
        ) : (
          /* Form đổi kho */
          <form onSubmit={handleSubmit} className="mt-4 space-y-4 text-xs">
            {/* Tóm tắt tình trạng */}
            <div className="rounded-xl border border-rose-200 bg-rose-50/70 p-3.5 space-y-2 text-rose-950">
              <div className="flex items-center gap-1.5 font-bold text-rose-900">
                <span className="material-symbols-outlined text-[16px] text-rose-600">warning</span>
                <span>Thông tin hợp đồng &amp; Sự cố nghiêm trọng:</span>
              </div>
              <div className="grid grid-cols-2 gap-2 text-[11px]">
                <div>
                  <span className="text-slate-500">Khách hàng:</span>{" "}
                  <strong className="text-slate-900">{ticket.customerName || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Số điện thoại:</span>{" "}
                  <strong className="text-slate-900">{ticket.customerPhone || "—"}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Hợp đồng:</span>{" "}
                  <strong className="text-slate-900 font-mono">{ticket.agreementNo || `#${ticket.id}`}</strong>
                </div>
                <div>
                  <span className="text-slate-500">Kho hư hỏng cũ:</span>{" "}
                  <strong className="text-rose-700 font-bold">Kho {oldUnitCode}</strong>
                </div>
              </div>
              {ticket.reportNote && (
                <p className="text-[11px] text-slate-700 border-t border-rose-200 pt-1.5 italic">
                  Báo cáo của Staff: &ldquo;{ticket.reportNote}&rdquo;
                </p>
              )}
            </div>

            {/* Chọn kho mới */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wide mb-1">
                Chọn ô kho tương đương khả dụng tại cơ sở *
              </label>

              {loadingUnits ? (
                <p className="text-slate-400 italic">Đang tải danh sách kho trống...</p>
              ) : availableUnits.length === 0 ? (
                <div className="rounded-lg border border-amber-300 bg-amber-50 p-3 text-amber-900 text-xs">
                  Hiện không còn ô kho trống nào tại cơ sở này để đổi! Vui lòng kiểm tra lại sơ đồ kho hoặc điều phối sang cơ sở khác.
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
                      Kho {unit.unitCode} · {unit.unitTypeName || "Tiêu chuẩn"} {unit.dimensions ? `(${unit.dimensions})` : ""}
                    </option>
                  ))}
                </select>
              )}
            </div>

            {/* Quy trình điều chuyển tự động */}
            <div className="rounded-xl border border-blue-200 bg-blue-50/70 p-3 space-y-1.5 text-blue-950 text-[11px]">
              <span className="font-bold text-blue-900 block">
                Cơ chế tự động khi Quản lý xác nhận đổi kho:
              </span>
              <ul className="space-y-1 text-slate-700 list-disc list-inside">
                <li>Kho cũ (<strong>{oldUnitCode}</strong>) chuyển ngay sang trạng thái: <strong className="text-rose-700">MAINTENANCE</strong> (bảo trì).</li>
                <li>Kho mới chọn chuyển sang trạng thái: <strong className="text-emerald-700">OCCUPIED</strong> (đang thuê).</li>
                <li>Khoản chênh lệch đổi kho: <strong className="text-emerald-700 font-bold">0 VNĐ</strong> (khách không phải bù thêm tiền).</li>
                <li>Hệ thống tự động cấp mã PIN &amp; mã QR Gate Pass mới cho khách hàng.</li>
              </ul>
            </div>

            {/* Ghi chú */}
            <div>
              <label className="block font-bold text-slate-800 uppercase tracking-wide mb-1">
                Lý do &amp; Ghi chú đổi kho:
              </label>
              <textarea
                rows={2}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder="Ghi chú chi tiết cho hợp đồng và thông báo khách hàng..."
                className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-2.5 text-xs text-slate-900 outline-none focus:border-[#1d5fe5] focus:bg-white"
              />
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
                className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 font-bold text-white shadow-xs transition disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">swap_horiz</span>
                <span>{submitting ? "Đang xử lý..." : "Đổi kho khẩn cấp (0đ)"}</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
