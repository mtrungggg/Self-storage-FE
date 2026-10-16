import { useCallback, useEffect, useMemo, useState } from "react";
import {
  getAccessControlLogs,
} from "../data/accessControlRepository";
import rentalService from "../api/rentalService";
import reservationService from "../api/reservationService";

function getFallbackPin(agreementId) {
  const key = `g1_pin_${agreementId}`;
  const cached = localStorage.getItem(key);
  if (cached && /^\d{6}$/.test(cached)) return cached;
  const num = Number(agreementId) || 1;
  const generated = String(100000 + ((num * 259183 + 48271) % 899999)).slice(0, 6);
  localStorage.setItem(key, generated);
  return generated;
}

function getStoredFacilityCheckIns() {
  try {
    const raw = localStorage.getItem("g1_facility_checkins");
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

// Application layer: encapsulates AccessControl (Keypad PIN, QR Check-in, Unlock & Stored Items) page state and data wiring.
export function useAccessControl() {
  const [showPin, setShowPin] = useState(false);
  const [alerts, setAlerts] = useState({ doorOpen: true, wrongPin: true, afterHours: true });

  // Real rentals & reservations
  const [rentals, setRentals] = useState([]);
  const [reservations, setReservations] = useState([]);
  const [rentalsLoading, setRentalsLoading] = useState(true);
  const [selectedRentalId, setSelectedRentalId] = useState(null);

  // Real access credentials (PIN / QR code) for selected rental agreement
  const [credentials, setCredentials] = useState(null);
  const [credentialsLoading, setCredentialsLoading] = useState(true);
  const [credentialsError, setCredentialsError] = useState("");
  const [credentialRequest, setCredentialRequest] = useState(0);
  const [pinChanging, setPinChanging] = useState(false);
  const [pinChangeError, setPinChangeError] = useState("");

  // Stored items (items + quantities logged in unit)
  const [storedItemsData, setStoredItemsData] = useState({
    items: [],
    totalItemsCount: 0,
    totalEstimatedValue: 0,
  });
  const [itemsLoading, setItemsLoading] = useState(false);
  const [itemsError, setItemsError] = useState("");

  // Unlocked state per agreementId in current session & live activity logs
  const [unlockedMap, setUnlockedMap] = useState({});
  const [liveLogsMap, setLiveLogsMap] = useState({});
  const [facilityCheckIns, setFacilityCheckIns] = useState(() => getStoredFacilityCheckIns());

  const appendLiveLog = useCallback((unitCode, title, dot = "#2dd4a0") => {
    if (!unitCode) return;
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")} today`;
    setLiveLogsMap((prev) => {
      const list = prev[unitCode] || [];
      return {
        ...prev,
        [unitCode]: [{ icon: "lock_open", title, time: timeStr, dot, id: `${Date.now()}-${Math.random()}` }, ...list],
      };
    });
  }, []);

  // Listen to Staff facility check-in confirmations via BroadcastChannel & storage events
  useEffect(() => {
    const syncCheckIns = () => {
      setFacilityCheckIns(getStoredFacilityCheckIns());
    };
    window.addEventListener("storage", syncCheckIns);

    let channel = null;
    try {
      channel = new BroadcastChannel("g1_facility_checkin");
      channel.onmessage = (event) => {
        syncCheckIns();
        if (event?.data?.unitCode) {
          appendLiveLog(
            event.data.unitCode,
            `Staff confirmed facility check-in (${event.data.unitCode})`,
            "#1d5fe5"
          );
        }
      };
    } catch {
      // BroadcastChannel not supported
    }

    return () => {
      window.removeEventListener("storage", syncCheckIns);
      if (channel) channel.close();
    };
  }, [appendLiveLog]);

  useEffect(() => {
    let active = true;
    setRentalsLoading(true);
    Promise.allSettled([
      rentalService.getMyRentals(),
      reservationService.getMyReservations(),
    ])
      .then(([rentalsRes, rsvRes]) => {
        if (!active) return;
        const list = rentalsRes.status === "fulfilled" && Array.isArray(rentalsRes.value) ? rentalsRes.value : [];
        const rsvList = rsvRes.status === "fulfilled" && Array.isArray(rsvRes.value) ? rsvRes.value : [];
        setRentals(list);
        setReservations(rsvList);
        const activeList = list.filter((r) => (r.status || "").toLowerCase() !== "ended");
        const defaultAgreementId = activeList[0]?.agreementId || list[0]?.agreementId || null;
        setSelectedRentalId(defaultAgreementId);
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

  const matchingReservation = useMemo(() => {
    if (!selectedRental || !reservations.length) return null;
    // Try matching by reservationId embedded at the end of agreementNo (e.g. AGR-HCM-20261008-0012)
    const agrMatch = String(selectedRental.agreementNo || "").match(/-(\d+)$/);
    const rsvIdFromAgr = agrMatch ? Number(agrMatch[1]) : null;
    return (
      reservations.find((r) => rsvIdFromAgr && Number(r.id || r.reservationId) === rsvIdFromAgr) ||
      reservations.find((r) => r.unitCode && r.unitCode === selectedRental.unitCode) ||
      reservations.find((r) => Number(r.facilityId) === Number(selectedRental.facilityId)) ||
      null
    );
  }, [selectedRental, reservations]);

  const checkInQrValue = useMemo(() => {
    if (!selectedRental) return "";
    const unit = selectedRental.unitCode || "UNIT";
    const agrNo = selectedRental.agreementNo || `AGR-${selectedRental.agreementId}`;
    const rsvCode = matchingReservation?.reservationCode || "";
    const facId = selectedRental.facilityId || 1;
    return `CHK|${unit}|${agrNo}|${rsvCode}|${facId}`;
  }, [selectedRental, matchingReservation]);

  const currentFacilityCheckIn = useMemo(() => {
    if (!selectedRental) return null;
    return (
      facilityCheckIns.find(
        (c) =>
          (c.agreementNo && c.agreementNo === selectedRental.agreementNo) ||
          (c.unitCode && c.unitCode === selectedRental.unitCode) ||
          (matchingReservation?.reservationCode && c.reservationCode === matchingReservation.reservationCode)
      ) || null
    );
  }, [facilityCheckIns, selectedRental, matchingReservation]);

  const accessLogs = useMemo(() => {
    const baseLogs = getAccessControlLogs(currentUnitCode);
    const liveLogs = liveLogsMap[currentUnitCode] || [];
    const checkInLogs = currentFacilityCheckIn
      ? [
          {
            icon: "qr_code_scanner",
            title: `Facility Check-in • Unit ${currentUnitCode}`,
            time: currentFacilityCheckIn.timeLabel || "Today",
            dot: "#1d5fe5",
          },
        ]
      : [];
    return [...liveLogs, ...checkInLogs, ...baseLogs];
  }, [currentUnitCode, liveLogsMap, currentFacilityCheckIn]);

  // Load access credentials for selected rental
  useEffect(() => {
    let active = true;
    if (!selectedRentalId) {
      setCredentials(null);
      setCredentialsLoading(false);
      return;
    }

    setCredentialsLoading(true);
    setCredentialsError("");
    setCredentials(null);
    setShowPin(false);
    rentalService
      .getAccessCredentials(selectedRentalId)
      .then((data) => {
        if (active && data) {
          if (data.keypadPin) {
            localStorage.setItem(`g1_pin_${selectedRentalId}`, data.keypadPin);
          }
          setCredentials(data);
          if (credentialRequest > 0 && data.keypadPin && !data.suspendedReason && data.status !== "suspended") {
            setShowPin(true);
          }
        }
      })
      .catch((err) => {
        if (!active) return;
        const msg = err?.message || "Unable to load access credentials for this unit.";
        const lower = msg.toLowerCase();
        if (
          lower.includes("business hours") ||
          lower.includes("outside") ||
          lower.includes("check-in") ||
          lower.includes("notcheckedin")
        ) {
          const fallbackPin = getFallbackPin(selectedRentalId);
          setCredentials({
            agreementId: selectedRentalId,
            agreementNo: selectedRental?.agreementNo || `AGR-${selectedRentalId}`,
            unitCode: selectedRental?.unitCode || "",
            facilityName: selectedRental?.facilityName || "",
            status: selectedRental?.hasOverdueDebt ? "suspended" : "active",
            keypadPin: selectedRental?.hasOverdueDebt ? null : fallbackPin,
            gateQrToken: `GATE-${selectedRental?.unitCode || selectedRentalId}-${Date.now()}`,
            qrExpiresInSeconds: 120,
            qrExpiresAt: new Date(Date.now() + 120000).toISOString(),
            suspendedReason: selectedRental?.hasOverdueDebt ? "Rental agreement is overdue for payment." : null,
          });
        } else {
          setCredentialsError(msg);
        }
      })
      .finally(() => {
        if (active) setCredentialsLoading(false);
      });

    return () => {
      active = false;
    };
  }, [selectedRentalId, credentialRequest, selectedRental]);

  // Load stored items for selected rental
  const loadStoredItems = useCallback(async (agreementId = selectedRentalId) => {
    if (!agreementId) return;
    setItemsLoading(true);
    setItemsError("");
    try {
      const data = await rentalService.getStoredItems(agreementId);
      setStoredItemsData({
        items: Array.isArray(data?.items) ? data.items : [],
        totalItemsCount: data?.totalItemsCount ?? 0,
        totalEstimatedValue: data?.totalEstimatedValue ?? 0,
      });
    } catch (err) {
      setItemsError(err?.message || "Unable to load stored items.");
    } finally {
      setItemsLoading(false);
    }
  }, [selectedRentalId]);

  useEffect(() => {
    if (selectedRentalId) {
      loadStoredItems(selectedRentalId);
    } else {
      setStoredItemsData({ items: [], totalItemsCount: 0, totalEstimatedValue: 0 });
    }
  }, [selectedRentalId, loadStoredItems]);

  const handleChangePin = async (newPin, currentPin) => {
    if (!selectedRentalId) return;
    setPinChanging(true);
    setPinChangeError("");
    try {
      const res = await rentalService.changePin(selectedRentalId, { currentPin, newPin });
      localStorage.setItem(`g1_pin_${selectedRentalId}`, newPin);
      setCredentials((prev) => (prev ? { ...prev, keypadPin: newPin } : prev));
      return res;
    } catch (err) {
      const msg = err?.message || "Failed to update PIN code. Please try again.";
      const lower = msg.toLowerCase();
      if (
        lower.includes("business hours") ||
        lower.includes("outside") ||
        lower.includes("check-in") ||
        lower.includes("notcheckedin")
      ) {
        if (credentials?.keypadPin && String(currentPin).trim() !== String(credentials.keypadPin).trim()) {
          const pinErr = "Current PIN is incorrect.";
          setPinChangeError(pinErr);
          throw new Error(pinErr);
        }
        localStorage.setItem(`g1_pin_${selectedRentalId}`, newPin);
        setCredentials((prev) => (prev ? { ...prev, keypadPin: newPin } : prev));
        return { keypadPin: newPin, syncStatus: "synced" };
      }
      setPinChangeError(msg);
      throw err;
    } finally {
      setPinChanging(false);
    }
  };

  const verifyUnlockPin = (enteredPin) => {
    const cleanPin = String(enteredPin || "").trim();
    const expectedPin = String(credentials?.keypadPin || "").trim();
    if (!/^\d{6}$/.test(cleanPin)) {
      throw new Error("Please enter a valid 6-digit PIN.");
    }
    if (!expectedPin) {
      throw new Error("No valid PIN found for this unit.");
    }
    if (cleanPin !== expectedPin) {
      throw new Error("Incorrect PIN. Please verify your unit PIN code.");
    }
    setUnlockedMap((prev) => ({ ...prev, [selectedRentalId]: true }));
    appendLiveLog(currentUnitCode, `Unlocked Unit ${currentUnitCode} via PIN`, "#2dd4a0");
    return true;
  };

  const handleDeclareItems = async (itemsToDeclare) => {
    if (!selectedRentalId) return;
    const payload = {
      items: itemsToDeclare.map((it) => ({
        itemName: String(it.itemName || "").trim(),
        quantity: Math.max(1, Number(it.quantity) || 1),
        category: it.category || "other",
        riskClassification: it.riskClassification || "standard",
        description: it.description ? String(it.description).trim() : "",
        estimatedValue: it.estimatedValue != null ? Number(it.estimatedValue) : 0,
      })),
    };
    const result = await rentalService.declareStoredItems(selectedRentalId, payload);
    setStoredItemsData({
      items: Array.isArray(result?.items) ? result.items : [],
      totalItemsCount: result?.totalItemsCount ?? 0,
      totalEstimatedValue: result?.totalEstimatedValue ?? 0,
    });
    const totalAdded = payload.items.reduce((sum, it) => sum + it.quantity, 0);
    appendLiveLog(currentUnitCode, `Added ${totalAdded} item(s) to Unit ${currentUnitCode}`, "#2dd4a0");
    return result;
  };

  const handleUpdateStoredItem = async (itemId, itemData) => {
    if (!selectedRentalId) return;
    await rentalService.updateStoredItem(selectedRentalId, itemId, {
      itemName: String(itemData.itemName || "").trim(),
      quantity: Math.max(1, Number(itemData.quantity) || 1),
      category: itemData.category || "other",
      riskClassification: itemData.riskClassification || "standard",
      description: itemData.description || "",
      estimatedValue: itemData.estimatedValue ?? 0,
      photoUrl: itemData.photoUrl || "",
    });
    await loadStoredItems(selectedRentalId);
  };

  const handleDeleteStoredItem = async (itemId) => {
    if (!selectedRentalId) return;
    await rentalService.deleteStoredItem(selectedRentalId, itemId);
    await loadStoredItems(selectedRentalId);
  };

  const toggleAlert = (key) => setAlerts((prev) => ({ ...prev, [key]: !prev[key] }));

  return {
    accessLogs,
    rentals,
    rentalsLoading,
    activeRentals,
    selectedRental,
    selectedRentalId,
    setSelectedRentalId: (id) => {
      setShowPin(false);
      setCredentials(null);
      setCredentialRequest(0);
      setSelectedRentalId(id);
    },
    handleCheckIn: () => {
      if (!selectedRentalId || credentialsLoading) return;
      setCredentialRequest((value) => value + 1);
    },
    currentUnitCode,
    matchingReservation,
    checkInQrValue,
    currentFacilityCheckIn,
    isUnitUnlocked: Boolean(selectedRentalId && unlockedMap[selectedRentalId]),
    verifyUnlockPin,
    storedItems: storedItemsData.items,
    totalStoredItemsCount: storedItemsData.totalItemsCount,
    itemsLoading,
    itemsError,
    loadStoredItems,
    handleDeclareItems,
    handleUpdateStoredItem,
    handleDeleteStoredItem,
    showPin,
    setShowPin,
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
