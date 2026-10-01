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
  const accessLogs = getDashboardAccessLogs();
  const quickActions = getDashboardQuickActions();
  const { temperature, humidity } = getClimateChartData();

  const [showPin, setShowPin] = useState(false);
  const [mainLocked, setMainLocked] = useState(true);
  const [garageLocked, setGarageLocked] = useState(true);

  // Real hợp đồng thuê kho của khách hàng (backend: GET /customer/rentals)
  const [rentals, setRentals] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [rentalsError, setRentalsError] = useState("");

  useEffect(() => {
    let active = true;
    setRentalsLoading(true);
    setRentalsError("");
    rentalService
      .getMyRentals()
      .then((data) => {
        if (active) setRentals(data);
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

  const tempPath = useMemo(() => buildChartPath(temperature, 20.5, 22, 320, 90), [temperature]);
  const humidityPath = useMemo(() => buildChartPath(humidity, 40, 55, 320, 90), [humidity]);

  return {
    accessLogs,
    quickActions,
    showPin,
    setShowPin,
    mainLocked,
    setMainLocked,
    garageLocked,
    setGarageLocked,
    tempPath,
    humidityPath,
    rentals,
    activeRentals,
    primaryRental,
    rentalsLoading,
    rentalsError,
  };
}
