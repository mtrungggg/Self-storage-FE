import SelectDropdown from "@/components/ui/select-dropdown";
import { useEffect, useRef, useState } from "react";
import { Star, CheckCircle2, X } from "lucide-react";
import supportService from "../api/supportService";
import { useLanguage } from "../context/LanguageContext";

function Attachments({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-2 space-y-2 text-sm">
      {items.map((file) => {
        const safeUrl = /^https?:\/\//i.test(file.objectUrl || "") ? file.objectUrl : null;
        const isImage = String(file.mimeType || file.contentType || "").toLowerCase().startsWith("image/")
          || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.fileName || "");
        return (
          <li key={file.id} className="break-words">
            {safeUrl && isImage ? (
              <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="block w-fit">
                <img src={safeUrl} alt={file.fileName || "Attachment"} loading="lazy" className="max-h-64 max-w-full rounded-xl border border-[#dfe7f5] dark:border-zinc-700 object-contain shadow-sm" />
                <span className="mt-1 block text-xs text-[#58657a] dark:text-zinc-400">{file.fileName || "Image"}</span>
              </a>
            ) : (
              safeUrl ? <a className="text-zinc-900 dark:text-zinc-100 underline" href={safeUrl} target="_blank" rel="noopener noreferrer">{file.fileName || "File"}</a> : <span>{file.fileName || "File"}</span>
            )}
          </li>
        );
      })}
    </ul>
  );
}

export default function SupportTicketDetail({ ticketId, onClose, onTicketUpdated }) {
  const { t, formatDate, translateStatus } = useLanguage();
  const dialogRef = useRef(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const rateLock = useRef(false);
  const [score, setScore] = useState("");
  const [hoveredScore, setHoveredScore] = useState(0);
  const [comment, setComment] = useState("");
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSaved, setRatingSaved] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  const ratingLabels = {
    1: t("support.rating_1", "1 sao - Rất không hài lòng"),
    2: t("support.rating_2", "2 sao - Chưa hài lòng"),
    3: t("support.rating_3", "3 sao - Bình thường"),
    4: t("support.rating_4", "4 sao - Hài lòng"),
    5: t("support.rating_5", "5 sao - Rất hài lòng / Xuất sắc"),
  };

  async function refreshTicket() {
    setRefreshError("");
    try {
      const updated = await supportService.getTicketDetail(ticketId);
      setTicket(updated);
      onTicketUpdated?.(updated);
    } catch {
      setRefreshError(t("common.error", "Error refreshing details"));
    }
  }

  async function handleRate(event) {
    event.preventDefault();
    if (rateLock.current || ratingSaved || ticket?.rating || ticket?.ratingScore) return;
    setRatingError("");
    const value = Number(score);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      setRatingError(t("common.required", "Vui lòng chọn mức đánh giá từ 1 đến 5 sao"));
      return;
    }
    rateLock.current = true;
    setRatingBusy(true);
    try {
      await supportService.confirmAndRate(ticketId, { score: value, comment: comment.trim() });
      setRatingSaved(true);
      await refreshTicket();
    } catch (err) {
      setRatingError(err.message || t("common.error", "Error submitting rating"));
    } finally {
      rateLock.current = false;
      setRatingBusy(false);
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    if (dialog && !dialog.open) {
      dialog.showModal();
    }
    return () => {
      if (dialog && dialog.open) dialog.close();
    };
  }, []);

  useEffect(() => {
    let active = true;
    supportService.getTicketDetail(ticketId)
      .then((data) => {
        if (active) {
          setTicket(data);
          if (data?.rating?.score || data?.ratingScore) {
            setScore(String(data.rating?.score || data.ratingScore));
            if (data.rating?.comment) setComment(data.rating.comment);
          }
        }
      })
      .catch((err) => {
        if (active) setError(err.status === 404 ? t("common.no_data", "Not found") : err.message || t("common.error", "Error loading"));
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ticketId, attempt, t]);

  const hasExistingRating = Boolean(ticket?.rating || ticket?.ratingScore || ratingSaved);

  return (
    <dialog
      ref={dialogRef}
      onCancel={onClose}
      aria-labelledby="ticket-detail-title"
      className="fixed inset-0 m-auto max-h-[90vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto overscroll-contain rounded-2xl bg-white dark:bg-zinc-900 p-6 pb-28 text-[#0b1c30] dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 shadow-2xl backdrop:bg-black/50"
    >
      <div className="flex items-start justify-between gap-4 border-b border-zinc-100 dark:border-zinc-800 pb-3">
        <div>
          <h2 id="ticket-detail-title" className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
            {t("support.ticket_no", "Yêu cầu hỗ trợ")} #{ticket?.ticketNo || ticketId}
          </h2>
          {ticket?.facilityName && (
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              {ticket.facilityName} {ticket.unitName ? `• ${ticket.unitName}` : ""}
            </p>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="flex items-center gap-1 rounded-xl border border-zinc-200 dark:border-zinc-700 bg-zinc-50 dark:bg-zinc-800 px-3 py-1.5 text-xs font-semibold text-zinc-700 dark:text-zinc-300 transition hover:bg-zinc-100 dark:hover:bg-zinc-700 cursor-pointer"
        >
          <X size={14} />
          {t("common.close", "Đóng")}
        </button>
      </div>

      {loading ? (
        <div className="py-12 text-center text-sm text-zinc-500 dark:text-zinc-400">
          <span className="material-symbols-outlined text-[28px] animate-spin mb-2">progress_activity</span>
          <p>{t("common.loading", "Đang tải chi tiết yêu cầu...")}</p>
        </div>
      ) : error ? (
        <div className="mt-4 p-4 rounded-xl bg-rose-50 dark:bg-rose-950/30 border border-rose-200 dark:border-rose-900">
          <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">{error}</p>
          <button
            type="button"
            className="mt-3 text-sm font-semibold text-zinc-900 dark:text-zinc-100 underline cursor-pointer"
            onClick={() => { setError(""); setLoading(true); setAttempt((value) => value + 1); }}
          >
            {t("common.refresh", "Thử lại")}
          </button>
        </div>
      ) : ticket && (
        <div className="mt-4 space-y-5 text-sm">
          <h3 className="break-words text-base font-bold text-zinc-900 dark:text-zinc-100">{ticket.subject}</h3>
          
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-3 rounded-xl border border-zinc-100 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-800/40 p-3.5">
            {[
              [t("common.status", "Trạng thái"), translateStatus(ticket.displayStatus || ticket.status)],
              [t("support.priority", "Mức ưu tiên"), translateStatus(ticket.priority)],
              [t("support.category", "Phân loại"), ticket.category || "—"],
              [t("common.created_at", "Thời gian tạo"), ticket.createdAt ? formatDate(ticket.createdAt) : "—"],
              [t("common.unit", "Ô kho"), ticket.unitName || "—"],
              [t("common.facility", "Cơ sở"), ticket.facilityName || "—"],
            ].map(([label, value]) => (
              <div key={label}>
                <dt className="text-[11px] font-medium text-zinc-500 dark:text-zinc-400">{label}</dt>
                <dd className="break-words font-semibold text-zinc-900 dark:text-zinc-100 mt-0.5">{value ?? "—"}</dd>
              </div>
            ))}
          </dl>

          <section>
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              {t("common.details", "Nội dung chi tiết")}
            </h4>
            <div className="rounded-xl border border-zinc-200/80 dark:border-zinc-800 bg-white dark:bg-zinc-800/60 p-3.5 whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200">
              {ticket.description || "—"}
            </div>
          </section>

          {!!ticket.initialAttachments?.length && (
            <section>
              <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
                {t("support.attachment", "Hình ảnh đính kèm")}
              </h4>
              <Attachments items={ticket.initialAttachments} />
            </section>
          )}

          <section>
            <h4 className="font-bold text-xs uppercase tracking-wider text-zinc-500 dark:text-zinc-400 mb-1.5">
              {t("support.messages", "Trao đổi & Tin nhắn")}
            </h4>
            {!ticket.messages?.length ? (
              <p className="rounded-xl border border-dashed border-zinc-200 dark:border-zinc-800 p-4 text-center text-xs text-zinc-500 dark:text-zinc-400">
                {t("common.no_data", "Chưa có tin nhắn phản hồi nào.")}
              </p>
            ) : (
              <ol className="space-y-3">
                {ticket.messages.map((message) => (
                  <li key={message.id} className="rounded-xl border border-zinc-200/70 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/60 p-3.5">
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-zinc-200/50 dark:border-zinc-700/50 pb-2 mb-2">
                      <span className="font-bold text-xs text-zinc-900 dark:text-zinc-100">
                        {message.authorName || t("table.staff", "Nhân viên hỗ trợ")}
                      </span>
                      <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                        {message.createdAt ? formatDate(message.createdAt) : ""}
                      </span>
                    </div>
                    <p className="whitespace-pre-wrap break-words text-zinc-800 dark:text-zinc-200 text-xs sm:text-sm">
                      {message.body}
                    </p>
                    <Attachments items={message.attachments} />
                  </li>
                ))}
              </ol>
            )}
          </section>

          {/* Resolution section */}
          {(ticket.resolution || ticket.resolvedAt) && (
            <section className="rounded-xl border border-emerald-200 dark:border-emerald-900/60 bg-emerald-50/60 dark:bg-emerald-950/20 p-4">
              <h4 className="font-bold text-xs uppercase tracking-wider text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5 mb-1">
                <CheckCircle2 size={16} />
                {t("status.resolved", "Kết quả xử lý từ nhân viên")}
              </h4>
              <p className="whitespace-pre-wrap break-words text-emerald-950 dark:text-emerald-200 font-medium">
                {ticket.resolution || "Đã xử lý xong (Resolved)"}
              </p>
            </section>
          )}

          {/* Feedback Rating Section */}
          {hasExistingRating ? (
            <div className="rounded-2xl border border-amber-200 dark:border-amber-900/50 bg-amber-50/60 dark:bg-amber-950/20 p-4">
              <div className="flex items-center gap-2">
                <CheckCircle2 size={18} className="text-amber-600 dark:text-amber-400" />
                <span className="font-bold text-sm text-amber-950 dark:text-amber-200">
                  {ratingSaved
                    ? t("support.rating_success", "Đã ghi nhận đánh giá của bạn thành công. Cảm ơn bạn!")
                    : t("support.rating_saved", "Đã hoàn tất đánh giá chất lượng dịch vụ")}
                </span>
              </div>
              <div className="mt-2.5 flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    size={22}
                    className={
                      star <= (ticket?.rating?.score || ticket?.ratingScore || Number(score) || 5)
                        ? "fill-amber-400 text-amber-400 drop-shadow-xs"
                        : "text-zinc-300 dark:text-zinc-600"
                    }
                  />
                ))}
                <span className="ml-2 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                  {(ticket?.rating?.score || ticket?.ratingScore || score)} / 5 sao
                </span>
              </div>
              {(ticket?.rating?.comment || comment) && (
                <p className="mt-2.5 text-xs italic text-zinc-700 dark:text-zinc-300 bg-white/80 dark:bg-zinc-900/80 p-3 rounded-xl border border-amber-200/60 dark:border-amber-900/40">
                  "{ticket?.rating?.comment || comment}"
                </p>
              )}
            </div>
          ) : (
            <form onSubmit={handleRate} aria-busy={ratingBusy} className="space-y-4 border-t border-zinc-200 dark:border-zinc-800 pt-5">
              <fieldset disabled={ratingBusy} className="space-y-4">
                <div>
                  <div className="flex flex-wrap items-center justify-between gap-1 mb-2">
                    <label className="block text-sm font-bold text-zinc-900 dark:text-zinc-100">
                      {t("support.rating", "Đánh giá chất lượng xử lý")} <span className="text-rose-500">*</span>
                    </label>
                    <span className="text-xs font-semibold text-amber-600 dark:text-amber-400">
                      {ratingLabels[hoveredScore || Number(score)] || t("support.rating_desc", "Vui lòng chọn từ 1 đến 5 sao")}
                    </span>
                  </div>

                  {/* 1-CLICK INTERACTIVE 5-STAR RATING SELECTOR */}
                  <div className="flex items-center gap-1.5 p-3 rounded-2xl border border-zinc-200/90 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/50">
                    {[1, 2, 3, 4, 5].map((val) => {
                      const active = val <= (hoveredScore || Number(score));
                      return (
                        <button
                          key={val}
                          type="button"
                          onClick={() => setScore(String(val))}
                          onMouseEnter={() => setHoveredScore(val)}
                          onMouseLeave={() => setHoveredScore(0)}
                          className="group p-2 rounded-xl transition-all hover:scale-115 focus:outline-none focus:ring-2 focus:ring-amber-400/40 cursor-pointer"
                          aria-label={`${val} sao`}
                        >
                          <Star
                            size={30}
                            className={`transition-colors duration-150 ${
                              active
                                ? "fill-amber-400 text-amber-400 drop-shadow-sm"
                                : "text-zinc-300 dark:text-zinc-600 hover:text-amber-300"
                            }`}
                          />
                        </button>
                      );
                    })}
                    {score ? (
                      <span className="ml-3 font-bold text-sm text-zinc-900 dark:text-zinc-100">
                        {score} / 5 sao
                      </span>
                    ) : (
                      <span className="ml-3 text-xs text-zinc-400 dark:text-zinc-500 italic">
                        (Bấm trực tiếp vào ngôi sao để chọn)
                      </span>
                    )}
                  </div>

                  {/* Dropdown Alternative with upward detection */}
                  <div className="mt-3">
                    <SelectDropdown
                      id="ticket-score"
                      required
                      value={score}
                      onChange={(e) => setScore(String(e.target.value))}
                      placeholder={t("common.select", "Hoặc chọn từ danh sách mức đánh giá...")}
                      className="w-full"
                    >
                      <option value="">{t("common.select", "Chọn mức đánh giá...")}</option>
                      {[1, 2, 3, 4, 5].map((val) => (
                        <option key={val} value={val}>
                          {val} / 5 - {ratingLabels[val]}
                        </option>
                      ))}
                    </SelectDropdown>
                  </div>
                </div>

                <div>
                  <label htmlFor="ticket-rating-comment" className="mb-1 block font-semibold text-xs text-zinc-700 dark:text-zinc-300">
                    {t("support.rating_comment", "Nhận xét & Góp ý thêm (tùy chọn)")}
                  </label>
                  <textarea
                    id="ticket-rating-comment"
                    rows={3}
                    value={comment}
                    onChange={(event) => setComment(event.target.value)}
                    placeholder={t("support.rating_comment_placeholder", "Nhập nhận xét của bạn về trải nghiệm hỗ trợ...")}
                    className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-800/80 p-3 text-sm text-zinc-900 dark:text-zinc-100 outline-none transition focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10"
                  />
                </div>

                {ratingError && (
                  <p role="alert" className="text-sm font-semibold text-rose-600 dark:text-rose-400">
                    {ratingError}
                  </p>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={!score || ratingBusy}
                    className="flex items-center justify-center gap-2 rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-6 py-3 font-bold text-sm shadow-md transition hover:opacity-90 disabled:opacity-40 cursor-pointer"
                  >
                    <Star size={16} className="fill-current text-amber-400" />
                    {ratingBusy
                      ? t("common.loading", "Đang gửi đánh giá...")
                      : t("support.submit_rating", "Gửi Đánh Giá Dịch Vụ")}
                  </button>
                </div>
              </fieldset>
            </form>
          )}
        </div>
      )}
    </dialog>
  );
}
