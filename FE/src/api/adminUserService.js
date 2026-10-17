import apiClient from "./apiClient";

export default {
  async updateStatus(id, { status, reason }) {
    const response = await apiClient.put(`/admin/users/${encodeURIComponent(id)}/status`, { status, reason });
    if (response?.success !== true) {
      throw new Error(response?.message || "Không thể cập nhật trạng thái người dùng.");
    }
    if (response.data?.id == null || !response.data?.status) {
      throw new Error("Phản hồi cập nhật không hợp lệ. Hãy làm mới để kiểm tra trạng thái hiện tại.");
    }
    return response.data;
  },
  async getUser(id) {
    const response = await apiClient.get(`/admin/users/${encodeURIComponent(id)}`);
    if (response?.success !== true) {
      throw new Error(response?.message || "Không thể tải thông tin người dùng.");
    }
    if (response.data?.id == null) {
      throw new Error("Thông tin người dùng trả về không hợp lệ.");
    }
    return response.data;
  },
  async createUser(payload) {
    const response = await apiClient.post("/admin/users", payload);
    if (response?.success !== true) {
      throw new Error(response?.message || "Không thể tạo người dùng.");
    }
    return response.data;
  },
  async getUsers({ Search, Role, Status, FacilityId, PageNumber = 1, PageSize = 10 }) {
    const params = { PageNumber, PageSize };
    for (const [key, value] of Object.entries({ Search, Role, Status, FacilityId })) {
      if (value !== "" && value != null) params[key] = value;
    }
    const response = await apiClient.get("/admin/users", { params });
    if (response?.success !== true) {
      throw new Error(response?.message || "Không thể tải danh sách người dùng.");
    }
    if (!Array.isArray(response.data?.items)) {
      throw new Error("Danh sách người dùng trả về không hợp lệ.");
    }
    return response.data;
  },
};
