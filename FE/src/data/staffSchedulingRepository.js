// Data layer: content source for the Admin Staff Scheduling (shift roster) page.
export function getStatusBanner() {
  return { label: "Real-time Operations Shift", week: "Week 42 (Oct 14 - Oct 20, 2024)" };
}

export function getOverviewHeader() {
  return {
    title: "Staff Scheduling & Shift Roster",
    subtitle: "Coordinate duty schedules, ISO 27001 standard working hours, and facility security handover logs.",
  };
}

export function getWeekRangeLabel() {
  return "Oct 14 - Oct 20, 2024";
}

export function getHeaderActions() {
  return [
    { id: "norms", icon: "rule", label: "Shift Standards" },
    { id: "export", icon: "file_download", label: "Export Roster" },
    { id: "new_shift", icon: "add", label: "Schedule New Shift" },
  ];
}

export function getKpis() {
  return [
    { id: "staff", icon: "groups", label: "Facility Workforce", value: "18", trend: "Ready to deploy", sub: "100% available" },
    { id: "shift_structure", icon: "schedule", label: "3 Shifts / Day Roster", value: "3 Shifts", trend: "24/7 Monitoring", sub: "Morning 07-15 • Afternoon 15-23 • Night 23-07" },
    { id: "coverage", icon: "shield", label: "Weekly Shift Coverage", value: "100%", trend: "0 violations", sub: "Safety Standard Met" },
  ];
}

export function getWeekDays() {
  return [
    { id: "mon", label: "Mon", date: "14/10" },
    { id: "tue", label: "Tue", date: "15/10" },
    { id: "wed", label: "Wed", date: "16/10", isToday: true },
    { id: "thu", label: "Thu", date: "17/10" },
    { id: "fri", label: "Fri", date: "18/10" },
    { id: "sat", label: "Sat", date: "19/10" },
    { id: "sun", label: "Sun", date: "20/10" },
  ];
}

export function getDepartments() {
  return [
    {
      id: "mgmt",
      label: "Management & Operations Leads",
      count: 3,
      staff: [
        {
          id: "MNG-01",
          name: "Nguyen Quoc Thai",
          role: "Shift Supervisor",
          shifts: {
            mon: { type: "morning" },
            tue: { type: "morning" },
            wed: { type: "afternoon", note: "On Duty" },
            thu: { type: "morning", note: "Overtime" },
            fri: { type: "off", note: "Day Off" },
            sat: { type: "morning" },
            sun: { type: "off" },
          },
        },
        {
          id: "MNG-04",
          name: "Vo Bich Phuong",
          role: "Deputy Warehouse Supervisor",
          shifts: {
            mon: { type: "afternoon" },
            tue: { type: "afternoon" },
            wed: { type: "morning", note: "Completed" },
            thu: { type: "morning" },
            fri: { type: "afternoon", note: "Weekend Shift" },
            sat: { type: "off" },
            sun: { type: "off" },
          },
        },
      ],
    },
    {
      id: "iot",
      label: "IoT Engineering, HVAC & Electrical Maintenance",
      count: 5,
      staff: [
        {
          id: "ENG-12",
          name: "Truong Hoang Long",
          role: "Climate Control Tech",
          shifts: {
            mon: { type: "morning", note: "07:01" },
            tue: { type: "morning", note: "06:52" },
            wed: { type: "afternoon", note: "Maintenance" },
            thu: { type: "afternoon" },
            fri: { type: "morning", note: "Gate Duty" },
            sat: { type: "off" },
            sun: { type: "off" },
          },
        },
        {
          id: "ENG-18",
          name: "Dang Van Son",
          role: "Loading Dock Tech",
          shifts: {
            mon: { type: "off", note: "Day Off" },
            tue: { type: "afternoon", note: "Delayed" },
            wed: { type: "afternoon", note: "Inspection" },
            thu: { type: "afternoon" },
            fri: { type: "morning" },
            sat: { type: "off" },
            sun: { type: "off" },
          },
        },
      ],
    },
    {
      id: "frontoffice",
      label: "Front Desk & Unit Handover Staff",
      count: 4,
      staff: [
        {
          id: "FO-05",
          name: "Le Thu Ha",
          role: "B2B Receptionist",
          shifts: {
            mon: { type: "morning" },
            tue: { type: "morning" },
            wed: { type: "afternoon", note: "Handover #B-204" },
            thu: { type: "morning" },
            fri: { type: "off" },
            sat: { type: "off" },
            sun: { type: "off" },
          },
        },
      ],
    },
    {
      id: "security",
      label: "Security & Central SOC Surveillance",
      count: 6,
      staff: [
        {
          id: "SEC-03",
          name: "Pham Quoc An",
          role: "Lead SOC Security Officer",
          shifts: {
            mon: { type: "night", note: "Patrol" },
            tue: { type: "night", note: "22:00" },
            wed: { type: "night", note: "Starts 23:00" },
            thu: { type: "off", note: "Double Shift Rest" },
            fri: { type: "off" },
            sat: { type: "night" },
            sun: { type: "night" },
          },
        },
      ],
    },
  ];
}

export function getShiftLegend() {
  return [
    { id: "morning", label: "Morning (07:00-15:00)" },
    { id: "afternoon", label: "Afternoon (15:00-23:00)" },
    { id: "night", label: "Night (23:00-07:00)" },
  ];
}

export function getAttendanceLegend() {
  return [
    { id: "ontime", label: "On-time", color: "#2dd4a0" },
    { id: "late", label: "Late", color: "#e5484d" },
    { id: "leave", label: "Paid Leave", color: "#f5a524" },
  ];
}

export function getFieldTasks() {
  return [
    {
      id: 1,
      title: "Inspect climate humidity sensors in Zone B",
      note: "Wine Storage units B10-B40",
      assignee: "Tech Long (#ENG-12)",
      detail: "Completed at 11:30",
      status: "done",
      statusLabel: "PASSED",
    },
    {
      id: 2,
      title: "Forklift assistance & Pallet receiving at Dock #02",
      note: "High priority",
      assignee: "Tech Son (#ENG-18)",
      detail: "Unloading 14 pallets",
      status: "doing",
      statusLabel: "IN PROGRESS",
    },
    {
      id: 3,
      title: "Handover inspection & seal unit #B-204",
      note: "Customer: VinLogistics JSC",
      assignee: "Receptionist Ha (#FO-05)",
      detail: "Expected arrival: 16:30",
      status: "waiting",
      statusLabel: "WAITING",
    },
  ];
}

export function getHandoverTag() {
  return "Afternoon → Night Shift";
}

export function getHandoverChecklist() {
  return [
    { id: "keys", label: "Master Keyring & Emergency NFC Tokens", detail: "Count verified (12/12)" },
    { id: "fire", label: "Fire Suppression & Cold Smoke Sensors", detail: "Pressure stable at 1.2 MPa" },
    { id: "cctv", label: "Facility 148 CCTV Cameras Network", detail: "148 / 148 Online" },
  ];
}

export function getHandoverNote() {
  return "VinLogistics JSC client may retrieve 2 additional pallets at 23:45. Night shift must verify QR code + fingerprint before opening Dock #02 barrier.";
}
