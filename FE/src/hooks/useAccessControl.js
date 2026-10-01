import { useEffect, useMemo, useState } from "react";
import {
  getWallets,
  getGuestPins,
  getAccessControlLogs,
} from "../data/accessControlRepository";
import rentalService from "../api/rentalService";

// Application layer: encapsulates AccessControl (PIN & smart lock) page state and data wiring.
export function useAccessControl() {
  const wallets = getWallets();

  const [showPin, setShowPin] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [alerts, setAlerts] = useState({ doorOpen: true, wrongPin: true, afterHours: true });

  // Real rentals
  const [rentals, setRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [selectedRentalId, setSelectedRentalId] = useState(null);

  // Real access credentials (mã PIN / QR) cho hợp đồng thuê kho đang chọn
  const [credentials, setCredentials] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [credentialsError, setCredentialsError] = useState("");
  const [pinChanging, setPinChanging] = useState(false);
  const [pinChangeError, setPinChangeError] = useState("");

  useEffect(() => {
    let active = true;
    setRentalsLoading(true);
    rentalService
      .getMyRentals()
      .then((data) => {
        if (!active) return;
        const list = Array.isArray(data) ? data : [];
        setRentals(list);
        const activeList = list.filter((r) => (r.status || "").toLowerCase() !== "ended");
        const defaultAgreementId = activeList[0]?.agreementId || list[0]?.agreementId || null;
        setSelectedRentalId(defaultAgreementId);
      })
      .catch((err) => {
        if (active) {
          console.warn("Lỗi tải danh sách thuê:", err);
          setRentals([]);
        }
      })
      .finally(() => {
        if (active) setRentalsLoading(false);
      });

    return () => {
      active = false;
    };
  }, []);

  const activeRentals = useMemo(
    () => rentals.filter((r) => (r.status || "").toLowerCase() !== "ended"),
    [rentals]
  );

  const selectedRental = useMemo(
    () => rentals.find((r) => r.agreementId === selectedRentalId) || activeRentals[0] || null,
    [rentals, activeRentals, selectedRentalId]
  );

  const currentUnitCode = selectedRental?.unitCode || "";
  const guestPins = useMemo(() => getGuestPins(currentUnitCode), [currentUnitCode]);
  const accessLogs = useMemo(() => getAccessControlLogs(currentUnitCode), [currentUnitCode]);

  useEffect(() => {
    let active = true;
    if (!selectedRentalId) {
      setCredentials(null);
      setCredentialsLoading(false);
      return;
    }

    setCredentialsLoading(true);
    setCredentialsError("");
    rentalService
      .getAccessCredentials(selectedRentalId)
      .then((data) => {
        if (active && data) setCredentials(data);
      })
      .catch((err) => {
        if (active) setCredentialsError(err?.message || "Không thể tải mã truy cập cho kho này.");
      })
      .finally(() => {
        if (active) setCredentialsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedRentalId]);

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => setUnlocking(false), 1200);
  };

  const handleChangePin = async (newPin, currentPin) => {
    if (!selectedRentalId) return;
    setPinChanging(true);
    setPinChangeError("");
    try {
      const res = await rentalService.changePin(selectedRentalId, { currentPin, newPin });
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
    rentals,
    rentalsLoading,
    activeRentals,
    selectedRental,
    selectedRentalId,
    setSelectedRentalId,
    currentUnitCode,
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
