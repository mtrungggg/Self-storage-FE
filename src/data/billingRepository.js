// Data layer: content source for the Billing page.
export function getInvoices() {
  return [
    {
      id: "#INV-2025-1002",
      date: "01/10/2025",
      desc: "Thuê kho #B-204 (T10/2025)",
      note: "Kèm bảo hiểm VaultGuard ($12.00)",
      amount: "$101.00 USD",
      method: "Visa ****4092",
      status: "paid",
    },
    {
      id: "#INV-2025-0902",
      date: "01/09/2025",
      desc: "Thuê kho #B-204 (T09/2025)",
      note: "Cước định kỳ chuẩn",
      amount: "$101.00 USD",
      method: "Visa ****4092",
      status: "paid",
    },
    {
      id: "#INV-2025-0815",
      date: "15/08/2025",
      desc: "Ký hợp đồng kho Garage #D-118",
      note: "Cước tháng đầu ($159.00) + Cọc ($51.00)",
      amount: "$210.00 USD",
      method: "Apple Pay",
      status: "paid",
    },
    {
      id: "#INV-2025-1101",
      date: "01/11/2025",
      desc: "Tổng cước kỳ tới (#B-204 & #D-118)",
      note: "Cước tháng 11 gộp tự động trích",
      amount: "$260.00 USD",
      method: "Sẽ tự trừ cuối",
      status: "upcoming",
    },
  ];
}

export function getInvoiceTabs() {
  return [
    { id: "all", label: "Tất cả đơn" },
    { id: "paid", label: "Đã thanh toán" },
    { id: "upcoming", label: "Sắp đến hạn" },
    { id: "deposit", label: "Cọc & Hoàn tiền" },
  ];
}

export function getBillingTrustBadges() {
  return [
    { icon: "verified", title: "ISO 27001", text: "An ninh thông tin đạt chuẩn" },
    { icon: "lock", title: "SSL 256-Bit", text: "Mã hóa thanh toán ngân hàng" },
    { icon: "videocam", title: "CCTV 24/7", text: "Giám sát liên tục mọi hành lang" },
    { icon: "health_and_safety", title: "Bảo hiểm toàn diện", text: "Bảo vệ tài sản rủi ro tối đa" },
  ];
}
