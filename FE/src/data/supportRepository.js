import { normalizeTicketStage } from "../domain/usecases/filterSupportRecords";

// Data layer: content source & metadata mappings for the Support page.
export function getUnitTabs(units = []) {
  const activeCount = units.filter((u) => u.status === "active").length;
  const renewCount = units.filter((u) => u.status === "renew").length;
  return [
    { id: "all", label: `Tất cả kho (${units.length})` },
    { id: "active", label: `Đang hoạt động (${activeCount})` },
    { id: "renew", label: `Cần gia hạn (${renewCount})` },
  ];
}

export function getSupportUnits() {
  return [
    {
      id: "A-102",
      location: "Tầng 1 • Khoang A • An Phú Central",
      status: "active",
      statusLabel: "Đang hoạt động",
      size: "5' x 10' (~4.6m²)",
      sizeNote: "Chiều cao trần 2.7 mét (Khoang thoáng)",
      climate: "23°C / 48% RH",
      contractLabel: "Thời hạn hợp đồng",
      contractDate: "Hạn đến 28/02/2026",
      contractLeft: "Còn 312 ngày",
      payment: "Tự động qua Visa ****8892",
      primaryAction: "Xem mã PIN / Khóa điện tử",
      footerLinks: ["Báo cáo sự cố kho", "Xem lịch sử thuê"],
    },
    {
      id: "B-204",
      location: "Tầng 2 • Khoang B • An Phú Central",
      status: "renew",
      statusLabel: "Còn 3 ngày",
      warning: "Vui lòng gia hạn trước 31/10/2025 để tránh bị khóa mã PIN và tính phí giữ kho tạm.",
      size: "10' x 15' (~13.9m²)",
      sizeNote: "Đặc thù sử dụng: Chứa máy & Đồ đạc cồng kềnh",
      climate: "Lối xe nâng hàng rộng",
      autoPay: true,
      primaryAction: "Gia hạn hợp đồng ngay",
      footerLinks: ["Báo cáo sự cố kho", "Mã PIN kho"],
    },
    {
      id: "D-118",
      location: "Garage mặt bằng xe ở An Phú",
      status: "active",
      statusLabel: "Đang hoạt động",
      size: "10' x 20' (~18.6m²)",
      sizeNote: "Mục đích sử dụng: Kho ô tô & Nội thất biệt thự",
      climate: "Cửa cuốn điện điều khiển từ xa",
      contractLabel: "Thời hạn hợp đồng",
      contractDate: "Hạn đến 15/12/2025",
      contractLeft: "Còn 45 ngày",
      payment: "Thanh toán theo quý",
      primaryAction: "Xem mã PIN / Khóa điện tử",
      footerLinks: ["Báo cáo sự cố kho", "Xem lịch sử thuê"],
    },
  ];
}

export function getTicketCategories() {
  return [
    { value: "access", label: "Mã PIN / Khóa điện tử hỏng (Lỗi truy cập)" },
    { value: "unit", label: "Ô kho hư hỏng (Cửa kho, đèn, vách ngăn...)" },
    { value: "payment", label: "Sự cố thanh toán / Hóa đơn chứng từ" },
    { value: "stored_item", label: "Sự cố hàng hóa / Tài sản lưu trữ" },
    { value: "maintenance", label: "Bảo trì / Vệ sinh / Nhiệt độ & Độ ẩm" },
    { value: "other", label: "Khác" },
  ];
}

export function getCategoryLabel(category) {
  const c = (category || "").toLowerCase();
  const map = {
    access: "Mã PIN / Khóa hỏng",
    unit: "Ô kho hư hỏng",
    payment: "Sự cố thanh toán",
    stored_item: "Đồ lưu trữ",
    maintenance: "Bảo trì / Môi trường",
    other: "Khác",
  };
  return map[c] || category || "Hỗ trợ kỹ thuật";
}

export function getPriorityLabel(priority) {
  const p = (priority || "").toLowerCase();
  const map = {
    low: "Ưu tiên thấp",
    normal: "Bình thường",
    high: "Ưu tiên cao",
    urgent: "Khẩn cấp",
  };
  return map[p] || priority || "Bình thường";
}

export function getStatusMeta(status, displayStatus) {
  const stage = normalizeTicketStage({ status, displayStatus });
  switch (stage) {
    case "Reported":
      return {
        stage: "Reported",
        badgeText: "Reported • Đã tiếp nhận",
        badgeClass: "bg-[#eef4ff] text-[#1d5fe5]",
      };
    case "Investigating":
      return {
        stage: "Investigating",
        badgeText:
          (status || "").toLowerCase() === "waiting_for_customer"
            ? "Investigating • Chờ phản hồi KH"
            : "Investigating • Đang kiểm tra",
        badgeClass: "bg-[#0b1c30] text-white",
      };
    case "Assessed":
      return {
        stage: "Assessed",
        badgeText: "Assessed • Đã đánh giá",
        badgeClass: "bg-[#fef3c7] text-[#b45309]",
      };
    case "Resolved":
      return {
        stage: "Resolved",
        badgeText: "Resolved • Đã xử lý",
        badgeClass: "bg-[#e7f8ee] text-[#0e7b4c]",
      };
    case "Closed":
      return {
        stage: "Closed",
        badgeText: "Closed • Đã đóng",
        badgeClass: "bg-[#e2e8f0] text-[#334155]",
      };
    case "Cancelled":
      return {
        stage: "Cancelled",
        badgeText: "Cancelled • Đã hủy",
        badgeClass: "bg-[#fdecec] text-[#c0362c]",
      };
    default:
      return {
        stage: displayStatus || "Reported",
        badgeText: displayStatus || "Đang chờ xử lý",
        badgeClass: "bg-[#eef4ff] text-[#1d5fe5]",
      };
  }
}

export function getTicketStatusSteps() {
  return [
    { key: "Reported", label: "Reported", sub: "Đã gửi báo cáo" },
    { key: "Investigating", label: "Investigating", sub: "Đang kiểm tra" },
    { key: "Assessed", label: "Assessed", sub: "Đã đánh giá" },
    { key: "Resolved", label: "Resolved", sub: "Đã xử lý" },
    { key: "Closed", label: "Closed", sub: "Xác nhận & Đóng" },
  ];
}

export function getTicketTabs(tickets = []) {
  const countByStage = (stage) =>
    tickets.filter((t) => normalizeTicketStage(t) === stage).length;

  return [
    { id: "all", label: `Tất cả (${tickets.length})` },
    { id: "Reported", label: `Reported (${countByStage("Reported")})` },
    { id: "Investigating", label: `Investigating (${countByStage("Investigating")})` },
    { id: "Assessed", label: `Assessed (${countByStage("Assessed")})` },
    { id: "Resolved", label: `Resolved (${countByStage("Resolved")})` },
    { id: "Closed", label: `Closed (${countByStage("Closed")})` },
  ];
}

export function getSupportTickets() {
  return [];
}
