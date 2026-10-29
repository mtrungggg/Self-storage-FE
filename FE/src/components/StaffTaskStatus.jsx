import { useRef, useState } from "react";
import staffTaskService from "../api/staffTaskService";

const options = [["in_progress", "In Progress"], ["completed", "Completed"], ["blocked", "Blocked"]];
export default function StaffTaskStatus({ task, onUpdated }) {
  const [status, setStatus] = useState(options.some(([value]) => value === task.status) ? task.status : "in_progress");
  const [progress, setProgress] = useState(String(task.progressPercent ?? 0));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const lock = useRef(false);
  async function submit(event) {
    event.preventDefault();
    if (lock.current) return;
    setError(""); setSaved(false);
    const value = status === "completed" ? 100 : Number(progress);
    if (!progress.trim() || !Number.isInteger(value) || value < 0 || value > 100) { setError("Progress must be a whole number from 0 to 100."); return; }
    lock.current = true; setBusy(true);
    try {
      const updated = await staffTaskService.updateStatus(task.id, { status, progressPercent: value });
      onUpdated(updated);
      setStatus(updated.status); setProgress(String(updated.progressPercent ?? 0)); setSaved(true);
    } catch (err) { setError(err.message || "Unable to update task."); }
    finally { lock.current = false; setBusy(false); }
  }
  return <form onSubmit={submit} aria-label={`Update task ${task.id}`} aria-busy={busy} className="w-full border-t border-[#dfe7f5] pt-3 text-xs">
    <fieldset disabled={busy} className="flex flex-wrap items-end gap-3">
      <label>Status<select value={status} onChange={(event) => { setStatus(event.target.value); setSaved(false); if (event.target.value === "completed") setProgress("100"); }} className="ml-2 rounded-lg border bg-white p-2">{options.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select></label>
      <label>Progress (%)<input type="number" min="0" max="100" step="1" required disabled={status === "completed"} value={status === "completed" ? "100" : progress} onChange={(event) => { setProgress(event.target.value); setSaved(false); }} className="ml-2 w-20 rounded-lg border bg-white p-2" /></label>
      <button type="submit" className="rounded-lg bg-[#1d5fe5] px-3 py-2 font-semibold text-white">{busy ? "Saving..." : "Update task"}</button>
    </fieldset>
    {error && <p role="alert" className="mt-2 text-red-600">{error}</p>}
    {saved && <p role="status" className="mt-2 text-green-700">Task updated.</p>}
  </form>;
}
