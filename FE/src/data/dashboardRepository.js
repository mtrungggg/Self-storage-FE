// Data layer: content source for the CustomerDashboard ("Kho của tôi") page.
export function getDashboardAccessLogs() {
  return [
    {
      icon: "lock_open",
      title: "Mở kho #B-204",
      time: "14:45",
      note: "Bluetooth • Alex Morgan",
    },
    {
      icon: "directions_car",
      title: "Vào Cổng Nam",
      time: "14:41",
      note: "Apple Wallet NFC",
    },
    {
      icon: "local_shipping",
      title: "Xác thực mã PIN",
      time: "18/10",
      note: "Đơn vị vận chuyển",
    },
    {
      icon: "receipt_long",
      title: "Gia hạn hợp đồng",
      time: "01/10",
      note: "$101.00 • Visa",
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
