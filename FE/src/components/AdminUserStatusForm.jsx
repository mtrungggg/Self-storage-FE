import { useEffect, useRef, useState } from "react";
import adminUserService from "../api/adminUserService";

const statuses = [["active", "Hoạt động"], ["disabled", "Vô hiệu hóa"], ["locked", "Đã khóa"]];

export default function AdminUserStatusForm({ user, onUpdated, onSavingChange, disabled = false }) {
  const [status, setStatus] = useState(user.status);
  const [reason, setReason] = useState("");
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
    if (disabled || submitting.current || status === user.status) return;
    submitting.current = true;
    setSaving(true);
    onSavingChange(true);
    setError("");
    setNotice("");
    let updated;
    try {
      updated = await adminUserService.updateStatus(user.id, { status, reason: reason.trim() });
    } catch (err) {
      if (mounted.current) setError(err.status === 404 ? "Không tìm thấy người dùng này." : err.message || "Không thể cập nhật trạng thái.");
      return;
    } finally {
      submitting.current = false;
      if (mounted.current) {
        setSaving(false);
        onSavingChange(false);
      }
    }
    window.dispatchEvent(new Event("admin-data-changed"));
    if (mounted.current) {
      setStatus(updated.status);
      setReason("");
      setNotice("Đã cập nhật trạng thái người dùng.");
      onUpdated(updated);
    }
  }

  return <section className="mt-5 rounded-2xl border border-[#dfe7f5] bg-white p-5 shadow-sm">
    <h2 className="font-bold">Đổi trạng thái tài khoản</h2>
    <form onSubmit={submit} aria-busy={saving} className="mt-4">
      <fieldset disabled={saving || disabled} className="grid gap-4 sm:grid-cols-2">
        <label><span className="mb-1 block text-sm font-semibold">Trạng thái</span>
          <select required value={status} onChange={(event) => { setStatus(event.target.value); setError(""); setNotice(""); }} className="w-full rounded-xl border border-[#dfe7f5] bg-white px-3 py-2.5 text-sm">
            {!statuses.some(([value]) => value === status) && <option value={status} disabled>{status}</option>}
            {statuses.map(([value, label]) => <option key={value} value={value}>{label}</option>)}
          </select>
        </label>
        <label><span className="mb-1 block text-sm font-semibold">Lý do thay đổi</span>
          <textarea rows={3} value={reason} onChange={(event) => setReason(event.target.value)} className="w-full rounded-xl border border-[#dfe7f5] px-3 py-2.5 text-sm" />
        </label>
      </fieldset>
      {error && <p role="alert" className="mt-3 rounded-xl bg-red-50 p-3 text-sm text-red-700">{error}</p>}
      {notice && <p role="status" className="mt-3 rounded-xl bg-green-50 p-3 text-sm text-green-800">{notice}</p>}
      <button type="submit" disabled={disabled || saving || status === user.status} className="mt-4 rounded-xl bg-[#1d5fe5] px-4 py-2.5 text-sm font-semibold text-white disabled:opacity-50">
        {saving ? "Đang lưu..." : "Lưu trạng thái"}
      </button>
    </form>
  </section>;
}
