import apiClient from "./apiClient";

export default {
  async getLogs(query) {
    const params = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== "" && value != null));
    const response = await apiClient.get("/admin/audit-logs", { params });
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải nhật ký quản trị.");
    if (!Array.isArray(response.data?.items)) throw new Error("Dữ liệu nhật ký trả về không hợp lệ.");
    return response.data;
  },
};
