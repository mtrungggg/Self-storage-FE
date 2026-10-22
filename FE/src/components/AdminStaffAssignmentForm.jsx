import { useEffect, useRef, useState } from "react";
import { Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";

const emptyForm = { facilityId: "", assignmentRole: "facility_staff", startsAt: "", endsAt: "" };

export default function AdminStaffAssignmentForm({ employee, disabled, onSavingChange, onCreated }) {
  const [form, setForm] = useState(emptyForm);
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
    if (disabled || submitting.current) return;
    setError("");
    setNotice("");
    const facilityId = Number(form.facilityId);
    const startsAt = new Date(form.startsAt);
    const endsAt = form.endsAt ? new Date(form.endsAt) : null;
    if (!Number.isSafeInteger(facilityId) || facilityId <= 0) {
      setError("ID cơ sở phải là số nguyên dương hợp lệ.");
      return;
    }
    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      setError("Vui lòng nhập thời gian hợp lệ.");
      return;
    }
    if (endsAt && endsAt <= startsAt) {
      setError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }
    submitting.current = true;
    setSaving(true);
    onSavingChange(true);
    let assignment;
    try {
      assignment = await adminStaffAssignmentService.create({
        employeeId: employee.userId,
        facilityId,
        assignmentRole: form.assignmentRole,
        startsAt: startsAt.toISOString(),
        endsAt: endsAt ? endsAt.toISOString() : null,
      });
    } catch (err) {
      if (mounted.current) setError(err.message || "Không thể tạo phân công.");
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
      setForm(emptyForm);
      setNotice("Đã phân công nhân viên vào cơ sở kho thành công.");
      setTimeout(() => setNotice(""), 3500);
      onCreated(assignment);
    }
  }

  return (
    <section className="reference-card mb-5 p-6">
      <div className="reference-card-heading mb-4">
        <div>
          <h2>Phân công cơ sở kho mới</h2>
          <p className="reference-muted">Chỉ định điểm kho phụ trách và thời hạn trực cho nhân viên này.</p>
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
            <strong>Lỗi phân công</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              ID cơ sở kho <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="1"
              step="1"
              required
              disabled={disabled || saving}
              value={form.facilityId}
              onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
              placeholder="VD: 1, 2, 3..."
              className="reference-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">Vai trò tại kho</span>
            <select
              value={form.assignmentRole}
              disabled={disabled || saving}
              onChange={(e) => setForm({ ...form, assignmentRole: e.target.value })}
              className="reference-select"
            >
              <option value="facility_staff">Nhân viên kho (Staff)</option>
              <option value="facility_manager">Quản lý kho (Manager)</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Thời gian bắt đầu <span className="text-red-500">*</span>
            </span>
            <input
              type="datetime-local"
              required
              disabled={disabled || saving}
              value={form.startsAt}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="reference-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">Thời gian kết thúc (tùy chọn)</span>
            <input
              type="datetime-local"
              disabled={disabled || saving}
              value={form.endsAt}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              className="reference-input"
            />
          </label>
        </div>

        <div className="flex justify-end pt-2">
          <button type="submit" disabled={disabled || saving} className="reference-button-primary">
            <Plus size={15} />
            {saving ? "Đang phân công..." : "Tạo phân công cơ sở"}
          </button>
        </div>
      </form>
    </section>
  );
}
