import { useLanguage } from "../context/LanguageContext";
import { useEffect, useMemo, useRef, useState } from "react";
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

// Component: Individual Shift Card (Compact Mode)
function ShiftCard({ shift, onDelete }) {
  const DeleteButton = () => (
    <button
      type="button"
      onClick={(e) => {
        e.stopPropagation();
        onDelete?.();
      }}
      className="absolute -top-1 -right-1 z-10 hidden group-hover:flex h-4 w-4 items-center justify-center rounded-full bg-white text-[#d92d20] shadow-sm border border-[#fda29b] hover:bg-[#fee4e2] transition cursor-pointer"
      title="Xóa ca này"
    >
      <span className="text-[10px] font-bold leading-none">✕</span>
    </button>
  );

  // 1. Morning Shift (MS)
  if (shift.type === "morning") {
    return (
      <div className="group relative rounded-lg border border-[#a6f4c5] bg-[#eefdf5] py-1 px-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[11px] font-bold text-[#027a48]">{shift.name}</span>
          <span className="shrink-0 rounded bg-[#d1fadf] px-1 py-0.2 text-[9px] font-black uppercase text-[#027a48]">
            {shift.code || "MS"}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] font-extrabold text-[#054f31]">
          <span>{shift.time}</span>
          {shift.location && (
            <span className="truncate text-[9px] font-medium text-[#027a48] max-w-[75px]" title={shift.location}>
              {shift.location.replace(/^Role:\s*/, "")}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 2. Afternoon Shift (AS)
  if (shift.type === "afternoon") {
    return (
      <div className="group relative rounded-lg border border-[#fedf89] bg-[#fef9ee] py-1 px-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[11px] font-bold text-[#b54708]">{shift.name}</span>
          <span className="shrink-0 rounded bg-[#fef0c7] px-1 py-0.2 text-[9px] font-black uppercase text-[#b54708]">
            {shift.code || "AS"}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] font-extrabold text-[#7a2e05]">
          <span>{shift.time}</span>
          {shift.location && (
            <span className="truncate text-[9px] font-medium text-[#b54708] max-w-[75px]" title={shift.location}>
              {shift.location.replace(/^Role:\s*/, "")}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 3. Night Shift (NS)
  if (shift.type === "night") {
    return (
      <div className="group relative rounded-lg border border-[#c7d7fe] bg-[#f5f6ff] py-1 px-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[11px] font-bold text-[#3538cd]">{shift.name}</span>
          <span className="shrink-0 rounded bg-[#e0eaff] px-1 py-0.2 text-[9px] font-black uppercase text-[#3538cd]">
            {shift.code || "NS"}
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] font-extrabold text-[#282d97]">
          <span>{shift.time}</span>
          {shift.location && (
            <span className="truncate text-[9px] font-medium text-[#444ce7] max-w-[75px]" title={shift.location}>
              {shift.location.replace(/^Role:\s*/, "")}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 4. Night Shift - Conflict / Warning
  if (shift.type === "night_conflict" || shift.warning) {
    return (
      <div className="group relative rounded-lg border border-[#fecdca] bg-[#fff1f3] py-1 px-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[11px] font-bold text-[#b42318]">{shift.name}</span>
          <span className="shrink-0 inline-flex items-center gap-0.5 rounded bg-[#fee4e2] px-1 py-0.2 text-[9px] font-extrabold text-[#d92d20]">
            <span>{shift.warning || "Conflict"}</span>
          </span>
        </div>
        <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] font-extrabold text-[#912018]">
          <span>{shift.time}</span>
          {shift.location && (
            <span className="truncate text-[9px] font-medium text-[#b42318] max-w-[75px]" title={shift.location}>
              {shift.location.replace(/^Role:\s*/, "")}
            </span>
          )}
        </div>
      </div>
    );
  }

  // 5. Leave
  if (shift.type === "leave") {
    return (
      <div className="group relative flex min-h-[44px] flex-col items-center justify-center rounded-lg border border-[#e9d7fe] bg-[#faf5ff] py-1 px-2 text-center transition hover:shadow-xs">
        <DeleteButton />
        <div className="text-[11px] font-extrabold text-[#6941c6]">{shift.name}</div>
        <div className="text-[9px] font-medium text-[#7f56d9]">{shift.location || "Annual Leave"}</div>
      </div>
    );
  }

  // 6. Rest Day / REST
  if (shift.type === "rest") {
    return (
      <div className="group relative flex min-h-[44px] flex-col items-center justify-center rounded-lg border border-[#e4e7ec] bg-[#f8f9fc] py-1 px-2 text-center transition hover:shadow-xs">
        <DeleteButton />
        <div className="text-[11px] font-black uppercase tracking-wider text-[#475467]">{shift.name}</div>
        <div className="text-[9px] font-bold uppercase tracking-widest text-[#98a2b3]">{shift.code || "REST"}</div>
      </div>
    );
  }

  // 7. 24h Shift
  if (shift.type === "duty24h") {
    return (
      <div className="group relative rounded-lg border border-[#99f6e4] bg-[#f0fdf9] py-1 px-2 transition hover:shadow-xs">
        <DeleteButton />
        <div className="flex items-center justify-between gap-1">
          <span className="truncate text-[11px] font-bold text-[#0f766e]">{shift.name}</span>
          <span className="shrink-0 rounded bg-[#ccfbf1] px-1 py-0.2 text-[9px] font-black text-[#0f766e]">24H</span>
        </div>
        <div className="mt-0.5 flex items-center justify-between font-mono text-[10px] font-extrabold text-[#115e59]">
          <span>{shift.time}</span>
          {shift.location && (
            <span className="truncate text-[9px] font-medium text-[#0f766e] max-w-[75px]" title={shift.location}>
              {shift.location.replace(/^Role:\s*/, "")}
            </span>
          )}
        </div>
      </div>
    );
  }

  return (
    <div className="group relative rounded-lg border border-[#dfe7f5] bg-white py-1 px-2 text-xs text-[#0b1c30] hover:shadow-xs transition">
      <DeleteButton />
      <div className="font-bold text-[11px]">{shift.name}</div>
      <div className="text-[9px] text-[#8996a9]">{shift.time}</div>
    </div>
  );
}

function ManagerShifts() {
  const { t, formatCurrency, translateStatus } = useLanguage();
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
  const [activeCellPopover, setActiveCellPopover] = useState(null); // { staffId, dayKey }
  const [isAutoFilling, setIsAutoFilling] = useState(false);
  const popoverRef = useRef(null);

  // Close floating quick-assign popover when clicking outside
  useEffect(() => {
    if (!activeCellPopover) return;
    const handleOutsideClick = (e) => {
      if (popoverRef.current && !popoverRef.current.contains(e.target)) {
        setActiveCellPopover(null);
      }
    };
    document.addEventListener("mousedown", handleOutsideClick);
    return () => {
      document.removeEventListener("mousedown", handleOutsideClick);
    };
  }, [activeCellPopover]);

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

        // 2. Real staff members from backend (Strictly filter out Facility Managers)
        let initialStaff = [];
        if (staffRes.status === "fulfilled" && Array.isArray(staffRes.value) && staffRes.value.length > 0) {
          initialStaff = staffRes.value
            .filter((s) => {
              const role = String(s.assignmentRole || s.role || "").toLowerCase();
              return (
                role !== USER_ROLES.FACILITY_MANAGER.toLowerCase() &&
                role !== "facility_manager" &&
                role !== "manager" &&
                s.assignmentRole !== USER_ROLES.FACILITY_MANAGER
              );
            })
            .map((s) => ({
              id: s.employeeId || s.userId,
              name: s.fullName,
              title: s.dutyRole === "shift_lead" ? "Shift Lead" : "Operations Staff",
              code: s.employeeCode,
              avatar: getStaffAvatar(s.employeeId || s.userId),
              standardHours: BUSINESS_CONFIG.WORKLOAD.STANDARD_SHIFT_HOURS_PER_WEEK,
              shifts: {}, // key: dayKey -> array of shifts
            }));
        }

        // 3. Merge Live Roster Assignments (shifts can be multiple per day)
        if (rosterRes.status === "fulfilled" && Array.isArray(rosterRes.value)) {
          const rosterItems = rosterRes.value;

          // Merge any employee from roster not yet in initialStaff (excluding managers)
          rosterItems.forEach((item) => {
            const dutyRole = String(item.dutyRole || "").toLowerCase();
            if (dutyRole === "manager" || dutyRole === "facility_manager") return;
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

            const startTime = new Date(item.startsAt).toLocaleTimeString("en-GB", {
              timeZone: "UTC",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
            });
            const endTime = new Date(item.endsAt).toLocaleTimeString("en-GB", {
              timeZone: "UTC",
              hour: "2-digit",
              minute: "2-digit",
              hour12: false,
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

  // Helper to determine if two shift intervals on the same day overlap
  const isShiftOverlapping = (presetA, presetB) => {
    const hoursMap = {
      morning: { start: 6, end: 14 },
      afternoon: { start: 14, end: 22 },
      night: { start: 22, end: 30 },
      duty24h: { start: 8, end: 32 },
      leave: { start: 0, end: 24 },
      rest: { start: 0, end: 24 },
    };
    const a = hoursMap[presetA.type] || { start: presetA.startHour || 6, end: presetA.endHour || 14 };
    const b = hoursMap[presetB.type] || { start: presetB.startHour || 6, end: presetB.endHour || 14 };
    return Math.max(a.start, b.start) < Math.min(a.end, b.end);
  };

  // Core assignment function: Intelligently handles multiple shifts or replaces overlapping ones
  const assignPresetToCell = async (staff, dayKey, preset) => {
    setError("");

    const existingShifts = Array.isArray(staff.shifts?.[dayKey]) ? staff.shifts[dayKey] : [];
    const alreadyHasThisShift = existingShifts.some(
      (s) => s.type === preset.type || s.name?.toLowerCase() === preset.name?.toLowerCase()
    );
    if (alreadyHasThisShift) {
      setNotice(`${staff.name} đã được phân ${preset.name} vào ngày ${dayKey}.`);
      setTimeout(() => setNotice(""), 3000);
      return;
    }

    // Find any existing shifts that overlap in time with the new preset
    const conflictingShifts = existingShifts.filter((s) => isShiftOverlapping(s, preset));

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

    // Optimistically update: remove conflicting shifts and append new one
    setStaffList((prev) =>
      prev.map((s) => {
        if (s.id === staff.id) {
          const nonConflictingShifts = (s.shifts?.[dayKey] || []).filter(
            (cur) => !conflictingShifts.some((c) => c.shiftId === cur.shiftId)
          );
          return {
            ...s,
            shifts: {
              ...s.shifts,
              [dayKey]: [...nonConflictingShifts, newShiftItem],
            },
          };
        }
        return s;
      })
    );

    if (conflictingShifts.length > 0) {
      setNotice(`Đã chuyển sang ${preset.name} (${preset.time}) cho ${staff.name}.`);
    } else {
      setNotice(`Đã phân ${preset.name} (${preset.time}) cho ${staff.name}!`);
    }
    setTimeout(() => setNotice(""), 3000);

    // Call backend API in background
    if (facilityId) {
      try {
        // 1. Delete conflicting assignments on backend first to prevent overlap errors
        for (const conf of conflictingShifts) {
          if (conf.shiftId) {
            try {
              await managerService.deleteShiftAssignment(facilityId, conf.shiftId, staff.id);
            } catch (delErr) {
              console.warn("Could not remove old conflicting shift:", delErr);
            }
          }
        }

        // 2. Find or create matching shift template
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
            allowPast: true,
          });
          matchingShift = created;
          if (created) {
            setShifts((prev) => [...prev, created]);
          }
        }

        // 3. Assign the new shift
        if (matchingShift?.id) {
          await managerService.createShiftAssignment(facilityId, {
            shiftId: matchingShift.id,
            employeeId: staff.id,
            dutyRole: DUTY_ROLES[0].value,
            allowPast: true,
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
          "Không thể lưu phân ca làm việc";
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

  const handlePlusClick = (e, staff, dayKey) => {
    e.stopPropagation();
    if (selectedBrush) {
      assignPresetToCell(staff, dayKey, selectedBrush);
      return;
    }
    setActiveCellPopover((prev) =>
      prev && prev.staffId === staff.id && prev.dayKey === dayKey
        ? null
        : { staffId: staff.id, dayKey }
    );
  };

  const handleQuickAssignFromPopover = async (staff, dayKey, presetType) => {
    const preset = SHIFT_PRESETS.find((p) => p.type === presetType);
    if (preset) {
      await assignPresetToCell(staff, dayKey, preset);
    }
    setActiveCellPopover(null);
  };

  const handleAutoFillWeek = async () => {
    if (staffList.length === 0) {
      setError("Không tìm thấy nhân viên vận hành nào để phân ca.");
      return;
    }
    if (!facilityId) {
      setError("Vui lòng chọn cơ sở kho trước khi phân ca.");
      return;
    }

    setIsAutoFilling(true);
    setNotice("Đang tính toán phân bổ tối ưu 7 ngày (Sáng, Chiều, Đêm)...");
    setError("");

    try {
      // 1. Chuẩn bị bản sao dữ liệu staff và shifts
      let updatedStaffList = staffList.map((s) => ({
        ...s,
        shifts: { ...(s.shifts || {}) },
      }));
      let newShiftsPool = [...shifts];
      const shiftCache = new Map();

      // Tính tổng số giờ làm việc hiện tại của từng nhân viên trong tuần
      const hoursMap = {};
      updatedStaffList.forEach((s) => {
        let h = 0;
        Object.values(s.shifts || {}).forEach((shList) => {
          if (Array.isArray(shList)) {
            shList.forEach((sh) => {
              h += sh.hours || 0;
            });
          }
        });
        hoursMap[s.id] = h;
      });

      // Đếm số ca đêm đã được gán để xoay tua công bằng
      const countNights = (staff) => {
        let n = 0;
        Object.values(staff.shifts || {}).forEach((shList) => {
          if (Array.isArray(shList)) {
            shList.forEach((sh) => {
              if (sh.type === "night" || sh.type === "duty24h") n++;
            });
          }
        });
        return n;
      };

      // 3 ca chính bắt buộc cho mỗi ngày
      // ƯU TIÊN SỐ 1: Phân ca Đêm (Night) trước để triệt tiêu cảnh báo "Night Shortage"
      const targetShiftPresets = [
        SHIFT_PRESETS.find((p) => p.type === "night") || SHIFT_PRESETS[2],
        SHIFT_PRESETS.find((p) => p.type === "morning") || SHIFT_PRESETS[0],
        SHIFT_PRESETS.find((p) => p.type === "afternoon") || SHIFT_PRESETS[1],
      ];

      let autoFilledCount = 0;
      const assignmentsToPersist = [];

      // 2. Duyệt qua toàn bộ 7 ngày trong tuần (Thứ Hai -> Chủ Nhật)
      for (let dayIdx = 0; dayIdx < weekDays.length; dayIdx++) {
        const day = weekDays[dayIdx];
        const dayKey = day.key;

        for (const preset of targetShiftPresets) {
          // Kiểm tra xem ca này trong ngày đã có nhân viên nào trực chưa
          const alreadyCovered = updatedStaffList.some((s) => {
            const curShifts = s.shifts[dayKey] || [];
            return curShifts.some(
              (sh) => sh.type === preset.type || sh.name?.toLowerCase() === preset.name?.toLowerCase()
            );
          });
          if (alreadyCovered) continue;

          // Tìm ứng viên phù hợp:
          // Tiêu chí 1: Chưa được gán ca này trong ngày
          let candidates = updatedStaffList.filter((s) => {
            const curShifts = s.shifts[dayKey] || [];
            return !curShifts.some((sh) => sh.type === preset.type);
          });

          if (candidates.length === 0) continue;

          // Tiêu chí 2: Ưu tiên người CHƯA CÓ CA NÀO trong ngày hôm nay (tránh 2 ca/ngày)
          const noShiftInDay = candidates.filter((s) => {
            const curShifts = s.shifts[dayKey] || [];
            return curShifts.length === 0;
          });
          if (noShiftInDay.length > 0) {
            candidates = noShiftInDay;
          }

          // Tiêu chí 3: Tránh gán ca Sáng nếu đêm hôm trước người đó trực ca Đêm (kết thúc 06:00)
          if (preset.type === "morning" && dayIdx > 0) {
            const prevDayKey = weekDays[dayIdx - 1].key;
            const notWorkedNightBefore = candidates.filter((s) => {
              const prevShifts = s.shifts[prevDayKey] || [];
              return !prevShifts.some((sh) => sh.type === "night");
            });
            if (notWorkedNightBefore.length > 0) {
              candidates = notWorkedNightBefore;
            }
          }

          // Tiêu chí 4: Sắp xếp theo:
          // - Giờ làm việc hiện tại thấp nhất (Công bằng định mức 40h)
          // - Ưu tiên người chưa đạt 40h
          // - Nếu là ca đêm: ưu tiên người có số ca đêm ít hơn (xoay tua trực đêm)
          candidates.sort((a, b) => {
            const aHours = hoursMap[a.id] || 0;
            const bHours = hoursMap[b.id] || 0;
            if (aHours !== bHours) return aHours - bHours;

            if (preset.type === "night") {
              const aNights = countNights(a);
              const bNights = countNights(b);
              if (aNights !== bNights) return aNights - bNights;
            }
            return 0;
          });

          const chosen = candidates[0];
          if (!chosen) continue;

          // Gán ca vào in-memory state
          const tempShiftId = Date.now() + Math.floor(Math.random() * 100000) + autoFilledCount;
          const newShiftItem = {
            shiftId: tempShiftId,
            type: preset.type,
            name: preset.name,
            code: preset.code,
            time: preset.time,
            location: preset.defaultLocation || "Operations Area",
            hours: preset.hours || 8,
          };

          const staffIdx = updatedStaffList.findIndex((s) => s.id === chosen.id);
          const currentDayShifts = Array.isArray(updatedStaffList[staffIdx].shifts[dayKey])
            ? [...updatedStaffList[staffIdx].shifts[dayKey]]
            : [];
          updatedStaffList[staffIdx].shifts[dayKey] = [...currentDayShifts, newShiftItem];

          // Cập nhật giờ làm tích lũy
          hoursMap[chosen.id] = (hoursMap[chosen.id] || 0) + (preset.hours || 8);
          autoFilledCount++;

          assignmentsToPersist.push({
            staffId: chosen.id,
            dayKey,
            preset,
          });
        }
      }

      // Cập nhật state ngay lập tức (Roster & Summary đổi màu xanh tức thì!)
      setStaffList(updatedStaffList);

      if (autoFilledCount === 0) {
        setNotice("Tất cả các ca (Sáng, Chiều, Đêm) trong 7 ngày đã được phân bổ đầy đủ!");
        setIsAutoFilling(false);
        setTimeout(() => setNotice(""), 3500);
        return;
      }

      setNotice(`Đã phân bổ tối ưu ${autoFilledCount} ca trực. Đang đồng bộ lên máy chủ...`);

      // 3. Đồng bộ các ca mới tạo lên backend
      for (const item of assignmentsToPersist) {
        try {
          const [year, month, day] = item.dayKey.split("-").map(Number);
          const startHour = item.preset.startHour || 6;
          const endHour = item.preset.endHour || 14;
          const startDate = new Date(Date.UTC(year, month - 1, day, startHour, 0, 0));
          const endDate = new Date(Date.UTC(year, month - 1, day, endHour % 24, 0, 0));
          if (endHour >= 24) endDate.setUTCDate(endDate.getUTCDate() + 1);

          const cacheKey = `${item.preset.name.toLowerCase()}_${item.dayKey}`;
          let matchingShift = shiftCache.get(cacheKey) || newShiftsPool.find(
            (sh) =>
              sh.shiftName?.toLowerCase() === item.preset.name.toLowerCase() &&
              new Date(sh.startsAt).toISOString().slice(0, 10) === item.dayKey
          );

          if (!matchingShift) {
            const created = await managerService.createShift(facilityId, {
              shiftName: item.preset.name,
              startsAt: startDate.toISOString(),
              endsAt: endDate.toISOString(),
              status: "open",
              allowPast: true,
            });
            matchingShift = created;
            if (created) {
              shiftCache.set(cacheKey, created);
              newShiftsPool.push(created);
            }
          }

          if (matchingShift?.id) {
            await managerService.createShiftAssignment(facilityId, {
              shiftId: matchingShift.id,
              employeeId: item.staffId,
              dutyRole: DUTY_ROLES[0].value,
              allowPast: true,
            });
          }
        } catch {
          // Bỏ qua lỗi lẻ nếu ca đã tồn tại
        }
      }

      setShifts(newShiftsPool);
      setNotice(`Đã tự động phân ca tối ưu 7 ngày (Sáng, Chiều, Đêm) cho toàn bộ nhân viên! (${autoFilledCount} ca đã tạo)`);
      setTimeout(() => setNotice(""), 4500);
    } catch (err) {
      setError(err?.message || "Không thể tự động phân ca cho cả tuần.");
    } finally {
      setIsAutoFilling(false);
    }
  };

  const handleCopyPreviousWeek = async () => {
    if (staffList.length === 0) {
      setError("Không tìm thấy nhân viên vận hành nào để sao chép lịch.");
      return;
    }
    if (!facilityId) {
      setError("Vui lòng chọn cơ sở kho trước khi sao chép lịch.");
      return;
    }

    setIsAutoFilling(true);
    setNotice("Đang kiểm tra lịch phân ca của tuần trước...");
    setError("");

    try {
      // 1. Xác định chính xác ngày bắt đầu & kết thúc của tuần trước (-7 ngày)
      const currentMonday = weekDays[0].dateObj;
      const prevMonday = new Date(currentMonday);
      prevMonday.setDate(currentMonday.getDate() - 7);
      prevMonday.setHours(0, 0, 0, 0);

      const prevSunday = new Date(prevMonday);
      prevSunday.setDate(prevMonday.getDate() + 6);
      prevSunday.setHours(23, 59, 59, 999);

      // 2. Gọi API lấy roster của tuần trước
      const prevRoster = await managerService.getShiftRoster(facilityId, {
        fromDate: prevMonday.toISOString(),
        toDate: prevSunday.toISOString(),
      });

      if (!Array.isArray(prevRoster) || prevRoster.length === 0) {
        setNotice("Tuần trước không có lịch phân ca để sao chép.");
        setIsAutoFilling(false);
        setTimeout(() => setNotice(""), 4000);
        return;
      }

      setNotice("Đang sao chép các ca làm việc sang tuần hiện tại...");

      // 3. Phân tích các ca tuần trước và ánh xạ sang tuần hiện tại
      let copiedCount = 0;
      let newShiftsPool = [...shifts];
      let updatedStaffList = staffList.map((s) => ({
        ...s,
        shifts: { ...(s.shifts || {}) },
      }));

      const shiftCache = new Map();

      for (const item of prevRoster) {
        // Tìm staff tương ứng
        const staffIndex = updatedStaffList.findIndex((s) => s.id === item.employeeId);
        if (staffIndex === -1) continue;

        // Tính ngày trong tuần hiện tại dựa trên thứ tương ứng
        const itemStartDate = new Date(item.startsAt);
        const itemDayOfWeek = itemStartDate.getUTCDay(); // 0 is Sunday, 1 is Monday...
        const dayIdx = itemDayOfWeek === 0 ? 6 : itemDayOfWeek - 1;
        if (dayIdx < 0 || dayIdx >= weekDays.length) continue;

        const targetDay = weekDays[dayIdx];
        const targetDayKey = targetDay.key;

        // Nhận diện preset
        const nameLower = (item.shiftName || "").toLowerCase();
        let presetType = "morning";
        if (nameLower.includes("chiều") || nameLower.includes("afternoon")) presetType = "afternoon";
        else if (nameLower.includes("đêm") || nameLower.includes("night")) presetType = "night";
        else if (nameLower.includes("24h") || nameLower.includes("24")) presetType = "duty24h";
        else if (nameLower.includes("phép") || nameLower.includes("leave")) presetType = "leave";
        else if (nameLower.includes("bù") || nameLower.includes("rest")) presetType = "rest";

        const preset = SHIFT_PRESETS.find((p) => p.type === presetType) || SHIFT_PRESETS[0];

        // Bỏ qua nếu nhân viên đó ở ngày đó đã có ca này rồi
        const staffObj = updatedStaffList[staffIndex];
        const existingShifts = Array.isArray(staffObj.shifts[targetDayKey]) ? staffObj.shifts[targetDayKey] : [];
        const alreadyHasThisShift = existingShifts.some(
          (s) => s.type === preset.type || s.name?.toLowerCase() === preset.name?.toLowerCase()
        );
        if (alreadyHasThisShift) continue;

        // Thêm vào state
        const tempShiftId = Date.now() + Math.floor(Math.random() * 100000) + copiedCount;
        const newShiftItem = {
          shiftId: tempShiftId,
          type: preset.type,
          name: preset.name,
          code: preset.code,
          time: preset.time,
          location: item.dutyRole ? `Role: ${item.dutyRole}` : preset.defaultLocation || "Operations Area",
          hours: preset.hours || 8,
        };

        updatedStaffList[staffIndex].shifts[targetDayKey] = [...existingShifts, newShiftItem];
        copiedCount++;

        // Đồng bộ lên backend
        try {
          const [year, month, day] = targetDayKey.split("-").map(Number);
          const startHour = preset.startHour || 6;
          const endHour = preset.endHour || 14;
          const startDate = new Date(Date.UTC(year, month - 1, day, startHour, 0, 0));
          const endDate = new Date(Date.UTC(year, month - 1, day, endHour % 24, 0, 0));
          if (endHour >= 24) endDate.setUTCDate(endDate.getUTCDate() + 1);

          const cacheKey = `${preset.name.toLowerCase()}_${targetDayKey}`;
          let matchingShift = shiftCache.get(cacheKey) || newShiftsPool.find(
            (sh) =>
              sh.shiftName?.toLowerCase() === preset.name.toLowerCase() &&
              new Date(sh.startsAt).toISOString().slice(0, 10) === targetDayKey
          );

          if (!matchingShift) {
            const created = await managerService.createShift(facilityId, {
              shiftName: preset.name,
              startsAt: startDate.toISOString(),
              endsAt: endDate.toISOString(),
              status: "open",
              allowPast: true,
            });
            matchingShift = created;
            if (created) {
              shiftCache.set(cacheKey, created);
              newShiftsPool.push(created);
            }
          }

          if (matchingShift?.id) {
            await managerService.createShiftAssignment(facilityId, {
              shiftId: matchingShift.id,
              employeeId: staffObj.id,
              dutyRole: item.dutyRole || DUTY_ROLES[0].value,
              allowPast: true,
            });
          }
        } catch {
          // Bỏ qua lỗi lẻ
        }
      }

      setShifts(newShiftsPool);
      setStaffList(updatedStaffList);

      if (copiedCount === 0) {
        setNotice("Tất cả các ca của tuần trước đã có sẵn trong tuần hiện tại.");
      } else {
        setNotice(`Đã sao chép thành công ${copiedCount} ca làm việc từ tuần trước!`);
      }
      setTimeout(() => setNotice(""), 4000);
    } catch (err) {
      setError(err?.message || "Không thể sao chép lịch phân ca của tuần trước.");
    } finally {
      setIsAutoFilling(false);
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
            {t("manager.staff_roster", "Bảng phân ca nhân viên")}
          </h1>
          <p className="mt-0.5 text-xs text-[#58657a]">
            
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
              className="px-3 text-xs font-bold text-[#0b1c30] hover:text-zinc-900 dark:text-zinc-100 transition"
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
              className="h-9 w-44 rounded-xl border border-[#dfe7f5] bg-white px-3 text-xs font-medium text-[#0b1c30] outline-none transition focus:w-56 focus:border-zinc-900 dark:border-zinc-100"
            />
          </div>

          {/* 1-Click Roster Automation Utilities */}
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={isAutoFilling}
              onClick={handleCopyPreviousWeek}
              className="inline-flex items-center gap-1.5 rounded-xl border border-indigo-200 bg-indigo-50/80 px-3 py-2 text-xs font-bold text-indigo-700 shadow-2xs hover:bg-indigo-100 transition disabled:opacity-50"
              title={t("shifts.copy_previous", "Sao chép tuần trước")}
            >
              <span>{t("shifts.copy_previous", "Sao chép tuần trước")}</span>
            </button>
            <button
              type="button"
              disabled={isAutoFilling}
              onClick={handleAutoFillWeek}
              className="inline-flex items-center gap-1.5 rounded-xl border border-blue-600 bg-blue-600 px-3.5 py-2 text-xs font-bold text-white shadow-2xs hover:bg-blue-700 transition disabled:opacity-50"
              title={t("shifts.autofill", "Tự động xếp ca")}
            >
              <span>{isAutoFilling ? t("shifts.filling", "Đang xếp ca...") : t("shifts.autofill", "Tự động xếp ca")}</span>
            </button>
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
                  isSelectedBrush ? "ring-2 ring-offset-1 ring-zinc-900/20 dark:ring-zinc-100/20 scale-[1.03]" : ""
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
                      <div className="inline-block rounded-full bg-zinc-900 text-white px-2.5 py-0.5 text-[9px] font-black uppercase tracking-wider text-white mb-1 shadow-2xs">
                        {t("common.today", "Hôm nay")}
                      </div>
                    )}
                    <div className={`text-[12px] font-medium ${day.isToday ? "text-zinc-900 dark:text-zinc-100 font-extrabold" : "text-[#475467]"}`}>
                      {day.dayName}
                    </div>
                    <div className={`mt-0.5 text-base font-black ${day.isToday ? "text-zinc-900 dark:text-zinc-100" : "text-[#0b1c30]"}`}>
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
                    <div className="inline-block h-6 w-6 animate-spin rounded-full border-2 border-zinc-900 dark:border-zinc-100 border-t-transparent mb-2" />
                    <div>{t("common.loading", "Đang tải dữ liệu...")}</div>
                  </td>
                </tr>
              ) : filteredStaff.length === 0 ? (
                <tr>
                  <td colSpan={weekDays.length + 1} className="py-10 text-center text-xs font-semibold text-[#8996a9]">
                    {t("manager.no_staff_shifts", "Chưa có nhân viên nào tại cơ sở này.")}
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

                      const isPopoverOpen =
                        activeCellPopover?.staffId === staff.id && activeCellPopover?.dayKey === day.key;

                      return (
                        <td
                          key={day.key}
                          onDragOver={(e) => handleDragOver(e, staff.id, day.key)}
                          onDragLeave={handleDragLeave}
                          onDrop={(e) => handleDrop(e, staff, day.key)}
                          className={`group relative min-w-[170px] max-w-[190px] p-2 align-top border-r border-[#eaecf0] transition-colors ${
                            day.isToday ? "bg-[#f8faff]/50" : ""
                          } ${isDropTarget ? "bg-[#eef4ff]/70" : ""}`}
                        >
                          {/* Quick Add '+' Button for Cell with >= 1 shift (Hover only) */}
                          {dayShifts.length > 0 && (
                            <button
                              type="button"
                              onClick={(e) => handlePlusClick(e, staff, day.key)}
                              className="absolute top-1.5 right-1.5 z-10 flex h-5 w-5 items-center justify-center rounded-md bg-white border border-slate-200 text-slate-500 hover:bg-blue-600 hover:text-white hover:border-blue-600 shadow-2xs opacity-0 group-hover:opacity-100 transition-all cursor-pointer"
                              title="Thêm ca trực khác cho ngày này"
                            >
                              <span className="text-xs font-bold leading-none">+</span>
                            </button>
                          )}

                          {/* Shifts container with min-h-[88px] */}
                          <div className="flex flex-col gap-1.5 min-h-[88px]">
                            {dayShifts.length === 0 ? (
                              /* Empty Cell: Clean subtle drop target, '+' appears on hover */
                              <div
                                onClick={(e) => handlePlusClick(e, staff, day.key)}
                                className={`group/btn flex flex-1 min-h-[88px] w-full flex-col items-center justify-center rounded-xl border border-dashed transition-all cursor-pointer ${
                                  isDropTarget
                                    ? "border-2 border-blue-600 bg-blue-50/80 shadow-inner scale-[1.01]"
                                    : "border-slate-200/80 bg-slate-50/30 hover:border-blue-400 hover:bg-blue-50/30"
                                }`}
                                title={
                                  selectedBrush
                                    ? `Nhấp để gán ${selectedBrush.name}`
                                    : "Nhấp để gán nhanh ca trực (Sáng, Chiều, Đêm)"
                                }
                              >
                                <span className="text-base font-bold text-slate-300 group-hover/btn:text-blue-600 group-hover/btn:scale-110 transition-all opacity-0 group-hover/btn:opacity-100 group-hover:opacity-100">
                                  +
                                </span>
                              </div>
                            ) : (
                              /* Cell with >= 1 shift: Only Compact Shift Cards, NO big dashed '+' button */
                              dayShifts.map((sh, idx) => (
                                <ShiftCard
                                  key={sh.shiftId || idx}
                                  shift={sh}
                                  onDelete={() => handleDeleteShift(staff, day.key, idx, sh)}
                                />
                              ))
                            )}
                          </div>

                          {/* Floating Popover: Absolute positioning, z-50, shadow-2xl, DOES NOT STRETCH TABLE HEIGHT */}
                          {isPopoverOpen && (
                            <div
                              ref={popoverRef}
                              onClick={(e) => e.stopPropagation()}
                              className="absolute top-2 right-2 z-50 w-52 rounded-xl border border-blue-100 bg-white p-2.5 shadow-2xl space-y-1.5 animate-in fade-in zoom-in-95 duration-150"
                            >
                              <div className="flex items-center justify-between border-b border-slate-100 pb-1.5">
                                <span className="text-[11px] font-bold text-slate-800">{t("manager.quick_assign_shift", "Gán ca nhanh")}</span>
                                <button
                                  type="button"
                                  onClick={() => setActiveCellPopover(null)}
                                  className="h-5 w-5 flex items-center justify-center rounded-md text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition"
                                  title="Đóng"
                                >
                                  ✕
                                </button>
                              </div>
                              <div className="grid grid-cols-1 gap-1">
                                <button
                                  type="button"
                                  onClick={() => handleQuickAssignFromPopover(staff, day.key, "morning")}
                                  className="flex items-center justify-between rounded-lg border border-emerald-200 bg-emerald-50/80 px-2.5 py-1.5 text-left text-[11px] font-bold text-emerald-800 hover:bg-emerald-100 transition shadow-2xs cursor-pointer"
                                >
                                  <span>🌅 Morning</span>
                                  <span className="font-mono text-[9px] font-semibold text-emerald-600">06:00 - 14:00</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAssignFromPopover(staff, day.key, "afternoon")}
                                  className="flex items-center justify-between rounded-lg border border-amber-200 bg-amber-50/80 px-2.5 py-1.5 text-left text-[11px] font-bold text-amber-800 hover:bg-amber-100 transition shadow-2xs cursor-pointer"
                                >
                                  <span>☀️ Afternoon</span>
                                  <span className="font-mono text-[9px] font-semibold text-amber-600">14:00 - 22:00</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAssignFromPopover(staff, day.key, "night")}
                                  className="flex items-center justify-between rounded-lg border border-indigo-200 bg-indigo-50/80 px-2.5 py-1.5 text-left text-[11px] font-bold text-indigo-800 hover:bg-indigo-100 transition shadow-2xs cursor-pointer"
                                >
                                  <span>🌙 Night</span>
                                  <span className="font-mono text-[9px] font-semibold text-indigo-600">22:00 - 06:00</span>
                                </button>
                                <button
                                  type="button"
                                  onClick={() => handleQuickAssignFromPopover(staff, day.key, "duty24h")}
                                  className="flex items-center justify-between rounded-lg border border-teal-200 bg-teal-50/80 px-2.5 py-1.5 text-left text-[11px] font-bold text-teal-800 hover:bg-teal-100 transition shadow-2xs cursor-pointer"
                                >
                                  <span>🛡️ 24h Shift</span>
                                  <span className="font-mono text-[9px] font-semibold text-teal-600">08:00 - 08:00</span>
                                </button>
                              </div>
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))
              )}
            </tbody>

            {/* Bottom Summary Row: {t("manager.shift_roster_summary", "Tóm tắt ca trực")} */}
            <tfoot>
              <tr className="border-t-2 border-[#eaecf0] bg-[#f8f9fc] text-xs">
                <td className="w-[280px] min-w-[280px] p-3.5 align-middle border-r border-[#eaecf0]">
                  <div className="font-black uppercase tracking-wider text-[#0b1c30]">
                    {t("manager.shift_roster_summary", "Tóm tắt ca trực")}
                  </div>
                  <div className="mt-0.5 text-[10px] font-medium text-[#475467]">
                    {t("manager.shift_coverage", "Phân bổ nhân sự & khối lượng việc")}
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
