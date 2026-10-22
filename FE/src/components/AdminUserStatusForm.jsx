import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import adminUserService from "../api/adminUserService";

const statuses = [
  ["active", "Hoạt động"],
  ["disabled", "Vô hiệu hóa"],
  ["locked", "Đã khóa"],
];

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
    return () => {
      mounted.current = false;
    };
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
      if (mounted.current)
        setError(err.status === 404 ? "Không tìm thấy người dùng này." : err.message || "Không thể cập nhật trạng thái.");
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
      setNotice("Đã cập nhật trạng thái người dùng thành công.");
      setTimeout(() => setNotice(""), 3500);
      onUpdated(updated);
    }
  }

  return (
    <section className="reference-card mb-5 p-6">
      <div className="reference-card-heading mb-4">
        <div>
          <h2>Quản lý trạng thái tài khoản</h2>
          <p className="reference-muted">Khóa hoặc mở khóa quyền truy cập hệ thống của người dùng này.</p>
        </div>
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
            <strong>Lỗi cập nhật</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">Trạng thái mới</span>
            <select
              value={status}
              disabled={disabled || saving}
              onChange={(e) => setStatus(e.target.value)}
              className="reference-select"
            >
              {statuses.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">Lý do thay đổi (ghi chú)</span>
            <input
              type="text"
              value={reason}
              disabled={disabled || saving}
              onChange={(e) => setReason(e.target.value)}
              placeholder="VD: Theo yêu cầu của quản lý cơ sở..."
              className="reference-input"
            />
          </label>
        </div>

        <div className="flex justify-end">
          <button
            type="submit"
            disabled={disabled || saving || status === user.status}
            className="reference-button-primary"
          >
            {saving ? "Đang lưu..." : "Cập nhật trạng thái"}
          </button>
        </div>
      </form>
    </section>
  );
}
