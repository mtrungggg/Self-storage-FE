import { useLanguage } from "../context/LanguageContext";
import { useState } from "react";
import staffSupportService from "../api/staffSupportService";
import MediaUpload from "./MediaUpload";

export default function TicketReportModal({ ticket, isOpen, onClose, onSuccess }) {
  const { t } = useLanguage();
  const [result, setResult] = useState("Resolved"); // 'Resolved' | 'Severe_Need_Relocation'
  const [note, setNote] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !ticket) return null;

  function handleAddPhoto(uploaded) {
    const url = uploaded?.url || (typeof uploaded === "string" ? uploaded : null);
    if (!url) return;
    setEvidenceUrls((prev) => [...prev, url]);
  }

  function handleRemovePhoto(indexToRemove) {
    setEvidenceUrls((prev) => prev.filter((_, idx) => idx !== indexToRemove));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!note.trim()) {
      setError("Vui lòng nhập ghi chú kết quả xử lý.");
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      const response = await staffSupportService.reportTicket(ticket.id, {
        result,
        note: note.trim(),
        evidenceUrls,
      });

      if (onSuccess) {
        onSuccess(response || { result, note, evidenceUrls });
      }
      onClose();
    } catch (err) {
      setError(err.message || "Không thể gửi báo cáo nghiệm thu. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="ticket-report-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-xl rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[22px] text-zinc-900 dark:text-zinc-100">
                assignment_turned_in
              </span>
              <h2 id="ticket-report-modal-title" className="text-base font-bold text-slate-900">
                Báo cáo kết quả xử lý Ticket {ticket.ticketNo || `#${ticket.id}`}
              </h2>
            </div>
            <p className="mt-1 text-xs text-slate-500">
              {ticket.subject || "Sự cố thiết bị / dọn dẹp kho"}
              {ticket.unitCode && ` · Ô kho: ${ticket.unitCode}`}
              {ticket.customerName && ` · Khách: ${ticket.customerName}`}
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

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Radio kết quả xử lý */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-2">
              Kết quả nghiệm thu / Đánh giá mức độ *
            </label>
            <div className="space-y-2">
              {/* Option 1: Resolved */}
              <label
                className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
                  result === "Resolved"
                    ? "border-emerald-500 bg-emerald-50/60 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="ticketResult"
                  value="Resolved"
                  checked={result === "Resolved"}
                  onChange={() => setResult("Resolved")}
                  className="mt-1 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="inline-flex items-center gap-1 text-emerald-700">
                      <span className="material-symbols-outlined text-[16px]">check_circle</span>
                      Resolved (Đã sửa / dọn xong)
                    </span>
                    <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-[10px] font-bold text-emerald-800">
                      {t("common.done", "Hoàn tất")}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">
                    Công việc dọn dẹp, bảo trì hoặc sửa chữa đã hoàn thành tốt. Ô kho đảm bảo sạch sẽ, an toàn và sẵn sàng hoạt động bình thường.
                  </p>
                </div>
              </label>

              {/* Option 2: Severe_Need_Relocation */}
              <label
                className={`flex items-start gap-3 rounded-xl border p-3.5 cursor-pointer transition ${
                  result === "Severe_Need_Relocation"
                    ? "border-rose-500 bg-rose-50/60 shadow-xs"
                    : "border-slate-200 bg-white hover:bg-slate-50"
                }`}
              >
                <input
                  type="radio"
                  name="ticketResult"
                  value="Severe_Need_Relocation"
                  checked={result === "Severe_Need_Relocation"}
                  onChange={() => setResult("Severe_Need_Relocation")}
                  className="mt-1 text-rose-600 focus:ring-rose-500"
                />
                <div className="flex-1 text-xs">
                  <div className="flex items-center gap-2 font-bold text-slate-900">
                    <span className="inline-flex items-center gap-1 text-rose-700">
                      <span className="material-symbols-outlined text-[16px]">warning</span>
                      Severe_Need_Relocation (Hư hỏng nặng)
                    </span>
                    <span className="rounded-full bg-rose-100 px-2 py-0.5 text-[10px] font-bold text-rose-800">
                      {t("tickets.request_relocation", "Yêu cầu Manager đổi kho")}
                    </span>
                  </div>
                  <p className="mt-1 text-slate-600">
                    Sự cố nghiêm trọng không thể khắc phục ngay tại quầy (thấm dột nặng, hỏng kết cấu, kẹt cửa không thể mở). Yêu cầu Quản lý (Manager) đổi sang ô kho tương đương 0 VNĐ cho khách.
                  </p>
                </div>
              </label>
            </div>
          </div>

          {/* Ghi chú Note */}
          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              Ghi chú kết quả xử lý (Note) *
            </label>
            <textarea
              rows={3}
              required
              value={note}
              onChange={(e) => {
                setNote(e.target.value);
                setError("");
              }}
              placeholder="VD: Đã thay ổ khóa mới, lau dọn khử mùi xong / hoặc: Cửa kho kẹt trục ray nặng không kéo lên được, tường ngấm nước..."
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none focus:border-zinc-900 dark:border-zinc-100 focus:bg-white"
            />
          </div>

          {/* Upload ảnh nghiệm thu EvidenceUrls */}
          <div>
            <div className="flex items-center justify-between mb-1.5">
              <label className="text-xs font-bold text-slate-800 uppercase tracking-wide">
                Ảnh nghiệm thu / Bằng chứng hiện trường (EvidenceUrls)
              </label>
              <span className="text-[11px] text-slate-500">
                {evidenceUrls.length} ảnh đã đính kèm
              </span>
            </div>

            <MediaUpload
              label="Tải lên ảnh nghiệm thu (JPG, PNG)"
              accept="image/*"
              multiple
              dropzone
              disabled={submitting}
              onUploaded={handleAddPhoto}
            />

            {evidenceUrls.length > 0 && (
              <div className="mt-2.5 grid grid-cols-3 gap-2.5 sm:grid-cols-4">
                {evidenceUrls.map((url, index) => (
                  <div
                    key={`${url}-${index}`}
                    className="group relative aspect-square overflow-hidden rounded-lg border border-slate-200 bg-slate-100 shadow-xs"
                  >
                    <img
                      src={url}
                      alt={`Nghiệm thu ${index + 1}`}
                      className="h-full w-full object-cover"
                    />
                    <button
                      type="button"
                      onClick={() => handleRemovePhoto(index)}
                      className="absolute top-1 right-1 flex h-5 w-5 items-center justify-center rounded-full bg-black/70 text-white hover:bg-rose-600 transition"
                      title="Xóa ảnh này"
                    >
                      <span className="material-symbols-outlined text-[13px]">close</span>
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {error && (
            <div role="alert" className="rounded-lg bg-rose-50 p-3 text-xs font-semibold text-rose-700">
              {error}
            </div>
          )}

          {/* Footer buttons */}
          <div className="flex items-center justify-end gap-2.5 border-t border-slate-100 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-4 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={submitting || !note.trim()}
              className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 ${
                result === "Severe_Need_Relocation"
                  ? "bg-rose-600 hover:bg-rose-700"
                  : "bg-emerald-600 hover:bg-emerald-700"
              }`}
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>
                {submitting
                  ? "Đang gửi báo cáo..."
                  : result === "Severe_Need_Relocation"
                  ? "Gửi báo cáo yêu cầu đổi kho"
                  : "Gửi báo cáo nghiệm thu hoàn tất"}
              </span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
