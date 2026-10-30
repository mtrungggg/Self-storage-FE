import { Fragment, useEffect, useState } from "react";
import { History, RefreshCw, ChevronLeft, ChevronRight, AlertTriangle, ChevronDown, ChevronUp, Search, Filter } from "lucide-react";
import AuditChangeDetails from "../components/AuditChangeDetails";
import adminAuditLogService from "../api/adminAuditLogService";
import { isValidPositiveInteger, isValidDateRange } from "../lib/validators";
import PAGINATION from "../constants/pagination";

const ENTITY_OPTIONS = [
  { value: "", label: "All Entity Types" },
  { value: "Facility", label: "Facility" },
  { value: "StorageUnit", label: "Storage Unit" },
  { value: "User", label: "User Account" },
  { value: "RentalAgreement", label: "Rental Agreement" },
  { value: "Reservation", label: "Reservation" },
  { value: "SupportTicket", label: "Support Ticket" },
  { value: "StaffFacilityAssignment", label: "Staff Assignment" },
  { value: "Invoice", label: "Invoice" },
  { value: "Payment", label: "Payment" },
];

const ACTION_OPTIONS = [
  { value: "", label: "All Actions" },
  { value: "Create", label: "Create" },
  { value: "Update", label: "Update" },
  { value: "Delete", label: "Delete" },
];

const defaults = {
  EntityType: "",
  EntityId: "",
  Action: "",
  ActorUserId: "",
  SearchKeyword: "",
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
  const [showDates, setShowDates] = useState(false);

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
    if (event) event.preventDefault();
    setValidation("");
    const next = { ...filters, PageNumber: 1 };

    // Intelligent unified search field handling:
    // If user typed into SearchKeyword:
    const kw = (next.SearchKeyword || "").trim();
    if (kw) {
      if (/^\d+$/.test(kw)) {
        // Numeric: search by EntityId or ActorUserId
        next.EntityId = kw;
        next.ActorUserId = kw;
      } else {
        next.EntityId = kw;
      }
    } else {
      next.EntityId = "";
      next.ActorUserId = "";
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

    setExpanded(null);
    setQuery(next);
  }

  function changePage(page) {
    setExpanded(null);
    setQuery({ ...query, PageNumber: page });
  }

  return (
    <div className="reference-dashboard max-w-7xl mx-auto">
      {/* Top Toolbar */}
      <div className="reference-toolbar mb-4">
        <div>
          <div className="flex items-center gap-3">
            <h1>Audit Logs</h1>
            {data && <span className="reference-pill">{data.totalCount} events recorded</span>}
          </div>
          <p className="reference-muted mt-0.5">
            System-wide audit trail for data mutations, security events, and administrative changes.
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
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
          </button>
        </div>
      </div>

      {/* Streamlined 1-Row Horizontal Filter Bar */}
      <form onSubmit={apply} className="reference-card mb-5 p-3.5">
        <div className="flex flex-wrap items-center gap-2.5">
          {/* Smart Search ID / Actor */}
          <div className="relative min-w-[200px] flex-1">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={filters.SearchKeyword}
              onChange={(e) => setFilters({ ...filters, SearchKeyword: e.target.value })}
              placeholder="Search ID, Actor, or keyword..."
              className="reference-input !pl-9 text-xs"
            />
          </div>

          {/* Entity Type Dropdown */}
          <div className="w-44">
            <select
              value={filters.EntityType}
              onChange={(e) => setFilters({ ...filters, EntityType: e.target.value })}
              className="reference-select text-xs"
            >
              {ENTITY_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Action Dropdown */}
          <div className="w-36">
            <select
              value={filters.Action}
              onChange={(e) => setFilters({ ...filters, Action: e.target.value })}
              className="reference-select text-xs"
            >
              {ACTION_OPTIONS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
          </div>

          {/* Rows per page */}
          <div className="w-32">
            <select
              value={filters.PageSize}
              onChange={(e) => setFilters({ ...filters, PageSize: Number(e.target.value) })}
              className="reference-select text-xs"
            >
              {[10, 20, 50].map((size) => (
                <option key={size} value={size}>
                  {size} rows / page
                </option>
              ))}
            </select>
          </div>

          {/* Date Toggle */}
          <button
            type="button"
            onClick={() => setShowDates((p) => !p)}
            className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold transition ${
              showDates || filters.FromDate || filters.ToDate
                ? "border-blue-500 bg-blue-50 text-blue-700"
                : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
            }`}
          >
            <Filter size={13} />
            <span>Date Range</span>
          </button>

          {/* Action Buttons */}
          <div className="flex items-center gap-1.5 ml-auto">
            <button
              type="button"
              onClick={() => {
                setFilters(defaults);
                setValidation("");
                setExpanded(null);
                setQuery({ ...defaults, PageNumber: 1 });
              }}
              className="reference-button-secondary !py-1.5 !px-3 !text-xs"
            >
              Reset
            </button>
            <button type="submit" className="reference-button-primary !py-1.5 !px-3.5 !text-xs">
              Apply
            </button>
          </div>
        </div>

        {/* Expandable Date Filters */}
        {showDates && (
          <div className="mt-3 grid gap-3 sm:grid-cols-2 border-t border-slate-100 pt-3">
            <div>
              <span className="mb-1 block text-xs font-semibold text-slate-600">From Date / Time</span>
              <input
                type="datetime-local"
                value={filters.FromDate}
                onChange={(e) => setFilters({ ...filters, FromDate: e.target.value })}
                className="reference-input text-xs"
              />
            </div>
            <div>
              <span className="mb-1 block text-xs font-semibold text-slate-600">To Date / Time</span>
              <input
                type="datetime-local"
                value={filters.ToDate}
                onChange={(e) => setFilters({ ...filters, ToDate: e.target.value })}
                className="reference-input text-xs"
              />
            </div>
          </div>
        )}

        {validation && (
          <p role="alert" className="mt-2 text-xs font-semibold text-rose-600">
            {validation}
          </p>
        )}
      </form>

      {/* Audit Log Table Card */}
      <section aria-busy={loading} className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>Audit Event Trail</h2>
            <p className="reference-muted">
              {data ? `Displaying page ${data.pageNumber} of ${data.totalPages} (${data.totalCount} total events)` : "Querying audit logs..."}
            </p>
          </div>
        </div>

        {error && (
          <div role="alert" className="reference-error mx-5 my-4">
            <AlertTriangle size={20} />
            <div>
              <strong>Error Loading Audit Events</strong>
              <p>{error}</p>
            </div>
          </div>
        )}

        <div className="reference-table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                <th scope="col">Event ID</th>
                <th scope="col">Timestamp</th>
                <th scope="col">Actor</th>
                <th scope="col">Role</th>
                <th scope="col">Entity Type</th>
                <th scope="col">Entity ID</th>
                <th scope="col">Action</th>
                <th scope="col">IP Address</th>
                <th scope="col" className="text-right pr-6">Changes</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center text-xs text-slate-400">
                    Loading audit trail events...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={9} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <History size={32} className="mx-auto text-slate-400 mb-2" />
                      <strong className="block text-sm text-slate-900">No audit events found</strong>
                      <p className="text-xs text-slate-500 mt-1">No activities match the selected filter parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((entry) => {
                  const actLower = String(entry.action || "").toLowerCase();
                  const actionStyle = actLower.includes("create")
                    ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                    : actLower.includes("delete")
                    ? "bg-rose-50 text-rose-700 border-rose-200"
                    : "bg-blue-50 text-blue-700 border-blue-200";

                  return (
                    <Fragment key={entry.id}>
                      <tr>
                        <td>
                          <span className="font-mono text-xs text-slate-500">#{entry.id}</span>
                        </td>
                        <td className="text-xs text-slate-600 whitespace-nowrap">
                          {formatDate(entry.occurredAt)}
                        </td>
                        <td>
                          <div className="font-semibold text-slate-900">{entry.actorEmail || "System"}</div>
                          <div className="text-[10px] text-slate-400 font-mono">ID: {entry.actorUserId ?? "—"}</div>
                        </td>
                        <td>
                          <span className="reference-pill !py-0.5 !px-2 !text-[10px]">
                            {entry.actorRole || "—"}
                          </span>
                        </td>
                        <td>
                          <span className="font-semibold text-slate-800">{entry.entityType || "—"}</span>
                        </td>
                        <td>
                          <span className="font-mono text-xs text-slate-600">{entry.entityId || "—"}</span>
                        </td>
                        <td>
                          <span className={`inline-flex items-center px-2 py-0.5 rounded border text-[11px] font-semibold ${actionStyle}`}>
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
                          <td colSpan={9} className="!p-0 border-b border-slate-200 bg-slate-50/70">
                            <AuditChangeDetails entry={entry} />
                          </td>
                        </tr>
                      )}
                    </Fragment>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {data && data.totalPages > 1 && (
          <div className="reference-pagination">
            <span>
              Page <strong>{data.pageNumber}</strong> of <strong>{data.totalPages}</strong> ({data.totalCount} events)
            </span>
            <div className="reference-pagination-buttons">
              <button
                type="button"
                disabled={data.pageNumber <= 1 || loading}
                onClick={() => changePage(data.pageNumber - 1)}
                className="reference-button-secondary !py-1 !px-2 text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={data.pageNumber >= data.totalPages || loading}
                onClick={() => changePage(data.pageNumber + 1)}
                className="reference-button-secondary !py-1 !px-2 text-xs"
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
