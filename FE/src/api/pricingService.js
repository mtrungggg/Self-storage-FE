import apiClient from "./apiClient";

export const pricingService = {
  /**
   * Tính giá thuê + tiền cọc + tổng chi phí ban đầu cho một lựa chọn thuê
   * @param {{ facilityId: number, unitTypeId: number, durationMonths: number, voucherCode?: string }} data
   */
  async calculatePricing(data) {
    const res = await apiClient.post("/customer/pricing/calculate", data);
    return res?.data ?? null;
  },
};

export default pricingService;
