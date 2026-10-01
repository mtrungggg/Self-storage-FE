// Data layer: content source for the CustomerDashboard ("Kho của tôi") page.
export function getDashboardAccessLogs(primaryRental) {
  const unitCode = primaryRental?.unitCode || "A-101";
  const facility = primaryRental?.facilityName || "Thu Duc Self Storage";
  const agreementNo = primaryRental?.agreementNo || "AGR-HCM-2026-0001";
  const rateText = primaryRental?.monthlyRate
    ? `${Number(primaryRental.monthlyRate).toLocaleString("vi-VN")} đ`
    : "2.000 đ";

  return [
    {
      icon: "lock_open",
      title: `Mở kho #${unitCode}`,
      time: "14:45",
      note: "Khóa thông minh • Mã PIN điện tử",
    },
    {
      icon: "directions_car",
      title: `Vào ${facility}`,
      time: "14:41",
      note: "Cổng kiểm soát xe • Mã QR",
    },
    {
      icon: "local_shipping",
      title: `Xác thực kho #${unitCode}`,
      time: "Hôm nay",
      note: "Đã cấp quyền ra vào",
    },
    {
      icon: "receipt_long",
      title: `Hợp đồng #${agreementNo}`,
      time: "01/10",
      note: `${rateText} • Đã thanh toán`,
    },
  ];
}

export function getDashboardQuickActions() {
  return [
    { icon: "swap_horiz", title: "Đổi kho" },
    { icon: "shopping_cart", title: "Mua phụ kiện" },
    { icon: "event_note", title: "Báo trả kho" },
    { icon: "support_agent", title: "Hỗ trợ 24/7" },
  ];
}

export function getClimateChartData() {
  return {
    temperature: [21.0, 21.3, 21.5, 21.2, 21.0, 20.8, 21.1, 21.4, 21.6, 21.3, 21.1, 21.2],
    humidity: [46, 47, 48, 49, 48, 47, 46, 47, 48, 49, 48, 48],
  };
}
