import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import staffTaskService from "../api/staffTaskService";

const options = [
  ["todo", "Chưa bắt đầu (To Do)"],
  ["in_progress", "Đang xử lý (In Progress)"],
  ["done", "Hoàn thành (Done)"],
  ["blocked", "Tạm dừng (Blocked)"],
];

export default function StaffTaskStatus({ task, onUpdated }) {
  const { t } = useLanguage();
  const currentStatus = task.status === "completed" ? "done" : task.status;
  const [status, setStatus] = useState(
    options.some(([value]) => value === currentStatus) ? currentStatus : "in_progress"
  );
  const [progress, setProgress] = useState(String(task.progressPercent ?? (currentStatus === "done" ? 100 : 0)));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    const s = task.status === "completed" ? "done" : task.status;
    setStatus(options.some(([val]) => val === s) ? s : "in_progress");
    setProgress(String(task.progressPercent ?? (s === "done" ? 100 : 0)));
  }, [task.status, task.progressPercent]);

  const isDone = status === "done" || status === "completed";

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    setSaved(false);

    const targetStatus = isDone ? "done" : status;
    const value = targetStatus === "done" ? 100 : Number(progress);

    if (targetStatus !== "done" && (!progress.trim() || !Number.isInteger(value) || value < 0 || value > 100)) {
      setError("Tiến độ phải là số nguyên từ 0 đến 100.");
      return;
    }

    lock.current = true;
    setBusy(true);
    try {
      const updated = await staffTaskService.updateStatus(task.id, {
        status: targetStatus,
        progressPercent: value,
      });
      onUpdated(updated);
      const nextStatus = updated.status === "completed" ? "done" : updated.status;
      setStatus(nextStatus);
      setProgress(String(updated.progressPercent ?? (nextStatus === "done" ? 100 : 0)));
      setSaved(true);
    } catch (err) {
      setError(err.message || "Không thể cập nhật nhiệm vụ.");
    } finally {
      lock.current = false;
      setBusy(false);
    }
  }

  return (
    <form
      onSubmit={submit}
      aria-label={`Update task ${task.id}`}
      aria-busy={busy}
      className="w-full border-t border-[#dfe7f5] pt-3 text-xs"
    >
      <fieldset disabled={busy} className="flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">{t("common.status", "Trạng thái")}</span>
          <SelectDropdown
            value={status}
            onChange={(event) => {
              const val = event.target.value;
              setStatus(val);
              setSaved(false);
              if (val === "done") setProgress("100");
            }}
            className="rounded-lg border bg-white p-2 min-w-[170px]"
          >
            {options.map(([value, label]) => (
              <option key={value} value={value}>
                {label}
              </option>
            ))}
          </SelectDropdown>
        </label>

        <label className="flex flex-col gap-1">
          <span className="font-medium text-slate-700">Tiến độ (%)</span>
          <input
            type="number"
            min="0"
            max="100"
            step="1"
            required
            disabled={isDone}
            value={isDone ? "100" : progress}
            onChange={(event) => {
              setProgress(event.target.value);
              setSaved(false);
            }}
            className="w-24 rounded-lg border bg-white p-2 text-center disabled:bg-slate-100 disabled:text-slate-500"
          />
        </label>

        <button
          type="submit"
          className="rounded-lg bg-zinc-900 px-3.5 py-2 font-semibold text-white hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50"
        >
          {busy ? "Đang lưu..." : "Cập nhật nhiệm vụ"}
        </button>

        {isDone && (
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-2.5 py-1.5 rounded-lg">
            ✓ Đã hoàn thành
          </span>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="mt-2 text-xs font-semibold text-red-600">
          {error}
        </p>
      )}
      {saved && (
        <p role="status" className="mt-2 text-xs font-semibold text-green-700">
          ✓ {t("staff.task_updated", "Nhiệm vụ đã cập nhật.")}
        </p>
      )}
    </form>
  );
}
