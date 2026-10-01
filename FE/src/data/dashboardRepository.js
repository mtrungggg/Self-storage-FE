// Data layer: content source for the CustomerDashboard ("Kho của tôi") page.
export function getDashboardAccessLogs(primaryRental) {
  if (!primaryRental || !primaryRental.unitCode) {
    return [];
  }

  const unitCode = primaryRental.unitCode;
  const facility = primaryRental.facilityName || "Cơ sở lưu trữ";
  const agreementNo = primaryRental.agreementNo || "HĐ";
  const rateText = primaryRental.monthlyRate
    ? `${Number(primaryRental.monthlyRate).toLocaleString("vi-VN")} đ`
    : "";

  return [
    {
      icon: "lock_open",
      title: `Mở kho #${unitCode}`,
      time: "14:45",
      note: "Bàn phím • Mã PIN",
    },
    {
      icon: "directions_car",
      title: `Vào ${facility}`,
      time: "14:41",
      note: "Cổng kiểm soát • Mã QR",
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
      time: "Kỳ hiện tại",
      note: rateText ? `${rateText} • Đã thanh toán` : "Đang hiệu lực",
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
