import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getPolicyVersionBanner,
  getOverviewHeader,
  getHeaderActions,
  getPriceTerms,
  getDepositPolicy,
  getAutoLockPolicy,
  getCancellationPolicy,
  getCancellationNote,
  getYieldRecommendation,
} from "../data/pricingPolicyRepository";
import { calculatePriceMatrix } from "../domain/usecases/calculatePriceMatrix";
import managerService from "../api/managerService";

function formatDateVN(value) {
  if (!value) return "—";
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? value : date.toLocaleDateString("vi-VN");
}

// Diễn giải phụ phí theo cách tính (flat/percentage/per_day) trả về từ API.
function describeFee(fee) {
  if (fee.calculationMethod === "percentage") return `${fee.ratePercent ?? 0}%`;
  if (fee.calculationMethod === "per_day") return `${(fee.amount ?? 0).toLocaleString("vi-VN")} ₫/ngày`;
  return `${(fee.amount ?? 0).toLocaleString("vi-VN")} ₫`;
}

// Diễn giải mức giảm giá của chương trình khuyến mãi trả về từ API.
function describePromotion(promotion) {
  if (promotion.discountType === "percentage") {
    const cap = promotion.maxDiscountAmount
      ? ` (tối đa ${promotion.maxDiscountAmount.toLocaleString("vi-VN")} ₫)`
      : "";
    return `Giảm ${promotion.discountValue}%${cap}`;
  }
  return `Giảm ${(promotion.discountValue ?? 0).toLocaleString("vi-VN")} ₫`;
}

// Application layer: encapsulates Pricing & Policy Configuration page state and data wiring against the real Operations API.
export function usePricingPolicy() {
  const versionBanner = getPolicyVersionBanner();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const priceTerms = getPriceTerms();
  const depositPolicyDefaults = getDepositPolicy();
  const autoLockPolicyDefaults = getAutoLockPolicy();
  const cancellationPolicy = getCancellationPolicy();
  const cancellationNote = getCancellationNote();
  const yieldRecommendation = getYieldRecommendation();

  const [depositPercent, setDepositPercent] = useState(depositPolicyDefaults.depositPercent);
  const [latePenaltyPercent, setLatePenaltyPercent] = useState(depositPolicyDefaults.latePenaltyPercent);
  const [graceDays, setGraceDays] = useState(autoLockPolicyDefaults.graceDays);

  const [rates, setRates] = useState([]);
  const [basePrices, setBasePrices] = useState({});
  const [dirtyRateIds, setDirtyRateIds] = useState(() => new Set());

  const [fees, setFees] = useState([]);

  const [promotions, setPromotions] = useState([]);
  const [activeVoucherIds, setActiveVoucherIds] = useState(() => new Set());

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");

  const loadAll = useCallback(async () => {
    setLoading(true);
    setError("");
    try {
      const [ratesPage, feesPage, promotionsPage] = await Promise.all([
        managerService.getPricingRates(1, { pageSize: 100 }).catch(() => ({ items: [] })),
        managerService.getPricingFees({ pageSize: 100 }),
        managerService.getPromotions({ pageSize: 50 }),
      ]);

      const rateItems = ratesPage?.items ?? [];
      setRates(rateItems);
      setBasePrices(Object.fromEntries(rateItems.map((rate) => [rate.id, rate.monthlyRate])));
      setDirtyRateIds(new Set());

      setFees(feesPage?.items ?? []);

      const promotionItems = promotionsPage?.items ?? [];
      setPromotions(promotionItems);
      setActiveVoucherIds(new Set(promotionItems.filter((promo) => promo.isActive).map((promo) => promo.id)));
    } catch (err) {
      setError(err?.message || "Không thể tải dữ liệu từ máy chủ.");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadAll();
  }, [loadAll]);

  const updateBasePrice = (id, value) => {
    setBasePrices((prev) => ({ ...prev, [id]: Number(value) || 0 }));
    setDirtyRateIds((prev) => new Set(prev).add(id));
  };

  const priceUnits = useMemo(
    () =>
      rates.map((rate) => ({
        id: rate.id,
        label: rate.unitTypeName || `Loại ô #${rate.unitTypeId}`,
        spec: `Hiệu lực từ ${formatDateVN(rate.validFrom)}`,
        badge: rate.facilityName,
        basePrice: basePrices[rate.id] ?? rate.monthlyRate,
      })),
    [rates, basePrices]
  );

  const priceMatrix = useMemo(() => calculatePriceMatrix(priceUnits, priceTerms), [priceUnits, priceTerms]);

  const serviceFees = useMemo(
    () =>
      fees.map((fee) => ({
        id: fee.id,
        label: `${fee.code || fee.feeType}${fee.facilityName ? ` • ${fee.facilityName}` : ""}`,
        value: describeFee(fee),
      })),
    [fees]
  );

  const vouchers = useMemo(
    () =>
      promotions.map((promotion) => ({
        id: promotion.id,
        code: promotion.code,
        tag: promotion.discountType === "percentage" ? "% Giảm giá" : "Giảm giá cố định",
        description: promotion.description || promotion.name,
        detail: describePromotion(promotion),
        expiry: formatDateVN(promotion.validTo),
        condition: promotion.usageLimit ? `Giới hạn: ${promotion.usageLimit} lượt` : "Không giới hạn lượt dùng",
      })),
    [promotions]
  );

  const toggleVoucher = async (id) => {
    const nextActive = !activeVoucherIds.has(id);
    setActiveVoucherIds((prev) => {
      const next = new Set(prev);
      if (nextActive) next.add(id);
      else next.delete(id);
      return next;
    });
    try {
      await managerService.updatePromotionStatus(id, nextActive);
      setPromotions((prev) => prev.map((item) => (item.id === id ? { ...item, isActive: nextActive } : item)));
      setNotice(nextActive ? "Đã kích hoạt chương trình khuyến mãi." : "Đã tạm dừng chương trình khuyến mãi.");
    } catch (err) {
      // Gọi API thất bại: hoàn tác thay đổi lạc quan ở UI
      setActiveVoucherIds((prev) => {
        const next = new Set(prev);
        if (nextActive) next.delete(id);
        else next.add(id);
        return next;
      });
      setError(err?.message || "Không thể cập nhật trạng thái khuyến mãi.");
    }
  };

  const createVoucher = async (payload) => {
    setSaving(true);
    setError("");
    try {
      await managerService.createPromotion(payload);
      setNotice("Đã tạo chương trình khuyến mãi mới.");
      await loadAll();
      return true;
    } catch (err) {
      setError(err?.message || "Không thể tạo chương trình khuyến mãi.");
      return false;
    } finally {
      setSaving(false);
    }
  };

  const saveRateChanges = async () => {
    if (dirtyRateIds.size === 0) {
      setNotice("Không có thay đổi nào cần lưu.");
      return;
    }
    setSaving(true);
    setError("");
    try {
      await Promise.all(
        Array.from(dirtyRateIds).map((id) => {
          const rate = rates.find((item) => item.id === id);
          if (!rate) return Promise.resolve();
          return managerService.updatePricingRates(rate.facilityId, {
            id: rate.id,
            facilityId: rate.facilityId,
            unitTypeId: rate.unitTypeId,
            monthlyRate: basePrices[id] ?? rate.monthlyRate,
            depositAmount: rate.depositAmount,
            bookingFee: rate.bookingFee,
            validFrom: rate.validFrom,
            validTo: rate.validTo,
          });
        })
      );
      setNotice("Đã lưu thay đổi bảng giá thuê.");
      await loadAll();
    } catch (err) {
      setError(err?.message || "Không thể lưu thay đổi bảng giá thuê.");
    } finally {
      setSaving(false);
    }
  };

  return {
    versionBanner,
    header,
    headerActions,
    priceTerms,
    priceMatrix,
    basePrices,
    updateBasePrice,
    depositPercent,
    setDepositPercent,
    latePenaltyPercent,
    setLatePenaltyPercent,
    graceDays,
    setGraceDays,
    serviceFees,
    cancellationPolicy,
    cancellationNote,
    vouchers,
    activeVoucherIds,
    toggleVoucher,
    createVoucher,
    yieldRecommendation,
    loading,
    saving,
    error,
    notice,
    dismissNotice: () => setNotice(""),
    dismissError: () => setError(""),
    saveRateChanges,
    reload: loadAll,
  };
}
