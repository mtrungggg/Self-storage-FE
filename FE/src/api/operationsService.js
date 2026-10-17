import apiClient from "./apiClient";

// Service layer: wraps the backend "Operations" API group (pricing rates/fees, promotions, facilities).
export const operationsService = {
  /**
   * Lấy danh sách bậc giá thuê theo kho / loại ô kho
   * @param {{ facilityId?: number, unitTypeId?: number, effectiveOn?: string, pageNumber?: number, pageSize?: number }} params
   */
  async getPricingRates(params = {}) {
    const res = await apiClient.get("/operations/pricing/rates", { params });
    return res?.data ?? null;
  },

  /**
   * Tạo mới / cập nhật một bậc giá thuê
   * @param {{ id?: number, facilityId: number, unitTypeId: number, monthlyRate: number, depositAmount?: number, bookingFee: number, validFrom: string, validTo?: string }} payload
   */
  async updatePricingRate(payload) {
    const res = await apiClient.put("/operations/pricing/rates", payload);
    return res?.data ?? null;
  },

  /**
   * Lấy danh sách phụ phí vận hành (phí trễ hạn, phí hư hỏng, phí mất chìa khoá...)
   * @param {{ facilityId?: number, globalOnly?: boolean, search?: string, feeType?: string, isActive?: boolean, effectiveOn?: string, pageNumber?: number, pageSize?: number }} params
   */
  async getPricingFees(params = {}) {
    const res = await apiClient.get("/operations/pricing/fees", { params });
    return res?.data ?? null;
  },

  /**
   * Tạo mới / cập nhật một phụ phí vận hành
   * @param {{ id?: number, facilityId?: number, code: string, feeType: string, calculationMethod: string, amount?: number, ratePercent?: number, graceDays: number, conditions: string, validFrom: string, validTo?: string, isActive: boolean }} payload
   */
  async updatePricingFee(payload) {
    const res = await apiClient.put("/operations/pricing/fees", payload);
    return res?.data ?? null;
  },

  /**
   * Lấy danh sách chương trình khuyến mãi / voucher
   * @param {{ search?: string, discountType?: string, isActive?: boolean, effectiveAt?: string, pageNumber?: number, pageSize?: number }} params
   */
  async getPromotions(params = {}) {
    const res = await apiClient.get("/operations/promotions", { params });
    return res?.data ?? null;
  },

  /**
   * Tạo mới chương trình khuyến mãi / voucher
   * @param {{ code: string, name: string, description?: string, discountType: string, discountValue: number, maxDiscountAmount?: number, usageLimit?: number, perCustomerLimit?: number, validFrom: string, validTo: string, isActive?: boolean, rules?: Array<{ ruleType: string, operator: string, ruleValue: string }> }} payload
   */
  async createPromotion(payload) {
    const res = await apiClient.post("/operations/promotions", payload);
    return res?.data ?? null;
  },

  /**
   * Bật / tắt một chương trình khuyến mãi
   * @param {number} id
   * @param {boolean} isActive
   */
  async updatePromotionStatus(id, isActive) {
    const res = await apiClient.put(`/operations/promotions/${id}/status`, { isActive });
    return res?.data ?? null;
  },

  /**
   * Tạo mới một kho (facility)
   * @param {{ code: string, name: string, addressLine: string, ward?: string, district?: string, city: string, latitude?: number, longitude?: number, timezone: string, openingTime?: string, closingTime?: string, status: string }} payload
   */
  async createFacility(payload) {
    const res = await apiClient.post("/operations/facilities", payload);
    return res?.data ?? null;
  },

  /**
   * Cập nhật một kho theo id truyền trong body
   * @param {{ id: number, code: string, name: string, addressLine: string, ward?: string, district?: string, city: string, latitude?: number, longitude?: number, timezone: string, openingTime?: string, closingTime?: string, status: string }} payload
   */
  async updateFacility(payload) {
    const res = await apiClient.put("/operations/facilities", payload);
    return res?.data ?? null;
  },

  /**
   * Cập nhật một kho theo id trên URL
   * @param {number} id
   * @param {{ code: string, name: string, addressLine: string, ward?: string, district?: string, city: string, latitude?: number, longitude?: number, timezone: string, openingTime?: string, closingTime?: string, status: string }} payload
   */
  async updateFacilityById(id, payload) {
    const res = await apiClient.put(`/operations/facilities/${id}`, payload);
    return res?.data ?? null;
  },
};

export default operationsService;
