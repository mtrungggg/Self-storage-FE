import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import { Plus, AlertTriangle, X } from "lucide-react";
import adminStaffAssignmentService from "../api/adminStaffAssignmentService";
import adminFacilityService from "../api/adminFacilityService";
import { USER_ROLES } from "../constants/roles";

export default function AdminStaffAssignmentForm({
  employee, userRoles, user, disabled, onSavingChange, onCreated, onClose }) {
  const { t } = useLanguage();
  const [facilityId, setFacilityId] = useState("");
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
          if (list.length > 0 && !facilityId) {
            setFacilityId(String(list[0].id));
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
    const parsedFacilityId = Number(facilityId);
    if (!Number.isSafeInteger(parsedFacilityId) || parsedFacilityId <= 0) {
      setError("Please select a valid facility.");
      return;
    }

    // Auto-resolve role based on existing employee roles (default to Staff or Manager)
    const roleList = userRoles || user?.roles || employee?.roles || [];
    const isManager = roleList.some((r) =>
      String(r?.code || r?.name || r || "").toLowerCase().includes("manager")
    );
    const targetRole = isManager ? USER_ROLES.FACILITY_MANAGER : USER_ROLES.FACILITY_STAFF;
    const targetEmployeeId = employee?.userId || user?.id;

    submitting.current = true;
    setSaving(true);
    onSavingChange(true);
    let assignment;
    try {
      assignment = await adminStaffAssignmentService.create({
        employeeId: targetEmployeeId,
        facilityId: parsedFacilityId,
        assignmentRole: targetRole,
        startsAt: new Date().toISOString(),
        endsAt: null,
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
      onCreated(assignment);
      onClose?.();
    }
  }

  return (
    <div className="mb-4 rounded-xl border border-blue-200 dark:border-blue-900/60 bg-blue-50/40 dark:bg-blue-950/20 p-4">
      <div className="flex items-center justify-between mb-3">
        <h4 className="text-xs font-bold text-slate-900 dark:text-zinc-100 flex items-center gap-1.5">
          <Plus size={14} className="text-blue-600 dark:text-blue-400" />
          {t("admin.assign_facility", "Assign to Facility Branch")}
        </h4>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="text-slate-400 hover:text-slate-700 dark:hover:text-zinc-200 p-1"
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

      <form onSubmit={submit} className="flex flex-col sm:flex-row items-end gap-3">
        <div className="flex-1 w-full">
          <label className="block text-xs font-semibold text-slate-700 dark:text-zinc-300 mb-1">
            Select Facility *
          </label>
          <SelectDropdown
            value={facilityId}
            disabled={disabled || saving || loadingFacilities}
            onChange={(e) => setFacilityId(e.target.value)}
            className="reference-select w-full"
          >
            {facilities.map((fac) => (
              <option key={fac.id} value={fac.id}>
                {fac.code} — {fac.name} ({fac.city})
              </option>
            ))}
          </SelectDropdown>
        </div>

        <div className="flex shrink-0 gap-2">
          {onClose && (
            <button
              type="button"
              disabled={saving}
              onClick={onClose}
              className="rounded-lg border border-slate-300 dark:border-zinc-700 bg-white dark:bg-zinc-800 px-3 py-2 text-xs font-semibold text-slate-700 dark:text-zinc-200 hover:bg-slate-50 dark:hover:bg-zinc-700 transition"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            disabled={disabled || saving || !facilityId}
            className="inline-flex items-center gap-1.5 rounded-lg bg-blue-600 px-4 py-2 text-xs font-semibold text-white shadow-sm hover:bg-blue-700 transition cursor-pointer"
          >
            <Plus size={14} />
            {saving ? "Assigning..." : "Confirm Assignment"}
          </button>
        </div>
      </form>
    </div>
  );
}
