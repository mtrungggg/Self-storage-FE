// Data layer: content & listing source for the Home (storage search) page.
export function getFacilities() {
  return [
    {
      id: "downtown",
      badge: "Premium Facility",
      distance: "0.8 mi",
      rating: "4.9",
      reviews: 342,
      tag: "Modern & Clean",
      name: "VaultSpace Downtown",
      address: "410 S Congress Ave, Austin, TX 78704",
      perks: ["Smart Bluetooth", "Climate Controlled", "24/7 CCTV", "Drive-up Access"],
      note: "Only 3 units left",
      noteTone: "text-[#b45309]",
      sizes: [
        { label: "5' x 5' (2.3m²)", price: "$49/mo" },
        { label: "5' x 10' (4.6m²)", price: "$89/mo" },
        { label: "10' x 10' (9.3m²)", price: "$139/mo" },
        { label: "10' x 20' (18.6m²)", price: "$220/mo" },
      ],
      from: "$49/mo",
      image: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "north-tech",
      badge: "Best Value",
      distance: "2.1 mi",
      rating: "4.8",
      reviews: 198,
      tag: "Modern High-Ceiling",
      name: "VaultSpace North Tech",
      address: "9400 Research Blvd, Austin, TX 78759",
      perks: ["Keyless Entry", "Freight Elevator", "Full AC Climate", "Covered Loading"],
      note: "Move-in today",
      noteTone: "text-[#0e7b4c]",
      sizes: [
        { label: "5' x 10'", price: "$39.50/mo" },
        { label: "10' x 10'", price: "$125/mo" },
        { label: "10' x 15'", price: "$175/mo" },
        { label: "10' x 25'", price: "$245/mo" },
      ],
      from: "$39.50/mo",
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
    },
    {
      id: "riverside",
      badge: "Drive-Up Access",
      distance: "3.4 mi",
      rating: "4.9",
      reviews: 215,
      tag: "Direct Ground Access",
      name: "VaultSpace East Riverside",
      address: "2100 E Riverside Dr, Austin, TX 78741",
      perks: ["Spacious Parking", "Security Roll-up Doors", "Keypad Gate Entry", "EV Charging Station"],
      note: "Vehicle capacity",
      noteTone: "text-[#1d5fe5]",
      sizes: [
        { label: "10' x 10'", price: "$119/mo" },
        { label: "10' x 20'", price: "$195/mo" },
        { label: "10' x 30'", price: "$279/mo" },
        { label: "Vehicle Parking", price: "$160/mo" },
      ],
      from: "$119/mo",
      image: "https://images.unsplash.com/photo-1553413077-190dd305871c?auto=format&fit=crop&w=800&q=80",
    },
  ];
}

export function getSizeGuideTabs() {
  return [
    { id: "studio", label: "5' x 10' (Studio)" },
    { id: "1-2br", label: "10' x 10' (1-2 Phòng ngủ)" },
    { id: "house", label: "10' x 20' (Nguyên căn nhà)" },
  ];
}

export function getHomeHighlights() {
  return [
    {
      icon: "event_available",
      title: "Không ràng buộc dài hạn",
      text: "Lưu kho 1 tháng hay 5 năm tùy ý, đổi hoặc trả kho online bất cứ lúc nào.",
    },
    {
      icon: "toll",
      title: "Không phụ phí ẩn",
      text: "Báo giá minh bạch, cố định, không phát sinh phí ẩn.",
    },
    {
      icon: "local_shipping",
      title: "Miễn phí xe tải chuyển đồ (4h)",
      text: "Miễn phí xe tải 4h cho hợp đồng thuê kho từ 10x10 trở lên.",
    },
    {
      icon: "lock_open",
      title: "Mở khóa thông minh tiện lợi",
      text: "Mở cổng và cửa cuốn tự động chỉ với 1 chạm trên điện thoại.",
    },
  ];
}

export function getHomeTrustBadges() {
  return [
    { icon: "verified", title: "Chứng nhận ISO 27001", text: "Bảo vệ Dữ liệu & Cơ sở" },
    { icon: "lock", title: "Mã hóa SSL 256-Bit", text: "Khóa an ninh cấp độ quân sự" },
    { icon: "videocam", title: "Camera CCTV giám sát 24/7", text: "Giám sát liên tục các dãy kho" },
    { icon: "health_and_safety", title: "Bảo hiểm toàn diện", text: "Gói bảo hiểm lên đến $50,000" },
  ];
}
