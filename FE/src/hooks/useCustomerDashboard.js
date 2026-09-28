import { useMemo, useState } from "react";
import {
  getDashboardAccessLogs,
  getDashboardQuickActions,
  getDashboardTrustBadges,
  getClimateChartData,
} from "../data/dashboardRepository";
import { buildChartPath } from "../domain/usecases/buildChartPath";

// Application layer: encapsulates CustomerDashboard ("Kho của tôi") page state and data wiring.
export function useCustomerDashboard() {
  const accessLogs = getDashboardAccessLogs();
  const quickActions = getDashboardQuickActions();
  const trustBadges = getDashboardTrustBadges();
  const { temperature, humidity } = getClimateChartData();

  const [showPin, setShowPin] = useState(false);
  const [mainLocked, setMainLocked] = useState(true);
  const [garageLocked, setGarageLocked] = useState(true);

  const tempPath = useMemo(() => buildChartPath(temperature, 20.5, 22, 320, 90), [temperature]);
  const humidityPath = useMemo(() => buildChartPath(humidity, 40, 55, 320, 90), [humidity]);

  return {
    accessLogs,
    quickActions,
    trustBadges,
    showPin,
    setShowPin,
    mainLocked,
    setMainLocked,
    garageLocked,
    setGarageLocked,
    tempPath,
    humidityPath,
  };
}
