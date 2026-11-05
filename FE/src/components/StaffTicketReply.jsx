import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState, useId, useRef } from "react";
import staffSupportService from "../api/staffSupportService";

function formatDate(isoStr) {
  if (!isoStr) return "";
  try {
    const d = new Date(isoStr);
    return d.toLocaleString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  } catch {
    return isoStr;
  }
}

export default function StaffTicketReply({ ticketId, readOnly = false, onMessageSent }) {
  const { t } = useLanguage();
  const fieldId = useId();
  const lock = useRef(false);
  const [messages, setMessages] = useState([]);
  const [loadingMessages, setLoadingMessages] = useState(true);
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(true);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [successNotice, setSuccessNotice] = useState("");

  // Tải lịch sử trao đổi
  const loadMessages = async () => {
    if (!ticketId) return;
    try {
      const data = await staffSupportService.getMessages(ticketId);
      setMessages(Array.isArray(data) ? data : []);
    } catch (err) {
      console.warn("Failed to load ticket messages:", err);
    } finally {
      setLoadingMessages(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [ticketId]);

  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current || readOnly) return;
    setError("");
    setSuccessNotice("");

    const trimmed = body.trim();
    if (!trimmed) {
      setError("Vui lòng nhập nội dung ghi chú hoặc phản hồi.");
      return;
    }

    lock.current = true;
    setSending(true);
    try {
      const newMsg = await staffSupportService.sendMessage(ticketId, {
        body: trimmed,
        isInternal,
      });

      setMessages((prev) => [...prev, newMsg]);
      setBody("");
      setSuccessNotice(isInternal ? "Đã lưu ghi chú nội bộ thành công." : "Đã gửi phản hồi đến khách hàng thành công.");
      setTimeout(() => setSuccessNotice(""), 3500);
      onMessageSent?.(newMsg);
    } catch (err) {
      setError(err?.message || "Không thể gửi tin nhắn. Vui lòng thử lại.");
    } finally {
      lock.current = false;
      setSending(false);
    }
  }

  return (
    <div className="space-y-3 text-xs">
      {/* Header khu vực trao đổi */}
      <div className="flex items-center justify-between pb-1.5 border-b border-slate-200/80">
        <span className="font-bold text-slate-800 flex items-center gap-1.5">
          <span className="material-symbols-outlined text-[16px] text-zinc-900 dark:text-zinc-100">forum</span>
          <span>Trao đổi nội bộ &amp; Phản hồi khách ({messages.length})</span>
        </span>
        <button
          type="button"
          onClick={loadMessages}
          disabled={loadingMessages}
          className="text-[11px] text-zinc-900 dark:text-zinc-100 hover:underline flex items-center gap-1 cursor-pointer"
        >
          <span className={`material-symbols-outlined text-[13px] ${loadingMessages ? "animate-spin" : ""}`}>
            refresh
          </span>
          <span>{t("common.refresh", "Làm mới")}</span>
        </button>
      </div>

      {/* Lịch sử tin nhắn / Thread */}
      <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
        {loadingMessages ? (
          <p className="text-slate-400 py-3 text-center italic">{t("common.loading", "Đang tải...")}</p>
        ) : messages.length === 0 ? (
          <div className="rounded-lg bg-slate-50 border border-slate-200/60 p-3 text-center text-slate-400">
            {t("common.no_notes", "Chưa có ghi chú nội bộ hoặc trao đổi nào cho sự cố này.")}
          </div>
        ) : (
          messages.map((msg, idx) => (
            <div
              key={msg.id || idx}
              className={`rounded-xl p-3 border space-y-1 shadow-2xs ${
                msg.isInternal
                  ? "bg-amber-50/70 border-amber-200/80 text-amber-950"
                  : "bg-blue-50/70 border-blue-200/80 text-blue-950"
              }`}
            >
              <div className="flex flex-wrap items-center justify-between gap-1 text-[11px]">
                <div className="flex items-center gap-1.5">
                  <span className="font-bold text-slate-900">
                    {msg.authorName || `User #${msg.authorUserId}`}
                  </span>
                  {msg.authorRole && (
                    <span className="rounded bg-slate-200/70 px-1.5 py-0.2 text-[10px] font-semibold text-slate-700">
                      {msg.authorRole}
                    </span>
                  )}
                  <span
                    className={`rounded-full px-2 py-0.2 text-[10px] font-bold ${
                      msg.isInternal
                        ? "bg-amber-200/90 text-amber-900"
                        : "bg-blue-200/90 text-blue-900"
                    }`}
                  >
                    {msg.isInternal ? "Ghi chú nội bộ" : "Phản hồi khách"}
                  </span>
                </div>
                <span className="text-slate-400 text-[10px]">{formatDate(msg.createdAt)}</span>
              </div>
              <p className="text-xs text-slate-800 whitespace-pre-wrap leading-relaxed">{msg.body}</p>
            </div>
          ))
        )}
      </div>

      {/* Form nhập tin nhắn hoặc Thông báo Read-Only */}
      {readOnly ? (
        <div className="rounded-lg bg-slate-50 border border-slate-200/80 p-2.5 text-slate-500 text-[11px] text-center italic">
          🔒 Ticket đã hoàn tất / đóng. Khu vực trao đổi chuyển sang chế độ chỉ đọc.
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="pt-2 border-t border-slate-200/70 space-y-2">
          {/* Quick Visibility Pill Toggle */}
          <div className="flex items-center justify-between gap-2">
            <span className="text-[11px] font-semibold text-slate-600">Loại tin nhắn:</span>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg border border-slate-200">
              <button
                type="button"
                onClick={() => setIsInternal(true)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  isInternal
                    ? "bg-amber-500 text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                🔒 Ghi chú nội bộ
              </button>
              <button
                type="button"
                onClick={() => setIsInternal(false)}
                className={`px-2.5 py-1 rounded-md text-[11px] font-bold transition cursor-pointer ${
                  !isInternal
                    ? "bg-zinc-900 text-white text-white shadow-2xs"
                    : "text-slate-600 hover:text-slate-900"
                }`}
              >
                💬 Phản hồi khách hàng
              </button>
            </div>
          </div>

          {/* Textarea 2 rows */}
          <textarea
            id={`${fieldId}-body`}
            rows={2}
            value={body}
            disabled={sending}
            onChange={(e) => {
              setBody(e.target.value);
              setError("");
            }}
            className="w-full rounded-xl border border-slate-200 bg-white p-2.5 text-xs text-slate-800 placeholder-slate-400 focus:border-zinc-900 dark:border-zinc-100 focus:outline-none shadow-2xs resize-none"
            placeholder={
              isInternal
                ? "Ghi chú nội bộ cho Staff/Manager (Khách hàng không thấy)..."
                : "Nhập nội dung phản hồi gửi đến khách hàng..."
            }
          />

          {error && <p className="text-rose-600 text-[11px] font-semibold">{error}</p>}
          {successNotice && <p className="text-emerald-700 text-[11px] font-semibold">{successNotice}</p>}

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={sending || !body.trim()}
              className="inline-flex items-center gap-1.5 rounded-lg bg-zinc-900 text-white hover:bg-zinc-800 px-3.5 py-1.5 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[15px]">send</span>
              <span>{sending ? "Đang gửi..." : isInternal ? "Lưu ghi chú nội bộ" : "Gửi phản hồi"}</span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}
