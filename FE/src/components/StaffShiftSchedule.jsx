import { useLanguage } from "../context/LanguageContext";
import { useEffect, useState } from "react";
import { CardSkeleton } from "./SkeletonLoader";
import EmptyState from "./EmptyState";
import staffShiftService from "../api/staffShiftService";

function formatTime(isoString) {
  if (!isoString) return "";
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return "";
  return d.toLocaleTimeString("en-GB", {
    timeZone: "UTC",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

function getShiftDateBlock(isoString, isVi = true) {
  if (!isoString) return { weekday: "—", dayMonth: "—" };
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return { weekday: "—", dayMonth: "—" };
  const weekdaysVi = ["CHỦ NHẬT", "THỨ 2", "THỨ 3", "THỨ 4", "THỨ 5", "THỨ 6", "THỨ 7"];
  const weekdaysEn = ["SUNDAY", "MONDAY", "TUESDAY", "WEDNESDAY", "THURSDAY", "FRIDAY", "SATURDAY"];
  const weekday = (isVi ? weekdaysVi : weekdaysEn)[d.getUTCDay()];
  const day = String(d.getUTCDate()).padStart(2, "0");
  const month = String(d.getUTCMonth() + 1).padStart(2, "0");
  return {
    weekday,
    dayMonth: `${day}/${month}`,
  };
}

function isToday(isoString) {
  if (!isoString) return false;
  const d = new Date(isoString);
  if (isNaN(d.getTime())) return false;
  const now = new Date();
  return (
    d.getUTCDate() === now.getUTCDate() &&
    d.getUTCMonth() === now.getUTCMonth() &&
    d.getUTCFullYear() === now.getUTCFullYear()
  );
}

function formatShiftName(name, isVi = true) {
  if (!name) return isVi ? "Ca trực" : "Standard Shift";
  const lower = name.toLowerCase();
  if (lower.includes("morning") || lower.includes("sáng")) return isVi ? "Ca sáng" : "Morning Shift";
  if (lower.includes("afternoon") || lower.includes("chiều")) return isVi ? "Ca chiều" : "Afternoon Shift";
  if (lower.includes("night") || lower.includes("tối")) return isVi ? "Ca tối" : "Night Shift";
  return name;
}

export default function StaffShiftSchedule({ facilityId }) {
  const { t, lang } = useLanguage();
  const isVi = lang === "vi";
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
      setError(err?.message || (isVi ? "Không thể tải lịch ca trực." : "Unable to load shift schedule."));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadShifts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [facilityId]);

  const now = new Date();

  return (
    <div className="rounded-2xl border border-slate-200/80 bg-white p-5 shadow-xs space-y-4">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-100 pb-3">
        <div className="flex items-center gap-2">
          <span className="material-symbols-outlined text-[20px] text-zinc-900">
            calendar_clock
          </span>
          <h2 className="text-sm font-bold uppercase tracking-wider text-slate-900">
            {t("staff_shifts.title", "Lịch trực ca làm việc")}
          </h2>
        </div>

        <div className="flex items-center gap-2">
          <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-600">
            {shifts.length} {isVi ? "ca trực" : "shifts"}
          </span>
          <button
            type="button"
            onClick={loadShifts}
            disabled={loading}
            className="inline-flex items-center gap-1 rounded-lg border border-slate-200 px-2.5 py-1 text-xs font-semibold text-slate-600 hover:bg-slate-50 active:scale-95 transition disabled:opacity-50 cursor-pointer"
          >
            <span className={`material-symbols-outlined text-[15px] ${loading ? "animate-spin" : ""}`}>
              refresh
            </span>
            {loading ? t("common.loading", "Đang tải...") : t("common.refresh", "Làm mới")}
          </button>
        </div>
      </div>

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
            const shiftStartDate = new Date(shift.startsAt);
            const shiftEndDate = new Date(shift.endsAt);

            let statusType = "upcoming";
            if (now > shiftEndDate) {
              statusType = "past";
            } else if (now >= shiftStartDate && now <= shiftEndDate) {
              statusType = "current";
            } else {
              statusType = "upcoming";
            }

            const isCurrent = statusType === "current";
            const isPast = statusType === "past";
            const dateInfo = getShiftDateBlock(shift.startsAt, isVi);

            return (
              <div
                key={`${shift.shiftId}-${shift.startsAt}`}
                className={`relative overflow-hidden rounded-xl border p-4 transition-all duration-200 ${
                  isCurrent
                    ? "border-blue-500 bg-gradient-to-r from-blue-50/80 to-indigo-50/40 shadow-sm ring-2 ring-blue-500/20"
                    : today
                    ? "border-blue-200/90 bg-blue-50/20"
                    : "border-slate-200/70 bg-white hover:border-slate-300 hover:shadow-xs"
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Left: Date & Info */}
                  <div className="flex items-start gap-3">
                    {/* Calendar Box: Dòng trên THỨ, Dòng dưới Ngày/Tháng */}
                    <div
                      className={`min-w-[68px] rounded-xl px-2 py-2 text-center shrink-0 border ${
                        isCurrent
                          ? "border-blue-500 bg-blue-600 text-white shadow-xs font-bold"
                          : today
                          ? "border-blue-300 bg-blue-50 text-blue-900 font-bold"
                          : "border-slate-200 bg-slate-50 text-slate-700"
                      }`}
                    >
                      <span className={`block text-[10px] uppercase tracking-wider font-extrabold ${
                        isCurrent ? "text-blue-100" : today ? "text-blue-700" : "text-slate-500"
                      }`}>
                        {today ? (isVi ? "HÔM NAY" : "TODAY") : dateInfo.weekday}
                      </span>
                      <span className={`block text-sm font-black leading-tight mt-0.5 ${
                        isCurrent ? "text-white" : today ? "text-blue-950" : "text-slate-800"
                      }`}>
                        {dateInfo.dayMonth}
                      </span>
                    </div>

                    <div>
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="text-sm font-bold text-slate-900">
                          {formatShiftName(shift.shiftName, isVi)}
                        </span>

                        {/* Badge trạng thái tĩnh thời gian thực */}
                        {isCurrent ? (
                          <span className="inline-flex items-center gap-1.5 rounded-full border border-blue-500 bg-blue-100/90 px-2.5 py-0.5 text-[10px] font-bold text-blue-800 animate-pulse">
                            <span className="h-2 w-2 rounded-full bg-blue-600" />
                            {t("staff_shifts.current_shift", "Ca hiện tại")}
                          </span>
                        ) : isPast ? (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-100 px-2 py-0.5 text-[10px] font-medium text-slate-500">
                            {t("staff_shifts.past_shift", "Đã qua")}
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 rounded-full border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-600">
                            {t("staff_shifts.upcoming_shift", "Sắp tới")}
                          </span>
                        )}
                      </div>

                      <div className="mt-1 flex flex-wrap items-center gap-2 sm:gap-3 text-xs text-slate-500">
                        <span className="inline-flex items-center gap-1">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            schedule
                          </span>
                          <strong className="text-slate-700">
                            {formatTime(shift.startsAt)} – {formatTime(shift.endsAt)}
                          </strong>
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-600">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            storefront
                          </span>
                          {shift.facilityName || (isVi ? "Cơ sở trực" : "Facility")}
                        </span>
                        <span>•</span>
                        <span className="inline-flex items-center gap-1 text-slate-500">
                          <span className="material-symbols-outlined text-[14px] text-slate-400">
                            badge
                          </span>
                          {shift.dutyRole || (isVi ? "Nhân viên vận hành" : "Operations Staff")}
                        </span>
                      </div>
                    </div>
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
