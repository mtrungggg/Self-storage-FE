import { useEffect, useState } from "react";
import staffSupportService from "../api/staffSupportService";

export default function StaffLogisticsTickets({ facilityId }) {
  const [tickets, setTickets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("");
  const [statusFilter, setStatusFilter] = useState("");
  const [onlyMine, setOnlyMine] = useState(false);

  // Propose charge modal state
  const [chargeModalTicket, setChargeModalTicket] = useState(null);
  const [chargeAmount, setChargeAmount] = useState("");
  const [chargeReason, setChargeReason] = useState("");
  const [chargeDescription, setChargeDescription] = useState("");
  const [chargePhotoUrl, setChargePhotoUrl] = useState("");
  const [submittingCharge, setSubmittingCharge] = useState(false);

  // Complete ticket modal state
  const [completeModalTicket, setCompleteModalTicket] = useState(null);
  const [resolutionText, setResolutionText] = useState("");
  const [completing, setCompleting] = useState(false);
  const [unlockMessage, setUnlockMessage] = useState("");

  const loadTickets = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffSupportService.getTickets({
        facilityId,
        category: categoryFilter,
        status: statusFilter,
        onlyAssignedToMe: onlyMine ? true : undefined,
      });
      setTickets(data || []);
    } catch (err) {
      setError(err?.message || "Unable to load tasks.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadTickets();
  }, [facilityId, categoryFilter, statusFilter, onlyMine]);

  const handleClaimTask = async (ticketId) => {
    try {
      await staffSupportService.assignTicket(ticketId);
      loadTickets();
    } catch (err) {
      alert(err?.message || "Failed to claim task.");
    }
  };

  const handleProposeChargeSubmit = async (e) => {
    e.preventDefault();
    if (!chargeModalTicket || !chargeAmount || !chargeReason) return;
    setSubmittingCharge(true);
    try {
      await staffSupportService.proposeCharge(chargeModalTicket.id, {
        amount: Number(chargeAmount),
        reason: chargeReason.trim(),
        description: chargeDescription.trim(),
        photoUrl: chargePhotoUrl.trim() || null,
      });
      setChargeModalTicket(null);
      setChargeAmount("");
      setChargeReason("");
      setChargeDescription("");
      setChargePhotoUrl("");
      loadTickets();
    } catch (err) {
      alert(err?.message || "Failed to submit fee proposal.");
    } finally {
      setSubmittingCharge(false);
    }
  };

  const handleCompleteSubmit = async (e) => {
    e.preventDefault();
    if (!completeModalTicket) return;
    setCompleting(true);
    setUnlockMessage("");
    try {
      const res = await staffSupportService.completeTicket(completeModalTicket.id, {
        resolution: resolutionText.trim() || "Work completed and inspected.",
      });

      if (res?.unlockedUnitCode) {
        setUnlockMessage(`Task completed. Unit ${res.unlockedUnitCode} unlocked to Available.`);
      }

      setCompleteModalTicket(null);
      setResolutionText("");
      loadTickets();
    } catch (err) {
      alert(err?.message || "Failed to complete task.");
    } finally {
      setCompleting(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Filter Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-3 p-3.5 bg-white rounded-xl border border-slate-200 shadow-xs">
        <div className="flex flex-wrap items-center gap-1.5">
          <span className="text-xs font-semibold text-slate-500 mr-1">Category:</span>
          {[
            { id: "", label: "All" },
            { id: "cleaning", label: "Cleaning" },
            { id: "maintenance", label: "Maintenance" },
            { id: "inspection", label: "Inspection" },
          ].map((c) => (
            <button
              key={c.id}
              onClick={() => setCategoryFilter(c.id)}
              className={`px-3 py-1 text-xs font-medium rounded-lg transition ${
                categoryFilter === c.id
                  ? "bg-slate-900 text-white"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-200"
              }`}
            >
              {c.label}
            </button>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <label className="flex items-center gap-1.5 text-xs font-medium text-slate-700 cursor-pointer">
            <input
              type="checkbox"
              checked={onlyMine}
              onChange={(e) => setOnlyMine(e.target.checked)}
              className="rounded text-blue-600"
            />
            My Tasks
          </label>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-2.5 py-1 text-xs font-medium bg-slate-50 border border-slate-200 rounded-lg outline-none"
          >
            <option value="">All Status</option>
            <option value="open">Open</option>
            <option value="in_progress">In Progress</option>
            <option value="resolved">Resolved</option>
          </select>

          <button
            onClick={loadTickets}
            className="px-2.5 py-1 text-xs font-semibold text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg bg-white"
          >
            Refresh
          </button>
        </div>
      </div>

      {unlockMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-xs font-bold text-emerald-800 flex items-center justify-between">
          <span>{unlockMessage}</span>
          <button onClick={() => setUnlockMessage("")} className="text-emerald-700 hover:text-emerald-900 font-semibold text-xs ml-2">
            Dismiss
          </button>
        </div>
      )}

      {/* Ticket List */}
      {loading ? (
        <div className="p-10 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          Loading tasks...
        </div>
      ) : error ? (
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl text-rose-700 text-xs">
          {error}
        </div>
      ) : tickets.length === 0 ? (
        <div className="p-10 text-center text-xs text-slate-400 bg-white rounded-xl border border-slate-200">
          No tasks found matching filter.
        </div>
      ) : (
        <div className="space-y-2.5">
          {tickets.map((t) => {
            const isResolved = t.status === "resolved" || t.status === "closed";
            return (
              <div
                key={t.id}
                className="p-4 bg-white rounded-xl border border-slate-200 shadow-xs hover:shadow-sm transition space-y-2.5 text-xs"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div className="space-y-1">
                    <div className="flex items-center gap-1.5">
                      <span className="font-mono font-bold text-slate-500">{t.ticketNo}</span>
                      <span className="px-2 py-0.5 text-[10px] font-bold rounded bg-slate-100 text-slate-700 uppercase">
                        {t.category}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        t.priority === "urgent" || t.priority === "high"
                          ? "bg-rose-100 text-rose-700"
                          : "bg-blue-50 text-blue-700"
                      }`}>
                        {t.priority}
                      </span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded-full ${
                        isResolved
                          ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                          : t.status === "in_progress"
                          ? "bg-amber-50 text-amber-700 border border-amber-200"
                          : "bg-slate-100 text-slate-700"
                      }`}>
                        {t.status}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-slate-900">{t.subject}</h3>
                    {t.description && (
                      <p className="text-slate-600 line-clamp-2">{t.description}</p>
                    )}
                  </div>

                  {t.unitCode && (
                    <div className="px-3 py-1 bg-blue-50/70 border border-blue-200 rounded-lg text-center shrink-0">
                      <span className="text-[10px] text-blue-600 block uppercase font-semibold">Unit</span>
                      <span className="font-bold text-xs text-blue-900">{t.unitCode}</span>
                    </div>
                  )}
                </div>

                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100 text-slate-500 text-[11px]">
                  <div className="flex flex-wrap items-center gap-3">
                    {t.customerName && <span>Customer: <strong className="text-slate-700">{t.customerName}</strong></span>}
                    <span>Assigned: <strong className="text-slate-700">{t.assignedEmployeeName || "Unassigned"}</strong></span>
                    {t.hasProposedCharges && (
                      <span className="text-amber-700 font-semibold">Fee proposed</span>
                    )}
                  </div>

                  <div className="flex items-center gap-1.5">
                    {!isResolved && !t.assignedEmployeeId && (
                      <button
                        type="button"
                        onClick={() => handleClaimTask(t.id)}
                        className="px-3 py-1 text-xs font-semibold bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition"
                      >
                        Claim Task
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => setChargeModalTicket(t)}
                        className="px-3 py-1 text-xs font-semibold bg-amber-50 text-amber-800 border border-amber-200 rounded-lg hover:bg-amber-100 transition"
                      >
                        Propose Fee
                      </button>
                    )}

                    {!isResolved && (
                      <button
                        type="button"
                        onClick={() => setCompleteModalTicket(t)}
                        className="px-3 py-1 text-xs font-semibold bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 shadow-xs transition"
                      >
                        Complete Task
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Propose Fee Modal */}
      {chargeModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-3.5 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Propose Incident / Damage Fee</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Ticket {chargeModalTicket.ticketNo} • Unit {chargeModalTicket.unitCode || "—"}. Sent to Manager for deposit deduction.
              </p>
            </div>

            <form onSubmit={handleProposeChargeSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Fee Amount (VND) *</label>
                <input
                  type="number"
                  required
                  min="1000"
                  step="1000"
                  value={chargeAmount}
                  onChange={(e) => setChargeAmount(e.target.value)}
                  placeholder="Enter fee amount"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Reason *</label>
                <input
                  type="text"
                  required
                  value={chargeReason}
                  onChange={(e) => setChargeReason(e.target.value)}
                  placeholder="Reason for charge"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Notes</label>
                <textarea
                  rows="2"
                  value={chargeDescription}
                  onChange={(e) => setChargeDescription(e.target.value)}
                  placeholder="Additional details"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Evidence Photo URL</label>
                <input
                  type="url"
                  value={chargePhotoUrl}
                  onChange={(e) => setChargePhotoUrl(e.target.value)}
                  placeholder="https://..."
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setChargeModalTicket(null)}
                  className="px-3.5 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submittingCharge}
                  className="px-3.5 py-1.5 bg-amber-600 hover:bg-amber-700 text-white font-bold rounded-lg"
                >
                  {submittingCharge ? "Submitting..." : "Submit to Manager"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Complete Task Modal */}
      {completeModalTicket && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-xs p-4">
          <div className="w-full max-w-sm bg-white rounded-xl shadow-xl border border-slate-200 p-5 space-y-3.5 text-xs">
            <div>
              <h3 className="font-bold text-sm text-slate-900">Complete Task</h3>
              <p className="text-[11px] text-slate-500 mt-0.5">
                Completing will automatically set Unit {completeModalTicket.unitCode || ""} back to Available.
              </p>
            </div>

            <form onSubmit={handleCompleteSubmit} className="space-y-3">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Resolution Summary</label>
                <textarea
                  rows="3"
                  value={resolutionText}
                  onChange={(e) => setResolutionText(e.target.value)}
                  placeholder="Enter resolution notes"
                  className="w-full px-3 py-1.5 border border-slate-200 rounded-lg outline-none"
                />
              </div>

              <div className="flex justify-end gap-2 pt-1">
                <button
                  type="button"
                  onClick={() => setCompleteModalTicket(null)}
                  className="px-3.5 py-1.5 border rounded-lg text-slate-600 hover:bg-slate-100"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={completing}
                  className="px-3.5 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold rounded-lg"
                >
                  {completing ? "Completing..." : "Confirm Complete"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
