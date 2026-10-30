import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import adminUserService from "../api/adminUserService";
import { ROLE_OPTIONS as roleOptions } from "../constants/roles";

const dateFormat = new Intl.DateTimeFormat("en-US", { dateStyle: "short", timeStyle: "short" });
const formatDate = (value) => {
  if (!value) return "—";
  if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime()) ? "—" : dateFormat.format(parsed);
};

export default function AdminUserRolesForm({ user, disabled, onSavingChange, onUpdated }) {
  const original = (user.roles || []).map((role) => role.code);
  const [selected, setSelected] = useState(original);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const mounted = useRef(true);
  const changed = selected.length !== original.length || selected.some((role) => !original.includes(role));
  const options = [
    ...roleOptions,
    ...original.filter((code) => !roleOptions.some(([value]) => value === code)).map((code) => [code, code]),
  ];

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
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
      if (mounted.current)
        setError(err.status === 404 ? "User not found." : err.message || "Failed to update roles.");
      return;
    } finally {
      submitting.current = false;
      if (mounted.current) {
        setSaving(false);
        onSavingChange(false);
      }
    }
    window.dispatchEvent(new Event("admin-data-changed"));
    if (mounted.current) onUpdated();
  }

  return (
    <section className="reference-card mb-5 p-5">
      <div className="reference-card-heading mb-3">
        <div>
          <h2>Manage System Roles &amp; Permissions</h2>
          <p className="reference-muted">
            Select the roles to grant for this account. Uncheck to revoke system access permissions.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="reference-error mb-4">
          <AlertTriangle size={18} />
          <div>
            <strong>Role Update Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} aria-busy={saving}>
        <fieldset disabled={saving || disabled} className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-3">
          <legend className="sr-only">User Roles</legend>
          {options.map(([code, label]) => {
            const isChecked = selected.includes(code);
            const assignedRole = (user.roles || []).find((r) => r.code === code);
            return (
              <label
                key={code}
                className={`flex items-start gap-3 p-3 rounded-lg border transition-all cursor-pointer ${
                  isChecked
                    ? "bg-blue-50/50 border-blue-500 shadow-xs ring-1 ring-blue-500/20"
                    : "bg-white border-slate-200 hover:bg-slate-50"
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={(e) => {
                    const next = e.target.checked
                      ? [...selected, code]
                      : selected.filter((item) => item !== code);
                    setSelected(next);
                  }}
                  className="mt-0.5 h-4 w-4 rounded border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="min-w-0 flex-1">
                  <span className="block text-xs font-bold text-slate-900">{label}</span>
                  <span className="block font-mono text-[10px] text-slate-500">{code}</span>
                  {assignedRole && (
                    <span className="block text-[10px] text-blue-700 font-medium mt-1">
                      Granted: {formatDate(assignedRole.grantedAt)} by {assignedRole.grantedByEmail || assignedRole.grantedBy || "administrator"}
                    </span>
                  )}
                </div>
              </label>
            );
          })}
        </fieldset>

        <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-3">
          <span className="text-xs text-slate-500">
            {changed ? "Unsaved role modifications pending." : "No role changes pending."}
          </span>
          <button
            type="submit"
            disabled={saving || disabled || !changed}
            className={`inline-flex items-center gap-1.5 rounded-lg px-3.5 py-1.5 text-xs font-semibold transition ${
              changed
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            <ShieldCheck size={14} />
            {saving ? "Saving..." : "Save Role Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
