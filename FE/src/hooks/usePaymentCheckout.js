import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentService from "../api/paymentService";
import reservationService from "../api/reservationService";
import { CHECKOUT_STATUS, PAYMENT_STATUS } from "../constants/paymentConstants";
import { RESERVATION_STATUS } from "../constants/rentalConstants";

export function usePaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();

  const stateCheckout = location.state?.checkout || null;
  const stateReservation = location.state?.reservation || null;
  const stateReservationId = location.state?.reservationId || stateCheckout?.reservationId || null;
  const stateInvoiceId = location.state?.invoiceId || stateCheckout?.invoiceId || null;
  const stateRenewalId = location.state?.renewalId || null;

  const [checkout, setCheckout] = useState(
    stateCheckout?.vietQr?.qrImageUrl ? stateCheckout : null
  );
  const [reservation, setReservation] = useState(stateReservation);
  const [loading, setLoading] = useState(
    !stateCheckout?.vietQr?.qrImageUrl
  );
  const [error, setError] = useState("");

  // Status: pending | success | expired | failed
  const [status, setStatus] = useState(CHECKOUT_STATUS.PENDING);

  // Custom modal for confirming cancellation
  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  // Calculate initial countdown seconds
  const initialSeconds = useMemo(() => {
    if (reservation?.holdUntil) {
      const diff = Math.floor((new Date(reservation.holdUntil).getTime() - Date.now()) / 1000);
      if (diff > 0) return diff;
    }
    return checkout?.expiresInSeconds || 15 * 60; // 15 minutes default
  }, [reservation, checkout]);

  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const totalSecondsRef = useRef(initialSeconds > 0 ? initialSeconds : 900);

  // If no checkout with full QR is in state, fetch reservation & create checkout
  useEffect(() => {
    if (checkout?.vietQr?.qrImageUrl) {
      setLoading(false);
      return;
    }

    let active = true;
    setLoading(true);
    setError("");

    const resolveCheckout = async () => {
      try {
        if (stateInvoiceId) {
          const invoiceCheckout = await paymentService.createCheckout({
            invoiceId: Number(stateInvoiceId),
            paymentMethod: "vietqr",
          });
          if (active) {
            setCheckout(invoiceCheckout);
            setReservation(null);
            setTimeLeft(invoiceCheckout?.expiresInSeconds || 900);
            totalSecondsRef.current = invoiceCheckout?.expiresInSeconds || 900;
          }
          return;
        }

        if (stateRenewalId) {
          const renewalCheckout = await paymentService.createCheckout({
            renewalId: Number(stateRenewalId),
            paymentMethod: "vietqr",
          });
          if (active) {
            setCheckout(renewalCheckout);
            setReservation({
              reservationCode: `RNW-${location.state?.agreementNo || stateRenewalId}`,
              quotedTotal: renewalCheckout?.amount || 0,
            });
            setTimeLeft(900);
            totalSecondsRef.current = 900;
          }
          return;
        }
        let targetReservation = reservation;

        // If we have an explicit reservationId passed from Billing or State
        if (stateReservationId) {
          try {
            targetReservation = await reservationService.getReservationDetail(stateReservationId);
            if (active && targetReservation) setReservation(targetReservation);
          } catch {
            // fallback to getMyReservations
          }
        }

        // If not found, look up user's pending reservation
        if (!targetReservation) {
          const myReservations = await reservationService.getMyReservations("pending");
          targetReservation = Array.isArray(myReservations) ? myReservations[0] : null;
          if (active && targetReservation) setReservation(targetReservation);
        }

        const resId = targetReservation?.reservationId || targetReservation?.id || stateReservationId;

        if (!resId) {
          if (active) setError("Không có đơn đặt chỗ nào đang chờ thanh toán.");
          return;
        }

        const newCheckout = await paymentService.createCheckout({
          reservationId: Number(resId),
          paymentMethod: "vietqr",
        });

        if (active && newCheckout) {
          setCheckout(newCheckout);
          const remaining = targetReservation?.holdUntil
            ? Math.max(0, Math.floor((new Date(targetReservation.holdUntil).getTime() - Date.now()) / 1000))
            : newCheckout.expiresInSeconds || 900;
          setTimeLeft(remaining > 0 ? remaining : 900);
          totalSecondsRef.current = remaining > 0 ? remaining : 900;
        }
      } catch (err) {
        if (active) setError(err?.message || "Không thể khởi tạo thông tin thanh toán VietQR.");
      } finally {
        if (active) setLoading(false);
      }
    };

    resolveCheckout();

    return () => {
      active = false;
    };
  }, [stateReservationId, stateInvoiceId, stateRenewalId, checkout?.vietQr?.qrImageUrl]);

  // 15-Minute Countdown Timer
  useEffect(() => {
    if (status !== CHECKOUT_STATUS.PENDING) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          setStatus(CHECKOUT_STATUS.EXPIRED);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [status]);

  // Polling for SePay payment confirmation (every 2.5s)
  useEffect(() => {
    if (status !== CHECKOUT_STATUS.PENDING) return;

    let isCancelled = false;
    let pollTimer = null;

    const checkPaymentSuccess = async () => {
      try {
        const resId = reservation?.reservationId || reservation?.id || checkout?.reservationId;
        if (resId) {
          const detail = await reservationService.getReservationDetail(resId);
          if (!isCancelled && detail) {
            const detailStatus = (detail.status || "").toLowerCase();
            if (detailStatus === RESERVATION_STATUS.CONFIRMED || detailStatus === "paid") {
              setStatus(CHECKOUT_STATUS.SUCCESS);
              return;
            }
            if (detailStatus === RESERVATION_STATUS.EXPIRED) {
              setStatus(CHECKOUT_STATUS.EXPIRED);
              return;
            }
            if (detailStatus === RESERVATION_STATUS.CANCELLED) {
              setStatus(CHECKOUT_STATUS.FAILED);
              return;
            }
          }
        }

        // Check payment history
        const history = await paymentService.getPaymentHistory();
        if (!isCancelled && Array.isArray(history)) {
          const matched = history.find(
            (p) =>
              (checkout?.invoiceNo && p.invoiceNo === checkout.invoiceNo) ||
              (checkout?.invoiceId && p.invoiceId === checkout.invoiceId) ||
              (reservation?.reservationCode && p.reservationCode === reservation.reservationCode)
          );
          if (matched) {
            const pStatus = (matched.status || "").toLowerCase();
            if (pStatus === PAYMENT_STATUS.SUCCEEDED || pStatus === "paid") {
              setStatus(CHECKOUT_STATUS.SUCCESS);
              return;
            }
            if (pStatus === PAYMENT_STATUS.FAILED || pStatus === PAYMENT_STATUS.CANCELLED) {
              setStatus(CHECKOUT_STATUS.FAILED);
              return;
            }
          }
        }
      } catch (err) {
        // Silently continue polling
      }

      if (!isCancelled) {
        pollTimer = setTimeout(checkPaymentSuccess, 2500);
      }
    };

    pollTimer = setTimeout(checkPaymentSuccess, 2500);

    return () => {
      isCancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [status, checkout, reservation]);

  // Open modal to confirm cancel
  const handleOpenCancelModal = () => {
    setCancelError("");
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (cancelling) return;
    setCancelModalOpen(false);
    setCancelError("");
  };

  // Perform cancel reservation
  const handleConfirmCancel = async () => {
    const resId = reservation?.reservationId || reservation?.id || checkout?.reservationId || stateReservationId;
    if (!resId) {
      setCancelModalOpen(false);
      navigate("/home");
      return;
    }

    setCancelling(true);
    setCancelError("");
    try {
      await reservationService.cancelReservation(resId, "Khách hàng tự hủy giao dịch");
      setCancelModalOpen(false);
      setStatus("failed");
    } catch (err) {
      setCancelError(err?.message || "Hủy đơn đặt chỗ thất bại. Vui lòng thử lại.");
    } finally {
      setCancelling(false);
    }
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  const formattedCountdown = `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  const progressPercent = Math.max(0, Math.min(100, (timeLeft / totalSecondsRef.current) * 100));

  return {
    checkout,
    reservation,
    loading,
    error,
    status,
    timeLeft,
    formattedCountdown,
    progressPercent,
    cancelModalOpen,
    cancelling,
    cancelError,
    handleOpenCancelModal,
    handleCloseCancelModal,
    handleConfirmCancel,
    navigate,
  };
}
