// Data layer: content source for the Admin Contracts & Customers CRM page.
export function getStatusBanner() {
  return { label: "Hồ sơ khách thuê & Khế ước tài sản", detail: "Chi nhánh Hub #04 Downtown Metro" };
}

export function getOverviewHeader() {
  return { title: "Hợp đồng & Khách hàng CRM" };
}

export function getHeaderActions() {
  return [
    { id: "debt_report", icon: "receipt_long", label: "Xuất báo cáo công nợ" },
    { id: "remind", icon: "campaign", label: "Gửi nhắc hạn hàng loạt (28)" },
    { id: "new_contract", icon: "add", label: "Tạo hợp đồng mới" },
  ];
}

export function getKpis() {
  return [
    { id: "active", icon: "verified_user", label: "Hợp đồng hiệu lực", value: "415", trend: "+98.2%", sub: "Tỷ lệ lấp đầy kho • Cộng dồn 2024" },
    { id: "expiring", icon: "event_upcoming", label: "Sắp hết hạn (≤30 ngày)", value: "28", sub: "12 HĐ trong 7 ngày tới • Cần gia hạn", alert: true },
    { id: "overdue", icon: "lock_clock", label: "Hợp đồng nợ quá hạn", value: "08", sub: "Tổng nợ đọng: 48.600.000 đ • 3 khóa Latch", alert: true },
    { id: "new_sales", icon: "trending_up", label: "Doanh số ký mới tháng này", value: "+145.2M đ", trend: "+22.4%", sub: "So tháng trước • 19 HĐ mới" },
  ];
}

export function getFilterOptions() {
  return {
    audiences: [
      { id: "all", label: "Tất cả đối tượng" },
      { id: "b2b", label: "Doanh nghiệp (B2B)" },
      { id: "b2c", label: "Cá nhân (B2C)" },
    ],
    cycles: [
      { id: "all", label: "Mọi chu kỳ thanh toán" },
      { id: "monthly", label: "01 Tháng/lần" },
      { id: "quarterly", label: "03 Tháng/lần" },
      { id: "biannual", label: "06 Tháng/lần" },
      { id: "yearly", label: "12 Tháng trả trước" },
    ],
    validity: [
      { id: "all", label: "Mọi hiệu lực" },
      { id: "active", label: "Bình thường" },
      { id: "renewal", label: "Sắp tái ký" },
      { id: "locked", label: "Khóa & tự động" },
    ],
  };
}

export function getContractLegend() {
  return [
    { id: "active", label: "Bình thường", color: "#2dd4a0" },
    { id: "renewal", label: "Sắp tái ký", color: "#f5a524" },
    { id: "locked", label: "Khóa và tự động", color: "#e5484d" },
  ];
}

export function getContracts() {
  return [
    {
      id: "#CTR-2024-8890",
      signMethod: "Ký điện tử • eKYC OK",
      customer: "Công ty TNHH TechLogix VN",
      audience: "b2b",
      contact: "Vũ Hải Đăng • 0918.423.889",
      taxOrEmail: "MST: 0314986231 • contact@techlogix.vn",
      unit: "Kho #B-204",
      unitNote: "Tầng 2 • Máy lạnh 24/7 • #LC-9902",
      term: "15/05/2023 → 14/05/2024",
      daysLeft: "Còn 4 ngày",
      alertNote: "Chưa gửi phiếu tái ký",
      cycle: "monthly",
      value: "16.500.000 đ",
      totalValue: "33.000.000 đ",
      cycleNote: "Chu kỳ 06 tháng/lần • VAT 10% điện tử",
      depositStatus: "Đang giữ cọc",
      validity: "renewal",
    },
    {
      id: "#CTR-2024-8821",
      signMethod: "Ký công chứng văn phòng",
      customer: "Công ty CP Kiến Trúc An Lạc",
      audience: "b2b",
      contact: "Lê Hoàng Long • 0903.112.556",
      taxOrEmail: "MST: 0108992144 • ketoan@anlacarch.com",
      unit: "Kho #A-102",
      unitNote: "Tầng trệt • Drive-up Container • #LC-1004",
      term: "01/01/2024 → 31/12/2024",
      daysLeft: "Còn 234 ngày",
      alertNote: "Cam kết thuê hạn 2 năm",
      cycle: "yearly",
      value: "24.000.000 đ",
      totalValue: "48.000.000 đ",
      cycleNote: "Chu kỳ 12 tháng trả trước • Ưu đãi chiết khấu 10%",
      depositStatus: "Đang giữ cọc",
      validity: "active",
    },
    {
      id: "#CTR-2024-7712",
      signMethod: "Hợp đồng điện tử Smart App",
      customer: "Nguyễn Thảo Ly",
      audience: "b2c",
      contact: "0986.761.320 • Lưu trữ cá nhân",
      taxOrEmail: "CCCD: 079194002931 • thaoly.art@gmail.com",
      unit: "Kho #D-118",
      unitNote: "Tầng 1 • Kiểm soát ẩm, đèn LED cảm ứng • #LC-4419",
      term: "20/11/2023 → 19/05/2024",
      daysLeft: "Còn 11 ngày",
      alertNote: "Đã gửi SMS nhắc hạn",
      cycle: "monthly",
      value: "5.800.000 đ",
      totalValue: "5.800.000 đ",
      cycleNote: "Chu kỳ 01 tháng/lần • Tự động trừ thẻ Napas",
      depositStatus: "Đang giữ cọc",
      validity: "renewal",
    },
    {
      id: "#CTR-2024-6510",
      signMethod: "Khế ước Master Doanh nghiệp",
      customer: "Dược Phẩm & Thiết Bị Y Tế Nam Đô",
      audience: "b2b",
      contact: "DS. Trần Quốc Tuấn • 0972.909.111",
      taxOrEmail: "MST: 0300918872 • supply@namdopharma.vn",
      unit: "Cụm Kho #C-01 & #C-02",
      unitNote: "Chuẩn GDP • 18-22°C, Dual Smart Locks • #LC-3011, #LC-3012",
      term: "15/02/2024 → 14/02/2025",
      daysLeft: "Còn 279 ngày",
      alertNote: "Bảo trì cảm biến định kỳ OK",
      cycle: "quarterly",
      value: "42.500.000 đ",
      totalValue: "85.000.000 đ",
      cycleNote: "Chu kỳ 03 tháng/lần • Thanh toán qua VietQR PRO",
      depositStatus: "Đang giữ cọc",
      validity: "active",
    },
    {
      id: "#CTR-2024-5109",
      signMethod: "Ký tại quầy Lễ tân Hub #04",
      customer: "Phạm Thành Đạt",
      audience: "b2c",
      contact: "0933.456.789 • Lưu trữ nội chuyển nhà",
      taxOrEmail: "CCCD: 001085007421 • dat.pham@outlook.com",
      unit: "Kho #B-108",
      unitNote: "Tầng 1 • Tiêu chuẩn khô ráo, camera riêng • #LC-2198",
      term: "10/10/2023 → 09/10/2024",
      daysLeft: "Còn 151 ngày",
      alertNote: "Đã gia hạn lần 1",
      cycle: "quarterly",
      value: "7.200.000 đ",
      totalValue: "7.200.000 đ",
      cycleNote: "Chu kỳ 03 tháng/lần • Đã xuất hóa đơn lần 1",
      depositStatus: "Đang giữ cọc",
      validity: "locked",
    },
  ];
}

export function getContractFootnote() {
  return { totalDeposit: "Tổng cọc an ninh giữ hộ: 2.840.000.000 đ" };
}

export function getEmergencyActions() {
  return [
    { id: "lockout", icon: "lock", label: "Khóa điện tử cưỡng chế (Latch Lockout)" },
    { id: "bulk_renew", icon: "autorenew", label: "Gia hạn hàng loạt hợp đồng B2B" },
    { id: "handover_report", icon: "description", label: "Biên bản bàn giao & hoàn trả cọc" },
  ];
}

export function getIotStatusNote() {
  return "Online (100% Khóa IoT) • Port 8084";
}

export function getActivityLog() {
  return [
    {
      id: "log-1",
      type: "success",
      title: "Gia hạn thành công #CTR-2023-4...",
      detail: "Kho #A-109 • KH Trần Nhật Minh (+12 tháng)",
      time: "10 phút trước",
      actor: "Ops Trần Minh Hoàng",
    },
    {
      id: "log-2",
      type: "failed",
      title: "Từ chối kích hoạt HĐ mới #B-204",
      detail: "Công ty TNHH TechLogix VN • Quá hạn 5 ngày",
      time: "42 phút trước",
      actor: "Hệ thống tự động",
    },
  ];
}

export function getComplianceInfo() {
  return {
    badge: "Luật Kinh doanh BĐS 2024",
    title: "Hồ sơ eKYC & Hợp đồng số",
    note: "100% hợp đồng mới tuân thủ chuẩn số hóa, tích hợp chữ ký số VNPT-CA và mã hóa SHA-256.",
    tags: ["CA Ký số", "IoT"],
  };
}
