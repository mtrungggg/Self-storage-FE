import { useEffect, useState, useRef, useMemo } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import paymentApi from "../services/api/paymentApi";
import reservationApi from "../services/api/reservationApi";
import rentalService from "../api/rentalService";
import { useSignalR } from "../context/SignalRContext";
import { CHECKOUT_STATUS, PAYMENT_STATUS } from "../constants/paymentConstants";
import { RESERVATION_STATUS } from "../constants/rentalConstants";

export function usePaymentCheckout() {
  const location = useLocation();
  const navigate = useNavigate();
  const { subscribe } = useSignalR();

  const stateCheckout = location.state?.checkout || null;
  const stateReservation = location.state?.reservation || null;
  const stateReservationId = location.state?.reservationId || stateCheckout?.reservationId || null;
  const stateInvoiceId = location.state?.invoiceId || stateCheckout?.invoiceId || null;
  const stateRenewalId = location.state?.renewalId || null;
  const stateTransferRequestId = location.state?.transferRequestId || null;

  const [checkout, setCheckout] = useState(stateCheckout?.vietQr?.qrImageUrl ? stateCheckout : null);
  const [reservation, setReservation] = useState(stateReservation);
  const [loading, setLoading] = useState(!stateCheckout?.vietQr?.qrImageUrl);
  const [error, setError] = useState("");
  const [status, setStatus] = useState(CHECKOUT_STATUS.PENDING);
  const [partialInfo, setPartialInfo] = useState(null);
  const [checkInQrToken, setCheckInQrToken] = useState(null);

  const [cancelModalOpen, setCancelModalOpen] = useState(false);
  const [cancelling, setCancelling] = useState(false);
  const [cancelError, setCancelError] = useState("");

  const initialSeconds = useMemo(() => {
    if (reservation?.holdUntil) {
      const diff = Math.floor((new Date(reservation.holdUntil).getTime() - Date.now()) / 1000);
      if (diff > 0) return diff;
    }
    return checkout?.expiresInSeconds || 15 * 60;
  }, [reservation, checkout]);

  const [timeLeft, setTimeLeft] = useState(initialSeconds);
  const totalSecondsRef = useRef(initialSeconds > 0 ? initialSeconds : 900);

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
        if (stateReservationId || (!stateInvoiceId && !stateRenewalId)) {
          let targetReservation = reservation;
          if (stateReservationId) {
            try {
              targetReservation = await reservationApi.getReservationDetail(stateReservationId);
              if (active && targetReservation) setReservation(targetReservation);
            } catch {
              // ignore and fallback
            }
          }

          if (!targetReservation) {
            const myReservations = await reservationApi.getMyReservations({ status: "pending" });
            targetReservation = Array.isArray(myReservations) ? myReservations[0] : null;
            if (active && targetReservation) setReservation(targetReservation);
          }

          const resId = targetReservation?.reservationId || targetReservation?.id || stateReservationId;
          if (resId) {
            const newCheckout = await paymentApi.createCheckout({
              reservationId: Number(resId),
              paymentMethod: "bank_transfer",
            });
            if (active && newCheckout) {
              setCheckout(newCheckout);
              const remaining = targetReservation?.holdUntil
                ? Math.max(0, Math.floor((new Date(targetReservation.holdUntil).getTime() - Date.now()) / 1000))
                : newCheckout.expiresInSeconds || 900;
              setTimeLeft(remaining > 0 ? remaining : 900);
              totalSecondsRef.current = remaining > 0 ? remaining : 900;
            }
            return;
          }
        }

        if (stateRenewalId) {
          const renewalCheckout = await paymentApi.createCheckout({
            renewalId: Number(stateRenewalId),
            paymentMethod: "bank_transfer",
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

        if (stateInvoiceId) {
          const invoiceCheckout = await paymentApi.createCheckout({
            invoiceId: Number(stateInvoiceId),
            paymentMethod: "bank_transfer",
          });
          if (active) {
            setCheckout(invoiceCheckout);
            setReservation(null);
            setTimeLeft(invoiceCheckout?.expiresInSeconds || 900);
            totalSecondsRef.current = invoiceCheckout?.expiresInSeconds || 900;
          }
          return;
        }

        if (active) setError("Không có khoản thanh toán nào đang chờ xử lý.");
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

  // Real-time SignalR listeners for instant SePay confirmation or partial transfer notice
  useEffect(() => {
    if (status !== CHECKOUT_STATUS.PENDING) return;

    const targetPaymentId = checkout?.paymentId;
    const targetResId = reservation?.reservationId || reservation?.id || checkout?.reservationId;

    const unsubSucceeded = subscribe("PaymentSucceeded", (payload) => {
      if (
        (!targetPaymentId || payload?.paymentId === targetPaymentId) &&
        (!targetResId || !payload?.reservationId || payload?.reservationId === targetResId)
      ) {
        if (payload?.checkInQrToken) setCheckInQrToken(payload.checkInQrToken);
        setStatus(CHECKOUT_STATUS.SUCCESS);
      }
    });

    const unsubConfirmed = subscribe("ReservationConfirmed", (payload) => {
      if (targetResId && payload?.reservationId === targetResId) {
        if (payload?.checkInQrToken) setCheckInQrToken(payload.checkInQrToken);
        setStatus(CHECKOUT_STATUS.SUCCESS);
      }
    });

    const unsubPartial = subscribe("PaymentPartialReceived", (payload) => {
      if (
        (targetResId && payload?.reservationId === targetResId) ||
        (checkout?.invoiceId && payload?.invoiceId === checkout.invoiceId)
      ) {
        setPartialInfo({
          paidAmount: payload.paidAmount,
          totalAmount: payload.totalAmount,
          remainingAmount: payload.remainingAmount,
        });
      }
    });

    return () => {
      unsubSucceeded();
      unsubConfirmed();
      unsubPartial();
    };
  }, [subscribe, status, checkout?.paymentId, checkout?.invoiceId, checkout?.reservationId, reservation]);

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

  // Fallback polling using GET /api/v1/payments/{paymentId}/status
  useEffect(() => {
    if (status !== CHECKOUT_STATUS.PENDING) return;

    let isCancelled = false;
    let pollTimer = null;

    const checkPaymentSuccess = async () => {
      try {
        if (checkout?.paymentId > 0) {
          const st = await paymentApi.getPaymentStatus(checkout.paymentId);
          if (!isCancelled && st) {
            const pStatus = String(st.paymentStatus || "").toLowerCase();
            const rStatus = String(st.reservationStatus || "").toLowerCase();
            if (pStatus === PAYMENT_STATUS.SUCCEEDED || rStatus === RESERVATION_STATUS.CONFIRMED) {
              if (st.checkInQrToken) setCheckInQrToken(st.checkInQrToken);
              setStatus(CHECKOUT_STATUS.SUCCESS);
              return;
            }
            if (st.paidAmount > 0 && st.paidAmount < st.totalAmount) {
              setPartialInfo({
                paidAmount: st.paidAmount,
                totalAmount: st.totalAmount,
                remainingAmount: Math.max(0, st.totalAmount - st.paidAmount),
              });
            }
            if (rStatus === RESERVATION_STATUS.EXPIRED) {
              setStatus(CHECKOUT_STATUS.EXPIRED);
              return;
            }
            if (rStatus === RESERVATION_STATUS.CANCELLED || pStatus === PAYMENT_STATUS.CANCELLED || pStatus === PAYMENT_STATUS.FAILED) {
              setStatus(CHECKOUT_STATUS.FAILED);
              return;
            }
          }
        } else {
          const history = await paymentApi.getPaymentHistory();
          if (!isCancelled && Array.isArray(history)) {
            const matched = history.find(
              (p) =>
                (checkout?.invoiceNo && p.invoiceNo === checkout.invoiceNo) ||
                (checkout?.invoiceId && p.invoiceId === checkout.invoiceId) ||
                (reservation?.reservationCode && p.reservationCode === reservation.reservationCode)
            );
            if (matched) {
              const pStatus = String(matched.status || "").toLowerCase();
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
        }
      } catch {
        // Ignore transient poll network error
      }

      if (!isCancelled) {
        pollTimer = setTimeout(checkPaymentSuccess, 3000);
      }
    };

    pollTimer = setTimeout(checkPaymentSuccess, 3000);

    return () => {
      isCancelled = true;
      if (pollTimer) clearTimeout(pollTimer);
    };
  }, [status, checkout, reservation]);

  const handleOpenCancelModal = () => {
    setCancelError("");
    setCancelModalOpen(true);
  };

  const handleCloseCancelModal = () => {
    if (cancelling) return;
    setCancelModalOpen(false);
    setCancelError("");
  };

  const handleConfirmCancel = async () => {
    const resId = reservation?.reservationId || reservation?.id || checkout?.reservationId || stateReservationId;
    const rnwId = stateRenewalId || checkout?.renewalId;
    const invId = stateInvoiceId || checkout?.invoiceId;
    const trfId = stateTransferRequestId || checkout?.transferRequestId;

    if (!resId && !rnwId && !invId && !trfId) {
      setCancelModalOpen(false);
      navigate("/billing");
      return;
    }

    setCancelling(true);
    setCancelError("");
    try {
      if (resId) {
        await reservationApi.cancelReservation(resId, "Khách hàng tự hủy giao dịch");
      } else if (invId) {
        await rentalService.cancelInvoice(invId);
      } else if (rnwId) {
        await rentalService.cancelRenewal(rnwId);
      } else if (trfId) {
        await rentalService.cancelTransferRequest(trfId);
      }
      setCancelModalOpen(false);
      setStatus(CHECKOUT_STATUS.FAILED);
    } catch (err) {
      setCancelError(err?.message || "Hủy giao dịch thất bại. Vui lòng thử lại.");
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
    partialInfo,
    checkInQrToken,
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
