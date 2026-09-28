import { useMemo, useState } from "react";
import { getMoveInOptions, getTimeSlots, getProtectionPlans } from "../data/storageDetailRepository";
import {
  calculateBookingTotal,
  BASE_RENT,
  DEPOSIT,
  SMART_LOCK_ACTIVATION,
  FIRST_MONTH_DISCOUNT,
} from "../domain/usecases/calculateBookingTotal";

// Application layer: encapsulates StorageDetail (booking) page state, pricing and data wiring.
export function useStorageDetail() {
  const moveInOptions = getMoveInOptions();
  const timeSlots = getTimeSlots();
  const protectionPlans = getProtectionPlans();

  const [moveInOption, setMoveInOption] = useState("fri");
  const [timeSlot, setTimeSlot] = useState("noon");
  const [protectionPlan, setProtectionPlan] = useState("standard");
  const [addons, setAddons] = useState({ lockKit: true, blankets: false, boxKit: false });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeLock, setAgreeLock] = useState(true);

  const protectionPrice = protectionPlans.find((p) => p.id === protectionPlan)?.price ?? 0;

  const { totalToday, monthlyRent } = useMemo(
    () => calculateBookingTotal({ protectionPrice, addons }),
    [protectionPrice, addons]
  );

  const toggleAddon = (key) => setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  const canSubmit = agreeTerms && agreeLock;

  return {
    moveInOptions,
    timeSlots,
    protectionPlans,
    moveInOption,
    setMoveInOption,
    timeSlot,
    setTimeSlot,
    protectionPlan,
    setProtectionPlan,
    addons,
    toggleAddon,
    agreeTerms,
    setAgreeTerms,
    agreeLock,
    setAgreeLock,
    protectionPrice,
    totalToday,
    monthlyRent,
    canSubmit,
    pricing: { baseRent: BASE_RENT, deposit: DEPOSIT, smartLockActivation: SMART_LOCK_ACTIVATION, firstMonthDiscount: FIRST_MONTH_DISCOUNT },
  };
}
