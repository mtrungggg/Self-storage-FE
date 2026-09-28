// Data layer: content source for the Login page.
// Swappable with a real API/CMS call later without touching the hook or the page.
export function getLoginFeatures() {
  return [
    {
      icon: "smart_toy",
      title: "Bảo mật sinh trắc học",
      text: "Vân tay & nhận diện khuôn mặt AI",
      tone: "bg-[#eaf2ff] text-[#1c5fe8]",
    },
    {
      icon: "vpn_key",
      title: "Khóa số hóa",
      text: "Mã khóa tự động đổi mỗi phiên",
      tone: "bg-[#0d1b2a] text-white",
    },
    {
      icon: "shield",
      title: "Camera nhiệt & định vị khu vực",
      text: "Giám sát khu vực 24/7",
      tone: "bg-[#edf7f1] text-[#0e7b4c]",
    },
  ];
}
