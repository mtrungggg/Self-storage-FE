import { useEffect, useState } from "react";
import PAGINATION from "../constants/pagination";
import { ShieldCheck, Search, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, ShieldAlert, CheckCircle2, XCircle, Lock } from "lucide-react";
import adminLoginHistoryService from "../api/adminLoginHistoryService";
import { isValidPositiveInteger, isValidDateRange } from "../lib/validators";

const defaults = {
  UserId: "",
  AttemptedEmail: "",
  Result: "",
  IsSuspiciousOnly: false,
  FromDate: "",
  ToDate: "",
  PageSize: PAGINATION.TABLE_PAGE_SIZE,
};

const results = [
  ["succeeded", "Succeeded"],
  ["failed", "Failed"],
  ["locked", "Locked"],
  ["blocked", "Blocked"],
];

const metricConfig = [
  { key: "totalAttempts", label: "Total Attempts", icon: ShieldCheck, color: "text-slate-800" },
  { key: "succeededAttempts", label: "Succeeded", icon: CheckCircle2, color: "text-[#23866a]", badge: "lime" },
  { key: "failedAttempts", label: "Failed", icon: XCircle, color: "text-[#c92a2a]", badge: "red" },
  { key: "lockedAttempts", label: "Locked", icon: Lock, color: "text-[#854d0e]" },
  { key: "blockedAttempts", label: "Blocked", icon: XCircle, color: "text-red-700" },
  { key: "suspiciousAttemptsCount", label: "Suspicious", icon: ShieldAlert, color: "text-[#c92a2a]", badge: "red" },
];

const dates = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "medium" });
function formatDate(value) {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime()) ? "—" : dates.format(date);
}

export default function AdminLoginHistories() {
  const [filters, setFilters] = useState(defaults);
  const [query, setQuery] = useState({ ...defaults, PageNumber: 1 });
  const [response, setResponse] = useState(null);
  const [validation, setValidation] = useState("");
  const loading = response?.query !== query;
  const error = loading ? "" : response?.error;
  const data = loading || error ? null : response?.data;
  const histories = data?.histories;

  useEffect(() => {
    let active = true;
    adminLoginHistoryService.getHistories(query).then(
      (data) => {
        if (active) setResponse({ query, data });
      },
      (err) => {
        if (active) setResponse({ query, error: err.message || "Failed to load login history." });
      }
    );
    return () => {
      active = false;
    };
  }, [query]);

  function apply(event) {
    event.preventDefault();
    setValidation("");
    const next = {
      ...filters,
      AttemptedEmail: filters.AttemptedEmail.trim(),
      UserId: filters.UserId.trim(),
      PageNumber: 1,
    };
    if (next.UserId && !isValidPositiveInteger(next.UserId)) {
      setValidation("User ID must be a positive integer.");
      return;
    }
    for (const key of ["FromDate", "ToDate"]) {
      if (!next[key]) continue;
      const date = new Date(next[key]);
      if (Number.isNaN(date.getTime())) {
        setValidation("Invalid date and time entered.");
        return;
      }
      next[key] = date.toISOString();
    }
    if (!isValidDateRange(next.FromDate, next.ToDate)) {
      setValidation("End date must be later than or equal to start date.");
      return;
    }
    setQuery(next);
  }

  return (
    <div className="reference-dashboard">
      {/* Top Toolbar */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>Login Activity &amp; History</h1>
            {histories && <span className="reference-pill">{histories.totalCount} attempts</span>}
          </div>
          <p className="reference-muted mt-1">
            Monitor authentication attempts, detect anomalous login activities, and mitigate security threats.
          </p>
        </div>
        <div className="reference-toolbar-actions">
          <button
            className="reference-refresh"
            type="button"
            disabled={loading}
            onClick={() => setQuery({ ...query })}
            aria-label="Refresh data"
            title="Refresh data"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Metrics Grid matching Dashboard Summary Cards */}
      {data?.summary && (
        <div className="mb-6 grid grid-cols-2 gap-3.5 sm:grid-cols-3 xl:grid-cols-6">
          {metricConfig.map(({ key, label, icon: Icon, color, badge }) => (
            <div key={key} className="reference-card p-4 flex flex-col justify-between">
              <div className="flex items-center justify-between gap-1 mb-2">
                <span className="text-[11px] font-semibold text-[#767679] truncate" title={label}>
                  {label}
                </span>
                <Icon size={16} className={color} />
              </div>
              <div className="flex items-baseline gap-2">
                <strong className="text-2xl font-bold text-[#14121b]">
                  {data.summary[key] == null
                    ? "—"
                    : new Intl.NumberFormat("en-US").format(data.summary[key])}
                </strong>
                {badge && (
                  <span className={`reference-badge ${badge} !text-[9px] !py-0.5 !px-2`}>
                    {key === "suspiciousAttemptsCount" && data.summary[key] > 0
                      ? "Attention"
                      : "Normal"}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Filter Card */}
      <form onSubmit={apply} className="reference-card mb-6 p-5">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4 items-end">
          {[
            ["UserId", "Account User ID"],
            ["AttemptedEmail", "Attempted Email"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-[#25232c]">{label}</span>
              <input
                value={filters[key]}
                inputMode={key === "UserId" ? "numeric" : undefined}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                placeholder={`Enter ${label.toLowerCase()}...`}
                className="reference-input"
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Result</span>
            <select
              value={filters.Result}
              onChange={(e) => setFilters({ ...filters, Result: e.target.value })}
              className="reference-select"
            >
              <option value="">All</option>
              {results.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Rows per page</span>
            <select
              value={filters.PageSize}
              onChange={(e) => setFilters({ ...filters, PageSize: Number(e.target.value) })}
              className="reference-select"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows / page
                </option>
              ))}
            </select>
          </label>

          {[
            ["FromDate", "From Date / Time"],
            ["ToDate", "To Date / Time"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-[#25232c]">{label}</span>
              <input
                type="datetime-local"
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="reference-input"
              />
            </label>
          ))}

          <div className="sm:col-span-2 flex items-center h-10">
            <label className="flex items-center gap-2.5 text-xs font-semibold text-[#25232c] cursor-pointer">
              <input
                type="checkbox"
                checked={filters.IsSuspiciousOnly}
                onChange={(e) => setFilters({ ...filters, IsSuspiciousOnly: e.target.checked })}
                className="h-4 w-4 rounded accent-black"
              />
              <span>Only show suspicious attempts (Flagged)</span>
            </label>
          </div>
        </div>

        {validation && (
          <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
            {validation}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[#ededed] pt-3.5">
          <span className="text-xs text-[#767679]">
            Device Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFilters(defaults);
                setValidation("");
                setQuery({ ...defaults, PageNumber: 1 });
              }}
              className="reference-button-secondary"
            >
              Reset
            </button>
            <button type="submit" className="reference-button-primary">
              Apply Filters
            </button>
          </div>
        </div>
      </form>

      {/* Table Card */}
      <section aria-busy={loading} className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>Authentication Attempt Log</h2>
            <p className="reference-muted">
              {histories ? `Total ${histories.totalCount} authentication attempts recorded.` : "Loading activity log..."}
            </p>
          </div>
          {histories && (
            <span className="reference-pill">
              Page {histories.pageNumber} / {Math.max(1, histories.totalPages)}
            </span>
          )}
        </div>

        {error && (
          <div role="alert" className="reference-error mx-5 my-4">
            <AlertTriangle size={20} />
            <div>
              <strong>Error Loading Login Activity</strong>
              <p>{error}</p>
              <button type="button" onClick={() => setQuery({ ...query })}>
                Retry
              </button>
            </div>
          </div>
        )}

        <div className="reference-table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                <th scope="col">ID</th>
                <th scope="col">Timestamp</th>
                <th scope="col">Account ID</th>
                <th scope="col">Attempted Email</th>
                <th scope="col">Result</th>
                <th scope="col">IP Address</th>
                <th scope="col">Browser / Device</th>
                <th scope="col">Suspicious</th>
                <th scope="col">Flag Reason</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#767679]">
                    Loading authentication logs...
                  </td>
                </tr>
              ) : !histories || histories.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <ShieldCheck size={32} className="mx-auto text-slate-400 mb-2" />
                      <strong className="block text-sm text-[#14121b]">No login history found</strong>
                      <p className="text-xs text-[#767679] mt-1">No activities match the current filter criteria.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                histories.items.map((item) => (
                  <tr
                    key={item.id}
                    className={item.isSuspicious ? "bg-[#fff8f8] hover:bg-[#fff0f0]" : ""}
                  >
                    <td>
                      <span className="font-mono text-xs text-slate-500">#{item.id}</span>
                    </td>
                    <td className="text-xs text-[#767679] whitespace-nowrap">
                      {formatDate(item.occurredAt)}
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-700">
                        {item.userId ? `#${item.userId}` : "—"}
                      </span>
                    </td>
                    <td>
                      <strong className="font-medium text-[#14121b]">{item.attemptedEmail || "—"}</strong>
                    </td>
                    <td>
                      <span
                        className={`reference-status ${
                          item.result === "succeeded"
                            ? "active"
                            : item.result === "failed"
                            ? "maintenance"
                            : "inactive"
                        }`}
                      >
                        {results.find(([k]) => k === item.result)?.[1] || item.result || "—"}
                      </span>
                    </td>
                    <td>
                      <span className="font-mono text-xs text-slate-600">{item.ipAddress || "—"}</span>
                    </td>
                    <td className="max-w-[280px] truncate" title={item.userAgent}>
                      {item.userAgent || "—"}
                    </td>
                    <td>
                      <span className={`reference-badge ${item.isSuspicious ? "red" : "gray"}`}>
                        {item.isSuspicious ? "Flagged" : "Normal"}
                      </span>
                    </td>
                    <td className="text-xs text-red-600 max-w-[220px] truncate" title={item.suspiciousReason}>
                      {item.suspiciousReason || "—"}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Dashboard */}
        {histories && (
          <div className="reference-pagination">
            <span>
              {histories.totalCount === 0
                ? "0 attempts"
                : `Showing page ${histories.pageNumber} of ${Math.max(1, histories.totalPages)} (Total ${histories.totalCount} attempts)`}
            </span>
            <div className="reference-pagination-buttons">
              <button
                type="button"
                disabled={!histories.hasPreviousPage || query.PageNumber <= 1}
                onClick={() => setQuery({ ...query, PageNumber: query.PageNumber - 1 })}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={!histories.hasNextPage}
                onClick={() => setQuery({ ...query, PageNumber: query.PageNumber + 1 })}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
              >
                Next <ChevronRight size={14} />
              </button>
            </div>
          </div>
        )}
      </section>
    </div>
  );
}
