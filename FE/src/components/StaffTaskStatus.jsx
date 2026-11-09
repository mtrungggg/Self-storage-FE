import SelectDropdown from "@/components/ui/select-dropdown";
import { useLanguage } from "../context/LanguageContext";
import { useEffect, useRef, useState } from "react";
import staffTaskService from "../api/staffTaskService";

const options = [
  ["todo", "Chưa bắt đầu (To Do)"],
  ["in_progress", "Đang kiểm tra / Xử lý (In Progress)"],
  ["done", "Đã khắc phục xong (Resolved / Done)"],
  ["blocked", "Hư hỏng nặng - Báo Manager đổi kho (Severe / Blocked)"],
];

function getAutoProgress(st) {
  switch (st) {
    case "done":
    case "completed":
      return 100;
    case "in_progress":
    case "blocked":
      return 50;
    case "todo":
    default:
      return 0;
  }
}

export default function StaffTaskStatus({ task, onUpdated }) {
  const { t } = useLanguage();
  const currentStatus = task.status === "completed" ? "done" : task.status;
  const isTaskInitiallyDone = currentStatus === "done";

  const [status, setStatus] = useState(
    options.some(([value]) => value === currentStatus) ? currentStatus : "in_progress"
  );
  const [reportNote, setReportNote] = useState("");
  const [isReopening, setIsReopening] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);

  useEffect(() => {
    const s = task.status === "completed" ? "done" : task.status;
    setStatus(options.some(([val]) => val === s) ? s : "in_progress");
  }, [task.status]);

  const isDone = status === "done" || status === "completed";
  const derivedProgress = getAutoProgress(status);

  // Khóa thẻ sau khi đã hoàn thành (Done) - Chỉ hiển thị badge xanh trừ khi người dùng bấm Mở lại nhiệm vụ
  if (isTaskInitiallyDone && !isReopening) {
    return (
      <div className="w-full border-t border-slate-100 pt-2 flex items-center justify-between gap-2 text-xs">
        <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1.5 rounded-lg shadow-2xs">
          ✓ Đã hoàn thành
        </span>
        <button
          type="button"
          onClick={() => {
            setIsReopening(true);
            setStatus("in_progress");
            setSaved(false);
            setError("");
          }}
          className="text-[11px] font-semibold text-slate-500 hover:text-slate-900 underline transition cursor-pointer"
        >
          Mở lại nhiệm vụ
        </button>
      </div>
    );
  }

  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError("");
    setSaved(false);

    if (status === "blocked" && !reportNote.trim()) {
      setError("Vui lòng nhập ghi chú chi tiết tình trạng hư hỏng nặng để báo cáo Manager đổi kho.");
      return;
    }

    const targetStatus = isDone ? "done" : status;
    const progressPercent = targetStatus === "done" ? 100 : derivedProgress;

    lock.current = true;
    setBusy(true);
    try {
      const updated = await staffTaskService.updateStatus(task.id, {
        status: targetStatus,
        progressPercent,
        reportNote: reportNote.trim() || undefined,
      });

      if (onUpdated) {
        onUpdated(updated);
      }

      const nextStatus = updated.status === "completed" ? "done" : updated.status;
      setStatus(nextStatus);
      setSaved(true);

      if (nextStatus === "done") {
        setIsReopening(false);
        setReportNote("");
      }
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
      className="w-full border-t border-[#dfe7f5] pt-3 text-xs space-y-2.5"
    >
      <fieldset disabled={busy} className="space-y-2.5">
        <div className="flex flex-wrap items-end gap-2.5">
          <label className="flex flex-col gap-1 flex-1 min-w-[200px]">
            <span className="font-semibold text-slate-700">{t("common.status", "Trạng thái nghiệp vụ")}</span>
            <SelectDropdown
              value={status}
              onChange={(event) => {
                const val = event.target.value;
                setStatus(val);
                setSaved(false);
                setError("");
              }}
              className="rounded-lg border border-slate-200 bg-white p-2 text-xs font-medium"
            >
              {options.map(([value, label]) => (
                <option key={value} value={value}>
                  {label}
                </option>
              ))}
            </SelectDropdown>
          </label>

          <div className="flex flex-col gap-1">
            <span className="font-semibold text-slate-700">{t("staff.progress", "Tiến độ")}</span>
            <div className="h-9 px-3 rounded-lg border border-slate-200 bg-slate-100 flex items-center justify-center font-bold text-slate-800 text-xs">
              {derivedProgress}%
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              type="submit"
              className="h-9 rounded-lg bg-zinc-900 px-3.5 font-semibold text-white hover:bg-zinc-800 transition cursor-pointer disabled:opacity-50 shrink-0"
            >
              {busy ? "Đang lưu..." : "Cập nhật nhiệm vụ"}
            </button>

            {isReopening && (
              <button
                type="button"
                onClick={() => {
                  setIsReopening(false);
                  setStatus("done");
                  setError("");
                }}
                className="h-9 rounded-lg bg-slate-100 border border-slate-200 px-3 font-semibold text-slate-600 hover:bg-slate-200 transition cursor-pointer shrink-0"
              >
                Hủy
              </button>
            )}
          </div>
        </div>

        {/* Ô nhập Ghi chú báo cáo tình trạng khi Đã xong hoặc Hư hỏng nặng */}
        {(status === "done" || status === "blocked") && (
          <div className="w-full flex flex-col gap-1 pt-1">
            <label className="font-semibold text-slate-700 flex items-center justify-between">
              <span>
                {t("staff.report_note", "Ghi chú báo cáo")}{" "}
                {status === "blocked" ? (
                  <span className="text-rose-600 font-bold">* (Bắt buộc cho Manager đổi kho)</span>
                ) : (
                  <span className="text-slate-400 font-normal">(Tùy chọn)</span>
                )}
              </span>
            </label>
            <textarea
              rows={2}
              value={reportNote}
              onChange={(e) => {
                setReportNote(e.target.value);
                setSaved(false);
                setError("");
              }}
              placeholder={
                status === "blocked"
                  ? "Ví dụ: Hỏng then cài và nẹp cửa rỉ sét nặng không thể sửa tại chỗ, đề nghị Manager đổi kho mới cho khách..."
                  : "Ví dụ: Đã tra dầu bảo dưỡng và căn chỉnh then cài cửa, hoạt động trơn tru bình thường..."
              }
              className="w-full rounded-lg border border-slate-200 bg-white p-2 text-xs focus:ring-1 focus:ring-zinc-900 focus:outline-hidden"
            />
          </div>
        )}
      </fieldset>

      {error && (
        <p role="alert" className="text-xs font-semibold text-red-600">
          {t(error, error)}
        </p>
      )}
      {saved && (
        <p role="status" className="text-xs font-semibold text-green-700">
          ✓ {t("staff.task_updated", "Nhiệm vụ đã được cập nhật thành công.")}
        </p>
      )}
    </form>
  );
}
