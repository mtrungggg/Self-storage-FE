import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { Users, Search, RefreshCw, UserPlus, ChevronLeft, ChevronRight, AlertTriangle, ArrowRight } from "lucide-react";
import adminUserService from "../api/adminUserService";
import AdminCreateUserForm from "../components/AdminCreateUserForm";

const roles = [
  ["storage_customer", "Customer"],
  ["facility_staff", "Facility Staff"],
  ["facility_manager", "Facility Manager"],
  ["business_operations_manager", "Operations Manager"],
  ["system_administrator", "System Administrator"],
];
const statuses = [
  ["active", "Active"],
  ["disabled", "Disabled"],
  ["locked", "Locked"],
];
const initialFilters = { Search: "", Role: "", Status: "", FacilityId: "", PageSize: 10 };
const labelFor = (options, value) => options.find(([key]) => key === value)?.[1] || value || "—";
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short" });
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
};

export default function AdminUsers() {
  const [filters, setFilters] = useState(initialFilters);
  const [query, setQuery] = useState({ ...initialFilters, PageNumber: 1 });
  const [result, setResult] = useState(null);
  const [createOpen, setCreateOpen] = useState(false);
  const loading = result?.query !== query;
  const error = loading ? "" : result?.error;
  const data = loading || error ? null : result?.data;

  useEffect(() => {
    let active = true;
    adminUserService.getUsers(query).then(
      (data) => {
        if (active) setResult({ query, data });
      },
      (err) => {
        if (active) setResult({ query, error: err.message || "Failed to load user accounts." });
      }
    );
    return () => {
      active = false;
    };
  }, [query]);

  function applyFilters(event) {
    event.preventDefault();
    setQuery({ ...filters, Search: filters.Search.trim(), PageNumber: 1 });
  }

  return (
    <div className="reference-dashboard">
      {/* Top Toolbar */}
      <div className="reference-toolbar">
        <div>
          <div className="flex items-center gap-3">
            <h1>Users &amp; Permissions</h1>
            {data && <span className="reference-pill">{data.totalCount} accounts</span>}
          </div>
          <p className="reference-muted mt-1">
            System account governance, role-based authorization (Admin, Manager, Staff, Customer), and facility scoping.
          </p>
        </div>
        <div className="reference-toolbar-actions">
          <label className="reference-search">
            <Search size={18} strokeWidth={1.5} />
            <input
              type="search"
              aria-label="Search users"
              value={filters.Search}
              onChange={(e) => setFilters({ ...filters, Search: e.target.value })}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  e.preventDefault();
                  setQuery({ ...filters, Search: filters.Search.trim(), PageNumber: 1 });
                }
              }}
              placeholder="Search name, email, phone..."
            />
          </label>
          <button
            type="button"
            onClick={() => setCreateOpen(!createOpen)}
            className="reference-button-primary"
          >
            <UserPlus size={15} /> Add User
          </button>
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

      {/* Form: Create User */}
      <AdminCreateUserForm
        roles={roles}
        open={createOpen}
        setOpen={setCreateOpen}
        onCreated={() => {
          setFilters(initialFilters);
          setQuery({ ...initialFilters, PageNumber: 1 });
        }}
      />

      {/* Filter Card */}
      <form onSubmit={applyFilters} className="reference-card mb-6 p-5">
        <div className="grid gap-3.5 sm:grid-cols-2 lg:grid-cols-5 items-end">
          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Keyword</span>
            <input
              type="search"
              value={filters.Search}
              onChange={(e) => setFilters({ ...filters, Search: e.target.value })}
              placeholder="Name, email, phone..."
              className="reference-input"
            />
          </label>

          {[
            ["Role", "Role", roles],
            ["Status", "Status", statuses],
          ].map(([key, label, options]) => (
            <label key={key} className="block">
              <span className="mb-1 block text-xs font-semibold text-[#25232c]">{label}</span>
              <select
                value={filters[key]}
                onChange={(e) => setFilters({ ...filters, [key]: e.target.value })}
                className="reference-select"
              >
                <option value="">All</option>
                {options.map(([value, text]) => (
                  <option key={value} value={value}>
                    {text}
                  </option>
                ))}
              </select>
            </label>
          ))}

          <label className="block">
            <span className="mb-1 block text-xs font-semibold text-[#25232c]">Facility ID</span>
            <input
              type="number"
              min="1"
              step="1"
              value={filters.FacilityId}
              onChange={(e) => setFilters({ ...filters, FacilityId: e.target.value })}
              placeholder="Facility ID"
              className="reference-input"
            />
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
                  {size} rows
                </option>
              ))}
            </select>
          </label>
        </div>

        <div className="mt-4 flex items-center justify-end gap-2.5">
          <button
            type="button"
            onClick={() => {
              setFilters(initialFilters);
              setQuery({ ...initialFilters, PageNumber: 1 });
            }}
            className="reference-button-secondary"
          >
            Reset
          </button>
          <button type="submit" className="reference-button-primary">
            Apply Filters
          </button>
        </div>
      </form>

      {/* Users Table Card */}
      <section aria-busy={loading} className="reference-card reference-table-card">
        <div className="reference-card-heading">
          <div>
            <h2>User Accounts Directory</h2>
            <p className="reference-muted">
              {data ? `Total ${data.totalCount} accounts registered in the system.` : "Loading directory..."}
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
              <strong>Error Loading User Accounts</strong>
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
                <th scope="col">Full Name</th>
                <th scope="col">Email</th>
                <th scope="col">Phone</th>
                <th scope="col">Emp Code</th>
                <th scope="col">Roles</th>
                <th scope="col">Assigned Facility</th>
                <th scope="col">Status</th>
                <th scope="col">Last Login</th>
                <th scope="col" className="text-right pr-6">Action</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center text-xs text-[#767679]">
                    Loading user directory...
                  </td>
                </tr>
              ) : !data || data.items.length === 0 ? (
                <tr>
                  <td colSpan={10} className="py-12 text-center">
                    <div className="admin-empty py-4">
                      <Users size={32} className="mx-auto text-slate-400 mb-2" />
                      <strong className="block text-sm text-[#14121b]">No matching user accounts</strong>
                      <p className="text-xs text-[#767679] mt-1">Try adjusting keywords or filter parameters.</p>
                    </div>
                  </td>
                </tr>
              ) : (
                data.items.map((user) => (
                  <tr key={user.id}>
                    <td>
                      <span className="font-mono text-xs text-slate-500">#{user.id}</span>
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        <span className="inline-grid h-7 w-7 place-items-center rounded-full bg-slate-200 text-[11px] font-bold text-slate-700">
                          {(user.fullName || user.email || "U").charAt(0).toUpperCase()}
                        </span>
                        <Link
                          to={`/admin-users/${encodeURIComponent(user.id)}`}
                          className="font-semibold text-[#14121b] hover:underline"
                        >
                          {user.fullName || "—"}
                        </Link>
                      </div>
                    </td>
                    <td>
                      <span className="font-mono text-xs">{user.email}</span>
                    </td>
                    <td>{user.phoneNumber || "—"}</td>
                    <td>
                      {user.employeeCode ? (
                        <span className="font-mono text-xs font-semibold px-2 py-0.5 rounded bg-slate-100">
                          {user.employeeCode}
                        </span>
                      ) : (
                        "—"
                      )}
                    </td>
                    <td>
                      <span className="reference-pill !py-0.5 !px-2.5 !text-[10px]">
                        {user.roles?.map((r) => labelFor(roles, r)).join(", ") || "—"}
                      </span>
                    </td>
                    <td className="max-w-[200px] truncate" title={user.assignedFacilityNames?.join(", ")}>
                      {user.assignedFacilityNames?.join(", ") || "—"}
                    </td>
                    <td>
                      <span
                        className={`reference-status ${
                          user.status === "active"
                            ? "active"
                            : user.status === "locked"
                            ? "maintenance"
                            : "inactive"
                        }`}
                      >
                        {labelFor(statuses, user.status)}
                      </span>
                    </td>
                    <td className="text-xs text-[#767679]">{formatDate(user.lastLoginAt)}</td>
                    <td className="text-right pr-6">
                      <Link
                        to={`/admin-users/${encodeURIComponent(user.id)}`}
                        className="reference-button-secondary !py-1 !px-3 !text-[11px]"
                      >
                        Details <ArrowRight size={12} />
                      </Link>
                    </td>
                  </tr>
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
                ? "0 accounts"
                : `Showing page ${data.pageNumber} of ${Math.max(1, data.totalPages)} (Total ${data.totalCount} accounts)`}
            </span>
            <div className="reference-pagination-buttons">
              <button
                type="button"
                disabled={!data.hasPreviousPage || query.PageNumber <= 1}
                onClick={() => setQuery({ ...query, PageNumber: query.PageNumber - 1 })}
                className="reference-button-secondary !py-1 !px-3 !text-xs"
              >
                <ChevronLeft size={14} /> Previous
              </button>
              <button
                type="button"
                disabled={!data.hasNextPage}
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
