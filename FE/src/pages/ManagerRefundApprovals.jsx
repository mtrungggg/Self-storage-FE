import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatStatusToEnglish, formatVnd } from "../lib/utils";
import { DECISION_STATUS } from "../constants/managerConstants";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US");
}

const STATUS_BADGE = {
  [DECISION_STATUS.PENDING]: "bg-amber-50 text-amber-700 border border-amber-200",
  [DECISION_STATUS.APPROVED]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  [DECISION_STATUS.REJECTED]: "bg-rose-50 text-rose-700 border border-rose-200",
};

function ManagerRefundApprovals() {
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [refunds, setRefunds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [drafts, setDrafts] = useState({});

  async function load() {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setRefunds(await managerService.getRefundApprovals(facilityId));
    } catch (err) {
      setError(err?.message || "Failed to load refund requests.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!facilityLoading && !facilityId) { setLoading(false); } else if (facilityId) { load(); }
  }, [facilityId, facilityLoading]);

  function updateDraft(id, field, value) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function decide(id, decision) {
    const draft = drafts[id] || {};
    setDecidingId(id);
    setError("");
    try {
      const result = await managerService.decideRefundApproval(id, {
        decision,
        reason: draft.reason || undefined,
        overrideAmount: draft.overrideAmount ? Number(draft.overrideAmount) : undefined,
      });
      setNotice(decision === DECISION_STATUS.APPROVED ? `Refund of ${formatVnd(result?.approvedAmount)} approved successfully.` : "Refund request rejected.");
      await load();
    } catch (err) {
      setError(err?.message || "Failed to process refund request.");
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Security Deposit Refund Approvals</h1>
        <p className="text-xs text-slate-500">Review security deposit refunds upon lease termination with optional adjustment override.</p>
      </div>

      {notice && (
        <div role="status" className="rounded-md border border-emerald-200 bg-emerald-50 px-3.5 py-2.5 text-xs font-semibold text-emerald-700">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="rounded-md border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-xs font-semibold text-rose-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-3">
        {loading ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            Loading refund requests...
          </div>
        ) : refunds.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            No refund requests found.
          </div>
        ) : (
          refunds.map((refund) => {
            const draft = drafts[refund.refundId] || {};
            const isPending = refund.status === DECISION_STATUS.PENDING;
            return (
              <div key={refund.refundId} className="rounded-lg border border-slate-200 bg-white p-4 shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-900">
                    {refund.customerName} {refund.agreementNo && <span className="font-normal text-slate-400">• Agreement #{refund.agreementNo}</span>}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_BADGE[refund.status] || "bg-slate-50 text-slate-600 border border-slate-200"}`}>
                    {formatStatusToEnglish(refund.status)}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-700">{refund.reason || "Termination deposit refund request."}</div>

                <div className="mt-3 grid grid-cols-3 gap-2 text-center">
                  <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Original Deposit</div>
                    <div className="mt-0.5 text-xs font-bold text-slate-800">{formatVnd(refund.originalDeposit)}</div>
                  </div>
                  <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Estimated Deductions</div>
                    <div className="mt-0.5 text-xs font-bold text-rose-600">{formatVnd(refund.estimatedDeductions)}</div>
                  </div>
                  <div className="rounded-md border border-slate-100 bg-slate-50/50 p-2.5">
                    <div className="text-[10px] font-medium uppercase tracking-wider text-slate-400">Recommended Refund</div>
                    <div className="mt-0.5 text-xs font-bold text-emerald-600">{formatVnd(refund.recommendedRefundAmount)}</div>
                  </div>
                </div>

                <div className="mt-2 text-[11px] text-slate-400">{formatDateTime(refund.createdAt)}</div>

                {isPending && (
                  <div className="mt-3 flex flex-wrap items-end gap-2.5 border-t border-slate-100 pt-3">
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Override Amount (optional)
                      <input
                        type="number"
                        min="0"
                        placeholder="Leave blank to use recommended"
                        value={draft.overrideAmount || ""}
                        onChange={(e) => updateDraft(refund.refundId, "overrideAmount", e.target.value)}
                        className="w-48 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-1 min-w-[200px] flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Decision Notes
                      <input
                        placeholder="Add decision remarks..."
                        value={draft.reason || ""}
                        onChange={(e) => updateDraft(refund.refundId, "reason", e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={decidingId === refund.refundId}
                        onClick={() => decide(refund.refundId, DECISION_STATUS.APPROVED)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        Approve Refund
                      </button>
                      <button
                        type="button"
                        disabled={decidingId === refund.refundId}
                        onClick={() => decide(refund.refundId, DECISION_STATUS.REJECTED)}
                        className="rounded-md bg-rose-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-rose-700 transition disabled:opacity-50"
                      >
                        Reject
                      </button>
                    </div>
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

export default ManagerRefundApprovals;
