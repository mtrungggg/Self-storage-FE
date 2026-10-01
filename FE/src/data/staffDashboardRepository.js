// Data layer: content source for the Staff Dashboard (Facility Operations) page.
export function getStaffProfile() {
  return {
    name: "Nguyen Thanh Long",
    code: "#STAFF-409",
    role: "Shift Supervisor",
    facility: "Hub #04 Downtown Metro",
  };
}

export function getNavTabs() {
  return [
    { id: "map", label: "Floor Map & Unit Status" },
    { id: "handover", label: "Handover & Tasks", count: 11 },
    { id: "iot", label: "IoT Telemetry", count: 3 },
    { id: "logs", label: "Storage Access Log" },
  ];
}

export function getKpis() {
  return [
    { id: "total", icon: "warehouse", label: "Total Units", value: "120", sub: "92 rented • 76.7% occupancy" },
    { id: "pending", icon: "vpn_key", label: "Pending Handover", value: "6", sub: "1 delayed • 8 scheduled today" },
    { id: "return", icon: "assignment_return", label: "Move-out & Inspection", value: "3", sub: "2 finalized • 1 reconciling" },
    { id: "iot", icon: "warning", label: "IoT Alerts", value: "3", sub: "1 low battery • 1 sensor fault" },
  ];
}

export function getZones() {
  return [
    { id: "all", label: "All Zones" },
    { id: "A", label: "Zone A" },
    { id: "B", label: "Zone B - Climate" },
    { id: "C", label: "Zone C - Mini" },
    { id: "D", label: "Zone D - Outdoor" },
  ];
}

export function getFloors() {
  return [
    { id: "floor1", label: "Floor 1 (Ground)" },
    { id: "floor2", label: "Floor 2 (Mezzanine)" },
  ];
}

export function getUnits() {
  return [
    { id: "A-101", zone: "A", floor: "floor1", size: "5'x5'", status: "available", note: "Battery 99%" },
    { id: "A-102", zone: "A", floor: "floor1", size: "5'x10'", status: "available", note: "Battery 95%" },
    { id: "A-103", zone: "A", floor: "floor1", size: "10'x10'", status: "alert", note: "Cleaning" },
    { id: "A-104", zone: "A", floor: "floor1", size: "10'x10'", status: "occupied", note: "Battery 93%" },
    { id: "A-105", zone: "A", floor: "floor1", size: "10'x15'", status: "occupied", note: "Check-in 09:42" },
    { id: "B-201", zone: "B", floor: "floor1", size: "5'x10'", status: "available", note: "22°C · 48%" },
    { id: "B-202", zone: "B", floor: "floor1", size: "10'x10'", status: "occupied", note: "21°C" },
    { id: "B-203", zone: "B", floor: "floor1", size: "10'x15'", status: "occupied", note: "22°C" },
    { id: "B-204", zone: "B", floor: "floor1", size: "5'x10'", status: "handover", note: "Alex Morgan" },
    { id: "B-205", zone: "B", floor: "floor1", size: "10'x20'", status: "occupied", note: "22°C" },
    { id: "B-206", zone: "B", floor: "floor1", size: "10'x20'", status: "occupied", note: "22°C" },
    { id: "B-210", zone: "B", floor: "floor1", size: "10'x20'", status: "alert", note: "Truck 15:00" },
    { id: "C-301", zone: "C", floor: "floor2", size: "5'x5'", status: "occupied", note: "Mini Box" },
    { id: "C-302", zone: "C", floor: "floor2", size: "5'x5'", status: "occupied", note: "Mini Box" },
    { id: "D-112", zone: "D", floor: "floor1", size: "10'x30'", status: "alert", note: "Appt 13:30" },
    { id: "D-118", zone: "D", floor: "floor1", size: "10'x25'", status: "occupied", note: "Inspection" },
  ];
}

export function getLegend() {
  return [
    { id: "available", label: "Ready", color: "#2dd4a0" },
    { id: "occupied", label: "Occupied", color: "#1d5fe5" },
    { id: "handover", label: "Pending Handover", color: "#f5a524" },
    { id: "alert", label: "Action Required", color: "#e5484d" },
  ];
}

export function getHandover() {
  return {
    unit: "B-204",
    code: "#BK-9821",
    customer: "Alex Morgan",
    size: "5'x10' · 22°C · 48% RH",
    deposit: "2,580,000 ₫",
    payment: "Visa ****8892",
    pin: "849201#",
    battery: "94%",
    checklist: [
      { id: "kit", label: "MasterLock + 5 Moving Cartons" },
      { id: "insurance", label: "VaultGuard Insurance 500K" },
    ],
    handoffNote: "Afternoon shift 15:00: Handover to Tech Vu Van Son (#412)",
  };
}

export function getScheduleTabs() {
  return [
    { id: "checkin", label: "Move-in", count: 8 },
    { id: "checkout", label: "Move-out", count: 3 },
    { id: "maintenance", label: "Maintenance", count: 3 },
  ];
}

export function getScheduleItems() {
  return [
    { id: "BK-9821", type: "checkin", name: "Alex Morgan", status: "Arriving", unit: "B-204 · 5'x10' Climate", time: "11:00 (15m early)", action: "Handover Now" },
    { id: "BB-4421", type: "checkout", name: "Tran Thi Bich", status: "Completed 09:42", unit: "A-105 · 10'x15'", time: "Done", action: "View Record" },
    { id: "BK-9825", type: "checkin", name: "Le Hoang Nam", status: "Expected 13:30", unit: "D-112 · 10'x30'", time: "13:30", action: "Details" },
    { id: "BK-9818", type: "maintenance", name: "FastTrack Logistics", status: "Waiting Truck 15:00", unit: "D-210 · 10'x20'", time: "15:00", action: "Assign Dock" },
  ];
}
