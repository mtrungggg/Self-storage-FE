import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { DECISION_STATUS } from "../constants/managerConstants";
import { formatStatusToEnglish } from "../lib/utils";

function formatDate(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("en-US");
}

const STATUS_BADGE = {
  [DECISION_STATUS.PENDING]: "bg-amber-50 text-amber-700 border border-amber-200",
  [DECISION_STATUS.APPROVED]: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  [DECISION_STATUS.REJECTED]: "bg-rose-50 text-rose-700 border border-rose-200",
};

function ManagerTransferRequests() {
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [decisionDrafts, setDecisionDrafts] = useState({});

  async function load() {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setRequests(await managerService.getTransferRequests(facilityId));
    } catch (err) {
      setError(err?.message || "Failed to load transfer requests.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!facilityLoading && !facilityId) { setLoading(false); } else if (facilityId) { load(); }
  }, [facilityId, facilityLoading]);

  function updateDraft(id, field, value) {
    setDecisionDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function decide(id, decision) {
    const draft = decisionDrafts[id] || {};
    setDecidingId(id);
    setError("");
    try {
      await managerService.decideTransferRequest(id, {
        decision,
        targetUnitId: draft.targetUnitId ? Number(draft.targetUnitId) : undefined,
        reviewNotes: draft.reviewNotes || undefined,
      });
      setNotice(decision === DECISION_STATUS.APPROVED ? "Transfer request approved successfully." : "Transfer request rejected.");
      await load();
    } catch (err) {
      setError(err?.message || "Failed to process transfer request.");
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Unit Transfer Requests</h1>
        <p className="text-xs text-slate-500">Review and approve or reject customer requests to transfer to a different storage unit.</p>
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
            Loading transfer requests...
          </div>
        ) : requests.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            No transfer requests found.
          </div>
        ) : (
          requests.map((request) => {
            const draft = decisionDrafts[request.id] || {};
            const isPending = request.status === DECISION_STATUS.PENDING;
            return (
              <div key={request.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-900">
                    {request.customerName} <span className="font-normal text-slate-400">• {request.customerPhone}</span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_BADGE[request.status] || "bg-slate-50 text-slate-600 border border-slate-200"}`}>
                    {formatStatusToEnglish(request.status)}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-700">
                  Agreement <span className="font-semibold">{request.agreementNo}</span> — From Unit <span className="font-mono font-semibold">{request.fromUnitCode}</span> to Type <span className="font-semibold">{request.requestedUnitTypeName}</span>
                  {request.toUnitCode ? <> (Suggested Unit: <span className="font-mono font-semibold">{request.toUnitCode}</span>)</> : null}
                </div>
                <div className="mt-1 text-[11px] text-slate-400">
                  Reason: {request.reason || "None"} • Requested Effective Date: {formatDate(request.requestedEffectiveDate)}
                </div>

                {isPending && (
                  <div className="mt-3 flex flex-wrap items-end gap-2.5 border-t border-slate-100 pt-3">
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Target Unit ID (if approved)
                      <input
                        type="number"
                        placeholder="e.g. 102"
                        value={draft.targetUnitId || ""}
                        onChange={(e) => updateDraft(request.id, "targetUnitId", e.target.value)}
                        className="w-32 rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-1 min-w-[200px] flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Review Notes
                      <input
                        placeholder="Add review notes or justification..."
                        value={draft.reviewNotes || ""}
                        onChange={(e) => updateDraft(request.id, "reviewNotes", e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={decidingId === request.id}
                        onClick={() => decide(request.id, DECISION_STATUS.APPROVED)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        Approve
                      </button>
                      <button
                        type="button"
                        disabled={decidingId === request.id}
                        onClick={() => decide(request.id, DECISION_STATUS.REJECTED)}
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

export default ManagerTransferRequests;
