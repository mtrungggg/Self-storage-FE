import { useState } from "react";
import apiClient from "../api/apiClient";
import { useLanguage } from "../context/LanguageContext";

export default function ReportCheckInIssueModal({ target, isOpen, onClose, onSuccess, isStaff = true }) {
  const { t, translateStatus } = useLanguage();
  const [description, setDescription] = useState("");
  const [selectedPreset, setSelectedPreset] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [successMsg, setSuccessMsg] = useState("");

  const PRESET_ISSUES = [
    t("staff_inspections.cleanliness_bad", "Cleanliness / Debris"),
    t("staff_inspections.door_lock_bad", "Door lock / Latch issue"),
    t("status.needs_repair", "Needs Repair"),
    t("checkin.severity_high", "Severe Issue"),
  ];

  if (!isOpen || !target) return null;

  function handleSelectPreset(preset) {
    setSelectedPreset(preset);
    setDescription((prev) => (prev ? `${prev}\n- ${preset}` : preset));
    setError("");
  }

  async function handleSubmit(e) {
    e.preventDefault();
    if (!description.trim()) {
      setError(t("common.required", "Please enter description"));
      return;
    }

    setSubmitting(true);
    setError("");

    try {
      if (isStaff) {
        const payload = {
          facilityId: Number(target.facilityId || 1),
          agreementId: target.agreementId || null,
          storageUnitId: target.storageUnitId || target.unitId || null,
          unitCode: target.unitCode || "",
          agreementNo: target.agreementNo || target.currentAgreementNo || "",
          customerName: target.customerName || "",
          description: description.trim(),
          priority: "urgent",
        };
        const res = await apiClient.post("/staff/tickets", payload);
        if (res?.success === false) {
          throw new Error(res?.message || t("common.error", "Error"));
        }
      } else {
        const payload = {
          facilityId: Number(target.facilityId || 1),
          agreementId: target.agreementId || null,
          storageUnitId: target.storageUnitId || null,
          subject: `[Check-in] ${target.unitCode || "Unit"}`,
          category: "unit",
          priority: "urgent",
          description: description.trim(),
        };
        const res = await apiClient.post("/customer/support-tickets", payload);
        if (res?.success === false) {
          throw new Error(res?.message || t("common.error", "Error"));
        }
      }

      setSuccessMsg(t("checkin.report_sent", "Report submitted"));
      if (onSuccess) {
        onSuccess(target);
      }
      setTimeout(() => {
        setSuccessMsg("");
        onClose();
      }, 1200);
    } catch (err) {
      setError(
        err?.response?.data?.message ||
        err?.response?.data?.errors?.[0] ||
        err.message ||
        t("common.error", "Error submitting report")
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="report-issue-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs"
    >
      <div className="relative w-full max-w-lg rounded-2xl bg-white p-6 shadow-2xl border border-slate-100 max-h-[92vh] overflow-y-auto">
        <div className="flex items-start justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-rose-100 text-rose-600">
              <span className="material-symbols-outlined text-[20px]">report_problem</span>
            </span>
            <div>
              <h2 id="report-issue-modal-title" className="text-base font-bold text-slate-900">
                {t("checkin.title", "Report Check-in Issue")}
              </h2>
            </div>
          </div>
          <button
            type="button"
            disabled={submitting}
            onClick={onClose}
            className="rounded-lg p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition cursor-pointer"
          >
            <span className="material-symbols-outlined text-[20px]">close</span>
          </button>
        </div>

        <div className="mt-3.5 rounded-xl border border-amber-200 bg-amber-50/60 p-3 text-xs space-y-1">
          <div className="flex items-center justify-between">
            <span className="text-amber-900 font-semibold">
              {t("common.unit", "Unit")}: <strong className="text-slate-900 text-sm">{target.unitCode || "—"}</strong>
            </span>
            <span className="inline-flex items-center gap-1 rounded-full bg-rose-100 px-2 py-0.5 font-bold text-rose-700 text-[10px] uppercase">
              {t("status.urgent", "Urgent")}
            </span>
          </div>
        </div>

        {successMsg && (
          <div className="mt-3 rounded-xl border border-emerald-300 bg-emerald-50 p-3 text-xs text-emerald-900 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-emerald-600 text-[20px]">check_circle</span>
            <span>{successMsg}</span>
          </div>
        )}

        {error && (
          <div className="mt-3 rounded-xl border border-rose-300 bg-rose-50 p-3 text-xs text-rose-900 font-bold flex items-center gap-2">
            <span className="material-symbols-outlined text-rose-600 text-[20px]">error</span>
            <span>{error}</span>
          </div>
        )}

        <form onSubmit={handleSubmit} className="mt-3.5 space-y-3.5">
          <div>
            <div className="flex flex-wrap gap-1.5">
              {PRESET_ISSUES.map((preset) => (
                <button
                  key={preset}
                  type="button"
                  onClick={() => handleSelectPreset(preset)}
                  className={`rounded-lg border px-2.5 py-1 text-[11px] font-medium transition cursor-pointer ${
                    selectedPreset === preset
                      ? "border-rose-400 bg-rose-50 text-rose-700 font-bold"
                      : "border-slate-200 bg-slate-50 text-slate-700 hover:bg-slate-100"
                  }`}
                >
                  + {preset}
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-slate-800 uppercase tracking-wide mb-1">
              {t("common.details", "Details")} *
            </label>
            <textarea
              id="report-issue-description"
              rows={3}
              required
              value={description}
              onChange={(e) => {
                setDescription(e.target.value);
                setError("");
              }}
              placeholder={t("checkin.defect_desc", "Describe issue...")}
              className="w-full rounded-xl border border-slate-200 bg-slate-50/50 p-3 text-xs text-slate-900 outline-none focus:border-rose-500 focus:bg-white"
            />
          </div>

          <div className="flex items-center justify-end gap-2 border-t border-slate-100 pt-3">
            <button
              type="button"
              disabled={submitting}
              onClick={onClose}
              className="rounded-lg border border-slate-200 bg-white px-3.5 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-50 transition"
            >
              {t("common.cancel", "Cancel")}
            </button>
            <button
              id="btn-submit-report-issue"
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-1.5 rounded-lg bg-rose-600 hover:bg-rose-700 px-4 py-2 text-xs font-bold text-white shadow-xs transition disabled:opacity-50 cursor-pointer"
            >
              <span className="material-symbols-outlined text-[16px]">send</span>
              <span>{submitting ? t("common.loading", "Sending...") : t("common.submit", "Submit")}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
