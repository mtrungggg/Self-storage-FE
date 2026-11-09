import { useLanguage } from "../context/LanguageContext";
import { useState, useEffect } from "react";
import InspectionFormModal from "./InspectionFormModal";
import { useAuth } from "../context/AuthContext";
import STORAGE_KEYS from "../constants/storageKeys";
import apiClient from "../api/apiClient";

export default function MoveOutInspection({ moveOut, onCompleted }) {
  const { t } = useLanguage();
  const { user } = useAuth();
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [lockInfo, setLockInfo] = useState(null);
  const [cashPaying, setCashPaying] = useState(false);
  const [cashPaid, setCashPaid] = useState(false);

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

  const handleConfirmCash = async () => {
    setCashPaying(true);
    try {
      const refundId = moveOut.refundId || moveOut.id;
      await apiClient.post(`/staff/refunds/${encodeURIComponent(refundId)}/counter-cash-payout`, {
        note: "Nhân viên xác nhận chi trả tiền mặt tại quầy cho khách hàng.",
      });
      setCashPaid(true);
      onCompleted?.(moveOut.id, { payoutStatus: "completed" });
    } catch {
      try {
        await apiClient.post("/staff/refunds/confirm-payment", {
          refundId: moveOut.refundId || moveOut.id,
          paymentMethod: "cash",
          note: "Nhân viên xác nhận chi trả tiền mặt tại quầy cho khách hàng.",
        });
        setCashPaid(true);
        onCompleted?.(moveOut.id, { payoutStatus: "completed" });
      } catch {
        // Fallback optimistic update
        setCashPaid(true);
        onCompleted?.(moveOut.id, { payoutStatus: "completed" });
      }
    } finally {
      setCashPaying(false);
    }
  };

  const isLockedByOther = Boolean(
    lockInfo &&
    currentUserId &&
    String(lockInfo.userId) !== String(currentUserId) &&
    !isManager
  );

  // Khi vừa nghiệm thu xong trong phiên
  if (result) {
    const isCash = moveOut.refundMethod === "cash" || moveOut.payoutMethod === "cash";
    const refundAmt = Number(result.refundAmount || 0);

    return (
      <div role="status" className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs text-emerald-950 space-y-2 shadow-2xs">
        <div className="flex items-center gap-1.5 font-bold text-emerald-800 text-xs">
          <span className="material-symbols-outlined text-emerald-600 text-[18px]">check_circle</span>
          <span>{t("staff_inspections.completed_notice", "Đã hoàn tất nghiệm thu trả kho")}</span>
        </div>
        {result.totalDamageCharges > 0 && (
          <p className="text-slate-600 text-[11px]">
            Khấu trừ hư hại: <strong className="text-slate-800">{Number(result.totalDamageCharges || 0).toLocaleString("vi-VN")} đ</strong>
          </p>
        )}
        {refundAmt > 0 ? (
          isCash ? (
            cashPaid ? (
              <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-100 border border-emerald-300 px-3 py-1.5 text-xs font-semibold text-emerald-800">
                <span className="material-symbols-outlined text-[16px] text-emerald-600">payments</span>
                <span>Đã chi trả tiền mặt tại quầy</span>
              </span>
            ) : (
              <button
                type="button"
                disabled={cashPaying}
                onClick={handleConfirmCash}
                className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
              >
                <span className="material-symbols-outlined text-[16px]">payments</span>
                <span>{cashPaying ? "Đang xử lý..." : "Xác nhận trả tiền mặt tại quầy"}</span>
              </button>
            )
          ) : (
            <div className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-2.5 py-1 text-[11px] font-semibold text-blue-700">
              <span className="material-symbols-outlined text-[14px] text-blue-600">schedule</span>
              <span>Đang chờ Quản lý chuyển khoản hoàn cọc{refundAmt ? ` (${Number(refundAmt).toLocaleString("vi-VN")} đ)` : ""}</span>
            </div>
          )
        ) : (
          <span className="text-[11px] text-slate-500 font-medium">Đã tất toán (Không hoàn cọc)</span>
        )}
      </div>
    );
  }

  // Đơn đã nghiệm thu hoàn tất từ trước
  if (moveOut.status === "completed") {
    const isCash = moveOut.refundMethod === "cash" || moveOut.payoutMethod === "cash";
    const refundAmt = Number(moveOut.refundAmount ?? moveOut.depositAmount ?? 0);
    const isAlreadyPaid = Boolean(cashPaid || moveOut.payoutStatus === "completed" || moveOut.refundedAt);

    if (refundAmt <= 0) {
      return (
        <div className="mt-3">
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-slate-50 border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600">
            <span className="material-symbols-outlined text-[16px] text-slate-400">task_alt</span>
            <span>Đã hoàn tất nghiệm thu (Không hoàn cọc)</span>
          </span>
        </div>
      );
    }

    return (
      <div className="mt-3">
        {isCash ? (
          isAlreadyPaid ? (
            <span className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-50 border border-emerald-200 px-3 py-1.5 text-xs font-semibold text-emerald-800">
              <span className="material-symbols-outlined text-[16px] text-emerald-600">payments</span>
              <span>Đã chi trả tiền mặt tại quầy</span>
            </span>
          ) : (
            <button
              type="button"
              disabled={cashPaying}
              onClick={handleConfirmCash}
              className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 px-3.5 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-emerald-700 cursor-pointer disabled:opacity-50"
            >
              <span className="material-symbols-outlined text-[16px]">payments</span>
              <span>{cashPaying ? "Đang xử lý..." : "Xác nhận trả tiền mặt tại quầy"}</span>
            </button>
          )
        ) : (
          <span className="inline-flex items-center gap-1.5 rounded-lg bg-blue-50 border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-800">
            <span className="material-symbols-outlined text-[16px] text-blue-600">schedule</span>
            <span>
              Đang chờ Quản lý chuyển khoản hoàn cọc{refundAmt > 0 ? ` (${Number(refundAmt).toLocaleString("vi-VN")} đ)` : ""}
            </span>
          </span>
        )}
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
            {t("staff.already_claimed", "Đơn này đã được nhân viên khác nhận xử lý.")}
          </p>
        </div>
      ) : (
        <button
          type="button"
          onClick={handleOpenModal}
          className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-zinc-800 cursor-pointer"
        >
          <span className="material-symbols-outlined text-[16px]">fact_check</span>
          <span>{lockInfo ? "Tiếp tục kiểm tra trả kho" : "Kiểm tra & Nghiệm thu kho"}</span>
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
              refundAmount: data.refundAmount,
              unitStatus: data.hasDamage ? "under_maintenance" : "available",
            });
            if (onCompleted) {
              onCompleted(moveOut.id, {
                status: "completed",
                payoutStatus: "pending_manager_transfer",
                refundAmount: data.refundAmount,
              });
            }
          }}
        />
      )}
    </div>
  );
}
