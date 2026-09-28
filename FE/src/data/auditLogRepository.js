// Data layer: content source for the Admin System Activity & Audit Log page.
export function getBreadcrumb() {
  return {
    parent: "Quản trị Hệ thống",
    current: "Lịch sử Hoạt động & Nhật ký Kiểm toán (Audit Logs)",
    siemStatus: "SIEM STREAM: TLS 1.3 ACTIVE",
    ledgerHash: "LedgerHash: #0x8f4c...c29b",
  };
}

export function getOverviewHeader() {
  return {
    title: "Lịch sử Hoạt động & Nhật ký Kiểm toán Hệ thống",
    subtitle:
      "Ghi nhận 100% biến động dữ liệu, truy cập khóa số IoT, điều chỉnh biểu phí và cảnh báo xâm nhập, băm SHA-256 bất biến theo chuẩn SOC 2 Type II.",
  };
}

export function getHeaderActions() {
  return [
    { id: "live", icon: "sensors", label: "Live Stream: Đang bật" },
    { id: "verify", icon: "verified", label: "Kiểm tra Tính toàn vẹn SHA-256" },
    { id: "export", icon: "download", label: "Xuất Log (.CSV/.JSON/Syslog)" },
  ];
}

export function getSectionTabs() {
  return [
    { id: "users", label: "Bảng Quản lý Người dùng", count: "3,842", active: false },
    { id: "audit", label: "Lịch sử Hoạt động toàn hệ thống (Audit Logs)", badge: "Live Stream", active: true },
  ];
}

export function getKpis() {
  return [
    { id: "events", icon: "database", label: "Sự kiện hôm nay", value: "18,940", sub: "4.2 sự kiện/giây • 99.94% OK" },
    { id: "iot", icon: "lock", label: "Tác vụ IoT khóa điện tử", value: "342 lệnh", sub: "Cưỡng chế: 18 • Cấp OTP: 312 • BLE: 12" },
    { id: "waf", icon: "shield", label: "Cảnh báo an ninh & WAF", value: "02 mối đe dọa", sub: "Tor Exit Node & Bruteforce • Đã auto-drop IP", alert: true },
    { id: "hash", icon: "verified_user", label: "Chuỗi xác thực băm", value: "Hợp lệ 100%", sub: "0 block lỗi kiểm toán • SHA-256 Validated" },
  ];
}

export function getFilterOptions() {
  return {
    timeRanges: [{ id: "today", label: "Hôm nay (Thời gian thực)" }],
    categories: [
      { id: "all", label: "Tất cả danh mục nghiệp vụ" },
      { id: "storage", label: "Quản lý kho" },
      { id: "pricing", label: "Cấu hình biểu phí" },
      { id: "iot", label: "Tự động hóa IoT" },
      { id: "intrusion", label: "Cảnh báo xâm nhập" },
      { id: "hardware", label: "Điều khiển phần cứng" },
    ],
    statuses: [
      { id: "all", label: "Tất cả trạng thái phản hồi" },
      { id: "success", label: "Thành công" },
      { id: "blocked", label: "Đã chặn" },
    ],
    actors: [
      { id: "all", label: "Tất cả người thực hiện/tác nhân" },
      { id: "staff", label: "Nhân sự nội bộ" },
      { id: "system", label: "Hệ thống tự động" },
      { id: "unknown", label: "Không xác định / Đáng ngờ" },
    ],
  };
}

export function getQuickFilters() {
  return [
    { id: "unit", label: "#B-204 (Metro)", value: "#B-204" },
    { id: "iot_force", label: "IoT Cưỡng chế", value: "cưỡng chế" },
    { id: "blocked_ip", label: "IP Bị chặn (2)", value: "chặn IP" },
    { id: "fee_q4", label: "Sửa biểu phí Q4", value: "biểu phí" },
  ];
}

export function getAuditEvents() {
  return [
    {
      id: "evt-1",
      time: "14:32:15.820",
      date: "15/10/2023",
      actor: "Vũ Phương Thảo",
      actorRole: "Quản lý Hub #04",
      actorType: "staff",
      category: "storage",
      categoryLabel: "Quản lý Kho",
      action: "Đã gán kho #B-204 cho khách Alex Morgan. HĐ #CTR-2024-8890 • 12 tháng • Bảo hiểm Diamond Safe 50,000 USD.",
      ip: "192.168.4.11",
      device: "Hub #04 Kiosk",
      status: "success",
    },
    {
      id: "evt-2",
      time: "14:15:00.104",
      date: "15/10/2023",
      actor: "Nguyễn Hoàng Nam",
      actorRole: "Super Admin Root",
      actorType: "staff",
      category: "pricing",
      categoryLabel: "Cấu hình Biểu phí",
      action: "Tăng phí trễ hạn 3% → 5% chu kỳ Q4/2025. Theo tờ trình HĐQT #VSP-RES-2025-09 • Áp dụng toàn bộ 04 Hub.",
      ip: "113.161.42.9",
      device: "HQ Executive Network",
      status: "success",
    },
    {
      id: "evt-3",
      time: "13:58:44.200",
      date: "15/10/2023",
      actor: "VaultAI Daemon",
      actorRole: "Automated Cron Daemon",
      actorType: "system",
      category: "iot",
      categoryLabel: "Tự động hóa IoT",
      action: "Khóa chốt điện tử cưỡng chế kho #D-112 do nợ cước quá hạn 7 ngày, tự động vô hiệu mã PIN khách hàng.",
      ip: "10.0.1.254",
      device: "Cloud Internal VPC",
      status: "success",
    },
    {
      id: "evt-4",
      time: "13:42:09.914",
      date: "15/10/2023",
      actor: "Unknown / Brute Force IP",
      actorRole: "Tor Exit Node Alert",
      actorType: "unknown",
      category: "intrusion",
      categoryLabel: "Cảnh báo Xâm nhập",
      action: "Đăng nhập sai quá 5 lần qua API Gateway /auth/v2/admin-login. WAF #882 chặn IP vĩnh viễn 24h, báo SOC Telegram.",
      ip: "203.113.152.88",
      device: "Frankfurt DE (Tor Exit Node)",
      status: "blocked",
    },
    {
      id: "evt-5",
      time: "12:11:30.012",
      date: "15/10/2023",
      actor: "Trần Tuấn Anh",
      actorRole: "KTV Kiosk Hub #01",
      actorType: "staff",
      category: "hardware",
      categoryLabel: "Điều khiển Phần cứng",
      action: "Mở khóa khẩn cấp Dock #02 tại Hub #01 cho đội xe #TK-DISPATCH-990. Cảm biến xác nhận xe rời dock sau 18 phút.",
      ip: "192.168.1.55",
      device: "Hub #01 Subnet Control",
      status: "success",
    },
  ];
}

export function getAuditFootnote() {
  return "Hiển thị 1-20 trên tổng số 18,940 sự kiện được mã hóa";
}

export function getComplianceCards() {
  return [
    { id: "syslog", icon: "cloud_sync", title: "Syslog SIEM Forwarder", detail: "Cổng UDP 514 • Splunk & Datadog Relay", status: "connected", statusLabel: "Connected" },
    { id: "certified", icon: "workspace_premium", title: "Chứng nhận Bảo mật Chuẩn", detail: "SOC 2 Type II • ISO 27001", status: "audited", statusLabel: "Audited 2025" },
    { id: "worm", icon: "inventory_2", title: "WORM Storage Archive", detail: "Lưu trữ bất biến 10 năm tại Cloud HSM", status: "locked", statusLabel: "Locked" },
  ];
}
