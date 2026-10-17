import apiClient from "./apiClient";

export default {
  async getOverview() {
    const response = await apiClient.get("/admin/dashboard/overview");
    if (response?.success !== true) {
      throw new Error(response?.message || response?.errors?.join(", ") || "Không thể tải dashboard.");
    }
    const data = response.data;
    if (!data?.revenueKpi || !data?.occupancyKpi || !data?.userKpi || !Array.isArray(data?.facilityBreakdown)) {
      throw new Error("Dữ liệu dashboard trả về không hợp lệ.");
    }
    return data;
  },
};
