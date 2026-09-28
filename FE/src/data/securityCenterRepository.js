// Data layer: content source for the Admin Security Center (RBAC & IoT policy) page.
export function getSecurityBanner() {
  return { label: "Trung tâm Phòng vệ An ninh & Phân quyền VaultShield", version: "Phiên bản #SEC-9082" };
}

export function getOverviewHeader() {
  return {
    title: "Phân quyền & Bảo mật Vận hành",
    subtitle: "Quản trị quyền truy cập, kiểm soát khóa chốt IoT và giám sát nhật ký hoạt động thời gian thực.",
  };
}

export function getHeaderActions() {
  return [
    { id: "custom_role", icon: "add_moderator", label: "Tạo vai trò tùy chỉnh" },
    { id: "new_user", icon: "person_add", label: "Thêm người dùng mới" },
  ];
}

export function getKpis() {
  return [
    { id: "encryption", icon: "lock", label: "Chuẩn mã hóa Kiosk Lock", value: "AES-256 GCM", sub: "Đang kích hoạt liên tục • Trực tuyến 100%" },
    { id: "iot", icon: "sensors", label: "Tỷ lệ bảo mật cụm IoT", value: "99.98%", sub: "4.812/4.813 node hoạt động" },
    { id: "accounts", icon: "badge", label: "Tài khoản nội bộ cấp phép", value: "24", sub: "6 cấp phân quyền" },
    { id: "zeroday", icon: "verified_user", label: "Lỗ hổng & cảnh báo Zero-day", value: "0", sub: "Quét toàn bộ 04:00 hôm nay • An toàn tuyệt đối" },
  ];
}

export function getPermissionMatrixRoles() {
  return [
    { id: "ops_director", label: "Ops Director" },
    { id: "facility_manager", label: "Facility Manager" },
    { id: "receptionist", label: "Receptionist (Lễ tân)" },
    { id: "ktv", label: "Kỹ thuật viên (KTV)" },
    { id: "cctv", label: "Giám sát CCTV" },
  ];
}

export function getPermissionMatrixModules() {
  return [
    {
      id: "finance",
      label: "Báo cáo Doanh thu & Tài chính B2B",
      note: "Xem số liệu dòng tiền, hóa đơn, công nợ",
      access: { ops_director: "Xem/Xuất/Toàn quyền", facility_manager: "Xem nội bộ Hub", receptionist: null, ktv: null, cctv: null },
    },
    {
      id: "pricing",
      label: "Cập nhật Bảng giá & Chính sách khuyến mại",
      note: "Thay đổi giá thuê kho, phụ phí điện lạnh",
      access: { ops_director: "Xem/Sửa/Phê duyệt", facility_manager: "Đề xuất thay đổi", receptionist: null, ktv: null, cctv: null },
    },
    {
      id: "unlock",
      label: "Gửi lệnh Mở khóa kho IoT từ xa",
      note: "Can thiệp khẩn cấp, mở khóa cổng trung tâm",
      access: { ops_director: "Khẩn cấp toàn trạm", facility_manager: "Mở khóa cấp Hub", receptionist: null, ktv: "Cần 2-Factor OTP", cctv: null },
    },
    {
      id: "contracts_pii",
      label: "Xuất dữ liệu Hợp đồng & CCCD Khách",
      note: "File PII, nhật ký ra vào, bản scan hợp đồng",
      access: { ops_director: "Xem/Xuất/Xóa", facility_manager: "Xem/Ký số", receptionist: "Chỉ xem hồ sơ", ktv: null, cctv: null },
    },
  ];
}

export function getOtpTtlOptions() {
  return [
    { id: "15m", label: "15 Phút" },
    { id: "60m", label: "60 Phút (Chuẩn)" },
    { id: "24h", label: "24 Giờ" },
  ];
}

export function getGuestPinPolicyDefaults() {
  return { otpTtl: "60m", autoRevokeOnCheckout: true, limitUnlocksPerShift: true };
}

export function getIntrusionPolicyDefaults() {
  return { maxFailedPinAttempts: "5", sirenEnabled: true, notifyAuthoritiesEnabled: true };
}
