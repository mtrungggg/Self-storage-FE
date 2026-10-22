import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { ArrowLeft, RefreshCw, Trash2, User, Building2, Shield, Calendar, AlertTriangle } from "lucide-react";
import adminUserService from "../api/adminUserService";
import AdminUserStatusForm from "../components/AdminUserStatusForm";
import AdminUserRolesForm from "../components/AdminUserRolesForm";
import AdminStaffAssignmentForm from "../components/AdminStaffAssignmentForm";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";

const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const date = (value) => {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split("-").reverse().join("/");
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormat.format(parsed);
};
const statusLabel = (value) =>
  ({ active: "Hoạt động", disabled: "Vô hiệu hóa", locked: "Đã khóa" }[value] || value);

function Fields({ title, entries, icon: Icon }) {
  return (
    <section className="reference-card mb-5 p-6">
      <div className="reference-card-heading mb-4">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-slate-800 border border-[#ededed]">
              <Icon size={16} />
            </span>
          )}
          <h2>{title}</h2>
        </div>
      </div>
      <dl className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {entries.map(([label, value]) => (
          <div key={label} className="p-3 rounded-2xl bg-white border border-[#ededed]">
            <dt className="text-xs text-[#767679]">{label}</dt>
            <dd className="mt-1 break-words text-sm font-semibold text-[#14121b]">
              {value == null || value === "" ? "—" : value}
            </dd>
          </div>
        ))}
      </dl>
    </section>
  );
}

function TableSection({ title, rows, columns, rowKey, emptyText, icon: Icon }) {
  return (
    <section className="reference-card reference-table-card mb-5">
      <div className="reference-card-heading">
        <div className="flex items-center gap-2.5">
          {Icon && (
            <span className="grid h-8 w-8 place-items-center rounded-xl bg-white text-slate-800 border border-[#ededed]">
              <Icon size={16} />
            </span>
          )}
          <h2>{title}</h2>
        </div>
        <span className="reference-pill">{rows?.length || 0} mục</span>
      </div>
      {!rows?.length ? (
        <p className="py-8 text-center text-xs text-[#767679]">{emptyText}</p>
      ) : (
        <div className="reference-table-scroll">
          <table className="reference-table">
            <thead>
              <tr>
                {columns.map(([label]) => (
                  <th key={label} scope="col">
                    {label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row[rowKey]}>
                  {columns.map(([label, render]) => (
                    <td key={label}>{render(row) ?? "—"}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </section>
  );
}

export default function AdminUserDetail() {
  const { id } = useParams();
  const [attempt, setAttempt] = useState(0);
  const [result, setResult] = useState(null);
  const [savingStatus, setSavingStatus] = useState(false);
  const [savingRoles, setSavingRoles] = useState(false);
  const [savingAssignment, setSavingAssignment] = useState(false);
  const [deletingAssignment, setDeletingAssignment] = useState(null);
  const [deleteMessage, setDeleteMessage] = useState(null);
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
  const error = !validId ? "ID người dùng không hợp lệ." : loading ? "" : result?.error;
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
            error: err.status === 404 ? "Không tìm thấy người dùng này." : err.message || "Không thể tải thông tin người dùng.",
          });
      }
    );
    return () => {
      active = false;
    };
  }, [id, attempt, validId]);

  const customer = user?.customerProfile;
  const employee = user?.employeeProfile;

  async function removeAssignment(assignment) {
    if (deletePending.current || savingStatus || savingRoles || savingAssignment) return;
    if (
      !window.confirm(
        `Xóa phân công tại ${assignment.facilityName || assignment.facilityCode || assignment.facilityId} của ${
          employee?.fullName || employee?.employeeCode
        }?`
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
          text: err.status === 404 ? "Phân công không còn tồn tại. Hãy làm mới danh sách." : err.message || "Không thể xóa phân công.",
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
    setDeleteMessage({ id, error: false, text: "Đã xóa phân công cơ sở thành công." });
    setTimeout(() => setDeleteMessage(null), 3500);
  }

  return (
    <div className="reference-dashboard">
      {/* Top Navigation & Toolbar */}
      <div className="reference-toolbar">
        <div>
          <Link
            to="/admin-users"
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#767679] hover:text-black mb-2 transition"
          >
            <ArrowLeft size={14} /> Quay lại danh sách người dùng
          </Link>
          <div className="flex items-center gap-3">
            <h1>Chi tiết tài khoản</h1>
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
            <RefreshCw size={15} className={loading ? "animate-spin" : ""} />
            Làm mới
          </button>
        </div>
      </div>

      {roleNotice === id && (
        <div role="status" className="mb-5 flex items-center gap-2 rounded-2xl bg-[#e2fff2] px-4 py-3 text-xs font-semibold text-[#173000] border border-[#b3fa65]">
          <span>Đã cập nhật vai trò thành công. Người dùng cần đăng nhập lại để nhận quyền hạn mới.</span>
        </div>
      )}

      {loading && <p className="py-8 text-center text-xs text-[#767679]">Đang tải thông tin người dùng...</p>}

      {error && (
        <div role="alert" className="reference-error mb-5">
          <AlertTriangle size={20} />
          <div>
            <strong>Lỗi tải người dùng</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      {user && (
        <>
          <Fields
            title="Thông tin cơ bản"
            icon={User}
            entries={[
              ["Mã ID tài khoản", `#${user.id}`],
              ["Email đăng nhập", user.email],
              ["Số điện thoại", user.phoneNumber],
              ["Trạng thái tài khoản", statusLabel(user.status)],
              ["Đăng nhập gần nhất", date(user.lastLoginAt)],
              ["Ngày tạo tài khoản", date(user.createdAt)],
              ["Thời gian cập nhật", date(user.updatedAt)],
            ]}
          />

          <AdminUserStatusForm
            key={user.id}
            user={user}
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

          <TableSection
            title="Vai trò và quyền hạn hiện tại"
            icon={Shield}
            rows={user.roles}
            rowKey="roleId"
            emptyText="Chưa có vai trò nào được gán."
            columns={[
              ["Mã vai trò", (r) => <span className="font-mono text-xs">{r.code}</span>],
              ["Tên vai trò", (r) => <span className="font-semibold text-[#14121b]">{r.displayName || r.code}</span>],
              ["Ngày cấp", (r) => date(r.grantedAt)],
              ["Người cấp quyền", (r) => r.grantedByEmail || r.grantedBy || "Hệ thống"],
            ]}
          />

          {customer ? (
            <Fields
              title="Hồ sơ khách hàng (Customer Profile)"
              icon={User}
              entries={[
                ["Họ và tên", customer.fullName],
                ["Số CCCD / CMND", customer.identityNumber],
                ["Ngày sinh", date(customer.dateOfBirth)],
                ["Địa chỉ thường trú", customer.address],
                ["Người liên hệ khẩn cấp", customer.emergencyContactName],
                ["SĐT liên hệ khẩn cấp", customer.emergencyContactPhone],
                ["Ngày tạo hồ sơ", date(customer.createdAt)],
              ]}
            />
          ) : (
            <section className="reference-card mb-5 p-6">
              <div className="reference-card-heading">
                <h2>Hồ sơ khách hàng</h2>
                <span className="reference-pill">Không có</span>
              </div>
              <p className="reference-muted mt-2">Người dùng này chưa có hồ sơ khách hàng thuê kho.</p>
            </section>
          )}

          {employee ? (
            <>
              <Fields
                title="Hồ sơ nhân viên (Employee Profile)"
                icon={Building2}
                entries={[
                  ["Mã nhân viên", employee.employeeCode],
                  ["Họ và tên", employee.fullName],
                  ["Ngày vào làm", date(employee.hireDate)],
                  ["Trạng thái làm việc", statusLabel(employee.employmentStatus)],
                  ["Ngày tạo hồ sơ", date(employee.createdAt)],
                ]}
              />

              <AdminStaffAssignmentForm
                key={`assignment-${user.id}`}
                employee={employee}
                disabled={savingStatus || savingRoles || deletingAssignment !== null}
                onSavingChange={setSavingAssignment}
                onCreated={(assignment) => {
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

              {deleteMessage?.id === id && (
                <div
                  role={deleteMessage.error ? "alert" : "status"}
                  className={`mb-4 flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-semibold ${
                    deleteMessage.error
                      ? "bg-[#fff1f1] text-[#c92a2a] border border-[#fecaca]"
                      : "bg-[#e2fff2] text-[#173000] border border-[#b3fa65]"
                  }`}
                >
                  <span>{deleteMessage.text}</span>
                </div>
              )}

              <TableSection
                title="Phân công cơ sở kho"
                icon={Building2}
                rows={employee.facilityAssignments}
                rowKey="id"
                emptyText="Chưa có phân công cơ sở nào."
                columns={[
                  ["ID", (r) => `#${r.id}`],
                  ["Cơ sở kho", (r) => <strong className="font-semibold text-[#14121b]">{r.facilityName || r.facilityCode}</strong>],
                  ["Mã kho", (r) => <span className="font-mono text-xs">{r.facilityCode || r.facilityId}</span>],
                  ["Vai trò", (r) => <span className="reference-pill !py-0.5 !px-2">{r.assignmentRole}</span>],
                  ["Bắt đầu", (r) => date(r.startsAt)],
                  ["Kết thúc", (r) => date(r.endsAt)],
                  ["Trạng thái", (r) => (
                    <span className={`reference-status ${r.isActive ? "active" : "inactive"}`}>
                      {r.isActive ? "Đang trực" : "Đã kết thúc"}
                    </span>
                  )],
                  [
                    "Thao tác",
                    (r) => (
                      <button
                        type="button"
                        disabled={savingStatus || savingRoles || assignmentBusy}
                        onClick={() => removeAssignment(r)}
                        className="reference-button-danger"
                      >
                        <Trash2 size={12} /> {deletingAssignment === r.id ? "Đang xóa..." : "Xóa"}
                      </button>
                    ),
                  ],
                ]}
              />
            </>
          ) : (
            <section className="reference-card mb-5 p-6">
              <div className="reference-card-heading">
                <h2>Hồ sơ nhân viên</h2>
                <span className="reference-pill">Không có</span>
              </div>
              <p className="reference-muted mt-2">Người dùng này không phải là nhân sự / quản lý cơ sở kho.</p>
            </section>
          )}

          <TableSection
            title="Lịch sử đăng nhập gần đây"
            icon={Calendar}
            rows={user.recentLoginHistories}
            rowKey="id"
            emptyText="Chưa có lịch sử đăng nhập nào."
            columns={[
              ["Thời gian", (r) => date(r.occurredAt)],
              ["Email đăng nhập", (r) => <span className="font-mono text-xs">{r.attemptedEmail}</span>],
              [
                "Kết quả",
                (r) => (
                  <span
                    className={`reference-status ${
                      r.result === "succeeded" ? "active" : "maintenance"
                    }`}
                  >
                    {r.result}
                  </span>
                ),
              ],
              ["Địa chỉ IP", (r) => <span className="font-mono text-xs">{r.ipAddress}</span>],
              [
                "Đáng ngờ",
                (r) => (
                  <span
                    className={`reference-badge ${
                      r.isSuspicious ? "red" : "gray"
                    }`}
                  >
                    {r.isSuspicious ? "Cảnh báo" : "Bình thường"}
                  </span>
                ),
              ],
              ["Lý do cảnh báo", (r) => r.suspiciousReason || "—"],
            ]}
          />
        </>
      )}
    </div>
  );
}
