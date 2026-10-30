import { useEffect, useRef, useState } from "react";
import { Plus, CheckCircle2, AlertTriangle, X } from "lucide-react";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";
import adminFacilityService from "../api/adminFacilityService";
import { USER_ROLES } from "../constants/roles";

const defaultStartTime = () => {
  const now = new Date();
  return now.toISOString().slice(0, 16);
};

const emptyForm = {
  facilityId: "",
  assignmentRole: USER_ROLES.FACILITY_STAFF,
  startsAt: defaultStartTime(),
  endsAt: "",
};

export default function AdminStaffAssignmentForm({ employee, disabled, onSavingChange, onCreated, onClose }) {
  const [form, setForm] = useState(emptyForm);
  const [facilities, setFacilities] = useState([]);
  const [loadingFacilities, setLoadingFacilities] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const mounted = useRef(true);

  useEffect(() => {
    mounted.current = true;
    setLoadingFacilities(true);
    adminFacilityService.getFacilities({ PageSize: 50 }).then(
      (res) => {
        if (mounted.current) {
          const list = res?.items || [];
          setFacilities(list);
          if (list.length > 0 && !form.facilityId) {
            setForm((prev) => ({ ...prev, facilityId: String(list[0].id) }));
          }
        }
      },
      () => {
        if (mounted.current) setFacilities([]);
      }
    ).finally(() => {
      if (mounted.current) setLoadingFacilities(false);
    });

    return () => {
      mounted.current = false;
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (disabled || submitting.current) return;
    setError("");
    const facilityId = Number(form.facilityId);
    const startsAt = new Date(form.startsAt);
    const endsAt = form.endsAt ? new Date(form.endsAt) : null;
    if (!Number.isSafeInteger(facilityId) || facilityId <= 0) {
      setError("Please select a valid facility.");
      return;
    }
    if (Number.isNaN(startsAt.getTime()) || (endsAt && Number.isNaN(endsAt.getTime()))) {
      setError("Please provide a valid start date and time.");
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
      onCreated(assignment);
      onClose?.();
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-blue-200 bg-blue-50/40 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
          <Plus size={14} className="text-blue-600" />
          Assign to Facility Branch
        </h4>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 p-1"
          >
            <X size={14} />
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="reference-error mb-3 !p-2.5">
          <AlertTriangle size={15} className="shrink-0" />
          <p className="text-xs">{error}</p>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Select Facility *
            </label>
            <select
              value={form.facilityId}
              disabled={disabled || saving || loadingFacilities}
              onChange={(e) => setForm({ ...form, facilityId: e.target.value })}
              className="reference-select"
            >
              {facilities.map((fac) => (
                <option key={fac.id} value={fac.id}>
                  {fac.code} — {fac.name} ({fac.city})
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Assignment Role *
            </label>
            <select
              value={form.assignmentRole}
              disabled={disabled || saving}
              onChange={(e) => setForm({ ...form, assignmentRole: e.target.value })}
              className="reference-select"
            >
              <option value={USER_ROLES.FACILITY_STAFF}>Facility Staff</option>
              <option value={USER_ROLES.FACILITY_MANAGER}>Facility Manager</option>
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              Start Date &amp; Time *
            </label>
            <input
              type="datetime-local"
              value={form.startsAt}
              disabled={disabled || saving}
              onChange={(e) => setForm({ ...form, startsAt: e.target.value })}
              className="reference-input"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-slate-700 mb-1">
              End Date &amp; Time (Optional)
            </label>
            <input
              type="datetime-local"
              value={form.endsAt}
              disabled={disabled || saving}
              onChange={(e) => setForm({ ...form, endsAt: e.target.value })}
              className="reference-input"
            />
          </div>
        </div>

        <div className="flex justify-end gap-2 pt-1">
          {onClose && (
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-300 bg-white px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={disabled || saving || !form.facilityId}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-1.5 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition"
          >
            <Plus size={14} />
            {saving ? "Assigning..." : "Confirm Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
