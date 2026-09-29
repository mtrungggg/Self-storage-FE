import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { getMoveInOptions, getTimeSlots, getProtectionPlans } from "../data/storageDetailRepository";
import {
  calculateBookingTotal,
  BASE_RENT,
  DEPOSIT,
  SMART_LOCK_ACTIVATION,
} from "../domain/usecases/calculateBookingTotal";

// Application layer: encapsulates StorageDetail (booking) page state, pricing and data wiring.
export function useStorageDetail() {
  const location = useLocation();
  const unitFromState = location.state?.unit;

  // Selected unit details or fallback default
  const unit = useMemo(() => {
    if (unitFromState) return unitFromState;
    return {
      id: "unit-downtown-b204",
      unitCode: "#B-204",
      facilityName: "Vault Trung tâm",
      address: "420 E Cesar Chavez St, Quận 1",
      floor: "Tầng trệt • Dãy B",
      dimension: "5' x 10' (4.6 m²)",
      sizeLabel: "5' x 10'",
      volume: "12.7 m³",
      height: "2.7m",
      typeName: "Kho máy lạnh",
      fitNote: "Phù hợp chứa đồ 1 phòng ngủ hoặc căn hộ studio.",
      rentPrice: BASE_RENT,
      depositPrice: DEPOSIT,
      policies: [
        "Hủy miễn phí trước 24h",
        "Khóa số 24/7 qua điện thoại",
        "Tiền cọc hoàn trả 100%",
        "Không phụ phí ẩn",
      ],
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
    };
  }, [unitFromState]);

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

  const { totalToday, monthlyRent, firstMonthDiscount } = useMemo(
    () =>
      calculateBookingTotal({
        protectionPrice,
        addons,
        baseRent: unit.rentPrice,
        deposit: unit.depositPrice,
      }),
    [protectionPrice, addons, unit.rentPrice, unit.depositPrice]
  );

  const toggleAddon = (key) => setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  const canSubmit = agreeTerms && agreeLock;

  return {
    unit,
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
    pricing: {
      baseRent: unit.rentPrice,
      deposit: unit.depositPrice,
      smartLockActivation: SMART_LOCK_ACTIVATION,
      firstMonthDiscount,
    },
  };
}
