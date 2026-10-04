// Data layer: metadata helpers for AccessControl page (no hardcoded mock records).
export function getRelationshipOptions() {
  return [
    { value: "Người thân", label: "Người thân / Gia đình" },
    { value: "Đối tác", label: "Đối tác / Đồng nghiệp" },
    { value: "Nhân viên giao nhận", label: "Nhân viên vận chuyển / Giao nhận" },
    { value: "Kỹ thuật / Bảo trì", label: "Kỹ thuật / Bảo trì riêng" },
    { value: "Khác", label: "Khác" },
  ];
}
