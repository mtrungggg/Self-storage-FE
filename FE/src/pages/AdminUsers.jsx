import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import {
  Users,
  Search,
  RefreshCw,
  UserPlus,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  ArrowRight,
  CheckCircle2,
  Building2,
} from "lucide-react";
import adminUserService from "../api/adminUserService";
import adminFacilityService from "../api/adminFacilityService";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";
import AdminCreateUserForm from "../components/AdminCreateUserForm";
import {
  ROLE_OPTIONS as roles,
  USER_STATUS_OPTIONS as statuses,
  USER_ROLES,
} from "../constants/roles";
import PAGINATION from "../constants/pagination";

const initialFilters = {
  Search: "",
  Role: "",
  Status: "",
  FacilityId: "",
  PageSize: PAGINATION.DEFAULT_PAGE_SIZE,
};

const labelFor = (options, value) => options.find(([key]) => key === value)?.[1] || value || "—";
const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short" });
const formatDate = (value) => {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? "—" : dateFormat.format(date);
};

const ROLE_PILLS = [
  { id: "", label: "All Accounts" },
  { id: USER_ROLES.SYSTEM_ADMINISTRATOR, label: "Admin" },
  { id: USER_ROLES.FACILITY_MANAGER, label: "Facility Manager" },
  { id: USER_ROLES.FACILITY_STAFF, label: "Facility Staff" },
  { id: USER_ROLES.CUSTOMER, label: "Customer" },
];

const STATUS_PILLS = [
  { id: "", label: "All Status" },
  { id: "active", label: "Active" },
  { id: "disabled", label: "Disabled" },
  { id: "locked", label: "Locked" },
];

export default function AdminUsers() {
  const [filters, setFilters] = useState(initialFilters);
  const [query, setQuery] = useState({ ...initialFilters, PageNumber: 1 });
  const [result, setResult] = useState(null);
  const [facilities, setFacilities] = useState([]);
  const [createOpen, setCreateOpen] = useState(false);
  const [statusUpdatingId, setStatusUpdatingId] = useState(null);
  const [reassigningUserId, setReassigningUserId] = useState(null);
  const [notice, setNotice] = useState("");
  const [actionError, setActionError] = useState("");
  const [searchTerm, setSearchTerm] = useState(initialFilters.Search);

  const loading = result?.query !== query;
  const error = loading ? "" : result?.error;
  const data = loading || error ? null : result?.data;

  // Fetch facilities list for dropdown filter & inline assignment
  useEffect(() => {
    adminFacilityService.getFacilities({ PageSize: 50 }).then(
      (res) => setFacilities(res?.items || []),
      () => setFacilities([])
    );
  }, []);

  // Search input debounce (instant filtering)
  useEffect(() => {
    const timer = setTimeout(() => {
      setQuery((prev) =>
        prev.Search === searchTerm.trim()
          ? prev
          : { ...prev, Search: searchTerm.trim(), PageNumber: 1 }
      );
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Fetch users list
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

  // 1-Click Toggle User Status (Active <-> Disabled)
  async function handleToggleUserStatus(user) {
    const nextStatus = user.status === "active" ? "disabled" : "active";
    setStatusUpdatingId(user.id);
    setActionError("");
    try {
      await adminUserService.updateStatus(user.id, {
        status: nextStatus,
        reason: `Status switched to ${nextStatus} by Administrator`,
      });
      setNotice(`User "${user.fullName || user.email}" is now ${nextStatus.toUpperCase()}.`);
      setQuery((prev) => ({ ...prev }));
      window.dispatchEvent(new Event("admin-data-changed"));
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setActionError(err.message || "Failed to update user status.");
    } finally {
      setStatusUpdatingId(null);
    }
  }

  // 1-Click Inline Facility Reassignment
  async function handleReassignFacility(user, newFacilityId) {
    if (!newFacilityId) return;
    setReassigningUserId(user.id);
    setActionError("");
    try {
      const isManager = user.roles?.some((r) => r.toLowerCase().includes("manager"));
      const assignmentRole = isManager ? USER_ROLES.FACILITY_MANAGER : USER_ROLES.FACILITY_STAFF;
      await adminStaffAssignmentService.create({
        employeeId: user.id,
        facilityId: Number(newFacilityId),
        assignmentRole,
        startsAt: new Date().toISOString(),
      });
      setNotice(`Assigned "${user.fullName || user.email}" to facility branch successfully.`);
      setQuery((prev) => ({ ...prev }));
      window.dispatchEvent(new Event("admin-data-changed"));
      setTimeout(() => setNotice(""), 3500);
    } catch (err) {
      setActionError(err.message || "Failed to reassign facility.");
    } finally {
      setReassigningUserId(null);
    }
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

      {/* Notice feedback */}
      {notice && (
        <div
          role="status"
          className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 border border-emerald-200"
        >
          <CheckCircle2 size={18} className="text-emerald-600" />
          <span>{notice}</span>
        </div>
      )}

      {/* Action Error feedback */}
      {actionError && (
        <div role="alert" className="reference-error mb-4">
          <AlertTriangle size={20} />
          <div>
            <strong>Action Error</strong>
            <p>{actionError}</p>
          </div>
        </div>
      )}

      {/* Form: Create User */}
      <AdminCreateUserForm
        roles={roles}
        open={createOpen}
        setOpen={setCreateOpen}
        onCreated={() => {
          setFilters(initialFilters);
          setSearchTerm("");
          setQuery({ ...initialFilters, PageNumber: 1 });
        }}
      />

      {/* Quick 1-Click Lazy Filter Bar */}
      <section className="reference-card mb-6 p-4">
        <div className="flex flex-col gap-3.5">
          {/* Row 1: Instant Search & Real Facility Select & Page Size */}
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div className="reference-search min-w-[260px] max-w-sm flex-1">
              <Search size={16} strokeWidth={1.5} />
              <input
                type="search"
                placeholder="Instant search name, email, phone..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>

            <div className="flex flex-wrap items-center gap-3">
              {/* Facility Dropdown with real branch names */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500 flex items-center gap-1">
                  <Building2 size={13} /> Facility:
                </span>
                <select
                  className="reference-select !py-1.5 !text-xs min-w-[210px]"
                  value={query.FacilityId || ""}
                  onChange={(e) => {
                    const val = e.target.value;
                    setFilters((prev) => ({ ...prev, FacilityId: val }));
                    setQuery((prev) => ({ ...prev, FacilityId: val, PageNumber: 1 }));
                  }}
                >
                  <option value="">All Facilities</option>
                  {facilities.map((fac) => (
                    <option key={fac.id} value={fac.id}>
                      {fac.code} — {fac.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Rows per page */}
              <div className="flex items-center gap-2">
                <span className="text-xs font-semibold text-slate-500">Rows:</span>
                <select
                  className="reference-select !py-1.5 !text-xs w-24"
                  value={query.PageSize}
                  onChange={(e) => {
                    const val = Number(e.target.value);
                    setFilters((prev) => ({ ...prev, PageSize: val }));
                    setQuery((prev) => ({ ...prev, PageSize: val, PageNumber: 1 }));
                  }}
                >
                  {[10, 20, 50].map((size) => (
                    <option key={size} value={size}>
                      {size} rows
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Row 2: 1-Click Interactive Role Pills & Status Pills */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100">
            {/* Role Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Role:</span>
              {ROLE_PILLS.map((pill) => {
                const isActive = (query.Role || "") === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, Role: pill.id }));
                      setQuery((prev) => ({ ...prev, Role: pill.id, PageNumber: 1 }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#111e35] text-white font-semibold shadow-sm"
                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>

            {/* Status Pills */}
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-xs font-semibold text-slate-500 mr-1">Status:</span>
              {STATUS_PILLS.map((pill) => {
                const isActive = (query.Status || "") === pill.id;
                return (
                  <button
                    key={pill.id}
                    type="button"
                    onClick={() => {
                      setFilters((prev) => ({ ...prev, Status: pill.id }));
                      setQuery((prev) => ({ ...prev, Status: pill.id, PageNumber: 1 }));
                    }}
                    className={`px-3 py-1 rounded-lg text-xs font-medium transition-all cursor-pointer ${
                      isActive
                        ? "bg-[#111e35] text-white font-semibold shadow-sm"
                        : "bg-slate-100/90 text-slate-600 hover:bg-slate-200 hover:text-slate-900"
                    }`}
                  >
                    {pill.label}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </section>

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
                data.items.map((user) => {
                  const isStaffOrManager = user.roles?.some(
                    (r) => r.toLowerCase().includes("staff") || r.toLowerCase().includes("manager")
                  );
                  return (
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
                      <td className="max-w-[220px]">
                        {isStaffOrManager ? (
                          <div className="flex items-center gap-1.5">
                            <select
                              className="text-xs bg-slate-50 border border-slate-200 rounded-lg px-2 py-1 text-slate-700 max-w-[190px] truncate hover:border-blue-400 focus:outline-none focus:ring-1 focus:ring-blue-500 cursor-pointer"
                              value={user.assignedFacilityIds?.[0] || ""}
                              onChange={(e) => handleReassignFacility(user, e.target.value)}
                              disabled={reassigningUserId === user.id}
                              title={
                                user.assignedFacilityNames?.length
                                  ? `Current: ${user.assignedFacilityNames.join(", ")} (Click to switch)`
                                  : "Select branch to assign"
                              }
                            >
                              <option value="" disabled>Select Branch...</option>
                              {facilities.map((fac) => (
                                <option key={fac.id} value={fac.id}>
                                  {fac.code} — {fac.name}
                                </option>
                              ))}
                            </select>
                            {reassigningUserId === user.id && (
                              <RefreshCw size={12} className="animate-spin text-blue-600 shrink-0" />
                            )}
                          </div>
                        ) : (
                          <span className="text-xs text-slate-400">—</span>
                        )}
                      </td>
                      <td>
                        <button
                          type="button"
                          onClick={() => handleToggleUserStatus(user)}
                          disabled={statusUpdatingId === user.id}
                          title={`Click to ${user.status === "active" ? "disable" : "activate"} user account`}
                          className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold transition-all cursor-pointer border ${
                            user.status === "active"
                              ? "bg-emerald-50 text-emerald-700 border-emerald-200 hover:bg-emerald-100"
                              : user.status === "locked"
                              ? "bg-amber-50 text-amber-700 border-amber-200 hover:bg-amber-100"
                              : "bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200"
                          }`}
                        >
                          <span
                            className={`w-2 h-2 rounded-full ${
                              user.status === "active"
                                ? "bg-emerald-500 animate-pulse"
                                : user.status === "locked"
                                ? "bg-amber-500"
                                : "bg-slate-400"
                            }`}
                          />
                          {statusUpdatingId === user.id ? (
                            <RefreshCw size={12} className="animate-spin" />
                          ) : (
                            <span>{labelFor(statuses, user.status)}</span>
                          )}
                        </button>
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
                  );
                })
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
