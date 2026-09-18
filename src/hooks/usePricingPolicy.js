import { useMemo, useState } from "react";
import {
  getPolicyVersionBanner,
  getOverviewHeader,
  getHeaderActions,
  getPriceTerms,
  getPriceUnits,
  getDepositPolicy,
  getAutoLockPolicy,
  getServiceFees,
  getCancellationPolicy,
  getCancellationNote,
  getVoucherStats,
  getVouchers,
  getYieldRecommendation,
} from "../data/pricingPolicyRepository";
import { calculatePriceMatrix } from "../domain/usecases/calculatePriceMatrix";

// Application layer: encapsulates Pricing & Policy Configuration page state and data wiring.
export function usePricingPolicy() {
  const versionBanner = getPolicyVersionBanner();
  const header = getOverviewHeader();
  const headerActions = getHeaderActions();
  const priceTerms = getPriceTerms();
  const priceUnits = getPriceUnits();
  const depositPolicyDefaults = getDepositPolicy();
  const autoLockPolicyDefaults = getAutoLockPolicy();
  const serviceFees = getServiceFees();
  const cancellationPolicy = getCancellationPolicy();
  const cancellationNote = getCancellationNote();
  const voucherStats = getVoucherStats();
  const vouchers = getVouchers();
  const yieldRecommendation = getYieldRecommendation();

  const [basePrices, setBasePrices] = useState(() =>
    Object.fromEntries(priceUnits.map((unit) => [unit.id, unit.basePrice]))
  );
  const [depositPercent, setDepositPercent] = useState(depositPolicyDefaults.depositPercent);
  const [latePenaltyPercent, setLatePenaltyPercent] = useState(depositPolicyDefaults.latePenaltyPercent);
  const [graceDays, setGraceDays] = useState(autoLockPolicyDefaults.graceDays);
  const [activeVoucherIds, setActiveVoucherIds] = useState(
    () => new Set(vouchers.filter((voucher) => voucher.active).map((voucher) => voucher.id))
  );

  const updateBasePrice = (id, value) => setBasePrices((prev) => ({ ...prev, [id]: Number(value) || 0 }));
  const toggleVoucher = (id) =>
    setActiveVoucherIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });

  const priceMatrix = useMemo(() => {
    const unitsWithCurrentBase = priceUnits.map((unit) => ({ ...unit, basePrice: basePrices[unit.id] }));
    return calculatePriceMatrix(unitsWithCurrentBase, priceTerms);
  }, [priceUnits, priceTerms, basePrices]);

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
    voucherStats,
    vouchers,
    activeVoucherIds,
    toggleVoucher,
    yieldRecommendation,
  };
}
