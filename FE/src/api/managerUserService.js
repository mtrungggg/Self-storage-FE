import apiClient from "./apiClient";

function normalizeStaff(s) {
  if (!s) return null;
  const id = s.employeeId ?? s.userId ?? s.id ?? s.employeeUserId;
  return {
    ...s,
    id,
    employeeId: s.employeeId ?? id,
    name: s.fullName || s.name || s.employeeName || (id ? `Staff #${id}` : "Nhân viên"),
    fullName: s.fullName || s.name || s.employeeName || (id ? `Staff #${id}` : "Nhân viên"),
    email: s.email || s.userEmail || "",
    phone: s.phoneNumber || s.phone || "",
    phoneNumber: s.phoneNumber || s.phone || "",
    role: s.assignmentRole || s.role || "Staff",
    position: s.assignmentRole || s.position || s.role || "Nhân viên cơ sở",
    isActive: s.isActive ?? (s.employmentStatus ? s.employmentStatus.toLowerCase() === "active" : true),
  };
}

export const managerUserService = {
  /**
   * Tab 1: GET /api/manager/staffs
   * Danh sách nhân viên thuộc cơ sở
   */
  async getStaffs(facilityId, params = {}) {
    const query = { ...params };
    if (facilityId) query.facilityId = facilityId;

    try {
      const res = await apiClient.get("/manager/staffs", { params: query });
      if (res?.success === true) {
        const data = res.data;
        const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : [];
        return list.map(normalizeStaff).filter(Boolean);
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback: GET /api/manager/facilities/{facilityId}/staff
    if (facilityId) {
      try {
        const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/staff`, { params });
        const list = Array.isArray(res?.data) ? res.data : Array.isArray(res?.data?.items) ? res.data.items : [];
        return list.map(normalizeStaff).filter(Boolean);
      } catch (fErr) {
        if (fErr.status !== 404) throw fErr;
      }
    }
    return [];
  },

  /**
   * Tab 1: POST /api/manager/staffs
   * Thêm nhân viên mới vào cơ sở
   */
  async createStaff(payload) {
    try {
      const res = await apiClient.post("/manager/staffs", payload);
      if (res?.success === true) return res.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback: POST /api/manager/facilities/{facilityId}/staff
    if (payload.facilityId) {
      const res = await apiClient.post(`/manager/facilities/${encodeURIComponent(payload.facilityId)}/staff`, payload);
      if (res?.success === true) return res.data;
    }

    throw new Error("Không thể tạo nhân viên.");
  },

  /**
   * Tab 1: PUT /api/manager/staffs/{id}
   * Sửa thông tin nhân viên
   */
  async updateStaff(id, payload) {
    try {
      const res = await apiClient.put(`/manager/staffs/${encodeURIComponent(id)}`, payload);
      if (res?.success === true) return res.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback nếu scoped theo cơ sở
    if (payload.facilityId) {
      const res = await apiClient.put(`/manager/facilities/${encodeURIComponent(payload.facilityId)}/staff/${encodeURIComponent(id)}`, payload);
      if (res?.success === true) return res.data;
    }

    throw new Error("Không thể cập nhật thông tin nhân viên.");
  },

  /**
   * Tab 1: PATCH /api/manager/staffs/{id}/status
   * Toggle Active / Inactive
   */
  async updateStaffStatus(id, isActive) {
    const status = isActive ? "active" : "inactive";
    const payload = { status, isActive };
    try {
      const res = await apiClient.patch(`/manager/staffs/${encodeURIComponent(id)}/status`, payload);
      if (res?.success === true) return res.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback to PUT
    const res = await apiClient.put(`/manager/staffs/${encodeURIComponent(id)}/status`, payload);
    if (res?.success === true) return res.data;

    throw new Error("Không thể cập nhật trạng thái nhân viên.");
  },

  /**
   * Tab 2: GET /api/manager/customers
   * Danh sách read-only Customer có Reservation / Agreement tại cơ sở
   */
  async getFacilityCustomers(facilityId, params = {}) {
    const query = { ...params };
    if (facilityId) query.facilityId = facilityId;

    try {
      const res = await apiClient.get("/manager/customers", { params: query });
      if (res?.success === true) {
        const data = res.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        return [];
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback 1: GET /api/manager/facilities/{facilityId}/customers
    if (facilityId) {
      try {
        const res = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/customers`, { params });
        if (res?.success === true) {
          const data = res.data;
          if (Array.isArray(data)) return data;
          if (Array.isArray(data?.items)) return data.items;
        }
      } catch (fErr) {
        if (fErr.status !== 404) throw fErr;
      }

      // Fallback 2: Trích xuất từ /api/manager/facilities/{facilityId}/agreements
      try {
        const agRes = await apiClient.get(`/manager/facilities/${encodeURIComponent(facilityId)}/agreements`, { params });
        const agreements = Array.isArray(agRes?.data) ? agRes.data : Array.isArray(agRes?.data?.items) ? agRes.data.items : [];
        const customersMap = new Map();

        agreements.forEach((a) => {
          const cId = a.customerId || a.customer?.id || a.id;
          if (!customersMap.has(cId)) {
            customersMap.set(cId, {
              id: cId,
              customerCode: `CUS-${cId}`,
              fullName: a.customerName || a.customer?.fullName || `Khách hàng #${cId}`,
              phoneNumber: a.customerPhone || a.customer?.phoneNumber || "—",
              email: a.customerEmail || a.customer?.email || "—",
              unitCode: a.unitCode || "—",
              agreementNo: a.agreementNo || "—",
              status: a.status || "active",
              startDate: a.startDate,
              endDate: a.endDate,
              activeAgreementsCount: 1,
            });
          } else {
            const existing = customersMap.get(cId);
            existing.activeAgreementsCount += 1;
            if (a.unitCode && !existing.unitCode.includes(a.unitCode)) {
              existing.unitCode += `, ${a.unitCode}`;
            }
          }
        });
        return Array.from(customersMap.values());
      } catch {
        return [];
      }
    }
    return [];
  },
};

export default managerUserService;
