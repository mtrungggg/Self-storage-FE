import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import pricingService from "../api/pricingService";
import reservationService from "../api/reservationService";
import paymentService from "../api/paymentService";

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

  // Selected unit details or fallback default matching BE seed data
  const unit = useMemo(() => {
    if (unitFromState) return unitFromState;
    return {
      id: 2,
      facilityId: 1,
      unitTypeId: 1,
      unitCode: "A-102",
      facilityName: "Thu Duc Self Storage",
      address: "01 Võ Văn Ngân, TP. Thủ Đức, TP. Hồ Chí Minh",
      floor: "Tầng 1 • Khu A",
      dimension: "1.5m x 2.0m",
      sizeLabel: "1.5m x 2.0m",
      volume: "8.4 m³",
      height: "2.8m",
      areaM2: 3.0,
      typeName: "Kho Tiêu Chuẩn 3 m²",
      fitNote: "Phù hợp chứa 20-30 thùng carton, đồ gia dụng nhỏ, xe máy, tài liệu.",
      rentPrice: 2000,
      depositPrice: 2000,
      policies: [
        "Hủy miễn phí trước 24h",
        "Khóa điện tử bảo mật 24/7",
        "Tiền cọc hoàn trả 100% khi thanh lý hợp đồng",
        "Cam kết không phát sinh phụ phí",
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

  // Move-in date calculation
  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const friday = useMemo(() => nextFriday(today), [today]);
  const minCustomDateISO = toISODate(today);
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
      return parsed && !Number.isNaN(parsed.getTime()) ? parsed : today;
    }
    return today;
  }, [moveInOption, today, tomorrow, friday, customDate]);

  const isCustomDateInvalid = moveInOption === "custom" && (!customDate || customDate < minCustomDateISO);

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
    moveInOption,
    setMoveInOption,
    customDate,
    setCustomDate,
    minCustomDateISO,
    isCustomDateInvalid,
    resolvedStartDate,
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
