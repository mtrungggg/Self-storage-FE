import { useId, useRef, useState } from "react";
import staffSupportService from "../api/staffSupportService";

export default function StaffTicketReply({ ticketId }) {
  const fieldId = useId();
  const lock = useRef(false);
  const [body, setBody] = useState("");
  const [isInternal, setIsInternal] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [sentMessage, setSentMessage] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    if (!body.trim()) {
      setError("Please enter a message.");
      return;
    }
    lock.current = true;
    setSending(true);
    setSentMessage(null);
    try {
      const message = await staffSupportService.sendMessage(ticketId, { body: body.trim(), isInternal });
      setSentMessage(message);
      setBody("");
    } catch (err) {
      setError(err.message || "Unable to send your message. Please try again.");
    } finally {
      lock.current = false;
      setSending(false);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={sending} className="mt-4 border-t border-[#dfe7f5] pt-4 text-sm">
      <fieldset disabled={sending} className="space-y-3">
        <div>
          <label htmlFor={`${fieldId}-visibility`} className="mb-1 block font-semibold">Message type</label>
          <select id={`${fieldId}-visibility`} value={isInternal ? "internal" : "customer"} onChange={(event) => setIsInternal(event.target.value === "internal")} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-2">
            <option value="customer">Reply to customer</option>
            <option value="internal">Internal note (staff only)</option>
          </select>
        </div>
        <div>
          <label htmlFor={`${fieldId}-body`} className="mb-1 block font-semibold">{isInternal ? "Internal note" : "Reply"}</label>
          <textarea id={`${fieldId}-body`} rows={3} required value={body} onChange={(event) => { setBody(event.target.value); setError(""); }} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-3" placeholder={isInternal ? "Write a note for staff..." : "Write a reply to the customer..."} />
        </div>
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button type="submit" disabled={!body.trim()} className="rounded-lg bg-[#1d5fe5] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{sending ? "Sending..." : isInternal ? "Save internal note" : "Send reply"}</button>
      </fieldset>
      {sentMessage && <div className="mt-3 rounded-lg bg-green-50 p-3">
        <p role="status" className="font-semibold text-green-800">{sentMessage.isInternal ? "Internal note saved." : "Reply sent."}</p>
        <p className="mt-1 whitespace-pre-wrap break-words">{sentMessage.body}</p>
        <p className="mt-1 text-xs text-[#58657a]">{sentMessage.authorName} {sentMessage.authorRole && `(${sentMessage.authorRole})`}</p>
      </div>}
    </form>
  );
}
