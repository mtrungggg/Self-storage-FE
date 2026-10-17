import { useEffect, useRef, useState } from "react";
import adminUserService from "../api/adminUserService";

const roleOptions = [
  ["storage_customer", "Khách hàng"], ["facility_staff", "Nhân viên kho"],
  ["facility_manager", "Quản lý kho"], ["business_operations_manager", "Quản lý vận hành"],
  ["system_administrator", "Quản trị viên"],
];

export default function AdminUserRolesForm({ user, disabled, onSavingChange, onUpdated }) {
  const original = (user.roles || []).map((role) => role.code);
  const [selected, setSelected] = useState(original);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const mounted = useRef(true);
  const changed = selected.length !== original.length || selected.some((role) => !original.includes(role));
  const options = [...roleOptions, ...original.filter((code) => !roleOptions.some(([value]) => value === code)).map((code) => [code, code])];

  useEffect(() => {
    mounted.current = true;
    return () => { mounted.current = false; };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (disabled || submitting.current || !changed) return;
    submitting.current = true;
    setSaving(true);
    onSavingChange(true);
    setError("");
    try {
      await adminUserService.updateRoles(user.id, selected);
    } catch (err) {
      if (mounted.current) setError(err.status === 404 ? "Không tìm thấy người dùng này." : err.message || "Không thể cập nhật vai trò.");
      return;
    } finally {
      submitting.current = false;
      if (mounted.current) { setSaving(false); onSavingChange(false); }
    }
    window.dispatchEvent(new Event("admin-data-changed"));
    if (mounted.current) onUpdated();
  }

  return <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
    <h2 className="font-bold">Cập nhật vai trò</h2>
    <p className="mt-1 text-sm text-[#58657a]">Chọn các vai trò cần giữ hoặc cấp cho tài khoản. Bỏ chọn để thu hồi vai trò.</p>
    <form onSubmit={submit} className="mt-4" aria-busy={saving}>
      <fieldset disabled={saving || disabled} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
        <legend className="sr-only">Vai trò người dùng</legend>
        {options.map(([code, label]) => <label key={code} className="flex items-center gap-3 rounded-xl border border-[#dfe7f5] p-3 text-sm">
          <input type="checkbox" checked={selected.includes(code)} onChange={(event) => {
            setSelected((current) => event.target.checked ? [...current, code] : current.filter((role) => role !== code));
            setError("");
          }} className="h-4 w-4 accent-[#1d5fe5]" />{label}
        </label>)}
      </fieldset>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      <button type="submit" disabled={disabled || saving || !changed} className="mt-4 rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">{saving ? "Đang lưu..." : "Lưu vai trò"}</button>
    </form>
  </section>;
}
