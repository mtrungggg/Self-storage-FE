import { useLanguage } from "../context/LanguageContext";
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

export default function AdminUserRolesForm({
 user, disabled, onSavingChange, onUpdated }) {
  const { t } = useLanguage();
  const original = (user.roles || []).map((role) => role.code);
  const [selectedRole, setSelectedRole] = useState(original[0] || "storage_customer");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const submitting = useRef(false);
  const mounted = useRef(true);
  const changed = selectedRole !== original[0] || original.length !== 1;
  const options = [
    ...roleOptions.filter(([value]) => value !== "business_operations_manager"),
    ...original.filter((code) => !roleOptions.some(([value]) => value === code) && code !== "business_operations_manager").map((code) => [code, code]),
  ];

  useEffect(() => {
    mounted.current = true;
    return () => {
      mounted.current = false;
    };
  }, []);

  async function submit(event) {
    event.preventDefault();
    if (disabled || submitting.current || !changed || !selectedRole) return;
    submitting.current = true;
    setSaving(true);
    onSavingChange(true);
    setError("");
    try {
      await adminUserService.updateRoles(user.id, [selectedRole]);
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
          <h2>{t("admin.manage_roles", "Manage System Roles & Permissions")}</h2>
          <p className="reference-muted">
            {t("admin.user_roles_desc", "Mỗi tài khoản chỉ được gán một vai trò duy nhất trong hệ thống.")}
          </p>
        </div>
      </div>

      {original.length > 1 && (
        <div className="mb-4 rounded-xl bg-amber-50 border border-amber-200 p-3 text-xs text-amber-800 flex items-center gap-2.5">
          <AlertTriangle size={16} className="shrink-0 text-amber-600" />
          <span>
            Tài khoản này hiện đang có <strong>nhiều vai trò</strong> ({original.join(", ")}). Vui lòng chọn <strong>1 vai trò duy nhất</strong> bên dưới và bấm <strong>Save Role Changes</strong> để chuẩn hóa.
          </span>
        </div>
      )}

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
        <fieldset disabled={saving || disabled} className="grid gap-2.5 sm:grid-cols-2 xl:grid-cols-4">
          <legend className="sr-only">User Roles</legend>
          {options.map(([code, label]) => {
            const isSelected = selectedRole === code;
            const assignedRole = (user.roles || []).find((r) => r.code === code);
            return (
              <label
                key={code}
                className={`flex items-start gap-3 p-3.5 rounded-xl border transition-all cursor-pointer relative ${
                  isSelected
                    ? "bg-blue-50/70 border-blue-600 shadow-sm ring-2 ring-blue-500/20"
                    : "bg-white border-slate-200 hover:bg-slate-50 hover:border-slate-300"
                }`}
              >
                <input
                  type="radio"
                  name="userRole"
                  value={code}
                  checked={isSelected}
                  onChange={() => setSelectedRole(code)}
                  className="mt-0.5 h-4 w-4 border-slate-300 text-blue-600 focus:ring-blue-500"
                />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center justify-between gap-1">
                    <span className="block text-xs font-bold text-slate-900">{label}</span>
                    {isSelected && (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[9px] font-bold bg-blue-100 text-blue-700">
                        Đang chọn
                      </span>
                    )}
                  </div>
                  <span className="block font-mono text-[10px] text-slate-500 mt-0.5">{code}</span>
                  {assignedRole && (
                    <span className="block text-[10px] text-emerald-700 font-medium mt-1.5">
                      Đã cấp: {formatDate(assignedRole.grantedAt)} bởi {assignedRole.grantedByEmail || assignedRole.grantedBy || "administrator"}
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
