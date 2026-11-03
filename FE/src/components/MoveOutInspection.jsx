import { useState, useEffect } from "react";
import InspectionFormModal from "./InspectionFormModal";
import { useAuth } from "../context/AuthContext";
import STORAGE_KEYS from "../constants/storageKeys";

export default function MoveOutInspection({ moveOut, onCompleted }) {
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lockInfo, setLockInfo] = useState(null);

  const lockKey = STORAGE_KEYS.getMoveOutLockKey(moveOut.id);
  const currentUserId = user?.id || user?.userId || user?.employeeId;
  const currentUserName = user?.fullName || user?.name || `Staff #${currentUserId || "Ops"}`;
  const isManager = Boolean(
    user?.role?.includes("manager") ||
    user?.role?.includes("admin") ||
    user?.roles?.some((r) => r.toLowerCase().includes("manager") || r.toLowerCase().includes("admin"))
  );

  useEffect(() => {
    try {
      const raw = localStorage.getItem(lockKey);
      if (raw) {
        const parsed = JSON.parse(raw);
        // Lock expires after 30 minutes
        if (Date.now() - parsed.timestamp < 30 * 60 * 1000) {
          setLockInfo(parsed);
        } else {
          localStorage.removeItem(lockKey);
        }
      }
    } catch {
      // Ignore
    }
  }, [lockKey, modalOpen]);

  function handleOpenModal() {
    const lock = {
      userId: currentUserId,
      userName: currentUserName,
      timestamp: Date.now(),
    };
    try {
      localStorage.setItem(lockKey, JSON.stringify(lock));
      setLockInfo(lock);
    } catch {
      // Ignore
    }
    setModalOpen(true);
  }

  function handleCloseModal() {
    setModalOpen(false);
  }

  const isLockedByOther = Boolean(
    lockInfo &&
    currentUserId &&
    String(lockInfo.userId) !== String(currentUserId) &&
    !isManager
  );

  if (result) {
    return (
      <div role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950 space-y-1.5 shadow-xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>Đã hoàn tất nghiệm thu trả kho</span>
        </div>
        <p className="text-slate-600 text-[11px]">
          Khấu trừ hư hại: <strong className="text-slate-800">{Number(result.totalDamageCharges || 0).toLocaleString("vi-VN")} đ</strong>
        </p>
        <div className="inline-flex items-center gap-1 rounded-full bg-blue-50 border border-blue-200 px-2 py-0.5 text-[11px] font-semibold text-blue-700">
          <span className="material-symbols-outlined text-[13px] text-blue-600">schedule</span>
          <span>Đang chờ Quản lý (Manager) chuyển khoản hoàn cọc</span>
        </div>
      </div>
    );
  }

  if (moveOut.status === "completed") {
    return (
      <div className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-blue-50 border border-blue-200 px-2.5 py-1 text-xs font-semibold text-blue-800">
        <span className="material-symbols-outlined text-[15px] text-blue-600">schedule</span>
        <span>Đang chờ Quản lý (Manager) chuyển khoản</span>
      </div>
    );
  }

  if (moveOut.status === "cancelled") return null;

  return (
    <div className="mt-3 space-y-2">
      {isLockedByOther ? (
        <div className="rounded-lg border border-amber-200 bg-amber-50 p-2.5 text-xs text-amber-900">
          <div className="flex items-center gap-1.5 font-bold mb-0.5">
            <span className="material-symbols-outlined text-[15px] text-amber-700">lock</span>
            <span>Đang kiểm tra bởi: {lockInfo.userName}</span>
          </div>
          <p className="text-[11px] text-amber-800">
            Đơn này đã được nhân viên khác nhận việc để chống nộp biên bản trùng lặp.
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-[#1550c7] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">fact_check</span>
          <span>{lockInfo ? "Tiếp tục kiểm tra trả kho" : "Biên bản kiểm tra trả kho"}</span>
        </button>
      )}

      {modalOpen && (
        <InspectionFormModal
          inspection={moveOut}
          isOpen={modalOpen}
          onClose={handleCloseModal}
          onSuccess={(data) => {
            try {
              localStorage.removeItem(lockKey);
            } catch {
              // Ignore
            }
            setResult({
              inspectionId: data.id || "M-" + Date.now(),
              totalDamageCharges: data.damageCost || 0,
              unitStatus: data.hasDamage ? "under_maintenance" : "available",
            });
            if (onCompleted) {
              onCompleted(moveOut.id, {
                status: "completed",
                payoutStatus: "pending_manager_transfer",
              });
            }
          }}
        />
      )}
    </div>
  );
}
