import { Fragment, useEffect, useState } from "react";
import { History, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, ChevronDown, ChevronUp } from "lucide-react";
import AuditChangeDetails from "../components/AuditChangeDetails";
import adminAuditLogService from "../api/adminAuditLogService";
import { isValidPositiveInteger, isValidDateRange } from "../lib/validators";

const defaults = {
  EntityType: "",
  EntityId: "",
  Action: "",
  ActorUserId: "",
  FromDate: "",
  ToDate: "",
  PageSize: PAGINATION.TABLE_PAGE_SIZE,
};

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "medium" });
function formatDate(value) {
  const date = new Date(value);
  return !value || Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
}

export default function AdminAuditLog() {
  const [filters, setFilters] = useState(defaults);
  const [query, setQuery] = useState({ ...defaults, PageNumber: 1 });
  const [result, setResult] = useState(null);
  const [validation, setValidation] = useState("");
  const [expanded, setExpanded] = useState(null);
  const loading = result?.query !== query;
  const error = loading ? "" : result?.error;
  const data = loading || error ? null : result?.data;

  useEffect(() => {
    let active = true;
    adminAuditLogService.getLogs(query).then(
      (data) => {
        if (active) setResult({ query, data });
      },
      (err) => {
        if (active) setResult({ query, error: err.message || "Failed to load audit logs." });
      }
    );
    return () => {
      active = false;
    };
  }, [query]);

  function apply(event) {
    event.preventDefault();
    setValidation("");
    const next = { ...filters, PageNumber: 1 };
    for (const key of ["EntityType", "EntityId", "Action"]) next[key] = next[key].trim();
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
    if (next.ActorUserId && !isValidPositiveInteger(next.ActorUserId)) {
      setValidation("Actor User ID must be a positive integer.");
      return;
    }
    setExpanded(null);
    setQuery(next);
  }

  function changePage(page) {
    setExpanded(null);
    setQuery({ ...query, PageNumber: page });
  }

  return (
    <div className="reference-dashboard">
      {/* Top Toolbar */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>Audit Logs</h1>
            {data && <span className="reference-pill">{data.totalCount} events</span>}
          </div>
          <p className="reference-muted mt-1">
            System-wide audit trail for CRUD actions, data mutations, and administrative governance.
          </p>
        </div>
        <div className="reference-toolbar-actions">
          <button
            className="reference-refresh"
            type="button"
            disabled={loading}
            onClick={() => {
              setExpanded(null);
              setQuery({ ...query });
            }}
            aria-label="Refresh audit logs"
            title="Refresh audit logs"
          >
            <RefreshCw size={17} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Filter Card */}
      <form onSubmit={apply} className="reference-card mb-6 p-5">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-4">
          {[
            ["EntityType", "Entity Type"],
            ["EntityId", "Entity ID"],
            ["Action", "Action (Create/Update/Delete)"],
            ["ActorUserId", "Actor User ID"],
          ].map(([key, label]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-[#25232c]">{label}</span>
              <input
                value={filters[key]}
                inputMode={key === "ActorUserId" ? "numeric" : undefined}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                placeholder={`Enter ${label.toLowerCase()}...`}
                className="reference-input"
              />
            </label>
          ))}

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
        </div>

        {validation && (
          <p role="alert" className="mt-3 text-xs font-semibold text-red-600">
            {validation}
          </p>
        )}

        <div className="mt-4 flex items-center justify-between border-t border-[#ededed] pt-3.5">
          <span className="text-xs text-[#767679]">
            Display Timezone: {Intl.DateTimeFormat().resolvedOptions().timeZone}
          </span>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => {
                setFilters(defaults);
                setValidation("");
                setExpanded(null);
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

      {/* Audit Log Table Card */}
      <section aria-busy={loading} className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>Audit Event Trail</h2>
            <p className="reference-muted">
              {data ? `Recorded ${data.totalCount} data mutation events.` : "Querying audit logs..."}
            </p>
          </div>
          {data && (
            <span className="reference-pill">
              Page {data.pageNumber} / {Math.max(1, data.totalPages)}
            </span>
          )}
        </div>

        {error && (
          <div role="alert" className="reference-error mx-5 my-4">
            <AlertTriangle size={20} />
            <div>
              <strong>Error Loading Audit Trail</strong>
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
                <th scope="col">Actor</th>
                <th scope="col">Role</th>
                <th scope="col">Entity</th>
                <th scope="col">Entity ID</th>
                <th scope="col">Action</th>
                <th scope="col">IP Address</th>
                <th scope="col" className="text-right pr-6">Changes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-[#767679]">
                    Loading audit trail events...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <History size={32} className="mx-auto text-slate-400 mb-2" />
                      <strong className="block text-sm text-[#14121b]">No audit events found</strong>
                      <p className="text-xs text-[#767679] mt-1">No activities match the selected filter parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((entry) => (
                  <Fragment key={entry.id}>
                    <tr>
                      <td>
                        <span className="font-mono text-xs text-slate-500">#{entry.id}</span>
                      </td>
                      <td className="text-xs text-[#767679] whitespace-nowrap">
                        {formatDate(entry.occurredAt)}
                      </td>
                      <td>
                        <div className="font-semibold text-[#14121b]">{entry.actorEmail || "System"}</div>
                        <div className="text-[10px] text-[#767679]">ID: {entry.actorUserId ?? "—"}</div>
                      </td>
                      <td>
                        <span className="reference-pill !py-0.5 !px-2.5 !text-[10px]">
                          {entry.actorRole || "—"}
                        </span>
                      </td>
                      <td>
                        <span className="font-semibold text-[#14121b]">{entry.entityType || "—"}</span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-600">{entry.entityId || "—"}</span>
                      </td>
                      <td>
                        <span
                          className={`reference-status ${
                            String(entry.action).toLowerCase().includes("delete")
                              ? "maintenance"
                              : String(entry.action).toLowerCase().includes("create")
                              ? "active"
                              : "inactive"
                          }`}
                        >
                          {entry.action ?? "—"}
                        </span>
                      </td>
                      <td>
                        <span className="font-mono text-xs text-slate-500">{entry.ipAddress || "—"}</span>
                      </td>
                      <td className="text-right pr-6">
                        <button
                          type="button"
                          aria-expanded={expanded === entry.id}
                          aria-controls={`audit-detail-${entry.id}`}
                          onClick={() => setExpanded(expanded === entry.id ? null : entry.id)}
                          className="reference-button-secondary !py-1 !px-2.5 !text-[11px]"
                        >
                          {expanded === entry.id ? (
                            <>
                              Collapse <ChevronUp size={12} />
                            </>
                          ) : (
                            <>
                              Details <ChevronDown size={12} />
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                    {expanded === entry.id && (
                      <tr id={`audit-detail-${entry.id}`}>
                        <td colSpan={9} className="bg-[#f2f4f6] p-4 border-b border-[#e5e5e5]">
                          <AuditChangeDetails key={entry.id} entry={entry} />
                        </td>
                      </tr>
                    )}
                  </Fragment>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination matching Dashboard */}
        {data && (
          <div className="reference-pagination">
            <span>
              {data.totalCount === 0
                ? "0 events"
                : `Showing page ${data.pageNumber} of ${Math.max(1, data.totalPages)} (Total ${data.totalCount} events)`}
            </span>
            <div className="reference-pagination-buttons">
              <button
                type="button"
                disabled={!data.hasPreviousPage || query.PageNumber <= 1}
                onClick={() => changePage(query.PageNumber - 1)}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={!data.hasNextPage}
                onClick={() => changePage(query.PageNumber + 1)}
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

