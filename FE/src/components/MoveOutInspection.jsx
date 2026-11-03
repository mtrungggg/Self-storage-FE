import { useState } from "react";
import InspectionFormModal from "./InspectionFormModal";

export default function MoveOutInspection({ moveOut, onCompleted }) {
  const [result, setResult] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);

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
    <div className="mt-3">
      <button
        type="button"
        onClick={() => setModalOpen(true)}
        className="inline-flex items-center gap-1.5 rounded-lg bg-[#1d5fe5] hover:bg-[#1550c7] px-3.5 py-2 text-xs font-bold text-white shadow-xs transition cursor-pointer"
      >
        <span className="material-symbols-outlined text-[16px]">fact_check</span>
        <span>Biên bản kiểm tra trả kho</span>
      </button>

      {modalOpen && (
        <InspectionFormModal
          inspection={moveOut}
          isOpen={modalOpen}
          onClose={() => setModalOpen(false)}
          onSuccess={(data) => {
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
