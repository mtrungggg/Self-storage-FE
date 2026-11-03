import { useState } from "react";
import staffSupportService from "../api/staffSupportService";
import StaffTicketReply from "./StaffTicketReply";
import StaffTicketCharge from "./StaffTicketCharge";
import MediaUpload from "./MediaUpload";

function formatDate(val) {
  if (!val) return "—";
  try {
    return new Date(val).toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return String(val);
  }
}

export default function StaffAssignedTicketModal({ ticket, isOpen, onClose, onSuccess }) {
  const [activeAction, setActiveAction] = useState("resolve"); // 'resolve' | 'severe' | 'charge'
  const [resolveNote, setResolveNote] = useState("");
  const [severeNote, setSevereNote] = useState("");
  const [evidenceUrls, setEvidenceUrls] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  if (!isOpen || !ticket) return null;

  const isResolvedOrClosed =
    ticket.status === "resolved" ||
    ticket.status === "closed" ||
    ticket.status === "completed";

  const isSevere = ticket.status === "severe_need_relocation";

  function handleAddPhoto(uploaded) {
    const url = uploaded?.url || (typeof uploaded === "string" ? uploaded : null);
    if (!url) return;
    setEvidenceUrls((prev) => [...prev, url]);
  }

  function handleRemovePhoto(idx) {
    setEvidenceUrls((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleResolveSubmit(e) {
    e.preventDefault();
    if (!resolveNote.trim()) {
      setError("Vui lòng nhập ghi chú kết quả xử lý công việc.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await staffSupportService.reportTicket(ticket.id, {
        result: "Resolved",
        note: resolveNote.trim(),
        evidenceUrls,
      });
      if (onSuccess) onSuccess(res || { ...ticket, status: "resolved", resolution: resolveNote });
      onClose();
    } catch (err) {
      setError(err.message || "Không thể báo cáo hoàn thành. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleSevereSubmit(e) {
    e.preventDefault();
    if (!severeNote.trim()) {
      setError("Vui lòng ghi rõ mô tả hư hỏng nặng và lý do cần đổi kho.");
      return;
    }

    setSubmitting(true);
    setError("");
    try {
      const res = await staffSupportService.reportTicket(ticket.id, {
        result: "Severe_Need_Relocation",
        note: severeNote.trim(),
        evidenceUrls,
      });
      if (onSuccess) onSuccess(res || { ...ticket, status: "severe_need_relocation", resolution: severeNote });
      onClose();
    } catch (err) {
      setError(err.message || "Không thể gửi báo cáo hư hỏng nặng. Vui lòng thử lại.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-2xl rounded-2xl bg-white shadow-2xl border border-slate-200 max-h-[92vh] flex flex-col overflow-hidden">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-100 p-4 sm:p-5 bg-gradient-to-r from-slate-50 to-white shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <span className="material-symbols-outlined text-[24px] text-[#1d5fe5]">
                assignment_turned_in
              </span>
              <h2 className="text-base sm:text-lg font-bold text-slate-900">
                Ticket công việc: #{ticket.ticketNo || ticket.id}
              </h2>
              {ticket.priority && (
                <span
                  className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold ${
                    ticket.priority === "urgent" || ticket.priority === "critical"
                      ? "bg-rose-100 text-rose-800 border border-rose-200"
                      : "bg-blue-100 text-blue-800 border border-blue-200"
                  }`}
                >
                  {ticket.priority === "urgent" ? "Khẩn cấp" : ticket.priority}
                </span>
              )}
            </div>

            <p className="mt-1 text-xs text-slate-600 flex flex-wrap items-center gap-x-3 gap-y-1">
              {ticket.unitCode && (
                <span className="font-semibold text-slate-800">
                  Ô kho: <strong className="text-[#1d5fe5]">{ticket.unitCode}</strong>
                </span>
              )}
              {ticket.customerName && (
                <span>
                  Khách: <strong>{ticket.customerName}</strong>
                </span>
              )}
              {ticket.createdAt && (
                <span className="text-slate-400">
                  Giao việc lúc: {formatDate(ticket.createdAt)}
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        {/* Modal Scrollable Body */}
        <div className="p-4 sm:p-5 space-y-4 overflow-y-auto flex-1 text-xs">
          {/* Thông tin sự cố / yêu cầu */}
          <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3.5 space-y-1.5">
            <span className="text-[11px] font-bold uppercase tracking-wider text-slate-500 block">
              Nội dung yêu cầu / Sự cố:
            </span>
            <p className="font-semibold text-slate-900 text-sm">
              {ticket.subject || "Yêu cầu kiểm tra & dọn dẹp kho"}
            </p>
            {ticket.description && (
              <p className="text-slate-600 whitespace-pre-line leading-relaxed">
                {ticket.description}
              </p>
            )}
          </div>

          {/* Đã hoàn thành Banner (Read-only) */}
          {isResolvedOrClosed && (
            <div className="rounded-xl border border-emerald-300 bg-emerald-50/80 p-4 space-y-1.5 text-emerald-950">
              <div className="flex items-center gap-2 font-bold text-emerald-900">
                <span className="material-symbols-outlined text-[18px] text-emerald-700">
                  check_circle
                </span>
                <span>Công việc đã được nghiệm thu hoàn tất</span>
              </div>
              <p className="text-emerald-800">
                <strong>Kết quả:</strong> {ticket.resolution || "Đã xử lý xong"}
              </p>
              {ticket.resolvedAt && (
                <p className="text-[11px] text-emerald-700">
                  Thời gian hoàn thành: {formatDate(ticket.resolvedAt)}
                </p>
              )}
            </div>
          )}

          {/* Cảnh báo Hư hỏng nặng (Severe) */}
          {isSevere && (
            <div className="rounded-xl border border-rose-300 bg-rose-50/90 p-4 space-y-1.5 text-rose-950">
              <div className="flex items-center gap-2 font-bold text-rose-900">
                <span className="material-symbols-outlined text-[18px] text-rose-700">
                  warning
                </span>
                <span>Đã báo cáo hư hỏng nặng — Cần Manager đổi kho khẩn cấp</span>
              </div>
              <p className="text-rose-800">
                {ticket.resolution || "Chờ Facility Manager điều phối ô kho mới thay thế cho khách."}
              </p>
            </div>
          )}

          {/* Thao tác thực thi công việc (Chỉ hiện khi chưa xong) */}
          {!isResolvedOrClosed && (
            <div className="rounded-xl border border-blue-200 bg-blue-50/30 p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-blue-100 pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-slate-800 flex items-center gap-1.5">
                  <span className="material-symbols-outlined text-[16px] text-[#1d5fe5]">
                    handyman
                  </span>
                  <span>Hành động xử lý của Staff:</span>
                </span>

                {/* Sub-tabs điều hướng thao tác */}
                <div className="flex items-center gap-1 bg-white p-1 rounded-lg border border-slate-200">
                  <button
                    type="button"
                    onClick={() => {
                      setActiveAction("resolve");
                      setError("");
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      activeAction === "resolve"
                        ? "bg-emerald-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    ✓ Báo cáo xong
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAction("severe");
                      setError("");
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      activeAction === "severe"
                        ? "bg-rose-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    🚨 Hư hỏng nặng
                  </button>

                  <button
                    type="button"
                    onClick={() => {
                      setActiveAction("charge");
                      setError("");
                    }}
                    className={`px-2.5 py-1 rounded text-[11px] font-bold transition cursor-pointer ${
                      activeAction === "charge"
                        ? "bg-amber-600 text-white shadow-xs"
                        : "text-slate-600 hover:bg-slate-100"
                    }`}
                  >
                    + Phụ phí
                  </button>
                </div>
              </div>

              {error && (
                <div className="rounded-lg bg-rose-50 border border-rose-200 p-2 text-rose-700 font-medium">
                  {error}
                </div>
              )}

              {/* Form 1: Báo cáo hoàn thành */}
              {activeAction === "resolve" && (
                <form onSubmit={handleResolveSubmit} className="space-y-3">
                  <label className="block text-slate-700 font-semibold">
                    Ghi chú nghiệm thu hoàn thành: *
                    <textarea
                      rows={2}
                      required
                      value={resolveNote}
                      onChange={(e) => {
                        setResolveNote(e.target.value);
                        setError("");
                      }}
                      placeholder="VD: Đã lau chùi kho sạch sẽ, kiểm tra khóa và đèn chiếu sáng hoạt động tốt..."
                      className="mt-1 w-full rounded-lg border border-slate-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-emerald-500 focus:outline-none"
                    />
                  </label>

                  {/* Ảnh bằng chứng */}
                  <div>
                    <span className="block font-semibold text-slate-700 mb-1">
                      Ảnh chụp sau khi sửa / dọn dẹp (tùy chọn):
                    </span>
                    <MediaUpload
                      onUploaded={handleAddPhoto}
                      buttonLabel="Tải ảnh bằng chứng"
                      className="inline-block"
                    />
                    {evidenceUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {evidenceUrls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt="Proof"
                              className="h-14 w-14 object-cover rounded-lg border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[10px] hover:bg-rose-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={submitting || !resolveNote.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 px-4 py-2 font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        task_alt
                      </span>
                      <span>
                        {submitting ? "Đang gửi báo cáo..." : "Xác nhận báo cáo hoàn thành (Resolved)"}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* Form 2: Báo cáo hư hỏng nặng */}
              {activeAction === "severe" && (
                <form onSubmit={handleSevereSubmit} className="space-y-3">
                  <div className="rounded-lg bg-rose-50 border border-rose-200 p-2.5 text-rose-800 text-[11px]">
                    ⚠️ Báo cáo mức độ này khi ô kho bị hư hỏng nghiêm trọng không thể sửa chữa kịp thời lúc bàn giao cho khách. Hệ thống sẽ khóa ô kho và chuyển yêu cầu tới Facility Manager để kích hoạt <strong>Đổi kho khẩn cấp (Emergency Reassign)</strong>.
                  </div>

                  <label className="block text-slate-700 font-semibold">
                    Mô tả mức độ hư hỏng nặng: *
                    <textarea
                      rows={2}
                      required
                      value={severeNote}
                      onChange={(e) => {
                        setSevereNote(e.target.value);
                        setError("");
                      }}
                      placeholder="VD: Cửa cuốn bị kẹt ray méo mó không kéo được, trần kho bị rò rỉ nước ngập sàn..."
                      className="mt-1 w-full rounded-lg border border-rose-300 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-rose-500 focus:outline-none"
                    />
                  </label>

                  <div>
                    <span className="block font-semibold text-slate-700 mb-1">
                      Ảnh hiện trường hư hỏng:
                    </span>
                    <MediaUpload
                      onUploaded={handleAddPhoto}
                      buttonLabel="Chụp ảnh hư hại"
                      className="inline-block"
                    />
                    {evidenceUrls.length > 0 && (
                      <div className="flex flex-wrap gap-2 mt-2">
                        {evidenceUrls.map((url, idx) => (
                          <div key={idx} className="relative group">
                            <img
                              src={url}
                              alt="Proof"
                              className="h-14 w-14 object-cover rounded-lg border border-slate-200"
                            />
                            <button
                              type="button"
                              onClick={() => handleRemovePhoto(idx)}
                              className="absolute -top-1 -right-1 bg-rose-600 text-white rounded-full p-0.5 text-[10px] hover:bg-rose-700"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="flex justify-end pt-1">
                    <button
                      type="submit"
                      disabled={submitting || !severeNote.trim()}
                      className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
                    >
                      <span className="material-symbols-outlined text-[16px]">
                        emergency
                      </span>
                      <span>
                        {submitting ? "Đang gửi báo cáo..." : "Gửi báo cáo hư nặng — Chuyển Manager đổi kho"}
                      </span>
                    </button>
                  </div>
                </form>
              )}

              {/* Form 3: Đề xuất phụ phí */}
              {activeAction === "charge" && (
                <div className="pt-1">
                  <StaffTicketCharge
                    ticketId={ticket.id}
                    onProposed={() => {
                      setActiveAction("resolve");
                    }}
                  />
                </div>
              )}
            </div>
          )}

          {/* Trao đổi nội bộ giữa Staff & Manager */}
          <div className="rounded-xl border border-slate-200 bg-white p-3.5 space-y-2">
            <span className="text-xs font-bold text-slate-800 uppercase tracking-wider flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[16px] text-blue-600">
                forum
              </span>
              <span>Trao đổi nội bộ &amp; Ghi chú Ticket</span>
            </span>

            <StaffTicketReply
              ticketId={ticket.id}
              readOnly={isResolvedOrClosed}
            />
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end border-t border-slate-100 p-3 bg-slate-50 shrink-0">
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-slate-300 bg-white px-4 py-1.5 font-semibold text-slate-700 hover:bg-slate-100 transition cursor-pointer text-xs"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
}
