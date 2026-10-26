import { useId, useRef, useState } from "react";
import staffSupportService from "../api/staffSupportService";

export default function StaffTicketResolve({ ticketId, onResolved }) {
  const fieldId = useId();
  const lock = useRef(false);
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedResult, setCompletedResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current || completedResult) return;
    setError("");
    if (!resolution.trim()) {
      setError("Please describe the work completed to resolve this ticket.");
      return;
    }
    lock.current = true;
    setSubmitting(true);
    let result = null;
    try {
      result = await staffSupportService.completeTicket(ticketId, {
        resolution: resolution.trim(),
      });
      setCompletedResult(result || { status: "completed" });
    } catch (err) {
      setError(err.message || "Unable to complete this ticket. Please try again.");
      lock.current = false;
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    if (onResolved) {
      onResolved(result);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting} className="mt-4 border-t border-[#dfe7f5] pt-4 text-sm">
      <fieldset disabled={submitting || Boolean(completedResult)} className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor={fieldId} className="block font-semibold text-slate-900">
            Complete Ticket / Record Resolution *
          </label>
          <span className="text-[11px] text-[#767679]">
            PUT /api/staff/tickets/{ticketId}/complete
          </span>
        </div>

        <textarea
          id={fieldId}
          rows={3}
          required
          value={resolution}
          onChange={(event) => {
            setResolution(event.target.value);
            setError("");
          }}
          placeholder="Describe how the cleaning, repair, or inspection work was completed..."
          className="w-full rounded-lg border border-[#dfe7f5] bg-[#f8faff] p-3 text-xs"
        />

        {error && <p role="alert" className="text-xs font-semibold text-red-600">{error}</p>}

        <button
          type="submit"
          disabled={!resolution.trim() || Boolean(completedResult)}
          className="rounded-lg bg-[#0e7b4c] px-4 py-2 text-xs font-semibold text-white hover:bg-[#0c6b42] disabled:cursor-not-allowed disabled:opacity-50"
        >
          {submitting ? "Completing..." : completedResult ? "Completed" : "Complete Ticket & Release Unit"}
        </button>
      </fieldset>

      {completedResult && (
        <div className="mt-3 rounded-xl bg-green-50 p-3.5 border border-green-200 text-xs text-green-900">
          <p role="status" className="font-bold text-green-800 flex items-center gap-1.5">
            ✓ Ticket #{completedResult.ticketNo || ticketId} completed successfully!
          </p>
          {completedResult.unlockedUnitCode && (
            <p className="mt-1 text-slate-700">
              🔓 Unit <strong>{completedResult.unlockedUnitCode}</strong> has been automatically unlocked and restored to <strong>{completedResult.unlockedUnitStatus || "available"}</strong> status.
            </p>
          )}
        </div>
      )}
    </form>
  );
}
