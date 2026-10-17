import apiClient from "./apiClient";

export default {
  async create(payload) {
    const response = await apiClient.post("/admin/staff-assignments", payload);
    if (response?.success !== true) throw new Error(response?.message || "Không thể tạo phân công.");
    if (response.data?.id == null) throw new Error("Phản hồi không hợp lệ. Hãy làm mới để kiểm tra phân công trước khi thử lại.");
    return response.data;
  },
};
