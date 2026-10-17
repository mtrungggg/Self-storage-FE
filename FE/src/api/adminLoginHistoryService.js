import apiClient from "./apiClient";

export default {
  async getHistories(query) {
    const params = Object.fromEntries(Object.entries(query).filter(([, value]) => value !== "" && value != null));
    const response = await apiClient.get("/admin/login-histories", { params });
    if (response?.success !== true) throw new Error(response?.message || "Không thể tải lịch sử đăng nhập.");
    if (!Array.isArray(response.data?.histories?.items) || !response.data?.summary) throw new Error("Dữ liệu lịch sử đăng nhập không hợp lệ.");
    return response.data;
  },
};
