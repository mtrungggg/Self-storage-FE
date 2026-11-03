import apiClient from "./apiClient";

const staffInspectionService = {
  /**
   * Submit move-out inspection
   * POST /api/staff/inspections/{id}/submit
   * @param {string|number} id
   * @param {{
   *   hasDamage: boolean,
   *   damageCost: number,
   *   refundAmount: number,
   *   penaltyAmount: number,
   *   notes?: string,
   *   damageItems?: Array<{ itemName: string, cost: number, notes?: string }>,
   *   evidenceUrls?: string[],
   *   refundMethod?: string
   * }} payload
   */
  async submitInspection(id, payload) {
    try {
      const response = await apiClient.post(
        `/staff/inspections/${encodeURIComponent(id)}/submit`,
        payload
      );
      if (response?.success === true) return response.data;
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback to legacy move-out inspect route if backend has not migrated
    const legacyPayload = {
      overallCondition: payload.hasDamage ? "damaged" : "good",
      summary: payload.notes || (payload.hasDamage ? "Kho có hư hại / cần vệ sinh" : "Kho sạch sẽ, không hư hại"),
      damageCost: payload.damageCost,
      refundAmount: payload.refundAmount,
      penaltyAmount: payload.penaltyAmount,
      inspectionItems: (payload.damageItems || []).map((item) => ({
        itemName: item.itemName,
        condition: item.condition || "damaged",
        chargeAmount: Number(item.cost || 0),
        notes: item.notes || "",
      })),
      evidenceUrls: payload.evidenceUrls || [],
    };
    const response = await apiClient.post(
      `/staff/move-outs/${encodeURIComponent(id)}/inspect`,
      legacyPayload
    );
    if (response?.success !== true) {
      throw new Error(response?.message || "Không thể gửi biên bản kiểm tra.");
    }
    return response.data;
  },

  /**
   * Get expiring contracts / move-out inspections assigned by Manager
   * GET /api/staff/inspections
   */
  async getAssignedInspections({ facilityId, status, date } = {}) {
    const params = {};
    if (facilityId != null && facilityId !== "") params.facilityId = facilityId;
    if (status) params.status = status;
    if (date) params.date = date;

    try {
      const response = await apiClient.get("/staff/inspections", { params });
      if (response?.success === true) {
        const data = response.data;
        if (Array.isArray(data)) return data;
        if (Array.isArray(data?.items)) return data.items;
        return [];
      }
    } catch (err) {
      if (err.status !== 404) throw err;
    }

    // Fallback to /staff/move-outs
    const fallback = await apiClient.get("/staff/move-outs", { params });
    if (fallback?.success === true) {
      const data = fallback.data;
      if (Array.isArray(data)) return data;
      if (Array.isArray(data?.items)) return data.items;
      return [];
    }
    return [];
  },
};

export default staffInspectionService;
