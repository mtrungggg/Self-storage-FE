import { useEffect, useRef, useState } from "react";
import { Plus, CheckCircle2, AlertTriangle } from "lucide-react";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";
import { USER_ROLES } from "../constants/roles";

const emptyForm = { facilityId: "", assignmentRole: USER_ROLES.FACILITY_STAFF, startsAt: "", endsAt: "" };

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
      setError("Facility ID must be a valid positive integer.");
      return;
    }
    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      setError("Please provide a valid date and time.");
      return;
    }
    if (endsAt && endsAt <= startsAt) {
      setError("End date must be later than start date.");
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
      if (mounted.current) setError(err.message || "Failed to create facility assignment.");
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
      setNotice("Assigned employee to facility successfully.");
      setTimeout(() => setNotice(""), 3500);
      onCreated(assignment);
    }
  }

  return (
    <section className="reference-card mb-5 p-6">
      <div className="reference-card-heading mb-4">
        <div>
          <h2>Assign Facility Branch</h2>
          <p className="reference-muted">Assign a physical storage facility branch and operational shift schedule for this employee.</p>
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
            <strong>Assignment Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-4">
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Facility ID <span className="text-red-500">*</span>
            </span>
            <input
              type="number"
              min="1"
              step="1"
              required
              disabled={disabled || saving}
              value={form.facilityId}
              onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
              placeholder="e.g. 1, 2, 3..."
              className="reference-input"
            />
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">Operational Role</span>
            <select
              value={form.assignmentRole}
              disabled={disabled || saving}
              onChange={(e) => setForm({ ...form, assignmentRole: e.target.value })}
              className="reference-select"
            >
              <option value={USER_ROLES.FACILITY_STAFF}>Facility Staff</option>
              <option value={USER_ROLES.FACILITY_MANAGER}>Facility Manager</option>
            </select>
          </label>

          <label className="block">
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">
              Start Date &amp; Time <span className="text-red-500">*</span>
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
            <span className="mb-1.5 block text-xs font-semibold text-[#25232c]">End Date &amp; Time (Optional)</span>
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
            {saving ? "Assigning..." : "Create Facility Assignment"}
          </button>
        </div>
      </form>
    </section>
  );
}
