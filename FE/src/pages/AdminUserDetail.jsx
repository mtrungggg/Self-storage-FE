import { useEffect, useRef, useState } from "react";
import { Link, useParams } from "react-router-dom";
import adminUserService from "../api/adminUserService";
import AdminUserStatusForm from "../components/AdminUserStatusForm";
import AdminUserRolesForm from "../components/AdminUserRolesForm";
import AdminStaffAssignmentForm from "../components/AdminStaffAssignmentForm";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";

const sectionClass = "mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm";
const dateFormat = new Intl.DateTimeFormat("vi-VN", { dateStyle: "short", timeStyle: "short" });
const date = (value) => {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value.split("-").reverse().join("/");
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormat.format(parsed);
};
const statusLabel = (value) => ({ active: "Hoạt động", disabled: "Vô hiệu hóa", locked: "Đã khóa" })[value] || value;

function Fields({ title, entries }) {
  return <section className={sectionClass}>
    <h2 className="font-bold">{title}</h2>
    <dl className="mt-4 grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {entries.map(([label, value]) => <div key={label}>
        <dt className="text-sm text-[#58657a]">{label}</dt>
        <dd className="mt-1 break-words text-sm font-semibold">{value == null || value === "" ? "—" : value}</dd>
      </div>)}
    </dl>
  </section>;
}

function TableSection({ title, rows, columns, rowKey, emptyText }) {
  return <section className={sectionClass}>
    <h2 className="font-bold">{title}</h2>
    {!rows?.length ? <p className="mt-4 text-sm text-[#58657a]">{emptyText}</p> : <div className="mt-4 overflow-x-auto">
      <table className="w-full text-left text-sm">
        <thead><tr className="border-b text-[#58657a]">{columns.map(([label]) => <th key={label} scope="col" className="whitespace-nowrap p-3">{label}</th>)}</tr></thead>
        <tbody>{rows.map((row) => <tr key={row[rowKey]} className="border-b border-[#eef1f8]">
          {columns.map(([label, render]) => <td key={label} className="min-w-32 p-3 [overflow-wrap:anywhere]">{render(row) ?? "—"}</td>)}
        </tr>)}</tbody>
      </table>
    </div>}
  </section>;
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
    return () => { activeUser.current = null; };
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
      (data) => { if (active) setResult({ id, attempt, data }); },
      (err) => { if (active) setResult({ id, attempt, error: err.status === 404 ? "Không tìm thấy người dùng này." : err.message || "Không thể tải thông tin người dùng." }); },
    );
    return () => { active = false; };
  }, [id, attempt, validId]);

  const customer = user?.customerProfile;
  const employee = user?.employeeProfile;
  async function removeAssignment(assignment) {
    if (deletePending.current || savingStatus || savingRoles || savingAssignment) return;
    if (!window.confirm(`Xóa phân công tại ${assignment.facilityName || assignment.facilityCode || assignment.facilityId} của ${employee.fullName || employee.employeeCode}?`)) return;
    deletePending.current = true;
    setDeletingAssignment(assignment.id);
    setDeleteMessage(null);
    try {
      await adminStaffAssignmentService.remove(assignment.id);
    } catch (err) {
      if (activeUser.current === id) setDeleteMessage({ id, error: true, text: err.status === 404 ? "Phân công không còn tồn tại. Hãy làm mới danh sách." : err.message || "Không thể xóa phân công." });
      return;
    } finally {
      deletePending.current = false;
      if (activeUser.current === id) setDeletingAssignment(null);
    }
    window.dispatchEvent(new Event("admin-data-changed"));
    if (activeUser.current !== id) return;
    setResult((current) => current?.id === id && current.data?.employeeProfile ? {
      ...current, data: { ...current.data, employeeProfile: {
        ...current.data.employeeProfile,
        facilityAssignments: (current.data.employeeProfile.facilityAssignments || []).filter((item) => item.id !== assignment.id),
      } },
    } : current);
    setDeleteMessage({ id, error: false, text: "Đã xóa phân công cơ sở." });
  }
  return <div className="mx-auto max-w-[1400px]">
    <Link to="/admin-users" className="text-sm font-semibold text-[#1d5fe5] hover:underline">← Danh sách người dùng</Link>
    <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
      <h1 className="text-2xl font-bold">Chi tiết người dùng</h1>
      <button type="button" disabled={loading || !validId || savingStatus || savingRoles || assignmentBusy} onClick={() => { setDeleteMessage(null); setAttempt((value) => value + 1); }} className="rounded-xl bg-[#1d5fe5] px-4 py-2 text-sm font-semibold text-white disabled:opacity-50">{error ? "Thử lại" : "Làm mới"}</button>
    </div>
    {roleNotice === id && <p role="status" className="mt-5 rounded-xl bg-green-50 p-3 text-sm text-green-800">Đã cập nhật vai trò. Người dùng cần đăng nhập lại để nhận quyền mới.</p>}
    {loading && <p role="status" className="mt-5 text-sm text-[#58657a]">Đang tải thông tin người dùng...</p>}
    {error && <p role="alert" className="mt-5 rounded-xl bg-red-50 p-4 text-sm text-red-700">{error}</p>}
    {user && <>
      <Fields title="Thông tin tài khoản" entries={[
        ["ID", user.id], ["Email", user.email], ["Số điện thoại", user.phoneNumber],
        ["Trạng thái", statusLabel(user.status)], ["Đăng nhập gần nhất", date(user.lastLoginAt)],
        ["Ngày tạo", date(user.createdAt)], ["Cập nhật", date(user.updatedAt)],
      ]} />
      <AdminUserStatusForm key={user.id} user={user} disabled={savingRoles || assignmentBusy} onSavingChange={setSavingStatus} onUpdated={(updated) => {
        // The status endpoint returns a list DTO; preserve the detailed profiles and role objects.
        setResult((current) => current?.id === id && String(updated.id) === String(user.id) ? {
          ...current, data: { ...current.data, status: updated.status, updatedAt: updated.updatedAt ?? current.data.updatedAt },
        } : current);
      }} />
      <AdminUserRolesForm key={`roles-${user.id}`} user={user} disabled={savingStatus || assignmentBusy} onSavingChange={setSavingRoles} onUpdated={() => {
        setRoleNotice(id);
        setAttempt((value) => value + 1);
      }} />
      <TableSection title="Vai trò và quyền" rows={user.roles} rowKey="roleId" emptyText="Chưa có vai trò." columns={[
        ["ID vai trò", (r) => r.roleId], ["Vai trò", (r) => r.displayName || r.code], ["Mã vai trò", (r) => r.code],
        ["Ngày cấp", (r) => date(r.grantedAt)], ["Người cấp", (r) => r.grantedByEmail || r.grantedBy],
      ]} />
      {customer ? <Fields title="Hồ sơ khách hàng" entries={[
        ["Họ và tên", customer.fullName], ["Số giấy tờ tùy thân", customer.identityNumber],
        ["Ngày sinh", date(customer.dateOfBirth)], ["Địa chỉ", customer.address],
        ["Liên hệ khẩn cấp", customer.emergencyContactName], ["SĐT khẩn cấp", customer.emergencyContactPhone],
        ["Ngày tạo hồ sơ", date(customer.createdAt)],
      ]} /> : <section className={sectionClass}><h2 className="font-bold">Hồ sơ khách hàng</h2><p className="mt-3 text-sm text-[#58657a]">Chưa có hồ sơ khách hàng.</p></section>}
      {employee ? <>
        <Fields title="Hồ sơ nhân viên" entries={[
          ["Mã nhân viên", employee.employeeCode], ["Họ và tên", employee.fullName],
          ["Ngày vào làm", date(employee.hireDate)], ["Trạng thái làm việc", statusLabel(employee.employmentStatus)],
          ["Ngày tạo hồ sơ", date(employee.createdAt)],
        ]} />
        <AdminStaffAssignmentForm key={`assignment-${user.id}`} employee={employee} disabled={savingStatus || savingRoles || deletingAssignment !== null} onSavingChange={setSavingAssignment} onCreated={(assignment) => {
          setResult((current) => current?.id === id && current.data?.employeeProfile ? {
            ...current, data: { ...current.data, employeeProfile: {
              ...current.data.employeeProfile,
              facilityAssignments: [...(current.data.employeeProfile.facilityAssignments || []).filter((item) => item.id !== assignment.id), assignment],
            } },
          } : current);
        }} />
        {deleteMessage?.id === id && <p role={deleteMessage.error ? "alert" : "status"} className={`mt-4 rounded-xl p-3 text-sm ${deleteMessage.error ? "bg-red-50 text-red-700" : "bg-green-50 text-green-800"}`}>{deleteMessage.text}</p>}
        <TableSection title="Phân công cơ sở" rows={employee.facilityAssignments} rowKey="id" emptyText="Chưa có phân công cơ sở." columns={[
          ["ID", (r) => r.id], ["Nhân viên", (r) => r.employeeName || r.employeeCode || r.employeeId],
          ["Cơ sở", (r) => r.facilityName], ["Mã cơ sở", (r) => r.facilityCode || r.facilityId],
          ["Vai trò phân công", (r) => r.assignmentRole], ["Bắt đầu", (r) => date(r.startsAt)],
          ["Kết thúc", (r) => date(r.endsAt)], ["Người phân công", (r) => r.assignedByEmail || r.assignedBy],
          ["Ngày tạo", (r) => date(r.createdAt)], ["Trạng thái", (r) => r.isActive ? "Đang hiệu lực" : "Không hiệu lực"],
          ["Thao tác", (r) => <button type="button" disabled={savingStatus || savingRoles || assignmentBusy} onClick={() => removeAssignment(r)} aria-label={`Xóa phân công ${r.facilityName || r.facilityCode || r.id}`} className="rounded-lg bg-red-50 px-3 py-2 font-semibold text-red-700 disabled:opacity-50">{deletingAssignment === r.id ? "Đang xóa..." : "Xóa"}</button>],
        ]} />
      </> : <section className={sectionClass}><h2 className="font-bold">Hồ sơ nhân viên</h2><p className="mt-3 text-sm text-[#58657a]">Chưa có hồ sơ nhân viên.</p></section>}
      <TableSection title="Lịch sử đăng nhập gần đây" rows={user.recentLoginHistories} rowKey="id" emptyText="Chưa có lịch sử đăng nhập." columns={[
        ["Thời gian", (r) => date(r.occurredAt)], ["Email đăng nhập", (r) => r.attemptedEmail],
        ["Kết quả", (r) => r.result], ["Địa chỉ IP", (r) => r.ipAddress], ["Trình duyệt / thiết bị", (r) => r.userAgent],
        ["Đáng ngờ", (r) => <span className={r.isSuspicious ? "font-semibold text-red-700" : "text-[#58657a]"}>{r.isSuspicious ? "Có" : "Không"}</span>],
        ["Lý do", (r) => r.suspiciousReason || "—"],
      ]} />
    </>}
  </div>;
}
