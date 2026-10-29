import { useEffect, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { formatStatusToEnglish, formatVnd } from "../lib/utils";
import { DELINQUENT_ACTION_TYPES as ACTION_TYPES, DELINQUENT_CASE_STATUSES } from "../constants/managerConstants";

function formatDateTime(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleString("en-US");
}

const STATUS_BADGE = {
  grace: "bg-amber-50 text-amber-700 border border-amber-200",
  delinquent: "bg-rose-50 text-rose-700 border border-rose-200",
  cured: "bg-emerald-50 text-emerald-700 border border-emerald-200",
  waived: "bg-slate-100 text-slate-700 border border-slate-200",
  termination_started: "bg-red-100 text-red-800 border border-red-300",
};

function ManagerDelinquentCases() {
  const { facilityId } = useManagerFacility();
  const [cases, setCases] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [expandedId, setExpandedId] = useState(null);
  const [drafts, setDrafts] = useState({});
  const [submittingId, setSubmittingId] = useState(null);

  async function load() {
    if (!facilityId) return;
    setLoading(true);
    setError("");
    try {
      setCases(await managerService.getDelinquentCases(facilityId));
    } catch (err) {
      setError(err?.message || "Failed to load delinquent cases.");
    } finally {
      setLoading(false);
    }
  }

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => { load(); }, [facilityId]);

  function updateDraft(id, field, value) {
    setDrafts((prev) => ({ ...prev, [id]: { ...prev[id], [field]: value } }));
  }

  async function submitAction(id) {
    const draft = drafts[id] || {};
    if (!draft.actionType) {
      setError("Please select an action type.");
      return;
    }
    setSubmittingId(id);
    setError("");
    try {
      await managerService.createDelinquentCaseAction(id, {
        actionType: draft.actionType,
        note: draft.note || undefined,
        updateCaseStatus: draft.updateCaseStatus || undefined,
      });
      setNotice("Delinquency recovery action recorded successfully.");
      setDrafts((prev) => ({ ...prev, [id]: {} }));
      await load();
    } catch (err) {
      setError(err?.message || "Failed to record recovery action.");
    } finally {
      setSubmittingId(null);
    }
  }

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-lg font-bold text-slate-900">Overdue &amp; Delinquency Cases</h1>
        <p className="text-xs text-slate-500">Track overdue accounts, monitor delinquency grace periods, and record recovery enforcement actions.</p>
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
            Loading delinquent cases...
          </div>
        ) : cases.length === 0 ? (
          <div className="rounded-lg border border-slate-200 bg-white p-8 text-center text-xs text-slate-400">
            No delinquent cases found.
          </div>
        ) : (
          cases.map((item) => {
            const draft = drafts[item.id] || {};
            const expanded = expandedId === item.id;
            return (
              <div key={item.id} className="rounded-lg border border-slate-200 bg-white p-4 shadow-none">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div className="text-xs font-bold text-slate-900">
                    {item.customerName} <span className="font-normal text-slate-400">• Agreement #{item.agreementNo} • Unit <span className="font-mono">{item.unitCode}</span></span>
                  </div>
                  <span className={`inline-flex items-center px-2 py-0.5 rounded text-[11px] font-medium capitalize ${STATUS_BADGE[item.status] || "bg-slate-50 text-slate-600 border border-slate-200"}`}>
                    {formatStatusToEnglish(item.status)}
                  </span>
                </div>

                <div className="mt-2 flex flex-wrap items-center gap-4 text-xs text-slate-500">
                  <span>Overdue: <strong className="text-rose-600">{item.overdueDays} days</strong></span>
                  <span>Outstanding Balance: <strong className="text-slate-800">{formatVnd(item.currentDebt)}</strong></span>
                  <span>Grace Period Ends: <strong className="text-slate-700">{formatDateTime(item.graceEndsAt)}</strong></span>
                </div>

                <button
                  type="button"
                  onClick={() => setExpandedId(expanded ? null : item.id)}
                  className="mt-2 text-xs font-medium text-blue-600 hover:text-blue-700 transition"
                >
                  {expanded ? "Hide action history" : `View action history (${item.actions?.length ?? 0})`}
                </button>

                {expanded && (
                  <div className="mt-2.5 space-y-1.5 border-t border-slate-100 pt-2.5">
                    {(item.actions ?? []).length === 0 ? (
                      <p className="text-xs text-slate-400">No actions recorded yet.</p>
                    ) : (
                      item.actions.map((action) => (
                        <div key={action.id} className="rounded-md border border-slate-100 bg-slate-50/60 p-2.5 text-xs">
                          <div className="flex items-center justify-between gap-2">
                            <span className="font-semibold text-slate-800">
                              {ACTION_TYPES.find(([value]) => value === action.actionType)?.[1] || action.actionType}
                            </span>
                            <span className="text-[11px] text-slate-400">
                              by {action.performedByName || "System"} • {formatDateTime(action.occurredAt)}
                            </span>
                          </div>
                          {action.details && <div className="mt-1 text-slate-500">{action.details}</div>}
                        </div>
                      ))
                    )}
                  </div>
                )}

                {item.status !== "cured" && item.status !== "waived" && (
                  <div className="mt-3 flex flex-wrap items-end gap-2.5 border-t border-slate-100 pt-3">
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Action Type *
                      <select
                        value={draft.actionType || ""}
                        onChange={(e) => updateDraft(item.id, "actionType", e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="" disabled>Select action</option>
                        {ACTION_TYPES.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
                      </select>
                    </label>
                    <label className="flex flex-1 min-w-[200px] flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Notes
                      <input
                        placeholder="Add enforcement notes or call summary..."
                        value={draft.note || ""}
                        onChange={(e) => updateDraft(item.id, "note", e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                      />
                    </label>
                    <label className="flex flex-col gap-1 text-[11px] font-medium text-slate-600">
                      Update Case Status
                      <select
                        value={draft.updateCaseStatus || ""}
                        onChange={(e) => updateDraft(item.id, "updateCaseStatus", e.target.value)}
                        className="rounded-md border border-slate-200 px-3 py-1.5 text-xs text-slate-700 focus:border-blue-500 focus:outline-none"
                      >
                        <option value="">Keep current status</option>
                        {DELINQUENT_CASE_STATUSES.map(([value, label]) => (
                          <option key={value} value={value}>{label}</option>
                        ))}
                      </select>
                    </label>
                    <button
                      type="button"
                      disabled={submittingId === item.id}
                      onClick={() => submitAction(item.id)}
                      className="rounded-md bg-blue-600 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-blue-700 transition disabled:opacity-50"
                    >
                      {submittingId === item.id ? "Saving..." : "Record Action"}
                    </button>
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

export default ManagerDelinquentCases;
