// Data layer: content & listing source for the Home (storage search & reservation) page.

export function getSizeFilters() {
  return [
    { id: "all", label: "Tất cả kích thước", subtext: "Mọi diện tích" },
    { id: "small", label: "Nhỏ (< 5 m²)", subtext: "Tủ cá nhân, đồ theo mùa" },
    { id: "medium", label: "Vừa (5 - 10 m²)", subtext: "Căn hộ 1-2 phòng ngủ" },
    { id: "large", label: "Lớn (10 - 20 m²)", subtext: "Căn hộ 3PN, nhà phố" },
    { id: "vehicle", label: "Kho xe / Rất lớn (> 20 m²)", subtext: "Ô tô, hàng thương mại" },
  ];
}

export function getRentalTerms() {
  return [
    { id: "month", label: "Từng tháng linh hoạt", discount: "0%" },
    { id: "quarter", label: "3 tháng (Giảm 5%)", discount: "5%" },
    { id: "half-year", label: "6 tháng (Giảm 10%)", discount: "10%" },
    { id: "year", label: "12 tháng (Giảm 15%)", discount: "15%" },
  ];
}

export function getSizeGuideTabs() {
  return [
    { id: "studio", label: "5' x 10' (4.6 m²)", title: "Căn hộ Studio / 1 Phòng ngủ", desc: "Chứa được giường queen, ghế sofa, bàn trà, tủ quần áo và 15-20 thùng carton." },
    { id: "1-2br", label: "10' x 10' (9.3 m²)", title: "Căn hộ 2 Phòng ngủ", desc: "Chứa đồ đạc 2 phòng ngủ hoàn chỉnh, tủ lạnh, máy giặt, bàn ăn và xe đạp." },
    { id: "house", label: "10' x 20' (18.6 m²)", title: "Nhà phố / Nguyên căn", desc: "Tương đương garage 1 xe hơi. Chứa toàn bộ nội thất nhà 3-4 phòng ngủ hoặc hàng hóa kinh doanh." },
  ];
}

export function getHomeHighlights() {
  return [
    {
      icon: "event_available",
      title: "Hợp đồng linh hoạt",
      text: "Thuê theo tháng, hủy bất cứ lúc nào trực tuyến không phí phạt.",
    },
    {
      icon: "toll",
      title: "Minh bạch tuyệt đối",
      text: "Không phụ phí phát sinh, tiền cọc được hoàn trả đúng hẹn.",
    },
    {
      icon: "local_shipping",
      title: "Hỗ trợ vận chuyển",
      text: "Tặng 2 giờ xe tải chuyển đồ cho hợp đồng từ 3 tháng.",
    },
    {
      icon: "lock_open",
      title: "Khóa số thông minh",
      text: "Mở cổng và ô kho 24/7 trực tiếp qua điện thoại hoặc mã PIN.",
    },
  ];
}
