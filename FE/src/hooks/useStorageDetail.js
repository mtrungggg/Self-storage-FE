import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import pricingService from "../api/pricingService";
import reservationService from "../api/reservationService";
import paymentService from "../api/paymentService";

const WEEKDAYS_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

function toISODate(date) {
  const offset = date.getTimezoneOffset();
  return new Date(date.getTime() - offset * 60000).toISOString().slice(0, 10);
}

function formatDateCompact(date) {
  const dayStr = String(date.getDate()).padStart(2, "0");
  const monthStr = String(date.getMonth() + 1).padStart(2, "0");
  return `${WEEKDAYS_SHORT[date.getDay()]}, ${monthStr}/${dayStr}/${date.getFullYear()}`;
}

function addDays(date, days) {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

function nextFriday(base) {
  const day = base.getDay();
  let diff = (5 - day + 7) % 7 || 7;
  if (diff <= 1) diff += 7;
  return addDays(base, diff);
}

// Application layer: encapsulates StorageDetail (booking) page state, pricing and data wiring.
export function useStorageDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const unitFromState = location.state?.unit;

  // Selected unit details or fallback default matching BE seed data
  const unit = useMemo(() => {
    if (unitFromState) return unitFromState;
    return {
      id: 2,
      facilityId: 1,
      unitTypeId: 1,
      unitCode: "A-102",
      facilityName: "Thu Duc Self Storage",
      address: "01 Vo Van Ngan, Thu Duc City, HCMC",
      floor: "Floor 1 • Zone A",
      dimension: "1.5m x 2.0m",
      sizeLabel: "1.5m x 2.0m",
      volume: "8.4 m³",
      height: "2.8m",
      areaM2: 3.0,
      typeName: "Standard Unit 3 m²",
      fitNote: "Fits 20-30 boxes, small appliances, motorcycle, files.",
      rentPrice: 2000,
      depositPrice: 2000,
      policies: [
        "Free cancellation within 24h",
        "Keyless 24/7 digital access",
        "100% refundable security deposit",
        "No hidden fees guarantee",
      ],
      image: "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&w=800&q=80",
    };
  }, [unitFromState]);

  const [moveInOption, setMoveInOption] = useState("today");
  const [durationMonths, setDurationMonths] = useState(1);
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeLock, setAgreeLock] = useState(true);

  // 15-minute hold countdown (starts when page mounts)
  const [holdCountdown, setHoldCountdown] = useState(15 * 60);
  useEffect(() => {
    if (holdCountdown <= 0) return;
    const id = setInterval(() => setHoldCountdown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [holdCountdown]);

  // Move-in date calculation
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const friday = useMemo(() => nextFriday(today), [today]);
  const minCustomDateISO = toISODate(today);
  const [customDate, setCustomDate] = useState(minCustomDateISO);

  const moveInOptions = useMemo(
    () => [
      { id: "today", label: `Today (${formatDateCompact(today)})` },
      { id: "tomorrow", label: `Tomorrow (${formatDateCompact(tomorrow)})` },
      { id: "fri", label: formatDateCompact(friday) },
      { id: "custom", label: "Custom Date" },
    ],
    [today, tomorrow, friday]
  );

  const resolvedStartDate = useMemo(() => {
    if (moveInOption === "tomorrow") return tomorrow;
    if (moveInOption === "fri") return friday;
    if (moveInOption === "custom") {
      const parsed = customDate ? new Date(`${customDate}T00:00:00`) : null;
      return parsed && !Number.isNaN(parsed.getTime()) ? parsed : today;
    }
    return today;
  }, [moveInOption, today, tomorrow, friday, customDate]);

  const isCustomDateInvalid = moveInOption === "custom" && (!customDate || customDate < minCustomDateISO);

  // Derived display values
  const holdCountdownStr = `${String(Math.floor(holdCountdown / 60)).padStart(2, "0")}:${String(holdCountdown % 60).padStart(2, "0")}`;
  const resolvedStartDateLabel = formatDateCompact(resolvedStartDate);

  // Real pricing quote from the backend
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
      .calculatePricing({
        facilityId: unit.facilityId,
        unitTypeId: unit.unitTypeId,
        durationMonths,
        voucherCode: appliedVoucher.trim() || undefined,
      })
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
  }, [unit.facilityId, unit.unitTypeId, durationMonths, appliedVoucher]);

  const handleApplyVoucher = () => {
    setAppliedVoucher(voucherInput.trim());
  };

  const handleClearVoucher = () => {
    setVoucherInput("");
    setAppliedVoucher("");
  };

  // Booking submission state
  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

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
        promotionCode: appliedVoucher.trim() || undefined,
      });
      const checkout = await paymentService.createCheckout({
        reservationId: reservation.reservationId,
        paymentMethod: "vietqr",
      });
      setBooking({ reservation, checkout });
      navigate("/checkout", { state: { checkout, reservation } });
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
    moveInOption,
    setMoveInOption,
    customDate,
    setCustomDate,
    minCustomDateISO,
    isCustomDateInvalid,
    resolvedStartDate,
    resolvedStartDateLabel,
    holdCountdownStr,
    durationMonths,
    setDurationMonths,
    voucherInput,
    setVoucherInput,
    appliedVoucher,
    handleApplyVoucher,
    handleClearVoucher,
    agreeTerms,
    setAgreeTerms,
    agreeLock,
    setAgreeLock,
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
