import { useEffect, useRef, useState } from "react";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";

const emptyForm = { facilityId: "", assignmentRole: "facility_staff", startsAt: "", endsAt: "" };
const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm";

export default function AdminStaffAssignmentForm({ employee, disabled, onSavingChange, onCreated }) {
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const submitting = useRef(false);
  const mounted = useRef(true);
  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (disabled || submitting.current) return;
    setError(""); setNotice("");
    const facilityId = Number(form.facilityId);
    const startsAt = new Date(form.startsAt);
    const endsAt = form.endsAt ? new Date(form.endsAt) : null;
    if (!Number.isSafeInteger(facilityId) || facilityId <= 0) {
      setError("ID cơ sở phải là số nguyên dương hợp lệ."); return;
    }
    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      setError("Vui lòng nhập thời gian hợp lệ."); return;
    }
    if (endsAt && endsAt <= startsAt) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu."); return;
    }
    submitting.current = true; setSaving(true); onSavingChange(true);
    let assignment;
    try {
      assignment = await adminStaffAssignmentService.create({
        employeeId: employee.userId, facilityId, assignmentRole: form.assignmentRole,
        startsAt: startsAt.toISOString(), endsAt: endsAt ? endsAt.toISOString() : null,
      });
    } catch (err) {
      if (mounted.current) setError(err.message || "Không thể tạo phân công.");
      return;
    } finally {
      submitting.current = false;
      if (mounted.current) { setSaving(false); onSavingChange(false); }
    }
    window.dispatchEvent(new Event("admin-data-changed"));
    if (mounted.current) {
      setForm({ ...emptyForm }); setNotice("Đã tạo phân công cơ sở."); onCreated(assignment);
    }
  }

  return <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
    <h2 className="font-bold">Thêm phân công cơ sở</h2>
    <p className="mt-1 text-sm text-[#58657a]">Nhân viên: {employee.fullName || employee.employeeCode} (ID: {employee.userId}). Thời gian theo múi giờ thiết bị ({Intl.DateTimeFormat().resolvedOptions().timeZone}).</p>
    <form onSubmit={submit} aria-busy={saving} className="mt-4">
      <fieldset disabled={disabled || saving} className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-1 block text-sm font-semibold">ID cơ sở *</span>
          <input type="number" min="1" step="1" required value={form.facilityId} onChange={(e) => setForm({ ...form, facilityId: e.target.value })} className={inputClass} />
        </label>
        <label><span className="mb-1 block text-sm font-semibold">Vai trò phân công *</span>
          <select value={form.assignmentRole} onChange={(e) => setForm({ ...form, assignmentRole: e.target.value })} className={inputClass}>
            <option value="facility_staff">Nhân viên kho</option><option value="facility_manager">Quản lý kho</option>
          </select>
        </label>
        <label><span className="mb-1 block text-sm font-semibold">Bắt đầu *</span>
          <input type="datetime-local" required value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} className={inputClass} />
        </label>
        <label><span className="mb-1 block text-sm font-semibold">Kết thúc (để trống nếu không có)</span>
          <input type="datetime-local" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} className={inputClass} />
        </label>
      </fieldset>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      <button type="submit" disabled={disabled || saving} className="mt-4 rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Tạo phân công"}</button>
    </form>
  </section>;
}
