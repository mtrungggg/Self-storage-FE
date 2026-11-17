import catalogApi from "../services/api/catalogApi";

export const pricingService = {
  calculateQuote: (data) => catalogApi.getPricingQuote(data),
  calculatePricing: (data) =>
    catalogApi.getPricingQuote({
      facilityId: data.facilityId,
      unitTypeId: data.unitTypeId,
      startDate: data.startDate || new Date().toISOString().slice(0, 10),
      durationMonths: data.durationMonths,
      promotionCode: data.promotionCode ?? data.voucherCode,
    }),
};

export default pricingService;
