import { useEffect, useMemo, useState } from "react";
import managerService from "../api/managerService";
import { useManagerFacility } from "../context/ManagerFacilityContext";
import { DUTY_ROLES } from "../constants/managerConstants";
import { USER_ROLES } from "../constants/roles";
import { DEFAULT_STAFF_AVATARS } from "../constants/assets";
import BUSINESS_CONFIG from "../config/businessConfig";

// Standard shift presets for drag-and-drop quick scheduling
const SHIFT_PRESETS = [
  {
    type: "morning",
    name: "Morning Shift",
    code: "MS",
    time: "06:00 - 14:00",
    startHour: 6,
    endHour: 14,
    hours: 8,
    containerClass: "border-[#a6f4c5] bg-[#eefdf5] text-[#027a48]",
    codeClass: "bg-[#d1fadf] text-[#027a48]",
    defaultLocation: "Warehouse Zone A",
  },
  {
    type: "afternoon",
    name: "Afternoon Shift",
    code: "AS",
    time: "14:00 - 22:00",
    startHour: 14,
    endHour: 22,
    hours: 8,
    containerClass: "border-[#fedf89] bg-[#fef9ee] text-[#b54708]",
    codeClass: "bg-[#fef0c7] text-[#b54708]",
    defaultLocation: "Receiving Dock",
  },
  {
    type: "night",
    name: "Night Shift",
    code: "NS",
    time: "22:00 - 06:00",
    startHour: 22,
    endHour: 30, // cross to next day
    hours: 8,
    containerClass: "border-[#c7d7fe] bg-[#f5f6ff] text-[#3538cd]",
    codeClass: "bg-[#e0eaff] text-[#3538cd]",
    defaultLocation: "Night Watch Zone B",
  },
  {
    type: "duty24h",
    name: "24h Shift",
    code: "24H",
    time: "08:00 - 08:00",
    startHour: 8,
    endHour: 32,
    hours: 24,
    containerClass: "border-[#99f6e4] bg-[#f0fdf9] text-[#0f766e]",
    codeClass: "bg-[#ccfbf1] text-[#0f766e]",
    defaultLocation: "Facility Security",
  },
];

const AVATAR_LIST = DEFAULT_STAFF_AVATARS;

const getStaffAvatar = (id) => {
  const num = Number(id) || 0;
  return AVATAR_LIST[Math.abs(num) % AVATAR_LIST.length];
};

const startOfLocalDay = (date) => {
  const d = new Date(date);
  d.setHours(0, 0, 0, 0);
  return d;
};

const isPastDayKey = (dayKey) => {
  const [year, month, day] = dayKey.split("-").map(Number);
  return startOfLocalDay(new Date(year, month - 1, day)) < startOfLocalDay(new Date());
};

const parseClockHour = (value) => {
  if (typeof value !== "string") return NaN;
  const [h, m] = value.trim().split(":");
  const hour = Number(h);
  const minute = Number(m) || 0;
  if (!Number.isFinite(hour)) return NaN;
  return hour + minute / 60;
};

const getShiftRange = (shift) => {
  if (!shift) return null;
  if (Number.isFinite(shift.startHour) && Number.isFinite(shift.endHour)) {
    const start = shift.startHour;
    let end = shift.endHour;
    if (end <= start) end += 24;
    return { start, end };
  }
  const parts = String(shift.time || "").split(/\s*-\s*/);
  if (parts.length !== 2) return null;
  const start = parseClockHour(parts[0]);
  let end = parseClockHour(parts[1]);
  if (!Number.isFinite(start) || !Number.isFinite(end)) return null;
  if (end <= start) end += 24;
  return { start, end };
};

const rangesOverlap = (a, b) => Boolean(a && b && a.start < b.end && b.start < a.end);

const findOverlappingShift = (existingShifts, candidate) => {
  const candidateRange = getShiftRange(candidate);
  if (!candidateRange) return null;
  return (existingShifts || []).find((sh) => rangesOverlap(getShiftRange(sh), candidateRange)) || null;
};

const markOverlappingShifts = (dayShifts) => {
  const list = Array.isArray(dayShifts) ? dayShifts : [];
  return list.map((shift, index) => {
    const range = getShiftRange(shift);
    const overlaps = list.some(
      (other, otherIndex) => otherIndex !== index && rangesOverlap(range, getShiftRange(other))
    );
    if (!overlaps) {
      if (!shift.warning) return shift;
      const next = { ...shift };
      delete next.warning;
      return next;
    }
    return { ...shift, warning: "Overlap" };
  });
};

const cloneRoster = (list) => JSON.parse(JSON.stringify(list || []));

const serializeRoster = (list) =>
  JSON.stringify(
    (list || []).map((staff) => ({
      id: staff.id,
      shifts: Object.fromEntries(
        Object.entries(staff.shifts || {}).map(([dayKey, items]) => [
          dayKey,
          (items || []).map((sh) => `${sh.shiftId ?? ""}|${sh.type}|${sh.time}|${sh.name}`).sort(),
        ])
      ),
    }))
  );

const toLocalDateKey = (dateInput) => {
  if (!dateInput) return "";
  const dt = new Date(dateInput);
  if (Number.isNaN(dt.getTime())) return "";
  const y = dt.getFullYear();
  const m = String(dt.getMonth() + 1).padStart(2, "0");
  const d = String(dt.getDate()).padStart(2, "0");
  return `${y}-${m}-${d}`;
};

const buildShiftTimes = (dayKey, preset) => {
  const [year, month, day] = dayKey.split("-").map(Number);
  const startHour = preset.startHour || 6;
  const endHour = preset.endHour || 14;
  const startDate = new Date(year, month - 1, day, Math.floor(startHour), Math.floor((startHour % 1) * 60), 0);
  const endDate = new Date(year, month - 1, day, Math.floor(endHour % 24), Math.floor((endHour % 1) * 60), 0);
  if (endHour >= 24) {
    endDate.setDate(endDate.getDate() + 1);
  }
  return { startDate, endDate, startHour, endHour };
};

// Compute 7 dynamic week days (Monday - Sunday)
const computeWeekDays = (baseDate) => {
  const d = new Date(baseDate);
  const day = d.getDay();
  const diff = (day === 0 ? -6 : 1) - day;
  const monday = new Date(d);
  monday.setDate(d.getDate() + diff);
  monday.setHours(0, 0, 0, 0);

  const days = [];
  const dayNames = [
    "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  ];

  for (let i = 0; i < 7; i++) {
    const cur = new Date(monday);
    cur.setDate(monday.getDate() + i);
    const yyyy = cur.getFullYear();
    const mm = String(cur.getMonth() + 1).padStart(2, "0");
    const dd = String(cur.getDate()).padStart(2, "0");
    const key = `${yyyy}-${mm}-${dd}`;
    const today = new Date();
    const isToday =
      cur.getDate() === today.getDate() &&
      cur.getMonth() === today.getMonth() &&
      cur.getFullYear() === today.getFullYear();

    days.push({
      key,
      dateObj: cur,
      dayName: dayNames[i],
      dateFormatted: `${dd}/${mm}`,
      isToday,
      isPast: startOfLocalDay(cur) < startOfLocalDay(today),
      isWeekend: i >= 5,
    });
  }
  return days;
};

// Component: Individual Shift Card
function ShiftCard({ shift, onDelete }) {
  const DeleteButton = () => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete?.();
      }}
      className="absolute -top-1.5 -right-1.5 z-10 hidden group-hover:flex h-5 w-5 items-center justify-center rounded-full bg-white text-[#d92d20] shadow-sm border border-[#fda29b] hover:bg-[#fee4e2] transition"
      title="Remove this shift"
    >
      <span className="text-[12px] font-bold leading-none">✕</span>
    </button>
  );

  // Overlap / conflict warning takes visual priority
  if (shift.type === "night_conflict" || shift.warning) {
    return (
      <div className="group relative rounded-[12px] border border-[#fecdca] bg-[#fff1f3] p-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#b42318]">
            <span className="material-symbols-outlined text-[14px]">warning</span>
            <span>{shift.name}</span>
          </div>
          <span className="inline-flex items-center gap-0.5 rounded bg-[#fee4e2] px-1.5 py-0.5 text-[9px] font-extrabold text-[#d92d20]">
            <span className="material-symbols-outlined text-[11px]">error</span>
            <span>{shift.warning || "Conflict"}</span>
          </span>
        </div>
        <div className="mt-0.5 font-mono text-[11px] font-extrabold text-[#912018]">{shift.time}</div>
        <div className="mt-0.5 truncate text-[10px] font-semibold text-[#b42318]">{shift.location}</div>
      </div>
    );
  }

  // 1. Morning Shift (MS)
  if (shift.type === "morning") {
    return (
      <div className="group relative rounded-[12px] border border-[#a6f4c5] bg-[#eefdf5] p-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#027a48]">
            <span>{shift.name}</span>
          </div>
          <span className="rounded bg-[#d1fadf] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#027a48]">
            {shift.code || "MS"}
          </span>
        </div>
        <div className="mt-0.5 font-mono text-[11px] font-extrabold text-[#054f31]">{shift.time}</div>
        <div className="mt-0.5 truncate text-[10px] font-medium text-[#027a48]">{shift.location}</div>
      </div>
    );
  }

  // 2. Afternoon Shift (AS)
  if (shift.type === "afternoon") {
    return (
      <div className="group relative rounded-[12px] border border-[#fedf89] bg-[#fef9ee] p-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#b54708]">
            <span>{shift.name}</span>
          </div>
          <span className="rounded bg-[#fef0c7] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#b54708]">
            {shift.code || "AS"}
          </span>
        </div>
        <div className="mt-0.5 font-mono text-[11px] font-extrabold text-[#7a2e05]">{shift.time}</div>
        <div className="mt-0.5 truncate text-[10px] font-medium text-[#b54708]">{shift.location}</div>
      </div>
    );
  }

  // 3. Night Shift (NS)
  if (shift.type === "night") {
    return (
      <div className="group relative rounded-[12px] border border-[#c7d7fe] bg-[#f5f6ff] p-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#3538cd]">
            <span>{shift.name}</span>
          </div>
          <span className="rounded bg-[#e0eaff] px-1.5 py-0.5 text-[9px] font-black uppercase text-[#3538cd]">
            {shift.code || "NS"}
          </span>
        </div>
        <div className="mt-0.5 font-mono text-[11px] font-extrabold text-[#282d97]">{shift.time}</div>
        <div className="mt-0.5 truncate text-[10px] font-medium text-[#444ce7]">{shift.location}</div>
      </div>
    );
  }

  // 4. Night Shift - Conflict / Warning
  if (shift.type === "night_conflict" || shift.warning) {
    return (
      <div className="group relative rounded-[12px] border border-[#fecdca] bg-[#fff1f3] p-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#b42318]">
            <span>{shift.name}</span>
          </div>
          <span className="inline-flex items-center gap-0.5 rounded bg-[#fee4e2] px-1.5 py-0.5 text-[9px] font-extrabold text-[#d92d20]">
            <span>{shift.warning || "Conflict"}</span>
          </span>
        </div>
        <div className="mt-0.5 font-mono text-[11px] font-extrabold text-[#912018]">{shift.time}</div>
        <div className="mt-0.5 truncate text-[10px] font-semibold text-[#b42318]">{shift.location}</div>
      </div>
    );
  }

  // 5. Leave
  if (shift.type === "leave") {
    return (
      <div className="group relative flex min-h-[70px] flex-col items-center justify-center rounded-[12px] border border-[#e9d7fe] bg-[#faf5ff] p-2 text-center transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center gap-1 text-[11px] font-extrabold text-[#6941c6]">
          <span>{shift.name}</span>
        </div>
        <div className="mt-0.5 text-[10px] font-medium text-[#7f56d9]">
          {shift.location || "Annual Leave"}
        </div>
      </div>
    );
  }

  // 6. Rest Day / REST
  if (shift.type === "rest") {
    return (
      <div className="group relative flex min-h-[70px] flex-col items-center justify-center rounded-[12px] border border-[#e4e7ec] bg-[#f8f9fc] p-2 text-center transition hover:shadow-xs">
        <DeleteButton />
        <div className="text-[11px] font-black uppercase tracking-wider text-[#475467]">
          {shift.name}
        </div>
        <div className="mt-0.5 text-[9px] font-bold uppercase tracking-widest text-[#98a2b3]">
          {shift.code || "REST"}
        </div>
      </div>
    );
  }

  // 7. 24h Shift
  if (shift.type === "duty24h") {
    return (
      <div className="group relative rounded-[12px] border border-[#99f6e4] bg-[#f0fdf9] p-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <div className="flex items-center gap-1 text-[11px] font-bold text-[#0f766e]">
            <span>{shift.name}</span>
          </div>
          <span className="rounded bg-[#ccfbf1] px-1.5 py-0.5 text-[9px] font-black text-[#0f766e]">24H</span>
        </div>
        <div className="mt-0.5 font-mono text-[11px] font-extrabold text-[#115e59]">{shift.time}</div>
        <div className="mt-0.5 truncate text-[10px] font-medium text-[#0f766e]">{shift.location}</div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-[12px] border border-[#dfe7f5] bg-white p-2 text-xs text-[#0b1c30] hover:shadow-xs transition">
      <DeleteButton />
      <div className="font-bold">{shift.name}</div>
      <div className="text-[10px] text-[#8996a9]">{shift.time}</div>
    </div>
  );
}

function ManagerShifts() {
  const { facilityId } = useManagerFacility();

  // Dynamic date state
  const [baseDate, setBaseDate] = useState(() => new Date());
  const weekDays = useMemo(() => computeWeekDays(baseDate), [baseDate]);

  // Backend state (zero hardcoded mock data)
  const [staffList, setStaffList] = useState([]);
  const [baselineStaffList, setBaselineStaffList] = useState([]);
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [reloadToken, setReloadToken] = useState(0);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");
  const [pastWarning, setPastWarning] = useState(null); // { staffId, staffName, dayKey, preset }

  // Drag-and-drop & brush tool states
  const [draggingPreset, setDraggingPreset] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null); // { employeeId, dayKey, conflict }
  const [selectedBrush, setSelectedBrush] = useState(null);

  // Formatted week title
  const weekLabel = useMemo(() => {
    if (weekDays.length === 0) return "";
    const first = weekDays[0];
    const last = weekDays[weekDays.length - 1];
    return `${first.dateFormatted} - ${last.dateFormatted}/${last.dateObj.getFullYear()}`;
  }, [weekDays]);

  // Fetch real staff, shifts & shift-roster from backend
  useEffect(() => {
    if (!facilityId) return;
    let active = true;
    setLoading(true);
    setError("");

    const fromDate = weekDays[0].dateObj.toISOString();
    const toDate = new Date(
      weekDays[weekDays.length - 1].dateObj.getTime() + 86399999
    ).toISOString();

    Promise.allSettled([
      managerService.getFacilityStaff(facilityId),
      managerService.getShifts(facilityId),
      managerService.getShiftRoster(facilityId, { fromDate, toDate }),
    ])
      .then(([staffRes, shiftsRes, rosterRes]) => {
        if (!active) return;

        // 1. Shifts from backend
        let loadedShifts = [];
        if (shiftsRes.status === "fulfilled" && Array.isArray(shiftsRes.value)) {
          loadedShifts = shiftsRes.value;
          setShifts(loadedShifts);
        }

        // 2. Real staff members from backend
        let initialStaff = [];
        if (staffRes.status === "fulfilled" && Array.isArray(staffRes.value) && staffRes.value.length > 0) {
          initialStaff = staffRes.value.map((s) => ({
            id: s.employeeId || s.userId,
            name: s.fullName,
            title: s.assignmentRole === USER_ROLES.FACILITY_MANAGER ? "Facility Manager" : "Operations Staff",
            code: s.employeeCode,
            avatar: getStaffAvatar(s.employeeId || s.userId),
            standardHours: BUSINESS_CONFIG.WORKLOAD.STANDARD_SHIFT_HOURS_PER_WEEK,
            shifts: {}, // key: dayKey -> array of shifts
          }));
        }

        // 3. Merge Live Roster Assignments (shifts can be multiple per day)
        if (rosterRes.status === "fulfilled" && Array.isArray(rosterRes.value)) {
          const rosterItems = rosterRes.value;

          // Merge any employee from roster not yet in initialStaff
          rosterItems.forEach((item) => {
            if (!initialStaff.some((s) => s.id === item.employeeId)) {
              initialStaff.push({
                id: item.employeeId,
                name: item.employeeName || `Staff ${item.employeeCode}`,
                title: item.dutyRole === "shift_lead" ? "Shift Lead" : "Duty Staff",
                code: item.employeeCode || `EMP-${item.employeeId}`,
                avatar: getStaffAvatar(item.employeeId),
                standardHours: BUSINESS_CONFIG.WORKLOAD.STANDARD_SHIFT_HOURS_PER_WEEK,
                shifts: {},
              });
            }
          });

          // Map shifts into staff arrays
          rosterItems.forEach((item) => {
            const target = initialStaff.find((s) => s.id === item.employeeId);
            if (!target) return;

            const d = toLocalDateKey(item.startsAt);
            const nameLower = (item.shiftName || "").toLowerCase();

            const startDate = new Date(item.startsAt);
            const endDate = new Date(item.endsAt);
            const durationMs = endDate - startDate;
            const computedHours = Math.max(0, Math.round((durationMs / (1000 * 60 * 60)) * 10) / 10);
            const startHourVal = startDate.getHours();

            let type = "morning";
            let code = "MS";

            if (nameLower.includes("phép") || nameLower.includes("leave")) {
              type = "leave";
              code = "P";
            } else if (nameLower.includes("bù") || nameLower.includes("rest")) {
              type = "rest";
              code = "REST";
            } else if (computedHours >= 20 || nameLower.includes("24h") || nameLower.includes("24")) {
              type = "duty24h";
              code = "24H";
            } else if (nameLower.includes("đêm") || nameLower.includes("night") || startHourVal >= 21 || startHourVal < 4) {
              type = "night";
              code = "NS";
            } else if (nameLower.includes("chiều") || nameLower.includes("afternoon") || (startHourVal >= 12 && startHourVal < 21)) {
              type = "afternoon";
              code = "AS";
            } else {
              type = "morning";
              code = "MS";
            }

            const hours = (type === "leave" || type === "rest") ? 0 : (computedHours > 0 ? computedHours : 8);

            const startTime = new Date(item.startsAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });
            const endTime = new Date(item.endsAt).toLocaleTimeString("vi-VN", {
              hour: "2-digit",
              minute: "2-digit",
            });

            if (!target.shifts[d]) {
              target.shifts[d] = [];
            }

            const startHour = new Date(item.startsAt).getHours() + new Date(item.startsAt).getMinutes() / 60;
            let endHour = new Date(item.endsAt).getHours() + new Date(item.endsAt).getMinutes() / 60;
            if (endHour <= startHour) endHour += 24;

            target.shifts[d].push({
              shiftId: item.shiftId,
              type,
              name: item.shiftName,
              code,
              time: `${startTime} - ${endTime}`,
              location: item.dutyRole ? `Role: ${item.dutyRole}` : "Operations Area",
              hours,
              startHour,
              endHour,
              isDraft: false,
            });
          });
        }

        setStaffList(initialStaff);
        setBaselineStaffList(cloneRoster(initialStaff));
      })
      .catch((err) => {
        if (!active) return;
        setError(err?.message || "Failed to load shift roster from server.");
      })
      .finally(() => {
        if (active) setLoading(false);
      });

    return () => {
      active = false;
    };
  }, [facilityId, baseDate, reloadToken]);

  // Compute calculated staff roster with accurate hours & overtime
  const staffRosterWithHours = useMemo(() => {
    return staffList.map((staff) => {
      let actualHours = 0;
      Object.values(staff.shifts || {}).forEach((shList) => {
        if (Array.isArray(shList)) {
          shList.forEach((sh) => {
            actualHours += sh.hours || 0;
          });
        }
      });

      let hoursStatus = "exact";
      let hoursLabel = `${actualHours}h / 40h`;

      if (actualHours > 40) {
        hoursStatus = "overtime";
        hoursLabel = `${actualHours}h / 40h (+${actualHours - 40}h OT)`;
      } else if (actualHours < 40) {
        hoursStatus = "under";
        hoursLabel = `${actualHours}h / 40h`;
      }

      return {
        ...staff,
        actualHours,
        hoursStatus,
        hoursLabel,
      };
    });
  }, [staffList]);

  // Dynamic daily summary calculations
  const dailySummary = useMemo(() => {
    const summary = {};
    weekDays.forEach((day) => {
      let morning = 0;
      let afternoon = 0;
      let night = 0;

      staffList.forEach((s) => {
        const shList = s.shifts?.[day.key] || [];
        shList.forEach((sh) => {
          if (sh.type === "morning") morning++;
          else if (sh.type === "afternoon") afternoon++;
          else if (sh.type === "night" || sh.type === "duty24h") night++;
        });
      });

      const isShortage = night === 0 && (morning > 0 || afternoon > 0);
      summary[day.key] = {
        morning: `${morning} Staff`,
        afternoon: `${afternoon} Staff`,
        night: night > 0 ? `${night} Staff` : "Night Shortage",
        isShortage,
      };
    });
    return summary;
  }, [weekDays, staffList]);

  // Filtered staff list by search query
  const filteredStaff = useMemo(() => {
    if (!searchQuery.trim()) return staffRosterWithHours;
    const q = searchQuery.toLowerCase();
    return staffRosterWithHours.filter(
      (s) =>
        s.name.toLowerCase().includes(q) ||
        s.title.toLowerCase().includes(q) ||
        s.code.toLowerCase().includes(q)
    );
  }, [staffRosterWithHours, searchQuery]);

  const isDirty = useMemo(
    () => serializeRoster(staffList) !== serializeRoster(baselineStaffList),
    [staffList, baselineStaffList]
  );

  const applyDraftAssignment = (staff, dayKey, preset) => {
    const { startHour, endHour } = buildShiftTimes(dayKey, preset);
    const newShiftItem = {
      shiftId: `draft-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      type: preset.type,
      name: preset.name,
      code: preset.code,
      time: preset.time,
      location: preset.defaultLocation || "Operations Area",
      hours: preset.hours || 0,
      startHour,
      endHour,
      isDraft: true,
      allowPast: isPastDayKey(dayKey),
    };

    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staff.id) return s;
        const currentShifts = Array.isArray(s.shifts?.[dayKey]) ? [...s.shifts[dayKey]] : [];
        return {
          ...s,
          shifts: {
            ...s.shifts,
            [dayKey]: [...currentShifts, newShiftItem],
          },
        };
      })
    );

    setNotice(`Đã đưa ${preset.name} vào danh sách nháp cho ${staff.name} (${dayKey}). Nhấn "Lưu thay đổi" để áp dụng.`);
    setTimeout(() => setNotice(""), 3500);
  };

  const requestAssignPreset = (staff, dayKey, preset, { skipPastWarning = false } = {}) => {
    setError("");
    const existing = Array.isArray(staff.shifts?.[dayKey]) ? staff.shifts[dayKey] : [];
    const overlap = findOverlappingShift(existing, preset);
    if (overlap) {
      setError(`Trùng khung giờ trực! Nhân viên ${staff.name} đã có ca "${overlap.name}" (${overlap.time}) trên cùng ngày ${dayKey}. Không thể xếp ca trùng.`);
      return;
    }

    if (!skipPastWarning && isPastDayKey(dayKey)) {
      setPastWarning({
        staffId: staff.id,
        staffName: staff.name,
        dayKey,
        preset,
      });
      return;
    }

    applyDraftAssignment(staff, dayKey, preset);
  };

  // --- Drag and Drop Handlers ---
  const handleDragStart = (e, preset) => {
    setDraggingPreset(preset);
    e.dataTransfer.setData("application/json", JSON.stringify(preset));
    e.dataTransfer.effectAllowed = "copy";
  };

  const handleDragEnd = () => {
    setDraggingPreset(null);
    setDragOverCell(null);
  };

  const handleDragOver = (e, staff, dayKey) => {
    e.preventDefault();
    const existing = Array.isArray(staff.shifts?.[dayKey]) ? staff.shifts[dayKey] : [];
    const conflict = Boolean(draggingPreset && findOverlappingShift(existing, draggingPreset));
    e.dataTransfer.dropEffect = conflict ? "none" : "copy";
    if (
      dragOverCell?.employeeId !== staff.id ||
      dragOverCell?.dayKey !== dayKey ||
      dragOverCell?.conflict !== conflict
    ) {
      setDragOverCell({ employeeId: staff.id, dayKey, conflict });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = (e, staff, dayKey) => {
    e.preventDefault();
    setDragOverCell(null);

    let preset = draggingPreset;
    if (!preset) {
      try {
        const data = e.dataTransfer.getData("application/json");
        if (data) preset = JSON.parse(data);
      } catch {
        preset = null;
      }
    }

    if (!preset) return;
    requestAssignPreset(staff, dayKey, preset);
  };

  const handlePresetClick = (preset) => {
    if (selectedBrush?.type === preset.type) {
      setSelectedBrush(null);
    } else {
      setSelectedBrush(preset);
    }
  };

  const handleCellClick = (staff, dayKey) => {
    if (selectedBrush) {
      requestAssignPreset(staff, dayKey, selectedBrush);
    }
  };

  // Core assignment function: Appends shift so 1 employee can work multiple shifts in 1 day!
  const assignPresetToCell = async (staff, dayKey, preset) => {
    setError("");
    const previousStaffList = staffList;
    const previousShifts = shifts;

    // Build startsAt and endsAt ISO dates
    const [year, month, day] = dayKey.split("-").map(Number);
    const startHour = preset.startHour || 6;
    const endHour = preset.endHour || 14;

    const startDate = new Date(Date.UTC(year, month - 1, day, startHour, 0, 0));
    const endDate = new Date(Date.UTC(year, month - 1, day, endHour % 24, 0, 0));
    if (endHour >= 24) {
      endDate.setUTCDate(endDate.getUTCDate() + 1);
    }

    const tempShiftId = Date.now() + Math.floor(Math.random() * 1000);
    const newShiftItem = {
      shiftId: tempShiftId,
      type: preset.type,
      name: preset.name,
      code: preset.code,
      time: preset.time,
      location: preset.defaultLocation || "Operations Area",
      hours: preset.hours || 0,
    };

    // Optimistically APPEND shift into array for this day
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id !== staff.id) return s;
        const currentShifts = Array.isArray(s.shifts?.[dayKey]) ? [...s.shifts[dayKey]] : [];
        currentShifts.splice(shiftIndex, 1);
        return {
          ...s,
          shifts: {
            ...s.shifts,
            [dayKey]: currentShifts,
          },
        };
      })
    );

    setNotice(`Đã gỡ ca khỏi danh sách nháp của ${staff.name}. Nhấn Save để áp dụng.`);
    setTimeout(() => setNotice(""), 2500);
  };

  const confirmLeaveDraft = () => {
    if (!isDirty) return true;
    return window.confirm("Bạn đang có thay đổi nháp chưa lưu. Đổi tuần sẽ hủy các thay đổi này?");
  };

  const handlePrevWeek = () => {
    if (!confirmLeaveDraft()) return;
    setBaseDate((prev) => new Date(prev.getTime() - 7 * 86400000));
  };

  const handleNextWeek = () => {
    if (!confirmLeaveDraft()) return;
    setBaseDate((prev) => new Date(prev.getTime() + 7 * 86400000));
  };

  const handleCurrentWeek = () => {
    if (!confirmLeaveDraft()) return;
    setBaseDate(new Date());
  };

  const handleRevert = () => {
    setStaffList(cloneRoster(baselineStaffList));
    setPastWarning(null);
    setError("");
    setNotice("Đã hủy thay đổi nháp.");
    setTimeout(() => setNotice(""), 2500);
  };

  const handleConfirmPastAssign = () => {
    if (!pastWarning) return;
    const staff = staffList.find((s) => s.id === pastWarning.staffId);
    const preset = pastWarning.preset;
    const dayKey = pastWarning.dayKey;
    setPastWarning(null);
    if (staff && preset) {
      requestAssignPreset(staff, dayKey, preset, { skipPastWarning: true });
    }
  };

  const handleSave = async () => {
    if (!facilityId || !isDirty || saving) return;
    setSaving(true);
    setError("");

    try {
      const ops = [];
      for (const staff of staffList) {
        const base = baselineStaffList.find((s) => s.id === staff.id);
        const dayKeys = new Set([
          ...Object.keys(base?.shifts || {}),
          ...Object.keys(staff.shifts || {}),
        ]);
        dayKeys.forEach((dayKey) => {
          const baseShifts = base?.shifts?.[dayKey] || [];
          const curShifts = staff.shifts?.[dayKey] || [];
          const baseIds = new Set(baseShifts.map((s) => s.shiftId));
          const curIds = new Set(curShifts.map((s) => s.shiftId));
          curShifts.forEach((sh) => {
            if (!baseIds.has(sh.shiftId)) ops.push({ type: "add", staff, dayKey, shift: sh });
          });
          baseShifts.forEach((sh) => {
            if (!curIds.has(sh.shiftId) && sh.shiftId) {
              ops.push({ type: "remove", staff, shift: sh });
            }
          });
        });
      }

      // Group into assignmentsToDelete
      const assignmentsToDelete = [];
      for (const op of ops) {
        if (op.type === "remove") {
          const sid = Number(op.shift.shiftId);
          if (Number.isFinite(sid) && sid > 0) {
            assignmentsToDelete.push({
              shiftId: sid,
              employeeId: Number(op.staff.id),
            });
          }
        }
      }

      // Group into assignmentsToAdd
      const adds = ops.filter((op) => op.type === "add");
      const assignmentsToAdd = [];

      for (const op of adds) {
        const { startDate, endDate } = buildShiftTimes(op.dayKey, op.shift);
        const isPast = isPastDayKey(op.dayKey);

        let matchingShift = shifts.find(
          (sh) =>
            sh.shiftName?.toLowerCase() === op.shift.name.toLowerCase() &&
            toLocalDateKey(sh.startsAt) === op.dayKey
        );

        if (!matchingShift) {
          const created = await managerService.createShift(facilityId, {
            shiftName: op.shift.name,
            startsAt: startDate.toISOString(),
            endsAt: endDate.toISOString(),
            status: "planned",
            allowPast: isPast || Boolean(op.shift.allowPast),
          });
          matchingShift = created;
          if (created) {
            setShifts((prev) => [...prev, created]);
          }
        }

        if (matchingShift?.id) {
          assignmentsToAdd.push({
            shiftId: Number(matchingShift.id),
            employeeId: Number(op.staff.id),
            dutyRole: DUTY_ROLES[0]?.value || "staff",
            status: "scheduled",
            allowPast: isPast || Boolean(op.shift.allowPast),
          });
        }
      } catch (err) {
        // Rollback optimistic state when backend save fails
        setStaffList(previousStaffList);
        setShifts(previousShifts);
        setNotice("");
        const errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.errors?.join?.(", ") ||
          err?.message ||
          "Failed to save shift assignment";
        setError(errorMessage);
        setTimeout(() => setError(""), 5000);
      }

  // Delete individual shift from array
  const handleDeleteShift = async (staff, dayKey, shiftIndex, shiftItem) => {
    const previousStaffList = staffList;
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staff.id) {
          const currentShifts = Array.isArray(s.shifts?.[dayKey]) ? [...s.shifts[dayKey]] : [];
          currentShifts.splice(shiftIndex, 1);
          return {
            ...s,
            shifts: {
              ...s.shifts,
              [dayKey]: currentShifts,
            },
          };
        }
        return s;
      })
    );

    setNotice(`Removed shift for ${staff.name}.`);
    setTimeout(() => setNotice(""), 2500);

    if (facilityId && shiftItem?.shiftId) {
      try {
        await managerService.deleteShiftAssignment(facilityId, shiftItem.shiftId, staff.id);
      } catch (err) {
        // Rollback optimistic state when backend delete fails
        setStaffList(previousStaffList);
        setNotice("");
        const errorMessage =
          err?.response?.data?.message ||
          err?.response?.data?.errors?.join?.(", ") ||
          err?.message ||
          "Failed to remove shift assignment";
        setError(errorMessage);
        setTimeout(() => setError(""), 5000);
      }

      setTimeout(() => setNotice(""), 3500);
      setReloadToken((token) => token + 1);
    } catch (err) {
      setError(err?.message || "Không lưu được thay đổi lịch ca.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Header Bar: Title, Week Selector, Search */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-[22px] font-black tracking-tight text-[#0b1c30]">
            Staff Shift Roster
          </h1>
          <p className="mt-0.5 text-xs text-[#58657a]">
            Quick drag-and-drop shift scheduling, dynamic quota tracking, and multi-shift support per day.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Week Navigation Pills */}
          <div className="inline-flex items-center rounded-xl border border-[#dfe7f5] bg-white p-1 shadow-2xs">
            <button
              type="button"
              onClick={handlePrevWeek}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#58657a] hover:bg-[#f8faff] hover:text-[#0b1c30] transition"
              title="Previous week"
            >
              <span className="text-base font-bold">‹</span>
            </button>

            <button
              type="button"
              onClick={handleCurrentWeek}
              className="px-3 text-xs font-bold text-[#0b1c30] hover:text-[#1d5fe5] transition"
              title="Jump to current week"
            >
              {weekLabel}
            </button>

            <button
              type="button"
              onClick={handleNextWeek}
              className="flex h-8 w-8 items-center justify-center rounded-lg text-[#58657a] hover:bg-[#f8faff] hover:text-[#0b1c30] transition"
              title="Next week"
            >
              <span className="text-base font-bold">›</span>
            </button>
          </div>

          {/* Quick search input */}
          <div>
            <input
              type="text"
              placeholder="Search staff name, code..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="h-9 w-48 rounded-xl border border-[#dfe7f5] bg-white px-3 text-xs font-medium text-[#0b1c30] outline-none transition focus:w-60 focus:border-[#1d5fe5]"
            />
          </div>

          <button
            type="button"
            onClick={handleRevert}
            disabled={!isDirty || saving}
            className="inline-flex h-9 items-center gap-1 rounded-xl border border-[#dfe7f5] bg-white px-3 text-xs font-bold text-[#475467] transition hover:bg-[#f8faff] disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">undo</span>
            Huỷ (Revert)
          </button>
          <button
            type="button"
            onClick={handleSave}
            disabled={!isDirty || saving}
            className="inline-flex h-9 items-center gap-1.5 rounded-xl bg-[#1d5fe5] px-3.5 text-xs font-bold text-white transition hover:bg-[#1554d1] shadow-2xs disabled:cursor-not-allowed disabled:opacity-40"
          >
            <span className="material-symbols-outlined text-[16px]">save</span>
            {saving ? "Đang lưu..." : "Lưu thay đổi (Save)"}
          </button>
        </div>
      </div>

      {/* DRAGGABLE SHIFT PRESETS TOOLBAR (Clean strip: NO pan_tool icon, NO title header) */}
      <div className="flex flex-wrap items-center justify-between gap-2.5 rounded-2xl border border-[#dfe7f5] bg-white p-2.5 shadow-2xs">
        <div className="flex flex-wrap items-center gap-2">
          {SHIFT_PRESETS.map((preset) => {
            const isSelectedBrush = selectedBrush?.type === preset.type;
            return (
              <div
                key={preset.type}
                draggable
                onDragStart={(e) => handleDragStart(e, preset)}
                onDragEnd={handleDragEnd}
                onClick={() => handlePresetClick(preset)}
                title="Drag and drop onto a date cell or click to select brush"
                className={`group relative flex cursor-grab items-center gap-1.5 rounded-xl border px-3 py-1.5 transition select-none active:cursor-grabbing hover:shadow-md hover:-translate-y-0.5 ${
                  preset.containerClass
                } ${
                  isSelectedBrush ? "ring-2 ring-offset-1 ring-[#1d5fe5] scale-[1.03]" : ""
                }`}
              >
                <span className="text-xs font-black">{preset.name}</span>
                <span className={`rounded px-1.5 py-0.5 text-[9px] font-black uppercase ${preset.codeClass}`}>
                  {preset.code}
                </span>
                <span className="font-mono text-[11px] font-extrabold opacity-90">
                  {preset.time}
                </span>
                {preset.hours > 0 && (
                  <span className="rounded-full bg-white/80 px-1.5 py-0.2 text-[9px] font-black shadow-2xs">
                    {preset.hours}h
                  </span>
                )}
              </div>
            );
          })}
        </div>

        {selectedBrush && (
          <button
            type="button"
            onClick={() => setSelectedBrush(null)}
            className="inline-flex items-center gap-1 rounded-xl border border-[#fda29b] bg-[#fffbfa] px-2.5 py-1 text-[11px] font-bold text-[#b42318] hover:bg-[#fee4e2] transition shadow-2xs"
          >
            Cancel ({selectedBrush.name})
          </button>
        )}
      </div>

      {isDirty && (
        <div className="flex items-center gap-2 rounded-xl border border-[#fedf89] bg-[#fffcf5] px-4 py-2.5 text-xs font-bold text-[#b54708]">
          <span className="material-symbols-outlined text-[18px]">edit_note</span>
          <span>Đang có thay đổi nháp. Nhấn Save để lưu hoặc Huỷ (Revert) để hoàn tác.</span>
        </div>
      )}

      {notice && (
        <div role="status" className="flex items-center gap-2 rounded-xl bg-[#ecfdf3] px-4 py-2.5 text-xs font-bold text-[#027a48] border border-[#a6f4c5]">
          <span>{notice}</span>
        </div>
      )}

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-xl bg-[#fff1f3] px-4 py-2.5 text-xs font-bold text-[#b42318] border border-[#fecdca]">
          <span>{error}</span>
        </div>
      )}

      {/* Main Roster Matrix Table */}
      <div className="overflow-hidden rounded-2xl border border-[#eaecf0] bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full min-w-[1100px] border-collapse text-left">
            {/* Table Header */}
            <thead>
              <tr className="border-b border-[#eaecf0] bg-white text-xs font-bold">
                {/* Staff Column Header */}
                <th className="w-[280px] min-w-[280px] p-3.5 align-middle border-r border-[#eaecf0] bg-white">
                  <div className="flex items-center justify-between">
                    <span className="font-black uppercase tracking-wider text-[#0b1c30]">
                      ON-DUTY STAFF ({filteredStaff.length})
                    </span>
                    <span className="rounded-full bg-[#f2f4f7] px-2 py-0.5 text-[10px] font-bold text-[#475467]">
                      Standard: ${BUSINESS_CONFIG.WORKLOAD.STANDARD_SHIFT_HOURS_PER_WEEK}h
                    </span>
                  </div>
                </th>

                {/* Day Columns */}
                {weekDays.map((day) => (
                  <th
                    key={day.key}
                    className={`min-w-[175px] p-3 text-center align-middle border-r border-[#eaecf0] transition ${
                      day.isToday
                        ? "bg-[#f8faff] border-t-4 border-t-[#1d5fe5]"
                        : day.isPast
                        ? "bg-[#fffbfa] border-t-4 border-t-[#fda29b]"
                        : "bg-white"
                    }`}
                  >
                    {day.isToday && (
                      <div className="inline-block rounded-full bg-[#1d5fe5] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white mb-1 shadow-2xs">
                        TODAY
                      </div>
                    )}
                    {day.isPast && (
                      <div className="inline-block rounded-full bg-[#fee4e2] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-[#b42318] mb-1">
                        PAST
                      </div>
                    )}
                    <div className={`text-[12px] font-medium ${day.isToday ? "text-[#1d5fe5] font-extrabold" : day.isPast ? "text-[#b42318]" : "text-[#475467]"}`}>
                      {day.dayName}
                    </div>
                    <div className={`mt-0.5 text-base font-black ${day.isToday ? "text-[#1d5fe5]" : day.isPast ? "text-[#912018]" : "text-[#0b1c30]"}`}>
                      {day.dateFormatted}
                    </div>
                  </th>
                ))}
              </tr>
            </thead>

            {/* Table Body: Staff Rows */}
            <tbody className="divide-y divide-[#eaecf0]">
              {loading ? (
                <tr>
                  <td colSpan={weekDays.length + 1} className="py-12 text-center text-xs font-bold text-[#8996a9]">
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-[#1d5fe5] border-t-transparent mb-2" />
                    <div>Syncing staff and shift roster from server...</div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={weekDays.length + 1} className="py-10 text-center text-xs font-semibold text-[#8996a9]">
                    No staff members found for this facility.
                  </td>
                </tr>
              ) : (
                filteredStaff.map((staff) => (
                  <tr key={staff.id} className="hover:bg-[#fcfdfd] transition">
                    {/* Left Column: Staff Card */}
                    <td className="w-[280px] min-w-[280px] p-3.5 align-top border-r border-[#eaecf0] bg-white">
                      <div className="flex items-start gap-3">
                        <div className="relative shrink-0">
                          <img
                            src={staff.avatar}
                            alt={staff.name}
                            className="h-10 w-10 rounded-full object-cover border border-[#eaecf0]"
                          />
                          <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full border-2 border-white bg-[#12b76a]" />
                        </div>

                        <div className="min-w-0 flex-1">
                          <div className="truncate text-[13px] font-extrabold text-[#0b1c30]">
                            {staff.name}
                          </div>
                          <div className="truncate text-[11px] font-medium text-[#475467]">
                            {staff.title} • {staff.code}
                          </div>

                          {/* Hours status badge */}
                          <div className="mt-1.5">
                            {staff.hoursStatus === "overtime" ? (
                              <span className="inline-block rounded-md border border-[#fedf89] bg-[#fef0c7] px-2 py-0.5 text-[10px] font-black text-[#b54708]">
                                {staff.hoursLabel}
                              </span>
                            ) : staff.hoursStatus === "under" ? (
                              <span className="inline-block rounded-md border border-[#a6f4c5] bg-[#ecfdf3] px-2 py-0.5 text-[10px] font-black text-[#027a48]">
                                {staff.hoursLabel}
                              </span>
                            ) : (
                              <span className="inline-block rounded-md border border-[#a6f4c5] bg-[#d1fadf] px-2 py-0.5 text-[10px] font-black text-[#027a48]">
                                {staff.hoursLabel}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    </td>

                    {/* Day Cells: Supports multiple shifts per day + minimalist '+' drop target */}
                    {weekDays.map((day) => {
                      const rawShifts = Array.isArray(staff.shifts?.[day.key])
                        ? staff.shifts[day.key]
                        : staff.shifts?.[day.key]
                        ? [staff.shifts[day.key]]
                        : [];
                      const dayShifts = markOverlappingShifts(rawShifts);

                      const isDropTarget =
                        dragOverCell?.employeeId === staff.id && dragOverCell?.dayKey === day.key;
                      const isConflictDrop = isDropTarget && dragOverCell?.conflict;

                      return (
                        <td
                          key={day.key}
                          onDragOver={(e) => handleDragOver(e, staff, day.key)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, staff, day.key)}
                          className={`min-w-[175px] p-2 align-top border-r border-[#eaecf0] transition-colors ${
                            day.isToday ? "bg-[#f8faff]/50" : day.isPast ? "bg-[#fffbfa]/70" : ""
                          } ${isConflictDrop ? "bg-[#fff1f3]" : isDropTarget ? "bg-[#eef4ff]/70" : ""}`}
                        >
                          <div className="flex flex-col gap-1.5 min-h-[92px]">
                            {/* Render all shifts assigned for this employee on this day */}
                            {dayShifts.map((sh, idx) => (
                              <ShiftCard
                                key={sh.shiftId || idx}
                                shift={sh}
                                onDelete={() => handleDeleteShift(staff, day.key, idx)}
                              />
                            ))}

                            <div
                              onClick={() => handleCellClick(staff, day.key)}
                              className={`group flex items-center justify-center rounded-[12px] border border-dashed transition cursor-pointer ${
                                dayShifts.length > 0
                                  ? "h-8 hover:border-[#1d5fe5] hover:bg-[#eef4ff]/40"
                                  : "flex-1 min-h-[92px]"
                              } ${
                                isConflictDrop
                                  ? "border-2 border-[#d92d20] bg-[#fee4e2] shadow-inner"
                                  : isDropTarget
                                  ? "border-2 border-[#1d5fe5] bg-[#eef4ff] shadow-inner scale-[1.01]"
                                  : "border-[#2b64e3] border-[1.5px] bg-[#fafcff] hover:bg-[#eef4ff]/40"
                              }`}
                              title={
                                isConflictDrop
                                  ? "Khung giờ trùng — không thể thả ca này"
                                  : selectedBrush
                                  ? `Click to assign ${selectedBrush.name}`
                                  : "Drag and drop shift here"
                              }
                            >
                              <span className="text-lg font-bold text-[#2062eb] group-hover:scale-125 transition">
                                +
                              </span>
                            </div>
                          </div>
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

            {/* Bottom Summary Row: SHIFT ROSTER SUMMARY */}
            <tfoot>
              <tr className="border-t-2 border-[#eaecf0] bg-[#f8f9fc] text-xs">
                <td className="w-[280px] min-w-[280px] p-3.5 align-middle border-r border-[#eaecf0]">
                  <div className="font-black uppercase tracking-wider text-[#0b1c30]">
                    SHIFT ROSTER SUMMARY
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium text-[#475467]">
                    Staffing coverage & workload
                  </div>
                </td>

                {weekDays.map((day) => {
                  const summary = dailySummary[day.key] || {
                    morning: "0 Staff",
                    afternoon: "0 Staff",
                    night: "0 Staff",
                    isShortage: false,
                  };

                  return (
                    <td
                      key={day.key}
                      className={`min-w-[175px] p-2.5 align-middle border-r border-[#eaecf0] text-center ${
                        day.isToday ? "bg-[#f0f4ff]/50" : ""
                      }`}
                    >
                      <div className="flex flex-col items-center gap-1">
                        <div className="text-[11px] font-bold text-[#027a48]">
                          Morning: {summary.morning}
                        </div>
                        <div className="text-[11px] font-bold text-[#b54708]">
                          Afternoon: {summary.afternoon}
                        </div>
                        <div
                          className={`text-[11px] font-black ${
                            summary.isShortage ? "text-[#d92d20]" : "text-[#3538cd]"
                          }`}
                        >
                          Night: {summary.night}
                        </div>
                      </div>
                    </td>
                  );
                })}
              </tr>
            </tfoot>
          </table>
        </div>
      </div>

      {pastWarning && (
        <dialog
          open
          aria-labelledby="past-shift-warning-title"
          className="fixed inset-0 z-50 m-auto w-[calc(100%-2rem)] max-w-md rounded-2xl border border-[#fedf89] bg-white p-5 text-[#0b1c30] shadow-xl backdrop:bg-black/40"
        >
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#fef0c7] text-[#b54708]">
              <span className="material-symbols-outlined text-[22px]">warning</span>
            </span>
            <div>
              <h2 id="past-shift-warning-title" className="text-sm font-black text-[#b54708]">
                Cảnh báo xếp lịch trong quá khứ
              </h2>
              <p className="mt-1.5 text-xs font-medium leading-5 text-[#475467]">
                Ngày <span className="font-bold text-[#0b1c30]">{pastWarning.dayKey}</span> là ngày trong quá khứ.
                Bạn có chắc chắn muốn xếp ca <span className="font-bold text-[#0b1c30]">{pastWarning.preset?.name}</span>{" "}
                ({pastWarning.preset?.time}) cho nhân viên <span className="font-bold text-[#0b1c30]">{pastWarning.staffName}</span>?
              </p>
            </div>
          </div>
          <div className="mt-5 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setPastWarning(null)}
              className="h-9 rounded-xl border border-[#dfe7f5] px-3 text-xs font-bold text-[#475467] hover:bg-[#f8faff]"
            >
              Huỷ bỏ
            </button>
            <button
              type="button"
              onClick={handleConfirmPastAssign}
              className="h-9 rounded-xl bg-[#b54708] px-3 text-xs font-bold text-white hover:bg-[#93370d]"
            >
              Xác nhận xếp lịch quá khứ
            </button>
          </div>
        </dialog>
      )}
    </div>
  );
}

export default ManagerShifts;
