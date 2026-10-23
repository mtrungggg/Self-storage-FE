import { useEffect, useState } from "react";
import staffShiftService from "../api/staffShiftService";

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit", hour12: false });
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("en-US", {
    weekday: "short",
    month: "short",
    day: "numeric",
  });
}

function isToday(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getDate() === now.getDate() &&
    d.getMonth() === now.getMonth() &&
    d.getFullYear() === now.getFullYear()
  );
}

export default function StaffShiftSchedule({ facilityId }) {
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const loadShifts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffShiftService.getMyShifts({ facilityId });
      setShifts(data || []);
    } catch (err) {
      setError(err?.message || "Unable to load shift schedule.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-xs space-y-3">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-xs font-bold uppercase tracking-wider text-slate-900">
          Shift Schedule
        </h2>
        <div className="flex items-center gap-2">
          <span className="rounded bg-slate-100 px-2 py-0.5 text-[10px] font-semibold text-slate-500">
            {shifts.length} {shifts.length === 1 ? "shift" : "shifts"}
          </span>
          <button
            type="button"
            onClick={loadShifts}
            disabled={loading}
            className="text-xs font-semibold text-slate-500 hover:text-slate-800 transition"
          >
            {loading ? "Loading..." : "Refresh"}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 p-2 text-[11px] text-red-700">
          {error}
        </div>
      )}

      {loading ? (
        <div className="py-4 text-center text-xs text-slate-400">
          Loading schedule...
        </div>
      ) : shifts.length === 0 ? (
        <div className="rounded-lg border border-dashed border-slate-200 p-4 text-center text-xs text-slate-400">
          No shifts scheduled for this facility.
        </div>
      ) : (
        <div className="divide-y divide-slate-100 rounded-lg border border-slate-100 overflow-hidden">
          {shifts.map((shift) => {
            const today = isToday(shift.startsAt);
            return (
              <div
                key={`${shift.shiftId}-${shift.startsAt}`}
                className={`flex items-center justify-between p-3 text-xs transition ${
                  today ? "bg-blue-50/60" : "bg-white hover:bg-slate-50/60"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div
                    className={`min-w-[58px] rounded px-2 py-1 text-center shrink-0 border ${
                      today
                        ? "border-blue-200 bg-blue-100/70 text-blue-900 font-bold"
                        : "border-slate-200 bg-slate-50 text-slate-700"
                    }`}
                  >
                    <span className="block text-[10px] leading-tight">
                      {today ? "Today" : formatDate(shift.startsAt)}
                    </span>
                  </div>

                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="font-semibold text-slate-900">
                        {shift.shiftName || "Regular Shift"}
                      </span>
                      {today && (
                        <span className="rounded bg-blue-600 px-1.5 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                          Today
                        </span>
                      )}
                    </div>
                    <div className="mt-0.5 text-[11px] text-slate-500">
                      {shift.facilityName || "Assigned Facility"}
                    </div>
                  </div>
                </div>

                <div className="text-right shrink-0">
                  <div className="font-semibold text-slate-800">
                    {formatTime(shift.startsAt)} – {formatTime(shift.endsAt)}
                  </div>
                  <div className="mt-0.5 text-[10px] text-slate-400 uppercase tracking-wider">
                    {shift.dutyRole || "Staff"}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
