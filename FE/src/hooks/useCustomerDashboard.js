import { useEffect, useMemo, useState } from "react";
import {
  getDashboardAccessLogs,
  getDashboardQuickActions,
  getClimateChartData,
} from "../data/dashboardRepository";
import { buildChartPath } from "../domain/usecases/buildChartPath";
import rentalService from "../api/rentalService";

// Application layer: encapsulates CustomerDashboard ("Kho của tôi") page state and data wiring.
export function useCustomerDashboard() {
  const { temperature, humidity } = getClimateChartData();
  const quickActions = getDashboardQuickActions();

  const [showPin, setShowPin] = useState(false);
  const [mainLocked, setMainLocked] = useState(true);
  const [garageLocked, setGarageLocked] = useState(true);
  const [copyFeedback, setCopyFeedback] = useState(false);
  const [gateFeedback, setGateFeedback] = useState("");

  // Real hợp đồng thuê kho của khách hàng (backend: GET /customer/rentals)
  const [rentals, setRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [rentalsError, setRentalsError] = useState("");

  // Real access credentials (PIN & Gate QR) cho kho chính
  const [credentials, setCredentials] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(false);

  useEffect(() => {
    let active = true;
    setRentalsLoading(true);
    setRentalsError("");
    rentalService
      .getMyRentals()
      .then((data) => {
        if (active) setRentals(Array.isArray(data) ? data : []);
      })
      .catch((err) => {
        if (active) setRentalsError(err?.message || "Không thể tải danh sách kho đang thuê.");
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
  const primaryRental = activeRentals[0] || null;
  const secondaryRental = activeRentals[1] || null;

  // Lấy mã PIN thật từ API cho hợp đồng chính
  useEffect(() => {
    let active = true;
    if (primaryRental?.agreementId) {
      setCredentialsLoading(true);
      rentalService
        .getAccessCredentials(primaryRental.agreementId)
        .then((data) => {
          if (active) setCredentials(data);
        })
        .catch((err) => {
          console.warn("Lỗi khi tải mã PIN truy cập:", err);
        })
        .finally(() => {
          if (active) setCredentialsLoading(false);
        });
    } else {
      setCredentials(null);
    }
    return () => {
      active = false;
    };
  }, [primaryRental?.agreementId]);

  const accessLogs = useMemo(
    () => getDashboardAccessLogs(primaryRental),
    [primaryRental]
  );

  const tempPath = useMemo(() => buildChartPath(temperature, 20.5, 22, 320, 90), [temperature]);
  const humidityPath = useMemo(() => buildChartPath(humidity, 40, 55, 320, 90), [humidity]);

  const [lockedUnits, setLockedUnits] = useState({});

  const toggleUnitLock = (unitCode) => {
    setLockedUnits((prev) => ({
      ...prev,
      [unitCode]: prev[unitCode] === false ? true : false,
    }));
  };

  const isUnitLocked = (unitCode) => {
    return lockedUnits[unitCode] !== false;
  };

  const copyPinToClipboard = () => {
    const pin = credentials?.keypadPin;
    if (!pin) return;
    if (navigator?.clipboard) {
      navigator.clipboard.writeText(pin);
      setCopyFeedback(true);
      setTimeout(() => setCopyFeedback(false), 2000);
    }
  };

  const handleOpenGate = () => {
    setGateFeedback("Đã mở cổng tự động thành công!");
    setTimeout(() => setGateFeedback(""), 3500);
  };

  return {
    accessLogs,
    quickActions,
    showPin,
    setShowPin,
    mainLocked,
    setMainLocked,
    garageLocked,
    setGarageLocked,
    lockedUnits,
    toggleUnitLock,
    isUnitLocked,
    tempPath,
    humidityPath,
    rentals,
    activeRentals,
    primaryRental,
    secondaryRental,
    credentials,
    credentialsLoading,
    rentalsLoading,
    rentalsError,
    copyFeedback,
    copyPinToClipboard,
    gateFeedback,
    handleOpenGate,
  };
}
