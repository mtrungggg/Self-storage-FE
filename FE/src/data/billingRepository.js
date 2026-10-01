// Data layer: content source for the Billing page.
export function getInvoiceTabs() {
  return [
    { id: "all", label: "Tất cả" },
    { id: "paid", label: "Đã thanh toán" },
    { id: "upcoming", label: "Sắp đến hạn" },
    { id: "deposit", label: "Tiền cọc" },
  ];
}
