import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { CardSkeleton } from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import staffShiftService from "../api/staffShiftService";

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function formatDate(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  return d.toLocaleDateString("vi-VN", {
    timeZone: "UTC",
    weekday: "short",
    month: "numeric",
    day: "numeric",
  });
}

function isToday(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  const now = new Date();
  return (
    d.getUTCDate() === now.getUTCDate() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCFullYear() === now.getUTCFullYear()
  );
}

export default function StaffShiftSchedule({ facilityId }) {
  const { t } = useLanguage();
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [actionBusyId, setActionBusyId] = useState(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadShifts = async () => {
    setLoading(true);
    setError("");
    try {
      const data = await staffShiftService.getMyShifts({ facilityId });
      setShifts(data || []);
    } catch (err) {
      setError(err?.message || "Không thể tải lịch ca trực.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);

  const handleCheckIn = async (shift) => {
    setActionBusyId(shift.shiftId);
    setError("");
    setNotice("");
    try {
      await staffShiftService.checkIn(shift.shiftId);
      setNotice(`Điểm danh vào ca "${shift.shiftName || "Ca trực"}" thành công!`);
      await loadShifts();
    } catch (err) {
      setError(err?.message || "Không thể điểm danh vào ca trực.");
    } finally {
      setActionBusyId(null);
    }
  };

  const handleCheckOut = async (shift) => {
    setActionBusyId(shift.shiftId);
    setError("");
    setNotice("");
    try {
      await staffShiftService.checkOut(shift.shiftId);
      setNotice(`Đã kết thúc ca trực "${shift.shiftName || "Ca trực"}". Cảm ơn bạn!`);
      await loadShifts();
    } catch (err) {
      setError(err?.message || "Không thể hoàn tất kết thúc ca.");
    } finally {
      setActionBusyId(null);
    }
  };

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="material-symbols-outlined text-[20px] text-zinc-900 dark:text-zinc-100">
              calendar_clock
            </span>
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
              {t("staff_shifts.title", "Lịch trực ca làm việc")}
            </h2>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            {shifts.length} {shifts.length === 1 ? "ca trực" : "ca trực"}
          </span>
          <button
            type="button"
            onClick={loadShifts}
            disabled={loading || actionBusyId !== null}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50"
          >
            <span className={`material-symbols-outlined text-[15px] ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            {loading ? t("common.loading", "Đang tải...") : t("common.refresh", "Làm mới")}
          </button>
        </div>
      </div>

      {/* Notices */}
      {notice && (
        <div className="flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50/80 px-3 py-2 text-xs font-medium text-emerald-800 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px] text-emerald-600">
            check_circle
          </span>
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div className="flex items-center gap-2 rounded-xl border border-rose-200 bg-rose-50/80 px-3 py-2 text-xs font-medium text-rose-800 animate-in fade-in">
          <span className="material-symbols-outlined text-[16px] text-rose-600">
            error
          </span>
          <span>{error}</span>
        </div>
      )}

      {/* List */}
      {loading ? (
        <CardSkeleton count={3} />
      ) : shifts.length === 0 ? (
        <EmptyState
          icon="event_busy"
          title={t("staff_shifts.no_shifts", "Chưa có ca trực nào")}
          description={t("staff_shifts.no_shifts_desc", "Quản lý cơ sở chưa phân công ca làm việc.")}
        />
      ) : (
        <div className="space-y-3">
          {shifts.map((shift) => {
            const today = isToday(shift.startsAt);
            const isBusy = actionBusyId === shift.shiftId;
            const hasCheckedIn = Boolean(shift.checkInAt);
            const hasCheckedOut = Boolean(shift.checkOutAt);
            const isOnDuty = hasCheckedIn && !hasCheckedOut;

            return (
              <div
                key={`${shift.shiftId}-${shift.startsAt}`}
                className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
                  today
                    ? "border-blue-200 bg-linear-to-r from-blue-50/70 to-indigo-50/30 shadow-xs ring-1 ring-blue-500/10"
                    : "border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Date & Info */}
                  <div className="flex items-start gap-3">
                    <div
                      className={`min-w-[62px] rounded-xl px-2 py-2 text-center shrink-0 border ${
                        today
                          ? "border-blue-300 bg-blue-600 text-white shadow-xs font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className={`block text-[10px] uppercase tracking-wider ${today ? "text-blue-100" : "text-slate-400"}`}>
                        {today ? "Hôm nay" : formatDate(shift.startsAt).split(" ")[0]}
                      </span>
                      <span className="block text-sm font-extrabold leading-tight mt-0.5">
                        {formatDate(shift.startsAt).split(" ")[1] || formatDate(shift.startsAt)}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {shift.shiftName || "Ca trực tiêu chuẩn"}
                        </span>
                        {today && (
                          <span className="rounded-full bg-blue-600/90 px-2 py-0.5 text-[9px] font-bold text-white uppercase tracking-wider">
                            Hôm nay
                          </span>
                        )}
                        {/* Attendance State Badge */}
                        {hasCheckedOut ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2 py-0.5 text-[10px] font-bold text-emerald-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
                            Đã hoàn thành ca
                          </span>
                        ) : isOnDuty ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-blue-200 bg-blue-50 px-2 py-0.5 text-[10px] font-bold text-blue-700 animate-pulse">
                            <span className="h-1.5 w-1.5 rounded-full bg-blue-600" />
                            Đang trong ca trực
                          </span>
                        ) : today ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-amber-200 bg-amber-50 px-2 py-0.5 text-[10px] font-bold text-amber-700">
                            <span className="h-1.5 w-1.5 rounded-full bg-amber-500" />
                            Chưa vào ca
                          </span>
                        ) : null}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            schedule
                          </span>
                          <strong className="text-slate-700">{formatTime(shift.startsAt)} – {formatTime(shift.endsAt)}</strong>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            storefront
                          </span>
                          {shift.facilityName || "Cơ sở được phân công"}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            badge
                          </span>
                          {shift.dutyRole || "Staff"}
                        </span>
                      </div>

                      {/* Timestamps if recorded */}
                      {(shift.checkInAt || shift.checkOutAt) && (
                        <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 bg-slate-50/80 px-2.5 py-1.5 rounded-lg border border-slate-100">
                          {shift.checkInAt && (
                            <span className="text-blue-700 font-medium">
                              Vào ca lúc: <strong>{formatTime(shift.checkInAt)}</strong>
                            </span>
                          )}
                          {shift.checkOutAt && (
                            <span className="text-emerald-700 font-medium">
                              Ra ca lúc: <strong>{formatTime(shift.checkOutAt)}</strong>
                            </span>
                          )}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Right: Interactive Actions */}
                  {today && (
                    <div className="flex sm:flex-col items-end justify-center shrink-0 gap-2 border-t sm:border-t-0 pt-2 sm:pt-0">
                      {!hasCheckedIn && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleCheckIn(shift)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-zinc-900 text-white px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-[#154ec1] active:scale-95 disabled:opacity-50"
                        >
                          {isBusy ? (
                            <span className="material-symbols-outlined animate-spin text-[16px]">
                              progress_activity
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">
                              login
                            </span>
                          )}
                          <span>Điểm danh vào ca</span>
                        </button>
                      )}

                      {isOnDuty && (
                        <button
                          type="button"
                          disabled={isBusy}
                          onClick={() => handleCheckOut(shift)}
                          className="inline-flex items-center gap-1.5 rounded-xl bg-amber-600 px-4 py-2 text-xs font-bold text-white shadow-xs transition hover:bg-amber-700 active:scale-95 disabled:opacity-50"
                        >
                          {isBusy ? (
                            <span className="material-symbols-outlined animate-spin text-[16px]">
                              progress_activity
                            </span>
                          ) : (
                            <span className="material-symbols-outlined text-[16px]">
                              logout
                            </span>
                          )}
                          <span>Kết thúc ca trực</span>
                        </button>
                      )}

                      {hasCheckedOut && (
                        <div className="inline-flex items-center gap-1 text-xs font-bold text-emerald-700 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-200">
                          <span className="material-symbols-outlined text-[16px]">
                            task_alt
                          </span>
                          <span>Ca trực đã hoàn tất</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
