import apiClient from "./apiClient";

export default {
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
