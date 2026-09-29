// Data layer: content source for the Billing page.
export function getInvoices() {
  return [
    {
      id: "#INV-2025-1002",
      date: "01/10/2025",
      desc: "Kho #B-204 (T10/2025)",
      note: "Bảo hiểm VaultGuard",
      amount: "$101.00",
      method: "Visa •••• 4092",
      status: "paid",
    },
    {
      id: "#INV-2025-0902",
      date: "01/09/2025",
      desc: "Kho #B-204 (T09/2025)",
      note: "Cước định kỳ",
      amount: "$101.00",
      method: "Visa •••• 4092",
      status: "paid",
    },
    {
      id: "#INV-2025-0815",
      date: "15/08/2025",
      desc: "Hợp đồng kho #D-118",
      note: "Tháng đầu + Tiền cọc",
      amount: "$210.00",
      method: "Apple Pay",
      status: "paid",
    },
    {
      id: "#INV-2025-1101",
      date: "01/11/2025",
      desc: "Tổng cước kỳ tới (#B-204 & #D-118)",
      note: "Tự động trích thẻ",
      amount: "$260.00",
      method: "Visa •••• 4092",
      status: "upcoming",
    },
  ];
}

export function getInvoiceTabs() {
  return [
    { id: "all", label: "Tất cả" },
    { id: "paid", label: "Đã thanh toán" },
    { id: "upcoming", label: "Sắp đến hạn" },
    { id: "deposit", label: "Tiền cọc" },
  ];
}

export function getBillingTrustBadges() {
  return [
    { icon: "verified", title: "ISO 27001", text: "Chuẩn quốc tế" },
    { icon: "lock", title: "PCI-DSS Cấp 1", text: "Bảo mật thanh toán" },
    { icon: "videocam", title: "Camera 24/7", text: "Giám sát liên tục" },
    { icon: "health_and_safety", title: "Bảo hiểm $50k", text: "Bảo vệ tài sản" },
  ];
}
