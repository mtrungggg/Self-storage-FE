import { useEffect, useRef, useState } from "react";
import { CheckCircle2, AlertTriangle, ShieldAlert } from "lucide-react";
import adminUserService from "../api/adminUserService";

const statuses = [
  ["active", "Active"],
  ["disabled", "Disabled"],
  ["locked", "Locked"],
];

export default function AdminUserStatusForm({ user, onUpdated, onSavingChange, disabled = false, compact = false }) {
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

  useEffect(() => {
    setStatus(user.status);
  }, [user.status]);

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
        setError(err.status === 404 ? "User not found." : err.message || "Failed to update user status.");
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
      setNotice("User status updated successfully.");
      setTimeout(() => setNotice(""), 3500);
      onUpdated(updated);
    }
  }

  const isChanged = status !== user.status;

  const formBody = (
    <div>
      <div className="flex items-center gap-2 mb-3">
        <ShieldAlert size={16} className="text-blue-600" />
        <h3 className="text-sm font-bold text-slate-900">Account Access &amp; Status</h3>
      </div>

      {notice && (
        <div role="status" className="mb-3 flex items-center gap-2 rounded-lg bg-emerald-50 px-3 py-2 text-xs font-semibold text-emerald-800 border border-emerald-200">
          <CheckCircle2 size={16} className="text-emerald-600 shrink-0" />
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="reference-error mb-3 !p-3">
          <AlertTriangle size={16} className="shrink-0" />
          <div>
            <strong className="text-xs">Status Update Error</strong>
            <p className="text-xs">{error}</p>
          </div>
        </div>
      )}

      <form onSubmit={submit} className="space-y-3">
        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Account Status
          </label>
          <div className="grid grid-cols-3 gap-2">
            {statuses.map(([value, label]) => {
              const isSelected = status === value;
              return (
                <button
                  key={value}
                  type="button"
                  disabled={disabled || saving}
                  onClick={() => setStatus(value)}
                  className={`rounded-lg border py-2 text-xs font-bold transition-all ${
                    isSelected
                      ? value === "active"
                        ? "border-emerald-500 bg-emerald-50 text-emerald-700 ring-2 ring-emerald-200"
                        : value === "locked"
                        ? "border-amber-500 bg-amber-50 text-amber-700 ring-2 ring-amber-200"
                        : "border-slate-500 bg-slate-100 text-slate-800 ring-2 ring-slate-300"
                      : "border-slate-200 bg-white text-slate-600 hover:bg-slate-50"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-700 mb-1">
            Reason / Audit Note {isChanged && <span className="text-blue-600">*</span>}
          </label>
          <input
            type="text"
            value={reason}
            disabled={disabled || saving}
            onChange={(e) => setReason(e.target.value)}
            placeholder="e.g. Security verification, customer request..."
            className="reference-input"
          />
        </div>

        <div className="flex justify-end pt-1">
          <button
            type="submit"
            disabled={disabled || saving || !isChanged}
            className={`inline-flex items-center gap-1.5 rounded-lg px-4 py-2 text-xs font-semibold transition ${
              isChanged
                ? "bg-blue-600 text-white shadow-sm hover:bg-blue-700 cursor-pointer"
                : "bg-slate-100 text-slate-400 cursor-not-allowed"
            }`}
          >
            {saving ? "Saving..." : "Save Status"}
          </button>
        </div>
      </form>
    </div>
  );

  if (compact) {
    return formBody;
  }

  return (
    <section className="reference-card mb-5 p-5">
      {formBody}
    </section>
  );
}
