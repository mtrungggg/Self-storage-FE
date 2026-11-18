import { useCallback, useEffect, useMemo, useState } from "react";
import rentalService from "../api/customerRentalService";
import reservationService from "../api/customerReservationService";



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



  // Unlocked state per agreementId in current session & live/backend activity logs
  const [unlockedMap, setUnlockedMap] = useState({});
  const [liveLogsMap, setLiveLogsMap] = useState({});
  const [backendAccessLogs, setBackendAccessLogs] = useState([]);

  const [authorizedMembers, setAuthorizedMembers] = useState([]);
  const [membersLoading, setMembersLoading] = useState(false);
  const [membersError, setMembersError] = useState("");

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



        // Auto-select first active rental if not set

        setSelectedRentalId((curr) => {

          if (curr) return curr;

          const first = list.find((r) => ["active", "confirmed", "draft"].includes(r.status?.toLowerCase())) || list[0];

          if (first?.agreementId) return first.agreementId;

          const firstRsv = rsvList.find((r) => ["confirmed", "paid", "pending"].includes(r.status?.toLowerCase())) || rsvList[0];

          return firstRsv?.id || firstRsv?.reservationId || null;

        });

      })

      .catch(() => {

        // Fallback gracefully

      })

      .finally(() => {

        if (active) setRentalsLoading(false);

      });



    return () => {

      active = false;

    };

  }, []);



  const activeRentals = useMemo(() => {

    const list = rentals.filter((r) => {

      const s = (r.status || "").toLowerCase();

      return ["active", "confirmed", "draft", "pending_payment", "overdue", "suspended"].includes(s);

    });

    if (list.length > 0) return list;



    // Fallback: If customer has confirmed/paid reservations but no rental agreement returned yet

    const activeReservations = reservations.filter((r) => {

      const s = (r.status || "").toLowerCase();

      return ["confirmed", "paid", "pending", "awaiting_deposit"].includes(s);

    });



    return activeReservations.map((rsv) => ({

      agreementId: rsv.id || rsv.reservationId,

      agreementNo: rsv.reservationCode || `RSV-${rsv.id || rsv.reservationId}`,

      facilityId: rsv.facilityId,

      facilityName: rsv.facilityName || "",

      facilityAddress: rsv.facilityAddress || "",

      storageUnitId: rsv.storageUnitId || 0,

      unitCode: rsv.unitCode || "Pending",

      floorLabel: rsv.floorLabel || "",

      zoneLabel: rsv.zoneLabel || "",

      unitTypeName: rsv.unitTypeName || "Storage Unit",

      dimensions: rsv.dimensions || "",

      areaM2: rsv.areaM2,

      volumeM3: rsv.volumeM3,

      startDate: rsv.startDate,

      endDate: rsv.endDate,

      status: "draft",

      checkedInAt: null,

      isReservationFallback: true,

      reservationCode: rsv.reservationCode,

    }));

  }, [rentals, reservations]);



  const selectedRental = useMemo(

    () => activeRentals.find((r) => r.agreementId === selectedRentalId) || activeRentals[0] || null,

    [rentals, activeRentals, selectedRentalId]

  );



  const currentUnitCode = selectedRental?.unitCode || "";



  const matchingReservation = useMemo(() => {

    if (!selectedRental || !reservations.length) return null;

    const agrMatch = String(selectedRental.agreementNo || "").match(/-(\d+)$/);

    const rsvIdFromAgr = agrMatch ? Number(agrMatch[1]) : null;

    return (

      reservations.find((r) => rsvIdFromAgr && Number(r.id || r.reservationId) === rsvIdFromAgr) ||

      reservations.find((r) => r.unitCode && r.unitCode === selectedRental.unitCode) ||

      reservations.find((r) => Number(r.facilityId) === Number(selectedRental.facilityId)) ||

      null

    );

  }, [selectedRental, reservations]);



  const [fetchedCheckInQr, setFetchedCheckInQr] = useState("");

  useEffect(() => {
    let active = true;
    const rsvId = matchingReservation?.id || matchingReservation?.reservationId;
    if (!rsvId || matchingReservation?.checkInQrToken || credentials?.gateQrToken) {
      setFetchedCheckInQr("");
      return;
    }
    reservationService.getReservationDetail?.(rsvId)
      .then((detail) => {
        if (active && detail?.checkInQrToken) {
          setFetchedCheckInQr(detail.checkInQrToken);
        }
      })
      .catch(() => {});
    return () => { active = false; };
  }, [matchingReservation, credentials?.gateQrToken]);

  const checkInQrValue = useMemo(() => {
    return (
      matchingReservation?.checkInQrToken ||
      fetchedCheckInQr ||
      credentials?.gateQrToken ||
      selectedRental?.checkInQrToken ||
      selectedRental?.qrToken ||
      ""
    );
  }, [matchingReservation, fetchedCheckInQr, credentials, selectedRental]);

  const currentFacilityCheckIn = useMemo(() => {
    if (!selectedRental?.checkedInAt) return null;
    return {
      timeLabel: new Date(selectedRental.checkedInAt).toLocaleString(),
    };
  }, [selectedRental]);



  const accessLogs = useMemo(() => {
    const liveLogs = liveLogsMap[currentUnitCode] || [];
    const apiLogs = (backendAccessLogs || []).map((ev) => ({
      id: `ev-${ev.id}`,
      icon: ev.result === "granted" ? "lock_open" : ev.result === "denied" ? "gpp_bad" : "error_outline",
      title: `${ev.accessPointName || "Door"} • ${ev.actorName || "Customer"} (${ev.result})${ev.reason ? ` — ${ev.reason}` : ""}`,
      time: ev.occurredAt ? new Date(ev.occurredAt).toLocaleString() : "",
      dot: ev.result === "granted" ? "#2dd4a0" : ev.result === "denied" ? "#ef4444" : "#f59e0b",
    }));

    const checkInLogs = currentFacilityCheckIn && apiLogs.length === 0
      ? [
          {
            icon: "qr_code_scanner",
            title: `Facility Check-in • Unit ${currentUnitCode}`,
            time: currentFacilityCheckIn.timeLabel || "Today",
            dot: "#1d5fe5",
          },
        ]
      : [];

    return [...liveLogs, ...apiLogs, ...checkInLogs];
  }, [currentUnitCode, liveLogsMap, backendAccessLogs, currentFacilityCheckIn]);

  const loadAccessLogs = useCallback(async (agreementId = selectedRentalId) => {
    if (!agreementId) {
      setBackendAccessLogs([]);
      return;
    }
    try {
      const data = await rentalService.getAccessLogs(agreementId, { page: 1, pageSize: 20 });
      setBackendAccessLogs(Array.isArray(data?.items) ? data.items : []);
    } catch {
      setBackendAccessLogs([]);
    }
  }, [selectedRentalId]);

  const loadAuthorizedMembers = useCallback(async (agreementId = selectedRentalId) => {
    if (!agreementId) {
      setAuthorizedMembers([]);
      return;
    }
    setMembersLoading(true);
    setMembersError("");
    try {
      const list = await rentalService.getAuthorizedMembers(agreementId);
      setAuthorizedMembers(Array.isArray(list) ? list : []);
    } catch (err) {
      setMembersError(err?.message || "Unable to load authorized members.");
      setAuthorizedMembers([]);
    } finally {
      setMembersLoading(false);
    }
  }, [selectedRentalId]);

  useEffect(() => {
    if (!selectedRentalId || selectedRental?.isReservationFallback) {
      setBackendAccessLogs([]);
      setAuthorizedMembers([]);
      return;
    }
    loadAccessLogs(selectedRentalId);
    loadAuthorizedMembers(selectedRentalId);
  }, [selectedRentalId, selectedRental, loadAccessLogs, loadAuthorizedMembers]);



  // Load access credentials for selected rental

  useEffect(() => {

    let active = true;

    if (!selectedRentalId || selectedRental?.isReservationFallback || selectedRental?.status?.toLowerCase() === "draft" || !selectedRental?.checkedInAt) {

      setCredentials(null);

      setCredentialsLoading(false);

      setCredentialsError("");

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

          

          setCredentials(data);

          if (credentialRequest > 0 && data.keypadPin && !data.suspendedReason && data.status !== "suspended") {

            setShowPin(true);

          }

        }

      })

      .catch((err) => {

        if (!active) return;

        const msg = err?.message || "Unable to load access credentials for this unit.";

        setCredentialsError(msg);

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

        totalItemsCount: data?.totalItemsCount ?? (Array.isArray(data?.items) ? data.items.reduce((s, it) => s + (Number(it.quantity) || 1), 0) : 0),

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

      

      setCredentials((prev) => (prev ? { ...prev, keypadPin: newPin } : prev));

      return res;

    } catch (err) {

      const msg = err?.message || "Failed to update PIN code. Please try again.";

      setPinChangeError(msg);

      throw err;

    } finally {

      setPinChanging(false);

    }

  };



  const verifyUnlockPin = async (enteredPin) => {
    const cleanPin = String(enteredPin || "").trim();
    if (!/^\d{4,8}$/.test(cleanPin)) {
      throw new Error("Please enter a valid PIN (4 to 8 digits).");
    }
    if (!selectedRentalId) {
      throw new Error("No active rental agreement selected.");
    }
    const res = await rentalService.unlockUnit(selectedRentalId, cleanPin);
    setUnlockedMap((prev) => ({ ...prev, [selectedRentalId]: true }));
    appendLiveLog(currentUnitCode, `Unlocked Unit ${currentUnitCode} via PIN`, "#2dd4a0");
    loadAccessLogs(selectedRentalId);
    return res;
  };



  const lockUnit = useCallback((agreementId) => {

    const targetId = agreementId || selectedRentalId;

    if (targetId) {

      setUnlockedMap((prev) => ({ ...prev, [targetId]: false }));

      appendLiveLog(currentUnitCode, `Locked Unit ${currentUnitCode}`, "#8996a9");

    }

  }, [selectedRentalId, currentUnitCode, appendLiveLog]);



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



  const handleAddAuthorizedMember = async (payload) => {
    if (!selectedRentalId) return null;
    const created = await rentalService.addAuthorizedMember(selectedRentalId, payload);
    await loadAuthorizedMembers(selectedRentalId);
    return created;
  };

  const handleRevokeAuthorizedMember = async (memberId) => {
    if (!selectedRentalId) return;
    await rentalService.revokeAuthorizedMember(selectedRentalId, memberId);
    await loadAuthorizedMembers(selectedRentalId);
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

    lockUnit,

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

    authorizedMembers,

    membersLoading,

    membersError,

    loadAuthorizedMembers,

    handleAddAuthorizedMember,

    handleRevokeAuthorizedMember,

    loadAccessLogs,

  };

}

