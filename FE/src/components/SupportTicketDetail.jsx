import { useEffect, useRef, useState } from "react";
import supportService from "../api/supportService";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : date.toLocaleString("en-US");
}

function Attachments({ items }) {
  if (!items?.length) return null;
  return (
    <ul className="mt-2 space-y-2 text-sm">
      {items.map((file) => {
        // Only open web URLs supplied by the API, never executable URL schemes.
        const safeUrl = /^https?:\/\//i.test(file.objectUrl || "") ? file.objectUrl : null;
        const isImage = String(file.mimeType || file.contentType || "").toLowerCase().startsWith("image/")
          || /\.(png|jpe?g|gif|webp|bmp|svg)$/i.test(file.fileName || "");
        return (
          <li key={file.id} className="break-words">
            {safeUrl && isImage ? <a href={safeUrl} target="_blank" rel="noopener noreferrer" className="block w-fit"><img src={safeUrl} alt={file.fileName || "Ticket attachment"} loading="lazy" className="max-h-64 max-w-full rounded-xl border border-[#dfe7f5] object-contain shadow-sm" /><span className="mt-1 block text-xs text-[#58657a]">{file.fileName || "Image attachment"}{file.fileSizeBytes != null ? ` (${Math.ceil(file.fileSizeBytes / 1024)} KB)` : ""}</span></a> : <>{safeUrl ? <a className="text-[#1d5fe5] underline" href={safeUrl} target="_blank" rel="noopener noreferrer">{file.fileName || "Attachment"}</a> : <span>{file.fileName || "Attachment"}</span>}{file.fileSizeBytes != null && <span className="ml-2 text-xs text-[#58657a]">({Math.ceil(file.fileSizeBytes / 1024)} KB)</span>}</>}
          </li>
        );
      })}
    </ul>
  );
}

export default function SupportTicketDetail({ ticketId, onClose, onTicketUpdated }) {
  const dialogRef = useRef(null);
  const [ticket, setTicket] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [attempt, setAttempt] = useState(0);
  const rateLock = useRef(false);
  const [score, setScore] = useState("");
  const [comment, setComment] = useState("");
  const [ratingBusy, setRatingBusy] = useState(false);
  const [ratingError, setRatingError] = useState("");
  const [ratingSaved, setRatingSaved] = useState(false);
  const [refreshError, setRefreshError] = useState("");

  async function refreshTicket() {
    setRefreshError("");
    try {
      const updated = await supportService.getTicketDetail(ticketId);
      setTicket(updated);
      onTicketUpdated?.(updated);
    } catch {
      setRefreshError("Your rating was saved, but ticket details could not be refreshed.");
    }
  }

  async function handleRate(event) {
    event.preventDefault();
    if (rateLock.current || ratingSaved || ticket?.rating) return;
    setRatingError("");
    const value = Number(score);
    if (!Number.isInteger(value) || value < 1 || value > 5) {
      setRatingError("Please select a rating from 1 to 5.");
      return;
    }
    rateLock.current = true;
    setRatingBusy(true);
    try {
      await supportService.confirmAndRate(ticketId, { score: value, comment: comment.trim() });
      setRatingSaved(true);
      await refreshTicket();
    } catch (err) {
      setRatingError(err.status === 404 ? "This ticket could not be found." : err.message || (err.status === 409 ? "This ticket cannot be confirmed or has already been rated." : "Unable to submit your rating. Please try again."));
    } finally {
      rateLock.current = false;
      setRatingBusy(false);
    }
  }

  useEffect(() => {
    const dialog = dialogRef.current;
    dialog.showModal();
    return () => dialog.close();
  }, []);

  useEffect(() => {
    let active = true;
    supportService.getTicketDetail(ticketId)
      .then((data) => { if (active) setTicket(data); })
      .catch((err) => {
        if (active) setError(err.status === 404 ? "This ticket could not be found." : err.message || "Unable to load ticket details.");
      })
      .finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [ticketId, attempt]);

  return (
    <dialog ref={dialogRef} onCancel={onClose} aria-labelledby="ticket-detail-title" className="fixed inset-0 m-auto max-h-[85vh] w-[calc(100%-2rem)] max-w-2xl overflow-y-auto rounded-2xl bg-white p-6 text-[#0b1c30] shadow-xl backdrop:bg-black/40">
      <div className="flex items-start justify-between gap-4">
        <h2 id="ticket-detail-title" className="text-lg font-bold">Ticket {ticket?.ticketNo || "details"}</h2>
        <button type="button" onClick={onClose} className="rounded-lg border px-3 py-1 text-sm">Close</button>
      </div>
      {loading ? <p role="status" className="mt-4 text-sm">Loading ticket details...</p> : error ? (
        <div className="mt-4">
          <p role="alert" className="text-sm text-red-600">{error}</p>
          <button type="button" className="mt-3 text-sm font-semibold text-[#1d5fe5]" onClick={() => { setError(""); setLoading(true); setAttempt((value) => value + 1); }}>Try again</button>
        </div>
      ) : ticket && (
        <div className="mt-4 space-y-5 text-sm">
          <h3 className="break-words text-base font-semibold">{ticket.subject}</h3>
          <dl className="grid grid-cols-1 gap-3 sm:grid-cols-2">
            {[
              ["Status", ticket.displayStatus || ticket.status],
              ["Priority", ticket.priority],
              ["Facility", ticket.facilityName],
              ["Unit", ticket.unitName],
              ["Category", ticket.category],
              ["Agreement", ticket.agreementId],
              ["Created", formatDate(ticket.createdAt)],
              ["Updated", formatDate(ticket.updatedAt)],
            ].map(([label, value]) => <div key={label}><dt className="text-xs text-[#58657a]">{label}</dt><dd className="break-words">{value ?? "—"}</dd></div>)}
          </dl>
          <section><h3 className="font-semibold">Description</h3><p className="mt-1 whitespace-pre-wrap break-words">{ticket.description || "No description provided."}</p></section>
          {!!ticket.initialAttachments?.length && <section><h3 className="font-semibold">Attachments</h3><Attachments items={ticket.initialAttachments} /></section>}
          <section>
            <h3 className="font-semibold">Conversation</h3>
            {!ticket.messages?.length ? <p className="mt-1 text-[#58657a]">No messages yet.</p> : (
              <ol className="mt-2 space-y-3">
                {ticket.messages.map((message) => <li key={message.id} className="rounded-lg bg-[#f8faff] p-3">
                  <div className="flex flex-wrap justify-between gap-2"><span className="font-semibold">{message.authorName || "Support"} {message.authorRole && `(${message.authorRole})`}</span><span className="text-xs text-[#58657a]">{formatDate(message.createdAt)}</span></div>
                  <p className="mt-2 whitespace-pre-wrap break-words">{message.body}</p>
                  <Attachments items={message.attachments} />
                </li>)}
              </ol>
            )}

          </section>
          {(ticket.resolution || ticket.resolvedAt) && <section><h3 className="font-semibold">Resolution</h3><p className="mt-1 whitespace-pre-wrap break-words">{ticket.resolution || "—"}</p><p className="mt-1 text-xs text-[#58657a]">Resolved: {formatDate(ticket.resolvedAt)}</p></section>}
          {ticket.rating && <section><h3 className="font-semibold">Rating: {ticket.rating.score}</h3><p className="mt-1 whitespace-pre-wrap break-words">{ticket.rating.comment}</p><p className="mt-1 text-xs text-[#58657a]">{formatDate(ticket.rating.createdAt)}</p></section>}
          {ratingSaved && <p role="status" className="text-[#0e7b4c]">Completion confirmed. Thank you for your rating.</p>}
          {refreshError && <div><p role="alert" className="text-red-600">{refreshError}</p><button type="button" onClick={refreshTicket} className="mt-2 text-[#1d5fe5] underline">Refresh details</button></div>}
          {!ticket.rating && !ratingSaved && (
            <form onSubmit={handleRate} aria-busy={ratingBusy} className="space-y-3 border-t border-[#dfe7f5] pt-4">
              <h3 className="font-semibold">Confirm completion and rate</h3>
              <p className="text-[#58657a]">Confirm that your issue has been resolved and rate the support you received.</p>
              <fieldset disabled={ratingBusy} className="space-y-3">
                <div>
                  <label htmlFor="ticket-score" className="mb-1 block font-semibold">Rating *</label>
                  <select id="ticket-score" required value={score} onChange={(event) => setScore(event.target.value)} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2">
                    <option value="">Select a rating</option>
                    {[1, 2, 3, 4, 5].map((value) => <option key={value} value={value}>{value} / 5</option>)}
                  </select>
                </div>
                <div>
                  <label htmlFor="ticket-rating-comment" className="mb-1 block font-semibold">Comment (optional)</label>
                  <textarea id="ticket-rating-comment" rows={3} value={comment} onChange={(event) => setComment(event.target.value)} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-3" />
                </div>
                {ratingError && <p role="alert" className="text-red-600">{ratingError}</p>}
                <button type="submit" disabled={!score} className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white disabled:opacity-50">{ratingBusy ? "Submitting..." : "Confirm and rate"}</button>
              </fieldset>
            </form>
          )}
        </div>
      )}
    </dialog>
  );
}
