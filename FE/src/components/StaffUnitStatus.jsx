import { useState } from "react";
import staffFacilityService from "../api/staffFacilityService";
import { useAuth } from "../context/AuthContext";

export default function StaffUnitStatus({ unit, onUpdated }) {
  const { user } = useAuth();
  const currentStatus = String(unit.physicalStatus || unit.status || "").toLowerCase();
  const isOccupiedOrReserved = currentStatus === "occupied" || currentStatus === "reserved";
  const isCleaning = currentStatus === "cleaning";
  const isMaintenance = currentStatus === "maintenance" || currentStatus === "under_maintenance" || currentStatus === "damaged";
  const isAvailable = currentStatus === "available" || (!isOccupiedOrReserved && !isCleaning && !isMaintenance);

  const [loadingAction, setLoadingAction] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  // Input state for transitions that require reasons
  const [promptTargetStatus, setPromptTargetStatus] = useState(null);
  const [reasonInput, setReasonInput] = useState("");

  // Parse task ownership lock info from unit.notes
  // Note format: [LOCKED_BY:{userId}:{userName}] {reason}
  const rawNotes = String(unit.notes || "").trim();
  let lockOwnerId = null;
  let lockOwnerName = "";
  let lockReason = rawNotes;

  if (rawNotes.startsWith("[LOCKED_BY:")) {
    const endBracket = rawNotes.indexOf("]");
    if (endBracket > 11) {
      const inner = rawNotes.slice(11, endBracket);
      const colonIdx = inner.indexOf(":");
      if (colonIdx >= 0) {
        lockOwnerId = inner.slice(0, colonIdx);
        lockOwnerName = inner.slice(colonIdx + 1);
      } else {
        lockOwnerId = inner;
      }
      lockReason = rawNotes.slice(endBracket + 1).trim();
    }
  }

  const currentUserId = user?.id || user?.userId || user?.employeeId;
  const isManager = Boolean(
    user?.role?.includes("manager") ||
    user?.role?.includes("admin") ||
    user?.roles?.some((r) => r.toLowerCase().includes("manager") || r.toLowerCase().includes("admin"))
  );

  const isOwner = Boolean(
    !lockOwnerId ||
    String(lockOwnerId) === String(currentUserId) ||
    isManager
  );

  async function executeStatusChange(nextStatus, reasonText = "") {
    const targetUnitId = unit.unitId || unit.id;
    const targetFacilityId = unit.facilityId;
    if (!targetFacilityId || !targetUnitId) {
      setError("Facility ID and Unit ID are required.");
      return;
    }

    setLoadingAction(nextStatus);
    setError("");
    setNotice("");

    try {
      await staffFacilityService.updatePhysicalStatus(targetFacilityId, targetUnitId, {
        physicalStatus: nextStatus,
        notes: reasonText,
        reason: reasonText,
      });

      const updatedNotes =
        nextStatus === "available"
          ? null
          : `[LOCKED_BY:${currentUserId}:${user?.fullName || "Staff"}] ${reasonText}`.trim();

      onUpdated?.({
        ...unit,
        status: nextStatus,
        physicalStatus: nextStatus,
        notes: updatedNotes,
      });

      setPromptTargetStatus(null);
      setReasonInput("");
      setNotice(`Đã chuyển trạng thái kho sang ${nextStatus.toUpperCase()} thành công.`);
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Không thể cập nhật trạng thái kho.");
    } finally {
      setLoadingAction(null);
    }
  }

  function handleInitiateTransition(targetStatus) {
    setError("");
    if (targetStatus === "available") {
      executeStatusChange("available", "");
    } else {
      setPromptTargetStatus(targetStatus);
      setReasonInput("");
    }
  }

  function handleConfirmPrompt(e) {
    e.preventDefault();
    if (!reasonInput.trim()) {
      setError("Vui lòng nhập lý do/ghi chú (bắt buộc).");
      return;
    }
    executeStatusChange(promptTargetStatus, reasonInput.trim());
  }

  return (
    <div className="text-xs space-y-3">
      {/* Cảnh báo khi kho đang có khách thuê / giữ chỗ */}
      {isOccupiedOrReserved && (
        <div className="rounded-xl border border-amber-300 bg-amber-50/90 p-3.5 text-xs text-amber-950 space-y-1.5 shadow-2xs">
          <div className="flex items-center gap-1.5 font-bold text-amber-900">
            <span className="material-symbols-outlined text-[18px] text-amber-700">lock</span>
            <span>Kho đang được thuê/giữ chỗ ({currentStatus === "occupied" ? "Occupied · Đang thuê" : "Reserved · Đã đặt"})</span>
          </div>
          <p className="text-amber-800 leading-relaxed">
            Kho đang được thuê/giữ chỗ. Vui lòng xử lý qua luồng <strong>Check-in</strong> hoặc <strong>Move-out</strong>.
          </p>
        </div>
      )}

      {/* Hiển thị Task Ownership Lock khi kho đang Cleaning hoặc Maintenance */}
      {(isCleaning || isMaintenance) && (
        <div className={`rounded-xl border p-3.5 text-xs shadow-2xs space-y-1.5 ${
          isCleaning ? "border-amber-300 bg-amber-50/70" : "border-rose-300 bg-rose-50/70"
        }`}>
          <div className="flex items-center justify-between gap-2">
            <div className="flex items-center gap-1.5 font-bold">
              <span className={`material-symbols-outlined text-[17px] ${isCleaning ? "text-amber-700" : "text-rose-700"}`}>
                lock
              </span>
              <span className={isCleaning ? "text-amber-950" : "text-rose-950"}>
                🔒 Đang xử lý bởi: <strong>{lockOwnerName || "Nhân viên vận hành"}</strong>
              </span>
            </div>
            <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-extrabold uppercase ${
              isCleaning ? "bg-amber-200 text-amber-900" : "bg-rose-200 text-rose-900"
            }`}>
              {isCleaning ? "Cleaning" : "Maintenance"}
            </span>
          </div>

          <div className="text-slate-700 text-[11px] pt-1 border-t border-slate-200/60">
            <span className="font-semibold text-slate-800">Lý do:</span>{" "}
            <span>{lockReason || "Đang bảo trì/vệ sinh theo phân công"}</span>
          </div>

          {/* Nếu người đang đăng nhập KHÔNG PHẢI là người giữ khóa */}
          {!isOwner && (
            <div className="mt-2 rounded-lg bg-rose-100/80 p-2 text-[11px] font-semibold text-rose-900 border border-rose-200">
              ⛔ Bạn không phải là người đang phụ trách kho này (và không phải Quản lý). Chỉ người đang giữ khóa ({lockOwnerName}) hoặc Quản lý cơ sở mới có quyền cập nhật trạng thái.
            </div>
          )}
        </div>
      )}

      {/* Các nút chuyển tiếp trạng thái hợp lệ */}
      {!isOccupiedOrReserved && (
        <div>
          {/* TRƯỜNG HỢP 1: Kho đang Available -> Có thể chọn Cleaning hoặc Maintenance (bắt buộc nhập lý do) */}
          {isAvailable && (
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Thao tác chuyển trạng thái (Cần nhập lý do)
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={loadingAction != null}
                  onClick={() => handleInitiateTransition("cleaning")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-700">cleaning_services</span>
                  <span>🧹 Dọn dẹp ngắn hạn (Cleaning)</span>
                </button>

                <button
                  type="button"
                  disabled={loadingAction != null}
                  onClick={() => handleInitiateTransition("maintenance")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-700">build</span>
                  <span>🔧 Sửa chữa/Bảo trì (Maintenance)</span>
                </button>
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP 2: Kho đang Cleaning -> Người giữ khóa có thể: Hoàn tất dọn dẹp (Về Available) HOẶC Phát hiện hư hỏng (Chuyển sang Maintenance) */}
          {isCleaning && isOwner && (
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Bước tiếp theo của người phụ trách:
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={loadingAction != null}
                  onClick={() => handleInitiateTransition("available")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>✅ Hoàn tất dọn dẹp (Về Available)</span>
                </button>

                <button
                  type="button"
                  disabled={loadingAction != null}
                  onClick={() => handleInitiateTransition("maintenance")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-rose-300 bg-rose-50 hover:bg-rose-100 text-rose-900 px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] text-rose-700">build</span>
                  <span>🔧 Phát hiện hư hỏng (Chuyển sang Maintenance)</span>
                </button>
              </div>
            </div>
          )}

          {/* TRƯỜNG HỢP 3: Kho đang Maintenance -> Người giữ khóa có thể: Hoàn tất bảo trì (Về Available) HOẶC Chuyển sang Dọn dẹp (Cleaning) */}
          {isMaintenance && isOwner && (
            <div className="space-y-2">
              <span className="block text-[11px] font-bold uppercase tracking-wider text-slate-500">
                Bước tiếp theo của người phụ trách:
              </span>
              <div className="flex flex-wrap gap-2.5">
                <button
                  type="button"
                  disabled={loadingAction != null}
                  onClick={() => handleInitiateTransition("available")}
                  className="inline-flex items-center gap-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px]">check_circle</span>
                  <span>✅ Hoàn tất bảo trì (Về Available)</span>
                </button>

                <button
                  type="button"
                  disabled={loadingAction != null}
                  onClick={() => handleInitiateTransition("cleaning")}
                  className="inline-flex items-center gap-1.5 rounded-xl border border-amber-300 bg-amber-50 hover:bg-amber-100 text-amber-900 px-3.5 py-2 text-xs font-bold transition shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <span className="material-symbols-outlined text-[16px] text-amber-700">cleaning_services</span>
                  <span>🧹 Chuyển sang Dọn dẹp (Cleaning)</span>
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Form nhập lý do / ghi chú bắt buộc trước khi chuyển trạng thái */}
      {promptTargetStatus && (
        <form onSubmit={handleConfirmPrompt} className="mt-3 rounded-xl border border-blue-200 bg-blue-50/50 p-3.5 space-y-2.5 shadow-2xs">
          <div className="flex items-center justify-between">
            <span className="font-bold text-blue-950 text-xs flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">edit_note</span>
              <span>
                Nhập lý do chuyển sang {promptTargetStatus.toUpperCase()} (Bắt buộc):
              </span>
            </span>
            <button
              type="button"
              onClick={() => setPromptTargetStatus(null)}
              className="text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
            >
              ✕ Hủy
            </button>
          </div>

          <textarea
            required
            rows={2}
            value={reasonInput}
            onChange={(e) => setReasonInput(e.target.value)}
            placeholder={
              promptTargetStatus === "cleaning"
                ? "VD: Sàn nhà bị bụi bẩn, có rác thải cần quét dọn..."
                : "VD: Cửa cuốn bị kẹt, đèn chiếu sáng bị cháy cần thay..."
            }
            className="w-full rounded-lg border border-slate-300 bg-white p-2 text-xs text-slate-800 outline-none focus:border-blue-500 shadow-2xs"
          />

          <div className="flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPromptTargetStatus(null)}
              className="rounded-lg border border-slate-200 bg-white px-3 py-1.5 text-xs font-semibold text-slate-600 hover:bg-slate-50 cursor-pointer"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={loadingAction != null || !reasonInput.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-[#1550c7] px-4 py-1.5 text-xs font-bold text-white shadow-2xs transition cursor-pointer disabled:opacity-50"
            >
              <span>{loadingAction ? "Đang lưu..." : "Xác nhận & Giữ khóa"}</span>
            </button>
          </div>
        </form>
      )}

      {error && (
        <p role="alert" className="rounded-lg bg-rose-50 p-2.5 text-[11px] font-semibold text-rose-800 border border-rose-200">
          {error}
        </p>
      )}
      {notice && (
        <p role="status" className="rounded-lg bg-emerald-50 p-2.5 text-[11px] font-semibold text-emerald-800 border border-emerald-200">
          {notice}
        </p>
      )}
    </div>
  );
}