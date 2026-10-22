import { useRef, useState } from "react";
import { UserPlus, X, CheckCircle2, AlertTriangle } from "lucide-react";
import adminUserService from "../api/adminUserService";

const emptyForm = {
  email: "",
  password: "",
  fullName: "",
  phoneNumber: "",
  role: "facility_staff",
  employeeCode: "",
  hireDate: "",
  initialFacilityId: "",
};

export default function AdminCreateUserForm({ roles, onCreated, open, setOpen }) {
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
      email: form.email.trim(),
      password: form.password,
      fullName: form.fullName.trim(),
      role: form.role,
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
    if (setOpen) setOpen(false);
    setNotice(`Đã tạo người dùng ${payload.email} thành công.`);
    setTimeout(() => setNotice(""), 4000);
    onCreated();
    window.dispatchEvent(new Event("admin-data-changed"));
  }

  if (!open) {
    if (!notice) return null;
    return (
      <div role="status" className="mb-5 flex items-center gap-2 rounded-2xl bg-[#e2fff2] px-4 py-3 text-xs font-semibold text-[#173000] border border-[#b3fa65]">
        <CheckCircle2 size={18} className="text-[#23866a]" />
        <span>{notice}</span>
      </div>
    );
  }

  return (
    <section className="reference-card mb-6 p-6">
      <div className="reference-card-heading mb-4">
        <div>
          <h2>Thêm tài khoản người dùng mới</h2>
          <p className="reference-muted">
            Khởi tạo tài khoản hệ thống cho Quản lý (Manager), Nhân viên (Staff) hoặc Khách hàng.
          </p>
        </div>
        <button
          type="button"
          onClick={() => {
            if (setOpen) setOpen(false);
            setError("");
            setForm({ ...emptyForm });
          }}
          className="reference-pill hover:bg-slate-50 cursor-pointer"
        >
          <X size={13} /> Hủy bỏ
        </button>
      </div>

      {notice && (
        <div role="status" className="mb-4 flex items-center gap-2 rounded-2xl bg-[#e2fff2] px-4 py-3 text-xs font-semibold text-[#173000] border border-[#b3fa65]">
          <CheckCircle2 size={18} className="text-[#23866a]" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="reference-error mb-4">
          <AlertTriangle size={20} />
          <div>
            <strong>Lỗi tạo người dùng</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} aria-busy={saving}>
        <fieldset disabled={saving} className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {[
            ["fullName", "Họ và tên", "text", true, "name"],
            ["email", "Email đăng nhập", "email", true, "off"],
            ["password", "Mật khẩu ban đầu", "password", true, "new-password"],
            ["phoneNumber", "Số điện thoại", "tel", false, "tel"],
          ].map(([key, label, type, required, autoComplete]) => (
            <label key={key} className="block">
              <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
                {label}
                {required && <span className="text-red-500"> *</span>}
              </span>
              <input
                type={type}
                required={required}
                autoComplete={autoComplete}
                value={form[key]}
                onChange={(event) => setForm({ ...form, [key]: event.target.value })}
                className="reference-input"
                placeholder={`Nhập ${label.toLowerCase()}...`}
              />
            </label>
          ))}

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Vai trò tài khoản <span className="text-red-500">*</span>
            </span>
            <select
              required
              value={form.role}
              onChange={(event) => setForm({ ...form, role: event.target.value })}
              className="reference-select"
            >
              {roles.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          {isEmployee && (
            <>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">Mã nhân viên</span>
                <input
                  value={form.employeeCode}
                  onChange={(event) => setForm({ ...form, employeeCode: event.target.value })}
                  className="reference-input"
                  placeholder="VD: NV-102"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">Ngày vào làm</span>
                <input
                  type="date"
                  value={form.hireDate}
                  onChange={(event) => setForm({ ...form, hireDate: event.target.value })}
                  className="reference-input"
                />
              </label>
              <label className="block">
                <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">ID cơ sở kho ban đầu</span>
                <input
                  type="number"
                  min="1"
                  step="1"
                  value={form.initialFacilityId}
                  onChange={(event) => setForm({ ...form, initialFacilityId: event.target.value })}
                  className="reference-input"
                  placeholder="ID cơ sở kho"
                />
              </label>
            </>
          )}
        </fieldset>

        <div className="mt-5 flex items-center justify-end gap-3">
          <button
            type="button"
            onClick={() => {
              if (setOpen) setOpen(false);
              setForm({ ...emptyForm });
            }}
            className="reference-button-secondary"
          >
            Hủy
          </button>
          <button type="submit" disabled={saving} className="reference-button-primary">
            <UserPlus size={15} />
            {saving ? "Đang tạo tài khoản..." : "Xác nhận tạo tài khoản"}
          </button>
        </div>
      </form>
    </section>
  );
}
