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

export default function StaffShiftSchedule({ facilityId, timetable = false }) {
  const { t, lang } = useLanguage();
  const isVi = lang === "vi";
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [viewDate, setViewDate] = useState(() => new Date());
  const [selectedDayKey, setSelectedDayKey] = useState(() => {
    const d = new Date();
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
  });

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
      ) : timetable ? (() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        const shiftsByDay = {};
        shifts.forEach((s) => {
          const d = new Date(s.startsAt);
          if (isNaN(d.getTime())) return;
          const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
          if (!shiftsByDay[k]) shiftsByDay[k] = [];
          shiftsByDay[k].push(s);
        });

        const cells = [];
        for (let i = 0; i < 42; i++) {
          const dayNum = i - startOffset + 1;
          let cellDate;
          let inMonth = true;
          if (dayNum <= 0) {
            cellDate = new Date(year, month - 1, prevMonthDays + dayNum);
            inMonth = false;
          } else if (dayNum > daysInMonth) {
            cellDate = new Date(year, month + 1, dayNum - daysInMonth);
            inMonth = false;
          } else {
            cellDate = new Date(year, month, dayNum);
          }
          const key = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;
          cells.push({ day: cellDate.getDate(), key, inMonth, dayShifts: shiftsByDay[key] || [] });
        }

        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const selectedShifts = shiftsByDay[selectedDayKey] || [];
        const monthLabel = isVi
          ? `Tháng ${month + 1}, ${year}`
          : viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        const dayHeaders = isVi ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-900">{monthLabel}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title={isVi ? "Tháng trước" : "Previous month"}
                >
                  <span className="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title={isVi ? "Tháng sau" : "Next month"}
                >
                  <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500">
              {dayHeaders.map((h) => (
                <div key={h} className="py-1">{h}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {cells.map((c) => {
                const isTodayCell = c.key === todayKey;
                const isSelected = c.key === selectedDayKey;
                const hasShift = c.dayShifts.length > 0;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelectedDayKey(c.key)}
                    className={`relative flex h-9 flex-col items-center justify-center rounded-full transition ${
                      isTodayCell
                        ? "bg-zinc-900 font-bold text-white shadow-xs"
                        : isSelected
                        ? "bg-blue-100 font-bold text-blue-900 ring-1 ring-blue-400"
                        : c.inMonth
                        ? "text-slate-800 hover:bg-slate-100"
                        : "text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{c.day}</span>
                    {hasShift && (
                      <span
                        className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                          isTodayCell ? "bg-emerald-400" : "bg-blue-600"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs">
              <div className="font-bold text-slate-700 mb-1.5">
                {isVi ? `Ca trực ngày ${selectedDayKey.split("-").reverse().join("/")}` : `Shifts on ${selectedDayKey}`}
              </div>
              {selectedShifts.length === 0 ? (
                <p className="text-[11px] text-slate-400">{isVi ? "Không có ca trực trong ngày này." : "No shifts scheduled."}</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedShifts.map((s) => (
                    <div key={`${s.shiftId}-${s.startsAt}`} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 border border-slate-200/70">
                      <span className="font-semibold text-slate-900">{formatShiftName(s.shiftName, isVi)}</span>
                      <span className="font-mono text-[11px] text-slate-600">{formatTime(s.startsAt)} - {formatTime(s.endsAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })() : (
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
                        ) : timetable ? (() => {
        const year = viewDate.getFullYear();
        const month = viewDate.getMonth();
        const firstDay = new Date(year, month, 1);
        const startOffset = (firstDay.getDay() + 6) % 7; // Monday = 0
        const daysInMonth = new Date(year, month + 1, 0).getDate();
        const prevMonthDays = new Date(year, month, 0).getDate();

        const shiftsByDay = {};
        shifts.forEach((s) => {
          const d = new Date(s.startsAt);
          if (isNaN(d.getTime())) return;
          const k = `${d.getUTCFullYear()}-${String(d.getUTCMonth() + 1).padStart(2, "0")}-${String(d.getUTCDate()).padStart(2, "0")}`;
          if (!shiftsByDay[k]) shiftsByDay[k] = [];
          shiftsByDay[k].push(s);
        });

        const cells = [];
        for (let i = 0; i < 42; i++) {
          const dayNum = i - startOffset + 1;
          let cellDate;
          let inMonth = true;
          if (dayNum <= 0) {
            cellDate = new Date(year, month - 1, prevMonthDays + dayNum);
            inMonth = false;
          } else if (dayNum > daysInMonth) {
            cellDate = new Date(year, month + 1, dayNum - daysInMonth);
            inMonth = false;
          } else {
            cellDate = new Date(year, month, dayNum);
          }
          const key = `${cellDate.getFullYear()}-${String(cellDate.getMonth() + 1).padStart(2, "0")}-${String(cellDate.getDate()).padStart(2, "0")}`;
          cells.push({ day: cellDate.getDate(), key, inMonth, dayShifts: shiftsByDay[key] || [] });
        }

        const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
        const selectedShifts = shiftsByDay[selectedDayKey] || [];
        const monthLabel = isVi
          ? `Tháng ${month + 1}, ${year}`
          : viewDate.toLocaleDateString("en-US", { month: "long", year: "numeric" });
        const dayHeaders = isVi ? ["T2", "T3", "T4", "T5", "T6", "T7", "CN"] : ["Mo", "Tu", "We", "Th", "Fr", "Sa", "Su"];

        return (
          <div className="space-y-3">
            <div className="flex items-center justify-between px-1">
              <span className="text-xs font-bold text-slate-900">{monthLabel}</span>
              <div className="flex items-center gap-1">
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month - 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title={isVi ? "Tháng trước" : "Previous month"}
                >
                  <span className="material-symbols-outlined text-[16px]">keyboard_arrow_up</span>
                </button>
                <button
                  type="button"
                  onClick={() => setViewDate(new Date(year, month + 1, 1))}
                  className="flex h-7 w-7 items-center justify-center rounded-lg border border-slate-200 text-slate-600 hover:bg-slate-50"
                  title={isVi ? "Tháng sau" : "Next month"}
                >
                  <span className="material-symbols-outlined text-[16px]">keyboard_arrow_down</span>
                </button>
              </div>
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-[11px] font-bold text-slate-500">
              {dayHeaders.map((h) => (
                <div key={h} className="py-1">{h}</div>
              ))}
            </div>

            <div className="grid grid-cols-7 gap-1 text-center text-xs">
              {cells.map((c) => {
                const isTodayCell = c.key === todayKey;
                const isSelected = c.key === selectedDayKey;
                const hasShift = c.dayShifts.length > 0;
                return (
                  <button
                    key={c.key}
                    type="button"
                    onClick={() => setSelectedDayKey(c.key)}
                    className={`relative flex h-9 flex-col items-center justify-center rounded-full transition ${
                      isTodayCell
                        ? "bg-zinc-900 font-bold text-white shadow-xs"
                        : isSelected
                        ? "bg-blue-100 font-bold text-blue-900 ring-1 ring-blue-400"
                        : c.inMonth
                        ? "text-slate-800 hover:bg-slate-100"
                        : "text-slate-300 hover:bg-slate-50"
                    }`}
                  >
                    <span>{c.day}</span>
                    {hasShift && (
                      <span
                        className={`mt-0.5 h-1.5 w-1.5 rounded-full ${
                          isTodayCell ? "bg-emerald-400" : "bg-blue-600"
                        }`}
                      />
                    )}
                  </button>
                );
              })}
            </div>

            <div className="rounded-xl border border-slate-200/80 bg-slate-50/70 p-3 text-xs">
              <div className="font-bold text-slate-700 mb-1.5">
                {isVi ? `Ca trực ngày ${selectedDayKey.split("-").reverse().join("/")}` : `Shifts on ${selectedDayKey}`}
              </div>
              {selectedShifts.length === 0 ? (
                <p className="text-[11px] text-slate-400">{isVi ? "Không có ca trực trong ngày này." : "No shifts scheduled."}</p>
              ) : (
                <div className="space-y-1.5">
                  {selectedShifts.map((s) => (
                    <div key={`${s.shiftId}-${s.startsAt}`} className="flex items-center justify-between rounded-lg bg-white px-2.5 py-1.5 border border-slate-200/70">
                      <span className="font-semibold text-slate-900">{formatShiftName(s.shiftName, isVi)}</span>
                      <span className="font-mono text-[11px] text-slate-600">{formatTime(s.startsAt)} - {formatTime(s.endsAt)}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })() : (
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
