import { useId, useRef, useState } from "react";
import rentalService from "../api/rentalService";

export default function MoveOutRequest({ agreementId }) {
  const id = useId();
  const lock = useRef(false);
  const [date, setDate] = useState("");
  const [reason, setReason] = useState("");
  const [sending, setSending] = useState(false);
  const [error, setError] = useState("");
  const [request, setRequest] = useState(null);

  async function submit(event) {
    event.preventDefault();
    if (lock.current || request) return;
    setError("");
    if (!date) {
      setError("Please select a move-out date.");
      return;
    }
    lock.current = true;
    setSending(true);
    try {
      const result = await rentalService.requestMoveOut(agreementId, { requestedMoveOutDate: date, reason: reason.trim() });
      setRequest(result);
    } catch (err) {
      setError(err.message || "Unable to request move-out. Please try again.");
    } finally {
      lock.current = false;
      setSending(false);
    }
  }

  return (
    <details className="mt-2 border-t border-[#dfe7f5] pt-2 text-xs">
      <summary className="cursor-pointer font-semibold text-[#1d5fe5]">Move-out</summary>
      {request ? <div className="mt-2 rounded-lg bg-green-50 p-2.5">
        <p role="status" className="font-semibold text-green-800">Submitted.</p>
        <p className="mt-0.5">Date: {request.requestedMoveOutDate}</p>
        <p>Status: {request.status}</p>
      </div> : <form onSubmit={submit} aria-busy={sending} className="mt-2 space-y-2">
        <fieldset disabled={sending} className="space-y-2">
          <div><label htmlFor={`${id}-date`} className="mb-1 block font-semibold text-slate-600">Date *</label><input id={`${id}-date`} type="date" required value={date} onChange={(event) => setDate(event.target.value)} className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-1.5 text-xs" /></div>
          <div><label htmlFor={`${id}-reason`} className="mb-1 block font-semibold text-slate-600">Reason</label><textarea id={`${id}-reason`} rows={2} value={reason} onChange={(event) => setReason(event.target.value)} placeholder="Reason..." className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-1.5 text-xs" /></div>
          {error && <p role="alert" className="text-red-600">{error}</p>}
          <button type="submit" disabled={!date} className="w-full rounded-lg bg-[#1d5fe5] p-2 font-semibold text-white disabled:opacity-50">{sending ? "..." : "Submit"}</button>
        </fieldset>
      </form>}
    </details>
  );
}
