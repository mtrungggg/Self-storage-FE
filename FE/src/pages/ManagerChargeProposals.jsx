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

function ManagerChargeProposals() {
  const { facilityId, loading: facilityLoading } = useManagerFacility();
  const [proposals, setProposals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [decidingId, setDecidingId] = useState(null);
  const [reasonDrafts, setReasonDrafts] = useState({});

  async function load() {
    if (!facilityId) {
      if (!facilityLoading) setLoading(false);
      return;
    }
    setLoading(true);
    setError("");
    try {
      setProposals(await managerService.getChargeProposals(facilityId));
    } catch (err) {
      setError(err?.message || "Failed to load ancillary charge proposals.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (!facilityLoading && !facilityId) { setLoading(false); } else if (facilityId) { load(); }
  }, [facilityId, facilityLoading]);

  async function decide(id, decision) {
    setDecidingId(id);
    setError("");
    try {
      const result = await managerService.decideChargeProposal(id, { decision, reason: reasonDrafts[id] || undefined });
      setNotice(
        decision === DECISION_STATUS.APPROVED
          ? `Charge proposal approved${result?.generatedInvoiceNo ? ` — invoice ${result.generatedInvoiceNo} created` : ""}.`
          : "Charge proposal rejected."
      );
      await load();
    } catch (err) {
      setError(err?.message || "Failed to process charge proposal.");
    } finally {
      setDecidingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Ancillary Fee Charge Proposals</h1>
        <p className="text-xs text-slate-500">Review staff proposals for ancillary fees and surcharges incurred during customer support tickets.</p>
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
            Loading charge proposals...
          </div>
        ) : proposals.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            No charge proposals found.
          </div>
        ) : (
          proposals.map((proposal) => {
            const isPending = proposal.status === DECISION_STATUS.PENDING;
            return (
              <div key={proposal.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-900">
                    {proposal.customerName} {proposal.agreementNo && <span className="font-normal text-slate-400">• Agreement #{proposal.agreementNo}</span>}
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_BADGE[proposal.status] || "bg-slate-50 text-slate-600 border border-slate-200"}`}>
                    {formatStatusToEnglish(proposal.status)}
                  </span>
                </div>

                <div className="mt-2 text-xs text-slate-700">{proposal.description}</div>

                <div className="mt-1.5 flex flex-wrap items-center gap-3 text-[11px] text-slate-400">
                  <span>Ticket: <span className="font-medium text-slate-600">{proposal.ticketTitle}</span></span>
                  <span>Proposed by: <span className="font-medium text-slate-600">{proposal.proposedByStaffName}</span></span>
                  <span>{formatDateTime(proposal.createdAt)}</span>
                </div>

                <div className="mt-2 text-sm font-bold text-blue-600">{formatVnd(proposal.amount)}</div>

                {isPending && (
                  <div className="mt-3 flex flex-wrap items-end gap-2.5 border-t border-slate-100 pt-3">
                    <label className="flex flex-1 min-w-[200px] flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Decision Notes / Justification
                      <input
                        placeholder="Add decision remarks..."
                        value={reasonDrafts[proposal.id] || ""}
                        onChange={(e) => setReasonDrafts((prev) => ({ ...prev, [proposal.id]: e.target.value }))}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        disabled={decidingId === proposal.id}
                        onClick={() => decide(proposal.id, DECISION_STATUS.APPROVED)}
                        className="rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-medium text-white hover:bg-emerald-700 transition disabled:opacity-50"
                      >
                        Approve &amp; Issue Invoice
                      </button>
                      <button
                        type="button"
                        disabled={decidingId === proposal.id}
                        onClick={() => decide(proposal.id, DECISION_STATUS.REJECTED)}
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

export default ManagerChargeProposals;
