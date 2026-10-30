import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import {
  ArrowLeft,
  RefreshCw,
  Trash2,
  User,
  Building2,
  Calendar,
  AlertTriangle,
  Plus,
  Shield,
  Clock,
  Briefcase,
  Mail,
  Phone,
} from "lucide-react";
import adminUserService from "../api/adminUserService";
import AdminUserStatusForm from "../components/AdminUserStatusForm";
import AdminUserRolesForm from "../components/AdminUserRolesForm";
import AdminStaffAssignmentForm from "../components/AdminStaffAssignmentForm";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short" });
const date = (value) => {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormat.format(parsed);
};

const statusLabel = (value) =>
  ({ active: "Active", disabled: "Disabled", locked: "Locked" }[value] || value);

export default function AdminUserDetail() {
  const { id } = useParams();
  const [activeTab, setActiveTab] = useState("overview"); // "overview" | "logins"
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingRoles, setSavingRoles] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
  const [showAssignForm, setShowAssignForm] = useState(false);
  const deletePending = useRef(false);
  const activeUser = useRef(id);

  useEffect(() => {
    activeUser.current = id;
    return () => {
      activeUser.current = null;
    };
  }, [id]);

  const assignmentBusy = savingAssignment || deletingAssignment !== null;
  const [roleNotice, setRoleNotice] = useState(null);
  const validId = /^[1-9]\d*$/.test(id || "");
  const loading = validId && (result?.id !== id || result?.attempt !== attempt);
  const error = !validId ? "Invalid user ID." : loading ? "" : result?.error;
  const user = !loading && !error ? result?.data : null;

  useEffect(() => {
    if (!validId) return;
    let active = true;
    adminUserService.getUser(id).then(
      (data) => {
        if (active) setResult({ id, attempt, data });
      },
      (err) => {
        if (active)
          setResult({
            id,
            attempt,
            error: err.status === 404 ? "User account not found." : err.message || "Failed to load user information.",
          });
      }
    );
    return () => {
      active = false;
    };
  }, [id, attempt, validId]);

  const customer = user?.customerProfile;
  const employee = user?.employeeProfile;

  // Determine user category: is this user a customer, employee, or both?
  const isCustomerOnly =
    user?.roles?.some((r) => r.code?.toLowerCase().includes("customer")) &&
    !user?.roles?.some((r) =>
      ["admin", "manager", "staff", "operations"].some((sub) => r.code?.toLowerCase().includes(sub))
    );

  const isStaffOrManager = user?.roles?.some((r) =>
    ["admin", "manager", "staff", "operations"].some((sub) => r.code?.toLowerCase().includes(sub))
  );

  async function removeAssignment(assignment) {
    if (deletePending.current || savingStatus || savingRoles || savingAssignment) return;
    if (
      !window.confirm(
        `Remove facility assignment for ${assignment.facilityName || assignment.facilityCode || assignment.facilityId}?`
      )
    )
      return;
    deletePending.current = true;
    setDeletingAssignment(assignment.id);
    setDeleteMessage(null);
    try {
      await adminStaffAssignmentService.remove(assignment.id);
    } catch (err) {
      if (activeUser.current === id)
        setDeleteMessage({
          id,
          error: true,
          text: err.status === 404 ? "Assignment no longer exists. Please refresh." : err.message || "Failed to remove assignment.",
        });
      return;
    } finally {
      deletePending.current = false;
      if (activeUser.current === id) setDeletingAssignment(null);
    }
    window.dispatchEvent(new Event("admin-data-changed"));
    if (activeUser.current !== id) return;
    setResult((current) =>
      current?.id === id && current.data?.employeeProfile
        ? {
            ...current,
            data: {
              ...current.data,
              employeeProfile: {
                ...current.data.employeeProfile,
                facilityAssignments: (current.data.employeeProfile.facilityAssignments || []).filter(
                  (item) => item.id !== assignment.id
                ),
              },
            },
          }
        : current
    );
    setDeleteMessage({ id, error: false, text: "Facility assignment removed successfully." });
    setTimeout(() => setDeleteMessage(null), 3500);
  }

  const loginCount = user?.recentLoginHistories?.length || 0;

  return (
    <div className="reference-dashboard max-w-7xl mx-auto">
      {/* Top Toolbar */}
      <div className="reference-toolbar mb-4">
        <div>
          <Link
            to="/admin-users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-blue-600 mb-1.5 transition"
          >
            <ArrowLeft size={14} /> Back to User Directory
          </Link>
          <div className="flex items-center gap-3">
            <h1>Account Details</h1>
            {user && (
              <span
                className={`reference-status ${
                  user.status === "active" ? "active" : user.status === "locked" ? "maintenance" : "inactive"
                }`}
              >
                {statusLabel(user.status)}
              </span>
            )}
          </div>
        </div>
        <div className="reference-toolbar-actions">
          <button
            type="button"
            disabled={loading || !validId || savingStatus || savingRoles || assignmentBusy}
            onClick={() => {
              setDeleteMessage(null);
              setAttempt((v) => v + 1);
            }}
            className="reference-button-secondary"
          >
            <RefreshCw size={14} className={loading ? "animate-spin" : ""} />
            Refresh
          </button>
        </div>
      </div>

      {/* Tabs Bar */}
      {user && (
        <div className="flex items-center gap-2 border-b border-slate-200 mb-5">
          <button
            type="button"
            onClick={() => setActiveTab("overview")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
              activeTab === "overview"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Shield size={14} />
            <span>Overview &amp; Roles</span>
          </button>
          <button
            type="button"
            onClick={() => setActiveTab("logins")}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold transition border-b-2 -mb-px ${
              activeTab === "logins"
                ? "border-blue-600 text-blue-600"
                : "border-transparent text-slate-500 hover:text-slate-800"
            }`}
          >
            <Calendar size={14} />
            <span>Login Activity</span>
            <span className="rounded-full bg-slate-100 px-2 py-0.5 text-[10px] font-bold text-slate-600">
              {loginCount}
            </span>
          </button>
        </div>
      )}

      {roleNotice === id && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-lg bg-emerald-50 px-4 py-3 text-xs font-semibold text-emerald-800 border border-emerald-200">
          <span>Role updated successfully. User must sign in again to receive new permissions.</span>
        </div>
      )}

      {loading && <p className="py-8 text-center text-xs text-slate-500">Loading user information...</p>}

      {error && (
        <div role="alert" className="reference-error mb-5">
          <AlertTriangle size={20} />
          <div>
            <strong>Error Loading User Details</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {user && activeTab === "overview" && (
        <>
          {/* Consolidated Header Profile Card */}
          <section className="reference-card mb-5 p-5">
            <div className="grid gap-6 lg:grid-cols-12">
              {/* Left Column: Account Details Grid */}
              <div className="lg:col-span-7 xl:col-span-8 border-b lg:border-b-0 lg:border-r border-slate-100 pb-5 lg:pb-0 lg:pr-6">
                <div className="flex items-center gap-3 mb-4">
                  <div className="grid h-10 w-10 place-items-center rounded-lg bg-blue-50 text-blue-600 font-bold text-base border border-blue-100">
                    {(employee?.fullName || customer?.fullName || user.email).charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-slate-900 leading-tight">
                      {employee?.fullName || customer?.fullName || "Account Profile"}
                    </h2>
                    <p className="text-xs text-slate-500 font-mono">
                      User ID: #{user.id} · Created {date(user.createdAt)}
                    </p>
                  </div>
                </div>

                <div className="grid gap-3 sm:grid-cols-2 text-xs">
                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Mail size={12} /> Email Address
                    </span>
                    <strong className="text-slate-800 font-semibold break-all">{user.email}</strong>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Phone size={12} /> Phone Number
                    </span>
                    <strong className="text-slate-800 font-semibold">{user.phoneNumber || "—"}</strong>
                  </div>

                  {employee && (
                    <>
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-0.5 flex items-center gap-1">
                          <Briefcase size={12} /> Employee Code
                        </span>
                        <strong className="text-slate-800 font-semibold font-mono">{employee.employeeCode}</strong>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-0.5 flex items-center gap-1">
                          <Calendar size={12} /> Hire Date
                        </span>
                        <strong className="text-slate-800 font-semibold">{date(employee.hireDate)}</strong>
                      </div>
                    </>
                  )}

                  {customer && !employee && (
                    <>
                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                          ID / Passport
                        </span>
                        <strong className="text-slate-800 font-semibold font-mono">{customer.identityNumber || "—"}</strong>
                      </div>

                      <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                        <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                          Residential Address
                        </span>
                        <strong className="text-slate-800 font-semibold truncate block">{customer.address || "—"}</strong>
                      </div>
                    </>
                  )}

                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5 flex items-center gap-1">
                      <Clock size={12} /> Last Login
                    </span>
                    <strong className="text-slate-800 font-semibold">{date(user.lastLoginAt)}</strong>
                  </div>

                  <div className="rounded-lg bg-slate-50 p-2.5 border border-slate-100">
                    <span className="text-[11px] font-semibold text-slate-400 block mb-0.5">
                      Roles Assigned
                    </span>
                    <div className="flex flex-wrap gap-1 mt-0.5">
                      {(user.roles || []).map((r) => (
                        <span key={r.roleId || r.code} className="reference-pill !py-0 !px-1.5 !text-[10px]">
                          {r.displayName || r.code}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>

              {/* Right Column: Integrated Account Access & Status Form */}
              <div className="lg:col-span-5 xl:col-span-4">
                <AdminUserStatusForm
                  key={`status-${user.id}`}
                  user={user}
                  compact={true}
                  disabled={savingRoles || assignmentBusy}
                  onSavingChange={setSavingStatus}
                  onUpdated={(updated) => {
                    setResult((current) =>
                      current?.id === id && String(updated.id) === String(user.id)
                        ? {
                            ...current,
                            data: {
                              ...current.data,
                              status: updated.status,
                              updatedAt: updated.updatedAt ?? current.data.updatedAt,
                            },
                          }
                        : current
                    );
                  }}
                />
              </div>
            </div>
          </section>

          {/* Manage Roles Form (with inline granted audit details, NO redundant second table) */}
          <AdminUserRolesForm
            key={`roles-${user.id}`}
            user={user}
            disabled={savingStatus || assignmentBusy}
            onSavingChange={setSavingRoles}
            onUpdated={() => {
              setRoleNotice(id);
              setAttempt((v) => v + 1);
            }}
          />

          {/* Customer Profile (Rendered ONLY when user is actually a Customer) */}
          {!isStaffOrManager && customer && (
            <section className="reference-card mb-5 p-5">
              <div className="reference-card-heading mb-3">
                <div className="flex items-center gap-2">
                  <User size={16} className="text-blue-600" />
                  <h2>Customer Rental Profile</h2>
                </div>
              </div>
              <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3 text-xs">
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Full Legal Name</span>
                  <strong className="text-slate-800">{customer.fullName}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">National ID / Passport</span>
                  <strong className="text-slate-800 font-mono">{customer.identityNumber || "—"}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Date of Birth</span>
                  <strong className="text-slate-800">{date(customer.dateOfBirth)}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Residential Address</span>
                  <strong className="text-slate-800">{customer.address || "—"}</strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Emergency Contact</span>
                  <strong className="text-slate-800">
                    {customer.emergencyContactName ? `${customer.emergencyContactName} (${customer.emergencyContactPhone || "—"})` : "—"}
                  </strong>
                </div>
                <div className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                  <span className="text-slate-400 block mb-0.5">Profile Registered</span>
                  <strong className="text-slate-800">{date(customer.createdAt)}</strong>
                </div>
              </div>
            </section>
          )}

          {/* Employee Facility Assignments (Rendered ONLY when user is an Employee/Staff/Manager) */}
          {employee && (
            <section className="reference-card reference-table-card mb-5">
              <div className="reference-card-heading">
                <div className="flex items-center gap-2.5">
                  <span className="grid h-8 w-8 place-items-center rounded-lg bg-blue-50 text-blue-600 border border-blue-100">
                    <Building2 size={16} />
                  </span>
                  <div>
                    <h2>Facility Branch Assignments</h2>
                    <p className="reference-muted text-[11px]">Branches and operational roles assigned to this staff member.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setShowAssignForm((p) => !p)}
                  className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-3 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
                >
                  <Plus size={13} />
                  <span>{showAssignForm ? "Hide Form" : "Assign Branch"}</span>
                </button>
              </div>

              {/* Inline Branch Assignment Form */}
              {showAssignForm && (
                <div className="px-5 pt-3">
                  <AdminStaffAssignmentForm
                    key={`assignment-${user.id}`}
                    employee={employee}
                    disabled={savingStatus || savingRoles || deletingAssignment !== null}
                    onSavingChange={setSavingAssignment}
                    onClose={() => setShowAssignForm(false)}
                    onCreated={(assignment) => {
                      setShowAssignForm(false);
                      setResult((current) =>
                        current?.id === id && current.data?.employeeProfile
                          ? {
                              ...current,
                              data: {
                                ...current.data,
                                employeeProfile: {
                                  ...current.data.employeeProfile,
                                  facilityAssignments: [
                                    ...(current.data.employeeProfile.facilityAssignments || []).filter(
                                      (item) => item.id !== assignment.id
                                    ),
                                    assignment,
                                  ],
                                },
                              },
                            }
                          : current
                      );
                    }}
                  />
                </div>
              )}

              {deleteMessage?.id === id && (
                <div
                  role={deleteMessage.error ? "alert" : "status"}
                  className={`mx-5 my-2 flex items-center gap-2 rounded-lg px-3 py-2 text-xs font-semibold ${
                    deleteMessage.error
                      ? "bg-rose-50 text-rose-700 border border-rose-200"
                      : "bg-emerald-50 text-emerald-700 border border-emerald-200"
                  }`}
                >
                  <span>{deleteMessage.text}</span>
                </div>
              )}

              {(!employee.facilityAssignments || employee.facilityAssignments.length === 0) ? (
                <p className="py-8 text-center text-xs text-slate-400">No facility branch assignments recorded for this employee.</p>
              ) : (
                <div className="reference-table-scroll">
                  <table className="reference-table">
                    <thead>
                      <tr>
                        <th scope="col">Facility Name</th>
                        <th scope="col">Code</th>
                        <th scope="col">Role</th>
                        <th scope="col">Starts At</th>
                        <th scope="col">Ends At</th>
                        <th scope="col">Status</th>
                        <th scope="col" className="text-right pr-5">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {employee.facilityAssignments.map((r) => (
                        <tr key={r.id}>
                          <td>
                            <strong className="font-semibold text-slate-900">{r.facilityName || r.facilityCode}</strong>
                          </td>
                          <td>
                            <span className="font-mono text-xs text-slate-500">{r.facilityCode || `#${r.facilityId}`}</span>
                          </td>
                          <td>
                            <span className="reference-pill !py-0.5 !px-2">{r.assignmentRole}</span>
                          </td>
                          <td className="text-xs text-slate-600">{date(r.startsAt)}</td>
                          <td className="text-xs text-slate-600">{date(r.endsAt)}</td>
                          <td>
                            <span className={`reference-status ${r.isActive ? "active" : "inactive"}`}>
                              {r.isActive ? "Active Duty" : "Ended"}
                            </span>
                          </td>
                          <td className="text-right pr-5">
                            <button
                              type="button"
                              disabled={savingStatus || savingRoles || assignmentBusy}
                              onClick={() => removeAssignment(r)}
                              className="reference-button-danger !py-1 !px-2.5 !text-[11px]"
                            >
                              <Trash2 size={12} /> {deletingAssignment === r.id ? "Removing..." : "Remove"}
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </section>
          )}
        </>
      )}

      {/* Tab 2: Login Activity */}
      {user && activeTab === "logins" && (
        <section className="reference-card reference-table-card">
          <div className="reference-card-heading">
            <div className="flex items-center gap-2">
              <Calendar size={16} className="text-blue-600" />
              <h2>Recent Login History</h2>
            </div>
            <span className="reference-pill">{loginCount} records</span>
          </div>

          {!user.recentLoginHistories?.length ? (
            <p className="py-12 text-center text-xs text-slate-400">No recent login history recorded for this user.</p>
          ) : (
            <div className="reference-table-scroll">
              <table className="reference-table">
                <thead>
                  <tr>
                    <th scope="col">Timestamp</th>
                    <th scope="col">Attempted Email</th>
                    <th scope="col">Result</th>
                    <th scope="col">IP Address</th>
                    <th scope="col">Security Flag</th>
                    <th scope="col">Flag Reason</th>
                  </tr>
                </thead>
                <tbody>
                  {user.recentLoginHistories.map((r) => (
                    <tr key={r.id}>
                      <td className="text-xs text-slate-600">{date(r.occurredAt)}</td>
                      <td><span className="font-mono text-xs">{r.attemptedEmail}</span></td>
                      <td>
                        <span
                          className={`reference-status ${
                            r.result === "succeeded" ? "active" : "maintenance"
                          }`}
                        >
                          {r.result}
                        </span>
                      </td>
                      <td><span className="font-mono text-xs text-slate-500">{r.ipAddress}</span></td>
                      <td>
                        <span
                          className={`reference-badge ${
                            r.isSuspicious ? "red" : "gray"
                          }`}
                        >
                          {r.isSuspicious ? "Suspicious" : "Normal"}
                        </span>
                      </td>
                      <td className="text-xs text-slate-500">{r.suspiciousReason || "—"}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
