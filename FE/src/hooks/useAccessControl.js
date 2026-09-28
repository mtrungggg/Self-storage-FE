import { useState } from "react";
import {
  getWallets,
  getGuestPins,
  getAccessControlLogs,
  getAccessControlTrustBadges,
} from "../data/accessControlRepository";

// Application layer: encapsulates AccessControl (PIN & smart lock) page state and data wiring.
export function useAccessControl() {
  const wallets = getWallets();
  const guestPins = getGuestPins();
  const accessLogs = getAccessControlLogs();
  const trustBadges = getAccessControlTrustBadges();

  const [activeUnit, setActiveUnit] = useState("main");
  const [showPin, setShowPin] = useState(false);
  const [unlocking, setUnlocking] = useState(false);
  const [alerts, setAlerts] = useState({ doorOpen: true, wrongPin: true, afterHours: true });

  const handleUnlock = () => {
    setUnlocking(true);
    setTimeout(() => setUnlocking(false), 1200);
  };

  const toggleAlert = (key) => setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));

  return {
    wallets,
    guestPins,
    accessLogs,
    trustBadges,
    activeUnit,
    setActiveUnit,
    showPin,
    setShowPin,
    unlocking,
    handleUnlock,
    alerts,
    toggleAlert,
  };
}
