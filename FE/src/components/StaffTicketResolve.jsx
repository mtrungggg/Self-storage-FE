import { useId, useRef, useState } from "react";
import staffSupportService from "../api/staffSupportService";
import { useLanguage } from "../context/LanguageContext";

export default function StaffTicketResolve({ ticketId, onResolved }) {
  const { t } = useLanguage();
  const fieldId = useId();
  const lock = useRef(false);
  const [resolution, setResolution] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [completedResult, setCompletedResult] = useState(null);

  async function handleSubmit(event) {
    event.preventDefault();
    if (lock.current || completedResult) return;
    setError("");
    if (!resolution.trim()) {
      setError(t("staff.describe_work_required", "Vui lòng mô tả chi tiết công việc đã thực hiện để hoàn tất yêu cầu này."));
      return;
    }
    lock.current = true;
    setSubmitting(true);
    let result = null;
    try {
      result = await staffSupportService.completeTicket(ticketId, {
        resolution: resolution.trim(),
      });
      setCompletedResult(result || { status: "completed" });
    } catch (err) {
      setError(err.message || t("staff.complete_error", "Không thể hoàn tất ticket này. Vui lòng thử lại."));
      lock.current = false;
      setSubmitting(false);
      return;
    }
    setSubmitting(false);
    if (onResolved) {
      onResolved(result);
    }
  }

  return (
    <form onSubmit={handleSubmit} aria-busy={submitting} className="mt-4 border-t border-zinc-200 dark:border-zinc-800 pt-4 text-sm">
      <fieldset disabled={submitting || Boolean(completedResult)} className="space-y-3">
        <div className="flex items-center justify-between">
          <label htmlFor={fieldId} className="block font-semibold text-zinc-900 dark:text-zinc-100">
            {t("staff.complete_ticket_title", "Hoàn tất yêu cầu / Ghi nhận kết quả xử lý *")}
          </label>
        </div>

        <textarea
          id={fieldId}
          rows={3}
          required
          value={resolution}
          onChange={(event) => {
            setResolution(event.target.value);
            setError("");
          }}
          placeholder={t("staff.resolution_placeholder", "Mô tả công việc dọn dẹp, sửa chữa hoặc kiểm tra đã hoàn thành...")}
          className="w-full rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/80 dark:bg-zinc-800/80 p-3 text-xs text-zinc-900 dark:text-zinc-100 outline-none focus:border-zinc-400 focus:ring-2 focus:ring-zinc-900/10 dark:focus:ring-zinc-100/10 transition"
        />

        {error && <p role="alert" className="text-xs font-semibold text-rose-600 dark:text-rose-400">{error}</p>}

        <button
          type="submit"
          disabled={!resolution.trim() || Boolean(completedResult)}
          className="rounded-xl bg-zinc-900 dark:bg-zinc-100 text-white dark:text-zinc-900 px-4 py-2 text-xs font-bold shadow-xs transition hover:bg-zinc-800 dark:hover:bg-white disabled:cursor-not-allowed disabled:opacity-40 cursor-pointer"
        >
          {submitting ? t("common.processing", "Đang xử lý...") : completedResult ? t("status.completed", "Đã hoàn thành") : t("staff.complete_btn", "Hoàn tất yêu cầu & Mở khóa ô kho")}
        </button>
      </fieldset>

      {completedResult && (
        <div className="mt-3 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 p-3.5 border border-emerald-200 dark:border-emerald-800 text-xs text-emerald-900 dark:text-emerald-200">
          <p role="status" className="font-bold text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
            ✓ {t("staff.completed_success", "Yêu cầu đã hoàn tất xử lý thành công!")}
          </p>
          {completedResult.unlockedUnitCode && (
            <p className="mt-1 text-zinc-700 dark:text-zinc-300">
              🔓 {t("staff.unlocked_unit", "Ô kho")} <strong>{completedResult.unlockedUnitCode}</strong> {t("staff.unit_restored", "đã được tự động mở khóa và khôi phục trạng thái khả dụng.")}
            </p>
          )}
        </div>
      )}
    </form>
  );
}
