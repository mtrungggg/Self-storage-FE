// Data layer: content source for the AccessControl (PIN & smart lock) page.
export function getWallets() {
  return [
    { icon: "account_balance_wallet", title: "Apple Wallet", status: "Đã thêm thẻ", active: true },
    { icon: "wallet", title: "Google Wallet", status: "Chưa liên kết", active: false },
    { icon: "credit_card", title: "Thẻ từ NFC", status: "Sẵn sàng", active: true },
  ];
}

export function getGuestPins(unitCode = "A-101") {
  return [
    {
      id: "express",
      name: "Giao vận Express",
      tag: "Dùng 1 lần",
      status: "active",
      schedule: `14:00 – 17:00, hôm nay • Kho #${unitCode}`,
      code: "481903#",
      action: "Hủy mã",
    },
    {
      id: "family",
      name: "Người thân (Phương Thảo)",
      tag: "Định kỳ",
      status: "active",
      schedule: "T7 & CN hàng tuần (08:00 – 20:00)",
      code: "773201#",
      action: "Chỉnh sửa",
    },
    {
      id: "tech",
      name: "Thợ bảo trì kho",
      tag: "Hết hạn",
      status: "expired",
      schedule: "Đã sử dụng lúc 11:20",
      code: "119042#",
      action: "Cấp lại",
    },
  ];
}

export function getAccessControlLogs(unitCode = "A-101") {
  return [
    {
      icon: "lock_open",
      title: `Mở kho #${unitCode}`,
      time: "14:45 hôm nay",
      note: "Bluetooth • Ứng dụng điện thoại",
      dot: "#2dd4a0",
    },
    {
      icon: "directions_car",
      title: "Vào Barrier Cổng Chính",
      time: "14:41 hôm nay",
      note: "NFC / Quét mã QR",
      dot: "#1d5fe5",
    },
    {
      icon: "dialpad",
      title: `Mở kho #${unitCode}`,
      time: "18/10, 10:12",
      note: "Mã khách • Giao vận Express",
      dot: "#8996a9",
    },
    {
      icon: "key",
      title: `Mở kho #${unitCode}`,
      time: "10/10, 09:30",
      note: "Bàn phím mã PIN tại cửa",
      dot: "#8996a9",
    },
  ];
}
