// Data layer: content source for the Admin User Management (identity & RBAC) page.
export function getBreadcrumb() {
  return { parent: "Quản trị Hệ thống", current: "Quản lý Người dùng (User Management)" };
}

export function getOverviewHeader() {
  return {
    title: "Quản lý Người dùng & Phân quyền Hệ thống",
    subtitle: "Kiểm soát danh tính, phân quyền chi nhánh/trạm, cấp phát xác thực 2FA/FIDO và quản lý vòng đời 3.842 tài khoản.",
  };
}

export function getHeaderActions() {
  return [
    { id: "export", icon: "file_download", label: "Xuất báo cáo" },
    { id: "import", icon: "upload_file", label: "Nhập Excel/CSV" },
    { id: "new_user", icon: "person_add", label: "Thêm người dùng mới" },
  ];
}

export function getSectionTabs() {
  return [
    { id: "users", label: "Bảng Quản lý Người dùng", count: "3.842", badge: "Active", active: true },
    { id: "audit", label: "Lịch sử Hoạt động toàn hệ thống (Audit Logs)", active: false },
  ];
}

export function getKpis() {
  return [
    { id: "total", icon: "groups", label: "Tổng tài khoản hệ thống", value: "3,842", trend: "+12 tuần", sub: "3,420 B2B/B2C • 422 nhân sự" },
    { id: "active", icon: "check_circle", label: "Tài khoản hoạt động (Active)", value: "3,795", trend: "98.8% SLA", sub: "Đăng nhập qua SSO Okta" },
    { id: "twofa", icon: "verified_user", label: "Bảo mật 2FA/FIDO2 kích hoạt", value: "3,680", trend: "95.7% tuân thủ", sub: "FIDO2/Hardware/ISO 27001" },
    { id: "suspended", icon: "lock", label: "Tạm khóa / Đình chỉ", value: "47", sub: "31 quá hạn • 16 audit alert", alert: true },
  ];
}

export function getFilterOptions() {
  return {
    roles: [
      { id: "all", label: "Tất cả vai trò (Root/OPS/Hub)" },
      { id: "root", label: "Super Admin Root" },
      { id: "hub_manager", label: "Hub Manager" },
      { id: "ops", label: "Quản lý Vận hành" },
      { id: "staff", label: "Nhân viên trạm" },
      { id: "iot", label: "Kỹ thuật viên IoT" },
      { id: "tenant", label: "Khách hàng B2B/B2C" },
    ],
    facilities: [
      { id: "all", label: "Tất cả cơ sở (Toàn quốc)" },
      { id: "hq", label: "Toàn hệ thống (HQ & All Hubs)" },
      { id: "hub04", label: "Hub #04 Downtown Metro" },
      { id: "multi_south", label: "Liên cụm Miền Nam" },
      { id: "iot_multi", label: "Cơ sở Hub 01, 02, 04" },
    ],
    statuses: [
      { id: "all", label: "Tất cả trạng thái" },
      { id: "active", label: "Đang hoạt động" },
      { id: "pending_2fa", label: "Chờ kích hoạt 2FA" },
      { id: "locked", label: "Tạm khóa (Audit)" },
    ],
    twoFactorMethods: [
      { id: "all", label: "Tất cả phương thức bảo mật" },
      { id: "yubikey", label: "YubiKey NFC" },
      { id: "touchid", label: "TouchID FIDO2" },
      { id: "vault_auth", label: "Vault Authenticator" },
      { id: "sms_otp", label: "SMS OTP" },
      { id: "fido2_suspended", label: "FIDO2 (Tạm treo)" },
    ],
  };
}

export function getUsers() {
  return [
    {
      id: "u1",
      code: "#ADM-001",
      name: "Minh Hoàng",
      email: "minh.hoang@vaultspace.vn",
      phone: "0918.234.888",
      role: "root",
      roleLabel: "Super Admin Root",
      facility: "hq",
      facilityLabel: "Toàn hệ thống (HQ & All Hubs)",
      facilityNote: "14 trạm cơ sở • 12.400 người dùng",
      twoFactorMethod: "yubikey",
      twoFactorLabel: "YubiKey 5C",
      status: "active",
      statusLabel: "Đang hoạt động",
      lastLogin: "Hôm nay 14:40",
      device: "14.162.88.59 • macOS App",
    },
    {
      id: "u2",
      code: "#OPS-104",
      name: "Trần Thu Hà",
      email: "ha.tran@vaultspace.vn",
      phone: "0903.555.122",
      role: "hub_manager",
      roleLabel: "Hub Manager",
      facility: "hub04",
      facilityLabel: "Hub #04 Downtown Metro",
      facilityNote: "Khu B - 428 căn kho tự quản",
      twoFactorMethod: "touchid",
      twoFactorLabel: "TouchID FIDO2",
      status: "active",
      statusLabel: "Đang hoạt động",
      lastLogin: "Hôm nay 14:15",
      device: "118.69.182.11 • Hub Kiosk",
    },
    {
      id: "u3",
      code: "#OPS-002",
      name: "Lê Khắc Nam",
      email: "nam.le@vaultspace.vn",
      phone: "0978.112.900",
      role: "ops",
      roleLabel: "Quản lý Vận hành",
      facility: "multi_south",
      facilityLabel: "Hub #04 & Hub #05 Tân Bình",
      facilityNote: "Liên cụm Miền Nam",
      twoFactorMethod: "vault_auth",
      twoFactorLabel: "Vault Authenticator",
      status: "active",
      statusLabel: "Đang hoạt động",
      lastLogin: "Hôm nay 13:50",
      device: "14.162.88.52 • Chrome HQ",
    },
    {
      id: "u4",
      code: "#STF-391",
      name: "Nguyễn Phương Thảo",
      email: "thao.nguyen@vaultspace.vn",
      phone: "0933.789.444",
      role: "staff",
      roleLabel: "Nhân viên Trực quầy",
      facility: "hub04",
      facilityLabel: "Hub #04 Downtown Metro",
      facilityNote: "Quầy dịch vụ Tầng Trệt",
      twoFactorMethod: "sms_otp",
      twoFactorLabel: "SMS OTP (cũ)",
      status: "pending_2fa",
      statusLabel: "Chờ kích hoạt 2FA",
      lastLogin: "Hôm qua 17:02",
      device: "118.69.182.11 • POS Desk",
    },
    {
      id: "u5",
      code: "#TC-088",
      name: "Đỗ Anh Dũng",
      email: "dung.do@vaultspace.vn",
      phone: "0912.443.555",
      role: "iot",
      roleLabel: "Kỹ thuật viên IoT",
      facility: "iot_multi",
      facilityLabel: "Cơ sở Hub 01, 02, 04",
      facilityNote: "Bảo trì Hub & cảm biến",
      twoFactorMethod: "vault_auth",
      twoFactorLabel: "Vault Authenticator",
      status: "active",
      statusLabel: "Đang hoạt động",
      lastLogin: "Hôm nay 11:20",
      device: "14.238.10.12 • Mobile App",
    },
    {
      id: "u6",
      code: "#TNT-892",
      name: "Logistics Á Châu (Đại diện: Vũ Hùng)",
      email: "contact@aslatransport.com",
      phone: "MST: 0314892211",
      role: "tenant",
      roleLabel: "Khách hàng B2B VIP",
      facility: "hub04",
      facilityLabel: "Hub #04 Downtown Metro",
      facilityNote: "Căn D-14, D-15 (Kho 45m²)",
      twoFactorMethod: "fido2_suspended",
      twoFactorLabel: "FIDO2 (Tạm treo)",
      status: "locked",
      statusLabel: "Tạm khóa (Audit)",
      lastLogin: "Hôm qua 22:14",
      device: "183.98.21.99 • Sai OTP x5",
      flagged: true,
    },
  ];
}

export function getFootnote() {
  return "Hiển thị 1-6 trên tổng số 3.842 tài khoản người dùng";
}

export function getSelectedUserDetail() {
  return {
    code: "#ADM-001",
    name: "Minh Hoàng",
    roleLabel: "Super Admin Root",
    email: "minh.hoang@vaultspace.vn",
    facilityLabel: "Toàn hệ thống HQ & All Hubs",
    permissionGroups: [
      {
        id: "storage",
        title: "Kiểm soát Kho & Khóa IoT",
        tag: "Cấp cao nhất",
        items: ["Mở khóa kho từ xa qua IoT Gateway", "Cấp mã PIN ra vào trạm 24/7", "Ghi đè khóa buồng khẩn cấp (Emergency Override)"],
      },
      {
        id: "revenue",
        title: "Hợp đồng & Doanh thu trạm",
        tag: "Toàn quyền",
        items: ["Xem báo cáo doanh thu & dòng tiền trạm", "Ký số Smart Contract B2B/B2C", "Phê duyệt chiết khấu & chính sách khác biệt"],
      },
      {
        id: "security",
        title: "Bảo mật & Cấu hình Trạm",
        tag: "Root Only",
        items: ["Cấp phát phần cứng FIDO2 YubiKey", "Thu hồi phiên đăng nhập & đổi phân quyền", "Truy xuất dữ liệu Camera CCTV & Audit Trail"],
      },
    ],
  };
}

export function getComplianceFootnote() {
  return {
    left: "Xác thực RBAC theo tiêu chuẩn ISO/IEC 27001:2022 • IAM Enforced by VaultSpace Root Engine",
    right: "Audit Token: 0x7E9A...9942B • Đồng bộ lần cuối: 14:46:12",
  };
}
