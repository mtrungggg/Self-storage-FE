import { useEffect, useMemo, useState } from "react";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";
import catalogApi from "../services/api/catalogApi";
import reservationApi from "../services/api/reservationApi";
import paymentApi from "../services/api/paymentApi";
import { DEFAULT_STORAGE_UNIT_IMAGE } from "../constants/assets";
import BUSINESS_CONFIG from "../config/businessConfig";
import { useLanguage } from "../context/LanguageContext";

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

export function useStorageDetail() {
  const location = useLocation();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { t, lang } = useLanguage();
  const isVi = lang === "vi";
  const unitFromState = location.state?.unit || null;

  const [unit, setUnit] = useState(unitFromState);
  const [unitLoading, setUnitLoading] = useState(!unitFromState);
  const [unitError, setUnitError] = useState("");

  useEffect(() => {
    if (unitFromState) {
      setUnit(unitFromState);
      setUnitLoading(false);
      return;
    }

    const qFacilityId = Number(searchParams.get("facilityId"));
    const qUnitId = Number(searchParams.get("unitId"));

    let active = true;
    setUnitLoading(true);
    setUnitError("");

    async function hydrateUnit() {
      try {
        const [facilities, unitTypes] = await Promise.all([
          catalogApi.getFacilities(),
          catalogApi.getUnitTypes(),
        ]);

        const targetFacility = qFacilityId
          ? facilities.find((f) => f.id === qFacilityId) || facilities[0]
          : facilities[0];

        if (!targetFacility) {
          if (active) setUnitError("No active storage facilities found.");
          return;
        }

        const available = await catalogApi.getAvailableUnits(targetFacility.id);
        const picked = qUnitId
          ? available.find((u) => u.id === qUnitId) || available[0]
          : available[0];

        if (!picked) {
          if (active) setUnitError("No available units found at this facility.");
          return;
        }

        const unitType = unitTypes.find((ut) => ut.id === picked.unitTypeId);
        if (active) {
          setUnit({
            id: picked.id,
            facilityId: picked.facilityId,
            unitTypeId: picked.unitTypeId,
            unitCode: picked.unitCode,
            facilityName: targetFacility.name,
            address: targetFacility.address,
            floor: [picked.floorLabel && `Floor ${picked.floorLabel}`, picked.zoneLabel && `Zone ${picked.zoneLabel}`]
              .filter(Boolean)
              .join(" • "),
            dimension: unitType ? `${unitType.widthM}m × ${unitType.lengthM}m` : "",
            sizeLabel: unitType ? `${unitType.widthM}m × ${unitType.lengthM}m` : "",
            volume: unitType?.volumeM3 ? `${unitType.volumeM3} m³` : "",
            height: unitType?.heightM ? `${unitType.heightM}m` : "",
            areaM2: unitType?.areaM2 ?? null,
            typeName: unitType?.name || `Type #${picked.unitTypeId}`,
            fitNote: unitType?.description || "",
            rentPrice: picked.monthlyRate,
            image: DEFAULT_STORAGE_UNIT_IMAGE,
          });
        }
      } catch (err) {
        if (active) setUnitError(err?.message || "Unable to load selected storage unit.");
      } finally {
        if (active) setUnitLoading(false);
      }
    }

    hydrateUnit();
    return () => {
      active = false;
    };
  }, [unitFromState, searchParams]);

  const [moveInOption, setMoveInOption] = useState("today");
  const [durationMonths, setDurationMonths] = useState(1);
  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [agreeTerms, setAgreeTerms] = useState(true);
  const [agreeLock, setAgreeLock] = useState(true);

  const [holdCountdown, setHoldCountdown] = useState(BUSINESS_CONFIG.RESERVATION.HOLD_TIMEOUT_SECONDS);
  useEffect(() => {
    if (holdCountdown <= 0) return;
    const id = setInterval(() => setHoldCountdown((s) => Math.max(0, s - 1)), 1000);
    return () => clearInterval(id);
  }, [holdCountdown]);

  const today = useMemo(() => new Date(new Date().setHours(0, 0, 0, 0)), []);
  const tomorrow = useMemo(() => addDays(today, 1), [today]);
  const friday = useMemo(() => nextFriday(today), [today]);
  const minCustomDateISO = toISODate(today);
  const [customDate, setCustomDate] = useState(minCustomDateISO);

  const moveInOptions = useMemo(
    () => [
      { id: "today", label: `Today (${formatDateCompact(today)})` },
      { id: "tomorrow", label: `Tomorrow (${formatDateCompact(tomorrow)})` },
      { id: "fri", label: formatDateCompact(friday, isVi) },
      { id: "custom", label: t("booking.custom_date", "Custom Date") },
    ],
    [today, tomorrow, friday, t, isVi]
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
  const holdCountdownStr = `${String(Math.floor(holdCountdown / 60)).padStart(2, "0")}:${String(holdCountdown % 60).padStart(2, "0")}`;
  const resolvedStartDateLabel = formatDateCompact(resolvedStartDate, isVi);

  const [pricing, setPricing] = useState(null);
  const [pricingLoading, setPricingLoading] = useState(false);
  const [pricingError, setPricingError] = useState("");

  useEffect(() => {
    if (!unit?.facilityId || !unit?.unitTypeId || isCustomDateInvalid) {
      setPricingLoading(false);
      return;
    }
    let active = true;
    setPricingLoading(true);
    setPricingError("");
    catalogApi
      .getPricingQuote({
        facilityId: unit.facilityId,
        unitTypeId: unit.unitTypeId,
        startDate: toISODate(resolvedStartDate),
        durationMonths,
        promotionCode: appliedVoucher.trim() || undefined,
      })
      .then((data) => {
        if (active) setPricing(data);
      })
      .catch((err) => {
        if (active) {
          setPricingError(err?.message || "Unable to calculate pricing quote.");
          if (appliedVoucher) setPricing(null);
        }
      })
      .finally(() => {
        if (active) setPricingLoading(false);
      });
    return () => {
      active = false;
    };
  }, [unit?.facilityId, unit?.unitTypeId, durationMonths, appliedVoucher, resolvedStartDate, isCustomDateInvalid]);

  const handleApplyVoucher = () => {
    setAppliedVoucher(voucherInput.trim());
  };

  const handleClearVoucher = () => {
    setVoucherInput("");
    setAppliedVoucher("");
  };

  const [booking, setBooking] = useState(null);
  const [bookingLoading, setBookingLoading] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const canSubmit = Boolean(unit) && agreeTerms && agreeLock && !pricingLoading && !bookingLoading && !isCustomDateInvalid && !pricingError;

  const submitBooking = async () => {
    if (!unit) return null;
    setBookingLoading(true);
    setBookingError("");
    const idempotencyKey = typeof crypto !== "undefined" && crypto.randomUUID ? crypto.randomUUID() : `rsv-${Date.now()}`;
    try {
      const reservation = await reservationApi.createReservation({
        facilityId: unit.facilityId,
        unitTypeId: unit.unitTypeId,
        storageUnitId: Number.isInteger(unit.id) ? unit.id : undefined,
        startDate: toISODate(resolvedStartDate),
        durationMonths,
        promotionCode: appliedVoucher.trim() || undefined,
        idempotencyKey,
      });
      const checkout = await paymentApi.createCheckout({
        reservationId: reservation.reservationId,
        paymentMethod: "bank_transfer",
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
    unitLoading,
    unitError,
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
