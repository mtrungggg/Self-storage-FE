import { apiClient } from "./apiClient";

export const adminService = {
  // ==========================================
  // 1. Quản lý Người dùng (Users & RBAC)
  // ==========================================
  async getUsers(params = {}) {
    try {
      const res = await apiClient.get("/admin/users", { params });
      if (res && res.data) return res;
    } catch (err) {
      console.warn("adminService.getUsers error:", err);
    }
    return null;
  },

  async getUserDetail(id) {
    try {
      const res = await apiClient.get(`/admin/users/${id}`);
      if (res && res.data) return res;
    } catch (err) {
      console.warn("adminService.getUserDetail error:", err);
    }
    return null;
  },

  async createUser(payload) {
    return apiClient.post("/admin/users", payload);
  },

  async updateUserStatus(id, payload) {
    return apiClient.put(`/admin/users/${id}/status`, payload);
  },

  async updateUserRoles(id, roles) {
    return apiClient.put(`/admin/users/${id}/roles`, { roles });
  },

  async assignStaffToFacility(payload) {
    return apiClient.post("/admin/staff-assignments", payload);
  },

  async revokeStaffAssignment(id) {
    return apiClient.delete(`/admin/staff-assignments/${id}`);
  },

  // ==========================================
  // 2. Bảo mật & Nhật ký Kiểm toán (Audit Logs)
  // ==========================================
  async getAuditLogs(params = {}) {
    try {
      const res = await apiClient.get("/admin/audit-logs", { params });
      if (res && res.data) return res;
    } catch (err) {
      console.warn("adminService.getAuditLogs error:", err);
    }
    return null;
  },

  async getLoginHistories(params = {}) {
    try {
      const res = await apiClient.get("/admin/login-histories", { params });
      if (res && res.data) return res;
    } catch (err) {
      console.warn("adminService.getLoginHistories error:", err);
    }
    return null;
  },

  async getDashboardOverview() {
    try {
      const res = await apiClient.get("/admin/dashboard/overview");
      if (res && res.data) return res;
    } catch (err) {
      console.warn("adminService.getDashboardOverview error:", err);
    }
    return null;
  },
};

export default adminService;
