import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import { getTimeSlots, getProtectionPlans } from "../data/storageDetailRepository";
import { calculateAddonsTotal } from "../domain/usecases/calculateBookingTotal";
import pricingService from "../api/pricingService";
import reservationService from "../api/reservationService";
import paymentService from "../api/paymentService";

const TERM_TO_MONTHS = { month: 1, quarter: 3, "half-year": 6, year: 12 };
const WEEKDAYS_VI = ["Chủ nhật", "Thứ 2", "Thứ 3", "Thứ 4", "Thứ 5", "Thứ 6", "Thứ 7"];

function toISODate(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDateVN(date) {
  return `${WEEKDAYS_VI[date.getDay()]}, ${String(date.getDate()).padStart(2, "0")}/${String(
    date.getMonth() + 1
  ).padStart(2, "0")}/${date.getFullYear()}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextFriday(base) {
  const day = base.getDay();
  const diff = (5 - day + 7) % 7 || 7;
  return addDays(base, diff);
}

// Application layer: encapsulates StorageDetail (booking) page state, pricing and data wiring.
export function useStorageDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const unitFromState = location.state?.unit;

  // Selected unit details or fallback default (matches backend seed data: facility #1, unit type #1)
  const unit = useMemo(() => {
    if (unitFromState) return unitFromState;
    return {
      id: null,
      facilityId: 1,
      unitTypeId: 1,
      unitCode: "#B-204",
      facilityName: "Vault Trung tâm",
      address: "420 E Cesar Chavez St, Quận 1",
      floor: "Tầng trệt • Dãy B",
      dimension: "2m x 3m",
      sizeLabel: "2m x 3m",
      volume: "7.5 m³",
      height: "2.5m",
      typeName: "Kho tiêu chuẩn",
      fitNote: "Phù hợp chứa đồ 1 phòng ngủ hoặc căn hộ studio.",
      rentPrice: null,
      depositPrice: null,
      policies: [
        "Hủy miễn phí trước 24h",
        "Khóa số 24/7 qua điện thoại",
        "Tiền cọc hoàn trả 100%",
        "Không phụ phí ẩn",
      ],
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
    };
  }, [unitFromState]);

  const timeSlots = getTimeSlots();
  const protectionPlans = getProtectionPlans();

  const [moveInOption, setMoveInOption] = useState("fri");
  const [timeSlot, setTimeSlot] = useState("noon");
  const [durationMonths, setDurationMonths] = useState(1);
  const [protectionPlan, setProtectionPlan] = useState("standard");
  const [addons, setAddons] = useState({ lockKit: true, blankets: false, boxKit: false });
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeLock, setAgreeLock] = useState(true);

  // Move-in date: dynamic (computed from "today") quick options, plus a real custom date picker
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const friday = useMemo(() => nextFriday(today), [today]);
  const minCustomDateISO = toISODate(tomorrow); // custom date must be strictly in the future
  const [customDate, setCustomDate] = useState(minCustomDateISO);

  const moveInOptions = useMemo(
    () => [
      { id: "today", label: `Hôm nay (${formatDateVN(today)})` },
      { id: "tomorrow", label: `Ngày mai (${formatDateVN(tomorrow)})` },
      { id: "fri", label: formatDateVN(friday) },
      { id: "custom", label: "Chọn ngày khác" },
    ],
    [today, tomorrow, friday]
  );

  const resolvedStartDate = useMemo(() => {
    if (moveInOption === "tomorrow") return tomorrow;
    if (moveInOption === "fri") return friday;
    if (moveInOption === "custom") {
      const parsed = customDate ? new Date(`${customDate}T00:00:00`) : null;
      return parsed && !Number.isNaN(parsed.getTime()) ? parsed : tomorrow;
    }
    return today;
  }, [moveInOption, today, tomorrow, friday, customDate]);

  const isCustomDateInvalid = moveInOption === "custom" && (!customDate || customDate < minCustomDateISO);

  // Real pricing quote from the backend (baseMonthlyRate, rentAmount, securityDeposit, discountAmount, totalAmount...)
  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(true);
  const [pricingError, setPricingError] = useState("");

  useEffect(() => {
    if (!unit.facilityId || !unit.unitTypeId) {
      setPricingLoading(false);
      return;
    }
    let active = true;
    setPricingLoading(true);
    setPricingError("");
    pricingService
      .calculatePricing({ facilityId: unit.facilityId, unitTypeId: unit.unitTypeId, durationMonths })
      .then((data) => {
        if (active) setPricing(data);
      })
      .catch((err) => {
        if (active) setPricingError(err?.message || "Không thể tính giá thuê. Vui lòng thử lại.");
      })
      .finally(() => {
        if (active) setPricingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [unit.facilityId, unit.unitTypeId, durationMonths]);

  const protectionPrice = protectionPlans.find((p) => p.id === protectionPlan)?.price ?? 0;
  const addonsTotal = calculateAddonsTotal(addons);

  // Booking (reservation + checkout) submission state
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const toggleAddon = (key) => setAddons((prev) => ({ ...prev, [key]: !prev[key] }));
  const canSubmit = agreeTerms && agreeLock && !pricingLoading && !bookingLoading && !isCustomDateInvalid;

  const submitBooking = async () => {
    setBookingLoading(true);
    setBookingError("");
    try {
      const reservation = await reservationService.createReservation({
        facilityId: unit.facilityId,
        unitTypeId: unit.unitTypeId,
        storageUnitId: Number.isInteger(unit.id) ? unit.id : undefined,
        startDate: toISODate(resolvedStartDate),
        durationMonths,
      });
      const checkout = await paymentService.createCheckout({
        reservationId: reservation.reservationId,
        paymentMethod: "vietqr",
      });
      setBooking({ reservation, checkout });
      navigate("/billing", { state: { checkout, reservation } });
      return { reservation, checkout };
    } catch (err) {
      if (err?.status === 409) {
        setBookingError("Ô kho hoặc ngày bạn chọn vừa được người khác đặt trước. Vui lòng chọn ngày hoặc ô kho khác.");
      } else if (err?.status === 401) {
        setBookingError("Vui lòng đăng nhập để đặt chỗ.");
      } else {
        setBookingError(err?.message || "Đặt chỗ thất bại. Vui lòng thử lại.");
      }
      throw err;
    } finally {
      setBookingLoading(false);
    }
  };

  return {
    unit,
    moveInOptions,
    timeSlots,
    protectionPlans,
    moveInOption,
    setMoveInOption,
    customDate,
    setCustomDate,
    minCustomDateISO,
    isCustomDateInvalid,
    resolvedStartDate,
    timeSlot,
    setTimeSlot,
    durationMonths,
    setDurationMonths,
    protectionPlan,
    setProtectionPlan,
    addons,
    toggleAddon,
    agreeTerms,
    setAgreeTerms,
    agreeLock,
    setAgreeLock,
    protectionPrice,
    addonsTotal,
    canSubmit,
    pricing,
    pricingLoading,
    pricingError,
    booking,
    bookingLoading,
    bookingError,
    submitBooking,
  };
}
