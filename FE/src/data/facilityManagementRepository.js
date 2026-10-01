// Data layer: content source for the Admin Facility & Unit Management page.
export function getStatusBanner() {
  return { label: "Physical Facility Infrastructure", detail: "Mesh Gateway Online" };
}

export function getOverviewHeader() {
  return { title: "Unit & Facility Floor Management Hub #04 Metro" };
}

export function getHeaderActions() {
  return [
    { id: "map", icon: "map", label: "2D/3D Digital Map" },
    { id: "import", icon: "upload_file", label: "Import Excel" },
    { id: "new_unit", icon: "add", label: "Add New Unit" },
  ];
}

export function getKpis() {
  return [
    { id: "total", icon: "warehouse", label: "Total Units Hub #04", value: "120", sub: "Floor Area: 4,850 m²" },
    { id: "occupied", icon: "check_circle", label: "Occupied Units", value: "92", trend: "76.7%", sub: "" },
    { id: "available", icon: "lock_open", label: "Ready for Move-in", value: "18", sub: "Currently listed" },
    { id: "pending", icon: "assignment", label: "Pending Handover", value: "6", sub: "Check-in within 48h" },
    { id: "maintenance", icon: "warning", label: "Maintenance / Alert", value: "4", sub: "Low Latch battery • Sensor error", alert: true },
  ];
}

export function getFilters() {
  return {
    floors: [
      { id: "all", label: "All Floors (G & M)" },
      { id: "floor1", label: "Floor 1 (Ground)" },
      { id: "floor2", label: "Floor 2 (Mezzanine)" },
    ],
    zones: [
      { id: "all", label: "All Zones (A, B, C, D)" },
      { id: "A", label: "Zone A - Standard" },
      { id: "B", label: "Zone B - Climate Controlled" },
      { id: "C", label: "Zone C - Mini Box" },
      { id: "D", label: "Zone D - Garage & Drive-up" },
    ],
    sizes: [
      { id: "all", label: "All Sizes" },
      { id: "small", label: "5'x5' - 5'x10'" },
      { id: "medium", label: "10'x15' - 10'x20'" },
      { id: "large", label: "10'x30'" },
    ],
    statuses: [
      { id: "all", label: "All Statuses (120)" },
      { id: "occupied", label: "Occupied" },
      { id: "available", label: "Available" },
      { id: "pending", label: "Pending Handover" },
      { id: "alert", label: "Technical Alert" },
    ],
  };
}

export function getUnits() {
  return [
    {
      id: "B-204",
      floor: "floor2",
      zone: "B",
      size: "medium",
      sizeLabel: "10'x15' (14m²)",
      locationLabel: "Floor 2 (Mezzanine) • Zone B - Climate",
      tenant: "LogicTech Vietnam LLC",
      contract: "Contract: #HD-2023-9941",
      status: "occupied",
      statusNote: null,
      price: "3,450,000 ₫/month",
      sensor: "21.4°C • 52%",
    },
    {
      id: "A-101",
      floor: "floor1",
      zone: "A",
      size: "small",
      sizeLabel: "5'x10' (4.6m²)",
      locationLabel: "Floor 1 (Ground) • Zone A - Standard",
      tenant: null,
      contract: null,
      status: "available",
      statusNote: "Vacant • Ready for move-in",
      price: "1,250,000 ₫/month",
      sensor: "28.1°C • 58%",
    },
    {
      id: "C-301",
      floor: "floor1",
      zone: "C",
      size: "small",
      sizeLabel: "5'x5' (2.3m²)",
      locationLabel: "Floor 1 (Ground) • Zone C - Mini Box",
      tenant: "Ms. Nguyen Mai Anh",
      contract: "Contract: #HD-2024-0112",
      status: "occupied",
      statusNote: null,
      price: "750,000 ₫/month",
      sensor: "26.0°C • 60%",
    },
    {
      id: "D-112",
      floor: "floor1",
      zone: "D",
      size: "large",
      sizeLabel: "10'x30' (28m²)",
      locationLabel: "Floor 1 (Ground) • Zone D - Garage & Large Cargo",
      tenant: "RedSun Restaurant Group",
      contract: null,
      status: "alert",
      statusNote: "Alert: Battery < 12%",
      price: "6,200,000 ₫/month",
      sensor: "31.5°C • 69%",
    },
    {
      id: "B-108",
      floor: "floor1",
      zone: "B",
      size: "medium",
      sizeLabel: "10'x20' (18.5m²)",
      locationLabel: "Floor 1 (Ground) • Zone B - Commercial Retail",
      tenant: "Minh Chau Pharma",
      contract: null,
      status: "pending",
      statusNote: "Move-in schedule: 08:30 Tomorrow",
      price: "4,900,000 ₫/month",
      sensor: "22.0°C • 50%",
    },
  ];
}

export function getUnitDetails() {
  return {
    "B-204": {
      unit: "B-204",
      statusLabel: "Occupied",
      locationLabel: "Zone B Climate • Floor 2 Mezzanine • Automatic Shutter",
      camera: "Corridor Camera Hub04-Cam-14",
      lock: { name: "Latch BLE Pro", status: "Operational", battery: "92%", signal: "-58dBm", firmware: "v2.1.4" },
      climate: { unit: "AHU-02", target: "22°C", temp: "21.4°C", humidity: "52% RH", note: "HEPA filter inspected 12 days ago • Passed" },
      accessLog: [
        { name: "Le Quoc Tuan", role: "Technician", method: "BLE Master Card #TL-88", time: "14:22 Today" },
        { name: "Nguyen Van Dat", role: "LogicTech Rep", method: "VaultSpace Mobile App", time: "09:16 Today" },
        { name: "One-Time Delivery PIN", role: "GrabExpress Pro", method: "OTP", time: "16:40 Yesterday" },
      ],
    },
  };
}
