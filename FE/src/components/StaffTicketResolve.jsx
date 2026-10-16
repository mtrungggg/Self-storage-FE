import { useId, useRef, useState } from "react";
import staffSupportService from "../api/staffSupportService";

export default function StaffTicketResolve({ ticketId, onResolved }) {
  const fieldId = useId();
  const lock = useRef(false);
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current || saved) return;
    setError("");
    if (!resolution.trim()) {
      setError("Please describe how the issue was resolved.");
      return;
    }
    lock.current = true;
    setSubmitting(true);
    try {
      await staffSupportService.resolveTicket(ticketId, { resolution: resolution.trim() });
    } catch (err) {
      setError(err.message || "Unable to resolve this ticket. Please try again.");
      lock.current = false;
      setSubmitting(false);
      return;
    }
    setSaved(true);
    setSubmitting(false);
    // Notify separately so a list refresh failure cannot be reported as a failed resolve.
    onResolved();
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting} className="mt-4 border-t border-[#dfe7f5] pt-4 text-sm">
      <fieldset disabled={submitting || saved} className="space-y-3">
        <label htmlFor={fieldId} className="block font-semibold">Resolution *</label>
        <textarea id={fieldId} rows={3} required value={resolution} onChange={(event) => { setResolution(event.target.value); setError(""); }} placeholder="Describe the work completed to resolve this issue..." className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-3" />
        {error && <p role="alert" className="text-red-600">{error}</p>}
        <button type="submit" disabled={!resolution.trim()} className="rounded-lg bg-[#0e7b4c] px-4 py-2 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50">{submitting ? "Resolving..." : saved ? "Resolved" : "Resolve ticket"}</button>
      </fieldset>
    </form>
  );
}
