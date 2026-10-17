import { useRef, useState } from "react";
import adminUserService from "../api/adminUserService";

const emptyForm = {
  email: "", password: "", fullName: "", phoneNumber: "", role: "facility_staff",
  employeeCode: "", hireDate: "", initialFacilityId: "",
};
const inputClass = "w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm";

export default function AdminCreateUserForm({ roles, onCreated }) {
  const [open, setOpen] = useState(false);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const submitting = useRef(false);
  const isEmployee = form.role !== "storage_customer";

  async function submit(event) {
    event.preventDefault();
    if (submitting.current) return;
    setError("");
    setNotice("");
    if (!form.fullName.trim() || !form.email.trim() || !form.password.trim()) {
      setError("Vui lòng nhập họ tên, email và mật khẩu hợp lệ.");
      return;
    }
    const facilityId = form.initialFacilityId === "" ? null : Number(form.initialFacilityId);
    if (isEmployee && facilityId !== null && (!Number.isSafeInteger(facilityId) || facilityId <= 0)) {
      setError("ID cơ sở phải là số nguyên dương hợp lệ.");
      return;
    }
    const payload = {
      email: form.email.trim(), password: form.password, fullName: form.fullName.trim(), role: form.role,
      ...(form.phoneNumber.trim() ? { phoneNumber: form.phoneNumber.trim() } : {}),
      ...(isEmployee && form.employeeCode.trim() ? { employeeCode: form.employeeCode.trim() } : {}),
      ...(isEmployee && form.hireDate ? { hireDate: form.hireDate } : {}),
      ...(isEmployee && facilityId !== null ? { initialFacilityId: facilityId } : {}),
    };
    submitting.current = true;
    setSaving(true);
    try {
      await adminUserService.createUser(payload);
    } catch (err) {
      setError(err.message || "Không thể tạo người dùng.");
      return;
    } finally {
      submitting.current = false;
      setSaving(false);
    }
    setForm({ ...emptyForm });
    setOpen(false);
    setNotice(`Đã tạo người dùng ${payload.email}.`);
    onCreated();
    window.dispatchEvent(new Event("admin-data-changed"));
  }

  return <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
    <div className="flex items-center justify-between gap-3">
      <h2 className="font-bold">Thêm người dùng</h2>
      <button type="button" disabled={saving} onClick={() => {
        setOpen(!open); setError(""); setNotice(""); setForm({ ...emptyForm });
      }} className="rounded-xl bg-[#eef4ff] px-4 py-2 text-sm font-semibold text-[#1d5fe5] disabled:opacity-50" aria-expanded={open} aria-controls="admin-create-user-form">
        {open ? "Hủy" : "Thêm người dùng"}
      </button>
    </div>
    {notice && <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
    {open && <form id="admin-create-user-form" onSubmit={submit} className="mt-4" aria-busy={saving}>
      <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {[
          ["fullName", "Họ và tên", "text", true, "name"],
          ["email", "Email", "email", true, "off"],
          ["password", "Mật khẩu", "password", true, "new-password"],
          ["phoneNumber", "Số điện thoại", "tel", false, "tel"],
        ].map(([key, label, type, required, autoComplete]) => <label key={key}>
          <span className="mb-1 block text-sm font-semibold">{label}{required ? " *" : ""}</span>
          <input type={type} required={required} autoComplete={autoComplete} value={form[key]} onChange={(event) => setForm({ ...form, [key]: event.target.value })} className={inputClass} />
        </label>)}
        <label><span className="mb-1 block text-sm font-semibold">Vai trò *</span>
          <select required value={form.role} onChange={(event) => setForm({ ...form, role: event.target.value })} className={inputClass}>
            {roles.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        {isEmployee && <>
          <label><span className="mb-1 block text-sm font-semibold">Mã nhân viên</span>
            <input value={form.employeeCode} onChange={(event) => setForm({ ...form, employeeCode: event.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">Ngày vào làm</span>
            <input type="date" value={form.hireDate} onChange={(event) => setForm({ ...form, hireDate: event.target.value })} className={inputClass} />
          </label>
          <label><span className="mb-1 block text-sm font-semibold">ID cơ sở ban đầu</span>
            <input type="number" min="1" step="1" value={form.initialFacilityId} onChange={(event) => setForm({ ...form, initialFacilityId: event.target.value })} className={inputClass} />
          </label>
        </>}
      </fieldset>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={saving} className="mt-4 rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? "Đang tạo..." : "Tạo người dùng"}
      </button>
    </form>}
  </section>;
}
