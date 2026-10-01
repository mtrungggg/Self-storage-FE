import { useState } from "react";
import { processReservationCheckout } from "../domain/usecases/processReservationCheckout";

export function useReservationCheckout() {
  const [reservation] = useState({
    unitId: "B-204",
    size: "Medium (15m²)",
    hubName: "Hub #04 - Quận 7",
    startDate: "2026-10-15",
    rentalMonths: 6,
    deposit: 1500000,
    monthlyRent: 3000000,
    totalAmount: 19500000,
    customerEmail: "nguyenvana@gmail.com"
  });

  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState("vnpay");
  const [isProcessing, setIsProcessing] = useState(false);
  const [checkoutResult, setCheckoutResult] = useState(null);
  const [errorMessage, setErrorMessage] = useState("");

  const handleCheckout = () => {
    setIsProcessing(true);
    setErrorMessage("");
    try {
      setTimeout(() => {
        const result = processReservationCheckout(reservation, selectedPaymentMethod);
        setCheckoutResult(result);
        setIsProcessing(false);
      }, 1200);
    } catch (error) {
      setErrorMessage(error.message);
      setIsProcessing(false);
    }
  };

  return {
    reservation,
    selectedPaymentMethod,
    setSelectedPaymentMethod,
    isProcessing,
    checkoutResult,
    errorMessage,
    handleCheckout
  };
}