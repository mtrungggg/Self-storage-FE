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
  const [shifts, setShifts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [notice, setNotice] = useState("");
  const [error, setError] = useState("");

  // Drag-and-drop & brush tool states
  const [draggingPreset, setDraggingPreset] = useState(null);
  const [dragOverCell, setDragOverCell] = useState(null); // { employeeId, dayKey }
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

            const d = new Date(item.startsAt).toISOString().slice(0, 10);
            const nameLower = (item.shiftName || "").toLowerCase();

            let type = "morning";
            let code = "MS";
            let hours = 8;
            if (nameLower.includes("chiều") || nameLower.includes("afternoon")) {
              type = "afternoon";
              code = "AS";
            } else if (nameLower.includes("đêm") || nameLower.includes("night")) {
              type = "night";
              code = "NS";
            } else if (nameLower.includes("24h") || nameLower.includes("24")) {
              type = "duty24h";
              code = "24H";
              hours = 24;
            } else if (nameLower.includes("phép") || nameLower.includes("leave")) {
              type = "leave";
              code = "P";
              hours = 0;
            } else if (nameLower.includes("bù") || nameLower.includes("rest")) {
              type = "rest";
              code = "REST";
              hours = 0;
            }

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

            target.shifts[d].push({
              shiftId: item.shiftId,
              type,
              name: item.shiftName,
              code,
              time: `${startTime} - ${endTime}`,
              location: item.dutyRole ? `Role: ${item.dutyRole}` : "Operations Area",
              hours,
            });
          });
        }

        setStaffList(initialStaff);
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
  }, [facilityId, baseDate]);

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

  const handleDragOver = (e, employeeId, dayKey) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = "copy";
    if (dragOverCell?.employeeId !== employeeId || dragOverCell?.dayKey !== dayKey) {
      setDragOverCell({ employeeId, dayKey });
    }
  };

  const handleDragLeave = () => {
    setDragOverCell(null);
  };

  const handleDrop = async (e, staff, dayKey) => {
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
    await assignPresetToCell(staff, dayKey, preset);
  };

  // Click brush tool / direct cell click
  const handlePresetClick = (preset) => {
    if (selectedBrush?.type === preset.type) {
      setSelectedBrush(null);
    } else {
      setSelectedBrush(preset);
    }
  };

  const handleCellClick = async (staff, dayKey) => {
    if (selectedBrush) {
      // If brush tool active, assign selected brush directly to this cell
      await assignPresetToCell(staff, dayKey, selectedBrush);
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
        if (s.id === staff.id) {
          const currentShifts = Array.isArray(s.shifts?.[dayKey]) ? [...s.shifts[dayKey]] : [];
          currentShifts.push(newShiftItem);
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

    setNotice(`Assigned ${preset.name} (${preset.time}) to ${staff.name} on ${dayKey}!`);
    setTimeout(() => setNotice(""), 3000);

    // Call backend API in background
    if (facilityId) {
      try {
        let matchingShift = shifts.find(
          (sh) =>
            sh.shiftName?.toLowerCase() === preset.name.toLowerCase() &&
            new Date(sh.startsAt).toISOString().slice(0, 10) === dayKey
        );

        if (!matchingShift) {
          const created = await managerService.createShift(facilityId, {
            shiftName: preset.name,
            startsAt: startDate.toISOString(),
            endsAt: endDate.toISOString(),
            status: "open",
          });
          matchingShift = created;
          if (created) {
            setShifts((prev) => [...prev, created]);
          }
        }

        if (matchingShift?.id) {
          await managerService.createShiftAssignment(facilityId, {
            shiftId: matchingShift.id,
            employeeId: staff.id,
            dutyRole: DUTY_ROLES[0].value,
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
    }
  };

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
    }
  };

  // Navigation handlers
  const handlePrevWeek = () => {
    setBaseDate((prev) => new Date(prev.getTime() - 7 * 86400000));
  };

  const handleNextWeek = () => {
    setBaseDate((prev) => new Date(prev.getTime() + 7 * 86400000));
  };

  const handleCurrentWeek = () => {
    setBaseDate(new Date());
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
                      day.isToday ? "bg-[#f8faff] border-t-4 border-t-[#1d5fe5]" : "bg-white"
                    }`}
                  >
                    {day.isToday && (
                      <div className="inline-block rounded-full bg-[#1d5fe5] px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white mb-1 shadow-2xs">
                        TODAY
                      </div>
                    )}
                    <div className={`text-[12px] font-medium ${day.isToday ? "text-[#1d5fe5] font-extrabold" : "text-[#475467]"}`}>
                      {day.dayName}
                    </div>
                    <div className={`mt-0.5 text-base font-black ${day.isToday ? "text-[#1d5fe5]" : "text-[#0b1c30]"}`}>
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
                      const dayShifts = Array.isArray(staff.shifts?.[day.key])
                        ? staff.shifts[day.key]
                        : staff.shifts?.[day.key]
                        ? [staff.shifts[day.key]]
                        : [];

                      const isDropTarget =
                        dragOverCell?.employeeId === staff.id && dragOverCell?.dayKey === day.key;

                      return (
                        <td
                          key={day.key}
                          onDragOver={(e) => handleDragOver(e, staff.id, day.key)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, staff, day.key)}
                          className={`min-w-[175px] p-2 align-top border-r border-[#eaecf0] transition-colors ${
                            day.isToday ? "bg-[#f8faff]/50" : ""
                          } ${isDropTarget ? "bg-[#eef4ff]/70" : ""}`}
                        >
                          <div className="flex flex-col gap-1.5 min-h-[92px]">
                            {/* Render all shifts assigned for this employee on this day */}
                            {dayShifts.map((sh, idx) => (
                              <ShiftCard
                                key={sh.shiftId || idx}
                                shift={sh}
                                onDelete={() => handleDeleteShift(staff, day.key, idx, sh)}
                              />
                            ))}

                            {/* Minimalist '+' Drop Target / Brush Click (NO popup dialog) */}
                            <div
                              onClick={() => handleCellClick(staff, day.key)}
                              className={`group flex items-center justify-center rounded-[12px] border border-dashed transition cursor-pointer ${
                                dayShifts.length > 0
                                  ? "h-8 hover:border-[#1d5fe5] hover:bg-[#eef4ff]/40"
                                  : "flex-1 min-h-[92px]"
                              } ${
                                isDropTarget
                                  ? "border-2 border-[#1d5fe5] bg-[#eef4ff] shadow-inner scale-[1.01]"
                                  : "border-[#2b64e3] border-[1.5px] bg-[#fafcff] hover:bg-[#eef4ff]/40"
                              }`}
                              title={
                                selectedBrush
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
    </div>
  );
}

export default ManagerShifts;
