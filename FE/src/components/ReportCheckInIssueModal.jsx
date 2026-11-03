import { useState } from "react";
import apiClient from "../api/apiClient";

const PRESET_ISSUES = [
  "Dơ bẩn / Rác tồn sót lại chưa dọn",
  "Kẹt ray cửa cuốn / Cửa không kéo lên được",
  "Hỏng ổ khóa / Kẹt then cài không đóng mở được",
  "Thấm dột nước / Ẩm mốc trên sàn hoặc tường",
  "Đèn chiếu sáng hoặc quạt thông gió hỏng",
];

export default function ReportCheckInIssueModal({ target, isOpen, onClose, onSuccess, isStaff = true }) {
  const [description, setDescription] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  if (!isOpen || !target) return null;

  function handleSelectPreset(preset) {
    setSelectedPreset(preset);
    setDescription((prev) => (prev ? `${prev}\n- ${preset}` : preset));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) {
      setError("Vui lòng nhập mô tả sự cố kho.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (isStaff) {
        const payload = {
          facilityId: Number(target.facilityId || 1),
          agreementId: target.agreementId || null,
          storageUnitId: target.storageUnitId || target.unitId || null,
          unitCode: target.unitCode || "",
          agreementNo: target.agreementNo || target.currentAgreementNo || "",
          customerName: target.customerName || "",
          description: description.trim(),
          priority: "urgent",
        };
        const res = await apiClient.post("/staff/tickets", payload);
        if (res?.data?.success === false) {
          throw new Error(res?.data?.message || "Không thể tạo ticket sự cố.");
        }
      } else {
        const payload = {
          facilityId: Number(target.facilityId || 1),
          agreementId: target.agreementId || null,
          subject: `[Check-in khẩn cấp] Sự cố kho ${target.unitCode || "chưa rõ"}`,
          category: "incident",
          priority: "urgent",
          description: description.trim(),
        };
        const res = await apiClient.post("/customer/support-tickets", payload);
        if (res?.data?.success === false) {
          throw new Error(res?.data?.message || "Không thể tạo ticket sự cố.");
        }
      }

      setSuccessMsg("Đã gửi báo cáo sự cố khẩn cấp lên Quản lý cơ sở điều phối!");
      if (onSuccess) {
        onSuccess(target);
      }
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1400);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err.message ||
        "Gặp lỗi khi gửi báo cáo sự cố. Vui lòng thử lại."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-issue-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <span className="material-symbols-outlined text-[20px]">report_problem</span>
            </span>
            <div>
              <h2 id="report-issue-modal-title" className="text-base font-bold text-slate-900">
                Báo sự cố kho lúc Check-in
              </h2>
              <p className="text-xs text-slate-500">
                Gửi Ticket khẩn cấp cho Quản lý cơ sở để xử lý tức thì
              </p>
            </div>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Target Info Summary */}
        <div className="mt-3.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-amber-900 font-semibold">
              Ô kho: <strong className="text-slate-900 text-sm">{target.unitCode || "—"}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-700 text-[10px] uppercase">
              <span className="material-symbols-outlined text-[13px]">bolt</span>
              Ưu tiên: Khẩn cấp (Urgent)
            </span>
          </div>
          {(target.agreementNo || target.currentAgreementNo) && (
            <div className="text-slate-600">
              Hợp đồng: <span className="font-mono font-semibold text-slate-800">{target.agreementNo || target.currentAgreementNo}</span>
            </div>
          )}
          {target.customerName && (
            <div className="text-slate-600">
              Khách hàng: <strong className="text-slate-800">{target.customerName}</strong>
            </div>
          )}
        </div>

        {/* Success Alert */}
        {successMsg && (
          <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {/* Error Alert */}
        {error && (
          <div className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5">
          {/* Quick preset pills */}
          <div>
            <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-600 mb-1.5">
              Chọn nhanh tình trạng sự cố:
            </label>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ISSUES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                    selectedPreset === preset
                      ? "border-rose-400 bg-rose-50 text-rose-700 font-bold"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          {/* Description Textarea */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Mô tả chi tiết sự cố *
            </label>
            <textarea
              rows={3}
              required
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              placeholder="VD: Khách đến mở kho thấy bụi bẩn nhiều và có bao tải rác cũ / Kẹt cửa cuốn không kéo lên được..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>

          {/* Quy trình thông tin */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-2.5 text-[11px] text-slate-600 space-y-1">
            <div className="font-bold text-slate-800 flex items-center gap-1">
              <span className="material-symbols-outlined text-[15px] text-[#1d5fe5]">info</span>
              Quy trình phối hợp khẩn cấp:
            </div>
            <p>1. Manager nhận được Ticket sẽ điều phối nhân viên kiểm tra ngay.</p>
            <p>2. Nếu dọn nhanh được, nhân viên khắc phục tại chỗ để khách nhận kho.</p>
            <p>3. Nếu hỏng nặng, hệ thống tự động khóa bảo trì và Manager duyệt đổi kho mới ngay lập tức.</p>
          </div>

          {/* Buttons */}
          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy bỏ
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{submitting ? "Đang gửi..." : "Gửi báo cáo lên Manager"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
