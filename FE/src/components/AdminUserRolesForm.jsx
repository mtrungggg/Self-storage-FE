import { useEffect, useRef, useState } from "react";
import { AlertTriangle, ShieldCheck } from "lucide-react";
import adminUserService from "../api/adminUserService";
import { ROLE_OPTIONS as roleOptions } from "../constants/roles";

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
    <section className="reference-card mb-5 p-6">
      <div className="reference-card-heading mb-4">
        <div>
          <h2>Manage System Roles &amp; Permissions</h2>
          <p className="reference-muted">
            Select the roles to grant for this account. Uncheck to revoke system access permissions.
          </p>
        </div>
      </div>

      {error && (
        <div role="alert" className="reference-error mb-4">
          <AlertTriangle size={20} />
          <div>
            <strong>Role Update Error</strong>
            <p>{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} aria-busy={saving}>
        <fieldset disabled={saving || disabled} className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <legend className="sr-only">User Roles</legend>
          {options.map(([code, label]) => {
            const isChecked = selected.includes(code);
            return (
              <label
                key={code}
                className={`flex items-center gap-3 p-3.5 rounded-2xl border transition-all cursor-pointer ${
                  isChecked
                    ? "bg-[#fff] border-[#171717] shadow-2xs"
                    : "bg-[#fafafa] border-[#e5e5e5] hover:bg-[#fff]"
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
                  className="h-4 w-4 rounded accent-black"
                />
                <div>
                  <span className="block text-xs font-semibold text-[#14121b]">{label}</span>
                  <span className="block font-mono text-[10px] text-[#767679]">{code}</span>
                </div>
              </label>
            );
          })}
        </fieldset>

        <div className="mt-5 flex items-center justify-between border-t border-[#ededed] pt-4">
          <span className="text-xs text-[#767679]">
            {changed ? "Unsaved role modifications pending." : "No role changes pending."}
          </span>
          <button
            type="submit"
            disabled={saving || disabled || !changed}
            className="reference-button-primary"
          >
            <ShieldCheck size={15} />
            {saving ? "Saving..." : "Save Role Changes"}
          </button>
        </div>
      </form>
    </section>
  );
}
