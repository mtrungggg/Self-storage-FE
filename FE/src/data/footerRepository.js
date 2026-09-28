import { SUPPORT_EMAIL } from "../constants/brand";

// Data layer: footer column links shared by Billing, AccessControl and FacilityMap pages.
export function getDefaultFooterColumns() {
  return [
    {
      title: "Dịch vụ lưu kho",
      items: ["Kho kiểm soát nhiệt độ (Climate-Controlled)", "Kho tiếp cận trực tiếp ô tô (Drive-Up)", "Kho tài liệu & Hồ sơ doanh nghiệp", "Tủ khóa bảo mật sinh trắc cá nhân"],
    },
    {
      title: "Hỗ trợ & Pháp lý",
      items: ["Quy chế bảo an và xuất/nhập kho", "Chính sách bảo hiểm vật phẩm ký gửi", "Điều khoản hợp đồng thuê kho", "Quy trình xử lý sự cố khẩn cấp"],
    },
    {
      title: "Tổng đài trợ giúp",
      items: ["Trung tâm Điều hành An ninh", "Hỗ trợ kỹ thuật 24/7/365", SUPPORT_EMAIL],
      highlight: SUPPORT_EMAIL,
    },
  ];
}
