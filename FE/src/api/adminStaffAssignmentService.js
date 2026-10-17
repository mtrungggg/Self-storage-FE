import apiClient from "./apiClient";

export default {
  async remove(id) {
    const response = await apiClient.delete(`/admin/staff-assignments/${encodeURIComponent(id)}`);
    if (response?.success !== true) throw new Error(response?.message || "Không thể xóa phân công.");
    return response.data;
  },
  async create(payload) {
    const response = await apiClient.post("/admin/staff-assignments", payload);
    if (response?.success !== true) throw new Error(response?.message || "Không thể tạo phân công.");
    if (response.data?.id == null) throw new Error("Phản hồi không hợp lệ. Hãy làm mới để kiểm tra phân công trước khi thử lại.");
    return response.data;
  },
};
