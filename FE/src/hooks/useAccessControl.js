import { useEffect, useState } from "react";
import {
  getWallets,
  getGuestPins,
  getAccessControlLogs,
} from "../data/accessControlRepository";
import rentalService from "../api/rentalService";

// Application layer: encapsulates AccessControl (PIN & smart lock) page state and data wiring.
export function useAccessControl() {
  const wallets = getWallets();
  const guestPins = getGuestPins();
  const accessLogs = getAccessControlLogs();

  const [activeUnit, setActiveUnit] = useState("main");
  const [showPin, setShowPin] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [alerts, setAlerts] = useState({ doorOpen: true, wrongPin: true, afterHours: true });

  // Real access credentials (mã PIN / QR) cho hợp đồng thuê kho đang hoạt động
  const [agreementId, setAgreementId] = useState(null);
  const [credentials, setCredentials] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [credentialsError, setCredentialsError] = useState("");
  const [pinChanging, setPinChanging] = useState(false);
  const [pinChangeError, setPinChangeError] = useState("");

  useEffect(() => {
    let active = true;
    setCredentialsLoading(true);
    setCredentialsError("");
    rentalService
      .getMyRentals()
      .then((rentals) => {
        const primary = rentals.find((r) => (r.status || "").toLowerCase() !== "ended") || rentals[0];
        if (!primary) {
          if (active) setCredentialsError("Bạn chưa có hợp đồng thuê kho nào đang hoạt động.");
          return null;
        }
        if (active) setAgreementId(primary.agreementId);
        return rentalService.getAccessCredentials(primary.agreementId);
      })
      .then((data) => {
        if (active && data) setCredentials(data);
      })
      .catch((err) => {
        if (active) setCredentialsError(err?.message || "Không thể tải mã truy cập.");
      })
      .finally(() => {
        if (active) setCredentialsLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => setUnlocking(false), 1200);
  };

  const handleChangePin = async (newPin, currentPin) => {
    if (!agreementId) return;
    setPinChanging(true);
    setPinChangeError("");
    try {
      const res = await rentalService.changePin(agreementId, { currentPin, newPin });
      setCredentials((prev) => (prev ? { ...prev, keypadPin: newPin } : prev));
      return res;
    } catch (err) {
      setPinChangeError(err?.message || "Đổi mã PIN thất bại. Vui lòng thử lại.");
      throw err;
    } finally {
      setPinChanging(false);
    }
  };

  const toggleAlert = (key) => setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));

  return {
    wallets,
    guestPins,
    accessLogs,
    activeUnit,
    setActiveUnit,
    showPin,
    setShowPin,
    unlocking,
    handleUnlock,
    alerts,
    toggleAlert,
    credentials,
    credentialsLoading,
    credentialsError,
    pinChanging,
    pinChangeError,
    handleChangePin,
  };
}
